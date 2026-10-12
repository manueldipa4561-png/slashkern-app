// Checks "Try your prompt on the AI" (mode 'run' in netlify/functions/coach.mts) on the real function, with the model mocked: only Prompting,
// only 20-1500 characters, heavy words pause before any model call, and the model gets the person's prompt alone. Run: npm test
import assert from 'node:assert/strict';

process.env.ANTHROPIC_API_KEY = 'mock';
let sent = null, text = 'Monday: maths. Tuesday: history. Wednesday: rest.';
globalThis.fetch = async (_url, init) => { sent = JSON.parse(init.body); return new Response(JSON.stringify({ content: [{ type: 'text', text }] }), { status: 200 }); };
const { default: handler } = await import('../netlify/functions/coach.mts');

let ip = 0; // a fresh address per call: the function's rate limit is per IP
const run = async (body) => {
  sent = null;
  const req = new Request('http://check.local/api/coach', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ mode: 'run', lang: 'en', field: 'Prompting', ...body }) });
  const res = await handler(req, { ip: `10.9.0.${++ip}` });
  return { status: res.status, ...(await res.json()) };
};
const P = 'Write a three-line plan for my study week, one line per day.';

for (const field of ['Design', 'prompting', undefined]) {
  assert.equal((await run({ field, prompt: P })).status, 400, `run mode must refuse field ${field}`);
  assert.equal(sent, null, `field ${field} reached the model`);
}
for (const prompt of ['x'.repeat(1501), 'too short', '   ', 42]) {
  assert.equal((await run({ prompt })).status, 400, `run mode must refuse a prompt of ${String(prompt).length} characters`);
  assert.equal(sent, null, 'a refused prompt reached the model');
}
const heavy = await run({ prompt: 'Write a note for my mum, I want to end it all', lang: 'it' });
assert.match(heavy.reply, /metto in pausa il progetto/, 'heavy words get the fixed pause');
assert.equal(sent, null, 'heavy words reached the model');
// The pause comes in the app's language: German, French, Dutch and Swedish have their own helplines, any other value gets English.
for (const [lang, prompt, re] of [['de', 'Schreib einen Brief an meine Mutter, ich will nicht mehr leben', /pausiere ich das Projekt.*0800 111 0 111/], ['fr', 'Écris une lettre à ma mère, je veux en finir', /je mets le projet en pause.*3114/], ['nl', 'Schrijf een brief aan mijn moeder, ik wil niet meer leven', /ik zet het project op pauze.*0800-0113.*1813/], ['sv', 'Skriv ett brev till min mamma, jag vill inte leva längre', /jag pausar projektet.*90101.*1177/], ['es', 'Write a note for my mum, I want to end it all', /pausing the project/]]) {
  assert.match((await run({ prompt, lang })).reply, re, `lang ${lang}: wrong pause`);
  assert.equal(sent, null, 'heavy words reached the model');
}

// The KERN.AI tab's check: a free models call, never the model; a rejected key says so.
const realFetch = globalThis.fetch;
let pingUrl = '';
globalThis.fetch = async (url) => { pingUrl = String(url); return new Response('{}', { status: 200 }); };
assert.equal((await run({ mode: 'ping' })).reply, 'live', 'ping with a working key says live');
assert.match(pingUrl, /\/v1\/models/, 'ping must not call the model');
globalThis.fetch = async () => new Response('{}', { status: 401 });
assert.equal((await run({ mode: 'ping' })).error, 'key_rejected', 'ping with a rejected key says so');
globalThis.fetch = async () => { throw new Error('offline'); };
assert.equal((await run({ mode: 'ping' })).error, 'upstream', 'ping without network says the service is not reachable');
globalThis.fetch = realFetch;

const ok = await run({ prompt: `  ${P}  ` });
assert.equal(ok.reply, text);
assert.deepEqual(sent.messages, [{ role: 'user', content: P }], 'the model gets the trimmed prompt alone');
assert.equal(sent.max_tokens, 450);
assert.ok(!sent.system.includes('KERN.AI'), 'run mode must not use the coach prompt');
assert.equal((await run({ prompt: 'x'.repeat(1500) })).status, 200, '1500 characters is allowed');

for (text of ['Here is your piano di lavoro.', 'Il tuo lavoro è pronto.', '  ']) assert.equal((await run({ prompt: P })).status, 502, `reply "${text}" must not reach the app`);
for (text of ['Hier ist dein Arbeitsplan.', 'Voici ton plan de travail.', 'Your hiring brief is ready.']) assert.equal((await run({ prompt: P })).status, 200, `reply "${text}" is allowed since 2026-10-11 (only the Italian "lavor-" family is banned)`);

// The coach (not run mode) answers in the app's language: German, French, Dutch and Swedish add one sentence to the language line; English and Italian stay as evaluated.
const coach = async (lang) => {
  const req = new Request('http://check.local/api/coach', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ lang, field: 'Selling', messages: [{ who: 'me', t: 'Ich verkaufe alte Sneaker.' }] }) });
  await handler(req, { ip: `10.9.1.${++ip}` });
  return sent.system;
};
text = 'Was macht deine Sneaker besonders?';
assert.match(await coach('de'), /Reply in German, even if they write in another language\. In German the field is called "Produktanzeigen"\./);
assert.match(await coach('fr'), /Reply in French, even if they write in another language\. In French the field is called "Annonces de produits"\./);
assert.match(await coach('nl'), /Reply in Dutch, even if they write in another language\. In Dutch the field is called "Productadvertenties"\.\n/);
assert.match(await coach('sv'), /Reply in Swedish, even if they write in another language\. In Swedish the field is called "Produktannonser"\.\n/);
assert.match(await coach('it'), /Reply in Italian, even if they write in another language\.\n/);
assert.match(await coach('xx'), /Reply in English, even if they write in another language\.\n/);
console.log('try your prompt: ok (Prompting only, 20-1500 characters, heavy words pause in 6 languages, only the prompt is sent; the coach replies in the app language)');
