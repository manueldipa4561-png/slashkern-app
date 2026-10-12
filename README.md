# slashkern

Make something companies can hire you for. Short projects, an AI assistant that helps you make them, and your own page where companies will find you as they join (early access: nobody is paying yet, and no amount appears anywhere in the app). Installable web app (PWA) by Manuel Di Paolo.

## Run it

```bash
npm install
npm run dev      # http://localhost:4322
npm run build    # static site in dist/
npm test         # sync rules, next-mission and rounds rules, every mission complete and translated, the distress screen (same in app and server), the Studio and the usage report maths
npm run stats    # usage numbers from people who opted in (see docs/ANALYTICS.md)
```

## Show it in a minute (demo profile)

Open the app address followed by `/?demo` once on a phone. It opens a labelled sample profile (six sample answers, three versions of an idea in the chat with Slash, a Slash card ready, round 2 waiting) so the app can be shown without playing through the first run. The assistant answers live in the demo too (when online, if the server has its key): the Assistant tab says in the demo that what is typed there is sent to the AI to get a reply, and nothing is stored. Without a key or a network it falls back to the scripted questions. Tap the gold DEMO marker in the header twice to leave it (the first tap only asks), or open `/?demo=off` (`off`, `0`, `false` and `no` leave it, the flag only works on the app page, not on `/privacy/`). A sheet repeats a Demo tag at the top right. Delete my data inside the demo only resets the sample, and leaving the demo throws it away (what a visitor typed in it too), so the next visitor gets a fresh one. The demo has its own storage (`kern:demo`, a storage key kept with the old name on purpose so saved data keeps working), never syncs, never publishes a sign and is never counted, and it does not touch the real trail. The answers and numbers in it are sample data, not users.

The private demo site (kern-app-private.netlify.app) asks for its password. On a device that has used it once, the browser keeps it unlocked: the password is not asked again unless the browser's site data for the page is deleted (clearing cookies, a private window, a different browser). So unlock it once on the phone you will show it on, ahead of time, and do not clear the data afterwards.

## Deploy on Netlify

Add new site, Import from Git, pick this repository. Settings come from `netlify.toml` (build `npm run build`, publish `dist`, Node 22). Every push to `main` redeploys.

Without the two Supabase variables below, slashkern runs without accounts and everything stays on the device.

## Accounts and sync (Supabase)

1. Create a project at supabase.com. Pick an EU region (for example Frankfurt).
2. SQL Editor, New query: paste `supabase/schema.sql` and Run. It creates (table and function names keep the old `kern` prefix on purpose, so existing databases keep working) the `kern_state` table with Row Level Security (each user reads and writes only their own row) the `delete_my_account` function, the `kern_signs` table with `add_sign` / `delete_my_sign` for signs on the trail, and the `kern_events` table with `log_event` / `forget_events` for usage counts without names. Run it again after updating: every statement is safe to repeat. (Round 2 needs this once: it widens the `kern_signs` mission limit from 0-2 to 0-5. Until you run it, a sign left on missions 4 to 6 is rejected by the database and just stays on the device.)
3. Project Settings, API: copy the Project URL and the anon (publishable) key. Anyone can read this key, and the database rules protect the data.
4. Netlify, Site configuration, Environment variables: add `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY`, then redeploy. For local dev copy `.env.example` to `.env` and fill it in.
5. Supabase, Authentication, URL Configuration: set Site URL to your Netlify address (for example `https://kern.netlify.app`) and add `https://kern.netlify.app/**` and `http://localhost:4322/**` to Redirect URLs.
6. Authentication, Sign In / Providers, Email: keep "Confirm email" on. It also stops strangers from finding out which emails have an account.
7. Before real users sign up, set a custom SMTP sender (Authentication, Emails, SMTP settings, with Resend, Brevo or Postmark). The built-in sender only delivers to your own team's addresses and a few emails per hour.

Email links (confirm, reset password) sign you in on the device and browser where you asked for them. Opened elsewhere, the app says so and offers to log in there instead.

## What is in it

