// Checks the distress screen: the same regex sits in the app (src/scripts/app.ts) and on the server (netlify/functions/coach.mts), and it
// catches what people really type in English, Italian, German, French, Dutch and Swedish, with or without accents and with straight or curly apostrophes. Run: npm test
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const FILES = ['src/scripts/app.ts', 'netlify/functions/coach.mts'];
const literals = FILES.map((f) => {
  const m = readFileSync(f, 'utf8').match(/^(?:export )?const HEAVY = (\/.+\/[a-z]*);$/m);
  assert.ok(m, `${f}: no "const HEAVY = /.../;" line found`);
  return m[1];
});
assert.equal(literals[0], literals[1], `HEAVY differs between ${FILES.join(' and ')}: the app and the server must pause on the same words`);
const cut = literals[0].lastIndexOf('/');
const HEAVY = new RegExp(literals[0].slice(1, cut), literals[0].slice(cut + 1));

// Must pause: the phrases testers sent, in both spellings of "più", the English ones, and German, French, Dutch and Swedish ones (with and without accents).
const HEAVY_TEXTS = [
  'Non voglio piu vivere', 'Non voglio più vivere', 'NON VOGLIO PIÙ VIVERE', "non voglio piu' vivere", 'Non voglio piu vivere e non so cosa scrivere',
  'Mi voglio uccidere', 'Penso di togliermi la vita', 'Mi faccio del male da solo', 'Vorrei sparire per sempre', 'Sono senza speranza, sto malissimo',
  'voglio morire', 'Penso al suicidio', 'Ho pensato di farla finita', 'Non ce la faccio piu', 'Non ce la faccio più', "Non ce la faccio piu'",
  "non vedo via d'uscita", 'non vedo via d’uscita', 'non vedo una via d’uscita', 'non riesco piu a vivere', 'non voglio piu stare qui',
  'I want to kill myself', "I don't want to live", 'I don’t want to live', 'I dont want to live', 'I feel hopeless', 'I want to end it all',
  'Ich will nicht mehr leben', 'ich mochte nicht mehr leben', 'Ich möchte sterben', 'Ich will mich umbringen', 'Ich denke an Suizid', 'Ich habe Selbstmordgedanken',
  'Ich ritze mich', 'Ich verletze mich selbst', 'Ich will mir das Leben nehmen', 'Ich sehe keinen Ausweg mehr', 'Alles ist hoffnungslos', 'Ich kann nicht mehr',
  'ich kann einfach nicht mehr, sorry', '<user_message>Ich kann nicht mehr</user_message>', 'Ich will einfach verschwinden',
  'Je veux mourir', 'Je ne veux plus vivre', 'je veux plus vivre', 'J’ai envie de me tuer', "J'ai envie de me tuer", 'Je pense au suicide', 'Je veux en finir',
  'J’ai envie d’en finir', 'Je me fais du mal', 'Je n’en peux plus', "j'en peux plus", 'Je suis sans espoir', 'Je n’ai plus envie de vivre',
  'Je veux mettre fin à mes jours', 'Je me scarifie', 'Je veux disparaître', 'je veux disparaitre',
  'Ik wil niet meer leven', 'Ik wil dood', 'ik wil doodgaan', 'Ik denk aan zelfmoord', 'Ik heb zelfmoordgedachten', 'Ik denk aan suïcide', 'Ik wil mezelf iets aandoen',
  'Ik doe mezelf pijn', 'Ik snij mezelf', 'Ik zie het niet meer zitten', 'Alles is hopeloos', 'Ik kan niet meer', 'ik kan echt niet meer, sorry', 'Ik kan het niet meer aan',
  'Ik wil gewoon verdwijnen', 'Ik wil er een eind aan maken', 'Ik wil een einde aan mijn leven maken', 'Ik ben liever dood', 'Ik wil niet meer wakker worden', 'Ik zie geen uitweg meer',
  'Jag vill inte leva längre', 'Jag vill dö', 'jag vill bara dö.', 'JAG VILL DÖ', 'Jag tänker på självmord', 'Jag vill ta mitt liv', 'Jag vill ta livet av mig', 'Jag skadar mig själv',
  'Jag skär mig', 'Jag har självskadebeteende', 'Allt känns hopplöst', 'Jag orkar inte mer', 'Jag orkar inte leva', 'Jag vill bara försvinna', 'Jag ser ingen utväg',
  'Det finns ingen anledning att leva', 'Jag är hellre död', 'Jag vill inte finnas längre', 'Jag vill göra slut på allt',
  'Quiero morir', 'quiero morirme', 'Me quiero morir', 'No quiero vivir', 'No quiero seguir viviendo', 'Quiero matarme', 'Pienso en el suicidio', 'Quiero quitarme la vida',
  'Quiero acabar con todo', 'Me hago daño', 'me hago dano', 'No puedo más', 'no puedo mas, de verdad', 'Estoy sin esperanza', 'No veo salida', 'Quiero desaparecer',
  'Estaría mejor muerta', 'No quiero despertar', 'Tengo autolesiones',
];
// Must not pause: ordinary words that sit close to those.
const FINE_TEXTS = [
  'A poster for Friday dinner', 'Voglio vivere di musica', 'I am hopeful about this design', 'Il bar non ha piu tavoli', 'la piu bella idea',
  'voglio un logo piu grande', 'non vedo la via principale nel disegno', 'Non vedo l’ora di iniziare', "I can't wait to start", 'Una idea con speranza e coraggio',
  'non ce la faccio a finire il logo oggi',
  'Ein Poster für das Abendessen am Freitag', 'Ich will von der Musik leben', 'Ich kann nicht mehr warten, bis es losgeht', 'Die Ritzen im Holz sind schön',
  'Das Lied bringt mich um den Schlaf', 'Eine Idee voller Hoffnung', 'Der Laden hat nicht mehr lange offen',
  'Une affiche pour le dîner de vendredi', 'Je veux vivre de la musique', 'La musique est ma raison de vivre', 'Pour en finir avec ce logo trop chargé',
  'Je ne peux plus attendre de commencer', 'Ce texte me tue de rire', 'Je veux un logo plus grand',
  'Een poster voor het etentje op vrijdag', 'Ik kan niet meer wachten tot het begint', 'Ik wil doodgewoon een rustige poster', 'Ik zie het helemaal zitten', 'Ik wil leven van muziek',
  'Deze clip is om dood te lachen', 'De winkel is niet meer open na zes uur',
  'En affisch till middagen på fredag', 'Jag vill döpa butiken till Mira', 'Jag orkar inte mer kaffe idag', 'Jag vill leva på musik', 'Det här skämtet dödar mig',
  'Jag vill inte vakna tidigt imorgon', 'Jag vill inte finnas med på bilden', 'Det var mitt livs bästa dag', 'Vi gör slut på allt godis',
  'Un póster para la cena del viernes', 'Quiero vivir de la música', 'No quiero vivir en Madrid', 'No puedo esperar a empezar', 'Me muero de risa con este clip',
  'Este chiste me mata', 'Me corto el pelo mañana', 'Vamos a acabar con todo el pastel', 'Quiero un logo más grande', 'La tienda no abre más tarde',
];
for (const t of HEAVY_TEXTS) assert.ok(HEAVY.test(t), `HEAVY must pause on "${t}"`);
for (const t of FINE_TEXTS) assert.ok(!HEAVY.test(t), `HEAVY must not pause on "${t}"`);

