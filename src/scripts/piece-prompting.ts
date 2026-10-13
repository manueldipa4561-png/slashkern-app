import { t2 } from './i18n';
import { INK, PAPER, o, pick, run, tag, text, type Kind, type Opt, type Piece, type Run, type T, type Tr } from './piece-types';
import { Draw, el, font, svgEl } from './piece-kit';

// Prompting: a prompt that does one job, for the fictional Dana's pottery class. Five small steps: who the post is for, three facts, a voice, the job in one sentence, and then the person
// sends the prompt they built to the AI and keeps what it wrote. This is the one piece with an AI step, and the page marks exactly that part "AI". prompt() composes the prompt from the
// answers (the step screen shows and sends it, the page shows the same text); the page shows the choices, the prompt as a bubble from "you" and the AI's post in a second, dashed bubble.
const L = {
  tag: t2('Prompt · concept', 'Prompt · concept'),
  job: t2('The job', 'Il compito'),
  who: t2('Who it is for', 'Per chi è'),
  facts: t2('Facts to use', 'Fatti da usare'),
  voice: t2('Voice', 'Tono'),
  prompt: t2('Your prompt', 'Il tuo prompt'), // the same Italian as PL.prompt (pieces.ts)
  made: t2('What the AI made', 'Cosa ha creato l’AI'), // the same as PL.made
  ai: t2('AI', 'AI'),
  none: t2('No AI part: this page is the prompt.', 'Nessuna parte AI: questa pagina è il prompt.'),
  task: t2('Task', 'Compito'),
  context: t2('Context', 'Contesto'),
  length: t2('Length', 'Lunghezza'),
  size: t2('One short post, under 60 words, no hashtags.', 'Un post breve, sotto le 60 parole, senza hashtag.'),
  reply: t2('Reply with the post only.', 'Rispondi solo con il post.'),
};

// The steps, by position. The AI's post is kept up to AI_MAX characters.
const S_WHO = 0, S_FACTS = 1, S_VOICE = 2, S_JOB = 3, S_AI = 4, AI_MAX = 700;

