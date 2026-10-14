import type { Play } from './play';
import { t2 } from './i18n';

// Do it here for missions 2 to 6 of this field (keys '<Field>.1' to '<Field>.5'). Mission 1 is in play.ts.
export const PLAY_DESIGN: Record<string, Play> = {
  'Design.1': [
    { kind: 'pick', label: t2('Tap the one thing that makes this bar special', 'Tocca la cosa che rende speciale questo bar'), out: t2('Heart of the bar', 'Il cuore del bar'), max: 1,
      items: [t2('Open since 1987', 'Aperto dal 1987'), t2('Espresso €1.20', 'Caffè 1,20 €'), t2('Spritz €4', 'Spritz 4 €'), t2('Rosa calling everyone “tesoro”', 'Rosa che chiama tutti “tesoro”'), t2('The giant plant', 'La pianta gigante'), t2('Loud at 6pm', 'Chiassoso alle 18'), t2('Sleepy at 3pm', 'Assonnato alle 15')] },
    { kind: 'pick', label: t2('Tap 2 colours that stand out on a glass door', 'Tocca 2 colori che si vedono bene su una porta a vetri'), out: t2('Colours', 'Colori'), max: 2,
      items: [t2('Dark green', 'Verde scuro'), t2('Cream', 'Crema'), t2('Espresso brown', 'Marrone caffè'), t2('Tomato red', 'Rosso pomodoro'), t2('Spritz orange', 'Arancione spritz'), t2('Lilac', 'Lilla'), t2('Light grey', 'Grigio chiaro'), t2('Golden yellow', 'Giallo oro')] },
  ],
  'Design.2': [
    { kind: 'pick', label: t2('Tap 2 words for the feeling of Elena’s sentence', 'Tocca 2 parole per la sensazione della frase di Elena'), out: t2('Feeling', 'Sensazione'), max: 2,
      items: [t2('slow', 'lenta'), t2('salty', 'salata'), t2('sunny', 'solare'), t2('cosy', 'accogliente'), t2('quiet', 'tranquilla'), t2('busy', 'frenetica'), t2('fancy', 'elegante'), t2('loud', 'rumorosa')] },
    { kind: 'pick', label: t2('Tap 3 pictures that fit the feeling, then write 3 more', 'Tocca 3 immagini adatte a questa sensazione, poi scrivine altre 3'), out: t2('Pictures', 'Immagini'), max: 3,
      items: [t2('A half-open linen curtain', 'Una tenda di lino socchiusa'), t2('Shells on the windowsill', 'Conchiglie sul davanzale'), t2('A striped deckchair', 'Una sdraio a righe'), t2('Her plant in a blue pot', 'La sua pianta in un vaso blu'), t2('A paperback left open', 'Un tascabile lasciato aperto'), t2('A neon gaming chair', 'Una sedia da gaming al neon'), t2('A city skyline poster', 'Un poster di grattacieli'), t2('A huge gold mirror', 'Un enorme specchio dorato')] },
  ],
  'Design.3': [
    { kind: 'pick', label: t2('Tap the 3 worst problems in the photo', 'Tocca i 3 problemi peggiori della foto'), out: t2('Worst', 'I peggiori'), max: 3,
      items: [t2('Dim ceiling light', 'Luce fioca dal soffitto'), t2('Unmade bed', 'Letto sfatto'), t2('Hoodie in the corner', 'Felpa nell’angolo'), t2('Both shoes blurry', 'Scarpe sfocate'), t2('Laces undone', 'Lacci slacciati'), t2('Toes cut off', 'Punte tagliate'), t2('White looks yellow', 'Il bianco sembra giallo'), t2('No sole or size', 'Niente suola né taglia')] },
    { kind: 'pick', label: t2('Tap 3 for the new photo: where, what light, what behind', 'Toccane 3 per la foto nuova: dove, che luce, cosa c’è dietro'), out: t2('New photo', 'Foto nuova'), max: 3,
      items: [t2('By a window at midday', 'Vicino a una finestra a mezzogiorno'), t2('Outside on a cloudy day', 'Fuori in una giornata nuvolosa'), t2('Phone flash at night', 'Flash del telefono di sera'), t2('Under the ceiling light', 'Sotto la luce del soffitto'), t2('Plain grey floor', 'Pavimento grigio liscio'), t2('White wall behind', 'Muro bianco dietro'), t2('Patterned rug', 'Tappeto a fantasia'), t2('The bed, made this time', 'Il letto, stavolta rifatto')] },
  ],
  'Design.4': [
    { kind: 'pick', label: t2('Tap the tip that would make a stranger curious', 'Tocca il consiglio che incuriosirebbe uno sconosciuto'), out: t2('Tip', 'Consiglio'), max: 1,
      items: [t2('Label your food', 'Etichetta il tuo cibo'), t2('Buy your own pan', 'Compra una pentola tua'), t2('Talk about bills in week 1', 'Parla delle bollette nella prima settimana'), t2('Know who takes out the bin', 'Chiarisci chi porta giù la spazzatura'), t2('Say what bugs you early', 'Di’ subito cosa ti dà fastidio')] },
    { kind: 'pick', label: t2('Tap one bright colour that stands out even when tiny', 'Tocca un colore acceso che spicca anche in piccolo'), out: t2('Colour', 'Colore'), max: 1,
      items: [t2('Lemon yellow', 'Giallo limone'), t2('Hot pink', 'Rosa acceso'), t2('Electric blue', 'Blu elettrico'), t2('Lime green', 'Verde lime'), t2('Tomato red', 'Rosso pomodoro'), t2('Beige', 'Beige'), t2('Light grey', 'Grigio chiaro'), t2('Lilac', 'Lilla')] },
  ],
  'Design.5': [
    { kind: 'pick', label: t2('Luca’s face: tap one for A, then one for B', 'La faccia di Luca: toccane una per la A, poi una per la B'), out: t2('Faces (A, B)', 'Facce (A, B)'), max: 2,
      items: [t2('Eyes wide with the wrapper', 'Occhi spalancati con la confezione'), t2('Asleep on the table', 'Addormentato sul tavolo'), t2('Mouth full and thumbs up', 'Bocca piena e pollice in su'), t2('Tired but happy', 'Stanco ma felice'), t2('Side-eye at the wrapper', 'Guarda storto la confezione'), t2('Big smile with no wrapper', 'Gran sorriso senza confezione'), t2('Back to the camera', 'Di spalle alla camera')] },
    { kind: 'pick', label: t2('Tap a background colour for A, then one for B', 'Tocca un colore di sfondo per la A, poi uno per la B'), out: t2('Colours (A, B)', 'Colori (A, B)'), max: 2,
      items: [t2('Dark blue', 'Blu scuro'), t2('Teal', 'Verde acqua'), t2('Electric blue', 'Blu elettrico'), t2('Cream', 'Crema'), t2('Orange', 'Arancione'), t2('Espresso brown', 'Marrone caffè'), t2('Golden yellow', 'Giallo oro'), t2('Purple', 'Viola')] },
  ],
};
