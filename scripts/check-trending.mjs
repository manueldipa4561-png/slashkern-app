// Checks the "Trending now" shelf (src/scripts/trending.ts): 8 projects in the 7 categories, each complete in English, Italian, German, French, Dutch and Swedish, with 3 steps,
// 3 checks and 3 hint questions, the shelf label with its one dating sentence, and the rules of the brief: no money, no hype, AI help is always labelled, the AI character
// has its disclosure line, nothing asks for a copy of a real person, and no copyrighted sound. Run: npm test
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildSync } from 'esbuild';

const entry = ['fields', 'missions', 'helps', 'trending', 'i18n', 'i18n-de', 'i18n-fr', 'i18n-nl', 'i18n-sv', 'i18n-es'].map((f) => `export * from './src/scripts/${f}.ts';`).join('\n');
const { text } = buildSync({ stdin: { contents: entry, resolveDir: process.cwd(), loader: 'ts' }, bundle: true, format: 'esm', platform: 'node', write: false }).outputFiles[0];
const { FIELDS, MX, HELPS, IT, DE, FR, NL, SV, ES, TREND_FROM, TREND_SHELF, TRENDING } = await import(`data:text/javascript;base64,${Buffer.from(text).toString('base64')}`);

const strings = (v) => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : []);
const LANGS = { en: (s) => s, it: (s) => IT[s], de: (s) => DE[s], fr: (s) => FR[s], nl: (s) => NL[s], sv: (s) => SV[s], es: (s) => ES[s] };

// The 7 categories keep their keys, and the shelf has the 8 projects of the brief in this order.
assert.deepEqual(Object.keys(FIELDS).sort(), ['Code', 'Design', 'Music', 'Prompting', 'Selling', 'Video', 'Writing'], 'the 7 category keys are unchanged');
assert.equal(TRENDING.length, 8, 'the shelf has 8 projects');
assert.deepEqual(TRENDING.map((t) => t.f), ['Video', 'Video', 'Prompting', 'Writing', 'Design', 'Selling', 'Music', 'Code']);
const TITLES = ['Answer in one word', 'AI script, straight face', 'Invent an AI creator, and label it', 'My latest flops', 'Where are you? Home.', '“Yes, but” honest listing', 'Your own sound', 'One-word oracle page'];
const seen = {};
for (const { f, i } of TRENDING) {
  seen[f] = (seen[f] ?? TREND_FROM - 1) + 1;
  assert.equal(i, seen[f], `${f}: Trending projects take the indices after the core ones, in order (found ${i}, wanted ${seen[f]})`);
}

// The words, per language. EN is the source; the others are the t2 / i18n-trending.ts texts.
const NO_MONEY = {
  en: /[€$£]|\b(eur|usd|euros?|dollars?|cents?|cash|money|earn\w*|paid|pay|payment|income|salary|profit|revenue)\b/i,
  it: /[€$£]|\b(euro|guadagn\w*|pagat\w*|pagare|pagamento|reddito|stipendio|soldi|denaro|incass\w*|profitt\w*)\b/i,
  de: /[€$£]|\b(euro|verdien\w*|bezahl\w*|geld|einkommen|gehalt|gewinn|einnahmen)\b/i,
  fr: /[€$£]|\b(euros?|gagn\w*|pay\w*|argent|revenus?|salaire|bénéfice|rémunér\w*)\b/i,
  nl: /[€$£]|\b(euros?|verdien\w*|betaal\w*|betaald|betalen|geld|inkomen|salaris|winst|omzet)\b/i,
  sv: /[€$£]|\b(euro|kronor|tjäna\w*|tjänar|betal\w*|pengar|inkomst\w*|lön|vinst\w*|intäkt\w*)(?![a-zåäö])/i, // no \b after å, ä, ö: JavaScript's \b only knows ASCII letters
  es: /[€$£]|\b(euros?|ganar|ganancias?|pagar|pagad[oa]s?|pago|cobrar|dinero|ingresos|sueldo|salario|beneficios)(?![a-záéíóúñ])/i,
};
const NO_HYPE = /viral|famous|fame\b|berühmt|célèbre|celebre|beroemd|berömd|kändis|guarantee|garantie|garantit|garantisc|garantiert|garand|garanti|famos[oa]s?|garantiz|garantía|\p{Extended_Pictographic}/iu; // no "go viral", no promise of reach, no emoji (so no flame)
const BANNED_WORD = /lavor/i; // the Italian "lavor-" family, in any language's text
// What a brief says so the AI help is labelled: "say in your caption", "a line that says it is an AI character", "say so on the page".
const LABELS = {
  en: /\b(say|says)\b[^.]*\bAI\b|\bsay so\b/i,
  it: /\b(scrivi\w*|dice|dire)\b[^.]*\bAI\b|\bscrivilo sulla pagina\b/i,
  de: /\b(schreib\w*|sagt|sag\w*)\b[^.]*\bKI\b|\bschreib das auf die Seite\b/i,
  fr: /(écris|dit|dire)[^.]*\bIA\b|dis-le sur la page/i, // no \b before é: JavaScript's \b only knows ASCII letters
  nl: /\b(zeg|zegt|vermeld\w*|schrijf|schrijft)\b[^.]*\bAI\b|\bzeg het op de pagina\b/i,
  sv: /\b(säg|säger|skriv|skriver)\b[^.]*\bAI\b|\bsäg det på sidan\b/i,
  es: /\b(di|dice|diga|digas|decir|dilo|escribe|escribir|indica|indícalo|pon)\b[^.]*\bIA\b|dilo en la página/i,
};
const AI_CHARACTER = { en: /AI character/, it: /personaggio AI/, de: /KI-Figur/, fr: /personnage IA/, nl: /AI-personage/, sv: /AI-karaktär/, es: /personaje (de )?IA/ };
const REAL_PERSON = { en: /real person/, it: /persona reale/, de: /echte[nr]? Person/, fr: /personne réelle/, nl: /echte? persoon/, sv: /verklig person/, es: /persona real/ };
const NO_COPYRIGHTED = { en: /No copyrighted music/, it: /protetta da copyright/, de: /urheberrechtlich geschützte Musik/, fr: /musique protégée/, nl: /auteursrechtelijk beschermde muziek/i, sv: /upphovsrättsskyddad musik/i, es: /derechos de autor|música protegida/i };

