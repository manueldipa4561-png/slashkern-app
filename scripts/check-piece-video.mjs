// Checks the Video piece, the storyboard for Rocco's sandwich van (src/scripts/piece-video.ts): the text of every frame reads on its colour, the clip adds up to 15 seconds, the page reads its words from
// the run in the right order whatever the hook, the shots and the sound, every sketch is a well-formed path, and every text has its Italian, German, French, Dutch and Swedish. The generic checks of every
// piece are in scripts/check-pieces.mjs; the drawings (page and picture) are looked at in the browser. Run: npm test
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildSync } from 'esbuild';

const entry = ['piece-video', 'piece-types', 'i18n', 'i18n-de', 'i18n-fr', 'i18n-nl', 'i18n-sv'].map((f) => `export * from './src/scripts/${f}.ts';`).join('\n');
const { text } = buildSync({ stdin: { contents: entry, resolveDir: process.cwd(), loader: 'ts' }, bundle: true, format: 'esm', platform: 'node', write: false, logLevel: 'silent' }).outputFiles[0];
const { piece, view, FRAMES, SPANS, OVER, ROCCO, SK, SPEAKER, MUTED, L, contrast, wordsIn, PAPER, PIECE_AT, IT, DE, FR, NL, SV } = await import(`data:text/javascript;base64,${Buffer.from(text).toString('base64')}`);
const [hook, shots, words, sound, caption] = piece.steps;

// The steps are what view() reads: the hook, three shots, the words on screen, the sound, the caption.
assert.deepEqual([hook, shots, sound].map((st) => [st.kind, st.n]), [['pick', 1], ['pick', 3], ['pick', 1]]);
assert.ok(words.kind === 'text' && caption.kind === 'text' && piece.steps.length === 5);
assert.equal(shots.n, FRAMES.length - 1, 'one shot for every frame after the hook');
assert.ok(piece.steps.filter((st) => st.kind === 'text').length <= 3 && words.max <= 60 && caption.max <= 160, 'few typed lines, short ones (the caption is allowed 100)');
assert.ok(words.words <= 6 && caption.words <= 16 && caption.lines === 2);

// The clip: a 2 s hook and three shots, 15 s in all, with no gap.
assert.equal(SPANS.length, FRAMES.length);
SPANS.forEach(([a, b], k) => { assert.ok(b > a, `frame ${k + 1} lasts no time`); assert.equal(a, k ? SPANS[k - 1][1] : 0, `frame ${k + 1} does not start where the one before ends`); });
assert.equal(SPANS[SPANS.length - 1][1], 15);

// Colours: small text needs 4.5:1, a sketch (decoration) and a shape that must stand out need 3:1.
const SMALL = 4.5, SHAPE = 3, ok = (a, b, min, what) => assert.ok(contrast(a, b) >= min, `${what}: ${a} on ${b} is ${contrast(a, b).toFixed(2)}, wants ${min}`);
FRAMES.forEach((f, k) => { ok(f.on, f.bg, SMALL, `frame ${k + 1} text`); ok(f.line, f.bg, SHAPE, `frame ${k + 1} sketch`); });
assert.deepEqual(FRAMES.map((f) => f.bg).sort(), Object.values(ROCCO).sort(), 'the four frames are Rocco’s four colours, once each');
ok(OVER.on, OVER.bg, SMALL, 'the words on screen'); ok(OVER.bg, FRAMES[FRAMES.length - 1].bg, SHAPE, 'the bar on the last frame');
ok(ROCCO.navy, PAPER, SMALL, 'the page text'); ok(PAPER, ROCCO.navy, SMALL, 'the sound chip text'); ok(OVER.bg, ROCCO.navy, SHAPE, 'the speaker on the chip'); ok(ROCCO.tomato, PAPER, SHAPE, 'the accent rule');

// The page reads its words from the run, in order, for every hook, every ordered triple of shots and every sound. The typed lines come through untouched, the labels go through the translator.
const labelOf = (st, id) => st.opts.find((x) => x.id === id).label, idsOf = (st) => st.opts.map((x) => x.id);
const run = (s) => ({ f: piece.f, i: PIECE_AT + piece.n, at: 1760000000000, s, done: 1760000600000 });
const typed = ['Lunch, but make it loud', 'Rocco’s toastie, 15 seconds, zero patience.'], tr = (s) => `[${s}]`;
let combos = 0;
for (const h of idsOf(hook)) for (const a of idsOf(shots)) for (const b of idsOf(shots)) for (const c of idsOf(shots)) {
  if (a === b || b === c || a === c) continue;
  for (const so of idsOf(sound)) {
    combos++;
    const ids = [h, a, b, c], v = view(run([h, [a, b, c].join(','), typed[0], so, typed[1]]), tr);
    assert.deepEqual(v.frames.map((f) => f.text), ids.map((id, k) => tr(labelOf(k ? shots : hook, id))), `${ids}: the frames show the picks in order`);
    assert.deepEqual(v.frames.map((f) => f.time), ['0–2 s', '2–6 s', '6–11 s', '11–15 s']);
    assert.ok(v.frames.every((f, k) => f.sk === SK[ids[k]] && f.bg === FRAMES[k].bg && f.on === FRAMES[k].on && f.line === FRAMES[k].line), `${ids}: each frame has its sketch and its colours`);
    assert.equal(v.sound, tr(labelOf(sound, so))); assert.equal(v.muted, so === 'quiet', 'only silence gets the muted speaker');
    assert.equal(v.words, typed[0]); assert.equal(v.caption, typed[1]); assert.equal(v.name, tr(piece.client));
  }
}
assert.equal(combos, idsOf(hook).length * 120 * idsOf(sound).length, 'every combination was tried');
assert.equal(view(run([hook.opts[0].id]), tr), null);

