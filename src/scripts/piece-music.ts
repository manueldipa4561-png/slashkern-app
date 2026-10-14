import { t2 } from './i18n';
import { BEAT_STEPS, INK, SHAPES, beat, fitOf, initials, letterSize, o, pick, readable, tag, text, type Kind, type Piece, type Run, type T, type Tr } from './piece-types';
import { Draw, canPlay, el, emOf, font, playBeat, svgEl } from './piece-kit';

// Music: a release card for the fictional Clank Gym. Five small steps: a beat on the grid, the mood of the track, its name, the colour of its cover, the shape on it. The page is a card on the
// app's navy: the cover (the picked colour, the picked shape, the first letters of the name cut out of it), the name, the mood, the beat as a grid of 3 rows x 8 steps, and a Play button that
// plays that beat and lights the step that is sounding. A picture cannot play, so it shows the same grid. Nothing is made for the person: every part is a choice or a line of theirs.
const L = {
  tag: t2('Release · concept', 'Uscita · concept'),
  cover: t2('Cover: {s} with the letters {m} on {c}', 'Cover: {s} con le lettere {m} su {c}'),
  hits: t2('{k} hits', '{k} colpi'),
  rows: [t2('Kick', 'Cassa'), t2('Snare', 'Rullante'), t2('Hat', 'Hi-hat')], // rows of a beat answer; the same words as the step screen (PL in pieces.ts)
  play: t2('Play', 'Suona'),
  stop: t2('Stop', 'Ferma'),
};

export const BPM = 100; // the step screen plays at 100 too
// The card is fixed: navy, paper, and a muted blue-grey for small labels (8:1 on the navy). Only the cover and what echoes it (the filled squares, the Play button) take the picked colour.
export const NAVY = '#0E1B3D', BONE = '#EEF2FF', DIM = '#A9B4D0';

export const piece: Piece = {
  id: 'music-release', n: 5, f: 'Music', client: 'Clank Gym', mins: 10, monoFrom: 2, cover: true,
  title: t2('A beat and its release card', 'Un ritmo e la sua scheda di uscita'),
  blurb: t2('Tap a beat, name it and pick its cover. End with a release card that plays your beat.', 'Batti un ritmo, dagli un nome e scegli la sua cover. Alla fine hai una scheda che suona il tuo ritmo.'),
  who: tag('Clank Gym (fictional)', 'Clank Gym (fittizia)'),
  brief: t2('Clank Gym wants a strong beat for its videos and a release card to share it. You tap the beat, name the track and pick its cover in five small steps.',
    'Clank Gym vuole un ritmo forte per i suoi video e una scheda per condividerlo. Batti il ritmo, dai un nome al brano e scegli la cover in cinque piccoli passi.'),
  steps: [
    beat(t2('Tap a beat for Clank Gym.', 'Batti un ritmo per Clank Gym.'), t2('Kick is the thump, snare the clap, hat the tick. Press Play to hear it.', 'La cassa fa “bum”, il rullante “clap”, l’hi-hat “tic”. Premi Suona per sentirlo.')),
    pick(t2('Pick the mood of the track.', 'Scegli l’atmosfera del brano.'), t2('One word that tells people how it sounds. It goes under the title.', 'Una parola che dice come suona. Va sotto il titolo.'), 1, [
      o('heavy', 'Heavy', 'Pesante'), o('bouncy', 'Bouncy', 'Saltellante'), o('dreamy', 'Dreamy', 'Sognante'), o('dark', 'Dark', 'Cupo'), o('hype', 'Hype', 'Carico'), o('chill', 'Chill', 'Rilassato'),
    ], 'chip'),
    text(t2('Name the track. Four words or fewer.', 'Dai un nome al brano. Quattro parole al massimo.'), t2('Say it out loud. A name that is easy to say is easy to share.', 'Dillo ad alta voce. Un nome facile da dire è facile da condividere.'), t2('Iron Sunday', 'Domenica di ferro'), 24, 4),
    pick(t2('Pick the colour of the cover.', 'Scegli il colore della cover.'), t2('Covers are tiny on a phone, so one bold colour works best.', 'Su un telefono le cover sono piccole: un colore deciso funziona meglio.'), 1, [
      o('electric', 'Electric blue', 'Blu elettrico', { hex: '#4260F5' }), o('pink', 'Neon pink', 'Rosa fluo', { hex: '#FF4F9A' }), o('mustard', 'Mustard yellow', 'Giallo senape', { hex: '#F2B632' }),
      o('mint', 'Mint green', 'Verde menta', { hex: '#3DDC97' }), o('brick', 'Brick red', 'Rosso mattone', { hex: '#C8422B' }), o('chalk', 'Chalk white', 'Bianco gesso', { hex: '#ECE6D8' }),
    ], 'swatch'),
    pick(t2('Pick the shape on the cover.', 'Scegli la forma sulla cover.'), t2('The first letters of your track name go inside it.', 'Le iniziali del nome del brano ci vanno dentro.'), 1, SHAPES, 'shape'),
  ],
};

