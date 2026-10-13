// Guards the design (v10, white-dominant): every font size scales with the text size setting (rem, never px), every field has an icon, the text size
// labels are translated, and there is no theme switch (light only). Run: npm test
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { buildSync } from 'esbuild';

import { readdirSync } from 'node:fs';
const css = readFileSync('src/styles/app.css', 'utf8') + readdirSync('src/styles').filter((f) => /^piece.*\.css$/.test(f)).map((f) => readFileSync(`src/styles/${f}`, 'utf8')).join('\n'); // the pages of the pieces live in piece.css and piece-<name>.css (shared with the share-link page)
// Settings draws the four "A" buttons in px on purpose (the row must not grow with the setting), and an input never goes under 16px (iOS zoom).
const PX_OK = [/\.k-txt button:nth-child\(\d\) \{ font-size: \d+px; \}/g, /font-size: max\(16px, [\d.]+rem\);/g];
let rest = css;
for (const re of PX_OK) rest = rest.replace(re, '');
const px = [...rest.matchAll(/font-size:\s*[\d.]+px|font:[^;{}]*?\d+(?:\.\d+)?px/g)].map((m) => m[0]);
assert.deepEqual(px, [], `app.css: font sizes must be rem so the text size setting scales them, found ${px.slice(0, 3).join(' | ')}`);
assert.match(css, /html \{ font-size: calc\(16px \* var\(--kts, 1\)\)/, 'app.css: the root font size must follow --kts');

const entry = ['fields', 'icons', 'i18n', 'fieldinfo', 'coop', 'coopask'].map((f) => `export * from './src/scripts/${f}.ts';`).join('\n');
const { text } = buildSync({ stdin: { contents: entry, resolveDir: process.cwd(), loader: 'ts' }, bundle: true, format: 'esm', platform: 'node', write: false }).outputFiles[0];
const { FIELDS, ICONS, FIELD_PICS, picFile, IT, FIELD_INFO, COOP_KEYS, ASK } = await import(`data:text/javascript;base64,${Buffer.from(text).toString('base64')}`);

for (const f of Object.keys(FIELDS)) assert.ok(FIELD_PICS.includes(f) && existsSync(`public/img/f/${f.toLowerCase()}.webp`), `icons.ts: field ${f} has no picture in public/img/f`);
for (const n of FIELD_PICS) assert.ok(existsSync(`public/img/f/${picFile(n)}.webp`), `icons.ts: ${n} has no picture in public/img/f`);
assert.ok(['missions', 'yourkern', 'copilot'].every((n) => FIELD_PICS.includes(n)), 'icons.ts: the three tabs are pictures');
for (const n of ['done']) assert.ok(ICONS[n], `icons.ts: no icon named ${n}`);
for (const [name, body] of Object.entries(ICONS)) {
  assert.equal((body.match(/</g) || []).length, (body.match(/>/g) || []).length, `icons.ts: ${name} has unbalanced tags`);
  assert.ok(name.endsWith('-on') || /class="(b[ps]?|gb|pd)"/.test(body), `icons.ts: ${name} has no accent (a bead or an accent body)`); // -on: the filled tab-bar versions, one solid shape
}
for (const k of ['Text size', 'Small', 'Default', 'Large', 'Larger', 'Done.', 'What to expect', 'A typical day', 'People like', 'People find hard', 'Try the next project', 'Take it further', 'Three steps outside the app', 'Ask', 'Make', 'Notice', 'Send feedback', 'Terms']) assert.ok(IT[k], `i18n.ts: no Italian for "${k}"`);

// What to expect + Take it further: every field has all of it, in both languages, and none of the words the brand never uses.
const BANNED = /lavor/i; // the same list as BANNED in netlify/functions/coach.mts (2026-10-11: only the Italian "lavor-" family stays banned, the job-world words are allowed now)
for (const f of Object.keys(FIELDS)) {
  const info = FIELD_INFO[f];
  assert.ok(info, `fieldinfo.ts: field ${f} has no info`);
  assert.ok(info.like.length === 2 && info.hard.length === 2, `fieldinfo.ts: ${f} needs 2 things people like and 2 they find hard`);
  const all = [info.day, ...info.like, ...info.hard, info.steps.ask, info.steps.make, info.steps.learn];
  for (const en of all) {
    assert.ok(IT[en] && IT[en] !== en, `fieldinfo.ts: ${f} has no Italian for "${en.slice(0, 50)}"`);
    assert.ok(!BANNED.test(en) && !BANNED.test(IT[en]), `fieldinfo.ts: ${f} uses a banned word in "${en.slice(0, 50)}"`);
  }
}


const page = readFileSync('src/pages/index.astro', 'utf8');
const ids = [...page.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
assert.deepEqual(ids.filter((id, i) => ids.indexOf(id) !== i), [], 'index.astro: every id must be unique ($() in app.ts takes the first one)');
assert.equal((page.match(/data-k-text="\d"/g) || []).length, 4, 'index.astro: Settings needs four text size steps');
assert.equal((page.match(/data-k-theme="/g) || []).length, 0, 'index.astro: no theme switch any more, the app is light only');
// Light only (v10, white-dominant): the head and the init script set the white bar colour, and app.ts forces the theme to light however old a save is.
assert.match(page, /<meta name="theme-color" content="#F5F7FF"/, 'index.astro: theme-color is the page colour #F5F7FF');
const themeInit = readFileSync('public/theme-init.js', 'utf8');
assert.ok(/classList\.add\('light'\)/.test(themeInit) && themeInit.includes('#F5F7FF') && !/dark/i.test(themeInit.replace(/\/\/.*$/gm, '')), 'theme-init.js: always light, bar colour #F5F7FF');
const appSrc = readFileSync('src/scripts/app.ts', 'utf8');
assert.ok(/theme: 'light',/.test(appSrc) && !/data-k-theme|\.kTheme|'dark'/.test(appSrc) && appSrc.includes("setAttribute('content', '#F5F7FF')"), "app.ts: S.theme is always 'light' (sanitize, fresh, demo), nothing reads a dark choice, the bar is the page colour");
// The mark is the slashkern pointer (public/brand): navy on light grounds (MARK), reversed cream on the navy blocks (MARK_REV), the name "slashkern" beside it; the old slit disc and its sprite are gone.
const markSvg = readFileSync('public/brand/mark.svg', 'utf8'), body = markSvg.match(/<path d="([^"]+)" fill="#0E1B3D"/)?.[1];
assert.ok(body && readFileSync('public/brand/mark-rev.svg', 'utf8').includes(body), 'public/brand: mark.svg (navy body) and mark-rev.svg (the same body, reversed)');
assert.ok(page.includes(`const MARK = '<img class="k-lg" src="/brand/mark.svg"`) && page.includes(`const MARK_REV = '<img class="k-lg" src="/brand/mark-rev.svg"`), 'index.astro: MARK and MARK_REV are the two brand images');
assert.ok(/<div class="k-logo"><span class="k-lgw" set:html=\{MARK\} \/><span>slashke<span class="k-rn">r<\/span>n<\/span><\/div>/.test(page), 'index.astro: the header is the mark and "slashkern" (r and n spaced)');
assert.ok(/class="k-fs k-f0"[^]*?set:html=\{MARK_REV\}/.test(page) && /class="k-kt"><span class="k-lgw" set:html=\{MARK_REV\}/.test(page), 'index.astro: the navy welcome screen and the kerncard show the reversed mark');
assert.ok(!page.includes('M7 29A25 25 0 0 1 57 29Z') && !/>\s*kern\s*</.test(page) && !/kern<i>\.<\/i>/.test(page) && !page.includes('mark.webp'), 'index.astro: no slit disc, no "kern" wordmark left');
assert.match(readFileSync('public/manifest.webmanifest', 'utf8'), /"name": "slashkern",\s*"short_name": "slashkern"[\s\S]*"background_color": "#0E1B3D"[\s\S]*"theme_color": "#0E1B3D"/, 'manifest: slashkern, navy background and theme colour');
assert.match(readFileSync('public/sw.js', 'utf8'), /CACHE = 'kern-v34'/, 'sw.js: bump CACHE with every visual change');
// The icons: the favicon is the pointer on ultramarine, and favicon.ico carries favicon-32.png.
assert.ok(readFileSync('public/favicon.svg', 'utf8').includes(body) && readFileSync('public/favicon.svg', 'utf8').includes('#0050F0'), 'favicon.svg: the slashkern pointer on the electric blue icon tile');
{ const ico = readFileSync('public/favicon.ico'), png = readFileSync('public/icons/favicon-32.png'); assert.ok(ico.readUInt16LE(2) === 1 && ico.subarray(ico.length - png.length).equals(png), 'favicon.ico embeds public/icons/favicon-32.png'); }
assert.equal((page.match(/data-k-tab="/g) || []).length, 3, 'index.astro: three sections');
// v10: the tabs are Projects, Your page and Assistant (the ids and data-k-tab values stay), and the first run is four screens with no tab bar behind them.
for (const [tab, label] of [['missions', 'Projects'], ['yourkern', 'Your page'], ['copilot', 'Slash']]) assert.match(page, new RegExp(`data-k-tab="${tab}"[^]*?<span class="tn tt">${label}</span>`), `index.astro: the ${tab} tab reads ${label}`);
for (const id of ['kFirst', 'kF0', 'kF1', 'kF2', 'kF3', 'kF0Go', 'kF1Go', 'kF2Next', 'kF2Ask', 'kF3Go', 'kFirstAge']) assert.ok(page.includes(`id="${id}"`), `index.astro: first run needs #${id}`);
for (const text of ['Make something companies can hire you for.', 'Pick one to try', 'Free practice projects.', 'Saved to your page', 'See my page', 'How companies will find you', 'When companies post briefs, you can apply. The company chooses who gets the project and pays them.', 'Nobody is paying yet: this is early access.']) assert.ok(page.includes(text), `index.astro: missing "${text}"`);
assert.ok(!/>\s*Learn\s*</.test(page) && !/\bLearn\b/.test(readFileSync('src/scripts/fieldinfo.ts', 'utf8').replace(/learn:/g, '')), 'no "Learn" promise on screen');
// No money anywhere in the app (a brief pays one or a few creators, so a price on every project would suggest everyone earns it, and nobody is paying yet): no amount, no currency, no "paid".
const moneySrc = ['src/pages/index.astro', 'src/scripts/projects.ts', 'src/scripts/app.ts', 'public/manifest.webmanifest'].map((f) => [f, readFileSync(f, 'utf8')]);
for (const [f, src] of moneySrc) {
  assert.ok(!/EUR\b|€|\$\{eur\}|\bprice chip|examplePrice|exampleEur/.test(src.replace(/\/\/.*$/gm, '')), `${f}: no amount or price chip may come back`);
  assert.ok(!/\b[Pp]aid\b/.test(src.replace(/\/\/.*$/gm, '').replace(/getting paid/g, '')), `${f}: no "paid" wording (nobody is paying yet)`);
}
// Co-op: the friend's task exists for exactly the 12 co-op missions, in both languages, and the strings around it are translated.
assert.deepEqual(Object.keys(ASK).sort(), [...COOP_KEYS].sort(), 'coopask.ts: one line for each co-op mission');
for (const [k, en] of Object.entries(ASK)) { assert.ok(IT[en] && IT[en] !== en, `coopask.ts: no Italian for ${k}`); assert.ok(!BANNED.test(en) && !BANNED.test(IT[en]), `coopask.ts: banned word in ${k}`); }
for (const k of ['Co-op project: answer it, then send it to a friend to finish together.', 'Finish it with a friend', 'The link carries your answer, so it is only as private as the chat you send it to.', 'Your part', 'Your reply', 'Send back', 'Do the project yourself', 'Co-op with a friend', '{n} wants your take on “{m}”: {ask} Open the link, it takes a minute.', '{n} answered “{m}”. Open the link to read it.', 'Link copied. Send it to your friend.', 'Link copied. Send it back to your friend.', 'Send to a friend', 'Send again', 'Not sent yet', 'Sent. Waiting for a reply.', 'You', 'Tips from people before you', 'Leave a tip for the next person (optional)', 'Tips you left']) assert.ok(IT[k], `i18n.ts: no Italian for "${k}"`);
for (const id of ['kCoop', 'kCoops', 'kDrCoop', 'kCoopHint', 'kCoSend']) assert.ok(page.includes(`id="${id}"`), `index.astro: missing #${id}`);
for (const id of ['kFld', 'kAbout', 'kFurther', 'kFeed', 'kMicS', 'kMicOk', 'kMicNo', 'kMakeD', 'kMakeF']) assert.ok(page.includes(`id="${id}"`), `index.astro: missing #${id}`);
// Voice and the AI first version: the microphone and Listen are feature-detected (no hands-free mode), the AI mark is a literal true that is never hidden, and the privacy sheet says where the voice goes.
const voiceSrc = readFileSync('src/scripts/voice.ts', 'utf8'), appTs = readFileSync('src/scripts/app.ts', 'utf8');
assert.ok(/SpeechRecognition/.test(voiceSrc) && /webkitSpeechRecognition/.test(voiceSrc) && /speechSynthesis/.test(voiceSrc) && /interimResults = true/.test(voiceSrc) && !/continuous = true/.test(voiceSrc), 'voice.ts: feature-detected dictation with interim results, one utterance at a time');
assert.ok(['en-GB', 'it-IT', 'de-DE', 'fr-FR', 'nl-NL', 'sv-SE'].every((t) => voiceSrc.includes(`'${t}'`)), 'voice.ts: a language tag for each app language');
assert.ok(/ai: cleanAi\(a\.ai\)/.test(appTs) && /a\.ai = true/.test(appTs) && /tr\(AI_TAG\)/.test(appTs), 'app.ts: the AI mark is kept, saved and shown');
assert.ok(page.includes('slashkern never records or stores audio.'), 'index.astro: the voice privacy sheet'); const privacy = readFileSync('src/pages/privacy.astro', 'utf8'); for (const t of ['Voice and the first version with AI', 'Voce e prima versione con l’AI', 'Stimme und die erste Version mit KI', 'La voix et la première version avec l’IA']) assert.ok(privacy.includes(t), `privacy.astro: missing "${t}"`);
assert.ok(existsSync('src/pages/terms.astro'), 'terms.astro: the Terms page is missing');
// Mission pictures: every img / imgIt path in missions.ts must be a file in public/.
// A mission opens full screen with a bar of three segments (read, answer, reflect) that app.ts keeps up to date and CSS fills.
assert.equal((page.match(/<div class="k-prog" id="kProg"[^>]*role="progressbar"[^>]*>((?:<i><b><\/b><\/i>){3})<\/div>/g) || []).length, 1, 'index.astro: the mission needs one progress bar with three segments');
assert.ok(/id="kShClose"/.test(page) && /function renderProg\(\)/.test(readFileSync('src/scripts/app.ts', 'utf8')), 'the full-screen mission needs its close button and renderProg()');
const pics = [...readFileSync('src/scripts/missions.ts', 'utf8').matchAll(/\bimg(?:It)?: '(\/img\/m\/[^']+)'/g)].map((m) => m[1]);
assert.ok(pics.length >= 9, `missions.ts: expected the mission pictures, found ${pics.length}`);
for (const p of pics) assert.ok(existsSync(`public${p}`), `missions.ts: picture ${p} is not in public/`);
// Pieces (src/scripts/pieces.ts): the card on Projects, the full-screen steps and the finished page, and the list on Your page exist; the steps layer makes the page behind it inert like every other layer; app.ts saves, cleans and syncs the runs.
for (const id of ['kBuild', 'kBBack', 'kBNum', 'kBS', 'kBProg', 'kBQ', 'kBO', 'kBTa', 'kBNext', 'kBAsk', 'kBC', 'kBR', 'kBRH', 'kBPiece', 'kBName', 'kBNameL', 'kBSave', 'kBFile', 'kBRun', 'kBLink', 'kBLinkN', 'kBDone', 'kBHow', 'kPiece', 'kPcGo', 'kPcMore', 'kPieces', 'kPieceL']) assert.ok(page.includes(`id="${id}"`), `index.astro: pieces need #${id}`);
assert.ok(/'kSheet', 'kBuild', 'kFirst'/.test(appSrc), 'app.ts: the pieces layer (kBuild) is one of LAYERS, so the page behind it is inert');
assert.ok(/builds: cleanRuns\(s\.builds\)/.test(appSrc) && /mergeAnswers\(S\.builds, r\.builds, S\.gone, r\.gone\)/.test(appSrc) && /initPieces\(\{\s*S,/.test(appSrc), 'app.ts: runs are cleaned on load, merged on sync and the screens wired');
const sharePage = readFileSync('src/pages/p.astro', 'utf8');
assert.ok(['pubSheet', 'pubHow', 'pubHowB', 'pubNote', 'pubCta'].every((id) => sharePage.includes(`id="${id}"`)) && /name="robots" content="noindex"/.test(sharePage) && sharePage.includes("import '../scripts/public-page'"), 'p.astro: the share-link page needs its parts, noindex and its script');
// Older phones: the app must start on iOS Safari 15 (no Object.hasOwn, structuredClone, toSorted, findLast, Object.groupBy before 15.4-17), or it stops on the launch screen.
for (const f of ['src/scripts/app.ts', 'src/scripts/play.ts', 'src/scripts/voice.ts', 'src/scripts/make.ts', 'src/scripts/pieces.ts', 'src/scripts/pieces-ui.ts', 'src/scripts/public-page.ts', ...readdirSync('src/scripts').filter((n) => /^piece-.*\.ts$/.test(n)).map((n) => `src/scripts/${n}`)]) {
  const old = readFileSync(f, 'utf8').match(/Object\.hasOwn\(|structuredClone\(|\.toSorted\(|\.toReversed\(|\.findLast(Index)?\(|Object\.groupBy\(|Promise\.withResolvers\(/g);
  assert.ok(!old, `${f} uses ${old} which older iPhones do not have: use an older equivalent`);
}
console.log('design: ok (rem text, icons for every field, 4 text sizes, light only, 3 sections)');
