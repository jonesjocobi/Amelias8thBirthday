/* =========================================================
   Amelia's 8th Birthday · Dinosaurs Are Coming Back!
   ========================================================= */

/* ⚙️ CONFIG
   API_URL: the Google Apps Script web app URL (ends in /exec). See README.md.
   Leave it empty to use test mode (RSVPs are saved only on this device). */
const CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycbxoNH9pNTkHCIEv8v4KfOQjXFAYgLG59lKIf1jw7ChZtKqz98f64tm6OVifMwyupK6iHQ/exec',
  PARTY_START: '2027-01-09T13:00:00-08:00',
  PARTY_HOURS: 3, // only used for the calendar event length
  TITLE: "Amelia's 8th Birthday · Dinosaur Explorer Mission 🦖",
  ADDRESS: 'Jones Family Home, 12089 Rue Des Amis, San Diego, CA 92131',
};

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } },
};

/* ---------- Rex says… ---------- */
const REX_LINES = [
  'ROAAAR! That means "hi" in dinosaur! 🦖',
  'Amelia is turning 8! That\'s 8 big stomps! 👣',
  'I have tiny arms but a GIANT heart 💚',
  'Shh… the mission is top secret! 🤫',
  'Did someone say birthday cake? 🎂',
  'The dinosaurs are coming back… with YOU! 🦕',
  'Explorers, check your boots! 🥾',
  'I practiced my roar all year for this! 🎤',
  'Second dino party in a row. Best. Year. EVER!',
  'Don\'t forget to RSVP, explorer! 📝',
];
let rexLine = -1;
const rexBtn = $('#rex-btn');
const speech = $('#rex-speech');
rexBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  rexLine = (rexLine + 1) % REX_LINES.length;
  speech.textContent = REX_LINES[rexLine];
  speech.style.animation = 'none'; void speech.offsetWidth; speech.style.animation = 'pop .4s both';
  rexBtn.classList.remove('roar'); void rexBtn.offsetWidth; rexBtn.classList.add('roar');
  roar();
});

/* A synthesized (gentle) dinosaur roar: no audio files needed */
let audioCtx;
function roar() {
  document.body.classList.remove('shake'); void document.body.offsetWidth; document.body.classList.add('shake');
  const flash = $('#roar-flash');
  flash.classList.remove('show'); void flash.offsetWidth; flash.classList.add('show');
  if (navigator.vibrate) navigator.vibrate([60, 40, 90]);
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const t = audioCtx.currentTime;
    const out = audioCtx.createGain();
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(0.35, t + 0.08);
    out.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.setValueAtTime(900, t); filter.frequency.linearRampToValueAtTime(300, t + 1);
    filter.connect(out); out.connect(audioCtx.destination);
    [1, 1.5, 2.02].forEach((m) => {
      const o = audioCtx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(110 * m, t);
      o.frequency.exponentialRampToValueAtTime(150 * m, t + 0.25);
      o.frequency.exponentialRampToValueAtTime(60 * m, t + 1.1);
      const lfo = audioCtx.createOscillator(); const lfoGain = audioCtx.createGain();
      lfo.frequency.value = 28; lfoGain.gain.value = 18 * m;
      lfo.connect(lfoGain); lfoGain.connect(o.frequency);
      o.connect(filter); o.start(t); lfo.start(t); o.stop(t + 1.15); lfo.stop(t + 1.15);
    });
  } catch { /* no audio, no problem */ }
}

/* ---------- Countdown ---------- */
const partyStart = new Date(CONFIG.PARTY_START);
function tick() {
  const diff = partyStart - Date.now();
  if (diff <= 0) {
    $('#countdown').hidden = true; $('#countdown-done').hidden = false; return;
  }
  const parts = {
    days: Math.floor(diff / 864e5),
    hours: Math.floor(diff / 36e5) % 24,
    minutes: Math.floor(diff / 6e4) % 60,
    seconds: Math.floor(diff / 1e3) % 60,
  };
  for (const [k, v] of Object.entries(parts)) $(`[data-cd="${k}"]`).textContent = String(v).padStart(2, '0');
}
tick(); setInterval(tick, 1000);

