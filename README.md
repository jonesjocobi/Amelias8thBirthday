# Amelia's ROAR-SOME 8th Birthday 🦖

## Set up real RSVPs (one-time)

1. Create a **private Google Sheet** named `Amelia Birthday RSVPs` in the Google account that should own the guest list.
2. In the Sheet, choose **Extensions → Apps Script**. Replace the contents of `Code.gs` with the included `Code.gs` file and save.
3. Select **Deploy → New deployment → Web app**. Set **Execute as: Me** and **Who has access: Anyone**. Authorize the script. This permits invitees to submit without a Google account. The spreadsheet itself stays private. Anyone who has the web app URL can submit data, so don't share the script URL separately.
4. Copy the **Web app URL** ending in `/exec`.
5. Open `index.html`, find `const RSVP_SCRIPT_URL = '';`, and paste the URL between the quotes.
6. Upload **only `index.html`** to the root of your GitHub Pages repository (the Apps Script code stays in Google; do not upload `Code.gs` to the public repository).
7. Test with a sample RSVP. Check that the Google Sheet gets a new row and `jonesjocobi@gmail.com` receives a notification email. Check your spam folder if necessary.

**Important:** The RSVP form cannot save submissions until you complete steps 1–5. The browser's iframe-load confirmation cannot verify that Google Sheets saved the row. Verify with a test RSVP. Google Apps Script has usage quotas, including email quotas.

## View guest totals

In an empty area of your Google Sheet, use these formulas:

- Families coming: `=COUNTIF(E2:E,"Yes")`
- Adults coming: `=SUM(F2:F)`
- Children coming: `=SUM(G2:G)`
- Families unable to attend: `=COUNTIF(E2:E,"No")`

Each submission adds a row. If someone submits twice, both rows appear; review duplicates before relying on totals. Do not share the sheet publicly because it contains names and email addresses.

## Publish the invitation

GitHub repository → Settings → Pages → Deploy from branch → `main` / root. Upload `index.html` to the repository root. You may keep `README.md` in the repo, but keep `Code.gs` private.

Party: January 9, 2027, at 1 PM. Calendar end time of 4 PM is a placeholder and should be adjusted once confirmed.
