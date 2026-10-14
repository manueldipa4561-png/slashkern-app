import { t2 } from './i18n';
import { INK, PAPER, initials, o, pick, readable, tag, text, type Kind, type Opt, type Piece, type Run, type Step, type T, type Tr } from './piece-types';
import { Draw, el, font, svgEl } from './piece-kit';

// Writing: a launch kit for a new flavour at the fictional Pigro Gelato. Five small steps: the flavour (its colour is the colour of the whole page), who it is for, its name, the sign for
// the counter, the caption for the first post. The page is those three things as they would look: the name as a poster, the sign on a chalkboard, the post in a feed. Everything on it is
// what the person picked or wrote; the handle and the avatar letters are the shop's, not generated.
const L = {
  tag: t2('Launch kit · concept', 'Kit di lancio · concept'),
  flavour: t2('New flavour', 'Gusto nuovo'),
  sign: t2('The sign', 'Il cartello'),
  post: t2('The first post', 'Il primo post'),
  forWho: t2('Pigro Gelato · for {who}', 'Pigro Gelato · per {who}'),
  now: t2('now', 'adesso'),
};
export const MUTE = '#5A6478'; // the muted text of the post ("now") on its white card: 5.9:1, the same grey as the app's muted text
const HANDLE = 'pigrogelato', CHALK_SOFT = 'rgba(251, 248, 242, .5)', PILL = 52; // CHALK_SOFT: the stitched edge and the screws of the board

export const piece: Piece = {
  id: 'writing-kit', n: 1, f: 'Writing', client: 'Pigro Gelato', mins: 10,
  title: t2('Launch kit for a new flavour', 'Kit di lancio per un gusto nuovo'),
  blurb: t2('Name a new flavour, write the sign for the counter and the first post, and end with one page you can show.',
    'Dai un nome a un gusto nuovo, scrivi il cartello per il banco e il primo post: alla fine hai una pagina da mostrare.'),
  who: tag('Pigro Gelato (fictional)', 'Pigro Gelato (fittizio)'),
  brief: t2('Pigro Gelato is a small, proudly slow gelato shop. It has a new flavour and nothing written for it yet. You write the launch kit in five small steps: the name, the sign for the counter and the caption for the first post.',
    'Pigro Gelato è una piccola gelateria, orgogliosamente lenta. Ha un gusto nuovo e ancora niente di scritto. Il kit di lancio lo scrivi tu, in cinque piccoli passi: il nome, il cartello per il banco e la caption del primo post.'),
  steps: [
    pick(t2('Which flavour is new at Pigro Gelato?', 'Qual è il gusto nuovo di Pigro Gelato?'), t2('Pick the one you would eat first. Its colour becomes the colour of your page.', 'Scegli quello che mangeresti per primo. Il suo colore diventa il colore della tua pagina.'), 1, [
      o('pistachio', 'Pistachio and sea salt', 'Pistacchio e sale marino', { hex: '#A8C686' }),
      o('hazelnut', 'Hazelnut and orange peel', 'Nocciola e scorza d’arancia', { hex: '#D49A5A' }),
      o('lemon', 'Lemon and basil', 'Limone e basilico', { hex: '#EDE06B' }),
      o('chocolate', 'Dark chocolate and chilli', 'Cioccolato fondente e peperoncino', { hex: '#6B2F2A' }),
      o('fig', 'Fig and honey', 'Fico e miele', { hex: '#B9879F' }),
    ], 'swatch'),
    pick(t2('Who is this flavour for?', 'Per chi è questo gusto?'), t2('Pick one. Writing is easier when you know who is reading.', 'Scegline uno. Scrivere è più facile quando sai chi legge.'), 1, [
      o('students', 'Students after an exam', 'Studenti dopo un esame'),
      o('grandparents', 'Grandparents on a Sunday', 'Nonni la domenica'),
      o('walkers', 'People walking home at night', 'Chi torna a casa a piedi di notte'),
      o('kids', 'Kids with a coin in their hand', 'Bambini con una moneta in mano'),
    ]),
    text(t2('Give the flavour a name. Four words or fewer.', 'Dai un nome al gusto. Quattro parole al massimo.'), t2('Say it out loud. It should hint at the taste and be fun to order.', 'Dillo ad alta voce. Deve far intuire il gusto ed essere divertente da ordinare.'), t2('Pistachio Siesta', 'Siesta al pistacchio'), 24, 4),
    text(t2('Write the sign for the counter. Ten words or fewer.', 'Scrivi il cartello per il banco. Dieci parole al massimo.'), t2('Keep it lazy, kind and a little funny, like the shop.', 'Tienilo pigro, gentile e un po’ buffo, come il locale.'), t2('Slow down. The gelato will wait.', 'Rallenta. Il gelato aspetta.'), 60, 10),
    text(t2('Write the caption for the first post. Twenty words or fewer.', 'Scrivi la caption del primo post. Venti parole al massimo.'), t2('Talk to the people you picked. Say what it is and when to come.', 'Parla alle persone che hai scelto. Di’ cos’è e quando passare.'), t2('New flavour, same slow Sunday. Come and take your time.', 'Gusto nuovo, stessa domenica lenta. Passa e prenditi il tuo tempo.'), 120, 20, 3),
  ],
};

