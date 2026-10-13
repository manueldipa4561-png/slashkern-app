import { t2 } from './i18n';

// What every piece is made of (pieces.ts lists them, piece-<name>.ts is one piece each). Free of DOM code so scripts/check-pieces.mjs can test it (npm test).
// A piece is a longer project than the 3-step ones: a few small steps (taps, a beat, a short line) that end in ONE page the person can show. Nothing on that page is generated
// behind their back: every part is what they picked or wrote, and Slash only asks questions on the way. The one exception is a step of kind 'run' (the Prompting piece), where the
// person sends their own prompt to the AI and keeps what it made: that run is marked ai and the page says "Made with AI help".

export type Tr = (s: string) => string; // an English text in the person's language
export type T = { tr: Tr; fill: (en: string, v: Record<string, string | number>) => string }; // fill: tr, then every {name} filled once

export type Opt = { id: string; label: string; hex?: string; d?: string }; // hex: a colour to pick, d: a shape (an SVG path on a 100 x 100 grid)
type Say = { q: string; hint: string };
// pick: n different ids of opts, shown as rows, chips, colour swatches or shapes. text: one short line. beat: 3 rows x 8 steps of drums, 24 characters of 0 and 1 (BEAT_MIN hits at least).
// run: the AI answers what the person sent (the piece turns their picks and lines into a prompt); the answer is the AI's text (at most max characters) and may be skipped ('').
export type Step = Say & (
  | { kind: 'pick'; n: number; opts: Opt[]; look?: 'swatch' | 'shape' | 'chip' }
  | { kind: 'text'; ph: string; max: number; words: number; lines?: number }
  | { kind: 'beat' }
  | { kind: 'run'; max: number }
);
export type Piece = { id: string; n: number; f: string; title: string; blurb: string; who: string; client: string; brief: string; mins: number; steps: Step[]; monoFrom?: number; cover?: boolean }; // monoFrom: the text step whose initials go in a logo or cover (else the client's); cover: the picked colour is the ground and the shape sits on it (else the shape is filled with it)

// A saved piece in progress or made. f and i make its sync key like an answer's (sync.ts), so i starts at PIECE_AT: it can never equal the index of a project.
// s: one entry per step done: the ids joined by "," for a pick, the text for a line, 24 zeros and ones for a beat, the AI's text for a run. done: when the last step was saved.
// q: how many times Slash was asked a question on the way. ai: some of it was made by the AI (only a run step does that).
export const PIECE_AT = 100;
export type Run = { f: string; i: number; at: number; ed?: number; ai?: true; s: string[]; done?: number; q?: number };

// What a piece module exports: its data, what the page shows (view, pure: null until every step is answered), and its two drawings, on screen and as a picture to save and post.
// file: a piece that is also a real file (the Code piece is a web page): its name, type, text and the label of the button.
export type Kind = {
  piece: Piece;
  view: (r: Run, tr: Tr) => unknown | null;
  dom: (v: any, by: string, t: T) => HTMLElement; // eslint-disable-line @typescript-eslint/no-explicit-any
  img: (v: any, by: string, t: T) => Promise<Blob | null>; // eslint-disable-line @typescript-eslint/no-explicit-any
  file?: (v: any, by: string, t: T) => { name: string; mime: string; text: string; label: string }; // eslint-disable-line @typescript-eslint/no-explicit-any
  prompt?: (r: Run, tr: Tr) => string; // a piece with a 'run' step: the prompt made from the answers so far (in the person's language), which the screen shows and sends to the AI
};

export const pick = (q: string, hint: string, n: number, opts: Opt[], look?: 'swatch' | 'shape' | 'chip'): Step => ({ kind: 'pick', q, hint, n, opts, look });
export const text = (q: string, hint: string, ph: string, max: number, words: number, lines?: number): Step => ({ kind: 'text', q, hint, ph, max, words, lines });
export const beat = (q: string, hint: string): Step => ({ kind: 'beat', q, hint });
export const run = (q: string, hint: string, max: number): Step => ({ kind: 'run', q, hint, max });
export const o = (id: string, en: string, it: string, extra: Partial<Opt> = {}): Opt => ({ id, label: t2(en, it), ...extra });
export const tag = (en: string, it: string) => t2('Practice project · ' + en, 'Progetto di prova · ' + it); // the same tag as every practice project in missions.ts

