// Checks the Selling piece, the listing for a used desk lamp (src/scripts/piece-selling.ts): the limits of its texts in all five languages, that the listing reads its words from the run and
// puts only the person's own text where the person wrote it, that the page is safe and well-formed (checked on a stub DOM), that every colour pair is readable, that the lamp is drawn
// from valid shapes, and that its stylesheet keeps to the rules (rem text, its own class names). The generic checks of every piece are in scripts/check-pieces.mjs; the drawings themselves
// are looked at in a browser. Run: npm test
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildSync } from 'esbuild';

const entry = ['piece-selling', 'piece-types', 'i18n', 'i18n-piece-selling'].map((f) => `export * from './src/scripts/${f}.ts';`).join('\n');
const { text } = buildSync({ stdin: { contents: entry, resolveDir: process.cwd(), loader: 'ts' }, bundle: true, format: 'esm', platform: 'node', write: false, logLevel: 'error' }).outputFiles[0];
const { piece, view, dom, L, PAL, SCENE, contrast, stepOk, wordsIn, PIECE_AT, IT, SELLING_DE, SELLING_FR, SELLING_NL, SELLING_SV } = await import(`data:text/javascript;base64,${Buffer.from(text).toString('base64')}`);

// The piece: what the brief asks for, step by step.
const [best, notes, title, price, reply] = piece.steps;
assert.deepEqual([piece.id, piece.n, piece.f, piece.client], ['selling-listing', 4, 'Selling', 'Marta']);
assert.ok(piece.mins >= 8 && piece.mins <= 12, 'about ten minutes');
assert.deepEqual(piece.steps.map((s) => s.kind), ['pick', 'pick', 'text', 'pick', 'text']);
assert.deepEqual([best.n, notes.n, price.n], [1, 2, 1]);
assert.ok(price.look === 'chip' && price.opts.length === 4, 'four prices, as chips');
assert.deepEqual([title.max, title.words, reply.max, reply.words, reply.lines], [48, 9, 90, 16, 2]);
assert.ok(piece.steps.filter((s) => s.kind === 'text').length <= 3, 'at most 3 typed lines');
assert.ok(readFileSync('src/scripts/piece-selling.ts', 'utf8').split('\n').length < 400, 'one cohesive file of under 400 lines');