/* ---------- Reveal on scroll ---------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    en.target.classList.add('in');
    io.unobserve(en.target);
    if (en.target.classList.contains('dossier')) typeWriter();
  });
}, { threshold: 0.15 });
$$('.reveal').forEach((el) => io.observe(el));

/* ---------- Mission typewriter ---------- */
function typeWriter() {
  const el = $('#typewriter');
  const text = el.dataset.text;
  if (reduceMotion) { el.textContent = text; el.classList.add('done'); return; }
  let i = 0;
  const step = () => {
    el.textContent = text.slice(0, ++i);
    if (i < text.length) setTimeout(step, text[i - 1] === '.' ? 260 : 26);
    else el.classList.add('done');
  };
  setTimeout(step, 500);
}

/* ---------- Hatch the 8 eggs ---------- */
const EGG_WORDS = ['THE', 'DINOS', 'NEED', 'BRAVE', 'EXPLORERS', 'LIKE', 'YOU!', '🦖'];
const EGG_COLORS = ['#FFF4D6', '#E3F1C4', '#FFE1C2', '#D9EEF5', '#FCE0EC', '#FFF4D6', '#E3F1C4', '#FFE1C2'];
const eggsEl = $('#eggs');
let cracked = 0;
EGG_WORDS.forEach((word, i) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'egg';
  b.style.setProperty('--c', EGG_COLORS[i]);
  b.setAttribute('aria-label', `Dino egg ${i + 1}`);
  b.innerHTML = `<span class="shell"></span><span class="word">${word}</span>`;
  b.addEventListener('click', (e) => {
    e.stopPropagation();
    if (b.classList.contains('cracked')) return;
    b.classList.add('cracked');
    b.setAttribute('aria-label', `Egg ${i + 1}: ${word}`);
    cracked++;
    burst(e.clientX, e.clientY, ['🥚', '✨', '🦴'], 6);
    if (cracked === EGG_WORDS.length) {
      $('#eggs-result').textContent = '🎉 Message decoded! Mission accepted, Explorer!';
      rain(['🦖', '🦕', '🥚', '🌿', '🦴', '🎉'], 40);
    } else {
      $('#eggs-result').textContent = `${cracked} of 8 eggs hatched…`;
    }
  });
  eggsEl.appendChild(b);
});

/* ---------- Dino facts ---------- */
const FACTS = [
  'T. rex had teeth as big as bananas! 🍌',
  'A T. rex could be as long as a school bus! 🚌',
  'Birds are living dinosaurs. A chicken is a tiny T. rex cousin! 🐔',
  'T. rex\'s tiny arms were still strong enough to lift a grown-up! 💪',
  'Some dinosaurs had feathers, just like birds! 🪶',
  'The word "dinosaur" means "terrible lizard". Rex prefers "terrific lizard". 😎',
  'Pterosaurs could fly, but they weren\'t actually dinosaurs! 🦅',
  'Stegosaurus had a brain about the size of a lime! 🍋',
  'Argentinosaurus may have weighed as much as 10 elephants! 🐘',
  'Scientists who study dinosaur fossils are called paleontologists! 🔍',
  'T. rex lived about 66–68 million years ago! ⏳',
  'Dinosaurs lived on every continent, even Antarctica! 🧊',
];
let fact = 0;
$('#fact-btn').addEventListener('click', (e) => {
  e.stopPropagation();
  fact = (fact + 1) % FACTS.length;
  const p = $('#fact');
  p.textContent = FACTS[fact];
  p.style.animation = 'none'; void p.offsetWidth; p.style.animation = 'pop .4s both';
});

/* ---------- Photos that haven't been added yet ---------- */
$$('img[data-placeholder]').forEach((img) => {
  const swap = () => {
    const ph = document.createElement('div');
    ph.className = 'ph';
    ph.innerHTML = `<div><img src="assets/rex.png" alt=""><span>${img.dataset.placeholder}</span></div>`;
    img.replaceWith(ph);
  };
  if (img.complete && img.naturalWidth === 0) swap();
  else img.addEventListener('error', swap, { once: true });
});

/* ---------- Calendar ---------- */
const partyEnd = new Date(partyStart.getTime() + CONFIG.PARTY_HOURS * 36e5);
const calFmt = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const calDetails = 'Dinosaurs are coming back! Join Amelia and Rex the T-rex for a Dinosaur Explorer Mission. ' + location.href.split('#')[0];
$('#gcal').href = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
  + '&text=' + encodeURIComponent(CONFIG.TITLE)
  + '&dates=' + calFmt(partyStart) + '/' + calFmt(partyEnd)
  + '&details=' + encodeURIComponent(calDetails)
  + '&location=' + encodeURIComponent(CONFIG.ADDRESS);
