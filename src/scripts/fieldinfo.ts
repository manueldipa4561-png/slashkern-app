import { t2 } from './i18n';

// "What to expect" before a field (a day in it, what people like, what they find hard) and three steps outside the app once a mission is done.
// First impressions, not a verdict: nothing here claims a number or a partner. Same six keys as FIELDS in fields.ts (npm test checks it).
export type FieldInfo = { day: string; like: string[]; hard: string[]; steps: { ask: string; make: string; learn: string } };

export const FIELD_INFO: Record<string, FieldInfo> = {
  Design: {
    day: t2('You look at something that does not work yet, try a few versions and keep the one that makes people stop.', 'Guardi qualcosa che ancora non funziona, provi qualche versione e tieni quella che fa fermare le persone.'),
    like: [t2('A rough idea turning into something people notice', 'Un’idea grezza che diventa qualcosa che le persone notano'), t2('Small changes that make a big difference', 'Piccoli cambiamenti che fanno una grande differenza')],
    hard: [t2('Finding out your favourite version is not the clearest', 'Scoprire che la tua versione preferita non è la più chiara'), t2('Deciding when it is done', 'Decidere quando è finito')],
    steps: {
      ask: t2('Message someone whose design you like and ask how they started. One question, not ten.', 'Scrivi a una persona di cui ti piace il design e chiedile come ha iniziato. Una domanda sola, non dieci.'),
      make: t2('Make one small thing for someone you know this week: a sticker, a flyer, a cover.', 'Questa settimana fai una cosa piccola per qualcuno che conosci: un adesivo, un volantino, una copertina.'),
      learn: t2('Pick a design you like and write down what you see first, second and last.', 'Scegli un design che ti piace e scrivi cosa vedi prima, poi e per ultimo.'),
    },
  },
  Writing: {
    day: t2('You read what is on the screen, cut what does nothing and rewrite until someone answers.', 'Leggi quello che c’è sullo schermo, tagli quello che non serve e riscrivi finché qualcuno risponde.'),
    like: [t2('One line landing exactly right', 'Una frase che arriva esattamente nel punto giusto'), t2('Needing nothing but a notes app', 'Bastano le note del telefono')],
    hard: [t2('Cutting a sentence you love', 'Tagliare una frase che ami'), t2('Starting from a blank page', 'Partire da una pagina bianca')],
    steps: {
      ask: t2('Ask someone who writes every day what they cut first when a text feels flat.', 'Chiedi a una persona che scrive ogni giorno cosa taglia per prima cosa quando un testo suona piatto.'),
      make: t2('Rewrite a sign, a menu line or a caption near you and show it to whoever made it.', 'Riscrivi un cartello, una riga di menu o una caption che vedi vicino a te e mostrala a chi l’ha fatta.'),
      learn: t2('Read something you like and mark the sentence that made you keep reading.', 'Leggi qualcosa che ti piace e segna la frase che ti ha fatto continuare a leggere.'),
    },
  },
  Code: {
    day: t2('You tell a machine exactly what to do, step by step, then find out where it did something else.', 'Dici a una macchina esattamente cosa fare, un passo alla volta, poi scopri dove ha fatto altro.'),
    like: [t2('The moment a puzzle finally works', 'Il momento in cui un rompicapo finalmente funziona'), t2('Making something other people can tap', 'Costruire qualcosa che gli altri possono usare con un tap')],
    hard: [t2('One tiny mistake breaking everything', 'Un piccolo errore che rompe tutto'), t2('Not knowing why it does that', 'Non sapere perché fa così')],
    steps: {
      ask: t2('Ask someone who builds apps or sites what their first small project did.', 'Chiedi a qualcuno che crea app o siti cosa faceva il suo primo piccolo progetto.'),
      make: t2('Build one tiny thing a friend will use, like a quiz, a counter or a rule for a chat.', 'Costruisci una cosa piccolissima che un amico userà: un quiz, un contatore o una regola per una chat.'),
      learn: t2('Do one free beginner lesson of an hour, then notice if you want to go on.', 'Fai una lezione gratuita per principianti di un’ora, poi vedi se hai voglia di continuare.'),
    },
  },
  Video: {
    day: t2('You decide the first two seconds, cut what drags and make it work with the sound off.', 'Decidi i primi due secondi, tagli quello che rallenta e fai in modo che funzioni anche senza audio.'),
    like: [t2('A slow clip becoming worth watching', 'Una clip lenta che diventa bella da guardare'), t2('Planning it, then filming with just a phone', 'Pianificarla e poi girarla solo con il telefono')],
    hard: [t2('Cutting a moment you like', 'Tagliare un momento che ti piace'), t2('Being on camera, or directing someone else', 'Stare davanti alla camera o dirigere qualcun altro')],
    steps: {
      ask: t2('Ask someone who edits videos what they look at in the first two seconds.', 'Chiedi a qualcuno che monta video cosa guarda nei primi due secondi.'),
      make: t2('Film 10 seconds for a friend’s shop or club, then cut it to the best moment.', 'Gira 10 secondi per il negozio o il gruppo di un amico, poi tieni solo il momento migliore.'),
      learn: t2('Watch a clip you like three times and write down what happens in the first two seconds.', 'Guarda tre volte una clip che ti piace e scrivi cosa succede nei primi due secondi.'),
    },
  },
  Selling: {
    day: t2('You work out what a stranger wants to hear, say it in a few honest words and deal with the silence.', 'Capisci cosa vuole sentirsi dire uno sconosciuto, lo dici in poche parole oneste e gestisci il silenzio.'),
    like: [t2('A yes after a message you wrote', 'Un sì dopo un messaggio che hai scritto tu'), t2('Talking to people', 'Parlare con le persone')],
    hard: [t2('A reply that never comes', 'Una risposta che non arriva mai'), t2('Saying a price out loud', 'Dire un prezzo ad alta voce')],
    steps: {
      ask: t2('Ask someone who sells at a market or online what they say first to a new buyer.', 'Chiedi a chi vende in un mercatino o online cosa dice per prima cosa a un nuovo cliente.'),
      make: t2('Sell one thing you own with a listing you wrote after the projects.', 'Vendi una cosa tua con un annuncio scritto dopo aver fatto i progetti.'),
      learn: t2('Read five listings of the same thing and note which one you would message.', 'Leggi cinque annunci della stessa cosa e segna quello a cui scriveresti.'),
    },
  },
  Music: {
    day: t2('You choose what people hear, in what order, and what a few seconds should make them feel.', 'Scegli cosa sentono le persone, in che ordine e cosa devono provare in pochi secondi.'),
    like: [t2('Matching a sound to a feeling', 'Abbinare un suono a un’emozione'), t2('Small choices that change the whole mood', 'Piccole scelte che cambiano tutta l’atmosfera')],
    hard: [t2('Taste is personal and nobody agrees', 'Il gusto è personale e nessuno è d’accordo'), t2('There is no single right answer', 'Non esiste una sola risposta giusta')],
    steps: {
      ask: t2('Ask someone who makes or picks music how they decide what comes next.', 'Chiedi a qualcuno che fa o sceglie musica come decide cosa viene dopo.'),
      make: t2('Make a 10-song playlist for one specific moment and tell one person why.', 'Fai una playlist da 10 canzoni per un momento preciso e racconta a una persona perché.'),
      learn: t2('Listen to a song you love and count the sounds you can hear.', 'Ascolta una canzone che ami e conta quanti suoni riesci a sentire.'),
    },
  },
  Prompting: {
    day: t2('You tell an AI exactly what you want, read what comes back and rewrite your instructions until the answer is useful.', 'Dici a un’AI esattamente cosa vuoi, leggi cosa ti risponde e riscrivi le istruzioni finché la risposta è utile.'),
    like: [t2('An answer that is exactly what you meant', 'Una risposta che è esattamente quella che volevi'), t2('Small changes in the words that change the whole result', 'Piccole modifiche alle parole che cambiano tutto il risultato')],
    hard: [t2('Getting a sure-sounding answer that is wrong', 'Ricevere una risposta sicura di sé ma sbagliata'), t2('Knowing what to tell the AI and what to leave out', 'Capire cosa dire all’AI e cosa lasciare fuori')],
    steps: {
      ask: t2('Ask someone who uses an AI every day what they add when its first answer is bland.', 'Chiedi a qualcuno che usa un’AI ogni giorno cosa aggiunge quando la prima risposta è insipida.'),
      make: t2('Pick something small to do this week, like a message or a plan, and rewrite the prompt three times. Keep the best.', 'Scegli una cosa piccola da fare questa settimana, come un messaggio o un piano, e riscrivi il prompt tre volte. Tieni il migliore.'),
      learn: t2('Ask an AI the same question twice, once vague and once with details, and write down what changed.', 'Fai la stessa domanda a un’AI due volte, una vaga e una con i dettagli, e scrivi cosa è cambiato.'),
    },
  },
};
