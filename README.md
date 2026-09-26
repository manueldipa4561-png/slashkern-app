# KERN

Find your direction by doing real creative work. Installable web app (PWA) by Punto Due Studio.

## Run it

```bash
npm install
npm run dev      # http://localhost:4322
npm run build    # static site in dist/
```

## Deploy on Netlify

Add new site, Import from Git, pick this repository. Settings come from `netlify.toml` (build `npm run build`, publish `dist`, Node 22). Every push to `main` redeploys.

## What is in it

- Local profile (first name, 18+ confirmation), onboarding by field, Missions, yourKERN, Trail, KERN.AI co-pilot (scripted: it only asks questions)
- Home: your next mission first, then your 3 missions with status (done / next / draft)
- Answers saved on the device with automatic drafts; +50 stones per answer, +20 for a reflection
- Quick reflection after each answer (how it felt, would you do it again, hardest part, a sign for the next person)
- Real "first guess" and Kern card built from your reflections; Kern card shared as a 1080x1350 image
- Pilot: "Share my trail with the KERN team" sends answers and reflections as plain text
- Share your Kern card and dare a friend (native share sheet, clipboard fallback); dare links open the same mission
- EN / IT, system / dark / light theme
- Installable and works offline after the first visit (`public/sw.js`); security headers in `netlify.toml`
- Export and delete your data from Settings; privacy page at `/privacy/`

## Not built yet

Accounts and sync across devices, real partner missions, peer review and ranking, a real AI co-pilot, push notifications. Until a backend exists, everything a user writes stays in their browser.

## Structure

- `src/pages/index.astro` markup, `src/styles/app.css` styles, `src/scripts/app.ts` logic
- `src/scripts/i18n.ts` Italian strings (English is the source), `src/scripts/fields.ts` missions per field
- `public/` manifest, service worker, icons