// Colours. The flavour is the ground of the whole page; the ink is near-black or paper, whichever reads better on it (every flavour is checked in scripts/check-piece-writing.mjs). The sign
// is always a dark board with paper-coloured chalk and the post a white card, so they read the same on every flavour. shine: the soft circle on the post's picture, lighter than the ground
// under dark ink and darker under paper ink, so the name on top of it never loses contrast.
export type Look = { bg: string; ink: string; shine: string };
export const lookOf = (hex: string): Look => { const ink = readable(hex); return { bg: hex, ink, shine: ink === INK ? 'rgba(255, 255, 255, .3)' : 'rgba(0, 0, 0, .22)' }; };

// How wide the name looks, in letters of the longest word: a capital counts 1.2 letters, W and M 1.6, m and w 1.4, the rest 1. The page sets the type size from it (--pc-n, see
// piece-writing.css) so the name is as big as fits and a word is rarely cut; the picture measures the real text instead (fit).
const letterWidth = (c: string) => (c === 'W' || c === 'M' ? 1.6 : c === 'm' || c === 'w' ? 1.4 : c !== c.toLowerCase() ? 1.2 : 1);
export const nameLen = (name: string): number => Math.max(...name.split(/\s+/).map((w) => [...w].reduce((n, c) => n + letterWidth(c), 0)));

// What the page shows, read from a run (tr turns a label into the person's language). null until every step is answered.
export type V = { name: string; sign: string; caption: string; flavour: { label: string; hex: string }; who: string; look: Look };
const opt = (st: Step, id: string): Opt | undefined => (st.kind === 'pick' ? st.opts.find((x) => x.id === id) : undefined);
export function view(r: Run, tr: Tr): V | null {
  if (r.s.length < piece.steps.length) return null;
  const [flavours, audiences] = piece.steps, [f, w, name, sign, caption] = r.s, fl = opt(flavours, f), who = opt(audiences, w);
  if (!fl?.hex || !who) return null;
  return { name, sign, caption, flavour: { label: tr(fl.label), hex: fl.hex }, who: tr(who.label), look: lookOf(fl.hex) };
}

// The three small shapes under a post (a heart, a speech bubble, a paper plane) on a 24 x 24 grid, drawn as an outline.
const ICONS = [
  'M12 20.5C5 15.5 3 11.8 3 9a4.5 4.5 0 0 1 9-1 4.5 4.5 0 0 1 9 1c0 2.8-2 6.5-9 11.5z',
  'M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8l-5 4v-4H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  'M21 3 3 10.5l7 2.5 2.5 7z',
];

