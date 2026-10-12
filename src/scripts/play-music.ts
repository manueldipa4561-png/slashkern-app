import type { Play } from './play';
import { t2 } from './i18n';

const SECONDS = [0, 2, 3, 4, 5, 7, 8, 9].map((s) => t2(`second ${s}`, `secondo ${s}`)); // shot starts plus seconds where no shot starts

// Do it here for missions 2 to 6 of this field (keys '<Field>.1' to '<Field>.5'). Mission 1 is in play.ts.
export const PLAY_MUSIC: Record<string, Play> = {
  'Music.1': [
    { kind: 'pick', label: t2('Tap three words for the music', 'Tocca tre parole per la musica'), out: t2('The music', 'La musica'), max: 3,
      items: [t2('bouncy', 'saltellante'), t2('claps', 'battimani'), t2('soft hum', 'ronzio morbido'), t2('sleepy', 'assonnato'), t2('crunchy', 'croccante'), t2('whistling', 'fischiettio'), t2('sad violin', 'violino triste'), t2('distorted guitar', 'chitarra distorta')] },
    { kind: 'pick', label: t2('Tap the second the music comes in, then tap Hear it', 'Tocca il secondo in cui entra la musica, poi tocca Ascolta'), out: t2('Music comes in', 'Entra la musica'), max: 1, items: SECONDS,
      hear: { bed: '/media/gufo-bed.m4a', cues: [['/media/gufo-shutter.m4a', 3], ['/media/gufo-dough.m4a', 5]], drop: '/media/gufo-beat.m4a', len: 10 } }, // the shutter at 3s and the dough at 5s, as in the reel's shot list
  ],
  'Music.2': [
    { kind: 'pick', label: t2('Three lines to say back (pick 3)', 'Tre righe da dire a voce (scegline 3)'), out: t2('My 3 lines', 'Le mie 3 righe'), max: 3,
      items: [t2('Three bad things before lunch', 'Tre disastri prima di pranzo'), t2('You don’t have to be fine tonight', 'Stasera non devi per forza stare bene'), t2('I’m coming over with biscuits', 'Arrivo con i biscotti'), t2('It’s fine', 'Tutto ok'), t2('Everything happens for a reason', 'Tutto succede per un motivo'), t2('One exam is not the whole of you', 'Un esame non dice chi sei'), t2('Could be worse', 'Poteva andare peggio'), t2('I can call you tonight', 'Stasera ti chiamo')] },
    { kind: 'pick', label: t2('The one song you’d send', 'La canzone che manderesti'), out: t2('Song', 'Canzone'), max: 1,
      items: [t2('Slow Kettle · gentle', 'Slow Kettle · delicata'), t2('Confetti Cannon · huge', 'Confetti Cannon · esplosiva'), t2('Sad Trombone Tuesday · gloomy', 'Sad Trombone Tuesday · cupa'), t2('Pocket Sunrise · warm', 'Pocket Sunrise · calda'), t2('Last Bus Home · dreamy', 'Last Bus Home · sognante'), t2('Mango Static · bright', 'Mango Static · allegra')] },
  ],
  'Music.3': [
    { kind: 'pick', label: t2('Tap one colour for the cover', 'Tocca un colore per la cover'), out: t2('Colour', 'Colore'), max: 1,
      items: [t2('Deep green', 'Verde scuro'), t2('Grey, like now', 'Grigio, come ora'), t2('Neon pink', 'Rosa fluo'), t2('Slate blue', 'Blu ardesia'), t2('Mustard yellow', 'Giallo senape'), t2('Brick red', 'Rosso mattone')] },
    { kind: 'pick', label: t2('Tap one object for the cover', 'Tocca un oggetto per la cover'), out: t2('Object', 'Oggetto'), max: 1,
      items: [t2('An open book', 'Un libro aperto'), t2('A rainy window', 'Una finestra con la pioggia'), t2('A cup of tea', 'Una tazza di tè'), t2('A disco ball', 'Una palla da discoteca'), t2('A dumbbell', 'Un manubrio'), t2('A sleeping cat', 'Un gatto che dorme')] },
  ],
  'Music.4': [
    { kind: 'beat', label: t2('Tap a box to add a hit, then press Play', 'Tocca una casella per aggiungere un colpo, poi premi Suona'),
      items: [t2('Kick', 'Cassa'), t2('Snare', 'Rullante'), t2('Hat', 'Hi-hat')] },
  ],
  'Music.5': [
    { kind: 'pick', label: t2('Line 2: a small disaster (pick 1)', 'Riga 2: un piccolo disastro (scegline 1)'), out: t2('Disaster', 'Disastro'), max: 1,
      items: [t2('The smoke alarm goes off', 'Scatta l’allarme antincendio'), t2('The onion burns', 'La cipolla brucia'), t2('The pasta water boils over', 'L’acqua della pasta trabocca'), t2('An egg hits the floor', 'Un uovo finisce per terra'), t2('The fuse blows', 'Salta la luce'), t2('Dinner comes out perfect', 'La cena viene perfetta')] },
    { kind: 'pick', label: t2('Line 3: a surprise (pick 1)', 'Riga 3: una sorpresa (scegline 1)'), out: t2('Surprise', 'Sorpresa'), max: 1,
      items: [t2('The neighbours ask for more', 'I vicini ne vogliono ancora'), t2('Burnt tastes better', 'Bruciato è più buono'), t2('The cat eats first', 'Il gatto mangia per primo'), t2('The smoke alarm sings along', 'L’allarme si mette a cantare'), t2('The pan is tiny', 'La padella è minuscola'), t2('The room is small', 'La stanza è piccola')] },
  ],
};
