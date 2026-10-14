import { t2 } from './i18n';
import { PLAY_DESIGN } from './play-design';
import { PLAY_WRITING } from './play-writing';
import { PLAY_CODE } from './play-code';
import { PLAY_VIDEO } from './play-video';
import { PLAY_SELLING } from './play-selling';
import { PLAY_MUSIC } from './play-music';
import { PLAY_PROMPTING } from './play-prompting';

// "Do it here": the first mission of every field can be done by tapping or dragging, not only by typing.
// The picks write a plain text summary into the answer box, so Submit, the compare, the reflection, sync and co-op keep working on text.
// pick: tap chips (up to max); `rest` also lists what was not picked ("Cut: ..."). sort: drag rows, or use the arrows, and tap ✕ to cut (up to cut);
// `sum` adds up the n of the rows kept (seconds) against a max. beat: a row of 8 steps per drum (items name the rows: kick, snare, hat) and Play to hear it.
// Sound files (public/media): a row's `a` gives it a ▶ to hear it; a pick's `hear` plays a reel (bed from 0, cues at their second) with the music
// coming in at the second picked, read from the item ("second 3"). Strings go through t2 so the Italian is in IT; code tokens and song names stay as they are.
type Hear = { bed: string; cues: [string, number][]; drop: string; len: number };
type Pick = { kind: 'pick'; label: string; out: string; max: number; items: string[]; rest?: string; hear?: Hear };
type Row = { t: string; n?: number; a?: string };
type Sort = { kind: 'sort'; label: string; out: string; cutOut: string; cut: number; items: Row[]; badge?: string; sum?: { label: string; max: number } };
type Beat = { kind: 'beat'; label: string; items: string[] };
export type Play = (Pick | Sort | Beat)[];

