// Checks the Music piece, the release card for Clank Gym (src/scripts/piece-music.ts): its five steps, that the cover reads on every colour and every shape (shape and letters keep their contrast,
// the letters stay inside the shape even for the widest names), that the card reads on its navy, and that the page reads its words from the run. The generic checks of every piece are in
// scripts/check-pieces.mjs, the screens and drawings are looked at in the browser. Run: npm test
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildSync } from 'esbuild';

const entry = ['piece-music', 'piece-types', 'i18n', 'i18n-piece-music', 'i18n-de', 'i18n-fr', 'i18n-nl', 'i18n-sv'].map((f) => `export * from './src/scripts/${f}.ts';`).join('\n');
const { text } = buildSync({ stdin: { contents: entry, resolveDir: process.cwd(), loader: 'ts' }, bundle: true, format: 'esm', platform: 'node', write: false, logLevel: 'silent' }).outputFiles[0];
const { piece, view, monoOf, hitsOf, readOut, FIT, fitOf, letterSize, NAVY, BONE, DIM, SHAPES, readable, contrast, IT, MUSIC_DE, MUSIC_FR, MUSIC_NL, MUSIC_SV, DE, FR, NL, SV, PIECE_AT } = await import(`data:text/javascript;base64,${Buffer.from(text).toString('base64')}`);
const source = readFileSync('src/scripts/piece-music.ts', 'utf8'), css = readFileSync('src/styles/piece-music.css', 'utf8');

// The piece: Clank Gym, five steps (a beat, a mood, the name of the track, the colour and the shape of its cover), and the letters of the cover come from the name.
assert.deepEqual([piece.id, piece.n, piece.f, piece.client, piece.monoFrom, piece.mins], ['music-release', 5, 'Music', 'Clank Gym', 2, 10]);
assert.deepEqual(piece.steps.map((st) => st.kind), ['beat', 'pick', 'text', 'pick', 'pick']);
const [, mood, name, colour, shape] = piece.steps;
assert.equal(piece.steps[piece.monoFrom].kind, 'text', 'monoFrom is the track name');
assert.deepEqual([mood.n, mood.look, mood.opts.length], [1, 'chip', 6]);
assert.deepEqual([colour.n, colour.look, colour.opts.length], [1, 'swatch', 6]);
assert.deepEqual([shape.n, shape.look, shape.opts.map((x) => x.id)], [1, 'shape', SHAPES.map((x) => x.id)]);
assert.deepEqual([name.max, name.words], [24, 4]);
assert.ok(piece.who.startsWith('Practice project · Clank Gym'));
// Lengths, in English and in every language that has the text: a question up to 70, a hint up to 90 (the others may run longer, they wrap), an option up to 36 and a chip up to 14.
const OWN = { DE: MUSIC_DE, FR: MUSIC_FR, NL: MUSIC_NL, SV: MUSIC_SV }, OTHERS = { DE, FR, NL, SV }, LANGS = { IT, ...OTHERS }; // OWN: what i18n-piece-music.ts holds; OTHERS: every text the app has (it adds OWN)
piece.steps.forEach((st, i) => {
  assert.ok(st.q.length <= 70 && st.hint.length <= 90, `step ${i + 1}: question ${st.q.length} / hint ${st.hint.length} characters`);
  for (const x of st.opts ?? []) {
    if (st.look === 'shape') continue; // the shapes are shared (piece-types.ts)
    for (const [lang, L] of [['EN', null], ...Object.entries(LANGS)]) { const label = L ? L[x.label] : x.label; assert.ok(label, `${lang}: no text for "${x.label}"`); assert.ok(label.length <= (st.look === 'chip' ? 14 : 36), `${lang}: "${label}" is too long for ${st.look}`); }
  }
});