$('#ics').addEventListener('click', () => {
  const esc = (s) => s.replace(/([,;\\])/g, '\\$1');
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Amelia Dino Party//EN', 'BEGIN:VEVENT',
    'UID:amelia-8th-birthday-20270109@jones', 'DTSTAMP:' + calFmt(new Date()),
    'DTSTART:' + calFmt(partyStart), 'DTEND:' + calFmt(partyEnd),
    'SUMMARY:' + esc(CONFIG.TITLE), 'LOCATION:' + esc(CONFIG.ADDRESS), 'DESCRIPTION:' + esc(calDetails),
    'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', 'DESCRIPTION:Dinosaurs tomorrow!', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  a.download = 'amelia-8th-birthday.ics';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
});

/* =========================================================
   RSVP + ROSTER
   ========================================================= */
const counts = { adults: 1, kids: 1 };
const form = $('#rsvp-form');

$$('[data-step]').forEach((btn) => btn.addEventListener('click', () => {
  const k = btn.dataset.step;
  counts[k] = Math.max(0, Math.min(20, counts[k] + Number(btn.dataset.d)));
  const out = $(`#${k}-out`);
  out.textContent = counts[k];
  out.classList.remove('bump'); void out.offsetWidth; out.classList.add('bump');
  renderPreview();
}));

function renderPreview() {
  const kids = ['🦖', '🦕'];
  let html = '';
  for (let i = 0; i < counts.adults; i++) html += `<span style="animation-delay:${i * 40}ms">🧑‍🔬</span>`;
  for (let i = 0; i < counts.kids; i++) html += `<span style="animation-delay:${(counts.adults + i) * 40}ms">${kids[i % 2]}</span>`;
  $('#party-preview').innerHTML = html;
}
renderPreview();

function syncAttending() {
  const yes = form.attending.value === 'yes';
  $('#counts').hidden = !yes;
  $('#rsvp-submit').textContent = yes ? '🥚 Send my RSVP' : '💌 Send my answer';
}
$$('input[name="attending"]').forEach((r) => r.addEventListener('change', syncAttending));

const ERRORS = {
  missing_name: 'Please tell us your explorer family name. 🦖',
  bad_email: 'Please check your email so we can send your confirmation. 📧',
  bad_count: 'Add at least one explorer (adult or child). 🦕',
  server: 'Oops, a dinosaur stepped on our server. Please try again in a moment.',
  network: 'We couldn\'t reach base camp. Check your internet and try again.',
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const err = $('#form-error');
  err.hidden = true;
  $$('.invalid', form).forEach((el) => el.classList.remove('invalid'));

  const data = {
    action: 'rsvp',
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    attending: form.attending.value,
    adults: counts.adults,
    kids: counts.kids,
    kidNames: form.kidNames.value.trim(),
    message: form.message.value.trim(),
    website: form.website.value,
  };

  let problem = '';
  if (data.name.length < 2) { problem = 'missing_name'; form.name.classList.add('invalid'); }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) { problem = 'bad_email'; form.email.classList.add('invalid'); }
  else if (data.attending === 'yes' && data.adults + data.kids < 1) problem = 'bad_count';
  if (problem) { err.textContent = ERRORS[problem]; err.hidden = false; return; }

  const btn = $('#rsvp-submit');
  const label = btn.textContent;
  btn.disabled = true; btn.textContent = '🦖 Stomping to base camp…';
  try {
    const res = await api(data);
    if (!res.ok) throw new Error(res.error || 'server');
    store.set('dino-rsvp', { name: data.name, email: data.email, attending: data.attending, adults: data.adults, kids: data.kids, kidNames: data.kidNames });
    renderRoster(res);
    showDone(data, res.updated);
  } catch (ex) {
    err.textContent = ERRORS[ex.message] || ERRORS[ex.name === 'TypeError' ? 'network' : 'server'];
    err.hidden = false;
  } finally {
    btn.disabled = false; btn.textContent = label;
  }
});

