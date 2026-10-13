import { t2 } from './i18n';
import { cleanAi, cleanName, inTime } from './valid';

// Pieces: a longer project than the 3-step ones. The person makes five small choices (taps, and one short line) and ends with ONE thing to show: a page of its own, in their
// colours, with the steps they took. Nothing on it is generated: every part is what they picked or wrote, and Slash only asks questions on the way, so the page can say it is theirs.
// This file is data and checks, free of DOM code so scripts/check-pieces.mjs can test it (npm test). The screens are in pieces-ui.ts, the drawing in piece-view.ts.
// Append only: a saved run points at its piece by n, so never reorder an entry or reuse a number. Every company here is fictional and the page says so.
export type Opt = { id: string; label: string; hex?: string; d?: string }; // hex: a colour to pick, d: a logo shape (an SVG path on a 100 x 100 grid)
type Say = { q: string; hint: string };
export type Step = Say & ({ kind: 'pick'; n: number; opts: Opt[]; look?: 'swatch' | 'shape' | 'chip' } | { kind: 'text'; ph: string; max: number; words: number });
export type Piece = { id: string; n: number; f: string; kind: 'brand'; title: string; blurb: string; who: string; client: string; brief: string; mins: number; steps: Step[] };

// A saved piece in progress or made. f and i make its sync key like an answer's (sync.ts), so i starts at PIECE_AT: it can never equal the index of a project.
// s: one entry per step done, the ids joined by "," for a pick and the text for a line. done: when the last step was saved. q: how many times Slash was asked a question on the way.
export const PIECE_AT = 100;
export type Run = { f: string; i: number; at: number; ed?: number; ai?: true; s: string[]; done?: number; q?: number };

const pick = (q: string, hint: string, n: number, opts: Opt[], look?: 'swatch' | 'shape' | 'chip'): Step => ({ kind: 'pick', q, hint, n, opts, look });
const o = (id: string, en: string, it: string, extra: Partial<Opt> = {}): Opt => ({ id, label: t2(en, it), ...extra });

// The logo shapes: one path each on a 100 x 100 grid, drawn as an SVG path on screen and as a Path2D on the image. The burst is a 12-point star computed once.
const burst = (() => {
  const pts: string[] = [];
  for (let k = 0; k < 24; k++) { const a = (Math.PI * 2 * k) / 24 - Math.PI / 2, r = k % 2 ? 37 : 47; pts.push(`${(50 + r * Math.cos(a)).toFixed(1)} ${(50 + r * Math.sin(a)).toFixed(1)}`); }
  return `M${pts.join('L')}Z`;
})();
const SHAPES: Opt[] = [
  o('circle', 'Circle', 'Cerchio', { d: 'M50 6a44 44 0 1 0 0 88a44 44 0 1 0 0-88Z' }),
  o('arch', 'Arch', 'Arco', { d: 'M12 92V50a38 38 0 0 1 76 0v42Z' }),
  o('leaf', 'Leaf', 'Foglia', { d: 'M10 90C10 42 42 10 90 10c0 48-32 80-80 80Z' }),
  o('burst', 'Sunburst', 'Raggi', { d: burst }),
  o('drop', 'Drop', 'Goccia', { d: 'M50 6C50 6 84 42 84 62a34 34 0 0 1-68 0C16 42 50 6 50 6Z' }),
  o('hex', 'Hexagon', 'Esagono', { d: 'M50 5L89 27.5V72.5L50 95L11 72.5V27.5Z' }),
];

const tag = (en: string, it: string) => t2('Practice project · ' + en, 'Progetto di prova · ' + it); // the same tag as every practice project in missions.ts

