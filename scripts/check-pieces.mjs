// Checks the pieces (src/scripts/pieces.ts and piece-<name>.ts): every piece is complete and translated into Italian, a saved run is cleaned like untrusted input for every kind of step,
// runs sync like answers, share links read back and refuse what is not a finished piece. What is specific to one piece is in scripts/check-piece-<name>.mjs. The screens and the
// drawings are checked in the browser. Run: npm test
import assert from 'node:assert/strict';
import { buildSync } from 'esbuild';

const entry = ['pieces', 'i18n', 'fields', 'sync'].map((f) => `export * from './src/scripts/${f}.ts';`).join('\n');
const { text } = buildSync({ stdin: { contents: entry, resolveDir: process.cwd(), loader: 'ts' }, bundle: true, format: 'esm', platform: 'node', write: false }).outputFiles[0];
const { PIECES, KINDS, PIECE_AT, FIELDS, IT, CLASHES, cleanRun, cleanRuns, stepOk, latestRun, wordsIn, initials, pieceOf, mergeAnswers, akey, pieceLink, readPieceLink, LINK_MAX, BEAT_MIN } = await import(`data:text/javascript;base64,${Buffer.from(text).toString('base64')}`);

const strings = (v) => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : []);
assert.deepEqual(CLASHES, [], `the same English text has two different Italian versions (reuse the Italian that is already there): ${CLASHES.map((k) => `"${k}" is also "${IT[k]}"`).join(' | ')}`);
assert.ok(PIECES.length >= 1, 'pieces.ts: no pieces');
assert.equal(KINDS.length, PIECES.length);
assert.equal(new Set(PIECES.map((p) => p.n)).size, PIECES.length, 'pieces.ts: two pieces share a number n');
assert.equal(new Set(PIECES.map((p) => p.id)).size, PIECES.length, 'pieces.ts: two pieces share an id');
assert.equal(new Set(PIECES.map((p) => p.f)).size, PIECES.length, 'one piece per field for the pilot');

// A well-formed answer for each kind of step.
const answer = (st) => (st.kind === 'text' ? 'A short line.'.slice(0, st.max) : st.kind === 'beat' ? '100010001000100010001000' : st.kind === 'run' ? 'What the AI wrote.' : st.opts.slice(0, st.n).map((x) => x.id).join(','));
const sample = (p) => ({ f: p.f, i: PIECE_AT + p.n, at: 1760000000000, s: p.steps.map(answer), done: 1760000600000 });
const tr = (s) => s, t = { tr, fill: (e, v) => e.replace(/\{(\w+)\}/g, (m, k) => v[k]) };

