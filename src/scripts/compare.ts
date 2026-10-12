// Fields side by side (slashkern): each field's average energy from the "how did it feel" answers, and what that supports saying.
// Pure, so npm test can check it (scripts/check-sync.ts). The screen is in app.ts (renderCompare).
export type Feel = 'flow' | 'ok' | 'drag' | 'easy';
export const SCORE: Record<Feel, number> = { flow: 2, ok: 1, drag: 0, easy: 1 }; // "Too easy" asks for a harder mission: it counts like "fine", never as a dislike
export type Row = { f: string; n: number; v: number }; // v: 0 to 1, the average of the feel scores over the best possible
export const LEAD_GAP = 0.1; // the leader must be this far ahead of the next field
export const LEAD_MIN = 2; // and rest on at least this many reflections: one lucky mission is not a verdict

export const rowsOf = (answers: { f: string; r?: { e?: Feel } }[], fields: string[]): Row[] =>
  fields
    .map((f) => {
      const l = answers.filter((a) => a.f === f && a.r?.e);
      return { f, n: l.length, v: l.length ? l.reduce((s, a) => s + SCORE[a.r!.e!], 0) / (l.length * 2) : 0 };
    })
    .filter((r) => r.n > 0)
    .sort((a, b) => Number(b.n >= LEAD_MIN) - Number(a.n >= LEAD_MIN) || b.v - a.v || b.n - a.n); // fields with enough reflections first: 100% on one mission never tops 83% on three

// none: fewer than two fields to compare. early: one of the top two has too few reflections to compare fairly. close: no clear gap. lead: rows[0] is ahead.
export const verdict = (rows: Row[]): 'none' | 'early' | 'close' | 'lead' => {
  if (rows.length < 2) return 'none';
  if (rows[0].n < LEAD_MIN || rows[1].n < LEAD_MIN) return 'early';
  return rows[0].v - rows[1].v < LEAD_GAP ? 'close' : 'lead';
};
