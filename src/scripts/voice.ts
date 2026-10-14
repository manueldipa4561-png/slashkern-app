// Voice (v11): dictation (speech to text, through the browser) and Slash's own voice (text to speech, the server function /api/speak, ElevenLabs), both off until a person taps. Nothing is recorded or stored by slashkern.
// The phone's built-in voices are gone: Slash speaks with its own voice or not at all. "Talk with Slash" is an opt-in voice chat in the Slash tab: one tap starts it, one tap ends it, and it ends by itself when the screen changes.
// Feature-detected and iOS 15 safe: SpeechRecognition / webkitSpeechRecognition only. Without it, or when the microphone is refused,
// the microphone button is hidden and a one-line tip says to use the keyboard's own microphone.
//
// app.ts sets `voice` (the app language, the translator, a toast, and the one-time privacy sheet) before it attaches anything.
export const voice = {
  lang: (): string => 'en',
  tr: (s: string): string => s,
  say: (_s: string): void => { /* app.ts */ },
  consent: (go: () => void): void => { go(); }, // app.ts: the first time, the privacy sheet; then it calls go() on Continue
};

const TAG: Record<string, string> = { en: 'en-GB', it: 'it-IT', de: 'de-DE', fr: 'fr-FR', nl: 'nl-NL', sv: 'sv-SE', es: 'es-ES' };
const tag = () => TAG[voice.lang()] ?? 'en-GB';

type Ev = { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>; error?: string };
type Rec = { lang: string; interimResults: boolean; continuous: boolean; onresult: ((e: Ev) => void) | null; onerror: ((e: Ev) => void) | null; onend: (() => void) | null; start(): void; stop(): void; abort(): void };
const w = window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec };
const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
const TIP = 'Tip: use the microphone on your keyboard to talk instead of typing.';

const MIC_ICON = '<svg class="k-i k-mic-i" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3"/></svg>';
type Mic = { btn: HTMLButtonElement; tip: HTMLElement; stop: () => void };
const mics: Mic[] = [];
let blocked = !SR; // permission refused, no microphone, or no SpeechRecognition
let active: Mic | null = null;

const paint = () => mics.forEach((m) => { m.btn.hidden = blocked; m.tip.hidden = !blocked; });
// A refused microphone hides every button and shows the tip, once. A voice chat ends with it.
const block = () => { blocked = true; active?.stop(); stopTalk(); paint(); paintTalk(); };

