// Guards Slash, the AI assistant's face (src/scripts/slash.ts): the drawing is the logo's geometry (body + eyes in one space), four moods, flat (no gradient, no filter),
// decorative (aria-hidden), it sits on every surface where the assistant speaks (the first-run panel, the project sheet, the Assistant tab, "Make a first version with AI") and nowhere else,
// it moves only when the person allows motion, and the introduction is in all six languages. Run: npm test
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildSync } from 'esbuild';

const { text } = buildSync({ stdin: { contents: "export * from './src/scripts/slash.ts'; export { DE } from './src/scripts/i18n-de.ts'; export { FR } from './src/scripts/i18n-fr.ts'; export { NL } from './src/scripts/i18n-nl.ts'; export { SV } from './src/scripts/i18n-sv.ts';", resolveDir: process.cwd(), loader: 'ts' }, bundle: true, format: 'esm', platform: 'node', write: false }).outputFiles[0];
const { slash, SLASH_BODY, SLASH_EYES, SLASH_VIEWBOX, DE, FR, NL, SV } = await import(`data:text/javascript;base64,${Buffer.from(text).toString('base64')}`);
const page = readFileSync('src/pages/index.astro', 'utf8'), app = readFileSync('src/scripts/app.ts', 'utf8'), css = readFileSync('src/styles/app.css', 'utf8');

// The geometry is the logo's: the body in public/brand/mark.svg is the body Slash wears, in the same viewBox, and the neutral eyes are the logo's eyes.
const mark = readFileSync('public/brand/mark.svg', 'utf8'), rev = readFileSync('public/brand/mark-rev.svg', 'utf8');
assert.equal(SLASH_VIEWBOX, '82 69 235 271', 'slash.ts: the viewBox of the logo mark');
assert.ok(mark.includes(`viewBox="${SLASH_VIEWBOX}"`) && mark.includes(`d="${SLASH_BODY}"`) && mark.includes(`d="${SLASH_EYES.neutral}"`), 'slash.ts: body and neutral eyes must be the ones in public/brand/mark.svg');
assert.ok(rev.includes(`d="${SLASH_BODY}"`) && /fill="#F5F2EA"/.test(rev) && /fill="#0E1B3D"/.test(rev), 'public/brand/mark-rev.svg: the same body, cream with navy eyes');
assert.ok(/fill="#0E1B3D"/.test(mark) && /fill="#DCE6FF"/.test(mark), 'public/brand/mark.svg: navy body, ice eyes');

