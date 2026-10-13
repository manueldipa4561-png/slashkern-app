import { t2 } from './i18n';
import { cleanAi, cleanName, inTime } from './valid';
import { PIECE_AT, keep, stepOk, type Kind, type Piece, type Run } from './piece-types';
import * as brand from './piece-brand';
import * as writing from './piece-writing';
import * as code from './piece-code';
import * as video from './piece-video';
import * as selling from './piece-selling';
import * as music from './piece-music';
import * as prompting from './piece-prompting';

// Pieces: a longer project than the 3-step ones. A few small steps (taps, a beat, a short line) end in ONE page of the person's own: a brand sheet, a launch kit, a web page, a storyboard,
// a listing, a release, a prompt and what the AI made of it. Nothing on it is generated behind their back, and the page says how it was made. One piece per field for the pilot.
// piece-types.ts holds what every piece is made of, piece-<name>.ts is one piece, this file lists them, cleans what is stored, and makes and reads share links.
// Append only: a saved run points at its piece by n, so never reorder a piece or reuse a number. Every company here is fictional and the page says so.
export * from './piece-types';

// A field whose piece is not written yet has no piece (its module exports undefined).
export const KINDS: Kind[] = [brand.kind, writing.kind, code.kind, video.kind, selling.kind, music.kind, prompting.kind].filter((k): k is Kind => !!k);
export const PIECES: Piece[] = KINDS.map((k) => k.piece);
export const kindOf = (p: Piece) => KINDS.find((k) => k.piece === p)!;
export const pieceOf = (r: { f: string; i: number }) => PIECES.find((p) => p.f === r.f && PIECE_AT + p.n === r.i);
export const pieceFor = (f: string) => PIECES.find((p) => p.f === f);

// The words around a piece: the card on Projects, the steps, the proof. In one place so their translations are checked with the rest (scripts/check-content.mjs). The words on the page
// itself (the labels of a brand sheet, a storyboard...) are in each piece's module.
export const PL = {
  card: t2('A piece for your page', 'Un pezzo per la tua pagina'),
  meta: t2('{n} small steps · about {m} min', '{n} piccoli passi · circa {m} min'),
  start: t2('Start', 'Inizia'),
  again: t2('Make it again', 'Rifallo'),
  see: t2('See your piece', 'Vedi il tuo pezzo'),
  progress: t2('{k} of {n} steps done', '{k} passi su {n} fatti'),
  madeOn: t2('Made {d}', 'Fatto il {d}'),
  step: t2('Step {n} of {all}', 'Passo {n} di {all}'),
  picked: t2('{k} of {n} picked', '{k} su {n} scelti'),
  words: t2('{w} of {max} words', '{w} parole su {max}'),
  fewer: t2('Try {n} words or fewer.', 'Prova con {n} parole al massimo.'),
  last: t2('See my piece', 'Vedi il mio pezzo'),
  ready: t2('Your piece is ready', 'Il tuo pezzo è pronto'),
  save: t2('Save as image', 'Salva come immagine'),
  saved: t2('Image saved.', 'Immagine salvata.'),
  how: t2('How it was made', 'Come è nato'),
  span: t2('Started {a} · finished {b}', 'Iniziato {a} · finito {b}'),
  yours: t2('Every choice on this page was picked or written by you.', 'Ogni scelta in questa pagina l’hai scelta o scritta tu.'),
  asked: t2('Questions from Slash on the way: {n}. Slash wrote nothing.', 'Domande di Slash lungo il percorso: {n}. Slash non ha scritto niente.'),
  noAi: t2('No AI wrote any of it.', 'Nessuna AI ha scritto niente.'),
  ai: t2('Made with AI help', 'Creato con l’aiuto dell’AI'), // the same tag as everywhere (app.ts AI_TAG)
  aiPart: t2('The AI wrote only the part marked “AI”, from the prompt you sent. The rest is yours.', 'L’AI ha scritto solo la parte segnata “AI”, dal prompt che hai mandato. Il resto è tuo.'),
  done: t2('Done', 'Fatto'),
  del: t2('Delete this piece', 'Elimina questo pezzo'),
  gone: t2('Piece deleted.', 'Pezzo eliminato.'),
  list: t2('Your pieces', 'I tuoi pezzi'),
  going: t2('In progress · {k} of {n} steps', 'In corso · {k} passi su {n}'),
  by: t2('Made by {n} · {d}', 'Fatto da {n} · {d}'),
  on: t2('Made on slashkern · {d}', 'Fatto su slashkern · {d}'),
  link: t2('Copy link', 'Copia link'), // the same Italian as the existing 'Copy link'
  linkNote: t2('Anyone with the link sees this page and the name on it.', 'Chiunque abbia il link vede questa pagina e il nome che c’è sopra.'),
  linkText: t2('My piece “{t}”, made on slashkern.', 'Il mio pezzo “{t}”, fatto su slashkern.'),
  nameL: t2('Name on your page (optional)', 'Nome sulla tua pagina (facoltativo)'),
  theirs: t2('Every choice on this page was picked or written by whoever made it.', 'Ogni scelta in questa pagina l’ha scelta o scritta chi l’ha fatta.'),
  cta: t2('Make your own on slashkern', 'Fai il tuo su slashkern'),
  shared: t2('Shared by link. slashkern did not check what it says.', 'Condiviso con un link. slashkern non ha controllato cosa dice.'),
  bad: t2('This link does not work.', 'Questo link non funziona.'),
  kick: t2('Kick', 'Cassa'),
  snare: t2('Snare', 'Rullante'),
  hat: t2('Hat', 'Hi-hat'), // the same Italian as the beat in play-music.ts
  play: t2('Play', 'Suona'), // the same Italian as the beat in play.ts
  stop: t2('Stop', 'Ferma'),
  hits: t2('{k} hits · at least {n}', '{k} colpi · almeno {n}'),
  runGo: t2('Send it to the AI', 'Mandalo all’AI'),
  runAgain: t2('Try again', 'Riprova'),
  runWait: t2('The AI is working on it…', 'L’AI ci sta pensando…'),
  runNote: t2('Sends only this prompt to the AI. What it makes is kept on your page, marked as AI.', 'Manda all’AI solo questo prompt. Quello che crea resta nella tua pagina, segnato come AI.'),
  runFail: t2('The AI is not reachable right now. You can skip this step.', 'L’AI non è raggiungibile in questo momento. Puoi saltare questo passo.'),
  runDay: t2('That is enough tries for today. You can skip this step.', 'Per oggi i tentativi bastano. Puoi saltare questo passo.'),
  skip: t2('Skip this step', 'Salta questo passo'),
  made: t2('What the AI made', 'Cosa ha creato l’AI'),
  prompt: t2('Your prompt', 'Il tuo prompt'),
};