// A microphone button for a text box. "inside": a textarea gets the button in its corner (the box is wrapped); "after": a single-line input (the chat) gets it beside it, in its own row.
export function attachMic(field: HTMLInputElement | HTMLTextAreaElement, placement: 'inside' | 'after', tipAfter?: Element) {
  const btn = document.createElement('button'), tipEl = document.createElement('p');
  btn.type = 'button'; btn.className = 'k-mic'; btn.setAttribute('aria-pressed', 'false'); btn.innerHTML = `${MIC_ICON}<i class="k-mic-dot" aria-hidden="true"></i>`;
  tipEl.className = 'k-l k-s k-mic-tip'; tipEl.hidden = true; tipEl.textContent = voice.tr(TIP);
  if (placement === 'inside') {
    const wrap = document.createElement('div'); wrap.className = 'k-micw';
    field.replaceWith(wrap); wrap.append(field, btn); wrap.after(tipEl);
  } else { field.after(btn); (tipAfter ?? field).after(tipEl); }
  let rec: Rec | null = null, failed = false, lastStart = -1, lastEnd = -1, timer = 0;
  // Where the words go: the cursor the person left in the box (tapping the button blurs it, so it is remembered on blur), else the end.
  const remember = () => { lastStart = field.selectionStart ?? -1; lastEnd = field.selectionEnd ?? -1; };
  for (const ev of ['blur', 'keyup', 'pointerup', 'select', 'input']) field.addEventListener(ev, remember); // the cursor the person left (a tap on the button blurs the box)
  const label = () => { const on = btn.getAttribute('aria-pressed') === 'true'; btn.setAttribute('aria-label', voice.tr(on ? 'Stop listening' : 'Talk instead of typing')); };
  const m: Mic = { btn, tip: tipEl, stop: () => { if (rec) rec.stop(); } };
  const idle = (err = false) => {
    clearTimeout(timer); rec = null; if (active === m) active = null;
    btn.setAttribute('aria-pressed', 'false'); btn.classList.remove('on'); label();
    if (err) { btn.classList.add('err'); window.setTimeout(() => btn.classList.remove('err'), 1600); }
  };
  const begin = () => {
    if (!SR || blocked) return;
    active?.stop(); stopSpeaking();
    const len = field.value.length, s = lastStart >= 0 && lastStart <= len ? lastStart : len, e = lastEnd >= s && lastEnd <= len ? lastEnd : s;
    const before = field.value.slice(0, s), after = field.value.slice(e), sep = before && !/\s$/.test(before) ? ' ' : '', gap = after && !/^\s/.test(after) ? ' ' : '';
    const room = field.maxLength > 0 ? field.maxLength - before.length - after.length - sep.length - gap.length : Infinity;
    const put = (text: string) => { // typed text is kept: only the dictated words are inserted at the cursor, and the cursor moves after them
      const said = text.slice(0, Math.max(0, room)), pos = (before + sep + said).length;
      field.value = before + sep + said + (said ? gap : '') + after; field.setSelectionRange(pos, pos); field.dispatchEvent(new Event('input', { bubbles: true }));
    };
    const r = new SR();
    r.lang = tag(); r.interimResults = true; r.continuous = false; // one utterance: the browser ends it after a pause
    r.onresult = (ev) => { let fin = '', interim = ''; for (let i = 0; i < ev.results.length; i++) { const t = ev.results[i][0].transcript; if (ev.results[i].isFinal) fin += t; else interim += t; } put((fin + interim).replace(/^\s+/, '')); };
    r.onerror = (ev) => {
      const why = ev.error || '';
      if (why === 'not-allowed' || why === 'service-not-allowed' || why === 'audio-capture') block();
      else if (why === 'no-speech') voice.say('I did not hear anything. Try again.');
      else if (why === 'network') voice.say('Voice needs a connection.');
      if (why !== 'aborted') failed = true; // painted as an error when it ends
    };
    r.onend = () => { const bad = failed; failed = false; idle(bad); };
    rec = r; active = m; failed = false;
    try { r.start(); } catch { idle(true); return; }
    btn.setAttribute('aria-pressed', 'true'); btn.classList.add('on'); label();
    timer = window.setTimeout(() => rec?.stop(), 60000); // never listens on and on
  };
  btn.addEventListener('click', () => { if (rec) { rec.stop(); return; } voice.consent(begin); });
  label(); mics.push(m); paint();
  return m;
}
// A language switch relabels the buttons and the tips.
export const refreshVoice = () => { mics.forEach((m) => { const on = m.btn.getAttribute('aria-pressed') === 'true'; m.btn.setAttribute('aria-label', voice.tr(on ? 'Stop listening' : 'Talk instead of typing')); m.tip.textContent = voice.tr(TIP); }); paint(); fillPicker(); };

