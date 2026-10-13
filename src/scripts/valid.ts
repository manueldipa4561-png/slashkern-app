// Range checks for numbers read from storage or a synced copy (untrusted input). Free of DOM code so scripts/check-sync.ts can test them (npm test).
export const MAX_TIME = 8.64e15; // a Date cannot hold a time beyond this: past it a list reads "Invalid Date" and a streak turns to NaN
export const MAX_COUNT = 1e7; // no trail comes near this many stones
export const inTime = (n: unknown): n is number => typeof n === 'number' && Math.abs(n) <= MAX_TIME; // false for NaN too
export const clampCount = (n: unknown) => (typeof n === 'number' && Number.isFinite(n) ? Math.min(MAX_COUNT, Math.max(0, Math.floor(n))) : 0);
// "Made with AI help": a project whose text came from the AI first version (mode 'make') carries ai: true, on every device, and it is never hidden. Only a literal true counts (a stored or synced value is untrusted).
export const cleanAi = (v: unknown): true | undefined => (v === true ? true : undefined);
// A name is cut by whole characters (never half an emoji) and holds no text-direction controls (U+202A-202E, U+2066-2069): they flip the text around them and leave the avatar empty.
export const cleanName = (v: unknown) => (typeof v === 'string' ? [...v.replace(/[\u202A-\u202E\u2066-\u2069]/g, '')].slice(0, 40).join('') : '');