// Every text a person reads, in all five languages: the limits of the brief (a question 70, a hint 90, an option 36 or 14 as a chip), a placeholder that is itself a valid answer, and the words
// and signs the app never uses. The other languages are the piece's own i18n file; every one of these texts must exist there.
const LANGS = { en: (s) => s, it: (s) => IT[s], de: (s) => SELLING_DE[s], fr: (s) => SELLING_FR[s], nl: (s) => SELLING_NL[s], sv: (s) => SELLING_SV[s] };
const MONEY = /\bpaid\b|\bearn|\bincome\b|\bsalary\b|\bEUR\b|\$/i; // a listing has a fictional price in euros, nothing else about money
const priceIds = price.opts.map((x) => x.id);
for (const [lang, tr] of Object.entries(LANGS)) {
  const at = `${lang}`, texts = [piece.title, piece.blurb, piece.who, piece.brief, ...Object.values(L), ...piece.steps.flatMap((st) => [st.q, st.hint, ...(st.kind === 'text' ? [st.ph] : st.opts.map((x) => x.label))])];
  for (const en of texts) {
    const s = tr(en);
    assert.ok(typeof s === 'string' && s.trim(), `${at}: no text for "${en.slice(0, 50)}"`);
    assert.ok(!/lavor/i.test(s) && !/\bmissions?\b|\bmissie|\bMission|uppdrag/i.test(s) && !/no experience/i.test(s), `${at}: a banned word in "${s.slice(0, 50)}"`);
    assert.ok(!MONEY.test(s) && !/\p{Extended_Pictographic}/u.test(s) && !/[{}]/.test(s), `${at}: money talk, an emoji or a blank in "${s.slice(0, 50)}"`);
    assert.ok(!/\p{L}'\p{L}/u.test(s) || lang === 'fr', `${at}: a straight apostrophe in "${s.slice(0, 50)}": write ’`); // French keeps the straight one of i18n-fr.ts
  }
  piece.steps.forEach((st, i) => {
    const sat = `${at} step ${i + 1}`, q = tr(st.q), hint = tr(st.hint);
    assert.ok([...q].length <= 70 && [...hint].length <= 90, `${sat}: a question is 70 characters at most and a hint 90 (${[...q].length}, ${[...hint].length})`);
    assert.ok(!/!/.test(q + hint), `${sat}: no exclamation mark in a step text`);
    if (st.kind === 'text') {
      const ph = tr(st.ph);
      assert.ok(stepOk(st, ph) && wordsIn(ph) <= st.words, `${sat}: the placeholder "${ph}" must be an answer the step accepts (${st.max} characters, ${st.words} words)`);
    } else for (const x of st.opts) assert.ok([...tr(x.label)].length <= (st.look === 'chip' ? 14 : 36), `${sat}: "${tr(x.label)}" is too long for an option`);
  });
  // The prices: the same four numbers in every language, and the new price in the hint.
  price.opts.forEach((x, i) => assert.equal(tr(x.label).replace(/\D/g, ''), String([10, 15, 18, 25][i]), `${at}: price ${x.id} reads "${tr(x.label)}"`));
  assert.ok(/40/.test(tr(price.hint)), `${at}: the price hint says what the lamp cost new`);
}
assert.deepEqual(priceIds, ['p10', 'p15', 'p18', 'p25']);

// The listing reads its words from the run: ids become labels (through tr), the person's lines stay exactly as typed, and the two notes keep the order they were picked in.
const sample = (a) => ({ f: piece.f, i: PIECE_AT + piece.n, at: 1760000000000, s: a, done: 1760000600000 });
const TYPED = ['Lamp <b>"one"</b> & more', 'Yes. 😀 Come today.'];
const idsOf = (st) => st.opts.map((x) => x.id), labelOf = (st, id) => st.opts.find((x) => x.id === id).label;
let combos = 0;
for (const b of idsOf(best)) for (const n1 of idsOf(notes)) for (const n2 of idsOf(notes)) for (const p of priceIds) {
  if (n1 === n2) continue;
  combos++;
  const v = view(sample([b, `${n1},${n2}`, TYPED[0], p, TYPED[1]]), (s) => `[${s}]`);
  assert.deepEqual([v.best, v.price, v.notes], [`[${labelOf(best, b)}]`, `[${labelOf(price, p)}]`, [`[${labelOf(notes, n1)}]`, `[${labelOf(notes, n2)}]`]], 'labels go through the translator, notes in the order picked');
  assert.deepEqual([v.title, v.reply, v.seller, v.mono], [TYPED[0], TYPED[1], 'Marta', 'M'], 'the person\'s own lines are never translated or changed');
}
assert.equal(combos, 5 * 20 * 4);
const full = sample(['works', 'dent,scratch', 'Desk lamp', 'p15', 'Yes.']);
assert.deepEqual(view(full, (s) => s), view(full, (s) => s), 'view is pure');
assert.equal(view({ ...full, s: full.s.slice(0, 4) }, (s) => s), null);

// Colours: text on its ground is 4.5:1; the tick, the lamp and the avatar are graphics of 3:1.
const pairs = [['ink on the card', PAL.ink, PAL.paper, 4.5], ['ink on the tint (best thing)', PAL.ink, PAL.tint, 4.5], ['ink on the chat pane', PAL.ink, PAL.pane, 4.5], ['ink on the question bubble', PAL.ink, PAL.white, 4.5],
  ['white on the reply bubble', PAL.white, PAL.blue, 4.5], ['the price on its pill', PAL.paper, PAL.ink, 4.5], ['the avatar letter on the wall colour', PAL.ink, PAL.wall, 4.5],
  ['the tick on the card', PAL.blue, PAL.paper, 3], ['the tick mark on its disc', PAL.white, PAL.blue, 3], ['the lamp on the wall', PAL.ink, PAL.wall, 3], ['the shade on the wall', PAL.blue, PAL.wall, 3], ['the light on the wall', PAL.light, PAL.wall, 1.1]];
for (const [name, fg, bg, min] of pairs) assert.ok(contrast(fg, bg) >= min, `${name}: ${contrast(fg, bg).toFixed(2)}:1, needs ${min}`);
for (const [k, c] of Object.entries(PAL)) assert.match(c, /^#[0-9A-F]{6}$/, `PAL.${k} is a #RRGGBB colour`);

// The lamp: valid path data (no NaN from the geometry), only palette colours, sane opacities.
const colours = new Set(Object.values(PAL));
for (const [i, s] of SCENE.entries()) {
  assert.match(s.d, /^[MLHVCSQTAZ0-9.,\s-]+$/, `shape ${i}: path data`);
  assert.ok(!/NaN|undefined|Infinity/.test(s.d) && (s.fill || s.stroke), `shape ${i}: finite numbers and a fill or a stroke`);
  assert.ok([s.fill, s.stroke].filter(Boolean).every((c) => colours.has(c)), `shape ${i}: palette colours only`);
  assert.ok((s.a ?? 1) > 0 && (s.a ?? 1) <= 1 && (!s.stroke || s.w > 0), `shape ${i}: opacity and stroke width`);
}

// The page, built on a stub DOM: one article with an aria-label, the tag line, the footer of every piece, the person's text as text and never as markup, decorative drawings hidden, the two
// lists named, and every custom property the stylesheet reads set by the page itself.
class Node_ {
  constructor(tag) { this.tag = tag; this.kids = []; this.attrs = {}; this.className = ''; this.own = ''; this.style = { props: {}, setProperty(k, v) { this.props[k] = v; } }; }
  append(...c) { this.kids.push(...c); }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  set textContent(t) { this.own = String(t); }
  get textContent() { return this.own + this.kids.map((c) => c.textContent).join(''); }
  set innerHTML(_) { throw new Error('the page must never set innerHTML'); }
  all() { return [this, ...this.kids.flatMap((c) => c.all())]; }
  has(cls) { return this.className.split(/\s+/).includes(cls); }
}
globalThis.document = { createElement: (t) => new Node_(t), createElementNS: (_ns, t) => new Node_(t) };
const T = { tr: (s) => s, fill: (s) => s };
const evil = { seller: 'Marta', mono: 'M', title: '<img src=x onerror=alert(1)>', price: '€15', best: 'Works perfectly', notes: ['A scratch on the base', 'No original box'], reply: '</p><script>alert(1)</script> & "quotes"' };
const root = dom(evil, 'Made by Giulia · 13 Oct', T), nodes = root.all(), byClass = (c) => nodes.filter((n) => n.has(c));
assert.ok(root.tag === 'article' && root.has('k-pc') && root.has('k-pc-selling'), 'one article.k-pc');
assert.ok(root.attrs['aria-label'].includes(evil.title) && root.attrs['aria-label'].includes('Listing · concept'), 'the article is named');
assert.equal(byClass('k-pc-tag')[0].textContent, 'Listing · concept');
const foot = byClass('k-pc-foot')[0];
assert.ok(foot.tag === 'footer' && foot.kids.length === 2 && foot.kids[0].textContent === 'Made by Giulia · 13 Oct' && foot.kids[1].has('k-pc-brand') && foot.kids[1].textContent === 'slashkern', 'the footer of every piece');
assert.ok(nodes.every((n) => ['article', 'p', 'div', 'span', 'ul', 'li', 'section', 'footer', 'svg', 'path'].includes(n.tag)), `only plain elements: ${[...new Set(nodes.map((n) => n.tag))]}`);
assert.ok(root.textContent.includes(evil.title) && root.textContent.includes(evil.reply), 'what the person wrote is in the page as text');
const heading = nodes.find((n) => n.attrs.role === 'heading');
assert.ok(heading.attrs['aria-level'] === '3' && heading.textContent === evil.title, 'the title is a level 3 heading');
assert.ok(nodes.filter((n) => n.tag === 'svg').every((n) => n.attrs['aria-hidden'] === 'true'), 'every drawing is decorative');
const lists = nodes.filter((n) => n.tag === 'ul');
assert.deepEqual(lists.map((n) => [n.attrs['aria-label'], n.kids.map((li) => li.textContent)]), [['Honest notes', evil.notes], ['Chat', ['Is it still available?', evil.reply]]], 'the notes in order, then the buyer\'s question and the reply');
assert.equal(byClass('k-pc-selling-price')[0].textContent, '€15');
assert.equal(byClass('k-pc-selling-name')[0].textContent, 'Marta');
const css = readFileSync('src/styles/piece-selling.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
for (const m of css.matchAll(/var\((--(?:sl|pc)-[a-z-]+)/g)) assert.ok(m[1] in root.style.props, `the stylesheet reads ${m[1]}, which the page does not set`);

// The stylesheet: rem text no smaller than 0.75rem, only its own class names, nothing older iPhones lack.
assert.ok(!/font-size:\s*[\d.]+px|font:[^;{}]*?\d+(?:\.\d+)?px/.test(css), 'font sizes are rem, never px');
for (const m of css.matchAll(/font(?:-size)?:[^;{}]*?(\d*\.?\d+)rem/g)) assert.ok(Number(m[1]) >= 0.75, `text under 0.75rem: ${m[0]}`);
for (const m of css.matchAll(/([^{}]+)\{/g)) for (const sel of m[1].split(',')) assert.ok(/^\s*\.k-pc(-selling|\.k-pc-selling)/.test(sel), `a selector outside .k-pc-selling: "${sel.trim()}"`);
assert.ok(!/color-mix\(/.test(css), 'color-mix needs iOS 16.2, so the page sets plain colours');
const src = readFileSync('src/scripts/piece-selling.ts', 'utf8');
assert.ok(!/innerHTML|outerHTML|insertAdjacentHTML|document\.write/.test(src), 'text goes in with textContent');
assert.ok(!/\.at\(|\.findLast|structuredClone|\.toSorted|Object\.groupBy|Object\.hasOwn/.test(src), 'iOS 15 safe');
console.log(`piece selling: ok (${combos} answer combinations read, ${Object.keys(LANGS).length} languages within the limits, ${pairs.length} colour pairs, ${SCENE.length} lamp shapes)`);
