# KERN missions: authoring guide

For people and for the Mission Studio AI. A mission is one tiny, concrete task, done in 2-5 minutes on a phone, that can be posted or sent tonight. English and Italian always.

<!-- studio:rules -->
## Audience and tone
People aged 18-35, on their phone, mostly with no training, trying different paths to find what they love.

- Start from a real situation they know (a flat caption, a rude comment, a weak listing). Plain, warm, second person. Verb first, one action per step. Light self-deprecating humour is welcome.
- Limits: brief about 30 words, step about 12, quality bar about 8, asset up to 6 short lines, 2-5 minutes.
- When the asset is a photo, a screen or a post, show it as a picture instead of describing it: put a WebP in `public/img/m/` and set `img` on the asset (`imgIt` if the picture contains text, `only: true` to hide the written version). `npm test` checks the file exists. The easy version keeps its own text.
- No jargon (add a 5-word gloss if needed), no borrowed slang, no emoji walls. Never write `unlock your potential`, `personal brand`, `monetise` or `business case`. No mentor voice, no guilt, no fake scarcity. Selling is honest persuasion.
- Never assume a tool: a notes app is enough. The answer is typed text. If the task is visual or audio, the answer is the plan (a script, a described layout, a song order).
- Safe: 18+, no body-shaming, harassment, sexual content, real people or real song lyrics.
- Italian is written natively, not translated: informal "tu", same facts and numbers, keep loanwords Italians use (bio, storie, reel, caption, post).
- Examples look human and slightly imperfect, never polished. Hints are questions and never give the answer.

## Kinds and rounds
Missions come in rounds of 3. The kind is the index % 3: 0 improve what exists (the asset is a flawed thing to fix), 1 start from zero (a short brief), 2 with a partner (a pair task that also works alone, the brief ends "Pair up, or do both parts."). Round 1 (indexes 0-2) is the quickest and most universal. Round 2 is a notch richer.

## Brandable subjects
Real brands will sponsor missions, so build them around a subject a brand could own (a snack, bar, stall, gym, channel). Use a short invented name marked "(fictional)", never a real company or its real features.
<!-- /studio:rules -->

## Sponsors
`src/scripts/sponsors.ts` maps `Field.index` to `{ name, color }`. The mission text stays brand-neutral. One line there shows "Brand mission · name" in the brand's `#rrggbb` colour. `npm test` checks that the key points at a real mission.

## Trending projects
A short "Trending now" shelf on the Projects tab holds practice projects built on what is spreading on TikTok and Instagram. `src/scripts/trending.ts` has them in the same shapes as every mission (label, title and blurb of `fields.ts`, `MissionX` of `missions.ts`, `Help` of `helps.ts`; German and French in `i18n-trending.ts`) and they sit after the 6 core projects of their category, from index `TREND_FROM` (6) up. Rounds, the Kern card's guess and the opt-in counts only look at the core 6. Append only (a saved answer points at the index), 20 to 40 minutes, no money, no promise of reach, AI help always labelled in the brief, never a copy of a real person's face or voice, no copyrighted sound. The shelf says once when the trends were seen ("Seen Aug to Oct 2026. Trends move fast."): when they go stale, replace the entries and that date together. `scripts/check-trending.mjs` checks all of this.

## Premium and free windows (planned)
`src/scripts/access.ts` is planned and does not exist yet. The intent: a mission is free, premium, or premium with a free window (open to everyone for a limited time, such as a brand campaign), decided outside the mission text. Until then write every mission as free, with no flags.

## Data shapes
Same index in all four files. One worked example each (trimmed):