export const PLAY: Record<string, Play> = {
  ...PLAY_DESIGN, ...PLAY_WRITING, ...PLAY_CODE, ...PLAY_VIDEO, ...PLAY_SELLING, ...PLAY_MUSIC, ...PLAY_PROMPTING, // missions 2 to 6, one file per field
  'Design.0': [
    { kind: 'pick', label: t2('Tap 1 or 2 messages to keep: the rest are cut.', 'Tocca 1 o 2 messaggi da tenere: gli altri si tolgono.'), out: t2('Keep', 'Tengo'), rest: t2('Cut', 'Tolgo'), max: 2,
      items: [t2('Pizza night Saturday', 'Serata pizza sabato'), t2('2 for 1 until 9pm', '2x1 fino alle 21'), t2('Live DJ from 10', 'DJ dal vivo dalle 22'), t2('New menu', 'Nuovo menu'), t2('Win a year of pizza', 'Vinci un anno di pizza'), t2('Tag 3 friends', 'Tagga 3 amici'), t2('12 Via Verdi', 'Via Verdi 12')] }, // the dog is part of the photo, not a message: keeping it is the person's call
    { kind: 'pick', label: t2('Tap one colour for the words', 'Tocca un colore per le parole'), out: t2('Colour', 'Colore'), max: 1,
      items: [t2('Red on cream', 'Rosso su crema'), t2('Yellow on black', 'Giallo su nero'), t2('Blue on white', 'Blu su bianco'), t2('Green on bone', 'Verde su avorio')] },
  ],
  'Writing.0': [
    { kind: 'pick', label: t2('Tap up to 3 details a friend would ask about', 'Tocca fino a 3 dettagli su cui i tuoi amici farebbero domande'), out: t2('Details', 'Dettagli'), max: 3,
      items: [t2('She almost stayed home', 'Stava per restare a casa'), t2('Bag strap snapped on the bus', 'Tracolla rotta sul bus'), t2('First time lifting 40 kg', 'Prima volta con 40 kg'), t2('Feeling good', 'Mi sento bene'), '#gym #fitness'] },
  ],
  'Code.0': [
    { kind: 'pick', label: t2('Tap the word that is spelled wrong', 'Tocca la parola scritta male'), out: t2('Word spelled wrong', 'Parola scritta male'), max: 1,
      items: ['let', 'hoodiesLeft', '0', 'color', '"green"', 'if', '===', 'colour', '"red"', 'paintButton'] },
  ],
  'Video.0': [
    { kind: 'sort', label: t2('Tap ✕ on slow pieces, drag the best one to the top', 'Tocca ✕ sui pezzi lenti, trascina in cima il migliore'), out: t2('Keep', 'Tengo'), cutOut: t2('Cut', 'Tolgo'), cut: 5,
      sum: { label: t2('Total', 'Totale'), max: 6 },
      items: [ // the seconds of the real clip, public/media/tosta.mp4
        { t: t2('0-3s Rocco walks to the van', '0-3s Rocco cammina verso il furgone'), n: 3 },
        { t: t2('3-7s Reads the menu, waits', '3-7s Legge il menu, aspetta'), n: 4 },
        { t: t2('7-9s The sandwich press closes', '7-9s La piastra si chiude'), n: 2 },
        { t: t2('9-11s The cheese stretches long', '9-11s Il formaggio fila lunghissimo'), n: 2 },
        { t: t2('11-13s First bite, eyes wide', '11-13s Primo morso, occhi spalancati'), n: 2 },
        { t: t2('13-15s Walks off', '13-15s Se ne va'), n: 2 },
      ] },
  ],
  'Selling.0': [
    { kind: 'pick', label: t2('Tap up to 5 words a buyer would search for', 'Tocca fino a 5 parole che chi compra cercherebbe'), out: t2('Title', 'Titolo'), max: 5,
      items: [t2('Desk lamp', 'Lampada da scrivania'), t2('Black', 'Nera'), t2('Metal', 'In metallo'), t2('40 cm', '40 cm'), t2('Bulb included', 'Lampadina inclusa'), t2('Used', 'Usata'), t2('Cheap', 'Economica'), t2('Vintage', 'Vintage')] },
  ],
  'Music.0': [
    { kind: 'sort', label: t2('▶ to listen, ✕ to cut one, drag from calm to loud', '▶ per ascoltare, ✕ per toglierne una, trascina dalla più calma alla più forte'), out: t2('Order', 'Ordine'), cutOut: t2('Cut', 'Tolgo'), cut: 1, // no energy badge: the main version gives mood words only, the numbers live in Make it easier (easy.ts)
      items: [{ t: 'Mango Static', a: '/media/noa-mango.m4a' }, { t: 'Sad Trombone Tuesday', a: '/media/noa-trombone.m4a' }, { t: 'Pocket Sunrise', a: '/media/noa-sunrise.m4a' },
        { t: 'Confetti Cannon', a: '/media/noa-confetti.m4a' }, { t: 'Tile Floor Groove', a: '/media/noa-tile.m4a' }, { t: 'Last Bus Home', a: '/media/noa-bus.m4a' }] },
  ],
  'Prompting.0': [
    { kind: 'pick', label: t2('Tap the facts to put in your prompt (at least 3)', 'Tocca i fatti da mettere nel prompt (almeno 3)'), out: t2('Facts', 'Fatti'), max: 6,
      items: [t2('Saturdays at 10:00', 'Ogni sabato alle 10:00'), t2('6 seats', '6 posti'), t2('€35, clay included', '35 €, argilla inclusa'), t2('You take your bowl home', 'La ciotola la porti a casa'), t2('No experience needed', 'Non serve esperienza'), t2('Dana laughs at wobbly bowls', 'Dana ride delle ciotole storte')] },
    { kind: 'pick', label: t2('Tap who the post is for (pick 1)', 'Tocca per chi è il post (scegline 1)'), out: t2('Post for', 'Post per'), max: 1,
      items: [t2('People who never touched clay', 'Chi non ha mai toccato l’argilla'), t2('Expert potters', 'Ceramisti esperti'), t2('Everyone', 'Tutti'), t2('Families with kids', 'Famiglie con bambini')] },
    { kind: 'pick', label: t2('Tap 3 words for how Dana talks', 'Tocca 3 parole su come parla Dana'), out: t2('Tone', 'Tono'), max: 3,
      items: [t2('warm', 'calda'), t2('funny', 'divertente'), t2('relaxed', 'rilassata'), t2('formal', 'formale'), t2('hyped', 'carica'), t2('honest', 'sincera')] },
  ],
};

