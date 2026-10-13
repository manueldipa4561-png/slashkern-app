// slashkern app logic. State lives in this browser (localStorage key kern:v1); with an account it also syncs (cloud.ts).
//
//  profile ──> field ──> mission ──> answer ──> reflection ──> signals ──> Slash card ──> share
//                           ^            │ (draft autosaved)      │
//                           └────────────┴── slashkern / Trail ◄───┘
import { EN, IT, t2 } from './i18n';
import { DE } from './i18n-de';
import { FR } from './i18n-fr';
import { NL } from './i18n-nl';
import { SV } from './i18n-sv';
import { icon } from './icons';
import { FIELDS } from './fields';
import { FIELD_INFO } from './fieldinfo';
import { COOP_KEYS, MAX_ANSWER, MAX_NAME, MAX_REPLY, clip, coopUrl, decodeCoop, settleReply, type Coop, type CoopRec } from './coop';
import { ASK } from './coopask';
import { SCORE, rowsOf, verdict, type Feel } from './compare';
import { MX, type Asset } from './missions';
import { PLAY, renderPlay, stopPlay } from './play';
import { RELICS, rollDrop, type Drop } from './loot';
import { nextSpot, roundOf, PER_ROUND } from './next';
import { SPONSORS } from './sponsors';
import { FIRST_BRIEFS, FOUND_AT } from './projects';
import { TREND_FROM, TREND_SHELF, TRENDING } from './trending';
import { HELPS } from './helps';
import { EASY } from './easy';
import { SAMPLE_ANSWERS, SAMPLE_IDEA, sampleAnswers, sampleChat, sampleMine, swapSample, type Pair } from './demo';
import * as cloud from './cloud';
import * as stats from './stats';
import { akey, ver, stamp, mergeAnswers, type Tomb } from './sync';
import { inTime, clampCount, cleanAi, cleanName } from './valid';
import { canMake, countMake, makeBody, makesLeft, parseMake, type MakeBody, type MakeResult, type Pair as QaPair } from './make';
import { attachMic, listenButton, refreshVoice, stopSpeaking, voice } from './voice';
import { slash, type Mood, SLASH_BODY, SLASH_EYES, SLASH_VIEWBOX } from './slash';
import { PIECES, PIECE_AT, cleanRuns, type Piece, type Run } from './pieces';
import { initPieces, type RunReply } from './pieces-ui';

type Again = 'yes' | 'maybe' | 'no';
type Refl = { e?: Feel; again?: Again; hard?: string; tip?: string; sid?: number }; // sid: the tip's shared sign, if published
type Answer = { f: string; i: number; t: string; at: number; ed?: number; r?: Refl; x?: number; d?: string; ai?: boolean }; // x: extra stones (bonuses, drop), d: drop id (loot.ts)
type Msg = { who: 'ai' | 'me'; t: string; typing?: boolean; p?: string }; // p: the person's own words quoted in front of a scripted question, kept apart so a language switch still translates the question
type Theme = 'light'; // light only since the palette B restyle: the dark theme is retired (a saved "dark" or "system" becomes light)
type Lang = 'en' | 'it' | 'de' | 'fr' | 'nl' | 'sv';
type Habit = { t: string; c: string; l: [number, string][] }; // t: the tiny habit, c: the cue (after I...), l: [day number, relic id found that day or ''] per day done
type State = { v: 1; name: string; adult: boolean; field: string; fields: string[]; onboarded: boolean; stones: number; answers: Answer[]; drafts: Record<string, string>; msgs: Msg[]; mine: string[]; lang: Lang; theme: Theme; text: number; guess: string; saves: number; badges: string[]; dared: boolean; gone: Tomb[]; habit: Habit; easy: boolean; coops: CoopRec[]; builds: Run[] }; // text: the text size step in Settings (0 small, 1 default, 2 large, 3 larger); builds: the pieces in progress or made (pieces.ts)

// Demo profile (open /?demo, switch off with /?demo=off): a lived-in trail to show slashkern in a minute. It has its own storage key,
// never syncs, never publishes a sign and is never counted, so it cannot touch real data.
// Rewrites the address without one query parameter. An odd path such as // must never throw (it would stop the app half-way).
function dropParam(q: URLSearchParams, name: string) {
  q.delete(name);
  const rest = q.toString();
  try { history.replaceState(null, '', location.pathname.replace(/^\/{2,}/, '/') + (rest ? '?' + rest : '') + location.hash); } catch { /* leave the address as it is */ }
}
try {
  const q = new URLSearchParams(location.search), d = q.get('demo');
  if (d !== null) {
    const v = d.trim().toLowerCase();
    if (['off', '0', 'false', 'no'].includes(v)) { localStorage.removeItem('kern:mode'); localStorage.removeItem('kern:demo'); } // leaving throws the sample away, whatever a visitor typed in it; anything else unknown leaves the mode as it is
    else if (['', '1', 'true', 'on', 'yes', 'demo'].includes(v)) localStorage.setItem('kern:mode', 'demo');
    dropParam(q, 'demo'); // keeps other parameters, such as a dare link
  }
} catch { /* storage blocked: no demo */ }
const DEMO = (() => { try { return localStorage.getItem('kern:mode') === 'demo'; } catch { return false; } })();
const CLOUD = cloud.enabled && !DEMO;
const KEY = DEMO ? 'kern:demo' : 'kern:v1';
const PEND = 'kern:rm-signs'; // ids of signs still to be removed from the trail
const YK_SEEN = 'kern:seen-yourkern'; // slashkern was opened once on this device: its one-line explanation is not needed any more
const RUNS = 'kern:runs'; // today's tries of "Try your prompt on the AI", per mission
const MAKES = 'kern:makes'; // today's "first version with AI" per project (make.ts)
const MIC_OK = 'kern:mic-ok'; // the voice privacy sheet was read and accepted on this device
const AI_TAG = 'Made with AI help'; // shown on every project whose text came from the AI first version; never hidden
// Delete my data, Log out and Delete my account also clear what sits beside the trail: the demo and the copy set aside when a trail could not be read.
// Once the account is gone so is the list of signs still to be removed (a plain Log out or Delete keeps it: those signs must still go at the next sign-in). The demo never touches any of it.
const wipeExtras = (accountGone = false) => { if (DEMO) return; try { for (const k of ['kern:demo', 'kern:mode', 'kern:v1:unreadable', YK_SEEN, RUNS, MAKES, MIC_OK, ...(accountGone ? [PEND] : [])]) localStorage.removeItem(k); } catch { /* nothing stored */ } };
const eraseStats = () => (DEMO ? Promise.resolve() : stats.erase()); // the demo must never touch the real usage-count record
const OPEN = "What is your idea? Write it in your own words first. I won't suggest one."; // the assistant's first line (the demo chat starts with it too)
// Slash's introduction, the first line of the Assistant tab's chat. It is drawn there, never stored in the chat, so it is the same in every language and for every saved chat. Slash is always called an AI.
const SLASH_INTRO = t2('Hi, I am Slash, your AI assistant. I ask the questions. I only draft if you ask.', 'Ciao, sono Slash, il tuo assistente AI. Faccio le domande. Preparo una bozza solo se me lo chiedi.');
const DROP_IDS = ['spark', 'gem', 'jackpot', ...RELICS.map((r) => r.id)];
const FEELS = Object.keys(SCORE) as Feel[]; // every "how did it feel" value compare.ts can score, so stored and synced reflections keep all of them
const AGAINS: Again[] = ['yes', 'maybe', 'no'];
const LANGS: Lang[] = ['en', 'it', 'de', 'fr', 'nl', 'sv'];
const isLang = (v: unknown): v is Lang => LANGS.includes(v as Lang);
// First run: the first language the browser asks for that slashkern speaks (de-AT, fr-CH... count), else English.
const firstLang = (): Lang => (navigator.languages?.length ? navigator.languages : [navigator.language]).map((l) => l.slice(0, 2).toLowerCase()).find(isLang) ?? 'en';
const fresh = (): State => ({ v: 1, name: '', adult: false, field: 'Video', fields: [], onboarded: false, stones: 0, answers: [], drafts: {}, msgs: [], mine: [], lang: firstLang(), theme: 'light', text: 1, guess: '', saves: 0, badges: [], dared: false, gone: [], habit: { t: '', c: '', l: [] }, easy: false, coops: [], builds: [] });
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '');
const cleanR = (r: unknown): Refl | undefined => {
  if (!r || typeof r !== 'object') return undefined;
  const o = r as Record<string, unknown>, out: Refl = {};
  if (FEELS.includes(o.e as Feel)) out.e = o.e as Feel;
  if (AGAINS.includes(o.again as Again)) out.again = o.again as Again;
  if (str(o.hard, 140).trim()) out.hard = str(o.hard, 140).trim();
  if (str(o.tip, 140).trim()) out.tip = str(o.tip, 140).trim();
  if (out.tip && Number.isSafeInteger(o.sid) && (o.sid as number) > 0) out.sid = o.sid as number;
  return Object.keys(out).length ? out : undefined;
};
const cleanHabit = (h: unknown): Habit => {
  const o = (h && typeof h === 'object' ? h : {}) as Record<string, unknown>;
  const l: [number, string][] = Array.isArray(o.l) ? o.l.filter((e): e is [number, string] => Array.isArray(e) && Number.isInteger(e[0]) && e[0] > 0 && typeof e[1] === 'string' && (e[1] === '' || DROP_IDS.includes(e[1]))).map((e): [number, string] => [e[0], e[1]]).slice(-90) : [];
  return { t: str(o.t, 60).trim(), c: str(o.c, 60).trim(), l };
};
const cleanCoops = (v: unknown): CoopRec[] => (Array.isArray(v)
  ? v.filter((c) => c && (c.role === 'out' || c.role === 'in') && typeof c.f === 'string' && Number.isInteger(c.i) && COOP_KEYS.includes(`${c.f}.${c.i}`) && inTime(c.at) && typeof c.mine === 'string' && c.mine.trim())
    .map((c): CoopRec => ({ role: c.role, f: c.f, i: c.i, at: c.at, with: str(c.with, MAX_NAME), mine: str(c.mine, MAX_ANSWER), theirs: str(c.theirs, MAX_ANSWER) })).slice(-30)
  : []);
// Stored or synced data is untrusted input: keep only well-formed values.
const sanitize = (s: any): State | null => { // eslint-disable-line @typescript-eslint/no-explicit-any
  const d = fresh();
  try {
    if (!s || typeof s !== 'object' || s.v !== 1) return null;
    const drafts: Record<string, string> = {};
    if (s.drafts && typeof s.drafts === 'object') for (const [k, v] of Object.entries(s.drafts)) { const [f, i, ...rest] = k.split('.'); if (!rest.length && FIELDS[f] && /^\d$/.test(i ?? '') && Number(i) < FIELDS[f].m.length && typeof v === 'string' && v) drafts[k] = v.slice(0, 2000); }
    const field: string = FIELDS[s.field] ? s.field : 'Video';
    const answers: Answer[] = Array.isArray(s.answers)
      ? s.answers.filter((a: Answer) => a && FIELDS[a.f] && Number.isInteger(a.i) && a.i >= 0 && a.i < FIELDS[a.f].m.length && typeof a.t === 'string' && inTime(a.at))
        .map((a: Answer) => ({ f: a.f, i: a.i, t: a.t.slice(0, 2000), at: a.at, ed: inTime(a.ed) ? a.ed : undefined, r: cleanR(a.r), x: Number.isInteger(a.x) && a.x! > 0 ? Math.min(a.x!, 600) : undefined, d: typeof a.d === 'string' && DROP_IDS.includes(a.d) ? a.d : undefined, ai: cleanAi(a.ai) }))
      : [];
    // Interests: the fields someone chose to explore, in their order. Older saves have none: use the answered ones.
    const fields = [...new Set([...(Array.isArray(s.fields) ? s.fields : answers.map((a) => a.f)), ...(s.onboarded ? [field] : [])])]
      .filter((f): f is string => typeof f === 'string' && !!FIELDS[f]);
    return {
      ...d,
      name: cleanName(s.name),
      adult: !!s.adult || !!cleanName(s.name), // older saves confirmed 18+ on the name screen
      field,
      fields,
      onboarded: !!s.onboarded,
      stones: clampCount(s.stones),
      answers,
      drafts,
      msgs: Array.isArray(s.msgs) ? s.msgs.filter((m: Msg) => m && (m.who === 'ai' || m.who === 'me') && typeof m.t === 'string').map((m: Msg): Msg => ({ who: m.who, t: m.t.slice(0, 500), ...(m.who === 'ai' && typeof m.p === 'string' && m.p ? { p: m.p.slice(0, 200) } : {}) })) : [],
      mine: Array.isArray(s.mine) ? s.mine.filter((m: unknown) => typeof m === 'string').map((m: string) => m.slice(0, 140)) : [],
      lang: isLang(s.lang) ? s.lang : d.lang,
      theme: 'light', // light only: whatever an older save holds ("dark", "system") becomes light
      text: s.text === 0 || s.text === 2 || s.text === 3 ? s.text : 1,
      guess: str(s.guess, 200),
      saves: clampCount(s.saves),
      badges: Array.isArray(s.badges) ? s.badges.filter((b: unknown) => typeof b === 'string' && b.length < 20).slice(0, 50) : [],
      dared: !!s.dared,
      habit: cleanHabit(s.habit),
      easy: !!s.easy,
      coops: cleanCoops(s.coops),
      builds: cleanRuns(s.builds),
      gone: Array.isArray(s.gone) ? s.gone.filter((g: unknown) => Array.isArray(g) && typeof g[0] === 'string' && g[0].length < 40 && inTime(g[1])).map((g: Tomb): Tomb => [g[0], g[1]]).slice(-200) : [],
    };
  } catch { return null; }
};
// Sample trail for the demo (texts in demo.ts): 6 answers in 3 fields, all reflected, about 530 stones (rank Cairn), a few finds, three versions of an idea with Slash. Badges are earned from the answers themselves.
// A finished sample piece for the demo: the first options of every pick, the example line of every text step (in the demo's language), a beat, and for the AI step a short sample marked AI.
const samplePiece = (p: Piece, at: number, it: boolean): Run => ({
  f: p.f, i: PIECE_AT + p.n, at, done: at + 9 * 6e4, ...(p.steps.some((st) => st.kind === 'run') ? { ai: true as const } : {}),
  s: p.steps.map((st) => (st.kind === 'pick' ? st.opts.slice(0, st.n).map((x) => x.id).join(',') : st.kind === 'text' ? (it ? IT[st.ph] : st.ph) ?? st.ph : st.kind === 'beat' ? '100010011010001010101010'
    : it ? 'Ogni sabato alle 10:00, sei posti, argilla inclusa. Vieni a fare una ciotola storta con noi. Mattine lente, mani calde.' : 'Saturdays at 10:00, six seats, clay included. Come make a wobbly bowl with us. Slow mornings, warm hands.')),
});
const demoState = (): State => {
  let real: { lang?: string; text?: number } = {};
  try { real = JSON.parse(localStorage.getItem('kern:v1') || '{}') || {}; } catch { /* no real profile to read */ }
  const lang: Lang = isLang(real.lang) ? real.lang : fresh().lang, text = real.text;
  const it = lang === 'it', answers = sampleAnswers(it, Date.now());
  const made = Date.now() - 2 * 864e5, builds = [{ f: 'Design', i: PIECE_AT, at: made, done: made + 9 * 6e4, s: ['plant', 'friendly,cosy,local', 'tomato,cream,espresso', 'leaf', it ? 'Caffè, piante, Rosa.' : 'Coffee, plants, Rosa.'] }, ...PIECES.filter((p) => p.f !== 'Design').map((p, k) => samplePiece(p, made - (k + 1) * 36e5, it))]; // a finished piece in every field on Your page: the brand sheet by hand, the others from their first options and example lines
  return sanitize({ v: 1, name: 'Giulia', field: 'Design', fields: ['Design', 'Writing', 'Video'], onboarded: true, stones: answers.reduce((s, a) => s + 50 + (a.r ? 20 : 0) + (a.x || 0), 0), answers, msgs: [{ who: 'ai', t: OPEN }, ...sampleChat(it)], mine: sampleMine(it), builds, dared: true, lang, theme: 'light', text, guess: 'Saved. This sharpens your Slash card.' }) || fresh(); // guess: the reply to "A first guess" (That feels right), not a sentence of its own
};
let recovered = ''; // set when a saved trail could not be read in full at start-up: the notice to show once the app is up
let seen: string | null = null; // the trail as storage held it when this page last read or wrote it (absorb)
const load = (): State => {
  let raw: string | null = null, saved: any = null, ok: State | null = null; // eslint-disable-line @typescript-eslint/no-explicit-any
  try { raw = localStorage.getItem(KEY); } catch { /* storage blocked */ }
  seen = raw;
  try { saved = JSON.parse(raw || 'null'); ok = sanitize(saved); } catch { /* unreadable: kept below */ }
  const lost = ok && Array.isArray(saved?.answers) ? saved.answers.length - ok.answers.length : 0; // answers of a mission this build does not know, or damaged ones
  if (ok && !lost) return ok;
  if (raw && !DEMO) { // the next save would replace it: keep what was there (the demo is only a sample, nothing to keep)
    recovered = ok ? "Some of your saved answers couldn't be read. A copy was kept on this device." : "We couldn't read your saved answers, so you are starting fresh. A copy was kept on this device.";
    try { localStorage.setItem(KEY + ':unreadable', raw.slice(0, 400000)); } catch { /* no room for the copy */ }
  }
  return ok ?? (DEMO ? demoState() : fresh());
};
const S = load();
const snapshot = () => ({ ...S, msgs: S.msgs.filter((m) => !m.typing).slice(-60) });
let saveFailed = false;
const UNSAVED = "Couldn't save on this device. Copy your answer somewhere safe.";
// Returns whether the browser kept the write. A failure is said once from here (drafts save while typing and must not nag);
// every moment that would claim "saved" checks the result and says it again.
function save(): boolean {
  if (absorb()) queueMicrotask(refresh);
  let kept = true;
  try { const json = JSON.stringify(snapshot()); localStorage.setItem(KEY, json); seen = json; saveFailed = false; }
  catch { kept = false; if (!saveFailed) { saveFailed = true; say("Couldn't save on this device. Check your browser storage settings."); } }
  schedulePush();
  return kept;
}
// Another tab may have saved since this page last looked (it was busy with a sheet open, or frozen, or restored from the back/forward cache and
// missed the event): take that copy in before this page writes, so the write cannot replace it. Same merge as a synced copy (newest answer wins, deletes stick).
function absorb(): boolean {
  let now: string | null = null;
  try { now = localStorage.getItem(KEY); } catch { return false; }
  if (!now || now === seen) return false;
  seen = now;
  try { mergeIn(JSON.parse(now)); return true; } catch { return false; }
}
const refresh = () => { setLvl(); renderProgress(); renderChat(); };

