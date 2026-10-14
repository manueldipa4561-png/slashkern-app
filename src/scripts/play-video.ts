import type { Play } from './play';
import { t2 } from './i18n';

// Do it here for missions 2 to 6 of this field (keys '<Field>.1' to '<Field>.5'). Mission 1 is in play.ts.
// Rows carry their seconds in the text (· 3s) and in n, so the sum checks the total; decoys break a rule of the mission.
export const PLAY_VIDEO: Record<string, Play> = {
  'Video.1': [
    { kind: 'sort', label: t2('Drag 3 shots into order, empty shelf first. ✕ the other 4.', 'Trascina 3 inquadrature in ordine, prima lo scaffale vuoto. ✕ sulle altre 4.'), out: t2('Shots', 'Inquadrature'), cutOut: t2('Cut', 'Tolgo'), cut: 4,
      sum: { label: t2('Total', 'Totale'), max: 10 },
      items: [
        { t: t2('You walk into the living room · 3s', 'Entri in salotto · 3s'), n: 3 },
        { t: t2('Bea lifts a cushion: the Zumo, charged · 3s', 'Bea alza un cuscino: lo Zumo, carico · 3s'), n: 3 },
        { t: t2('You look under your bed · 4s', 'Guardi sotto il letto · 4s'), n: 4 },
        { t: t2('The empty shelf, a loose cable · 3s', 'Lo scaffale vuoto, un cavo penzoloni · 3s'), n: 3 },
        { t: t2('Music from under a cushion · 4s', 'Musica da sotto un cuscino · 4s'), n: 4 },
        { t: t2('Bea whistles at the ceiling · 3s', 'Bea fischietta guardando il soffitto · 3s'), n: 3 },
        { t: t2('Slow turn to Bea on the sofa · 4s', 'Giro lento su Bea, sul divano · 4s'), n: 4 },
      ] },
    { kind: 'pick', label: t2('Tap one text per shot, in order, 6 words or fewer', 'Tocca un testo per inquadratura, in ordine, massimo 6 parole'), out: t2('Text', 'Testo'), max: 3,
      items: [t2('“The shelf. Empty.”', '“Lo scaffale. Vuoto.”'), t2('“I think my cousin Bea took my speaker”', '“Secondo me mia cugina Bea mi ha preso la cassa”'), t2('“POV: your Zumo is gone”', '“POV: il tuo Zumo è sparito”'), t2('“Bea. Way too calm.”', '“Bea. Fin troppo tranquilla.”'),
        t2('“Music. From a cushion?”', '“Musica. Da un cuscino?”'), t2('“This is the story of how my Zumo vanished”', '“Questa è la storia di come è sparito il mio Zumo”'), t2('“She even charged it”', '“L’ha pure caricato”'), t2('“Case closed”', '“Caso chiuso”')] },
  ],
  'Video.2': [
    { kind: 'pick', label: t2('Tap 3 questions in the order you ask them', 'Tocca 3 domande nell’ordine in cui le fai'), out: t2('Questions at 0s, 7s, 14s', 'Domande a 0s, 7s, 14s'), max: 3,
      items: [t2('“Tell us about the banana.”', '“Raccontaci della banana.”'), t2('“What was your worst awkward moment?”', '“Qual è la tua figuraccia peggiore?”'), t2('“Was it hot?”', '“Faceva caldo?”'), t2('“Then what happened?”', '“E poi cos’è successo?”'),
        t2('“Look at the camera.”', '“Guarda in camera.”'), t2('“What did the kid say?”', '“Cosa ha detto il bambino?”'), t2('“Why a banana?”', '“Perché proprio una banana?”'), t2('“How did it end?”', '“E com’è finita?”')] },
    { kind: 'pick', label: t2('Tap the funniest moment, to save for the last answer', 'Tocca il momento più divertente, da tenere per l’ultima risposta'), out: t2('Last answer', 'Ultima risposta'), max: 1,
      items: [t2('Not a costume party', 'Non era una festa in maschera'), t2('32 degrees in a banana', '32 gradi dentro una banana'), t2('Nobody said a word', 'Nessuno ha detto niente'), t2('A kid: “Are you a lemon?”', 'Un bambino: “Sei un limone?”')] },
  ],
  'Video.3': [
    { kind: 'sort', label: t2('Drag subtitles into Greta’s order, ✕ the 2 that don’t fit', 'Trascina i sottotitoli nell’ordine di Greta, ✕ sui 2 che non vanno'), out: t2('Subtitles', 'Sottotitoli'), cutOut: t2('Cut', 'Tolgo'), cut: 2,
      sum: { label: t2('Total', 'Totale'), max: 12 },
      items: [
        { t: t2('“Only five euros.” · 2s', '“Solo cinque euro.” · 2s'), n: 2 },
        { t: t2('“The culprit?” · 1s', '“Il colpevole?” · 1s'), n: 1 },
        { t: t2('“Hi, welcome back.” · 2s', '“Ciao, bentornati.” · 2s'), n: 2 },
        { t: t2('“The culprit? One tiny nail.” · 4s', '“Il colpevole? Un chiodino.” · 4s'), n: 4 },
        { t: t2('“Ten minutes, one patch.” · 2s', '“Dieci minuti, una toppa.” · 2s'), n: 2 },
        { t: t2('“One tiny nail.” · 3s', '“Un chiodino.” · 3s'), n: 3 },
        { t: t2('“Today: flat tyre.” · 2s', '“Oggi: una gomma a terra.” · 2s'), n: 2 },
      ] },
  ],
  'Video.4': [
    { kind: 'pick', label: t2('Tap lines for shots 1 and 2, in order, within word limits', 'Tocca le frasi per le inquadrature 1 e 2, in ordine, entro il limite di parole'), out: t2('Shots 1-2', 'Inquadrature 1-2'), max: 2,
      items: [t2('“A skateboard is on the ground.”', '“Uno skate è per terra.”'), t2('“Ladies and gentlemen: the board.”', '“Signore e signori: la tavola.”'), t2('“One push. History begins.”', '“Una spinta. Comincia la storia.”'),
        t2('“And now the foot goes on and pushes really hard.”', '“E adesso il piede sale sopra e spinge fortissimo.”'), t2('“Silence. The board. Still.”', '“Silenzio. La tavola. Immobile.”'), t2('“One foot. One push. Pure courage.”', '“Un piede. Una spinta. Coraggio puro.”')] },
    { kind: 'pick', label: t2('Tap lines for shots 3 and 4, in order, within word limits', 'Tocca le frasi per le inquadrature 3 e 4, in ordine, entro il limite di parole'), out: t2('Shots 3-4', 'Inquadrature 3-4'), max: 2,
      items: [t2('“The wheels roll.”', '“Le ruote girano.”'), t2('“It rolls! It rolls!”', '“Rotola! Ma rotola davvero!”'), t2('“The wheels are finally starting to turn.”', '“Le ruote finalmente iniziano a girare.”'), t2('“Gone. Gone for good.”', '“Via. Via per sempre.”'),
        t2('“Buy your wheels at Rotella!”', '“Compra le ruote da Rotella!”'), t2('“Off to buy bread.”', '“A comprare il pane.”'), t2('“Rotella. Goodbye, legend.”', '“Rotella. Addio, leggenda.”')] },
  ],
  'Video.5': [
    { kind: 'sort', label: t2('Drag 3 shots into order, comment first. ✕ the other 4.', 'Trascina 3 inquadrature in ordine, prima il commento. ✕ sulle altre 4.'), out: t2('Shots', 'Inquadrature'), cutOut: t2('Cut', 'Tolgo'), cut: 4,
      sum: { label: t2('Total', 'Totale'), max: 12 },
      items: [
        { t: t2('You read the comment, arms crossed · 4s', 'Leggi il commento a braccia conserte · 4s'), n: 4 },
        { t: t2('A wall clock, then the empty chair · 5s', 'Un orologio al muro, poi la poltrona vuota · 5s'), n: 5 },
        { t: t2('A cheaper shop’s price list · 3s', 'Il listino di un negozio più economico · 3s'), n: 3 },
        { t: t2('The comment on screen, you smile · 4s', 'Il commento a schermo, tu sorridi · 4s'), n: 4 },
        { t: t2('Close-up of the scissors, snip · 3s', 'Primo piano delle forbici, zac · 3s'), n: 3 },
        { t: t2('Someone shows off a fresh cut · 5s', 'Qualcuno mostra il taglio appena fatto · 5s'), n: 5 },
        { t: t2('A hand lays a hot towel on the chair · 3s', 'Una mano posa un asciugamano caldo sulla poltrona · 3s'), n: 3 },
      ] },
    { kind: 'pick', label: t2('Tap one line per shot, in order: calm, 8 words or fewer', 'Tocca una frase per inquadratura, in ordine, con tono calmo, massimo 8 parole'), out: t2('Lines', 'Frasi'), max: 3,
      items: [t2('“You get what you pay for.”', '“Chi più spende, meno spende.”'), t2('“Fair question, Ivo. Here’s why.”', '“Domanda giusta, Ivo. Ecco perché.”'), t2('“Then go to your €10 barber.”', '“Allora vai dal tuo barbiere da 10 €.”'), t2('“30 full minutes, every single cut.”', '“30 minuti pieni, ogni singolo taglio.”'),
        t2('“Sorry, prices went up for everyone.”', '“Scusa, i prezzi sono saliti per tutti.”'), t2('“Hot towel and neck shave included.”', '“Asciugamano caldo e rasatura del collo inclusi.”'), t2('“Honestly, our cuts beat every other shop in town.”', '“Sinceramente, i nostri tagli battono ogni altro negozio in città.”'), t2('“Come try it, Ivo.”', '“Vieni a provare, Ivo.”')] },
  ],
};
