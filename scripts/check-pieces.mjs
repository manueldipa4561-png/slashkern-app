// Checks the pieces (src/scripts/pieces.ts): every piece is complete and translated, a saved run is cleaned like untrusted input, and whatever three colours a person picks,
// the brand sheet stays readable. The screens are checked in the browser. Run: npm test
import assert from 'node:assert/strict';
import { buildSync } from 'esbuild';

const entry = ['pieces', 'i18n', 'fields', 'sync'].map((f) => `export * from './src/scripts/${f}.ts';`).join('\n');
const { text } = buildSync({ stdin: { contents: entry, resolveDir: process.cwd(), loader: 'ts' }, bundle: true, format: 'esm', platform: 'node', write: false }).outputFiles[0];
const { PIECES, PIECE_AT, FIELDS, IT, CLASHES, cleanRun, cleanRuns, stepOk, latestRun, lookOf, contrast, brandView, wordsIn, initials, pieceOf, mergeAnswers, akey, stamp, pieceLink, readPieceLink, LINK_MAX } = await import(`data:text/javascript;base64,${Buffer.from(text).toString('base64')}`);

const strings = (v) => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : []);
assert.deepEqual(CLASHES, [], 'the same English text has two different Italian versions');
assert.ok(PIECES.length >= 1, 'pieces.ts: no pieces');
assert.equal(new Set(PIECES.map((p) => p.n)).size, PIECES.length, 'pieces.ts: two pieces share a number n');
assert.equal(new Set(PIECES.map((p) => p.id)).size, PIECES.length, 'pieces.ts: two pieces share an id');

