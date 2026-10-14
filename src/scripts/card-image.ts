// The KernCard as a 1080x1920 story image: the same card as on screen (app.css, "KernCard v2") on a dark page. The card is in the colour of the
// field, with a foil of tiny pointers and a glare; the stamps are the field's projects (filled, with the pointer, when done). Every text arrives
// already translated. Free of app state, like quiz-card.ts, so the app only passes what the card shows.
import { SLASH_BODY, SLASH_EYES, SLASH_VIEWBOX } from './slash';

export type KernCardText = { field: string; count: string; done: boolean[]; quote: string; source: string; patternLabel: string; pattern: string; slogan: string; host: string };

const W = 1080, H = 1920, CX = 84, CY = 236, CW = 912, CH = 1272, PAD = 64, RADIUS = 72;
const NAVY = '#0E1B3D', PAGE = '#0A1330', BONE = '#EEF2FF', DIM = 'rgba(238,242,255,0.7)', TILE = 100;
const F = '"Geist Variable", system-ui, sans-serif';

const channels = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const mix = (a: string, b: string, p: number) => { const x = channels(a), y = channels(b); return `rgb(${x.map((v, i) => Math.round(v * p + y[i] * (1 - p))).join(',')})`; };
const alpha = (hex: string, a: number) => `rgba(${channels(hex).join(',')},${a})`;

// Lines that fit the width: by words, by characters for a word longer than a line; a cut last line ends in "…".
const wrap = (g: CanvasRenderingContext2D, s: string, font: string, max: number, maxLines = Infinity) => {
  g.font = font;
  const lines: string[] = []; let line = '';
  const add = (bit: string, sep: string) => { const next = line ? line + sep + bit : bit; if (line && g.measureText(next).width > max) { lines.push(line); line = bit; } else line = next; };
  for (const w of s.split(' ')) { if (g.measureText(w).width <= max) add(w, ' '); else [...w].forEach((ch, i) => add(ch, i ? '' : ' ')); }
  if (line) lines.push(line);
  if (lines.length <= maxLines) return lines;
  let last = lines[maxLines - 1];
  while (last && g.measureText(last + '…').width > max) last = [...last].slice(0, -1).join('');
  return [...lines.slice(0, maxLines - 1), last.trimEnd() + '…'];
};

// The pointer (the slashkern mark) at a given height: body and eyes in two colours.
const pointer = (g: CanvasRenderingContext2D, x: number, y: number, h: number, body: string, eyes: string) => {
  const [vx, vy, vw, vh] = SLASH_VIEWBOX.split(' ').map(Number), k = h / vh;
  g.save(); g.translate(x, y); g.scale(k, k); g.translate(-vx, -vy);
  g.fillStyle = body; g.fill(new Path2D(SLASH_BODY)); g.fillStyle = eyes; g.fill(new Path2D(SLASH_EYES.neutral)); g.restore();
  return vw * k;
};

const round = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => { g.beginPath(); g.roundRect(x, y, w, h, r); };

// The foil: a rainbow sheen seen only through a pattern of tiny pointers, laid over the card with colour-dodge.
const foil = (g: CanvasRenderingContext2D) => {
  const tile = document.createElement('canvas'); tile.width = tile.height = TILE;
  const t = tile.getContext('2d'); if (!t) return;
  pointer(t, TILE * 0.34, TILE * 0.32, TILE * 0.29, '#fff', '#fff');
  const sheet = document.createElement('canvas'); sheet.width = CW; sheet.height = CH;
  const s = sheet.getContext('2d'); if (!s) return;
  const sheen = s.createLinearGradient(0, CH * 0.1, CW, CH * 0.9);
  [[0.3, '#ff8ae000'], [0.4, '#ff8ae0'], [0.47, '#8affd9'], [0.54, '#8ab4ff'], [0.61, '#ffe58a'], [0.7, '#ffe58a00']].forEach(([p, c]) => sheen.addColorStop(p as number, c as string));
  s.fillStyle = sheen; s.fillRect(0, 0, CW, CH);
  s.globalCompositeOperation = 'destination-in'; s.fillStyle = s.createPattern(tile, 'repeat') ?? '#fff'; s.fillRect(0, 0, CW, CH);
  g.save(); g.globalCompositeOperation = 'color-dodge'; g.globalAlpha = 0.6; g.drawImage(sheet, CX, CY); g.restore();
};

