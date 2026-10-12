// Checks the sync rules in src/scripts/sync.ts and the next-mission rule in src/scripts/next.ts. Run: npm test (Node 22.18+ runs .ts directly).
import assert from 'node:assert/strict';
import { nextSpot, roundOf } from '../src/scripts/next.ts';
import { akey, mergeAnswers, stamp, type Tomb } from '../src/scripts/sync.ts';
import { MAX_COUNT, MAX_TIME, cleanAi, clampCount, inTime } from '../src/scripts/valid.ts';
import { MAKE_PER_DAY, canMake, countMake, makeBody, makesLeft, makesToday, parseMake } from '../src/scripts/make.ts';

const x = { f: 'Design', i: 0, at: 1000, t: 'x' };
const y = { f: 'Design', i: 1, at: 2000, t: 'y' };
const keys = (r: { answers: { f: string; i: number; at: number }[] }) => r.answers.map(akey);

// First sign-in on a device: nothing is lost from either side.
assert.deepEqual(keys(mergeAnswers([x], [y], [], [])), [akey(x), akey(y)]);
// Deleted on another device: this device's old copy does not bring it back.
assert.deepEqual(keys(mergeAnswers([x, y], [y], [], [[akey(x), 1500]])), [akey(y)]);
// An edit beats the older copy, whichever side has it.
const x2 = { ...x, t: 'x edited', ed: 3000 };
assert.equal(mergeAnswers([x], [x2], [], []).answers[0].t, 'x edited');
assert.equal(mergeAnswers([x2], [x], [], []).answers[0].t, 'x edited');
// Undo after the delete already synced: the restored answer is newer than its tombstone, so it stays.
assert.deepEqual(keys(mergeAnswers([], [{ ...x, ed: 1600 }], [[akey(x), 1500]], [])), [akey(x)]);
// A device whose clock is behind still stamps changes newer than what it saw.
const ahead = Date.now() + 60_000; // one reading of the clock: reading it twice failed whenever a millisecond passed in between
assert.ok(stamp(ahead) > ahead);
// "Made with AI help" travels with the answer: the newer copy wins whole, and on a tie the marked copy is kept, from either side. Only a literal true is a mark.
const made = { ...x, t: 'AI version', ed: 4000, ai: true };
assert.equal(mergeAnswers([x2], [made], [], []).answers[0].ai, true, 'the newer, marked copy wins');
assert.equal(mergeAnswers([made], [x2], [], []).answers[0].ai, true, 'whichever side holds it');
assert.equal(mergeAnswers([{ ...x, ed: 5000 }], [made], [], []).answers[0].ai, undefined, 'a newer own edit of the same answer is the newest version');
assert.equal(mergeAnswers([{ ...made, ed: 6000 }], [{ ...made, ed: 6000, ai: undefined, t: 'same time, unmarked' }], [], []).answers[0].ai, true, 'a tie never drops the mark');
assert.equal(mergeAnswers([{ ...made, ed: 6000, ai: undefined }], [{ ...made, ed: 6000 }], [], []).answers[0].ai, true, 'a tie never drops the mark (other side)');
for (const bad of [false, 'true', 1, null, undefined, {}, []]) assert.equal(cleanAi(bad), undefined, `cleanAi(${JSON.stringify(bad)})`);
assert.equal(cleanAi(true), true);
// Tombstones are capped.
const many: Tomb[] = Array.from({ length: 300 }, (_, k) => [`Design.0.${k}`, k]);
assert.equal(mergeAnswers([], [], many, []).gone.length, 200);

// Next mission: the open one in the current field first, then the other chosen fields in order, then nothing.
const finished: Record<string, number[]> = { Design: [0, 1], Writing: [0, 1, 2], Code: [] };
const doneIn = (f: string) => new Set(finished[f] ?? []);
assert.deepEqual(nextSpot('Design', ['Design', 'Writing'], doneIn), { f: 'Design', i: 2 });
assert.deepEqual(nextSpot('Writing', ['Design', 'Writing', 'Code'], doneIn), { f: 'Design', i: 2 });
assert.deepEqual(nextSpot('Writing', ['Writing', 'Code'], doneIn), { f: 'Code', i: 0 });
assert.equal(nextSpot('Writing', ['Writing'], doneIn), null);
// A field that was never chosen is not suggested, and a gap earlier in the list is found first.
assert.deepEqual(nextSpot('Design', ['Design'], (f) => new Set(f === 'Design' ? [1, 2] : [])), { f: 'Design', i: 0 });

