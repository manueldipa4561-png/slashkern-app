import { t2 } from './i18n';
import { initials, o, pick, tag, text, type Kind, type Piece, type Run, type Step, type T, type Tr } from './piece-types';
import { Draw, el, font, svgEl } from './piece-kit';

// Selling: a listing for a used desk lamp, for the fictional Marta, whose lamp has been online for three weeks without one message. Five small steps: the best thing to say first, two honest
// notes, a title, a price, and the reply to "Is it still available?". The page is a marketplace listing: a flat drawing of the lamp, the title and price, what is good and what is honest,
// and the chat. Everything on it is a pick or a line of the person's; only the lamp, "Used · Good" and the buyer's question are fixed, because they are the story.
export const L = {
  tag: t2('Listing · concept', 'Annuncio · concept'),
  used: t2('Used · Good', 'Usata · Buone condizioni'),
  honest: t2('Honest notes', 'Note oneste'),
  chat: t2('Chat', 'Chat'),
  ask: t2('Is it still available?', 'È ancora disponibile?'),
};

export const piece: Piece = {
  id: 'selling-listing', n: 4, f: 'Selling', client: 'Marta', mins: 10,
  title: t2('Listing for a used desk lamp', 'Annuncio per una lampada da scrivania usata'),
  blurb: t2('Pick what to say and write two short lines. You end with an honest listing for a used lamp.', 'Scegli cosa dire e scrivi due righe brevi. Alla fine hai un annuncio onesto per una lampada usata.'),
  who: tag('Marta (fictional)', 'Marta (fittizia)'),
  brief: t2('Marta’s desk lamp has been online for three weeks and nobody has written to her. You write the listing that sells it, honestly, in five small steps.',
    'La lampada da scrivania di Marta è online da tre settimane e nessuno le ha scritto. Tu scrivi l’annuncio che la vende, con onestà, in cinque piccoli passi.'),
  steps: [
    pick(t2('What should the listing say first?', 'Cosa deve dire prima di tutto l’annuncio?'), t2('Pick one. Start with the best thing that is true.', 'Scegline una. Parti dalla cosa migliore che sia vera.'), 1, [
      o('works', 'Works perfectly', 'Funziona perfettamente'),
      o('light', 'Warm, soft light', 'Luce calda e morbida'),
      o('bends', 'Bends in any direction', 'Si piega in ogni direzione'),
      o('metal', 'Solid metal, no plastic', 'Metallo solido, niente plastica'),
      o('shelf', 'Looks great on a shelf', 'Sta benissimo su una mensola'),
    ]),
    pick(t2('Which two honest notes do you add?', 'Quali due note oneste aggiungi?'), t2('Say the small flaws yourself. People trust that.', 'Di’ tu i piccoli difetti. Chi compra si fida di più.'), 2, [
      o('scratch', 'A scratch on the base', 'Un graffio sulla base'),
      o('cable', 'The cable is a bit short', 'Il cavo è un po’ corto'),
      o('dent', 'A small dent on the shade', 'Una piccola ammaccatura sul paralume'),
      o('box', 'No original box', 'Niente scatola originale'),
      o('switch', 'The switch is a bit stiff', 'L’interruttore è un po’ duro'),
    ]),
    text(t2('Write the title of the listing.', 'Scrivi il titolo dell’annuncio.'), t2('Say what it is and one good thing. Nine words or fewer.', 'Di’ cos’è e una cosa buona. Nove parole al massimo.'),
      t2('Metal desk lamp, warm light, works perfectly', 'Lampada in metallo, luce calda, funziona bene'), 48, 9),
    pick(t2('Pick a price for the lamp.', 'Scegli un prezzo per la lampada.'), t2('It cost €40 new. A fair price gets a faster reply.', 'Da nuova costava 40 €. Con un prezzo giusto ti rispondono prima.'), 1, [
      o('p10', '€10', '10 €'), o('p15', '€15', '15 €'), o('p18', '€18', '18 €'), o('p25', '€25', '25 €'),
    ], 'chip'),
    text(t2('A buyer asks “Is it still available?” Write the reply.', 'Chi compra chiede “È ancora disponibile?” Scrivi la risposta.'), t2('Be friendly and short. Offer one next step.', 'Sii gentile e breve. Proponi cosa fare dopo.'),
      t2('Yes, it is. I can show it working when you pick it up.', 'Sì, è disponibile. Quando passi te la faccio vedere accesa.'), 90, 16, 2),
  ],
};

