import { chromium } from '/private/tmp/claude-501/-Users-manueldipaolo-Developer-Kern/cfe27968-c745-4beb-a395-4eee0d554d1e/scratchpad/rec.hLeU/node_modules/playwright-core/index.mjs';
const D = '/private/tmp/claude-501/-Users-manueldipaolo-Developer-Kern/cfe27968-c745-4beb-a395-4eee0d554d1e/scratchpad/livewp/';
const [,, fps = '60', only] = process.argv;
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 2560, height: 1664 } });
await p.goto('file://' + D + 'wp2.html'); await p.waitForTimeout(300);
const N = 30 * +fps;
const list = only ? only.split(',').map(Number) : [...Array(N).keys()];
for (const i of list) { await p.evaluate(t => window.render(t), i / +fps); await p.screenshot({ path: `${D}frames2/f${String(i).padStart(4, '0')}.png` }); }
await b.close(); console.log('frames', list.length);
