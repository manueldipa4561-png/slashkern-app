import { t2 } from './i18n';
import { PAPER, SHAPES, contrast, initials, lum, o, pick, readable, tag, text, type Kind, type Piece, type Run, type T, type Tr } from './piece-types';
import { Draw, el, font, logoSvg } from './piece-kit';

// Design: a brand sheet for the fictional Bar Ficus. Five small steps: the one thing to remember, three feeling words, three colours, a logo shape, a line of four words. The page is
// styled in the three colours the person picked and stays readable whatever they are (lookOf); the logo is the shape with the letters BF in it.
const L = {
  tag: t2('Brand sheet · concept', 'Scheda del brand · concept'),
  colours: t2('Colours', 'Colori'),
  feeling: t2('The feeling', 'La sensazione'),
  one: t2('The one thing', 'La cosa da ricordare'),
  logo: t2('Logo: {s} with the letters {m}', 'Logo: {s} con le lettere {m}'),
};

export const piece: Piece = {
  id: 'design-brand', n: 0, f: 'Design', client: 'Bar Ficus', mins: 10,
  title: t2('Brand sheet for a bar', 'Scheda del brand per un bar'),
  blurb: t2('Pick a few things and end with a page that shows how a bar looks and feels.', 'Scegli poche cose e alla fine hai una pagina che mostra com’è e cosa trasmette un bar.'),
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
    text(t2('Write the line under the name. Four words or fewer.', 'Scrivi la frase sotto il nome. Quattro parole al massimo.'), t2('Say what makes the bar special, not what it sells.', 'Di’ cosa rende speciale il bar, non cosa vende.'), t2('Coffee, plants, Rosa.', 'Caffè, piante, Rosa.'), 40, 4),
  ],
};

// Colours. Whatever three the person picks, the page stays readable: the lightest becomes the ground (or paper, when all three are dark), the darkest the ink (or near-black / paper
// when it is too close to the ground), the third the accent. The logo takes the first pick, unless that is too close to the ground to be seen.
export type Look = { bg: string; ink: string; acc: string; onAcc: string; logo: string; onLogo: string };
export function lookOf(picks: readonly string[]): Look {
  const byLight = [...picks].sort((a, b) => lum(b) - lum(a));
  const bg = lum(byLight[0]) >= 0.45 ? byLight[0] : PAPER, darkest = byLight[byLight.length - 1];
  const ink = contrast(darkest, bg) >= 4.5 ? darkest : readable(bg);
  const acc = picks.find((h) => h !== bg && h !== ink) ?? picks[0], logo = contrast(picks[0], bg) >= 1.6 ? picks[0] : ink;
  return { bg, ink, acc, onAcc: readable(acc), logo, onLogo: readable(logo) };
}

// What the sheet shows, read from a run (tr turns a label into the person's language). null until every step is answered.
export type V = { name: string; mono: string; line: string; shape: { id: string; label: string; d: string }; look: Look; swatches: { name: string; hex: string }[]; words: string[]; one: string };
export function view(r: Run, tr: Tr): V | null {
  if (r.s.length < piece.steps.length) return null;
  const [one, words, colours, shape] = piece.steps, a = r.s;
  const label = (st: typeof one, id: string) => (st.kind === 'pick' ? st.opts.find((x) => x.id === id) : undefined);
  const sw = a[2].split(',').map((id) => label(colours, id)!), sh = label(shape, a[3])!;
  return {
    name: piece.client, mono: initials(piece.client), line: a[4], shape: { id: sh.id, label: tr(sh.label), d: sh.d! }, look: lookOf(sw.map((x) => x.hex!)),
    swatches: sw.map((x) => ({ name: tr(x.label), hex: x.hex! })), words: a[1].split(',').map((id) => tr(label(words, id)!.label)), one: tr(label(one, a[0])!.label),
  };
}

