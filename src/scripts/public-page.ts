import { PL, brandView, pieceOf, readPieceLink } from './pieces';
import { renderBrand } from './piece-view';
import { EN, IT } from './i18n';

// The page behind a piece's share link (p.astro): the finished sheet, how it was made, a note that slashkern did not check it, and a way to make one. Read-only, no account, nothing stored.
// The language is the visitor's browser language (the six the app speaks, else English); the German, French, Dutch and Swedish tables load only when they are needed.
type Lang = 'en' | 'it' | 'de' | 'fr' | 'nl' | 'sv';
const LANGS: Lang[] = ['en', 'it', 'de', 'fr', 'nl', 'sv'];
const LOCALE: Record<Lang, string> = { en: 'en-GB', it: 'it-IT', de: 'de-DE', fr: 'fr-FR', nl: 'nl-NL', sv: 'sv-SE' };
const TABLE: Record<Lang, () => Promise<Record<string, string>>> = {
  en: async () => ({}), it: async () => IT,
  de: async () => (await import('./i18n-de')).DE, fr: async () => (await import('./i18n-fr')).FR, nl: async () => (await import('./i18n-nl')).NL, sv: async () => (await import('./i18n-sv')).SV,
};
const el = (id: string) => document.getElementById(id) as HTMLElement;
const mk = <K extends keyof HTMLElementTagNameMap>(tag: K, cls = '', text = ''): HTMLElementTagNameMap[K] => Object.assign(document.createElement(tag), { className: cls, textContent: text });

(async () => {
  const lang = (navigator.languages?.length ? navigator.languages : [navigator.language]).map((l) => l.slice(0, 2).toLowerCase()).find((l): l is Lang => LANGS.includes(l as Lang)) ?? 'en';
  const table = await TABLE[lang]();
  const tr = (s: string) => table[s] || EN[s] || s;
  const fill = (en: string, v: Record<string, string | number>) => tr(en).replace(/\{(\w+)\}/g, (m, k: string) => (Object.prototype.hasOwnProperty.call(v, k) ? String(v[k]) : m));
  const when = (t: number, time = false) => new Date(t).toLocaleString(LOCALE[lang], time ? { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' } : { day: 'numeric', month: 'short' });
  document.documentElement.lang = lang;
  el('pubCta').textContent = tr(PL.cta);
  const shared = readPieceLink(location.hash), p = shared && pieceOf(shared.run), v = shared && p ? brandView(p, shared.run, tr) : null;
  if (!shared || !v) { el('pubSheet').replaceChildren(mk('p', 'pub-bad', tr(PL.bad))); return; }
  const { run, name } = shared;
  document.title = `${v.name} · ${tr(PL.tag)} · slashkern`;
  el('pubSheet').replaceChildren(renderBrand(v, fill(name ? PL.by : PL.on, { n: name, d: when(run.done!) }), { tr, fill }));
  // How it was made: when, that every choice is the maker's, and what Slash did (it asked questions) or that no AI wrote anything; AI help is always shown.
  el('pubHow').querySelector('summary')!.textContent = tr(PL.how);
  el('pubHowB').replaceChildren(mk('p', 'pub-when', fill(PL.span, { a: when(run.at, true), b: when(run.done!, true) })), mk('p', '', tr(PL.theirs)), run.ai ? mk('span', 'pub-ai', tr(PL.ai)) : mk('p', '', run.q ? fill(PL.asked, { n: run.q }) : tr(PL.noAi)));
  el('pubHow').hidden = false;
  el('pubNote').textContent = tr(PL.shared);
})();