// Sketches: one for every hook and shot, none left over, each a well-formed SVG path (every command has the right number of numbers, arc flags are 0 or 1).
assert.deepEqual(Object.keys(SK).sort(), [...idsOf(hook), ...idsOf(shots)].sort(), 'a sketch for every hook and shot, and no other');
const ARITY = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7, Z: 0 };
const wellFormed = (d, at) => {
  assert.ok(/^M/.test(d) && /^[MmLlHhVvCcSsQqTtAaZz\d\s.,-]+$/.test(d), `${at}: a path starts with M and holds only path characters`);
  for (const m of d.matchAll(/([A-Za-z])([^A-Za-z]*)/g)) {
    const n = (m[2].match(/-?(?:\d+\.?\d*|\.\d+)/g) ?? []).map(Number), k = ARITY[m[1].toUpperCase()];
    assert.ok(k === 0 ? n.length === 0 : n.length > 0 && n.length % k === 0, `${at}: "${m[1]}" has ${n.length} numbers, wants a multiple of ${k}`);
    if (m[1].toUpperCase() === 'A') for (let i = 0; i < n.length; i += 7) assert.ok([n[i + 3], n[i + 4]].every((f) => f === 0 || f === 1), `${at}: an arc flag is 0 or 1`);
  }
};
for (const [id, g] of Object.entries({ ...SK, speaker: SPEAKER, muted: MUTED })) { wellFormed(g.s, `${id} strokes`); if (g.f) wellFormed(g.f, `${id} shapes`); }

// Every text a person reads, in every language: it exists, keeps its {blanks}, has no exclamation mark, no emoji and no banned word; the examples fit the line they show for.
const strings = (v) => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : []);
const texts = [...new Set(strings([piece.title, piece.blurb, piece.who, piece.brief, piece.client, piece.steps.map((st) => [st.q, st.hint, st.ph, st.opts?.map((x) => x.label)]), L]))];
const blanks = (t) => [...t.matchAll(/\{\w+\}/g)].map((m) => m[0]).sort().join(' '), len = (t) => [...t].length, LANGS = { Italian: IT, German: DE, French: FR, Dutch: NL, Swedish: SV };
const BANNED = /lavor|\bmissions?\b|\bmissie|\bMission(?:en)?\b|uppdrag|no experience|\bearn|\bpaid\b|\bincome\b|[€$]/i;
for (const s of texts) {
  assert.ok(!/!/.test(s) && !/\p{Extended_Pictographic}/u.test(s) && !BANNED.test(s), `English: a banned thing in "${s.slice(0, 50)}"`);
  for (const [name, T] of Object.entries(LANGS)) {
    const t = T[s], at = `${name}: "${s.slice(0, 50)}"`;
    assert.ok(t, `${at} has no translation`); assert.equal(blanks(t), blanks(s), `${at} lost or added a {blank}`);
    assert.ok(!/!/.test(t) && !/\p{Extended_Pictographic}/u.test(t) && !BANNED.test(t), `${at}: a banned thing in the translation`);
    if (name === 'Italian') assert.ok(!/\p{L}'\p{L}/u.test(t), `${at}: a straight apostrophe in Italian, write ’`);
    if (name !== 'Italian' && s.length >= 25) assert.notEqual(t, s, `${at} is still English`);
  }
}
for (const [name, T] of Object.entries(LANGS)) {
  for (const st of piece.steps) assert.ok(len(T[st.q]) <= 80 && len(T[st.hint]) <= 100, `${name}: a question or a hint is too long for its screen ("${T[st.q].slice(0, 40)}")`);
  for (const st of [words, caption]) assert.ok(len(T[st.ph]) <= st.max && wordsIn(T[st.ph]) <= st.words, `${name}: the example "${T[st.ph]}" does not fit its own line (${st.max} characters, ${st.words} words)`);
}
for (const st of piece.steps) { assert.ok(len(st.q) <= 70 && len(st.hint) <= 90, `a question is at most 70 characters and a hint 90: "${st.q}"`); for (const x of st.opts ?? []) assert.ok(len(x.label) <= 36, `an option is at most 36 characters: "${x.label}"`); }

// The source: typed words go in as text (never as markup); the styles keep to this piece's own classes (k-pc is only the page they sit in) and to sizes the text-size setting can scale (rem, 0.75rem at least).
const src = readFileSync('src/scripts/piece-video.ts', 'utf8').replace(/\/\/.*$/gm, ''), css = readFileSync('src/styles/piece-video.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
assert.ok(!/innerHTML|outerHTML|insertAdjacentHTML|document\.write/.test(src), 'piece-video.ts: what a person typed must go in with textContent');
const classes = [...css.replace(/\{[^}]*\}/g, ' ').matchAll(/\.([\w-]+)/g)].map((m) => m[1]);
assert.ok(classes.length > 10 && classes.every((c) => c === 'k-pc' || c.startsWith('k-pc-video-')), `piece-video.css: every class starts with k-pc-video-, found ${classes.filter((c) => c !== 'k-pc' && !c.startsWith('k-pc-video-'))}`);
const sizes = [...css.matchAll(/font(?:-size)?:\s*([^;}]*)/g)].map((m) => m[1]);
assert.ok(sizes.every((v) => !/\d\s*px/.test(v)), 'piece-video.css: font sizes in rem, never px');
assert.ok(sizes.every((v) => { const r = v.match(/(\d*\.?\d+)rem/); return !r || Number(r[1]) >= 0.75; }), 'piece-video.css: text is at least 0.75rem');
console.log(`piece video: ok (${combos} hook, shot and sound combinations, ${Object.keys(SK).length} sketches, ${texts.length} texts in 5 languages)`);
