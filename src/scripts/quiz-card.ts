// The maker quiz result as a 1080x1350 share image: the same card as on screen and on the website (yourkern-site Quiz.astro, makeBlob).
// Tint background, Slash top right with eyes in the type's strong colour, "You are", the name, the line, the first project on a white panel,
// the mix chips, then the brand and the address. Drawn bottom up, so the panel and the chips never run into the footer. Labels stay in
// sentence case like the app's (no mono, no capitals). Every text arrives already translated.
import { SLASH_BODY, SLASH_EYES, SLASH_VIEWBOX } from './slash';

export type QuizCardText = { top: string; you: string; name: string; line: string; firstLabel: string; project: string; mix: string[]; host: string };

const W = 1080, H = 1350, M = 84, INK = '#0E1B3D', F = '"Geist Variable", system-ui, sans-serif';

export const quizImage = async (t: QuizCardText, tint: string, strong: string): Promise<Blob | null> => {
  try {
    await Promise.all(['650 120px', '600 64px', '500 46px'].map((w) => document.fonts.load(`${w} "Geist Variable"`)));
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const g = c.getContext('2d');
    if (!g) return null;
    g.fillStyle = tint; g.fillRect(0, 0, W, H);
    // Slash, large, top right
    const [vx, vy, , vh] = SLASH_VIEWBOX.split(' ').map(Number), ms = 330 / vh;
    g.save(); g.translate(W - 330, 60); g.rotate(-0.12); g.scale(ms, ms); g.translate(-vx, -vy);
    g.fillStyle = INK; g.fill(new Path2D(SLASH_BODY)); g.fillStyle = strong; g.fill(new Path2D(SLASH_EYES.happy)); g.restore();

    const wrap = (text: string, font: string, maxW: number) => {
      g.font = font;
      const lines: string[] = []; let cur = '';
      for (const w of text.split(' ')) { const s = cur ? `${cur} ${w}` : w; if (g.measureText(s).width > maxW && cur) { lines.push(cur); cur = w; } else cur = s; }
      if (cur) lines.push(cur);
      return lines;
    };
    g.fillStyle = INK; g.globalAlpha = 0.72;
    for (const [i, ln] of wrap(t.top, `600 32px ${F}`, 560).entries()) g.fillText(ln, M, 130 + i * 42);
    g.globalAlpha = 1; g.font = `600 64px ${F}`;
    g.fillText(t.you, M, 440);

    let fs = 168, name = wrap(t.name, `650 ${fs}px ${F}`, W - 2 * M);
    while (name.length > 2 && fs > 104) { fs -= 16; name = wrap(t.name, `650 ${fs}px ${F}`, W - 2 * M); }
    let y = 440 + fs;
    g.font = `650 ${fs}px ${F}`;
    for (const [i, ln] of name.entries()) { if (i) y += fs * 0.98; g.fillText(ln, M - 6, y); }
    y += 96;
    for (const ln of wrap(t.line, `500 46px ${F}`, W - 2 * M)) { g.font = `500 46px ${F}`; g.fillText(ln, M, y); y += 58; }

    // bottom up: footer, then the chips, then the panel (which never rises into the line above it)
    const projFont = `650 48px ${F}`, proj = wrap(t.project, projFont, W - 2 * M - 96);
    const chipsY = H - 230, ph = 120 + proj.length * 58, py = Math.max(y, (t.mix.length ? chipsY - 28 : H - 170) - ph);
    g.fillStyle = '#FFFFFF'; g.beginPath(); g.roundRect(M, py, W - 2 * M, ph, 36); g.fill();
    g.fillStyle = INK; g.globalAlpha = 0.7; g.font = `600 30px ${F}`;
    g.fillText(t.firstLabel, M + 48, py + 64);
    g.globalAlpha = 1;
    proj.forEach((ln, i) => { g.font = projFont; g.fillText(ln, M + 48, py + 122 + i * 58); });

    g.font = `600 30px ${F}`;
    let x = M;
    for (const n of t.mix.slice(0, 3)) {
      const w = g.measureText(n).width + 44;
      if (x + w > W - M) break;
      g.fillStyle = 'rgba(14,27,61,0.08)'; g.beginPath(); g.roundRect(x, chipsY, w, 56, 28); g.fill();
      g.fillStyle = INK; g.fillText(n, x + 22, chipsY + 38); x += w + 12;
    }
    g.fillStyle = INK; g.font = `800 54px ${F}`;
    g.fillText('slashkern', M, H - 74);
    g.globalAlpha = 0.7; g.font = `600 30px ${F}`; g.textAlign = 'right';
    g.fillText(t.host, W - M, H - 82);
    return await new Promise<Blob | null>((res) => c.toBlob(res, 'image/png'));
  } catch { return null; } // no canvas or no fonts: the caller shares the text and the link instead
};
