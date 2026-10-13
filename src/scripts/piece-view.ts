import { PL, type BrandView } from './pieces';
import { SLASH_BODY, SLASH_EYES, SLASH_VIEWBOX } from './slash';

// The two drawings of a brand sheet: the page on screen (DOM, styled by app.css .k-pc, in the person's own colours) and the same page as a picture to save and post (canvas).
// Everything a person typed is put in with textContent or fillText, never as HTML. The words around it come from PL (pieces.ts); `by` is the finished byline ("Made by Giulia · 13 Oct").
export type T = { tr: (s: string) => string; fill: (en: string, v: Record<string, string | number>) => string };
const el = <K extends keyof HTMLElementTagNameMap>(tag: K, cls = '', text = ''): HTMLElementTagNameMap[K] => Object.assign(document.createElement(tag), { className: cls, textContent: text });
const NS = 'http://www.w3.org/2000/svg';

// The logo: a shape with the letters in it, on a 100 x 100 grid.
export function logoSvg(d: string, fill: string, letters: string, mono: string, alt: string): SVGSVGElement {
  const svg = document.createElementNS(NS, 'svg'), path = document.createElementNS(NS, 'path'), text = document.createElementNS(NS, 'text');
  svg.setAttribute('viewBox', '0 0 100 100'); svg.setAttribute('class', 'k-pc-logo');
  if (alt) { svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', alt); } else svg.setAttribute('aria-hidden', 'true');
  path.setAttribute('d', d); path.setAttribute('fill', fill);
  for (const [k, v] of Object.entries({ x: '50', y: '50', dy: '.35em', 'text-anchor': 'middle', 'font-size': '34', fill: letters })) text.setAttribute(k, v);
  text.textContent = mono; svg.append(path, text);
  return svg;
}

export function renderBrand(v: BrandView, by: string, t: T): HTMLElement {
  const { look } = v, root = el('article', 'k-pc'), sec = (label: string, ...kids: Node[]) => { const s = el('section', 'k-pc-sec'); s.append(el('p', 'k-pc-l', t.tr(label)), ...kids); return s; };
  root.style.setProperty('--pc-bg', look.bg); root.style.setProperty('--pc-ink', look.ink); root.style.setProperty('--pc-acc', look.acc); root.style.setProperty('--pc-on-acc', look.onAcc);
  root.setAttribute('aria-label', `${v.name} · ${t.tr(PL.tag)}`);
  const head = el('div', 'k-pc-head'), name = el('div', 'k-pc-name', v.name), line = el('p', 'k-pc-line', v.line);
  name.setAttribute('role', 'heading'); name.setAttribute('aria-level', '3');
  head.append(logoSvg(v.shape.d, look.logo, look.onLogo, v.mono, t.fill(PL.logo, { s: v.shape.label.toLowerCase(), m: v.mono })), name, line);
  const sw = el('ul', 'k-pc-sw');
  for (const c of v.swatches) { const li = el('li'), chip = el('i'); chip.style.background = c.hex; li.append(chip, el('b', '', c.name), el('small', '', c.hex)); sw.append(li); }
  const words = el('ul', 'k-pc-words');
  for (const w of v.words) words.append(el('li', '', w));
  const one = el('blockquote', 'k-pc-one', v.one);
  const foot = el('footer', 'k-pc-foot'), brand = el('span', 'k-pc-brand', 'slashkern');
  foot.append(el('span', '', by), brand);
  root.append(el('p', 'k-pc-tag', t.tr(PL.tag)), head, sec(PL.colours, sw), sec(PL.feeling, words), sec(PL.one, one), foot);
  return root;
}

// The picture: 1080 x 1350 (4:5, the tallest a post shows whole). Drawn top to bottom, in Geist like the Slash card.
const W = 1080, H = 1350, M = 80, TW = W - 2 * M;
export async function brandImage(v: BrandView, by: string, t: T): Promise<Blob | null> {
  const D = "'Geist Variable', system-ui, sans-serif";
  try { await Promise.all([`800 120px ${D}`, `700 52px ${D}`, `600 28px ${D}`, `500 46px ${D}`].map((f) => document.fonts.load(f))); } catch { /* the fallback fonts will do */ }
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const x = cv.getContext('2d'); if (!x) return null;
  const { look } = v;
  const put = (s: string, font: string, color: string, px: number, py: number, align: CanvasTextAlign = 'left') => { x.font = font; x.fillStyle = color; x.textAlign = align; x.fillText(s, px, py); x.textAlign = 'left'; };
  const rect = (px: number, py: number, w: number, h: number, r: number) => { x.beginPath(); if (x.roundRect) x.roundRect(px, py, w, h, r); else x.rect(px, py, w, h); };
  // Lines that fit the width by words (a long word by characters); a cut last line ends in "…".
  const wrap = (s: string, font: string, max: number, width = TW) => {
    x.font = font;
    const lines: string[] = []; let line = '';
    const add = (bit: string, sep: string) => { const next = line ? line + sep + bit : bit; if (line && x.measureText(next).width > width) { lines.push(line); line = bit; } else line = next; };
    for (const w of s.split(' ')) { if (x.measureText(w).width <= width) add(w, ' '); else [...w].forEach((ch, i) => add(ch, i ? '' : ' ')); }
    if (line) lines.push(line);
    if (lines.length <= max) return lines;
    let last = lines[max - 1];
    while (last && x.measureText(last + '…').width > width) last = [...last].slice(0, -1).join('');
    return [...lines.slice(0, max - 1), last.trimEnd() + '…'];
  };
  x.fillStyle = look.bg; x.fillRect(0, 0, W, H);
  put(t.tr(PL.tag).toUpperCase(), `600 28px ${D}`, look.ink, M, 98);
  // The logo, 150 px: the shape from its path, the letters centred in it.
  x.save(); x.translate(M, 132); x.scale(1.5, 1.5); x.fillStyle = look.logo; x.fill(new Path2D(v.shape.d)); x.restore();
  put(v.mono, `800 54px ${D}`, look.onLogo, M + 75, 132 + 75 + 19, 'center');
  // The name as large as the width allows (one line), then the line under it.
  let size = 128; x.font = `800 ${size}px ${D}`;
  while (size > 64 && x.measureText(v.name).width > TW) { size -= 4; x.font = `800 ${size}px ${D}`; }
  put(v.name, `800 ${size}px ${D}`, look.ink, M - 4, 402);
  const lineF = `500 46px ${D}`, ls = wrap(v.line, lineF, 2);
  ls.forEach((l, k) => put(l, lineF, look.ink, M, 466 + k * 58));
  const barY = 466 + (ls.length - 1) * 58 + 30;
  x.fillStyle = look.acc; rect(M, barY, 120, 12, 6); x.fill();
  // The three sections share what is left of the page evenly, so a short quote or a long one never leaves the bottom cramped or empty.
  const qf = `700 52px ${D}`, ql = wrap(v.one, qf, 2, TW - 36), FOOT = H - 134, colH = 248, feelH = 90, oneH = 76 + (ql.length - 1) * 62 + 16;
  const g = Math.max(32, (FOOT - (barY + 12) - 22 - colH - feelH - oneH) / 4); // four gaps: above the colours, between the sections, above the footer
  // The colours: three swatches, each with its name and code. A faint edge keeps a swatch that matches the ground in view.
  let y = barY + 12 + g + 22; put(t.tr(PL.colours).toUpperCase(), `600 26px ${D}`, look.ink, M, y);
  const gap = 24, sw = (TW - 2 * gap) / 3;
  v.swatches.forEach((c, k) => {
    const sx = M + k * (sw + gap);
    rect(sx, y + 26, sw, 132, 22); x.fillStyle = c.hex; x.fill(); x.strokeStyle = 'rgba(20,24,31,.22)'; x.lineWidth = 3; x.stroke();
    put(c.name, `700 30px ${D}`, look.ink, sx, y + 204); put(c.hex, `500 26px ${D}`, look.ink, sx, y + 240);
  });
  // The feeling: three words as outlined pills.
  y += colH + g; put(t.tr(PL.feeling).toUpperCase(), `600 26px ${D}`, look.ink, M, y);
  let cx = M;
  for (const w of v.words) {
    x.font = `600 34px ${D}`; const pw = x.measureText(w).width + 56;
    rect(cx, y + 26, pw, 64, 32); x.strokeStyle = look.ink; x.lineWidth = 3; x.stroke(); put(w, `600 34px ${D}`, look.ink, cx + 28, y + 68);
    cx += pw + 14;
  }
  // The one thing: a bar in the accent beside the words, two lines at most.
  y += feelH + g; put(t.tr(PL.one).toUpperCase(), `600 26px ${D}`, look.ink, M, y);
  x.fillStyle = look.acc; rect(M, y + 24, 12, ql.length * 62 - 4, 6); x.fill();
  ql.forEach((l, k) => put(l, qf, look.ink, M + 36, y + 76 + k * 62));
  // The footer: a thin line, who made it and when, and the slashkern mark and name.
  x.globalAlpha = 0.22; x.fillStyle = look.ink; rect(M, H - 134, TW, 3, 2); x.fill(); x.globalAlpha = 1;
  put(by, `600 28px ${D}`, look.ink, M, H - 76);
  {
    const [vx, vy, vw, vh] = SLASH_VIEWBOX.split(' ').map(Number), k = 44 / vh, tx = W - M;
    x.font = `800 40px ${D}`; const nw = x.measureText('slashkern').width;
    put('slashkern', `800 40px ${D}`, look.ink, tx, H - 70, 'right');
    x.save(); x.translate(tx - nw - 16 - vw * k, H - 112); x.scale(k, k); x.translate(-vx, -vy);
    x.fillStyle = look.ink; x.fill(new Path2D(SLASH_BODY)); x.fillStyle = look.bg; x.fill(new Path2D(SLASH_EYES.neutral)); x.restore();
  }
  return new Promise((res) => cv.toBlob(res, 'image/png'));
}
