# 🦖 Amelia's 8th Birthday · Dinosaurs Are Coming Back!

An interactive invitation for Amelia's dinosaur birthday party: a T-rex that walks in and
ROARS when you tap him (Rex!), a live countdown, a top-secret mission briefing, a "hatch the
8 eggs" secret message game, the Expedition Team, Season 1 vs Season 2 (last year's party
vs this year), dino facts, calendar buttons, an RSVP with adults/children counters,
a confirmation email, and a live "Who's Coming?" roster.

🗓️ Saturday, January 9, 2027 · 1:00 PM · Jones Family Home, 12089 Rue Des Amis, San Diego, CA 92131

```
index.html                    The invitation content
style.css                     Colors, fonts, animations and phone layout
script.js                     Interactions, RSVP and roster (⚙️ CONFIG at the top)
assets/rex.png                Rex (cartoon T-rex, transparent background)
assets/photos/                Photos (see "Add the photos" below)
assets/footprint.svg, favicon.svg, share.png   Footprints, tab icon, link preview image
google-apps-script/Code.gs    Google Sheets service: RSVPs, emails, roster
```

Without any setup, the page runs in **test mode** (RSVPs are saved only on that device and a
yellow banner shows at the top). To collect real RSVPs and send emails, connect Google Sheets
(step 2) and paste its URL into `script.js`.

---

## 1. Publish the page with GitHub Pages

1. In this repository: **Settings → Pages → Build and deployment**
   - Source: **Deploy from a branch**
   - Branch: **main** / **(root)** → **Save**
2. In 1–2 minutes the invitation is live at
   **https://jonesjocobi.github.io/Amelias8thBirthday/**

---

## 2. Google Sheets: RSVPs, confirmation emails and the roster

1. Open [sheets.new](https://sheets.new) and name it **Amelia 8th Birthday RSVPs**.
2. Menu **Extensions → Apps Script**.
3. Delete everything in `Code.gs` and paste the contents of `google-apps-script/Code.gs`. Save (💾).
4. In the function picker at the top choose **setup** and press **▶ Run**.
   - Google asks for permissions: **Review permissions → your account → Advanced →
     Go to (project) (unsafe) → Allow**. That's normal: it's your own script.
   - An **RSVP** tab is created in the sheet.
5. **Deploy → New deployment** → ⚙️ type **Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone** ⚠️ *(not "Anyone with a Google account")*
   - **Deploy** and copy the URL ending in **`/exec`**.
6. Paste it into `CONFIG.API_URL` at the top of `script.js` and push the change to GitHub:
   ```js
   const CONFIG = {
     API_URL: 'https://script.google.com/macros/s/XXXXXXXX/exec',
   ```

**Quick test:** open the `/exec` URL in a browser. You should see
`{"ok":true,"roster":[],"totals":{...}}`.

### What happens on each RSVP

- A row is saved in the **RSVP** tab: email, family name, coming yes/no, adults, children,
  children's names and a message for Amelia.
- The guest gets a **confirmation email** (from your Gmail, as "Amelia's Dino Party") with
  the date, time, address, map link and a mission hint.
- You get an **email notification** with the running totals. To turn it off, set
  `NOTIFY_HOST = false` in `Code.gs`.
- The **Who's Coming?** section shows families who said yes (names and counts only;
  emails and messages stay private in your sheet).
- To change an answer, a guest just sends the form again with the same email: the row is updated.
- To remove someone, delete their row in the sheet.

### Reminder email (optional)

In the Apps Script editor choose **sendReminders → ▶ Run** to send it right away, or run
**scheduleReminder** once to send it automatically on **Thursday, January 7, 2027 at 10:00 AM**
(change `REMINDER_AT` in `Code.gs`). It goes to everyone who said yes.

### Updating the Apps Script code

1. Paste the new code in the editor and save (💾). Run **setup** again.
2. **Deploy → Manage deployments → ✏️ → Version: New version → Deploy.** The URL stays the same.

### Common problems

| Symptom | Fix |
|---|---|
| The `/exec` URL asks you to sign in | The deployment access must be **Anyone** (step 5). |
| "We couldn't load the roster" | Check that the URL ends in `/exec` (not `/dev`) and is in quotes in `script.js`. |
| I changed `Code.gs` but nothing changed | Make a **New version** of the deployment (see above). |
| Permission errors | Use a personal Gmail account, in an incognito window with only that account signed in. |

Gmail allows about 100 emails per day from Apps Script, plenty for a birthday party.

---

## 3. Add the photos

Drop these files into `assets/photos/` with **exactly** these names (until then, a cute
"coming soon" Rex placeholder shows in their place):

| File | Where it shows |
|---|---|
| `jones-family.jpg` | "Meet the Expedition Team" → The Jones Family card (landscape photos look best) |
| `rex-caricature.png` | "Dino-toon Edition" card (the cartoon version) |
| `amelia-age-7.jpg` ✅ | "The Dino Era: Season 2" → Season 1 (already added) |
| `rex-original.jpg` ✅ | Rex's card (already added) |

On GitHub: open `assets/photos` → **Add file → Upload files**. Photos from a phone are big:
around 1000–1200 px wide is plenty.

## 4. Customize

- **Date / time / address:** `index.html` (hero, "Expedition Details") and `CONFIG` in `script.js`
  (countdown and calendar). Emails use `EVENT` in `Code.gs`.
- **Calendar event length:** `PARTY_HOURS` in `script.js` (3 hours by default).
- **Rex's speech bubbles:** `REX_LINES` in `script.js`. **Dino facts:** `FACTS`.
- **Secret egg message:** `EGG_WORDS` in `script.js` (8 eggs, one per year!).
- **Mission briefing text:** `data-text` of `#typewriter` in `index.html`.

## 5. Little details

- Rex stomps in from the side; tap him for a roar (sound, screen shake, phone buzz) and a new line.
- Title letters stomp down, pterodactyls fly by, the volcano puffs smoke, the "8" egg wiggles.
- The mission briefing types itself out and gets a **TOP SECRET** stamp.
- Hatch all 8 eggs to decode Rex's message and make it rain dinosaurs.
- The RSVP counters preview your party as little dinos and explorers; sending it hatches an egg.
- Tap anywhere on the page to leave dino footprints 👣.
- Works on phones, respects "reduce motion", and shows a nice preview when shared on WhatsApp/iMessage.
