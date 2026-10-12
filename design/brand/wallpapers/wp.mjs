import { chromium } from '/private/tmp/claude-501/-Users-manueldipaolo-Developer-Kern/cfe27968-c745-4beb-a395-4eee0d554d1e/scratchpad/rec.hLeU/node_modules/playwright-core/index.mjs';
const S = '/private/tmp/claude-501/-Users-manueldipaolo-Developer-Kern/cfe27968-c745-4beb-a395-4eee0d554d1e/scratchpad/';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1290, height: 2796 } });
for (const n of ['navy', 'blue', 'white']) { await p.goto('file:///Users/manueldipaolo/Developer/Kern/design/brand/wallpapers/wp-' + n + '.html'); await p.waitForTimeout(300); await p.screenshot({ path: `/Users/manueldipaolo/Desktop/KERN/7 Brand and logo/Phone wallpaper/slashkern-wallpaper-${n}.png` }); }
await b.close(); console.log('ok');