// Cloud sync (only when signed in): debounced upload of the whole state; retried on the next save or when back online.
let user: cloud.User | null = null, pushT = 0, syncOk = true, pulled = false; // pulled: this device has seen the cloud copy; never push before that, or an empty device would overwrite the trail
function schedulePush() {
  if (!user) return;
  clearTimeout(pushT);
  pushT = window.setTimeout(async () => {
    if (!user) return;
    try {
      if (!pulled) { const remote = await cloud.pull(user.id); if (remote) mergeIn(remote); pulled = true; renderMe(); applyField(false); }
      await cloud.push(user.id, snapshot()); if (!syncOk) say('Synced again.'); syncOk = true; }
    catch { if (syncOk) say("Couldn't sync. Your answers are safe on this device and will sync later."); syncOk = false; }
    renderAcct();
  }, 1200);
}
addEventListener('online', () => { if (user && !syncOk) schedulePush(); flushSigns(); });
// Merge a synced copy into this device (sync.ts rules: newest answer wins, deletes stick), keep local settings.
const mergeIn = (raw: unknown) => {
  const r = sanitize(raw); if (!r) return;
  const m = mergeAnswers(S.answers, r.answers, S.gone, r.gone);
  S.answers = m.answers; S.gone = m.gone;
  const mb = mergeAnswers(S.builds, r.builds, S.gone, r.gone); S.builds = mb.answers; S.gone = mb.gone; // pieces sync like answers: newest wins, a delete sticks (a run's i starts at PIECE_AT, so its key never meets an answer's)
  S.stones = S.answers.reduce((s, a) => s + worth(a), 0); // stones are exactly what the merged answers earned
  if (!S.name) S.name = r.name;
  if (r.adult) S.adult = true;
  if (!S.onboarded && r.onboarded) { S.onboarded = true; S.field = r.field; }
  S.fields = [...new Set([...S.fields, ...r.fields, S.field])]; // interests from every device
  const rd = Object.fromEntries(Object.entries(r.drafts).filter(([k]) => !S.answers.some((a) => `${a.f}.${a.i}` === k)));
  S.drafts = { ...rd, ...S.drafts };
  if (!S.mine.length && r.mine.length) { S.mine = r.mine; S.msgs = r.msgs; }
  S.saves = Math.max(S.saves, r.saves);
  if (!S.guess) S.guess = r.guess;
  S.badges = [...new Set([...S.badges, ...r.badges])];
  S.dared = S.dared || r.dared;
  const ck = (c: CoopRec) => `${c.role}.${c.f}.${c.i}.${c.at}`, cm = new Map(S.coops.map((c) => [ck(c), c])); // co-ops from every device; a reply that arrived on one fills the other
  for (const c of r.coops) { const o = cm.get(ck(c)); if (!o) cm.set(ck(c), c); else if (!o.theirs && c.theirs) { o.theirs = c.theirs; o.with = o.with || c.with; } }
  S.coops = [...cm.values()].sort((a, b) => a.at - b.at).slice(-30);
  if (!S.habit.t && r.habit.t) { S.habit.t = r.habit.t; S.habit.c = r.habit.c; }
  const hl = new Map<number, string>(); // days done on any device; a day that found something keeps it
  for (const [d, id] of [...S.habit.l, ...r.habit.l]) if (!hl.get(d)) hl.set(d, id);
  S.habit.l = [...hl].sort((a, b) => a[0] - b[0]).slice(-90);
};

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const kScr = $('kScr');
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
// Phones (touch, no hover) get a lighter look: no moving aurora, noise, blur or mask behind the content, no View Transitions, no endless animations (app.css .lite). ?lite shows it on a computer.
const lite = matchMedia('(hover: none) and (pointer: coarse)').matches || /[?&]lite\b/.test(location.search);
document.documentElement.classList.toggle('lite', lite);
const TR: Record<Lang, Record<string, string>> = { en: EN, it: IT, de: DE, fr: FR, nl: NL, sv: SV };
const LOCALE: Record<Lang, string> = { en: 'en-GB', it: 'it-IT', de: 'de-DE', fr: 'fr-FR', nl: 'nl-NL', sv: 'sv-SE' };
const tr = (s: string) => TR[S.lang][s] || EN[s] || s; // EN: "Selling" reads "Selling online" wherever a field name shows
// A sentence with blanks: fill(t2('Round {n} done', 'Round {n} fatto'), { n: 2 }), translated first, then every {name} filled once.
const fill = (en: string, v: Record<string, string | number>) => tr(en).replace(/\{(\w+)\}/g, (m, k: string) => (Object.prototype.hasOwnProperty.call(v, k) ? String(v[k]) : m));
const setT = (el: Element, en: string) => { (el as HTMLElement).dataset.en = en; el.innerHTML = tr(en); };
// Dynamic text built in code: clear data-en so a language switch does not overwrite it.
const setD = (el: Element, text: string) => { (el as HTMLElement).dataset.en = ''; el.textContent = text; };
const pressed = (attr: string, val: string) => document.querySelectorAll<HTMLElement>(`[data-k-${attr}]`).forEach((b) => b.setAttribute('aria-pressed', String(b.getAttribute(`data-k-${attr}`) === val)));
const F = () => FIELDS[S.field] || FIELDS.Design;
const day = (t: number) => new Date(t).toLocaleDateString(LOCALE[S.lang], { day: 'numeric', month: 'short' });
const when = (t: number, time = false) => new Date(t).toLocaleString(LOCALE[S.lang], time ? { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' } : { day: 'numeric', month: 'short' });
// Rounds, counters and the Slash card's guess look at the core projects only (index 0 to TREND_FROM - 1); the Trending ones (trending.ts) sit after them and stand apart.
const doneIn = (f: string) => new Set(S.answers.filter((a) => a.f === f && a.i < TREND_FROM).map((a) => a.i));
const doneSet = () => doneIn(S.field);
const kindOf = (a: { i: number }) => (a.i < TREND_FROM ? a.i % PER_ROUND : -1); // improve / start from zero / partner; a trending project has none
// Rounds: the screen shows 3 missions at a time. base() is the index of the first mission of the round in play; the
// rows, trail and counters work on 0-2 inside that window (winDone), everything stored uses the full index.
const total = (f = S.field) => (FIELDS[f] ? Math.min(FIELDS[f].m.length, TREND_FROM) : PER_ROUND);
const base = (f = S.field) => roundOf(doneIn(f), total(f)) * PER_ROUND;
const winDone = () => { const d = doneSet(), b = base(); return new Set([0, 1, 2].filter((k) => d.has(b + k))); };
let peek = ''; // "field:base()" of the round whose NEXT round is on show in the list: a look ahead, never a lock. Keyed by field too, so it cannot leak to another field
const peekKey = () => `${S.field}:${base()}`;
const peeking = () => peek === peekKey() && base() + PER_ROUND < total();
const viewBase = () => base() + (peeking() ? PER_ROUND : 0); // first mission of the three rows on screen

const toast = $('kToast'), toastT = $('kToastT'), toastB = $('kToastB');
let tT = 0, toastAct: (() => void) | null = null;
let clearT = 0; // the words go once the fade is over: a faded toast must not leave its last message for a screen reader to find
const hideToast = () => {
  toast.classList.remove('on', 'act'); toastAct = null; toastB.hidden = true;
  clearTimeout(clearT); clearT = window.setTimeout(() => { if (!toast.classList.contains('on')) toastT.textContent = ''; }, 400);
};
// Short message at the bottom; with `undo`, shows an Undo button for a few seconds (Gmail-style).
function say(en: string, undo?: () => void) {
  toastT.textContent = tr(en);
  toastAct = undo || null; toastB.hidden = !undo; toastB.textContent = tr('Undo');
  toast.classList.toggle('act', !!undo); toast.classList.add('on');
  if (undo) toastB.focus({ preventScroll: true }); // keyboard and screen-reader users land on Undo
  clearTimeout(tT); tT = window.setTimeout(hideToast, undo ? 8000 : 2800);
}
// A badge is news nobody asked for, so it never takes the place of an Undo that is still on screen, and never lands on a sheet someone is filling in
// (it covered the last self-check row): it waits its turn, and shows once the sheet is closed.
const sayBadge = (text: string) => {
  if (toastAct || topLayer()) { window.setTimeout(() => sayBadge(text), 1000); return; }
  say(text); if ('vibrate' in navigator) navigator.vibrate([20, 40, 20]);
};
const reveal = (el: Element) => el.scrollIntoView({ block: 'nearest', behavior: still ? 'auto' : 'smooth' });
// A screen or state swaps under the user's finger: focus its heading, or keyboard and screen-reader focus falls to the page body.
// syncInert first: a layer that was just closed may still hold the screen behind it inert, and a focus() there is refused.
const land = (el: HTMLElement) => { syncInert(); el.tabIndex = -1; el.focus({ preventScroll: true }); };
// A step swap (answer, reflection, reward, next mission) puts a different button under the same thumb: ignore a second tap within 450 ms.
let tapLockUntil = 0;
const once = (fn: () => void) => () => { if (performance.now() < tapLockUntil) return; tapLockUntil = performance.now() + 450; fn(); };
kScr.appendChild(toast); // a direct child of the screen, so a screen reader still hears it while a sheet makes the app shell inert
toastB.addEventListener('click', () => { const f = toastAct; hideToast(); if (f) f(); });
// An Undo waits while the pointer rests on it, and gets a few more seconds once the pointer leaves.
toast.addEventListener('pointerenter', () => clearTimeout(tT));
toast.addEventListener('pointerleave', () => { if (toastAct) tT = window.setTimeout(hideToast, 4000); });

// Static text: remember the English source so language switches are lossless.
const kTxt = kScr.querySelectorAll<HTMLElement>('.k-l:not(.k-finds-h), h4, h5, p, .k-sig, .k-chips span, .k-tile span, .k-tile small, .k-choice, .k-done span, .k-tag span, .k-tag strong, .k-ask button, .k-btn, .k-ask-btn, .k-go, .k-sk, .k-win, .k-check span, .k-seg button, .k-tabs .tt, #kXAsk, .k-streak small, .k-finds-h span, .k-lnk, .k-brief summary, #kVsAsk button');
kTxt.forEach((e) => { e.dataset.en = e.innerHTML.trim(); });
// Headings: the page is an h1 (screen-reader only), panes (h4) and cards (h5). Levels 2 and 3 are what a screen reader announces; the tags keep the look.
kScr.querySelectorAll('h4').forEach((h) => h.setAttribute('aria-level', '2'));
kScr.querySelectorAll('h5').forEach((h) => h.setAttribute('aria-level', '3'));
const SAMPLE = { guess: $('kGuess').dataset.en!, why: $('kWhy').dataset.en!, ai: $('kAiSig').dataset.en!, card: $('kCardH').dataset.en!, cardL: $('kCardL').dataset.en!, drawn: ['Shaping ideas', 'Writing', 'Solo work'], cardC: ['Shaping ideas', 'Writing'] };

// Launch loader
const kLoad = $('kLoad');
if (still) kLoad.classList.add('off');
else { kLoad.classList.add('go'); window.setTimeout(() => kLoad.classList.add('off'), S.onboarded ? 1900 : 2600); }

// Theme: light only (the dark theme is retired; its CSS stays in app.css, dormant). The same two lines as public/theme-init.js, which runs before the first paint.
const applyTheme = () => {
  kScr.classList.add('light');
  document.documentElement.classList.add('light');
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#F5F7FF');
};

// Text size: every font size in app.css is in rem, so the root size scales all the text. One button per step in Settings.
const TEXT_SCALE = [0.92, 1, 1.14, 1.3];
const applyText = () => { document.documentElement.style.setProperty('--kts', String(TEXT_SCALE[S.text] ?? 1)); pressed('text', String(S.text)); };
document.querySelectorAll<HTMLElement>('[data-k-text]').forEach((b) => b.addEventListener('click', () => { S.text = Number(b.dataset.kText); save(); applyText(); }));
// "Aa" on the first screens: the same four steps, one tap each, so nobody has to find Settings to read the start.
const TEXT_NAMES = ['Small', 'Default', 'Large', 'Larger'];
$('kAa').addEventListener('click', () => { S.text = (S.text + 1) % TEXT_SCALE.length; save(); applyText(); say(`${tr('Text size')}: ${tr(TEXT_NAMES[S.text])}`); });

// View Transitions (Chrome, Safari 18+, Firefox 144+): tab panes slide in the direction you move,
// the chosen field object flies into the mission card. Older browsers get the plain swap.
type VT = { ready: Promise<void>; updateCallbackDone: Promise<void>; finished: Promise<void> };
const startVT = lite ? undefined : (document as Document & { startViewTransition?: (cb: () => unknown) => VT }).startViewTransition?.bind(document);
let vtBusy = false, vtSeq = 0;
document.documentElement.classList.toggle('has-vt', !!startVT && !matchMedia('(prefers-reduced-motion: reduce)').matches); // the pane's own slide then replaces the cards' fade-up (app.css)
// Runs cb inside a View Transition with `cls` on <html> while it plays. A skipped transition (rapid taps,
// hidden tab) still runs cb; its promises then reject by design, so they are caught here.
const runVT = (cls: string, cb: () => unknown, after?: () => void) => {
  const root = document.documentElement, seq = ++vtSeq;
  root.classList.add(cls);
  const t = startVT!(cb);
  t.ready.catch(() => { /* skipped */ }); t.updateCallbackDone.catch(() => { /* skipped */ });
  t.finished.catch(() => { /* skipped */ }).finally(() => { if (seq === vtSeq) root.classList.remove('vt-tab', 'vt-hero'); after?.(); });
};

// Tabs
const tabs = kScr.querySelectorAll<HTMLElement>('[data-k-tab]');
const tabIds = [...tabs].map((x) => 'k-' + x.dataset.kTab);
let wanted = ''; // the pane the latest tap asked for: a swap runs a frame after its tap, and must show this one, so an earlier swap can never overrule a later tap
// slashkern says what it is in one line the first time it is opened on this device; from the next visit on the line is gone.
try { $('kYkWhy').hidden = !!localStorage.getItem(YK_SEEN); } catch { /* storage blocked: the line just stays */ }
tabs.forEach((t) => t.addEventListener('click', () => {
  const next = 'k-' + t.dataset.kTab, cur = kScr.querySelector<HTMLElement>('.k-pane.on');
  wanted = next;
  if (next === 'k-yourkern') try { localStorage.setItem(YK_SEEN, '1'); } catch { /* storage blocked */ }
  if (next === 'k-copilot') checkLive();
  stopSpeaking(); // a question being read aloud stops when the screen changes
  tabs.forEach((x) => { x.classList.toggle('on', x === t); x.setAttribute('aria-current', String(x === t)); });
  const swap = () => {
    kScr.querySelectorAll('.k-pane').forEach((p) => { p.classList.remove('leaving'); p.classList.toggle('on', p.id === wanted); });
    kScr.querySelector<HTMLElement>('.k-body')!.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    // the chat was drawn while its pane was hidden, where scrolling does nothing: open it on the latest message
    if (wanted === 'k-copilot') { const log = $('kChat'); log.scrollTo({ top: log.scrollHeight, behavior: 'instant' as ScrollBehavior }); }
  };
  moveInd(t, true);
  if (still || !cur || cur.id === next || vtBusy) return swap();
  if (startVT) {
    document.documentElement.dataset.dir = tabIds.indexOf(next) > tabIds.indexOf(cur.id) ? 'fwd' : 'back';
    runVT('vt-tab', swap); // only the pane animates; the tab bar stays live so its capsule slides
  } else { cur.classList.add('leaving'); window.setTimeout(swap, 140); }
}));
const goTab = (name: string) => kScr.querySelector<HTMLElement>(`[data-k-tab="${name}"]`)!.click();

// Tab indicator: one pill that slides to the active tab, stretching while it travels.
const nav = kScr.querySelector<HTMLElement>('.k-tabs')!;
const ind = document.createElement('span');
ind.className = 'k-ind'; ind.setAttribute('aria-hidden', 'true'); nav.appendChild(ind);
let indX = -1;
function moveInd(btn: HTMLElement, animate: boolean) {
  const x = btn.offsetLeft + btn.offsetWidth / 2 - ind.offsetWidth / 2;
  const travel = Math.abs(x - indX);
  if (!animate || still || indX < 0 || travel < 1) {
    ind.classList.add('snap'); ind.style.transform = `translateX(${x}px)`;
    void ind.offsetWidth; ind.classList.remove('snap');
  } else ind.style.transform = `translateX(${x}px)`; // one clean slide, no stretch and no second step
  indX = x;
}
const onTab = () => kScr.querySelector<HTMLElement>('.k-tabs button.on')!;
new ResizeObserver(() => moveInd(onTab(), false)).observe(nav);

// Sheets (answer + settings): backdrop tap and Escape close them, focus returns where it was.
const kSheet = $('kSheet'), kSet = $('kSet'), kFld = $('kFld'), kMic = $('kMicS');
// Whatever layer is on top (sheet, reward, login, onboarding) makes everything behind it inert:
// no Tab, clicks or screen reader reaching the page under a dialog.
const LAYERS = ['kReward', 'kMicS', 'kPwS', 'kSet', 'kFld', 'kSheet', 'kBuild', 'kFirst', 'kStart', 'kLogin'].map((id) => $(id)); // top first
const topLayer = () => LAYERS.find((l) => !l.hidden && (!l.classList.contains('k-start') || l.classList.contains('on')));
const syncInert = () => {
  const top = topLayer();
  for (const c of kScr.children) (c as HTMLElement).inert = !!top && c !== top && c.id !== 'kToast' && c.id !== 'kLoad';
};
const layerWatch = new MutationObserver(syncInert);
LAYERS.forEach((l) => layerWatch.observe(l, { attributes: true, attributeFilter: ['hidden', 'class'] }));
let lastFocus: HTMLElement | null = null;
const openSheetEl = (sh: HTMLElement, focus: HTMLElement) => {
  lastFocus = document.activeElement as HTMLElement; sh.hidden = false; syncInert();
  sh.querySelector('.k-sh-in')?.scrollTo(0, 0); // start at the top, whatever the last sheet was scrolled to
  focus.focus({ preventScroll: true });
};
const hush = () => { stopPlay(); stopSpeaking(); $<HTMLVideoElement>('kXAV').pause(); }; // every sound of the sheet: the beat, a song, the reel, the clip
const closeSheet = (sh: HTMLElement) => {
  const reveal = sh === kSheet && !$('kShD').hidden; // closed from the drop screen (Escape or backdrop): refresh stones and rank like Continue does
  sh.hidden = true; syncInert(); stopSpeaking(); if (sh === kSheet) { flushDraft(); hush(); } lastFocus?.focus();
  if (reveal) { setLvl(); renderProgress(); }
};
[kSheet, kSet, kFld, kMic].forEach((sh) => {
  sh.addEventListener('click', (e) => { if (e.target === sh) dismiss(sh); });
  sh.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); dismiss(sh); } });
});
// Closing a sheet moves like the finger that drags it: the sheet slides the rest of the way down while the scrim fades, then it is really closed (closeSheet).
// The close button, Escape, the scrim and a drag all use it; code that closes a sheet to open something else keeps calling closeSheet at once.
const EXIT_MS = 190;
const dismiss = (sh: HTMLElement) => {
  if (sh.hidden || sh.dataset.leaving) return;
  if (still) return closeSheet(sh);
  const inner = sh.querySelector<HTMLElement>('.k-sh-in')!;
  sh.dataset.leaving = '1'; inner.classList.remove('drag'); inner.classList.add('out'); inner.style.translate = '0 100%'; sh.style.setProperty('--drag', '1');
  window.setTimeout(() => { delete sh.dataset.leaving; inner.classList.remove('out'); inner.style.translate = ''; sh.style.removeProperty('--drag'); closeSheet(sh); }, EXIT_MS);
};
// Drag a sheet down from its top to close it: the handle area and, on a mission, the bar and header. Those parts have touch-action: none (app.css), so a finger's
// drag arrives as pointer events and the page never has to wait for a script before it scrolls. A short drag springs back; buttons in the zone keep working.
const SWIPE_CLOSE_PX = 80, INTERACTIVE = 'button, a, input, textarea, select, [role="button"]';
kScr.querySelectorAll<HTMLElement>('.k-sheet').forEach((sh) => {
  const inner = sh.querySelector<HTMLElement>('.k-sh-in')!;
  let startY = 0, dy = 0, live = false;
  const follow = (d: number) => { dy = d; inner.classList.add('drag'); inner.style.translate = d ? `0 ${d}px` : ''; sh.style.setProperty('--drag', String(Math.min(1, d / 320))); };
  const settle = () => { inner.classList.remove('drag'); inner.style.translate = ''; sh.style.removeProperty('--drag'); };
  const end = (cancel = false) => { if (!live) return; live = false; inner.style.userSelect = ''; if (!cancel && dy >= SWIPE_CLOSE_PX) dismiss(sh); else settle(); };
  inner.addEventListener('pointerdown', (e) => {
    const t = e.target as HTMLElement;
    if (sh.dataset.leaving || e.button !== 0 || t.closest(INTERACTIVE) || !t.closest('.k-grab, .k-shbar, .k-top-zone')) return;
    startY = e.clientY; dy = 0; live = true; inner.setPointerCapture(e.pointerId); inner.style.userSelect = 'none';
  });
  inner.addEventListener('pointermove', (e) => { if (live && inner.hasPointerCapture(e.pointerId)) follow(Math.max(0, e.clientY - startY)); });
  const up = (e: PointerEvent, cancel = false) => { if (live && inner.hasPointerCapture(e.pointerId)) inner.releasePointerCapture(e.pointerId); end(cancel); };
  inner.addEventListener('pointerup', (e) => up(e));
  inner.addEventListener('pointercancel', (e) => up(e, true));
  // Settings and the field sheet also follow a finger pulling down on their content while that content is scrolled to its top. Passive listeners: scrolling never waits for them.
  if (sh.id !== 'kSet' && sh.id !== 'kFld') return;
  let ty = 0, tt = 0, pulling = false, armed = false;
  // (the handle and the header have their own pointer drag above, so a touch there is left out)
  inner.addEventListener('touchstart', (e) => { armed = !sh.dataset.leaving && inner.scrollTop <= 0 && !(e.target as HTMLElement).closest('textarea, input, .k-grab, .k-top-zone'); pulling = false; ty = e.touches[0].clientY; tt = e.timeStamp; dy = 0; }, { passive: true });
  inner.addEventListener('touchmove', (e) => {
    if (!armed) return;
    const d = e.touches[0].clientY - ty;
    if (d <= 0 || inner.scrollTop > 0) { if (pulling) { pulling = false; settle(); } if (inner.scrollTop > 0 || d < -6) armed = false; return; }
    pulling = true; follow(d);
  }, { passive: true });
  const release = (e: TouchEvent, cancel: boolean) => {
    if (!pulling) return; pulling = false; armed = false;
    const fast = dy / Math.max(1, e.timeStamp - tt) > 0.6; // a quick flick closes it even when short
    if (!cancel && (dy >= SWIPE_CLOSE_PX || (fast && dy >= 36))) dismiss(sh); else settle();
  };
  inner.addEventListener('touchend', (e) => release(e, false));
  inner.addEventListener('touchcancel', (e) => release(e, true));
});
// The Settings header gets a soft shadow once the list slides under it.
const kSetIn = kSet.querySelector<HTMLElement>('.k-sh-in')!, kSetHd = kSet.querySelector<HTMLElement>('.k-sethd')!;
kSetIn.addEventListener('scroll', () => kSetHd.classList.toggle('scrolled', kSetIn.scrollTop > 2), { passive: true });

// Ranks
const RANKS: [string, number][] = [[t2('Pebble', 'Ciottolo'), 0], [t2('Stone', 'Pietra'), 100], [t2('Cairn', 'Cairn'), 300], [t2('Ridge', 'Cresta'), 700], [t2('Summit', 'Vetta'), 1500]];
const rankIdx = (s: number) => RANKS.reduce((a, r, i) => (s >= r[1] ? i : a), 0);
// Points and ranks are cut from the interface; this only keeps the answer box placeholder in step with the language.
const setLvl = () => { $<HTMLTextAreaElement>('kTa').placeholder = tr('Write it your way.'); };