// Colours. The cover is the picked colour with the shape in near-black or paper (whichever reads better) and the letters cut out of it in the cover colour: the same ratio both ways, text-sized
// (4.5:1). The cover colour also fills the squares and the Play button on the navy card, with their own text, so it must stand out from the navy (3:1). The card's own colours read on the navy.
assert.equal(new Set(colour.opts.map((x) => x.hex)).size, 6, 'six different covers');
for (const x of colour.opts) {
  const at = `${x.id} ${x.hex}`, ink = readable(x.hex);
  assert.ok(contrast(ink, x.hex) >= 4.5, `${at}: shape and letters on the cover are ${contrast(ink, x.hex).toFixed(2)}:1`);
  assert.ok(contrast(x.hex, NAVY) >= 3, `${at}: the cover, the squares and the Play button on the navy card are ${contrast(x.hex, NAVY).toFixed(2)}:1`);
}
assert.ok(contrast(BONE, NAVY) >= 7 && contrast(DIM, NAVY) >= 4.5, 'the card text (and the pressed Play button, navy on paper) and the muted labels read on the navy');

// The letters stay inside the shape. A shape's outline is read from its path (the six shapes use M L H V v C c a Z, and arcs that are half circles; anything else throws, so a new shape
// gets looked at). The letters are a box of the widest realistic names (WW is 2.07 em in Geist 800, "ÆM" and "@W" about 2) at the size piece-music picks, standing where it puts them.
const polygon = (d) => {
  const toks = d.match(/[MmLlHhVvCcAaZz]|-?\d+(?:\.\d+)?/g), pts = [];
  let i = 0, cmd = '', x = 0, y = 0;
  const num = () => parseFloat(toks[i++]), to = (px, py) => { x = px; y = py; pts.push([x, y]); };
  while (i < toks.length) {
    if (/[A-Za-z]/.test(toks[i])) cmd = toks[i++];
    if (cmd === 'Z' || cmd === 'z') break;
    if (cmd === 'M') { to(num(), num()); cmd = 'L'; } // a pair after M is a line
    else if (cmd === 'L') to(num(), num());
    else if (cmd === 'H') to(num(), y);
    else if (cmd === 'V') to(x, num());
    else if (cmd === 'v') to(x, y + num());
    else if (cmd === 'C' || cmd === 'c') {
      const [x0, y0] = [x, y], p = Array.from({ length: 6 }, (_, k) => num() + (cmd === 'c' ? (k % 2 ? y0 : x0) : 0));
      for (let t = 0.05; t <= 1.0001; t += 0.05) { const u = 1 - t, b = [u ** 3, 3 * u * u * t, 3 * u * t * t, t ** 3]; to(b[0] * x0 + b[1] * p[0] + b[2] * p[2] + b[3] * p[4], b[0] * y0 + b[1] * p[1] + b[2] * p[3] + b[3] * p[5]); }
    } else if (cmd === 'a') {
      const [r, , , , sweep, dx, dy] = Array.from({ length: 7 }, num), [x0, y0] = [x, y], [cx, cy] = [x0 + dx / 2, y0 + dy / 2], a0 = Math.atan2(y0 - cy, x0 - cx);
      assert.ok(Math.abs(Math.hypot(dx, dy) - 2 * r) < 1e-6, 'arcs in the shapes are half circles');
      for (let t = 0.05; t <= 1.0001; t += 0.05) to(cx + r * Math.cos(a0 + (sweep ? 1 : -1) * Math.PI * t), cy + r * Math.sin(a0 + (sweep ? 1 : -1) * Math.PI * t));
    } else assert.fail(`the shape path uses "${cmd}", which this check cannot read: teach it to polygon() and look at the shape in piece-music.ts`);
  }
  return pts;
};
const inside = (pts, px, py) => { let c = false; for (let a = 0, b = pts.length - 1; a < pts.length; b = a++) if ((pts[a][1] > py) !== (pts[b][1] > py) && px < ((pts[b][0] - pts[a][0]) * (py - pts[a][1])) / (pts[b][1] - pts[a][1]) + pts[a][0]) c = !c; return c; };
for (const sh of SHAPES) {
  const pts = polygon(sh.d), { dy } = fitOf(sh.id);
  assert.ok(pts.length >= 6, `${sh.id}: outline read`);
  assert.ok(FIT[sh.id], `${sh.id}: piece-types.ts needs a letter fit (FIT) for this shape`);
  for (const em of [0.3, 0.6, 1, 1.5, 1.94, 2.07, 2.5]) {
    const size = letterSize(sh.id, em), w = size * em, top = 50 + dy - 0.37 * size, bottom = 50 + dy + 0.35 * size;
    assert.ok(size >= 14 && size <= 34, `${sh.id}: letters of ${em} em get size ${size}`);
    if (em <= 1) assert.equal(size, 34, `${sh.id}: narrow letters keep the full size`);
    for (let k = 0; k <= 24; k++) for (const py of [top, (top + bottom) / 2, bottom]) assert.ok(inside(pts, 50 - w / 2 + (w * k) / 24, py), `${sh.id}: letters of ${em} em (size ${size}) leave the shape at y ${py.toFixed(1)}`);
    for (let k = 0; k <= 8; k++) for (const px of [50 - w / 2, 50 + w / 2]) assert.ok(inside(pts, px, top + ((bottom - top) * k) / 8), `${sh.id}: letters of ${em} em (size ${size}) leave the shape at x ${px.toFixed(1)}`);
  }
  assert.equal(letterSize(sh.id, 0), 34, 'no width yet: full size');
}
assert.ok(letterSize('not-a-shape', 1.9) <= letterSize('leaf', 1.9) + 1, 'an unknown shape is treated like the narrowest');