export const BEAT_STEPS = 8, BEAT_ROWS = 3, BEAT_MIN = 4; // a beat answer is rows of kick, snare, hat, 8 steps each
export const wordsIn = (t: string) => (t.trim() ? t.trim().split(/\s+/).length : 0);
export const initials = (name: string) => [...name.split(/\s+/).map((w) => [...w].find((c) => /[\p{L}\p{N}]/u.test(c)) ?? '').join('').toUpperCase()].slice(0, 2).join(''); // the first letter or digit of each word: a word that is only an emoji or a symbol gives none, and nothing is cut in half

// One answer is allowed for its step.
export const stepOk = (st: Step, a: string): boolean => {
  if (st.kind === 'text') { const t = a.trim(); return !!t && [...t].length <= st.max; }
  if (st.kind === 'beat') return new RegExp(`^[01]{${BEAT_STEPS * BEAT_ROWS}}$`).test(a) && [...a].filter((c) => c === '1').length >= BEAT_MIN;
  if (st.kind === 'run') return [...a.trim()].length <= st.max; // empty is a skipped run: the page then shows the prompt alone
  const ids = a ? a.split(',') : [];
  return ids.length === st.n && new Set(ids).size === ids.length && ids.every((id) => st.opts.some((x) => x.id === id));
};
// The answer a step stores for what the person did: a line is trimmed, the rest is kept as it is.
export const keep = (st: Step, a: string) => (st.kind === 'text' || st.kind === 'run' ? a.trim() : a);

// Colours. Contrast is the WCAG ratio; a page picks near-black or paper, whichever reads better on its ground.
export const INK = '#14181F', PAPER = '#FBF8F2';
const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
export const lum = (hex: string) => { const [r, g, b] = [1, 3, 5].map((i) => lin(parseInt(hex.slice(i, i + 2), 16) / 255)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
export const contrast = (a: string, b: string) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
export const readable = (bg: string) => (contrast(INK, bg) >= contrast(PAPER, bg) ? INK : PAPER);

// The shapes of a logo or a cover: one path each on a 100 x 100 grid, drawn as an SVG path on screen and as a Path2D on the picture. The burst is a 12-point star computed once.
const burst = (() => {
  const pts: string[] = [];
  for (let k = 0; k < 24; k++) { const a = (Math.PI * 2 * k) / 24 - Math.PI / 2, r = k % 2 ? 37 : 47; pts.push(`${(50 + r * Math.cos(a)).toFixed(1)} ${(50 + r * Math.sin(a)).toFixed(1)}`); }
  return `M${pts.join('L')}Z`;
})();
export const SHAPES: Opt[] = [
  o('circle', 'Circle', 'Cerchio', { d: 'M50 6a44 44 0 1 0 0 88a44 44 0 1 0 0-88Z' }),
  o('arch', 'Arch', 'Arco', { d: 'M12 92V50a38 38 0 0 1 76 0v42Z' }),
  o('leaf', 'Leaf', 'Foglia', { d: 'M10 90C10 42 42 10 90 10c0 48-32 80-80 80Z' }),
  o('burst', 'Sunburst', 'Raggi', { d: burst }),
  o('drop', 'Drop', 'Goccia', { d: 'M50 6C50 6 84 42 84 62a34 34 0 0 1-68 0C16 42 50 6 50 6Z' }),
  o('hex', 'Hexagon', 'Esagono', { d: 'M50 5L89 27.5V72.5L50 95L11 72.5V27.5Z' }),
];
// Letters inside a shape (a cover, a logo preview) are cut out in the ground colour, so wherever they cross the shape's edge they vanish into it (a name like "Wide Mow" has the widest pair, WM). Per shape,
// w is how wide letters may be at the height they stand (on the shape's own 100 grid, worked out from its outline) and dy how far down they sit (a drop and an arch carry their weight low).
// The size is then the largest up to 34 (the size of the logo letters in the brand sheet) that fits: letterSize(shape id, the letters' width in em).
export const FIT: Record<string, { w: number; dy: number }> = { circle: { w: 80, dy: 0 }, arch: { w: 70, dy: 3 }, leaf: { w: 44, dy: 0 }, burst: { w: 64, dy: 0 }, drop: { w: 54, dy: 8 }, hex: { w: 74, dy: 0 } };
const FIT_OTHER = { w: 44, dy: 0 }; // a shape added later is treated like the narrowest until it has its own numbers
export const fitOf = (shape: string) => FIT[shape] ?? FIT_OTHER;
export const letterSize = (shape: string, em: number) => Math.min(34, Math.floor(fitOf(shape).w / (Math.max(em, 0.1) * 1.06))); // 6% to spare: the font may not be loaded yet when the width is measured