// With 6 missions per field the search runs through both rounds, in order.
const six = (...n: number[]) => (f: string) => new Set(f === 'Design' ? n : []);
assert.deepEqual(nextSpot('Design', ['Design'], six(0, 1, 2, 3), 6), { f: 'Design', i: 4 });
assert.deepEqual(nextSpot('Design', ['Design', 'Code'], six(0, 1, 2, 3, 4, 5), 6), { f: 'Code', i: 0 });
assert.equal(nextSpot('Design', ['Design'], six(0, 1, 2, 3, 4, 5), 6), null);
assert.deepEqual(nextSpot('Design', ['Design'], six(0, 1, 2, 4, 5), 6), { f: 'Design', i: 3 }); // a gap left behind is found

// Rounds: missions come 3 at a time. The round in play is the first with a mission left, or the last one when all are done.
const some = (...n: number[]) => new Set(n);
assert.equal(roundOf(some(), 6), 0);
assert.equal(roundOf(some(0, 1), 6), 0);
assert.equal(roundOf(some(0, 1, 2), 6), 1);
assert.equal(roundOf(some(0, 1, 2, 3), 6), 1);
assert.equal(roundOf(some(0, 1, 2, 3, 4, 5), 6), 1);
assert.equal(roundOf(some(1, 2, 3, 4, 5), 6), 0); // a gap in round 1 keeps round 1 in play
assert.equal(roundOf(some(0, 1, 2), 3), 0); // a field with a single round stays on it

// Stored numbers: a time must be one a Date can hold (else "Invalid Date" and a NaN streak), a count is a whole number up to a ceiling.
assert.ok(inTime(Date.now()) && inTime(0) && inTime(-1e12) && inTime(MAX_TIME));
assert.ok(!Number.isNaN(new Date(MAX_TIME).getTime()), 'the limit itself is a real date');
for (const bad of [1e20, MAX_TIME + 1e4, NaN, Infinity, -Infinity, '1700000000000', null, undefined, {}]) assert.ok(!inTime(bad), `inTime(${String(bad)})`);
assert.equal(clampCount(335), 335);
assert.equal(clampCount(12.9), 12);
assert.equal(clampCount(-5), 0);
assert.equal(clampCount(1e308), MAX_COUNT);
assert.equal(clampCount(1e21), MAX_COUNT);
for (const bad of [NaN, Infinity, '9', null, undefined]) assert.equal(clampCount(bad), 0, `clampCount(${String(bad)})`);

console.log('sync rules: ok');

// Fields side by side: average energy per field, fields with enough reflections first, and a leader only on a clear gap when both sides have at least two.
import { rowsOf, verdict } from '../src/scripts/compare.ts';
const ans = (f: string, ...e: ('flow' | 'ok' | 'drag' | 'easy' | undefined)[]) => e.map((x) => ({ f, r: x ? { e: x } : undefined }));
assert.deepEqual(rowsOf(ans('Code', 'easy', 'drag'), ['Code']), [{ f: 'Code', n: 2, v: 0.25 }]); // "Too easy" counts like "fine", never as a dislike
const rows = rowsOf([...ans('Design', 'flow', 'flow'), ...ans('Writing', 'drag', undefined), ...ans('Code', undefined)], ['Design', 'Writing', 'Code']);
assert.deepEqual(rows, [{ f: 'Design', n: 2, v: 1 }, { f: 'Writing', n: 1, v: 0 }]); // a field with no reflection is left out
assert.equal(verdict(rows), 'early'); // one reflection on Writing is not enough to compare it
assert.equal(verdict(rows.slice(0, 1)), 'none'); // nothing to compare yet
assert.equal(verdict(rowsOf([...ans('Design', 'flow', 'flow'), ...ans('Code', 'drag', 'drag')], ['Design', 'Code'])), 'lead');
assert.equal(verdict(rowsOf([...ans('Design', 'flow', 'ok'), ...ans('Code', 'flow', 'ok')], ['Design', 'Code'])), 'close'); // no gap, no leader
assert.deepEqual(rowsOf([...ans('Video', 'flow'), ...ans('Design', 'flow', 'flow', 'ok')], ['Video', 'Design']).map((r) => r.f), ['Design', 'Video']); // 100% on one beats nothing, but does not top 83% on three