function showDone(data, updated) {
  const yes = data.attending === 'yes';
  form.hidden = true;
  const done = $('#rsvp-done');
  done.hidden = false;
  $('.hatch .baby', done).textContent = yes ? '🦖' : '🦕';
  $('#done-title').textContent = yes ? (updated ? 'RSVP updated! 🦖' : 'ROAR-some! You\'re on the team!') : 'Thanks for letting us know 💚';
  const who = [];
  if (data.adults) who.push(`${data.adults} adult${data.adults > 1 ? 's' : ''}`);
  if (data.kids) who.push(`${data.kids} little explorer${data.kids > 1 ? 's' : ''}`);
  $('#done-text').innerHTML = yes
    ? `Rex is getting <b>${who.join(' and ')}</b> explorer badge${data.adults + data.kids > 1 ? 's' : ''} ready. ${CONFIG.API_URL ? `A confirmation email is on its way to <b>${escapeHtml(data.email)}</b> 📧` : '(Test mode: no email was sent.)'}<br>See you on <b>Saturday, January 9 at 1:00 PM</b>!`
    : `Rex will miss you, but he's saving you a dino hug! ${CONFIG.API_URL ? 'We sent a little note to your email. 📧' : ''}`;
  done.focus({ preventScroll: true });
  done.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  if (yes) { rain(['🦖', '🦕', '🥚', '🎉', '🌿', '🦴', '🎂'], 60); setTimeout(roar, 900); }
}

$('#rsvp-again').addEventListener('click', () => {
  const saved = store.get('dino-rsvp', null);
  if (saved) {
    form.name.value = saved.name; form.email.value = saved.email; form.kidNames.value = saved.kidNames || '';
    form.attending.value = saved.attending;
    counts.adults = saved.adults ?? 1; counts.kids = saved.kids ?? 1;
    $('#adults-out').textContent = counts.adults; $('#kids-out').textContent = counts.kids;
    renderPreview(); syncAttending();
  }
  $('#rsvp-done').hidden = true; form.hidden = false;
  form.name.focus();
});

/* ---------- Roster ---------- */
const AVATARS = ['🦖', '🦕', '🐊', '🦎', '🐢', '🥚', '🦴', '🌋'];
const AVATAR_BG = ['#9DBA3E', '#F2C94C', '#FFB37A', '#9FD6E8', '#F6A6C4', '#C9E28A'];

function renderRoster(state) {
  const roster = (state.roster || []).slice().sort((a, b) => String(a.ts).localeCompare(String(b.ts)));
  const t = state.totals || { families: 0, adults: 0, kids: 0 };
  animateNumber($('#t-families'), t.families);
  animateNumber($('#t-kids'), t.kids);
  animateNumber($('#t-adults'), t.adults);

  const herd = [];
  for (let i = 0; i < Math.min(t.kids, 60); i++) herd.push(`<span style="animation-delay:${i * 30}ms">${i % 2 ? '🦕' : '🦖'}</span>`);
  for (let i = 0; i < Math.min(t.adults, 60); i++) herd.push(`<span style="animation-delay:${(t.kids + i) * 30}ms">🧑‍🔬</span>`);
  $('#herd').innerHTML = herd.join('');

  const mine = (store.get('dino-rsvp', {}) || {}).name;
  $('#roster-list').innerHTML = roster.map((r, i) => {
    const parts = [];
    if (r.adults) parts.push(`${r.adults} adult${r.adults > 1 ? 's' : ''}`);
    if (r.kids) parts.push(`${r.kids} kid${r.kids > 1 ? 's' : ''}`);
    return `<li class="badge${mine && mine === r.name ? ' mine' : ''}" style="animation-delay:${i * 60}ms">
      <span class="avatar" style="--c:${AVATAR_BG[hash(r.name) % AVATAR_BG.length]}">${AVATARS[hash(r.name) % AVATARS.length]}</span>
      <span><b>${escapeHtml(r.name)}</b><small>${parts.join(' · ')}</small>${r.kidNames ? `<small>🏷️ ${escapeHtml(r.kidNames)}</small>` : ''}</span>
    </li>`;
  }).join('');
  $('#roster-empty').hidden = roster.length > 0;
  $('#roster-error').hidden = true;
}

async function loadRoster() {
  try {
    renderRoster(await api(null));
  } catch {
    $('#roster-error').hidden = false;
  }
}

