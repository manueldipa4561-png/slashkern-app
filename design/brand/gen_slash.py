# slashkern brand kit: the logo (eyes pointer, variant C "balanced") and Slash, the assistant, from one geometry.
# Run from this folder: python3 gen_slash.py  -> slash.json + mark/icon/favicon/mood SVGs. Checks every mood's eyes stay inside the body.
# PNG sizes (icons, cursor, wallpapers) are screenshots of these SVGs in a browser (see README.md).
import json, math, re

NAVY, ULTRA, ICE, CREAM, WHITE = '#0E1B3D', '#2D4BFF', '#DCE6FF', '#F5F2EA', '#FFFFFF'
G = json.load(open('geometry.json'))
RADII = [9, 18, 8, 14, 14, 8, 18]  # corner rounding, in px of the 400 canvas


def toward(a, b, dist):
    dx, dy = b[0] - a[0], b[1] - a[1]
    t = min(dist / math.hypot(dx, dy), 0.5)
    return (a[0] + dx * t, a[1] + dy * t)


def rpoly(pts, r):
    d = ''
    for i, p1 in enumerate(pts):
        p0, p2 = pts[i - 1], pts[(i + 1) % len(pts)]
        rr = r[i] if isinstance(r, (list, tuple)) else r
        a, b = toward(p1, p0, rr), toward(p1, p2, rr)
        d += ('M' if i == 0 else 'L') + f'{a[0]:.2f} {a[1]:.2f}Q{p1[0]:.2f} {p1[1]:.2f} {b[0]:.2f} {b[1]:.2f}'
    return d + 'Z'


def rot(pt, c, deg):
    a = math.radians(deg)
    x, y = pt[0] - c[0], pt[1] - c[1]
    return (c[0] + x * math.cos(a) - y * math.sin(a), c[1] + x * math.sin(a) + y * math.cos(a))


def pill(cx, cy, w, h, deg=0):
    pts = [rot(p, (cx, cy), deg) for p in [(cx - w / 2, cy - h / 2), (cx + w / 2, cy - h / 2), (cx + w / 2, cy + h / 2), (cx - w / 2, cy + h / 2)]]
    return rpoly(pts, [w / 2 - 0.01] * 4)


def arcband(cx, cy, R, t, a0=200, a1=340, n=24):
    outer = [(cx + R * math.cos(math.radians(a0 + (a1 - a0) * i / n)), cy + R * math.sin(math.radians(a0 + (a1 - a0) * i / n))) for i in range(n + 1)]
    inner = [(cx + (R - t) * math.cos(math.radians(a1 - (a1 - a0) * i / n)), cy + (R - t) * math.sin(math.radians(a1 - (a1 - a0) * i / n))) for i in range(n + 1)]
    return 'M' + 'L'.join(f'{x:.2f} {y:.2f}' for x, y in outer + inner) + 'Z'


# body: unit polygon scaled and centred on the 400 canvas
S = G['S']
pts = [(u[0] * S, u[1] * S) for u in G['U']]
xs, ys = [p[0] for p in pts], [p[1] for p in pts]
ox, oy = 200 - (min(xs) + (max(xs) - min(xs)) / 2), 200 - (min(ys) + (max(ys) - min(ys)) / 2) + 4
POLY = [(x + ox, y + oy) for x, y in pts]
BODY = rpoly(POLY, RADII)
(x1, y1), (x2, y2) = [(u[0] * S + ox, u[1] * S + oy) for u in (G['e1'], G['e2'])]
EW, EH, T = G['ew'], G['eh'], G['tilt']


def pills(specs): return ''.join(pill(x, y, w, h, T) for x, y, w, h in specs)


MOODS = {
    'neutral': pills([(x1, y1, EW, EH), (x2, y2, EW, EH)]),
    'asking': pills([(x1, y1 + 3, EW - 4, EH - 12), (x2, y2 - 2, EW + 1, EH + 3)]),      # one eye bigger: curious
    'thinking': pills([(x1 + 4, y1 - 7, EW - 2, EH - 16), (x2 + 4, y2 - 7, EW - 2, EH - 16)]),  # eyes up, narrowed
    'happy': arcband(x1, y1 + 9, 17, 9) + arcband(x2, y2 + 9, 17, 9),                   # smiling eyes
    'blink': pills([(x1, y1 + 10, EW + 3, 10), (x2, y2 + 10, EW + 3, 10)]),
    'look': pills([(x1 - 6, y1 - 6, EW, EH), (x2 - 6, y2 - 6, EW, EH)]),               # looks toward the tip
}


def inside(p, poly):
    c, n = False, len(poly)
    for i in range(n):
        (xa, ya), (xb, yb) = poly[i], poly[(i + 1) % n]
        if (ya > p[1]) != (yb > p[1]) and p[0] < (xb - xa) * (p[1] - ya) / (yb - ya) + xa:
            c = not c
    return c


for k, d in MOODS.items():
    nums = [float(v) for v in re.findall(r'-?\d+(?:\.\d+)?', d)]
    assert all(inside(p, POLY) for p in zip(nums[0::2], nums[1::2])), f'{k}: eye outside the body'

pad = 10
bx0, by0 = min(p[0] for p in POLY) - pad, min(p[1] for p in POLY) - pad
bx1, by1 = max(p[0] for p in POLY) + pad, max(p[1] for p in POLY) + pad
VB = f'{bx0:.0f} {by0:.0f} {bx1 - bx0:.0f} {by1 - by0:.0f}'
json.dump({'viewBox': VB, 'body': BODY, 'eyes': MOODS}, open('slash.json', 'w'))


def svg(inner, vb='0 0 400 400'): return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}">{inner}</svg>\n'


def write(name, text): open(name, 'w').write(text)


def tile(scale, rx=0, kw=18):
    r = f' rx="{rx}"' if rx else ''
    return svg(f'<rect width="400" height="400"{r} fill="{ULTRA}"/><g transform="translate(200 206) scale({scale}) translate(-200 -200)">'
               f'<path d="{BODY}" fill="{WHITE}" stroke="{WHITE}" stroke-width="{kw}" stroke-linejoin="round"/><path d="{BODY}" fill="{NAVY}"/><path d="{MOODS["neutral"]}" fill="{ICE}"/></g>')


write('mark.svg', svg(f'<path d="{BODY}" fill="{NAVY}"/><path d="{MOODS["neutral"]}" fill="{ICE}"/>', VB))
write('mark-rev.svg', svg(f'<path d="{BODY}" fill="{CREAM}"/><path d="{MOODS["neutral"]}" fill="{NAVY}"/>', VB))
write('icon.svg', tile(.86))
write('icon-maskable.svg', tile(.66))
write('favicon.svg', tile(.9, rx=88, kw=22))
for k in ('neutral', 'asking', 'thinking', 'happy'):
    write(f'slash-{k}.svg', svg(f'<path d="{BODY}" fill="{WHITE}" stroke="{WHITE}" stroke-width="16" stroke-linejoin="round"/><path d="{BODY}" fill="{NAVY}"/><path d="{MOODS[k]}" fill="{ICE}"/>', VB))
print('ok, viewBox', VB)
