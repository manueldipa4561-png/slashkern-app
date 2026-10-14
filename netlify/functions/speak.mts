// Slash's own voice: turns the text of one assistant question into speech with ElevenLabs. Only on the person's choice in Settings (voice.ts), never automatic.
// The key is the ELEVENLABS_API_KEY environment variable of the site; ELEVENLABS_VOICE_ID picks the voice. Nothing of the text or the audio is stored or logged.
import type { Config, Context } from '@netlify/functions';

const LANGS = ['en', 'it', 'de', 'fr', 'nl', 'sv', 'es'];
const MAX_TEXT = 500; // the assistant's replies are cut at 500 characters (coach.mts)
// Two voices to choose from in Settings: 'a' and 'b'. The defaults are ElevenLabs' premade "Josh" and "Rachel"; ELEVENLABS_VOICE_ID and ELEVENLABS_VOICE_ID_2 replace them (voice.ts labels follow the defaults).
const DEFAULT_VOICES = { a: 'TxGEqnHWrfWFTfGW9XjX', b: '21m00Tcm4TlvDq8ikWAM' };
const MODEL = 'eleven_v4'; // the most realistic, speaks all six app languages (about 1.7 s per question); ELEVENLABS_MODEL_ID overrides it: eleven_v4_turbo is faster, eleven_flash_v2_5 is the cheapest
const API = 'https://api.elevenlabs.io/v1';

// Best-effort limits per warm instance, tighter than coach.mts because audio costs money: 10 a minute and 100 a day for each IP (same bucketing as coach.mts).
const hits = new Map<string, number[]>();
const bucket = (ip: string) => {
  if (!ip.includes(':')) return ip;
  const [head, tail = ''] = ip.split('::');
  const h = head ? head.split(':') : [], t = tail ? tail.split(':') : [];
  return [...h, ...Array(Math.max(0, 8 - h.length - t.length)).fill('0'), ...t].slice(0, 3).join(':');
};
const limited = (rawIp: string) => {
  const ip = bucket(rawIp), now = Date.now(), list = (hits.get(ip) || []).filter((t) => now - t < 864e5);
  const last = list.filter((t) => now - t < 6e4).length;
  if (last >= 10 || list.length >= 100) { hits.set(ip, list); return last >= 10 ? 'rate' : 'rate_day'; }
  list.push(now); hits.delete(ip); hits.set(ip, list);
  if (hits.size > 5000) hits.delete(hits.keys().next().value as string);
  return '';
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

export default async (req: Request, context: Context) => {
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  const key = process.env.ELEVENLABS_API_KEY?.trim(); // a pasted key often carries a newline, which would break the header
  if (!key) return json({ error: 'no_key' }, 503);
  if (!(req.headers.get('content-type') || '').startsWith('application/json')) return json({ error: 'type' }, 415);
  const origin = req.headers.get('origin'); // browser-CSRF guard like coach.mts: a foreign Origin is refused. Not authentication.
  if (origin && origin !== new URL(req.url).origin) return json({ error: 'origin' }, 403);
  if (Number(req.headers.get('content-length')) > 4000) return json({ error: 'size' }, 413);

  let body: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  try { const raw = await req.text(); if (raw.length > 4000) return json({ error: 'size' }, 413); body = JSON.parse(raw); } catch { return json({ error: 'json' }, 400); }

  // The app asks once when it starts: is a key set? No call to ElevenLabs: a key limited to text-to-speech cannot even list models.
  // A key that does not work shows on the first Listen, which falls back to the phone's voice and hides the option.
  if (body?.mode === 'ping') return json({ reply: 'live' });

  const lang = LANGS.find((l) => l === body?.lang);
  const text = typeof body?.text === 'string' ? body.text.replace(/[<>]/g, ' ').replace(/\s+/g, ' ').trim() : '';
  const which = body?.voice === undefined ? 'a' : body.voice; // only a or b: an ID never comes from the browser
  if (!lang || !text || text.length > MAX_TEXT || (which !== 'a' && which !== 'b')) return json({ error: 'input' }, 400);
  const over = limited(context.ip || 'unknown');
  if (over) return json({ error: over }, 429);

  const voiceId = (process.env[which === 'b' ? 'ELEVENLABS_VOICE_ID_2' : 'ELEVENLABS_VOICE_ID']?.trim() || DEFAULT_VOICES[which as 'a' | 'b']).replace(/[^A-Za-z0-9]/g, ''); // an id is letters and digits: nothing else gets into the URL
  try {
    const r = await fetch(`${API}/text-to-speech/${voiceId}?output_format=mp3_44100_64`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'xi-api-key': key, accept: 'audio/mpeg' },
      body: JSON.stringify({ text, model_id: (process.env.ELEVENLABS_MODEL_ID?.trim() || MODEL).replace(/[^A-Za-z0-9_]/g, ''), language_code: lang }),
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok || !r.body) { console.error('speak upstream', r.status); return json({ error: r.status === 401 || r.status === 403 ? 'key_rejected' : 'upstream' }, 502); } // the status only, never the key or the text
    return new Response(r.body, { status: 200, headers: { 'content-type': 'audio/mpeg', 'cache-control': 'no-store' } });
  } catch { return json({ error: 'upstream' }, 502); }
};

export const config: Config = { path: '/api/speak' };
