// Checks the maker quiz (src/scripts/quiz.ts): every answer is a real mission, every question has all seven types once, no project repeats,
// the scoring rules hold, and every text exists in all six languages without a banned word. The website copies this quiz: if missions are
// reordered or renamed, this check fails until the [field, index] pairs are fixed here (and then on the website). Run: npm test
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const { QUIZ, QRESULT, QFIELD, QHUE, scoreQuiz, cleanQuiz, typeOfField } = await import('../src/scripts/quiz.ts');

// The missions per field, read from missions.ts (one `who:` per mission, in order, under each field key of CORE).
const src = readFileSync('src/scripts/missions.ts', 'utf8');
const core = src.slice(src.indexOf('const CORE'), src.indexOf('\n};', src.indexOf('const CORE')));
const perField = {};
let field = '';
for (const line of core.split('\n')) {
  const f = line.match(/^  (\w+): \[/); if (f) { field = f[1]; perField[field] = 0; }
  if (field && /^\s+who: /.test(line)) perField[field]++;
}
assert.deepEqual(Object.keys(perField).sort(), Object.values(QFIELD).sort(), 'every quiz type maps to an app field');
assert.equal(QUIZ.length, 5, 'five questions');
const seen = new Set();
QUIZ.forEach((q, k) => {
  assert.equal(q.a.length, 7, `question ${k + 1}: seven answers`);
  assert.deepEqual(q.a.map((x) => x.type).sort(), Object.keys(QFIELD).sort(), `question ${k + 1}: all seven types once`);
  for (const x of q.a) {
    const f = QFIELD[x.type], key = `${f}.${x.i}`;
    assert.ok(Number.isInteger(x.i) && x.i >= 0 && x.i < perField[f], `${key} is not a mission (the field has ${perField[f]})`);
    assert.ok(!seen.has(key), `${key} is in the quiz twice`);
    seen.add(key);
  }
});
assert.equal(seen.size, 35);
// Every type has its card colours (the website's Examples pairs) and maps back from its app field (the mix chips name results).
for (const t of Object.keys(QFIELD)) {
  assert.ok(QHUE[t]?.every((c) => /^#[0-9A-F]{6}$/.test(c)), `${t}: a tint and a strong colour`);
  assert.equal(typeOfField(QFIELD[t]), t, `${QFIELD[t]} maps back to ${t}`);
}
assert.equal(typeOfField('Nope'), undefined);

// Scoring. Q1..Q5 answer indices; types are read from the data so the test follows the order of the answers.
const at = (k, type) => QUIZ[k].a.findIndex((x) => x.type === type);
const pick = (...types) => types.map((t, k) => at(k, t));
let m = scoreQuiz(pick('video', 'video', 'poster', 'video', 'music'));
assert.equal(m.type, 'video', 'the type picked most wins');
assert.equal(m.f, 'Video');
assert.equal(m.i, QUIZ[3].a[at(3, 'video')].i, 'the project is the latest answer in the winning type');
assert.deepEqual(m.mix, ['Music', 'Design'], 'the mix: the other fields, a tie goes to the more recent');
m = scoreQuiz(pick('web', 'web', 'posts', 'posts', 'music'));
assert.equal(m.type, 'posts', 'a tie goes to the type picked most recently');
assert.equal(m.i, QUIZ[3].a[at(3, 'posts')].i);
m = scoreQuiz(pick('video', 'poster', 'posts', 'web', 'listing'));
assert.equal(m.type, 'listing', 'five different types: the last one wins');
assert.equal(m.mix.length, 4);
for (const bad of [[], [0, 0, 0, 0], [0, 0, 0, 0, 7], [0, 0, 0, 0, -1], [0, 0, 0, 0, 1.5], null, 'x']) assert.equal(scoreQuiz(bad), null, `${JSON.stringify(bad)} is no valid set`);
assert.deepEqual(cleanQuiz({ a: [0, 1, 2, 3, 4], at: 5 }), { a: [0, 1, 2, 3, 4], at: 5 });
for (const bad of [null, {}, { a: [0, 1], at: 5 }, { a: [0, 1, 2, 3, 4] }, { a: [0, 1, 2, 3, 9], at: 5 }]) assert.equal(cleanQuiz(bad), undefined);

// Every text in all six languages: English and Italian in quiz.ts, the others in the i18n maps, keyed by the English.
const texts = [...QUIZ.flatMap((q) => [q.q, ...q.a.map((x) => x.t)]), ...Object.values(QRESULT).flatMap((r) => [r.name, r.line])];
const maps = Object.fromEntries(['de', 'fr', 'nl', 'sv', 'es'].map((l) => [l, readFileSync(`src/scripts/i18n-${l}.ts`, 'utf8')]));
for (const [en, it] of texts) {
  assert.ok(en.trim() && it.trim() && en !== it, `"${en}" needs its Italian`);
  for (const [l, file] of Object.entries(maps)) assert.ok(file.includes(`  ${JSON.stringify(en)}: `), `i18n-${l}.ts has no "${en}"`);
}
// No banned word: the Italian "lavor-" family; German and French job words (same lists as check-content).
const ban = { it: /lavor/i, de: /arbeit|beruf|bewerb|karriere|\bjob/i, fr: /travail|emploi|carri[eè]re|m[ée]tier|boulot|\bjob/i };
for (const [, it] of texts) assert.ok(!ban.it.test(it), `banned word in "${it}"`);
for (const [en] of texts) for (const l of ['de', 'fr']) {
  const line = maps[l].split('\n').find((x) => x.startsWith(`  ${JSON.stringify(en)}: `));
  assert.ok(!ban[l].test(line.slice(JSON.stringify(en).length + 4)), `banned word in the ${l} for "${en}"`);
}
console.log(`quiz: ok (5 questions x 7 types, 35 real missions with none repeated, most picked wins and a tie goes to the latest, ${texts.length} texts in 6 languages, no banned word)`);
