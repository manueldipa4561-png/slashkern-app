import { PIECE_AT, PL, brandView, latestRun, lookOf, pieceFor, pieceLink, pieceOf, stepOk, wordsIn, INK, PAPER, type Piece, type Run, type Step } from './pieces';
import { brandImage, logoSvg, renderBrand, type T } from './piece-view';
import { akey, stamp, ver, type Tomb } from './sync';

// The screens of a piece (data in pieces.ts, drawing in piece-view.ts): a card on Projects, five small steps full screen, the finished page, and the list on Your page.
// A run is only saved once its first step is answered, so opening a piece and going back leaves nothing behind. app.ts hands in what this needs (Ctx) and calls render() when the
// field, the language or the saved runs change. Text built here is set with put(): a language switch calls render() again, it never re-reads it.
export type Ctx = {
  S: { builds: Run[]; gone: Tomb[]; name: string; field: string };
  tr: (s: string) => string; fill: (en: string, v: Record<string, string | number>) => string;
  save: () => boolean; say: (en: string, undo?: () => void) => void;
  land: (e: HTMLElement) => void; once: (fn: () => void) => () => void; when: (t: number, time?: boolean) => string;
  setName: (v: string) => void; share: (title: string, text: string, url: string) => void; // the name on the page (the person's own name in the app), and the share sheet or the clipboard
  ask: (box: HTMLElement, mission: { title: string; brief: string }, field: string, draft: string, here: () => boolean) => Promise<boolean>; // Slash asks one question in box; true if one was shown
};
type Pick = Extract<Step, { kind: 'pick' }>;
const el = <K extends keyof HTMLElementTagNameMap>(tag: K, cls = '', text = ''): HTMLElementTagNameMap[K] => Object.assign(document.createElement(tag), { className: cls, textContent: text });

