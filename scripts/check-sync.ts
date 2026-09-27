// Checks the sync rules in src/scripts/sync.ts. Run: npm test (Node 22.18+ runs .ts directly).
import assert from 'node:assert/strict';
import { akey, mergeAnswers, stamp, type Tomb } from '../src/scripts/sync.ts';

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
assert.ok(stamp(Date.now() + 60_000) > Date.now() + 60_000);
// Tombstones are capped.
const many: Tomb[] = Array.from({ length: 300 }, (_, k) => [`Design.0.${k}`, k]);
assert.equal(mergeAnswers([], [], many, []).gone.length, 200);

console.log('sync rules: ok');
