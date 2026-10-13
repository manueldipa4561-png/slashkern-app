// Checks the Code piece, the one-page website for Sunny Plants (src/scripts/piece-code.ts): every colour theme is readable, the page file is a complete standalone document that opens offline
// (no address of anything outside it, no script, no font to download), whatever a person types or a translation says is escaped before it goes into that file, and the pieces of the page agree.
// The generic checks of every piece are in scripts/check-pieces.mjs. Run: npm test
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildSync } from 'esbuild';

const entry = ['piece-code', 'piece-types', 'i18n', 'i18n-de', 'i18n-fr', 'i18n-nl', 'i18n-sv'].map((f) => `export * from './src/scripts/${f}.ts';`).join('\n');
const { text } = buildSync({ stdin: { contents: entry, resolveDir: process.cwd(), loader: 'ts' }, bundle: true, format: 'esm', platform: 'node', write: false }).outputFiles[0];
const { piece, view, file, esc, lookOf, THEME, FACE, ART, SEC, L, contrast, PIECE_AT, IT, DE, FR, NL, SV } = await import(`data:text/javascript;base64,${Buffer.from(text).toString('base64')}`);

const t = { tr: (s) => s, fill: (e, v) => e.replace(/\{(\w+)\}/g, (m, k) => v[k]) };
const run = (s) => ({ f: piece.f, i: PIECE_AT + piece.n, at: 1760000000000, s, done: 1760000600000 });
const answers = (o = {}) => ['sell,care,reviews', 'Plants that are happy to live with you.', 'Shop plants', 'fern', 'soft'].map((a, k) => o[k] ?? a);
const pageOf = (s, by = 'Made by Giulia · 13 Oct', tt = t) => file(view(run(s), tt.tr), by, tt);
const themeStep = piece.steps[3], faceStep = piece.steps[4], secStep = piece.steps[0];