export const piece: Piece = {
  id: 'prompting-prompt', n: 6, f: 'Prompting', client: t2('Dana’s pottery class', 'Il corso di ceramica di Dana'), mins: 10,
  title: t2('A prompt that writes a post', 'Un prompt che scrive un post'),
  blurb: t2('Build a prompt from a few choices, send it to the AI and keep the post it writes, marked as AI.', 'Costruisci un prompt con poche scelte, mandalo all’AI e tieni il post che scrive, segnato come AI.'),
  who: tag('Dana’s pottery class (fictional)', 'il corso di ceramica di Dana (fittizio)'),
  brief: t2('Dana teaches pottery. Her one-line prompt (what you type to an AI) got a boring post. You build a better one in five small steps, send it to the AI and keep the post it writes.',
    'Dana insegna ceramica. Il suo prompt di una riga (quello che scrivi a un’AI) ha prodotto un post noioso. Ne costruisci uno migliore in cinque piccoli passi, lo mandi all’AI e tieni il post che scrive.'),
  steps: [
    pick(t2('Who is Dana’s post for?', 'Per chi è il post di Dana?'), t2('Pick one. A post for everyone speaks to nobody.', 'Scegline uno. Un post per tutti non parla a nessuno.'), 1, [
      o('beginners', 'Complete beginners', 'Principianti assoluti'),
      o('friends', 'Friends who want a Saturday plan', 'Amici con un sabato da riempire'),
      o('gifts', 'People who like making gifts', 'Chi ama fare regali fatti a mano'),
      o('couples', 'Couples looking for a date idea', 'Coppie in cerca di un’idea per uscire'),
    ]),
    pick(t2('Pick three facts the AI should use.', 'Scegli tre fatti che l’AI deve usare.'), t2('The AI knows nothing about the class. It only knows what you tell it.', 'L’AI non sa niente del corso. Sa solo quello che le dici.'), 3, [
      o('saturday', 'Saturdays at 10:00', 'Ogni sabato alle 10:00'), o('seats', 'Only 6 seats', 'Solo 6 posti'), o('clay', 'Clay is included', 'L’argilla è inclusa'),
      o('bowl', 'You take your bowl home', 'La ciotola la porti a casa'), o('laugh', 'Dana laughs at every wobbly bowl', 'Dana ride di ogni ciotola storta'), o('welcome', 'Beginners are welcome', 'I principianti sono benvenuti'),
    ]),
    pick(t2('How should the post sound?', 'Che tono deve avere il post?'), t2('Pick one voice. The AI will copy it.', 'Scegli un tono. L’AI lo copierà.'), 1, [
      o('warm', 'Warm', 'Affettuoso'), o('funny', 'Funny', 'Divertente'), o('calm', 'Calm', 'Calmo'), o('direct', 'Short & direct', 'Breve e diretto'), o('excited', 'Excited', 'Entusiasta'),
    ], 'chip'),
    text(t2('Now tell the AI the job, in one sentence.', 'Ora di’ all’AI cosa fare, in una frase.'), t2('Say what to write and where it goes. Your picks are added for you.', 'Di’ cosa scrivere e dove va. Le tue scelte si aggiungono da sole.'),
      t2('Write an Instagram post that makes a stranger want to come.', 'Scrivi un post Instagram che faccia venire voglia a chi non ci conosce.'), 100, 18, 2),
    run(t2('Send the prompt to the AI and keep the post it writes.', 'Manda il prompt all’AI e tieni il post che scrive.'), t2('Only this part is written by the AI, and your page says so. You can skip it.', 'Solo questa parte la scrive l’AI, e la tua pagina lo dice. Puoi saltarla.'), AI_MAX),
  ],
};

// The labels of the picked ids, in the order picked, in the person's language (an id that is not an option is dropped).
const labelsOf = (step: number, ids: string, tr: Tr): string[] => {
  const st = piece.steps[step];
  return st.kind === 'pick' ? ids.split(',').map((id) => st.opts.find((x) => x.id === id)).filter((x): x is Opt => !!x).map((x) => tr(x.label)) : [];
};
const oneLine = (s: string) => s.replace(/\s+/g, ' ').trim();

// The prompt made from the answers so far: the job, what it is about, who it is for, the facts, the voice, the length and the shape of the answer. The labels go through tr, so the AI answers
// in the person's language. It needs only the first four answers (the AI step comes after it) and leaves out a line whose answer is missing.
export function prompt(r: Run, tr: Tr): string {
  const a = r.s, line = (label: string, value: string) => `${tr(label)}: ${value}`;
  const job = oneLine(a[S_JOB] ?? ''), [who] = labelsOf(S_WHO, a[S_WHO] ?? '', tr), [voice] = labelsOf(S_VOICE, a[S_VOICE] ?? '', tr), facts = labelsOf(S_FACTS, a[S_FACTS] ?? '', tr);
  return [
    job && line(L.task, job), line(L.context, tr(piece.client)), who && line(L.who, who), facts.length > 0 && `${tr(L.facts)}:\n${facts.map((f) => `- ${f}`).join('\n')}`,
    voice && line(L.voice, voice), line(L.length, tr(L.size)), tr(L.reply),
  ].filter((s): s is string => !!s).join('\n');
}

// What the page shows, read from a run (tr turns a label into the person's language). null until every step is answered. ai is '' when the person skipped the AI step.
export type V = { job: string; who: string; voice: string; facts: string[]; prompt: string; ai: string };
export function view(r: Run, tr: Tr): V | null {
  if (r.s.length < piece.steps.length) return null;
  const a = r.s;
  return {
    job: oneLine(a[S_JOB]), who: labelsOf(S_WHO, a[S_WHO], tr)[0] ?? '', voice: labelsOf(S_VOICE, a[S_VOICE], tr)[0] ?? '', facts: labelsOf(S_FACTS, a[S_FACTS], tr),
    prompt: prompt(r, tr), ai: a[S_AI].replace(/\r\n?/g, '\n').trim().replace(/\n{3,}/g, '\n\n'),
  };
}