export const PIECES: Piece[] = [
  {
    id: 'design-brand', n: 0, f: 'Design', kind: 'brand', client: 'Bar Ficus', mins: 10,
    title: t2('Brand sheet for a bar', 'Scheda del brand per un bar'),
    blurb: t2('Pick a few things and end with a page that shows how a bar looks and feels.', 'Scegli poche cose e finisci con una pagina che mostra com’è e cosa trasmette un bar.'),
    who: tag('Bar Ficus (fictional)', 'Bar Ficus (fittizio)'),
    brief: t2('Bar Ficus has no brand yet: no colours, no logo, no line under the name. Rosa wants one page that shows how the bar looks and feels. You make it in five small steps.',
      'Bar Ficus non ha ancora un brand: niente colori, niente logo, niente frase sotto il nome. Rosa vuole una pagina che mostri com’è e cosa trasmette il bar. La fai in cinque piccoli passi.'),
    steps: [
      pick(t2('What should people remember about Bar Ficus?', 'Cosa devono ricordare le persone di Bar Ficus?'), t2('Pick one. A brand is one thing, said clearly.', 'Scegline una. Un brand è una cosa sola, detta chiaramente.'), 1, [
        o('plant', 'The giant plant by the cash register', 'La pianta gigante vicino alla cassa'),
        o('rosa', 'Rosa, who calls everyone “tesoro”', 'Rosa, che chiama tutti “tesoro”'),
        o('since', 'Open since 1987', 'Aperto dal 1987'),
        o('loud', 'Loud at 6pm, sleepy at 3pm', 'Chiassoso alle 18, assonnato alle 15'),
        o('morning', 'Coffee in the morning, Spritz at night', 'Caffè la mattina, Spritz la sera'),
      ]),
      pick(t2('Pick three words for how Bar Ficus feels.', 'Scegli tre parole per come ti fa sentire Bar Ficus.'), t2('Go with your first instinct. Three words, no more.', 'Vai d’istinto. Tre parole, non di più.'), 3, [
        o('friendly', 'Friendly', 'Amichevole'), o('loud', 'Loud', 'Rumoroso'), o('calm', 'Calm', 'Calmo'), o('oldschool', 'Old-school', 'Vecchia scuola'), o('playful', 'Playful', 'Giocoso'),
        o('cosy', 'Cosy', 'Accogliente'), o('bold', 'Bold', 'Deciso'), o('fresh', 'Fresh', 'Fresco'), o('local', 'Local', 'Di quartiere'), o('quirky', 'Quirky', 'Stravagante'),
      ], 'chip'),
      pick(t2('Pick three colours. The first one is the main one.', 'Scegli tre colori. Il primo è quello principale.'), t2('Colours work as a team. Pick the ones that look good together.', 'I colori funzionano in squadra. Scegli quelli che stanno bene insieme.'), 3, [
        o('espresso', 'Espresso', 'Espresso', { hex: '#3A2618' }), o('ficus', 'Ficus green', 'Verde ficus', { hex: '#2E6B3E' }), o('tomato', 'Tomato', 'Pomodoro', { hex: '#D8452B' }), o('cream', 'Cream', 'Crema', { hex: '#F4ECDD' }),
        o('sun', 'Sunny yellow', 'Giallo sole', { hex: '#F2B632' }), o('spritz', 'Spritz orange', 'Arancione spritz', { hex: '#F28C28' }), o('sky', 'Sky blue', 'Azzurro cielo', { hex: '#7FB6E8' }), o('plum', 'Plum', 'Prugna', { hex: '#5B2A5E' }),
      ], 'swatch'),
      pick(t2('Pick the shape of the logo.', 'Scegli la forma del logo.'), t2('The logo is your shape with the letters BF in it. You can draw a better one later.', 'Il logo è la tua forma con dentro le lettere BF. Più avanti potrai disegnarne uno migliore.'), 1, SHAPES, 'shape'),
      { kind: 'text', q: t2('Write the line under the name. Four words or fewer.', 'Scrivi la frase sotto il nome. Quattro parole al massimo.'), hint: t2('Say what makes the bar special, not what it sells.', 'Di’ cosa rende speciale il bar, non cosa vende.'), ph: t2('Coffee, plants, Rosa.', 'Caffè, piante, Rosa.'), max: 40, words: 4 },
    ],
  },
];