for (let k = 0; k < TRENDING.length; k++) {
  const { f, i } = TRENDING[k], at = `trending #${k + 1} (${f}.${i})`;
  const m = FIELDS[f].m[i], x = MX[f][i], h = HELPS[f][i];
  assert.equal(m[1], TITLES[k], `${at}: the title is "${TITLES[k]}"`);
  assert.equal(m.length, 3, `${at}: label, title, blurb`);
  assert.ok(m[1].trim() && m[2].trim() && x.brief.trim() && x.twist.trim() && x.answer.trim() && x.asset.title.trim() && x.asset.body.trim() && h.ex.trim(), `${at}: nothing may be empty`);
  assert.equal(x.steps.length, 3, `${at}: 3 steps`);
  assert.equal(x.bar.length, 3, `${at}: 3 checks`);
  assert.equal(h.hints.length, 3, `${at}: 3 hint questions`);
  assert.ok(Number.isInteger(x.mins) && x.mins >= 20 && x.mins <= 40, `${at}: a Trending project takes about 20 to 40 minutes, found ${x.mins}`);
  assert.equal(x.asset.mono, false);
  assert.ok(x.who.startsWith('Practice project · '), `${at}: it is a practice project`);
  assert.ok(x.brief.length <= 300, `${at}: the coach reads the first 300 characters of the brief (coach.mts), this one has ${x.brief.length}`);
  assert.ok(!strings([m, x, h]).some((s) => s.includes('Seen Aug to Oct 2026')), `${at}: the dating sentence is said once, on the shelf, not on a project`);

  for (const [lang, tr] of Object.entries(LANGS)) {
    const all = strings([m, x, h]);
    for (const s of all) {
      const t = tr(s);
      assert.ok(t && t.trim(), `${at}: no ${lang} text for "${s.slice(0, 60)}"`);
      if (lang !== 'en' && s.length >= 25 && !s.startsWith('Practice project · ')) assert.notEqual(t, s, `${at}: the ${lang} text is the English one for "${s.slice(0, 60)}"`);
      assert.ok(!BANNED_WORD.test(t), `${at}: banned word in ${lang}: "${t.slice(0, 60)}"`);
      assert.ok(!NO_MONEY[lang].test(t), `${at}: money in ${lang}: "${t.slice(0, 60)}"`);
      assert.ok(!NO_HYPE.test(t), `${at}: hype in ${lang}: "${t.slice(0, 60)}"`);
    }
    for (const q of h.hints) assert.ok(tr(q).trim().endsWith('?'), `${at}: a hint is a question in ${lang}: "${tr(q)}"`);
    if (/\bAI\b/.test(x.brief)) assert.ok(LABELS[lang].test(tr(x.brief)), `${at}: this project uses an AI, its ${lang} brief must say to label it`);
  }
  if (/\bAI\b/.test(x.brief)) assert.ok(LABELS.en.test(x.brief.slice(0, 300)), `${at}: the AI-labelling reminder must sit inside the 300 characters the coach reads`);
}