// The look: a wobbly bowl (half a disc on a foot, on a 100 x 100 grid, tilted 9 degrees like the css does) for Dana's class, and clay. White on the clay and the clay on the paper both pass 4.5:1.
// The page takes its colours from these constants (set on the article, as the brand sheet does), so the page and the picture cannot disagree.
export const CLAY = '#C4401F';
const BOWL = 'M6 40H94a44 44 0 0 1-88 0ZM34 80h32v12H34Z', TILT = (-9 * Math.PI) / 180, WHITE = '#FFFFFF';

// The page itself: styled by piece-prompting.css (on top of .k-pc). The job leads, then the choices, then a small chat: the prompt in clay, the AI's post in a dashed bubble marked AI.
export function dom(v: V, by: string, t: T): HTMLElement {
  const root = el('article', 'k-pc k-pc-prompting-card'), lab = (s: string) => el('p', 'k-pc-l', t.tr(s));
  const sec = (cls: string, ...kids: Node[]) => { const s = el('section', `k-pc-sec ${cls}`.trim()); s.append(...kids); return s; };
  root.setAttribute('aria-label', `${t.tr(piece.client)} · ${t.tr(L.tag)}`);
  root.style.setProperty('--pc-bg', PAPER); root.style.setProperty('--pc-ink', INK); root.style.setProperty('--pc-acc', CLAY); root.style.setProperty('--pc-on-acc', WHITE); // inline, so they beat the defaults of .k-pc
  const bowl = svgEl('svg', { viewBox: '0 0 100 100', class: 'k-pc-prompting-bowl', 'aria-hidden': 'true' }), top = el('div'), head = el('header', 'k-pc-prompting-head');
  bowl.append(svgEl('path', { d: BOWL, fill: 'currentColor' }));
  top.append(el('p', 'k-pc-tag', t.tr(L.tag)));
  head.append(top, bowl);
  const task = el('p', 'k-pc-prompting-task', v.job);
  task.setAttribute('role', 'heading'); task.setAttribute('aria-level', '3');
  const chips = el('ul', 'k-pc-prompting-chips'), facts = el('ul', 'k-pc-prompting-facts');
  for (const [label, value] of [[L.who, v.who], [L.voice, v.voice]]) { const li = el('li'); li.append(lab(label), el('b', '', value)); chips.append(li); }
  for (const f of v.facts) facts.append(el('li', '', f));
  const promptPre = el('pre', 'k-pc-prompting-bubble'), aiRow = el('div', 'k-pc-prompting-ailabel'), foot = el('footer', 'k-pc-foot');
  promptPre.append(...v.prompt.split('\n').map((ln) => el('span', ln.startsWith('- ') ? 'k-pc-prompting-li' : '', ln))); // one block per line, so a bullet that wraps hangs under its text
  aiRow.append(el('span', 'k-pc-prompting-ai', t.tr(L.ai)), lab(L.made));
  foot.append(el('span', '', by), el('span', 'k-pc-brand', 'slashkern'));
  root.append(head, sec('', lab(L.job), task), sec('', chips), sec('', lab(L.facts), facts), sec('k-pc-prompting-you', lab(L.prompt), promptPre),
    v.ai ? sec('k-pc-prompting-msg', aiRow, el('p', 'k-pc-prompting-bubble k-pc-prompting-out', v.ai)) : el('p', 'k-pc-prompting-none', t.tr(L.none)), foot);
  return root;
}

