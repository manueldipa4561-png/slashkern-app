import type { Play } from './play';
import { t2 } from './i18n';

// Do it here for missions 2 to 6 of this field (keys '<Field>.1' to '<Field>.5'). Mission 1 is in play.ts.
// The picks set up the pieces of the prompt (facts, rules, format, checks); the person still writes the prompt itself.
export const PLAY_PROMPTING: Record<string, Play> = {
  'Prompting.1': [
    { kind: 'pick', label: t2('Tap the quiz rules you want (up to 4)', 'Tocca le regole del quiz che vuoi (fino a 4)'), out: t2('Rules', 'Regole'), max: 4,
      items: [t2('One question at a time', 'Una domanda alla volta'), t2('Wait for my answer', 'Aspetta la mia risposta'), t2('Only from my notes', 'Solo dai miei appunti'), t2('All 10 questions at once', 'Tutte e 10 le domande insieme'), t2('Summarise the notes first', 'Prima riassumi gli appunti'), t2('Show the answer with the question', 'Metti la risposta sotto la domanda'), t2('Anything about cells', 'Qualsiasi cosa sulle cellule'), t2('My score after 10 questions', 'Il mio punteggio dopo 10 domande')] },
    { kind: 'pick', label: t2('Tap 2: what the AI does after a wrong answer', 'Toccane 2: cosa fa l’AI dopo una risposta sbagliata'), out: t2('If wrong', 'Se sbaglia'), max: 2,
      items: [t2('Give the right answer in one line', 'Dai la risposta giusta in una riga'), t2('Ask a similar one later', 'Fanne una simile più avanti'), t2('Give a hint, let her try again', 'Dai un indizio e falla riprovare'), t2('Move on without a word', 'Passa alla prossima senza dire niente'), t2('Explain the whole chapter', 'Spiega tutto il capitolo'), t2('Say “wrong” and stop', 'Di’ “sbagliato” e fermati')] },
  ],
  'Prompting.2': [
    { kind: 'pick', label: t2('Tap the facts that change the plan', 'Tocca i fatti che cambiano il piano'), out: t2('Facts', 'Fatti'), max: 6,
      items: [t2('8 guests', '8 ospiti'), t2('€60 in total', '60 € in tutto'), t2('Small kitchen', 'Cucina piccola'), t2('Vegetarian, loves lemon', 'Vegetariana, ama il limone'), t2('Hates loud surprises', 'Odia le sorprese rumorose'), t2('Everyone at 8pm', 'Tutti alle 20'), t2('She has a cat', 'Ha un gatto'), t2('Her sign is Leo', 'È del Leone')] },
    { kind: 'pick', label: t2('Tap 2 formats for the AI’s answer', 'Tocca 2 formati per la risposta dell’AI'), out: t2('Format', 'Formato'), max: 2,
      items: [t2('A list with times', 'Un elenco con gli orari'), t2('A menu with prices', 'Un menu con i prezzi'), t2('A shopping list', 'La lista della spesa'), t2('One long paragraph', 'Un unico paragrafo lungo'), t2('Ten ideas to choose from', 'Dieci idee tra cui scegliere'), t2('A poem for Giulia', 'Una poesia per Giulia')] },
  ],
  'Prompting.3': [
    { kind: 'pick', label: t2('Tap 3 rules to add to the prompt', 'Tocca 3 regole da aggiungere al prompt'), out: t2('Rules', 'Regole'), max: 3,
      items: [t2('You can say “I don’t know”', 'Puoi dire “non lo so”'), t2('Split facts from guesses', 'Separa i fatti dalle supposizioni'), t2('Tell me what to check', 'Dimmi cosa controllare'), t2('Answer in one word', 'Rispondi con una parola'), t2('Be 100% sure', 'Sii sicura al 100%'), t2('Never say you are unsure', 'Non dire mai che hai dubbi'), t2('Add the menu too', 'Aggiungi anche il menu')] },
    { kind: 'pick', label: t2('Tap one way Marco can check', 'Tocca un modo in cui Marco può controllare'), out: t2('Check', 'Controllo'), max: 1,
      items: [t2('Call the trattoria', 'Telefona alla trattoria'), t2('Look at their website', 'Guarda il loro sito'), t2('Ask someone who ate there', 'Chiedi a chi ci ha mangiato'), t2('Ask the AI again', 'Chiedi di nuovo all’AI'), t2('Trust the first answer', 'Fidati della prima risposta')] },
  ],
  'Prompting.4': [
    { kind: 'sort', label: t2('Tap ✕ on 3 columns you don’t need, drag to reorder', 'Tocca ✕ su 3 colonne che non servono, trascina per riordinare'), out: t2('Columns', 'Colonne'), cutOut: t2('Cut', 'Tolgo'), cut: 3,
      items: [{ t: t2('Balance', 'Saldo') }, { t: t2('Date', 'Data') }, { t: t2('Name', 'Nome') }, { t: t2('What for', 'Per cosa') }, { t: t2('Share each', 'Quota a testa') }, { t: t2('Receipt photo', 'Foto dello scontrino') }, { t: t2('Paid', 'Pagato') }] },
    { kind: 'pick', label: t2('Tap 2 ways to check the AI’s sums', 'Tocca 2 modi per controllare i calcoli dell’AI'), out: t2('Check', 'Controllo'), max: 2,
      items: [t2('Show the total', 'Mostra il totale'), t2('Show the share per person', 'Mostra la quota a testa'), t2('Write out every sum', 'Scrivi ogni calcolo per esteso'), t2('Only the final numbers', 'Solo i numeri finali'), t2('Round to the nearest 10', 'Arrotonda alla decina'), t2('Leave Teo out, he paid nothing', 'Lascia fuori Teo, non ha pagato')] },
  ],
  'Prompting.5': [
    { kind: 'pick', label: t2('Tap the 2 things that matter most to your friend', 'Tocca le 2 cose che contano di più per l’altra persona'), out: t2('What matters', 'Cosa conta'), max: 2,
      items: [t2('Short walk to the station', 'Poca strada fino alla stazione'), t2('A quiet street', 'Una via tranquilla'), t2('Lower rent', 'Affitto più basso'), t2('A balcony', 'Un balcone'), t2('A big kitchen', 'Una cucina grande'), t2('Lots of light', 'Tanta luce')] },
    { kind: 'pick', label: t2('Tap 3 things the AI should give back', 'Tocca 3 cose che l’AI deve darti'), out: t2('Ask for', 'Chiedi'), max: 3,
      items: [t2('A comparison on those two only', 'Un confronto solo su quelle due'), t2('One pick', 'Una scelta sola'), t2('One doubt about the pick', 'Un dubbio sulla scelta'), t2('Every pro and con', 'Tutti i pro e i contro'), t2('A draw: both are fine', 'Pareggio: vanno bene tutte e due'), t2('The cheaper one', 'La più economica')] },
  ],
};