// The pause itself: the server's PAUSE and the app's HEAVY_REPLY (Italian in i18n.ts, German, French, Dutch and Swedish in CRISIS_DE / CRISIS_FR / CRISIS_NL / CRISIS_SV) are the same fixed text, with the checked numbers.
const pause = readFileSync(FILES[1], 'utf8').match(/^(?:export )?const PAUSE: Record<string, string> = \{ en: (".+?"), it: (".+?"), de: (".+?"), fr: (".+?"), nl: (".+?"), sv: (".+?"), es: (".+?") \};$/m);
const appReply = readFileSync(FILES[0], 'utf8').match(/^const HEAVY_REPLY = (".+");$/m);
assert.ok(pause && appReply, 'no "const PAUSE: Record<string, string> = { en: "...", it: "...", de: "...", fr: "...", nl: "...", sv: "...", es: "..." };" in coach.mts or no "const HEAVY_REPLY = "...";" in app.ts');
const [en, it, de, fr, nl, sv, es] = pause.slice(1).map((t) => JSON.parse(t));
assert.equal(JSON.parse(appReply[1]), en, 'the app and the server must show the same English pause');
for (const [file, text, name] of [['src/scripts/i18n.ts', it, 'Italian'], ['src/scripts/i18n-de.ts', de, 'German'], ['src/scripts/i18n-fr.ts', fr, 'French'], ['src/scripts/i18n-nl.ts', nl, 'Dutch'], ['src/scripts/i18n-sv.ts', sv, 'Swedish'], ['src/scripts/i18n-es.ts', es, 'Spanish']]) {
  assert.ok(readFileSync(file, 'utf8').includes(`${JSON.stringify(en)}: ${JSON.stringify(text)}`), `${file} must translate the pause with the server's ${name} text`);
}
// "Need to talk to someone now?" (app.ts helpText) shows the pause without its first sentence: no number may sit in that sentence.
for (const t of [en, it, de, fr, nl, sv, es]) assert.ok(!/\d/.test(t.match(/^[^.]*\.\s*/)[0]), `the first sentence of the pause must have no number, the helpline link drops it: "${t.slice(0, 60)}"`);
for (const n of ['116 123', '112', '999']) assert.ok(en.includes(n), `English pause lost ${n}`);
for (const n of ['02 2327 2327', '112']) assert.ok(it.includes(n), `Italian pause lost ${n}`);
for (const n of ['0800 111 0 111', '0800 111 0 222', '116 123', '142', '143', '112']) assert.ok(de.includes(n), `German pause lost ${n}`);
for (const n of ['3114', '0800 32 123', '143', '112']) assert.ok(fr.includes(n), `French pause lost ${n}`);
for (const n of ['113', '0800-0113', '113.nl', '1813', '112']) assert.ok(nl.includes(n), `Dutch pause lost ${n}`);
for (const n of ['90101', 'mind.se', '1177', '112']) assert.ok(sv.includes(n), `Swedish pause lost ${n}`);
for (const n of ['024', '112']) assert.ok(es.includes(n), `Spanish pause lost ${n}`);
for (const [name, t, word] of [['English', en, 'project'], ['Italian', it, 'progetto'], ['German', de, 'Projekt'], ['French', fr, 'projet'], ['Dutch', nl, 'project'], ['Swedish', sv, 'projektet'], ['Spanish', es, 'proyecto']]) assert.ok(t.match(/^[^.]*\./)[0].includes(word), `the ${name} pause pauses the ${word}, the app's one word for the work`);

console.log(`distress screen: ok (${HEAVY_TEXTS.length} phrases pause, ${FINE_TEXTS.length} do not, same pause text with helplines in app and server)`);
