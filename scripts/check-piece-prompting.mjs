// Checks the Prompting piece, a prompt that writes a post for Dana's pottery class (src/scripts/piece-prompting.ts): the prompt made from the answers is complete and readable for every
// audience, voice and set of facts in every language, it needs only the first four answers, the page reads its words from the run and marks the AI's part only when there is one, and its
// styles keep to the rules (own class names, rem sizes, colours that pass). The generic checks of every piece are in scripts/check-pieces.mjs. Run: npm test
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildSync } from 'esbuild';

// A page is built from DOM nodes: this is just enough of one (a tag, a class, attributes, children, text) to read the page back under Node. The picture needs a canvas and is checked in the browser.
class Node {
  constructor(tag) { this.tag = tag; this.kids = []; this.attrs = {}; this.className = ''; this.own = ''; this.style = { props: {}, setProperty(k, v) { this.props[k] = v; } }; }
  append(...kids) { this.kids.push(...kids); }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  set textContent(v) { this.own = String(v); this.kids = []; }
  get textContent() { return this.own + this.kids.map((k) => k.textContent).join(''); }
}
globalThis.document = { createElement: (t) => new Node(t), createElementNS: (_ns, t) => new Node(t) };

const entry = ['piece-prompting', 'piece-types', 'i18n', 'play', 'i18n-de', 'i18n-fr', 'i18n-nl', 'i18n-sv'].map((f) => `export * from './src/scripts/${f}.ts';`).join('\n');
const { text } = buildSync({ stdin: { contents: entry, resolveDir: process.cwd(), loader: 'ts' }, bundle: true, format: 'esm', platform: 'node', write: false, logLevel: 'silent' }).outputFiles[0];
const { piece, view, prompt, dom, CLAY, INK, PAPER, contrast, stepOk, wordsIn, PIECE_AT, IT, DE, FR, NL, SV } = await import(`data:text/javascript;base64,${Buffer.from(text).toString('base64')}`);

const [who, facts, voice, job, ai] = piece.steps, ids = (st) => st.opts.map((x) => x.id), id = (x) => x.id;
const JOB = 'Write an Instagram post that makes a stranger want to come.', AI = 'Come and make a bowl on Saturday. Clay is included.';
const runOf = (s) => ({ f: piece.f, i: PIECE_AT + piece.n, at: 1760000000000, s, done: 1760000600000 });
const sample = runOf([who.opts[0].id, 'saturday,seats,clay', 'warm', JOB, AI]);
const label = (st, i) => st.opts.find((x) => x.id === i).label;
const en = (s) => s;

// The steps: what the brief asks for.
assert.deepEqual(piece.steps.map((s) => s.kind), ['pick', 'pick', 'pick', 'text', 'run']);
assert.deepEqual([piece.id, piece.n, piece.f, piece.client, piece.mins], ['prompting-prompt', 6, 'Prompting', 'Dana’s pottery class', 10]);
assert.deepEqual([who.n, facts.n, voice.n], [1, 3, 1]); assert.equal(who.opts.length, 4); assert.equal(facts.opts.length, 6); assert.equal(voice.look, 'chip'); assert.equal(voice.opts.length, 5);
assert.deepEqual([job.max, job.words, job.lines, ai.max], [100, 18, 2, 700]);
for (const st of piece.steps) {
  assert.ok([...st.q].length <= 70, `question over 70 characters: ${st.q}`); assert.ok([...st.hint].length <= 90, `hint over 90 characters: ${st.hint}`);
  assert.ok(!/!/.test(st.q + st.hint), `no exclamation mark in a step text: ${st.q}`);
  for (const x of st.opts ?? []) assert.ok([...x.label].length <= (st.look === 'chip' ? 14 : 36), `option label too long: ${x.label}`);
}
assert.ok(wordsIn(job.ph) <= job.words && [...job.ph].length <= job.max, 'the placeholder is an answer that fits its own limits');
assert.ok(stepOk(ai, '') && stepOk(ai, 'x'.repeat(700)) && !stepOk(ai, 'x'.repeat(701)), 'the AI step may be skipped and keeps up to 700 characters');
for (const a of facts.opts) assert.ok(!/no experience|€|\bpaid\b/i.test(a.label), `a fact promises nothing about experience or money: ${a.label}`);