// The letters on the cover: the first letters of the name, as the shape previews of the step show them (a name made only of emoji or symbols falls back to the client's letters).
export const monoOf = (name: string) => initials(name) || initials(piece.client);

// What the card shows, read from a run (tr turns a label into the person's language). null until every step is answered.
export type V = { name: string; mono: string; mood: string; colour: { name: string; hex: string }; shape: { id: string; label: string; d: string }; bits: string };
export function view(r: Run, tr: Tr): V | null {
  if (r.s.length < piece.steps.length) return null;
  const [bits, mood, typed, colour, shape] = r.s, name = typed.replace(/\s+/g, ' ').trim(); // the text step is a box: a line break or a double space becomes one space
  const opt = (k: number, id: string) => { const st = piece.steps[k]; return st.kind === 'pick' ? st.opts.find((x) => x.id === id) : undefined; };
  const m = opt(1, mood), c = opt(3, colour), s = opt(4, shape);
  if (!m || !c?.hex || !s?.d) return null;
  return { name, mono: monoOf(name), mood: tr(m.label), colour: { name: tr(c.label), hex: c.hex }, shape: { id: s.id, label: tr(s.label), d: s.d }, bits };
}

// The beat in words, for a screen reader: the steps (1-8) that hit, row by row, like "Kick 1, 5; Snare 3, 7". A row without a hit is left out (a beat has at least 4 hits in all).
export const hitsOf = (bits: string) => [...bits].filter((b) => b === '1').length;
export const readOut = (bits: string, tr: Tr) => L.rows.map((row, r) => ({ row, at: [...Array(BEAT_STEPS)].map((_, s) => s).filter((s) => bits[r * BEAT_STEPS + s] === '1').map((s) => s + 1) }))
  .filter((x) => x.at.length).map((x) => `${tr(x.row)} ${x.at.join(', ')}`).join('; ');


// The cover, on a 100 x 100 grid: the picked colour, the picked shape at 78% in near-black or paper (whichever reads better on it), a faint copy of it offset behind like a misprint, and the
// letters cut out of the shape in the cover colour. The shape and the letters are one group, so the cover can thump on every kick without moving its ground.
function coverSvg(v: V, alt: string, size: number): SVGSVGElement {
  const svg = svgEl('svg', { viewBox: '0 0 100 100', class: 'k-pc-music-cover', role: 'img', 'aria-label': alt }) as SVGSVGElement;
  const thump = svgEl('g', { class: 'k-pc-music-thump' }), place = svgEl('g', { transform: 'translate(11 11) scale(.78)' });
  thump.append(
    svgEl('path', { d: v.shape.d, fill: INK, 'fill-opacity': '.22', transform: 'translate(4 4)' }),
    svgEl('path', { d: v.shape.d, fill: readable(v.colour.hex) }),
    svgEl('text', { x: '50', y: String(50 + fitOf(v.shape.id).dy), dy: '.35em', 'text-anchor': 'middle', 'font-size': String(size), fill: v.colour.hex }, v.mono),
  );
  place.append(thump);
  svg.append(svgEl('rect', { width: '100', height: '100', fill: v.colour.hex }), svgEl('rect', { x: '4', y: '4', width: '92', height: '92', rx: '3', fill: 'none', stroke: readable(v.colour.hex), 'stroke-opacity': '.35', 'stroke-width': '.5' }), place);
  return svg;
}