// The page itself: styled by piece-writing.css on top of .k-pc, the flavour arrives as custom properties.
export function dom(v: V, by: string, t: T): HTMLElement {
  const { look } = v, root = el('article', 'k-pc k-pc-writing'), sec = (label: string, ...kids: Node[]) => { const s = el('section', 'k-pc-sec'); s.append(el('p', 'k-pc-l', t.tr(label)), ...kids); return s; };
  root.style.setProperty('--pc-bg', look.bg); root.style.setProperty('--pc-ink', look.ink); root.style.setProperty('--pc-shine', look.shine); root.style.setProperty('--pc-n', String(Math.max(1, nameLen(v.name))));
  root.setAttribute('aria-label', `${v.name} · ${t.tr(L.tag)}`);
  const hero = el('header', 'k-pc-writing-hero'), name = el('div', 'k-pc-name k-pc-writing-name', v.name), board = el('blockquote', 'k-pc-writing-board', v.sign);
  name.setAttribute('role', 'heading'); name.setAttribute('aria-level', '3'); board.dataset.s = v.sign.length <= 14 ? '1' : v.sign.length <= 32 ? '2' : '3'; // a short sign gets bigger type
  hero.append(el('p', 'k-pc-l k-pc-writing-new', t.tr(L.flavour)), name, el('p', 'k-pc-writing-taste', v.flavour.label), el('p', 'k-pc-writing-for', t.fill(L.forWho, { who: v.who })));
  const av = el('span', 'k-pc-writing-av', initials(piece.client)), head = el('div', 'k-pc-writing-ph'), id = el('div');
  av.setAttribute('aria-hidden', 'true'); id.append(el('b', '', HANDLE), el('small', '', t.tr(L.now))); head.append(av, id);
  const pic = el('div', 'k-pc-writing-pic'), picName = el('div', 'k-pc-writing-pn', v.name), icons = el('div', 'k-pc-writing-ico'); // the picture repeats the heading, so it is hidden from screen readers
  pic.setAttribute('aria-hidden', 'true'); pic.append(el('span', 'k-pc-writing-pt', piece.client), picName);
  icons.setAttribute('aria-hidden', 'true');
  for (const d of ICONS) { const s = svgEl('svg', { viewBox: '0 0 24 24', class: 'k-pc-writing-i' }); s.append(svgEl('path', { d })); icons.append(s); }
  const post = el('figure', 'k-pc-writing-post'); post.append(head, pic, icons, el('figcaption', 'k-pc-writing-cap', v.caption));
  const foot = el('footer', 'k-pc-foot'); foot.append(el('span', '', by), el('span', 'k-pc-brand', 'slashkern'));
  root.append(el('p', 'k-pc-tag', t.tr(L.tag)), hero, sec(L.sign, board), sec(L.post, post), foot);
  return root;
}

// The biggest size from `from` down to `to` (steps of 4) at which no word is cut and the text takes at most `lines` lines in `width`; 0 when none does.
function fit(d: Draw, s: string, weight: number, from: number, to: number, lines: number, width: number): number {
  const words = s.split(/\s+/).filter(Boolean);
  for (let px = from; px >= to; px -= 4) {
    const count = d.wrap(s, font(weight, px), lines + 1, width).length;
    if (count <= lines && words.every((w) => d.x.measureText(w).width <= width)) return px;
  }
  return 0;
}

// As a picture (1080 wide): the name as a poster, the sign on its board, the post as a card with the square picture on the left and the avatar, caption and shapes on the right (a feed on a
// desktop looks like that, and it keeps the picture under 2000 px tall). Each part measures itself first (the picture is as tall as the three need), then paints itself where it is put.
type Part = { h: number; paint: (y: number) => void };
const GAP = 64, LAB = font(600, 26), screws = (m: number, w: number, top: number, h: number) => [[m + 44, top + 44], [m + w - 44, top + 44], [m + 44, top + h - 44], [m + w - 44, top + h - 44]];

function heroPart(d: Draw, v: V, t: T): Part {
  const { M, TW, x } = d, ink = v.look.ink, up = (s: string) => t.tr(s).toUpperCase();
  const nameSz = fit(d, v.name, 800, 156, 96, 2, TW) || fit(d, v.name, 800, 156, 52, 3, TW) || 52, nameF = font(800, nameSz), nameLs = d.wrap(v.name, nameF, 3), nameLh = Math.round(nameSz * 0.98);
  const tasteF = font(500, 46), tasteLs = d.wrap(v.flavour.label, tasteF, 2), forF = font(600, 28), forLs = d.wrap(t.fill(L.forWho, { who: v.who }).toUpperCase(), forF, 2);
  x.font = LAB; const pillW = x.measureText(up(L.flavour)).width + 44;
  const nameBase = 146 + PILL + 40 + Math.round(nameSz * 0.78), nameEnd = nameBase + (nameLs.length - 1) * nameLh + Math.round(nameSz * 0.22);
  const tasteBase = nameEnd + 62, forBase = tasteBase + (tasteLs.length - 1) * 54 + 56;
  return { h: forBase + (forLs.length - 1) * 38 + 8, paint: () => {
    d.put(up(L.tag), font(600, 28), ink, M, 98);
    d.strokeRect(M, 146, pillW, PILL, PILL / 2, ink); d.put(up(L.flavour), LAB, ink, M + 22, 146 + 35);
    d.lines(nameLs, nameF, ink, M - 4, nameBase, nameLh); d.lines(tasteLs, tasteF, ink, M, tasteBase, 54); d.lines(forLs, forF, ink, M, forBase, 38);
  } };
}

