import { t2 } from './i18n';
import { PAPER, o, pick, tag, text, type Kind, type Piece, type Run, type T, type Tr } from './piece-types';
import { Draw, el, font, svgEl } from './piece-kit';

// Video: a storyboard for an ad for SOL Coffee Bar. Five small steps: the hook (seconds 0-2), three shots for the rest, the words on screen, the sound, the caption. No people anywhere: every shot is the drink,
// the cup or the place. The page is four portrait frames in SOL's four colours, one per part of the clip, each with a line sketch of its shot; the words on screen are a bar over the last frame; the sound and the caption sit under them.
const NAME = t2('SOL Coffee Bar', 'SOL Coffee Bar');
export const L = {
  tag: t2('Storyboard · concept', 'Storyboard · concept'),
  hook: t2('Hook', 'Gancio'),
  shot: t2('Shot {n}', 'Inquadratura {n}'),
  sound: t2('The sound', 'Il suono'),
  caption: t2('The caption', 'La didascalia'),
  screen: t2('On screen:', 'Sullo schermo:'), // read out before the words on the last frame, never shown
};

export const piece: Piece = {
  id: 'video-board', n: 3, f: 'Video', client: NAME, mins: 10,
  title: t2('15-second storyboard for a coffee bar', 'Storyboard di 15 secondi per un coffee bar'),
  blurb: t2('Pick a few things and end with a four-frame storyboard for a coffee bar ad.', 'Scegli poche cose e alla fine hai uno storyboard di quattro vignette per lo spot di un coffee bar.'),
  who: tag('SOL Coffee Bar (fictional)', 'SOL Coffee Bar (fittizio)'),
  brief: t2('SOL is a new coffee bar. It wants a 15-second ad that shows only the drinks and the place, no people: four frames it can film on a phone. You make the storyboard in five small steps.',
    'SOL è un coffee bar appena aperto. Vuole uno spot di 15 secondi che mostri solo le bevande e il locale, senza persone: quattro vignette da girare con il telefono. Tu fai lo storyboard in cinque piccoli passi.'),
  steps: [
    pick(t2('Pick the hook: what do the first 2 seconds show?', 'Scegli il gancio: cosa mostrano i primi 2 secondi?'), t2('Pick one. A hook is the shot that makes people stay.', 'Scegline uno. Il gancio è l’inquadratura che fa restare a guardare.'), 1, [
      o('pour', 'Espresso pouring in slow motion', 'Espresso versato al rallentatore'),
      o('steam', 'Steam rising from the machine', 'Il vapore che sale dalla macchina'),
      o('grind', 'Beans falling into the grinder', 'Chicchi che cadono nel macinino'),
      o('ice', 'Ice dropping into a glass', 'Il ghiaccio che cade in un bicchiere'),
      o('art', 'Latte art being poured', 'Una latte art che prende forma'),
    ]),
    pick(t2('Pick three shots for the rest, in order.', 'Scegli tre inquadrature per il resto, in ordine.'), t2('Tap them in order. The hook is shot 1, so they become shots 2, 3 and 4.', 'Toccale in ordine. Il gancio è la 1, quindi diventano la 2, la 3 e la 4.'), 3, [
      o('cup', 'Close-up of the cup', 'Primo piano del bicchiere'),
      o('drink', 'The finished drink in the sun', 'La bevanda finita nel sole'),
      o('sign', 'The shop sign at golden hour', 'L’insegna del bar all’ora d’oro'),
      o('counter', 'The empty counter in the sun', 'Il bancone vuoto nel sole'),
      o('machine', 'The espresso machine at work', 'La macchina del caffè in azione'),
      o('beans', 'A scoop of beans', 'Una manciata di chicchi'),
    ]),
    text(t2('Write the words on screen. Six words or fewer.', 'Scrivi il testo a schermo. Al massimo sei parole.'), t2('They show big on the last frame. Short enough to read in a second.', 'Appaiono grandi nell’ultima vignetta. Abbastanza corte da leggere in un secondo.'),
      t2('Sun in a cup.', 'Il sole in un bicchiere.'), 32, 6),
    pick(t2('What should people hear?', 'Cosa devono sentire le persone?'), t2('Pick one. Many people watch on mute, so the picture has to work alone too.', 'Scegline uno. Molti guardano senza audio: le immagini devono reggere da sole.'), 1, [
      o('street', 'Café sounds and a clink', 'I suoni del bar e un tintinnio'),
      o('beat', 'A fast beat', 'Un beat veloce'),
      o('voice', 'A short voice-over', 'Una breve voce fuori campo'),
      o('quiet', 'Silence and captions', 'Silenzio e sottotitoli'),
    ]),
    text(t2('Write the caption that goes under the video.', 'Scrivi la didascalia da mettere sotto il video.'), t2('One or two short lines. Say what it is and why to watch.', 'Una o due righe brevi. Di’ cos’è e perché guardarlo.'),
      t2('SOL Coffee Bar. Sunrise tonic, ready in 15 seconds.', 'SOL Coffee Bar. Sunrise tonic, pronta in 15 secondi.'), 100, 16, 2),
  ],
};

