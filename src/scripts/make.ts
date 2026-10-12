// "Make a first version with AI" (mode 'make' of netlify/functions/coach.mts): the request, the reply and the daily limit, free of DOM code (and of imports) so scripts/check-sync.ts can test them (npm test).
// The assistant itself only asks questions; this is a separate, explicit action, at the end of a project, from the idea the person described. The result is theirs to edit, and it is always marked "Made with AI help".
export const MAKE_IDEA_MIN = 20, MAKE_IDEA_MAX = 1500, MAKE_MISSION_MAX = 200, MAKE_QA_PAIRS = 4, MAKE_QA_MAX = 300; // the server's limits (coach.mts)
export const MAKE_PER_DAY = 3; // first versions per project per day on this device (the server also keeps its own, wider limit)
export type Pair = { q: string; a: string };
export type MakeBody = { mode: 'make'; lang: string; field: string; mission: string; idea: string; qa?: Pair[] };
// What the person sees: a made text, a fixed pause for a heavy word (shown as it is, never as AI-made), or an error that says what to do.
export type MakeResult = { kind: 'text'; text: string } | { kind: 'pause'; reply: string } | { kind: 'error'; why: MakeWhy };
export type MakeWhy = 'offline' | 'rate' | 'day' | 'down' | 'short' | 'unusable';

export const canMake = (idea: string) => idea.trim().length >= MAKE_IDEA_MIN;
const clip = (s: string, n: number) => s.trim().slice(0, n);
export const makeBody = (lang: string, field: string, mission: string, idea: string, qa: Pair[] = []): MakeBody => {
  const pairs = qa.map((p) => ({ q: clip(p.q, MAKE_QA_MAX), a: clip(p.a, MAKE_QA_MAX) })).filter((p) => p.q && p.a).slice(0, MAKE_QA_PAIRS);
  return { mode: 'make', lang, field, mission: clip(mission, MAKE_MISSION_MAX), idea: clip(idea, MAKE_IDEA_MAX), ...(pairs.length ? { qa: pairs } : {}) };
};

// The server's answer. 200 { text, ai: true } is a made text; 200 { reply } is the fixed pause (no text, no AI mark); 400 / 429 / 502 / 503 carry { error }. The text is under `text`, not `reply`.
export const parseMake = (status: number, json: unknown): MakeResult => {
  const j = (json && typeof json === 'object' ? json : {}) as Record<string, unknown>;
  if (status === 200) {
    if (typeof j.text === 'string' && j.ai === true && j.text.trim()) return { kind: 'text', text: j.text };
    if (typeof j.reply === 'string' && j.reply.trim() && j.text === undefined) return { kind: 'pause', reply: j.reply };
    return { kind: 'error', why: 'down' };
  }
  const code = typeof j.error === 'string' ? j.error : '';
  if (status === 429) return { kind: 'error', why: code === 'rate_day' ? 'day' : 'rate' };
  if (status === 400) return { kind: 'error', why: code === 'too_short' && j.in === 'idea' ? 'short' : 'unusable' };
  if (status === 502 && code === 'empty') return { kind: 'error', why: 'unusable' };
  return { kind: 'error', why: 'down' }; // 503 no_key, 502 upstream, anything else: the assistant is not available
};

// Today's count per project, kept on the device: { d: the day, n: { 'Video.0': 2 } }. A new day starts from zero; unreadable storage counts as zero.
export const makesToday = (raw: string | null, key: string, day: string): number => {
  try { const v = JSON.parse(raw || 'null'); return v?.d === day && v.n && typeof v.n === 'object' && Number.isInteger(v.n[key]) ? Math.max(0, v.n[key]) : 0; } catch { return 0; }
};
export const countMake = (raw: string | null, key: string, day: string): string => {
  let n: Record<string, number> = {};
  try { const v = JSON.parse(raw || 'null'); if (v?.d === day && v.n && typeof v.n === 'object') n = v.n; } catch { /* start the day again */ }
  return JSON.stringify({ d: day, n: { ...n, [key]: makesToday(raw, key, day) + 1 } });
};
export const makesLeft = (raw: string | null, key: string, day: string) => Math.max(0, MAKE_PER_DAY - makesToday(raw, key, day));
