// Voice (v10): dictation (speech to text) and read aloud (text to speech), both through the browser, both off until a person taps. Nothing is recorded or stored by slashkern.
// Feature-detected and iOS 15 safe: SpeechRecognition / webkitSpeechRecognition and speechSynthesis only, no newer API. Without them, or when the microphone is refused,
// the microphone button is hidden and a one-line tip says to use the keyboard's own microphone. A hands-free voice conversation is out of scope.
//
// app.ts sets `voice` (the app language, the translator, a toast, and the one-time privacy sheet) before it attaches anything.
export const voice = {
  lang: (): string => 'en',
  tr: (s: string): string => s,
  say: (_s: string): void => { /* app.ts */ },
  consent: (go: () => void): void => { go(); }, // app.ts: the first time, the privacy sheet; then it calls go() on Continue
};

const TAG: Record<string, string> = { en: 'en-GB', it: 'it-IT', de: 'de-DE', fr: 'fr-FR', nl: 'nl-NL', sv: 'sv-SE' };
const tag = () => TAG[voice.lang()] ?? 'en-GB';

type Ev = { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>; error?: string };
type Rec = { lang: string; interimResults: boolean; continuous: boolean; onresult: ((e: Ev) => void) | null; onerror: ((e: Ev) => void) | null; onend: (() => void) | null; start(): void; stop(): void; abort(): void };
const w = window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec; SpeechSynthesisUtterance?: new (t: string) => SpeechSynthesisUtterance };
const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
const TIP = 'Tip: use the microphone on your keyboard to talk instead of typing.';

const MIC_ICON = '<svg class="k-i k-mic-i" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3"/></svg>';
type Mic = { btn: HTMLButtonElement; tip: HTMLElement; stop: () => void };
const mics: Mic[] = [];
let blocked = !SR; // permission refused, no microphone, or no SpeechRecognition
let active: Mic | null = null;

const paint = () => mics.forEach((m) => { m.btn.hidden = blocked; m.tip.hidden = !blocked; });
// A refused microphone hides every button and shows the tip, once.
const block = () => { blocked = true; active?.stop(); paint(); };

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

// Slash's voice: the voices this phone has for the app language, as one menu in Settings. The pick is kept on this device (voices belong to the device) and the Listen buttons use it.
const voiceKey = () => `kern:voice:${voice.lang()}`;
const voicesHere = (): SpeechSynthesisVoice[] => {
  if (!canSpeak) return [];
  const base = tag().slice(0, 2).toLowerCase();
  return window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith(base) && !NOVELTY.test(v.name));
};
const NOVELTY = /^(Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Good News|Jester|Organ|Superstar|Trinoids|Whisper|Wobble|Zarvox)\b/; // macOS joke voices: not a voice for a coach
function chosenVoice(): SpeechSynthesisVoice | undefined {
  let id = ''; try { id = localStorage.getItem(voiceKey()) || ''; } catch { /* the default voice */ }
  return id ? voicesHere().find((v) => v.voiceURI === id) : undefined;
}
let picker: { row: HTMLElement; sel: HTMLSelectElement } | null = null;
function fillPicker() {
  if (!picker) return;
  const list = voicesHere();
  picker.sel.replaceChildren(new Option(voice.tr('Default voice'), ''), ...list.map((v) => new Option(v.name, v.voiceURI)));
  picker.sel.value = chosenVoice()?.voiceURI ?? '';
  picker.row.hidden = list.length < 2; // one voice is no choice
}
export function bindVoicePicker(row: HTMLElement, sel: HTMLSelectElement) {
  picker = { row, sel };
  sel.addEventListener('change', () => {
    try { if (sel.value) localStorage.setItem(voiceKey(), sel.value); else localStorage.removeItem(voiceKey()); } catch { /* not kept: the default voice next time */ }
    stopSpeaking();
    const mine = chosenVoice(), u = new w.SpeechSynthesisUtterance!(voice.tr("Slash's voice")); u.lang = tag(); if (mine) u.voice = mine; // a short sample in the new voice
    try { window.speechSynthesis.speak(u); } catch { /* no sample */ }
  });
  if (canSpeak) window.speechSynthesis.addEventListener('voiceschanged', fillPicker); // Chrome and Safari load the voice list late
  fillPicker();
}

// Read aloud: a small "Listen" button on an assistant question. Off by default; a second tap, another button, a new screen or a language switch stops it.
export const canSpeak = !!(w.SpeechSynthesisUtterance && 'speechSynthesis' in window);
let speaking: HTMLButtonElement | null = null;
export function stopSpeaking() {
  if (canSpeak) { try { window.speechSynthesis.cancel(); } catch { /* nothing to stop */ } }
  if (speaking) { speaking.setAttribute('aria-pressed', 'false'); speaking.textContent = voice.tr('Listen'); speaking.setAttribute('aria-label', voice.tr('Listen to this question')); speaking = null; }
}
export function listenButton(text: string): HTMLButtonElement | null {
  if (!canSpeak || !text.trim()) return null;
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'k-listen'; b.setAttribute('aria-pressed', 'false'); b.textContent = voice.tr('Listen'); b.setAttribute('aria-label', voice.tr('Listen to this question'));
  b.addEventListener('click', () => {
    if (speaking === b) { stopSpeaking(); return; }
    stopSpeaking();
    const u = new w.SpeechSynthesisUtterance!(text); u.lang = tag();
    const mine = chosenVoice(); if (mine) u.voice = mine; // the voice picked in Settings, else the phone's default for this language
    u.onend = u.onerror = () => { if (speaking === b) stopSpeaking(); };
    speaking = b; b.setAttribute('aria-pressed', 'true'); b.textContent = voice.tr('Stop'); b.setAttribute('aria-label', voice.tr('Stop reading'));
    try { window.speechSynthesis.speak(u); } catch { stopSpeaking(); }
  });
  return b;
}
