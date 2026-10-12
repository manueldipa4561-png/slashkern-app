import { t2 } from './i18n';

// First projects (v10, income-first): the three small briefs the first run offers, and the path names on Home.
// They are free practice projects: no price, no payment, nothing implied (no company exists yet and nobody is paying).
// Each starter points at an existing mission (field + index in fields.ts / missions.ts), so its brief, steps, material and example answer are the ones the mission sheet uses.
export type Starter = { f: string; i: number; label: string; line: string; intro: string }; // intro: the brief in two short sentences, shown behind "See the brief" on the first run
export const FIRST_BRIEFS: Starter[] = [
  { f: 'Video', i: 0, label: t2('15 s video', 'Video da 15 s'), line: t2('Cut a sandwich-van clip down to its best seconds.', 'Taglia la clip di un furgone di panini ai suoi secondi migliori.'), intro: t2('Rocco’s 15-second clip starts slowly. Keep the best 6 seconds, best moment first.', 'La clip di 15 secondi di Rocco parte piano. Tieni i 6 secondi migliori, il momento migliore per primo.') },
  { f: 'Writing', i: 1, label: t2('Short text', 'Testo breve'), line: t2('Write one kind message that brings an app user back.', 'Scrivi un messaggio gentile che riporta indietro chi usa un’app.'), intro: t2('Leo has not opened his language app in 3 days. Write the kind message that brings him back.', 'Leo non apre la sua app di lingue da 3 giorni. Scrivi il messaggio gentile che lo riporta indietro.') },
  { f: 'Design', i: 1, label: t2('Sticker idea', 'Idea per un adesivo'), line: t2('Describe a round sticker for a bar’s glass door.', 'Descrivi un adesivo rotondo per la porta a vetri di un bar.'), intro: t2('Bar Ficus wants a round sticker for its glass door. Describe one picture, 2 colours and a short line.', 'Bar Ficus vuole un adesivo rotondo per la porta a vetri. Descrivi un’immagine, 2 colori e una riga breve.') },
];
// Get found opens after this many finished projects.
export const FOUND_AT = 2;
