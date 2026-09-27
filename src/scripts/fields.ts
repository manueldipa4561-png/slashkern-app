import { t2 } from './i18n';

      const small = t2('What is the smallest version you could finish today?', 'Qual è la versione più piccola che potresti finire oggi?');
      const avoid = t2('Which part are you avoiding, and why?', 'Quale parte stai evitando, e perché?');
      const KERN3 = ['Mission 003 · KERN', 'Rewrite a confusing email', 'Do it your way. Every answer counts.'];
// Null prototype (set below) so FIELDS[key] is a safe check for keys from URLs or storage, even "__proto__".
export const FIELDS: Record<string, { m: string[][]; idea: string; qs: string[] }> = {
        Design: { m: [
          ['Mission 002 · startup partner', 'Fix what already exists', "Make a real startup's onboarding screen clearer. The opposite of starting from a blank page."],
          KERN3,
          ['Mission 004 · studio client', 'Work with a partner', 'Answer together with someone else.'],
        ], idea: 'Your idea: a 3-step onboarding with one clear choice at the start.', qs: ['What would make the first step easier for someone brand new?', avoid, small] },
        Writing: { m: [
          [t2('Mission 002 · newsletter partner', 'Missione 002 · partner newsletter'), t2('Make a hard idea easy', "Rendi facile un'idea difficile"), t2('Take a confusing explanation from a real newsletter and rewrite it so anyone gets it.', 'Prendi una spiegazione confusa di una vera newsletter e riscrivila in modo che chiunque la capisca.')],
          KERN3,
          ['Mission 004 · studio client', t2('Write with a partner', 'Scrivi con un partner'), t2('Write one short story together, taking turns.', 'Scrivete insieme un breve racconto, a turno.')],
        ], idea: t2('Your idea: a first line that makes a stranger keep reading.', 'La tua idea: una prima riga che fa continuare a leggere uno sconosciuto.'), qs: [t2('Who is this for, exactly?', 'Per chi è, esattamente?'), t2('Which sentence would you cut first?', 'Quale frase taglieresti per prima?'), small] },
        Code: { m: [
          ['Mission 002 · startup partner', t2('Fix a small bug', 'Correggi un piccolo bug'), t2("Find why a real app's button does nothing, and fix it. The opposite of building from scratch.", "Scopri perché il pulsante di una vera app non fa nulla e correggilo. L'opposto di costruire da zero.")],
          ['Mission 003 · KERN', t2('Build a tiny tool', 'Costruisci un piccolo strumento'), t2('Solve one small annoyance from your day. Every answer counts.', 'Risolvi un piccolo fastidio della tua giornata. Ogni risposta conta.')],
          ['Mission 004 · studio client', t2('Build with a partner', 'Costruisci con un partner'), t2('Split a small feature between two people.', 'Dividetevi una piccola funzione in due.')],
        ], idea: t2('Your idea: a tool that removes one repeated step from your day.', 'La tua idea: uno strumento che elimina un passaggio ripetuto della tua giornata.'), qs: [t2('What is the one thing it must do?', "Qual è l'unica cosa che deve fare?"), avoid, small] },
        Video: { m: [
          [t2('Mission 002 · brand partner', 'Missione 002 · brand partner'), t2('Cut one clear story', 'Monta una storia chiara'), t2('Turn rough footage from a real brand into one clear, short story.', 'Trasforma il girato grezzo di un vero brand in una storia breve e chiara.')],
          ['Mission 003 · KERN', t2('Explain something on camera', 'Spiega qualcosa in video'), t2('Explain one thing you know in one short clip.', 'Spiega una cosa che sai in un breve video.')],
          ['Mission 004 · studio client', t2('Make it with a partner', 'Fallo con un partner'), t2('One films, one edits.', 'Uno gira, uno monta.')],
        ], idea: t2('Your idea: open on the surprise, not on the logo.', 'La tua idea: apri con la sorpresa, non con il logo.'), qs: [t2('What should someone feel in the first second?', 'Cosa dovrebbe sentire qualcuno nel primo secondo?'), avoid, small] },
        Selling: { m: [
          [t2('Mission 002 · small business partner', 'Missione 002 · piccola impresa partner'), t2('Get a stranger to say yes', 'Fatti dire di sì da uno sconosciuto'), t2("Pitch a real small business's product to one person and note what they answer.", 'Proponi il prodotto di una vera piccola impresa a una persona e annota cosa risponde.')],
          ['Mission 003 · KERN', t2('Write a message that gets a reply', 'Scrivi un messaggio che riceve risposta'), 'Do it your way. Every answer counts.'],
          ['Mission 004 · studio client', t2('Sell with a partner', 'Vendi con un partner'), t2('One talks, one listens.', 'Uno parla, uno ascolta.')],
        ], idea: t2('Your idea: lead with the problem, not the product.', 'La tua idea: parti dal problema, non dal prodotto.'), qs: [t2('Who needs this most, by name?', 'Chi ne ha più bisogno, con nome e cognome?'), t2('What would make them say no?', 'Cosa li farebbe dire di no?'), small] },
        Music: { m: [
          ['Mission 002 · brand partner', t2('Give a small brand a sound', 'Dai un suono a un piccolo brand'), t2('Write a short sound or jingle for a real small brand.', 'Scrivi un breve suono o jingle per un vero piccolo brand.')],
          ['Mission 003 · KERN', t2('Remix something you love', 'Remixa qualcosa che ami'), 'Do it your way. Every answer counts.'],
          ['Mission 004 · studio client', 'Make it with a partner', t2('One writes, one produces.', 'Uno scrive, uno produce.')],
        ], idea: t2('Your idea: one repeating sound people remember.', 'La tua idea: un suono che si ripete e che le persone ricordano.'), qs: [t2('What should it feel like in the first two seconds?', 'Che effetto dovrebbe fare nei primi due secondi?'), avoid, small] },
      };
Object.setPrototypeOf(FIELDS, null);