for (const p of PIECES) {
  const at = `piece ${p.id}`;
  assert.ok(FIELDS[p.f], `${at}: ${p.f} is not a field`);
  assert.ok(Number.isInteger(p.n) && p.n >= 0 && p.n < 10, `${at}: n must be 0-9 (a run's index is ${PIECE_AT} + n)`);
  assert.ok(p.steps.length >= 4 && p.steps.length <= 7, `${at}: ${p.steps.length} steps, a piece has 4 to 7 small ones`);
  assert.ok(p.mins >= 5 && p.mins <= 20, `${at}: mins ${p.mins} is outside 5-20`);
  p.steps.forEach((st, k) => {
    const sat = `${at} step ${k + 1}`;
    if (st.kind === 'pick') {
      assert.ok(st.n >= 1 && st.n <= 3 && st.opts.length >= st.n + 1 && st.opts.length <= 10, `${sat}: pick ${st.n} of ${st.opts.length}`);
      assert.equal(new Set(st.opts.map((x) => x.id)).size, st.opts.length, `${sat}: two options share an id`);
      for (const x of st.opts) assert.ok(/^[a-z]+$/.test(x.id), `${sat}: id "${x.id}" is not plain lowercase letters (a run joins ids with a comma)`);
      if (st.look === 'swatch') for (const x of st.opts) assert.match(x.hex ?? '', /^#[0-9A-F]{6}$/i, `${sat}: ${x.id} needs a #rrggbb colour`);
      if (st.look === 'shape') for (const x of st.opts) assert.ok(x.d?.startsWith('M') && x.d.endsWith('Z'), `${sat}: ${x.id} needs a closed path`);
    } else {
      assert.ok(st.max >= 10 && st.max <= 120 && st.words >= 1, `${sat}: a line needs a max of 10-120 characters and a word limit`);
    }
  });
  // Every text a person reads has an Italian one that is not a copy (the other languages are in i18n-de.ts and its siblings and checked by check-content.mjs).
  for (const s of strings([p.title, p.blurb, p.who, p.brief, p.steps.map((st) => [st.q, st.hint, st.ph, st.opts?.map((x) => x.label)])])) {
    assert.ok(IT[s], `${at}: no Italian for "${s.slice(0, 60)}"`);
    assert.ok(s.length < 25 || IT[s] !== s, `${at}: Italian is the same as English for "${s.slice(0, 60)}"`);
    assert.ok(!/lavor/i.test(s) && !/lavor/i.test(IT[s]), `${at}: the banned Italian word family in "${s.slice(0, 60)}"`);
    assert.ok(!/\p{L}'\p{L}/u.test(IT[s]), `${at}: a straight apostrophe in the Italian for "${s.slice(0, 60)}", write ’`);
    assert.ok(!/\bmissions?\b/i.test(s), `${at}: say "project", not "mission": "${s.slice(0, 60)}"`);
    assert.ok(!/€|\$|\bEUR\b|\bpaid\b/i.test(s), `${at}: no money in the copy: "${s.slice(0, 60)}"`);
  }
  assert.ok(p.who.startsWith('Practice project · '), `${at}: the client must be marked as a practice project`);
}

// A well-formed run for each piece, built from each step's first valid answer.
const sample = (p) => ({ f: p.f, i: PIECE_AT + p.n, at: 1760000000000, s: p.steps.map((st) => (st.kind === 'text' ? 'Coffee, plants, Rosa.' : st.opts.slice(0, st.n).map((x) => x.id).join(','))), done: 1760000600000 });
for (const p of PIECES) {
  const r = sample(p);
  assert.deepEqual(cleanRun(r), { ...r, ed: undefined, ai: undefined, q: undefined }, `${p.id}: a good run must survive cleaning`);
  assert.equal(pieceOf(r)?.id, p.id);
  // Untrusted input: wrong field, wrong index, bad times, bad answers, wrong types.
  for (const bad of [null, 5, 'x', [], { ...r, f: 'Nope' }, { ...r, i: 3 }, { ...r, i: PIECE_AT + 99 }, { ...r, at: NaN }, { ...r, at: 9e15 }, { ...r, s: 'abc' }, { ...r, s: undefined }]) assert.equal(cleanRun(bad), null, `${p.id}: a bad run (${JSON.stringify(bad)?.slice(0, 40)}) must be dropped`);
  assert.equal(cleanRun({ ...r, s: ['no-such-id', ...r.s.slice(1)] }).s.length, 0, `${p.id}: an unknown option stops the run there`);
  assert.equal(cleanRun({ ...r, s: r.s.map((a, k) => (k === 2 ? '<script>' : a)) }).s.length, 2, `${p.id}: a bad answer keeps only the steps before it`);
  assert.equal(cleanRun({ ...r, s: r.s.map((a, k) => (k === 2 ? '<script>' : a)) }).done, undefined, `${p.id}: done needs every step valid`);
  assert.equal(cleanRun({ ...r, s: r.s.slice(0, 2) }).done, undefined, `${p.id}: an unfinished run has no done time`);
  assert.equal(cleanRun({ ...r, done: 'soon' }).done, undefined);
  assert.equal(cleanRun({ ...r, ai: 'true' }).ai, undefined, 'only a literal true marks AI help');
  assert.equal(cleanRun({ ...r, ai: true }).ai, true);
  assert.equal(cleanRun({ ...r, q: 5000 }).q, 99);
  assert.equal(cleanRun({ ...r, q: -1 }).q, undefined);
  assert.equal(cleanRun({ ...r, x: 'extra', evil: {} }).evil, undefined, 'no unknown field is kept');
  // The line is the only free text: trimmed, never empty, never over its limit.
  const line = p.steps.findIndex((st) => st.kind === 'text'), lim = p.steps[line].max;
  assert.equal(cleanRun({ ...r, s: r.s.map((a, k) => (k === line ? `  ${a}  ` : a)) }).s[line], r.s[line]);
  assert.equal(cleanRun({ ...r, s: r.s.map((a, k) => (k === line ? '   ' : a)) }).s.length, line);
  assert.equal(cleanRun({ ...r, s: r.s.map((a, k) => (k === line ? 'x'.repeat(lim + 1) : a)) }).s.length, line);
  assert.equal(cleanRun({ ...r, s: r.s.map((a, k) => (k === line ? 'x'.repeat(lim) : a)) }).s.length, p.steps.length);
  // A pick must hold exactly n different ids of that step.
  const pk = p.steps.findIndex((st) => st.kind === 'pick' && st.n > 1), st = p.steps[pk];
  assert.ok(stepOk(st, st.opts.slice(0, st.n).map((x) => x.id).join(',')));
  assert.ok(!stepOk(st, st.opts.slice(0, st.n - 1).map((x) => x.id).join(',')), 'too few');
  assert.ok(!stepOk(st, st.opts.slice(0, st.n + 1).map((x) => x.id).join(',')), 'too many');
  assert.ok(!stepOk(st, Array(st.n).fill(st.opts[0].id).join(',')), 'the same id twice');
  assert.ok(!stepOk(st, ''), 'nothing picked');
}
assert.equal(cleanRuns('x').length, 0);
assert.equal(cleanRuns(Array.from({ length: 30 }, (_, k) => ({ ...sample(PIECES[0]), at: 1760000000000 + k }))).length, 20, 'at most 20 runs are kept');
assert.deepEqual(cleanRuns([sample(PIECES[0]), null, { f: 'Nope' }]).length, 1);
const p0 = PIECES[0], older = { ...sample(p0), at: 1 }, newer = { ...sample(p0), at: 2 };
assert.equal(latestRun([older, newer], p0).at, 2, 'the newest run shows');
assert.equal(latestRun([], p0), undefined);
assert.equal(wordsIn('  one  two three '), 3); assert.equal(wordsIn('   '), 0); assert.equal(initials('Bar Ficus'), 'BF');

// Colours: every ordered triple of the swatches must give a readable page. Ink on the ground is body text (4.5:1); text on the accent and on the logo is large and bold (3:1).
const brand = PIECES.find((p) => p.kind === 'brand'), swatches = brand.steps.find((st) => st.look === 'swatch').opts.map((x) => x.hex);
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

// The brand sheet reads its words from the run and is empty until every step is answered.
const view = brandView(brand, sample(brand), (s) => s);
assert.equal(view.name, 'Bar Ficus'); assert.equal(view.mono, 'BF'); assert.equal(view.swatches.length, 3); assert.equal(view.words.length, 3); assert.ok(view.shape.d.startsWith('M'));
assert.equal(view.one, 'The giant plant by the cash register');
assert.equal(brandView(brand, { ...sample(brand), s: sample(brand).s.slice(0, 4) }, (s) => s), null);
assert.equal(brandView(brand, sample(brand), (s) => `[${s}]`).one, '[The giant plant by the cash register]', 'labels go through the translator');

// Sync: a run merges across devices exactly like an answer (sync.ts): the newest copy wins, a delete sticks, an undo after the delete wins again, and two runs started apart both stay.
// Its i starts at PIECE_AT, so its key can never equal an answer's (a project's index is 0-9).
const run = { ...sample(p0), at: 5000, ed: 6000, s: sample(p0).s.slice(0, 2), done: undefined };
const keysOf = (r) => r.answers.map(akey);
assert.ok(PIECES.every((p) => PIECE_AT + p.n >= 10), 'a run index must stay clear of the 0-9 project indexes');
assert.deepEqual(keysOf(mergeAnswers([run], [], [], [])), [akey(run)]);
assert.equal(mergeAnswers([run], [{ ...run, ed: 7000, s: sample(p0).s, done: 7000 }], [], []).answers[0].s.length, p0.steps.length, 'the later copy, with more steps done, wins');
assert.equal(mergeAnswers([{ ...run, ed: 7000, s: sample(p0).s, done: 7000 }], [run], [], []).answers[0].s.length, p0.steps.length, 'whichever side holds it');
assert.deepEqual(keysOf(mergeAnswers([run], [run], [], [[akey(run), 6500]])), [], 'deleted on another device: it does not come back');
assert.deepEqual(keysOf(mergeAnswers([{ ...run, ed: 7000 }], [], [[akey(run), 6500]], [])), [akey(run)], 'Undo after the delete synced: the restored run is newer than its tombstone');
const apart = { ...run, at: 9000, ed: undefined };
assert.equal(mergeAnswers([run], [apart], [], []).answers.length, 2, 'two runs started on two devices both stay');
assert.equal(latestRun(mergeAnswers([run], [apart], [], []).answers, p0).at, 9000, 'the card shows the newest');
assert.ok(!keysOf(mergeAnswers([run], [], [], [])).some((k) => /^Design\.\d\./.test(k)), 'a run key never looks like an answer key');

// A share link: a finished piece and a name, after the # of /p/. It reads back whole (accents and emoji too), and anything else is refused: an unfinished piece, another version, damaged
// or oversized data, a run that fails the cleaning of a saved one. The name loses text-direction controls and is cut at 40 characters.
const mine = sample(p0), link = pieceLink('https://slashkern.app', mine, 'Giulia');
assert.ok(link.startsWith('https://slashkern.app/p/#') && link.length < 600, `a link is short enough for a message (${link.length})`);
const hashOf = (u) => u.slice(u.indexOf('#'));
const back = readPieceLink(hashOf(link));
assert.deepEqual(back.run, cleanRun(mine)); assert.equal(back.name, 'Giulia');
assert.deepEqual(readPieceLink(hashOf(link).slice(1)).run, back.run, 'with or without the #');
const accented = { ...mine, s: mine.s.map((a, k) => (k === 4 ? 'Caffè, città, 🌿' : a)) };
assert.equal(readPieceLink(hashOf(pieceLink('https://x.y', accented, 'Zoë 🌿'))).run.s[4], 'Caffè, città, 🌿');
assert.equal(readPieceLink(hashOf(pieceLink('https://x.y', accented, 'Zoë 🌿'))).name, 'Zoë 🌿');
assert.equal(readPieceLink(hashOf(pieceLink('https://x.y', mine, ''))).name, '', 'no name is fine');
assert.equal(readPieceLink(hashOf(pieceLink('https://x.y', mine, `\u202Eevil${'x'.repeat(60)}`))).name.length, 40, 'a name is cut at 40 characters, without text-direction controls');
assert.ok(!readPieceLink(hashOf(pieceLink('https://x.y', mine, '\u202Eevil'))).name.includes('\u202E'));
assert.equal(readPieceLink(hashOf(pieceLink('https://x.y', { ...mine, done: undefined }, 'A'))), null, 'an unfinished piece has no link');
assert.equal(readPieceLink(hashOf(pieceLink('https://x.y', { ...mine, s: mine.s.slice(0, 3) }, 'A'))), null);
const enc = (o) => `#${Buffer.from(JSON.stringify(o)).toString('base64url')}`;
const good = { v: 1, f: mine.f, i: mine.i, at: mine.at, s: mine.s, done: mine.done, n: 'A' };
assert.ok(readPieceLink(enc(good)), 'the test encoder matches the app');
for (const bad of [{ ...good, v: 2 }, { ...good, f: 'Nope' }, { ...good, s: ['x'] }, { ...good, at: 'now' }, { ...good, done: 9e15 }, null, [], 'text', 5]) assert.equal(readPieceLink(enc(bad)), null, `refused: ${JSON.stringify(bad)?.slice(0, 40)}`);
for (const bad of ['', '#', '#!!!', '#abc def', '#' + 'A'.repeat(LINK_MAX + 1), '#e30', '#bm90IGpzb24']) assert.equal(readPieceLink(bad), null, `refused: ${bad.slice(0, 20)}`);
assert.equal(readPieceLink(enc({ ...good, extra: '<img src=x onerror=alert(1)>', q: 3, ai: 'yes' })).run.q, 3);
assert.deepEqual(Object.keys(readPieceLink(enc({ ...good, extra: 'x' })).run).sort(), ['at', 'ai', 'done', 'ed', 'f', 'i', 'q', 's'].sort(), 'no unknown field comes through a link');
console.log(`pieces: ok (${PIECES.length} piece${PIECES.length === 1 ? '' : 's'}, ${triples} colour combinations readable)`);