// Signals: which kind of mission you light up on, from your own reflections. The kind is the mission index % 3
// (improve what exists, start from zero, work with someone), so each round adds evidence for the same three kinds.
const KIND_EN = [t2('improve what already exists', 'migliori ciò che esiste già'), t2('start from zero', 'parti da zero'), t2('work with someone', 'collabori con qualcuno')]; // "when you ...": i18n-de.ts, i18n-fr.ts, i18n-nl.ts and i18n-sv.ts write them to end that sentence
const KSHORT = ['Improving things', 'Starting from zero', 'Working with others'];
const FEEL_EN: Record<Feel, string> = { flow: 'Time flew', ok: 'It was fine', drag: 'It dragged', easy: 'Too easy' };
const AGAIN_EN: Record<Again, string> = { yes: 'Yes', maybe: 'Maybe', no: 'No' };
const DRAGGED = 0.5; // a kind is only called a drag when its average is this low: a lone "It was fine" scores 1 and is not one
const readSignals = () => {
  const by = [0, 1, 2].map((i) => S.answers.filter((a) => a.f === S.field && kindOf(a) === i && a.r?.e)); // by kind: every round has one of each
  const rated = by.map((l, i) => ({ i, v: l.length ? l.reduce((s, a) => s + SCORE[a.r!.e!], 0) / l.length : -1 })).filter((x) => x.v >= 0).sort((a, b) => b.v - a.v);
  if (!rated.length) return null;
  const best = rated[0].i, low = rated[rated.length - 1];
  const worst = rated.length > 1 && low.v < rated[0].v && low.v <= DRAGGED ? low.i : -1;
  const last = (i: number) => by[i][by[i].length - 1];
  const lowest = (i: number) => by[i].reduce((m, a) => (SCORE[a.r!.e!] <= SCORE[m.r!.e!] ? a : m)); // the answer behind a drag: the latest one with the lowest mark
  return { best, worst, n: rated.length, bestA: last(best), worstA: worst >= 0 ? lowest(worst) : null };
};
const ready = (sg: ReturnType<typeof readSignals>) => !!sg && sg.n === 3; // a reflection on each of the three kinds
const chips = (box: HTMLElement, list: string[]) => { box.innerHTML = ''; list.forEach((t) => { const s = document.createElement('span'); s.textContent = t; box.appendChild(s); }); };
// Slash card: a line you wrote, the field as a path, and the pattern once all three kinds of mission have a reflection.
// Before that it shows your latest answer and how many reflections are left. With no answer in the field yet, it is a labelled example.
const KIND_ME = [t2('I get into it when I improve what already exists.', 'Mi appassiono quando miglioro ciò che esiste già.'), t2('I get into it when I start from zero.', 'Mi appassiono quando parto da zero.'), t2('I get into it when I work with someone.', 'Mi appassiono quando collaboro con qualcuno.')]; // first person, for the image you share
const CARD_EX = { f: 'Writing', n: '3 of 6 projects', q: 'Almost stayed home. Bag strap snapped on the bus. Lifted 40 kg anyway.', m: 'Rewrite a caption so friends reply · Time flew', h: 'So far, you get into it when you start from zero.' };
// "That feels right / Not really" is kept with the kind it was about ("Not really · Starting from zero"), so a new pattern starts fresh.
const FIT = { yes: 'That feels right', no: 'Not really' } as const;
const FIT_MSG = { yes: 'Saved. This guess stays on your card and on the image you share.', no: 'Noted. Your card marks this guess “not really” and leaves it off the image you share.' } as const;
type Fit = keyof typeof FIT;
const fitOf = (best: number): Fit | '' => {
  const [a, k] = S.guess.split(' · ');
  return k !== KSHORT[best] ? '' : a === FIT.yes ? 'yes' : a === FIT.no ? 'no' : '';
};
// One line from an answer: whole words, never half an emoji, no text-direction controls.
const answerLine = (t: string, max = 100) => {
  // Do it here writes its picks on the first lines ("Order: ..."): the card quotes the person's own words when they added any.
  const lines = t.split('\n').map((l) => l.trim()).filter(Boolean), own = lines.filter((l) => !/^[^:]{1,24}: /.test(l));
  if (own.length && own.length < lines.length) t = own[own.length - 1];
  const s = t.replace(/[\u202A-\u202E\u2066-\u2069]/g, '').replace(/\s+/g, ' ').trim();
  if ([...s].length <= max) return s;
  const cut = clip(s, max), sp = cut.lastIndexOf(' ');
  return (sp > max * 0.6 ? cut.slice(0, sp) : cut).replace(/[\s,.;:!?·–—-]+$/, '') + '…';
};
const missionsLine = (done: number, all: number) => fill(t2('{n} of {all} projects', '{n} su {all} progetti'), { n: done, all });
const cardData = () => {
  const sg = readSignals(), f = S.field, mine = S.answers.filter((a) => a.f === f);
  const latest = mine.reduce<Answer | undefined>((m, a) => (!m || a.at >= m.at ? a : m), undefined);
  const best = sg && ready(sg) ? sg.best : -1, a = sg && best >= 0 ? sg.bestA : latest;
  // The pattern is named only when its kind did better than "It was fine": three "It dragged" never become "you get into it".
  const rated = mine.filter((x) => kindOf(x) === best && x.r?.e);
  const lit = rated.length > 0 && rated.reduce((n, x) => n + SCORE[x.r!.e!], 0) / rated.length > SCORE.ok;
  const fit = lit ? fitOf(best) : '';
  return {
    sg, a, lit, fit, done: doneIn(f), all: total(f), refl: mine.filter((x) => x.r?.e).length,
    src: a ? `${tr(FIELDS[a.f].m[a.i][1])}${a.r?.e ? ' · ' + tr(FEEL_EN[a.r.e]) : ''}${a.ai ? ' · ' + tr(AI_TAG) : ''}` : '', // the Slash card and the shared image say so when the line was made with AI help
    you: best < 0 ? ''
      : !lit ? tr(t2('So far, no kind of project made time fly for you. That counts too.', 'Finora nessun tipo di progetto ti ha fatto volare il tempo. Anche questo conta.'))
      : fill(t2('So far, you get into it when you {k}.', 'Finora ti appassioni quando {k}.'), { k: tr(KIND_EN[best]) }),
    me: !lit || fit === 'no' ? '' : tr(KIND_ME[best]), // "Not really" keeps it off the image
  };
};
const renderCard = () => {
  const c = cardData(), h = $('kCardH'), fbEl = $('kFb');
  $('kSample').hidden = !!c.a;
  const on = c.a ? c.done : new Set([0, 1, 2]);
  $('kCardP').innerHTML = Array.from({ length: c.a ? c.all : 6 }, (_, i) => `<i${on.has(i) ? ' class="on"' : ''}></i>`).join('');
  h.classList.toggle('wait', !!c.a && !c.you); h.classList.toggle('no', c.fit === 'no');
  if (!c.a) {
    setT($('kCardF'), CARD_EX.f); setT($('kCardN'), CARD_EX.n); setT($('kCardQ'), CARD_EX.q); setT($('kCardM'), CARD_EX.m); setT(h, CARD_EX.h); setT($('kCardL'), SAMPLE.cardL);
  } else {
    const left = 3 - (c.sg?.n ?? 0), n = c.refl;
    setD($('kCardF'), tr(S.field));
    setD($('kCardN'), missionsLine(c.done.size, c.all));
    setD($('kCardQ'), answerLine(c.a.t));
    setD($('kCardM'), c.src);
    setD(h, c.you || fill(left === 1 ? t2('1 more reflection and the card takes a guess at what you get into.', 'Ancora 1 riflessione e la card prova a dire cosa ti appassiona.')
      : t2('{n} more reflections and the card takes a guess at what you get into.', 'Ancora {n} riflessioni e la card prova a dire cosa ti appassiona.'), { n: left }));
    setD($('kCardL'), c.you
      ? fill(t2('Based on your {n} reflections. Not a test.', 'Basata sulle tue {n} riflessioni. Non è un test.'), { n }) + (c.fit === 'no' ? ` ${tr(t2('You said: not really.', 'Hai detto: non proprio.'))}` : '')
      : fill(n === 1 ? t2('Your latest answer · 1 reflection so far', 'La tua ultima risposta · 1 riflessione finora') : t2('Your latest answer · {n} reflections so far', 'La tua ultima risposta · {n} riflessioni finora'), { n }));
  }
  $('kCardAsk').hidden = !c.lit; // nothing to agree with until the card names a pattern
  kScr.querySelectorAll<HTMLElement>('#kCardAsk [data-k-fit]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.kFit === c.fit)));
  const msg = c.fit ? FIT_MSG[c.fit] : '';
  if (msg) fbEl.dataset.src = msg; else delete fbEl.dataset.src;
  if (fbEl.textContent !== tr(msg)) fbEl.textContent = tr(msg); // the same words again are not news for a screen reader
  kScr.querySelector<HTMLElement>('#kSlashCard [data-k-share="card"]')!.hidden = !c.a; // your own line is worth sharing before the pattern is
};
const renderSignals = () => {
  const sg = readSignals();
  renderCard();
  if (!sg) {
    setT($('kGuess'), SAMPLE.guess); setT($('kWhy'), SAMPLE.why);
    chips($('kDrawn'), SAMPLE.drawn.map(tr));
  } else {
    const title = (a: Answer) => tr(FIELDS[a.f].m[a.i][1]);
    const feel = (a: Answer) => tr(FEEL_EN[a.r!.e!]);
    const k = tr(KIND_EN[sg.best]), e = feel(sg.bestA), m = title(sg.bestA);
    setD($('kGuess'), sg.worst >= 0 ? fill(t2('You seemed to light up when you {k} and drag when you {w}.', 'Sembri appassionarti quando {k} e faticare quando {w}.'), { k, w: tr(KIND_EN[sg.worst]) })
      : fill(t2('You seemed to light up when you {k}.', 'Sembri appassionarti quando {k}.'), { k }));
    setD($('kWhy'), sg.worstA ? fill(t2('Why we think so: you marked "{e}" on {m} and "{e2}" on {m2}.', 'Il motivo: hai segnato "{e}" su {m} e "{e2}" su {m2}.'), { e, m, e2: feel(sg.worstA), m2: title(sg.worstA) })
      : fill(t2('Why we think so: you marked "{e}" on {m}.', 'Il motivo: hai segnato "{e}" su {m}.'), { e, m }));
    chips($('kDrawn'), [tr(S.field), tr(KSHORT[sg.best])]);
  }
  $('kWhy').hidden = $('kMeterC').hidden = !ready(sg); // the card only names a pattern once all three kinds of mission have a reflection
  // Energy per kind of mission in this field: the average of your own "how did it feel" answers.
  const meter = $('kMeter');
  meter.innerHTML = '';
  let any = false;
  [0, 1, 2].forEach((i) => {
    const l = S.answers.filter((a) => a.f === S.field && kindOf(a) === i && a.r?.e);
    const v = l.length ? l.reduce((s, a) => s + SCORE[a.r!.e!], 0) / (l.length * 2) : 0;
    any ||= l.length > 0;
    const row = document.createElement('div'), lab = document.createElement('span'), val = document.createElement('b'), bar = document.createElement('i'), fill = document.createElement('s');
    row.className = 'k-mt'; lab.textContent = tr(KSHORT[i]); val.textContent = l.length ? Math.round(v * 100) + '%' : '–';
    fill.style.width = v * 100 + '%'; bar.append(fill); row.append(lab, val, bar); meter.append(row);
  });
  setT($('kMeterN'), any ? 'From your reflections. Not a test.' : 'Reflect after a project to fill this.');
  const n = S.mine.length;
  if (n >= 2) setD($('kAiSig'), fill(t2('You rewrote your idea {n} times with Slash. Compare version 1 with your latest one.', 'Hai riscritto la tua idea {n} volte con Slash. Confronta la versione 1 con l’ultima.'), { n }));
  else setT($('kAiSig'), 'Write your idea with Slash. Your versions show up here.'); // never a made-up insight shown as if it were yours
  renderCompare();
};
// Fields side by side: once two fields have a reflection, each one's average energy next to how many reflections it rests on (compare.ts).
const renderCompare = () => {
  const card = $('kFcmp'), rows = rowsOf(S.answers, Object.keys(FIELDS)), v = verdict(rows);
  card.hidden = v === 'none';
  if (card.hidden) return;
  setD($('kFcmpT'), v === 'early' ? tr(t2('Early days. Try a second project in each.', 'Siamo all’inizio. Prova un secondo progetto in ognuno.'))
    : v === 'close' ? tr(t2('Too close to call yet.', 'Ancora troppo vicini per dire.'))
    : fill(t2('{f} gave you the most energy so far.', 'Finora ti ha dato più energia: {f}.'), { f: tr(rows[0].f) }));
  $('kFcmpM').replaceChildren(...rows.map((r) => {
    const row = document.createElement('div'), lab = document.createElement('span'), val = document.createElement('b'), bar = document.createElement('i'), fill = document.createElement('s');
    row.className = 'k-mt'; lab.textContent = tr(r.f); val.textContent = `${Math.round(r.v * 100)}% · ${r.n}`;
    fill.style.width = `${r.v * 100}%`; bar.append(fill); row.append(lab, val, bar); return row;
  }));
};

// Home: greeting, next mission, the three missions with status.
// Your interests on Missions: switch path in one tap (progress is kept per field), or add more.
const switchField = (f: string) => {
  if (f === S.field || !FIELDS[f]) return;
  peek = ''; S.field = f; save(); applyField(false); pop();
};
const renderFields = () => {
  const box = $('kFields');
  box.innerHTML = '';
  S.fields.forEach((f) => {
    const b = document.createElement('button'), im = document.createElement('span'), t = document.createElement('span'), n = document.createElement('small');
    b.type = 'button'; b.className = 'k-fchip' + (f === S.field ? ' on' : ''); b.setAttribute('aria-pressed', String(f === S.field)); b.dataset.fa = f; // the field's accent colour (app.css)
    im.className = 'k-fi'; im.setAttribute('aria-hidden', 'true'); im.innerHTML = icon(f);
    t.textContent = tr(f);
    n.textContent = `${doneIn(f).size}/${total(f)}`;
    b.append(im, t, n); b.addEventListener('click', () => switchField(f)); box.appendChild(b);
  });
  const add = document.createElement('button');
  add.type = 'button'; add.className = 'k-fchip k-fadd'; add.textContent = `+ ${tr('Add')}`; add.setAttribute('aria-label', tr('Add interests'));
  add.addEventListener('click', () => openStart()); box.appendChild(add);  const on = box.querySelector<HTMLElement>('.on'); // with more paths than fit, the one in play stays in view
  if (on) box.scrollTo({ left: Math.max(0, on.getBoundingClientRect().left - box.getBoundingClientRect().left + box.scrollLeft - 20), behavior: 'instant' as ScrollBehavior });
};
// What to expect in the field on show (a day in it, what people like and find hard) and three steps outside the app (fieldinfo.ts).
const listOf = (id: string, items: string[]) => $(id).replaceChildren(...items.map((t) => Object.assign(document.createElement('li'), { textContent: tr(t) })));
const renderAbout = () => {
  const f = tr(S.field);
  setD($('kAbout'), `${tr('What to expect')}: ${f}`);
};
const openAbout = () => {
  const info = FIELD_INFO[S.field];
  if (!info) return;
  $('kFlI').innerHTML = icon(S.field);
  setD($('kFlT'), tr(S.field)); setD($('kFlD'), tr(info.day));
  listOf('kFlL', info.like); listOf('kFlH', info.hard);
  setT($('kFlGo'), kAdd.dataset.kAns === 'card' ? 'See your Slash card' : 'Try the next project'); // a finished round has no next mission: the button leads where kAdd leads
  openSheetEl(kFld, $('kFlGo'));
};
$('kAbout').addEventListener('click', openAbout);
$('kFlX').addEventListener('click', () => dismiss(kFld));
$('kFlGo').addEventListener('click', () => { closeSheet(kFld); kAdd.click(); });
// Take it further: shown once the field on show has an answer, so it follows something the person did.
// ponytail: one no-contacts alternative for every field's Ask step; a per-field one would live in fieldinfo.ts.
const ASK_ALONE = 'No one to ask? Post the same question under a video or in a forum where people who do it hang out.';
const renderFurther = () => {
  const info = FIELD_INFO[S.field], card = $('kFurther');
  card.hidden = !info || !doneIn(S.field).size;
  if (card.hidden) return;
  setD($('kFuL'), `${tr('Take it further')} · ${tr(S.field)}`);
  $('kFuO').replaceChildren(...(['ask', 'make', 'learn'] as const).map((k) => {
    const li = document.createElement('li'), b = document.createElement('b'), t = document.createElement('span');
    b.textContent = tr({ ask: 'Ask', make: 'Make', learn: 'Notice' }[k]); t.textContent = tr(info.steps[k]);
    if (k === 'ask') t.append(Object.assign(document.createElement('small'), { textContent: tr(ASK_ALONE) })); // not everyone knows someone who does it
    li.append(b, t); return li;
  }));
};
document.addEventListener('visibilitychange', () => { if (!document.hidden) { if (absorb()) setLvl(); renderProgress(); track('visit'); } else hush(); }); // habit button, boost, streak and dots go stale overnight otherwise
const kAdd = $('kAdd'), kAdd2 = $('kAdd2');
// Usage counts without names (stats.ts): asked once on Home, switchable in Settings. Off until yes. Without Supabase there is nowhere to send them, so neither control shows.
const kStat = $('kStat'), kStatSet = $('kStatSet');
const track = (ev: stats.Ev, f?: string, i?: number) => { if (!DEMO && !(i !== undefined && i >= TREND_FROM)) stats.track(ev, f, i, S.lang); }; // a demo is never counted; neither is a Trending project (the counts table takes projects 0 to 5)
function renderStat() {
  kStat.hidden = DEMO || !(stats.available && S.onboarded && !stats.decided());
  kStatSet.hidden = DEMO || !stats.available;
  setT(kStatSet, stats.isOn() ? 'Usage counts: on' : 'Usage counts: off');
}
// The card hides itself when answered, so focus moves to the main button instead of falling to the page.
const afterStatChoice = (message: string) => { say(message); renderStat(); kAdd.focus({ preventScroll: true }); };
const countsOn = () => afterStatChoice(stats.turnOn(S.lang) ? 'Thanks. You can switch this off in Settings.' : "Couldn't switch it on in this browser.");
$('kStY').addEventListener('click', countsOn);
$('kStN').addEventListener('click', () => { stats.decline(); afterStatChoice('Okay. Nothing will be counted. You can change this in Settings.'); });
let armedAt = 0; // the first tap explains, a second tap within 8 seconds switches counting on
kStatSet.addEventListener('click', async () => {
  if (!stats.isOn()) {
    if (Date.now() - armedAt > 8000) {
      armedAt = Date.now();
      setT(kStatSet, 'Tap again to switch on (no names, see Privacy)');
      say('Counts what you do (opened, answered, shared), never your name or your words. Tap again to switch on.');
      window.setTimeout(renderStat, 8000);
      return;
    }
    armedAt = 0; countsOn(); return;
  }
  say((await stats.turnOff()) ? 'Usage counts are off. What was counted is deleted.' : "Counts are off. We couldn't reach the server to delete the earlier ones: they expire after 12 months.");
  renderStat();
});
// A round was just finished and the next one is not started: Home celebrates the Slash card first, and the pill and the Trail say the same.
const roundJustDone = () => { const b = base(), d = winDone(); return b > 0 && ![0, 1, 2].some((k) => d.has(k) || S.drafts[`${S.field}.${b + k}`]); };
// The word for a mission's state, the same on Home and in the Trail.
const stateWord = (done: boolean, next: boolean, draft: boolean) => (done ? 'Done' : next ? 'Up next' : draft ? 'Draft' : 'Not started');
// The field as a path, one segment per mission, the same on Home and on the done screen (app.css splits it into its two rounds). `mark` gets `cls`.
const pathOf = (f: string, mark: number, cls: string) => { const d = doneIn(f); return Array.from({ length: total(f) }, (_, i) => `<i class="${d.has(i) ? 'on' : ''}${i === mark ? ` ${cls}` : ''}"></i>`).join(''); };
// The three stages of the path: Make is the card above, Keep says what is on the page, Get found waits for FOUND_AT finished projects. Nothing here talks about money earned.
const finishedCount = () => new Set(S.answers.map((a) => `${a.f}.${a.i}`)).size;
const renderStages = () => {
  const n = finishedCount(), open = n >= FOUND_AT;
  if (n) setD($('kKeepN'), fill(n === 1 ? t2('1 project is on your page.', '1 progetto è nella tua pagina.') : t2('{n} projects are on your page.', '{n} progetti sono nella tua pagina.'), { n })); else setT($('kKeepN'), 'Nothing on your page yet.');
  $('kFound').classList.toggle('k-lockd', !open);
  setT($('kFoundS'), open ? 'Ready' : 'Locked');
  $('kFoundB').style.width = `${Math.min(100, (100 * n) / FOUND_AT)}%`;
  setD($('kFoundN'), open ? fill(t2('You have {n} finished projects. You are ready.', 'Hai {n} progetti finiti. Ci siamo.'), { n }) : fill(t2('Opens after {all} finished projects. You have {n}.', 'Si apre dopo {all} progetti finiti. Ne hai {n}.'), { n, all: FOUND_AT }));
};
// The Trending shelf (trending.ts): one card per project, a "Trending" tag on each, built here so the words follow the language. A tap opens the same project sheet as any other project.
// markTrend only changes the small state word (Done, Draft) in place, so a card that has focus keeps it.
let trendCards: { f: string; i: number; mins: number; st: HTMLElement }[] = [];
const renderTrend = () => {
  const el = (cls: string, text: string) => Object.assign(document.createElement('span'), { className: cls, textContent: text });
  trendCards = []; const cards: HTMLElement[] = [];
  for (const { f, i } of TRENDING) {
    const b = document.createElement('button'), m = FIELDS[f].m[i], chips = el('k-pj-c', ''), st = el('k-l', '');
    b.type = 'button'; b.className = 'k-proj';
    chips.append(el('k-l k-cat', tr(f)), st);
    b.append(el('k-lk', tr(TREND_SHELF.tag)), el('k-pj-t', tr(m[1])), el('k-pj-l', tr(m[2])), chips);
    b.addEventListener('click', () => openAnswer(f, i));
    trendCards.push({ f, i, mins: MX[f][i].mins, st }); cards.push(b);
  }
  $('kTrendL').replaceChildren(...cards); markTrend();
};
const markTrend = () => trendCards.forEach(({ f, i, mins, st }) => {
  const word = S.answers.some((a) => a.f === f && a.i === i) ? 'Done' : S.drafts[`${f}.${i}`] ? 'Draft' : '';
  st.textContent = `~${mins} min${word ? ` · ${tr(word)}` : ''}`; // the same short form as the rows of the list, then Done or Draft
});
const piecesUi = { render: () => {}, open: () => {} }; // the card on Projects and the list on Your page, and opening a piece: replaced by initPieces() once the screens are wired, below
const renderHome = () => {
  renderStat(); renderStages(); markTrend(); piecesUi.render();
  renderFields(); renderAbout(); renderFurther(); renderCoopIn();
  const f = F(), b = base(), round = b / PER_ROUND, done = winDone(), next = [0, 1, 2].find((k) => !done.has(k));
  // fresh: a round was just finished and the next one is not started. Celebrate the Slash card first, then offer the new missions.
  const fresh = roundJustDone();
  setD($('kHi'), S.name ? `${tr('Hi')} ${S.name}` : ''); $('kHi').hidden = !S.name; // no name is asked any more: no bare "Hi"
  setD($('kPathN'), tr(S.field)); // one path on Home: the category's name (Short videos, Posters and logos...)
  const glyph = next === undefined || fresh ? 'yourkern' : S.field, kNxIc = $('kNxIc');
  if (kNxIc.dataset.g !== glyph) { kNxIc.dataset.g = glyph; kNxIc.innerHTML = icon(glyph); }
  kAdd2.hidden = !fresh;
  if (next === undefined || fresh) {
    if (fresh) setD($('kNxL'), fill(t2('Round {n} complete', 'Round {n} completato'), { n: round }));
    else setD($('kNxL'), fill(t2('Your {n} projects are done', 'I tuoi {n} progetti sono fatti'), { n: total() }));
    setT($('kNxT'), 'Your Slash card is ready.');
    setT($('kNxP'), fresh ? 'See what your answers say about you, or keep going with 3 new projects.' : 'See what your answers say about you, and share it.');
    setT(kAdd, 'See your Slash card'); kAdd.dataset.kAns = 'card';
    if (fresh) { setD(kAdd2, fill(t2('Start round {n}', 'Inizia il round {n}'), { n: round + 1 })); kAdd2.dataset.kAns = String(b); }
  } else {
    const m = f.m[b + next];
    setT($('kNxL'), 'Your next step'); // where you are shows as the path below, not as "1 of 3"
    setT($('kNxT'), m[1]); setT($('kNxP'), m[2]);
    setT(kAdd, S.drafts[`${S.field}.${b + next}`] ? 'Continue your draft' : 'Start project'); kAdd.dataset.kAns = String(b + next);
  }
  const finished = next === undefined || fresh; // the card is about the Slash card now, so no time chip
  $('kNxPath').innerHTML = pathOf(S.field, finished ? -1 : b + (next ?? 0), 'nx');
  const mins = finished ? 0 : MX[S.field]?.[b + (next ?? 0)]?.mins;
  $('kNxM').innerHTML = mins ? `<span class="k-l">${aboutMins(mins)}</span>` : ''; // no price anywhere: nobody is paying yet
  // The list shows the round in play, or a look at the next one (never a lock: every round is open).
  const looking = peeking(), vb = viewBase(), vr = vb / PER_ROUND, vdone = new Set([0, 1, 2].filter((k) => doneSet().has(vb + k)));
  if (vr) setD($('kMsL'), fill(t2('Round {n} · your 3 projects', 'Round {n} · i tuoi 3 progetti'), { n: vr + 1 })); else setT($('kMsL'), 'Your 3 projects');
  const more = b + PER_ROUND < total(), peekBtn = $('kPeek');
  peekBtn.hidden = !more;
  if (more) setD(peekBtn, looking ? fill(t2('‹ Back to round {n}', '‹ Torna al round {n}'), { n: round + 1 }) : fill(t2('Round {n} · 3 more projects ›', 'Round {n} · altri 3 progetti ›'), { n: round + 2 }));
  const nb = boostOf(S.field), nbEl = $('kNxB');
  nbEl.hidden = !nb || finished;
  if (nb) setD(nbEl, `${boostTxt(nb.m)} · ${tr(f.m[nb.i][1])}`);
  [0, 1, 2].forEach((i) => {
    const a = vb + i, row = $('kMR' + i), isNext = !looking && i === next;
    const st = stateWord(vdone.has(i), isNext, !!S.drafts[`${S.field}.${a}`]);
    row.classList.toggle('done', vdone.has(i)); row.classList.toggle('next', isNext);
    setT(row.querySelector('b')!, f.m[a][1]);
    const bo = boostOf(S.field), isB = !!bo && bo.i === a;
    row.classList.toggle('boost', isB);
    const rm = MX[S.field]?.[a]?.mins;
    setD(row.querySelector('small')!, `${rm ? `~${rm} min · ` : ''}${tr(st)}${isCoop(S.field, a) ? ' · Co-op' : ''}${isB ? ' · ' + boostTxt(bo!.m) : ''}`);
  });
};

// The pill and the three steps of the Trail: the round in play and where each of its missions stands.
const renderSteps = () => {
  const b = base(), round = b / PER_ROUND, done = winDone(), n = done.size, next = [0, 1, 2].find((k) => !done.has(k));
  const justDone = roundJustDone(), tb = justDone ? b - PER_ROUND : b; // until the next round is started, the Trail shows the round that was just finished
  $('kPill').textContent = justDone ? fill(t2('Round {n} done', 'Round {n} fatto'), { n: round }) : round ? fill(t2('Round {n} · {k}/3', 'Round {n} · {k}/3'), { n: round + 1, k: n }) : fill(t2('{n} of 3 done', '{n} su 3 fatte'), { n });
  $('kRing').style.setProperty('--p', String(justDone ? 1 : n / 3));
  [0, 1, 2].forEach((i) => {
    setT($('kTr' + i), F().m[tb + i][1]);
    const st = $('kTr' + i).parentElement!, fin = justDone || done.has(i), now = !justDone && i === next;
    st.className = 'k-st' + (fin ? ' fin' : now ? ' now' : '');
    setT(st.querySelector('p')!, stateWord(fin, now, !!S.drafts[`${S.field}.${tb + i}`]));
  });
};
// Progress: pill, trail, answers list, signs, real stats from saved answers.
const renderProgress = () => {
  renderSteps();
  const kc = $('kTrK');
  const ready = doneSet().size >= PER_ROUND; // the Slash card unlocks with round 1 and sharpens with every round after
  kc.className = 'k-st' + (ready ? ' now' : '');
  setT(kc.querySelector('p')!, ready ? 'Ready to share' : 'Ready when your 3 projects are done');
  const box = $('kAns');
  box.innerHTML = '';
  if (!S.answers.length) { const p = document.createElement('p'); p.textContent = tr(t2('Nothing here yet. Finish a project and it lands on your page.', 'Qui non c’è ancora niente. Finisci un progetto e arriva nella tua pagina.')); box.appendChild(p); }
  S.answers.slice(-5).reverse().forEach((a, k) => {
    const idx = S.answers.length - 1 - k;
    const row = document.createElement('div'); row.className = 'k-an';
    const title = tr(FIELDS[a.f].m[a.i][1]);
    const l = document.createElement('span'); l.className = 'k-l';
    l.textContent = `${title} · ${day(a.at)}${a.r?.e ? ' · ' + tr(FEEL_EN[a.r.e]) : ''}`;
    const p = document.createElement('p'); p.textContent = a.t;
    const tagEl = a.ai ? Object.assign(document.createElement('span'), { className: 'k-ai-chip', textContent: tr(AI_TAG) }) : null; // made with AI help: never hidden
    const acts = document.createElement('div'); acts.className = 'k-an-act';
    // The same two words repeat on every row: the answer's title tells a screen reader which one it is (the visible word comes first)
    const ed = document.createElement('button'); ed.type = 'button'; ed.textContent = tr('Edit'); ed.setAttribute('aria-label', `${tr('Edit')}: ${title}`); ed.addEventListener('click', () => openEdit(idx));
    const del = document.createElement('button'); del.type = 'button'; del.textContent = tr('Delete'); del.setAttribute('aria-label', `${tr('Delete')}: ${title}`); del.addEventListener('click', once(() => deleteAnswer(idx)));
    acts.append(ed, del);
    row.append(l, ...(tagEl ? [tagEl] : []), p, acts); box.appendChild(row);
  });
  const signs = $('kSigns'), tips = S.answers.filter((a) => a.r?.tip);
  signs.innerHTML = '';
  $('kSignsC').hidden = !tips.length; // no empty box: the card shows once there is a tip of yours
  setT($('kSignsN'), user ? 'Shared without your name with the next people who do each project.' : CLOUD ? 'They stay on this device. With an account, they are shared without your name.' : 'They stay on this device.');
  tips.slice(-3).reverse().forEach((a) => {
    const d = document.createElement('div'); d.className = 'k-sign';
    const q = document.createElement('p'); q.textContent = `“${a.r!.tip}”`;
    const s = document.createElement('span'); s.className = 'k-l'; s.textContent = tr(FIELDS[a.f].m[a.i][1]);
    d.append(q, s); signs.appendChild(d);
  });
  $('kCnt').textContent = String(S.answers.length);
  const WEEK = 6048e5, now = Date.now();
  const weeks = [0, 1, 2, 3].map((w) => S.answers.some((a) => now - a.at >= w * WEEK && now - a.at < (w + 1) * WEEK));
  // Last 28 days as a grid (oldest first); a day lights up when you answered something on it.
  const midnight = (t: number) => new Date(t).setHours(0, 0, 0, 0);
  const made = new Set(S.answers.map((a) => midnight(a.at))), today = new Date(midnight(now));
  const cal = $('kDots'); cal.innerHTML = '';
  for (let k = 27; k >= 0; k--) {
    const d = new Date(today); d.setDate(today.getDate() - k);
    const c = document.createElement('i');
    if (made.has(d.getTime())) c.className = 'f';
    if (!k) c.classList.add('t');
    cal.appendChild(c);
  }
  const w = weeks.filter(Boolean).length;
  $('kRhy').textContent = fill(t2('{n} of the last 4 weeks you made something.', 'In {n} delle ultime 4 settimane hai creato qualcosa.'), { n: w });
  renderHome(); renderSignals(); renderBadges(); renderLoot(); renderCoops();
};

// Badges (Duolingo/Strava style): earned once, kept even if an answer is later deleted.
const WEEKNUM = (t: number) => Math.floor(t / 6048e5);
const BADGES: { id: string; t: string; d: string; ok: () => boolean }[] = [
  { id: 'first', t: 'First step', d: 'Your first answer', ok: () => S.answers.length > 0 },
  { id: 'reflect', t: 'Honest look', d: 'Your first reflection', ok: () => S.answers.some((a) => a.r) },
  { id: 'sign', t: 'Trail marker', d: 'Left a tip for the next person', ok: () => S.answers.some((a) => a.r?.tip) },
  { id: 'full', t: 'Full trail', d: 'All 3 projects in one field', ok: () => Object.keys(FIELDS).some((f) => { const d = doneIn(f); return [0, 1, 2].every((i) => d.has(i)); }) },
  { id: 'deep', t: 'Deep dive', d: 'Every project in one field', ok: () => Object.keys(FIELDS).some((f) => doneIn(f).size >= total(f)) },
  { id: 'twice', t: 'Do it twice', d: '3 versions of an idea with Slash', ok: () => S.mine.length >= 3 },
  { id: 'dare', t: 'Challenger', d: 'Dared a friend', ok: () => S.dared },
  { id: 'steady', t: 'Steady', d: 'Made something in 3 different weeks', ok: () => new Set(S.answers.map((a) => WEEKNUM(a.at))).size >= 3 },
  { id: 'habit7', t: 'Habit builder', d: '7 days of your tiny habit', ok: () => S.habit.l.length >= 7 },
  { id: 'explorer', t: 'Explorer', d: 'Answered in 2 different fields', ok: () => new Set(S.answers.map((a) => a.f)).size >= 2 },
];
let booted = false;
function renderBadges() {
  const box = $('kBadges'), fresh: string[] = [];
  box.innerHTML = '';
  BADGES.forEach((b) => {
    if (!S.badges.includes(b.id) && b.ok()) { S.badges.push(b.id); fresh.push(b.t); }
    const got = S.badges.includes(b.id);
    const el = document.createElement('div'); el.className = 'k-badge' + (got ? ' got' : '');
    el.setAttribute('role', 'img'); // a plain div's aria-label is not exposed; the label names the badge, what it asks for and whether it is yours yet
    el.setAttribute('aria-label', `${tr(b.t)}: ${tr(b.d)} (${tr(got ? 'earned' : 'locked')})`);
    const m = document.createElement('i'); m.textContent = tr(b.t)[0]; m.setAttribute('aria-hidden', 'true');
    const t = document.createElement('b'); t.textContent = tr(b.t);
    const d = document.createElement('small'); d.textContent = tr(b.d);
    el.append(m, t, d); box.appendChild(el);
  });
  if (!fresh.length) return;
  save();
}

// Delete with Undo; stones earned by that answer are taken back so nothing can be farmed.
// Deletes made while the Undo toast is up join one batch, and Undo brings them all back.
// Each delete leaves a tombstone so it also sticks on the user's other synced devices.
const worth = (a: Answer) => 50 + (a.r ? 20 : 0) + (a.x || 0);
let binned: Answer[] = [], binnedCoops: CoopRec[] = []; // answers just deleted (Undo puts them back) and the co-op rows that went with them
function deleteAnswer(idx: number) {
  const a = S.answers[idx]; if (!a) return;
  if (!toastAct) { binned = []; binnedCoops = []; }
  binned.push(a);
  S.answers.splice(idx, 1);
  const mineCoops = S.coops.filter((r) => r.role === 'out' && r.f === a.f && r.i === a.i && (r.at === a.at || r.mine.trim() === clip(a.t, MAX_ANSWER).trim())); // the answer, and with it what it sent and what came back
  binnedCoops.push(...mineCoops); S.coops = S.coops.filter((r) => !mineCoops.includes(r));
  unshareSign(a); // its sign leaves the trail too; Undo shares it again
  S.gone = [...S.gone, [akey(a), stamp(ver(a))] as Tomb].slice(-200);
  S.stones = Math.max(0, S.stones - worth(a)); save(); setLvl(); renderProgress();
  const n = binned.length;
  say(n > 1 ? tr('{n} answers deleted.').replace('{n}', String(n)) : 'Answer deleted.', () => {
    binned.forEach((b) => {
      const t = S.gone.find(([k]) => k === akey(b))?.[1] || 0;
      S.gone = S.gone.filter(([k]) => k !== akey(b));
      b.ed = stamp(Math.max(t, ver(b))); // newer than its tombstone, so the restore wins on every device
      const i = S.answers.findIndex((x) => x.at > b.at);
      S.answers.splice(i < 0 ? S.answers.length : i, 0, b); S.stones += worth(b);
      shareSign(b);
    });
    S.coops = [...S.coops, ...binnedCoops].sort((x, y) => x.at - y.at).slice(-30);
    binned = []; binnedCoops = []; save(); setLvl(); renderProgress();
  });
}

// Assistant chat (scripted: it only asks, never proposes the idea)
const chatEl = $('kChat'), inEl = $<HTMLInputElement>('kIn'), cmp = $('kCmp');
let busy = false, gen = 0; // gen: bumped by startChat, so a reply that was in flight when the chat restarted is dropped
// Distress words (English, Italian, German, French, Dutch and Swedish, with or without accents and curly apostrophes). The same line sits in netlify/functions/coach.mts: scripts/check-heavy.mjs fails npm test when they differ.
const HEAVY = /(kill(ing)? myself|kill me\b|suicid|self.?harm|hurt(ing)? myself|end (my life|it all)|take my (own )?life|hopeless|want(ed)? to die|wish i (was|were) (dead|gone)|better off dead|(no|any) reason to live|don['’]?t want to (live|be here|wake up)|cut(ting)? myself|voglio morire|vorrei morire|farla finita|mi (voglio |vorrei |devo )?(uccid|ammazz|impicc)|uccider(mi|e me)|ammazzar(mi|e me)|impiccar(mi|e me)|tagliarmi le vene|mi taglio le vene|togliermi la vita|togliermi di mezzo|farmi del male|mi faccio del male|autolesion|non (voglio|riesco) pi[uù]['’]? (a )?vivere|non voglio pi[uù]['’]? stare qui|meglio morto|meglio morta|non ce la faccio pi[uù]|senza speranza|non vedo (una )?via d['’]?uscita|vorrei sparire|voglio sparire|suizid|selbstmord|mich (um(zu)?bringen|(zu )?t[öo]ten)|bringe? mich um\b|mir das leben (zu )?nehmen|nicht mehr leben|(will|m[öo]chte) nicht mehr (hier|da) sein|nicht mehr aufwachen|(will|m[öo]chte) (lieber )?sterben|lieber tot|besser tot|ritze mich|mich (selbst )?ritzen|selbst ?verletz|verletze mich selbst|mir (selbst )?weh ?(zu ?)?tun|hoffnungslos|keinen ausweg|kein ausweg|ich kann (einfach )?nicht mehr(?! *[a-zäöüß])|(will|m[öo]chte) (einfach )?verschwinden|(veux|vais|voudrais|envie de|pense [àa]) me tuer|(veux|voudrais|envie de|pr[ée]f[ée]rerais) mourir|en finir avec (la|ma) vie|(veux|vais|envie d['’]) ?en finir|mettre fin [àa] (mes jours|ma vie)|me fai(re|s) du mal|automutil|scarifi|me pendre|(ouvrir|taillader|couper) les veines|(veux|peux) plus vivre|plus envie de vivre|(aucune|plus de|pas de) raison de vivre|sans espoir|en peux plus|(veux|voudrais|envie de) dispara[iî]tre|su[iï]cid|zelfmoord|zelfdoding|zelfbeschadig|m(ij|e)zelf (iets |wat )?aan ?(te )?doen|m(ij|e)zelf (te )?(doden|dood ?maken|om ?(te )?brengen|van kant (te )?maken|pijn (te )?doen|snijden|beschadigen)|doe m(ij|e)zelf pijn|snijd? (in )?m(ij|e)zelf|van het leven (te )?beroven|(wil|wou|zou willen) (gewoon |graag |liever )?dood(gaan)?\b|niet meer (willen )?leven\b|(wil|wou) er niet meer zijn|(wil|wou) niet meer bestaan|niet meer wakker (willen )?worden|eind(e)? (aan|maken aan) (mijn|m['’]?n) leven|er een eind(e)? aan (wil |willen )?maken|zie het (echt |gewoon |helemaal |allemaal )?niet meer zitten|hopeloos|uitzichtloos|geen uitweg|(beter|liever) dood\b|geen reden (meer )?om (nog )?te leven|ik kan (het )?(echt |gewoon )?niet meer(?! *[a-zà-ÿ])|kan het niet meer aan|(wil|wou) (gewoon |liever )?verdwijnen|självmord|ta (mitt (eget )?liv(?![a-zåäö])|livet av mig)|döda(r)? mig själv|vill (bara |helst )?dö(?![a-zåäö])|(vill|orkar) inte leva|vill inte finnas (längre|till|kvar)(?! *[a-zåäö])|orkar inte (mer|längre)(?! *[a-zåäö])|(skada|skadar) mig själv|självskad|skära mig|skär mig själv|jag skär mig(?! *[a-zåäö])|hopplös|ingen (anledning|mening) (med )?att leva|inget att leva för|(bättre|hellre) död(?![a-zåäö])|vill (bara )?försvinna|vill (aldrig|inte) vakna (upp )?(igen|mer)|ingen utväg|(avsluta|göra slut på|gör slut på) (mitt liv|livet|allt(?! *[a-zåäö])))/i;
const HEAVY_REPLY = "This sounds heavy, so I'm pausing the project. Please talk to someone you trust or a local helpline: in the UK and Ireland, Samaritans answer free, day or night, on 116 123. If you are in danger, call 112 (999 in the UK).";
const ASKED = /(give me|tell me|what should|write it for me|any ideas|dammi|dimmi|che idea|scrivilo tu|cosa dovrei|gib mir|sag mir|was soll ich|schreib du|hast du (eine )?idee|donne-moi|dis-moi|que dois-je|je dois faire quoi|[ée]cris-le|tu as une id[ée]e)/i;
const STUCK = /(stuck|don'?t know|do not know|no idea|not sure|blank|boh|non so|bloccat|nessuna idea|wei[ßs] nicht|keine ahnung|keine idee|komme nicht weiter|h[äa]nge fest|sais pas|aucune id[ée]e|bloqu[ée]|pas s[ûu]r)/i;
const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const Q_STUCK = [t2('Let us make it smaller. What is one sentence you could write in 30 seconds?', 'Facciamolo più piccolo. Qual è una frase che potresti scrivere in 30 secondi?'), t2('Forget good. What would the roughest version look like?', 'Dimentica il bello. Come sarebbe la versione più grezza?'), t2('Who is it for? Name one real person.', 'Per chi è? Fai il nome di una persona vera.')];
const Q_SMALL = [t2('What is the smallest part of it you could finish today?', 'Qual è la parte più piccola che potresti finire oggi?'), t2('If you only had 5 minutes, what would you do first?', 'Se avessi solo 5 minuti, cosa faresti per prima cosa?')];
const Q_MORE = [[t2('What would make that clearer for someone brand new?', 'Cosa lo renderebbe più chiaro per chi è nuovo?'), t2('If a friend read that, what would they ask first?', 'Se qualcuno lo leggesse, cosa chiederebbe per prima cosa?')], [t2('What is the strongest word in that, and what would you cut?', 'Qual è la parola più forte e cosa taglieresti?'), t2('What did you change from your first version, and why?', 'Cosa hai cambiato rispetto alla prima versione, e perché?')]];
// Echo the user's own opening words back, so the question is clearly about their idea.
const echo = (v: string) => { const w = v.split(/\s+/); return `“${w.slice(0, 6).join(' ')}${w.length > 6 ? '…' : ''}” `; };
let announced = '';
// A line as it reads now. The assistant's scripted lines are stored as English keys (with the person's own quoted words in front) and the chips they tapped too,
// so a language switch translates them; everything else the person typed stays as typed.
const chipKeys = [...document.querySelectorAll<HTMLElement>('#kEx span')].map((c) => c.dataset.en);
const said = (m: Msg) => (m.who === 'ai' ? (m.p ?? '') + tr(m.t) : chipKeys.includes(m.t) ? tr(m.t) : m.t);
// Slash's small face beside every assistant line (slash.ts). The bubble stays a plain <p class="k-msg k-ai">, so its text is set as before. Waiting for a reply is Slash speaking (a small bob and a blink) and no bubble yet:
// the words "Slash is typing" stay in the bubble for a screen reader (an aria-label on a paragraph is ignored), inside the live region the line sits in. A reply keeps Slash speaking a moment, then he goes still.
const TALK_MS = 2200;
const slashRow = (p: HTMLElement, mood: Mood = 'asking', speaking = false): HTMLElement => {
  const face = document.createElement('span'), row = document.createElement('div');
  face.className = 'k-slash-av'; face.innerHTML = slash(mood, speaking); row.className = 'k-say'; row.append(face, p);
  return row;
};
const waitingRow = () => {
  const p = document.createElement('p'); p.className = 'k-msg k-ai k-wait'; p.innerHTML = `<span class="k-sr">${tr('Slash is typing')}</span>`;
  return { row: slashRow(p, 'asking', true), p };
};
const unlight = (row: Element) => { window.setTimeout(() => row.querySelector('.k-slash')?.classList.remove('k-slash-speaking'), TALK_MS); };
// The assistant's pause for a heavy word is a fixed line, not a question: Slash keeps a plain, level face.
const pauseRow = (text: string) => { const p = document.createElement('p'); p.className = 'k-msg k-ai'; p.textContent = text; return slashRow(p, 'neutral'); };
let justSaid: Msg | null = null; // the reply that just arrived in the chat: Slash keeps speaking a moment
const renderChat = () => {
  stopSpeaking();
  const lastAi = [...S.msgs].reverse().find((m) => !m.typing);
  if (S.msgs.some((m) => m.typing)) { announced = ''; $('kSr').textContent = tr('Slash is typing'); } // the waiting is said once, the reply then replaces it
  else if (lastAi && lastAi.who === 'ai' && said(lastAi) !== announced) { announced = said(lastAi); $('kSr').textContent = announced; }
  chatEl.innerHTML = '';
  const intro = document.createElement('p'); intro.className = 'k-msg k-ai'; intro.textContent = tr(SLASH_INTRO);
  chatEl.appendChild(slashRow(intro));
  S.msgs.forEach((m) => {
    if (m.typing) { chatEl.appendChild(waitingRow().row); return; }
    const p = document.createElement('p'); p.className = 'k-msg ' + (m.who === 'me' ? 'k-me' : 'k-ai'); p.textContent = said(m);
    if (m.who === 'me') { chatEl.appendChild(p); return; }
    addListen(p, p.textContent);
    const lit = m === justSaid, row = slashRow(p, m.t === HEAVY_REPLY ? 'neutral' : 'asking', lit);
    if (lit) { justSaid = null; unlight(row); }
    chatEl.appendChild(row);
  });
  chatEl.scrollTop = chatEl.scrollHeight;
  inEl.placeholder = tr('Your idea, your words…');
  const show = S.mine.length >= 3 && !busy;
  cmp.hidden = !show;
  if (show) { $('kV1').textContent = S.mine[0]; $('kV3').textContent = S.mine[S.mine.length - 1]; }
};
const aiSay = (t: string, p?: string) => {
  S.msgs.push({ who: 'ai', t: '', typing: true }); renderChat();
  const g = gen;
  window.setTimeout(() => { if (g !== gen) return; S.msgs.pop(); justSaid = p ? { who: 'ai', t, p } : { who: 'ai', t }; S.msgs.push(justSaid); busy = false; save(); renderChat(); renderSignals(); renderBadges(); }, still ? 0 : 750);
};
const startChat = () => {
  gen++;
  S.msgs = [{ who: 'ai', t: OPEN }]; S.mine = []; busy = false; inEl.value = '';
  save(); renderChat();
};
// Live assistant: asks netlify/functions/coach.mts, which calls Claude with the rules "only ask, never answer".
// If there is no key, no network or any error, the scripted assistant below answers instead, so the chat always works.
let liveOk: boolean | null = null, liveWhy = '';
// Why the live assistant did not answer, from the server's error code: the line under the title says so, instead of a silent fall back to the scripted assistant.
const WHY: Record<string, string> = { no_key: 'You are talking to an AI · offline preview · no AI key on the server yet', key_rejected: 'You are talking to an AI · offline preview · the AI key on the server was rejected', upstream: 'You are talking to an AI · offline preview · the AI service is not reachable right now', rate: 'You are talking to an AI · offline preview · too many messages, try in a minute', rate_day: 'You are talking to an AI · offline preview · daily limit reached, try tomorrow' };
const setLive = (ok: boolean, why = '') => {
  if (liveOk === ok && liveWhy === why) return;
  liveOk = ok; liveWhy = why;
  setT($('kAiLbl'), ok ? 'You are talking to an AI · live replies' : WHY[why] ?? 'You are talking to an AI · offline preview');
};
let lastWhy = ''; // the error code of the last failed ask
// Opening the Slash tab checks that the live AI can answer before anyone types (again after 2 minutes), so a demo never starts on a silent fallback.
let pinged = 0;
function checkLive() {
  if (Date.now() - pinged < 120000) return;
  pinged = Date.now();
  void postCoach({ mode: 'ping' }).then((r) => setLive(r === 'live', lastWhy));
}
// One POST to the function, 10 s at most: its reply, or null (the error code in lastWhy).
async function postCoach(body: object): Promise<string | null> {
  const ctl = new AbortController(), to = window.setTimeout(() => ctl.abort(), 10000);
  try {
    const r = await fetch('/api/coach', { method: 'POST', headers: { 'content-type': 'application/json' }, signal: ctl.signal, body: JSON.stringify(body) });
    const j = await r.json().catch(() => null);
    if (!r.ok) { lastWhy = typeof j?.error === 'string' ? j.error : ''; return null; }
    lastWhy = '';
    return typeof j?.reply === 'string' && j.reply.trim() ? j.reply.trim() : null;
  } catch { lastWhy = ''; return null; } finally { clearTimeout(to); }
}
async function askAI(extra?: { mission?: { title: string; brief: string }; messages?: { who: string; t: string }[]; field?: string }): Promise<string | null> {
  // The demo asks the live assistant too (it is what is shown to people); the AI tab says so in the demo (#kAiDemo) and the function stores nothing.
  const reply = await postCoach({ lang: S.lang, field: extra?.field ?? (extra?.mission ? cur.f : S.field), versions: extra ? 0 : S.mine.length, mission: extra?.mission, messages: extra?.messages ?? S.msgs.filter((m) => !m.typing).slice(-12).map((m) => ({ who: m.who, t: said(m) })) });
  return reply && reply.slice(0, 500);
}
const scripted = (v: string) => {
  if (ASKED.test(v)) return aiSay("I won't hand you the idea. What is the first thing that comes to mind, even if it's rough?");
  if (STUCK.test(v)) return aiSay(pick(Q_STUCK));
  S.mine.push(v);
  if (S.mine.length < 3) return aiSay(pick([F().qs[S.mine.length - 1], ...Q_MORE[S.mine.length - 1]]), echo(v));
  if (S.mine.length === 3) return aiSay('You wrote it 3 times and each version changed. That is your evidence. Compare the first and the last.');
  aiSay(t2('Save it to your page, or start over with a new idea.', 'Salvala nella tua pagina, oppure ricomincia con una nuova idea.'));
};
const sendChat = () => {
  const v = inEl.value.trim(); if (!v || busy) return;
  inEl.value = ''; S.msgs.push({ who: 'me', t: v }); busy = true; renderChat();
  if (HEAVY.test(v)) return aiSay(HEAVY_REPLY);
  S.msgs.push({ who: 'ai', t: '', typing: true }); renderChat();
  const g = gen;
  askAI().then((reply) => {
    if (g !== gen) return;
    S.msgs = S.msgs.filter((m) => !m.typing);
    if (!reply) { setLive(false, lastWhy); scripted(v); return; }
    setLive(true);
    if (!ASKED.test(v) && !STUCK.test(v)) S.mine.push(v); // versions still count the same way
    justSaid = { who: 'ai', t: reply }; S.msgs.push(justSaid); busy = false; save(); renderChat(); renderSignals(); renderBadges();
  });
};
$('kSend').addEventListener('click', sendChat);
inEl.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.isComposing && e.keyCode !== 229) { e.preventDefault(); sendChat(); } }); // the Enter that confirms an IME word (Japanese, Chinese, Korean) is not "send"; Safari reports it as keyCode 229
document.querySelectorAll<HTMLElement>('#kEx span').forEach((c, i) => {
  const go = () => {
    if (i === 1) return startChat();
    if (i >= 2) { if (busy) return; S.msgs.push({ who: 'me', t: c.dataset.en || '' }); busy = true; renderChat(); return aiSay(pick(i === 2 ? Q_STUCK : Q_SMALL)); }
    inEl.value = tr(F().idea).replace(/^[^:]+:\s*/, ''); inEl.focus(); };
  c.addEventListener('click', go);
  c.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
});
$('kSaveV').addEventListener('click', () => { S.saves++; say(save() ? t2('Saved to your page. Every version counts as evidence.', 'Salvato nella tua pagina. Ogni versione conta come prova.') : UNSAVED); });
$('kToAi').addEventListener('click', () => goTab('copilot'));
// Helplines any time (Settings and Slash): the pause text with the checked numbers, minus its first sentence ("...so I'm pausing the project";
// check-heavy.mjs keeps the numbers out of it). It is in the app itself, so it works offline; setLang refills it.
const helpText = () => document.querySelectorAll<HTMLElement>('[data-k-help]').forEach((b) => setD($(b.getAttribute('aria-controls')!), tr(HEAVY_REPLY).replace(/^[^.]*\.\s*/, '')));
document.querySelectorAll<HTMLElement>('[data-k-help]').forEach((b) => b.addEventListener('click', () => {
  const t = $(b.getAttribute('aria-controls')!);
  t.hidden = !t.hidden; b.setAttribute('aria-expanded', String(!t.hidden));
  if (!t.hidden) reveal(t);
}));