// A stored or synced run is untrusted input: keep only well-formed values, and only the steps whose answers are valid in a row (done needs all of them).
export function cleanRun(v: unknown): Run | null {
  if (!v || typeof v !== 'object') return null;
  const x = v as Record<string, unknown>, p = typeof x.f === 'string' && Number.isInteger(x.i) ? pieceOf({ f: x.f, i: x.i as number }) : undefined;
  if (!p || !inTime(x.at) || !Array.isArray(x.s)) return null;
  const s: string[] = [];
  for (let k = 0; k < p.steps.length; k++) { const a = x.s[k]; if (typeof a !== 'string' || !stepOk(p.steps[k], a)) break; s.push(keep(p.steps[k], a)); }
  return { f: p.f, i: PIECE_AT + p.n, at: x.at, ed: inTime(x.ed) ? x.ed : undefined, ai: cleanAi(x.ai), s, done: s.length === p.steps.length && inTime(x.done) ? x.done : undefined, q: Number.isInteger(x.q) && (x.q as number) > 0 ? Math.min(x.q as number, 99) : undefined };
}
export const cleanRuns = (v: unknown): Run[] => (Array.isArray(v) ? v.map(cleanRun).filter((r): r is Run => !!r).slice(-20) : []);
// The run a piece shows: the newest one (a second device may have started another).
export const latestRun = (runs: readonly Run[], p: Piece): Run | undefined => runs.filter((r) => r.f === p.f && r.i === PIECE_AT + p.n).sort((a, b) => b.at - a.at)[0];

// A link to one finished piece, to put on a CV or send in a message: its picks and line, the name on it and when it was made, as URL-safe base64 after the # (so it never reaches a
// server). Anyone with the link sees the page, which says it was shared by link and not checked. A link is read like stored data: untrusted, cleaned by cleanRun, finished pieces only.
export const LINK_MAX = 3200; // characters of data a link may carry (a prompt and what the AI made of it are the longest)
const toB64 = (s: string) => btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64 = (b: string) => new TextDecoder().decode(Uint8Array.from(atob(b.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0)));
export const pieceLink = (origin: string, r: Run, name: string) => `${origin}/p/#${toB64(JSON.stringify({ v: 1, f: r.f, i: r.i, at: r.at, s: r.s, done: r.done, q: r.q, ai: r.ai, n: cleanName(name).trim() }))}`;
export type Shared = { run: Run; name: string };
export function readPieceLink(hash: string): Shared | null {
  const m = /^#?([A-Za-z0-9_-]+)$/.exec(hash.trim());
  if (!m || m[1].length > LINK_MAX) return null;
  try {
    const o = JSON.parse(fromB64(m[1])), run = o && o.v === 1 ? cleanRun(o) : null;
    return run?.done ? { run, name: cleanName(o.n).trim() } : null;
  } catch { return null; }
}
