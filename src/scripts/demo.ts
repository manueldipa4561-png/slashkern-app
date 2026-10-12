// Sample trail for the demo profile (open /?demo, leave with /?demo=off). Every text is a pair [English, Italian]: app.ts picks one by
// language, and a language switch inside the demo swaps the texts nobody edited (swapSample), so the trail never reads half in each language.
import { FIELDS } from './fields';

export type Pair = [string, string];
// ago: days ago. x and d: the extra stones and the drop that came with the answer (a relic id puts it in Finds).
type Seed = { f: string; i: number; ago: number; e: 'flow' | 'ok' | 'drag'; again: 'yes' | 'maybe' | 'no'; t: Pair; hard?: Pair; tip?: Pair; x?: number; d?: string };

export const SAMPLE_ANSWERS: Seed[] = [
  { f: 'Design', i: 0, ago: 16, e: 'flow', again: 'yes', x: 25, d: 'spark',
    t: ['Keep one thing: “Saturday · 2 for 1 pizza till 9”. Cut the DJ, the new menu, the contest and the dog. One colour: red letters on cream. Big words in the middle, a tiny “Pomo Pizza” at the bottom.', 'Ne tengo una sola: “Sabato · 2x1 fino alle 21”. Taglio DJ, menu nuovo, concorso e cane. Un solo colore: lettere rosse su crema. Parole grandi al centro, “Pomo Pizza” piccolo in basso.'],
    hard: ['Deleting things I liked', 'Togliere cose che mi piacevano'], tip: ['Pick the one word people must remember, then cut the rest.', 'Scegli la parola da ricordare, poi taglia il resto.'] },
  { f: 'Design', i: 1, ago: 15, e: 'flow', again: 'yes', x: 18, d: 'compass',
    t: ['A round sticker with a fig leaf and “Bar Ficus” on one curved line, dark green on white so it reads on the glass door from three metres.', 'Un adesivo tondo con una foglia di fico e “Bar Ficus” su una riga curva, verde scuro su bianco: si legge sul vetro della porta da tre metri.'],
    hard: ['Keeping it simple', 'Restare semplice'] },
  { f: 'Design', i: 2, ago: 8, e: 'ok', again: 'yes', x: 40, d: 'gem',
    t: ['Feeling: a slow Sunday morning. Six pictures: warm light on a wall, linen, one green plant, a low wooden table, a worn rug, a mug. No people.', 'Sensazione: una domenica mattina lenta. Sei immagini: luce calda su un muro, lino, una pianta verde, un tavolo basso di legno, un tappeto consumato, una tazza. Nessuna persona.'] },
  { f: 'Writing', i: 0, ago: 6, e: 'flow', again: 'maybe', x: 15, d: 'spark',
    t: ['Missed my train for this mirror. Worth it? One word.', 'Ho perso il treno per questo specchio. Ne è valsa la pena? Una parola.'],
    hard: ['Sounding natural', 'Suonare naturale'] },
  { f: 'Writing', i: 1, ago: 2, e: 'ok', again: 'yes', x: 12, d: 'lantern',
    t: ['Leo, your streak misses you. Two minutes today?', 'Leo, la tua serie ti aspetta. Due minuti oggi?'] },
  { f: 'Video', i: 0, ago: 1, e: 'flow', again: 'yes',
    t: ['Open on the cheese pull at 0:00, then cut to the van. The walk to the van goes at the end, or it goes.', 'Apro sul filo di formaggio a 0:00, poi stacco sul furgone. La camminata verso il furgone va in fondo, o sparisce.'] },
];

// Three versions of one idea with Slash, each clearer than the last: they unlock the compare view and the "Do it twice" badge.
export const SAMPLE_IDEA: Pair[] = [
  ['A poster for Friday’s flat dinner.', 'Un poster per la cena di venerdì in casa.'],
  ['A poster for Friday’s flat dinner, with one big word on it.', 'Un poster per la cena di venerdì in casa, con sopra una sola parola grande.'],
  ['One big word, red letters on cream paper and a tiny drawn fork.', 'Una sola parola grande, lettere rosse su carta crema e una piccola forchetta disegnata.'],
];

const pick = (p: Pair, it: boolean) => p[it ? 1 : 0];
export const sampleAnswers = (it: boolean, now: number) => SAMPLE_ANSWERS.map((s) => ({
  f: s.f, i: s.i, t: pick(s.t, it), at: now - s.ago * 864e5, x: s.x, d: s.d,
  r: { e: s.e, again: s.again, ...(s.hard ? { hard: pick(s.hard, it) } : {}), ...(s.tip ? { tip: pick(s.tip, it) } : {}) },
}));
export const sampleMine = (it: boolean) => SAMPLE_IDEA.map((p) => pick(p, it));
// The chat after the opening question: each version of the idea, then the assistant's question about it (English keys, translated when shown).
export const sampleChat = (it: boolean): { who: 'ai' | 'me'; t: string }[] => [
  { who: 'me', t: pick(SAMPLE_IDEA[0], it) }, { who: 'ai', t: FIELDS.Design.qs[0] },
  { who: 'me', t: pick(SAMPLE_IDEA[1], it) }, { who: 'ai', t: FIELDS.Design.qs[1] },
  { who: 'me', t: pick(SAMPLE_IDEA[2], it) }, { who: 'ai', t: 'You wrote it 3 times and each version changed. That is your evidence. Compare the first and the last.' },
];
// The same text in the other language, if `cur` is still the untouched sample text of `pair`. Anything else (a visitor's own words) stays.
export const swapSample = (cur: string, pair: Pair | undefined, toIt: boolean): string => (pair && cur === pair[toIt ? 0 : 1] ? pair[toIt ? 1 : 0] : cur);
