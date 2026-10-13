// Checks the Writing piece, the launch kit for Pigro Gelato (src/scripts/piece-writing.ts): whatever flavour a person picks, the page stays readable; it reads its words from the run and keeps the
// person's own words as they were typed; the type that scales with the name never gets smaller than the app's smallest text; the audience labels read after "for". The screens and the two drawings
// (the page and the picture) are checked in the browser. The generic checks of every piece are in scripts/check-pieces.mjs. Run: npm test
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildSync } from 'esbuild';

const entry = ['piece-writing', 'piece-types', 'i18n', 'i18n-de', 'i18n-fr', 'i18n-nl', 'i18n-sv'].map((f) => `export * from './src/scripts/${f}.ts';`).join('\n');
const { text } = buildSync({ stdin: { contents: entry, resolveDir: process.cwd(), loader: 'ts' }, bundle: true, format: 'esm', platform: 'node', write: false, logLevel: 'silent' }).outputFiles[0]; // silent: the language files carry old duplicate keys that esbuild warns about
const { piece, view, lookOf, nameLen, MUTE, contrast, stepOk, wordsIn, INK, PAPER, PIECE_AT, IT, DE, FR, NL, SV } = await import(`data:text/javascript;base64,${Buffer.from(text).toString('base64')}`);

// The shape of the piece: a flavour (its colour), who it is for, then three lines of the person's own.
assert.equal(piece.f, 'Writing'); assert.equal(piece.client, 'Pigro Gelato'); assert.ok(piece.who.includes('(fictional)'));
assert.deepEqual(piece.steps.map((st) => st.kind), ['pick', 'pick', 'text', 'text', 'text']);
assert.equal(piece.steps[0].look, 'swatch'); assert.equal(piece.steps[0].n, 1); assert.equal(piece.steps[1].n, 1);
assert.deepEqual(piece.steps.slice(2).map((st) => [st.max, st.words]), [[24, 4], [60, 10], [120, 20]], 'the name, the sign and the caption keep the limits of the brief');
assert.ok(piece.mins >= 8 && piece.mins <= 12);
const texts = (st) => [st.q, st.hint, ...(st.opts ?? []).map((x) => x.label)];
for (const st of piece.steps) {
  assert.ok(st.q.length <= 70 && st.hint.length <= 90, `"${st.q}": a question is 70 characters at most and a hint 90`);
  for (const s of texts(st)) assert.ok(!/!/.test(s) && !/!/.test(IT[s]), `no exclamation mark in "${s}"`);
  for (const x of st.opts ?? []) assert.ok(x.label.length <= 36, `"${x.label}": an option label is 36 characters at most`);
  if (st.kind === 'text') { assert.ok(stepOk(st, st.ph) && wordsIn(st.ph) <= st.words, `the example "${st.ph}" must itself be a valid answer`); assert.ok(!/!/.test(st.ph)); }
}

// Colours: the flavour is the ground, so every flavour must keep every text readable. Ink on the ground is body text (4.5:1) and so is the soft circle behind the name of the post (it only ever
// moves the ground away from the ink); the board is paper on near-black; the post is a white card with muted text on it. The five flavours are five different colours.
const flavours = piece.steps[0].opts, mix = (hex, rgba) => { const [r, g, b, a] = rgba.match(/[\d.]+/g).map(Number), at = (i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * (1 - a) + [r, g, b][(i - 1) / 2] * a); return `#${[1, 3, 5].map((i) => at(i).toString(16).padStart(2, '0')).join('')}`; };
assert.equal(new Set(flavours.map((x) => x.hex)).size, flavours.length);
for (const f of flavours) {
  const l = lookOf(f.hex), at = `${f.id} ${f.hex}`, under = mix(f.hex, l.shine);
  assert.equal(l.bg, f.hex); assert.ok([INK, PAPER].includes(l.ink));
  assert.ok(contrast(l.ink, l.bg) >= 4.5, `${at}: ink ${l.ink} on the ground is ${contrast(l.ink, l.bg).toFixed(2)}`);
  assert.ok(contrast(l.ink, under) >= Math.max(4.5, contrast(l.ink, l.bg)), `${at}: the circle behind the name must not lower the contrast (${contrast(l.ink, under).toFixed(2)})`);
}
assert.ok(contrast(PAPER, INK) >= 4.5, 'the chalk on the board'); assert.ok(contrast(MUTE, '#FFFFFF') >= 4.5, 'the muted text on the white post');