```ts
// fields.ts, inside the field's m: [ ... ]
m('Project 008 · sample stand', 'Progetto 008 · banchetto assaggi', ['Sell a snack in 10 seconds', 'Vendi uno snack in 10 secondi'], ['Free samples, busy fair.', 'Assaggi gratis, fiera affollata.']),

// missions.ts, inside MX.Selling
{
  who: tag('Pallino Pops, a lentil snack (fictional)', 'Pallino Pops, snack di lenticchie (fittizio)'),
  brief: t2('Write 3 lines that make a stranger taste.', 'Scrivi 3 frasi che fanno assaggiare.'),
  asset: { mono: false, title: t2('The table', 'Il tavolo'), body: t2('Puffs, €1.20\nBaked', 'Soffiate, 1,20 €\nAl forno') },
  steps: [t2('Write a first line.', 'Scrivi una prima frase.'), t2('Add one true fact.', 'Aggiungi un fatto vero.'), t2('Ask a question.', 'Fai una domanda.')],
  mins: 3,
  bar: [t2('Fits one breath', 'Sta in un respiro'), t2('Only true facts', 'Solo fatti veri'), t2('Easy to say no', 'Facile dire no')],
  twist: t2('Copy it. Say it to a friend.', 'Copialo. Dillo a qualcuno.'),
},

// helps.ts, inside HELPS.Selling: example, then 3 hint questions
h(['Free crunch, no catch.', 'Crunch gratis.'], ['What slows people?', 'Cosa fa rallentare?'], ['Which fact is true?', 'Quale fatto è vero?'], ['What is an easy ask?', 'Qual è una richiesta facile?']),

// easy.ts, inside EASY.Selling: brief, 3 steps, example, simpler asset, 3 hints
e(['Greet a stranger at a snack table.', 'Saluta chi passa al banco.'], [['Read the card.', 'Leggi la scheda.'], ['Write a line.', 'Scrivi una frase.'], ['Add a question.', 'Aggiungi una domanda.']], ['Baked lentils. Want one?', 'Lenticchie al forno. Ne vuoi?'], { title: ['The card', 'La scheda'], body: ['Baked, not fried', 'Al forno, non fritte'] }, [['What stops you?', 'Cosa ti ferma?'], ['Which fact is easy?', 'Quale fatto è facile?'], ['What is an easy ask?', 'Qual è una richiesta facile?']]),

// sponsors.ts
'Selling.7': { name: 'Pallino Pops', color: '#C8553D' },
```

A line break in a string is `\n`, the same count in EN and IT.

## Checklist
- 3 steps, 3 bars, 3 hints, 3 easy steps. `mins` 2-5. Kind matches index % 3.
- Every EN has a different IT twin. No English reused with another Italian.
- Label and title are new. The brand is invented, unused, marked fictional.
- `npm test` is green (same mission count in every field, in rounds of 3).

## Run the studio
```
read -rs ANTHROPIC_API_KEY && export ANTHROPIC_API_KEY   # type the key (it stays hidden), press Enter
node scripts/mission-studio.mjs --field Selling --kind zero --subject "Crunchino, a chickpea snack"
# or keep the key in .env (gitignored): node --env-file=.env scripts/mission-studio.mjs --field ...
```
Options: `--notes`, `--model`, `--out drafts`, `--dry-run` (prints the prompt, no network), `--from-json file` (replays a saved answer). It prints PASS/FAIL for 29 rules and writes `<Field>-<kind>-<timestamp>.json` plus four `.txt` snippets, never overwriting. Exit 1 means any rule failed. Nine rules guard format and safety: the shape, both languages, `mins`, one line per text, length, and no HTML, URLs, code fences or code. If one fails, only the JSON is saved and no snippets. The rest are reported and you fix them by hand. Self-test, offline: `node scripts/check-studio.mjs`.

## Review an AI draft
1. Read it as a 24-year-old with no experience: clear in 5 seconds? A smile?
2. Numbers agree across brief, asset and example. The example obeys its own limit.
3. Read the Italian aloud: natural, not a translation.
4. No fake pressure, health promises, real people, brands or lyrics.
5. Hints ask, never answer. The example looks human.
6. No invisible or odd characters (the studio escapes them, so a `\u` you did not write is a red flag).
7. Paste at the same index in all four files, run `npm test`, try it in the app, get a second reader.