// Project 3 (the AI character): the disclosure is its last step, its last check and its last hint question, in every language.
const [f3, i3] = [TRENDING[2].f, TRENDING[2].i], x3 = MX[f3][i3], h3 = HELPS[f3][i3];
for (const [lang, tr] of Object.entries(LANGS)) {
  for (const [what, en] of [['step', x3.steps[2]], ['check', x3.bar[2]], ['hint question', h3.hints[2]]]) assert.ok(AI_CHARACTER[lang].test(tr(en)), `AI character: the last ${what} must ask for the line that says it is an AI character (${lang}): "${tr(en)}"`);
  assert.ok(AI_CHARACTER[lang].test(tr(x3.brief)) && REAL_PERSON[lang].test(tr(x3.brief)), `AI character: the ${lang} brief names the disclosure and says never to base it on a real person`);
}
// Nothing asks anyone to copy a real person: the projects with a face, a voice or a character say so in their brief (and the clip rules).
for (const k of [1, 2, 6]) for (const [lang, tr] of Object.entries(LANGS)) assert.ok(REAL_PERSON[lang].test(tr(MX[TRENDING[k].f][TRENDING[k].i].brief)), `trending #${k + 1}: the ${lang} brief says it is never a real person`);
// The sound project: original, no copyrighted music, no samples.
const sound = MX[TRENDING[6].f][TRENDING[6].i];
for (const [lang, tr] of Object.entries(LANGS)) assert.ok(NO_COPYRIGHTED[lang].test(tr(sound.brief)) && NO_COPYRIGHTED[lang].test(tr(sound.asset.body)), `Your own sound: the ${lang} brief and rules must say no copyrighted music`);

// The shelf: its label, the one dating sentence, the tag, in all six languages, and the markup in the Projects tab.
assert.equal(TREND_SHELF.title, 'Trending now');
assert.equal(TREND_SHELF.note, 'Seen Aug to Oct 2026. Trends move fast.');
assert.equal(TREND_SHELF.tag, 'Trending');
for (const [name, en] of Object.entries(TREND_SHELF)) for (const [lang, tr] of Object.entries(LANGS)) {
  const t = tr(en);
  assert.ok(t && t.trim(), `shelf ${name}: no ${lang} text`);
  if (lang !== 'en') assert.notEqual(t, en, `shelf ${name}: the ${lang} text is the English one`);
  assert.ok(!BANNED_WORD.test(t) && !NO_HYPE.test(t), `shelf ${name}: banned word in ${lang}`);
}
const page = readFileSync('src/pages/index.astro', 'utf8');
const tab = page.slice(page.indexOf('id="k-missions"'), page.indexOf('id="k-yourkern"'));
assert.ok(tab.includes('id="kTrend"') && tab.includes('id="kTrendL"') && tab.includes(`>${TREND_SHELF.title}</h5>`), 'index.astro: the Trending shelf sits in the Projects tab, labelled "Trending now"');
assert.equal(page.split(TREND_SHELF.note).length - 1, 1, 'index.astro: the dating sentence appears once');
assert.ok(tab.indexOf('id="kTrend"') > tab.indexOf('id="kMsL"') && tab.indexOf('id="kTrend"') < tab.indexOf('id="kKeep"'), 'index.astro: the shelf is a card of its own, after the list of projects and before Keep');
// app.ts: the core counts and the Kern card's guess ignore Trending answers, the shelf is built from TRENDING with the tag on each card, and nothing Trending goes to the counts table.
const app = readFileSync('src/scripts/app.ts', 'utf8');
assert.match(app, /const doneIn = \(f: string\) => new Set\(S\.answers\.filter\(\(a\) => a\.f === f && a\.i < TREND_FROM\)/, 'app.ts: doneIn counts core projects only');
assert.match(app, /const kindOf = \(a: \{ i: number \}\) => \(a\.i < TREND_FROM \? a\.i % PER_ROUND : -1\)/, 'app.ts: a Trending project has no kind');
assert.ok(!/a\.i % PER_ROUND/.test(app.replace(/const kindOf[^\n]*\n/, '')), 'app.ts: use kindOf, not a.i % PER_ROUND, so a Trending answer never changes the guess');
assert.ok(/for \(const \{ f, i \} of TRENDING\)/.test(app) && /TREND_SHELF\.tag/.test(app), 'app.ts: the shelf is built from TRENDING, with the Trending tag on every card');
assert.ok(/i >= TREND_FROM\)\) stats\.track/.test(app) || /!\(i !== undefined && i >= TREND_FROM\)/.test(app), 'app.ts: Trending projects are not sent to the counts table (it takes projects 0 to 5)');
console.log(`trending: ok (${TRENDING.length} projects in 6 languages, 3 steps / 3 checks / 3 questions each, shelf label and dating sentence, AI labelled, disclosure line, no money or hype)`);
