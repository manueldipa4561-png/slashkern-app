import json, os, re
S = os.environ['S']
g = json.load(open(f'{S}/kern-flat/designs/slash/slash.json'))
d = g['body']
nums = [float(v) for v in re.findall(r'-?\d+(?:\.\d+)?', d)]
xs, ys = nums[0::2], nums[1::2]
x0, y0, x1, y1 = min(xs), min(ys), max(xs), max(ys)
pad = 9  # room for the white keyline (stroke 16 -> 8 outside)
side = max(x1 - x0, y1 - y0) + 2 * pad
vb = f'{x0 - pad:.1f} {y0 - pad:.1f} {side:.1f} {side:.1f}'
# the tip is the top-left corner of the body; hotspot in 32px space
hx = round((x0 - (x0 - pad) + 2) / side * 32); hy = round((y0 - (y0 - pad) + 2) / side * 32)
for mood in ('neutral', 'happy'):
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}"><path d="{d}" fill="#fff" stroke="#fff" stroke-width="16" stroke-linejoin="round"/><path d="{d}" fill="#0E1B3D"/><path d="{g["eyes"][mood]}" fill="#DCE6FF"/></svg>'
    open(f'{S}/cursor/{mood}.svg', 'w').write(svg)
json.dump({'hx': hx, 'hy': hy}, open(f'{S}/cursor/hot.json', 'w')); print('hotspot', hx, hy, 'side', side)
