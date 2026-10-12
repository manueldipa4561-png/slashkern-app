// Self-test for the Mission Studio (scripts/mission-studio.mjs). No network, no API key. Run: node scripts/check-studio.mjs
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { GATES, ROOT, buildPrompt, escapeOdd, exampleDraft, loadLive, parseModelText, rulesFromDocs, slotIndex, toSnippets, validateDraft, writeFiles } from './mission-studio-core.mjs';

const live = await loadLive();
const fixture = JSON.parse(readFileSync(join(ROOT, 'scripts/fixtures/studio-response.json'), 'utf8'));
const docs = readFileSync(join(ROOT, 'docs/MISSIONS.md'), 'utf8');
const field = 'Selling', kind = 'zero', index = slotIndex(live, field, kind);
const failures = (draft, k = kind) => validateDraft(draft, { live, field, kind: k, index }).filter((r) => !r.ok).map((r) => r.rule);
const mutate = (fn) => { const d = structuredClone(fixture); fn(d); return d; };

// 1. The fixture is a valid zero mission, parsed from a fenced model answer.
assert.equal(index % live.PER_ROUND, 1, 'a zero mission sits at index % 3 = 1');
assert.deepEqual(failures(parseModelText('Here you go:\n```json\n' + JSON.stringify(fixture) + '\n```')), [], 'valid fixture must pass every rule');
assert.deepEqual(failures(fixture, 'partner'), ['kind'], 'the same text is not a partner mission');

// 2. The generated snippets evaluate, with stub t2/tag/m/h/e, to exactly the draft's data.
const run = (stubs, code) => new Function(...Object.keys(stubs), `return [${code}];`)(...Object.values(stubs));
const t2 = (en, it) => ({ en, it }), pair = ([en, it]) => ({ en, it });
function roundTrip(d) {
  const s = toSnippets(d, index);
  const [m] = run({ m: (en, it, title, blurb) => ({ en, it, title: pair(title), blurb: pair(blurb) }) }, s.fields);
  assert.equal(m.en, `Project ${String(index + 1).padStart(3, '0')} · ${d.labelTag.en}`);
  assert.deepEqual([m.title, m.blurb], [d.title, d.blurb]);
  const [x] = run({ t2, tag: (en, it) => ({ en, it }) }, s.missions);
  assert.deepEqual(x, { who: d.who, brief: d.brief, asset: d.asset, steps: d.steps, mins: d.mins, bar: d.bar, twist: d.twist });
  const [h] = run({ h: (ex, ...hints) => ({ ex: pair(ex), hints: hints.map(pair) }) }, s.helps);
  assert.deepEqual(h, d.help);
  const [e] = run({ e: (brief, steps, ex, asset, hints) => ({ brief: pair(brief), steps: steps.map(pair), ex: pair(ex), asset: { title: pair(asset.title), body: pair(asset.body) }, hints: hints.map(pair) }) }, s.easy);
  assert.deepEqual(e, d.easy);
}
roundTrip(fixture);
// Quotes, backslashes and newlines survive; an injection stays a string and never runs.
globalThis.evil = () => assert.fail('injected code ran');
const ODD_CHARS = ['\u202e', '\u2028', '\u200b', '\u009b', '\u{e0041}']; // bidi override, line separator, zero-width space, C1 CSI, tag character
const nasty = ['Marta\'s "best" \\ day\nsecond line', '\'); evil();//', '`${evil()}`', ...ODD_CHARS.map((c) => `a${c}b`)];
for (const text of nasty) {
  roundTrip(mutate((d) => { d.brief.en = text; d.twist.it = text; d.help.ex.en = text; d.easy.asset.body.en = text; }));
  const code = toSnippets(mutate((d) => { d.brief.en = text; }), index).missions.replace(/\n/g, '');
  assert.ok(!/[\p{Cc}\p{Cf}\u2028\u2029]/u.test(code), 'odd characters are escaped in the snippets, never raw');
}

