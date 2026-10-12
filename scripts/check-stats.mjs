// Checks the numbers in the usage report (scripts/stats-core.mjs) against a small made-up log whose answers
// are worked out by hand. Run: npm test
import assert from 'node:assert/strict';
import { summarize, format, pct } from './stats-core.mjs';

const NOW = Date.parse('2026-10-09T10:00:00Z');
const row = (aid, ev, at, f = null, m = null, extra = {}) => ({ aid, ev, field: f, mission: m, brand: false, lang: 'en', created_at: at, ...extra });

// A: three Design missions in round 1, a reflection, and comes back at 00:30 Rome time (still 7 Oct in UTC: only the timezone makes this day 1).
// B: opens one mission, never answers, returns on day 2. C: a brand mission, a share and an AI question. D: opted in today, starts round 2.
const rows = [
  row('A', 'optin', '2026-10-07T09:00:00Z'),
  row('A', 'open', '2026-10-07T09:01:00Z', 'Design', 0), row('A', 'answer', '2026-10-07T09:05:00Z', 'Design', 0), row('A', 'reflect', '2026-10-07T09:06:00Z', 'Design', 0),
  row('A', 'open', '2026-10-07T09:07:00Z', 'Design', 1), row('A', 'answer', '2026-10-07T09:10:00Z', 'Design', 1),
  row('A', 'open', '2026-10-07T09:11:00Z', 'Design', 2), row('A', 'answer', '2026-10-07T09:15:00Z', 'Design', 2),
  row('A', 'open', '2026-10-07T09:20:00Z', 'Design', 0), // the same mission opened again: still one person who opened it
  row('A', 'visit', '2026-10-07T22:30:00Z'),
  row('B', 'optin', '2026-10-07T12:00:00Z', null, null, { lang: 'it' }), row('B', 'open', '2026-10-07T12:01:00Z', 'Design', 0, { lang: 'it' }), row('B', 'visit', '2026-10-09T08:00:00Z', null, null, { lang: 'it' }),
  row('C', 'optin', '2026-10-08T10:00:00Z', null, null, { lang: 'it' }), row('C', 'open', '2026-10-08T10:01:00Z', 'Writing', 1, { brand: true, lang: 'it' }),
  row('C', 'ask_ai', '2026-10-08T10:02:00Z', 'Writing', 1, { brand: true, lang: 'it' }), row('C', 'answer', '2026-10-08T10:05:00Z', 'Writing', 1, { brand: true, lang: 'it' }),
  row('C', 'share', '2026-10-08T10:06:00Z', null, null, { lang: 'it' }),
  row('D', 'optin', '2026-10-09T08:30:00Z', null, null, { lang: 'de' }), row('D', 'open', '2026-10-09T08:31:00Z', 'Code', 3, { lang: 'de' }), row('D', 'answer', '2026-10-09T08:35:00Z', 'Code', 3, { lang: 'de' }),
];

const s = summarize(rows, { now: NOW });
assert.equal(s.people, 4, 'four different people');
assert.deepEqual(s.funnel, { optedIn: 4, opened: 4, answered: 3, reflected: 1, finishedRound: 1, startedRound2: 1, shared: 1, askedAi: 1 });
assert.deepEqual(s.returned, { eligible: 3, count: 2 }, 'A and B came back on another day; D started today so cannot have yet');
assert.deepEqual(s.d1, { eligible: 2, count: 1 }, 'C started yesterday, so its day 1 (today) is not over and C is not counted; of A and B only A was active exactly the next day (Rome time)');
assert.deepEqual(s.d7, { eligible: 0, count: 0 }, 'nobody is old enough for day 7');
assert.equal(s.answersPerAnswerer, (3 + 1 + 1) / 3);
assert.deepEqual(s.reflection, { reflected: 1, answered: 5 });
assert.deepEqual(s.byField.find((x) => x.field === 'Design'), { field: 'Design', opened: 4, answered: 3 }, 'opens count people per mission, not repeat opens');
assert.deepEqual(s.byField.map((x) => x.field).sort(), ['Code', 'Design', 'Writing']);
assert.deepEqual(s.byMission.find((x) => x.field === 'Design' && x.mission === 0), { field: 'Design', mission: 0, brand: false, opened: 2, answered: 1 });
assert.deepEqual(s.brand, { brand: { opened: 1, answered: 1 }, plain: { opened: 5, answered: 4 } });
assert.deepEqual(s.langs, { en: 1, it: 2, de: 1, fr: 0, nl: 0, sv: 0 }, 'D uses KERN in German');
assert.equal(s.firstDay, '2026-10-07');

