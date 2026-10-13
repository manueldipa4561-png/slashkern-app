import { t2 } from './i18n';
import { lum, o, pick, tag, text, type Kind, type Piece, type Run, type Step, type T, type Tr } from './piece-types';
import { Draw, PIC_M, PIC_TW, el, font, svgEl } from './piece-kit';

// Code: a one-page website for the fictional plant shop Sunny Plants. Five small steps: three sections in order, a headline, the words on the button, a colour theme and the look of the
// letters. The page is a browser window in the person's theme and letters (dom), a picture of it (img) and the same page as a real .html file (file): one document with its styles inside,
// nothing to fetch and no script, so it opens offline and can be put online as it is. What the person typed is escaped before it goes into that file.
export const L = {
  tag: t2('One-page website · concept', 'Sito di una pagina · concept'),
  sub: t2('Small plants, big mood. Sent to your door.', 'Piante piccole, grande mood. Te le portiamo a casa.'),
  made: t2('Made on slashkern', 'Fatto su slashkern'),
  download: t2('Download my page (.html)', 'Scarica la mia pagina (.html)'),
  lang: t2('en', 'it'), // the language code of the file: the German, French, Dutch and Swedish texts of this key are de, fr, nl and sv
  // The comments inside the file, in the person's language (they may open it in a text editor).
  c0: t2('Your page. It is one file: open it in a browser, change it in any text editor, put it online as it is.', 'La tua pagina. È un solo file: aprilo nel browser, cambialo con un editor di testo, mettilo online così com’è.'),
  c1: t2('Colours and letters: change these lines and the whole page follows.', 'Colori e lettere: cambia queste righe e cambia tutta la pagina.'),
  c2: t2('On a wider screen the top is centred and the sections sit in a row.', 'Su uno schermo più largo l’inizio è centrato e le sezioni stanno in fila.'),
  c3: t2('The button is a link: it jumps to the first section.', 'Il pulsante è un link: porta alla prima sezione.'),
  c4: t2('A shelf of plants, drawn with simple shapes.', 'Uno scaffale di piante, disegnato con forme semplici.'),
  c5: t2('Each section has an id, so the menu and the button can jump to it.', 'Ogni sezione ha un id, così il menu e il pulsante possono portarci.'),
};

// What the person chooses from. A section has its card sentence, its short word in the menu and a little picture (one path on a 100 x 100 grid, drawn white on the accent circle; a part
// wound the other way is a hole). The picture of a star is computed once.
const star = (() => {
  const pts: string[] = [];
  for (let k = 0; k < 10; k++) { const a = (Math.PI * k) / 5 - Math.PI / 2, r = k % 2 ? 13 : 30; pts.push(`${+(50 + r * Math.cos(a)).toFixed(1)} ${+(54 + r * Math.sin(a)).toFixed(1)}`); }
  return `M${pts.join('L')}Z`;
})();
type Sec = { nav: string; line: string; icon: string };
export const SEC: Record<string, Sec> = {
  sell: { nav: t2('Shop', 'Negozio'), line: t2('Small plants that are easy to love and easy to keep alive.', 'Piante piccole, facili da amare e facili da tenere in vita.'),
    icon: 'M30 58H70L65 80H35ZM48 52C34 52 28 42 28 32C40 32 48 40 48 52ZM52 52C66 52 72 42 72 32C60 32 52 40 52 52Z' },
  care: { nav: t2('Care', 'Cura'), line: t2('Water, light and a little patience. We tell you how much of each.', 'Acqua, luce e un po’ di pazienza. Ti diciamo quanta di ognuna.'),
    icon: 'M50 22C50 22 71 45 71 58A21 21 0 0 1 29 58C29 45 50 22 50 22Z' },
  reviews: { nav: t2('Reviews', 'Recensioni'), line: t2('Kind words from people whose plants are still alive.', 'Parole gentili di chi ha ancora le piante vive.'), icon: star },
  find: { nav: t2('Find us', 'Dove siamo'), line: t2('Come by the shop and say hi. The green door is hard to miss.', 'Passa in negozio a salutarci. La porta verde si nota subito.'),
    icon: 'M50 80C50 80 26 57 26 41A24 24 0 0 1 74 41C74 57 50 80 50 80ZM41 41a9 9 0 1 0 18 0a9 9 0 1 0-18 0Z' },
  delivery: { nav: t2('Delivery', 'Consegna'), line: t2('Packed with care and sent to your door in a few days.', 'Imballate con cura e portate a casa tua in pochi giorni.'),
    icon: 'M50 22L79 37L50 52L21 37ZM21 43L47 56V84L21 71ZM53 56L79 43V71L53 84Z' },
  week: { nav: t2('Our pick', 'La scelta'), line: t2('Our favourite plant right now, and why we love it.', 'La nostra pianta preferita del momento, e perché la amiamo.'),
    icon: 'M24 76C24 48 40 28 76 24C74 60 58 76 24 76Z' },
};