const UP = t2('Move up', 'Sposta su'), DOWN = t2('Move down', 'Sposta giù'), CUT = t2('Cut this', 'Togli'), BACK = t2('Put back', 'Rimetti');

// beat: Play loops the 8 steps 4 times (4 bars) in eighth notes at 100 BPM. The drums are made on the spot with the Web Audio API, no sound files.
// One AudioContext for the page, made on the first tap on Play (iOS allows sound only from a tap). Hits are booked on the audio clock a little
// ahead (AHEAD_S), so a busy page cannot make the beat stumble; a step tapped while it plays joins on its next turn.
const STEPS = 8, BARS = 4, STEP_S = 60 / 100 / 2, AHEAD_S = 0.1;
const PLAY_L = t2('Play', 'Suona'), STOP_L = t2('Stop', 'Ferma'), STEP_L = t2('step', 'passo');
let ac: AudioContext | null = null, hiss: AudioBuffer | null = null, halt = () => {};
// Stops the beat that is playing: Stop, the next mission, and app.ts when the mission sheet closes or the page is hidden.
export const stopPlay = () => halt();
const audio = () => {
  if (!ac) {
    const as = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
    if (as) as.type = 'playback'; // iOS 17+: heard with the silent switch on, like a video, or Play would seem broken
    ac = new AudioContext(); hiss = ac.createBuffer(1, ac.sampleRate, ac.sampleRate); // a second of white noise for the snare and the hat
    const d = hiss.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return ac;
};
// One hit: src, through `last`, into a gain that falls from vol to silence in len seconds.
const hit = (src: AudioScheduledSourceNode, last: AudioNode, out: AudioNode, t: number, vol: number, len: number) => {
  const g = out.context.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + len);
  last.connect(g).connect(out); src.start(t); src.stop(t + len);
};
const tone = (out: AudioNode, t: number, type: OscillatorType, hz: number, to: number, vol: number, len: number) => {
  const o = out.context.createOscillator(); o.type = type; o.frequency.setValueAtTime(hz, t); o.frequency.exponentialRampToValueAtTime(to, t + len / 3);
  hit(o, o, out, t, vol, len);
};
const noise = (out: AudioNode, t: number, type: BiquadFilterType, hz: number, vol: number, len: number) => {
  const s = out.context.createBufferSource(), f = out.context.createBiquadFilter(); s.buffer = hiss; f.type = type; f.frequency.value = hz;
  hit(s, s.connect(f), out, t, vol, len);
};
const DRUMS = [ // one per row, in the order of the rows
  (out: AudioNode, t: number) => tone(out, t, 'sine', 150, 40, 1, 0.4), // kick: a sine whose pitch drops fast
  (out: AudioNode, t: number) => { noise(out, t, 'bandpass', 1800, 0.8, 0.18); tone(out, t, 'triangle', 200, 160, 0.3, 0.1); }, // snare: a short burst of noise and a little tone
  (out: AudioNode, t: number) => noise(out, t, 'highpass', 7000, 0.35, 0.05), // hat: a very short hiss, highs only
];