// Field: trail titles, progress, chat.
const applyField = (resetChat: boolean) => {
  if (resetChat || !S.msgs.length) startChat(); else renderChat();
  renderProgress();
};

// Answer sheet: step 1 answer (draft autosaved), step 2 quick reflection.
const kTa = $<HTMLTextAreaElement>('kTa'), kShA = $('kShA'), kShR = $('kShR');
let cur: { f: string; i: number; dare: boolean; edit: number } = { f: 'Design', i: 0, dare: false, edit: -1 };
let lastAns: Answer | null = null, dT = 0; // lastAns: the answer being reflected on
let lastBoost: { i: number; m: number } | null = null; // the daily boost as promised on screen, read before the answer moves the round (boostOf depends on progress)
const dKey = () => `${cur.f}.${cur.i}`;
function flushDraft() {
  clearTimeout(dT);
  if (kShA.hidden || cur.edit >= 0) return; // edits are not drafts
  const v = kTa.value.trim() ? kTa.value.slice(0, 2000) : '';
  if (v) S.drafts[dKey()] = v; else delete S.drafts[dKey()];
  save(); renderHome(); renderSteps(); // a first draft in the next round ends the "just finished" moment on the pill and the Trail too
  const note = !v ? NOTE_DEFAULT : saveFailed ? "Couldn't save on this device" : 'Draft saved on this device';
  // The browser cuts a longer paste or stops the typing at the limit without a word: say so, so the end of the text is not lost unseen.
  if (kTa.value.length >= kTa.maxLength) setD(kSaved, `${tr(note)} · ${tr('Limit reached: {n} characters.').replace('{n}', String(kTa.maxLength))}`); else setT(kSaved, note);
  kSaved.hidden = false;
}
kTa.addEventListener('input', () => { clearTimeout(dT); dT = window.setTimeout(flushDraft, 500); renderProg(); runHold(); });
// Signs on the trail: the tip each person leaves after a mission is shown, without a name, to the next
// people who open it (cloud.ts, table kern_signs). No account, no sharing: the tip stays on the device.
const shareable = (t: string) => t.trim().length >= 3 && !/(https?:\/\/|www\.|@|\d{6,})/i.test(t);
const sharing = new WeakSet<Answer>(); // uploads in flight: a quick delete + Undo must not publish the sign twice
function shareSign(a: Answer) {
  const tip = a.r?.tip;
  if (!user || !tip || a.i >= TREND_FROM || a.r?.sid || sharing.has(a) || !shareable(tip)) return; // the database takes tips on projects 0 to 5 only
  sharing.add(a);
  cloud.addSign(a.f, a.i, tip).then((id) => {
    sharing.delete(a);
    if (!S.answers.includes(a)) { cloud.removeSign(id).catch(() => { /* row has no name */ }); return; } // deleted meanwhile
    if (a.r && id > 0) { a.r.sid = id; save(); }
  }).catch(() => { sharing.delete(a); /* stays on this device */ });
}
const pend = (): number[] => { try { const v = JSON.parse(localStorage.getItem(PEND) || '[]'); return Array.isArray(v) ? v.filter((n) => Number.isSafeInteger(n) && n > 0).slice(0, 50) : []; } catch { return []; } };
const setPend = (l: number[]) => { try { localStorage.setItem(PEND, JSON.stringify(l.slice(0, 50))); } catch { /* storage blocked */ } };
const flushSigns = () => { if (!user) return; for (const id of pend()) cloud.removeSign(id).then(() => setPend(pend().filter((x) => x !== id))).catch(() => { /* retried on the next sign-in or when back online */ }); };
function unshareSign(a: Answer) {
  const id = a.r?.sid; if (!id) return; // still uploading: shareSign removes it on arrival if the answer is gone
  delete a.r!.sid;
  setPend([...pend(), id]); flushSigns();
}
const kShS = $('kShS'), kShSB = $('kShSB');
let signReq = 0;
// Tips from people who finished the mission before: the box stays hidden until there is a real one (an empty box only says nobody is here).
const renderTrailSigns = (f: string, i: number) => {
  const req = ++signReq;
  kShSB.hidden = true; kShS.replaceChildren();
  if (!CLOUD || i >= TREND_FROM) return;
  cloud.signs(f, i).then((list) => {
    if (req !== signReq) return;
    const ok = list.filter((s) => shareable(s.tip));
    kShS.replaceChildren(...ok.map((s) => {
      const d = document.createElement('div'), q = document.createElement('p'), w = document.createElement('span');
      d.className = 'k-sign'; q.textContent = `“${s.tip}”`; w.className = 'k-l';
      setD(w, `${tr('Someone who finished it')} · ${day(Date.parse(s.at) || Date.now())}`);
      d.append(q, w); return d;
    }));
    kShSB.hidden = !ok.length;
  }).catch(() => { /* tips are optional: when they cannot load, the box simply stays hidden */ });
};
// Where a tip goes, said plainly under the tip box: shared without a name only with an account, otherwise it stays on this device.
const setRfNote = () => setT($('kRfN'), user ? 'Shared without your name with the next people who do this project.'
  : CLOUD ? 'Stays on this device. Log in to share it, without your name, with the next people who do this project.'
  : 'Stays on this device.');