// As a picture: the same blocks stacked on the paper, 1080 wide and as tall as they need (2400 at most). lay() draws it, or only measures it (painting = false) so the canvas can be sized first.
// When the blocks do not fit under the cap, the AI's post is set smaller first (never under 30 px), then the facts list goes, then the two chips (the prompt below lists all of them too), and only
// then is the post cut with "…". Text is at least 26 px for labels and 30 px for the rest.
const MONO = "ui-monospace, 'SF Mono', Menlo, Consolas, monospace", mono = (weight: number, px: number) => `${weight} ${px}px ${MONO}`;
const PIC = { maxH: 2400, foot: 134, gap: 44, pad: 30, side: 32, r: 40, tail: 10, many: 99, label: 26, body: 34, lh: 46, promptPx: 30, promptLh: 42, hero: [72, 64, 56, 48, 44], heroLines: 3 };
type Look = { aiPx: number; aiLh: number; facts: boolean; chips: boolean };
const LOOKS: Look[] = [
  { aiPx: 34, aiLh: 50, facts: true, chips: true }, { aiPx: 32, aiLh: 47, facts: true, chips: true }, { aiPx: 30, aiLh: 44, facts: true, chips: true },
  { aiPx: 30, aiLh: 44, facts: false, chips: true }, { aiPx: 30, aiLh: 44, facts: false, chips: false },
];
type Pen = { d: Draw; P: Draw | null; t: T; v: V; k: Look; limit: number }; // P is d when painting and null when only measuring; limit is the tallest the picture may be
type Block = (c: Pen, y: number) => number; // draws one block from y and returns the y under it
type Ln = { t: string; dx: number }; // a line of text and how far it is indented
const base = (px: number, lh: number) => (lh - px) / 2 + px * 0.78; // the first baseline inside a line box
const textW = (d: Draw, f: string, s: string) => { d.x.font = f; return d.x.measureText(s).width; };

// A label in capitals; returns the y under it.
const cap = (c: Pen, s: string, y: number, x = c.d.M, align: CanvasTextAlign = 'left') => { c.P?.put(c.t.tr(s).toUpperCase(), font(600, PIC.label), INK, x, y + 20, align); return y + PIC.lh; };
const paint = (P: Draw | null, ls: Ln[], f: string, color: string, x: number, y: number, lh: number) => ls.forEach((l, i) => P?.put(l.t, f, color, x + l.dx, y + i * lh));
// Lines of a text that has its own line breaks, each wrapped to the width: a blank line stays a gap, and with hang a bullet ("- ") wraps with a hanging indent.
function flow(d: Draw, s: string, f: string, width: number, hang: boolean): Ln[] {
  const dash = textW(d, f, '- ');
  return s.split('\n').flatMap((ln): Ln[] => {
    if (!ln.trim()) return [{ t: '', dx: 0 }];
    if (!hang || !ln.startsWith('- ')) return d.wrap(ln, f, PIC.many, width).map((t) => ({ t, dx: 0 }));
    const [first, ...rest] = d.wrap(ln.slice(2), f, PIC.many, width - dash);
    return [{ t: `- ${first}`, dx: 0 }, ...rest.map((t) => ({ t, dx: dash }))];
  });
}
// The first max lines; the last one ends in "…" when something was cut.
function clip(d: Draw, lines: Ln[], max: number, f: string, width: number): Ln[] {
  if (lines.length <= max) return lines;
  const last = lines[max - 1];
  let t = last.t;
  while (t && textW(d, f, t + '…') > width - last.dx) t = [...t].slice(0, -1).join('');
  return [...lines.slice(0, max - 1), { ...last, t: t.trimEnd() + '…' }];
}
// A chat bubble: rounded, with a small corner on the side it speaks from; a dashed outline in the colour given marks a bubble that is not yours. Drawn with arcs, so it is round
// where roundRect does not exist (Safari before 16) too.
function bubble(d: Draw, x: number, y: number, w: number, h: number, fill: string, tail: 'l' | 'r', dash?: string) {
  const c = d.x, { r, tail: k } = PIC, [tl, tr, br, bl] = tail === 'r' ? [r, r, k, r] : [r, r, r, k];
  c.beginPath(); c.moveTo(x + tl, y);
  c.arcTo(x + w, y, x + w, y + h, tr); c.arcTo(x + w, y + h, x, y + h, br); c.arcTo(x, y + h, x, y, bl); c.arcTo(x, y, x + w, y, tl);
  c.closePath(); c.fillStyle = fill; c.fill();
  if (dash) { c.save(); c.setLineDash([16, 12]); c.lineWidth = 3; c.strokeStyle = dash; c.stroke(); c.restore(); }
}

