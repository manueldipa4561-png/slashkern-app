// Guards the v11 navy palette (src/styles/app.css, the "v11 (12 Oct): slashkern navy" layer): WCAG AA for every text pair the tokens make (4.5:1), 3:1 for the border of a control,
// the selected fill and the accent on a navy block; the dormant dark tokens and the legal pages' two themes pass too; and no lime or warm black + lime value is left anywhere. Run: npm test
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync('src/styles/app.css', 'utf8');
const at = css.indexOf('/* ---- v11 (12 Oct)');
assert.ok(at > 0, 'app.css: the v11 navy layer is missing');
const v11 = css.slice(at);
assert.ok(!css.includes('/* ---- v10 (11 Oct)'), 'app.css: the v10 black + lime layer must be replaced, not kept after v11');

const tokenIn = (src, name, where) => {
  const m = src.match(new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6})`));
  assert.ok(m, `${where}: token --${name} must be a #rrggbb colour`);
  return m[1].toUpperCase();
};
const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const hex = (c) => `#${c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`.toUpperCase();
const lin = (v) => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; };
const lum = (h) => { const [r, g, b] = rgb(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const mix = (top, under, alpha) => hex(rgb(top).map((v, i) => v * alpha + rgb(under)[i] * (1 - alpha))); // `top` at `alpha` over `under`

const T = Object.fromEntries(['bg', 'fg', 'acc', 'on', 'dim', 'surf', 'acct', 'accd', 'line2', 'line', 'track'].map((n) => [n, tokenIn(v11, n, 'app.css v11')]));
assert.deepEqual([T.bg, T.surf, T.fg, T.dim, T.line, T.acc, T.on], ['#F5F7FF', '#FFFFFF', '#0E1B3D', '#5A6478', '#C9D1E6', '#2D4BFF', '#FFFFFF'],
  'app.css: the v11 tokens are page #F5F7FF, surface #FFFFFF, navy #0E1B3D, muted #5A6478, line #C9D1E6, ultramarine #2D4BFF with white on it');
const WHITE = '#FFFFFF', DANGER = '#A3241A';
const text = [
  ['navy on the page', T.fg, T.bg], ['navy on the surface', T.fg, T.surf], ['muted on the page', T.dim, T.bg], ['muted on the surface', T.dim, T.surf], ['muted on the track (a waiting button)', T.dim, T.track],
  ['accent text on the page', T.acct, T.bg], ['accent text on the surface', T.acct, T.surf], ['accent text on its 9% tint (assistant bubble)', T.acct, mix(T.acct, WHITE, 0.09)],
  ['white on ultramarine (selected chip, segment, tick, mic)', T.on, T.acc], ['navy on the 34% accent tile', T.fg, mix(T.acc, WHITE, 0.34)], ['navy on the 30% accent project card', T.fg, mix(T.acc, WHITE, 0.3)],
  ['navy on the 7% accent tint (strong answer)', T.fg, mix(T.acct, WHITE, 0.07)], ['navy on the 9% assistant bubble', T.fg, mix(T.acct, WHITE, 0.09)],
  ['white on navy (navy pill, welcome, kerncard, Home card)', WHITE, T.fg], ['white 90% on navy (Home card text)', mix(WHITE, T.fg, 0.9), T.fg], ['white 80% on navy (kerncard notes)', mix(WHITE, T.fg, 0.8), T.fg],
  ['white 76% on navy (Home card labels)', mix(WHITE, T.fg, 0.76), T.fg], ['white 72% on navy (first-run counter)', mix(WHITE, T.fg, 0.72), T.fg], ['white 62% on navy (struck-through guess)', mix(WHITE, T.fg, 0.62), T.fg],
  ['navy on the light accent inside a navy block (the Start buttons)', T.fg, T.accd], ['error red on the page', DANGER, T.bg], ['error red on the surface', DANGER, T.surf],
];
const edges = [ // 3:1 for the boundary of a control or a graphic that carries meaning (WCAG 1.4.11)
  ['control border on the page', T.line2, T.bg], ['control border on the surface', T.line2, T.surf], ['ultramarine selected fill on the page', T.acc, T.bg], ['ultramarine selected fill on the surface', T.acc, T.surf],
  ['progress fill on its track', T.acc, T.track], ['light accent (button, path) on a navy block', T.accd, T.fg],
];
// The dormant dark theme (the first `.k-scr {` tokens) and the legal pages' two themes (about, privacy, terms): text, muted and accent on the ground, and text on an accent fill.
const dark = css.slice(css.indexOf('.k-scr { --bg:'));
const D = Object.fromEntries(['bg', 'fg', 'acc', 'on', 'dim'].map((n) => [n, tokenIn(dark, n, 'app.css dark .k-scr')]));
assert.deepEqual([D.bg, D.fg, D.acc, D.on], ['#0E1B3D', '#EEF2FF', '#7C93FF', '#0E1B3D'], 'app.css: the dark tokens are navy #0E1B3D, text #EEF2FF, accent #7C93FF, navy on the accent');
text.push(['dark theme: text on navy', D.fg, D.bg], ['dark theme: muted on navy', D.dim, D.bg], ['dark theme: accent text on navy', D.acc, D.bg], ['dark theme: navy on the accent', D.on, D.acc]);
for (const page of ['about', 'privacy', 'terms']) {
  const src = readFileSync(`src/pages/${page}.astro`, 'utf8'), light = src.slice(src.indexOf('prefers-color-scheme: light'));
  for (const [mode, part] of [['dark', src], ['light', light]]) {
    const P = Object.fromEntries(['bg', 'fg', 'acc', 'dim'].map((n) => [n, tokenIn(part, n, `${page}.astro ${mode}`)]));
    text.push([`${page} ${mode}: text`, P.fg, P.bg], [`${page} ${mode}: muted`, P.dim, P.bg], [`${page} ${mode}: links`, P.acc, P.bg]);
  }
}
for (const [name, a, b] of text) assert.ok(ratio(a, b) >= 4.5, `${name}: ${ratio(a, b).toFixed(2)}:1, needs 4.5:1 (${a} on ${b})`);
for (const [name, a, b] of edges) assert.ok(ratio(a, b) >= 3, `${name}: ${ratio(a, b).toFixed(2)}:1, needs 3:1 (${a} on ${b})`);

// White text only ever sits on a dark fill: a v11 rule that fills with the accent and sets a text colour sets var(--on) (white); one that fills with --accd sets navy.
const rules = [...v11.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({ sel: m[1].trim(), body: m[2] }));
for (const { sel, body } of rules) {
  const color = body.match(/(?:^|;)\s*color:\s*([^;]+)/)?.[1]?.trim();
  if (!color) continue;
  if (/background(?:-color)?:\s*var\(--acc\)/.test(body)) assert.equal(color, 'var(--on)', `app.css v11: "${sel}" fills with the accent, its text must be var(--on) (navy on ultramarine is 2.9:1)`);
  if (/background(?:-color)?:\s*var\(--accd\)/.test(body)) assert.equal(color, 'var(--fg)', `app.css v11: "${sel}" fills with the light accent, its text must be navy`);
}
const accentButtons = rules.filter((r) => /\.k-(go|btn)\b/.test(r.sel) && /background:\s*var\(--accd\)/.test(r.body)).map((r) => r.sel);
assert.deepEqual(accentButtons.sort(), [':root.light .k-scr .k-go.k-accb', ':root.light .k-scr .k-main .k-btn'].sort(), 'app.css v11: only two buttons take the light accent (the Start button on the navy Home card and on the navy welcome screen), one per screen');
// No lime and none of the old black + lime values anywhere a person sees them.
const OLD = /#(C9F24A|D6FF3D|B7F25E|E8E6DA|0F140E|2C5A3A|141A12|14241A|1D2E21|0A0A0A|ECECE6|F4F4F0|ECEADF|5F625A|E4E4DE|7D8077|DCDCD4|2F5A12)\b|rgba\(\s*(201,\s*242,\s*74|214,\s*255,\s*61|236,\s*234,\s*223|10,\s*10,\s*10|15,\s*20,\s*14)\b/i;
for (const f of ['src/styles/app.css', 'src/pages/index.astro', 'src/pages/about.astro', 'src/pages/privacy.astro', 'src/pages/terms.astro', 'src/pages/404.astro', 'src/scripts/app.ts', 'src/scripts/slash.ts', 'public/theme-init.js', 'public/manifest.webmanifest']) {
  const hit = readFileSync(f, 'utf8').match(OLD);
  assert.ok(!hit, `${f}: an old black + lime colour is left (${hit?.[0]})`);
}
console.log(`contrast: ok (${text.length} text pairs at 4.5:1 or better, ${edges.length} edges at 3:1, white only on dark fills, ${accentButtons.length} light-accent buttons, one per screen, no lime left)`);