// Practice brief (missions.ts): scenario, material to work on, tick-off steps with a progress bar
// (none ticked for you), and after submitting a self-check.
const NOTE_DEFAULT = 'It stays on this device unless you ask Slash.';
const kShX = $('kShX'), kShH = $('kShH'), kShP = $('kShP'), kSaved = $('kSaved'), kXSteps = $('kXSteps'), kRfBar = $('kRfBar'), kRfBI = $('kRfBI');
const setX = (el: Element, en: string) => { (el as HTMLElement).dataset.en = en; el.textContent = tr(en); }; // textContent: briefs contain code like <button>
const tick = (host: HTMLElement, en: string, on: boolean, cls: string, change?: () => void) => {
  const d = document.createElement('div');
  d.className = `k-tk ${cls}`; d.tabIndex = 0; d.setAttribute('role', 'checkbox');
  const paint = () => d.setAttribute('aria-checked', String(d.classList.contains('on')));
  d.classList.toggle('on', on); paint(); setX(d, en);
  const flip = () => { d.classList.toggle('on'); paint(); change?.(); };
  d.addEventListener('click', flip);
  d.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
  host.appendChild(d);
};
const stepProg = () => {
  const all = kXSteps.children.length, n = kXSteps.querySelectorAll('.on').length;
  $('kXPb').style.width = `${(100 * n) / all}%`; setD($('kXPn'), `${n}/${all}`);
};
// The mission as shown now: the easy wording when "Make it easier" is on, else the full one. Missing easy parts fall back to the full ones.
const variant = (f: string, i: number) => {
  const x = MX[f]?.[i]; if (!x) return null;
  const hp = HELPS[f]?.[i], ez = S.easy ? EASY[f]?.[i] : undefined;
  return { x, brief: ez?.brief ?? x.brief, steps: ez?.steps ?? x.steps, asset: ez?.asset ?? x.asset, ex: ez?.ex ?? hp?.ex ?? '', hints: ez?.hints ?? hp?.hints ?? [], answer: ez?.answer ?? x.answer };
};
// The mission picture in the current language (some pictures carry words), with the asset text as its description.
const setPic = () => {
  const im = $<HTMLImageElement>('kXAI'); if (im.hidden) return;
  const src = (S.lang === 'it' ? im.dataset.it : im.dataset.en) || ''; // the Italian picture only in Italian, the English one everywhere else
  if (im.getAttribute('src') !== src) im.src = src;
  im.alt = tr(im.dataset.alt || '').replace(/\n/g, '. ');
};
function renderBrief(f: string, i: number) {
  const v = variant(f, i), x = v?.x;
  kShX.hidden = kShH.hidden = kShP.hidden = kRfBar.hidden = !v;
  kXSteps.innerHTML = ''; kRfBI.innerHTML = '';
  if (!v || !x) return;
  setX($('kXWho'), x.who); setD($('kXMin'), aboutMins(x.mins));
  const who = $('kXWho'), sp = SPONSORS[`${f}.${i}`]; // a brand mission shows who presents it, in their colour (sponsors.ts)
  who.classList.toggle('brand', !!sp);
  if (sp) { setD(who, `${tr('Brand project')} · ${tr(sp.name)}`); who.style.setProperty('--brand', sp.color); } else who.style.removeProperty('--brand');
  const bo = boostOf(f), bEl = $('kXBoost');
  bEl.hidden = !(bo && bo.i === i && cur.edit < 0);
  if (!bEl.hidden) setD(bEl, `${boostTxt(bo!.m)} · ${tr('stones multiplied')}`);
  setX($('kXBrief'), v.brief); setX($('kLen'), v.answer || '2–3 lines is enough.'); // under the answer box: exactly what to write
  // A visual asset (a photo, a story, a cover) shows as the picture itself. With `only` the text is just its description for a screen reader.
  const pic = x.asset.img, kXAI = $<HTMLImageElement>('kXAI');
  setX($('kXAT'), pic && x.asset.only ? x.asset.title : v.asset.title); setX($('kXAB'), v.asset.body); $('kXAB').classList.toggle('mono', v.asset.mono);
  $('kXAB').hidden = !!(pic && x.asset.only);
  kXAI.hidden = !pic; kXAI.dataset.en = pic ?? ''; kXAI.dataset.it = x.asset.imgIt ?? pic ?? ''; kXAI.dataset.alt = x.asset.body; setPic();
  // A real clip (public/media) plays with its own controls above the text, which keeps the seconds. #t=0.1 makes phones show the first frame, not black.
  const clip = x.asset.video, kXAV = $<HTMLVideoElement>('kXAV');
  kXAV.pause(); kXAV.hidden = $('kXAVC').hidden = !clip; kXAV.setAttribute('aria-label', tr(x.asset.title)); // the clip says it is made with AI (design/mission-media.md)
  if (clip && kXAV.dataset.src !== clip) { kXAV.dataset.src = clip; kXAV.src = `${clip}#t=0.1`; }
  v.steps.forEach((s) => tick(kXSteps, s, cur.edit >= 0, 'st', stepProg)); // an answer being edited is a finished one: its steps show as done
  stepProg();
  x.bar.forEach((b) => tick(kRfBI, b, false, 'bar', barProg)); // after Submit: does yours do what a strong answer does? Self-ticked, never graded
  barProg();
  $('kBrandNote').hidden = !sp; // a brand mission says its rules before the answer box
  if (sp) { setD($('kBrandFrom'), fill(t2('From {b}.', 'Da {b}.'), { b: tr(sp.name) })); $('kBrandNote').style.setProperty('--brand', sp.color); }
  // Do it here: tap or drag instead of typing (play.ts). Not while editing a saved answer, the picks would rewrite it.
  const pl = PLAY[`${f}.${i}`];
  playGen = ''; $('kPlay').hidden = !pl || cur.edit >= 0 || v.asset !== x.asset; // an easy version with its own material: the taps would not match it
  if (pl && cur.edit < 0) renderPlay($('kPlayB'), pl, tr, playWrite); else $('kPlayB').innerHTML = '';
  // Hints, Slash and the easy switch. The strong answer waits until the person has written theirs: it shows after Submit, to compare (kCmp).
  hintN = 0; runTold = false; $('kXHints').innerHTML = '';
  setX($('kXExT'), v.ex);
  setT($('kXHint'), 'Need a hint?'); hold($('kXHint'), !v.hints.length);
  setT($('kXEasy'), S.easy ? 'Back to the full version' : 'Make it easier');
  $('kXEasy').hidden = !EASY[f]?.[i]; // a Trending project has no easier version (trending.ts)
  $('kXHard').hidden = !twistOf(f, i); showHarder(false);
  hold($('kXAsk'), false);
}
// The harder take every mission already has (its twist), shown under the buttons before starting, not only after finishing.
const twistOf = (f: string, i: number) => { const tw = MX[f]?.[i]?.twist; return tw ? tr(tw).replace(/^(bonus|extra)\s*:\s*/i, '') : ''; }; // some twists start with "Bonus:"
const showHarder = (open: boolean) => {
  const t = $('kXHardT'), b = $('kXHard');
  t.hidden = !open; b.setAttribute('aria-expanded', String(open));
  setT(b, open ? 'Hide the harder take' : 'Make it harder');
  if (open) { setD(t, `${tr('Harder take:')} ${twistOf(cur.f, cur.i)}`); reveal(t); }
};
$('kXHard').addEventListener('click', () => showHarder($('kXHardT').hidden));
// Time on a mission is a soft estimate, said so nobody feels slow.
const aboutMins = (n: number) => fill(t2('about {n} min, no rush', 'circa {n} min, con calma'), { n });
let hintN = 0;
// The picks own the first lines of the answer; whatever the person typed after them stays.
// ponytail: if they edit inside the picked lines, the next pick starts a new block above their text instead of merging.
let playGen = '';
const playWrite = (gen: string) => {
  const v = kTa.value;
  const rest = playGen && v.startsWith(playGen) ? v.slice(playGen.length) : v.trim() ? `\n${v}` : '';
  playGen = gen; kTa.value = gen + (gen ? rest : rest.replace(/^\n/, ''));
  kTa.dispatchEvent(new Event('input'));
};
const barsHit = () => kRfBI.querySelectorAll('.bar.on').length, barsAll = () => kRfBI.querySelectorAll('.bar').length;
function barProg() {
  const n = barsHit(), all = barsAll();
  setD($('kRfBN'), !n ? '' : n < all ? fill(t2('{n} of {all}', '{n} su {all}'), { n, all }) : tr(t2('All three. That is a strong answer.', 'Tutti e tre. È una risposta forte.')));
}
// Busy or spent buttons are dimmed but stay focusable: a disabled button drops keyboard focus to the page body.
const hold = (b: Element, on: boolean) => b.setAttribute('aria-disabled', String(on));
const held = (b: Element) => b.getAttribute('aria-disabled') === 'true';
const nextHint = () => {
  const v = variant(cur.f, cur.i); if (!v || hintN >= v.hints.length) return;
  const p = document.createElement('p'); p.className = 'k-msg k-ai'; setX(p, v.hints[hintN]); $('kXHints').appendChild(p); reveal(p);
  hintN++;
  const b = $('kXHint');
  if (hintN >= v.hints.length) { setT(b, 'No more hints'); hold(b, true); } else setD(b, `${tr('Another hint')} (${hintN}/${v.hints.length})`);
};
$('kXHint').addEventListener('click', nextHint);
$('kXEasy').addEventListener('click', () => { S.easy = !S.easy; save(); renderBrief(cur.f, cur.i); });
// Slash inside the task: reads the mission and what you have written so far, and asks one question. Live when online;
// offline it falls back to a question about your own words, or the "stuck" question of the Slash tab. Hints stay on their own button.
$('kXAsk').addEventListener('click', async () => {
  const btn = $('kXAsk'), v = variant(cur.f, cur.i);
  if (held(btn) || !v) return;
  hold(btn, true);
  track('ask_ai', cur.f, cur.i);
  const draft = kTa.value.trim().slice(0, 400);
  if (HEAVY.test(draft)) { // heavy words in the draft: nothing is sent or echoed, the mission pauses
    const m = pauseRow(tr(HEAVY_REPLY)); $('kXHints').appendChild(m); reveal(m); hold(btn, false); return;
  }
  const { row, p } = waitingRow();
  $('kXHints').appendChild(row); reveal(row);
  const f0 = cur.f, i0 = cur.i;
  const reply = await askAI({ mission: { title: FIELDS[cur.f].m[cur.i][1], brief: v.brief }, messages: [{ who: 'me', t: draft ? `My answer so far: ${draft}` : 'I am about to start this mission. Help me begin.' }] });
  if (cur.f !== f0 || cur.i !== i0 || kSheet.hidden) return; // another mission was opened meanwhile
  p.classList.remove('k-wait'); p.textContent = '';
  setLive(!!reply, lastWhy);
  if (reply) p.textContent = reply;
  else p.textContent = draft.length >= 10 ? echo(draft) + tr(pick(Q_MORE[0])) : tr(pick(Q_STUCK)); // never a button that does nothing, and never a hint in disguise
  addListen(p, p.textContent);
  reveal(row); unlight(row);
  if (runsPrompt(cur.f, cur.i) && draft.length >= RUN_MIN && !runTold) { // once a prompt is written, Slash points at the button that runs it, once per sheet
    runTold = true;
    const t = document.createElement('p'); t.className = 'k-msg k-ai'; setX(t, RUN_TIP); const tipRow = slashRow(t); $('kXHints').appendChild(tipRow); reveal(tipRow);
  }
  hold(btn, false);
});
// Try your prompt (Prompting missions): only the prompt in the answer box goes to the AI (coach.mts, mode 'run'), on a tap, 5 tries per mission a day.
// It never changes the answer and never counts as Submit.
const kRun = $('kRun'), kRunB = $('kRunB'), kRunO = $('kRunO'), kRunT = $('kRunT');
const RUN_MIN = 20, RUN_MAX = 1500, RUN_DAY = 5;
const runsPrompt = (f: string, i: number) => f === 'Prompting' && i < TREND_FROM; // the Trending AI-character project is a design, not a prompt to run
const RUN_TIP = t2('When your prompt is ready, tap Try your prompt on the AI under your answer.', 'Quando il prompt è pronto, tocca Prova il prompt con l’AI sotto la tua risposta.');
const RUN_LBL = t2('Try your prompt on the AI', 'Prova il prompt con l’AI');
let runTold = false;
const runHold = () => hold(kRunB, kTa.value.trim().length < RUN_MIN);
const runsToday = (): Record<string, number> => { try { const v = JSON.parse(localStorage.getItem(RUNS) || '{}'); return v?.d === new Date().toDateString() && v.n && typeof v.n === 'object' ? v.n : {}; } catch { return {}; } };
const countRun = (k: string) => { const n = runsToday(); try { localStorage.setItem(RUNS, JSON.stringify({ d: new Date().toDateString(), n: { ...n, [k]: (n[k] || 0) + 1 } })); } catch { /* storage blocked: no daily count */ } };
const runShow = (text: string) => { kRunT.textContent = text; kRunO.hidden = false; reveal(kRunO); }; // plain text, never HTML: it is the model's reply
kRunB.addEventListener('click', async () => {
  const prompt = kTa.value.trim(), k = dKey();
  if (held(kRunB) || prompt.length < RUN_MIN) return;
  if (prompt.length > RUN_MAX) return runShow(tr(t2('Keep your prompt under 1500 characters to try it here.', 'Per provarlo qui, tieni il prompt sotto i 1500 caratteri.')));
  if (HEAVY.test(prompt)) return runShow(tr(HEAVY_REPLY)); // heavy words: nothing is sent, the mission pauses (as Ask Slash does)
  if ((runsToday()[k] || 0) >= RUN_DAY) return runShow(tr(t2('That is 5 tries for this project today. Paste your prompt into any AI to keep going.', 'Oggi hai fatto 5 prove in questo progetto. Per continuare, incolla il prompt in un’AI qualsiasi.')));
  countRun(k); hold(kRunB, true); setT(kRunB, t2('Asking the AI…', 'Lo chiedo all’AI…'));
  const reply = await postCoach({ mode: 'run', lang: S.lang, field: 'Prompting', prompt });
  if (dKey() !== k || kSheet.hidden) return; // another mission was opened meanwhile
  setT(kRunB, RUN_LBL); runHold();
  runShow(reply ?? tr(t2("The AI isn't reachable right now. Paste your prompt into any AI instead.", 'Ora l’AI non risponde. Incolla il prompt in un’AI qualsiasi.')));
});
// Self-check after submitting: +10 per quality bar met, +25 for the twist. Returns the bonus (not saved here).
const bonus = () => {
  const b = kRfBar.hidden ? 0 : kRfBI.querySelectorAll('.bar.on').length * 10 + kRfBI.querySelectorAll('.tw.on').length * 25;
  S.stones += b; return b;
};
// Habit loop (Hooked: trigger, action, variable reward, investment). The reward is a random drop after each finished
// mission (loot.ts), the investment is the collection of finds and the trail days; nothing here punishes a missed day.
const DAY = 864e5, dayN = (t: number) => Math.floor((t - new Date(t).getTimezoneOffset() * 6e4) / DAY);
const relicsOwned = () => RELICS.filter((r) => S.answers.some((a) => a.d === r.id) || S.habit.l.some((e) => e[1] === r.id)).map((r) => r.id);
const dropStreak = () => { let n = 0; for (const a of [...S.answers].sort((x, y) => y.at - x.at)) { if (a.d) break; n++; } return n; };
// Trail days: days in a row with a finished mission or a habit check-in. One missed day is forgiven (a rest day); two in a row end it.
const streakOf = (list: number[]) => {
  const days = [...new Set(list)].sort((a, b) => b - a);
  if (!days.length || dayN(Date.now()) - days[0] > 2) return 0;
  let n = 1;
  for (let i = 1; i < days.length && days[i - 1] - days[i] <= 2; i++) n++;
  return n;
};
const trailDays = () => streakOf([...S.answers.map((a) => dayN(a.at)), ...S.habit.l.map((e) => e[0])]);
const BOOSTS = false; // cut with the points: no daily x2 / x3 on a mission
// Daily boost: each day, each field gets a random answer (about 2 days in 3) that pays x2 or x3. Seeded by the date, so it is the
// same on every device but cannot be guessed ahead; done missions can be replayed for it.
const boostOf = (f: string, d = dayN(Date.now())): { i: number; m: number } | null => {
  if (!BOOSTS) return null;
  let h = Math.imul(d ^ [...f].reduce((a, c) => (Math.imul(a, 31) + c.charCodeAt(0)) | 0, 7), 2654435761) >>> 0;
  h ^= h >>> 15; h = Math.imul(h, 2246822519) >>> 0; h ^= h >>> 13;
  return h % 100 < 35 ? null : { i: base(f) + (h >>> 8) % PER_ROUND, m: (h >>> 16) % 10 < 3 ? 3 : 2 }; // always inside the round in play, so it is on screen
};
const boostTxt = (m: number) => `×${m} ${tr('today')}`;
const kFinds = $('kFinds');
const ICON = (d: string) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;
function renderLoot() {
  const own = relicsOwned();
  setD($('kFN'), `${own.length}/${RELICS.length}`);
  kFinds.innerHTML = '';
  RELICS.forEach((r) => {
    const got = own.includes(r.id), el = document.createElement('div'), b = document.createElement('b');
    el.className = 'k-find' + (got ? ' got' : '');
    el.setAttribute('role', 'img'); el.setAttribute('aria-label', got ? tr(r.name) : tr('Not found yet'));
    el.innerHTML = got ? ICON(r.d) : '<span aria-hidden="true">?</span>';
    b.textContent = got ? tr(r.name) : '';
    el.appendChild(b); kFinds.appendChild(el);
  });
  const n = trailDays(), st = $('kStreak');
  st.hidden = !n;
  if (n) setD($('kStreakT'), `${n} ${tr(n === 1 ? 'trail day' : 'trail days')}`);
  renderHabit();
}

// Tiny habits (BJ Fogg): one very small action tied to a cue you already have ("after I have my coffee, I write one sentence").
// A check-in counts as a trail day and sometimes (about 1 in 3) turns up a find, so the reward stays unpredictable.
const STARTERS: Record<string, string[]> = {
  Design: [t2('Sketch one screen for 2 minutes', 'Schizza una schermata per 2 minuti'), t2('Note why one app screen works', 'Annota perché funziona una schermata di un’app')],
  Writing: [t2('Write one sentence', 'Scrivi una frase'), t2('Rewrite one confusing message', 'Riscrivi un messaggio confuso')],
  Code: [t2('Write or fix 5 lines of code', 'Scrivi o correggi 5 righe di codice'), t2('Read one small piece of code', 'Leggi un piccolo pezzo di codice')],
  Video: [t2('Film 5 seconds of something', 'Filma 5 secondi di qualcosa'), t2('Note the first shot of one video', 'Annota la prima inquadratura di un video')],
  Selling: [t2('Ask one person what they need', 'Chiedi a una persona di cosa ha bisogno'), t2('Rewrite one pitch in one line', 'Riscrivi una proposta in una riga')],
  Music: [t2('Hum or tap a rhythm for 30 seconds', 'Canticchia o batti un ritmo per 30 secondi'), t2('Name one instrument in a song', 'Nomina uno strumento in una canzone')],
  Prompting: [t2('Add one detail to a prompt you used', 'Aggiungi un dettaglio a un prompt che hai usato'), t2('Ask an AI what it is unsure about', 'Chiedi a un’AI di cosa non è sicura')],
};
const CUES = [t2('wake up', 'mi sveglio'), t2('have my coffee', 'bevo il caffè'), t2('finish lunch', 'finisco di pranzare'), t2('get home', 'torno a casa'), t2('brush my teeth', 'mi lavo i denti')];
// A habit or cue picked from the chips is saved as the words on the chip at that moment (in any language): show it in the current language. Words typed by hand stay as typed.
const HB_EN = new Map([...Object.values(STARTERS).flat(), ...CUES].flatMap((en) => [en, IT[en], DE[en], FR[en], NL[en], SV[en]].filter((t): t is string => !!t).map((t): [string, string] => [t, en])));
const hbText = (s: string) => tr(HB_EN.get(s) ?? s);
const HB_MSG = [t2('That counts. Small is the point.', 'Conta. Il bello è essere piccoli.'), t2('Done. Your future self noticed.', 'Fatto. Il tuo io futuro se n’è accorto.'), t2('Again tomorrow, same cue. That is the whole trick.', 'Di nuovo domani, stesso segnale. È tutto qui il trucco.'), t2('Easy on purpose. Keep it that way.', 'Facile di proposito. Resta così.'), t2('One more day on the trail.', 'Un altro giorno sulla traccia.')];
const kHbSet = $('kHbSet'), kHbRun = $('kHbRun'), kHbT = $<HTMLInputElement>('kHbT'), kHbC = $<HTMLInputElement>('kHbC');
const chip = (host: Element, text: string, on: () => void) => {
  const c = document.createElement('span'); c.setAttribute('role', 'button'); c.tabIndex = 0; c.textContent = tr(text);
  c.addEventListener('click', on); c.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); on(); } });
  host.appendChild(c);
};
let hbEditing = false;
function renderHabit() {
  const has = !!S.habit.t && !hbEditing;
  kHbSet.hidden = has; kHbRun.hidden = !has;
  if (!has) {
    const pick = $('kHbPick'), cues = $('kHbCues'); pick.innerHTML = ''; cues.innerHTML = '';
    (STARTERS[S.field] || STARTERS.Writing).forEach((t) => chip(pick, t, () => { kHbT.value = tr(t); }));
    CUES.forEach((c) => chip(cues, c, () => { kHbC.value = tr(c); }));
    return;
  }
  setD($('kHbName'), hbText(S.habit.t));
  setD($('kHbCue'), S.habit.c ? `${tr('After I')} ${hbText(S.habit.c)}` : tr('Pick a cue you already have.'));
  const today = dayN(Date.now()), done = new Set(S.habit.l.map((e) => e[0])), dots = $('kHbDots');
  dots.innerHTML = '';
  for (let i = 6; i >= 0; i--) {
    const d = document.createElement('i'), day = today - i;
    d.className = (done.has(day) ? 'on' : '') + (i === 0 ? ' now' : '');
    d.setAttribute('role', 'img'); d.setAttribute('aria-label', `${new Date(day * DAY + 12 * 36e5).toLocaleDateString(LOCALE[S.lang], { weekday: 'long', timeZone: 'UTC' })}: ${done.has(day) ? tr('done') : tr('not yet')}`);
    dots.appendChild(d);
  }
  const doneToday = done.has(today), btn = $<HTMLButtonElement>('kHbDo');
  btn.setAttribute('aria-disabled', String(doneToday)); setT(btn, doneToday ? 'Done today' : 'I did it');
  const n = streakOf(S.habit.l.map((e) => e[0]));
  setD($('kHbN'), n ? `${n} ${tr(n === 1 ? 'day' : 'days')}` : '');
}
$('kHbSave').addEventListener('click', () => {
  const t = kHbT.value.trim();
  if (!t) { say('Pick or write your tiny habit first.'); kHbT.focus(); return; }
  S.habit.t = t.slice(0, 60); S.habit.c = kHbC.value.trim().slice(0, 60); hbEditing = false; save(); renderHabit();
  land($('kHbName')); // the form this button sat in is gone: focus the habit that replaced it
  say('Habit set. Make it so small you cannot fail.');
});
$('kHbEdit').addEventListener('click', () => { kHbT.value = hbText(S.habit.t); kHbC.value = hbText(S.habit.c); hbEditing = true; renderHabit(); land(kHbSet.querySelector<HTMLElement>('h5')!); }); // the old habit stays saved until the new one is
$('kHbDo').addEventListener('click', () => {
  const today = dayN(Date.now());
  if (S.habit.l.some((e) => e[0] === today)) return;
  const left = RELICS.filter((r) => !relicsOwned().includes(r.id));
  const find = left.length && Math.random() < 0.33 ? left[Math.floor(Math.random() * left.length)].id : '';
  S.habit.l = [...S.habit.l, [today, find] as [number, string]].slice(-90);
  save(); renderLoot(); setLvl(); renderBadges();
  if ('vibrate' in navigator) navigator.vibrate(find ? [20, 30, 40] : [14]);
  if (find) { const d: Drop = { tier: 'relic', id: find, stones: 0 }; kSheet.dataset.mode = 'relic'; openSheetEl(kSheet, $('kDrOk')); showDrop(d, 0); }
  else setD($('kHbMsg'), tr(HB_MSG[Math.floor(Math.random() * HB_MSG.length)]));
});
const DROP_T: Record<string, string> = { spark: t2('A spark', 'Una scintilla'), gem: t2('A gem', 'Una gemma'), relic: t2('A find!', 'Un ritrovamento!'), jackpot: t2('Jackpot', 'Jackpot') };
const kShD = $('kShD'), kDrOk = $('kDrOk'), kDrNx = $('kDrNx');
const DEFS = '<defs><linearGradient id="kg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".6"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>';
const hl = (d: string) => `<path d="${d}" fill="url(#kg)"/>`;
const dropArt = (d: Drop) => {
  const rel = RELICS.find((r) => r.id === d.id);
  if (rel) return `<svg viewBox="0 0 120 120" aria-hidden="true"><circle class="ring" cx="60" cy="60" r="48"/><circle class="ring2" cx="60" cy="60" r="38"/><g transform="translate(24 24) scale(3)"><path class="ic" d="${rel.d}"/></g></svg>`;
  if (d.tier === 'gem') { const g = 'M30 44l12-18h36l12 18-30 52z'; return `<svg viewBox="0 0 120 120" aria-hidden="true">${DEFS}<path class="a" d="${g}"/><path class="c" d="M30 44h60M42 26l18 18 18-18M60 44l-18 52M60 44l18 52"/>${hl(g)}</svg>`; }
  if (d.tier === 'jackpot') {
    const star = 'M60 18l11 25 27 3-20 18 6 27-24-14-24 14 6-27-20-18 27-3z';
    const rays = Array.from({ length: 12 }, (_, i) => `<line x1="60" y1="60" x2="${(60 + 58 * Math.cos((i * Math.PI) / 6)).toFixed(1)}" y2="${(60 + 58 * Math.sin((i * Math.PI) / 6)).toFixed(1)}"/>`).join('');
    return `<svg viewBox="0 0 120 120" aria-hidden="true">${DEFS}<g class="rays">${rays}</g><path class="a" d="${star}"/>${hl(star)}</svg>`;
  }
  const sp = 'M60 10l9 33 33 9-33 9-9 33-9-33-33-9 33-9z';
  return `<svg viewBox="0 0 120 120" aria-hidden="true">${DEFS}<path class="a" d="${sp}"/>${hl(sp)}<circle class="b" cx="96" cy="24" r="4"/><circle class="b" cx="22" cy="94" r="3"/></svg>`;
};
// Reveal screen: appears the moment the reflection is saved, under a second to read, one tap to continue.
function showDrop(d: Drop, side: number, withNext = false) {
  const rel = RELICS.find((r) => r.id === d.id);
  kSheet.classList.add('drop'); kShA.hidden = true; kShR.hidden = true; kShD.hidden = false; kShD.dataset.tier = d.tier; setProgText(4);
  $('kDrCoop').hidden = true; $('kDrCoN').hidden = true; $('kDrDare').hidden = true; $('kDrMore').hidden = true;
  setT(kDrOk, 'Keep going'); delete kDrOk.dataset.next; kDrNx.hidden = true; kDrNx.textContent = ''; // aria-describedby reads hidden text too
  if (withNext) offerNext(); // before the focus below, so the button is announced with its final label
  $('kDrArt').innerHTML = dropArt(d);
  setT($('kDrT'), DROP_T[d.tier]);
  const stones = fill(t2('+{n} stones', '+{n} pietre'), { n: d.stones });
  if (rel) setD($('kDrN'), `${tr(rel.name)} · ${relicsOwned().length + 0}/${RELICS.length}`); else setD($('kDrN'), stones);
  setD($('kDrS'), rel ? `${d.stones ? stones : ''}${side ? ` · +${side} bonus` : ''}` : side ? `+${side} bonus` : '');
  burst(18); $('kDrPath').innerHTML = ''; $('kDrTw').hidden = true;
  if ('vibrate' in navigator) navigator.vibrate(d.tier === 'jackpot' ? [30, 40, 30, 40, 60] : d.tier === 'relic' ? [20, 30, 40] : [18]);
  kDrOk.focus();
}
// Momentum: right after a reward the button leads straight into the next open mission, and says which one.
function offerNext() {
  if (cur.i >= TREND_FROM) return; // a Trending project stands apart: the button after it just says Keep going
  const nx = nextSpot(S.field, S.fields.filter((f) => FIELDS[f]), doneIn, total()), m = nx && FIELDS[nx.f].m[nx.i];
  // Finishing a round lands on Home, where the Slash card is the payoff: never chain out of a completed round.
  const start = Math.floor(cur.i / PER_ROUND) * PER_ROUND, d = doneIn(cur.f);
  if (!nx || !m || [0, 1, 2].every((k) => d.has(start + k))) return;
  const mins = MX[nx.f]?.[nx.i]?.mins;
  kDrOk.dataset.next = `${nx.f}.${nx.i}`; setT(kDrOk, 'Next project');
  setD(kDrNx, `${tr('Up next')}: ${tr(m[1])}${mins ? ` · ~${mins} min` : ''}`); kDrNx.hidden = false;
}
kDrOk.addEventListener('click', once(() => {
  const [f, i] = (kDrOk.dataset.next || '').split('.');
  closeSheet(kSheet); setLvl(); renderProgress();
  if (!FIELDS[f]) return;
  if (f !== S.field) switchField(f);
  openAnswer(f, Number(i));
}));
const fillSheet = (f: string, i: number) => {
  kSheet.classList.remove('drop'); kShD.hidden = true; kSheet.dataset.fa = f; // the header takes the field's accent colour (app.css)
  const m = FIELDS[f].m[i];
  setD($('kShL'), i >= TREND_FROM ? fill(TREND_SHELF.head, { f: tr(f) }) : fill(t2('{f} · project {n} of {all}', '{f} · progetto {n} di {all}'), { f: tr(f), n: (i % PER_ROUND) + 1, all: PER_ROUND })); setT($('kShT'), m[1]); // not the internal label ("Mission 001 · crowded story")
  const code = f === 'Code'; // code is typed letter by letter: the phone must not correct, capitalise or underline it
  kTa.spellcheck = !code; kTa.setAttribute('autocorrect', code ? 'off' : 'on'); kTa.setAttribute('autocapitalize', code ? 'off' : 'sentences');
  renderBrief(f, i);
  kShA.hidden = false; kShR.hidden = true; setT(kSaved, NOTE_DEFAULT); kSaved.hidden = false;
  renderTrailSigns(f, i);
  $('kCoopHint').hidden = !isCoop(f, i);
  kRun.hidden = !runsPrompt(f, i); kRunO.hidden = true; kRunT.textContent = ''; setT(kRunB, RUN_LBL); // a new sheet starts without the last AI reply
};
// No clock on a mission: "~3 min" is a soft estimate shown by renderBrief, never a countdown or a speed bonus (quality over speed).
const openAnswer = (f: string, i: number, dare = false) => {
  cur = { f, i, dare, edit: -1 };
  track('open', f, i);
  fillSheet(f, i); setT($('kSub'), 'Submit answer');
  kTa.value = S.drafts[dKey()] || '';
  delete kSheet.dataset.mode; renderProg(); runHold();
  const title = $('kShT'); title.tabIndex = -1; // focus the title, not the answer box: the brief stays in view and no keyboard pops up before it is read
  openSheetEl(kSheet, title);
};
function openEdit(idx: number) {
  const a = S.answers[idx]; if (!a) return;
  cur = { f: a.f, i: a.i, dare: false, edit: idx };
  fillSheet(a.f, a.i); setT($('kSub'), 'Save changes');
  kTa.value = a.t; kSheet.dataset.mode = 'edit'; runHold(); // editing is not a run through the three parts: no progress bar
  openSheetEl(kSheet, kTa);
  kTa.scrollIntoView({ block: 'nearest' }); // editing: the answer box is what matters, so bring it into view
}
// The bar on top of a mission: three segments, read the brief, write the answer, reflect. The brief is on screen from the start, so the first is always full;
// the second fills as the answer grows (ANSWER_FULL characters is a few sentences, not a quota), the third as the two reflection questions are answered.
// The done screen fills all three in CSS (.drop); editing an answer hides the bar.
const kProg = $('kProg'), progFill = [...kProg.querySelectorAll<HTMLElement>('b')];
const ANSWER_FULL = 60;
const PROG_TEXT = [t2('Step 1 of 3: read the brief', 'Passo 1 di 3: leggi il brief'), t2('Step 2 of 3: write your answer', 'Passo 2 di 3: scrivi la tua risposta'), t2('Step 3 of 3: reflect', 'Passo 3 di 3: rifletti'), t2('Project done', 'Progetto completato')];
const setProgText = (stage: number) => { kProg.setAttribute('aria-valuenow', String(Math.min(stage, 3))); kProg.setAttribute('aria-valuetext', tr(PROG_TEXT[stage - 1])); };
function renderProg() {
  const reflecting = !kShR.hidden, written = kTa.value.trim().length;
  const asked = ['kRfE', 'kRfA'].filter((id) => $(id).dataset.val).length;
  [1, reflecting ? 1 : Math.min(1, written / ANSWER_FULL), reflecting ? asked / 2 : 0].forEach((p, i) => progFill[i].style.setProperty('--p', String(p)));
  setProgText(reflecting ? 3 : written ? 2 : 1);
}
$('kShClose').addEventListener('click', () => dismiss(kSheet));
const groups = ['kRfE', 'kRfA'].map((id) => $(id));
groups.forEach((g) => g.querySelectorAll<HTMLElement>('[data-v]').forEach((c) => {
  const pick = () => { g.querySelectorAll<HTMLElement>('[data-v]').forEach((o) => { o.classList.toggle('sel', o === c); o.setAttribute('aria-pressed', String(o === c)); }); g.dataset.val = c.dataset.v!; renderProg(); };
  c.addEventListener('click', pick);
  c.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
}));
kAdd.addEventListener('click', () => { if (kAdd.dataset.kAns === 'card') goTab('yourkern'); else openAnswer(S.field, Number(kAdd.dataset.kAns)); });
kAdd2.addEventListener('click', () => openAnswer(S.field, Number(kAdd2.dataset.kAns)));
[0, 1, 2].forEach((i) => $('kMR' + i).addEventListener('click', () => openAnswer(S.field, viewBase() + i)));
$('kPeek').addEventListener('click', () => { peek = peeking() ? '' : peekKey(); renderHome(); });
$('kCancel').addEventListener('click', () => closeSheet(kSheet));
$('kSub').addEventListener('click', once(() => {
  const t = kTa.value.trim();
  if (!t) { say('Write something first.'); kTa.focus(); return; }
  clearTimeout(dT);
  if (cur.edit >= 0) {
    const a = S.answers[cur.edit];
    if (a && a.f === cur.f && a.i === cur.i) { a.t = t.slice(0, 2000); a.ed = stamp(ver(a)); }
    const kept = save(); closeSheet(kSheet); renderProgress(); say(kept ? 'Answer updated.' : UNSAVED);
    return;
  }
  const na: Answer = { f: cur.f, i: cur.i, t: t.slice(0, 2000), at: Date.now() };
  lastBoost = boostOf(cur.f); // before the push: an answer that completes a round moves base(), and with it the boost
  S.answers.push(na); lastAns = na;
  track('answer', cur.f, cur.i);
  delete S.drafts[dKey()];
  S.stones += 50;
  if (!save()) say(UNSAVED); // the reflection step comes next: do not let it look like the answer is safe
  if (cur.dare) { dare = null; renderDare(); }
  setLvl(); renderProgress();
  groups.forEach((g) => { g.dataset.val = ''; g.querySelectorAll('[data-v]').forEach((o) => { o.classList.remove('sel'); o.setAttribute('aria-pressed', 'false'); }); });
  $<HTMLInputElement>('kRfH').value = ''; $<HTMLInputElement>('kRfT').value = '';
  const ex = variant(cur.f, cur.i)?.ex || '';
  $('kVsY').textContent = na.t; showStrong(false); $('kVsAsk').hidden = !ex; // the example text is already in kXExT (renderBrief)
  hush(); kShA.hidden = true; kShR.hidden = false; setRfNote(); renderProg(); // the beat grid goes with the answer step, so does its sound
  (ex ? $('kVsGo') : firstChip()).focus({ preventScroll: true });
  kSheet.querySelector('.k-sh-in')?.scrollTo({ top: 0 });
}));
// After Submit the strong answer waits to be asked for: "See a strong answer" shows it with the self-check ticks, "Good enough, next" goes on to the reflection.
const firstChip = () => groups[0].querySelector<HTMLElement>('[data-v]')!;
const showStrong = (on: boolean) => { $('kVs').hidden = kRfBar.hidden = !on; $('kVsAsk').hidden = on; };
$('kVsGo').addEventListener('click', () => { showStrong(true); land($('kVs')); });
$('kVsNo').addEventListener('click', () => { reveal($('kRfEQ')); firstChip().focus({ preventScroll: true }); });
// Save keeps everything; Skip keeps the chips already tapped (a quick tap then Skip is still a reflection) and drops the half-typed lines.
const reflect = (withText: boolean) => {
  const r = cleanR({ e: groups[0].dataset.val, again: groups[1].dataset.val, ...(withText ? { hard: $<HTMLInputElement>('kRfH').value, tip: $<HTMLInputElement>('kRfT').value } : {}) });
  if (r) track('reflect', cur.f, cur.i);
  finish(r);
};
$('kRfOk').addEventListener('click', once(() => reflect(true)));
$('kRfSkip').addEventListener('click', once(() => reflect(false)));
// Finishing a mission: keep the reflection, then one calm confirmation. No bonus points, combos or random rewards.
function finish(r: Refl | undefined) {
  const a = lastAns && S.answers.includes(lastAns) ? lastAns : undefined;
  if (a) { if (r) a.r = r; a.ed = stamp(ver(a)); }
  const kept = save(); if (a && r) shareSign(a);
  showDone();
  if (!kept) say(UNSAVED);
}
// The screen after a finished mission: where you are in this field, and one button to go on.
// A small burst behind the done mark (the same one the old reward screen used). Nothing moves with reduced motion.
const burst = (n: number) => {
  const bits = $('kDrBits'); bits.innerHTML = '';
  if (!still) for (let i = 0; i < n; i++) { const p = document.createElement('i'); p.style.setProperty('--a', `${(360 / n) * i + Math.random() * 12}deg`); p.style.setProperty('--r', `${70 + Math.random() * 60}px`); bits.appendChild(p); }
};
// A field the person has not picked (or, with all picked, one not tried yet), a different one after each mission: "Curious about Video? Try one".
// Prompting comes first until it is tried: it works with any field, and it was the pilot's most common second pick.
const curiousField = () => {
  if (cur.f !== 'Prompting' && !doneIn('Prompting').size) return 'Prompting';
  const all = Object.keys(FIELDS), unpicked = all.filter((f) => !S.fields.includes(f));
  const pool = unpicked.length ? unpicked : all.filter((f) => !doneIn(f).size);
  return pool.length ? pool[S.answers.length % pool.length] : '';
};
$('kDrTry').addEventListener('click', once(() => { // opens that field's first open mission and adds it to the paths, like a co-op's "Do the project yourself"
  const f = $('kDrTry').dataset.f || ''; if (!FIELDS[f]) return;
  const i = Array.from({ length: total(f) }, (_, k) => k).find((k) => !doneIn(f).has(k)) ?? 0;
  closeSheet(kSheet);
  if (!S.fields.includes(f)) S.fields = [...S.fields, f];
  switchField(f); openAnswer(f, i);
}));
function showDone() {
  const f = cur.f;
  kSheet.classList.add('drop'); kShA.hidden = true; kShR.hidden = true; kShD.hidden = false; kShD.dataset.tier = 'done'; setProgText(4);
  setT(kDrOk, 'Keep going'); delete kDrOk.dataset.next; kDrNx.hidden = true; kDrNx.textContent = ''; // aria-describedby reads hidden text too
  offerNext(); // before the focus below, so the button is announced with its final label
  $('kDrArt').innerHTML = icon('done', 'k-i k-done-i');
  const co = isCoop(cur.f, cur.i) && !!lastAns && S.answers.includes(lastAns); // a co-op mission can go on to a friend from here
  $('kDrCoop').hidden = !co; $('kDrCoN').hidden = !co;
  $('kDrDare').hidden = co || !lastAns; // right after a mission: send this one as a dare (co-op missions already offer their friend step)
  setT($('kDrT'), 'Done.');
  const trending = cur.i >= TREND_FROM; // a Trending project is not one of the field's 6: no "0 of 6" line and no path under it
  setD($('kDrN'), trending ? fill(TREND_SHELF.head, { f: tr(f) }) : fill(t2('{n} of {all} done in {f}', '{n} su {all} fatte in {f}'), { n: doneIn(f).size, all: total(f), f: tr(f) }));
  const hit = barsHit(), all = barsAll();
  setD($('kDrS'), hit ? fill(t2('{n} of {all} checks · saved on this device.', '{n} controlli su {all} · salvata su questo dispositivo.'), { n: hit, all }) : tr(t2('Saved on this device.', 'Salvata su questo dispositivo.')));
  $('kDrPath').innerHTML = trending ? '' : pathOf(f, cur.i, 'now'); // the one just finished grows in
  // One calm line under the buttons: a field not picked yet, and the weekly reminder. Small links, never a second call to action.
  const cf = curiousField(), tryB = $('kDrTry');
  tryB.hidden = !cf; tryB.dataset.f = cf;
  if (cf) setD(tryB, cf === 'Prompting' ? tr('AI prompts work with any field. Try one.') : tr('Curious about {f}? Try one').replace('{f}', tr(cf)));
  setT($('kDrRem'), 'Remind me weekly'); $('kDrMore').hidden = false;
  const tw = twistOf(f, cur.i), twEl = $('kDrTw'); // the harder take that every mission already has
  twEl.hidden = !tw; if (tw) setD(twEl, `${tr(t2('Too easy? Try this:', 'Troppo facile? Prova questo:'))} ${tw}`);
  burst(14); if ('vibrate' in navigator) navigator.vibrate(18);
  makeD.sync(); // the first version with AI is offered when the idea is long enough
  kDrOk.focus();
}

