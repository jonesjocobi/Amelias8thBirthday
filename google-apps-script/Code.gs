/**
 * 🦖 Amelia's 8th Birthday · Dinosaur Explorer Mission
 * Google Apps Script backend for the invitation:
 *   • Saves RSVPs in a Google Sheet (one row per family/email)
 *   • Sends each guest a fun confirmation email
 *   • Emails you every time someone RSVPs or changes their answer
 *   • Returns the public "Explorer Roster" (names + counts, never emails)
 *   • Optional reminder email before the party
 *
 * Setup steps: README.md.
 * After changing this code: Deploy → Manage deployments → ✏️ → Version: New version → Deploy.
 */

/* ============ ⚙️ SETTINGS ============ */
const SITE_URL = 'https://jonesjocobi.github.io/Amelias8thBirthday/';
const HOSTS = 'The Jones Family';
const EVENT = {
  title: "Amelia's 8th Birthday · Dinosaur Explorer Mission",
  date: 'Saturday, January 9, 2027',
  time: '1:00 PM',
  place: 'Jones Family Home',
  address: '12089 Rue Des Amis, San Diego, CA 92131',
  map: 'https://www.google.com/maps/search/?api=1&query=12089+Rue+Des+Amis,+San+Diego,+CA+92131',
};
const NOTIFY_HOST = true;                          // email you on every RSVP
const REMINDER_AT = '2027-01-07T10:00:00-08:00';   // used by scheduleReminder()

/* ============ Sheet ============ */
const SHEET_NAME = 'RSVP';
const HEADER = ['Updated', 'Email', 'Family / Name', 'Coming?', 'Adults', 'Children', "Children's names", 'Message for Amelia'];

/* ============ Web entry points ============ */
function doGet() {
  return json(publicState());
}

function doPost(e) {
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return json({ ok: false, error: 'bad_request' });
  }
  if (data.action !== 'rsvp') return json({ ok: false, error: 'bad_action' });

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    return json(saveRsvp(data));
  } catch (err) {
    console.error(err);
    return json({ ok: false, error: 'server' });
  } finally {
    lock.releaseLock();
  }
}

/* ============ RSVP ============ */
function saveRsvp(data) {
  if (data.website) return { ok: true }; // honeypot: bots fill hidden fields
  const name = safeText(data.name, 60);
  if (name.length < 2) return { ok: false, error: 'missing_name' };
  const email = cleanEmail(data.email);
  if (!email) return { ok: false, error: 'bad_email' };
  const coming = data.attending === 'no' ? 'No' : 'Yes';
  const adults = coming === 'Yes' ? clampInt(data.adults, 0, 20) : 0;
  const kids = coming === 'Yes' ? clampInt(data.kids, 0, 20) : 0;
  if (coming === 'Yes' && adults + kids < 1) return { ok: false, error: 'bad_count' };
  const kidNames = coming === 'Yes' ? safeText(data.kidNames, 120) : '';
  const message = safeText(data.message, 400);

  const sh = sheet();
  const existing = findRow(email);
  const row = [new Date(), email, name, coming, adults, kids, kidNames, message];
  if (existing) sh.getRange(existing, 1, 1, row.length).setValues([row]);
  else sh.appendRow(row);
  SpreadsheetApp.flush();

  const rsvp = { email: email, name: name, coming: coming, adults: adults, kids: kids, kidNames: kidNames, message: message };
  sendGuestEmail(rsvp, existing ? 'update' : 'confirm');
  if (NOTIFY_HOST) notifyHost(rsvp, Boolean(existing));

  return Object.assign(publicState(), { ok: true, updated: Boolean(existing) });
}

/* ============ Reading ============ */
function readRsvps() {
  const sh = sheet();
  const last = sh.getLastRow();
  if (last < 2) return [];
  return sh.getRange(2, 1, last - 1, HEADER.length).getValues()
    .filter(function (r) { return r[1]; })
    .map(function (r) {
      return {
        ts: r[0] instanceof Date ? r[0].toISOString() : String(r[0]),
        email: cleanEmail(r[1]),
        name: unquote(r[2]),
        coming: r[3] === 'No' ? 'No' : 'Yes',
        adults: Number(r[4]) || 0,
        kids: Number(r[5]) || 0,
        kidNames: unquote(r[6]),
        message: unquote(r[7]),
      };
    });
}