// SOL's colours. Each frame carries the text colour that reads on it (checked in scripts/check-piece-video.mjs). line: the colour of its sketch. The frames are the hook (2 s) and three shots (4, 5 and 4 s), so the clip is 15 s.
export const SOL = { orange: '#F27A21', cream: '#F6EBDC', sage: '#A9BFA1', espresso: '#2A1810' };
export const ACCENT = '#B84A14'; // a deeper orange for thin rules on paper (the sun orange is too light there); the four frame colours stay in SOL
const { orange: ORANGE, cream: CREAM, sage: SAGE, espresso: ESPRESSO } = SOL;
export const FRAMES = [{ bg: ORANGE, on: ESPRESSO, line: ESPRESSO }, { bg: CREAM, on: ESPRESSO, line: ESPRESSO }, { bg: SAGE, on: ESPRESSO, line: ESPRESSO }, { bg: ESPRESSO, on: CREAM, line: ORANGE }];
export const SPANS: [number, number][] = [[0, 2], [2, 6], [6, 11], [11, 15]];
export const OVER = { bg: ORANGE, on: ESPRESSO }; // the words on screen: a bar over the last frame

// Sketches: what a shot looks like, in circles and lines (not a drawing of the drink), on a 100 x 100 grid. s: strokes, f: solid shapes. The page draws them as SVG and the picture as Path2D.
export type Sk = { s: string; f?: string };
const ring = (cx: number, cy: number, r: number) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
export const SK: Record<string, Sk> = {
  pour: { s: 'M26 54h48l-6 36h-36ZM50 6V48M41 18v7M59 26v7', f: ring(50, 50, 3.5) }, // a stream falling into a glass, two drops beside it
  steam: { s: 'M24 62h52v6a18 18 0 0 1-18 18h-16a18 18 0 0 1-18-18ZM76 66h6a8 8 0 0 1 0 16h-8M36 52q-8-8 0-16t0-16M52 52q-8-8 0-16t0-16M68 52q-8-8 0-16t0-16' }, // three wavy strands over a cup
  grind: { s: 'M24 52h52l-10 26h-32ZM38 78v10h24v-10', f: ring(34, 18, 5) + ring(58, 26, 5) + ring(46, 38, 5) + ring(70, 14, 5) }, // beans falling into a funnel
  ice: { s: 'M26 56h48l-6 34h-36ZM34 12h14v14h-14ZM54 28h14v14h-14Z' }, // two cubes dropping into a glass
  art: { s: ring(50, 50, 38) + ring(50, 50, 28), f: 'M50 68C30 54 34 38 44 38C48 38 50 41 50 44C50 41 52 38 56 38C66 38 70 54 50 68Z' }, // a cup from above with a heart in the milk
  cup: { s: 'M26 20h48v12h-48ZM30 32h40l-5 56h-30Z', f: 'M38 70a12 12 0 0 1 24 0Z' }, // a takeaway cup with a half sun on it: a close-up
  drink: { s: 'M34 44h32l-4 46h-24ZM14 14l9 9M32 6v12M6 32h12', f: ring(70, 40, 9) }, // a glass with an orange wheel, sun rays at the corner
  sign: { s: 'M17 8h66a5 5 0 0 1 5 5v22a5 5 0 0 1-5 5h-66a5 5 0 0 1-5-5v-22a5 5 0 0 1 5-5ZM22 18h36M22 28h24M30 40v14M70 40v14M4 80H96', f: ring(72, 24, 6) + 'M20 80a30 30 0 0 1 60 0Z' }, // a sign over a setting sun
  counter: { s: 'M8 62h84v9h-84ZM14 71v19M86 71v19M18 8l22 46M40 8l22 46M62 8l22 46' }, // an empty counter with beams of sun
  machine: { s: 'M16 22h68v34h-68ZM28 56v12h44v-12M40 78h20v10h-20Z', f: ring(50, 70, 3) }, // an espresso machine with a drip under the spout
  beans: { s: 'M18 54h64l-9 34h-46ZM82 62h8a6 6 0 0 1 0 12h-10', f: ring(34, 44, 7) + ring(50, 38, 7) + ring(66, 44, 7) }, // a scoop with beans heaped in it
};
const BODY = 'M3.5 9.5H7l5-4.2v13.4l-5-4.2H3.5Z'; // the speaker, on a 24 x 24 grid; silence has a cross instead of waves
export const SPEAKER: Sk = { s: 'M16 9.5a4 4 0 0 1 0 5M19 6.5a8 8 0 0 1 0 11', f: BODY }, MUTED: Sk = { s: 'M16.5 9.5l5 5M21.5 9.5l-5 5', f: BODY };

