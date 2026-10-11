# KERN

Don't guess your passion, test it. Try short missions in design, writing, code, video, selling, music and prompting with AI, free. Installable web app (PWA) by Manuel Di Paolo.

## Run it

```bash
npm install
npm run dev      # http://localhost:4322
npm run build    # static site in dist/
npm test         # sync rules, next-mission and rounds rules, every mission complete and translated, the distress screen (same in app and server), the Studio and the usage report maths
npm run stats    # usage numbers from people who opted in (see docs/ANALYTICS.md)
```

## Show it in a minute (demo profile)

Open the app address followed by `/?demo` once on a phone. It opens a labelled sample profile (six sample answers, three versions of an idea in KERN.AI, a Kern card ready, round 2 waiting) so the app can be shown without playing through the first run. The co-pilot answers live in the demo too (when online, if the server has its key): the KERN.AI tab says in the demo that what is typed there is sent to the AI to get a reply, and nothing is stored. Without a key or a network it falls back to the scripted coach. Tap the gold DEMO marker in the header twice to leave it (the first tap only asks), or open `/?demo=off` (`off`, `0`, `false` and `no` leave it, the flag only works on the app page, not on `/privacy/`). A sheet repeats a Demo tag at the top right. Delete my data inside the demo only resets the sample, and leaving the demo throws it away (what a visitor typed in it too), so the next visitor gets a fresh one. The demo has its own storage (`kern:demo`), never syncs, never publishes a sign and is never counted, and it does not touch the real trail. The answers and numbers in it are sample data, not users.

The private demo site (kern-app-private.netlify.app) asks for its password. On a device that has used it once, the browser keeps it unlocked: the password is not asked again unless the browser's site data for the page is deleted (clearing cookies, a private window, a different browser). So unlock it once on the phone you will show it on, ahead of time, and do not clear the data afterwards.

## Deploy on Netlify

Add new site, Import from Git, pick this repository. Settings come from `netlify.toml` (build `npm run build`, publish `dist`, Node 22). Every push to `main` redeploys.

Without the two Supabase variables below, KERN runs without accounts and everything stays on the device.

## Accounts and sync (Supabase)

1. Create a project at supabase.com. Pick an EU region (for example Frankfurt).
2. SQL Editor, New query: paste `supabase/schema.sql` and Run. It creates the `kern_state` table with Row Level Security (each user reads and writes only their own row) the `delete_my_account` function, the `kern_signs` table with `add_sign` / `delete_my_sign` for signs on the trail, and the `kern_events` table with `log_event` / `forget_events` for usage counts without names. Run it again after updating: every statement is safe to repeat. (Round 2 needs this once: it widens the `kern_signs` mission limit from 0-2 to 0-5. Until you run it, a sign left on missions 4 to 6 is rejected by the database and just stays on the device.)
3. Project Settings, API: copy the Project URL and the anon (publishable) key. Anyone can read this key, and the database rules protect the data.
4. Netlify, Site configuration, Environment variables: add `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY`, then redeploy. For local dev copy `.env.example` to `.env` and fill it in.
5. Supabase, Authentication, URL Configuration: set Site URL to your Netlify address (for example `https://kern.netlify.app`) and add `https://kern.netlify.app/**` and `http://localhost:4322/**` to Redirect URLs.
6. Authentication, Sign In / Providers, Email: keep "Confirm email" on. It also stops strangers from finding out which emails have an account.
7. Before real users sign up, set a custom SMTP sender (Authentication, Emails, SMTP settings, with Resend, Brevo or Postmark). The built-in sender only delivers to your own team's addresses and a few emails per hour.

Email links (confirm, reset password) sign you in on the device and browser where you asked for them. Opened elsewhere, the app says so and offers to log in there instead.

## What is in it