// What any visitor can see: only families who are coming, no emails or messages
function publicState() {
  const yes = readRsvps().filter(function (r) { return r.coming === 'Yes'; });
  return {
    ok: true,
    roster: yes.map(function (r) {
      return { name: r.name, adults: r.adults, kids: r.kids, kidNames: r.kidNames, ts: r.ts };
    }),
    totals: {
      families: yes.length,
      adults: yes.reduce(function (s, r) { return s + r.adults; }, 0),
      kids: yes.reduce(function (s, r) { return s + r.kids; }, 0),
    },
  };
}

function findRow(email) {
  const sh = sheet();
  const last = sh.getLastRow();
  if (last < 2) return 0;
  const emails = sh.getRange(2, 2, last - 1, 1).getValues();
  for (let i = 0; i < emails.length; i++) if (cleanEmail(emails[i][0]) === email) return i + 2;
  return 0;
}

/* ============ Emails ============ */
function sendGuestEmail(r, kind) {
  let subject, intro;
  if (kind === 'reminder') {
    subject = '🦖 Dinosaurs are almost here! Amelia\'s party is this Saturday';
    intro = '<p>Hi <b>' + esc(r.name) + '</b>! Rex the T-rex is counting the hours. ' +
      'The dinosaur expedition starts this <b>Saturday at 1:00 PM</b>, so get your explorer boots ready!</p>';
  } else if (r.coming === 'Yes') {
    subject = kind === 'update'
      ? '🦕 Your RSVP was updated · Amelia\'s 8th Birthday'
      : '🦖 ROAR-some! You\'re on the Dinosaur Explorer team!';
    intro = '<p>Hi <b>' + esc(r.name) + '</b>! Rex gave a happy ROAR when your RSVP arrived. ' +
      'Your explorer badge is reserved for <b>Amelia\'s 8th Birthday</b>. ' +
      'The dinosaurs are coming back and we have a <b>top-secret mission</b> to accomplish together!</p>';
  } else {
    subject = kind === 'update'
      ? '🦕 Your RSVP was updated · Amelia\'s 8th Birthday'
      : '🦕 Thanks for letting us know · Amelia\'s 8th Birthday';
    intro = '<p>Hi <b>' + esc(r.name) + '</b>, thank you for letting us know. Rex is a little sad, ' +
      'but he\'ll save you a dino hug for next time! 💚</p>';
  }

  let summary = '';
  if (r.coming === 'Yes') {
    summary =
      '<table style="width:100%;border-collapse:collapse;margin:8px 0 4px;font-size:15px">' +
      '<tr><td style="padding:6px 0">🧑 Adults</td><td style="text-align:right"><b>' + r.adults + '</b></td></tr>' +
      '<tr><td style="padding:6px 0">🧒 Little explorers</td><td style="text-align:right"><b>' + r.kids + '</b></td></tr>' +
      (r.kidNames ? '<tr><td style="padding:6px 0">🏷️ Explorer names</td><td style="text-align:right">' + esc(r.kidNames) + '</td></tr>' : '') +
      '</table>';
  }
  if (r.message) summary += '<p style="font-style:italic;color:#4F6B2A">“' + esc(r.message) + '”</p>';

  const details = kind === 'reminder' || r.coming === 'Yes'
    ? '<div style="background:#fff;padding:14px 18px;border-radius:14px;border:3px dashed #9DBA3E;margin:18px 0">' +
      '🗓️ <b>' + EVENT.date + '</b><br>🕐 ' + EVENT.time + '<br>🏡 ' + EVENT.place + '<br>' +
      '📍 <a href="' + EVENT.map + '" style="color:#2F6B1F">' + EVENT.address + '</a></div>' +
      '<p>🔎 <b>Mission hint:</b> Explorers should come ready to search, dig and discover. Rex will explain the rest at base camp…</p>'
    : '';

  const html =
    '<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:auto;color:#24361A;background:#FFF7E3;padding:28px;border-radius:20px;border:4px solid #9DBA3E">' +
    '<div style="font-size:44px;text-align:center">🦖🌋🦕</div>' +
    '<h1 style="color:#2F6B1F;margin:6px 0 2px;text-align:center;font-size:26px">Dinosaurs are coming back!</h1>' +
    '<p style="text-align:center;color:#E0782E;margin:0 0 18px;font-weight:bold">Amelia is turning 8 · Dinosaur Explorer Mission</p>' +
    '<div style="font-size:15px;line-height:1.6">' + intro + summary + details +
    '<p style="text-align:center;margin:22px 0"><a href="' + SITE_URL + '" style="background:#E0782E;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:bold">Open the invitation</a></p>' +
    '<p style="font-size:12px;color:#6B7A55">Need to change something? Fill in the RSVP again with this same email and we\'ll update it.</p>' +
    '</div><p style="font-size:18px;color:#2F6B1F;margin:18px 0 0">Stomps &amp; roars,<br>Amelia, Rex &amp; ' + HOSTS + ' 💚</p></div>';

  MailApp.sendEmail({ to: r.email, subject: subject, htmlBody: html, name: "Amelia's Dino Party" });
}