// What the page shows, read from a run (tr turns a label into the person's language). null until every step is answered.
export type Frame = { time: string; text: string; sk: Sk; bg: string; on: string; line: string };
export type V = { name: string; frames: Frame[]; words: string; sound: string; muted: boolean; caption: string };
export function view(r: Run, tr: Tr): V | null {
  if (r.s.length < piece.steps.length) return null;
  const [hook, shots, , sound] = piece.steps, a = r.s;
  if ([a[0], ...a[1].split(',')].some((id) => !SK[id]) || (sound.kind === 'pick' && !sound.opts.some((x) => x.id === a[3]))) return null; // picks saved before this piece changed: wait for new ones
  const label = (st: typeof hook, id: string) => (st.kind === 'pick' ? tr(st.opts.find((x) => x.id === id)!.label) : '');
  return {
    name: tr(NAME), words: a[2], caption: a[4], sound: label(sound, a[3]), muted: a[3] === 'quiet',
    frames: [a[0], ...a[1].split(',')].map((id, k) => ({ time: `${SPANS[k][0]}–${SPANS[k][1]} s`, text: label(k ? shots : hook, id), sk: SK[id], ...FRAMES[k] })),
  };
}

const META = '15 s · 9:16';
const glyph = (g: Sk, vb: string, cls: string, w: number, align = 'xMidYMid meet'): SVGElement => {
  const svg = svgEl('svg', { viewBox: vb, class: cls, 'aria-hidden': 'true', focusable: 'false', preserveAspectRatio: align });
  svg.append(svgEl('path', { d: g.s, fill: 'none', stroke: 'currentColor', 'stroke-width': String(w), 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
  if (g.f) svg.append(svgEl('path', { d: g.f, fill: 'currentColor' }));
  return svg;
};

// On screen: styled by piece-video.css. The sketch sits behind the last frame's bar (the art box holds both), so a long line grows the box and never covers the timecode.
export function dom(v: V, by: string, t: T): HTMLElement {
  const root = el('article', 'k-pc'), sec = (label: string, cls: string, ...kids: Node[]) => { const s = el('section', ('k-pc-sec ' + cls).trim()); s.append(el('p', 'k-pc-l k-pc-video-l', t.tr(label)), ...kids); return s; };
  for (const [k, c] of Object.entries({ '--pc-ink': ESPRESSO, '--pc-acc': ACCENT, '--pc-on-acc': PAPER, '--pc-hi': OVER.bg })) root.style.setProperty(k, c);
  root.setAttribute('aria-label', `${v.name} · ${t.tr(L.tag)}`);
  const head = el('div', 'k-pc-head'), name = el('div', 'k-pc-video-name', v.name), bar = el('div', 'k-pc-video-bar'), grid = el('ol', 'k-pc-video-grid');
  name.setAttribute('role', 'heading'); name.setAttribute('aria-level', '3'); bar.setAttribute('aria-hidden', 'true'); grid.setAttribute('role', 'list');
  v.frames.forEach((f, k) => {
    const seg = el('i'), li = el('li', 'k-pc-video-fr'), art = el('div', 'k-pc-video-art'), last = k === v.frames.length - 1;
    seg.style.flex = String(SPANS[k][1] - SPANS[k][0]); seg.style.background = f.bg; bar.append(seg);
    li.style.setProperty('--fb', f.bg); li.style.setProperty('--fi', f.on); li.style.setProperty('--fk', f.line);
    art.append(glyph(f.sk, '0 0 100 100', 'k-pc-video-sk', 3.2, last ? 'xMidYMin meet' : 'xMidYMid meet'));
    if (last) { const over = el('p', 'k-pc-video-over'); over.append(el('span', 'k-pc-video-sr', t.tr(L.screen) + ' '), v.words); art.append(over); }
    li.append(el('span', 'k-pc-video-lb', k ? t.fill(L.shot, { n: k + 1 }) : t.tr(L.hook)), el('b', 'k-pc-video-tc', f.time), el('p', 'k-pc-video-tx', f.text), art); // read in this order, shown with the art above the text (css order)
    grid.append(li);
  });
  const chip = el('span', 'k-pc-video-chip'), foot = el('footer', 'k-pc-foot');
  chip.append(glyph(v.muted ? MUTED : SPEAKER, '0 0 24 24', 'k-pc-video-ico', 2), v.sound);
  foot.append(el('span', '', by), el('span', 'k-pc-brand', 'slashkern'));
  head.append(name, bar);
  root.append(el('p', 'k-pc-tag', t.tr(L.tag)), head, grid, sec(L.sound, 'k-pc-video-snd', chip, el('span', 'k-pc-video-meta', META)), sec(L.caption, '', el('blockquote', 'k-pc-one k-pc-video-quote', v.caption)), foot);
  return root;
}

// A sketch or the speaker, stroked and filled, on a canvas: k scales its grid, w is the line width in grid units.
function paint(d: Draw, g: Sk, px: number, py: number, k: number, color: string, w: number) {
  const c = d.x; c.save(); c.translate(px, py); c.scale(k, k);
  c.strokeStyle = color; c.fillStyle = color; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round';
  c.stroke(new Path2D(g.s)); if (g.f) c.fill(new Path2D(g.f));
  c.restore();
}

// As a picture: the four frames at 9:16, 448 px wide each, then the sound and the caption. Every height is measured first. The frames are as tall as 9:16 allows, and only when a long caption
// would push the picture past 2400 px do they get a little shorter. The sketch has the same room in all four frames; the bar covers the lower edge of the last one.
export async function img(v: V, by: string, t: T): Promise<Blob | null> {
  const d = await Draw.make(); if (!d) return null;
  const { M, TW, x } = d, GAP = 24, FW = (TW - GAP) / 2, PAD = 32, IW = FW - 2 * PAD, LH = 44, BAR = 14, FOOT = 134, MAX = 2400, TOP = PAD + 44 + 24 + 72 + 24; // TOP: down to where a frame's sketch starts (the label pill, the timecode, a gap)
  let size = 80; x.font = font(800, size); // the name: one line, as big as it fits
  while (size > 52 && x.measureText(v.name).width > TW) { size -= 4; x.font = font(800, size); }
  const txF = font(700, 36), qF = font(700, 44), chF = font(700, 34);
  const ovS = [44, 40, 36, 32].find((px) => d.wrap(v.words, font(800, px), 9, IW).length <= 4) ?? 32, ovF = font(800, ovS), ovLH = Math.round(ovS * 1.18); // the words on screen are never cut: wide letters get a smaller bar text, never under 32 px
  const lines = v.frames.map((f) => d.wrap(f.text, txF, 4, IW)), nMax = Math.max(...lines.map((l) => l.length)), ovL = d.wrap(v.words, ovF, 4, IW), ovH = ovL.length * ovLH + 36;
  const chL = d.wrap(v.sound, chF, 2, TW - 112); x.font = chF;
  const chW = Math.max(...chL.map((l) => x.measureText(l).width)) + 112, chH = Math.max(64, chL.length * LH + 20), qL = d.wrap(v.caption, qF, 5, TW - 36);
  const ny = 112 + Math.round(size * 0.78), barY = ny + 24, gy = barY + BAR + 30, below = 56 + 20 + chH + 62 + 22 + qL.length * 52 + 30;
  const fh = Math.max(560, Math.min(Math.round((FW * 16) / 9), Math.floor((MAX - FOOT - gy - GAP - below) / 2)));
  d.size(gy + 2 * fh + GAP + below + FOOT); d.fillAll(PAPER);
  d.put(t.tr(L.tag).toUpperCase(), font(600, 26), ESPRESSO, M, 84);
  d.put(v.name, font(800, size), ESPRESSO, M - 3, ny);
  let bx = M; // the clip as a bar: 2, 4, 5 and 4 seconds in the colours of the frames
  v.frames.forEach((f, k) => { const w = ((TW - 3 * 8) * (SPANS[k][1] - SPANS[k][0])) / 15; d.fillRect(bx, barY, w, BAR, 7, f.bg); d.strokeRect(bx, barY, w, BAR, 7, 'rgba(14,27,61,.22)', 2); bx += w + 8; });
  const artH = fh - TOP - PAD - nMax * LH - 20;
  v.frames.forEach((f, k) => {
    const fx = M + (k % 2) * (FW + GAP), fy = gy + Math.floor(k / 2) * (fh + GAP), tx = fx + PAD, ay = fy + TOP, ab = ay + artH, sc = Math.min(IW, artH) / 100;
    d.fillRect(fx, fy, FW, fh, 32, f.bg);
    const lb = (k ? t.fill(L.shot, { n: k + 1 }) : t.tr(L.hook)).toUpperCase(); x.font = font(700, 26); // the label: a pill in the text colour
    d.fillRect(tx, fy + PAD, x.measureText(lb).width + 28, 44, 12, f.on); d.put(lb, font(700, 26), f.bg, tx + 14, fy + PAD + 31);
    let ts = 96; x.font = font(800, ts); while (ts > 56 && x.measureText(f.time).width > IW) { ts -= 4; x.font = font(800, ts); }
    d.put(f.time, font(800, ts), f.on, tx, fy + TOP - 24);
    paint(d, f.sk, tx + (IW - 100 * sc) / 2, k === 3 ? ay : ay + (artH - 100 * sc) / 2, sc, f.line, 3.2);
    if (k === 3) { d.fillRect(fx, ab - ovH, FW, ovH, 0, OVER.bg); d.lines(ovL, ovF, OVER.on, tx, ab - ovH + 18 + (ovLH - ovS) / 2 + ovS * 0.8, ovLH); }
    d.lines(lines[k], txF, f.on, tx, fy + fh - PAD - lines[k].length * LH + 33, LH);
    d.strokeRect(fx, fy, FW, fh, 32, 'rgba(14,27,61,.16)', 3);
  });
  let y = gy + 2 * fh + GAP + 56; d.put(t.tr(L.sound).toUpperCase(), font(600, 26), ESPRESSO, M, y); d.put(META, font(600, 28), ESPRESSO, M + TW, y, 'right');
  const cy = y + 20; // the sound: the speaker in a chip, the format at the right end of its label
  d.fillRect(M, cy, chW, chH, Math.min(36, chH / 2), ESPRESSO);
  paint(d, v.muted ? MUTED : SPEAKER, M + 24, cy + chH / 2 - 20, 40 / 24, OVER.bg, 2);
  d.lines(chL, chF, PAPER, M + 80, cy + (chH - chL.length * LH) / 2 + 32, LH);
  y = cy + chH + 62; d.put(t.tr(L.caption).toUpperCase(), font(600, 26), ESPRESSO, M, y);
  d.fillRect(M, y + 22, 12, qL.length * 52 - 8, 6, ACCENT);
  d.lines(qL, qF, ESPRESSO, M + 36, y + 22 + 40, 52);
  d.footer(by, ESPRESSO, PAPER);
  return d.blob();
}

export const kind: Kind = { piece, view, dom, img };