- Optional account: sign up, log in, forgot password, log out, delete account. The trail syncs across devices and merges with what was on the device
- Or no account: local profile (18+ confirmation; a first name only comes with an account), everything stays in the browser
- Onboarding: the choice first, then one or more interests (fields). On Missions you switch path in one tap and progress is kept per field, "+ Add" picks more. Three sections: Missions, yourKERN (your Kern card, first guess, evidence and answers) and the KERN.AI co-pilot (it only asks questions: live through Claude via a Netlify function when online, with a scripted fallback)
- Home: your next mission first, then your 3 missions with status (done / next / draft)
- Rounds: every field has 6 missions, shown 3 at a time. Finishing round 1 gives you your Kern card and shows a "round complete" moment on Home. Round 2 is never locked: a "Round 2" link under the list shows it from day one. Round 2 repeats the same three kinds (improve what exists, start from zero, work with a partner), so the card gets sharper with every round. After a finished mission, the button leads straight into the next mission of the round. Missions live in `fields.ts`, `missions.ts`, `helps.ts` and `easy.ts` (same order in all four). `npm test` checks they match
- Every mission says under the answer box exactly what to write and its limit (`answer` in `missions.ts` and `easy.ts`); the three steps all happen in the app, anything outside it is the bonus
- Real sound and clips: song previews, a reel with a drop you can hear and a beat grid in Music, two real clips in Video, made with AI and marked as such (`public/media/`, `design/mission-media.md`)
- Try your prompt on the AI: in Prompting missions the person can run their own prompt and see what comes back (only the prompt is sent, 5 tries per mission per day)
- KERN.AI checks when its tab opens that the live AI can answer (a free call, nothing of the person's is sent) and says live, key rejected or not reachable
- Mission pictures: where a mission shows a photo, a story or a screen, the sheet shows the picture itself (`public/img/m/`, set with `img` on the asset in `missions.ts`; nine missions so far), the written version stays as its alt text
- Brand missions: a mission can be presented by a brand, shown as "Brand mission · name" in the brand colour. The mission text stays brand-neutral (a made-up subject), so a deal is one line in `src/scripts/sponsors.ts`. The three in the app are samples, marked "(sample)", not real partners
- Mission Studio: `node scripts/mission-studio.mjs` has Claude draft a new English and Italian mission from a field, a kind and a subject, 29 automatic rules check it, and a person approves it. It needs `ANTHROPIC_API_KEY` for a live run and is covered offline by `npm test`. The authoring guide is `docs/MISSIONS.md`
- Usage counts without names: off until a person says yes (one card on Home, a switch in Settings). A random code plus the kind of event, field, mission, language and time, never a name or anything they wrote. Deleted when they switch off, delete their data, or at 12 months. `npm run stats` turns it into pilot numbers, with small samples shown as counts, not percentages. Needs the Supabase variables. Guide: `docs/ANALYTICS.md`
- Answers with automatic drafts. Edit or delete them (with Undo)
- What to expect: under the field chips, a sheet with a day in the field, what people like and what they find hard, from `src/scripts/fieldinfo.ts` (EN and IT, no numbers or partners claimed)
- Fields side by side: once two fields have a reflection, yourKERN compares their average energy and says who leads only on a clear gap with two reflections each (`src/scripts/compare.ts`, covered by `npm test`)
- Take it further: three steps outside the app (ask, make, learn) for the field you are in, once it has an answer
- Quick reflection after each answer (how it felt, would you do it again, hardest part, a sign for the next person)
- Tips for the next person (called signs in the code): with an account, the tip you leave is shown without your name to the next people who open that mission (`kern_signs` in `supabase/schema.sql`: public read of tip and date only, writes through `add_sign` / `delete_my_sign`, 20 a day each, no links, emails or long numbers). Deleting the answer removes its sign
- Real "first guess" and Kern card built from your reflections. Kern card shows a line from your own answer and the field path, shared as a 1080x1920 story image
- Co-op with a friend, without a server: two missions in every field (the "with a partner" kind, index 2 and 5) can be finished by two people through links. The first sends a link that carries their answer after the `#` (`src/scripts/coop.ts`, the friend's task per mission in `coopask.ts`), the friend answers on a card at the top of Missions and sends a link back, and both answers sit side by side in yourKERN. The link stays in the address bar until it is answered or dismissed. Covered by `npm test`; the Privacy page says what a link carries
- Share your Kern card, dare a friend, copy links (native share sheet, clipboard fallback). Dare links open the same mission
- Weekly reminder as a calendar file (no notifications permission, no streaks)
- Pilot: "Share my trail with the KERN team" sends answers and reflections as plain text
- English, Italian, German and French (`i18n.ts`, `i18n-de.ts`, `i18n-fr.ts`; `npm test` fails on a missing translation or a job-world word in any of them), dark / light theme, and a text size setting (four steps, every font size is in rem, `npm test` checks it)
- Installable and works offline after the first visit (`public/sw.js`). Security headers and CSP in `netlify.toml`
- Export and delete your data from Settings. Privacy page at `/privacy/` (with a "What we keep" table at the top), Terms at `/terms/` and About at `/about/` (four languages), and a feedback button that opens your own mail app
- Design (v2): icons (`src/scripts/icons.ts`: the fields and the three tabs are glass pictures in `public/img/f/`, see `design/field-icons.md`; the done icon is a Phosphor Icon, MIT, with the body in the brand lime), bigger type, one calm confirmation after each mission (no points or random rewards). View Transitions slide the panes (plain swap where unsupported, nothing moves with reduced motion)
- Look (11 Oct, light first): Geist for the interface (self-hosted, `@fontsource-variable/geist`), EB Garamond 500 only for the Home headline and the Kern card's line, a pale sky gradient fading to white, white cards with a thin border and a soft shadow, black pill buttons, white pill chips (the chosen one fills lime with ink text), a white tab bar with a sliding lime dot. One layer at the end of `src/styles/app.css` ("v8 ... light first") sets it; everything colour-related sits under `:root.light`, so the dark theme keeps the night-green look. Text on white never uses lime (`--acct`, a dark green, is the accent for text). `public/theme-init.js` sets the theme before the first paint

**Cut from the interface in v2** (the code is still there, hidden with the `k-cut` class, so each piece can come back): points and ranks, finds, badges, trail days, the habit builder, the review teaser, daily boosts and the random drops. The Trail section moved into yourKERN. The classic design before v1.0 is kept on the `classic-design` branch and the `v0.4-classic` tag.

## Not built yet

Real partner missions (brand missions are demos for now), peer review and ranking, push notifications, payments, premium missions with free windows, a live analytics dashboard (the numbers come from `npm run stats`).

## Structure

- `src/pages/index.astro` markup, `src/styles/app.css` styles, `src/scripts/app.ts` logic
- `src/scripts/cloud.ts` accounts and sync (loaded only when the Supabase variables are set), `supabase/schema.sql` database setup
- `src/scripts/i18n.ts` Italian strings (English is the source), `i18n-de.ts` / `i18n-fr.ts` German and French, `src/scripts/fields.ts` missions per field
- `src/scripts/next.ts` rounds and the next-mission rule, `src/scripts/sponsors.ts` brand missions, `src/scripts/stats.ts` opt-in usage counts, `src/scripts/demo.ts` the demo profile's sample trail (texts in both languages)
- `scripts/` the tests run by `npm test`, and the Mission Studio
- `public/` manifest (with install screenshots in `public/screenshots/`), service worker, icons, favicons, `og.jpg` (link preview, the banner). `public/img/` (the mark in the header, on the launch screen and on the first screens is an inline SVG, `MARK` in `index.astro`, drawn again in the share image and in `favicon.svg`; `mark.webp` is no longer used), `public/img/f/` the glass pictures (fields, tabs, the Kern card) and `public/img/m/` the mission photos

## License

© 2026 Manuel Di Paolo. All rights reserved. This code is not open source: see [LICENSE](LICENSE).