// Themes: the page (bg), the ink, the accent (the button and the shapes) and the ink on the accent, the boxes (card), the big box at the top (tint) and a second tone of the accent for the plants
// (alt). Every theme is readable: ink on the page, on the boxes and on the top box 4.5:1 or more, the button text on the accent 4.5:1 or more (scripts/check-piece-code.mjs tests all of them).
// The accent is also the colour of the desk in the picture. The thin lines, the dots of the window and the quieter text are mixed from the page and the ink.
export type Theme = { bg: string; ink: string; accent: string; onAccent: string; card: string; tint: string; alt: string };
export const THEME: Record<string, Theme> = {
  fern: { bg: '#EEF5E6', ink: '#12301E', accent: '#2E7D4F', onAccent: '#FFFFFF', card: '#FFFFFF', tint: '#CFE2CE', alt: '#266640' },
  terracotta: { bg: '#FBF0E6', ink: '#3A2014', accent: '#C2512B', onAccent: '#FFFFFF', card: '#FFFFFF', tint: '#F2D7C8', alt: '#994224' },
  midnight: { bg: '#0E1B3D', ink: '#EEF3FF', accent: '#7DB8FF', onAccent: '#0A1430', card: '#17284F', tint: '#20345C', alt: '#9FCAFF' },
  sunny: { bg: '#FFF8DC', ink: '#2A2008', accent: '#F5B301', onAccent: '#2A2008', card: '#FFFFFF', tint: '#FDEDB9', alt: '#B88703' },
  paper: { bg: '#F6F2E9', ink: '#1B1A16', accent: '#1B1A16', onAccent: '#F6F2E9', card: '#FFFFFF', tint: '#EBE4D3', alt: '#77725F' },
  berry: { bg: '#FCEEF2', ink: '#3A1030', accent: '#B3245F', onAccent: '#FFFFFF', card: '#FFFFFF', tint: '#F0CEDA', alt: '#8F1E51' },
};
const mix = (a: string, b: string, t: number) => `#${[1, 3, 5].map((i) => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
export type Look = Theme & { line: string; dot: string; mute: string; sun: string };
export const lookOf = (id: string): Look => { const th = THEME[id]; return { ...th, line: mix(th.bg, th.ink, 0.16), dot: mix(th.bg, th.ink, 0.3), mute: mix(th.ink, th.bg, 0.22), sun: mix(th.tint, th.accent, 0.3) }; };
// The look of the letters: font stacks that need no download, how heavy and how tight the headings are, how round the corners are (btn: the button), capitals on the menu and the button.
export type Face = { stack: string; weight: number; track: number; r: number; btn: number; caps: boolean; ital: boolean };
export const FACE: Record<string, Face> = {
  soft: { stack: "ui-rounded, 'SF Pro Rounded', system-ui, sans-serif", weight: 800, track: -0.02, r: 22, btn: 999, caps: false, ital: false },
  sharp: { stack: "system-ui, 'Helvetica Neue', Arial, sans-serif", weight: 900, track: -0.02, r: 4, btn: 3, caps: true, ital: false },
  classic: { stack: "Georgia, 'Times New Roman', serif", weight: 700, track: -0.01, r: 12, btn: 8, caps: false, ital: true },
};

export const piece: Piece = {
  id: 'code-page', n: 2, f: 'Code', client: 'Sunny Plants', mins: 10,
  title: t2('One-page website for a plant shop', 'Sito di una pagina per un negozio di piante'),
  blurb: t2('Pick a few things and end with a real web page, as a file you can open and put online.', 'Scegli poche cose e finisci con una vera pagina web, in un file che puoi aprire e mettere online.'),
  who: tag('Sunny Plants, a plant shop (fictional)', 'Sunny Plants, un negozio di piante (fittizio)'),
  brief: t2('People keep asking the shop “price?” on Instagram, and there is no website to send them to. You design a one-page site in five small steps. It comes out as a real web page file you can open and put online.',
    'Su Instagram continuano a scrivere “prezzo?” al negozio, e non c’è un sito a cui mandare le persone. Disegni un sito di una pagina in cinque piccoli passi e ne esce un vero file di pagina web che puoi aprire e mettere online.'),
  steps: [
    pick(t2('Pick three sections for the page, in order.', 'Scegli tre sezioni per la pagina, in ordine.'), t2('Think of what a visitor wants to know first. That goes on top.', 'Pensa a cosa vuole sapere subito chi visita la pagina. Quello va in cima.'), 3, [
      o('sell', 'What we sell', 'Cosa vendiamo'), o('care', 'Care tips', 'Consigli di cura'), o('reviews', 'Customer reviews', 'Recensioni dei clienti'),
      o('find', 'Where to find us', 'Dove trovarci'), o('delivery', 'Delivery', 'Consegna'), o('week', 'The plant of the week', 'La pianta della settimana'),
    ]),
    text(t2('Write the headline. Eight words or fewer.', 'Scrivi il titolo. Otto parole al massimo.'), t2('It is the first thing people read. Say what the shop gives them.', 'È la prima cosa che le persone leggono. Di’ cosa dà loro il negozio.'),
      t2('Plants that are happy to live with you.', 'Piante felici di vivere con te.'), 44, 8),
    text(t2('Write the words on the button. Three words or fewer.', 'Scrivi le parole sul pulsante. Tre parole al massimo.'), t2('Start with a verb. Say what happens when someone taps it.', 'Parti da un verbo. Di’ cosa succede quando qualcuno lo tocca.'),
      t2('Shop plants', 'Scopri le piante'), 18, 3, 1),
    pick(t2('Pick the colours of the page.', 'Scegli i colori della pagina.'), t2('Each theme is a team: a page colour, a text colour and one accent.', 'Ogni tema è una squadra: un colore di sfondo, uno per il testo e un accento.'), 1, [
      o('fern', 'Fern', 'Felce', { hex: THEME.fern.accent }), o('terracotta', 'Terracotta', 'Terracotta', { hex: THEME.terracotta.accent }), o('midnight', 'Midnight', 'Mezzanotte', { hex: THEME.midnight.accent }),
      o('sunny', 'Sunny', 'Sole', { hex: THEME.sunny.accent }), o('paper', 'Paper', 'Carta', { hex: THEME.paper.accent }), o('berry', 'Berry', 'Lampone', { hex: THEME.berry.accent }),
    ], 'swatch'),
    pick(t2('Pick the look of the letters.', 'Scegli l’aspetto delle lettere.'), t2('Soft is friendly, Sharp is strong, Classic is elegant.', 'Morbido è amichevole, Tagliente è deciso, Classico è elegante.'), 1, [
      o('soft', 'Soft', 'Morbido'), o('sharp', 'Sharp', 'Tagliente'), o('classic', 'Classic', 'Classico'),
    ], 'chip'),
  ],
};

// What the page shows, read from a run (tr turns a label into the person's language). null until every step is answered.
export type Section = { id: string; title: string; nav: string; line: string; icon: string };
export type V = { name: string; host: string; lang: string; headline: string; button: string; sub: string; sections: Section[]; look: Look; face: Face };
export function view(r: Run, tr: Tr): V | null {
  if (r.s.length < piece.steps.length) return null;
  const [secs, headline, button, theme, face] = r.s, st = piece.steps[0] as Extract<Step, { kind: 'pick' }>;
  const sections = secs.split(',').map((id) => ({ id, title: tr(st.opts.find((x) => x.id === id)!.label), nav: tr(SEC[id].nav), line: tr(SEC[id].line), icon: SEC[id].icon }));
  return { name: piece.client, host: 'sunnyplants.example', lang: tr(L.lang), headline, button, sub: tr(L.sub), sections, look: lookOf(theme), face: FACE[face] };
}

// The shelf of plants at the bottom of the top box: leaves, pots and a few circles on a 300 x 80 grid, with a sun (or a moon) behind them. Each part is put at (x, y), turned by r degrees and
// scaled by k, in the ink (the pots), the accent, a second tone of it or the sun. Parts are drawn in this order, so a pot covers the foot of its plant. A part is a path, or the name of a
// shape used more than once (DEFS: a leaf, and a pot made of a rim and a body); the file draws those once and uses them again.
type Tone = 'ink' | 'accent' | 'alt' | 'sun';
type Part = { d: string; tone: Tone; x: number; y: number; r: number; k: number };
const part = (d: string, tone: Tone, x = 0, y = 0, r = 0, k = 1): Part => ({ d, tone, x, y, r, k });
export const DEFS: Record<string, string[]> = { blade: ['M0 0C-10-13-10-33 0-48C10-33 10-13 0 0Z'], pot: ['M-13 0H13V5H-13Z', 'M-11 6.5H11L9 19H-9Z'] };
const paths = (p: Part) => DEFS[p.d] ?? [p.d];
const ball = (cx: number, cy: number, r: number) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
const pot = (x: number, k: number) => part('pot', 'ink', x, +(80 - 19 * k).toFixed(1), 0, k); // a pot standing on the bottom edge
export const ART: Part[] = [
  part(ball(150, 80, 64), 'sun'),
  part('M54 64V34a10 10 0 0 1 20 0V64Z', 'alt'), part('M41 56V42a5 5 0 0 1 10 0V48H54V56Z', 'accent'), part('M87 48V34a5 5 0 0 0-10 0V40H74V48Z', 'accent'), pot(64, 1), // a cactus
  part('blade', 'alt', 150, 54, -50, 0.62), part('blade', 'alt', 150, 54, 50, 0.62), part('blade', 'accent', 150, 54, -25, 0.86), part('blade', 'accent', 150, 54, 25, 0.86), part('blade', 'accent', 150, 54, 0, 1), pot(150, 1.5), // a snake plant
  part(ball(236, 38, 17), 'accent'), part(ball(219, 47, 12), 'alt'), part(ball(253, 47, 12), 'alt'), part(ball(236, 25, 9), 'accent'), pot(236, 1.2), // a bush
];
const toneOf = (c: Look, p: Part) => c[p.tone]; // a tone is the name of a colour of the look
const place = (p: Part) => [p.x || p.y ? `translate(${p.x} ${p.y})` : '', p.r ? `rotate(${p.r})` : '', p.k !== 1 ? `scale(${p.k})` : ''].filter(Boolean).join(' ');

const svg = (viewBox: string, cls: string, ...kids: SVGElement[]) => { const s = svgEl('svg', { viewBox, class: cls, 'aria-hidden': 'true', focusable: 'false' }); s.append(...kids); return s; };
const badge = (icon: string, c: Look) => svg('0 0 100 100', 'k-pc-code-ic', svgEl('circle', { cx: '50', cy: '50', r: '50', fill: c.accent }), svgEl('path', { d: icon, fill: c.onAccent }));
const shelf = (c: Look) => svg('0 0 300 80', 'k-pc-code-art', ...ART.flatMap((p) => paths(p).map((d) => svgEl('path', { d, fill: toneOf(c, p), ...(place(p) ? { transform: place(p) } : {}) }))));

// On the screen: styled by piece-code.css, the theme and the letters arrive as custom properties. The desk behind the window is the accent, so the tag and the footer use the ink of the button.
export function dom(v: V, by: string, t: T): HTMLElement {
  const { look: c, face: f } = v, root = el('article', 'k-pc k-pc-code-page');
  const vars: Record<string, string> = {
    '--pc-bg': c.accent, '--pc-ink': c.onAccent, '--cw-bg': c.bg, '--cw-ink': c.ink, '--cw-acc': c.accent, '--cw-on': c.onAccent, '--cw-card': c.card, '--cw-tint': c.tint, '--cw-line': c.line, '--cw-dot': c.dot, '--cw-mute': c.mute,
    '--cw-font': f.stack, '--cw-weight': String(f.weight), '--cw-track': `${f.track}em`, '--cw-r': `${f.r}px`, '--cw-btn': `${f.btn}px`, '--cw-caps': f.caps ? 'uppercase' : 'none', '--cw-ctrack': f.caps ? '.06em' : '0', '--cw-sub': f.ital ? 'italic' : 'normal',
  };
  for (const [k, val] of Object.entries(vars)) root.style.setProperty(k, val);
  root.setAttribute('aria-label', `${v.name} · ${t.tr(L.tag)}`);
  const dots = el('span', 'k-pc-code-dots'), bar = el('div', 'k-pc-code-bar'), nav = el('div', 'k-pc-code-nav'), links = el('ul', 'k-pc-code-links');
  dots.setAttribute('aria-hidden', 'true'); dots.append(el('i'), el('i'), el('i')); bar.append(dots, el('span', 'k-pc-code-url', v.host));
  for (const s of v.sections) links.append(el('li', '', s.nav));
  nav.append(el('b', 'k-pc-code-brand', v.name), links);
  const hero = el('section', 'k-pc-code-hero'), head = el('div', 'k-pc-code-h', v.headline);
  head.setAttribute('role', 'heading'); head.setAttribute('aria-level', '3');
  hero.append(head, el('p', 'k-pc-code-sub', v.sub), el('span', 'k-pc-code-btn', v.button), shelf(c));
  const cards = el('ul', 'k-pc-code-cards');
  for (const s of v.sections) {
    const li = el('li', 'k-pc-code-card'), body = el('div'), title = el('div', 'k-pc-code-ct', s.title);
    title.setAttribute('role', 'heading'); title.setAttribute('aria-level', '4');
    body.append(title, el('p', 'k-pc-code-cp', s.line)); li.append(badge(s.icon, c), body); cards.append(li);
  }
  const win = el('div', 'k-pc-code-win'), foot = el('footer', 'k-pc-foot');
  win.append(bar, nav, hero, cards); foot.append(el('span', '', by), el('span', 'k-pc-brand', 'slashkern'));
  root.append(el('p', 'k-pc-tag', t.tr(L.tag)), win, foot);
  return root;
}

// As a picture: the same window on the same desk, 1080 wide and as tall as the page needs (the window grows downwards with its content). measure() works out every line and every height first,
// because the canvas is cleared when it is given its height; the paint functions then draw top to bottom.
const WX = PIC_M, WW = PIC_TW, HX = WX + 32, HW = WW - 64, TX = HX + 44, TW = HW - 88, CW = HW - 164; // the window, the top box in it, the text column of the top box and of a card
const WY = 128, BAR = 80, BH = 92, FOOT = 134, ART_H = (HW * 80) / 300, MONO = "500 26px ui-monospace, 'SF Mono', Menlo, Consolas, monospace";
// The person's letters on the canvas: a font at a size, capitals, tracking (where the canvas has it), and the round corners of the top box (r) and the button (rb).
function pen(d: Draw, f: Face) {
  const ctx = d.x as CanvasRenderingContext2D & { letterSpacing?: string };
  return {
    disp: (px: number) => `${f.weight} ${px}px ${f.stack}`, body: (w: number, px: number, ital = false) => `${ital ? 'italic ' : ''}${w} ${px}px ${f.stack}`, cap: (s: string) => (f.caps ? s.toUpperCase() : s),
    // ponytail: Safari before 18 has no canvas letterSpacing, so there the picture's headings are a little looser than the page's; add a per-letter loop if that is ever noticed
    track: (px: number) => { if ('letterSpacing' in ctx) ctx.letterSpacing = px ? `${(f.track * px).toFixed(2)}px` : '0px'; }, r: f.r * 2.9, rb: Math.min(f.btn * 2.9, BH / 2),
  };
}
type Pen = ReturnType<typeof pen>;
// Lines that fit the width; when there are several, the narrowest width that still gives the same number of lines, so the last line is never one lonely word.
function balanced(d: Draw, s: string, f: string, max: number, w: number) {
  const ALL = 99, n = d.wrap(s, f, ALL, w).length; // ALL: more lines than any text has, so nothing is cut while counting
  if (n < 2 || n > max) return d.wrap(s, f, max, w);
  let lo = w / 2, hi = w;
  for (let i = 0; i < 7; i++) { const mid = (lo + hi) / 2; if (d.wrap(s, f, ALL, mid).length > n) lo = mid; else hi = mid; }
  return d.wrap(s, f, max, hi);
}
function measure(d: Draw, v: V, p: Pen) {
  const x = d.x;
  p.track(40); x.font = p.disp(40); const brandW = x.measureText(v.name).width; p.track(0);
  x.font = p.body(600, 28); const navW = v.sections.map((s) => x.measureText(p.cap(s.nav)).width), linksW = navW.reduce((a, b) => a + b, 0) + 34 * (navW.length - 1);
  const oneRow = WW - 88 >= brandW + 40 + linksW; // the menu sits beside the name, or under it when it does not fit
  p.track(76); const hl = balanced(d, v.headline, p.disp(76), 5, TW); p.track(0);
  const sl = balanced(d, v.sub, p.body(500, 34, v.face.ital), 2, TW);
  let bs = 38; x.font = p.body(700, bs);
  while (bs > 26 && x.measureText(p.cap(v.button)).width > TW - 80) { bs -= 2; x.font = p.body(700, bs); }
  const bw = Math.min(TW, x.measureText(p.cap(v.button)).width + 80);
  const cards = v.sections.map((s) => { p.track(36); const tl = d.wrap(s.title, p.disp(36), 1, CW); p.track(0); const pl = balanced(d, s.line, p.body(400, 30), 3, CW); return { s, tl, pl, h: 106 + pl.length * 40 }; });
  const heroTop = WY + BAR + (oneRow ? 104 : 168), y1 = heroTop + 44, y2 = y1 + hl.length * 80 + 18, y3 = y2 + sl.length * 46 + 30, y4 = y3 + BH + 12, heroBottom = y4 + ART_H, cardsTop = heroBottom + 24;
  return { oneRow, navW, linksW, hl, sl, bs, bw, cards, heroTop, y1, y2, y3, y4, heroBottom, cardsTop, winH: cardsTop + cards.reduce((a, k) => a + k.h + 20, -20) + 32 - WY };
}
type Plan = ReturnType<typeof measure>;
function paintBar(d: Draw, v: V) {
  const x = d.x, { look: c } = v;
  d.fillRect(WX, WY, WW, BAR, 0, c.card); d.fillRect(WX, WY + BAR - 2, WW, 2, 0, c.line);
  for (let k = 0; k < 3; k++) { x.beginPath(); x.arc(WX + 46 + k * 32, WY + BAR / 2, 9, 0, Math.PI * 2); x.fillStyle = c.dot; x.fill(); }
  d.fillRect(WX + 176, WY + 16, WW - 216, 48, 24, c.bg); d.put(v.host, MONO, c.mute, WX + 176 + (WW - 216) / 2, WY + 48, 'center');
}
function paintMenu(d: Draw, v: V, p: Pen, m: Plan) {
  const y = WY + BAR + 62, c = v.look; p.track(40); d.put(v.name, p.disp(40), c.ink, WX + 44, y); p.track(0);
  let lx = m.oneRow ? WX + WW - 44 - m.linksW : WX + 44;
  v.sections.forEach((s, k) => { d.put(p.cap(s.nav), p.body(600, 28), c.ink, lx, m.oneRow ? y : y + 62); lx += m.navW[k] + 34; });
}
function paintTop(d: Draw, v: V, p: Pen, m: Plan) {
  const x = d.x, { look: c } = v, k0 = HW / 300;
  d.fillRect(HX, m.heroTop, HW, m.heroBottom - m.heroTop, p.r, c.tint);
  x.save(); d.rect(HX, m.heroTop, HW, m.heroBottom - m.heroTop, p.r); x.clip();
  p.track(76); d.lines(m.hl, p.disp(76), c.ink, TX, m.y1 + 62, 80); p.track(0);
  d.lines(m.sl, p.body(500, 34, v.face.ital), c.mute, TX, m.y2 + 34, 46);
  d.fillRect(TX, m.y3, m.bw, BH, p.rb, c.accent); d.put(p.cap(v.button), p.body(700, m.bs), c.onAccent, TX + m.bw / 2, m.y3 + BH / 2 + m.bs * 0.35, 'center');
  for (const a of ART) { x.save(); x.translate(HX + a.x * k0, m.y4 + a.y * k0); x.rotate((a.r * Math.PI) / 180); x.scale(a.k * k0, a.k * k0); x.fillStyle = toneOf(c, a); for (const d1 of paths(a)) x.fill(new Path2D(d1)); x.restore(); }
  x.restore();
}
function paintCards(d: Draw, v: V, p: Pen, m: Plan) {
  const x = d.x, { look: c } = v, tx = HX + 28 + 84 + 24; let y = m.cardsTop;
  for (const { s, tl, pl, h } of m.cards) {
    d.fillRect(HX, y, HW, h, p.r * 0.7, c.card); d.strokeRect(HX, y, HW, h, p.r * 0.7, c.line, 2);
    x.beginPath(); x.arc(HX + 28 + 42, y + 28 + 42, 42, 0, Math.PI * 2); x.fillStyle = c.accent; x.fill(); d.path(s.icon, HX + 28, y + 28, 0.84, c.onAccent);
    p.track(36); d.lines(tl, p.disp(36), c.ink, tx, y + 28 + 34, 44); p.track(0);
    d.lines(pl, p.body(400, 30), c.ink, tx, y + 28 + 44 + 10 + 28, 40);
    y += h + 20;
  }
}
export async function img(v: V, by: string, t: T): Promise<Blob | null> {
  const d = await Draw.make(); if (!d) return null;
  const p = pen(d, v.face), m = measure(d, v, p), { look: c } = v, x = d.x;
  d.size(WY + m.winH + 36 + FOOT);
  const winH = Math.max(m.winH, d.H - FOOT - 36 - WY); // as tall as its page, or filling a picture that is at its least height
  d.fillAll(c.accent); d.put(t.tr(L.tag).toUpperCase(), font(600, 28), c.onAccent, PIC_M, 98);
  x.save(); x.shadowColor = 'rgba(0,0,0,.3)'; x.shadowBlur = 56; x.shadowOffsetY = 26; d.fillRect(WX, WY, WW, winH, 40, c.bg); x.restore();
  x.save(); d.rect(WX, WY, WW, winH, 40); x.clip();
  paintBar(d, v); paintMenu(d, v, p, m); paintTop(d, v, p, m); paintCards(d, v, p, m);
  x.restore();
  d.footer(by, c.onAccent, c.accent);
  return d.blob();
}

// As a file: one HTML document with its styles inside. Everything a person typed, and every translated text, goes through esc() (& < > " '), so nothing they write can become markup. No address
// of anything outside the file appears in it (not even the svg namespace: inline svg does not need it), no script, no font to download: the letters are the ones the computer already has.
const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s: string) => s.replace(/[&<>"']/g, (ch) => ESC[ch]);
// The styles of the file: the theme and the letters are variables on top, the rest is plain CSS that reads them. Sizes are rem and clamp(), so the page follows the reader's text size.
function sheet(v: V, note: (k: keyof typeof L) => string) {
  const { look: c, face: f } = v;
  const vars: [string, string][] = [
    ['--bg', c.bg], ['--ink', c.ink], ['--accent', c.accent], ['--on-accent', c.onAccent], ['--card', c.card], ['--tint', c.tint], ['--line', c.line], ['--accent-2', c.alt], ['--sun', c.sun],
    ['--font', f.stack], ['--weight', String(f.weight)], ['--tracking', `${f.track}em`], ['--radius', `${f.r}px`], ['--button-radius', `${f.btn}px`], ['--caps', f.caps ? 'uppercase' : 'none'], ['--sub-style', f.ital ? 'italic' : 'normal'],
    ['color-scheme', lum(c.bg) < 0.2 ? 'dark' : 'light'],
  ];
  return `    /* ${note('c1')} */
    :root {
${vars.map(([k, val]) => `      ${k}: ${val};`).join('\n')}
    }

    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--ink);
      font: 400 1.0625rem/1.55 var(--font);
      -webkit-text-size-adjust: 100%;
    }
    a { color: inherit; }
    a:focus-visible { outline: 3px solid var(--ink); outline-offset: 3px; }
    .wrap { width: min(100% - 2.5rem, 62rem); margin: 0 auto; }

    .top {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0 .5rem;
      padding: .75rem 0;
    }
    .brand {
      display: inline-flex;
      align-items: center;
      min-height: 2.75rem;
      font: var(--weight) 1.25rem/1 var(--font);
      letter-spacing: var(--tracking);
      text-decoration: none;
    }
    .top nav { display: flex; flex-wrap: wrap; margin: 0 -.75rem; }
    .top nav a {
      display: inline-flex;
      align-items: center;
      min-height: 2.75rem;
      padding: 0 .75rem;
      font-weight: 600;
      text-transform: var(--caps);
      text-decoration: none;
    }
    .top nav a:hover { text-decoration: underline; text-underline-offset: .35em; }

    .hero {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: clamp(1.5rem, 5vw, 3.5rem) clamp(1.25rem, 5vw, 3.5rem) 0;
      border-radius: var(--radius);
      background: var(--tint);
      overflow: hidden;
    }
    h1 {
      margin: 0;
      font: var(--weight) clamp(2.25rem, 8vw, 4.5rem)/1.04 var(--font);
      letter-spacing: var(--tracking);
      overflow-wrap: anywhere;
      text-wrap: balance;
    }
    .hero p {
      max-width: 32rem;
      margin: 1rem 0 1.75rem;
      font-size: clamp(1.125rem, 2.6vw, 1.5rem);
      font-style: var(--sub-style);
      line-height: 1.4;
      text-wrap: balance;
    }
    .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      max-width: 100%;
      min-height: 3.25rem;
      padding: .75rem 1.75rem;
      border-radius: var(--button-radius);
      background: var(--accent);
      color: var(--on-accent);
      font: 700 1.0625rem/1.2 var(--font);
      text-align: center;
      text-transform: var(--caps);
      text-decoration: none;
      overflow-wrap: anywhere;
    }
    .shelf { display: block; width: 100%; height: auto; margin-top: 2rem; }
    .pot { fill: var(--ink); }
    .leaf { fill: var(--accent); }
    .leaf-2 { fill: var(--accent-2); }
    .sun { fill: var(--sun); }

    .cards { display: grid; gap: 1rem; margin: 1rem 0 2.5rem; }
    .card {
      display: grid;
      grid-template-columns: 3rem 1fr;
      gap: 0 1rem;
      padding: 1.25rem;
      border: 1px solid var(--line);
      border-radius: var(--radius);
      background: var(--card);
      scroll-margin-top: 1rem;
    }
    .icon { grid-row: 1 / 3; width: 3rem; height: 3rem; }
    .dot { fill: var(--accent); }
    .glyph { fill: var(--on-accent); }
    h2 { margin: 0 0 .35rem; font: var(--weight) 1.375rem/1.15 var(--font); letter-spacing: var(--tracking); }
    .card p { margin: 0; text-wrap: balance; }

    .foot {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: .25rem 1.5rem;
      padding: 1.25rem 0 2.5rem;
      border-top: 1px solid var(--line);
      font-size: .9375rem;
    }
    .foot p { margin: 0; }

    /* ${note('c2')} */
    @media (min-width: 48rem) {
      .hero { align-items: center; text-align: center; }
      .shelf { width: min(100%, 40rem); }
      .cards { grid-template-columns: repeat(3, 1fr); }
      .card { grid-template-columns: 1fr; padding: 1.5rem; }
      .icon { grid-row: auto; margin-bottom: 1rem; }
    }
    @media (prefers-reduced-motion: no-preference) {
      html { scroll-behavior: smooth; }
      .button { transition: transform .2s; }
      .button:hover { transform: translateY(-2px); }
    }`;
}
export function file(v: V, by: string, t: T): { name: string; mime: string; text: string; label: string } {
  const e = esc, first = v.sections[0].id, note = (k: keyof typeof L) => t.tr(L[k]).replace(/[<>]|\*\//g, ' ').replace(/-{2,}/g, '-'); // a comment is shown as it is: only kept from ending early or opening a tag
  const links = v.sections.map((s) => `<a href="#${s.id}">${e(s.nav)}</a>`).join('\n      ');
  const cls = { ink: 'pot', accent: 'leaf', alt: 'leaf-2', sun: 'sun' }, at = (p: Part) => (place(p) ? ` transform="${place(p)}"` : '');
  const defs = Object.entries(DEFS).map(([id, ds]) => (ds.length === 1 ? `<path id="${id}" d="${ds[0]}"/>` : `<g id="${id}">${ds.map((d) => `<path d="${d}"/>`).join('')}</g>`)).join('\n          ');
  const plants = ART.map((p) => (DEFS[p.d] ? `<use href="#${p.d}" class="${cls[p.tone]}"${at(p)}/>` : `<path class="${cls[p.tone]}"${at(p)} d="${p.d}"/>`)).join('\n        ');
  const cards = v.sections.map((s) => `      <section class="card" id="${s.id}" aria-labelledby="${s.id}-title">
        <svg class="icon" viewBox="0 0 100 100" aria-hidden="true"><circle class="dot" cx="50" cy="50" r="50"/><path class="glyph" d="${s.icon}"/></svg>
        <h2 id="${s.id}-title">${e(s.title)}</h2>
        <p>${e(s.line)}</p>
      </section>`).join('\n');
  const html = `<!doctype html>