// On screen: styled by piece.css (.k-pc), the colours arrive as custom properties.
export function dom(v: V, by: string, t: T): HTMLElement {
  const { look } = v, root = el('article', 'k-pc'), sec = (label: string, ...kids: Node[]) => { const s = el('section', 'k-pc-sec'); s.append(el('p', 'k-pc-l', t.tr(label)), ...kids); return s; };
  root.style.setProperty('--pc-bg', look.bg); root.style.setProperty('--pc-ink', look.ink); root.style.setProperty('--pc-acc', look.acc); root.style.setProperty('--pc-on-acc', look.onAcc);
  root.setAttribute('aria-label', `${v.name} · ${t.tr(L.tag)}`);
  const head = el('div', 'k-pc-head'), name = el('div', 'k-pc-name', v.name), line = el('p', 'k-pc-line', v.line);
  name.setAttribute('role', 'heading'); name.setAttribute('aria-level', '3');
  head.append(logoSvg(v.shape.d, look.logo, look.onLogo, v.mono, t.fill(L.logo, { s: v.shape.label, m: v.mono })), name, line);
  const sw = el('ul', 'k-pc-sw');
  for (const c of v.swatches) { const li = el('li'), chip = el('i'); chip.style.background = c.hex; li.append(chip, el('b', '', c.name), el('small', '', c.hex)); sw.append(li); }
  const words = el('ul', 'k-pc-words');
  for (const w of v.words) words.append(el('li', '', w));
  const foot = el('footer', 'k-pc-foot');
  foot.append(el('span', '', by), el('span', 'k-pc-brand', 'slashkern'));
  root.append(el('p', 'k-pc-tag', t.tr(L.tag)), head, sec(L.colours, sw), sec(L.feeling, words), sec(L.one, el('blockquote', 'k-pc-one', v.one)), foot);
  return root;
}

// As a picture: the three sections share what is left of the page evenly, so a short quote or a long one never leaves the bottom cramped or empty.
export async function img(v: V, by: string, t: T): Promise<Blob | null> {
  const d = await Draw.make(); if (!d) return null;
  const { look } = v, { M, TW } = d;
  const lineF = font(500, 46), ls = d.wrap(v.line, lineF, 2), qf = font(700, 52), ql = d.wrap(v.one, qf, 2, TW - 36);
  let size = 128; d.x.font = font(800, size);
  while (size > 64 && d.x.measureText(v.name).width > TW) { size -= 4; d.x.font = font(800, size); }
  const barY = 466 + (ls.length - 1) * 58 + 30, colH = 248, feelH = 90, oneH = 76 + (ql.length - 1) * 62 + 16, FOOT = 1350 - 134;
  const g = Math.max(32, (FOOT - (barY + 12) - 22 - colH - feelH - oneH) / 4); // four gaps: above the colours, between the sections, above the footer
  d.size(barY + 12 + 22 + colH + feelH + oneH + 4 * g + 134); d.fillAll(look.bg);
  d.put(t.tr(L.tag).toUpperCase(), font(600, 28), look.ink, M, 98);
  d.path(v.shape.d, M, 132, 1.5, look.logo); // the shape, 150 px, with the letters centred in it
  d.put(v.mono, font(800, 54), look.onLogo, M + 75, 132 + 75 + 19, 'center');
  d.put(v.name, font(800, size), look.ink, M - 4, 402);
  d.lines(ls, lineF, look.ink, M, 466, 58);
  d.fillRect(M, barY, 120, 12, 6, look.acc);
  let y = barY + 12 + g + 22; d.put(t.tr(L.colours).toUpperCase(), font(600, 26), look.ink, M, y);
  const gap = 24, sw = (TW - 2 * gap) / 3;
  v.swatches.forEach((c, k) => { // a faint edge keeps a swatch that matches the ground in view
    const sx = M + k * (sw + gap);
    d.fillRect(sx, y + 26, sw, 132, 22, c.hex); d.strokeRect(sx, y + 26, sw, 132, 22, 'rgba(20,24,31,.22)');
    d.put(c.name, font(700, 30), look.ink, sx, y + 204); d.put(c.hex, font(500, 26), look.ink, sx, y + 240);
  });
  y += colH + g; d.put(t.tr(L.feeling).toUpperCase(), font(600, 26), look.ink, M, y);
  let cx = M;
  for (const w of v.words) {
    d.x.font = font(600, 34); const pw = d.x.measureText(w).width + 56;
    d.strokeRect(cx, y + 26, pw, 64, 32, look.ink); d.put(w, font(600, 34), look.ink, cx + 28, y + 68);
    cx += pw + 14;
  }
  y += feelH + g; d.put(t.tr(L.one).toUpperCase(), font(600, 26), look.ink, M, y);
  d.fillRect(M, y + 24, 12, ql.length * 62 - 4, 6, look.acc);
  d.lines(ql, qf, look.ink, M + 36, y + 76, 62);
  d.footer(by, look.ink, look.bg);
  return d.blob();
}

export const kind: Kind = { piece, view, dom, img };
