// Turns the usage log (table kern_events, see supabase/schema.sql) into the numbers for the pitch.
// No network and no files here, so `npm test` can check the maths. scripts/stats.mjs fetches the rows and prints this.
// Everything counts people who OPTED IN to anonymous counts, not everyone who used KERN: say so when you quote it.

export const PER_ROUND = 3; // missions per round; check-content.mjs fails if this drifts from src/scripts/next.ts
const SMALL_SAMPLE = 30; // below this many people a percentage says nothing, so the report shows counts only

export const pct = (n, d) => (d >= SMALL_SAMPLE ? `${n} of ${d} (${Math.round((100 * n) / d)}%)` : `${n} of ${d}`);

const dayOf = (when, tz) => new Date(when).toLocaleDateString('en-CA', { timeZone: tz }); // 'YYYY-MM-DD' on the wall clock in tz
const daysBetween = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
const addDays = (day, n) => new Date(Date.parse(day) + n * 864e5).toISOString().slice(0, 10);
const peopleIn = (map) => new Set([...map.values()].map((r) => r.aid)).size;

export function summarize(rows, { now = Date.now(), tz = 'Europe/Rome' } = {}) {
  const today = dayOf(now, tz);
  const sorted = [...rows].sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));
  const who = new Map(); // aid -> { days, lang }
  const seen = { open: new Map(), answer: new Map(), reflect: new Map() }; // 'aid|field|mission' -> row: one entry per person and mission
  const did = { share: new Set(), ask_ai: new Set() };
  for (const r of sorted) {
    const p = who.get(r.aid) || { days: new Set(), lang: 'en' };
    p.days.add(dayOf(r.created_at, tz)); p.lang = r.lang || p.lang; who.set(r.aid, p);
    if (seen[r.ev] && r.field != null && r.mission != null) seen[r.ev].set(`${r.aid}|${r.field}|${r.mission}`, r);
    did[r.ev]?.add(r.aid);
  }

  // Finished a round = answered all PER_ROUND missions of one round in one field.
  const answered = new Map(); // 'aid|field' -> Set of mission numbers
  for (const r of seen.answer.values()) { const k = `${r.aid}|${r.field}`; answered.set(k, (answered.get(k) || new Set()).add(r.mission)); }
  const finishedRound = new Set();
  for (const [k, missions] of answered) {
    for (const m of missions) if (m % PER_ROUND === 0 && [...Array(PER_ROUND).keys()].every((j) => missions.has(m + j))) finishedRound.add(k.split('|')[0]);
  }
  const startedRound2 = new Set([...seen.open.values(), ...seen.answer.values()].filter((r) => r.mission >= PER_ROUND).map((r) => r.aid));

  const first = new Map([...who].map(([aid, p]) => [aid, [...p.days].sort()[0]]));
  const cohort = (n) => { // people whose day n is over (so not today), and how many of them were active exactly n days after their first day
    const eligible = [...who].filter(([aid]) => daysBetween(first.get(aid), today) > n);
    return { eligible: eligible.length, count: eligible.filter(([aid, p]) => p.days.has(addDays(first.get(aid), n))).length };
  };
  const cameBack = [...who].filter(([aid]) => first.get(aid) < today);

  const rollup = (keyOf, base) => { // people who opened, and people who answered, per key
    const t = new Map();
    for (const [stage, map] of [['opened', seen.open], ['answered', seen.answer]]) {
      for (const r of map.values()) {
        const k = keyOf(r), e = t.get(k) || { ...base(r), opened: 0, answered: 0 };
        e[stage] += 1;
        if (e.brand !== undefined) e.brand = e.brand || !!r.brand; // a mission counts as a brand mission if any row says so
        t.set(k, e);
      }
    }
    return [...t.values()].sort((a, b) => b.opened - a.opened || a.field.localeCompare(b.field) || (a.mission ?? 0) - (b.mission ?? 0));
  };
  const split = (flag) => ({ opened: [...seen.open.values()].filter((r) => !!r.brand === flag).length, answered: [...seen.answer.values()].filter((r) => !!r.brand === flag).length });

  const langs = { en: 0, it: 0, de: 0, fr: 0, nl: 0, sv: 0, es: 0 };
  for (const p of who.values()) if (p.lang in langs) langs[p.lang] += 1;
  const days = [...who.values()].flatMap((p) => [...p.days]).sort();
  const answerers = peopleIn(seen.answer);

  return {
    people: who.size, firstDay: days[0] || '', lastDay: days.at(-1) || '', langs,
    funnel: { optedIn: who.size, opened: peopleIn(seen.open), answered: answerers, reflected: peopleIn(seen.reflect), finishedRound: finishedRound.size, startedRound2: startedRound2.size, shared: did.share.size, askedAi: did.ask_ai.size },
    returned: { eligible: cameBack.length, count: cameBack.filter(([, p]) => p.days.size >= 2).length },
    d1: cohort(1), d7: cohort(7),
    answersPerAnswerer: answerers ? seen.answer.size / answerers : 0,
    reflection: { reflected: seen.reflect.size, answered: seen.answer.size },
    byField: rollup((r) => r.field, (r) => ({ field: r.field })),
    byMission: rollup((r) => `${r.field}.${r.mission}`, (r) => ({ field: r.field, mission: r.mission, brand: !!r.brand })),
    brand: { brand: split(true), plain: split(false) },
  };
}