for (const k of KINDS) {
  const p = k.piece, at = `piece ${p.id}`;
  assert.ok(FIELDS[p.f], `${at}: ${p.f} is not a field`);
  assert.ok(Number.isInteger(p.n) && p.n >= 0 && p.n < 10, `${at}: n must be 0-9 (a run's index is ${PIECE_AT} + n)`);
  assert.ok(p.steps.length >= 4 && p.steps.length <= 7, `${at}: ${p.steps.length} steps, a piece has 4 to 7 small ones`);
  assert.ok(p.mins >= 5 && p.mins <= 20, `${at}: mins ${p.mins} is outside 5-20`);
  assert.ok(p.client.trim(), `${at}: needs the name of its fictional client`);
  assert.ok(typeof k.view === 'function' && typeof k.dom === 'function' && typeof k.img === 'function', `${at}: a piece module exports view, dom and img`);
  p.steps.forEach((st, i) => {
    const sat = `${at} step ${i + 1}`;
    assert.ok(['pick', 'text', 'beat', 'run'].includes(st.kind), `${sat}: unknown kind ${st.kind}`);
    assert.ok(st.q.trim() && st.hint.trim(), `${sat}: needs a question and a hint`);
    if (st.kind === 'pick') {
      assert.ok(st.n >= 1 && st.n <= 3 && st.opts.length >= st.n + 1 && st.opts.length <= 10, `${sat}: pick ${st.n} of ${st.opts.length}`);
      assert.equal(new Set(st.opts.map((x) => x.id)).size, st.opts.length, `${sat}: two options share an id`);
      for (const x of st.opts) assert.ok(/^[a-z0-9]+$/.test(x.id), `${sat}: id "${x.id}" is not plain lowercase letters or digits (a run joins ids with a comma)`);
      if (st.look === 'swatch') for (const x of st.opts) assert.match(x.hex ?? '', /^#[0-9A-F]{6}$/i, `${sat}: ${x.id} needs a #rrggbb colour`);
      if (st.look === 'shape') for (const x of st.opts) assert.ok(x.d?.startsWith('M') && x.d.endsWith('Z'), `${sat}: ${x.id} needs a closed path`);
    } else if (st.kind === 'text') {
      assert.ok(st.max >= 10 && st.max <= 160 && st.words >= 1 && st.ph.trim(), `${sat}: a line needs a max of 10-160 characters, a word limit and a placeholder`);
    } else if (st.kind === 'run') {
      assert.ok(st.max >= 200 && st.max <= 900, `${sat}: the AI's text is kept up to 200-900 characters`);
      assert.ok(i === p.steps.length - 1, `${sat}: the AI step comes last (the page is the prompt and what the AI made)`);
      assert.equal(typeof k.prompt, 'function', `${at}: a piece with an AI step exports prompt(run, tr)`);
    }
  });
  // Every text a person reads has an Italian one that is not a copy (the other languages are in i18n-piece-*.ts and checked by check-content.mjs).
  const MONEY = p.f === 'Selling' ? /\bpaid\b|\bearn|\bincome\b|\bsalary\b|\bEUR\b|\$/i : /€|\$|\bEUR\b|\bpaid\b|\bearn|\bincome\b|\bsalary\b/i; // a listing has a fictional price; no piece promises money
  for (const s of strings([p.title, p.blurb, p.who, p.brief, p.steps.map((st) => [st.q, st.hint, st.ph, st.opts?.map((x) => x.label)])])) {
    assert.ok(IT[s], `${at}: no Italian for "${s.slice(0, 60)}"`);
    assert.ok(s.length < 25 || IT[s] !== s, `${at}: Italian is the same as English for "${s.slice(0, 60)}"`);
    assert.ok(!/lavor/i.test(s) && !/lavor/i.test(IT[s]), `${at}: the banned Italian word family in "${s.slice(0, 60)}"`);
    assert.ok(!/\p{L}'\p{L}/u.test(IT[s]), `${at}: a straight apostrophe in the Italian for "${s.slice(0, 60)}", write ’`);
    assert.ok(!/\bmissions?\b/i.test(s), `${at}: say "project", not "mission": "${s.slice(0, 60)}"`);
    assert.ok(!MONEY.test(s) && !/no experience/i.test(s), `${at}: no money claim, no "no experience": "${s.slice(0, 60)}"`);
  }
  assert.ok(p.who.startsWith('Practice project · '), `${at}: the client must be marked as a practice project`);
  // The page: the sample run reads into a view, an unfinished one does not, and reading is pure.
  const r = sample(p), v = k.view(r, tr);
  assert.ok(v, `${at}: a finished run must make a view`);
  assert.deepEqual(k.view(r, tr), v, `${at}: view is pure`);
  assert.equal(k.view({ ...r, s: r.s.slice(0, p.steps.length - 1) }, tr), null, `${at}: an unfinished run has no view`);
  assert.equal(k.view({ ...r, s: [] }, tr), null);
  if (k.prompt) { const pr = k.prompt(r, tr); assert.ok(typeof pr === 'string' && pr.length >= 20 && pr.length <= 1500, `${at}: the prompt is 20-1500 characters (the AI step takes no more)`); }
  if (k.file) { const f = k.file(v, 'by', t); assert.ok(f.name && f.mime && f.text && f.label, `${at}: a file has a name, a type, a text and a button label`); assert.ok(f.name.length < 60 && !/[\\/]/.test(f.name), `${at}: file name`); }
}

for (const k of KINDS) {
  const p = k.piece, r = sample(p);
  assert.deepEqual(cleanRun(r), { ...r, ed: undefined, ai: undefined, q: undefined }, `${p.id}: a good run must survive cleaning`);
  assert.equal(pieceOf(r)?.id, p.id);
  // Untrusted input: wrong field, wrong index, bad times, bad answers, wrong types.
  for (const bad of [null, 5, 'x', [], { ...r, f: 'Nope' }, { ...r, i: 3 }, { ...r, i: PIECE_AT + 99 }, { ...r, at: NaN }, { ...r, at: 9e15 }, { ...r, s: 'abc' }, { ...r, s: undefined }]) assert.equal(cleanRun(bad), null, `${p.id}: a bad run (${JSON.stringify(bad)?.slice(0, 40)}) must be dropped`);
  assert.equal(cleanRun({ ...r, s: r.s.slice(0, 2) }).done, undefined, `${p.id}: an unfinished run has no done time`);
  assert.equal(cleanRun({ ...r, done: 'soon' }).done, undefined);
  assert.equal(cleanRun({ ...r, ai: 'true' }).ai, undefined, 'only a literal true marks AI help');
  assert.equal(cleanRun({ ...r, ai: true }).ai, true);
  assert.equal(cleanRun({ ...r, q: 5000 }).q, 99);
  assert.equal(cleanRun({ ...r, q: -1 }).q, undefined);
  assert.equal(cleanRun({ ...r, x: 'extra', evil: {} }).evil, undefined, 'no unknown field is kept');
  // Every step in turn: a bad answer keeps only the steps before it, and done needs every step valid.
  p.steps.forEach((st, i) => {
    const bad = st.kind === 'text' ? '   ' : st.kind === 'beat' ? '1'.repeat(23) : st.kind === 'run' ? 'x'.repeat(st.max + 1) : '<script>';
    const c = cleanRun({ ...r, s: r.s.map((a, k2) => (k2 === i ? bad : a)) });
    assert.equal(c.s.length, i, `${p.id} step ${i + 1}: a bad answer keeps only the steps before it`);
    assert.equal(c.done, undefined, `${p.id} step ${i + 1}: done needs every step valid`);
  });
  // A line is the free text: trimmed, never empty, never over its limit.
  p.steps.forEach((st, i) => {
    if (st.kind !== 'text') return;
    assert.equal(cleanRun({ ...r, s: r.s.map((a, k2) => (k2 === i ? `  ${a}  ` : a)) }).s[i], r.s[i]);
    assert.equal(cleanRun({ ...r, s: r.s.map((a, k2) => (k2 === i ? 'x'.repeat(st.max + 1) : a)) }).s.length, i);
    assert.equal(cleanRun({ ...r, s: r.s.map((a, k2) => (k2 === i ? 'x'.repeat(st.max) : a)) }).s.length, p.steps.length);
  });
  // A pick must hold exactly n different ids of that step.
  p.steps.forEach((st) => {
    if (st.kind !== 'pick' || st.n < 2) return;
    assert.ok(stepOk(st, st.opts.slice(0, st.n).map((x) => x.id).join(',')));
    assert.ok(!stepOk(st, st.opts.slice(0, st.n - 1).map((x) => x.id).join(',')), 'too few');
    assert.ok(!stepOk(st, st.opts.slice(0, st.n + 1).map((x) => x.id).join(',')), 'too many');
    assert.ok(!stepOk(st, Array(st.n).fill(st.opts[0].id).join(',')), 'the same id twice');
    assert.ok(!stepOk(st, ''), 'nothing picked');
  });
}
// A beat is 24 zeros and ones with at least BEAT_MIN hits; an AI step may be skipped (empty) or hold up to max characters.
const beatStep = { kind: 'beat' }, runStep = { kind: 'run', max: 600 };
assert.ok(stepOk(beatStep, '100010001000100010001000') && stepOk(beatStep, '1'.repeat(24)));
for (const bad of ['', '0'.repeat(24), '1'.repeat(23), '1'.repeat(25), '12'.repeat(12), 'a'.repeat(24)]) assert.ok(!stepOk(beatStep, bad), `a beat of "${bad}" is refused`);
assert.ok(!stepOk(beatStep, '1'.repeat(BEAT_MIN - 1).padEnd(24, '0')) && stepOk(beatStep, '1'.repeat(BEAT_MIN).padEnd(24, '0')), 'at least BEAT_MIN hits');
assert.ok(stepOk(runStep, '') && stepOk(runStep, 'x'.repeat(600)) && !stepOk(runStep, 'x'.repeat(601)));

assert.equal(cleanRuns('x').length, 0);
const p0 = PIECES[0];
assert.equal(cleanRuns(Array.from({ length: 30 }, (_, k) => ({ ...sample(p0), at: 1760000000000 + k }))).length, 20, 'at most 20 runs are kept');
assert.deepEqual(cleanRuns([sample(p0), null, { f: 'Nope' }]).length, 1);
const older = { ...sample(p0), at: 1 }, newer = { ...sample(p0), at: 2 };
assert.equal(latestRun([older, newer], p0).at, 2, 'the newest run shows');
assert.equal(latestRun([], p0), undefined);
assert.equal(wordsIn('  one  two three '), 3); assert.equal(wordsIn('   '), 0); assert.equal(initials('Bar Ficus'), 'BF');

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
assert.ok(!keysOf(mergeAnswers([run], [], [], [])).some((k) => /^[A-Za-z]+\.\d\./.test(k)), 'a run key never looks like an answer key');

// A share link: a finished piece and a name, after the # of /p/. It reads back whole (accents and emoji too), and anything else is refused: an unfinished piece, another version, damaged
// or oversized data, a run that fails the cleaning of a saved one. The name loses text-direction controls and is cut at 40 characters.
const hashOf = (u) => u.slice(u.indexOf('#'));
for (const k of KINDS) {
  const mine = sample(k.piece), link = pieceLink('https://slashkern.app', mine, 'Giulia');
  assert.ok(link.startsWith('https://slashkern.app/p/#') && link.length < 1200, `${k.piece.id}: a link is short enough for a message (${link.length})`);
  const back = readPieceLink(hashOf(link));
  assert.deepEqual(back.run, cleanRun(mine), `${k.piece.id}: the link reads back whole`); assert.equal(back.name, 'Giulia');
}
const mine = sample(p0), link = pieceLink('https://slashkern.app', mine, 'Giulia'), back = readPieceLink(hashOf(link));
assert.deepEqual(readPieceLink(hashOf(link).slice(1)).run, back.run, 'with or without the #');
const textAt = p0.steps.findIndex((st) => st.kind === 'text'), accented = { ...mine, s: mine.s.map((a, k) => (k === textAt ? 'Caffè, città, 🌿' : a)) };
assert.equal(readPieceLink(hashOf(pieceLink('https://x.y', accented, 'Zoë 🌿'))).run.s[textAt], 'Caffè, città, 🌿');
assert.equal(readPieceLink(hashOf(pieceLink('https://x.y', accented, 'Zoë 🌿'))).name, 'Zoë 🌿');
assert.equal(readPieceLink(hashOf(pieceLink('https://x.y', mine, ''))).name, '', 'no name is fine');
assert.equal(readPieceLink(hashOf(pieceLink('https://x.y', mine, `‮evil${'x'.repeat(60)}`))).name.length, 40, 'a name is cut at 40 characters, without text-direction controls');
assert.ok(!readPieceLink(hashOf(pieceLink('https://x.y', mine, '‮evil'))).name.includes('‮'));
assert.equal(readPieceLink(hashOf(pieceLink('https://x.y', { ...mine, done: undefined }, 'A'))), null, 'an unfinished piece has no link');
assert.equal(readPieceLink(hashOf(pieceLink('https://x.y', { ...mine, s: mine.s.slice(0, 3) }, 'A'))), null);
const enc = (o) => `#${Buffer.from(JSON.stringify(o)).toString('base64url')}`;
const good = { v: 1, f: mine.f, i: mine.i, at: mine.at, s: mine.s, done: mine.done, n: 'A' };
assert.ok(readPieceLink(enc(good)), 'the test encoder matches the app');
for (const bad of [{ ...good, v: 2 }, { ...good, f: 'Nope' }, { ...good, s: ['x'] }, { ...good, at: 'now' }, { ...good, done: 9e15 }, null, [], 'text', 5]) assert.equal(readPieceLink(enc(bad)), null, `refused: ${JSON.stringify(bad)?.slice(0, 40)}`);
for (const bad of ['', '#', '#!!!', '#abc def', '#' + 'A'.repeat(LINK_MAX + 1), '#e30', '#bm90IGpzb24']) assert.equal(readPieceLink(bad), null, `refused: ${bad.slice(0, 20)}`);
assert.equal(readPieceLink(enc({ ...good, extra: '<img src=x onerror=alert(1)>', q: 3, ai: 'yes' })).run.q, 3);
assert.deepEqual(Object.keys(readPieceLink(enc({ ...good, extra: 'x' })).run).sort(), ['at', 'ai', 'done', 'ed', 'f', 'i', 'q', 's'].sort(), 'no unknown field comes through a link');
console.log(`pieces: ok (${PIECES.length} piece${PIECES.length === 1 ? '' : 's'}: ${PIECES.map((p) => p.f).join(', ')})`);