// The prompt, for every audience x voice x ordered set of three facts (2,400 of them): complete, in order, and nothing missing or left blank.
const lines = (p) => p.split('\n');
// Broken = a word that shows something went wrong, a leftover {blank}, an empty line, or a label with nothing after it (only the title of the facts list ends in a colon).
const broken = (p, tr = en) => /undefined|null|NaN|\[object|[{}]/.test(p) || lines(p).some((l) => !l.trim() || (l.endsWith(':') && l !== `${tr('Facts to use')}:`));
let made = 0;
for (const w of ids(who)) for (const vo of ids(voice)) for (const f1 of ids(facts)) for (const f2 of ids(facts)) for (const f3 of ids(facts)) {
  if (new Set([f1, f2, f3]).size < 3) continue;
  const r = runOf([w, [f1, f2, f3].join(','), vo, JOB, AI]), p = prompt(r, en), at = `${w} ${vo} ${f1},${f2},${f3}`;
  made++;
  assert.ok(p.length >= 20 && p.length <= 1500, `${at}: the prompt is ${p.length} characters`);
  assert.ok(!broken(p), `${at}: the prompt has an empty or broken part:\n${p}`);
  assert.equal(lines(p)[0], `Task: ${JOB}`, `${at}: the job comes first`);
  assert.ok(p.includes(`Who it is for: ${label(who, w)}\n`) && p.includes(`Voice: ${label(voice, vo)}\n`), `${at}: the audience and the voice are in the prompt`);
  assert.ok(p.includes(`Facts to use:\n- ${label(facts, f1)}\n- ${label(facts, f2)}\n- ${label(facts, f3)}\n`), `${at}: the three facts are listed, in the order picked`);
  assert.equal(lines(p).filter((l) => l.startsWith('- ')).length, 3);
  assert.deepEqual(lines(p).map((l) => l.split(':')[0]).filter((l) => !l.startsWith('- ')).slice(0, 7), ['Task', 'Context', 'Who it is for', 'Facts to use', 'Voice', 'Length', 'Reply with the post only.'], `${at}: the parts of the prompt, in order`);
  assert.equal(prompt({ ...r, s: r.s.slice(0, 4) }, en), p, `${at}: the prompt needs only the first four answers, the AI's post is not part of it`);
}
assert.equal(made, 4 * 5 * 6 * 5 * 4);

// Missing answers: a prompt is still made, without a line for what is missing and without "undefined".
for (let k = 0; k < 4; k++) { const p = prompt(runOf(sample.s.slice(0, k)), en); assert.ok(p.length >= 20 && !broken(p), `with ${k} answers:\n${p}`); }
assert.ok(!prompt(runOf([]), en).includes('Task:') && prompt(runOf(sample.s.slice(0, 3)), en).includes('Voice: Warm'));
// The job is one line: whatever the person typed, spaces and breaks are squeezed, the words stay as they are (braces, quotes and markup too).
assert.equal(lines(prompt(runOf(['beginners', 'saturday,seats,clay', 'warm', '  Write   a\n\npost  ']), en))[0], 'Task: Write a post');
assert.ok(prompt(runOf(['beginners', 'saturday,seats,clay', 'warm', 'A <b>{n}</b> “post”']), en).includes('Task: A <b>{n}</b> “post”'));

// Every label of the prompt goes through the translator, and in every language there is one (the AI answers in the language of the prompt).
const mark = (s) => `«${s}»`, marked = prompt(sample, mark);
for (const l of ['Task', 'Context', 'Who it is for', 'Facts to use', 'Voice', 'Length', 'One short post, under 60 words, no hashtags.', 'Reply with the post only.', 'Dana’s pottery class', label(who, who.opts[0].id), label(facts, 'seats'), label(voice, 'warm')]) assert.ok(marked.includes(`«${l}»`), `the prompt does not translate "${l}"`);
for (const [name, T] of [['Italian', IT], ['German', DE], ['French', FR], ['Dutch', NL], ['Swedish', SV]]) {
  const tr = (s) => T[s] ?? s, p = prompt(sample, tr);
  for (const l of ['Task', 'Context', 'Who it is for', 'Facts to use', 'Voice', 'Length', 'One short post, under 60 words, no hashtags.', 'Reply with the post only.', 'Dana’s pottery class']) assert.ok(T[l], `${name}: no text for "${l}"`);
  for (const l of ['Task:', 'Who it is for:', 'Facts to use:', 'Voice:', 'Length:', 'Reply with']) assert.ok(!p.includes(l), `${name}: "${l}" is still English in the prompt:\n${p}`);
  for (const st of [who, facts, voice]) for (const x of st.opts) assert.ok(T[x.label], `${name}: no text for the option "${x.label}"`);
  assert.ok(p.length >= 20 && p.length <= 1500 && !broken(p, tr), `${name}: the prompt is ${p.length} characters:\n${p}`);
}
// The longest prompt there can be (a 100-character job, any audience, voice and three facts, in any language) still fits the 1,500 characters the AI step takes.
const triples = ids(facts).flatMap((a) => ids(facts).flatMap((b) => ids(facts).filter((c) => new Set([a, b, c]).size === 3).map((c) => `${a},${b},${c}`)));
const longest = Math.max(...[IT, DE, FR, NL, SV].flatMap((T) => ids(who).flatMap((w) => ids(voice).flatMap((vo) => triples.map((f) => prompt(runOf([w, f, vo, 'x'.repeat(100), AI]), (s) => T[s] ?? s).length)))));
assert.ok(longest <= 1500, `the longest prompt is ${longest} characters`);

// The page reads its words from the run, and is empty until every step is answered.
const v = view(sample, en);
assert.deepEqual(v, { job: JOB, who: 'Complete beginners', voice: 'Warm', facts: ['Saturdays at 10:00', 'Only 6 seats', 'Clay is included'], prompt: prompt(sample, en), ai: AI });
assert.deepEqual(view(sample, en), v, 'view is pure');
assert.equal(view(runOf(sample.s.slice(0, 4)), en), null); assert.equal(view(runOf([]), en), null);
assert.equal(view(sample, mark).who, '«Complete beginners»', 'labels go through the translator');
assert.equal(view(runOf([...sample.s.slice(0, 4), '']), en).ai, '', 'a skipped AI step leaves no AI text');
assert.equal(view(runOf([...sample.s.slice(0, 4), '  One.\r\n\r\n\r\n\r\nTwo.  ']), en).ai, 'One.\n\nTwo.', 'the AI post is trimmed and three blank lines become one');
assert.equal(view({ ...sample, s: sample.s.map((a, k) => (k === 3 ? '  A   job\n here ' : a)) }, en).job, 'A job here');

// dom(): the AI's part is marked "AI" when there is one and only then; what a person typed stays text; the page carries its label and its footer.
const all = (n) => [n, ...n.kids.flatMap(all)], named = (root, c) => all(root).filter((n) => n.className.split(' ').includes(c)), t = { tr: en, fill: (s, x) => s.replace(/\{(\w+)\}/g, (m, k) => x[k]) };
const page = dom(v, 'Made by Giulia · 13 Oct', t), none = dom(view(runOf([...sample.s.slice(0, 4), '']), en), 'by', t);
assert.equal(page.tag, 'article'); assert.deepEqual(page.className.split(' '), ['k-pc', 'k-pc-prompting-card']); assert.equal(page.attrs['aria-label'], 'Dana’s pottery class · Prompt · concept');
assert.deepEqual(named(page, 'k-pc-prompting-ai').map((n) => n.textContent), ['AI'], 'one AI pill');
assert.equal(named(page, 'k-pc-prompting-out')[0].textContent, AI); assert.equal(named(page, 'k-pc-prompting-none').length, 0);
assert.equal(named(none, 'k-pc-prompting-ai').length + named(none, 'k-pc-prompting-out').length, 0, 'no AI part: no pill, no AI bubble');
assert.equal(named(none, 'k-pc-prompting-none')[0].textContent, 'No AI part: this page is the prompt.');
assert.equal(named(page, 'k-pc-prompting-bubble')[0].kids.map((k) => k.textContent).join('\n'), v.prompt, 'the bubble shows the exact prompt');
assert.deepEqual(named(page, 'k-pc-prompting-facts')[0].kids.map((k) => k.textContent), v.facts);
assert.deepEqual(named(page, 'k-pc-foot')[0].kids.map((k) => k.textContent), ['Made by Giulia · 13 Oct', 'slashkern']);
const markup = '<img src=x onerror=alert(1)>', hostile = dom(view(runOf(['beginners', 'saturday,seats,clay', 'warm', markup, markup]), en), 'by', t);
assert.deepEqual(named(hostile, 'k-pc-prompting-task').map((n) => [n.textContent, n.kids.length]), [[markup, 0]], 'typed text goes in as text');
assert.ok(named(hostile, 'k-pc-prompting-out')[0].kids.length === 0 && named(hostile, 'k-pc-prompting-out')[0].textContent === markup);
assert.ok(!/innerHTML|insertAdjacentHTML|outerHTML/.test(readFileSync('src/scripts/piece-prompting.ts', 'utf8')), 'nothing typed or written by the AI is ever turned into markup');
assert.ok(!/findLast|structuredClone|toSorted|groupBy|\.at\(/.test(readFileSync('src/scripts/piece-prompting.ts', 'utf8')), 'iOS 15 safe');

// The styles: every rule starts with the piece's own class, text is in rem and at least 0.75rem (the bubbles, the body, 0.9rem), and the colours pass: the CSS and the picture share the clay.
const css = readFileSync('src/styles/piece-prompting.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
for (const sel of [...css.matchAll(/([^{}]+)\{/g)].flatMap((m) => m[1].split(','))) assert.ok(sel.trim().startsWith('.k-pc-prompting-'), `the selector "${sel.trim()}" must start with .k-pc-prompting-`);
assert.ok(!/font(-size)?:[^;}]*\d(px|pt)/.test(css), 'font sizes are in rem');
const sizes = [...css.matchAll(/font(?:-size)?:\s*(?:\d+\s+)?([\d.]+)rem/g)].map((m) => Number(m[1]));
assert.ok(sizes.length >= 8 && Math.min(...sizes) >= 0.75, `text under 0.75rem: ${Math.min(...sizes)}`);
for (const sel of ['k-pc-prompting-you .k-pc-prompting-bubble', 'k-pc-prompting-out']) assert.ok(Number(new RegExp(`${sel.replace(/[.]/g, '\\.')}[^}]*font:\\s*\\d+\\s+([\\d.]+)rem`).exec(css)?.[1]) >= 0.9, `${sel} is body text: 0.9rem or more`);
// The colours are set on the article by the module (inline, so they beat the defaults of .k-pc, which the stylesheet could not), from the constants the picture uses: they must pass, and the
// stylesheet must not set them too.
const { '--pc-bg': bg, '--pc-ink': ink, '--pc-acc': acc, '--pc-on-acc': onAcc } = page.style.props;
assert.deepEqual([bg, ink, acc], [PAPER, INK, CLAY], 'the page and the picture use the same paper, ink and clay');
assert.ok(!/--pc-(bg|ink|acc|on-acc)\s*:/.test(css), 'the colours come from the module, not from the stylesheet (a rule there would lose to .k-pc or hide a different value)');
assert.ok(contrast(ink, bg) >= 4.5 && contrast(onAcc, acc) >= 4.5 && contrast(acc, bg) >= 4.5, 'ink on paper, white on clay and clay on paper (the bowl and the dashes) all pass 4.5:1');
assert.ok(contrast('#FFFFFF', ink) >= 4.5 && contrast(bg, ink) >= 4.5, 'ink on the white AI bubble, and the paper on the ink AI pill, pass 4.5:1');
console.log(`piece prompting: ok (${made} prompts in English, the longest of all six languages is ${longest} characters, ${sizes.length} text sizes, clay ${acc} passes)`);