// The letters: the first letters of the name; an emoji or a symbol is skipped (and never cut in half).
for (const [n, want] of [['Iron Sunday', 'IS'], ['iron', 'I'], ['a b c', 'AB'], ['  Gym   Bag ', 'GB'], ['A 🔥 beat', 'AB'], ['🔥 beat', 'B'], ['🔥🔥', 'CG'], ['\uD83D', 'CG'], ['Éclair noir', 'ÉN'], ['日本 語', '日語']]) assert.equal(monoOf(n), want, `letters of "${n}"`);
for (const n of ['x 🔥', '🔥🔥', 'a\uD83D', '𝔘 𝔘', '日本 語']) assert.ok(!/[\uD800-\uDFFF]/u.test(monoOf(n)) && monoOf(n), `no lone half of an emoji in the letters of "${n}"`);

// The page reads its words from the run, through the translator, and is empty until every step is answered.
const answers = ['100010001000100010001000', 'heavy', 'Iron Sunday', 'pink', 'burst'], run = { f: piece.f, i: PIECE_AT + piece.n, at: 1760000000000, s: answers, done: 1760000600000 };
const v = view(run, (s) => s);
assert.deepEqual([v.name, v.mono, v.mood, v.colour, v.bits], ['Iron Sunday', 'IS', 'Heavy', { name: 'Neon pink', hex: '#FF4F9A' }, answers[0]]);
assert.deepEqual([v.shape.id, v.shape.label, v.shape.d.startsWith('M')], ['burst', 'Sunburst', true]);
assert.deepEqual(view(run, (s) => s), v, 'view is pure');
const tv = view(run, (s) => `[${s}]`);
assert.deepEqual([tv.mood, tv.colour.name, tv.shape.label, tv.name], ['[Heavy]', '[Neon pink]', '[Sunburst]', 'Iron Sunday'], 'labels go through the translator, the name stays');
assert.equal(view({ ...run, s: answers.slice(0, 4) }, (s) => s), null);
assert.equal(view({ ...run, s: [] }, (s) => s), null);
assert.equal(view({ ...run, s: ['100010001000100010001000', 'heavy', 'Iron Sunday', 'nope', 'burst'] }, (s) => s), null, 'an id of no option gives no page');
assert.equal(view({ ...run, s: answers.map((a, k) => (k === 2 ? '  Iron\n Sunday  ' : a)) }, (s) => s).name, 'Iron Sunday', 'a line break or double space in the name is one space');
for (const m of mood.opts) for (const c of colour.opts) for (const sh of shape.opts) assert.ok(view({ ...run, s: [answers[0], m.id, 'Iron Sunday', c.id, sh.id] }, (s) => s), `${m.id} ${c.id} ${sh.id}`);