// The page reads its words from the run, translates only the app's labels, and is empty until every step is answered. A run with an id that is not a flavour or an audience makes no page.
const answers = ['pistachio', 'walkers', 'Pistachio Siesta', 'Slow down. The gelato will wait.', 'New flavour, same slow Sunday. Come and take your time.'];
const sample = { f: piece.f, i: PIECE_AT + piece.n, at: 1760000000000, s: answers, done: 1760000600000 };
const v = view(sample, (s) => s), t = view(sample, (s) => `[${s}]`);
assert.deepEqual([v.name, v.sign, v.caption], answers.slice(2)); assert.equal(v.flavour.label, 'Pistachio and sea salt'); assert.equal(v.flavour.hex, '#A8C686'); assert.equal(v.who, 'People walking home at night');
assert.deepEqual([t.name, t.sign, t.caption], answers.slice(2), 'what the person wrote is never translated'); assert.deepEqual([t.flavour.label, t.who], ['[Pistachio and sea salt]', '[People walking home at night]']);
assert.deepEqual(view(sample, (s) => s), v, 'view is pure');
assert.equal(view({ ...sample, s: answers.slice(0, 4) }, (s) => s), null);
assert.equal(view({ ...sample, s: ['nope', ...answers.slice(1)] }, (s) => s), null); assert.equal(view({ ...sample, s: [answers[0], 'nope', ...answers.slice(2)] }, (s) => s), null);
for (const f of flavours) for (const w of piece.steps[1].opts) assert.ok(view({ ...sample, s: [f.id, w.id, ...answers.slice(2)] }, (s) => s), `${f.id} for ${w.id} makes a page`);

// The name is as big as fits: the page sets the size from the longest word (a capital counts a fifth more, W and M more still), between a cap and a floor. The floors keep even the widest name
// allowed (24 W in one word) at the app's smallest text size or above, in the poster and in the picture of the post.
const near = (a, b) => Math.abs(a - b) < 1e-9; // the capital P of Pistachio counts 1.2, the other eight letters 1 each
assert.ok(near(nameLen('Pistachio Siesta'), 9.2) && near(nameLen('PISTACHIO'), 10.8) && near(nameLen('x'.repeat(24)), 24) && nameLen('') === 0);
assert.ok(near(nameLen('Mimmo'), 1.6 + 1 + 1.4 + 1.4 + 1) && near(nameLen('WW'), 3.2));
assert.ok(nameLen('Ab') > nameLen('ab') && nameLen('Pistacchio') > nameLen('Pistachio') && nameLen('Mm') > nameLen('Ab'));
const css = readFileSync('src/styles/piece-writing.css', 'utf8'), sizes = [...css.matchAll(/font-size: max\(([\d.]+)rem, min\(([\d.]+)rem, calc\(([\d.]+)rem \/ var\(--pc-n/g)].map((m) => m.slice(1).map(Number));
assert.equal(sizes.length, 2, 'two sizes scale with the name: the poster and the name in the post');
for (const [floor, cap, k] of sizes) { assert.ok(floor >= 0.75, `a floor of ${floor}rem is under the app's smallest text`); assert.ok(cap > floor && k / nameLen('x'.repeat(24)) >= floor, `calc(${k}rem / n) must not need the floor for an ordinary 24-letter name`); }
// Every rule is scoped under .k-pc-writing (piece.css imports this file above its base rules, so an unscoped rule would lose to them).
for (const m of css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{/g)) for (const sel of m[1].split(',')) assert.ok(sel.trim().startsWith('.k-pc-writing'), `piece-writing.css: "${sel.trim()}" must start with .k-pc-writing`);
assert.ok(!/innerHTML/.test(readFileSync('src/scripts/piece-writing.ts', 'utf8')), 'what the person wrote goes in as text, never as HTML');

// The audience labels finish the line "Pigro Gelato · for ...", so none starts with an article ("for the students" would need a contraction in Italian and a case in German).
const ARTICLE = { it: /^(il|lo|la|i|gli|le|un|uno|una)\s/i, de: /^(der|die|das|dem|den|ein|eine)\s/i, fr: /^(le|la|les|un|une|des|l')/i, nl: /^(de|het|een)\s/i, sv: /^(en|ett|den|det)\s/i };
for (const [lang, table] of [['it', IT], ['de', DE], ['fr', FR], ['nl', NL], ['sv', SV]]) for (const x of piece.steps[1].opts) assert.ok(table[x.label] && !ARTICLE[lang].test(table[x.label]), `${lang}: "${table[x.label]}" must read after "for" (no article first)`);
console.log(`piece writing: ok (${flavours.length} flavours readable, ${flavours.length * piece.steps[1].opts.length} pages, the name scales down to ${(Math.min(...sizes.map(([, , k]) => k)) / 24).toFixed(2)}rem for 24 letters)`);