// Only the timezone moves A's last event to the next day: in UTC A never came back.
assert.equal(summarize(rows, { now: NOW, tz: 'UTC' }).d1.count, 0, 'the timezone option is respected');

// Nothing logged yet: the report still works.
assert.equal(summarize([], { now: NOW }).people, 0);
assert.ok(format(summarize([], { now: NOW })).includes('No one has opted in yet'));

// Small numbers are shown as counts, never as percentages, and a small sample is called out.
assert.equal(pct(3, 4), '3 of 4');
assert.equal(pct(6, 12), '6 of 12', 'no percentage under 30');
assert.equal(pct(15, 30), '15 of 30 (50%)');
assert.equal(pct(0, 0), '0 of 0');
const text = format(s);
assert.ok(text.includes('Small sample'), 'under 30 people is flagged');
assert.ok(!text.includes('%'), 'no percentages from 4 people');

// The same log in any order gives the same numbers (rows are sorted by time; the latest language wins).
assert.deepEqual(summarize([...rows].reverse(), { now: NOW }), s, 'row order does not matter');
assert.deepEqual(summarize([...rows, ...rows], { now: NOW }), s, 'a row sent twice counts once');

// Rounds: answering missions 3, 4, 5 finishes round 2; 1, 2, 3 is not a round.
const answers = (aid, field, missions) => missions.flatMap((m) => [row(aid, 'open', '2026-10-08T09:00:00Z', field, m), row(aid, 'answer', '2026-10-08T09:05:00Z', field, m)]);
const rounds = summarize([...answers('E', 'Selling', [3, 4, 5]), ...answers('F', 'Selling', [1, 2, 3]), ...answers('G', 'Selling', [0, 1, 2]), ...answers('H', 'Code', [0, 1]).concat(answers('H', 'Music', [2]))], { now: NOW });
assert.equal(rounds.funnel.finishedRound, 2, 'E (round 2) and G (round 1); F is not aligned and H spread three missions over two fields');
assert.equal(rounds.funnel.startedRound2, 2, 'E and F touched a mission from round 2');

// Day 7 across a month end, and the clocks going back in Rome on 25 October 2026 (a naive 24-hour step would skip a day).
const long = summarize([row('M', 'optin', '2026-09-28T10:00:00Z'), row('M', 'visit', '2026-10-05T10:00:00Z'), row('N', 'optin', '2026-09-28T10:00:00Z'), row('N', 'visit', '2026-10-04T10:00:00Z')], { now: NOW });
assert.deepEqual(long.d7, { eligible: 2, count: 1 }, 'M came back exactly 7 days later (28 Sep to 5 Oct), N after 6');
const dst = summarize([row('P', 'optin', '2026-10-24T22:30:00Z'), row('P', 'visit', '2026-10-25T23:30:00Z')], { now: Date.parse('2026-10-28T12:00:00Z') });
assert.deepEqual(dst.d1, { eligible: 1, count: 1 }, '00:30 on 25 Oct and 00:30 on 26 Oct in Rome are consecutive days');

// Odd rows: only visits, no field or mission, a brand flag that disagrees between rows of one mission.
const odd = summarize([row('V', 'visit', '2026-10-08T10:00:00Z'), row('W', 'open', '2026-10-08T10:00:00Z', 'Code', 0, { brand: false }), row('X', 'open', '2026-10-08T10:00:00Z', 'Code', 0, { brand: true })], { now: NOW });
assert.equal(odd.people, 3);
assert.equal(odd.funnel.opened, 2, 'a person with only visits never opened a mission');
assert.equal(odd.byMission[0].brand, true, 'one brand row makes it a brand mission');

// Thirty people is enough for percentages and no longer a small sample.
const crowd = Array.from({ length: 30 }, (_, k) => row('U' + k, 'optin', '2026-10-08T10:00:00Z'));
const crowdText = format(summarize(crowd, { now: NOW }));
assert.ok(crowdText.includes('%') && !crowdText.includes('Small sample'));
console.log('stats: ok');