// The beat as a grid: a filled square is a hit. Returns the grid and its squares by row, so Play can light a column.
function sequencer(v: V, t: T) {
  const grid = el('div', 'k-pc-music-seq'), cells: HTMLElement[][] = [];
  grid.setAttribute('role', 'img'); grid.setAttribute('aria-label', readOut(v.bits, t.tr));
  L.rows.forEach((label, r) => {
    const row = el('div', 'k-pc-music-row'), line: HTMLElement[] = [];
    row.append(el('span', 'k-pc-music-rl', t.tr(label)));
    for (let s = 0; s < BEAT_STEPS; s++) { const c = el('i', 'k-pc-music-cell' + (v.bits[r * BEAT_STEPS + s] === '1' ? ' on' : '')); line.push(c); row.append(c); }
    cells.push(line); grid.append(row);
  });
  return { grid, cells };
}

// The Play button and the numbers beside it. Playing loops the beat (playBeat), lights the sounding column and thumps the cover on every kick. It stops when pressed again, on pagehide, and by
// itself once the card is gone: playBeat tells us each step, and a step that finds the card removed from the page, or hidden with its screen, stops it. Without Web Audio there is nothing
// to press, so the button is hidden. It never starts on its own (a page may only make sound after a tap, and a person should choose to).
const PLAY_D = 'M8 5v14l11-7z', STOP_D = 'M6.5 6.5h11v11h-11z'; // on a 24 x 24 grid
function transport(root: HTMLElement, v: V, t: T, cells: HTMLElement[][], thump: Element): HTMLElement {
  const bar = el('div', 'k-pc-music-bar'), btn = el('button', 'k-pc-music-play'), label = el('span', '', t.tr(L.play)), meta = el('p', 'k-pc-music-meta');
  const icon = svgEl('svg', { viewBox: '0 0 24 24', class: 'k-pc-music-ico', 'aria-hidden': 'true' }), glyph = svgEl('path', { d: PLAY_D });
  icon.append(glyph); btn.type = 'button'; btn.hidden = !canPlay(); btn.setAttribute('aria-pressed', 'false'); btn.append(icon, label);
  meta.append(el('b', '', `${BPM} BPM`), el('span', '', t.fill(L.hits, { k: hitsOf(v.bits) })));
  let stop: (() => void) | null = null;
  const lit = (k: number) => cells.forEach((row) => row.forEach((c, s) => c.classList.toggle('lit', s === k)));
  const show = (on: boolean) => { btn.setAttribute('aria-pressed', String(on)); label.textContent = t.tr(on ? L.stop : L.play); glyph.setAttribute('d', on ? STOP_D : PLAY_D); };
  const halt = () => { const s = stop; stop = null; window.removeEventListener('pagehide', halt); s?.(); show(false); }; // s() tells onStep(-1), which clears the light
  const onStep = (k: number) => {
    if (k >= 0 && !(root.isConnected && root.getClientRects().length)) { halt(); return; }
    lit(k);
    if (k >= 0 && v.bits[k] === '1' && !matchMedia('(prefers-reduced-motion: reduce)').matches) thump.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: 170, easing: 'ease-out' });
  };
  btn.addEventListener('click', () => { if (stop) { halt(); return; } show(true); window.addEventListener('pagehide', halt); stop = playBeat(v.bits, BPM, onStep); });
  bar.append(btn, meta);
  return bar;
}

// On the page: styled by piece-music.css on top of the base page (.k-pc); the picked colour arrives as --mu, with --mu-on for text on it.
export function dom(v: V, by: string, t: T): HTMLElement {
  const root = el('article', 'k-pc k-pc-music'), tagText = t.tr(L.tag);
  root.style.setProperty('--mu', v.colour.hex); root.style.setProperty('--mu-on', readable(v.colour.hex));
  root.setAttribute('aria-label', `${v.name} · ${tagText}`);
  const cover = coverSvg(v, t.fill(L.cover, { s: v.shape.label, m: v.mono, c: v.colour.name.toLowerCase() }), letterSize(v.shape.id, emOf(v.mono)));
  const name = el('div', 'k-pc-name' + ([...v.name].length > 11 ? ' long' : ''), v.name), head = el('div', 'k-pc-music-head');
  name.setAttribute('role', 'heading'); name.setAttribute('aria-level', '3');
  head.append(name, el('p', 'k-pc-music-by', `${piece.client} · ${v.mood}`));
  const { grid, cells } = sequencer(v, t), foot = el('footer', 'k-pc-foot');
  foot.append(el('span', '', by), el('span', 'k-pc-brand', 'slashkern'));
  root.append(el('p', 'k-pc-tag', tagText), cover, head, grid, transport(root, v, t, cells, cover.querySelector('.k-pc-music-thump')!), foot);
  return root;
}