// Co-op with a friend: a link carries one answer (and later the friend's reply) after the #, so it needs no server.
// The link is untrusted input: only the 12 co-op missions (index 2 and 5 of each field), capped text, no control or text-direction characters.
import { COOP_KEYS, MAX_ANSWER, MAX_REPLY, coopUrl, decodeCoop, settleReply, type Coop, type CoopRec } from '../src/scripts/coop.ts';
import { PER_ROUND } from '../src/scripts/next.ts';
const enc = (o: unknown) => '#coop=' + Buffer.from(JSON.stringify(o)).toString('base64url');
const hashOf = (c: Coop) => new URL(coopUrl('https://kern.test', c)).hash;
const out: Coop = { v: 1, f: 'Writing', i: 2, n: 'Giulia', a: 'Tre versioni: 🎉 «divertente», calda, minuscola.' };
assert.deepEqual(decodeCoop(hashOf(out)), out); // accents, quotes and emoji survive the trip
const back: Coop = { ...out, r: 'Terrei la calda, perché è vera.', m: 'Marco' };
assert.deepEqual(decodeCoop(hashOf(back)), back); // the reply link keeps both halves
assert.equal(COOP_KEYS.length, 14);
assert.equal(new Set(COOP_KEYS.map((k) => k.split('.')[0])).size, 7); // two in every field
for (const k of COOP_KEYS) assert.equal(Number(k.split('.')[1]) % PER_ROUND, 2, `${k} is not a with-a-partner mission`);
assert.equal(decodeCoop(enc({ v: 2 })), null); // unknown version
assert.equal(decodeCoop(enc({ ...out, i: 0 })), null); // not a co-op mission
assert.equal(decodeCoop(enc({ ...out, f: '__proto__' })), null);
assert.equal(decodeCoop(enc({ ...out, a: '   ' })), null); // nothing to answer
for (const junk of ['', '#', '#coop=', '#coop=%%%', '#coop=!!!!', '#other=abc', '#coop=' + 'A'.repeat(5000)]) assert.equal(decodeCoop(junk), null);
const dirty = decodeCoop(enc({ ...out, n: 'Mar\u202Eco\u0007', a: 'x'.repeat(MAX_ANSWER + 200), r: 'y'.repeat(MAX_REPLY + 50), m: 'z'.repeat(60) }));
assert.ok(dirty);
assert.equal(dirty.n, 'Marco'); // text-direction and control characters are dropped
assert.equal([...dirty.a].length, MAX_ANSWER);
assert.equal([...dirty.r!].length, MAX_REPLY);
assert.equal([...dirty.m!].length, 20);
assert.equal(decodeCoop(enc({ ...out, n: '\u200B\u200E\u061C' }))!.n, ''); // invisible characters are not a name
assert.equal(decodeCoop(enc({ ...out, a: 'a' + '\n'.repeat(498) + 'b' }))!.a, 'a\n\nb'); // a wall of line breaks cannot stretch the card
assert.ok(coopUrl('https://kern.test', { ...out, a: '🎉'.repeat(MAX_ANSWER), r: '🎉'.repeat(MAX_REPLY) }).length < 4000); // short enough for any chat app

// A reply link arrives for an answer I sent (settleReply never changes the list it is given).
const rec = (o: Partial<CoopRec> = {}): CoopRec => ({ role: 'out', f: 'Writing', i: 2, at: 1000, with: '', mine: out.a, theirs: '', ...o });
const reply = (r: string, m = 'Marco', a = out.a): Coop => ({ ...out, a, r, m });
const wait = [rec()], waitCopy = JSON.stringify(wait);
const done = settleReply(wait, reply('La calda.'), 5000);
assert.equal(done.status, 'done');
assert.deepEqual(done.coops, [rec({ with: 'Marco', theirs: 'La calda.' })]);
assert.equal(JSON.stringify(wait), waitCopy); // the input is untouched
assert.equal(settleReply(done.coops, reply('La calda.'), 6000).status, 'same'); // opening the same link twice changes nothing
const second = settleReply(done.coops, reply('La buffa.', 'Anna'), 7000); // a second friend answers the same text: its own row, the first reply stays
assert.equal(second.status, 'again');
assert.deepEqual(second.coops.map((r) => [r.with, r.theirs]), [['Marco', 'La calda.'], ['Anna', 'La buffa.']]);
const edited = settleReply([rec({ mine: 'old text' })], reply('Ok.'), 8000); // the answer was edited after it was sent: the waiting row takes the reply and shows what was really sent
assert.equal(edited.status, 'done');
assert.equal(edited.coops[0].mine, out.a);
assert.equal(settleReply([], reply('Ciao.'), 9000).status, 'stranger'); // nothing of mine is waiting: nothing is stored
assert.equal(settleReply([rec({ i: 5 })], reply('Ciao.'), 9000).status, 'stranger'); // a reply about another mission does not fill this one
const mineBack = [rec({ role: 'in', mine: 'La calda.', theirs: out.a, with: 'Giulia' })];
assert.equal(settleReply(mineBack, reply('La calda.', 'Io'), 9000).status, 'own'); // the reply link I sent, opened on my own device
const crowd = Array.from({ length: 30 }, (_, k) => rec({ at: k + 1, theirs: 'x', mine: 'm' + k }));
assert.equal(settleReply([...crowd.slice(0, 29), rec({ at: 99, theirs: 'x' })], reply('Y', 'Z'), 1).coops.length <= 30, true); // the list stays capped

