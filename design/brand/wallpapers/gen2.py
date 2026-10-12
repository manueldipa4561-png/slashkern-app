import json, re, os
S = os.environ['S']
g = json.load(open(f'{S}/kern-flat/designs/slash/slash.json'))
FONT = '/Users/manueldipaolo/Developer/yourkern-site/node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2'
nums = [float(v) for v in re.findall(r'-?\d+(?:\.\d+)?', g['eyes']['neutral'])]; ys = nums[1::2]; eyey = (min(ys) + max(ys)) / 2
html = r'''<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:G;src:url("file://FONT");font-weight:100 900}
html,body{margin:0}body{width:2560px;height:1664px;overflow:hidden;background:#0E1B3D;position:relative;font-family:G}
.grain{position:absolute;inset:0;opacity:.05;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}
#w{position:absolute;left:0;top:0;width:0;height:0}
#s{position:absolute;height:300px;translate:-12% -14%;overflow:visible}
#b{position:absolute;left:0;top:0;padding:30px 42px 34px;background:#F5F2EA;color:#0E1B3D;border-radius:36px;font:600 46px/1.15 G;letter-spacing:-.02em;white-space:nowrap;transform-origin:0 100%;opacity:0}
#b::after{content:'';position:absolute;left:-14px;bottom:26px;border:16px solid transparent;border-right:22px solid #F5F2EA;border-left:0}
#b.l::after{left:auto;right:-14px;border-left:22px solid #F5F2EA;border-right:0}
#b .c{display:inline-block;width:.08em;height:.9em;margin-left:4px;vertical-align:-.1em;background:#2D4BFF}
</style><div class=grain></div><div id=b></div><div id=w><svg id=s viewBox="VB"><g id=all><path d="BODY" fill="#F5F2EA"/><g id=eg><path id=e d="NEUTRAL" fill="#0E1B3D"/></g></g></svg></div>
<script>
const EYES = EYESJSON;
const L = 30;
const ease = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));
// where Slash stops (tip position, px): clear of the menu bar, the Dock and the desktop icons on the right
const P = [[760, 760], [1640, 520], [1500, 1080], [700, 1140]];
// moves: [start, end, from, to, arc]
const M = [[4.4, 7.2, 0, 1, -120], [11.6, 14.4, 1, 2, 90], [18.4, 21.2, 2, 3, -80], [25.0, 28.4, 3, 0, 110]];
// lines: [start, end, text, mood]
const T = [[1.4, 4.2, "Hi, I'm Slash.", 'happy'], [8.0, 11.2, 'What are we making today?', 'asking'], [15.0, 17.8, 'Start small.', 'neutral'], [21.8, 24.6, 'Finish one thing today.', 'happy']];
const BL = [[0.6, 'neutral'], [1.3, 'happy'], [4.3, 'neutral'], [7.9, 'asking'], [11.3, 'neutral'], [16.2, 'neutral'], [21.7, 'happy'], [24.7, 'neutral'], [29.0, 'neutral']];
const clicks = [7.35, 14.55, 21.35];
window.render = (t) => {
  t = ((t % L) + L) % L;
  const all = document.getElementById('all'), eg = document.getElementById('eg'), e = document.getElementById('e'), w = document.getElementById('w'), b = document.getElementById('b');
  // position along the moves (eased, with a soft arc), else parked
  let x = P[0][0], y = P[0][1], vx = 0, vy = 0, moving = 0;
  let park = 0; for (const m of M) if (t >= m[1]) park = m[3];
  x = P[park][0]; y = P[park][1];
  for (const [a, z, f, to, arc] of M) if (t >= a && t < z) {
    const k = seg(t, a, z), q = ease(k), dq = (seg(t + 0.01, a, z) - k) ? (ease(seg(t + 0.01, a, z)) - q) / 0.01 : 0;
    const [x0, y0] = P[f], [x1, y1] = P[to], dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len, s = Math.sin(q * Math.PI) * arc;
    x = x0 + dx * q + nx * s; y = y0 + dy * q + ny * s;
    vx = dx * dq; vy = dy * dq; moving = Math.sin(k * Math.PI);
  }
  const bob = Math.sin(t / L * 2 * Math.PI * 6) * 10 * (1 - moving);
  w.style.transform = `translate(${x.toFixed(1)}px, ${(y + bob).toFixed(1)}px)`;
  // lean into the movement, a quick press on arrival (the click)
  const lean = Math.max(-9, Math.min(9, vx / 260));
  let press = 0; for (const c of clicks) if (t >= c && t < c + 0.42) press = Math.sin(seg(t, c, c + 0.42) * Math.PI);
  all.setAttribute('transform', `rotate(${lean.toFixed(2)} 120 120) translate(120 120) scale(${(1 - press * 0.07).toFixed(4)}) translate(-120 -120)`);
  // eyes: mood changes inside blinks; they look where Slash is going
  let mood = 'neutral'; for (const [bt, m] of BL) if (t >= bt + 0.09) mood = m;
  e.setAttribute('d', EYES[mood]);
  let sy = 1; for (const [bt] of BL) if (t >= bt && t < bt + 0.2) sy = Math.max(0.08, Math.abs(1 - 2 * seg(t, bt, bt + 0.2)));
  const vl = Math.hypot(vx, vy) || 1, look = Math.min(1, Math.hypot(vx, vy) / 400);
  const ex = vx / vl * 7 * look, ey = vy / vl * 7 * look;
  eg.setAttribute('transform', `translate(${ex.toFixed(2)} ${ey.toFixed(2)}) translate(0 EYEY) scale(1 ${sy.toFixed(3)}) translate(0 -EYEY)`);
  // the speech bubble: types in, holds, fades
  let shown = false;
  for (const [a, z, txt] of T) if (t >= a && t < z) {
    shown = true;
    const n = Math.min(txt.length, Math.floor((t - a - 0.25) * 26));
    const caret = (t - a) < (txt.length / 26 + 0.25) || Math.floor((t - a) * 2.4) % 2 === 0;
    b.innerHTML = (n > 0 ? txt.slice(0, n).replace(/&/g, '&amp;').replace(/</g, '&lt;') : '') + (caret ? '<span class=c></span>' : '');
    const inn = ease(seg(t, a, a + 0.25)), out = 1 - ease(seg(t, z - 0.3, z));
    const right = x < 1700;  // bubble on the right unless Slash is far right
    b.classList.toggle('l', !right);
    const bw = b.offsetWidth, bh = b.offsetHeight;
    const bx = right ? x + 250 : x - 40 - bw, by = y + bob - bh + 40;
    b.style.transformOrigin = right ? '0 100%' : '100% 100%';
    b.style.transform = `translate(${bx.toFixed(1)}px, ${by.toFixed(1)}px) scale(${(0.92 + 0.08 * inn).toFixed(3)})`;
    b.style.opacity = (inn * out).toFixed(3);
  }
  if (!shown) b.style.opacity = 0;
};
render(0);
</script>'''
html = html.replace('FONT', FONT).replace('VB', g['viewBox']).replace('BODY', g['body']).replace('NEUTRAL', g['eyes']['neutral']).replace('EYESJSON', json.dumps(g['eyes'])).replace('EYEY', f'{eyey:.1f}')
open(f'{S}/livewp/wp2.html', 'w').write(html); print('ok')