// 3. Broken or hostile drafts fail with the expected rule names (the dangerous ones also block the snippets, see section 5).
const liveBrand = live.MX[field][1].who.replace(/^Practice project · /, '').split(',')[0].replace(/\s*\(.*\)$/, '');
const cases = [
  ['missing Italian', (d) => delete d.steps[0].it, 'bilingual'],
  ['4 steps', (d) => d.steps.push({ en: 'Do one more thing now.', it: 'Fai ancora una cosa adesso.' }), 'steps-3'],
  ['banned word', (d) => { d.brief.en += ' Unlock your potential.'; }, 'banned-words'],
  ['quote injection', (d) => { d.twist.en = 'Nice one\'); evil();//'; }, 'no-code'],
  ['script tag', (d) => { d.blurb.en = '<script>alert(1)</script>'; }, 'no-html'],
  ['url', (d) => { d.twist.en = 'Post it on https://example.test/x today.'; }, 'no-url'],
  ['javascript scheme', (d) => { d.twist.en = 'Tap javascript:alert(1) now.'; }, 'no-url'],
  ['mailto scheme', (d) => { d.twist.it = 'Scrivi a mailto:x@y.test adesso.'; }, 'no-url'],
  ['bare host', (d) => { d.twist.en = 'Visit evil.xyz today.'; }, 'no-url'],
  ['bare IP', (d) => { d.twist.en = 'Ping 192.168.0.1 today.'; }, 'no-url'],
  ['code fence', (d) => { d.twist.en = 'Try ```js x```'; }, 'no-fences'],
  ['unknown key', (d) => { d.admin = true; }, 'shape'],
  ['wrong type', (d) => { d.mins = '3'; }, 'shape'],
  ['mins out of range', (d) => { d.mins = 9; }, 'mins'],
  ['mins 1e21', (d) => { d.mins = 1e21; }, 'mins'],
  ...ODD_CHARS.map((c) => [`odd character U+${c.codePointAt(0).toString(16)}`, (d) => { d.twist.en = `Copy it${c} and send it.`; }, 'length']),
  ['line break in a single-line text', (d) => { d.twist.en = 'Copy it.\nSend it.'; }, 'single-line'],
  ['long brief', (d) => { d.brief.en = 'word '.repeat(40).trim(); d.brief.it = 'parola '.repeat(60).trim(); }, 'brief-words'],
  ['too many asset lines', (d) => { d.asset.body.en = 'a\n'.repeat(9) + 'b'; d.asset.body.it = 'a\n'.repeat(9) + 'b'; }, 'asset-lines'],
  ['newline mismatch', (d) => { d.asset.body.it = d.asset.body.it.replace(/\n/g, ' '); }, 'newline-parity'],
  ['Italian equals English', (d) => { d.twist.it = d.twist.en; }, 'it-differs'],
  ['hint not a question', (d) => { d.help.hints[0].en = 'Think about it.'; }, 'hints-are-questions'],
  ['not fictional', (d) => { d.who.en = 'Pallino Pops, a popped-lentil snack'; }, 'fictional'],
  ['existing brand', (d) => { d.brand = liveBrand; d.who.en = `${liveBrand}, a snack (fictional)`; }, 'brand-unique'], // a brand from today's live data, so the test never goes stale when missions change
  ['existing title', (d) => { d.title = { en: live.FIELDS[field].m[1][1], it: d.title.it }; }, 'unique-title'],
  ['clashing Italian', (d) => { d.twist = { en: live.FIELDS[field].m[1][1], it: 'Un altro testo italiano' }; }, 'no-clash'],
];
for (const [name, fn, rule] of cases) {
  const failed = failures(mutate(fn));
  assert.ok(failed.includes(rule), `${name}: expected "${rule}" to fail, got [${failed.join(', ')}]`);
}
assert.throws(() => parseModelText('I cannot help with that.'), /no JSON/);
assert.throws(() => parseModelText('{"a": }'), /not valid JSON/);
assert.throws(() => parseModelText(`{"a\u001b]0;x\u0007": }`), (err) => !/[\p{Cc}\p{Cf}]/u.test(err.message) && !err.message.includes('0;x'), 'the JSON error never repeats the answer');
assert.throws(() => parseModelText('{"a": "' + 'x'.repeat(300_000) + '"}'), /too large/);
for (const gate of ['shape', 'bilingual', 'mins', 'single-line', 'length', 'no-html', 'no-url', 'no-fences', 'no-code']) assert.ok(GATES.has(gate), `${gate} must block the snippets`);
assert.ok(!GATES.has('steps-3') && !GATES.has('kind'), 'count and tone rules are reported but do not block');