// Sound files are decoded once into the same AudioContext and booked on its clock, so a cue lands on its second.
// Not cached for offline (the service worker leaves /media/ to the network): offline, the button just goes back to ▶.
const HEAR_L = t2('Hear it', 'Ascolta'), CREDIT = t2('Sounds made with AI for slashkern. Fictional.', 'Suoni creati con l’AI per slashkern. Inventati.');
const bufs = new Map<string, Promise<AudioBuffer>>();
const load = (c: AudioContext, src: string) => {
  if (!bufs.has(src)) bufs.set(src, fetch(src).then((r) => { if (!r.ok) throw new Error(`${r.status}`); return r.arrayBuffer(); }).then((b) => c.decodeAudioData(b)).catch((e) => { bufs.delete(src); throw e; }));
  return bufs.get(src)!;
};
// Plays [file, second] pairs for len seconds with a short fade at the end; done() puts the button back. One sound at a time: it stops the one before.
const playFiles = (parts: [string, number][], len: number, done: () => void) => {
  halt();
  const c = audio(), out = c.createGain(), srcs: AudioBufferSourceNode[] = [];
  void c.resume(); out.connect(c.destination);
  let timer = 0;
  const stop = () => { clearTimeout(timer); srcs.forEach((s) => { try { s.stop(); } catch { /* older Safari: already stopped */ } }); out.disconnect(); done(); halt = () => {}; };
  halt = stop;
  Promise.all(parts.map(([src]) => load(c, src))).then((list) => {
    if (halt !== stop) return; // stopped while loading
    const t0 = c.currentTime + 0.05;
    out.gain.setValueAtTime(1, t0 + len - 0.3); out.gain.linearRampToValueAtTime(0, t0 + len);
    list.forEach((b, i) => { const s = c.createBufferSource(); s.buffer = b; s.connect(out); s.start(t0 + parts[i][1]); s.stop(t0 + len); srcs.push(s); });
    timer = window.setTimeout(() => { if (halt === stop) halt(); }, (len + 0.2) * 1000);
  }).catch(() => { if (halt === stop) halt(); });
};

