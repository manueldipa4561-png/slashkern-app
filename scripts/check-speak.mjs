// Checks Slash's own voice (netlify/functions/speak.mts) on the real function with ElevenLabs mocked: no key, no spend. Run: npm test
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

let calls = [];
globalThis.fetch = async (url, init) => { calls.push({ url: String(url), init }); return new Response(new Uint8Array([1, 2, 3]), { status: 200, headers: { 'content-type': 'audio/mpeg' } }); };
delete process.env.ELEVENLABS_API_KEY;
const { default: handler } = await import('../netlify/functions/speak.mts');

let ip = 0; // a fresh address per call: the function's rate limit is per IP
const post = async (body, { headers = {}, from = `10.8.0.${++ip}` } = {}) => {
  calls = [];
  const req = new Request('http://check.local/api/speak', { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) });
  const res = await handler(req, { ip: from });
  return { res, status: res.status };
};
const Q = 'Which word should a hungry flatmate read first from across the room?';

// No key: the app hides the option, nothing is called.
assert.equal((await post({ lang: 'en', text: Q })).status, 503, 'no key is a 503');
assert.equal(calls.length, 0, 'no key must not reach ElevenLabs');

process.env.ELEVENLABS_API_KEY = ' mock-key\n';
assert.equal((await handler(new Request('http://check.local/api/speak'), { ip: '10.8.1.1' })).status, 405, 'GET is refused');
assert.equal((await post(Q, { headers: { 'content-type': 'text/plain' } })).status, 415, 'only JSON');
assert.equal((await post({ lang: 'en', text: Q }, { headers: { origin: 'https://evil.example' } })).status, 403, 'a foreign Origin is refused');
assert.equal((await post('{not json')).status, 400, 'bad JSON');
for (const body of [{ lang: 'xx', text: Q }, { lang: 'en', text: '' }, { lang: 'en', text: '   ' }, { lang: 'en', text: 'x'.repeat(501) }, { lang: 'en', text: 42 }, { text: Q }]) {
  assert.equal((await post(body)).status, 400, `must refuse ${JSON.stringify(body).slice(0, 40)}`);
  assert.equal(calls.length, 0, 'a refused request reached ElevenLabs');
}

// A good request: the key (trimmed) and the cleaned text go to ElevenLabs, audio comes back.
const ok = await post({ lang: 'it', text: `  ${Q}  <b>` });
assert.equal(ok.status, 200);
assert.equal(ok.res.headers.get('content-type'), 'audio/mpeg');
assert.equal(ok.res.headers.get('cache-control'), 'no-store');
assert.deepEqual([...new Uint8Array(await ok.res.arrayBuffer())], [1, 2, 3], 'the audio is passed through');
assert.equal(calls.length, 1);
const sent = JSON.parse(calls[0].init.body);
assert.match(calls[0].url, /^https:\/\/api\.elevenlabs\.io\/v1\/text-to-speech\/[A-Za-z0-9]+\?/, 'the text-to-speech endpoint');
assert.equal(calls[0].init.headers['xi-api-key'], 'mock-key', 'the key is trimmed');
assert.equal(sent.text, `${Q} b`, 'angle brackets are removed and spaces collapsed');
assert.equal(sent.language_code, 'it');
assert.equal(sent.model_id, 'eleven_v4', 'the most realistic model by default');
process.env.ELEVENLABS_MODEL_ID = ' eleven_v4_turbo/../x ';
await post({ lang: 'en', text: Q });
assert.equal(JSON.parse(calls[0].init.body).model_id, 'eleven_v4_turbox', 'the model can be set in the environment, letters digits and _ only');
delete process.env.ELEVENLABS_MODEL_ID;

// Two voices: a (the default) and b, each from the environment or its premade default; anything else is refused.
await post({ lang: 'en', text: Q });
assert.match(calls[0].url, /\/text-to-speech\/TxGEqnHWrfWFTfGW9XjX\?/, 'no voice means voice a, Josh');
await post({ lang: 'en', text: Q, voice: 'b' });
assert.match(calls[0].url, /\/text-to-speech\/21m00Tcm4TlvDq8ikWAM\?/, 'voice b is Rachel');
process.env.ELEVENLABS_VOICE_ID_2 = 'myvoice2';
await post({ lang: 'en', text: Q, voice: 'b' });
assert.match(calls[0].url, /\/text-to-speech\/myvoice2\?/, 'ELEVENLABS_VOICE_ID_2 replaces voice b');
delete process.env.ELEVENLABS_VOICE_ID_2;
for (const voice of ['c', 'TxGEqnHWrfWFTfGW9XjX', 1, null]) {
  assert.equal((await post({ lang: 'en', text: Q, voice })).status, 400, `a voice of ${JSON.stringify(voice)} is refused`);
  assert.equal(calls.length, 0, 'a refused voice reached ElevenLabs');
}

// The voice id comes from the environment and can only be letters and digits.
process.env.ELEVENLABS_VOICE_ID = 'abc123/../evil';
await post({ lang: 'en', text: Q });
assert.match(calls[0].url, /\/text-to-speech\/abc123evil\?/, 'a voice id cannot change the path');
delete process.env.ELEVENLABS_VOICE_ID;

// ElevenLabs refusing the key says so; other failures say upstream.
globalThis.fetch = async () => new Response('{}', { status: 401 });
const rejected = await post({ lang: 'en', text: Q });
assert.equal(rejected.status, 502);
assert.equal((await rejected.res.json()).error, 'key_rejected');
globalThis.fetch = async () => new Response('{}', { status: 500 });
assert.equal((await (await post({ lang: 'en', text: Q })).res.json()).error, 'upstream');

// The ping: says a key is set. No call to ElevenLabs: a key limited to text-to-speech cannot list models, and a bad key shows on the first Listen.
let pinged = 0;
globalThis.fetch = async () => { pinged++; return new Response('{}', { status: 401 }); };
assert.equal((await (await post({ mode: 'ping' })).res.json()).reply, 'live');
assert.equal(pinged, 0, 'ping must not call ElevenLabs');

// Limits: 10 a minute for one address; the 11th is refused before ElevenLabs is called.
globalThis.fetch = async (url, init) => { calls.push({ url: String(url), init }); return new Response(new Uint8Array([1]), { status: 200 }); };
let last = 0;
for (let i = 0; i < 11; i++) last = (await post({ lang: 'en', text: Q }, { from: '10.8.9.9' })).status;
assert.equal(last, 429, 'the 11th request in a minute is limited');
assert.equal(calls.length, 0, 'a limited request reached ElevenLabs'); // post() resets calls: the last request made none

// The page must be allowed to play the audio it fetches.
assert.match(readFileSync('netlify.toml', 'utf8'), /media-src 'self' blob:/, 'netlify.toml: the CSP needs media-src for the audio blob');
console.log('speak: ok (validation, key trimmed, voice id safe, 401 and 500 mapped, ping makes no call, 10 a minute, audio passes through, CSP allows the blob)');