// Hostile input stays linear: a huge text fails `length` quickly and is skipped by the regex scans.
const started = Date.now();
assert.ok(failures(mutate((d) => { d.twist.en = 'a'.repeat(150_000); })).includes('length'));
assert.ok(Date.now() - started < 3000, 'a 150 000 character text must not stall the validator');

// 4. The prompt carries the rules, the schema, the limits and one live example of the field and kind.
const prompt = buildPrompt({ live, docs, field, kind, subject: 'Pallino Pops, a lentil snack', notes: 'keep it light' });
const example = exampleDraft(live, field, kind);
for (const piece of [rulesFromDocs(docs), '"labelTag"', 'LIMITS', 'Subject: Pallino Pops', example.brief.en, example.who.en]) assert.ok(prompt.system.includes(piece) || prompt.user.includes(piece), `prompt is missing: ${piece.slice(0, 40)}`);
assert.match(prompt.user, /index 7/);
const cli = (...args) => spawnSync(process.execPath, [join(ROOT, 'scripts/mission-studio.mjs'), ...args], { encoding: 'utf8', env: { ...process.env, ANTHROPIC_API_KEY: '' } });
const dry = cli('--field', field, '--kind', kind, '--subject', 'Crunchino, a chickpea snack', '--dry-run');
assert.equal(dry.status, 0, dry.stderr);
assert.ok(dry.stdout.includes('Brandable subjects') && dry.stdout.includes(example.brief.en), '--dry-run prints the rules and the example');