// Slash's voice: one voice, Josh or Rachel (the server function /api/speak), picked in Settings and kept per language. It is offered only when the server's ping answers "live"; until then (or when it is down) the Listen buttons
// and "Talk with Slash" stay out of sight (html[data-slash-voice] shows them), and Settings has no voice row. A voice saved by an older build (a phone voice) is ignored.
const voiceKey = () => `kern:voice:${voice.lang()}`;
const SLASH = 'slash:'; // saved as slash:a or slash:b (plain "slash" is how an earlier build saved the one voice)
const SLASH_NAMES = { a: 'Josh', b: 'Rachel' } as const; // the two voices the server offers (speak.mts)
const NO_VOICE = "Slash's voice is not available right now.";
let slashOk = false;
const setSlashOk = (ok: boolean) => { slashOk = ok; document.documentElement.toggleAttribute('data-slash-voice', ok); };
const stored = () => { try { return localStorage.getItem(voiceKey()) || ''; } catch { return ''; } };
const slashPick = (): 'a' | 'b' => (stored() === 'slash:b' ? 'b' : 'a');
let picker: { row: HTMLElement; sel: HTMLSelectElement; note: HTMLElement } | null = null;
function fillPicker() {
  if (picker) {
    picker.sel.replaceChildren(...(['a', 'b'] as const).map((k) => new Option(`${voice.tr("Slash's own voice")} · ${SLASH_NAMES[k]}`, SLASH + k)));
    picker.sel.value = SLASH + slashPick();
    picker.row.hidden = picker.note.hidden = !slashOk; // the note says where the text goes
  }
  paintTalk();
}
// Once per page load: a free call that says whether the site has a working voice key. No speech is made.
async function pingSlash() {
  try {
    const r = await fetch('/api/speak', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ mode: 'ping' }), signal: AbortSignal.timeout(6000) });
    setSlashOk(r.ok && (await r.json().catch(() => null))?.reply === 'live');
  } catch { setSlashOk(false); }
  fillPicker();
}
export function bindVoicePicker(row: HTMLElement, sel: HTMLSelectElement, note: HTMLElement) {
  picker = { row, sel, note };
  sel.addEventListener('change', () => {
    try { localStorage.setItem(voiceKey(), sel.value); } catch { /* not kept: Josh next time */ }
    stopSpeaking();
  });
  fillPicker();
  window.setTimeout(() => void pingSlash(), 1500); // after the page has settled
}

// Saying a line: one <audio> element for all of Slash's speech. iOS plays a clip that arrives after a fetch only on an element that was started inside a tap, so a tap on Listen or Talk first plays half a second of
// silence on it, and the real clip reuses it. (Not tried on a real iPhone yet.)
const el = new Audio();
let unlocked = false, silenceUrl = '';
const silentWav = () => {
  const n = 800, d = new DataView(new ArrayBuffer(44 + n)), s = (o: number, t: string) => [...t].forEach((c, i) => d.setUint8(o + i, c.charCodeAt(0)));
  s(0, 'RIFF'); d.setUint32(4, 36 + n, true); s(8, 'WAVEfmt '); d.setUint32(16, 16, true); d.setUint16(20, 1, true); d.setUint16(22, 1, true); d.setUint32(24, 8000, true); d.setUint32(28, 8000, true); d.setUint16(32, 1, true); d.setUint16(34, 8, true); s(36, 'data'); d.setUint32(40, n, true);
  for (let i = 0; i < n; i++) d.setUint8(44 + i, 128);
  return d.buffer;
};
function unlockAudio() {
  if (unlocked) return;
  silenceUrl ||= URL.createObjectURL(new Blob([silentWav()], { type: 'audio/wav' }));
  unlocked = true; el.src = silenceUrl; el.play().catch(() => { unlocked = false; });
}
// A device's plays of Slash's voice a day: audio costs money, and the server has its own limit too.
const DAY_KEY = 'kern:slash-day', DAY_MAX = 60;
const underDayCap = () => {
  try {
    const [d, n] = (localStorage.getItem(DAY_KEY) || '').split(':'), today = new Date().toISOString().slice(0, 10), used = d === today ? Number(n) || 0 : 0;
    if (used >= DAY_MAX) return false;
    localStorage.setItem(DAY_KEY, `${today}:${used + 1}`);
  } catch { /* no storage: the server's limit still holds */ }
  return true;
};
type Said = 'done' | 'stopped' | 'failed';
let speaking: HTMLButtonElement | null = null, abort: AbortController | null = null, clipUrl = '', settle: ((r: Said) => void) | null = null;
// Stops the sound and the Listen button, nothing else.
function hush() {
  abort?.abort(); abort = null;
  el.onended = el.onerror = null; el.pause();
  if (clipUrl) { URL.revokeObjectURL(clipUrl); clipUrl = ''; }
  settle?.('stopped'); settle = null;
  if (speaking) { speaking.setAttribute('aria-pressed', 'false'); speaking.textContent = voice.tr('Listen'); speaking.setAttribute('aria-label', voice.tr('Listen to this question')); speaking = null; }
}
// Another screen, another button, a language switch, dictation: whatever is being said stops, and so does a voice chat.
export function stopSpeaking() { stopTalk(); hush(); }
// 'done': played to the end. 'stopped': stopped on purpose. 'failed': no clip (a busy server keeps the voice on offer; a broken key or an outage hides it for this visit).
async function say(text: string): Promise<Said> {
  if (!underDayCap()) return 'failed';
  const ctl = new AbortController(), to = window.setTimeout(() => ctl.abort(), 15000);
  abort = ctl;
  try {
    const r = await fetch('/api/speak', { method: 'POST', headers: { 'content-type': 'application/json' }, signal: ctl.signal, body: JSON.stringify({ lang: voice.lang(), text, voice: slashPick() }) });
    if (!r.ok) { if (r.status !== 429) setSlashOk(false); return 'failed'; }
    const blob = await r.blob();
    if (abort !== ctl) return 'stopped'; // stopped while it loaded
    clipUrl = URL.createObjectURL(blob);
    return await new Promise<Said>((done) => {
      settle = done; el.onended = () => done('done'); el.onerror = () => done('failed');
      el.src = clipUrl; el.play().catch(() => done('failed'));
    });
  } catch { return abort === ctl ? 'failed' : 'stopped'; } finally { clearTimeout(to); if (abort === ctl) abort = null; }
}