// The beat in words (for a screen reader) and the count of hits.
assert.equal(hitsOf('100010001000100010001000'), 6);
assert.equal(readOut('100010001000100010001000', (s) => s), 'Kick 1, 5; Snare 1, 5; Hat 1, 5');
assert.equal(readOut('100010000010001000000000', (s) => s), 'Kick 1, 5; Snare 3, 7', 'a row without a hit is left out');
assert.equal(readOut('111111111111111111111111', (s) => s), 'Kick 1, 2, 3, 4, 5, 6, 7, 8; Snare 1, 2, 3, 4, 5, 6, 7, 8; Hat 1, 2, 3, 4, 5, 6, 7, 8');
assert.equal(readOut('100010000010001000000000', (s) => `<${s}>`), '<Kick> 1, 5; <Snare> 3, 7', 'row names go through the translator');

// Words: every text the module registers (and every German, French, Dutch and Swedish one) has no exclamation mark and no emoji, and the Italian one keeps to the typographic apostrophe.
const pairs = [...source.matchAll(/\bt2\('((?:[^'\\]|\\.)*)',\s*'((?:[^'\\]|\\.)*)'\)/g)].map((m) => [m[1], m[2]]).concat([...source.matchAll(/\bo\('[a-z0-9]+',\s*'((?:[^'\\]|\\.)*)',\s*'((?:[^'\\]|\\.)*)'/g)].map((m) => [m[1], m[2]]));
assert.ok(pairs.length >= 30, `read ${pairs.length} texts from piece-music.ts`);
for (const [en, it] of pairs) {
  for (const [lang, s] of [['EN', en], ['IT', it], ...Object.entries(OTHERS).map(([l, L]) => [l, L[en]])]) {
    if (s === undefined) continue; // Kick, Neon pink... are translated in the shared tables
    assert.ok(!/!/.test(s) && !/\p{Extended_Pictographic}/u.test(s), `${lang}: "${s}" has an exclamation mark or an emoji`);
    assert.ok(!/lavor/i.test(s) && !/\bmissions?\b|\bMission(en)?\b|\bmissies?\b|uppdrag/i.test(s), `${lang}: "${s}" uses a banned word`);
  }
  assert.ok(!/\p{L}'\p{L}/u.test(it), `IT: "${it}" has a straight apostrophe, write ’`);
}
for (const [lang, L] of Object.entries(OWN)) for (const k of Object.keys(L)) assert.ok(source.includes(k), `${lang}: "${k.slice(0, 40)}" is not a text of piece-music.ts any more`);
const keysOf = (L) => Object.keys(L).sort().join('|');
for (const [lang, L] of Object.entries(OWN)) assert.equal(keysOf(L), keysOf(MUSIC_DE), `${lang} translates the same texts as German`);
for (const s of ['{k} hits', 'Cover: {s} with the letters {m} on {c}']) for (const [lang, L] of Object.entries(LANGS)) assert.equal([...(L[s] ?? '').matchAll(/\{\w+\}/g)].map((m) => m[0]).sort().join(), [...s.matchAll(/\{\w+\}/g)].map((m) => m[0]).sort().join(), `${lang}: "${s}" keeps its blanks`);

// Styles: every rule is about the card (its selectors hold .k-pc-music), and font sizes are rem (scripts/check-design.mjs checks the same for every piece stylesheet).
const bare = css.replace(/\/\*[\s\S]*?\*\//g, '');
for (const m of bare.matchAll(/(?:^|[}{])\s*([^{}@]+)\{/g)) for (const sel of m[1].split(',')) assert.ok(sel.includes('k-pc-music'), `piece-music.css: "${sel.trim()}" is not scoped to the card`);
assert.ok(!/font(-size)?:[^;{}]*\d\s*px/.test(bare), 'piece-music.css: font sizes are rem');
console.log(`piece music: ok (${colour.opts.length} covers x ${SHAPES.length} shapes read, letters fit the widest names, ${pairs.length} texts)`);