export function format(s) {
  if (!s.people) return 'No one has opted in yet, so there is nothing to count. People are asked once on the Home screen.';
  const f = s.funnel, n = s.people, row = (label, text) => `  ${label.padEnd(34)}${text}`;
  return [
    'KERN usage: people who said yes to anonymous counts',
    `${s.firstDay} to ${s.lastDay} (Europe/Rome days) · ${n} ${n === 1 ? 'person' : 'people'} · EN ${s.langs.en} · IT ${s.langs.it} · DE ${s.langs.de} · FR ${s.langs.fr} · NL ${s.langs.nl} · SV ${s.langs.sv}`,
    ...(n < SMALL_SAMPLE ? [`Small sample (under ${SMALL_SAMPLE} people): quote counts like "3 of 4 wrote an answer", not percentages, and say how many people you invited.`] : []),
    '',
    'What people did',
    row('Opened a mission', pct(f.opened, n)),
    row('Wrote an answer', pct(f.answered, n)),
    row('Reflected after an answer', pct(f.reflected, n)),
    row(`Finished all ${PER_ROUND} of a round`, pct(f.finishedRound, n)),
    row('Started round 2', pct(f.startedRound2, n)),
    row('Shared the card or a dare', pct(f.shared, n)),
    row('Asked Slash for help', pct(f.askedAi, n)),
    row('Answers per person who answered', s.answersPerAnswerer.toFixed(1)),
    row('Answers followed by a reflection', pct(s.reflection.reflected, s.reflection.answered)),
    '',
    'Coming back (only people old enough to have come back)',
    row('Came back on another day', pct(s.returned.count, s.returned.eligible)),
    row('Back the very next day (day 1)', pct(s.d1.count, s.d1.eligible)),
    row('Back a week later (day 7)', pct(s.d7.count, s.d7.eligible)),
    '',
    'By field (missions opened, then answered: each person counts once per mission)',
    ...s.byField.map((x) => row(x.field, `${x.opened} opened, ${x.answered} answered`)),
    '',
    'By mission (people who opened, then answered)',
    ...s.byMission.map((x) => row(`${x.field} ${x.mission + 1}${x.brand ? ' · brand' : ''}`, `${x.opened} opened, ${x.answered} answered`)),
    '',
    `Brand missions: ${s.brand.brand.opened} opened, ${s.brand.brand.answered} answered. Other missions: ${s.brand.plain.opened} opened, ${s.brand.plain.answered} answered.`,
  ].join('\n');
}
