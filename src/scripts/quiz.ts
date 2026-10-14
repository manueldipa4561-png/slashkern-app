// The maker quiz: the first thing a new person does (first run, after the welcome). Five questions, seven answers each, one tap per question.
// Every answer IS one real project: { t: [English, Italian], type, i } where i is the mission index in that field (missions.ts order). Each question has all
// seven types once and no project repeats (35 of the 42). German, French, Dutch and Swedish live in the i18n-xx.ts maps, keyed by the English text.
// This file is the source of truth: the website quiz (yourkern-site, src/i18n/en.ts and it.ts) copies these texts, types and indices in the same order.
// Free of DOM code and imports so npm test can check it (scripts/check-quiz.mjs). The answers stay on the device (app.ts keeps them out of the account copy).
export type QType = 'video' | 'poster' | 'posts' | 'web' | 'listing' | 'music' | 'prompt';
export const QFIELD: Record<QType, string> = { video: 'Video', poster: 'Design', posts: 'Writing', web: 'Code', listing: 'Selling', music: 'Music', prompt: 'Prompting' };
type T = [en: string, it: string];
export type QAnswer = { t: T; type: QType; i: number };
const a = (en: string, it: string, type: QType, i: number): QAnswer => ({ t: [en, it], type, i });

export const QUIZ: { q: T; a: QAnswer[] }[] = [
  { q: ['A friend’s small shop needs help. You offer to…', 'Il piccolo negozio di un amico ha bisogno di aiuto. Ti offri di…'], a: [
    a('Cut their slow clip to the best seconds.', 'Tagliare la sua clip lenta tenendo i secondi migliori.', 'video', 0),
    a('Design a sticker for their door.', 'Disegnare un adesivo per la sua porta.', 'poster', 1),
    a('Rewrite their bio so it sounds like them.', 'Riscrivere la sua bio perché gli somigli.', 'posts', 3),
    a('Fix the Buy button that’s broken.', 'Sistemare il pulsante Compra che non va.', 'web', 0),
    a('Rewrite the ad nobody answers.', 'Riscrivere l’annuncio a cui nessuno risponde.', 'listing', 0),
    a('Pick the music for their video.', 'Scegliere la musica per il suo video.', 'music', 1),
    a('Get AI to write their post, with real facts.', 'Far scrivere all’AI il suo post, con fatti veri.', 'prompt', 0),
  ] },
  { q: ['Your group chat needs you. You…', 'La chat di gruppo ha bisogno di te. Tu…'], a: [
    a('Fix the party playlist.', 'Sistemi la playlist della festa.', 'music', 0),
    a('Get AI to plan the birthday dinner.', 'Fai organizzare all’AI la cena di compleanno.', 'prompt', 2),
    a('Film a 10-second prank about the missing speaker.', 'Giri uno scherzo di 10 secondi sulla cassa sparita.', 'video', 1),
    a('Pick 6 pictures for a friend’s new room.', 'Scegli 6 immagini per la nuova stanza di un’amica.', 'poster', 2),
    a('Write the birthday message three ways.', 'Scrivi gli auguri in tre modi.', 'posts', 2),
    a('Find the loophole in the group’s rule.', 'Trovi la scappatoia nella regola del gruppo.', 'web', 2),
    a('Sell your old jacket without dropping the price.', 'Vendi la tua vecchia giacca senza abbassare il prezzo.', 'listing', 2),
  ] },
  { q: ['Something online is broken. What do you fix first?', 'Qualcosa online non funziona. Cosa sistemi per primo?'], a: [
    a('A rude comment that needs a calm reply.', 'Un commento maleducato che chiede una risposta calma.', 'posts', 4),
    a('A discount that makes things cost more.', 'Uno sconto che fa pagare di più.', 'web', 3),
    a('A buyer who went quiet after “still available?”', 'Un compratore sparito dopo “è ancora disponibile?”', 'listing', 5),
    a('A playlist name nobody taps.', 'Una playlist dal nome che nessuno apre.', 'music', 3),
    a('An AI that makes up answers.', 'Un’AI che si inventa le risposte.', 'prompt', 3),
    a('Subtitles too tiny to read.', 'Sottotitoli troppo piccoli da leggere.', 'video', 3),
    a('A dark photo of great sneakers.', 'Una foto buia di sneaker bellissime.', 'poster', 3),
  ] },
  { q: ['What would you be proudest to show?', 'Cosa mostreresti con più orgoglio?'], a: [
    a('A poll that showed what people would buy.', 'Un sondaggio che ha svelato cosa la gente comprerebbe.', 'listing', 4),
    a('A beat a gym uses in its videos.', 'Un ritmo che una palestra usa nei suoi video.', 'music', 4),
    a('An AI quiz that helped a friend study.', 'Un quiz con l’AI che ha aiutato un’amica a studiare.', 'prompt', 1),
    a('A 20-second interview that made people laugh.', 'Un’intervista di 20 secondi che ha fatto ridere tutti.', 'video', 2),
    a('The thumbnail that got the most taps.', 'La miniatura aperta da più persone.', 'poster', 5),
    a('The name of a new gelato flavour.', 'Il nome di un nuovo gusto di gelato.', 'posts', 5),
    a('An auto-reply that answers “price?”', 'Una risposta automatica a “prezzo?”', 'web', 4),
  ] },
  { q: ['Pick a project for this weekend.', 'Scegli un progetto per questo weekend.'], a: [
    a('Steps so exact a robot could water your basil.', 'Passaggi così precisi che un robot innaffierebbe il basilico.', 'web', 5),
    a('A 15-second video that sells a hot sauce.', 'Un video di 15 secondi che vende una salsa piccante.', 'listing', 1),
    a('Four catchy lines for a tiny student kitchen.', 'Quattro righe orecchiabili per una mini cucina da studenti.', 'music', 5),
    a('An AI table of who owes what in the flat.', 'Una tabella fatta con l’AI su chi deve cosa in casa.', 'prompt', 4),
    a('Sports commentary over a skate clip.', 'La telecronaca di una clip di skate.', 'video', 4),
    a('The first picture of a post, so people swipe on.', 'La prima immagine di un post che invita a scorrere.', 'poster', 4),
    a('A caption that gets friends to reply.', 'Una caption che fa rispondere gli amici.', 'posts', 0),
  ] },
];