// Reward preview: shows what winning feels like without changing your stones.
const kRw = $('kReward'), kWin = $('kWin'), kConf = $('kConf'), kGain = $('kGain'), kRU = $('kRU');
const closeWin = () => { kRw.hidden = true; syncInert(); kWin.focus(); };
kWin.addEventListener('click', () => {
  const gain = 200, before = rankIdx(S.stones), after = rankIdx(S.stones + gain);
  kRU.hidden = after === before;
  $('kRU2').textContent = tr(RANKS[after][0]);
  kRw.hidden = false;
  kConf.innerHTML = '';
  if (still) kGain.textContent = '+' + gain;
  else {
    const cols = ['var(--acc)', 'var(--gold)', 'var(--ai)', 'var(--fg)'];
    for (let i = 0; i < 34; i++) {
      const s = document.createElement('span');
      s.style.cssText = `--l:${Math.random() * 100}%;--c:${cols[i % 4]};--x:${(Math.random() - .5) * 160}px;--r:${Math.random() * 720 - 360}deg;--d:${1.6 + Math.random() * 1.4}s;--dl:${Math.random() * .5}s`;
      if (i % 3 === 0) s.style.borderRadius = '50%';
      kConf.appendChild(s);
    }
    const t0 = performance.now();
    const step = (t: number) => { const p = Math.min((t - t0) / 900, 1); kGain.textContent = '+' + Math.round(gain * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  if ('vibrate' in navigator) navigator.vibrate(30);
  $('kRwOk').focus();
});
$('kRwOk').addEventListener('click', closeWin);
kRw.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); closeWin(); } });

// The Slash card's "That feels right / Not really": saved with the kind it is about, and the card says what it changed (renderCard).
const fb = $('kFb');
kScr.querySelectorAll<HTMLElement>('#kCardAsk [data-k-fit]').forEach((b) => b.addEventListener('click', () => {
  const sg = readSignals();
  if (!sg || !cardData().lit) return;
  S.guess = `${FIT[b.dataset.kFit === 'no' ? 'no' : 'yes']} · ${KSHORT[sg.best]}`;
  if (!save()) say(UNSAVED);
  renderSignals();
}));

// Profile (local only) and onboarding
const kLogin = $('kLogin'), kStart = $('kStart');
const kNmI = $<HTMLInputElement>('kNmI'), kAge = $<HTMLInputElement>('kAge'), kErr = $('kErr'), kLog = $('kLog');
// Interests: pick one or more fields to explore. You start in the current one if you keep it, else the first picked.
let picks: string[] = [...S.fields];
const tiles = kStart.querySelectorAll<HTMLElement>('#kPick [data-f]');
const kAge2 = $<HTMLInputElement>('kAge2');
const markPick = () => {
  tiles.forEach((o) => { const on = picks.includes(o.dataset.f!); o.classList.toggle('sel', on); o.setAttribute('aria-pressed', String(on)); });
  const noPick = !picks.length, noAge = !(S.adult || kAge2.checked); // first visit: the 18+ box sits on this screen, no name is asked
  $<HTMLButtonElement>('kGo').disabled = noPick || noAge;
  const why = $('kGoWhy'); // a dimmed button says what it waits for
  why.hidden = !noPick && !noAge;
  if (!why.hidden) setT(why, noPick && noAge ? 'Pick a field and tick the 18+ box to start.' : noAge ? 'Tick the 18+ box to start.' : 'Pick at least one field.');
};
kAge2.addEventListener('change', () => markPick());
let pickerFromSettings = false; // opened from Settings (else from "+ Add"): where focus goes back to
// The interests picker: only for adding paths ("+ Add", Settings), and for a person who onboarded before the 18+ box moved. The first run is openFirst() below.
const openStart = (fromSettings = false) => {
  pickerFromSettings = fromSettings;
  picks = [...S.fields];
  $('kPickX').hidden = !S.onboarded || !S.adult; // there must be a way out (not past the 18+ box)
  $('kS2Age').hidden = $('kAgeWhy').hidden = $('kS2Note').hidden = S.adult;
  markPick(); kStart.classList.add('on');
  syncInert(); // Settings may still have left the screen inert: a focus() before this would be refused and land on the page body
  document.querySelector<HTMLElement>('#kPick .k-tile')?.focus({ preventScroll: true });
};
const closePicker = () => { // leave the interests screen without changing anything
  if (vtBusy) return;
  picks = [...S.fields]; kStart.classList.remove('on'); syncInert();
  (pickerFromSettings ? $('kAv') : kScr.querySelector<HTMLElement>('.k-fadd') ?? kAdd).focus({ preventScroll: true });
};
// The avatar shows the first whole letter, digit or emoji of the name, else K.
const renderMe = () => { $('kAv').textContent = ([...S.name].find((c) => /[\p{L}\p{N}\p{Extended_Pictographic}]/u.test(c)) ?? 'K').toUpperCase(); };
// Login screen modes: 'up' create account, 'in' log in, 'guest' local-only profile.
// Without Supabase keys only 'guest' exists and the screen looks like before.
type Mode = 'guest' | 'up' | 'in';
let mode: Mode = CLOUD ? 'up' : 'guest';
const kEm = $<HTMLInputElement>('kEm'), kPw = $<HTMLInputElement>('kPw'), kOk = $('kOk');
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) && v.length <= 254;
// An error that blames fields marks them invalid, and goes away by itself once they are right.
let blamed: HTMLInputElement[] = [];
const hideErr = () => { kErr.hidden = true; blamed.forEach((f) => f.removeAttribute('aria-invalid')); blamed = []; };
const fail = (en: string, ...bad: HTMLInputElement[]) => { hideErr(); setT(kErr, en); kErr.hidden = false; kOk.hidden = true; blamed = bad; bad.forEach((f) => f.setAttribute('aria-invalid', 'true')); };
const note = (en: string) => { setT(kOk, en); kOk.hidden = false; hideErr(); };
const right = (f: HTMLInputElement) => (f === kNmI ? !!cleanName(f.value.trim()).trim() : f === kEm ? emailOk(f.value.trim().toLowerCase()) : f === kPw ? f.value.length >= 8 : f.checked);
const settle = () => {
  if (!blamed.length) return;
  blamed.filter(right).forEach((f) => f.removeAttribute('aria-invalid'));
  blamed = blamed.filter((f) => !right(f));
  if (!blamed.length) kErr.hidden = true;
};
[kNmI, kEm, kPw].forEach((f) => f.addEventListener('input', settle));
kAge.addEventListener('change', settle);
function setMode(m: Mode) {
  mode = m;
  pressed('mode', m);
  $('kAuthSeg').hidden = !CLOUD;
  $('kFName').hidden = m === 'in';
  $('kFEmail').hidden = m === 'guest'; $('kFPw').hidden = m === 'guest';
  $('kFAge').hidden = m === 'in';
  kPw.autocomplete = m === 'in' ? 'current-password' : 'new-password';
  $('kForgot').hidden = m !== 'in';
  $('kGuest').hidden = !CLOUD || m === 'guest';
  setT($('kGuest'), S.name ? 'Not now' : 'Continue without an account');
  $('kNoteLocal').hidden = m !== 'guest'; $('kNoteCloud').hidden = m === 'guest';
  setT(kLog, m === 'up' ? 'Create account' : m === 'in' ? 'Log in' : 'Start');
  hideErr(); kOk.hidden = true;
}
document.querySelectorAll<HTMLElement>('[data-k-mode]').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.kMode === 'in' ? 'in' : 'up')));
$('kGuest').addEventListener('click', () => { if (S.name) { kLogin.classList.remove('on'); return; } setMode('guest'); });
let authBusy = false;
$('kProf').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (authBusy) return;
  const n = cleanName(kNmI.value.trim()).trim(), em = kEm.value.trim().toLowerCase(), pw = kPw.value;
  if (mode === 'guest') {
    if (!n || !kAge.checked) { fail('Add your name and confirm your age to continue.', ...[...(n ? [] : [kNmI]), ...(kAge.checked ? [] : [kAge])]); (n ? kAge : kNmI).focus(); return; }
    hideErr(); kLog.classList.add('busy');
    window.setTimeout(() => { S.name = n; S.adult = true; save(); renderMe(); renderHome(); kLog.classList.remove('busy'); kLogin.classList.remove('on'); if (S.onboarded) arrive(); else openFirst(); }, still ? 0 : 600);
    return;
  }
  if (mode === 'up' && !n) { fail('Add your name.', kNmI); kNmI.focus(); return; }
  if (!emailOk(em)) { fail('Enter a valid email.', kEm); kEm.focus(); return; }
  if (pw.length < 8) { fail('Use a longer password: at least 8 characters.', kPw); kPw.focus(); return; }
  if (mode === 'up' && !kAge.checked) { fail('Confirm you are 18 or older.', kAge); kAge.focus(); return; }
  authBusy = true; kLog.classList.add('busy');
  try {
    if (mode === 'up') {
      const r = await cloud.signUp(em, pw, n);
      if (!S.name) S.name = n;
      S.adult = true; save(); renderMe(); // the sign-up form asks for 18+
      if (r.needsConfirm) { setMode('in'); kEm.value = em; note('Check your email to confirm your account, then log in. Already have one? Just log in.'); }
    } else await cloud.signIn(em, pw);
    kPw.value = '';
  } catch (err) { fail(cloud.why(err)); }
  finally { authBusy = false; kLog.classList.remove('busy'); }
});
$('kForgot').addEventListener('click', async () => {
  const em = kEm.value.trim().toLowerCase();
  if (!emailOk(em)) { fail('Enter your email first.', kEm); kEm.focus(); return; }
  try { await cloud.resetPassword(em); note('If an account exists for this email, we sent a reset link.'); } catch (err) { fail(cloud.why(err)); }
});

// Account state from Supabase: first sign-in on a device merges the synced trail with the local one.
function renderAcct() {
  $('kAcct').hidden = !CLOUD;
  if (!CLOUD) return;
  setD($('kAcctE'), user ? `${user.email} · ${tr(syncOk ? 'synced' : 'sync paused')}` : tr('Not signed in · your answers are only on this device'));
  $('kAcctUp').hidden = !!user; $('kLogout').hidden = !user;
  $('kDelAcc').hidden = !user; $('kDel').hidden = !!user;
}
// An email link that could not sign in here (opened on another device, expired or already used): say so, tidy the URL.
function linkNote() {
  const p = new URLSearchParams(location.search.slice(1) + '&' + location.hash.slice(1));
  if (!p.has('code') && !p.has('error_description')) return;
  history.replaceState(null, '', location.pathname);
  setMode('in'); kStart.classList.remove('on'); kLogin.classList.add('on'); // the link is about logging in: that screen goes on top
  note(p.has('code') ? 'Open the link on the device where you asked for it, or log in here.' : 'That link has expired or was already used. Log in, or ask for a new one.');
}
const onUser = async (u: cloud.User | null, ev: string) => {
  if (ev === 'PASSWORD_RECOVERY' && $('kPwS').hidden) openSheetEl($('kPwS'), $('kPwN'));
  if (!u) { user = null; renderAcct(); if (ev === 'INITIAL_SESSION') linkNote(); return; }
  if (user && user.id === u.id) { user = u; renderAcct(); return; }
  user = u; pulled = false;
  try { const remote = await cloud.pull(u.id); if (remote) mergeIn(remote); syncOk = true; pulled = true; }
  catch { syncOk = false; say("Couldn't load your synced answers. We'll try again."); }
  if (!S.name) S.name = cleanName(u.name);
  save(); renderMe(); applyField(false); setLang(S.lang); renderAcct(); flushSigns();
  if (kLogin.classList.contains('on')) { kLogin.classList.remove('on'); if (!S.onboarded) openFirst(); else arrive(); }
};
if (CLOUD) void cloud.onAuth(onUser).catch(() => { /* SDK failed to load: stay local-only */ });
$('kAcctUp').addEventListener('click', () => { closeSheet(kSet); setMode('up'); kNmI.value = S.name; kLogin.classList.add('on'); kEm.focus(); });
$('kLogout').addEventListener('click', async () => {
  if (!confirm(tr('Log out? Your answers stay in your account and are removed from this device.'))) return;
  clearTimeout(pushT);
  if (user && pulled) { try { await cloud.push(user.id, snapshot()); } catch { /* best effort before leaving */ } }
  try { await cloud.signOut(); } catch { /* still clear the device */ }
  await eraseStats(); // the next person on this device is asked again
  try { localStorage.removeItem(KEY); } catch { /* nothing stored */ } wipeExtras();
  location.replace('/');
});
$('kDelAcc').addEventListener('click', async () => {
  if (!confirm(tr('Delete your account and all your answers? This cannot be undone.'))) return;
  clearTimeout(pushT); // a pending sync must not race the deletion
  try { await cloud.deleteAccount(); } catch (err) { say(cloud.why(err)); return; }
  await eraseStats();
  try { localStorage.removeItem(KEY); } catch { /* nothing stored */ } wipeExtras(true);
  location.replace('/');
});
const kPwS = $('kPwS');
kPwS.addEventListener('click', (e) => { if (e.target === kPwS) closeSheet(kPwS); });
kPwS.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); closeSheet(kPwS); } });
$('kPwF').addEventListener('submit', async (e) => {
  e.preventDefault();
  const p = $<HTMLInputElement>('kPwN').value, er = $('kPwErr');
  if (p.length < 8) { setT(er, 'Use a longer password: at least 8 characters.'); er.hidden = false; return; }
  try { await cloud.setPassword(p); $<HTMLInputElement>('kPwN').value = ''; closeSheet(kPwS); say('Password updated.'); }
  catch (err) { setT(er, cloud.why(err)); er.hidden = false; }
});
$('kPickX').addEventListener('click', closePicker);
// First visit: loader > the four first-run screens (openFirst) > Your page. A name or an account is optional, later (Settings). The picker above is only for adding paths.
const pop = () => { // the field's object drops into the mission card
  if (still) return;
  const o = $('kNxIc');
  o.classList.remove('arrive'); void o.offsetWidth; o.classList.add('arrive');
};
const landHome = () => land(kScr.querySelector<HTMLElement>('#k-missions h4')!);
const arrive = () => { goTab('missions'); pop(); landHome(); };