// The drawing: four moods, the same body (a keyline copy under it), only the eyes change, aria-hidden, flat.
const MOODS = ['neutral', 'asking', 'thinking', 'happy'];
assert.deepEqual(Object.keys(SLASH_EYES).sort(), [...MOODS].sort(), 'slash.ts: exactly four moods');
assert.equal(new Set(MOODS.map((m) => SLASH_EYES[m])).size, 4, 'slash.ts: every mood has its own eyes');
for (const mood of MOODS) {
  const svg = slash(mood);
  assert.ok(svg.startsWith(`<svg class="k-slash k-slash-${mood}"`) && svg.includes(`viewBox="${SLASH_VIEWBOX}"`) && svg.includes('aria-hidden="true"') && svg.includes('focusable="false"'), `slash.ts: ${mood} must be a decorative (aria-hidden) svg of class k-slash`);
  assert.equal(svg.split(`d="${SLASH_BODY}"`).length - 1, 2, `slash.ts: ${mood} draws the body twice, the keyline under the body`);
  assert.ok(svg.includes('stroke:var(--slash-key') && svg.includes('stroke-width="16"') && svg.includes('stroke-linejoin="round"'), `slash.ts: ${mood} keyline is a 16-unit round-joined stroke in --slash-key`);
  assert.ok(svg.includes('fill:var(--slash-body') && svg.includes(`class="k-slash-e" d="${SLASH_EYES[mood]}" style="fill:var(--slash-eye`), `slash.ts: ${mood} body in --slash-body, its own eyes in --slash-eye`);
  assert.ok(!/Gradient|<filter|filter=|url\(#|<title/.test(svg), `slash.ts: ${mood} is flat: no gradient, no filter, no title (the words next to Slash say who speaks)`);
  assert.ok(!svg.includes('k-slash-speaking') && slash(mood, true).includes('k-slash-speaking'), 'slash.ts: speaking is a class, silent by default');
}
assert.ok(!/kKern|Gradient|<filter/.test(page), 'index.astro: the old gradient sprite is gone (Slash needs none)');

// The surfaces. Static: the Assistant tab's header. Built in app.ts: slashRow() is the one place that puts the face beside an assistant bubble.
assert.ok(/<div class="k-ait"><span class="k-slash-av k-slash-lg" aria-hidden="true" set:html=\{slash\('neutral', true\)\}/.test(page), 'index.astro: the Assistant tab header shows Slash, neutral and speaking, aria-hidden');
assert.equal((page.match(/\bslash\('/g) || []).length, 1, 'index.astro: Slash appears once in the markup (the Assistant tab header): he only shows where the assistant speaks');
assert.ok(/const slashRow = [\s\S]*?face\.innerHTML = slash\(mood, speaking\)/.test(app) && /import \{ slash, type Mood[^}]*\} from '\.\/slash'/.test(app), 'app.ts: slashRow() draws the avatar from slash.ts');
assert.equal((app.match(/\bslash\(/g) || []).length, 2, 'app.ts: the avatar is drawn in slashRow() and in the "Make a first version" panel (look()) only: one drawing, not pasted around');
assert.ok(!/\bkern\(|from '\.\/kern'|k-kern/.test(app + page + css), 'the old Kern avatar (kern.ts, .k-kern) is gone everywhere');
assert.equal((app.match(/\bwaitingRow\(\)/g) || []).length, 3, 'app.ts: the chat, the project sheet and the first-run panel wait with Slash (waitingRow)');
const intro = app.match(/const SLASH_INTRO = t2\((['"])(.*?)\1, (['"])(.*?)\3\)/);
assert.ok(intro, 'app.ts: no SLASH_INTRO = t2(english, italian)');
assert.ok(/chatEl\.appendChild\(slashRow\(intro\)\)/.test(app) && /intro\.textContent = tr\(SLASH_INTRO\)/.test(app), 'app.ts: the introduction is the first line of the Assistant chat');
assert.ok(/pauseRow\(tr\(HEAVY_REPLY\)\)/.test(app) && /slashRow\(p, 'neutral'\)/.test(app) && /m\.t === HEAVY_REPLY \? 'neutral' : 'asking'/.test(app), 'app.ts: the distress pause keeps a level (neutral) face in the chat, the sheet and the first run');
assert.ok(/look\('thinking', true\)/.test(app) && /look\(res\.kind === 'text' \? 'happy' : null\)/.test(app), 'app.ts: "Make a first version with AI": Slash thinks (and speaks) while the draft is requested, smiles when it arrives');
assert.ok(/wait\.setAttribute\('aria-live', 'polite'\)/.test(app) && /wait\.textContent = tr\(MK\.busy\)/.test(app), 'app.ts: the waiting is still said to a screen reader, in a live region');
assert.ok(app.includes("tr('Slash is typing')"), 'app.ts: the "Slash is typing" text stays for a screen reader');
assert.ok(/AI_TAG = 'Made with AI help'/.test(app) && /chip\.textContent = tr\(AI_TAG\)/.test(app), 'app.ts: the "Made with AI help" chip stays');
assert.ok(!/slash\(/.test(readFileSync('src/scripts/play.ts', 'utf8')) && !/slash\(/.test(readFileSync('src/scripts/icons.ts', 'utf8')), 'Slash is not a tab icon or a project picture');

// The introduction: the same sentences in every language, each says Slash, and each says the word for AI of its language.
const [, , en, , it] = intro, WANT = { en: 'Hi, I am Slash, your AI assistant. I ask the questions. I only draft if you ask.', it: 'Ciao, sono Slash, il tuo assistente AI. Faccio le domande. Preparo una bozza solo se me lo chiedi.',
  de: 'Hi, ich bin Slash, dein KI-Assistent. Ich stelle die Fragen. Einen Entwurf mache ich nur, wenn du danach fragst.', fr: 'Salut, moi c’est Slash, ton assistant IA. Je pose les questions. Je fais un brouillon seulement si tu me le demandes.',
  nl: 'Hoi, ik ben Slash, je AI-assistent. Ik stel de vragen. Ik maak alleen een opzet als je erom vraagt.', sv: 'Hej, jag är Slash, din AI-assistent. Jag ställer frågorna. Jag gör bara ett utkast om du ber om det.' };
const got = { en, it, de: DE[en], fr: FR[en], nl: NL[en], sv: SV[en] }, AI = { en: /\bAI\b/, it: /\bAI\b/, de: /\bKI\b/, fr: /\bIA\b/, nl: /\bAI\b/, sv: /\bAI\b/ };
for (const lang of ['en', 'it', 'de', 'fr', 'nl', 'sv']) {
  assert.equal(got[lang], WANT[lang], `the Slash introduction in ${lang} changed or is missing (app.ts SLASH_INTRO, i18n-de.ts, i18n-fr.ts, i18n-nl.ts, i18n-sv.ts)`);
  assert.ok(/\bSlash\b/.test(got[lang]) && AI[lang].test(got[lang]), `the Slash introduction in ${lang} must name Slash and say it is an AI`);
  assert.ok(!/lavor|friend|ami\b|amic|freund|love|amo\b|ti voglio|coach|[\u{1F300}-\u{1FAFF}☀-➿]/iu.test(got[lang]), `the Slash introduction in ${lang}: no friend, love, coach or emoji wording (Slash is an AI character, never a person or a companion)`);
}

// Motion only when the person allows it: outside the no-preference block Slash has no transition and no animation. No glow, gradient or filter in his rules either.
const at = css.indexOf("/* Slash, the AI assistant's face"), block = css.slice(at, css.indexOf('.k-slash-av {', at));
assert.ok(at > 0 && block.includes('@media (prefers-reduced-motion: no-preference) {'), 'app.css: the Slash rules and their motion block are missing');
const open = block.indexOf('@media (prefers-reduced-motion: no-preference) {');
let depth = 0, close = open;
for (let i = block.indexOf('{', open); i < block.length; i++) { if (block[i] === '{') depth++; else if (block[i] === '}' && --depth === 0) { close = i; break; } }
const still = block.slice(0, open) + block.slice(close + 1), moving = block.slice(open, close + 1);
assert.ok(!/animation|transition|@keyframes/.test(still), 'app.css: Slash moves only inside @media (prefers-reduced-motion: no-preference)');
assert.ok(/\.k-slash-speaking \.k-slash-all \{ animation:/.test(moving) && /\.k-slash-e \{ animation:/.test(moving) && /translateY/.test(moving) && /scaleY/.test(moving), 'app.css: speaking = a bob of the whole pointer and a blink of the eyes');
assert.ok(!/gradient|filter|drop-shadow|box-shadow|glow/i.test(block.replace(/\/\*[\s\S]*?\*\//g, '')), 'app.css: Slash is flat: no gradient, filter, shadow or glow');
assert.ok(/--slash-body: #0E1B3D; --slash-eye: #DCE6FF; --slash-key: #FFFFFF;/.test(still) && /--slash-key: #EEF2FF;/.test(still), 'app.css: navy body, ice eyes, white keyline (ice-white on navy)');
console.log('slash: ok (4 moods on the logo geometry, flat, aria-hidden, the assistant surfaces, the intro in 6 languages, motion only when allowed)');