export const kernCardImage = async (t: KernCardText, hue: string): Promise<Blob | null> => {
  try {
    await Promise.all(['800 96px', '700 96px', '650 36px', '500 36px'].map((w) => document.fonts.load(`${w} "Geist Variable"`)));
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const g = cv.getContext('2d'); if (!g) return null;
    const put = (s: string, font: string, color: string, x: number, y: number) => { g.font = font; g.fillStyle = color; g.fillText(s, x, y); };

    // the page, with the card's colour glowing behind it
    g.fillStyle = PAGE; g.fillRect(0, 0, W, H);
    const glow = g.createRadialGradient(W * 0.5, CY + CH * 0.5, 120, W * 0.5, CY + CH * 0.5, 980);
    glow.addColorStop(0, alpha(hue, 0.34)); glow.addColorStop(1, alpha(hue, 0));
    g.fillStyle = glow; g.fillRect(0, 0, W, H);

    // the card: shadow, body, blooms, foil, glare, rim
    g.save(); g.shadowColor = alpha(hue, 0.55); g.shadowBlur = 110; g.shadowOffsetY = 60; g.fillStyle = NAVY; round(g, CX, CY, CW, CH, RADIUS); g.fill(); g.restore();
    g.save(); round(g, CX, CY, CW, CH, RADIUS); g.clip();
    const body = g.createLinearGradient(CX, CY, CX + CW * 0.55, CY + CH);
    body.addColorStop(0, '#0e1b3d'); body.addColorStop(0.58, '#122660'); body.addColorStop(1, mix(hue, '#0e1b3d', 0.18));
    g.fillStyle = body; g.fillRect(CX, CY, CW, CH);
    const top = g.createRadialGradient(CX + CW * 0.94, CY - CH * 0.04, 0, CX + CW * 0.94, CY - CH * 0.04, CW * 0.8);
    top.addColorStop(0, alpha(hue, 0.7)); top.addColorStop(1, alpha(hue, 0)); g.fillStyle = top; g.fillRect(CX, CY, CW, CH);
    const low = g.createRadialGradient(CX, CY + CH * 1.03, 0, CX, CY + CH * 1.03, CW * 0.7);
    low.addColorStop(0, alpha(hue, 0.28)); low.addColorStop(1, alpha(hue, 0)); g.fillStyle = low; g.fillRect(CX, CY, CW, CH);
    foil(g);
    const glare = g.createRadialGradient(CX + CW * 0.3, CY + CH * 0.16, 0, CX + CW * 0.3, CY + CH * 0.16, CW * 0.75);
    glare.addColorStop(0, 'rgba(255,255,255,0.3)'); glare.addColorStop(1, 'rgba(255,255,255,0)');
    g.save(); g.globalCompositeOperation = 'overlay'; g.fillStyle = glare; g.fillRect(CX, CY, CW, CH); g.restore();
    g.restore();
    g.strokeStyle = 'rgba(255,255,255,0.16)'; g.lineWidth = 3; round(g, CX + 1.5, CY + 1.5, CW - 3, CH - 3, RADIUS - 1.5); g.stroke();

    // the top row: the mark and the name on the left, the field as a chip on the right
    const X = CX + PAD, TW = CW - 2 * PAD, markH = 84, markY = CY + PAD;
    const markW = pointer(g, X, markY, markH, BONE, NAVY);
    put('slashkern', `800 56px ${F}`, BONE, X + markW + 18, markY + markH * 0.7);
    g.font = `800 56px ${F}`;
    const nameEnd = X + markW + 18 + g.measureText('slashkern').width, chipRoom = TW - (nameEnd - X) - 28 - 84;
    g.font = `700 28px ${F}`;
    let field = t.field.toUpperCase();
    while (field.length > 1 && g.measureText(field).width > chipRoom) field = field.slice(0, -2).trimEnd() + '…';
    const cw = g.measureText(field).width + 84, chipY = markY + (markH - 64) / 2;
    g.fillStyle = 'rgba(255,255,255,0.12)'; round(g, X + TW - cw, chipY, cw, 64, 32); g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.2)'; g.lineWidth = 2; g.stroke();
    g.fillStyle = hue; g.shadowColor = hue; g.shadowBlur = 16; g.beginPath(); g.arc(X + TW - cw + 32, chipY + 32, 9, 0, Math.PI * 2); g.fill(); g.shadowBlur = 0;
    put(field, `700 28px ${F}`, '#fff', X + TW - cw + 54, chipY + 42);

    // the stamps: one per project, filled with the pointer when done, dashed when not
    const n = Math.max(1, t.done.length), R = 30, stampY = markY + markH + 78, step = n > 1 ? (TW - 2 * R) / (n - 1) : 0;
    t.done.forEach((on, i) => {
      const x = X + R + i * step;
      g.beginPath(); g.arc(x, stampY, R, 0, Math.PI * 2);
      if (on) { g.save(); g.shadowColor = alpha(hue, 0.6); g.shadowBlur = 24; g.fillStyle = hue; g.fill(); g.restore(); pointer(g, x - 13, stampY - 15, 30, NAVY, hue); }
      else { g.save(); g.setLineDash([9, 9]); g.strokeStyle = 'rgba(255,255,255,0.34)'; g.lineWidth = 3; g.stroke(); g.restore(); }
    });
    put(t.count.toUpperCase(), `650 30px ${F}`, DIM, X, stampY + R + 52);

    // the middle: the quote as big as the room allows, the project it answered, then the pattern
    const TOP = stampY + R + 100, BOTTOM = CY + CH - PAD, LH = 1.2, SS = 34, LS = 28, PS = 58;
    const SF = `500 ${SS}px ${F}`, LF = `650 ${LS}px ${F}`, PF = `800 ${PS}px ${F}`, qf = (s: number) => `700 ${s}px ${F}`;
    const lines = (ls: string[], font: string, s: number, color: string, y: number) => { ls.forEach((l, i) => put(l, font, color, X, y + s * 0.95 + i * s * LH)); return y + ls.length * s * LH; };
    const src = wrap(g, `— ${t.source}`, SF, TW, 1), pat = t.pattern ? wrap(g, t.pattern, PF, TW, 3) : [];
    const fixed = 20 + SS * LH + (pat.length ? 64 + 14 + 8 + 26 + LS * LH + 14 + pat.length * PS * LH : 0);
    const quote = `“${t.quote}”`, room = BOTTOM - TOP - fixed;
    const size = [84, 74, 66, 58, 52].find((s) => wrap(g, quote, qf(s), TW).length * s * LH <= room) ?? 52;
    const body2 = wrap(g, quote, qf(size), TW, Math.max(1, Math.floor(room / (size * LH))));
    let y = TOP + Math.max(0, room - body2.length * size * LH) * 0.45;
    y = lines(body2, qf(size), size, '#fff', y);
    y = lines(src, SF, SS, DIM, y + 20);
    if (pat.length) {
      g.save(); g.shadowColor = hue; g.shadowBlur = 20; g.fillStyle = hue; round(g, X, y + 64, 88, 8, 4); g.fill(); g.restore();
      y = lines([t.patternLabel.toUpperCase()], LF, LS, DIM, y + 96);
      lines(pat, PF, PS, '#fff', y + 14);
    }

    // below the card: the line and the address, above the strip a story covers with its reply bar
    const slogan = wrap(g, t.slogan, `800 64px ${F}`, CW, 3);
    slogan.forEach((l, i) => put(l, `800 64px ${F}`, BONE, CX, CY + CH + 120 + i * 76));
    put(t.host, `650 34px ${F}`, '#A9B4D0', CX, CY + CH + 120 + slogan.length * 76 + 24);
    return await new Promise<Blob | null>((res) => cv.toBlob(res, 'image/png'));
  } catch { return null; } // no canvas or no fonts: the caller shares the text and the link instead
};