// Draws the groups into host and calls change(summary) after every pick, cut, move or step. The host is emptied on the next mission, and a beat stops.
export function renderPlay(host: HTMLElement, play: Play, tr: (s: string) => string, change: (text: string) => void) {
  halt();
  host.innerHTML = '';
  const parts: (() => string)[] = [];
  const emit = () => change(parts.map((p) => p()).filter(Boolean).join('\n'));
  for (const g of play) {
    const box = document.createElement('div'); box.className = 'k-pl-g';
    const lab = document.createElement('div'); lab.className = 'k-l k-s'; lab.textContent = tr(g.label); box.append(lab);
    if (g.kind === 'pick') {
      const row = document.createElement('div'); row.className = 'k-pl-chips'; row.setAttribute('role', 'group'); row.setAttribute('aria-label', tr(g.label));
      const chosen: string[] = []; // in tap order: the title words come out in the order they were picked
      g.items.forEach((it) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'k-pl-chip'; b.textContent = tr(it); b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', () => {
          const i = chosen.indexOf(it);
          if (i >= 0) chosen.splice(i, 1);
          else { if (chosen.length >= g.max) chosen.splice(0, 1); chosen.push(it); } // one too many drops the oldest pick, like a radio when max is 1
          row.querySelectorAll<HTMLButtonElement>('button').forEach((x, k) => x.setAttribute('aria-pressed', String(chosen.includes(g.items[k]))));
          emit();
        });
        row.append(b);
      });
      box.append(row);
      if (g.hear && 'AudioContext' in window) {
        const h = g.hear, hb = document.createElement('button'); hb.type = 'button'; hb.className = 'k-chipb k-pl-play';
        let on = false;
        const show = (p: boolean) => { on = p; hb.innerHTML = `<span aria-hidden="true">${p ? '■' : '▶'}</span> ${tr(p ? STOP_L : HEAR_L)}`; };
        hb.addEventListener('click', () => {
          if (on) return halt();
          const at = Number(/\d+/.exec(chosen[0] ?? '')?.[0]); // nothing picked yet: the reel plays without the music
          show(true);
          playFiles([[h.bed, 0], ...h.cues, ...(Number.isFinite(at) ? [[h.drop, at] as [string, number]] : [])], h.len, () => show(false));
        });
        show(false); box.append(hb);
      }
      parts.push(() => (chosen.length ? `${tr(g.out)}: ${chosen.map(tr).join(', ')}.` + (g.rest ? ` ${tr(g.rest)}: ${g.items.filter((x) => !chosen.includes(x)).map(tr).join(', ')}.` : '') : ''));
    } else if (g.kind === 'beat') {
      const on = g.items.map(() => Array<boolean>(STEPS).fill(false));
      const grid = document.createElement('div'); grid.className = 'k-pl-beat'; grid.setAttribute('role', 'group'); grid.setAttribute('aria-label', tr(g.label));
      g.items.forEach((name, r) => {
        const lab = document.createElement('div'); lab.className = 'k-l'; lab.textContent = tr(name); lab.setAttribute('aria-hidden', 'true'); // every step says its row
        const row = document.createElement('div'); row.className = 'k-pl-steps';
        for (let s = 0; s < STEPS; s++) {
          const b = document.createElement('button'); b.type = 'button'; b.className = 'k-pl-step'; b.dataset.s = String(s); b.innerHTML = `<i>${s + 1}</i>`;
          b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', `${tr(name)}, ${tr(STEP_L)} ${s + 1}`);
          b.addEventListener('click', () => { on[r][s] = !on[r][s]; b.setAttribute('aria-pressed', String(on[r][s])); emit(); });
          row.append(b);
        }
        grid.append(lab, row);
      });
      const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'k-chipb k-pl-play';
      let playing = false;
      const show = (p: boolean) => { playing = p; btn.innerHTML = `<span aria-hidden="true">${p ? '■' : '▶'}</span> ${tr(p ? STOP_L : PLAY_L)}`; };
      const paint = (s: number) => grid.querySelectorAll<HTMLElement>('.k-pl-step').forEach((b) => b.classList.toggle('now', b.dataset.s === String(s)));
      const start = () => {
        const c = audio(), out = c.createGain(), t0 = c.currentTime + 0.05, end = STEPS * BARS;
        void c.resume(); // a new context, or one put to sleep by Stop or a phone call, wakes on this tap
        out.gain.value = 0.7; out.connect(c.destination); // headroom for a kick and a hat on the same step
        let k = 0;
        const timer = window.setInterval(() => {
          const now = c.currentTime;
          for (; k < end && t0 + k * STEP_S < now + AHEAD_S; k++) on.forEach((steps, r) => { if (steps[k % STEPS]) DRUMS[r](out, t0 + k * STEP_S); });
          const at = Math.floor((now - t0) / STEP_S);
          paint(at < end ? at % STEPS : -1);
          if (at >= end + 2) halt(); // two steps after the last one, so its hit rings out
        }, 25);
        halt = () => { clearInterval(timer); out.disconnect(); paint(-1); show(false); halt = () => {}; void c.suspend(); };
        show(true);
      };
      show(false);
      btn.addEventListener('click', () => (playing ? halt() : start()));
      box.append(grid);
      if ('AudioContext' in window) box.append(btn); // without Web Audio the grid still writes the answer
      parts.push(() => (on.some((steps) => steps.includes(true)) ? g.items.map((name, r) => `${tr(name)}: ${on[r].map((x) => (x ? 'X' : '.')).join(' ')}`).join('\n') : ''));
    } else {
      const list = document.createElement('ol'); list.className = 'k-pl-sort';
      const order = g.items.map((_, i) => i), cut = new Set<number>();
      let touched = false;
      const sumEl = g.sum ? document.createElement('p') : null;
      const kept = () => order.filter((i) => !cut.has(i));
      const total = () => kept().reduce((s, i) => s + (g.items[i].n || 0), 0);
      const move = (from: number, to: number) => { if (to < 0 || to >= order.length) return; const [x] = order.splice(from, 1); order.splice(to, 0, x); touched = true; paint(); emit(); };
      // Drag by the grip: the row follows the finger, and drops where it passes the middle of a neighbour.
      const drag = (e: PointerEvent, li: HTMLElement) => {
        e.preventDefault(); li.classList.add('lift');
        const startY = e.clientY, from = order.indexOf(Number(li.dataset.i));
        const mids = ([...list.children] as HTMLElement[]).map((r) => r.getBoundingClientRect().top + r.offsetHeight / 2);
        let to = from;
        const onMove = (ev: PointerEvent) => {
          const dy = ev.clientY - startY, y = mids[from] + dy; li.style.transform = `translateY(${dy}px)`;
          to = Math.max(0, Math.min(order.length - 1, mids.filter((m, k) => k !== from && m < y).length));
        };
        const onUp = () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); li.style.transform = ''; li.classList.remove('lift'); if (to !== from) move(from, to); };
        window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp);
      };
      const paint = () => {
        list.innerHTML = '';
        order.forEach((idx, pos) => {
          const it = g.items[idx], li = document.createElement('li');
          li.className = cut.has(idx) ? 'cut' : ''; li.dataset.i = String(idx);
          const grip = document.createElement('span'); grip.className = 'k-pl-grip'; grip.setAttribute('aria-hidden', 'true');
          const txt = document.createElement('span'); txt.className = 'k-pl-t'; txt.textContent = tr(it.t);
          if (g.badge && it.n !== undefined) { const bd = document.createElement('small'); bd.textContent = `${tr(g.badge)} ${it.n}`; txt.append(' ', bd); }
          const btn = (cls: string, label: string, text: string, on: () => void, off = false) => { const b = document.createElement('button'); b.type = 'button'; b.className = cls; b.textContent = text; b.setAttribute('aria-label', `${tr(label)}: ${tr(it.t)}`); b.disabled = off; b.addEventListener('click', on); return b; };
          li.append(grip);
          if (it.a && 'AudioContext' in window) { // the ▶ goes back when the clip ends, Stop is tapped, or another sound starts
            const src = it.a, ear = btn('k-pl-mv k-pl-ear', HEAR_L, '▶', () => { if (ear.textContent === '■') return halt(); ear.textContent = '■'; playFiles([[src, 0]], 8, () => { ear.textContent = '▶'; }); });
            li.append(ear);
          }
          li.append(txt,
            btn('k-pl-mv', UP, '↑', () => move(pos, pos - 1), pos === 0),
            btn('k-pl-mv', DOWN, '↓', () => move(pos, pos + 1), pos === order.length - 1),
            btn('k-pl-x', cut.has(idx) ? BACK : CUT, cut.has(idx) ? '↺' : '✕', () => { if (cut.has(idx)) cut.delete(idx); else { if (cut.size >= g.cut) cut.delete([...cut][0]); cut.add(idx); } touched = true; paint(); emit(); }));
          grip.addEventListener('pointerdown', (e) => drag(e, li));
          list.append(li);
        });
        if (sumEl && g.sum) { sumEl.className = `k-pl-sum${total() > g.sum.max ? ' over' : ''}`; sumEl.textContent = `${tr(g.sum.label)}: ${total()}s / ${g.sum.max}s`; }
      };
      paint();
      box.append(list); if (sumEl) box.append(sumEl);
      parts.push(() => {
        if (!touched) return '';
        const gone = [...cut].map((i) => tr(g.items[i].t));
        return `${gone.length ? `${tr(g.cutOut)}: ${gone.join(', ')}. ` : ''}${tr(g.out)}: ${kept().map((i) => tr(g.items[i].t)).join(', ')}.${g.sum ? ` ${tr(g.sum.label)}: ${total()}s.` : ''}`;
      });
    }
    if ((g.kind === 'pick' && g.hear) || (g.kind === 'sort' && g.items.some((r) => r.a))) { // sound files say they are made with AI (design/mission-media.md)
      const cr = document.createElement('p'); cr.className = 'k-l k-s'; cr.textContent = tr(CREDIT); box.append(cr);
    }
    host.append(box);
  }
}
