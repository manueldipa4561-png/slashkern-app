# Pieces

A **piece** is a longer project than the 3-step ones: about five small steps (taps, a beat, one or two short lines) that take about ten minutes and end in **one page the person can show**. It is the pilot's main thing to make, one per field: the short projects stay as warm-ups.

Every part of the page is something the person picked or wrote. Slash only asks questions on the way. The one exception is the Prompting piece, whose last step sends the person's own prompt to the AI and keeps the answer: that run is marked AI and the page labels exactly that part "AI". Every client in a piece is fictional and the page says so.

| Field | Piece | Client (fictional) | What the page is |
| --- | --- | --- | --- |
| Design | Brand sheet for a bar | Bar Ficus | a sheet in the person's three colours, with a logo shape, feeling words and a line |
| Writing | Launch kit for a new flavour | Pigro Gelato | the flavour's name, the sign for the counter and the first post |
| Code | One-page website | Sunny Plants | a browser mock, and a real `.html` file to download and host |
| Video | 15-second storyboard | Rocco's sandwich van | four frames with timecodes, the words on screen, the sound and the caption |
| Selling | Listing for a used lamp | Marta | a marketplace listing with honest notes and the first message to a buyer |
| Music | Beat and release card | Clank Gym | a cover, a beat grid and a Play button that plays the beat |
| Prompting | A prompt that does one job | Dana's pottery class | the prompt, and what the AI made of it, marked AI |

## What the person gets

- **The page**, on screen, in the app (Your page lists each finished piece as a small copy of itself).
- **A picture to save and post** (1080 px wide, 4:5 or taller): "Save as image".
- **A share link** for a CV or a message: `/p/#…`. The piece rides in the part after the `#`, so it never reaches a server; the page it opens (`src/pages/p.astro`, `src/scripts/public-page.ts`) is read-only, needs no account, and says it was shared by link and not checked. A link is read like stored data: untrusted, cleaned by `cleanRun`, finished pieces only.
- **A name on the page** (optional), and **how it was made**: when it was started and finished, that no AI wrote any of it (or what the AI wrote), and how many questions Slash asked.

Accounts, handles and pages that companies can browse are not built yet (the backend is on branch `worktree-agent-ad0ad96cb9f4d2c26`, `supabase/creators.sql`; its `publish_project` fits a piece).

## Code map

| File | What it holds |
| --- | --- |
| `src/scripts/piece-types.ts` | the types (`Piece`, `Step` of four kinds, `Run`, `Kind`), step builders, `stepOk`, colour maths, the logo/cover `SHAPES` |
| `src/scripts/piece-kit.ts` | DOM helpers, `Draw` (the canvas picture) and `playBeat` (a tiny drum machine) |
| `src/scripts/piece-<name>.ts` | one piece: data, `view` (pure), `dom` (the page), `img` (the picture), optionally `file` and `prompt` |
| `src/scripts/pieces.ts` | the registry (`PIECES`, `kindOf`), the words around every piece (`PL`), `cleanRun`, share links |
| `src/scripts/pieces-ui.ts` | the screens: the card on Projects, the steps, the finished page, the list on Your page |
| `src/styles/piece.css`, `piece-<name>.css` | the pages (shared by the app and the share page) |
| `src/scripts/i18n-piece-<name>.ts` | German, French, Dutch and Swedish for one piece; `i18n-pieces.ts` merges them |
| `scripts/check-pieces.mjs`, `check-piece-<name>.mjs` | tests: generic over every piece, and one piece's own |

## The steps

`pick` (n different ids of some options, shown as rows, chips, colour swatches or shapes), `text` (one short line), `beat` (three rows of eight drum steps, 24 characters of 0 and 1, at least four hits) and `run` (the AI answers a prompt the piece makes from the answers so far; the answer may be skipped).

A saved run is `{ f, i, at, ed?, ai?, s[], done?, q? }` in `S.builds`: `i` starts at 100 so its sync key never meets an answer's, `s` holds one answer per step done, `done` is when the last step was saved, `q` counts Slash's questions. Runs sync like answers (newest wins, a delete sticks, Undo works) and are cleaned like untrusted input on every load (`cleanRun`).

## Adding a piece

1. Copy `piece-brand.ts`; change the data and write `view`, `dom` and `img` (use `Draw` for the picture). Put a number in `n` that no piece uses (append only: a saved run points at its piece by `n`).
2. Register the module in the list in `pieces.ts`, add `src/styles/piece-<name>.css` to the imports in `piece.css`, write `i18n-piece-<name>.ts` and add it to `i18n-pieces.ts`.
3. Write `scripts/check-piece-<name>.mjs` and add it to the `test` script. `npm test` also checks every piece generically: step counts, Italian for every text, German/French/Dutch/Swedish, no banned words, saved-run cleaning, sync and share links.

Rules: five steps, about ten minutes, mostly taps; a typed line is at most 60 characters; the page is readable for every combination of the person's choices (4.5:1 for small text); everything typed goes in with `textContent`; fonts in rem; no money claims (the Selling piece may show a fictional price), no "no experience needed", never the Italian "lavor-".