// First run (v10): four screens with one action each and no tabs behind them. 1 welcome, 2 pick one example project (and tick 18+), 3 the project one question at a time,
// 4 saved to your page. A starter (projects.ts) points at an existing mission, so its brief, material and three steps are the mission's own; the answers join into one saved answer.
// Nothing here says or implies money was earned: the prices are examples and nobody is paying yet.
const kFirst = $('kFirst'), kFirstAge = $<HTMLInputElement>('kFirstAge'), kF1Go = $<HTMLButtonElement>('kF1Go'), kF2Ta = $<HTMLTextAreaElement>('kF2Ta'), kF2C = $('kF2C'), kF2Ask = $('kF2Ask');
const FIRST_IDS = ['kF0', 'kF1', 'kF2', 'kF3'], FIRST_HEADS = ['kF0H', 'kF1H', 'kF2Q', 'kF3H']; // the screens, and the heading each one is named by
let firstAt = 0, firstPick = -1, firstStep = 0, firstAns: string[] = [], firstCards: HTMLElement[] = [];
const starter = () => FIRST_BRIEFS[firstPick];
const firstSteps = () => { const st = starter(); return st ? MX[st.f]?.[st.i]?.steps ?? [] : []; };
const showFirst = (n: number) => {
  firstAt = n;
  FIRST_IDS.forEach((id, k) => { $(id).hidden = k !== n; });
  kFirst.classList.toggle('black', n === 0); // the welcome screen is the black one
  $('kFBack').hidden = n === 0 || n === 3; // nothing to go back to from the welcome, nor from the confirmation
  setD($('kFNum'), fill(t2('{n} of 4', '{n} di 4'), { n: n + 1 }));
  kFirst.setAttribute('aria-labelledby', FIRST_HEADS[n]);
  kFirst.scrollTo({ top: 0 }); if (n === 1) fadeFirst();
  stopSpeaking();
};
// The three practice cards. Built here (not in the markup) so the words follow the language.
const renderFirstPick = () => {
  firstCards = FIRST_BRIEFS.map((st, k) => {
    const b = document.createElement('button'), el = (cls: string, text: string) => Object.assign(document.createElement('span'), { className: cls, textContent: text });
    b.type = 'button'; b.className = 'k-proj'; b.setAttribute('aria-pressed', String(k === firstPick));
    const chips = el('k-pj-c', ''); chips.append(el('k-l k-cat', tr(st.f)), el('k-l', aboutMins(MX[st.f][st.i].mins))); // the category it belongs to and a time estimate: free practice, no price
    b.append(el('k-pj-t', tr(st.label)), el('k-pj-l', tr(st.line)), chips);
    b.addEventListener('click', () => { firstPick = k; firstCards.forEach((c, j) => c.setAttribute('aria-pressed', String(j === k))); markFirst(); });
    return b;
  });
  $('kF1L').replaceChildren(...firstCards);
};
// A fade under the list of examples while there is more below it (the list scrolls, the footer stays on screen).
const kF1S = $('kF1S');
const fadeFirst = () => kF1S.toggleAttribute('data-more', kF1S.scrollHeight > kF1S.clientHeight + 2 && kF1S.scrollTop + kF1S.clientHeight < kF1S.scrollHeight - 2);
kF1S.addEventListener('scroll', fadeFirst, { passive: true }); addEventListener('resize', fadeFirst);
const markFirst = () => {
  const noPick = firstPick < 0, noAge = !(S.adult || kFirstAge.checked), why = $('kF1Why'); // the button says what it waits for
  kF1Go.disabled = noPick || noAge;
  why.hidden = !noPick && !noAge;
  if (!why.hidden) setT(why, noPick && noAge ? 'Pick a project and tick the 18+ box to continue.' : noAge ? 'Tick the 18+ box to continue.' : 'Pick a project to continue.');
  $('kF1Age').hidden = $('kFirstAgeWhy').hidden = S.adult;
  fadeFirst(); // the footer may have grown or shrunk
};
// The brief's material, behind "See the brief": the clip (it says it is made with AI) and the text, as in the mission sheet.
const renderMaterial = (a: Asset) => {
  const mk = (tag: string, cls: string, text: string) => Object.assign(document.createElement(tag), { className: cls, textContent: text }), host = $('kF2M');
  host.replaceChildren(mk('div', 'k-l', tr(a.title)));
  if (a.video) {
    const v = document.createElement('video');
    v.className = 'k-xv'; v.controls = true; v.playsInline = true; v.preload = 'metadata'; v.src = `${a.video}#t=0.1`; v.setAttribute('aria-label', tr(a.title));
    host.append(v, mk('p', 'k-l k-s', tr('Clip made with AI for slashkern. Everything in it is fictional.')));
  }
  host.append(mk('pre', a.mono ? 'mono' : '', tr(a.body)));
};
const renderStep = () => {
  const steps = firstSteps(), all = steps.length, last = firstStep === all - 1;
  $('kFProg').querySelectorAll<HTMLElement>('b').forEach((b, k) => b.style.setProperty('--p', k < firstStep ? '1' : k === firstStep ? '.4' : '0'));
  $('kFProg').setAttribute('aria-valuenow', String(firstStep + 1));
  setD($('kF2L'), fill(t2('Question {n} of {all}', 'Domanda {n} di {all}'), { n: firstStep + 1, all }));
  $('kFProg').setAttribute('aria-valuetext', $('kF2L').textContent ?? '');
  setD($('kF2Q'), tr(steps[firstStep] ?? ''));
  kF2Ta.value = firstAns[firstStep] ?? ''; kF2Ta.placeholder = tr('Write it your way.');
  setT($('kF2Next'), last ? 'Save to my page' : 'Next');
  $<HTMLDetailsElement>('kF2D').open = false; // the short brief and the material (the clip, the facts) are one tap away, below the answer box
  kF2C.hidden = true; kF2C.replaceChildren(); kF2Ask.setAttribute('aria-expanded', 'false'); hold(kF2Ask, false);
  land($('kF2Q'));
};
const startSteps = () => {
  const st = starter(), x = st && MX[st.f]?.[st.i]; if (!st || !x) return;
  cur = { f: st.f, i: st.i, dare: false, edit: -1 }; // the assistant link reads the field from here
  firstStep = 0; firstAns = [];
  track('open', st.f, st.i);
  setD($('kF2T'), tr(FIELDS[st.f].m[st.i][1]));
  $('kF2P').hidden = false;
  $('kF2P').replaceChildren(Object.assign(document.createElement('span'), { className: 'k-l k-cat', textContent: tr(st.f) }), Object.assign(document.createElement('span'), { className: 'k-l', textContent: aboutMins(x.mins) }));
  setD($('kF2B'), tr(st.intro)); renderMaterial(x.asset);
  showFirst(2); renderStep();
};
const saveFirst = () => {
  const st = starter(); if (!st) return;
  const na: Answer = { f: st.f, i: st.i, t: firstAns.map((a) => a.trim()).filter(Boolean).join('\n').slice(0, 2000), at: Date.now() };
  S.adult = true; S.onboarded = true; S.field = st.f; S.fields = [...new Set([...S.fields, st.f])];
  S.answers.push(na); S.stones += 50; delete S.drafts[`${st.f}.${st.i}`]; lastAns = na;
  track('answer', st.f, st.i);
  const kept = save();
  setD($('kF3Ttl'), tr(FIELDS[st.f].m[st.i][1]));
  piecesUi.render(); showFirst(3); land($('kF3H')); // the first run offers the piece of this field
  makeF.sync(); // the first version with AI is offered when the idea is long enough
  if (!kept) say(UNSAVED);
};
const openFirst = () => {
  firstPick = -1; kFirstAge.checked = false; renderFirstPick(); markFirst();
  kFirst.classList.add('on'); showFirst(0); syncInert(); land($('kF0H'));
};
$('kF0Go').addEventListener('click', () => { showFirst(1); land($('kF1H')); });
kFirstAge.addEventListener('change', markFirst);
kF1Go.addEventListener('click', () => {
  const st = starter(); if (!st || kF1Go.disabled) return;
  S.adult = true; S.field = st.f; S.fields = [...new Set([...S.fields, st.f])]; save();
  startSteps();
});
kF2Ta.addEventListener('input', () => { firstAns[firstStep] = kF2Ta.value; });
$('kF2Next').addEventListener('click', once(() => {
  const t = kF2Ta.value.trim();
  if (!t) { say('Write something first.'); kF2Ta.focus(); return; }
  firstAns[firstStep] = t;
  if (firstStep < firstSteps().length - 1) { firstStep++; renderStep(); } else saveFirst();
}));
$('kFBack').addEventListener('click', () => {
  if (firstAt === 2 && firstStep > 0) { firstAns[firstStep] = kF2Ta.value; firstStep--; renderStep(); return; }
  showFirst(firstAt - 1); land($(FIRST_HEADS[firstAt]));
});
// The live assistant, behind a small link: it reads the brief and the draft and asks one question (never the answer). Offline it falls back to the scripted questions, as in the mission sheet.
// One question from Slash about a draft, shown in `box` (the first run, a piece's step): the live assistant, or the scripted questions offline. Returns whether a question was shown.
async function slashAsk(box: HTMLElement, mission: { title: string; brief: string }, field: string, draft: string, here: () => boolean): Promise<boolean> {
  const d = draft.slice(0, 400);
  if (HEAVY.test(d)) { box.replaceChildren(pauseRow(tr(HEAVY_REPLY))); box.hidden = false; return false; } // heavy words: nothing is sent, the project pauses
  const { row, p } = waitingRow(); box.replaceChildren(row); box.hidden = false;
  const reply = await askAI({ mission, field, messages: [{ who: 'me', t: d ? `My answer so far: ${d}` : 'I am about to start this mission. Help me begin.' }] });
  if (!here()) return false; // moved on meanwhile
  p.classList.remove('k-wait'); p.textContent = '';
  setLive(!!reply, lastWhy);
  p.textContent = reply ?? (d.length >= 10 ? echo(d) + tr(pick(Q_MORE[0])) : tr(pick(Q_STUCK)));
  addListen(p, p.textContent); unlight(row);
  return true;
}
kF2Ask.addEventListener('click', async () => {
  const st = starter(), x = st && MX[st.f]?.[st.i]; if (!st || !x || held(kF2Ask)) return;
  hold(kF2Ask, true); kF2Ask.setAttribute('aria-expanded', 'true'); track('ask_ai', st.f, st.i);
  const step = firstStep;
  await slashAsk(kF2C, { title: FIELDS[st.f].m[st.i][1], brief: x.brief }, st.f, kF2Ta.value.trim(), () => firstAt === 2 && firstStep === step);
  hold(kF2Ask, false);
});
$('kF3Piece').addEventListener('click', once(() => { kFirst.classList.remove('on'); syncInert(); applyField(false); goTab('missions'); piecesUi.open(); }));
$('kF3Go').addEventListener('click', once(() => {
  kFirst.classList.remove('on'); syncInert();
  applyField(false); goTab('yourkern'); land(kScr.querySelector<HTMLElement>('#k-yourkern h4')!);
}));
// Home: "More paths" opens the field chips (switch path, add more), "See my page" is the Your page tab.
$('kMore').addEventListener('click', () => { const box = $('kMoreBox'); box.hidden = !box.hidden; $('kMore').setAttribute('aria-expanded', String(!box.hidden)); });
$('kToPage').addEventListener('click', () => goTab('yourkern'));
const closeStart = () => {
  if (vtBusy) return; // a flight is still playing: ignore the double tap
  const pick = (S.onboarded && picks.includes(S.field) ? S.field : picks[0]) || S.field;
  const changed = pick !== S.field;
  const commit = () => { S.fields = picks.length ? [...picks] : [pick]; S.field = pick; S.onboarded = true; save(); };
  if (!S.adult) { // the picker never saves without the 18+ box
    if (!kAge2.checked) return;
    S.adult = true;
  }
  const run = () => { commit(); kStart.classList.remove('on'); applyField(changed); goTab('missions'); landHome(); };
  // Shared element: the picked field's object flies from its tile into the mission card.
  const from = kStart.querySelector<HTMLElement>(`#kPick [data-f="${pick}"] .k-ti`), to = $('kNxIc');
  if (still || !startVT || !from) return run();
  to.style.viewTransitionName = ''; from.style.viewTransitionName = 'k-hero'; vtBusy = true;
  // vt-hero: the pane joins the page crossfade, so it never paints over the onboarding screen.
  runVT('vt-hero', async () => {
    from.style.viewTransitionName = ''; to.style.viewTransitionName = 'k-hero';
    run(); // vtBusy stays on until the flight has finished (released in `after`)
  }, () => { to.style.viewTransitionName = ''; vtBusy = false; });
};
$('kGo').addEventListener('click', closeStart);
tiles.forEach((c) => c.addEventListener('click', () => {
  const f = c.dataset.f || 'Design';
  picks = picks.includes(f) ? picks.filter((x) => x !== f) : [...picks, f];
  markPick();
}));

// Hero card: the object leans toward the pointer (translate only, so it never fights the float animation).
const kNext = $('kNext');
if (!still) {
  kNext.addEventListener('pointermove', (e) => {
    const r = kNext.getBoundingClientRect();
    kNext.style.setProperty('--tx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    kNext.style.setProperty('--ty', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  });
  kNext.addEventListener('pointerleave', () => { kNext.style.removeProperty('--tx'); kNext.style.removeProperty('--ty'); });
}

// Clipboard with a fallback for browsers that block the async API (older iOS, http on LAN).
const copy = async (text: string) => {
  try { await navigator.clipboard.writeText(text); return true; } catch { /* try the legacy path */ }
  const t = document.createElement('textarea');
  t.value = text; t.setAttribute('readonly', ''); t.style.cssText = 'position:fixed;top:0;opacity:0';
  document.body.appendChild(t); t.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch { ok = false; }
  t.remove();
  return ok;
};
const LINKS: Record<string, () => string> = {
  app: () => `${location.origin}/`,
  dare: () => `${location.origin}/?dare=${encodeURIComponent(S.field)}.0`,
};
kScr.querySelectorAll<HTMLElement>('[data-k-copy]').forEach((b) => b.addEventListener('click', async () => {
  const url = (LINKS[b.dataset.kCopy!] || LINKS.app)();
  if (b.dataset.kCopy === 'dare') { markDared(); track('share'); }
  if (!(await copy(url))) { say(url); return; }
  say('Link copied.');
  b.dataset.orig ??= b.dataset.en!; // the first label, so a second tap cannot make "Copied" the label for good
  const en = b.dataset.orig;
  setT(b, 'Copied'); b.classList.add('ok');
  clearTimeout(Number(b.dataset.t)); b.dataset.t = String(window.setTimeout(() => { setT(b, en); b.classList.remove('ok'); }, 1600));
}));

function markDared() { if (!S.dared) { S.dared = true; save(); renderBadges(); } }
// Save a generated file (export, calendar reminder) through a temporary link.
const download = (content: BlobPart, name: string, type: string) => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type })); a.download = name; a.click();
  window.setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};

// Share: native share sheet on phones, clipboard or download elsewhere.
const shareText = async (title: string, text: string, url: string | undefined, copied: string) => {
  if (navigator.share) {
    try { await navigator.share(url ? { title, text, url } : { title, text }); return; }
    catch (e) { if ((e as DOMException).name === 'AbortError') return; }
  }
  if (await copy(url ? `${text} ${url}` : text)) say(copied); else say(url || text.slice(0, 120));
};
// Slash card as a 1080x1920 story image, with what the card shows: your answer line, the field as a path, the pattern once it is
// ready (never after "Not really"), then the navy block with the line and the address. White page, navy text, the ultramarine accent on the done segments.
const STORY_W = 1080, STORY_H = 1920, STORY_X = 96, ACCENT = '#2D4BFF', INK = '#0E1B3D', ICE = '#DCE6FF', WHITE = '#FFFFFF', DIMB = '#5A6478', TRACKB = '#DFE5F4', BLOCK_Y = 1432;
const cardImage = async (): Promise<Blob | null> => {
  const c = cardData();
  if (!c.a) return null;
  const X = STORY_X, TW = STORY_W - 2 * X;
  const D = "'Geist Variable', sans-serif", B = "'Geist Variable', sans-serif";
  try { await Promise.all([`800 96px ${D}`, `700 96px ${D}`, `600 36px ${B}`].map((f) => document.fonts.load(f))); } catch { /* the fallback fonts will do */ }
  const cv = document.createElement('canvas'); cv.width = STORY_W; cv.height = STORY_H;
  const x = cv.getContext('2d'); if (!x) return null;
  x.fillStyle = WHITE; x.fillRect(0, 0, STORY_W, STORY_H);
  const put = (s: string, font: string, color: string, px: number, py: number) => { x.font = font; x.fillStyle = color; x.fillText(s, px, py); };
  const pill = (px: number, py: number, w: number, h: number, r: number) => { x.beginPath(); if (x.roundRect) x.roundRect(px, py, w, h, r); else x.rect(px, py, w, h); };
  // Lines that fit the width: by words, by characters for a word longer than a line; a cut last line ends in "…".
  const wrap = (s: string, font: string, max = Infinity) => {
    x.font = font;
    const lines: string[] = []; let line = '';
    const add = (bit: string, sep: string) => { const next = line ? line + sep + bit : bit; if (line && x.measureText(next).width > TW) { lines.push(line); line = bit; } else line = next; };
    for (const w of s.split(' ')) { if (x.measureText(w).width <= TW) add(w, ' '); else [...w].forEach((ch, i) => add(ch, i ? '' : ' ')); }
    if (line) lines.push(line);
    if (lines.length <= max) return lines;
    let last = lines[max - 1];
    while (last && x.measureText(last + '…').width > TW) last = [...last].slice(0, -1).join('');
    return [...lines.slice(0, max - 1), last.trimEnd() + '…'];
  };
  // Header: the mark (the slashkern pointer, the same drawing as public/brand/mark.svg: navy body, ice eyes) 96px tall and "slashkern", below the strip a story covers with its progress bar and name.
  let wx = X;
  {
    const [vx, vy, vw, vh] = SLASH_VIEWBOX.split(' ').map(Number), k = 96 / vh;
    x.save(); x.translate(X, 214); x.scale(k, k); x.translate(-vx, -vy);
    x.fillStyle = INK; x.fill(new Path2D(SLASH_BODY));
    x.fillStyle = ICE; x.fill(new Path2D(SLASH_EYES.neutral)); x.restore();
    wx += vw * k + 24;
  }
  put('slashkern', `800 96px ${D}`, INK, wx, 302);
  // The field and its path: one segment per mission, lit (ultramarine fill, navy edge) when done.
  put(tr(S.field).toUpperCase(), `700 36px ${B}`, INK, X, 440);
  x.textAlign = 'right'; put(missionsLine(c.done.size, c.all).toUpperCase(), `600 30px ${B}`, DIMB, STORY_W - X, 440); x.textAlign = 'left';
  const gap = 14, sw = (TW - gap * (c.all - 1)) / c.all;
  for (let i = 0; i < c.all; i++) {
    const sx = X + i * (sw + gap);
    pill(sx, 470, sw, 16, 8); x.fillStyle = c.done.has(i) ? ACCENT : TRACKB; x.fill();
    if (c.done.has(i)) { pill(sx + 1, 471, sw - 2, 14, 7); x.strokeStyle = INK; x.lineWidth = 2; x.stroke(); }
  }
  // The middle: the quote as big as the room allows, the mission it answered, then the pattern. Set a little above the centre of the room.
  const TOP = 560, BOTTOM = BLOCK_Y - 50, LH = 1.2, SS = 34, LS = 28, PS = 58;
  const SF = `500 ${SS}px ${B}`, LF = `600 ${LS}px ${B}`, PF = `700 ${PS}px ${D}`, GF = `800 200px ${D}`, qf = (s: number) => `700 ${s}px ${D}`;
  const block = (ls: string[], font: string, s: number, color: string, top: number) => { ls.forEach((l, i) => put(l, font, color, X, top + s * 0.95 + i * s * LH)); return top + ls.length * s * LH; };
  x.font = GF; const gm = x.measureText('“'), markH = gm.actualBoundingBoxAscent + gm.actualBoundingBoxDescent; // the mark sits above the baseline: its descent is negative
  const src = wrap(`— ${c.src}`, SF, 1), pat = c.me ? wrap(c.me, PF, 3) : [];
  const fixed = markH + 28 + 20 + SS * LH + (pat.length ? 60 + 6 + 22 + LS * LH + 14 + pat.length * PS * LH : 0);
  const q = `${answerLine(c.a.t)}”`, room = BOTTOM - TOP - fixed;
  const size = [96, 84, 72, 62, 54].find((s) => wrap(q, qf(s)).length * s * LH <= room) ?? 54;
  const lines = wrap(q, qf(size), Math.max(1, Math.floor(room / (size * LH))));
  let y = TOP + Math.max(0, room - lines.length * size * LH) * 0.4;
  put('“', GF, TRACKB, X - 6, y + gm.actualBoundingBoxAscent);
  y = block(lines, qf(size), size, INK, y + markH + 28);
  y = block(src, SF, SS, DIMB, y + 20);
  if (pat.length) {
    x.fillStyle = INK; x.fillRect(X, y + 60, 72, 6);
    y = block([fill(t2('So far · from {n} reflections', 'Finora · da {n} riflessioni'), { n: c.refl }).toUpperCase()], LF, LS, DIMB, y + 88);
    block(pat, PF, PS, INK, y + 14);
  }
  // The one navy block: the line and the address, above the strip a story covers with its reply bar.
  x.fillStyle = INK; pill(0, BLOCK_Y, STORY_W, STORY_H - BLOCK_Y, 0); x.fill();
  const slogan = wrap(tr('Make something companies can hire you for.'), `800 72px ${D}`, 3); // up to three lines in every language
  slogan.forEach((l, k) => put(l, `800 72px ${D}`, WHITE, X, BLOCK_Y + 130 + k * 84));
  put(location.host, `700 36px ${B}`, '#A9B4D0', X, BLOCK_Y + 130 + slogan.length * 84 + 40);
  return new Promise((res) => cv.toBlob(res, 'image/png'));
};
let cardBusy = false; // one tap, one download
const shareCard = async () => { if (cardBusy) return; cardBusy = true; try { await shareCardNow(); } finally { window.setTimeout(() => { cardBusy = false; }, 900); } };
const shareCardNow = async () => {
  const blob = await cardImage(), c = cardData();
  const text = c.me ? tr('My Slash card so far: {s}').replace('{s}', c.me) : tr('Testing {f} on slashkern.').replace('{f}', tr(S.field));
  if (!blob) return shareText('slashkern', text, `${location.origin}/`, 'Link copied.');
  const file = new File([blob], 'my-slash-card.png', { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'slashkern', text }); return; }
    catch (e) { if ((e as DOMException).name === 'AbortError') return; }
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'my-slash-card.png'; a.click();
  window.setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  say('Card saved as an image.');
};
kScr.querySelectorAll<HTMLElement>('[data-k-share]').forEach((b) => b.addEventListener('click', () => {
  track('share'); // counts the tap on Share (card or dare), not whether the person finished sending it
  if (b.dataset.kShare === 'card') { void shareCard(); return; }
  markDared();
  void shareText('slashkern', tr('I dare you: {m}. Answer it on slashkern.').replace('{m}', tr(F().m[0][1])), `${location.origin}/?dare=${encodeURIComponent(S.field)}.0`, 'Link copied.');
}));

// Pilot: send your trail (answers + reflections) to the slashkern team as plain text.
const trailText = () => {
  const L = [fill(t2('slashkern · trail of {n}', 'slashkern · traccia di {n}'), { n: S.name }), fill(t2('Field: {f}', 'Campo: {f}'), { f: tr(S.field) }), ''];
  S.answers.forEach((a, k) => {
    L.push(`${k + 1}. ${tr(FIELDS[a.f].m[a.i][1])} (${day(a.at)})`, a.t);
    if (a.ai) L.push(tr(AI_TAG));
    if (a.r) {
      const p: string[] = [];
      if (a.r.e) p.push(tr(FEEL_EN[a.r.e]));
      if (a.r.again) p.push(fill(t2('Again: {a}', 'Di nuovo: {a}'), { a: tr(AGAIN_EN[a.r.again]) }));
      if (a.r.hard) p.push(fill(t2('Hardest: {h}', 'Più difficile: {h}'), { h: a.r.hard }));
      if (a.r.tip) p.push(fill(t2('Tip: {t}', 'Consiglio: {t}'), { t: a.r.tip }));
      L.push(p.join(' | '));
    }
    L.push('');
  });
  if (S.mine.length) L.push(`Slash: ${S.mine.join(' > ')}`);
  if (!$('kSample').hidden) return L.join('\n');
  L.push(fill(t2('First guess: {g}', 'Prima ipotesi: {g}'), { g: $('kGuess').textContent ?? '' }));
  if (S.guess) L.push(fill(t2('Reply: {r}', 'Risposta: {r}'), { r: tr(S.guess) }));
  return L.join('\n');
};
document.querySelectorAll<HTMLElement>('[data-k-send]').forEach((b) => b.addEventListener('click', () => {
  if (!S.answers.length) { say('Answer a project first.'); return; }
  void shareText('slashkern trail', trailText(), undefined, 'Trail copied. Paste it in a message to the slashkern team.');
}));

// Incoming dare link: /?dare=<Field>.<missionIndex>, validated against known missions.
let dare: { f: string; i: number } | null = null;
const dp = new URLSearchParams(location.search).get('dare');
if (dp) {
  const [f, i] = dp.split('.'); const n = Number(i);
  if (!DEMO && FIELDS[f] && Number.isInteger(n) && n >= 0 && n < FIELDS[f].m.length) dare = { f, i: n }; // a dare is for the real trail: the sample profile never shows one
  dropParam(new URLSearchParams(location.search), 'dare');
}
function renderDare() { $('kDare').hidden = !dare; if (dare) setT($('kDareT'), FIELDS[dare.f].m[dare.i][1]); }
$('kDareGo').addEventListener('click', () => { if (dare) openAnswer(dare.f, dare.i, true); });