function notifyHost(r, updated) {
  const owner = Session.getEffectiveUser().getEmail();
  if (!owner) return;
  const t = publicState().totals;
  MailApp.sendEmail({
    to: owner,
    subject: (updated ? '✏️ RSVP changed: ' : '🦖 New RSVP: ') + r.name + ' (' + r.coming + ')',
    htmlBody: '<p><b>' + esc(r.name) + '</b> (' + esc(r.email) + ') ' +
      (r.coming === 'Yes' ? 'is coming with <b>' + r.adults + '</b> adult(s) and <b>' + r.kids + '</b> child(ren).' : 'can\'t make it.') + '</p>' +
      (r.kidNames ? '<p>Children: ' + esc(r.kidNames) + '</p>' : '') +
      (r.message ? '<p>Message for Amelia: <i>' + esc(r.message) + '</i></p>' : '') +
      '<p>Total so far: <b>' + t.families + '</b> families · ' + t.adults + ' adults · ' + t.kids + ' children.</p>',
    name: "Amelia's Dino Party",
  });
}

/** ▶ Sends a reminder to everyone who said Yes. Run it by hand, or schedule it with scheduleReminder(). */
function sendReminders() {
  const list = readRsvps().filter(function (r) { return r.coming === 'Yes'; });
  list.forEach(function (r) { sendGuestEmail(r, 'reminder'); });
  Logger.log('Reminders sent: ' + list.length + ' · Emails left today: ' + MailApp.getRemainingDailyQuota());
}

/** ▶ Run once to send the reminder automatically at REMINDER_AT. */
function scheduleReminder() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'sendReminders') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('sendReminders').timeBased().at(new Date(REMINDER_AT)).create();
  Logger.log('Reminder scheduled for ' + new Date(REMINDER_AT));
}

/* ============ Helpers ============ */
function sheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADER);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADER.length).setFontWeight('bold').setBackground('#DDEBB8');
  }
  return sh;
}

function safeText(value, max) {
  const text = String(value || '').replace(/\s+/g, ' ').trim().slice(0, max || 60);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}
function unquote(v) { return String(v || '').replace(/^'/, ''); }
function cleanEmail(v) {
  const e = String(v || '').trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) && e.length <= 120 ? e : '';
}
function clampInt(v, min, max) { const n = parseInt(v, 10); return isNaN(n) ? min : Math.max(min, Math.min(max, n)); }
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** ▶ Run once (and again after updating the code) to create the sheet and approve email permissions. */
function setup() {
  sheet();
  Logger.log('Ready! Emails left today: ' + MailApp.getRemainingDailyQuota() + ' · Owner: ' + Session.getEffectiveUser().getEmail());
}