// The colours are fixed (nothing here is picked by the person), so the page and the picture share one set: the page sets them as custom properties, the picture reads them from here.
export const PAL = { paper: '#FFFFFF', ink: '#0E1B3D', blue: '#2D4BFF', white: '#FFFFFF', wall: '#FAD7BC', desk: '#EDAE86', light: '#FFF3C8', tint: '#ECEFFF', pane: '#F5F7FF', line: '#C9D1E6' };
const VARS: Record<string, string> = { '--pc-bg': PAL.paper, '--pc-ink': PAL.ink, '--pc-acc': PAL.blue, '--pc-on-acc': PAL.white, '--sl-wall': PAL.wall, '--sl-tint': PAL.tint, '--sl-pane': PAL.pane, '--sl-line': PAL.line };

// What the listing shows, read from a run (tr turns a label into the person's language). null until every step is answered.
export type V = { seller: string; mono: string; title: string; price: string; best: string; notes: string[]; reply: string };
export function view(r: Run, tr: Tr): V | null {
  if (r.s.length < piece.steps.length) return null;
  const [best, notes, , price] = piece.steps, a = r.s;
  const label = (st: Step, id: string) => (st.kind === 'pick' ? tr(st.opts.find((x) => x.id === id)?.label ?? '') : '');
  return { seller: piece.client, mono: initials(piece.client), title: a[2], price: label(price, a[3]), best: label(best, a[0]), notes: a[1].split(',').map((id) => label(notes, id)), reply: a[4] };
}

// Flat shapes: one list is drawn as inline SVG on the page and on the canvas of the picture. A shape is a path with a fill and/or a round-capped stroke, and an optional opacity.
type Shape = { d: string; fill?: string; stroke?: string; w?: number; a?: number };
const pt = ([px, py]: number[]) => `${Math.round(px * 10) / 10} ${Math.round(py * 10) / 10}`;
const poly = (...ps: number[][]) => `M${ps.map(pt).join('L')}Z`;
// An oval from one end of its long axis (a) to the other (b), ry high, turned by deg.
const oval = (a: number[], b: number[], ry: number, deg: number) => { const rx = Math.round((Math.hypot(b[0] - a[0], b[1] - a[1]) / 2) * 10) / 10; return `M${pt(a)}A${rx} ${ry} ${deg} 0 1 ${pt(b)}A${rx} ${ry} ${deg} 0 1 ${pt(a)}Z`; };
const dot = (cx: number, cy: number, r: number) => oval([cx - r, cy], [cx + r, cy], r, 0);

// The lamp on a 320 x 200 view (BOX: shifted so the lamp and its light sit in the middle): a desk, a domed base, two arms, a shade that hangs from the last joint (turned TILT degrees
// about it) and the light it throws on the desk.
const BOX = [22, 0, 320, 200], JOINT = [204, 48], TILT = -10;
const onShade = (x: number, y: number) => { const a = (TILT * Math.PI) / 180; return [JOINT[0] + x * Math.cos(a) - y * Math.sin(a), JOINT[1] + x * Math.sin(a) + y * Math.cos(a)]; };
export const SCENE: Shape[] = [
  { d: 'M-40 0H360V200H-40Z', fill: PAL.wall },
  { d: 'M-40 150H360V200H-40Z', fill: PAL.desk },
  { d: dot(212, 88, 66), fill: PAL.light, a: 0.3 }, // a glow behind the head of the lamp
  { d: poly(onShade(-30, 38), onShade(30, 38), [304, 166], [158, 166]), fill: PAL.light, a: 0.5 }, // the light
  { d: oval([156, 166], [306, 166], 11, 0), fill: PAL.light, a: 0.6 }, // where it lands on the desk
  { d: oval([48, 160], [160, 160], 5, 0), fill: PAL.ink, a: 0.14 }, // the shadow of the base
  { d: 'M62 158C62 148 80 143 104 143C128 143 146 148 146 158Z', fill: PAL.ink }, // the base
  { d: 'M104 136L138 62L204 48', stroke: PAL.ink, w: 7 }, // the arms
  { d: dot(104, 136, 8), fill: PAL.ink }, { d: dot(104, 136, 2.6), fill: PAL.wall },
  { d: dot(138, 62, 8), fill: PAL.ink }, { d: dot(138, 62, 2.6), fill: PAL.wall },
  { d: `M${pt(onShade(-30, 38))}C${pt(onShade(-30, 16))} ${pt(onShade(-16, 2))} ${pt(onShade(0, 2))}C${pt(onShade(16, 2))} ${pt(onShade(30, 16))} ${pt(onShade(30, 38))}Z`, fill: PAL.blue }, // the shade...
  { d: `M${pt(onShade(-23, 31))}C${pt(onShade(-23, 20))} ${pt(onShade(-16, 11))} ${pt(onShade(-8, 7))}`, stroke: PAL.white, w: 3, a: 0.35 },
  { d: oval(onShade(-30, 38), onShade(30, 38), 6, TILT), fill: PAL.light }, // ...and the lit opening under it
  { d: dot(JOINT[0], JOINT[1], 7), fill: PAL.ink }, { d: dot(JOINT[0], JOINT[1], 2.4), fill: PAL.wall },
];
// A round tick for the best thing, a ring with a dash for an honest note: two bullets that cannot be mistaken for each other. 24 x 24 grid.
const TICK: Shape[] = [{ d: dot(12, 12, 12), fill: PAL.blue }, { d: 'M7 12.5L10.2 15.7L17 8.8', stroke: PAL.white, w: 2.6 }];
const DASH: Shape[] = [{ d: dot(12, 12, 10.5), stroke: PAL.ink, w: 2 }, { d: 'M8 12H16', stroke: PAL.ink, w: 2.4 }];