// 5. The CLI without a key stops early; with --from-json it writes files and never overwrites; a bad draft exits 1.
const noKey = cli('--field', field, '--kind', kind, '--subject', 'Crunchino, a chickpea snack');
assert.notEqual(noKey.status, 0);
assert.match(noKey.stderr, /ANTHROPIC_API_KEY is not set/);
const tmp = mkdtempSync(join(tmpdir(), 'studio-'));
try {
  const good = join(tmp, 'good.json'), bad = join(tmp, 'bad.json'), out = join(tmp, 'drafts');
  writeFileSync(good, JSON.stringify(fixture));
  writeFileSync(bad, JSON.stringify(mutate((d) => { d.twist.en = 'Nice one\'); evil();//'; })));
  for (let run = 1; run <= 2; run++) assert.equal(cli('--field', field, '--kind', kind, '--from-json', good, '--out', out).status, 0);
  const files = readdirSync(out);
  assert.equal(files.length, 10, `two runs write 5 files each, none overwritten: ${files}`);
  assert.ok(files.every((f) => f.startsWith('Selling-zero-')));
  const badRun = cli('--field', field, '--kind', kind, '--from-json', bad, '--out', out);
  assert.equal(badRun.status, 1);
  assert.match(badRun.stdout, /FAIL {2}no-code/);
  assert.deepEqual(readdirSync(out).filter((f) => !files.includes(f)).map((f) => f.split('.').slice(1).join('.')), ['json'], 'unsafe draft: only the raw JSON is saved');

  // 6. Model text never reaches the terminal raw; odd characters and bad numbers block the snippets; the raw answer is saved escaped.
  const ESC = '\u001b]0;pwned\u0007\u009b2J';
  const CONTROL = /[\u0000-\u0009\u000b-\u001f\u007f-\u009f\u2028\u2029\u202a-\u202e\u2066-\u2069]/; // a line break is fine, nothing else is
  const suffixes = (before) => readdirSync(out).filter((f) => !before.includes(f)).map((f) => f.split('.').slice(1).join('.')).sort();
  const runDraft = (content) => {
    const before = readdirSync(out), file = join(tmp, 'case.json');
    writeFileSync(file, content);
    const r = cli('--field', field, '--kind', kind, '--from-json', file, '--out', out);
    return { r, text: r.stdout + r.stderr, saved: suffixes(before), before };
  };
  let c = runDraft(JSON.stringify({ ...fixture, [ESC]: 1 }));
  assert.equal(c.r.status, 1);
  assert.ok(!CONTROL.test(c.text), 'an escape sequence in a key name never reaches the console');
  assert.ok(c.text.includes('\\u001b'), 'the key name is shown escaped');
  assert.deepEqual(c.saved, ['json'], 'unknown key: shape is a gate, only the JSON is saved');
  assert.ok(!CONTROL.test(readFileSync(join(out, readdirSync(out).find((f) => !c.before.includes(f))), 'utf8').replace(/\n/g, '')), 'the saved JSON has the escapes escaped');
  const rawAnswer = `{"a${ESC}": }`;
  c = runDraft(rawAnswer);
  assert.equal(c.r.status, 1);
  assert.ok(!CONTROL.test(c.text), 'an escape sequence in a JSON parse error never reaches the console');
  assert.deepEqual(c.saved, ['raw.txt']);
  const rawFile = readFileSync(join(out, readdirSync(out).find((f) => f.endsWith('.raw.txt') && !c.before.includes(f))), 'utf8');
  assert.ok(!CONTROL.test(rawFile.trimEnd()), '.raw.txt holds no raw control characters');
  assert.equal(JSON.parse(rawFile), rawAnswer, '.raw.txt is the answer as an escaped JSON string');
  for (const ch of ODD_CHARS) {
    c = runDraft(JSON.stringify(mutate((d) => { d.twist.en = `Copy it${ch} and send it.`; })));
    assert.equal(c.r.status, 1);
    assert.match(c.text, /FAIL {2}length/);
    assert.deepEqual(c.saved, ['json'], `U+${ch.codePointAt(0).toString(16)} is a gate: no snippets`);
    assert.ok(!CONTROL.test(c.text));
  }
  c = runDraft(JSON.stringify(mutate((d) => { d.mins = 1e21; })));
  assert.equal(c.r.status, 1);
  assert.match(c.text, /FAIL {2}mins/);
  assert.deepEqual(c.saved, ['json'], 'mins 1e21 blocks the snippets');
  c = runDraft(JSON.stringify(mutate((d) => d.steps.push({ en: 'Do one more thing now.', it: 'Fai ancora una cosa adesso.' }))));
  assert.equal(c.r.status, 1);
  assert.deepEqual(c.saved, ['easy.txt', 'fields.txt', 'helps.txt', 'json', 'missions.txt'], 'a count rule fails but the snippets are still written for a human to fix');

  // 7. A set of files is never half old, half new: one taken name moves the whole set to a counter.
  const dir = join(tmp, 'set');
  mkdirSync(dir);
  writeFileSync(join(dir, 'X.fields.txt'), 'old');
  const paths = writeFiles(dir, 'X', { json: '{}', 'fields.txt': 'new', 'easy.txt': 'new' });
  assert.deepEqual(paths.map((f) => f.split('/').pop()).sort(), ['X-2.easy.txt', 'X-2.fields.txt', 'X-2.json']);
  assert.equal(readFileSync(join(dir, 'X.fields.txt'), 'utf8'), 'old');
  assert.ok(!existsSync(join(dir, 'X.json')) && !existsSync(join(dir, 'X.easy.txt')));
  assert.equal(escapeOdd('a\u202eb'), 'a\\u202eb');
} finally { rmSync(tmp, { recursive: true, force: true }); }

console.log('studio: ok');
