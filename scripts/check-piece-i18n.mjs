// Lists the English texts a piece still needs in German, French, Dutch and Swedish, and problems in the ones it has (a lost {blank}, a copy of the English, a banned word).
// usage: node scripts/check-piece-i18n.mjs <name>   (name: brand, writing, code, video, selling, music, prompting, core = the words around every piece in pieces.ts and piece-types.ts)
// A text belongs to a piece when it is written in src/scripts/piece-<name>.ts. The same check for the whole app is scripts/check-content.mjs (npm test).
import { readFileSync } from 'node:fs';
import { buildSync } from 'esbuild';

const name = process.argv[2];
if (!name) { console.error('usage: node scripts/check-piece-i18n.mjs <name>'); process.exit(2); }
const files = name === 'core' ? ['src/scripts/pieces.ts', 'src/scripts/piece-types.ts'] : [`src/scripts/piece-${name}.ts`];
const source = files.map((f) => readFileSync(f, 'utf8')).join('\n');
const entry = ['i18n', 'pieces', 'i18n-de', 'i18n-fr', 'i18n-nl', 'i18n-sv'].map((f) => `export * from './src/scripts/${f}.ts';`).join('\n');
const { text } = buildSync({ stdin: { contents: entry, resolveDir: process.cwd(), loader: 'ts' }, bundle: true, format: 'esm', platform: 'node', write: false, logLevel: 'silent' }).outputFiles[0];
const { IT, DE, FR, NL, SV, CLASHES } = await import(`data:text/javascript;base64,${Buffer.from(text).toString('base64')}`);

const written = (k) => source.includes(k) || source.includes(k.replace(/'/g, "\\'")) || source.includes(k.replace(/"/g, '\\"'));
const keys = Object.keys(IT).filter(written);
const blanks = (t) => [...t.matchAll(/\{\w+\}|href="[^"]*"/g)].map((m) => m[0]).sort().join(' ');
let bad = 0;
if (CLASHES.length) { console.log(`CLASH: the same English text has two Italian versions: ${CLASHES.join(' | ')}`); bad++; }
console.log(`${name}: ${keys.length} English texts are written in ${files.join(', ')}`);
for (const [lang, L] of [['German', DE], ['French', FR], ['Dutch', NL], ['Swedish', SV]]) {
  const missing = keys.filter((k) => !L[k]);
  if (missing.length) { bad++; console.log(`\n${lang}: ${missing.length} missing:`); for (const k of missing) console.log(`  "${k}"   (Italian: "${IT[k]}")`); }
  for (const k of keys.filter((k) => L[k])) {
    if (blanks(L[k]) !== blanks(k)) { bad++; console.log(`${lang}: "${k.slice(0, 50)}" has the blanks ${blanks(L[k]) || 'none'}, wants ${blanks(k) || 'none'}`); }
    if (k.length >= 25 && L[k] === k) { bad++; console.log(`${lang}: "${k.slice(0, 50)}" is still English`); }
    if (/lavor/i.test(L[k]) || /\b(mission|missie|uppdrag)/i.test(L[k]) || /\bMission(en)?\b/.test(L[k])) { bad++; console.log(`${lang}: "${k.slice(0, 50)}" uses a banned word`); }
  }
}
console.log(bad ? `\n${name}: translations NOT complete` : `${name}: German, French, Dutch and Swedish are complete (${keys.length} texts)`);
process.exit(bad ? 1 : 0);
