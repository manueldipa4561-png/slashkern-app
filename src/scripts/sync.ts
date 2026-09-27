// Sync rules for answers, free of DOM code so scripts/check-sync.ts can test them (npm test).
// Every answer has a version: its last change (ed) or its creation time (at).
// A delete leaves a tombstone [key, time], so it sticks on every device instead of coming back from another one.
export type Versioned = { f: string; i: number; at: number; ed?: number };
export type Tomb = [string, number];

export const akey = (a: Versioned) => `${a.f}.${a.i}.${a.at}`;
export const ver = (a: Versioned) => a.ed || a.at;
// A change is stamped now, but never older than what this device already saw (device clocks can be off).
export const stamp = (after: number) => Math.max(Date.now(), after + 1);

// Newest version of each answer wins (ties keep this device's copy); a tombstone newer than the answer removes it.
export function mergeAnswers<A extends Versioned>(mine: A[], theirs: A[], goneMine: Tomb[], goneTheirs: Tomb[]) {
  const best = new Map<string, A>();
  for (const a of [...mine, ...theirs]) { const o = best.get(akey(a)); if (!o || ver(a) > ver(o)) best.set(akey(a), a); }
  const gone = new Map<string, number>();
  for (const [k, t] of [...goneMine, ...goneTheirs]) gone.set(k, Math.max(t, gone.get(k) || 0));
  return {
    answers: [...best.values()].filter((a) => ver(a) > (gone.get(akey(a)) || 0)).sort((a, b) => a.at - b.at),
    gone: [...gone].sort((a, b) => a[1] - b[1]).slice(-200),
  };
}
