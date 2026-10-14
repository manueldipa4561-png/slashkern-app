import { t2 } from './i18n';
import { trendX } from './trending';

// One concrete practice mission per mission (6 fields x 6, in rounds of 3). Every company here is fictional and the sheet says so.
// Shape: who (practice mission tag), brief (scenario + stakes), asset (the real material to work on),
// steps (3 actions), mins (time box), bar (what strong answers do), twist (optional bonus),
// answer (one line under the answer box: exactly what to write, with its limit).
// img: a picture of the asset (a photo, a story, a cover) shown above the text, imgIt the Italian version when the picture has words in it.
// only: the picture says it all, so the text is kept just as its description for a screen reader.
// video: a real clip (public/media) shown above the text with its own controls; the text keeps the seconds.
export type Asset = { title: string; body: string; mono: boolean; img?: string; imgIt?: string; only?: boolean; video?: string };
export type MissionX = { who: string; brief: string; asset: Asset; steps: string[]; mins: number; bar: string[]; twist: string; answer?: string };

const tag = (en: string, it: string) => t2('Practice project · ' + en, 'Progetto di prova · ' + it);

const CORE: Record<string, MissionX[]> = {
  Design: [
    {
      who: tag('Pomo Pizza (fictional)', 'Pomo Pizza (fittizia)'),
      brief: t2(
        'Pomo Pizza’s story shows 7 messages at once, so people swipe past. Keep the 1 or 2 that make people come, cut the rest, pick one colour for the words.',
        'Nella storia di Pomo Pizza ci sono 7 messaggi tutti insieme e la gente tira dritto. Tienine 1 o 2, quelli che fanno venire la gente, togli il resto e scegli un colore per le parole.'),
      asset: {
        mono: false,
        img: '/img/m/story-en.webp', imgIt: '/img/m/story-it.webp', only: true,
        title: t2('The story today', 'La storia oggi'),
        body: t2(
          'PIZZA NIGHT SATURDAY!!! (huge, red, shouting letters)\n2 for 1 until 9pm (yellow sticker, tilted)\nLive DJ from 10 (blue, curly letters)\nNew menu · win a year of pizza · tag 3 friends\n12 Via Verdi (tiny, grey, on the photo)\nPhoto: a pizza, a crowd and a dog',
          'SERATA PIZZA SABATO!!! (enorme, rossa, lettere urlate)\n2x1 fino alle 21 (adesivo giallo, storto)\nDJ dal vivo dalle 22 (blu, lettere ricciolute)\nNuovo menu · vinci un anno di pizza · tagga 3 amici\nVia Verdi 12 (minuscolo, grigio, sulla foto)\nFoto: una pizza, una folla e un cane'),
      },
      steps: [
        t2('Pick the 1 or 2 messages that make people come.', 'Scegli 1 o 2 messaggi che fanno venire la gente.'),
        t2('Pick one colour for the words.', 'Scegli un colore per le parole.'),
        t2('Check: 1 or 2 kept, the rest cut, one colour.', 'Controlla: 1 o 2 messaggi, il resto tolto, un solo colore.'),
      ],
      mins: 2,
      bar: [
        t2('Only 1 or 2 messages left', 'Restano solo 1 o 2 messaggi'),
        t2('Readable in two seconds', 'Si legge in due secondi'),
        t2('One colour for all the words', 'Un colore per tutte le parole'),
      ],
      twist: t2('Build it in your story editor for a real place you like. Post it, or send it to a friend.', 'Rifalla nell’editor delle storie per un posto vero che ti piace. Pubblicala, o mandala a qualcuno.'),
      answer: t2('The messages you keep (1 or 2), the ones you cut, and one colour for the words.', 'I messaggi che tieni (1 o 2), quelli che togli e un colore per le parole.'),
    },
    {
      who: tag('Bar Ficus (fictional)', 'Bar Ficus (fittizio)'),
      brief: t2(
        'Bar Ficus wants a round sticker for its glass door. Describe it in words: one picture, 2 colours, and a line under the bar’s name (4 words max).',
        'Bar Ficus vuole un adesivo rotondo per la sua porta a vetri. Descrivilo a parole: un’immagine, 2 colori e una frase sotto il nome del bar (massimo 4 parole).'),
      asset: {
        mono: false,
        title: t2('What you know about the bar', 'Cosa sai del bar'),
        body: t2(
          'Open since 1987, 6:30am to 9pm\nEspresso €1.20 · Spritz €4\nRosa runs it and calls everyone “tesoro” (sweetheart)\nA giant plant by the cash register, older than Rosa’s kids\nLoud at 6pm, sleepy at 3pm\nThe sticker: round, 8 cm, on the glass door',
          'Aperto dal 1987, dalle 6:30 alle 21\nCaffè 1,20 € · Spritz 4 €\nRosa lo gestisce e chiama tutti “tesoro”\nUna pianta gigante vicino alla cassa, più vecchia dei figli di Rosa\nAlle 18 è un caos, alle 15 si dorme\nL’adesivo: rotondo, 8 cm, sulla porta a vetri'),
      },
      steps: [
        t2('Pick the one thing that makes this bar special.', 'Scegli la cosa che rende speciale questo bar.'),
        t2('Describe a picture of it in 2 colours.', 'Descrivi un’immagine di quella cosa in 2 colori.'),
        t2('Add a line under the name: 4 words or fewer.', 'Aggiungi una frase sotto il nome: 4 parole al massimo.'),
      ],
      mins: 3,
      bar: [
        t2('The picture is one simple shape', 'L’immagine è una forma semplice'),
        t2('The line is 4 words or fewer', 'La frase ha 4 parole o meno'),
        t2('Only 2 colours, and you named them', 'Solo 2 colori, e hai detto quali'),
      ],
      twist: t2('Sketch it on paper, even badly. Post the photo, or send it to a friend.', 'Schizzalo su carta, anche male. Pubblica la foto, o mandala a qualcuno.'),
      answer: t2('One picture in 2 colours, and a line under the bar’s name: 4 words or fewer.', 'Un’immagine in 2 colori e una frase sotto il nome del bar: 4 parole al massimo.'),
    },
    {
      who: tag('Elena’s bare room', 'La stanza spoglia di Elena'),
      brief: t2(
        'Elena wants her bare room to feel like “a slow Sunday in a tiny flat by the sea”. Describe 6 pictures for her moodboard (a collage that shows a feeling).',
        'Elena vuole che la sua stanza spoglia sembri “una domenica lenta in una casetta sul mare”. Descrivi 6 immagini per il suo moodboard (un collage che mostra una sensazione).'),
      asset: {
        mono: false,
        img: '/img/m/room.webp',
        title: t2('Elena’s room', 'La stanza di Elena'),
        body: t2(
          'Elena’s sentence: “A room that feels like a slow Sunday in a tiny flat by the sea.”\nThe room: 3 by 3 metres, one window facing a wall\nShe already has: a bed, a lamp, a sad plant\nBudget: very small\nYou choose: 6 pictures, no more',
          'La frase di Elena: “Una stanza che sembra una domenica lenta in una casetta sul mare.”\nLa stanza: 3 metri per 3, una finestra che dà su un muro\nHa già: un letto, una lampada, una pianta un po’ triste\nBudget: minuscolo\nTu scegli: 6 immagini, non una di più'),
      },
      steps: [
        t2('Pick 2 words for the feeling of her sentence.', 'Scegli 2 parole per la sensazione della sua frase.'),
        t2('Describe 6 different pictures, one line each.', 'Descrivi 6 immagini diverse, una riga ciascuna.'),
        t2('Name 2 colours that all 6 share.', 'Scegli 2 colori che tornano in tutte e 6.'),
      ],
      mins: 3,
      bar: [
        t2('Every picture fits the feeling', 'Ogni immagine rispecchia la sensazione'),
        t2('6 different things, not 6 lamps', '6 cose diverse, non 6 lampade'),
        t2('A stranger could guess the sentence', 'Chi non la conosce indovinerebbe la frase'),
      ],
      twist: t2('Ask a friend for their dream room in one sentence, then plan their 6 pictures.', 'Chiedi a qualcuno di descrivere in una frase la sua stanza dei sogni, poi pianifica le sue 6 immagini.'),
      answer: t2('The feeling in 2 words, 6 pictures (one line each), and 2 colours.', 'La sensazione in 2 parole, 6 immagini (una riga ciascuna) e 2 colori.'),
    },
    {
      who: tag('Nonna Kicks (fictional)', 'Nonna Kicks (fittizia)'),
      brief: t2(
        'Nonna Kicks’ photo of used sneakers got zero messages in 5 days. Name the 3 worst problems and plan a new photo: where, what light, what behind the shoes.',
        'La foto delle sneaker usate di Nonna Kicks non ha avuto neanche un messaggio in 5 giorni. Trova i 3 problemi peggiori e pianifica una foto nuova: dove, con che luce, cosa c’è dietro le scarpe.'),
      asset: {
        mono: false,
        img: '/img/m/sneakers.webp', only: true,
        title: t2('The photo today', 'La foto oggi'),
        body: t2(
          'Taken at 8pm under one dim ceiling light\nOn an unmade bed, a hoodie in the corner\nBoth sneakers slightly blurry\nLaces undone, toes cut off at the edge\nWhite sneakers look yellow\nYou can’t see the sole or the size',
          'Scattata alle 20 con una sola luce fioca al soffitto\nSu un letto sfatto, con una felpa in un angolo\nEntrambe le sneaker un po’ sfocate\nLacci slacciati, punte tagliate fuori dalla foto\nLe sneaker bianche sembrano gialle\nNon si vedono la suola né la taglia'),
      },
      steps: [
        t2('Pick the 3 worst problems in the photo.', 'Scegli i 3 problemi peggiori della foto.'),
        t2('Plan the new photo: where, what light, what behind.', 'Pianifica la foto nuova: dove, con che luce, cosa c’è dietro.'),
        t2('Say how close: the shoes should fill the photo.', 'Decidi quanto avvicinarti: le scarpe devono riempire la foto.'),
      ],
      mins: 4,
      bar: [
        t2('Where, light and background all covered', 'Ci sono tutti e tre: dove, luce e sfondo'),
        t2('The shoes fill most of the photo', 'Le scarpe riempiono quasi tutta la foto'),
        t2('Nothing in the photo distracts from the shoes', 'Niente che distragga dalle scarpe'),
      ],
      twist: t2('Take a photo of your own shoes this way. Use it on Vinted or Subito, or send before and after to a friend.', 'Fai una foto così alle tue scarpe. Usala su Vinted o Subito, oppure manda prima e dopo a qualcuno.'),
      answer: t2('The 3 worst problems, then the new photo: where, what light, what behind, how close.', 'I 3 problemi peggiori, poi la foto nuova: dove, con che luce, cosa c’è dietro, quanto da vicino.'),
    },
    {
      who: tag('Fuorisede Diaries (fictional)', 'Fuorisede Diaries (fittizio)'),
      brief: t2(
        'Fuorisede Diaries has a post with 5 flatmate tips, one per picture, but no first picture yet. Plan it around one tip: up to 6 words and one bright colour.',
        'Fuorisede Diaries ha un post con 5 consigli sui coinquilini, uno per immagine, ma gli manca ancora la prima immagine. Pianificala attorno a un consiglio: fino a 6 parole e un colore acceso.'),
      asset: {
        mono: false,
        title: t2('The 5 tips inside + the rules', 'I 5 consigli dentro + le regole'),
        body: t2(
          'Tip 1: label your food, always\nTip 2: buy your own pan\nTip 3: talk about the bills in week 1\nTip 4: know who takes out the bin\nTip 5: if something bugs you, say it early, not at 2am\nRules: square, seen small in a feed, 6 words max, one bright colour',
          'Consiglio 1: etichetta sempre il tuo cibo\nConsiglio 2: compra una pentola tua\nConsiglio 3: parla delle bollette già nella prima settimana\nConsiglio 4: metti in chiaro chi porta giù la spazzatura\nConsiglio 5: se qualcosa ti dà fastidio, dillo subito, non alle 2 di notte\nRegole: quadrata, si vede piccola nel feed, massimo 6 parole, un colore acceso'),
      },
      steps: [
        t2('Pick the tip that would make a stranger curious.', 'Scegli il consiglio che incuriosirebbe uno sconosciuto.'),
        t2('Write the words on the picture: 6 or fewer.', 'Scrivi le parole sull’immagine: 6 al massimo.'),
        t2('Describe the picture, in one bright colour.', 'Descrivi l’immagine, in un solo colore acceso.'),
      ],
      mins: 4,
      bar: [
        t2('You want to see picture two', 'Ti viene voglia di vedere la seconda'),
        t2('Readable when the picture is tiny', 'Si legge anche quando l’immagine è piccola'),
        t2('It does not give away all 5 tips', 'Non svela tutti e 5 i consigli'),
      ],
      twist: t2('Copy the plan and send it to someone about to move in with flatmates. Would they keep swiping?', 'Copia il piano e mandalo a chi sta per andare a vivere con dei coinquilini. Si fermerebbe o tirerebbe dritto?'),
      answer: t2('The tip, the words on the picture (6 or fewer), and the picture in one bright colour.', 'Il consiglio, le parole sull’immagine (6 al massimo) e l’immagine in un colore acceso.'),
    },
    {
      who: tag('Noce Bites (fictional)', 'Noce Bites (fittizio)'),
      brief: t2(
        'Luca’s snack video needs a thumbnail (the small picture people tap on). Plan 2 very different ones, A and B, then pick the one you would tap.',
        'Il video di Luca su uno snack ha bisogno di una miniatura (l’immagine piccola su cui si tocca). Pianificane 2 molto diverse, A e B, poi scegli quella che toccheresti.'),
      asset: {
        mono: false,
        img: '/img/m/luca.webp',
        title: t2('Luca’s video + the rules', 'Il video di Luca + le regole'),
        body: t2(
          'Video: “I tried Noce Bites for 7 days”\nThe snack: oat and hazelnut bites, orange wrapper\nLuca on day 7: tired but happy\nOn a phone the thumbnail is about 3 cm wide\nRules: 3 words max, wrapper visible, one colour that pops',
          'Video: “Ho provato Noce Bites per 7 giorni”\nLo snack: bocconcini di avena e nocciola, confezione arancione\nLuca al settimo giorno: stanco ma felice\nSul telefono la miniatura è larga circa 3 cm\nRegole: massimo 3 parole, confezione visibile, un colore che spicca'),
      },
      steps: [
        t2('Plan thumbnail A: Luca’s face, a colour, 3 words max.', 'Pianifica la miniatura A: la faccia di Luca, un colore, massimo 3 parole.'),
        t2('Plan thumbnail B the same way, but really different.', 'Pianifica la miniatura B allo stesso modo, ma davvero diversa.'),
        t2('Pick the winner and say why in one line.', 'Scegli la vincente e di’ perché in una riga.'),
      ],
      mins: 5,
      bar: [
        t2('The two versions look really different', 'Le due versioni sono davvero diverse'),
        t2('Readable at 3 cm wide', 'Leggibile a 3 cm di larghezza'),
        t2('Your “why” is about the viewer, not you', 'Il “perché” riguarda chi guarda, non te'),
      ],
      twist: t2('Swap Noce for a snack you love. Make the winner for real and send it to a friend.', 'Sostituisci Noce con uno snack che ami. Falla davvero, la vincente, e mandala a qualcuno.'),
      answer: t2('Thumbnail A and B (a face, a colour, 3 words max each), then the winner and why.', 'Miniatura A e B (una faccia, un colore, massimo 3 parole ciascuna), poi la vincente e perché.'),
    },
  ],
  Writing: [
    {
      who: tag('Camilla’s mirror selfie', 'Il selfie allo specchio di Camilla'),
      brief: t2(
        'Camilla’s gym selfie got 3 likes and no comments: her caption (the text under the photo) says nothing. Write a new caption her friends want to answer.',
        'Il selfie in palestra di Camilla ha 3 like e nessun commento: la caption (il testo sotto la foto) non dice niente. Scrivine una nuova a cui i suoi amici abbiano voglia di rispondere.'),
      asset: {
        mono: false,
        img: '/img/m/camilla.webp',
        title: t2('Camilla’s caption · 3 likes, 0 comments', 'La caption di Camilla · 3 like, 0 commenti'),
        body: t2(
          'Gym day 💪 Feeling good #gym #fitness\nWhat Camilla didn’t say:\n– she almost stayed home\n– her bag strap snapped on the bus\n– first time lifting 40 kg',
          'Giorno di palestra 💪 Mi sento bene #gym #fitness\nCosa Camilla non ha detto:\n– stava per restare a casa\n– le si è rotta la tracolla sul bus\n– ha sollevato 40 kg per la prima volta'),
      },
      steps: [
        t2('Pick the details a friend would ask about.', 'Scegli i dettagli che farebbero fare domande agli amici.'),
        t2('Write the caption with those details.', 'Scrivi la caption con quei dettagli.'),
        t2('Check: 12 words or fewer, no hashtags.', 'Controlla: 12 parole al massimo, niente hashtag.'),
      ],
      mins: 2,
      bar: [
        t2('Real details, not “feeling good”', 'Dettagli veri, non “mi sento bene”'),
        t2('No hashtags, 12 words or fewer', 'Niente hashtag, 12 parole al massimo'),
        t2('A friend would want to reply', 'Gli amici avrebbero voglia di rispondere'),
      ],
      twist: t2('Bonus: cut it to 6 words, keep the funny part, and send it to a friend who goes to the gym.', 'Bonus: riducila a 6 parole, tieni la parte buffa e mandala a chi viene in palestra con te.'),
      answer: t2('One caption, 12 words or fewer, no hashtags.', 'Una caption, 12 parole al massimo, niente hashtag.'),
    },
    {
      who: tag('Parlo, a language app (fictional)', 'Parlo, app di lingue (fittizia)'),
      brief: t2(
        'Leo hasn’t opened Parlo, his language app, in 3 days. Write the kind message that pops up on his phone to bring him back.',
        'Leo non apre Parlo, la sua app di lingue, da 3 giorni. Scrivi il messaggio gentile che gli compare sul telefono per farlo tornare.'),
      asset: {
        mono: false,
        title: t2('About Leo + the rules', 'Su Leo + le regole'),
        body: t2(
          'Leo, learning Spanish for a trip in June\nLast lesson: ordering a coffee, 3 days ago\nLeo is busy, not lazy\nNot allowed: guilt, threats, fake countdowns (“only 2 hours left”)\nSpace: one line on the lock screen, 10 words max',
          'Leo studia spagnolo per un viaggio a giugno\nUltima lezione: ordinare un caffè, 3 giorni fa\nLeo è impegnato, non pigro\nVietato: sensi di colpa, minacce, conti alla rovescia finti (“mancano solo 2 ore”)\nSpazio: una riga sulla schermata di blocco, 10 parole al massimo'),
      },
      steps: [
        t2('Pick one real thing Leo already did.', 'Scegli una cosa vera che Leo ha già fatto.'),
        t2('Write a kind message that mentions it.', 'Scrivi un messaggio gentile che la nomini.'),
        t2('Check: 10 words or fewer, no guilt.', 'Controlla: 10 parole al massimo, niente sensi di colpa.'),
      ],
      mins: 3,
      bar: [
        t2('Names something Leo really did', 'Nomina qualcosa che Leo ha fatto davvero'),
        t2('Kind: no guilt, no countdown', 'Gentile: niente sensi di colpa né conti alla rovescia'),
        t2('You would tap it yourself', 'Lo apriresti anche tu'),
      ],
      twist: t2('Bonus: reword it for a friend who owes you a reply. Send it.', 'Bonus: riscrivilo per chi ti deve una risposta. Mandalo.'),
      answer: t2('One phone message, 10 words or fewer, no guilt.', 'Un messaggio per il telefono, 10 parole al massimo, niente sensi di colpa.'),
    },
    {
      who: tag('Elisa’s birthday', 'Il compleanno di Elisa'),
      brief: t2(
        'Elisa turns 28 tomorrow, and you always send just “Happy birthday! 🎉”. Write her three new messages: one funny, one warm, one tiny.',
        'Elisa compie 28 anni domani e tu le scrivi sempre solo “Buon compleanno! 🎉”. Scrivile tre messaggi nuovi: uno divertente, uno affettuoso, uno minuscolo.'),
      asset: {
        mono: false,
        title: t2('What you know about Elisa', 'Cosa sai di Elisa'),
        body: t2(
          'You always send: Happy birthday! 🎉\nShe loves: midnight pasta, being late, her dog Fritz\nShe hates: surprise parties\nYou shared a flat for 2 years\nNot allowed: “wishing you all the best”',
          'Di solito scrivi: Buon compleanno! 🎉\nLe piace: la pasta di mezzanotte, arrivare tardi, il suo cane Fritz\nOdia: le feste a sorpresa\nAvete diviso casa per 2 anni\nVietato: “ti auguro il meglio”'),
      },
      steps: [
        t2('Write the funny one, with a detail from the list.', 'Scrivi quello divertente, con un dettaglio della lista.'),
        t2('Write the warm one: what you’d really say to her.', 'Scrivi quello affettuoso: quello che le diresti davvero.'),
        t2('Write the tiny one in 8 words or fewer.', 'Scrivi quello minuscolo in 8 parole al massimo.'),
      ],
      mins: 3,
      bar: [
        t2('Each version sounds different', 'Ogni versione suona diversa'),
        t2('One detail only Elisa would get', 'Un dettaglio che capirebbe solo Elisa'),
        t2('The tiny version is 8 words or fewer', 'La versione minuscola ha 8 parole al massimo'),
      ],
      twist: t2('Bonus: send your favourite to someone whose birthday is coming.', 'Bonus: manda il tuo preferito a chi compie gli anni presto.'),
      answer: t2('Three messages: funny, warm, and tiny (8 words or fewer).', 'Tre messaggi: divertente, affettuoso e minuscolo (8 parole al massimo).'),
    },
    {
      who: tag('Bolla Laundry (fictional)', 'Lavanderia Bolla (fittizia)'),
      brief: t2(
        'Bolla Laundry’s bio (the short text on its profile) could be about any laundry. Rewrite it so a student new in town wants to come.',
        'La bio della Lavanderia Bolla (il testo breve sul suo profilo) potrebbe parlare di qualsiasi lavanderia. Riscrivila in modo che chi è appena arrivato in città per studiare abbia voglia di passare.'),
      asset: {
        mono: false,
        title: t2('Bolla’s bio today + the true facts', 'La bio di Bolla oggi + i fatti veri'),
        body: t2(
          'Welcome to Bolla! 🧺 Self-service laundry, best quality, best prices. Open most days. Visit us!\nTrue facts:\n– next to the university gate\n– wash €4, dry €3, soap included\n– free wifi and a shelf of books to swap\n– open every day, even Sunday',
          'Benvenuti da Bolla! 🧺 Lavanderia self-service, la migliore qualità ai migliori prezzi. Aperti quasi tutti i giorni. Venite a trovarci!\nFatti veri:\n– accanto al cancello dell’università\n– lavaggio 4 €, asciugatura 3 €, sapone incluso\n– wifi gratis e uno scaffale di libri da scambiare\n– aperti ogni giorno, anche la domenica'),
      },
      steps: [
        t2('Spot the words any laundry could say.', 'Trova le parole che direbbe qualsiasi lavanderia.'),
        t2('Choose the 3 facts a student needs most.', 'Scegli i 3 fatti più utili per chi studia.'),
        t2('Write the bio in 20 words or fewer.', 'Scrivi la bio in 20 parole al massimo.'),
      ],
      mins: 4,
      bar: [
        t2('A student knows where to go', 'Chi studia capisce dove andare'),
        t2('Real prices, no empty words like “best”', 'Prezzi veri, niente parole vuote come “migliore”'),
        t2('Sounds like a person, not a catalogue', 'Suona come una persona, non come un catalogo'),
      ],
      twist: t2('Bonus: rewrite your own bio the same way, and post it tonight.', 'Bonus: riscrivi la tua bio allo stesso modo e pubblicala stasera.'),
      answer: t2('One bio, 20 words or fewer, using the true facts.', 'Una bio, 20 parole al massimo, con i fatti veri.'),
    },
    {
      who: tag('Cinema Orsa (fictional)', 'Cinema Orsa (fittizio)'),
      brief: t2(
        'Cinema Orsa raised tickets by €1, and one comment is rude. Reply as the cinema in 25 words or fewer, calm and human.',
        'Cinema Orsa ha alzato di 1 € il prezzo del biglietto e sotto c’è un commento maleducato. Rispondi a nome del cinema in 25 parole al massimo, con calma e senza fare il robot.'),
      asset: {
        mono: false,
        title: t2('Under Orsa’s post · the rude comment', 'Sotto il post di Orsa · il commento maleducato'),
        body: t2(
          'Post: Tickets are now €8 (was €7).\nComment: €8 to sit in the dark?? I’ll watch it at home. Greedy 🙄\nTrue: heating and film rental cost 25% more\nAlso true: first rise in 4 years, Tuesdays stay €5\nRules: no sarcasm, no arguing back, no begging',
          'Post: Il biglietto ora costa 8 € (prima 7 €).\nCommento: 8 € per stare al buio?? Me lo guardo a casa. Che ladri 🙄\nVero: riscaldamento e noleggio dei film costano il 25% in più\nVero anche questo: primo aumento in 4 anni, il martedì resta 5 €\nRegole: niente sarcasmo, non ribattere, niente suppliche'),
      },
      steps: [
        t2('Find what the comment is really about.', 'Trova di cosa parla davvero il commento.'),
        t2('Write a calm reply with one true reason.', 'Scrivi una risposta calma con un motivo vero.'),
        t2('Check: 25 words or fewer, no sarcasm.', 'Controlla: 25 parole al massimo, niente sarcasmo.'),
      ],
      mins: 4,
      bar: [
        t2('Names the €1, no hiding', 'Parla chiaro dell’aumento di 1 €, senza nascondersi'),
        t2('One true reason, no excuses', 'Un motivo vero, niente scuse'),
        t2('Ends warmly, with no sarcasm', 'Chiude con un tono caldo, senza sarcasmo'),
      ],
      twist: t2('Copy it. Send it to someone and ask: would you still come?', 'Copiala. Mandala a qualcuno e chiedi: ci verresti lo stesso?'),
      answer: t2('One reply from the cinema, 25 words or fewer.', 'Una risposta del cinema, 25 parole al massimo.'),
    },
    {
      who: tag('Pigro Gelato (fictional)', 'Pigro Gelato (fittizio)'),
      brief: t2(
        'Pigro Gelato has a new flavour and no name yet. Write three names, pick one, and write the small sign for the counter.',
        'Pigro Gelato ha un gusto nuovo, ma ancora senza nome. Scrivi tre nomi, scegline uno e poi il cartello per il banco.'),
      asset: {
        mono: false,
        title: t2('Pigro Gelato · new flavour, no name', 'Pigro Gelato · gusto nuovo, senza nome'),
        body: t2(
          'What’s in it: roasted hazelnuts, sea salt, a dark chocolate ribbon\nTaste: sweet first, a little salt at the end\nArrives: Friday, in the case between pistachio and lemon\nThe shop’s voice: lazy, kind, a bit funny\nRules: names 3 words or fewer, sign 12 words or fewer',
          'Dentro: nocciole tostate, sale marino, una variegatura di cioccolato fondente\nSapore: prima dolce, alla fine un po’ di sale\nArriva: venerdì, in vetrina tra pistacchio e limone\nLa voce del locale: pigra, gentile, un po’ buffa\nRegole: nomi di 3 parole al massimo, cartello di 12 parole al massimo'),
      },
      steps: [
        t2('Write 3 names, each 3 words or fewer.', 'Scrivi 3 nomi, ognuno di 3 parole al massimo.'),
        t2('Pick the one you’d say out loud to order.', 'Scegli quello che diresti ad alta voce per ordinarlo.'),
        t2('Write its sign for the counter: 12 words or fewer.', 'Scrivi il cartello per il banco: 12 parole al massimo.'),
      ],
      mins: 5,
      bar: [
        t2('The name hints at the taste', 'Il nome fa intuire il gusto'),
        t2('The sign sounds like the shop’s voice', 'Il cartello suona come la voce del locale'),
        t2('The sign gives facts, not “best ever”', 'Il cartello dà fatti, non “il migliore di sempre”'),
      ],
      twist: t2('Copy the name and sign. Post them, or send them to a gelato fan.', 'Copia nome e cartello. Pubblicali, o mandali a chi ama il gelato.'),
      answer: t2('Three names (up to 3 words each), your pick, and a sign up to 12 words.', 'Tre nomi (massimo 3 parole l’uno), la tua scelta e un cartello di massimo 12 parole.'),
    },
  ],

  Code: [
    {
      who: tag('Moss Merch, a band’s hoodie shop (fictional)', 'Moss Merch, il negozio di felpe di una band (fittizio)'),
      brief: t2(
        'The Moss Merch hoodies sold out, but the Buy button stays green instead of turning red. Find the word spelled wrong in the code and write its line again, fixed.',
        'Le felpe di Moss Merch sono esaurite, ma il pulsante Compra resta verde invece di diventare rosso. Trova la parola scritta male nel codice e riscrivi quella riga correggendola.'),
      asset: {
        mono: true,
        title: t2('The Buy button’s code, with notes', 'Il codice del pulsante Compra, con le note'),
        body: t2(
          '// Lines with // are notes for you.\n// How many hoodies are left: none\nlet hoodiesLeft = 0;\n// The button starts green\nlet color = "green";\n// If none are left, turn it red\nif (hoodiesLeft === 0) colour = "red";\n// Paint the button\npaintButton(color);',
          '// Le righe con // sono note per te.\n// Quante felpe restano: nessuna\nlet hoodiesLeft = 0;\n// Il pulsante parte verde\nlet color = "green";\n// Se non ne restano, fallo rosso\nif (hoodiesLeft === 0) colour = "red";\n// Colora il pulsante\npaintButton(color);'),
      },
      steps: [
        t2('Read each note, then the code line under it.', 'Leggi ogni nota, poi la riga di codice sotto.'),
        t2('Find the word that is spelled wrong.', 'Trova la parola scritta male.'),
        t2('Write its line again, with only that word fixed.', 'Riscrivi la sua riga, correggendo solo quella parola.'),
      ],
      mins: 2,
      bar: [
        t2('Your fixed line uses color, not colour', 'La tua riga corretta usa color, non colour'),
        t2('You changed only that one word', 'Hai cambiato solo quella parola'),
        t2('You can explain the mistake in a sentence', 'Sai spiegare l’errore in una frase'),
      ],
      twist: t2('Send the broken code to someone: “Why is my button still green?” Time them.', 'Manda il codice rotto a qualcuno: “Perché il mio pulsante è ancora verde?” Cronometra quanto ci mette.'),
      answer: t2('The word spelled wrong, then its line written again, fixed.', 'La parola scritta male, poi quella riga riscritta e corretta.'),
    },
    {
      who: tag('Pizzeria Zeta (fictional)', 'Pizzeria Zeta (fittizia)'),
      brief: t2(
        'Pizzeria Zeta wants a quick quiz: two questions, and each person gets one of 3 pizzas. Write 3 rules, “IF these answers THEN this pizza”, so everyone gets exactly one.',
        'Pizzeria Zeta vuole un quiz veloce: due domande, e ogni persona riceve una di 3 pizze. Scrivi 3 regole, “SE queste risposte ALLORA questa pizza”, così ognuno ne riceve una sola.'),
      asset: {
        mono: false,
        title: t2('The two questions and the three pizzas', 'Le due domande e le tre pizze'),
        body: t2(
          'Question 1: Saturday night, stay in or go out?\nQuestion 2: Spice, none or lots?\nPizzas: Margherita, Diavola, Quattro Formaggi\nA rule: IF (answers) THEN (pizza)\nUse AND when a rule needs both answers.\nThe 4 kinds of people:\nstay in, no spice\nstay in, lots of spice\ngo out, no spice\ngo out, lots of spice',
          'Domanda 1: sabato sera, a casa o fuori?\nDomanda 2: piccante, per niente o tanto?\nPizze: Margherita, Diavola, Quattro Formaggi\nUna regola: SE (risposte) ALLORA (pizza)\nUsa E quando una regola vuole tutte e due le risposte.\nI 4 tipi di persona:\na casa, niente piccante\na casa, tanto piccante\nfuori, niente piccante\nfuori, tanto piccante'),
      },
      steps: [
        t2('Write 3 rules, one per line, each starting with IF.', 'Scrivi 3 regole, una per riga, ognuna inizia con SE.'),
        t2('Test each of the 4 kinds of people.', 'Prova ognuno dei 4 tipi di persona.'),
        t2('Check: each one gets exactly one pizza.', 'Controlla: ognuno riceve una sola pizza.'),
      ],
      mins: 3,
      bar: [
        t2('All four kinds of people get a pizza', 'Tutti e quattro i tipi ricevono una pizza'),
        t2('No one gets two different pizzas', 'Nessuno riceve due pizze diverse'),
        t2('Each rule fits on one line', 'Ogni regola sta su una riga'),
      ],
      twist: t2('Post the two questions as story polls. Reply to each person who votes with their pizza.', 'Pubblica le due domande come sondaggi nelle storie. Rispondi a chi vota con la sua pizza.'),
      answer: t2('Three rules, one per line: IF (answers) THEN (pizza).', 'Tre regole, una per riga: SE (risposte) ALLORA (pizza).'),
    },
    {
      who: tag('Flatmates’ group chat', 'Chat dei coinquilini'),
      brief: t2(
        'In this flat, whoever replies last to “cinema tonight?” pays for the tickets. Find how Ada can avoid paying, then rewrite the rule so her trick fails.',
        'In questa casa chi risponde per ultimo a “cinema stasera?” paga i biglietti. Trova come Ada può evitare di pagare, poi riscrivi la regola perché il suo trucco non funzioni.'),
      asset: {
        mono: false,
        title: t2('The flat’s rule and tonight’s chat', 'La regola della casa e la chat di stasera'),
        body: t2(
          'Rule: IF you are the last to reply, THEN you pay.\n20:00 Omar: cinema tonight?\n20:01 Vera: yes!\n20:04 Pia: ok\nAda: (never answers)',
          'Regola: SE rispondi per ultimo, ALLORA paghi.\n20:00 Omar: cinema stasera?\n20:01 Vera: sì!\n20:04 Pia: ok\nAda: (non risponde mai)'),
      },
      steps: [
        t2('Play Ada: find a way to never pay.', 'Fai la parte di Ada: trova un modo per non pagare mai.'),
        t2('Rewrite the rule so that trick fails.', 'Riscrivi la regola in modo che quel trucco non funzioni.'),
        t2('Check: someone always ends up paying.', 'Controlla: qualcuno finisce sempre per pagare.'),
      ],
      mins: 3,
      bar: [
        t2('Ada’s trick no longer works', 'Il trucco di Ada non funziona più'),
        t2('Someone always ends up paying', 'Qualcuno finisce sempre per pagare'),
        t2('The rule still fits in two lines', 'La regola sta ancora in due righe'),
      ],
      twist: t2('Send your fixed rule to your real group chat. See how long it takes someone to beat it.', 'Manda la tua regola corretta alla tua vera chat di gruppo. Vedi quanto ci mette qualcuno a batterla.'),
      answer: t2('Ada’s trick, then your new rule: 1 or 2 lines starting with IF.', 'Il trucco di Ada, poi la tua nuova regola: 1 o 2 righe che iniziano con SE.'),
    },
    {
      who: tag('Dado Games, a board-game shop (fictional)', 'Dado Games, un negozio di giochi da tavolo (fittizio)'),
      brief: t2(
        'Dado Games offers 10% off, but its spreadsheet charges 44 euro for a 40 euro basket. Find the mistake in the formula, then write it correctly.',
        'Dado Games fa il 10% di sconto, ma il suo foglio di calcolo fa pagare 44 euro un carrello da 40. Trova l’errore nella formula, poi scrivila corretta.'),
      asset: {
        mono: true,
        title: t2('The shop’s sheet, box by box', 'Il foglio del negozio, casella per casella'),
        body: t2(
          'B1  40         the basket, in euro\nB2  10%        the discount\nB3  =B1+B1*B2  the price to pay\n= means the sheet works it out.\n* means times. B3 shows 44.',
          'B1  40         il carrello, in euro\nB2  10%        lo sconto\nB3  =B1+B1*B2  il prezzo da pagare\n= vuol dire: il foglio fa il conto.\n* vuol dire per. B3 mostra 44.'),
      },
      steps: [
        t2('Work out what a 40 euro basket should cost.', 'Calcola quanto dovrebbe costare un carrello da 40 euro.'),
        t2('Find the part of the formula that is wrong.', 'Trova la parte sbagliata della formula.'),
        t2('Write the fixed formula, then test it with 40.', 'Scrivi la formula corretta, poi provala con 40.'),
      ],
      mins: 3,
      bar: [
        t2('Your formula gives 36 for 40', 'La tua formula dà 36 per 40'),
        t2('A basket of 100 now costs 90', 'Un carrello da 100 ora costa 90'),
        t2('You can say why the price went up', 'Sai dire perché il prezzo saliva'),
      ],
      twist: t2('Write one line announcing the discount to customers. Post it, or send it to a friend.', 'Scrivi una riga che annunci lo sconto ai clienti. Pubblicala, o mandala a qualcuno.'),
      answer: t2('The price for 40 euro, the wrong part, then the fixed formula.', 'Il prezzo per 40 euro, la parte sbagliata, poi la formula corretta.'),
    },
    {
      who: tag('Sunny Plants, a plant shop (fictional)', 'Sunny Plants, un negozio di piante (fittizio)'),
      brief: t2(
        'Sunny Plants gets many DMs (private messages) that just say “price?”. Write 3 rules, “IF the DM says this THEN reply that”, so an automatic reply never guesses.',
        'Sunny Plants riceve tanti DM (messaggi privati) che dicono solo “prezzo?”. Scrivi 3 regole, “SE il DM dice questo ALLORA rispondi quello”, così la risposta automatica non tira mai a indovinare.'),
      asset: {
        mono: false,
        title: t2('The price list and three real DMs', 'Il listino e tre DM veri'),
        body: t2(
          'Prices (euro): fern 35 · cactus 18 · monstera 42\nDM 1: price?\nDM 2: how much for the monstera\nDM 3: can u ship to Bologna\nA rule: IF (the DM says) THEN (the reply)',
          'Prezzi (euro): felce 35 · cactus 18 · monstera 42\nDM 1: prezzo?\nDM 2: quanto costa la monstera\nDM 3: spedite a Bologna?\nUna regola: SE (il DM dice) ALLORA (la risposta)'),
      },
      steps: [
        t2('Write the rule for DM 2, which names a plant.', 'Scrivi la regola per il DM 2, che nomina una pianta.'),
        t2('Write the rule for DM 1, which names no plant.', 'Scrivi la regola per il DM 1, che non nomina piante.'),
        t2('Write a last rule: anything else goes to a person.', 'Scrivi un’ultima regola: tutto il resto va a una persona.'),
      ],
      mins: 4,
      bar: [
        t2('DM 1 gets a question, not a guess', 'Il DM 1 riceve una domanda, non una risposta a caso'),
        t2('DM 3 reaches a real person', 'Il DM 3 arriva a una persona vera'),
        t2('Replies sound like Sunny Plants, not a robot', 'Suonano come Sunny Plants, non come un robot'),
      ],
      twist: t2('Let someone play the customer. Ask them to DM three questions you did not plan for.', 'Fai fare il cliente a qualcuno: chiedi di mandarti tre DM che non avevi previsto.'),
      answer: t2('Three rules, one per line: IF (the DM says) THEN (the reply).', 'Tre regole, una per riga: SE (il DM dice) ALLORA (la risposta).'),
    },
    {
      who: tag('Your neighbour and your basil', 'Chi ti innaffia il basilico'),
      brief: t2(
        'Your neighbour Nico waters your basil tomorrow and does exactly what you write, like a robot. Write the steps using only DO, REPEAT … UNTIL and IF lines.',
        'Domani il tuo vicino Nico innaffia il basilico e fa esattamente quello che scrivi, come un robot. Scrivi i passaggi usando solo righe FAI, RIPETI … FINCHÉ e SE.'),
      asset: {
        mono: true,
        title: t2('The robot only understands 3 kinds of line', 'Il robot capisce solo 3 tipi di riga'),
        body: t2(
          'DO      one small action\nREPEAT  an action UNTIL you can see a result\nIF      something is true THEN an action\nThe basil sits on the windowsill, in a pot with a saucer.\nThe watering can is under the sink.\nThe tap is in the kitchen.',
          'FAI     una piccola azione\nRIPETI  un’azione FINCHÉ vedi un risultato\nSE      qualcosa è vero ALLORA un’azione\nIl basilico sta sul davanzale, in un vaso con il sottovaso.\nL’annaffiatoio è sotto il lavandino.\nIl rubinetto è in cucina.'),
      },
      steps: [
        t2('Write the watering steps, one DO per line.', 'Scrivi i passaggi per innaffiare, un FAI per riga.'),
        t2('Add one REPEAT and one IF the robot can check.', 'Aggiungi un RIPETI e un SE che il robot può controllare.'),
        t2('Follow the steps like the robot: never guess.', 'Segui i passaggi come il robot: mai tirare a indovinare.'),
      ],
      mins: 5,
      bar: [
        t2('The robot never has to guess', 'Il robot non deve mai tirare a indovinare'),
        t2('Your REPEAT stops on something visible', 'Il RIPETI si ferma su qualcosa di visibile'),
        t2('It handles a plant that is already wet', 'Gestisce una pianta già bagnata'),
      ],
      twist: t2('Send the steps to a friend. Ask which line was unclear.', 'Manda i passaggi a qualcuno e chiedi quale riga non era chiara.'),
      answer: t2('The robot’s steps, one per line, each starting with DO, REPEAT or IF.', 'I passaggi del robot, uno per riga, ognuno inizia con FAI, RIPETI o SE.'),
    },
  ],

  Video: [
    {
      who: tag('Tosta, a toasted-sandwich van (fictional)', 'Tosta, un furgone di toast (fittizio)'),
      brief: t2(
        'Rocco’s 15-second clip at the Tosta sandwich van starts slowly, so people scroll away. Pick the pieces to keep, 6 seconds or less in total, with the best moment first.',
        'La clip di 15 secondi di Rocco al furgone dei toast Tosta parte lenta e la gente tira dritto. Scegli i pezzi da tenere, 6 secondi al massimo in tutto, con il momento migliore per primo.'),
      asset: {
        mono: true,
        video: '/media/tosta.mp4',
        title: t2('The clip, second by second', 'La clip, secondo per secondo'),
        body: t2(
          '0-3s    Rocco walks to the van\n3-7s    Reads the menu, waits\n7-9s    The sandwich press closes\n9-11s   The sandwich lifts, the cheese stretches long\n11-13s  First bite, his eyes go wide\n13-15s  Walks off, waves at the van',
          '0-3s    Rocco cammina verso il furgone\n3-7s    Legge il menu, aspetta\n7-9s    La piastra si chiude\n9-11s   Il toast si alza, il formaggio fila lunghissimo\n11-13s  Primo morso, gli occhi si spalancano\n13-15s  Se ne va e saluta il furgone'),
      },
      steps: [
        t2('Watch the clip and pick the best moment.', 'Guarda la clip e scegli il momento migliore.'),
        t2('Write the seconds of each piece, best moment first.', 'Scrivi i secondi di ogni pezzo, il momento migliore per primo.'),
        t2('Check: 6 seconds or less, no walking or waiting.', 'Controlla: 6 secondi al massimo, niente camminate né attese.'),
      ],
      mins: 2,
      bar: [
        t2('It opens on the best moment', 'Parte dal momento migliore'),
        t2('The total is 6 seconds or less', 'Il totale è al massimo 6 secondi'),
        t2('No walking, no waiting', 'Niente camminate né attese'),
      ],
      twist: t2('Do the same cut on one of your own clips and post it tonight.', 'Fai lo stesso taglio su una tua clip e pubblicala stasera.'),
      answer: t2('The pieces you keep, as seconds from the list, best first. 6 seconds or less in total.', 'I pezzi che tieni, in secondi come nell’elenco, il migliore per primo. 6 secondi al massimo in tutto.'),
    },
    {
      who: tag('Zumo, a pocket speaker (fictional)', 'Zumo, una cassa tascabile (fittizia)'),
      brief: t2(
        'Your Zumo speaker is gone and cousin Bea looks too innocent. Plan a 10-second POV clip (the phone is your eyes): 3 shots, with seconds and text on screen.',
        'La tua cassa Zumo è sparita e la cugina Bea sembra fin troppo innocente. Pianifica una clip POV di 10 secondi (il telefono sono i tuoi occhi): 3 inquadrature, con secondi e testo a schermo.'),
      asset: {
        mono: false,
        title: t2('The rules of the clip', 'Le regole della clip'),
        body: t2(
          'Length: 10 seconds, one phone, filmed in one go\nWhere: the living room\nClues: an empty shelf, a loose cable, one innocent face\nShot 1 must show the empty shelf\nText on screen: 6 words or fewer per shot',
          'Durata: 10 secondi, un telefono, girata tutta di fila\nDove: il salotto\nIndizi: uno scaffale vuoto, un cavo penzoloni, una faccia innocente\nL’inquadratura 1 deve mostrare lo scaffale vuoto\nTesto a schermo: massimo 6 parole per inquadratura'),
      },
      steps: [
        t2('Describe 3 shots, one line each, empty shelf first.', 'Descrivi 3 inquadrature, una riga ciascuna, prima lo scaffale vuoto.'),
        t2('Add the seconds and the text on screen to each.', 'Aggiungi a ognuna i secondi e il testo a schermo.'),
        t2('Check: exactly 10 seconds, each text 6 words or fewer.', 'Controlla: esattamente 10 secondi, ogni testo al massimo 6 parole.'),
      ],
      mins: 3,
      bar: [
        t2('Seconds add up to exactly 10', 'I secondi fanno esattamente 10'),
        t2('It opens on the empty shelf', 'Parte dallo scaffale vuoto'),
        t2('Every text is 6 words or fewer', 'Ogni testo ha al massimo 6 parole'),
      ],
      twist: t2('Copy it and send it to someone who will laugh. Or film it tonight and post it.', 'Copialo e mandalo a qualcuno che si farà una risata. Oppure giralo stasera e pubblicalo.'),
      answer: t2('3 shots, one per line: seconds, what we see, text on screen. 10 seconds in total.', '3 inquadrature, una per riga: secondi, cosa si vede, testo a schermo. 10 secondi in tutto.'),
    },
    {
      who: tag('Biggest awkward moment, for two', 'La figuraccia più grande, in due'),
      brief: t2(
        'One person tells the story of an awkward moment in a 20-second clip, the other asks questions from behind the phone. Write 3 questions and a short answer to each.',
        'Una persona racconta una figuraccia in una clip di 20 secondi, l’altra fa domande da dietro il telefono. Scrivi 3 domande e una risposta breve per ognuna.'),
      asset: {
        mono: false,
        title: t2('No awkward moment? Borrow Tino’s', 'Nessuna figuraccia? Usa quella di Tino'),
        body: t2(
          'Tino went to a birthday party dressed as a banana.\nIt was not a costume party, and it was 32 degrees.\nNobody said a word. One kid asked: “Are you a lemon?”',
          'Tino è andato a una festa di compleanno vestito da banana.\nNon era una festa in maschera, e c’erano 32 gradi.\nNessuno ha detto niente. Un bambino ha chiesto: “Sei un limone?”'),
      },
      steps: [
        t2('Pick the story: yours, or Tino’s.', 'Scegli la storia: la tua o quella di Tino.'),
        t2('Write 3 questions, to ask at 0s, 7s and 14s.', 'Scrivi 3 domande, da fare a 0s, 7s e 14s.'),
        t2('Answer each one in 12 words or fewer.', 'Rispondi a ognuna in 12 parole al massimo.'),
      ],
      mins: 3,
      bar: [
        t2('Questions at 0s, 7s and 14s', 'Domande a 0s, 7s e 14s'),
        t2('Each is a question, never an order', 'Ognuna è una domanda, non un ordine'),
        t2('The last answer is the funniest', 'L’ultima risposta è la più divertente'),
      ],
      twist: t2('Copy it. Film it tonight, 20 seconds, and post it or send it to the group chat.', 'Copialo. Giralo stasera, 20 secondi, e pubblicalo o mandalo nel gruppo.'),
      answer: t2('3 questions at 0s, 7s and 14s, each with an answer of 12 words or fewer.', '3 domande a 0s, 7s e 14s, ognuna con una risposta di massimo 12 parole.'),
    },
    {
      who: tag('Pedala, a bike workshop (fictional)', 'Pedala, una ciclofficina (fittizia)'),
      brief: t2(
        'Greta’s 12-second Pedala clip shows her words as one block of tiny text. Split them into subtitles of 5 words or fewer, each on screen for 1.5 seconds or more.',
        'La clip di 12 secondi di Greta per Pedala mostra le sue parole in un unico blocco di testo minuscolo. Dividile in sottotitoli di massimo 5 parole, ognuno a schermo per almeno 1,5 secondi.'),
      asset: {
        mono: true,
        title: t2('What Greta says, and what shows now', 'Cosa dice Greta, e cosa si vede ora'),
        body: t2(
          '0-4s   “Hi, welcome back. Today: flat tyre.”\n4-8s   “Ten minutes, one patch. Only five euros.”\n8-12s  “The culprit? One tiny nail.”\nNow: all 18 words in one block, 0-12s',
          '0-4s   “Ciao, bentornati. Oggi: una gomma a terra.”\n4-8s   “Dieci minuti, una toppa. Solo cinque euro.”\n8-12s  “Il colpevole? Un chiodino.”\nOra: tutte le 18 parole in un blocco, 0-12s'),
      },
      steps: [
        t2('Split Greta’s lines into subtitles of 5 words or fewer.', 'Dividi le frasi di Greta in sottotitoli di massimo 5 parole.'),
        t2('Add start-end seconds to each, at least 1.5 seconds.', 'Aggiungi a ognuno inizio e fine in secondi, per almeno 1,5 secondi.'),
        t2('Check: from 0 to 12 seconds with no gaps.', 'Controlla: da 0 a 12 secondi senza buchi.'),
      ],
      mins: 4,
      bar: [
        t2('5 words or fewer in every subtitle', 'Massimo 5 parole per sottotitolo'),
        t2('None on screen under 1.5 seconds', 'Nessuno resta a schermo meno di 1,5 secondi'),
        t2('No gaps from 0 to 12 seconds', 'Nessun buco da 0 a 12 secondi'),
      ],
      twist: t2('Copy your subtitles. Add them to a clip of your own and post it.', 'Copia i tuoi sottotitoli. Mettili su una tua clip e pubblicala.'),
      answer: t2('Subtitles, one per line: start-end seconds, then the words. From 0 to 12 seconds, no gaps.', 'Sottotitoli, uno per riga: inizio-fine in secondi, poi le parole. Da 0 a 12 secondi, senza buchi.'),
    },
    {
      who: tag('Rotella, a skate shop (fictional)', 'Rotella, un negozio di skate (fittizio)'),
      brief: t2(
        'Rotella’s 10-second clip shows a skateboard push, then the board rolling away. Write what a sports commentator would say: one line per shot, within its word limit.',
        'La clip di 10 secondi di Rotella mostra una spinta su uno skate, poi la tavola che se ne va. Scrivi cosa direbbe un telecronista sportivo: una riga per inquadratura, rispettando il suo limite di parole.'),
      asset: {
        mono: true,
        video: '/media/skate.mp4',
        title: t2('The 4 shots, and how many words fit', 'Le 4 inquadrature, e quante parole ci stanno'),
        body: t2(
          '0-2s   Board on the pavement, wheels still · up to 4 words\n2-5s   One foot on, one hard push · up to 6 words\n5-8s   Close-up: the wheels roll · up to 6 words\n8-10s  The empty street: gone · up to 4 words',
          '0-2s   Tavola sul marciapiede, ruote ferme · fino a 4 parole\n2-5s   Un piede sopra, una spinta forte · fino a 6 parole\n5-8s   Primo piano: le ruote girano · fino a 6 parole\n8-10s  La strada vuota: sparito · fino a 4 parole'),
      },
      steps: [
        t2('Watch the clip and read each shot’s word limit.', 'Guarda la clip e leggi il limite di parole di ogni inquadratura.'),
        t2('Write one line per shot, like a sports commentator.', 'Scrivi una riga per inquadratura, come un telecronista sportivo.'),
        t2('Check: every line is within its word limit.', 'Controlla: ogni riga sta nel suo limite di parole.'),
      ],
      mins: 4,
      bar: [
        t2('Every line fits its word limit', 'Ogni riga rispetta il suo limite'),
        t2('It sounds like a real commentator', 'Sembra una vera telecronaca'),
        t2('The last line makes someone smile', 'L’ultima riga fa sorridere'),
      ],
      twist: t2('Say “Rotella” once, in the last line, without sounding like an ad. Then send it as a voice note.', 'Di’ “Rotella” una volta, nell’ultima riga, senza sembrare una pubblicità. Poi mandalo in un vocale.'),
      answer: t2('4 lines, one per shot in order, each within its limit: 4, 6, 6 and 4 words.', '4 righe, una per inquadratura in ordine, ognuna nel suo limite: 4, 6, 6 e 4 parole.'),
    },
    {
      who: tag('Taglio Tondo, a barber shop (fictional)', 'Taglio Tondo, un barbiere (fittizio)'),
      brief: t2(
        'Ivo commented under Taglio Tondo’s video that a €15 haircut costs too much. Plan a calm 12-second video reply: 3 shots, each with one line to say.',
        'Ivo ha commentato sotto un video di Taglio Tondo che 15 € per un taglio sono troppi. Pianifica una risposta video calma di 12 secondi: 3 inquadrature, ognuna con una frase da dire.'),
      asset: {
        mono: false,
        title: t2('The comment, and what is true', 'Il commento, e cosa è vero'),
        body: t2(
          'Ivo: “€15 for a haircut?! Mine costs €10.”\nTrue: every cut gets 30 full minutes\nTrue: a hot towel and a neck shave are included\nTone: friendly, no sarcasm, no arguing with Ivo',
          'Ivo: “15 € per un taglio?! Il mio costa 10 €.”\nVero: ogni taglio dura 30 minuti pieni\nVero: asciugamano caldo e rasatura del collo inclusi\nTono: amichevole, niente sarcasmo, non discutere con Ivo'),
      },
      steps: [
        t2('Describe 3 shots with seconds, the comment first.', 'Descrivi 3 inquadrature con i secondi, prima il commento.'),
        t2('Add one spoken line per shot, 8 words or fewer.', 'Aggiungi una frase da dire per inquadratura, massimo 8 parole.'),
        t2('Check: 12 seconds in total, no arguing.', 'Controlla: 12 secondi in tutto, niente discussioni.'),
      ],
      mins: 5,
      bar: [
        t2('Shot 1 shows the comment on screen', 'L’inquadratura 1 mostra il commento'),
        t2('Seconds add up to exactly 12', 'I secondi fanno esattamente 12'),
        t2('It answers Ivo without arguing', 'Risponde a Ivo senza discutere'),
      ],
      twist: t2('Copy it and send it to someone you know. Or film it for real.', 'Copialo e mandalo a qualcuno che conosci. Oppure giralo davvero.'),
      answer: t2('3 shots, one per line: seconds, what we see, what you say (8 words or fewer). 12 seconds in total.', '3 inquadrature, una per riga: secondi, cosa si vede, cosa dici (massimo 8 parole). 12 secondi in tutto.'),
    },
  ],

  Selling: [
    {
      who: tag('Giulia’s lamp on Subito', 'la lampada di Giulia su Subito'),
      brief: t2(
        'Giulia’s €10 desk lamp has sat on Subito, a second-hand app, for 3 weeks with zero messages. Write a new title and 3 short lines, all true.',
        'La lampada da scrivania di Giulia, 10 €, è su Subito (un’app dell’usato) da 3 settimane e non ha ricevuto nemmeno un messaggio. Scrivi un nuovo titolo e 3 righe brevi, tutte vere.'),
      asset: {
        mono: false,
        img: '/img/m/lamp.webp',
        title: t2('Giulia’s ad now, and the true facts', 'L’annuncio di Giulia ora, e i fatti veri'),
        body: t2(
          'TITLE: used lamp\nPRICE: €10\nTEXT: “used lamp, 10 euro, write me”\n\nTRUE: black metal desk lamp, 40 cm tall, bulb included\nTRUE: works fine, small chip of paint on the base\nTRUE: pickup in Bologna, or she ships',
          'TITOLO: lampada usata\nPREZZO: 10 €\nTESTO: “lampada usata, 10 euro, scrivetemi”\n\nVERO: lampada da scrivania nera in metallo, alta 40 cm, lampadina inclusa\nVERO: funziona bene, piccola scheggiatura di vernice sulla base\nVERO: ritiro a Bologna, oppure spedisce'),
      },
      steps: [
        t2('Write a title: what it is, colour and size.', 'Scrivi un titolo: cos’è, colore e altezza.'),
        t2('Write 3 short true lines, the paint chip included.', 'Scrivi 3 righe brevi e vere, scheggiatura compresa.'),
        t2('Check: price and pickup are in, nothing made up.', 'Controlla: ci sono prezzo e ritiro, niente di inventato.'),
      ],
      mins: 2,
      bar: [
        t2('Starts with what it is, colour and size', 'Inizia con cos’è, colore e altezza'),
        t2('Every line is true, the chip included', 'Ogni riga è vera, scheggiatura compresa'),
        t2('Ends with price and how to get it', 'Finisce con il prezzo e come averla'),
      ],
      twist: t2('Copy it. Swap in something you really want to sell, or send it to a friend with a pile of stuff.', 'Copialo. Al posto della lampada metti una cosa che vuoi vendere davvero, o mandalo a chi ha una pila di roba da vendere.'),
      answer: t2('One title, then 3 short lines. True facts only.', 'Un titolo, poi 3 righe brevi. Solo fatti veri.'),
    },
    {
      who: tag('Ardi, a hot sauce (fictional)', 'Ardi, una salsa piccante (fittizia)'),
      brief: t2(
        'Ardi, a hot sauce, wants a 15-second phone video that feels real. Write 3 parts: what you say first, what you show, what viewers should do.',
        'Ardi, una salsa piccante, vuole un video di 15 secondi col telefono che sembri vero. Scrivi 3 parti: cosa dici all’inizio, cosa mostri, cosa deve fare chi guarda.'),
      asset: {
        mono: false,
        title: t2('The sauce: facts and rules', 'La salsa: fatti e regole'),
        body: t2(
          'PRODUCT: Ardi hot sauce, 150 ml bottle, €6, sold at delis\nTRUE: made from red chilli, garlic and vinegar\nTRUE: medium heat, warm but not painful\nPARTS: OPENING (first 3 seconds, makes people stop), SHOW (one thing the camera sees), ASK (one thing viewers can do)\nLENGTH: 15 seconds out loud, about 40 words\nNEVER: “best ever”, fake reviews, health promises',
          'PRODOTTO: salsa piccante Ardi, bottiglia da 150 ml, 6 €, in vendita nelle gastronomie\nVERO: fatta con peperoncino rosso, aglio e aceto\nVERO: piccantezza media: scalda ma non fa male\nPARTI: INIZIO (primi 3 secondi, fa fermare chi scorre), COSA MOSTRI (una cosa che si vede nel video), RICHIESTA (una cosa che chi guarda può fare)\nDURATA: 15 secondi a voce, circa 40 parole\nMAI: “la migliore di sempre”, finte recensioni, promesse sulla salute'),
      },
      steps: [
        t2('Write the OPENING: one line for the first 3 seconds.', 'Scrivi l’INIZIO: una riga per i primi 3 secondi.'),
        t2('Write what you SHOW: one thing the camera sees.', 'Scrivi COSA MOSTRI: una cosa che si vede nel video.'),
        t2('Write the ASK: one small thing viewers can do.', 'Scrivi la RICHIESTA: una piccola cosa che chi guarda può fare.'),
      ],
      mins: 3,
      bar: [
        t2('The OPENING makes people stop scrolling', 'L’INIZIO fa fermare chi scorre'),
        t2('Shows something real, not just talk', 'Mostra qualcosa di vero, non solo parole'),
        t2('15 seconds or less, nothing false', '15 secondi al massimo, niente di falso'),
      ],
      twist: t2('Time it out loud. Swap in something you really like, then film it or send it to a friend.', 'Leggilo ad alta voce col cronometro. Al posto della salsa metti una cosa che ti piace davvero, poi giralo o mandalo a qualcuno.'),
      answer: t2('Three lines: OPENING, SHOW, ASK. 15 seconds out loud, about 40 words.', 'Tre righe: INIZIO, COSA MOSTRI, RICHIESTA. 15 secondi a voce, circa 40 parole.'),
    },
    {
      who: tag('Quokka Vintage, a market stall (fictional)', 'Quokka Vintage, un banco al mercatino (fittizio)'),
      brief: t2(
        'You run Quokka Vintage’s market stall, and a buyer wants the €45 denim jacket for €30. Answer their 2 messages: a true reason first, then a friendly final price.',
        'Hai il banco di Quokka Vintage al mercatino, e chi compra vuole la giacca di jeans da 45 € a 30 €. Rispondi ai suoi 2 messaggi: prima un motivo vero, poi un prezzo finale detto con gentilezza.'),
      asset: {
        mono: false,
        img: '/img/m/jacket.webp',
        title: t2('The jacket and the buyer’s 2 messages', 'La giacca e i 2 messaggi di chi compra'),
        body: t2(
          'JACKET: denim, size M, faded blue, price €45\nTRUE: no stains, one button replaced\nYOUR LOWEST PRICE: €38\nBUYER: wants it for a festival\nMESSAGE 1: “Can you do €30?”\nMESSAGE 2: “Hmm. €35, then?”',
          'GIACCA: di jeans, taglia M, blu scolorito, prezzo 45 €\nVERO: nessuna macchia, un bottone sostituito\nIL TUO PREZZO MINIMO: 38 €\nCHI COMPRA: la vuole per un festival\nMESSAGGIO 1: “Mi fai 30 €?”\nMESSAGGIO 2: “Mmh. Allora 35 €?”'),
      },
      steps: [
        t2('Answer “€30?” with one true reason, no new price.', 'Rispondi a “30 €?” con un motivo vero, senza un nuovo prezzo.'),
        t2('Answer “€35?” with a final price of €38 or more.', 'Rispondi a “35 €?” con un prezzo finale da 38 € in su.'),
        t2('Check: kind words, no fake rush or other buyer.', 'Controlla: parole gentili, niente fretta finta né altri interessati inventati.'),
      ],
      mins: 3,
      bar: [
        t2('A true reason comes before any price', 'Un motivo vero arriva prima di ogni prezzo'),
        t2('Final price €38 or more, said kindly', 'Prezzo finale da 38 € in su, detto con gentilezza'),
        t2('No fake other buyer, no fake rush', 'Nessun altro interessato inventato, nessuna fretta finta'),
      ],
      twist: t2('Copy your final reply. Send it to a friend who never asks for a lower price.', 'Copia la tua risposta finale. Mandala a qualcuno che non chiede mai uno sconto.'),
      answer: t2('Two short replies: one to “€30?”, one to “€35?” with your final price.', 'Due risposte brevi: una a “30 €?”, una a “35 €?” con il tuo prezzo finale.'),
    },
    {
      who: tag('Cera Cera, a candle shop (fictional)', 'Cera Cera, un negozio di candele (fittizio)'),
      brief: t2(
        'Cera Cera, a small candle shop, sent Sara a pushy DM (private message) and got no reply. Rewrite it so it sounds like a person offering a free candle.',
        'Cera Cera, un piccolo negozio di candele, ha mandato a Sara un DM (messaggio privato) insistente e non ha avuto risposta. Riscrivilo in modo che sembri una persona che le offre una candela gratis.'),
      asset: {
        mono: false,
        title: t2('The message Sara ignored, and the facts', 'Il messaggio che Sara ha ignorato, e i fatti'),
        body: t2(
          'SENT: “Hi dear!!! BEST candles in town 🔥 Collab alert, only TODAY, DM us NOW!!”\nTRUE: Sara posts study-desk videos for about 2,300 followers\nTRUE: her story: “my flat smells of nothing”\nTRUE: Cera Cera is 3 people pouring candles by hand in Turin\nTRUE: you can send her one free Fig Leaf candle (€18)\nTRUE: no post required; if she posts, she says it is a gift',
          'INVIATO: “Ciao cara!!! Le MIGLIORI candele della città 🔥 Collab alert, solo OGGI, scrivici ORA!!”\nVERO: Sara posta video dalla scrivania mentre studia, con circa 2.300 follower\nVERO: in una sua storia ha scritto: “casa mia non sa di niente”\nVERO: Cera Cera sono in 3 e fanno le candele a mano a Torino\nVERO: puoi mandarle gratis una candela Fig Leaf (18 €)\nVERO: non deve postare niente; se lo fa, dice che è un regalo'),
      },
      steps: [
        t2('Name the 2 parts that sound most like spam.', 'Indica le 2 parti che suonano più da spam.'),
        t2('Write a new message using something Sara said.', 'Scrivi un nuovo messaggio usando qualcosa che ha detto Sara.'),
        t2('Check: 45 words or fewer, ending with an easy question.', 'Controlla: 45 parole al massimo, e alla fine una domanda facile.'),
      ],
      mins: 4,
      bar: [
        t2('Says who you are and that it’s free', 'Dice chi sei e che è gratis'),
        t2('Uses something real that Sara said', 'Usa qualcosa di vero che ha detto Sara'),
        t2('No rush, and easy to say no', 'Nessuna fretta, e facile dire di no'),
      ],
      twist: t2('Copy it. Send it to a friend with a tiny shop, or save it for yours.', 'Copialo. Mandalo a qualcuno con un piccolo negozio, o tienilo per il tuo.'),
      answer: t2('The 2 spam parts, then your new message in 45 words or fewer.', 'Le 2 parti da spam, poi il tuo nuovo messaggio in 45 parole al massimo.'),
    },
    {
      who: tag('Gnomo Prints, screen-printed goods (fictional)', 'Gnomo Prints, oggetti serigrafati (fittizio)'),
      brief: t2(
        'Gnomo Prints can make only one new €8 product: stickers or postcards. Write a story poll, a question with 2 answers to tap, that shows which one people would buy.',
        'Gnomo Prints può fare un solo nuovo prodotto da 8 €: adesivi o cartoline. Scrivi un sondaggio nelle storie, una domanda con 2 risposte da toccare, che faccia capire quale comprerebbero.'),
      asset: {
        mono: false,
        title: t2('The two ideas and the rules', 'Le due idee e le regole'),
        body: t2(
          'IDEA A: a pack of 6 stickers\nIDEA B: a set of 4 postcards\nBOTH: €8, screen-printed by hand\nQUESTION: short, with the real price\nOPTIONS: 4 words or fewer each\nNEVER: “only 10 left!”, fake rush, made-up numbers',
          'IDEA A: un pacchetto da 6 adesivi\nIDEA B: un set da 4 cartoline\nENTRAMBE: 8 €, serigrafate a mano\nDOMANDA: breve, con il prezzo vero\nOPZIONI: 4 parole al massimo ciascuna\nMAI: “ne restano solo 10!”, finta fretta, numeri inventati'),
      },
      steps: [
        t2('Write the poll question, with the €8 price in it.', 'Scrivi la domanda del sondaggio, con dentro il prezzo di 8 €.'),
        t2('Write 2 options, 4 words or fewer each.', 'Scrivi 2 opzioni, 4 parole al massimo ciascuna.'),
        t2('Add one honest line on why you are asking.', 'Aggiungi una riga onesta sul perché lo chiedi.'),
      ],
      mins: 4,
      bar: [
        t2('The question names the real price', 'La domanda dice il prezzo vero'),
        t2('Both options are easy to picture', 'Entrambe le opzioni si immaginano subito'),
        t2('No fake rush, no made-up numbers', 'Niente finta fretta, niente numeri inventati'),
      ],
      twist: t2('Copy it. Post it on your story with any two real choices, then count the votes.', 'Copialo. Pubblicalo nelle tue storie con due scelte vere, poi conta i voti.'),
      answer: t2('One question with €8 in it, 2 options of up to 4 words, one line on why you ask.', 'Una domanda con dentro 8 €, 2 opzioni di massimo 4 parole, una riga sul perché lo chiedi.'),
    },
    {
      who: tag('a buyer who goes quiet', 'chi compra e poi sparisce'),
      brief: t2(
        'Someone asks “Is it still available?” about your €80 guitar. Write your reply, and a kind reminder for when they go quiet for two days.',
        'Qualcuno chiede “È ancora disponibile?” per la tua chitarra da 80 €. Scrivi la tua risposta e un promemoria gentile per quando sparisce due giorni.'),
      asset: {
        mono: false,
        img: '/img/m/guitar.webp',
        title: t2('Your guitar ad and the chat', 'Il tuo annuncio della chitarra e la chat'),
        body: t2(
          'YOUR AD: acoustic guitar with soft case, €80, pickup in Padova\nTRUE: new tuning pegs (the knobs that tune it) in March, strings are old\nTRUE: small scratch on the back, no tuner\nBUYER SENT: “Is it still available?”\nYOUR REPLY: (you write it)\nTHEN: no answer for two days',
          'IL TUO ANNUNCIO: chitarra acustica con custodia morbida, 80 €, ritiro a Padova\nVERO: meccaniche nuove (le chiavi per accordarla) a marzo, corde vecchie\nVERO: piccolo graffio sul retro, accordatore non incluso\nCHI COMPRA HA SCRITTO: “È ancora disponibile?”\nLA TUA RISPOSTA: (la scrivi tu)\nPOI: nessuna risposta per due giorni'),
      },
      steps: [
        t2('Write your reply to “Is it still available?”', 'Scrivi la tua risposta a “È ancora disponibile?”'),
        t2('Write a kind reminder for two days later.', 'Scrivi un promemoria gentile per due giorni dopo.'),
        t2('Check: reply 25 words or fewer, no pressure.', 'Controlla: risposta di 25 parole al massimo, nessuna pressione.'),
      ],
      mins: 4,
      bar: [
        t2('The reply says yes and adds one fact', 'La risposta dice sì e aggiunge un fatto'),
        t2('The reply ends with an easy question', 'La risposta finisce con una domanda facile'),
        t2('The reminder adds something new, no pressure', 'Il promemoria aggiunge qualcosa di nuovo, senza pressione'),
      ],
      twist: t2('Copy your reply. Next time someone asks about something you sell, send it.', 'Copia la tua risposta. La prossima volta che qualcuno ti chiede di una cosa che vendi, mandala.'),
      answer: t2('Your reply (25 words or fewer), then your day-two reminder.', 'La tua risposta (25 parole al massimo), poi il promemoria del secondo giorno.'),
    },
  ],

  Music: [
    {
      who: tag('Noa’s get-ready playlist', 'la playlist di Noa per prepararsi'),
      brief: t2(
        'Noa’s friends arrive at 9 tonight, and one song on the playlist kills the mood. Cut it, then put the other five from calm to loud.',
        'Gli amici di Noa arrivano stasera alle 21 e una canzone della playlist rovina l’atmosfera. Toglila, poi metti le altre cinque dalla più calma alla più forte.'),
      asset: {
        mono: false,
        title: t2('Noa’s playlist · how each song feels', 'La playlist di Noa · che effetto fa ogni canzone'),
        body: t2(
          'Mango Static · bright, bouncy\nSad Trombone Tuesday · gloomy, slow\nPocket Sunrise · warm, quiet\nConfetti Cannon · huge, singalong\nTile Floor Groove · relaxed, danceable\nLast Bus Home · dreamy, quiet',
          'Mango Static · allegra, saltellante\nSad Trombone Tuesday · cupa, lenta\nPocket Sunrise · calda, tranquilla\nConfetti Cannon · esplosiva, da cantare\nTile Floor Groove · rilassata, ballabile\nLast Bus Home · sognante, tranquilla'),
      },
      steps: [
        t2('Name the one song to cut.', 'Scrivi la canzone da togliere.'),
        t2('Put the other five from calm to loud.', 'Metti le altre cinque dalla più calma alla più forte.'),
        t2('Add one line on why your order works.', 'Aggiungi una riga su perché questo ordine funziona.'),
      ],
      mins: 2,
      bar: [
        t2('The song you cut would kill the mood', 'La canzone tolta rovinerebbe l’atmosfera'),
        t2('Calm at the start, loudest at the end', 'Calma all’inizio, la più forte alla fine'),
        t2('Your why fits in one line', 'Il tuo perché sta in una riga'),
      ],
      twist: t2('Send the new order to the friend who is always late, with “it only gets louder”.', 'Manda il nuovo ordine a chi arriva sempre in ritardo, con “da qui si sale solo”.'),
      answer: t2('The song you cut, the other five from calm to loud, and one line on why.', 'La canzone che togli, le altre cinque dalla più calma alla più forte e una riga sul perché.'),
    },
    {
      who: tag('Forno Gufo, a bakery (fictional)', 'Forno Gufo, un forno (fittizio)'),
      brief: t2(
        'Forno Gufo is posting a 10-second video for Monday morning. Describe its music in three words and pick the second it comes in (the drop).',
        'Forno Gufo pubblica un video di 10 secondi per lunedì mattina. Descrivi la sua musica in tre parole e scegli il secondo in cui entra (il drop).'),
      asset: {
        mono: true,
        title: t2('The video, second by second', 'Il video, secondo per secondo'),
        body: t2(
          '0s  dark street, roller shutter down\n3s  the shutter rolls up\n5s  dough slaps down, flour flies\n8s  first loaf out of the oven\n9s  “Forno Gufo · open from 6”',
          '0s  strada buia, saracinesca giù\n3s  si alza la saracinesca\n5s  l’impasto sbatte sul banco, vola la farina\n8s  la prima pagnotta dal forno\n9s  “Forno Gufo · aperto dalle 6”'),
      },
      steps: [
        t2('Pick three words for the music.', 'Scegli tre parole per la musica.'),
        t2('Pick the second the music comes in.', 'Scegli il secondo in cui entra la musica.'),
        t2('Add one line on why that second.', 'Aggiungi una riga sul perché di quel secondo.'),
      ],
      mins: 3,
      bar: [
        t2('The music comes in as a scene starts', 'La musica entra quando inizia una scena'),
        t2('A few seconds without music come first', 'Prima ci sono alcuni secondi senza musica'),
        t2('Your three words fit a Monday morning', 'Le tre parole stanno bene a un lunedì mattina'),
      ],
      twist: t2('Write the text that goes under the post, starting “Sound on.” Then redo it for a real shop you love.', 'Scrivi la caption da mettere sotto il post, che inizia con “Alza l’audio.” Poi rifalla per un negozio vero che ami.'),
      answer: t2('Three words for the music, the second it comes in, and one line on why.', 'Tre parole per la musica, il secondo in cui entra e una riga sul perché.'),
    },
    {
      who: tag('Ilaria’s rough day', 'la giornata storta di Ilaria'),
      brief: t2(
        'Ilaria had a terrible day and asks you to say something, but not “it’s fine”. Write 3 lines you’d say in a voice message, and pick one song to send.',
        'Ilaria ha avuto una giornata terribile e ti chiede di dirle qualcosa, ma non “tutto ok”. Scrivi 3 righe che le diresti in un vocale e scegli una canzone da mandarle.'),
      asset: {
        mono: false,
        title: t2('Ilaria’s text', 'Il messaggio di Ilaria'),
        body: t2(
          'worst day ever\nmissed the bus, coffee all over my notes\nthen the exam went badly\nsay something?? not “it’s fine”',
          'giornata peggiore di sempre\nho perso il bus, caffè su tutti gli appunti\npoi l’esame è andato male\ndimmi qualcosa?? ma non “tutto ok”'),
      },
      steps: [
        t2('Read Ilaria’s text and what she asks for.', 'Leggi il messaggio di Ilaria e cosa ti chiede.'),
        t2('Write 3 short lines you’d say to her.', 'Scrivi 3 righe brevi che le diresti.'),
        t2('Name one song to send, and one line why.', 'Scegli una canzone da mandarle e scrivi una riga sul perché.'),
      ],
      mins: 3,
      bar: [
        t2('It sounds like you, not a greeting card', 'Suona come te, non come un biglietto d’auguri'),
        t2('You say something specific, not “it’s fine”', 'Dici qualcosa di preciso, non “tutto ok”'),
        t2('The song fits how they feel right now', 'La canzone rispecchia come si sente adesso'),
      ],
      twist: t2('Record the 3 lines as a voice note and send it with the song to someone who had a rough week.', 'Registra le 3 righe in un vocale e mandalo con la canzone a chi ha avuto una settimana pesante.'),
      answer: t2('3 short lines for Ilaria, then one song and one line on why.', '3 righe brevi per Ilaria, poi una canzone e una riga sul perché.'),
    },
    {
      who: tag('Libro Lento, a bookshop (fictional)', 'Libro Lento, una libreria (fittizia)'),
      brief: t2(
        'Libro Lento’s playlist “Shelf mix 3” has a grey cover and only 12 followers. Give it a new name, a cover and one line on when to press play.',
        'La playlist di Libro Lento, “Shelf mix 3”, ha una cover grigia e solo 12 follower. Dalle un nome nuovo, una cover e una riga su quando premere play.'),
      asset: {
        mono: false,
        img: '/img/m/playlist-en.webp', imgIt: '/img/m/playlist-it.webp', only: true,
        title: t2('The playlist as it is now', 'La playlist com’è adesso'),
        body: t2(
          'Name: Shelf mix 3\nCover: grey default squares\nAbout: (empty)\nFollowers: 12\nMood: quiet piano, rainy days',
          'Nome: Shelf mix 3\nCover: quadrati grigi di default\nInfo: (vuota)\nFollower: 12\nAtmosfera: pianoforte calmo, giorni di pioggia'),
      },
      steps: [
        t2('Write a new name, four words or fewer.', 'Scrivi un nuovo nome, quattro parole al massimo.'),
        t2('Pick the cover: one colour and one object.', 'Scegli la cover: un colore e un oggetto.'),
        t2('Write one line: when should a stranger press play?', 'Scrivi una riga: quando conviene premere play?'),
      ],
      mins: 3,
      bar: [
        t2('The name sounds like the mood', 'Il nome suona come l’atmosfera'),
        t2('The cover has one colour, one object', 'La cover ha un colore e un oggetto'),
        t2('The line says when to press play', 'La riga dice quando premere play'),
      ],
      twist: t2('Write a second name, as silly as you dare. Send both to a friend: which would they tap?', 'Scrivi un secondo nome, il più assurdo che ti viene. Mandali tutti e due a chi vuoi: quale aprirebbe?'),
      answer: t2('A new name (four words or fewer), the cover’s colour and object, and when to press play.', 'Un nome nuovo (quattro parole al massimo), colore e oggetto della cover, e quando premere play.'),
    },
    {
      who: tag('Clank Gym (fictional)', 'Clank Gym (fittizia)'),
      brief: t2(
        'Clank Gym wants a strong, steady beat for its videos. Build it on the grid: kick is the deep thump, snare the clap, hat the light tick.',
        'Clank Gym vuole un ritmo forte e costante per i suoi video. Costruiscilo sulla griglia: la cassa è il colpo profondo, il rullante il battimani, l’hi-hat il tic leggero.'),
      asset: {
        mono: true,
        title: t2('Your empty grid', 'La tua griglia vuota'),
        body: t2(
          'Step   1 2 3 4 5 6 7 8\nKick   . . . . . . . .  fist\nSnare  . . . . . . . .  clap\nHat    . . . . . . . .  tap\nX = hit, . = rest · plays 4 times',
          'Passo     1 2 3 4 5 6 7 8\nCassa     . . . . . . . .  pugno\nRullante  . . . . . . . .  mani\nHi-hat    . . . . . . . .  dito\nX = colpo, . = pausa · ripeti 4 volte'),
      },
      steps: [
        t2('Tap boxes in the grid below to add hits.', 'Tocca le caselle della griglia qui sotto per aggiungere colpi.'),
        t2('Press Play and change it until it feels strong.', 'Premi Suona e cambialo finché non ti sembra forte.'),
        t2('Check: 2-3 kicks, 1-2 snares, never on the same step.', 'Controlla: 2-3 casse, 1-2 rullanti, mai sullo stesso passo.'),
      ],
      mins: 4,
      bar: [
        t2('2-3 kicks, 1-2 snares, never together', '2-3 casse, 1-2 rullanti, mai insieme'),
        t2('The hat leaves at least one rest', 'L’hi-hat lascia almeno una pausa'),
        t2('It feels steady and strong, like lifting', 'Sembra stabile e forte, come sollevare pesi'),
      ],
      twist: t2('Tap it on a table (fist, clap, fingertip), then send the grid to a friend: can they tap it back?', 'Battilo su un tavolo (pugno, mani, dito), poi manda la griglia a qualcuno: riesce a ribatterlo?'),
      answer: t2('Your grid: 2-3 kicks, 1-2 snares, X for a hit, a dot for a rest.', 'La tua griglia: 2-3 casse, 1-2 rullanti, X per un colpo, un punto per una pausa.'),
    },
    {
      who: tag('Tiny Pan, a cooking channel (fictional)', 'Tiny Pan, un canale di cucina (fittizio)'),
      brief: t2(
        'Tiny Pan films cooking in a student room with one hotplate. Write its hook: 4 short, catchy lines that people hum.',
        'Tiny Pan gira video di cucina in una stanza da studente, con un solo fornello. Scrivi il suo hook: 4 righe brevi e orecchiabili da canticchiare.'),
      asset: {
        mono: false,
        title: t2('What each line does', 'Cosa fa ogni riga'),
        body: t2(
          'Line 1: sets the scene\nLine 2: a small disaster\nLine 3: a surprise\nLine 4: says “Tiny Pan”\nSeven words or fewer per line\nEnd lines 2 and 4 on a rhyme',
          'Riga 1: apre la scena\nRiga 2: un piccolo disastro\nRiga 3: una sorpresa\nRiga 4: dice “Tiny Pan”\nSette parole al massimo a riga\nLe righe 2 e 4 finiscono in rima'),
      },
      steps: [
        t2('Write lines 1 and 2: the scene, then a small disaster.', 'Scrivi le righe 1 e 2: la scena, poi un piccolo disastro.'),
        t2('Write lines 3 and 4: a surprise, then “Tiny Pan”.', 'Scrivi le righe 3 e 4: una sorpresa, poi “Tiny Pan”.'),
        t2('Check: seven words or fewer, lines 2 and 4 rhyme.', 'Controlla: sette parole al massimo, le righe 2 e 4 in rima.'),
      ],
      mins: 5,
      bar: [
        t2('It rhymes without sounding forced', 'Fa rima senza forzature'),
        t2('Line 3 surprises instead of repeating', 'La riga 3 sorprende, non ripete'),
        t2('You can say it without tripping', 'Si dice senza inciampare'),
      ],
      twist: t2('Say it into a voice note and send it to a friend. Singing is optional.', 'Dilla in un vocale e mandala a chi vuoi. Cantare è facoltativo.'),
      answer: t2('Four lines, seven words or fewer each, with lines 2 and 4 rhyming.', 'Quattro righe, sette parole al massimo ciascuna, con le righe 2 e 4 in rima.'),
    },
  ],
  // Prompting: the missions are about telling an AI what you want. The answer is always the prompt you write, never the AI's reply, so nothing here needs an AI to run.
  Prompting: [
    {
      who: tag('Argilla Studio, a pottery studio (fictional)', 'Argilla Studio, un laboratorio di ceramica (fittizio)'),
      brief: t2(
        'Dana, a pottery teacher, typed a one-line prompt (what you type to an AI) and got a boring post. Rewrite it with her class facts and the way she talks.',
        'Dana, insegnante di ceramica, ha scritto un prompt di una riga (quello che scrivi a un’AI) e ha ricevuto un post noioso. Riscrivilo con i fatti del corso e il suo modo di parlare.'),
      asset: {
        mono: false,
        title: t2('Dana’s prompt, the AI’s post, the facts', 'Il prompt di Dana, il post dell’AI, i fatti'),
        body: t2(
          'Dana typed: Write a post about my pottery class.\nThe AI wrote: Join our amazing pottery class! Unleash your creativity and have fun. Book now!\n\nThe class: Saturdays at 10:00 · 6 seats · €35, clay included\nYou take your bowl home after it is baked\nNo experience needed\nDana laughs at every wobbly bowl, her own too',
          'Dana ha scritto: Scrivi un post sul mio corso di ceramica.\nL’AI ha scritto: Unisciti al nostro fantastico corso di ceramica! Libera la tua creatività e divertiti. Prenota ora!\n\nIl corso: ogni sabato alle 10:00 · 6 posti · 35 €, argilla inclusa\nLa ciotola la porti a casa dopo la cottura\nNon serve esperienza\nDana ride di ogni ciotola storta, anche delle sue'),
      },
      steps: [
        t2('Start from Dana’s line and add at least 3 facts.', 'Parti dalla riga di Dana e aggiungi almeno 3 fatti.'),
        t2('Say who the post is for, like total beginners.', 'Di’ per chi è il post, per esempio chi parte da zero.'),
        t2('Add 3 words for how Dana talks.', 'Aggiungi 3 parole su come parla Dana.'),
      ],
      mins: 3,
      bar: [
        t2('At least 3 facts from the list', 'Almeno 3 fatti dell’elenco'),
        t2('It says who the post is for', 'Dice per chi è il post'),
        t2('It says how Dana talks in 3 words', 'Dice come parla Dana in 3 parole'),
      ],
      twist: t2('Paste your prompt into any AI and set its answer next to the old one. Keep the version you would post.', 'Incolla il prompt in una qualsiasi AI e metti la risposta accanto alla vecchia. Tieni la versione che pubblicheresti.'),
      answer: t2('Your prompt, as you would send it to the AI: at least 3 facts, who it is for, how Dana talks.', 'Il tuo prompt, così come lo manderesti all’AI: almeno 3 fatti, per chi è, come parla Dana.'),
    },
    {
      who: tag('Sofia’s exam week', 'la settimana d’esame di Sofia'),
      brief: t2(
        'Rereading her notes for Thursday’s biology exam is not helping Sofia. Write a prompt (what you type to an AI) so the AI asks her questions, one at a time.',
        'Rileggere gli appunti per l’esame di biologia di giovedì non sta aiutando Sofia. Scrivi un prompt (quello che scrivi a un’AI) perché l’AI le faccia domande, una alla volta.'),
      asset: {
        mono: false,
        title: t2('Sofia’s notes', 'Gli appunti di Sofia'),
        body: t2(
          'The cell\nMitochondria: make energy (ATP)\nNucleus: holds the DNA\nRibosomes: build proteins\nMembrane: decides what gets in\nExam: Thursday, 10 questions, no notes',
          'La cellula\nMitocondri: producono energia (ATP)\nNucleo: contiene il DNA\nRibosomi: costruiscono le proteine\nMembrana: decide cosa entra\nEsame: giovedì, 10 domande, senza appunti'),
      },
      steps: [
        t2('Tell the AI: one question at a time, then wait.', 'Di’ all’AI: una domanda alla volta, poi aspetta.'),
        t2('Say what it does when Sofia gets one wrong.', 'Di’ cosa fa quando Sofia sbaglia una risposta.'),
        t2('Add Sofia’s notes at the end of your prompt.', 'Aggiungi gli appunti di Sofia in fondo al prompt.'),
      ],
      mins: 3,
      bar: [
        t2('One question at a time, then it waits', 'Una domanda alla volta, poi aspetta'),
        t2('It says what happens after a wrong answer', 'Dice cosa succede dopo una risposta sbagliata'),
        t2('Sofia’s notes are in the prompt', 'Gli appunti di Sofia sono nel prompt'),
      ],
      twist: t2('Swap in notes from something you are learning and quiz yourself for five minutes.', 'Metti al posto degli appunti qualcosa che stai imparando e interrogati per cinque minuti.'),
      answer: t2('Your prompt, as you would send it to the AI: the quiz rules, then Sofia’s notes.', 'Il tuo prompt, così come lo manderesti all’AI: le regole del quiz, poi gli appunti di Sofia.'),
    },
    {
      who: tag('Giulia’s surprise dinner', 'la cena a sorpresa di Giulia'),
      brief: t2(
        'Giulia turns 25 on Saturday and you are planning her surprise dinner. Write a prompt (what you type to an AI) asking for the plan, with the facts that matter.',
        'Giulia compie 25 anni sabato e stai organizzando la sua cena a sorpresa. Scrivi un prompt (quello che scrivi a un’AI) che chieda il piano, con i fatti che contano.'),
      asset: {
        mono: false,
        title: t2('What you know about Saturday', 'Cosa sai di sabato'),
        body: t2(
          'Giulia turns 25\n8 friends, one flat with a small kitchen\nBudget: €60 in total\nGiulia is vegetarian and loves lemon\nShe hates loud surprises\nEveryone arrives at 8pm',
          'Giulia compie 25 anni\n8 amici, una casa con la cucina piccola\nBudget: 60 € in tutto\nGiulia è vegetariana e ama il limone\nOdia le sorprese rumorose\nArrivano tutti alle 20'),
      },
      steps: [
        t2('Put the facts that change the plan in your prompt.', 'Metti nel prompt i fatti che cambiano il piano.'),
        t2('Ask for a format, like a list with times.', 'Chiedi un formato, per esempio un elenco con gli orari.'),
        t2('Check: could a stranger follow it without asking you?', 'Controlla: uno sconosciuto potrebbe seguirlo senza chiederti niente?'),
      ],
      mins: 4,
      bar: [
        t2('It has the budget and how many guests', 'Ha il budget e quanti sono gli ospiti'),
        t2('It asks for a format, like a list', 'Chiede un formato, per esempio un elenco'),
        t2('A stranger could follow it without asking', 'Uno sconosciuto potrebbe seguirlo senza chiedere'),
      ],
      twist: t2('Send the prompt to a friend and ask: “What would you have asked me before starting?”', 'Manda il prompt a chi vuoi e chiedi: “Cosa mi avresti chiesto prima di cominciare?”'),
      answer: t2('Your prompt, as you would send it to the AI: the facts that matter and the format you want.', 'Il tuo prompt, così come lo manderesti all’AI: i fatti che contano e il formato che vuoi.'),
    },
    {
      who: tag('Trattoria Nonno Pio (fictional)', 'Trattoria Nonno Pio (fittizia)'),
      brief: t2(
        'An AI told Marco that Trattoria Nonno Pio is open on Sundays, and he found it closed. Rewrite his prompt so the AI says when it is only guessing.',
        'Un’AI ha detto a Marco che la Trattoria Nonno Pio la domenica è aperta, e lui l’ha trovata chiusa. Riscrivi il suo prompt perché l’AI dica quando sta solo tirando a indovinare.'),
      asset: {
        mono: false,
        title: t2('What happened', 'Cosa è successo'),
        body: t2(
          'Marco typed: When does Trattoria Nonno Pio close on Sundays?\nThe AI said: Trattoria Nonno Pio is open every Sunday until 11pm.\n\nThe truth: the trattoria is closed on Sundays.\nThe AI had no way to know. It never said so.',
          'Marco ha scritto: A che ora chiude la Trattoria Nonno Pio la domenica?\nL’AI ha risposto: La Trattoria Nonno Pio è aperta ogni domenica fino alle 23.\n\nLa verità: la trattoria la domenica è chiusa.\nL’AI non poteva saperlo, ma non l’ha detto.'),
      },
      steps: [
        t2('Tell the AI it may say “I don’t know”.', 'Di’ all’AI che può rispondere “non lo so”.'),
        t2('Ask it to split facts from guesses.', 'Chiedile di separare i fatti dalle supposizioni.'),
        t2('Ask how Marco can check, like a phone call.', 'Chiedi come può controllare Marco, per esempio con una telefonata.'),
      ],
      mins: 3,
      bar: [
        t2('It lets the AI say “I don’t know”', 'Permette all’AI di dire “non lo so”'),
        t2('It splits facts from guesses', 'Separa i fatti dalle supposizioni'),
        t2('It names one way to check before trusting', 'Indica un modo per controllare prima di fidarsi'),
      ],
      twist: t2('Ask an AI something you already know the answer to and see if it admits when it is unsure.', 'Fai a un’AI una domanda di cui conosci già la risposta e guarda se ammette quando non è sicura.'),
      answer: t2('Your prompt, as you would send it to the AI: Marco’s question, then your 3 rules.', 'Il tuo prompt, così come lo manderesti all’AI: la domanda di Marco, poi le tue 3 regole.'),
    },
    {
      who: tag('Four flatmates, one messy month', 'quattro coinquilini, un mese in disordine'),
      brief: t2(
        'Four flatmates shared costs this month and nobody knows who owes what. Write a prompt that gives the AI the payments and asks for a table.',
        'Quattro coinquilini hanno diviso delle spese questo mese e nessuno sa chi deve cosa. Scrivi un prompt che dia all’AI i pagamenti e chieda una tabella.'),
      asset: {
        mono: false,
        title: t2('The messy notes', 'Gli appunti in disordine'),
        body: t2(
          'Marco paid the internet: €36\nChiara bought toilet paper and soap: €12\nSara paid the electricity: €84\nTeo paid nothing this month\nAll three costs are split in four',
          'Marco ha pagato internet: 36 €\nChiara ha comprato carta igienica e sapone: 12 €\nSara ha pagato la luce: 84 €\nTeo questo mese non ha pagato niente\nTutte e tre le spese si dividono in quattro'),
      },
      steps: [
        t2('Put every payment and its amount in your prompt.', 'Metti nel prompt ogni pagamento con il suo importo.'),
        t2('Name the 4 table columns, like name and paid.', 'Scrivi le 4 colonne della tabella, per esempio nome e pagato.'),
        t2('Ask it to show its sums, so you can check.', 'Chiedile di mostrare i calcoli, così puoi controllarli.'),
      ],
      mins: 3,
      bar: [
        t2('Every payment is in, with its amount', 'Ci sono tutti i pagamenti, con gli importi'),
        t2('It names the 4 columns of the table', 'Indica le 4 colonne della tabella'),
        t2('It asks for the sums to be shown', 'Chiede di mostrare i calcoli'),
      ],
      twist: t2('Do the sums by hand, then see if the AI agrees. If it does not, work out who is right.', 'Fai i conti a mano, poi guarda se l’AI è d’accordo. Se no, scopri chi ha ragione.'),
      answer: t2('Your prompt, as you would send it to the AI: the payments, 4 columns, and how to check the sums.', 'Il tuo prompt, così come lo manderesti all’AI: i pagamenti, 4 colonne e come controllare i calcoli.'),
    },
    {
      who: tag('Two flats, one decision', 'due case, una decisione'),
      brief: t2(
        'A friend can’t choose between two flats. Write a prompt that makes an AI compare them on the two things your friend cares about most.',
        'Una persona che conosci non riesce a scegliere tra due case. Scrivi un prompt che faccia confrontare le case all’AI sulle due cose che le importano di più.'),
      asset: {
        mono: false,
        title: t2('The two flats', 'Le due case'),
        body: t2(
          'Flat A: €520 · 25 minutes from the station · no balcony · quiet street\nFlat B: €580 · 8 minutes from the station · small balcony · busy street',
          'Casa A: 520 € · 25 minuti dalla stazione · senza balcone · strada tranquilla\nCasa B: 580 € · 8 minuti dalla stazione · piccolo balcone · strada trafficata'),
      },
      steps: [
        t2('Pick the 2 things that matter most to your friend.', 'Scegli le 2 cose che contano di più per l’altra persona.'),
        t2('Write the prompt with both flats and those 2 things.', 'Scrivi il prompt con le due case e quelle 2 cose.'),
        t2('Ask for one pick and one doubt about it.', 'Chiedi una scelta e un dubbio su quella scelta.'),
      ],
      mins: 4,
      bar: [
        t2('It uses your friend’s 2 things, not yours', 'Usa le 2 cose dell’altra persona, non le tue'),
        t2('Both flats appear with their facts', 'Entrambe le case compaiono con i loro dati'),
        t2('It asks for a pick and a doubt', 'Chiede una scelta e un dubbio'),
      ],
      twist: t2('Send the AI’s answer to your friend and ask if it matches how they feel.', 'Manda la risposta dell’AI a chi ti ha chiesto aiuto e chiedi se corrisponde a come si sente.'),
      answer: t2('Your prompt, as you would send it to the AI: both flats, your friend’s 2 things, a pick and a doubt.', 'Il tuo prompt, così come lo manderesti all’AI: le due case, le 2 cose dell’altra persona, una scelta e un dubbio.'),
    },
  ],
};
// The Trending projects (trending.ts) follow the 6 core ones of their category, from index TREND_FROM up.
export const MX: Record<string, MissionX[]> = Object.fromEntries(Object.entries(CORE).map(([f, l]) => [f, [...l, ...trendX(f)]]));