- Optional account: sign up, log in, forgot password, log out, delete account. The trail syncs across devices and merges with what was on the device
- Or no account: local profile (18+ confirmation; a first name only comes with an account), everything stays in the browser
- First run (v10): four screens with one action each and no tabs showing: a black welcome ("Make something companies can hire you for."), one of three free practice projects to try (a 15 s video, a short text, a sticker idea, each with its category and a time estimate, plus the 18+ box), the project one question at a time (its mission's own three steps, with the brief and the clip behind "See the brief"; the live assistant is a small "Ask the assistant" link), and "Saved to your page". Returning users skip it. Three sections: Projects (Home), Your page (the projects you finish, your Slash card, first guess, evidence) and Assistant (it only asks questions: live through Claude via a Netlify function when online, with a scripted fallback). The interests picker ("+ Add", Settings) is only for adding paths
- Home: one path (named for its category, "Short videos" first; the other six sit under "More paths": Posters and logos, Posts and captions, Websites and small tools, Product listings, Music and sound, AI prompts), in three stages: Make (the next project, a time estimate, one button), Keep (your page fills itself with finished projects), Get found (locked until 2 projects are done: "When companies post briefs, you can apply. The company chooses who gets the project and pays them."). A compact "How companies will find you" card says companies will see only the projects you choose to publish, that you decide what is public, and that nobody is paying yet. There is no price, amount or "paid" wording anywhere in the app (`npm test` guards it: a brief pays one or a few creators, so a price on every project would suggest everyone earns it)
- Rounds: every field has 6 missions, shown 3 at a time. Finishing round 1 gives you your Slash card and shows a "round complete" moment on Home. Round 2 is never locked: a "Round 2" link under the list shows it from day one. Round 2 repeats the same three kinds (improve what exists, start from zero, work with a partner), so the card gets sharper with every round. After a finished mission, the button leads straight into the next mission of the round. Missions live in `fields.ts`, `missions.ts`, `helps.ts` and `easy.ts` (same order in all four). `npm test` checks they match
- Every mission says under the answer box exactly what to write and its limit (`answer` in `missions.ts` and `easy.ts`); the three steps all happen in the app, anything outside it is the bonus
- Real sound and clips: song previews, a reel with a drop you can hear and a beat grid in Music, two real clips in Video, made with AI and marked as such (`public/media/`, `design/mission-media.md`)
- Try your prompt on the AI: in Prompting missions the person can run their own prompt and see what comes back (only the prompt is sent, 5 tries per mission per day)
- Slash checks when the Assistant tab opens that the live AI can answer (a free call, nothing of the person's is sent) and says live, key rejected or not reachable
- Mission pictures: where a mission shows a photo, a story or a screen, the sheet shows the picture itself (`public/img/m/`, set with `img` on the asset in `missions.ts`; nine missions so far), the written version stays as its alt text
- Trending now: a shelf of 8 practice projects on the Projects tab, built on what spread on TikTok and Instagram (seen Aug to Oct 2026, said once on the shelf, each card has a small Trending tag). They are normal projects in the 7 categories (`src/scripts/trending.ts`, same shapes as the other missions, German and French in `i18n-trending.ts`), 20 to 40 minutes, with 3 steps, 3 checks and 3 hint questions each. They sit after the 6 core projects of a category, so rounds, the Slash card's guess and the opt-in counts ignore them. Where an AI is used the brief says to label it, and the AI-character project asks for a line that says it is an AI. `scripts/check-trending.mjs` guards it
- Brand missions: a mission can be presented by a brand, shown as "Brand mission · name" in the brand colour. The mission text stays brand-neutral (a made-up subject), so a deal is one line in `src/scripts/sponsors.ts`. The three in the app are samples, marked "(sample)", not real partners
- Mission Studio: `node scripts/mission-studio.mjs` has Claude draft a new English and Italian mission from a field, a kind and a subject, 29 automatic rules check it, and a person approves it. It needs `ANTHROPIC_API_KEY` for a live run and is covered offline by `npm test`. The authoring guide is `docs/MISSIONS.md`
- Usage counts without names: off until a person says yes (one card on Home, a switch in Settings). A random code plus the kind of event, field, mission, language and time, never a name or anything they wrote. Deleted when they switch off, delete their data, or at 12 months. `npm run stats` turns it into pilot numbers, with small samples shown as counts, not percentages. Needs the Supabase variables. Guide: `docs/ANALYTICS.md`
- Answers with automatic drafts. Edit or delete them (with Undo)
- Make a first version with AI (`src/scripts/make.ts`, mode `make` of `netlify/functions/coach.mts`, reached at `/api/coach`; the function keeps its old name on purpose, `scripts/check-make.mjs`): at the end of a project (the done step, and "Saved to your page" in the first run), when the person wrote an idea of at least 20 characters, a secondary button asks the AI for a first version from the mission title, their own words and the assistant's questions they answered. The result is an editable box with the chip "Made with AI help" and the note that [brackets] are guesses; "Use this as my project" saves it with `ai: true`, "Make another" (3 per project per day on the device) and "Keep mine". The assistant itself still only asks questions. A project made this way is tagged "Made with AI help" on Your page, the Slash card, the shared image, the trail text and co-op links, on every device (`ai` in the sync rules), and the tag is never hidden. Nothing is stored or logged on the server
- Slash, the face of the AI assistant (`src/scripts/slash.ts`, `scripts/check-slash.mjs`): the logo's eyes pointer (navy body, ice eyes, white outline), drawn from `design/brand/slash.json`. A fictional AI character, always called an AI and never a person. It shows only where the assistant speaks: a small avatar beside every assistant reply (first-run panel, project sheet, the Assistant tab's chat, whose first line is its introduction), a larger one in the Assistant tab's header, and thinking, then smiling, in "Make a first version with AI". Four moods (neutral, asking, thinking, happy); it bobs and blinks while answering, only when the device allows motion. The distress pause keeps a level face.
- Voice (`src/scripts/voice.ts`): a microphone in every box where a person types an answer or an assistant message (browser SpeechRecognition, feature-detected, interim results, the words land at the cursor and typed text stays; without it, or when the microphone is refused, the button hides and a one-line tip points to the keyboard's own microphone), and a "Listen" button on each assistant question (speechSynthesis, off by default). The first use of the microphone shows a one-time sheet saying where the voice goes (the browser's maker, Google or Apple; slashkern never records or stores audio). The privacy page says the same in six languages. A hands-free voice conversation is not built
- What to expect: under the field chips, a sheet with a day in the field, what people like and what they find hard, from `src/scripts/fieldinfo.ts` (EN and IT, no numbers or partners claimed)
- Fields side by side: once two fields have a reflection, slashkern compares their average energy and says who leads only on a clear gap with two reflections each (`src/scripts/compare.ts`, covered by `npm test`)
- Take it further: three steps outside the app (ask, make, learn) for the field you are in, once it has an answer
- Quick reflection after each answer (how it felt, would you do it again, hardest part, a sign for the next person)
- Tips for the next person (called signs in the code): with an account, the tip you leave is shown without your name to the next people who open that mission (`kern_signs` in `supabase/schema.sql`: public read of tip and date only, writes through `add_sign` / `delete_my_sign`, 20 a day each, no links, emails or long numbers). Deleting the answer removes its sign
- Real "first guess" and Slash card built from your reflections. The Slash card shows a line from your own answer and the field path, shared as a 1080x1920 story image
- Co-op with a friend, without a server: two missions in every field (the "with a partner" kind, index 2 and 5) can be finished by two people through links. The first sends a link that carries their answer after the `#` (`src/scripts/coop.ts`, the friend's task per mission in `coopask.ts`), the friend answers on a card at the top of Missions and sends a link back, and both answers sit side by side on Your page. The link stays in the address bar until it is answered or dismissed. Covered by `npm test`; the Privacy page says what a link carries
- Share your Slash card, dare a friend, copy links (native share sheet, clipboard fallback). Dare links open the same mission
- Weekly reminder as a calendar file (no notifications permission, no streaks)
- Pilot: "Send my answers to the slashkern team" sends answers and reflections as plain text
- English, Italian, German, French, Dutch and Swedish (`i18n.ts`, `i18n-de.ts`, `i18n-fr.ts`, `i18n-nl.ts`, `i18n-sv.ts`; `npm test` fails on a missing translation, a lost {blank} or link, the word "mission" or a job-world word in any of them). The app starts in the phone's language and Settings has a language menu, light only (the dark theme is retired, see "Look"), and a text size setting (four steps, every font size is in rem, `npm test` checks it)
- Installable and works offline after the first visit (`public/sw.js`; its cache is still named `kern-v30` on purpose, bump the number to drop old caches). Security headers and CSP in `netlify.toml`
- Export and delete your data from Settings. Privacy page at `/privacy/` (with a "What we keep" table at the top), Terms at `/terms/` and About at `/about/` (six languages), and a feedback button that opens your own mail app
- Design (v2): icons (`src/scripts/icons.ts`: the fields and the three tabs are glass pictures in `public/img/f/`, see `design/field-icons.md`; the done icon is a Phosphor Icon, MIT, with the body in the brand accent), bigger type, one calm confirmation after each mission (no points or random rewards). View Transitions slide the panes (plain swap where unsupported, nothing moves with reduced motion)
- Look (12 Oct, navy, light only): Geist for the interface. Page `#F5F7FF`, white surfaces, navy `#0E1B3D` for ink and for the dark blocks (welcome, Home card, Slash card, picture plates), muted `#5A6478`, lines `#C9D1E6`, one accent ultramarine `#2D4BFF` with white text on it; on navy blocks the accent is `#7C93FF` with navy text. The logo is the eyes pointer with no text in it (`public/brand/mark.svg`, `mark-rev.svg` on navy). `scripts/check-contrast.mjs` guards the pairs. Brand rules and sources: `design/brand/`

**Cut from the interface in v2** (the code is still there, hidden with the `k-cut` class, so each piece can come back): points and ranks, finds, badges, trail days, the habit builder, the review teaser, daily boosts and the random drops. The Trail section moved into Your page. The classic design before v1.0 is kept on the `classic-design` branch and the `v0.4-classic` tag.

## Not built yet

Real partner missions (brand missions are demos for now), peer review and ranking, push notifications, payments, premium missions with free windows, a live analytics dashboard (the numbers come from `npm run stats`).

## Structure

- `src/pages/index.astro` markup, `src/styles/app.css` styles, `src/scripts/app.ts` logic
- `src/scripts/cloud.ts` accounts and sync (loaded only when the Supabase variables are set), `supabase/schema.sql` database setup
- `src/scripts/i18n.ts` Italian strings (English is the source), `i18n-de.ts` / `i18n-fr.ts` / `i18n-nl.ts` / `i18n-sv.ts` German, French, Dutch and Swedish, `src/scripts/fields.ts` missions per field
- `src/scripts/trending.ts` the Trending shelf's 8 projects (German and French in `i18n-trending.ts`), `src/scripts/next.ts` rounds and the next-mission rule, `src/scripts/sponsors.ts` brand missions, `src/scripts/stats.ts` opt-in usage counts, `src/scripts/demo.ts` the demo profile's sample trail (texts in both languages)
- `scripts/` the tests run by `npm test`, and the Mission Studio
- `public/` manifest (with install screenshots in `public/screenshots/`), service worker, icons, favicons, `og.jpg` (link preview, the banner). `public/brand/` the logo (the eyes pointer in the header, on the launch screen, on the first screens and on the Slash card is `mark.svg`, `mark-rev.svg` on navy, set as `MARK` / `MARK_REV` in `index.astro` and drawn again in the share image; the icons and `favicon.svg` come from `design/brand/` (`gen_slash.py`)), `public/img/` (`mark.webp` is no longer used), `public/img/f/` the glass pictures (fields, tabs, the Slash card) and `public/img/m/` the mission photos

## License

© 2026 Manuel Di Paolo. All rights reserved. This code is not open source: see [LICENSE](LICENSE).
