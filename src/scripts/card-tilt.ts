// The KernCard as a collectible: it tilts toward the finger or the pointer, the foil shine and the glare follow, it sways a little on its own,
// and a tap (or the button) turns it over. The motion is five CSS variables on the stage (--rx --ry in degrees, --px --py the light, --bx the
// light mirrored for the back); the card's CSS (app.css, "KernCard v2") reads them. A touch only tilts it while held; a scroll lets go.
const MAX_DEG = 14;       // tilt at the very edge of the card
const EASE = 0.14;        // the share of the way to the target covered each frame (a critically damped feel, no overshoot)
const SWAY_MS = 9000;     // one slow lap of the idle sway
const PEEK_MS = 2200;     // phones sway once when the card comes into view, then rest (no endless animation there)
const TAP_PX = 8, TAP_MS = 450, SETTLED = 0.002;

type Parts = { stage: HTMLElement; flipper: HTMLElement; button: HTMLButtonElement; front: HTMLElement; back: HTMLElement };

export const bindCardTilt = ({ stage, flipper, button, front, back }: Parts, opts: { still: boolean; lite: boolean }) => {
  let flipped = false;
  const setFlip = (on: boolean) => {
    flipped = on;
    flipper.classList.toggle('is-flipped', on);
    button.setAttribute('aria-pressed', String(on));
    front.setAttribute('aria-hidden', String(on)); back.setAttribute('aria-hidden', String(!on));
  };
  button.addEventListener('click', () => setFlip(!flipped));
  if (opts.still) { stage.addEventListener('click', () => setFlip(!flipped)); return; } // reduced motion: the turn is instant (CSS), nothing tilts

  let tx = 0, ty = 0, cx = 0, cy = 0, held = false, hover = false, visible = false, raf = 0, seen = 0, down: { x: number; y: number; t: number } | null = null;
  const set = (k: string, v: string) => stage.style.setProperty(k, v);
  const paint = () => {
    const px = 0.5 + cx * 0.5;
    set('--rx', `${(-cy * MAX_DEG).toFixed(2)}deg`); set('--ry', `${(cx * MAX_DEG).toFixed(2)}deg`);
    set('--px', px.toFixed(3)); set('--bx', (1 - px).toFixed(3)); set('--py', (0.5 + cy * 0.5).toFixed(3));
  };
  const tick = (now: number) => {
    raf = 0;
    if (!visible || document.hidden) return;
    const sway = !held && !hover && (!opts.lite || now - seen < PEEK_MS);
    if (sway) { const a = (now / SWAY_MS) * Math.PI * 2; tx = Math.sin(a) * 0.38; ty = Math.cos(a * 0.8) * 0.3; }
    else if (!held && !hover) { tx = 0; ty = 0; }
    cx += (tx - cx) * EASE; cy += (ty - cy) * EASE;
    paint();
    if (sway || held || hover || Math.abs(tx - cx) > SETTLED || Math.abs(ty - cy) > SETTLED) raf = requestAnimationFrame(tick);
  };
  const kick = () => { if (!raf && visible) raf = requestAnimationFrame(tick); };
  const aim = (e: PointerEvent) => {
    const r = stage.getBoundingClientRect();
    tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
    ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
    kick();
  };

  stage.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { hover = true; aim(e); } });
  stage.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') { hover = false; kick(); } });
  stage.addEventListener('pointerdown', (e) => { held = true; down = { x: e.clientX, y: e.clientY, t: e.timeStamp }; aim(e); });
  stage.addEventListener('pointermove', (e) => { if (held || e.pointerType === 'mouse') aim(e); });
  stage.addEventListener('pointerup', (e) => {
    held = false;
    const tap = down && Math.hypot(e.clientX - down.x, e.clientY - down.y) < TAP_PX && e.timeStamp - down.t < TAP_MS;
    down = null;
    if (tap) setFlip(!flipped);
    kick();
  });
  stage.addEventListener('pointercancel', () => { held = false; down = null; kick(); }); // a scroll took the finger: let the card rest

  seen = performance.now();
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) { seen = performance.now(); kick(); }
  }, { threshold: 0.2 }).observe(stage);
};
