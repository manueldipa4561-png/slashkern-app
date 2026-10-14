import type { Play } from './play';
import { t2 } from './i18n';

// Do it here for missions 2 to 6 of this field (keys '<Field>.1' to '<Field>.5'). Mission 1 is in play.ts.
export const PLAY_WRITING: Record<string, Play> = {
  'Writing.1': [
    { kind: 'pick', label: t2('Tap one real thing Leo already did', 'Tocca una cosa vera che Leo ha già fatto'), out: t2('Real thing', 'La cosa vera'), max: 1,
      items: [t2('Learned to order a coffee', 'Ha imparato a ordinare un caffè'), t2('Skipped 3 days', 'Ha saltato 3 giorni'), t2('Chose Spanish for June', 'Ha scelto lo spagnolo per giugno'), t2('Finished the course', 'Ha finito il corso'), t2('Kept a 30-day streak', 'Ha tenuto una serie di 30 giorni'), t2('Booked the flight', 'Ha prenotato il volo')] },
    { kind: 'pick', label: t2('Tap 2 kind lines to keep. The rest is cut.', 'Tocca 2 frasi gentili da tenere. Le altre vanno tolte.'), out: t2('Keep', 'Tengo'), rest: t2('Cut', 'Tolgo'), max: 2,
      items: [t2('Don’t break your streak!', 'Non perdere la tua serie!'), t2('Two minutes?', 'Due minuti?'), t2('You’re falling behind', 'Stai restando indietro'), t2('Ready when you are', 'Quando vuoi tu'), t2('Last chance!', 'Ultima occasione!'), t2('We miss you 😢', 'Ci manchi 😢'), t2('Pick up where you left off', 'Riprendi da dove avevi lasciato'), t2('Still learning?', 'Stai ancora studiando?')] },
  ],
  'Writing.2': [
    { kind: 'pick', label: t2('Funny one: tap a detail to joke about', 'Divertente: tocca un dettaglio su cui scherzare'), out: t2('Funny', 'Divertente'), max: 1,
      items: [t2('Midnight pasta', 'Pasta di mezzanotte'), t2('Turning 28', 'Compie 28 anni'), t2('Always late', 'Sempre in ritardo'), t2('Her dog Fritz', 'Il suo cane Fritz'), t2('Cake and candles', 'Torta e candeline'), t2('Hates surprise parties', 'Odia le feste a sorpresa')] },
    { kind: 'pick', label: t2('Warm one: tap something only you two share', 'Affettuoso: tocca una cosa che avete solo voi due'), out: t2('Warm', 'Affettuoso'), max: 1,
      items: [t2('Wishing you all the best', 'Ti auguro il meglio'), t2('2 years sharing a flat', '2 anni a dividere casa'), t2('Another year older', 'Un anno in più'), t2('Pasta at midnight, together', 'Pasta a mezzanotte, insieme'), t2('Happy birthday! 🎉', 'Buon compleanno! 🎉'), t2('Waiting for her, always', 'Aspettarla, sempre')] },
  ],
  'Writing.3': [
    { kind: 'pick', label: t2('Tap the words any laundry could say, to cut them', 'Tocca le parole che direbbe qualsiasi lavanderia, per toglierle'), out: t2('Cut', 'Tolgo'), rest: t2('Keep', 'Tengo'), max: 5,
      items: [t2('Welcome to Bolla!', 'Benvenuti da Bolla!'), '🧺', t2('Self-service laundry', 'Lavanderia self-service'), t2('Best quality', 'La migliore qualità'), t2('Best prices', 'I migliori prezzi'), t2('Open most days', 'Aperti quasi tutti i giorni'), t2('Visit us!', 'Venite a trovarci!')] },
    { kind: 'pick', label: t2('Tap the 3 facts a student needs most', 'Tocca i 3 fatti più utili per chi studia'), out: t2('Facts', 'Fatti'), max: 3,
      items: [t2('Free wifi', 'Wifi gratis'), t2('Next to the university gate', 'Accanto al cancello dell’università'), t2('Best prices in town', 'I prezzi migliori in città'), t2('Wash €4, dry €3', 'Lavaggio 4 €, asciugatura 3 €'), t2('Books to swap', 'Libri da scambiare'), t2('Soap included', 'Sapone incluso'), t2('Open every day, even Sunday', 'Aperti ogni giorno, anche la domenica')] },
  ],
  'Writing.4': [
    { kind: 'pick', label: t2('Tap what the comment is really about (1 or 2)', 'Tocca di cosa parla davvero il commento (1 o 2)'), out: t2('Really about', 'Il punto vero'), max: 2,
      items: [t2('Sitting in the dark', 'Stare al buio'), t2('Paying €1 more', 'Pagare 1 € in più'), t2('Watching at home', 'Guardarlo a casa'), t2('Not knowing why', 'Non sapere perché'), t2('The word “greedy”', 'La parola “ladri”')] },
    { kind: 'sort', label: t2('Tap ✕ on 3 lines that break the rules. Drag the rest in order.', 'Tocca ✕ sulle 3 frasi che non rispettano le regole. Trascina le altre in ordine.'), out: t2('Order', 'Ordine'), cutOut: t2('Cut', 'Tolgo'), cut: 3,
      items: [
        { t: t2('We’re not greedy, actually', 'Guarda che non siamo ladri') },
        { t: t2('Tuesdays stay €5', 'Il martedì resta 5 €') },
        { t: t2('Heating and films cost 25% more', 'Riscaldamento e film costano il 25% in più') },
        { t: t2('Enjoy your sofa, then', 'Allora goditi il divano') },
        { t: t2('Yes, it’s €1 more', 'Sì, è 1 € in più') },
        { t: t2('Please don’t leave us', 'Ti prego, non lasciarci') },
        { t: t2('First rise in 4 years', 'Primo aumento in 4 anni') },
      ] },
  ],
  'Writing.5': [
    { kind: 'pick', label: t2('Tap up to 4 words a name could grow from', 'Tocca fino a 4 parole da cui può nascere un nome'), out: t2('Name words', 'Parole per il nome'), max: 4,
      items: [t2('Supreme', 'Supremo'), t2('Hazelnut', 'Nocciola'), t2('Salt', 'Sale'), t2('Delight', 'Delizia'), t2('Ribbon', 'Nastro'), t2('Lazy', 'Pigro'), t2('Gourmet', 'Gourmet'), t2('Friday', 'Venerdì')] },
    { kind: 'pick', label: t2('Tap 3 facts to put on the sign', 'Tocca 3 fatti da mettere sul cartello'), out: t2('Sign', 'Cartello'), max: 3,
      items: [t2('Roasted hazelnuts', 'Nocciole tostate'), t2('Unforgettable taste', 'Gusto indimenticabile'), t2('Sea salt', 'Sale marino'), t2('Dark chocolate ribbon', 'Nastro di cioccolato fondente'), t2('Sweet first, salty at the end', 'Prima dolce, poi salato'), t2('The best in town', 'Il migliore in città'), t2('From Friday', 'Da venerdì'), t2('Between pistachio and lemon', 'Tra pistacchio e limone')] },
  ],
};
