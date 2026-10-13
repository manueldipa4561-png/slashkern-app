import { SLASH_BODY, SLASH_EYES, SLASH_VIEWBOX } from './slash';
import { BEAT_ROWS, BEAT_STEPS } from './piece-types';

// What the pieces share when they draw: small DOM helpers, a canvas helper for the picture a person saves and posts, and a tiny drum machine for the Music piece.
// Nothing here touches the page until a function is called, so scripts/check-pieces.mjs can import a piece module under Node. Everything a person typed goes in with textContent or
// fillText, never as HTML.
export const el = <K extends keyof HTMLElementTagNameMap>(tag: K, cls = '', text = ''): HTMLElementTagNameMap[K] => Object.assign(document.createElement(tag), { className: cls, textContent: text });
const NS = 'http://www.w3.org/2000/svg';
export const svgEl = (tag: string, attrs: Record<string, string> = {}, text = ''): SVGElement => {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (text) e.textContent = text;
  return e;
};

// A shape with letters in it (a logo, a cover), on a 100 x 100 grid; size is the letters' font size on that grid (letterSize fits wide ones to the shape), ground a square colour behind it. alt '' makes it decorative.
export function logoSvg(d: string, fill: string, letters: string, mono: string, alt: string, size = 34, ground?: string): SVGSVGElement {
  const svg = svgEl('svg', { viewBox: '0 0 100 100', class: 'k-pc-logo' }) as SVGSVGElement;
  if (alt) { svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', alt); } else svg.setAttribute('aria-hidden', 'true');
  if (ground) svg.append(svgEl('rect', { width: '100', height: '100', rx: '14', fill: ground }));
  svg.append(svgEl('path', { d, fill }), svgEl('text', { x: '50', y: '50', dy: '.35em', 'text-anchor': 'middle', 'font-size': String(size), fill: letters }, mono));
  return svg;
}

export const FONT = "'Geist Variable', system-ui, sans-serif";
export const font = (weight: number, px: number) => `${weight} ${px}px ${FONT}`;
// The width of letters in em (in the page font at weight 800), measured on a canvas (the one given, or a new one); without a canvas, a plain guess.
export const emOf = (s: string, x: CanvasRenderingContext2D | null = document.createElement('canvas').getContext('2d')) => { if (!x) return [...s].length * 0.8; x.font = font(800, 100); return x.measureText(s).width / 100; };

// The picture: 1080 wide, as tall as the page needs and never shorter than 1350 (4:5, the tallest a post shows whole) or taller than 2400. Draw it top to bottom: measure with wrap(),
// call size(height), then paint; size() clears the canvas. The footer sits at the bottom edge, whatever the height.
export const PIC_W = 1080, PIC_M = 80, PIC_TW = PIC_W - 2 * PIC_M;
export class Draw {
  readonly W = PIC_W; readonly M = PIC_M; readonly TW = PIC_TW;
  private constructor(readonly cv: HTMLCanvasElement, readonly x: CanvasRenderingContext2D) {}
  static async make(): Promise<Draw | null> {
    try { await Promise.all([font(800, 120), font(700, 52), font(600, 28), font(500, 46), font(400, 30)].map((f) => document.fonts.load(f))); } catch { /* the fallback fonts will do */ }
    const cv = document.createElement('canvas'); cv.width = PIC_W; cv.height = 1350;
    const x = cv.getContext('2d');
    return x ? new Draw(cv, x) : null;
  }
  get H() { return this.cv.height; }
  size(h: number) { this.cv.height = Math.max(1350, Math.min(2400, Math.ceil(h))); }
  fillAll(color: string) { this.x.fillStyle = color; this.x.fillRect(0, 0, this.W, this.H); }
  put(s: string, f: string, color: string, px: number, py: number, align: CanvasTextAlign = 'left') { const x = this.x; x.font = f; x.fillStyle = color; x.textAlign = align; x.fillText(s, px, py); x.textAlign = 'left'; }
  rect(px: number, py: number, w: number, h: number, r: number) { const x = this.x; x.beginPath(); if (x.roundRect) x.roundRect(px, py, w, h, r); else x.rect(px, py, w, h); }
  fillRect(px: number, py: number, w: number, h: number, r: number, color: string) { this.rect(px, py, w, h, r); this.x.fillStyle = color; this.x.fill(); }
  strokeRect(px: number, py: number, w: number, h: number, r: number, color: string, lw = 3) { this.rect(px, py, w, h, r); this.x.strokeStyle = color; this.x.lineWidth = lw; this.x.stroke(); }
  path(d: string, px: number, py: number, k: number, color: string) { const x = this.x; x.save(); x.translate(px, py); x.scale(k, k); x.fillStyle = color; x.fill(new Path2D(d)); x.restore(); }
  // Lines that fit the width by words (a word that is too long by characters); a cut last line ends in "…".
  wrap(s: string, f: string, max: number, width = PIC_TW): string[] {
    const x = this.x; x.font = f;
    const lines: string[] = []; let line = '';
    const add = (bit: string, sep: string) => { const next = line ? line + sep + bit : bit; if (line && x.measureText(next).width > width) { lines.push(line); line = bit; } else line = next; };
    for (const w of s.split(/\s+/).filter(Boolean)) { if (x.measureText(w).width <= width) add(w, ' '); else [...w].forEach((ch, i) => add(ch, i ? '' : ' ')); }
    if (line) lines.push(line);
    if (lines.length <= max) return lines;
    let last = lines[max - 1];
    while (last && x.measureText(last + '…').width > width) last = [...last].slice(0, -1).join('');
    return [...lines.slice(0, max - 1), last.trimEnd() + '…'];
  }
  // Lines one under the other from py (the first baseline); returns the baseline after the last one.
  lines(ls: string[], f: string, color: string, px: number, py: number, lh: number, align: CanvasTextAlign = 'left') { ls.forEach((l, k) => this.put(l, f, color, px, py + k * lh, align)); return py + ls.length * lh; }
  // A thin rule, who made it and when, and the slashkern mark and name, at the bottom edge. A second line in by (after a "\n") is a note under the byline: the practice-project line (picOf).
  footer(by: string, ink: string, bg: string) {
    const x = this.x, { W, M, H, TW } = this, [first, ...more] = by.split('\n'), note = more.join(' ').trim();
    x.globalAlpha = 0.22; this.fillRect(M, H - 134, TW, 3, 2, ink); x.globalAlpha = 1;
    this.put(first, font(600, 28), ink, M, H - (note ? 80 : 76));
    if (note) { let px = 26; while (px > 20 && ((x.font = font(600, px)), x.measureText(note).width > TW)) px--; this.put(note, font(600, px), ink, M, H - 42); } // the longest note shrinks to fit the width
    const [vx, vy, vw, vh] = SLASH_VIEWBOX.split(' ').map(Number), k = 44 / vh, tx = W - M;
    x.font = font(800, 40); const nw = x.measureText('slashkern').width;
    this.put('slashkern', font(800, 40), ink, tx, H - 70, 'right');
    x.save(); x.translate(tx - nw - 16 - vw * k, H - 112); x.scale(k, k); x.translate(-vx, -vy);
    x.fillStyle = ink; x.fill(new Path2D(SLASH_BODY)); x.fillStyle = bg; x.fill(new Path2D(SLASH_EYES.neutral)); x.restore();
  }
  blob(): Promise<Blob | null> { return new Promise((res) => this.cv.toBlob(res, 'image/png')); }
}

// A tiny drum machine: kick, snare and hat on 8 steps (the 24 zeros and ones of a beat answer), eighth notes at bpm, looped until the returned function is called. onStep(k) is told which
// step is sounding (0-7), then -1 at the end. One AudioContext for the page, made on the first tap (iOS allows sound only from a tap). Without Web Audio it does nothing.
let ac: AudioContext | null = null, hiss: AudioBuffer | null = null;
export const canPlay = () => typeof window !== 'undefined' && 'AudioContext' in window;
const audio = () => {
  if (!ac) {
    ac = new AudioContext(); hiss = ac.createBuffer(1, ac.sampleRate, ac.sampleRate); // a second of white noise for the snare and the hat
    const d = hiss.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ac.state === 'suspended') void ac.resume();
  return ac;
};
const hit = (c: AudioContext, row: number, t: number) => {
  const g = c.createGain(); g.connect(c.destination);
  if (row === 0) { // kick: a sine falling from 150 to 45 Hz
    const o = c.createOscillator(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    g.gain.setValueAtTime(0.9, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.22); o.connect(g); o.start(t); o.stop(t + 0.24); return;
  }
  const n = c.createBufferSource(), f = c.createBiquadFilter(); // snare: band-passed noise; hat: high-passed noise, shorter and quieter
  n.buffer = hiss; f.type = row === 1 ? 'bandpass' : 'highpass'; f.frequency.value = row === 1 ? 1800 : 7000;
  g.gain.setValueAtTime(row === 1 ? 0.5 : 0.22, t); g.gain.exponentialRampToValueAtTime(0.001, t + (row === 1 ? 0.16 : 0.05)); n.connect(f); f.connect(g); n.start(t); n.stop(t + 0.2);
};
export function playBeat(bits: string, bpm = 100, onStep?: (k: number) => void): () => void {
  if (!canPlay() || bits.length !== BEAT_STEPS * BEAT_ROWS) return () => {};
  const c = audio(), step = 60 / bpm / 2, t0 = c.currentTime + 0.08;
  let k = 0, ended = false;
  const timers = new Set<number>();
  const tick = () => {
    for (; !ended && t0 + k * step < c.currentTime + 0.25; k++) {
      const s = k % BEAT_STEPS, at = t0 + k * step;
      for (let r = 0; r < BEAT_ROWS; r++) if (bits[r * BEAT_STEPS + s] === '1') hit(c, r, at);
      if (onStep) { const id = window.setTimeout(() => { timers.delete(id); if (!ended) onStep(s); }, Math.max(0, (at - c.currentTime) * 1000)); timers.add(id); }
    }
  };
  const loop = window.setInterval(tick, 60); tick();
  return () => { ended = true; clearInterval(loop); timers.forEach(clearTimeout); onStep?.(-1); };
}