// Co-op with a friend (coop.ts): two missions in every field are finished by two people through links, with no server. A link carries one answer
// after the #; the friend's reply comes back the same way. The pair lives in S.coops, so it survives a reload and syncs with the trail.
function isCoop(f: string, i: number) { return COOP_KEYS.includes(`${f}.${i}`); }
const A_FRIEND = t2('A friend', 'Qualcuno'); // a co-op partner who left no name
const myName = () => [...cleanName(S.name)].slice(0, MAX_NAME).join('') || tr(A_FRIEND);
const coopAsk = (f: string, i: number) => tr(ASK[`${f}.${i}`]);
const keepCoops = () => { S.coops = S.coops.slice(-30); };
let coopIn: Coop | null = null, coopNote = '', coopGo = false; // the friend's request waiting to be answered; a one-line notice (and whether to open slashkern) after a link was opened
function receiveCoopReply(c: Coop) { // someone answered my co-op: keep both halves (coop.ts decides which row it belongs to, or that it is not for me)
  const res = settleReply(S.coops, c, Date.now()), who = c.m || tr(A_FRIEND);
  if (res.status === 'stranger') { coopNote = tr(t2('This reply is not for one of your projects.', 'Questa risposta non è per un tuo progetto.')); return; }
  if (res.status === 'own') { coopNote = tr(t2('This is the reply you sent.', 'Questa è la risposta che hai mandato tu.')); return; }
  if (res.status !== 'same') { S.coops = res.coops; keepCoops(); save(); }
  coopNote = fill(t2('{n} replied. It is on your page.', '{n} ha risposto. La trovi nella tua pagina.'), { n: who }); coopGo = true;
}
// The link stays in the address bar until the request is answered or dismissed, so a reload, "Open in Safari" from a chat app's browser or a bookmark still finds it.
function dropCoopHash() { if (location.hash.startsWith('#coop=')) try { history.replaceState(null, '', location.pathname.replace(/^\/{2,}/, '/') + location.search); } catch { /* leave the address as it is */ } }
function readCoopLink() {
  const c = decodeCoop(location.hash);
  if (c?.r) { receiveCoopReply(c); dropCoopHash(); } // a reply is kept in the trail at once
  else if (c) coopIn = c;
  else if (location.hash.startsWith('#coop=')) { coopNote = tr(t2('This link is broken: ask your friend to send it again.', 'Questo link non funziona: chiedi di rimandartelo.')); dropCoopHash(); } // a chat app may cut or add characters to a link
}
readCoopLink();
addEventListener('hashchange', () => { if (location.hash.startsWith('#coop=')) location.reload(); }); // a link opened while slashkern is already open changes only the fragment
function sendCoop(a: Answer) { // my answer goes to a friend, with the task they will do
  if (!isCoop(a.f, a.i)) return; // only the 12 co-op missions have a friend's task
  const c: Coop = { v: 1, f: a.f, i: a.i, n: myName(), a: a.ai ? `${clip(a.t, MAX_ANSWER - 40)}\n(${tr(AI_TAG)})` : a.t }, mine = clip(a.t, MAX_ANSWER); // a friend is told when it was made with AI help
  const had = S.coops.find((r) => r.role === 'out' && r.f === a.f && r.i === a.i && r.at === a.at);
  if (had) had.mine = mine; // the answer may have been edited since the last send: the row keeps what goes out now
  else S.coops.push({ role: 'out', f: a.f, i: a.i, at: a.at, with: '', mine, theirs: '' });
  keepCoops(); save(); renderCoops(); track('share');
  const text = tr('{n} wants your take on “{m}”: {ask} Open the link, it takes a minute.').replace('{n}', c.n).replace('{m}', tr(FIELDS[a.f].m[a.i][1])).replace('{ask}', coopAsk(a.f, a.i));
  void shareText('slashkern', text, coopUrl(location.origin, c), 'Link copied. Send it to your friend.');
}
function sendCoopReply(r: CoopRec) { // my reply goes back, with the answer it is about, so the first person sees both
  const c: Coop = { v: 1, f: r.f, i: r.i, n: r.with, a: r.theirs, r: r.mine, m: myName() };
  const text = tr('{n} answered “{m}”. Open the link to read it.').replace('{n}', c.m!).replace('{m}', tr(FIELDS[r.f].m[r.i][1]));
  void shareText('slashkern', text, coopUrl(location.origin, c), 'Link copied. Send it back to your friend.');
}
function renderCoopIn() { // the card for a friend's request
  const c = coopIn, card = $('kCoop');
  card.hidden = !c;
  if (!c) return;
  const who = c.n || tr(A_FRIEND);
  setD($('kCoL'), `Co-op · ${who}`); setD($('kCoT'), tr(FIELDS[c.f].m[c.i][1]));
  setD($('kCoQL'), fill(t2('{n}’s answer', 'La risposta di {n}'), { n: who })); setD($('kCoQ'), c.a);
  setD($('kCoAsk'), coopAsk(c.f, c.i));
  setT(kScr.querySelector<HTMLElement>('label[for="kCoTa"]')!, 'Your reply'); // the label only a screen reader sees
}
const afterCoopCard = () => land(kScr.querySelector<HTMLElement>('#k-missions h4')!); // the card held the focus and is gone
$('kCoNo').addEventListener('click', () => { coopIn = null; dropCoopHash(); renderCoopIn(); afterCoopCard(); });
$('kCoSelf').addEventListener('click', () => {
  const c = coopIn; if (!c) return;
  if (!S.fields.includes(c.f)) S.fields.push(c.f);
  if (c.f !== S.field) switchField(c.f);
  openAnswer(c.f, c.i);
});
$('kCoSend').addEventListener('click', once(() => {
  const c = coopIn, ta = $<HTMLTextAreaElement>('kCoTa'), t = ta.value.trim();
  if (!c) return;
  if (!t) { say('Write something first.'); ta.focus(); return; }
  const rec: CoopRec = { role: 'in', f: c.f, i: c.i, at: Date.now(), with: c.n, mine: clip(t, MAX_REPLY), theirs: c.a };
  S.coops.push(rec); keepCoops(); save();
  ta.value = ''; coopIn = null; dropCoopHash(); renderCoopIn(); renderCoops(); afterCoopCard();
  sendCoopReply(rec);
}));
$('kDrCoop').addEventListener('click', () => { if (lastAns && S.answers.includes(lastAns)) sendCoop(lastAns); });
$('kDrDare').addEventListener('click', () => { // the dare is the mission just finished, not the field's first one
  const f = cur.f, i = cur.i; if (!FIELDS[f]?.m[i]) return;
  track('share'); markDared();
  void shareText('slashkern', tr('I dare you: {m}. Answer it on slashkern.').replace('{m}', tr(FIELDS[f].m[i][1])), `${location.origin}/?dare=${encodeURIComponent(f)}.${i}`, 'Link copied.');
});
function renderCoops() { // slashkern: every co-op mission answered, sent, or replied to, with both halves once they are in
  const card = $('kCoops'), box = $('kCoopL');
  const mk = (tag: string, cls = '', text = '') => { const e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; };
  const row = (title: string, status: string, quotes: [string, string][], act?: [string, () => void]) => {
    const r = mk('div', 'k-coopr'); r.append(mk('div', 'k-l', title), mk('p', 'k-coopst', status));
    for (const [who, text] of quotes) { const q = mk('div', 'k-coq'); q.append(mk('div', 'k-l', who), mk('p', '', text)); r.append(q); }
    if (act) { const b = mk('button', 'k-ask-btn', act[0]) as HTMLButtonElement; b.type = 'button'; b.setAttribute('aria-label', `${act[0]}: ${title}`); b.addEventListener('click', act[1]); r.append(b); } // the same two words repeat on every row
    return r;
  };
  const rows: { pri: number; el: HTMLElement }[] = [], used = new Set<CoopRec>(), seen = new Set<string>(), me = tr('You'), unknown = tr(A_FRIEND);
  // "Done with Sara", or "Done with a friend" when the friend left no name: a sentence of its own, so every language can bend "a friend" its way.
  const doneWith = (n: string) => (n ? fill(t2('Done with {n}', 'Fatto con {n}'), { n }) : tr(t2('Done with a friend', 'Fatto con qualcuno')));
  for (const a of [...S.answers].reverse()) {
    if (!isCoop(a.f, a.i) || seen.has(`${a.f}.${a.i}`)) continue;
    seen.add(`${a.f}.${a.i}`);
    const rec = S.coops.find((r) => r.role === 'out' && r.f === a.f && r.i === a.i && (r.at === a.at || r.mine.trim() === clip(a.t, MAX_ANSWER).trim()));
    if (rec) used.add(rec);
    rows.push({ pri: rec?.theirs ? 0 : rec ? 1 : 2, el: row(tr(FIELDS[a.f].m[a.i][1]), !rec ? tr('Not sent yet') : rec.theirs ? doneWith(rec.with) : tr('Sent. Waiting for a reply.'),
      rec?.theirs ? [[me, clip(a.t, MAX_ANSWER)], [rec.with || unknown, rec.theirs]] : [], [tr(rec ? 'Send again' : 'Send to a friend'), () => sendCoop(a)]) });
  }
  for (const r of [...S.coops].reverse()) {
    if (r.role === 'out' && !used.has(r)) rows.push({ pri: r.theirs ? 0 : 1, el: row(tr(FIELDS[r.f].m[r.i][1]), r.theirs ? doneWith(r.with) : tr('Sent. Waiting for a reply.'), r.theirs ? [[me, r.mine], [r.with || unknown, r.theirs]] : []) }); // a second friend's reply, or an answer deleted since
    if (r.role === 'in') rows.push({ pri: 0, el: row(tr(FIELDS[r.f].m[r.i][1]), r.with ? fill(t2('You replied to {n}', 'Hai risposto a {n}'), { n: r.with }) : tr(t2('You replied to a friend', 'Hai risposto a qualcuno')), [[r.with || unknown, r.theirs], [me, r.mine]], [tr('Send again'), () => sendCoopReply(r)]) });
  }
  card.hidden = !rows.length;
  box.replaceChildren(...rows.sort((x, y) => x.pri - y.pri).slice(0, 12).map((x) => x.el)); // finished pairs first, so a reply that just arrived is never past the cut
}

// Settings
// A language switch inside the demo: the sample texts nobody edited follow it (demo.ts), so the trail never reads half in each language.
const rewriteSample = (toIt: boolean) => {
  const sw = (cur: string, pair?: Pair) => swapSample(cur, pair, toIt);
  const idea = (cur: string) => sw(cur, SAMPLE_IDEA.find((p) => p[toIt ? 0 : 1] === cur));
  S.answers = S.answers.map((a) => {
    const s = SAMPLE_ANSWERS.find((x) => x.f === a.f && x.i === a.i);
    if (!s) return a;
    return { ...a, t: sw(a.t, s.t), r: a.r && { ...a.r, ...(a.r.hard !== undefined ? { hard: sw(a.r.hard, s.hard) } : {}), ...(a.r.tip !== undefined ? { tip: sw(a.r.tip, s.tip) } : {}) } };
  });
  S.mine = S.mine.map(idea);
  S.msgs = S.msgs.map((m) => (m.who === 'me' ? { ...m, t: idea(m.t) } : m));
};
const kDesc = document.querySelector('meta[name="description"]'), descEn = kDesc?.getAttribute('content') ?? ''; // the page description follows the language like the title does
const kLangSel = () => document.getElementById('kLang') as HTMLSelectElement | null;
const setLang = (l: Lang) => {
  if (DEMO) rewriteSample(l === 'it'); // before the save: the stored demo follows the language too
  S.lang = l; save(); document.documentElement.lang = l;
  if (DEMO) kScr.style.setProperty('--demo-label', JSON.stringify(tr('Demo profile'))); // the tag over every sheet (app.css)
  document.title = tr('slashkern · Make something companies can hire you for');
  kDesc?.setAttribute('content', tr(descEn));
  kTxt.forEach((e) => { const en = e.dataset.en; if (!en) return; if (e.classList.contains('k-xb')) e.textContent = tr(en); else e.innerHTML = tr(en); });
  for (const page of ['privacy', 'terms', 'about']) document.querySelectorAll<HTMLAnchorElement>(`a[href^="/${page}/"]`).forEach((a) => { // after the texts above: they bring their own links back
    const h = [a.hash.startsWith('#keep') ? 'keep' : '', l === 'en' ? '' : l].filter(Boolean).join('-'); // "What we keep" lands on its table in this language: #keep, #keep-it...
    a.setAttribute('href', `/${page}/${h && `#${h}`}`);
  });
  document.querySelectorAll<HTMLElement>('[aria-label]').forEach((e) => { const en = (e.dataset.enLabel ??= e.getAttribute('aria-label') || ''); e.setAttribute('aria-label', tr(en)); });
  if (fb.dataset.src) fb.textContent = tr(fb.dataset.src);
  { const sel = kLangSel(); if (sel) sel.value = l; } setPic(); helpText();
  setLvl(); renderProgress(); renderChat(); renderAcct(); renderFirstPick(); renderTrend(); markFirst(); refreshVoice(); makeD.relabel(); makeF.relabel();
};
// The app starts in the phone's language (firstLang); Settings has one menu to change it, so more languages never mean more buttons.
const kLang = $('kLang') as HTMLSelectElement;
kLang.addEventListener('change', () => setLang(isLang(kLang.value) ? kLang.value : 'en'));
$('kAv').addEventListener('click', () => openSheetEl(kSet, $('kSetX')));
$('kSetX').addEventListener('click', () => dismiss(kSet));
$('kChField').addEventListener('click', () => { kSet.hidden = true; openStart(true); });
// Feedback goes to the founder's inbox through the person's own mail app; nothing is sent by slashkern.
const CONTACT = 'manuel@trykern.it';
$('kFeed').addEventListener('click', () => {
  location.href = `mailto:${CONTACT}?subject=${encodeURIComponent('slashkern feedback')}&body=${encodeURIComponent(`\n\n---\nslashkern 1.0 · ${S.lang.toUpperCase()}`)}`;
  say(fill(t2('Opening your email app. Or write to {e}', 'Si apre la tua app di posta. Oppure scrivi a {e}'), { e: CONTACT }));
});
$('kExp').addEventListener('click', () => download(JSON.stringify({ ...snapshot(), exportedAt: new Date().toISOString() }, null, 2), 'slashkern-data.json', 'application/json'));
// Weekly calendar reminder (.ics): works in every calendar app, no notifications permission, no streaks.
const remind = () => {
  const esc = (s: string) => s.replace(/[\\;,]/g, (m) => '\\' + m).replace(/\n/g, '\\n');
  const p = (n: number) => String(n).padStart(2, '0');
  const d = new Date(); d.setDate(d.getDate() + 1);
  const start = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T180000`;
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  const title = esc(tr('slashkern: make one small thing'));
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//slashkern//slashkern//EN', 'BEGIN:VEVENT',
    `UID:kern-${Date.now()}@${location.host}`, `DTSTAMP:${stamp}`, `DTSTART:${start}`, 'DURATION:PT20M', 'RRULE:FREQ=WEEKLY',
    `SUMMARY:${title}`, `DESCRIPTION:${esc(tr('No pressure. Open slashkern when you feel like it.'))} ${location.origin}/`, `URL:${location.origin}/`,
    'BEGIN:VALARM', 'ACTION:DISPLAY', 'TRIGGER:PT0M', `DESCRIPTION:${title}`, 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  download(ics, 'slashkern-reminder.ics', 'text/calendar');
  say('Open the file to add the reminder to your calendar.');
};
$('kRemind').addEventListener('click', remind);
$('kDrRem').addEventListener('click', remind); // the same reminder, offered on the done screen
$('kDel').addEventListener('click', async () => {
  if (!confirm(tr(DEMO ? 'This resets the demo to its sample answers. Continue?' : 'This deletes your answers on this device. Continue?'))) return;
  await eraseStats(); // also deletes what was counted for this device (never from the demo)
  try { localStorage.removeItem(KEY); } catch { /* nothing stored */ } wipeExtras();
  location.replace('/');
});

// Install
type BIP = Event & { prompt: () => Promise<void>; userChoice: Promise<unknown> };
let bip: BIP | null = null;
const kInst = $('kInst');
const standalone = matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); bip = e as BIP; kInst.hidden = false; });
kInst.addEventListener('click', async () => { if (!bip) return; await bip.prompt(); await bip.userChoice; bip = null; kInst.hidden = true; });
addEventListener('appinstalled', () => say('slashkern is installed.'));
$('kIos').hidden = !(/iphone|ipad|ipod/i.test(navigator.userAgent) && !standalone);
addEventListener('offline', () => say('You are offline. Your answers are saved on this device.'));
// Other tab changed the data: pick it up instead of overwriting it later.
// Idle: start over from its copy (a reload). Something open (a sheet, a text box): leave the screen and the typed text alone; the next save merges the other copy first (absorb).
// A copy that was removed (Delete my data in the other tab) always reloads: this page must not write the trail back.
const typing = () => document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement;
addEventListener('storage', (e) => { if (e.key === KEY && (e.newValue === null || !(topLayer() || typing()))) location.reload(); });
addEventListener('pageshow', (e) => { if (e.persisted && absorb()) refresh(); }); // back from another page: the cached screen may be older than storage

// Offline support (production only, so dev reloads never serve stale files)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => navigator.serviceWorker.ready)
      .then((r) => r.active?.postMessage({ cache: [location.origin + '/', ...performance.getEntriesByType('resource').map((e) => e.name).filter((u) => u.startsWith(location.origin) && !u.includes('/api/'))] }))
      .catch(() => { /* offline mode unavailable; app still works online */ });
  });
}

// Voice (voice.ts): dictation in the text boxes, read aloud on the assistant's questions. The first time the microphone is used, a one-time sheet says where the voice goes.
let micGo: (() => void) | null = null;
const micOk = () => { try { return localStorage.getItem(MIC_OK) === '1'; } catch { return false; } };
voice.lang = () => S.lang; voice.tr = (en) => tr(en); voice.say = (en) => say(en);
voice.consent = (go) => { if (micOk()) { go(); return; } micGo = go; openSheetEl(kMic, $('kMicOk')); };
$('kMicOk').addEventListener('click', () => {
  try { localStorage.setItem(MIC_OK, '1'); } catch { /* asked again next time */ }
  const go = micGo; micGo = null; closeSheet(kMic); go?.(); // still inside the tap, which iOS needs to start listening
});
$('kMicNo').addEventListener('click', () => { micGo = null; dismiss(kMic); });
const addListen = (p: HTMLElement, text: string) => { const b = listenButton(text); if (b) p.append(b); }; // a small Listen button on an assistant question
attachMic(kTa, 'inside'); attachMic(kF2Ta, 'inside'); attachMic($<HTMLTextAreaElement>('kCoTa'), 'inside'); attachMic(inEl, 'after', inEl.closest('.k-comp') ?? undefined);

// "Make a first version with AI" (make.ts, mode 'make' of the coach function): at the end of a project, only when the person asks, from the idea they wrote. The assistant itself keeps asking questions only.
// The result is theirs to edit, it carries the chip "Made with AI help", and "Use this as my project" saves it with ai: true (shown on Your page, the Slash card and the trail text, never hidden).
const MK = {
  go: t2('Make a first version with AI', 'Crea una prima versione con l’AI'),
  busy: t2('Making it…', 'La sto creando…'),
  ready: t2('Here is a first version. Edit it as you like.', 'Ecco una prima versione. Modificala come vuoi.'),
  label: t2('Your first version', 'La tua prima versione'),
  note: t2('Anything in [brackets] is a guess: replace it with your own detail.', 'Tutto ciò che è tra [parentesi quadre] è un’ipotesi: sostituiscilo con un tuo dettaglio.'),
  use: t2('Use this as my project', 'Usa questa come mio progetto'),
  more: t2('Make another', 'Creane un’altra'),
  keep: t2('Keep mine', 'Tieni la mia'),
  saved: t2('Saved as your project, with the tag “Made with AI help”.', 'Salvata come tuo progetto, con l’etichetta “Creato con l’aiuto dell’AI”.'),
  kept: t2('Okay, your own project stays as it is.', 'Va bene, il tuo progetto resta com’è.'),
  why: {
    offline: t2('You are offline. Your own project is saved.', 'Sei offline. Il tuo progetto è salvato.'),
    rate: t2('Too many tries in a minute. Wait a little, then try again.', 'Troppi tentativi in un minuto. Aspetta un po’ e riprova.'),
    day: t2('That is enough first versions for today. Your own project is saved.', 'Per oggi bastano le prime versioni. Il tuo progetto è salvato.'),
    down: t2('Slash is not available right now. Your own project is saved.', 'Slash non è disponibile in questo momento. Il tuo progetto è salvato.'),
    short: t2('Write a little more first: the AI needs at least 20 characters of your own idea.', 'Scrivi ancora un po’: l’AI ha bisogno di almeno 20 caratteri della tua idea.'),
    unusable: t2('Slash could not make a first version from this. Your own project is saved.', 'Slash non è riuscito a creare una prima versione da questo. Il tuo progetto è salvato.'),
  },
};
const makeRaw = () => { try { return localStorage.getItem(MAKES); } catch { return null; } };
// Its own request: the made text is under `text` (not `reply`), a pause is `reply` with no text, and every failure becomes a reason (make.ts parseMake).
async function postMake(body: MakeBody): Promise<MakeResult> {
  const ctl = new AbortController(), to = window.setTimeout(() => ctl.abort(), 30000);
  try {
    const r = await fetch('/api/coach', { method: 'POST', headers: { 'content-type': 'application/json' }, signal: ctl.signal, body: JSON.stringify(body) });
    return parseMake(r.status, await r.json().catch(() => null));
  } catch { return { kind: 'error', why: navigator.onLine === false ? 'offline' : 'down' }; } finally { clearTimeout(to); }
}
type MakeCtx = { key: () => string; field: () => string; title: () => string; idea: () => string; qa: () => QaPair[]; answer: () => Answer | undefined };
let makeN = 0;
function makePanel(host: HTMLElement, ctx: MakeCtx) {
  const mk = <K extends keyof HTMLElementTagNameMap>(tag: K, cls = '', text = ''): HTMLElementTagNameMap[K] => Object.assign(document.createElement(tag), { className: cls, textContent: text });
  const id = `kMk${makeN++}`;
  const go = mk('button', 'k-ask-btn k-make-go'), msg = mk('p', 'k-l k-s k-make-msg'), out = mk('div', 'k-make-out'), chip = mk('span', 'k-ai-chip'), lab = mk('label', 'k-sr k-l'), box = mk('textarea'), note = mk('p', 'k-l k-s');
  const row = mk('div', 'k-btnrow'), use = mk('button', 'k-go'), more = mk('button', 'k-ask-btn'), keep = mk('button', 'k-sk');
  // Slash beside the status line: thinking (and speaking) while the draft is requested, happy when it arrives. Only a face: the waiting is said to a screen reader by its own live region, `wait`.
  const face = mk('span', 'k-slash-av k-slash-md'), wait = mk('span', 'k-sr'), line = mk('div', 'k-make-say');
  go.type = use.type = more.type = keep.type = 'button'; msg.setAttribute('role', 'status'); msg.setAttribute('aria-live', 'polite');
  wait.setAttribute('role', 'status'); wait.setAttribute('aria-live', 'polite'); face.hidden = line.hidden = true; line.append(face, msg);
  box.id = id; box.rows = 8; box.maxLength = 2000; lab.htmlFor = id;
  row.append(use, more, keep); out.append(chip, lab, box, note, row); host.replaceChildren(go, wait, line, out);
  attachMic(box, 'inside'); // the edit box takes dictation too
  let busy = false;
  const relabel = () => { go.textContent = tr(busy ? MK.busy : MK.go); chip.textContent = tr(AI_TAG); lab.textContent = tr(MK.label); note.textContent = tr(MK.note); use.textContent = tr(MK.use); more.textContent = tr(busy ? MK.busy : MK.more); keep.textContent = tr(MK.keep); };
  const tell = (text: string) => { msg.textContent = text; msg.hidden = !text; line.hidden = face.hidden && msg.hidden; };
  const look = (mood: Mood | null, speaking = false) => { face.innerHTML = mood ? slash(mood, speaking) : ''; face.hidden = !mood; line.hidden = face.hidden && msg.hidden; };
  const left = () => makesLeft(makeRaw(), ctx.key(), new Date().toDateString());
  const sync = () => { // shown only for a saved project the person wrote (not one that is already AI-made) with an idea of 20+ characters
    const a = ctx.answer();
    host.hidden = !a || !!a.ai || !canMake(ctx.idea());
    out.hidden = true; tell(''); look(null); wait.textContent = ''; go.hidden = false; busy = false; go.removeAttribute('aria-disabled'); more.removeAttribute('aria-disabled'); more.hidden = false; relabel();
  };
  const run = async () => {
    if (busy) return;
    const idea = ctx.idea(), qa = ctx.qa();
    if (!canMake(idea)) { tell(tr(MK.why.short)); return; }
    if ([idea, ...qa.flatMap((p) => [p.q, p.a])].some((t) => HEAVY.test(t))) { tell(tr(HEAVY_REPLY)); return; } // heavy words: nothing is sent, the project pauses (the server checks again)
    if (left() <= 0) { tell(tr(MK.why.day)); return; }
    busy = true; go.setAttribute('aria-disabled', 'true'); more.setAttribute('aria-disabled', 'true'); relabel(); tell(''); look('thinking', true); wait.textContent = tr(MK.busy);
    const res = await postMake(makeBody(S.lang, ctx.field(), ctx.title(), idea, qa));
    busy = false; go.removeAttribute('aria-disabled'); more.removeAttribute('aria-disabled'); relabel(); wait.textContent = '';
    look(res.kind === 'text' ? 'happy' : null); // a made draft is the only thing Slash smiles at: a pause or an error shows no face
    if (res.kind === 'text') {
      try { localStorage.setItem(MAKES, countMake(makeRaw(), ctx.key(), new Date().toDateString())); } catch { /* storage blocked: no daily count */ }
      box.value = res.text.slice(0, 2000); out.hidden = false; go.hidden = true; more.hidden = left() <= 0; tell(tr(MK.ready)); reveal(out);
    } else if (res.kind === 'pause') tell(res.reply); // the fixed pause text, as it came: not an AI-made version, no chip
    else tell(tr(MK.why[res.why]));
  };
  go.addEventListener('click', run); more.addEventListener('click', run);
  use.addEventListener('click', once(() => {
    const a = ctx.answer(), t = box.value.trim();
    if (!t) { say('Write something first.'); box.focus(); return; }
    if (!a) return;
    a.t = t.slice(0, 2000); a.ai = true; a.ed = stamp(ver(a)); // the AI mark stays with the project, whatever is edited later
    const kept = save(); renderProgress(); out.hidden = true; go.hidden = true; tell(kept ? tr(MK.saved) : tr(UNSAVED));
  }));
  keep.addEventListener('click', () => { out.hidden = true; go.hidden = false; look(null); tell(tr(MK.kept)); });
  host.hidden = true; relabel();
  return { sync, relabel };
}
const makeD = makePanel($('kMakeD'), { key: () => `${cur.f}.${cur.i}`, field: () => cur.f, title: () => tr(FIELDS[cur.f].m[cur.i][1]), idea: () => lastAns?.t ?? '', qa: () => [], answer: () => (lastAns && S.answers.includes(lastAns) ? lastAns : undefined) });
const makeF = makePanel($('kMakeF'), {
  key: () => { const st = starter(); return `${st?.f}.${st?.i}`; }, field: () => starter()?.f ?? 'Video', title: () => { const st = starter(); return st ? tr(FIELDS[st.f].m[st.i][1]) : ''; },
  idea: () => firstAns.map((a) => a.trim()).filter(Boolean).join('\n'), qa: () => firstSteps().map((q, k) => ({ q: tr(q), a: (firstAns[k] ?? '').trim() })), // the questions of the first run and what was written to each
  answer: () => (lastAns && S.answers.includes(lastAns) ? lastAns : undefined),
});

// Pieces (pieces.ts): five small steps that end in one page to show. The screens are pieces-ui.ts; Slash's question in a step is the same one the first run uses (slashAsk).
// The AI's answer to the prompt a piece sends (the Prompting piece): the safeguards of "Try your prompt on the AI" apply: distress words are never sent, 5 tries a day, plain text back.
const runPiece = async (prompt: string): Promise<RunReply> => {
  if (prompt.length < RUN_MIN || prompt.length > RUN_MAX) return { ok: false, why: 'long' };
  if (HEAVY.test(prompt)) return { ok: false, why: 'pause', text: tr(HEAVY_REPLY) };
  if ((runsToday().piece || 0) >= RUN_DAY) return { ok: false, why: 'day' };
  countRun('piece');
  const reply = await postCoach({ mode: 'run', lang: S.lang, field: 'Prompting', prompt });
  return reply ? { ok: true, text: reply } : { ok: false, why: 'offline' };
};
Object.assign(piecesUi, initPieces({
  S, tr, fill, save, say, land, once, when, ask: slashAsk, run: runPiece,
  setName: (v) => { S.name = cleanName(v); save(); renderMe(); },
  share: (title, text, url) => { void shareText(title, text, url, 'Link copied.'); },
}));

// Escape closes the top layer even when focus has dropped to the page (after a swap, or a button that disappeared).
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape' || e.defaultPrevented) return;
  if (!kMic.hidden) closeSheet(kMic);
  else if (!kPwS.hidden) closeSheet(kPwS);
  else if (!kRw.hidden) closeWin();
  else if (!kSet.hidden) closeSheet(kSet);
  else if (!kFld.hidden) closeSheet(kFld);
  else if (!kSheet.hidden) closeSheet(kSheet);
  else if (kStart.classList.contains('on') && S.onboarded) closePicker();
});

// Start
renderMe();
applyTheme();
applyText();
applyField(false);
setLang(S.lang);
renderDare();
renderCoopIn(); renderCoops();
moveInd(onTab(), false);
setMode(mode);
renderAcct();
booted = true;
if (DEMO) {
  const LEAVE_ARM_MS = 4000, kDemo = $('kDemo'); let armed = 0;
  kDemo.hidden = false; $('kAiDemo').hidden = false; $('kAiNote').hidden = true; $('kXDemo').hidden = false; kScr.classList.add('demo'); // app.css repeats a Demo tag over every sheet, where the scrim covers this marker
  // The first tap says what the marker does, a second one within a few seconds leaves: a stray tap mid-pitch must not drop the sample trail.
  kDemo.addEventListener('click', () => {
    if (Date.now() - armed > LEAVE_ARM_MS) { armed = Date.now(); say('Tap again to leave the demo.'); return; }
    location.href = '/?demo=off';
  });
  document.querySelectorAll<HTMLElement>('[data-k-send], #kExp, .k-pilot').forEach((e) => { e.hidden = true; }); // sample data is not sent or exported as if it were a real trail (.k-pilot: the card that asks for it)
}
if (recovered) say(recovered);
if (coopNote) { say(coopNote); if (coopGo && S.onboarded) goTab('yourkern'); }
track('visit'); // once a day per device, only for people who said yes
if (!S.onboarded) openFirst(); // the four first-run screens come first, right after the loader
else if (!S.adult) openStart(); // onboarded before the 18+ box moved onto the interests screen, without confirming it