// Themes: every one is readable. Ink on the page, on the boxes and on the top box is body text (4.5:1), so is the quieter text, and the button text on the accent.
const themeIds = Object.keys(THEME);
assert.deepEqual(themeStep.opts.map((x) => x.id), themeIds, 'the colour step offers exactly the themes of the table, in its order');
assert.equal(themeIds.length, 6);
for (const id of themeIds) {
  const th = THEME[id], l = lookOf(id), at = `theme ${id}`;
  assert.equal(themeStep.opts.find((x) => x.id === id).hex, th.accent, `${at}: the swatch is the accent`);
  for (const [name, a, b] of [['ink on the page', l.ink, l.bg], ['ink on the boxes', l.ink, l.card], ['ink on the top box', l.ink, l.tint], ['quiet text on the page', l.mute, l.bg], ['quiet text on the boxes', l.mute, l.card],
    ['quiet text on the top box', l.mute, l.tint], ['button text on the accent', l.onAccent, l.accent]]) {
    assert.ok(contrast(a, b) >= 4.5, `${at}: ${name} is ${contrast(a, b).toFixed(2)}:1, needs 4.5:1 (${a} on ${b})`);
  }
  assert.ok(contrast(l.accent, l.bg) >= 1.3, `${at}: the accent vanishes into the page`);
  for (const key of ['bg', 'ink', 'accent', 'onAccent', 'card', 'tint', 'alt', 'line', 'dot', 'mute', 'sun']) assert.match(l[key], /^#[0-9A-F]{6}$/i, `${at}: ${key} is a #rrggbb colour`);
}
assert.ok(contrast(THEME.midnight.ink, THEME.midnight.bg) > 10 && contrast(THEME.midnight.bg, '#FFFFFF') > 10, 'Midnight is a dark theme');

// The look of the letters: three, with font stacks that need no download.
assert.deepEqual(faceStep.opts.map((x) => x.id), ['soft', 'sharp', 'classic']);
assert.equal(faceStep.look, 'chip');
assert.equal(FACE.soft.stack, "ui-rounded, 'SF Pro Rounded', system-ui, sans-serif");
assert.equal(FACE.sharp.stack, "system-ui, 'Helvetica Neue', Arial, sans-serif");
assert.equal(FACE.classic.stack, "Georgia, 'Times New Roman', serif");
for (const f of Object.values(FACE)) assert.ok(!/url\(|https?:|@font-face/.test(f.stack) && f.weight >= 600 && f.r >= 0 && f.btn >= 0, 'a face needs nothing to download');

// The page reads from the run.
assert.equal(piece.id, 'code-page'); assert.equal(piece.f, 'Code'); assert.equal(piece.client, 'Sunny Plants'); assert.equal(piece.steps.length, 5);
assert.equal(piece.steps.filter((st) => st.kind === 'text').length, 2, 'two typed lines');
assert.deepEqual([piece.steps[1].max, piece.steps[1].words, piece.steps[2].max, piece.steps[2].words], [44, 8, 18, 3]);
const id = (s) => s, v = view(run(answers()), id);
assert.equal(v.name, 'Sunny Plants'); assert.equal(v.host, 'sunnyplants.example'); assert.equal(v.lang, 'en');
assert.deepEqual(v.sections.map((s) => s.id), ['sell', 'care', 'reviews'], 'the sections come in the order the person picked');
assert.equal(view(run(answers({ 0: 'delivery,sell,find' })), id).sections.map((s) => s.id).join(), 'delivery,sell,find');
assert.equal(v.headline, 'Plants that are happy to live with you.'); assert.equal(v.button, 'Shop plants');
assert.equal(v.look.accent, THEME.fern.accent); assert.equal(v.face, FACE.soft);
assert.equal(view(run(answers().slice(0, 4)), id), null, 'unfinished: no page');
assert.equal(view(run(answers()), (s) => `[${s}]`).sections[0].title, '[What we sell]', 'labels go through the translator');
assert.equal(view(run(answers()), (s) => `[${s}]`).headline, 'Plants that are happy to live with you.', 'what the person wrote does not');
const every = [...view(run(answers({ 0: 'sell,care,reviews' })), id).sections, ...view(run(answers({ 0: 'find,delivery,week' })), id).sections];
assert.deepEqual(every.map((s) => s.id), secStep.opts.map((x) => x.id).sort((a, b) => ['sell', 'care', 'reviews', 'find', 'delivery', 'week'].indexOf(a) - ['sell', 'care', 'reviews', 'find', 'delivery', 'week'].indexOf(b)), 'every section the step offers');
for (const s of every) {
  assert.ok(s.line.length > 10 && s.line.length <= 70, `${s.id}: one friendly sentence of at most 70 characters`);
  assert.ok(s.nav.length <= 9 && s.title.length <= 36, `${s.id}: a short word for the menu`);
  assert.match(s.icon, /^M[\d. ]/, `${s.id}: a little picture`);
}

// The file: a complete document. Everything in it is escaped, nothing in it is fetched.
const hostile = pageOf(answers({ 1: '<script>alert(1)</script> & "x"', 2: `<b onclick="x">&'` }), 'Made by <img src=x onerror=alert(1)> · 13 Oct');
assert.equal(hostile.name, 'sunny-plants.html'); assert.match(hostile.name, /^[a-z0-9-]+\.html$/, 'a safe file name'); assert.equal(hostile.mime, 'text/html');
assert.equal(hostile.label, 'Download my page (.html)');
const h = hostile.text;
assert.ok(h.startsWith('<!doctype html>'), 'doctype'); assert.match(h, /<html lang="en">/); assert.match(h, /<meta charset="utf-8">/); assert.match(h, /<meta name="viewport" content="width=device-width, initial-scale=1">/);
assert.match(h, /<title>Sunny Plants · .+<\/title>/);
assert.ok(h.includes('&lt;script&gt;alert(1)&lt;/script&gt; &amp; &quot;x&quot;'), 'the headline is escaped');
assert.ok(h.includes('&lt;b onclick=&quot;x&quot;&gt;&amp;&#39;'), 'the button label is escaped');
assert.ok(h.includes('Made by &lt;img src=x onerror=alert(1)&gt; · 13 Oct'), 'the byline is escaped');
assert.ok(!/<script/i.test(h) && !/<img/i.test(h) && !/<b onclick/.test(h) && !/javascript:/i.test(h), 'nothing a person wrote became markup');
for (const m of h.replace(/<style>[\s\S]*?<\/style>/, '').matchAll(/<[a-z][^>]*>/gi)) assert.ok(!/\son[a-z]+\s*=/i.test(m[0]), `no event handler in ${m[0].slice(0, 40)}`);
assert.equal(esc(`&<>"'`), '&amp;&lt;&gt;&quot;&#39;'); assert.equal(esc('plain'), 'plain');
assert.ok(h.length < 40000, `the file is small (${h.length} characters)`);

// Every language, every theme and every look of the letters: no address, no script, nothing to download, and a translation that has a quote or a tag in it cannot break the file.
const TABLES = { en: null, it: IT, de: DE, fr: FR, nl: NL, sv: SV };
for (const [code, table] of Object.entries(TABLES)) {
  for (const hostileTr of [false, true]) {
    const tr = (s) => { const x = table ? table[s] || s : s; return hostileTr ? `${x}"><script>'&` : x; }, tt = { tr, fill: (e, o) => tr(e).replace(/\{(\w+)\}/g, (m, k) => o[k]) };
    for (const th of themeIds) for (const fc of Object.keys(FACE)) {
      const doc = pageOf(answers({ 0: 'reviews,find,week', 3: th, 4: fc }), 'Made by Giulia · 13 Oct', tt).text, at = `${code}${hostileTr ? ' (hostile translations)' : ''} ${th} ${fc}`;
      assert.ok(!/https?:\/\//i.test(doc) && !/<script/i.test(doc) && !/<link|<img|<iframe|<object|<embed|<form|<input|<video|<audio|<source/i.test(doc), `${at}: nothing is fetched and nothing runs`);
      assert.ok(!/@import|@font-face|url\(|\ssrc=|\sdata-/i.test(doc), `${at}: no file, no font, no image to download`);
      assert.ok(doc.includes(`<html lang="${hostileTr ? esc(`${code}"><script>'&`) : code}">`), `${at}: the language of the file is ${code}`);
      const comments = [...doc.matchAll(/<!--([\s\S]*?)-->/g)].map((m) => m[1]), css = [...doc.matchAll(/\/\*([\s\S]*?)\*\//g)].map((m) => m[1]);
      assert.equal(comments.length, 4, `${at}: four comments in the page`); assert.equal(css.length, 2, `${at}: two comments in the styles`);
      for (const c of [...comments, ...css]) assert.ok(!/--|\*\/|[<>]/.test(c), `${at}: a comment is kept from ending early or opening a tag`);
      assert.equal(doc.replace(/<!--[\s\S]*?-->/g, '').match(/-->|<!--/g), null, `${at}: a comment never leaks`);
    }
  }
}

// One document, well formed: tags open and close in order, every link and label points at an id that exists, the button goes to the first section.
const doc = pageOf(answers({ 0: 'delivery,week,care', 3: 'berry', 4: 'sharp' })).text;
const noStyle = doc.replace(/<style>[\s\S]*?<\/style>/, '').replace(/<!--[\s\S]*?-->/g, ''), stack = [], VOID = new Set(['meta']);
for (const m of noStyle.matchAll(/<(\/?)([a-z][a-z0-9]*)\b([^>]*?)(\/?)>/g)) {
  const [, close, name, , self] = m;
  if (VOID.has(name) || self) continue;
  if (close) assert.equal(stack.pop(), name, `</${name}> closes ${name}`); else stack.push(name);
}
assert.deepEqual(stack, [], 'every tag is closed');
const ids = [...doc.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
assert.equal(new Set(ids).size, ids.length, 'ids are unique');
for (const m of doc.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(m[1]), `the link #${m[1]} points at an id`);
for (const m of doc.matchAll(/aria-labelledby="([^"]+)"/g)) assert.ok(ids.includes(m[1]), `aria-labelledby ${m[1]} points at an id`);
for (const sec of ['delivery', 'week', 'care']) assert.ok(ids.includes(sec) && doc.includes(`<a href="#${sec}">`), `section ${sec} has an id and a link in the menu`);
assert.match(doc, /<a class="button" href="#delivery">Shop plants<\/a>/, 'the button is a link to the first section');
assert.equal((doc.match(/<h1\b/g) || []).length, 1, 'one h1'); assert.equal((doc.match(/<h2\b/g) || []).length, 3, 'one h2 per section');
for (const tag of ['<header', '<nav', '<main', '<section', '<footer']) assert.ok(doc.includes(tag), `semantic ${tag}>`);
assert.match(doc, /min-width: 48rem/, 'it is responsive'); assert.match(doc, /clamp\(/); assert.match(doc, /width: min\(/);
assert.ok(!/font-size:\s*[\d.]+px|font:[^;{}]*?\d+(?:\.\d+)?px/.test(doc), "text sizes in the file are rem, so the reader's text size setting works");
assert.ok(doc.includes('Made on slashkern') && doc.includes('Practice project · Sunny Plants, a plant shop (fictional)'), 'the footer says it is a practice project and where it was made');
assert.ok(!/Made on slashkern[^]*Made on slashkern/.test(pageOf(answers(), 'Made on slashkern · 13 Oct').text), 'a byline that already says slashkern is not repeated');
// The variables of the file are the theme and the letters of the run, and the whole page follows them.
for (const th of themeIds) for (const [fc, f] of Object.entries(FACE)) {
  const d2 = pageOf(answers({ 3: th, 4: fc })).text, l = lookOf(th), val = (name) => d2.match(new RegExp(`${name}: ([^;]+);`))?.[1];
  assert.deepEqual([val('--bg'), val('--ink'), val('--accent'), val('--on-accent'), val('--card'), val('--tint')], [l.bg, l.ink, l.accent, l.onAccent, l.card, l.tint], `${th}: the colours in the file`);
  assert.deepEqual([val('--font'), val('--weight'), val('--button-radius'), val('--caps')], [f.stack, String(f.weight), `${f.btn}px`, f.caps ? 'uppercase' : 'none'], `${fc}: the letters in the file`);
  for (const [a, b] of [['--ink', '--bg'], ['--ink', '--card'], ['--ink', '--tint'], ['--on-accent', '--accent']]) assert.ok(contrast(val(a), val(b)) >= 4.5, `${th}: ${a} on ${b} in the file`);
}

// The plants are plain shapes: every part has a path and a known colour.
assert.ok(ART.length >= 10 && ART.every((p) => /^(M[^]*Z|blade|pot)$/.test(p.d) && ['ink', 'accent', 'alt', 'sun'].includes(p.tone) && Number.isFinite(p.x + p.y + p.r + p.k)), 'the shelf of plants');

// The words: every text of the page has the other languages, with no job-world word, no money, no exclamation mark and a typographic apostrophe in Italian.
const strings = [piece.title, piece.blurb, piece.who, piece.brief, ...piece.steps.flatMap((st) => [st.q, st.hint, st.ph, ...(st.opts ?? []).map((x) => x.label)]), ...Object.values(L), ...Object.values(SEC).flatMap((s) => [s.nav, s.line])].filter(Boolean);
assert.ok(strings.length >= 50, `the page has its texts (${strings.length})`);
for (const s of strings) {
  for (const [code, table] of Object.entries(TABLES)) {
    if (!table) continue;
    assert.ok(table[s], `${code}: no text for "${s.slice(0, 50)}"`);
    assert.ok(!/lavor|€|\$|\bearn|\bpaid\b|\bincome\b|\bmissi/i.test(table[s]) && !/!/.test(table[s]), `${code}: a banned word or an exclamation mark in "${table[s].slice(0, 50)}"`);
  }
  assert.ok(!/\p{L}'\p{L}/u.test(IT[s]), `a straight apostrophe in the Italian for "${s.slice(0, 50)}"`);
  assert.ok(!/!|\bmissions?\b|no experience/i.test(s), `a banned word or an exclamation mark in "${s.slice(0, 50)}"`);
}
for (const code of ['de', 'fr', 'nl', 'sv']) assert.equal(TABLES[code][L.lang], code, `the language code of the file in ${code}`);
assert.equal(IT[L.lang], 'it');

// The screens: the styles of the page start with .k-pc-code-, text sizes are rem, and what a person typed never goes in as markup.
const css = readFileSync('src/styles/piece-code.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, ''), src = readFileSync('src/scripts/piece-code.ts', 'utf8');
for (const m of css.matchAll(/\.([a-zA-Z][\w-]*)/g)) assert.ok(m[1] === 'k-pc' || m[1].startsWith('k-pc-code-'), `piece-code.css: .${m[1]} must start with k-pc-code-`);
assert.ok(!/font-size:\s*[\d.]+px|font:[^;{}]*?\d+(?:\.\d+)?px/.test(css), 'piece-code.css: font sizes are rem');
assert.ok(!/innerHTML|outerHTML|insertAdjacentHTML|document\.write/.test(src), 'piece-code.ts: a typed line goes in with textContent, never as markup');
assert.ok(!/\.at\(|findLast|structuredClone|toSorted|groupBy/.test(src), 'piece-code.ts: nothing newer than iOS 15');
console.log(`piece code: ok (${themeIds.length} themes x ${Object.keys(FACE).length} letters x ${Object.keys(TABLES).length} languages, the file escapes and fetches nothing)`);