// As a picture: the cover as wide as the text (920), the name as big as fits in two lines, the mood, the grid with the speed beside it. The height follows the name: one line or two.
const CELL = 52, GAP = 10, GRID_H = 3 * CELL + 2 * GAP; // the squares of the grid in the picture
export async function img(v: V, by: string, t: T): Promise<Blob | null> {
  const d = await Draw.make(); if (!d) return null;
  const { W, M, TW } = d, C = v.colour.hex, top = 132, bottom = top + TW;
  let size = 120, lines = d.wrap(v.name, font(800, size), 9);
  while (lines.length > 2 && size > 64) { size -= 8; lines = d.wrap(v.name, font(800, size), 9); }
  lines = d.wrap(v.name, font(800, size), 2);
  const first = bottom + 40 + Math.round(size * 0.74), lh = Math.round(size * 1.02), byY = first + (lines.length - 1) * lh + 60, gridY = byY + 40;
  d.size(gridY + GRID_H + 44 + 134); d.fillAll(NAVY);
  d.put(t.tr(L.tag).toUpperCase(), font(600, 28), DIM, M, 98);
  d.fillRect(M, top, TW, TW, 46, C); d.strokeRect(M + 1.5, top + 1.5, TW - 3, TW - 3, 45, 'rgba(238, 242, 255, .2)', 3);
  d.x.globalAlpha = 0.35; d.strokeRect(M + TW * 0.04, top + TW * 0.04, TW * 0.92, TW * 0.92, TW * 0.03, readable(C), 3); d.x.globalAlpha = 1; // the hairline frame, as on screen
  const k = (TW * 0.78) / 100, sx = M + TW * 0.11, sy = top + TW * 0.11, F = letterSize(v.shape.id, emOf(v.mono, d.x)), ls = Math.round(F * k);
  d.x.globalAlpha = 0.22; d.path(v.shape.d, sx + 4 * k, sy + 4 * k, k, INK); d.x.globalAlpha = 1; // the misprint, as on screen
  d.path(v.shape.d, sx, sy, k, readable(C));
  d.put(v.mono, font(800, ls), C, M + TW / 2, sy + (50 + fitOf(v.shape.id).dy) * k + Math.round(ls * 0.35), 'center');
  d.lines(lines, font(800, size), BONE, M - 4, first, lh);
  d.put(`${piece.client} · ${v.mood}`.toUpperCase(), font(600, 30), DIM, M, byY);
  const rl = font(600, 26); d.x.font = rl;
  const labelW = Math.ceil(Math.max(...L.rows.map((r) => d.x.measureText(t.tr(r).toUpperCase()).width))) + 30;
  L.rows.forEach((row, r) => {
    const y = gridY + r * (CELL + GAP);
    d.put(t.tr(row).toUpperCase(), rl, DIM, M, y + CELL / 2 + 9);
    for (let s = 0; s < BEAT_STEPS; s++) {
      const x = M + labelW + s * (CELL + GAP);
      if (v.bits[r * BEAT_STEPS + s] === '1') d.fillRect(x, y, CELL, CELL, 13, C);
      else { d.fillRect(x, y, CELL, CELL, 13, 'rgba(238, 242, 255, .08)'); d.strokeRect(x + 1.5, y + 1.5, CELL - 3, CELL - 3, 12, 'rgba(238, 242, 255, .22)', 3); }
    }
  });
  d.put(String(BPM), font(800, 88), BONE, W - M, gridY + 94, 'right'); d.put('BPM', font(600, 28), DIM, W - M, gridY + 138, 'right');
  d.footer(by, BONE, NAVY);
  return d.blob();
}

export const kind: Kind = { piece, view, dom, img };