// Make a first version: the request keeps the server's limits, the reply is read from `text` (never `reply`), a pause is not an AI text, every error says what to do, and a project has 3 a day.
assert.ok(!canMake('x'.repeat(19)) && !canMake(`  ${'x'.repeat(19)}  `) && canMake('x'.repeat(20)));
const mb = makeBody('it', 'Video', `  ${'m'.repeat(250)}  `, `  ${'i'.repeat(2000)}  `, [{ q: 'q'.repeat(400), a: ' a ' }, { q: '', a: 'no question' }, { q: 'no answer', a: '  ' }, ...Array.from({ length: 6 }, (_, k) => ({ q: `Q${k}`, a: `A${k}` }))]);
assert.deepEqual([mb.mode, mb.lang, mb.field, mb.mission.length, mb.idea.length], ['make', 'it', 'Video', 200, 1500]);
assert.equal(mb.qa?.length, 4, 'at most 4 pairs, empty ones dropped');
assert.deepEqual(mb.qa?.[0], { q: 'q'.repeat(300), a: 'a' }, 'each part is trimmed and cut to 300');
assert.equal('qa' in makeBody('en', 'Design', 'Poster', 'x'.repeat(30)), false, 'no pairs, no qa key');
assert.deepEqual(parseMake(200, { text: 'Title\nBody [name]', ai: true }), { kind: 'text', text: 'Title\nBody [name]' });
assert.deepEqual(parseMake(200, { reply: 'This sounds heavy...' }), { kind: 'pause', reply: 'This sounds heavy...' }, 'a pause is shown as it is, not as AI-made');
for (const odd of [{ text: 'no ai flag' }, { text: '', ai: true }, { reply: 'x', text: 'y' }, {}, null, 'text']) assert.equal(parseMake(200, odd).kind, 'error', `200 with ${JSON.stringify(odd)}`);
assert.deepEqual(parseMake(429, { error: 'rate' }), { kind: 'error', why: 'rate' });
assert.deepEqual(parseMake(429, { error: 'rate_day' }), { kind: 'error', why: 'day' });
assert.deepEqual(parseMake(400, { error: 'too_short', in: 'idea' }), { kind: 'error', why: 'short' });
assert.deepEqual(parseMake(400, { error: 'bad_qa', in: 'qa' }), { kind: 'error', why: 'unusable' });
assert.deepEqual(parseMake(502, { error: 'empty' }), { kind: 'error', why: 'unusable' });
for (const [status, error] of [[503, 'no_key'], [502, 'upstream'], [500, ''], [404, 'x']] as const) assert.deepEqual(parseMake(status, { error }), { kind: 'error', why: 'down' }, `${status} ${error}`);
const day = '2026-10-11';
assert.equal(makesToday(null, 'Video.0', day), 0);
let box: string | null = null;
for (let k = 1; k <= MAKE_PER_DAY; k++) { box = countMake(box, 'Video.0', day); assert.equal(makesToday(box, 'Video.0', day), k); }
assert.equal(makesLeft(box, 'Video.0', day), 0, 'three first versions a day per project');
assert.equal(makesLeft(box, 'Video.1', day), MAKE_PER_DAY, 'another project has its own three');
assert.equal(makesToday(box, 'Video.0', '2026-10-12'), 0, 'a new day starts again');
for (const bad of ['{', '[]', '{"d":"2026-10-11","n":null}', '{"d":"2026-10-11","n":{"Video.0":"2"}}', '{"d":"2026-10-11","n":{"Video.0":-5}}']) assert.ok(makesToday(bad, 'Video.0', day) <= 0, `unreadable storage counts as zero: ${bad}`);
assert.equal(makesToday(countMake('{', 'Video.0', day), 'Video.0', day), 1, 'a broken record is replaced');