// The words around a piece: the card on Projects, the steps, the sheet, the proof. In one place so their translations are checked with the rest (scripts/check-content.mjs).
export const PL = {
  card: t2('A piece for your page', 'Un pezzo per la tua pagina'),
  meta: t2('{n} small steps · about {m} min', '{n} piccoli passi · circa {m} min'),
  start: t2('Start', 'Inizia'),
  again: t2('Make it again', 'Rifallo'),
  see: t2('See your piece', 'Vedi il tuo pezzo'),
  progress: t2('{k} of {n} steps done', '{k} passi su {n} fatti'),
  madeOn: t2('Made {d}', 'Fatto il {d}'),
  step: t2('Step {n} of {all}', 'Passo {n} di {all}'),
  picked: t2('{k} of {n} picked', '{k} su {n} scelti'),
  words: t2('{w} of {max} words', '{w} parole su {max}'),
  fewer: t2('Try {n} words or fewer.', 'Prova con {n} parole al massimo.'),
  last: t2('See my piece', 'Vedi il mio pezzo'),
  ready: t2('Your piece is ready', 'Il tuo pezzo è pronto'),
  save: t2('Save as image', 'Salva come immagine'),
  saved: t2('Image saved.', 'Immagine salvata.'),
  how: t2('How it was made', 'Come è nato'),
  span: t2('Started {a} · finished {b}', 'Iniziato {a} · finito {b}'),
  yours: t2('Every choice on this page was picked or written by you.', 'Ogni scelta in questa pagina l’hai scelta o scritta tu.'),
  asked: t2('Questions from Slash on the way: {n}. Slash wrote nothing.', 'Domande di Slash lungo il percorso: {n}. Slash non ha scritto niente.'),
  noAi: t2('No AI wrote any of it.', 'Nessuna AI ha scritto niente.'),
  ai: t2('Made with AI help', 'Creato con l’aiuto dell’AI'), // the same tag as everywhere (app.ts AI_TAG)
  done: t2('Done', 'Fatto'),
  del: t2('Delete this piece', 'Elimina questo pezzo'),
  gone: t2('Piece deleted.', 'Pezzo eliminato.'),
  list: t2('Your pieces', 'I tuoi pezzi'),
  going: t2('In progress · {k} of {n} steps', 'In corso · {k} passi su {n}'),
  tag: t2('Brand sheet · concept', 'Scheda del brand · concept'),
  colours: t2('Colours', 'Colori'),
  feeling: t2('The feeling', 'La sensazione'),
  one: t2('The one thing', 'La cosa da ricordare'),
  by: t2('Made by {n} · {d}', 'Fatto da {n} · {d}'),
  on: t2('Made on slashkern · {d}', 'Fatto su slashkern · {d}'),
  logo: t2('Logo: {s} with the letters {m}', 'Logo: {s} con le lettere {m}'),
  link: t2('Copy link', 'Copia link'), // the same Italian as the existing 'Copy link'
  linkNote: t2('Anyone with the link sees this page and the name on it.', 'Chiunque abbia il link vede questa pagina e il nome che c’è sopra.'),
  linkText: t2('My piece “{t}”, made on slashkern.', 'Il mio pezzo “{t}”, fatto su slashkern.'),
  nameL: t2('Name on your page (optional)', 'Nome sulla tua pagina (facoltativo)'),
  theirs: t2('Every choice on this page was picked or written by whoever made it.', 'Ogni scelta in questa pagina l’ha scelta o scritta chi l’ha fatta.'),
  cta: t2('Make your own on slashkern', 'Fai il tuo su slashkern'),
  shared: t2('Shared by link. slashkern did not check what it says.', 'Condiviso con un link. slashkern non ha controllato cosa dice.'),
  bad: t2('This link does not work.', 'Questo link non funziona.'),
};

export const pieceOf = (r: { f: string; i: number }) => PIECES.find((p) => p.f === r.f && PIECE_AT + p.n === r.i);
export const pieceFor = (f: string) => PIECES.find((p) => p.f === f);
export const wordsIn = (t: string) => (t.trim() ? t.trim().split(/\s+/).length : 0);
export const initials = (name: string) => name.split(/\s+/).map((w) => [...w][0] ?? '').join('').toUpperCase().slice(0, 2);

// One answer is allowed for its step: a pick holds exactly n ids of the step's options (no repeats), a line holds 1 to max characters.
export const stepOk = (st: Step, a: string): boolean => {
  if (st.kind === 'text') { const t = a.trim(); return !!t && [...t].length <= st.max; }
  const ids = a ? a.split(',') : [];
  return ids.length === st.n && new Set(ids).size === ids.length && ids.every((id) => st.opts.some((x) => x.id === id));
};
// A stored or synced run is untrusted input: keep only well-formed values, and only the steps whose answers are valid in a row (done needs all of them).
export function cleanRun(v: unknown): Run | null {
  if (!v || typeof v !== 'object') return null;
  const x = v as Record<string, unknown>, p = typeof x.f === 'string' && Number.isInteger(x.i) ? pieceOf({ f: x.f, i: x.i as number }) : undefined;
  if (!p || !inTime(x.at) || !Array.isArray(x.s)) return null;
  const s: string[] = [];
  for (let k = 0; k < p.steps.length; k++) { const a = x.s[k]; if (typeof a !== 'string' || !stepOk(p.steps[k], a)) break; s.push(p.steps[k].kind === 'text' ? a.trim() : a); }
  return { f: p.f, i: PIECE_AT + p.n, at: x.at, ed: inTime(x.ed) ? x.ed : undefined, ai: cleanAi(x.ai), s, done: s.length === p.steps.length && inTime(x.done) ? x.done : undefined, q: Number.isInteger(x.q) && (x.q as number) > 0 ? Math.min(x.q as number, 99) : undefined };
}
export const cleanRuns = (v: unknown): Run[] => (Array.isArray(v) ? v.map(cleanRun).filter((r): r is Run => !!r).slice(-20) : []);
// The run a piece shows: the newest one (a second device may have started another).
export const latestRun = (runs: readonly Run[], p: Piece): Run | undefined => runs.filter((r) => r.f === p.f && r.i === PIECE_AT + p.n).sort((a, b) => b.at - a.at)[0];

