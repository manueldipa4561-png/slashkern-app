// German, French, Dutch and Swedish for the pieces: one file per piece (i18n-piece-<name>.ts) and one for the words around every piece (i18n-piece-core.ts), merged here.
// i18n-de.ts, i18n-fr.ts, i18n-nl.ts and i18n-sv.ts add the result to DE, FR, NL and SV.
import { CORE_DE, CORE_FR, CORE_NL, CORE_SV } from './i18n-piece-core';
import { BRAND_DE, BRAND_FR, BRAND_NL, BRAND_SV } from './i18n-piece-brand';
import { WRITING_DE, WRITING_FR, WRITING_NL, WRITING_SV } from './i18n-piece-writing';
import { CODE_DE, CODE_FR, CODE_NL, CODE_SV } from './i18n-piece-code';
import { VIDEO_DE, VIDEO_FR, VIDEO_NL, VIDEO_SV } from './i18n-piece-video';
import { SELLING_DE, SELLING_FR, SELLING_NL, SELLING_SV } from './i18n-piece-selling';
import { MUSIC_DE, MUSIC_FR, MUSIC_NL, MUSIC_SV } from './i18n-piece-music';
import { PROMPTING_DE, PROMPTING_FR, PROMPTING_NL, PROMPTING_SV } from './i18n-piece-prompting';
export const PIECES_DE: Record<string, string> = { ...CORE_DE, ...BRAND_DE, ...WRITING_DE, ...CODE_DE, ...VIDEO_DE, ...SELLING_DE, ...MUSIC_DE, ...PROMPTING_DE };
export const PIECES_FR: Record<string, string> = { ...CORE_FR, ...BRAND_FR, ...WRITING_FR, ...CODE_FR, ...VIDEO_FR, ...SELLING_FR, ...MUSIC_FR, ...PROMPTING_FR };
export const PIECES_NL: Record<string, string> = { ...CORE_NL, ...BRAND_NL, ...WRITING_NL, ...CODE_NL, ...VIDEO_NL, ...SELLING_NL, ...MUSIC_NL, ...PROMPTING_NL };
export const PIECES_SV: Record<string, string> = { ...CORE_SV, ...BRAND_SV, ...WRITING_SV, ...CODE_SV, ...VIDEO_SV, ...SELLING_SV, ...MUSIC_SV, ...PROMPTING_SV };