// The tag and the bowl (the practice-project line is added under the footer by picOf).
function header(c: Pen): number {
  const { d, P, t } = c, { M, TW } = d;
  P?.put(t.tr(L.tag).toUpperCase(), font(600, 28), INK, M, 92);
  if (P) { P.x.save(); P.x.translate(M + TW - 48, 104); P.x.rotate(TILT); P.path(BOWL, -48, -48, 0.96, CLAY); P.x.restore(); } // the bowl, 96 px, tilted about its middle
  return 160;
}
// The job, as big as three lines allow, with the clay bar under it.
const job: Block = (c, y0) => {
  const { d, P } = c, { M } = d, top = cap(c, L.job, y0), size = PIC.hero.find((s) => d.wrap(c.v.job, font(800, s), PIC.many).length <= PIC.heroLines) ?? PIC.hero[PIC.hero.length - 1];
  const lh = Math.round(size * 1.08), ls = d.wrap(c.v.job, font(800, size), PIC.many), bar = top + ls.length * lh + 20;
  P?.lines(ls, font(800, size), INK, M - 3, top + base(size, lh), lh); P?.fillRect(M, bar, 120, 12, 6, CLAY);
  return bar + 12;
};
// Who it is for and the voice, as chips with a label over each: side by side when both fit, else one under the other.
const chips: Block = (c, y0) => {
  const { d, P, v } = c, { M, TW } = d, f = font(700, PIC.body), pad = 56, gap = 16, hh = 20;
  const items = [[L.who, v.who], [L.voice, v.voice]].map(([k, val]) => { const ls = d.wrap(val, f, 2, TW - pad); return { k, ls, w: Math.ceil(Math.max(0, ...ls.map((l) => textW(d, f, l)))) + pad, h: ls.length * PIC.lh + hh }; });
  const together = items[0].w + gap + items[1].w <= TW;
  const at = items.reduce<{ x: number; y: number; bottom: number }[]>((acc, it, i) => {
    const prev = acc[i - 1], row = !prev || together ? y0 : prev.bottom + 30, x = !prev || !together ? M : prev.x + items[i - 1].w + gap;
    return [...acc, { x, y: row, bottom: row + PIC.lh + it.h }];
  }, []);
  items.forEach((it, i) => {
    const { x, y } = at[i];
    cap(c, it.k, y, x); P?.strokeRect(x, y + PIC.lh, it.w, it.h, Math.min(it.h / 2, 33), INK); P?.lines(it.ls, f, INK, x + pad / 2, y + PIC.lh + hh / 2 + base(PIC.body, PIC.lh), PIC.lh);
  });
  return Math.max(...at.map((a) => a.bottom));
};
// The facts, one per row between hairlines, each with a clay dash like the ones in the prompt.
const facts: Block = (c, y0) => {
  const { d, P } = c, { M, TW } = d, f = font(600, PIC.body);
  return c.v.facts.reduce((y, fact) => {
    const ls = d.wrap(fact, f, 2, TW - 56), top = y + 10 + base(PIC.body, PIC.lh);
    if (P) { P.x.globalAlpha = 0.2; P.fillRect(M, y, TW, 2, 1, INK); P.x.globalAlpha = 1; P.fillRect(M, top - 14, 28, 6, 3, CLAY); P.lines(ls, f, INK, M + 56, top, PIC.lh); }
    return y + ls.length * PIC.lh + 20;
  }, cap(c, L.facts, y0));
};
// The prompt: a bubble from "you", in clay, with the exact text.
const promptBubble: Block = (c, y0) => {
  const { d, P } = c, { M, TW } = d, f = mono(500, PIC.promptPx), w = TW - PIC.side, ls = flow(d, c.v.prompt, f, w - 2 * PIC.pad, true), h = ls.length * PIC.promptLh + 2 * PIC.pad, y = cap(c, L.prompt, y0, M + TW, 'right');
  if (P) { bubble(P, M + PIC.side, y, w, h, CLAY, 'r'); paint(P, ls, f, WHITE, M + PIC.side + PIC.pad, y + PIC.pad + base(PIC.promptPx, PIC.promptLh), PIC.promptLh); }
  return y + h;
};
// What the AI made: an "AI" pill, a label and a dashed bubble, which gets the height that is left under the cap...
function aiPost(c: Pen, y0: number): number {
  const { d, P, t, v, k } = c, { M, TW } = d, w = TW - PIC.side, iw = w - 2 * PIC.pad, f = font(500, k.aiPx), pf = font(800, PIC.label), pw = Math.ceil(textW(d, pf, t.tr(L.ai))) + 36, y = y0 + 44 + 18;
  P?.fillRect(M, y0, pw, 44, 22, INK); P?.put(t.tr(L.ai), pf, PAPER, M + pw / 2, y0 + 31, 'center'); cap(c, L.made, y0 + 11, M + pw + 18);
  const room = Math.floor((c.limit - (y + 2 * PIC.pad + PIC.gap + PIC.foot)) / k.aiLh), ls = clip(d, flow(d, v.ai, f, iw, false), Math.max(3, room), f, iw), h = ls.length * k.aiLh + 2 * PIC.pad;
  if (P) { bubble(P, M, y, w, h, WHITE, 'l', INK); paint(P, ls, f, INK, M + PIC.pad, y + PIC.pad + base(k.aiPx, k.aiLh), k.aiLh); }
  return y + h;
}
// ...or, when the person skipped the AI step, a dashed note where the post would be.
function aiNote(c: Pen, y: number): number {
  const { d, P, t } = c, w = d.TW - PIC.side, f = font(500, PIC.body), ls = flow(d, t.tr(L.none), f, w - 2 * PIC.pad, false), h = ls.length * PIC.lh + 2 * PIC.pad;
  if (P) { bubble(P, d.M, y, w, h, WHITE, 'l', INK); paint(P, ls, f, INK, d.M + PIC.pad, y + PIC.pad + base(PIC.body, PIC.lh), PIC.lh); }
  return y + h;
}

const lay = (d: Draw, v: V, t: T, k: Look, limit: number, painting: boolean): number => {
  const c: Pen = { d, P: painting ? d : null, t, v, k, limit }, blocks: Block[] = [job, ...(k.chips ? [chips] : []), ...(k.facts ? [facts] : []), promptBubble, v.ai ? aiPost : aiNote];
  return blocks.reduce((y, block) => block(c, y + PIC.gap), header(c)) + PIC.gap + PIC.foot;
};

export async function img(v: V, by: string, t: T): Promise<Blob | null> {
  const d = await Draw.make(); if (!d) return null;
  const k = LOOKS.find((l) => lay(d, v, t, l, Infinity, false) <= PIC.maxH) ?? LOOKS[LOOKS.length - 1];
  d.size(lay(d, v, t, k, PIC.maxH, false)); d.fillAll(PAPER);
  lay(d, v, t, k, PIC.maxH, true);
  d.footer(by, INK, PAPER);
  return d.blob();
}

export const kind: Kind = { piece, view, dom, img, prompt };