// Colours. Whatever three the person picks, the page stays readable: the lightest becomes the ground (or paper, when all three are dark), the darkest the ink (or near-black / paper
// when it is too close to the ground), the third the accent. The logo takes the first pick, unless that is too close to the ground to be seen.
export const INK = '#14181F', PAPER = '#FBF8F2';
const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
export const lum = (hex: string) => { const [r, g, b] = [1, 3, 5].map((i) => lin(parseInt(hex.slice(i, i + 2), 16) / 255)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
export const contrast = (a: string, b: string) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const readable = (bg: string) => (contrast(INK, bg) >= contrast(PAPER, bg) ? INK : PAPER);
export type Look = { bg: string; ink: string; acc: string; onAcc: string; logo: string; onLogo: string };
export function lookOf(picks: readonly string[]): Look {
  const byLight = [...picks].sort((a, b) => lum(b) - lum(a));
  const bg = lum(byLight[0]) >= 0.45 ? byLight[0] : PAPER, darkest = byLight[byLight.length - 1];
  const ink = contrast(darkest, bg) >= 4.5 ? darkest : readable(bg);
  const acc = picks.find((h) => h !== bg && h !== ink) ?? picks[0], logo = contrast(picks[0], bg) >= 1.6 ? picks[0] : ink;
  return { bg, ink, acc, onAcc: readable(acc), logo, onLogo: readable(logo) };
}

// What a brand sheet shows, read from a run (tr turns a label into the person's language). null until every step is answered.
export type BrandView = { name: string; mono: string; line: string; shape: { id: string; label: string; d: string }; look: Look; swatches: { name: string; hex: string }[]; words: string[]; one: string };
export function brandView(p: Piece, r: Run, tr: (s: string) => string): BrandView | null {
  if (p.kind !== 'brand' || r.s.length < p.steps.length) return null;
  const [one, words, colours, shape] = p.steps, a = r.s;
  const label = (st: Step, id: string) => (st.kind === 'pick' ? st.opts.find((x) => x.id === id) : undefined);
  const sw = a[2].split(',').map((id) => label(colours, id)!), sh = label(shape, a[3])!;
  return {
    name: p.client, mono: initials(p.client), line: a[4], shape: { id: sh.id, label: tr(sh.label), d: sh.d! }, look: lookOf(sw.map((x) => x.hex!)),
    swatches: sw.map((x) => ({ name: tr(x.label), hex: x.hex! })), words: a[1].split(',').map((id) => tr(label(words, id)!.label)), one: tr(label(one, a[0])!.label),
  };
}

// A link to one finished piece, to put on a CV or send in a message: its picks and line, the name on it and when it was made, as URL-safe base64 after the # (so it never reaches a
// server). Anyone with the link sees the page, which says it was shared by link and not checked. A link is read like stored data: untrusted, cleaned by cleanRun, finished pieces only.
export const LINK_MAX = 1200; // characters of data a link may carry
const toB64 = (s: string) => btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64 = (b: string) => new TextDecoder().decode(Uint8Array.from(atob(b.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0)));
export const pieceLink = (origin: string, r: Run, name: string) => `${origin}/p/#${toB64(JSON.stringify({ v: 1, f: r.f, i: r.i, at: r.at, s: r.s, done: r.done, q: r.q, ai: r.ai, n: cleanName(name).trim() }))}`;
export type Shared = { run: Run; name: string };
export function readPieceLink(hash: string): Shared | null {
  const m = /^#?([A-Za-z0-9_-]+)$/.exec(hash.trim());
  if (!m || m[1].length > LINK_MAX) return null;
  try {
    const o = JSON.parse(fromB64(m[1])), run = o && o.v === 1 ? cleanRun(o) : null;
    return run?.done ? { run, name: cleanName(o.n).trim() } : null;
  } catch { return null; }
}
