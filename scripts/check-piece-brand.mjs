// Checks the Design piece, the brand sheet for Bar Ficus (src/scripts/piece-brand.ts): whatever three colours a person picks, the page stays readable, and it reads its words from the run.
// The generic checks of every piece are in scripts/check-pieces.mjs. Run: npm test
import assert from 'node:assert/strict';
import { buildSync } from 'esbuild';

const entry = ['piece-brand', 'piece-types'].map((f) => `export * from './src/scripts/${f}.ts';`).join('\n');
const { text } = buildSync({ stdin: { contents: entry, resolveDir: process.cwd(), loader: 'ts' }, bundle: true, format: 'esm', platform: 'node', write: false }).outputFiles[0];
const { piece, view, lookOf, contrast, PIECE_AT } = await import(`data:text/javascript;base64,${Buffer.from(text).toString('base64')}`);

const answer = (st) => (st.kind === 'text' ? 'Coffee, plants, Rosa.' : st.opts.slice(0, st.n).map((x) => x.id).join(','));
const sample = { f: piece.f, i: PIECE_AT + piece.n, at: 1760000000000, s: piece.steps.map(answer), done: 1760000600000 };

// Colours: every ordered triple of the swatches must give a readable page. Ink on the ground is body text (4.5:1); text on the accent and on the logo is large and bold (3:1).
const swatches = piece.steps.find((st) => st.look === 'swatch').opts.map((x) => x.hex);
let triples = 0;
for (const a of swatches) for (const b of swatches) for (const c of swatches) {
  if (a === b || b === c || a === c) continue;
  triples++;
  const l = lookOf([a, b, c]), at = `lookOf(${a} ${b} ${c})`;
  assert.ok(contrast(l.ink, l.bg) >= 4.5, `${at}: ink ${l.ink} on ${l.bg} is ${contrast(l.ink, l.bg).toFixed(2)}`);
  assert.ok(contrast(l.onAcc, l.acc) >= 3, `${at}: text on the accent ${l.acc} is ${contrast(l.onAcc, l.acc).toFixed(2)}`);
  assert.ok(contrast(l.onLogo, l.logo) >= 3, `${at}: letters on the logo ${l.logo} are ${contrast(l.onLogo, l.logo).toFixed(2)}`);
  assert.ok(contrast(l.logo, l.bg) >= 1.6, `${at}: the logo ${l.logo} disappears into ${l.bg}`);
  assert.ok([a, b, c, '#14181F', '#FBF8F2'].includes(l.bg) && [a, b, c, '#14181F', '#FBF8F2'].includes(l.ink), `${at}: the colours come from the picks or the two neutrals`);
}
assert.equal(triples, swatches.length * (swatches.length - 1) * (swatches.length - 2));

// The sheet reads its words from the run and is empty until every step is answered.
const v = view(sample, (s) => s);
assert.equal(v.name, 'Bar Ficus'); assert.equal(v.mono, 'BF'); assert.equal(v.swatches.length, 3); assert.equal(v.words.length, 3); assert.ok(v.shape.d.startsWith('M'));
assert.equal(v.one, 'The giant plant by the cash register');
assert.equal(view({ ...sample, s: sample.s.slice(0, 4) }, (s) => s), null);
assert.equal(view(sample, (s) => `[${s}]`).one, '[The giant plant by the cash register]', 'labels go through the translator');
console.log(`piece brand: ok (${triples} colour combinations readable)`);