export const QRESULT: Record<QType, { name: T; line: T }> = {
  video: { name: ['The Filmer', 'Il Filmmaker'], line: ['You see the scene before anyone else does.', 'Vedi la scena prima di tutti gli altri.'] },
  poster: { name: ['The Designer', 'Il Designer'], line: ['You notice what looks off, and fix it.', 'Noti cosa non quadra e lo sistemi.'] },
  posts: { name: ['The Writer', 'Lo Storyteller'], line: ['You say it shorter, and better.', 'Lo dici più breve, e meglio.'] },
  web: { name: ['The Builder', 'Il Builder'], line: ['You would rather make the thing than talk about it.', 'Preferisci fare le cose piuttosto che parlarne.'] },
  listing: { name: ['The Seller', 'Il Seller'], line: ['You can explain why something is worth it.', 'Sai spiegare perché una cosa vale la pena.'] },
  music: { name: ['The Sound Maker', 'Il Sound Maker'], line: ['You hear what a moment needs.', 'Senti di cosa ha bisogno un momento.'] },
  prompt: { name: ['The Prompter', 'Il Prompter'], line: ['You ask AI better questions than most people.', 'Fai all’AI domande migliori di quasi tutti.'] },
};
// The colour of each type: the website's Examples cards (tint = the card, strong = Slash's eyes). The website quiz uses the same pairs.
export const QHUE: Record<QType, [tint: string, strong: string]> = {
  video: ['#D2EBFF', '#5BB8FF'], poster: ['#FFF0C2', '#FFC933'], posts: ['#FFD9EC', '#FF8AC4'], web: ['#C6F3E4', '#2FD3A3'],
  listing: ['#E4DCFF', '#A58BFF'], music: ['#FFDCD4', '#FF6A55'], prompt: ['#DCE6FF', '#2D4BFF'],
};
// The type behind an app field (the mix lists fields; the card names them as results).
export const typeOfField = (f: string): QType | undefined => (Object.keys(QFIELD) as QType[]).find((t) => QFIELD[t] === f);

export type QuizMatch = { type: QType; f: string; i: number; mix: string[] };
// picks[k] = the answer chosen for question k. +1 to the type of each answer; the type picked most wins, and a tie goes to the type picked most
// recently (the last question, a project for this weekend, is the strongest signal). The project = the latest answer in the winning type.
// mix = the other fields picked, most picked first (a tie: the more recent first). null when the picks are not one valid answer per question.
export const scoreQuiz = (picks: number[]): QuizMatch | null => {
  if (!Array.isArray(picks) || picks.length !== QUIZ.length || picks.some((p, k) => !Number.isInteger(p) || p < 0 || p >= QUIZ[k].a.length)) return null;
  const chosen = picks.map((p, k) => QUIZ[k].a[p]), latest = [...chosen].reverse();
  const count = new Map<QType, number>();
  chosen.forEach((c) => count.set(c.type, (count.get(c.type) ?? 0) + 1));
  const top = Math.max(...count.values());
  const win = latest.find((c) => count.get(c.type) === top)!;
  const mix = [...new Set(latest.map((c) => c.type))].filter((t) => t !== win.type).sort((x, y) => count.get(y)! - count.get(x)!).map((t) => QFIELD[t]);
  return { type: win.type, f: QFIELD[win.type], i: win.i, mix };
};
// The saved answers from an older or edited save: kept only when they are still a complete, valid set.
export const cleanQuiz = (q: unknown): { a: number[]; at: number } | undefined => {
  const v = q as { a?: unknown; at?: unknown } | null;
  return v && Array.isArray(v.a) && typeof v.at === 'number' && Number.isFinite(v.at) && scoreQuiz(v.a as number[]) ? { a: (v.a as number[]).slice(), at: v.at } : undefined;
};
