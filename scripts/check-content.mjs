// Checks that every mission is complete and translated: same count in all four data files, rounds of 3,
// 3 steps / 3 quality bars / 3 hints each, and an Italian text for every string. Run: npm test
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { buildSync } from 'esbuild';
import { PER_ROUND as STATS_PER_ROUND } from './stats-core.mjs';

// The data files import each other without extensions, so bundle them in memory instead of importing directly.
const entry = ['fields', 'missions', 'helps', 'easy', 'i18n', 'next', 'sponsors', 'loot', 'demo', 'play', 'fieldinfo', 'coopask', 'projects', 'trending', 'pieces', 'i18n-de', 'i18n-fr', 'i18n-nl', 'i18n-sv'].map((f) => `export * from './src/scripts/${f}.ts';`).join('\n');
const { text } = buildSync({ stdin: { contents: entry, resolveDir: process.cwd(), loader: 'ts' }, bundle: true, format: 'esm', platform: 'node', write: false }).outputFiles[0];
const { FIELDS, MX, HELPS, EASY, IT, DE, FR, NL, SV, CLASHES, PER_ROUND, TREND_FROM, TRENDING, SPONSORS, RELICS, SAMPLE_ANSWERS, SAMPLE_IDEA, sampleChat, swapSample, PLAY } = await import(`data:text/javascript;base64,${Buffer.from(text).toString('base64')}`);

const strings = (v) => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : []);
// supabase/schema.sql limits kern_signs.mission and kern_events.mission to 0..MAX_MISSIONS-1: widen both there before adding a round.
const MAX_MISSIONS = 6;