function signPart(d: Draw, v: V, t: T): Part {
  const { M, TW, x } = d, PAD = 66, w = TW - 128;
  const sz = fit(d, v.sign, 700, 96, 60, 2, w) || fit(d, v.sign, 700, 68, 44, 3, w) || 44, f = font(700, sz), ls = d.wrap(v.sign, f, 6, w), lh = Math.round(sz * 1.18), cap = Math.round(sz * 0.72);
  const h = 2 * PAD + cap + (ls.length - 1) * lh - 6;
  return { h: 44 + h, paint: (y) => {
    const top = y + 44;
    d.put(t.tr(L.sign).toUpperCase(), LAB, v.look.ink, M, y + 20);
    d.fillRect(M, top, TW, h, 36, INK);
    x.save(); x.setLineDash([14, 12]); d.strokeRect(M + 22, top + 22, TW - 44, h - 44, 20, CHALK_SOFT, 3); x.restore(); // the stitched edge and the four screws
    x.fillStyle = CHALK_SOFT;
    for (const [cx, cy] of screws(M, TW, top, h)) { x.beginPath(); x.arc(cx, cy, 5, 0, Math.PI * 2); x.fill(); }
    d.lines(ls, f, PAPER, M + TW / 2, top + PAD + cap, lh, 'center');
  } };
}

// The post: the square is a fixed size, the right column takes what its caption needs.
function postPart(d: Draw, v: V, t: T): Part {
  const { M, TW, x } = d, { look } = v, CP = 28, SQ = 432, CAPLH = 44, rx = M + CP + SQ + 32, capF = font(500, 32);
  const caps = v.caption.split('\n').flatMap((par) => (par.trim() ? d.wrap(par, capF, 12, M + TW - CP - rx) : [''])); // a line break the person typed stays one, a blank line too
  const inner = Math.max(SQ, 64 + 36 + caps.length * CAPLH + 20 + 40), h = inner + 2 * CP;
  const nameSz = fit(d, v.name, 800, 96, 72, 2, SQ - 60) || fit(d, v.name, 800, 96, 32, 3, SQ - 60) || 32, nameF = font(800, nameSz), nameLs = d.wrap(v.name, nameF, 3, SQ - 60), nameLh = Math.round(nameSz * 0.98);
  return { h: 44 + h, paint: (y) => {
    const top = y + 44, px = M + CP, py = top + CP, last = py + SQ - 38, first = last - (nameLs.length - 1) * nameLh;
    d.put(t.tr(L.post).toUpperCase(), LAB, look.ink, M, y + 20);
    x.save(); x.shadowColor = 'rgba(20, 24, 31, .28)'; x.shadowBlur = 40; x.shadowOffsetY = 16; d.fillRect(M, top, TW, h, 36, '#FFFFFF'); x.restore();
    d.fillRect(px, py, SQ, SQ, 26, look.bg); // the picture: a soft circle top right, the shop and the name bottom left
    x.save(); d.rect(px, py, SQ, SQ, 26); x.clip(); x.fillStyle = look.shine; x.beginPath(); x.arc(px + SQ * 0.77, py + SQ * 0.21, SQ * 0.35, 0, Math.PI * 2); x.fill(); x.restore();
    d.put(piece.client.toUpperCase(), LAB, look.ink, px + 30, first - Math.round(nameSz * 0.78) - 24);
    d.lines(nameLs, nameF, look.ink, px + 26, first, nameLh);
    x.fillStyle = look.bg; x.beginPath(); x.arc(rx + 32, py + 32, 32, 0, Math.PI * 2); x.fill(); // the right column: avatar, handle and "now", the caption, the three shapes
    d.put(initials(piece.client), font(800, 26), look.ink, rx + 32, py + 42, 'center');
    d.put(HANDLE, font(700, 32), INK, rx + 80, py + 30); d.put(t.tr(L.now), font(500, 26), MUTE, rx + 80, py + 62);
    d.lines(caps, capF, INK, rx, py + 64 + 36 + 28, CAPLH);
    x.save(); x.strokeStyle = INK; x.lineJoin = 'round'; x.lineCap = 'round';
    ICONS.forEach((path, k) => { x.save(); x.translate(rx + k * 64, py + inner - 40); x.scale(40 / 24, 40 / 24); x.lineWidth = 1.8; x.stroke(new Path2D(path)); x.restore(); });
    x.restore();
  } };
}

export async function img(v: V, by: string, t: T): Promise<Blob | null> {
  const d = await Draw.make(); if (!d) return null;
  const parts = [heroPart(d, v, t), signPart(d, v, t), postPart(d, v, t)];
  d.size(parts.reduce((sum, p) => sum + p.h + GAP, 134)); d.fillAll(v.look.bg); // 134: the footer
  let y = 0;
  for (const p of parts) { p.paint(y); y += p.h + GAP; }
  d.footer(by, v.look.ink, v.look.bg);
  return d.blob();
}

export const kind: Kind = { piece, view, dom, img };
