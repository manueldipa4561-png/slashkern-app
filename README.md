# KERN

Find your direction by doing real creative work. Installable web app (PWA) by Punto Due Studio.

## Run it

```bash
npm install
npm run dev      # http://localhost:4322
npm run build    # static site in dist/
npm test         # checks the sync rules (src/scripts/sync.ts)
```

## Deploy on Netlify

Add new site, Import from Git, pick this repository. Settings come from `netlify.toml` (build `npm run build`, publish `dist`, Node 22). Every push to `main` redeploys.

Without the two Supabase variables below, KERN runs without accounts and everything stays on the device.

## Accounts and sync (Supabase)

1. Create a project at supabase.com. Pick an EU region (for example Frankfurt).
2. SQL Editor, New query: paste `supabase/schema.sql` and Run. It creates the `kern_state` table with Row Level Security (each user reads and writes only their own row) and the `delete_my_account` function.
3. Project Settings, API: copy the Project URL and the anon (publishable) key. The key is meant to be public; the database rules protect the data.
4. Netlify, Site configuration, Environment variables: add `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY`, then redeploy. For local dev copy `.env.example` to `.env` and fill it in.
5. Supabase, Authentication, URL Configuration: set Site URL to your Netlify address (for example `https://kern.netlify.app`) and add `https://kern.netlify.app/**` and `http://localhost:4322/**` to Redirect URLs.
6. Authentication, Sign In / Providers, Email: keep "Confirm email" on. It also stops strangers from finding out which emails have an account.
7. Before real users sign up, set a custom SMTP sender (Authentication, Emails, SMTP settings, with Resend, Brevo or Postmark). The built-in sender only delivers to your own team's addresses and a few emails per hour.

Email links (confirm, reset password) sign you in on the device and browser where you asked for them. Opened elsewhere, the app says so and offers to log in there instead.

## What is in it

- Optional account: sign up, log in, forgot password, log out, delete account; the trail syncs across devices and merges with what was on the device
- Or no account: local profile (first name, 18+ confirmation), everything stays in the browser
- Onboarding by field, Missions, yourKERN, Trail, KERN.AI co-pilot (scripted: it only asks questions)
- Home: your next mission first, then your 3 missions with status (done / next / draft)
- Answers with automatic drafts; edit or delete them (with Undo); +50 stones per answer, +20 for a reflection
- Quick reflection after each answer (how it felt, would you do it again, hardest part, a sign for the next person)
- Badges for real milestones (first answer, first reflection, full trail, dare sent...)
- Real "first guess" and Kern card built from your reflections; Kern card shared as a 1080x1350 image
- Share your Kern card, dare a friend, copy links (native share sheet, clipboard fallback); dare links open the same mission
- Weekly reminder as a calendar file (no notifications permission, no streaks)
- Pilot: "Share my trail with the KERN team" sends answers and reflections as plain text
- EN / IT, system / dark / light theme
- Installable and works offline after the first visit (`public/sw.js`); security headers and CSP in `netlify.toml`
- Export and delete your data from Settings; privacy page at `/privacy/`

## Not built yet

Real partner missions, peer review and ranking, a real AI co-pilot, push notifications.

## Structure

- `src/pages/index.astro` markup, `src/styles/app.css` styles, `src/scripts/app.ts` logic
- `src/scripts/cloud.ts` accounts and sync (loaded only when the Supabase variables are set), `supabase/schema.sql` database setup
- `src/scripts/i18n.ts` Italian strings (English is the source), `src/scripts/fields.ts` missions per field
- `public/` manifest, service worker, icons, favicons