function animateNumber(el, to) {
  const from = Number(el.textContent) || 0;
  if (from === to || reduceMotion) { el.textContent = to; return; }
  const start = performance.now();
  const step = (now) => {
    const p = Math.min(1, (now - start) / 700);
    el.textContent = Math.round(from + (to - from) * p);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ---------- Server (Google Apps Script) or local test mode ---------- */
async function api(payload) {
  if (!CONFIG.API_URL) return localServer(payload);
  if (!payload) {
    const res = await fetch(CONFIG.API_URL + '?t=' + Date.now(), { cache: 'no-store' });
    return res.json();
  }
  // text/plain avoids the CORS preflight (needed for Google Apps Script)
  const res = await fetch(CONFIG.API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

function localServer(payload) {
  const all = store.get('dino-local-rsvps', []);
  let updated = false;
  if (payload && payload.action === 'rsvp') {
    const row = { ...payload, email: payload.email.toLowerCase(), ts: new Date().toISOString() };
    if (row.attending !== 'yes') { row.adults = 0; row.kids = 0; }
    const i = all.findIndex((r) => r.email === row.email);
    if (i >= 0) { all[i] = row; updated = true; } else all.push(row);
    store.set('dino-local-rsvps', all);
  }
  const yes = all.filter((r) => r.attending === 'yes');
  return new Promise((resolve) => setTimeout(() => resolve({
    ok: true,
    updated,
    roster: yes.map(({ name, adults, kids, kidNames, ts }) => ({ name, adults, kids, kidNames, ts })),
    totals: {
      families: yes.length,
      adults: yes.reduce((s, r) => s + r.adults, 0),
      kids: yes.reduce((s, r) => s + r.kids, 0),
    },
  }), payload ? 600 : 100));
}

$('#demo-notice').hidden = Boolean(CONFIG.API_URL);
loadRoster();
setInterval(() => { if (!document.hidden) loadRoster(); }, 60000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) loadRoster(); });

/* =========================================================
   FUN EFFECTS
   ========================================================= */
// Tap anywhere for dino footprints
let footSide = 0;
document.addEventListener('click', (e) => {
  if (reduceMotion || e.target.closest('a, button, input, textarea, label, .egg')) return;
  const fx = $('#fx');
  for (let i = 0; i < 3; i++) {
    const p = document.createElement('span');
    p.className = 'print';
    footSide ^= 1;
    p.style.left = (e.clientX - 17 + i * 26 + (footSide ? 10 : -10)) + 'px';
    p.style.top = (e.clientY - 17 - i * 30) + 'px';
    p.style.setProperty('--r', (footSide ? 10 : -10) + 'deg');
    p.style.animationDelay = (i * 160) + 'ms';
    fx.appendChild(p);
    setTimeout(() => p.remove(), 2600);
  }
});

function burst(x, y, emojis, n) {
  if (reduceMotion) return;
  const fx = $('#fx');
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span');
    s.textContent = emojis[i % emojis.length];
    s.style.cssText = `position:absolute;left:${x}px;top:${y}px;font-size:1.4rem;transition:transform .8s ease-out,opacity .8s;`;
    fx.appendChild(s);
    requestAnimationFrame(() => {
      const a = Math.random() * Math.PI * 2, d = 50 + Math.random() * 60;
      s.style.transform = `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d}px) rotate(${Math.random() * 360}deg)`;
      s.style.opacity = '0';
    });
    setTimeout(() => s.remove(), 900);
  }
}

function rain(emojis, n) {
  if (reduceMotion) return;
  const fx = $('#fx');
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span');
    s.className = 'bit';
    s.textContent = emojis[i % emojis.length];
    s.style.left = Math.random() * 100 + 'vw';
    s.style.animationDuration = 2 + Math.random() * 2.5 + 's';
    s.style.animationDelay = Math.random() * 0.8 + 's';
    s.style.setProperty('--spin', (Math.random() * 720 - 360) + 'deg');
    s.style.fontSize = 1.2 + Math.random() * 1.4 + 'rem';
    fx.appendChild(s);
    setTimeout(() => s.remove(), 5500);
  }
}

/* ---------- Helpers ---------- */
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function hash(s) { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; }

/* ---------- Dino footprint trail behind the pointer (computers only) ---------- */
if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  let lastX = null, lastY = 0, side = 1;
  document.addEventListener('mousemove', (e) => {
    if (lastX === null) { lastX = e.clientX; lastY = e.clientY; return; }
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    const dist = Math.hypot(dx, dy);
    if (dist < 70) return;
    const angle = Math.atan2(dy, dx);
    side = -side;
    const p = document.createElement('span');
    p.className = 'trail';
    // footprint.svg points up, so add 90°; alternate left/right feet
    p.style.left = (e.clientX + Math.cos(angle + Math.PI / 2) * 7 * side) + 'px';
    p.style.top = (e.clientY + Math.sin(angle + Math.PI / 2) * 7 * side) + 'px';
    p.style.setProperty('--r', (angle * 180 / Math.PI + 90) + 'deg');
    $('#fx').appendChild(p);
    setTimeout(() => p.remove(), 1500);
    lastX = e.clientX; lastY = e.clientY;
  }, { passive: true });
}