export function initPieces(ctx: Ctx) {
  const { S, tr, fill } = ctx, t: T = { tr, fill };
  const $ = <E extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as E;
  const put = (e: HTMLElement, text: string) => { e.dataset.en = ''; e.textContent = text; };
  const build = $('kBuild'), stepEl = $('kBS'), resEl = $('kBR'), num = $('kBNum'), prog = $('kBProg'), opts = $('kBO'), ta = $<HTMLTextAreaElement>('kBTa'), taLabel = ta.previousElementSibling as HTMLElement;
  const nameIn = $<HTMLInputElement>('kBName'), note = $('kBN'), next = $<HTMLButtonElement>('kBNext'), askBtn = $('kBAsk'), coach = $('kBC'), how = $<HTMLDetailsElement>('kBHow');
  let cur: { p: Piece; run: Run; step: number } | null = null, picks: string[] = [], opener: HTMLElement | null = null;

  const byline = (r: Run) => fill(S.name.trim() ? PL.by : PL.on, { n: S.name.trim(), d: ctx.when(r.done ?? r.at) });
  const monoOf = (p: Piece) => p.client.split(/\s+/).map((w) => w[0] ?? '').join('').toUpperCase().slice(0, 2);
  // The colours picked so far, as the sheet will use them: the shape previews take their fill from the main one.
  const lookNow = (p: Piece, r: Run) => {
    const k = p.steps.findIndex((s) => s.kind === 'pick' && s.look === 'swatch'), st = p.steps[k];
    const hex = st?.kind === 'pick' && r.s[k] ? r.s[k].split(',').map((id) => st.opts.find((o) => o.id === id)?.hex).filter((h): h is string => !!h) : [];
    return st?.kind === 'pick' && hex.length === st.n ? lookOf(hex) : null;
  };

  // ── a step ──
  const mark = () => {
    const st = cur!.p.steps[cur!.step] as Pick;
    opts.querySelectorAll<HTMLElement>('.k-opt').forEach((b) => {
      const k = picks.indexOf(b.dataset.id!), n = b.querySelector('.k-opt-n');
      b.setAttribute('aria-pressed', String(k >= 0)); if (n) n.textContent = k >= 0 && st.n > 1 ? String(k + 1) : '';
    });
  };
  const check = () => {
    const { p, step } = cur!, st = p.steps[step];
    let ok: boolean;
    if (st.kind === 'pick') { ok = stepOk(st, picks.join(',')); put(note, fill(PL.picked, { k: picks.length, n: st.n })); }
    else { const w = wordsIn(ta.value); ok = stepOk(st, ta.value); put(note, w > st.words ? fill(PL.fewer, { n: st.words }) : fill(PL.words, { w, max: st.words })); }
    next.disabled = !ok;
  };
  const renderOpts = () => {
    const { p, run, step } = cur!, st = p.steps[step] as Pick, look = lookNow(p, run), mono = monoOf(p);
    opts.hidden = false; opts.className = 'k-bo' + (st.look ? ' ' + st.look : '');
    opts.replaceChildren(...st.opts.map((o) => {
      const b = el('button', 'k-opt'), label = el('span', '', tr(o.label));
      b.type = 'button'; b.dataset.id = o.id; b.setAttribute('aria-pressed', 'false');
      if (st.look === 'swatch') {
        const sw = el('i', 'k-opt-sw'), n = el('em', 'k-opt-n');
        sw.style.background = o.hex!; sw.setAttribute('aria-hidden', 'true'); n.setAttribute('aria-hidden', 'true');
        b.append(sw, label, n); b.setAttribute('aria-label', `${tr(o.label)}, ${o.hex}`);
      } else if (st.look === 'shape') b.append(logoSvg(o.d!, look?.logo ?? INK, look?.onLogo ?? PAPER, mono, ''), label);
      else b.append(label);
      b.addEventListener('click', () => {
        const k = picks.indexOf(o.id);
        if (k >= 0) picks.splice(k, 1); else if (picks.length < st.n) picks.push(o.id); else picks[st.n - 1] = o.id; // a full pick swaps the latest one
        mark(); check();
      });
      return b;
    }));
    mark();
  };
  const showStep = () => {
    const { p, run, step } = cur!, st = p.steps[step], all = p.steps.length;
    stepEl.hidden = false; resEl.hidden = true;
    put(num, fill(PL.step, { n: step + 1, all }));
    prog.replaceChildren(...p.steps.map((_, k) => { const i = el('i'), b = el('b'); b.style.setProperty('--p', k < step ? '1' : k === step ? '.4' : '0'); i.append(b); return i; }));
    prog.setAttribute('aria-valuemax', String(all)); prog.setAttribute('aria-valuenow', String(step + 1)); prog.setAttribute('aria-valuetext', num.textContent ?? '');
    put($('kBT'), tr(p.title)); put($('kBQ'), tr(st.q)); put($('kBH'), tr(st.hint)); put($('kBB'), `${tr(p.who)}. ${tr(p.brief)}`);
    $<HTMLDetailsElement>('kBD').open = false;
    put(next, tr(step === all - 1 ? PL.last : 'Next'));
    coach.hidden = true; coach.replaceChildren(); askBtn.setAttribute('aria-expanded', 'false'); askBtn.removeAttribute('aria-disabled');
    if (st.kind === 'pick') { picks = (run.s[step] ?? '').split(',').filter(Boolean); ta.hidden = taLabel.hidden = true; renderOpts(); }
    else { opts.replaceChildren(); opts.hidden = true; ta.hidden = taLabel.hidden = false; ta.maxLength = st.max; ta.value = run.s[step] ?? ''; ta.placeholder = tr(st.ph); }
    check(); build.scrollTo({ top: 0 }); ctx.land($('kBQ'));
  };

  // ── the finished page ──
  const view = () => (cur ? brandView(cur.p, cur.run, tr) : null);
  const showResult = () => {
    const v = view(); if (!v || !cur) return;
    const { run } = cur;
    stepEl.hidden = true; resEl.hidden = false; put(num, '');
    $('kBPiece').replaceChildren(renderBrand(v, byline(run), t));
    put($('kBRH'), tr(PL.ready)); put($('kBNameL'), tr(PL.nameL)); nameIn.value = S.name; put($('kBLink'), tr(PL.link)); put($('kBLinkN'), tr(PL.linkNote)); put($('kBSave'), tr(PL.save)); put($('kBDone'), tr(PL.done)); put(how.querySelector<HTMLElement>('summary')!, tr(PL.how)); how.open = false;
    const proof = run.ai ? el('span', 'k-ai-chip', tr(PL.ai)) : el('p', '', run.q ? fill(PL.asked, { n: run.q }) : tr(PL.noAi)), del = el('button', 'k-sk', tr(PL.del));
    del.type = 'button'; del.addEventListener('click', () => remove(run));
    $('kBHowB').replaceChildren(el('p', 'k-l k-s', fill(PL.span, { a: ctx.when(run.at, true), b: ctx.when(run.done ?? run.at, true) })), el('p', '', tr(PL.yours)), proof, del);
    build.scrollTo({ top: 0 }); ctx.land($('kBRH'));
  };
  const saveImage = async () => {
    const v = view(); if (!v || !cur) return;
    const blob = await brandImage(v, byline(cur.run), t); if (!blob) return;
    const file = new File([blob], `slashkern-${cur.p.id}.png`, { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file], title: 'slashkern' }); return; } catch (e) { if ((e as DOMException).name === 'AbortError') return; } }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file.name; a.click();
    window.setTimeout(() => URL.revokeObjectURL(a.href), 1000); ctx.say(PL.saved);
  };
  // Delete leaves a tombstone like an answer (sync.ts), and Undo puts the run back newer than it, so the restore wins on every device.
  const remove = (run: Run) => {
    const i = S.builds.indexOf(run); if (i < 0) return;
    S.builds.splice(i, 1); S.gone = [...S.gone, [akey(run), stamp(ver(run))] as Tomb].slice(-200); ctx.save(); closeBuild();
    ctx.say(PL.gone, () => {
      const at = S.gone.find(([k]) => k === akey(run))?.[1] || 0;
      S.gone = S.gone.filter(([k]) => k !== akey(run)); run.ed = stamp(Math.max(at, ver(run))); S.builds.push(run); ctx.save(); render();
    });
  };

  // ── opening and closing ──
  const openRun = (p: Piece, run?: Run) => {
    opener = document.activeElement as HTMLElement | null;
    const r = run ?? { f: p.f, i: PIECE_AT + p.n, at: Date.now(), s: [] as string[] };
    cur = { p, run: r, step: Math.min(r.s.length, p.steps.length - 1) };
    build.classList.add('on');
    if (r.done) showResult(); else showStep();
  };
  function closeBuild() {
    build.classList.remove('on'); cur = null; render();
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  }

  next.addEventListener('click', ctx.once(() => {
    if (!cur) return;
    const { p, run, step } = cur, st = p.steps[step], val = st.kind === 'text' ? ta.value.trim() : picks.join(',');
    if (!stepOk(st, val)) { if (st.kind === 'text') { ctx.say('Write something first.'); ta.focus(); } return; }
    run.s[step] = val; run.ed = stamp(ver(run));
    if (step === p.steps.length - 1) run.done = run.done ?? Date.now();
    if (!S.builds.includes(run)) S.builds.push(run);
    ctx.save();
    if (run.done) showResult(); else { cur.step = step + 1; showStep(); }
  }));
  ta.addEventListener('input', check);
  $('kBBack').addEventListener('click', () => {
    if (!cur) return;
    if (!resEl.hidden || cur.step === 0) { closeBuild(); return; }
    cur.step--; showStep();
  });
  $('kBDone').addEventListener('click', closeBuild);
  $('kBSave').addEventListener('click', ctx.once(() => { void saveImage(); }));
  $('kBLink').addEventListener('click', ctx.once(() => { if (cur?.run.done) ctx.share('slashkern', fill(PL.linkText, { t: tr(cur.p.title) }), pieceLink(location.origin, cur.run, S.name)); }));
  nameIn.addEventListener('input', () => { ctx.setName(nameIn.value); const v = view(); if (v && cur) $('kBPiece').replaceChildren(renderBrand(v, byline(cur.run), t)); }); // the name shows on the sheet as it is typed
  build.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); closeBuild(); } });
  askBtn.addEventListener('click', async () => {
    if (!cur || askBtn.getAttribute('aria-disabled') === 'true') return;
    const { p, run, step } = cur, st = p.steps[step];
    const draft = st.kind === 'text' ? ta.value.trim() : picks.map((id) => (st as Pick).opts.find((o) => o.id === id)?.label ?? '').filter(Boolean).join(', ');
    askBtn.setAttribute('aria-disabled', 'true'); askBtn.setAttribute('aria-expanded', 'true');
    const asked = await ctx.ask(coach, { title: p.title, brief: st.q }, p.f, draft, () => cur?.p === p && cur.step === step && build.classList.contains('on'));
    if (asked && cur?.run === run) { run.q = Math.min(99, (run.q ?? 0) + 1); if (S.builds.includes(run)) ctx.save(); }
    askBtn.removeAttribute('aria-disabled');
  });

  // ── the card on Projects, and the list on Your page ──
  const card = $('kPiece'), go = $('kPcGo'), more = $('kPcMore'), list = $('kPieces'), listEl = $('kPieceL');
  const render = () => {
    const p = pieceFor(S.field), run = p && latestRun(S.builds, p);
    card.hidden = !p;
    if (p) {
      const done = !!run?.done;
      put($('kPcL'), tr(PL.card)); put($('kPcT'), tr(p.title)); put($('kPcP'), tr(p.blurb));
      put($('kPcM'), done ? fill(PL.madeOn, { d: ctx.when(run!.done!) }) : run ? fill(PL.progress, { k: run.s.length, n: p.steps.length }) : fill(PL.meta, { n: p.steps.length, m: p.mins }));
      put(go, tr(done ? PL.see : run ? 'Continue' : PL.start)); more.hidden = !done; put(more, tr(PL.again));
    }
    const runs = [...S.builds].sort((a, b) => (b.done ?? b.at) - (a.done ?? a.at));
    list.hidden = !runs.length;
    if (!runs.length) return;
    put($('kPieceH'), tr(PL.list));
    const rows = el('div', 'k-mlist');
    for (const r of runs) {
      const q = pieceOf(r); if (!q) continue;
      const b = el('button', 'k-mrow' + (r.done ? ' done' : '')), dot = el('i', 'k-mdot'), span = el('span'), chev = el('em', '', '›');
      b.type = 'button'; dot.setAttribute('aria-hidden', 'true'); chev.setAttribute('aria-hidden', 'true');
      span.append(el('b', '', tr(q.title)), el('small', '', r.done ? fill(PL.madeOn, { d: ctx.when(r.done) }) : fill(PL.going, { k: r.s.length, n: q.steps.length })));
      b.append(dot, span, chev); b.addEventListener('click', () => openRun(q, r)); rows.append(b);
    }
    listEl.replaceChildren(rows);
  };
  go.addEventListener('click', () => { const p = pieceFor(S.field); if (p) openRun(p, latestRun(S.builds, p)); });
  more.addEventListener('click', () => { const p = pieceFor(S.field); if (p) openRun(p); });
  return { render };
}