// Read aloud: a small "Listen" button on an assistant question. Off by default; a second tap, another button, a new screen or a language switch stops it.
export function listenButton(text: string): HTMLButtonElement | null {
  if (!text.trim()) return null;
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'k-listen'; b.setAttribute('aria-pressed', 'false'); b.textContent = voice.tr('Listen'); b.setAttribute('aria-label', voice.tr('Listen to this question'));
  b.addEventListener('click', () => {
    if (speaking === b) { stopSpeaking(); return; }
    stopSpeaking(); unlockAudio();
    speaking = b; b.setAttribute('aria-pressed', 'true'); b.textContent = voice.tr('Stop'); b.setAttribute('aria-label', voice.tr('Stop reading'));
    void say(text).then((r) => {
      if (r === 'stopped' || speaking !== b) return;
      hush();
      if (r === 'failed') { voice.say(NO_VOICE); fillPicker(); }
    });
  });
  return b;
}

// Talk with Slash: a voice chat in the Slash tab, started and ended by one tap. Slash says its line in its own voice, then the microphone opens for one answer, which goes into the chat like a typed one;
// the next reply is said the same way. It ends on a tap, on a heavy word (after Slash's pause line), after two silences, when the voice or the microphone fails, when the screen changes or the page is hidden.
// One utterance per turn (never continuous). If the browser will not open the microphone by itself, "Tap to answer" does it.
export type TalkState = 'off' | 'listening' | 'waiting' | 'speaking' | 'tap';
export type TalkBind = { row: HTMLElement; toggle: HTMLButtonElement; now: HTMLButtonElement; status: HTMLElement; field: HTMLInputElement; send: (said: string) => boolean; last: () => string };
let talk: TalkBind | null = null, talkState: TalkState = 'off', talkRec: Rec | null = null, talkLive = 0, silent = 0; // talkLive: bumped on every start and stop, so a late callback from an old turn does nothing
export const talking = () => talkState !== 'off';
const TALK_STATUS: Partial<Record<TalkState, string>> = { listening: 'Listening…', waiting: 'Slash is typing', speaking: 'Slash is speaking…' };
function paintTalk() {
  const t = talk; if (!t) return;
  const on = talkState !== 'off', line = TALK_STATUS[talkState];
  t.row.hidden = !(slashOk && !!SR && !blocked);
  t.toggle.textContent = voice.tr(on ? 'End conversation' : 'Talk with Slash'); t.toggle.setAttribute('aria-pressed', String(on));
  t.status.textContent = line ? voice.tr(line) : '';
  t.now.textContent = voice.tr('Tap to answer'); t.now.hidden = talkState !== 'speaking' && talkState !== 'tap';
}
const setTalk = (s: TalkState) => { talkState = s; paintTalk(); };
export function stopTalk() {
  if (talkState === 'off') return;
  talkLive++; talkState = 'off';
  try { talkRec?.abort(); } catch { /* already over */ }
  talkRec = null; hush(); paintTalk();
}
function listenTurn(my: number) {
  const t = talk;
  if (!t || my !== talkLive || !SR || blocked) return;
  let heard = '', why = '';
  const r = new SR();
  r.lang = tag(); r.interimResults = true; r.continuous = false;
  r.onresult = (ev) => { heard = ''; for (let i = 0; i < ev.results.length; i++) heard += ev.results[i][0].transcript; heard = heard.trim(); t.field.value = heard.slice(0, t.field.maxLength > 0 ? t.field.maxLength : heard.length); };
  r.onerror = (ev) => {
    why = ev.error || 'error';
    if (why === 'not-allowed' || why === 'service-not-allowed' || why === 'audio-capture') block();
    else if (why === 'network') voice.say('Voice needs a connection.');
  };
  r.onend = () => {
    if (my !== talkLive) return;
    talkRec = null;
    const said = t.field.value.trim();
    if (heard && said) {
      silent = 0; setTalk('waiting');
      if (!t.send(said)) { setTalk('tap'); return; } // a reply is still on its way: tap again when it is in
      window.setTimeout(() => { if (my === talkLive && talkState === 'waiting') stopTalk(); }, 30000); // no line came back: never wait for ever
      return;
    }
    if (why && why !== 'no-speech' && why !== 'aborted') { stopTalk(); return; }
    if (++silent >= 2) { voice.say('I did not hear anything. Try again.'); stopTalk(); return; }
    listenTurn(my);
  };
  talkRec = r; setTalk('listening');
  try { r.start(); } catch { talkRec = null; setTalk('tap'); }
}
async function talkSays(text: string, my: number, end: boolean) {
  setTalk('speaking');
  const r = text.trim() ? await say(text) : 'done';
  if (my !== talkLive || r === 'stopped') return; // ended, restarted, or "Tap to answer" took over
  if (r === 'failed') { voice.say(NO_VOICE); fillPicker(); stopTalk(); return; }
  if (end) stopTalk(); else listenTurn(my);
}
function startTalk() {
  if (talking() || !SR || blocked || !slashOk) return;
  voice.consent(() => { // the first time the privacy sheet comes up; the tap on Continue is the tap that unlocks the audio
    if (talking() || blocked || !slashOk || !talk) return;
    active?.stop(); stopSpeaking(); unlockAudio(); silent = 0;
    const my = ++talkLive;
    void talkSays(talk.last(), my, false);
  });
}
// app.ts calls this when a line from Slash lands in the chat: if it answers something said aloud, it is said aloud too and the microphone opens again (a pause line is said, then the voice chat ends).
export function talkLine(text: string, end = false) { if (talkState === 'waiting') void talkSays(text, talkLive, end); }
export function bindTalk(b: TalkBind) {
  talk = b;
  b.toggle.addEventListener('click', () => (talking() ? stopTalk() : startTalk()));
  b.now.addEventListener('click', () => { if (!talking()) return; const my = ++talkLive; hush(); unlockAudio(); listenTurn(my); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopTalk(); }); // the microphone never stays open behind another app
  paintTalk();
}
