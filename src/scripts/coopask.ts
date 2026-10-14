import { t2 } from './i18n';

// What the friend does with the answer they receive, one line per co-op mission (the keys are COOP_KEYS in coop.ts; npm test checks both languages).
// Each one fits one short reply (300 characters): a pick and a reason, a trick, a few lines.
export const ASK: Record<string, string> = {
  'Design.2': t2('Would you sleep in this room? Answer with one word, then say why.', 'Ci dormiresti in questa stanza? Rispondi con una parola, poi dimmi perché.'),
  'Design.5': t2('Pick the thumbnail you would tap and say why in one line.', 'Scegli la miniatura che apriresti e dimmi perché in una riga.'),
  'Writing.2': t2('Pick the version you would keep and say why.', 'Scegli la versione che terresti e dimmi perché.'),
  'Writing.5': t2('Pick one name and write its counter sign in one line.', 'Scegli un nome e scrivi il suo cartello da banco in una riga.'),
  'Code.2': t2('Try to beat the rule: write the trick you found.', 'Prova ad aggirare la regola: scrivi il trucco che hai trovato.'),
  'Code.5': t2('Be the robot: follow the steps word for word and tell where you got stuck.', 'Fai il robot: segui i passaggi alla lettera e dimmi dove ti blocchi.'),
  'Video.2': t2('Write the three questions you would ask to direct this story.', 'Scrivi le tre domande che faresti per dirigere questa storia.'),
  'Video.5': t2('Would this reply calm you down? Name the second you would cut.', 'Questa risposta ti calmerebbe? Dimmi il secondo che taglieresti.'),
  'Selling.2': t2('Be the haggler: ask for a lower price one more time. What would you say next?', 'Fai quello che tira sul prezzo: chiedi ancora uno sconto. Cosa diresti dopo?'),
  'Selling.5': t2('Be the silent buyer: would you answer? What would make you reply?', 'Fai il compratore sparito: risponderesti? Cosa ti farebbe rispondere?'),
  'Music.2': t2('Would this help on a rough day? Which line would you keep?', 'Ti aiuterebbe in una giornata storta? Quale riga terresti?'),
  'Music.5': t2('Which of the 4 lines would you still hum tomorrow, and why?', 'Quale delle 4 righe canticchieresti ancora domani, e perché?'),
  'Prompting.2': t2('Be the AI: answer this prompt in three lines, then name one thing you had to guess.', 'Fai l’AI: rispondi a questo prompt in tre righe, poi dimmi una cosa che hai dovuto indovinare.'),
  'Prompting.5': t2('Read it as if the choice were yours. Would it get you a useful answer? Say what you would add.', 'Leggilo come se la scelta fosse tua. Ti darebbe una risposta utile? Dimmi cosa aggiungeresti.'),
};
