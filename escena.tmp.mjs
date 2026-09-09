import { chromium } from 'playwright-core';
const FINGIR_GPU = () => {
  const NOMBRE = 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0)';
  for (const proto of [
    typeof WebGLRenderingContext !== 'undefined' ? WebGLRenderingContext.prototype : null,
    typeof WebGL2RenderingContext !== 'undefined' ? WebGL2RenderingContext.prototype : null,
  ]) {
    if (!proto) continue;
    const original = proto.getParameter;
    proto.getParameter = function (p) { return p === 0x9246 ? NOMBRE : original.call(this, p); };
  }
};
const nav = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.addInitScript(FINGIR_GPU);
await p.goto('http://localhost:4330/ciclorama', { waitUntil: 'networkidle' });
await p.waitForSelector('.escena--viva', { timeout: 60000 });
await p.waitForTimeout(2500);
await p.screenshot({ path: '/tmp/claude-0/cic.png', clip: { x: 0, y: 0, width: 1440, height: 900 } });
console.log('capturada');
await nav.close();