// A brand deal points at a real mission and has a name and a #rrggbb colour.
for (const [key, s] of Object.entries(SPONSORS)) {
  const [f, i] = key.split('.');
  assert.ok(FIELDS[f] && /^\d$/.test(i) && Number(i) < FIELDS[f].m.length, `sponsors.ts: "${key}" is not a mission`);
  assert.ok(s.name?.trim() && /^#[0-9a-f]{6}$/i.test(s.color), `sponsors.ts: "${key}" needs a name and a #rrggbb colour`);
  assert.ok(!/demo/i.test(s.name), `sponsors.ts: "${key}" says demo, which a real user would take for the demo profile: use (sample)`);
  const brand = s.name.replace(/\s*\(sample\)$/, '');
  assert.ok(MX[f][i].who.includes(brand), `sponsors.ts: "${key}" names ${brand}, but that mission is about "${MX[f][i].who}"`);
}
// The demo profile's sample trail (src/scripts/demo.ts): real missions and drops, both languages, inside the field limits, and a language switch swaps it back and forth.
const DROPS = ['spark', 'gem', 'jackpot', ...RELICS.map((r) => r.id)], taken = new Set();
for (const d of SAMPLE_ANSWERS) {
  const at = `demo.ts: ${d.f}.${d.i}`;
  assert.ok(FIELDS[d.f]?.m[d.i], `${at} is not a mission`);
  assert.ok(!taken.has(`${d.f}.${d.i}`), `${at} appears twice`);
  taken.add(`${d.f}.${d.i}`);
  assert.ok(!d.d || DROPS.includes(d.d), `${at}: "${d.d}" is not a drop`);
  for (const [name, pair, max] of [['t', d.t, 2000], ['hard', d.hard, 140], ['tip', d.tip, 140]]) {
    if (!pair) continue;
    assert.ok(pair[0].trim() && pair[1].trim() && pair[0] !== pair[1], `${at}.${name}: needs an English and a different Italian text`);
    assert.ok(pair[0].length <= max && pair[1].length <= max, `${at}.${name}: over ${max} characters`);
    assert.equal(swapSample(pair[0], pair, true), pair[1]);
    assert.equal(swapSample(pair[1], pair, false), pair[0]);
    assert.equal(swapSample('a visitor wrote this', pair, true), 'a visitor wrote this', `${at}.${name}: a text of the visitor's own must stay`);
  }
}
for (const [en, it] of SAMPLE_IDEA) assert.ok(en.trim() && it.trim() && en !== it && en.length <= 140 && it.length <= 140, `demo.ts: an idea version needs two different texts of at most 140 characters ("${en.slice(0, 30)}")`);
for (const m of sampleChat(true)) if (m.who === 'ai') assert.ok(IT[m.t], `demo.ts: no Italian for the coach line "${m.t.slice(0, 50)}"`);
assert.equal(sampleChat(false).length, SAMPLE_IDEA.length * 2, 'demo.ts: every idea version is followed by one coach line');
assert.equal(STATS_PER_ROUND, PER_ROUND, 'scripts/stats-core.mjs counts finished rounds with its own PER_ROUND: update it to match src/scripts/next.ts');
assert.deepEqual(CLASHES, [],'the same English text has two different Italian versions, one overwrites the other');
// One apostrophe style in Italian: a straight one between letters (l'app) stands out next to the typographic one (l’app) used everywhere else.
for (const [en, it] of Object.entries(IT)) assert.ok(!/\p{L}'\p{L}/u.test(it), `i18n: the Italian for "${en.slice(0, 50)}" has a straight apostrophe, write ’`);
// The Italian "lavor-" family (lavoro, lavori, lavorare...) never appears anywhere a person reads in the app. Since 2026-10-11 the other job-world words are allowed.
const BANNED_UI = /lavor/i;
const banned = Object.entries(IT).filter(([en, it]) => BANNED_UI.test(en) || BANNED_UI.test(it)).map(([en]) => en.slice(0, 50));
assert.deepEqual(banned, [], `i18n: job-world words in the app copy: ${banned.join(' | ')}`);

// The app counts rounds from the current field and searches the other fields with that count, so all fields must match.
// Every category has the same core projects (the two rounds), then its Trending ones from trending.ts, which rounds, tips and counts do not know. scripts/check-trending.mjs checks those.
const trendIn = (f) => TRENDING.filter((t) => t.f === f).length;
const counts = [...new Set(Object.entries(FIELDS).map(([f, v]) => v.m.length - trendIn(f)))];
assert.equal(counts.length, 1, `every field needs the same number of missions, found ${counts.join(', ')}`);
assert.equal(counts[0], TREND_FROM, `trending.ts: the Trending projects start at index ${TREND_FROM}, but a category has ${counts[0]} core projects`);
assert.ok(counts[0] <= MAX_MISSIONS, `${counts[0]} missions per field, but supabase/schema.sql only accepts signs on missions 0-${MAX_MISSIONS - 1}`);

for (const f of Object.keys(FIELDS)) {
  const n = TREND_FROM, t = trendIn(f); // the core projects, and the Trending ones after them (they have no easy version and no "Do it here")
  assert.ok(n >= PER_ROUND && n % PER_ROUND === 0, `${f}: missions come in rounds of ${PER_ROUND}, found ${n}`);
  for (const [name, list, want] of [['MX', MX[f], n + t], ['HELPS', HELPS[f], n + t], ['EASY', EASY[f], n]]) assert.equal(list?.length, want, `${f}: ${name} has ${list?.length} entries, fields.ts has ${want}`);
  assert.equal(new Set(FIELDS[f].m.map((m) => m[1])).size, n + t, `${f}: two missions share a title`);

  for (let i = 0; i < n; i++) {
    const at = `${f} #${i}`, m = FIELDS[f].m[i], x = MX[f][i], h = HELPS[f][i], e = EASY[f][i];
    assert.equal(m.length, 3, `${at}: fields.ts entry needs label, title, blurb`);
    assert.equal(x.steps.length, 3, `${at}: needs 3 steps`);
    assert.equal(x.bar.length, 3, `${at}: needs 3 quality bars`);
    assert.equal(h.hints.length, 3, `${at}: needs 3 hints`);
    assert.equal(e.steps.length, 3, `${at}: easy version needs 3 steps`);
    assert.ok(Number.isInteger(x.mins) && x.mins >= 2 && x.mins <= 5, `${at}: mins ${x.mins} is outside 2-5 (missions are snackable)`);
    assert.equal(typeof x.asset.mono, 'boolean', `${at}: asset.mono must be true or false`);
    for (const [k, v] of Object.entries({ who: x.who, brief: x.brief, twist: x.twist, ex: h.ex, easyBrief: e.brief, easyEx: e.ex })) assert.ok(v.trim(), `${at}: ${k} is empty`);
    if (x.asset.video) assert.ok(existsSync(`public${x.asset.video}`), `${at}: clip ${x.asset.video} is missing from public/`);
    for (const s of strings([m, x, h, e]).filter((t) => !t.startsWith('/img/m/') && !t.startsWith('/media/'))) { // picture and clip paths are files, not copy (check-design.mjs checks the pictures)
      assert.ok(IT[s], `${at}: no Italian for "${s.slice(0, 60)}"`);
      assert.ok(s.length < 25 || IT[s] !== s, `${at}: Italian is the same as English for "${s.slice(0, 60)}"`);
    }
  }
}
// Do it here (play.ts and play-*.ts): every mission can be done by tapping or dragging, and every group is usable.
for (const f of Object.keys(FIELDS)) for (let i = 0; i < TREND_FROM; i++) {
  const p = PLAY[`${f}.${i}`], at = `play ${f}.${i}`;
  assert.ok(Array.isArray(p) && p.length >= 1 && p.length <= 3, `${at}: needs 1 to 3 groups`);
  for (const g of p) {
    assert.ok(g.label && (g.out || g.kind === 'beat') && g.items.length >= 2 && g.items.length <= 10, `${at}: a group needs a label, an out (a beat's rows name its lines) and 2 to 10 items`);
    if (g.kind === 'pick') assert.ok(g.max >= 1 && g.max <= g.items.length, `${at}: max must be between 1 and the number of items`);
    else if (g.kind === 'beat') assert.equal(g.items.length, 3, `${at}: a beat has three rows, kick, snare and hat in that order (play.ts DRUMS)`);
    else assert.ok(g.kind === 'sort' && g.cutOut && g.cut >= 0 && g.cut < g.items.length, `${at}: a sort needs cutOut and a cut smaller than its rows`);
    for (const s of [g.label, g.out, g.rest, g.cutOut, g.badge, g.sum?.label, ...(g.kind === 'beat' ? g.items : [])].filter(Boolean)) assert.ok(IT[s], `${at}: no Italian for "${s}"`);
    const sounds = [g.hear?.bed, g.hear?.drop, ...(g.hear?.cues ?? []).map(([f]) => f), ...(g.kind === 'sort' ? g.items.map((r) => r.a) : [])].filter(Boolean);
    for (const f of sounds) assert.ok(existsSync(`public${f}`), `${at}: sound ${f} is missing from public/`);
  }
}
// German, French, Dutch and Swedish: every English text has all four (src/scripts/i18n-de.ts, i18n-fr.ts, i18n-nl.ts and i18n-sv.ts), with none of the job-world words of that language,
// nor the English or Italian ones. The texts are the IT keys of the modules above plus the ones app.ts registers itself with t2('...', ...) (it needs a browser, so they are read from its source).
const appPairs = [...readFileSync('src/scripts/app.ts', 'utf8').matchAll(/\bt2\((['"])(.*?)\1, (['"])(.*?)\3\)/g)].map((m) => [m[2], m[4]]);
assert.ok(appPairs.length > 40, `app.ts: expected its own t2() texts, found ${appPairs.length}`);
const appClash = appPairs.filter(([en, it]) => IT[en] !== undefined && IT[en] !== it).map(([en]) => en);
assert.deepEqual(appClash, [], 'app.ts registers these English texts with a different Italian than the rest of the app');
const KEYS = [...new Set([...Object.keys(IT), ...appPairs.map(([en]) => en)])], missing = [];
for (const [name, L, BANNED] of [['German', DE, /lavor/i], ['French', FR, /lavor/i], ['Dutch', NL, /lavor/i], ['Swedish', SV, /lavor/i]]) {
  const bad = Object.entries(L).filter(([, v]) => BANNED.test(v) || BANNED_UI.test(v)).map(([en]) => en.slice(0, 50));
  assert.deepEqual(bad, [], `i18n: job-world words in the ${name} copy: ${bad.join(' | ')}`);
  const none = KEYS.filter((k) => !L[k]);
  if (none.length) missing.push(`${name}: ${none.length} of ${KEYS.length} texts have no translation (first: "${none[0].slice(0, 60)}")`);
}
// KERN_DEFR_LATER=1: a content branch whose German, French, Dutch and Swedish come in a separate file later (the banned words above are still checked).
if (process.env.KERN_DEFR_LATER) console.log(`i18n: German, French, Dutch and Swedish skipped for now (${missing.join('. ') || 'complete'})`);
else assert.deepEqual(missing, [], `i18n: German, French, Dutch and Swedish are not complete. ${missing.join('. ')}`);
// Every translation keeps the blanks the code fills ({n}, {f}...) and the links, or a sentence would show "{n}" or lose its link.
const blanks = (t) => [...t.matchAll(/\{\w+\}|href="[^"]*"/g)].map((m) => m[0]).sort().join(' ');
const holes = [];
for (const [name, L] of [['IT', IT], ['DE', DE], ['FR', FR], ['NL', NL], ['SV', SV]]) for (const k of KEYS) if (L[k] && blanks(L[k]) !== blanks(k)) holes.push(`${name}: "${k.slice(0, 50)}" has ${blanks(L[k]) || 'none'}, wants ${blanks(k) || 'none'}`);
assert.deepEqual(holes, [], `i18n: a translation lost or added a blank or link: ${holes.slice(0, 6).join(' | ')}`);
// Dutch and Swedish are new (2026-10-12): a text of 25 characters or more that is still the English one is a missing translation, not a name.
const english = [['NL', NL], ['SV', SV]].flatMap(([name, L]) => KEYS.filter((k) => k.length >= 25 && L[k] === k && !/^(Practice project · |[^a-z]*$)/.test(k)).map((k) => `${name}: ${k.slice(0, 50)}`));
assert.deepEqual(english, [], `i18n: still English in Dutch or Swedish: ${english.slice(0, 6).join(' | ')}`);
// One word for the work: "project" in every language (since 2026-10-12), never "mission" or its translations.
const WORK = [['EN', Object.fromEntries(KEYS.map((k) => [k, k])), /\bmissions?\b/i], ['IT', IT, /\bmission[ei]\b/i], ['DE', DE, /\bMission(en)?\b/i], ['FR', FR, /\bmissions?\b/i], ['NL', NL, /\bmissies?\b/i], ['SV', SV, /\buppdrag/i]];
const missions = WORK.flatMap(([name, L, re]) => KEYS.filter((k) => L[k] && re.test(L[k])).map((k) => `${name}: ${L[k].slice(0, 50)}`));
assert.deepEqual(missions, [], `i18n: the app says "project", not "mission": ${missions.slice(0, 6).join(' | ')}`);

// Static text in src/pages/index.astro is translated at run time through the class list `kTxt` in app.ts (it remembers the English innerHTML and looks it up). A text on one of those elements
// that has no Italian, German, French, Dutch and Swedish entry would silently stay English, so every one is checked here. Text built in code is covered by t2() above.
const page = readFileSync('src/pages/index.astro', 'utf8').replace(/^---[\s\S]*?\n---\n/, '');
const kTxtSrc = readFileSync('src/scripts/app.ts', 'utf8').match(/const kTxt = kScr\.querySelectorAll<HTMLElement>\('([^']+)'\)/)?.[1];
assert.ok(kTxtSrc, 'app.ts: the kTxt selector list was not found');
const VOID = new Set(['br', 'img', 'input', 'hr', 'meta', 'link']);
const classTokens = new Set([...kTxtSrc.matchAll(/\.([\w-]+)/g)].map((m) => m[1]));
const staticTexts = [];
{
  const re = /<(\/?)([a-zA-Z0-9]+)((?:[^>"']|"[^"]*"|'[^']*')*)>/g, stack = [];
  let m;
  while ((m = re.exec(page))) {
    const [raw, close, tag, attrs] = m;
    if (close) { const top = stack.pop(); if (top?.watch) { const html = page.slice(top.end, m.index).trim(); if (html && !/[{}]/.test(html)) staticTexts.push({ html, tag: top.tag, cls: top.cls }); } continue; }
    if (VOID.has(tag) || raw.endsWith('/>')) continue;
    const cls = (attrs.match(/class="([^"]*)"/)?.[1] ?? '').split(/\s+/), id = attrs.match(/id="([^"]*)"/)?.[1] ?? '', parent = stack[stack.length - 1];
    const hit = ['h4', 'h5', 'p'].includes(tag) || cls.some((c) => c === 'k-l' ? !cls.includes('k-finds-h') : classTokens.has(c) && !['k-tile', 'k-chips', 'k-ask', 'k-seg', 'k-tabs', 'k-check', 'k-done', 'k-tag', 'k-streak', 'k-finds-h', 'k-brief'].includes(c))
      || (tag === 'span' && parent && (parent.cls.includes('k-chips') || parent.cls.includes('k-tile') || parent.cls.includes('k-check') || parent.cls.includes('k-finds-h') || parent.cls.includes('k-done')))
      || (tag === 'small' && parent && (parent.cls.includes('k-tile') || parent.cls.includes('k-streak')))
      || (tag === 'button' && parent && (parent.cls.includes('k-ask') || parent.cls.includes('k-seg') || id === 'kVsAsk' || parent.id === 'kVsAsk'))
      || (tag === 'summary' && parent?.cls.includes('k-brief')) || id === 'kXAsk' || (cls.includes('tt') && !!stack.find((e) => e.cls.includes('k-tabs')));
    stack.push({ tag, cls, id, end: m.index + raw.length, watch: hit && !cls.includes('k-nojs') }); // the no-JavaScript line sits outside the app, nothing translates it
  }
}
const proper = new Set(['slashkern', 'Slash', 'Design', 'Video', 'Code', 'Prompting', 'Prompting with AI', 'A', 'EN', 'IT', 'DE', 'FR', 'Demo', 'About', 'K', 'Co-op']);
const noL = (t, L) => (L[t] ?? (L === IT ? IT[t] : undefined));
const lacking = [];
for (const { html } of staticTexts) {
  const text = html.replace(/<[^>]+>/g, '');
  if (!/[A-Za-z]{3}/.test(text) || proper.has(text)) continue;
  for (const [name, L] of [['IT', IT], ['DE', DE], ['FR', FR], ['NL', NL], ['SV', SV]]) if (!noL(html, L)) lacking.push(`${name}: ${html.slice(0, 70)}`);
}
assert.deepEqual(lacking, [], `index.astro: static texts with no translation (they would stay English): ${lacking.slice(0, 8).join(' | ')}`);
console.log(`content: ok (${Object.keys(FIELDS).length * TREND_FROM} missions and ${TRENDING.length} trending, ${staticTexts.length} static texts checked in index.astro)`);
