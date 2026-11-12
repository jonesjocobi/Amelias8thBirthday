/** Amelia's birthday RSVP receiver. Bind to a Google Sheet via Extensions > Apps Script. */
const HOST_EMAIL = 'jonesjocobi@gmail.com';
const SHEET_NAME = 'RSVPs';

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const p = e.parameter || {};
    const attendance = p.attendance === 'Yes' ? 'Yes' : 'No';
    const parent = clean(p.parentName, 100);
    const email = clean(p.email, 150);
    const childrenNames = clean(p.childNames, 250);
    if (!parent || !email || !childrenNames || !/^\S+@\S+\.\S+$/.test(email)) {
      return HtmlService.createHtmlOutput('Please provide a name, valid email, and child name(s).');
    }
    const adults = attendance === 'Yes' ? count(p.adults) : 0;
    const children = attendance === 'Yes' ? count(p.children) : 0;
    const note = clean(p.note, 500);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(['Submitted at','Parent / guardian','Email','Child name(s)','Attending','Adults','Children','Note']);
      sheet.setFrozenRows(1);
    }
    // Prefix text fields to prevent spreadsheet formula injection.
    sheet.appendRow([new Date(),safeCell(parent),safeCell(email),safeCell(childrenNames),attendance,adults,children,safeCell(note)]);
    MailApp.sendEmail({to:HOST_EMAIL,subject:`Amelia birthday RSVP: ${attendance} - ${parent}`,
      body:`New birthday RSVP\n\nParent: ${parent}\nEmail: ${email}\nChild name(s): ${childrenNames}\nAttending: ${attendance}\nAdults: ${adults}\nChildren: ${children}\nNote: ${note}\n\nOpen your Google Sheet for the full guest list.`});
    return HtmlService.createHtmlOutput('RSVP received. Thank you!');
  } catch (err) {
    return HtmlService.createHtmlOutput('There was a problem saving the RSVP. Please email the host.');
  } finally { lock.releaseLock(); }
}
function clean(v, max) { return String(v || '').trim().slice(0,max); }
function count(v) { const n = Number(v); return Number.isInteger(n) && n>=0 && n<=6 ? n : 0; }
function safeCell(v) { return /^[=+\-@\t\r]/.test(v) ? "'"+v : v; }