const svgOf = (shapes: Shape[], box: string, cls: string): SVGSVGElement => {
  const svg = svgEl('svg', { viewBox: box, class: cls, 'aria-hidden': 'true', focusable: 'false' }) as SVGSVGElement;
  for (const s of shapes) {
    const attrs: Record<string, string> = { d: s.d, fill: s.fill ?? 'none' };
    if (s.stroke) Object.assign(attrs, { stroke: s.stroke, 'stroke-width': String(s.w ?? 1), 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    if (s.a !== undefined) attrs.opacity = String(s.a);
    svg.append(svgEl('path', attrs));
  }
  return svg;
};
const paint = (d: Draw, shapes: Shape[], px: number, py: number, k: number) => {
  const x = d.x;
  for (const s of shapes) {
    x.save(); x.translate(px, py); x.scale(k, k); x.globalAlpha = s.a ?? 1;
    const p = new Path2D(s.d);
    if (s.fill) { x.fillStyle = s.fill; x.fill(p); }
    if (s.stroke) { x.strokeStyle = s.stroke; x.lineWidth = s.w ?? 1; x.lineCap = 'round'; x.lineJoin = 'round'; x.stroke(p); }
    x.restore();
  }
};

// The page itself, styled by piece.css (.k-pc) and piece-selling.css.
export function dom(v: V, by: string, t: T): HTMLElement {
  const root = el('article', 'k-pc k-pc-selling'), hidden = (e: HTMLElement) => { e.setAttribute('aria-hidden', 'true'); return e; };
  const list = (cls: string, label: string, ...kids: HTMLElement[]) => { const u = el('ul', cls); u.setAttribute('role', 'list'); u.setAttribute('aria-label', label); u.append(...kids); return u; }; // a list is named by its label; role list keeps it a list in Safari, which drops it with list-style none
  for (const [k, c] of Object.entries(VARS)) root.style.setProperty(k, c);
  root.setAttribute('aria-label', `${v.title} · ${t.tr(L.tag)}`);
  const photo = el('div', 'k-pc-selling-photo'), head = el('div', 'k-pc-selling-head'), meta = el('div', 'k-pc-selling-meta'), title = el('div', 'k-pc-selling-title', v.title);
  title.setAttribute('role', 'heading'); title.setAttribute('aria-level', '3');
  photo.append(svgOf(SCENE, BOX.join(' '), 'k-pc-selling-scene'));
  meta.append(el('span', 'k-pc-selling-price', v.price), el('span', 'k-pc-selling-chip', t.tr(L.used)));
  head.append(title, meta);
  const good = el('p', 'k-pc-selling-best'), notes = el('section', 'k-pc-sec');
  good.append(svgOf(TICK, '0 0 24 24', 'k-pc-selling-ico'), el('span', '', v.best));
  notes.append(hidden(el('p', 'k-pc-l', t.tr(L.honest))), list('k-pc-selling-notes', t.tr(L.honest), ...v.notes.map((n) => { const li = el('li'); li.append(svgOf(DASH, '0 0 24 24', 'k-pc-selling-ico'), el('span', '', n)); return li; })));
  const who = el('div', 'k-pc-selling-who'), avatar = el('span', 'k-pc-selling-avatar', v.mono), pane = el('div', 'k-pc-selling-chat'), chat = el('section', 'k-pc-sec');
  avatar.setAttribute('aria-hidden', 'true'); who.append(avatar, el('span', 'k-pc-selling-name', v.seller));
  pane.append(who, list('k-pc-selling-msgs', t.tr(L.chat), el('li', 'k-pc-selling-buyer', t.tr(L.ask)), el('li', 'k-pc-selling-bubble', v.reply)));
  chat.append(hidden(el('p', 'k-pc-l', t.tr(L.chat))), pane);
  const foot = el('footer', 'k-pc-foot');
  foot.append(el('span', '', by), el('span', 'k-pc-brand', 'slashkern'));
  root.append(el('p', 'k-pc-tag', t.tr(L.tag)), photo, head, good, notes, chat, foot);
  return root;
}

// As a picture: the blocks go down the page in order, each measured before anything is drawn so the picture is as tall as the words need (the footer sits at the bottom edge). When the
// longest answers would not fit in 2400, the drawing of the lamp gives up height (it is cropped top and bottom); the words never do.
type Block = { h: number; draw: (y: number) => void };
const G = 36, TOP = 116, FOOT = 134, MAX = 2400, PHOTO = 500, LABEL = 52; // the gap between blocks, the top of the first one, the footer, the tallest picture, the photo, a label and its gap
const wide = (d: Draw, s: string, f: string) => { d.x.font = f; return d.x.measureText(s).width; };
const caption = (d: Draw, t: T, s: string, y: number) => d.put(t.tr(s).toUpperCase(), font(600, 26), PAL.ink, d.M, y + 26);
// Lines of about the same length: the narrowest width that still needs as many lines as the full one, so a last line is never one lonely word. More than max lines is cut with "…" (the
// title and the reply pass 99: they are short enough by their limits, 48 and 90 characters, and nothing the person wrote is ever cut).
const balanced = (d: Draw, s: string, f: string, max: number, width: number) => {
  const n = d.wrap(s, f, 99, width).length;
  if (n < 2 || n > max) return d.wrap(s, f, max, width);
  let w = width;
  while (w > 240 && d.wrap(s, f, 99, w - 12).length === n) w -= 12;
  return d.wrap(s, f, n, w);
};

function titleBlock(d: Draw, v: V): Block {
  const size = [72, 64, 56, 50, 44].find((s) => d.wrap(v.title, font(800, s), 99).length <= 3) ?? 44, f = font(800, size), ls = balanced(d, v.title, f, 99, d.TW), lh = Math.round(size * 1.08);
  return { h: ls.length * lh, draw: (y) => d.lines(ls, f, PAL.ink, d.M - 3, y + lh / 2 + size * 0.36, lh) };
}
function priceBlock(d: Draw, v: V, t: T): Block {
  const used = t.tr(L.used), pf = font(800, 52), cf = font(700, 32), pw = wide(d, v.price, pf) + 76, cw = wide(d, used, cf) + 56, { M } = d;
  return { h: 84, draw: (y) => {
    d.fillRect(M, y, pw, 84, 42, PAL.ink); d.put(v.price, pf, PAL.paper, M + 38, y + 42 + 19);
    d.strokeRect(M + pw + 20, y + 11, cw, 62, 31, PAL.ink, 3); d.put(used, cf, PAL.ink, M + pw + 20 + 28, y + 11 + 31 + 11);
  } };
}
function bestBlock(d: Draw, v: V): Block {
  const f = font(800, 42), ls = d.wrap(v.best, f, 2, d.TW - 118), h = Math.max(46, ls.length * 52) + 52, { M, TW } = d;
  return { h, draw: (y) => {
    d.fillRect(M, y, TW, h, 30, PAL.tint); paint(d, TICK, M + 28, y + (h - 46) / 2, 46 / 24);
    d.lines(ls, f, PAL.ink, M + 94, y + (h - ls.length * 52) / 2 + 26 + 15, 52);
  } };
}
function notesBlock(d: Draw, v: V, t: T): Block {
  const f = font(600, 36), ls = v.notes.map((n) => d.wrap(n, f, 2, d.TW - 62)), rows = ls.map((l) => Math.max(42, l.length * 46)), { M } = d;
  return { h: LABEL + rows.reduce((s, h) => s + h, 0) + 20 * (rows.length - 1), draw: (y) => {
    caption(d, t, L.honest, y);
    let ry = y + LABEL;
    ls.forEach((l, i) => { paint(d, DASH, M, ry + 2, 38 / 24); d.lines(l, f, PAL.ink, M + 62, ry + 23 + 13, 46); ry += rows[i] + 20; });
  } };
}
function chatBlock(d: Draw, v: V, t: T): Block {
  const { M, TW } = d, ask = t.tr(L.ask), af = font(600, 34), rf = font(500, 36), rl = balanced(d, v.reply, rf, 99, TW - 56 - 68), aw = wide(d, ask, af) + 64, rw = Math.max(...rl.map((l) => wide(d, l, rf))) + 68;
  const HEAD = 84, rh = rl.length * 48 + 40, paneH = HEAD + 28 + 80 + 20 + rh + 28;
  return { h: LABEL + paneH, draw: (y) => {
    caption(d, t, L.chat, y);
    const py = y + LABEL, x = d.x, bx = M + TW - 28 - aw, qy = py + HEAD + 28, ry = qy + 80 + 20;
    d.fillRect(M, py, TW, paneH, 34, PAL.pane);
    x.save(); d.rect(M, py, TW, paneH, 34); x.clip(); d.fillRect(M, py, TW, HEAD, 0, PAL.white); d.fillRect(M, py + HEAD - 2, TW, 2, 0, PAL.line); x.restore();
    d.strokeRect(M, py, TW, paneH, 34, PAL.line, 3);
    x.beginPath(); x.arc(M + 28 + 26, py + HEAD / 2, 26, 0, Math.PI * 2); x.fillStyle = PAL.wall; x.fill();
    d.put(v.mono, font(800, 28), PAL.ink, M + 28 + 26, py + HEAD / 2 + 10, 'center'); d.put(v.seller, font(800, 34), PAL.ink, M + 28 + 52 + 16, py + HEAD / 2 + 12);
    d.fillRect(bx, qy, aw, 80, 28, PAL.white); d.strokeRect(bx, qy, aw, 80, 28, PAL.line, 3); d.put(ask, af, PAL.ink, bx + 32, qy + 40 + 12);
    d.fillRect(M + 28, ry, rw, rh, 28, PAL.blue); d.lines(rl, rf, PAL.white, M + 28 + 34, ry + 20 + 24 + 13, 48);
  } };
}
function photoBlock(d: Draw, h: number): Block {
  const k = d.TW / BOX[2];
  return { h, draw: (y) => { const x = d.x; x.save(); d.rect(d.M, y, d.TW, h, 40); x.clip(); paint(d, SCENE, d.M - BOX[0] * k, y - (BOX[3] * k - h) / 2, k); x.restore(); } };
}

export async function img(v: V, by: string, t: T): Promise<Blob | null> {
  const d = await Draw.make(); if (!d) return null;
  const rest = [titleBlock(d, v), priceBlock(d, v, t), bestBlock(d, v), notesBlock(d, v, t), chatBlock(d, v, t)], below = rest.reduce((s, b) => s + b.h, 0) + G * rest.length + G + FOOT;
  const blocks = [photoBlock(d, Math.max(380, Math.min(PHOTO, MAX - TOP - below))), ...rest]; // the photo takes what is left, up to its full height
  d.size(TOP + blocks.reduce((s, b) => s + b.h, 0) + G * blocks.length + FOOT); d.fillAll(PAL.paper);
  d.put(t.tr(L.tag).toUpperCase(), font(600, 28), PAL.ink, d.M, 86);
  let y = TOP;
  for (const b of blocks) { b.draw(y); y += b.h + G; }
  d.footer(by, PAL.ink, PAL.paper);
  return d.blob();
}

export const kind: Kind = { piece, view, dom, img };