<!-- ${note('c0')} -->
<html lang="${e(v.lang)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="${v.look.bg}">
  <meta name="description" content="${e(v.sub)}">
  <title>${e(v.name)} · ${e(v.headline)}</title>
  <style>
${sheet(v, note)}
  </style>
</head>
<body>
  <header class="wrap top" id="top">
    <a class="brand" href="#top">${e(v.name)}</a>
    <nav>
      ${links}
    </nav>
  </header>
  <main class="wrap">
    <section class="hero" aria-labelledby="hero-title">
      <h1 id="hero-title">${e(v.headline)}</h1>
      <p>${e(v.sub)}</p>
      <!-- ${note('c3')} -->
      <a class="button" href="#${first}">${e(v.button)}</a>
      <!-- ${note('c4')} -->
      <svg class="shelf" viewBox="0 0 300 80" aria-hidden="true">
        <defs>
          ${defs}
        </defs>
        ${plants}
      </svg>
    </section>
    <!-- ${note('c5')} -->
    <div class="cards">
${cards}
    </div>
  </main>
  <footer class="wrap foot">
    <p>${e(by)}</p>
    <p>${e(t.tr(piece.who))}</p>${by.includes('slashkern') ? '' : `\n    <p>${e(t.tr(L.made))}</p>`}
  </footer>
</body>
</html>
`;
  return { name: 'sunny-plants.html', mime: 'text/html', text: html, label: t.tr(L.download) };
}

export const kind: Kind = { piece, view, dom, img, file };
