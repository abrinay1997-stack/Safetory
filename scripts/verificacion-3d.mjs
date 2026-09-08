/**
 * Paso 5b de la Tarea 11 — la unica verificacion que existe del motor 3D.
 *
 * `motor.ts` y `planos-profundidad.ts` no se pueden ejecutar en Node: necesitan
 * DOM, WebGL, ResizeObserver e IntersectionObserver. Se decidio no montar un
 * andamiaje de mocks —verificaria el mock, no el motor— a cambio de comprobarlo
 * en un navegador real. Esto es esa comprobacion, y todos los fallos que busca
 * son silenciosos: ni excepcion, ni test rojo, ni nada en consola.
 *
 * No forma parte de `npm test` a proposito: necesita `playwright-core` y un
 * Chromium, que no son dependencias del proyecto. Para ejecutarlo:
 *
 *   npm run build
 *   npx astro preview --port 4330 &
 *   npm i --no-save playwright-core
 *   node scripts/verificacion-3d.mjs
 *
 * Variables: BASE (por defecto http://localhost:4330), RUTA (por defecto /),
 * CHROMIUM (ruta al ejecutable; por defecto el que resuelva playwright-core).
 *
 * ── Dos trampas que costaron encontrar, anotadas para quien lo retome ──
 *
 * 1. El canvas NO se puede leer con `drawImage` sobre un canvas 2D. El renderer
 *    no usa `preserveDrawingBuffer`, asi que tras componer el frame el buffer
 *    queda vacio y se lee negro transparente. Una medida escrita asi da 0
 *    siempre y «pasa» por la razon equivocada. Se lee por captura de pantalla.
 *
 * 2. `locator.screenshot()` desplaza la pagina para encuadrar el elemento. Con
 *    una escena cuyo encuadre DEPENDE del scroll, eso devuelve siempre el mismo
 *    frame y los tres primeros puntos pasan o fallan por accidente. Se captura
 *    el viewport con `page.screenshot`, que no mueve nada.
 */
import { chromium } from 'playwright-core';
import { createHash } from 'node:crypto';

const BASE = process.env.BASE ?? 'http://localhost:4330';
const RUTA = process.env.RUTA ?? '/';
const EJECUTABLE = process.env.CHROMIUM || undefined;
const ANCHO = 1280, ALTO = 800;

const resultados = [];
function anotar(n, titulo, ok, detalle) {
  resultados.push({ n, titulo, ok, detalle });
  console.log(`${ok ? '  OK  ' : ' FALLA'} ${n}. ${titulo}\n        ${detalle}`);
}

const huella = (png) => createHash('sha1').update(png).digest('hex').slice(0, 12);
const foto = (pagina) => pagina.screenshot({ clip: { x: 0, y: 0, width: ANCHO, height: ALTO } });
const irA = async (pagina, y) => {
  await pagina.evaluate((v) => window.scrollTo(0, v), y);
  await pagina.waitForTimeout(900);
};

/**
 * Ancho maximo de la silueta dentro de una banda de filas del viewport.
 * Es una medida horizontal: no la altera que el scroll recorte por arriba, y
 * comparando la MISMA banda de filas del canvas en dos posiciones de scroll
 * distintas, lo unico que puede moverla es que la camara se haya acercado.
 */
async function anchoSilueta(pagina, png, y0, y1) {
  return pagina.evaluate(async ([b64, a, b]) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const d = document.createElement('canvas');
    d.width = img.width; d.height = img.height;
    const x = d.getContext('2d');
    x.drawImage(img, 0, 0);
    const alto = b - a;
    const px = x.getImageData(0, a, img.width, alto).data;
    let izq = img.width, der = -1;
    for (let i = 0; i < px.length; i += 4) {
      if (Math.abs(px[i] - 8) > 6 || Math.abs(px[i + 1] - 8) > 6 || Math.abs(px[i + 2] - 8) > 6) {
        const cx = (i / 4) % img.width;
        if (cx < izq) izq = cx;
        if (cx > der) der = cx;
      }
    }
    return der < 0 ? 0 : der - izq;
  }, [png.toString('base64'), y0, y1]);
}

/** Porcentaje de la franja lateral que no es el fondo --void plano. */
async function fondoNoPlano(pagina, png) {
  return pagina.evaluate(async (b64) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const d = document.createElement('canvas');
    d.width = img.width; d.height = img.height;
    const x = d.getContext('2d');
    x.drawImage(img, 0, 0);
    const ancho = Math.floor(img.width * 0.14);
    const px = x.getImageData(0, 0, ancho, img.height).data;
    let distintos = 0;
    for (let i = 0; i < px.length; i += 4) {
      if (Math.abs(px[i] - 8) > 1 || Math.abs(px[i + 1] - 8) > 1 || Math.abs(px[i + 2] - 8) > 1) distintos++;
    }
    return +(100 * distintos / (px.length / 4)).toFixed(1);
  }, png.toString('base64'));
}

const navegador = await chromium.launch({
  executablePath: EJECUTABLE,
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox', '--disable-dev-shm-usage'],
});
const contexto = await navegador.newContext({ viewport: { width: ANCHO, height: ALTO } });
const pagina = await contexto.newPage();

const texturas = [];
pagina.on('response', (r) => {
  if (/\/escena\/.*\.webp$/.test(r.url())) texturas.push(r.status());
});

// El observador de CLS tiene que existir antes de que cargue nada.
await pagina.addInitScript(() => {
  window.__cls = 0;
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
  }).observe({ type: 'layout-shift', buffered: true });
});

await pagina.goto(BASE + RUTA, { waitUntil: 'networkidle' });
try {
  await pagina.waitForSelector('.escena--viva', { timeout: 30000 });
} catch {
  // Sin `.escena--viva` no hay nada que medir: la clase la pone `alListo`, tras
  // el primer frame. Se informa y se sale, en vez de reventar con una traza.
  anotar(0, 'La escena llega a dibujar su primer frame', false,
    'la clase .escena--viva no aparecio en 30 s: el bucle no llego a dibujar');
  console.log('\n0/6 puntos en verde');
  await navegador.close();
  process.exit(1);
}
await pagina.waitForTimeout(1000);

// El CLS se lee antes de tocar nada mas: es de la carga.
const cls = await pagina.evaluate(() => window.__cls);

// ── 7 (medido aqui) · El titular sobrevive al troceado como encabezado ──────
// `revelarTitular` parte el texto en caracteres y oculta el resultado a la
// accesibilidad. Que las palabras sigan en el DOM no basta: hay que comprobar
// que el elemento siga siendo un encabezado de nivel 1 con su nombre, y eso
// solo lo dice el arbol de accesibilidad de un navegador real, ya troceado.
//
// Se mide AQUI, antes de ocultar las capas de encima para las fotos: el
// `visibility: hidden` que se inyecta mas abajo tapa el hero entero y con el
// el titular, y saca del arbol de accesibilidad justo lo que se quiere medir.
const encabezados = await pagina.evaluate(() =>
  Array.from(document.querySelectorAll('h1')).map((h) => ({
    oculto: h.getAttribute('aria-hidden') === 'true',
    texto: (h.textContent ?? '').trim(),
    partido: h.dataset.partido === 'si',
  })));
// `getByRole` resuelve por el arbol de accesibilidad y descarta lo que lleva
// `aria-hidden`: si el titular volviera a ocultarse entero, esta cuenta da 0.
const porRol = pagina.getByRole('heading', { level: 1 });
const cuantos = await porRol.count();
const nombre = cuantos ? (await porRol.first().ariaSnapshot()).trim() : 'NINGUNO';


// A partir de aqui solo interesa el canvas. Se ocultan las capas de encima
// para que ningun cambio de la huella venga del texto en vez de la escena.
await pagina.addStyleTag({ content: `
  .nav, .saltar, footer, .hero__texto, .escena__poster { visibility: hidden !important; }
` });
await pagina.waitForTimeout(400);

// ── 1 · La escena se ve y la camara se mueve con el scroll ───────────────────
// Se compara la MISMA banda de filas del canvas (200..800) en dos posiciones de
// scroll: en S=0 son las filas 200..800 del viewport, y en S=200 las 0..600.
// Recorte identico, asi que un ancho distinto solo puede ser la camara.
const fotoS0 = await foto(pagina);
const anchoS0 = await anchoSilueta(pagina, fotoS0, 200, 800);
await irA(pagina, 200);
const fotoS200 = await foto(pagina);
const anchoS200 = await anchoSilueta(pagina, fotoS200, 0, 600);
const creceAlAcercarse = anchoS0 > 0 && Math.abs(anchoS200 - anchoS0) / anchoS0 > 0.02;
anotar(1, 'La escena se ve y la camara se mueve con el scroll', creceAlAcercarse,
  `ancho de la silueta en las mismas filas del canvas: ${anchoS0} px en t=0,50 -> ${anchoS200} px en t=0,625`);

// ── 4 · Los planos de profundidad ───────────────────────────────────────────
const todas200 = texturas.length >= 2 && texturas.every((e) => e === 200);
const fondo = await fondoNoPlano(pagina, fotoS0);
anotar(4, 'Los planos de profundidad se dibujan detras del objeto', todas200 && fondo > 1,
  `texturas ${texturas.join(',') || 'ninguna'}; ${fondo} % de la franja lateral no es --void plano`);

// ── 2 · Sale del viewport y vuelve ──────────────────────────────────────────
// Vuelta a S=0 y comparacion contra la foto inicial, tomada en ese MISMO punto.
// Si el IntersectionObserver re-arranca el bucle, se vuelve a dibujar t=0,50 y
// la huella coincide. Si el bucle murio, el canvas conserva el ultimo frame
// dibujado antes de salir de pantalla, que es otro punto de la espiral.
await irA(pagina, 0);
const huellaInicial = huella(fotoS0);
await pagina.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await pagina.waitForTimeout(1400);
await irA(pagina, 0);
await pagina.waitForTimeout(600);
const huellaVuelta = huella(await foto(pagina));
anotar(2, 'Sale del viewport, vuelve y el bucle re-arranca',
  huellaInicial === huellaVuelta,
  `huella en S=0 antes ${huellaInicial}, despues del viaje ${huellaVuelta}`);

// ── 3 · Se oculta la pestana y vuelve ───────────────────────────────────────
// Camino distinto del 2: lo re-arranca `visibilitychange`, y una escena puede
// sobrevivir al 2 y morir en este. Con la pestana «oculta» se mueve el scroll:
// el bucle esta parado, asi que el canvas conserva el frame de S=0. Al volver
// a «visible» debe redibujar el frame que toca. Las dos fotos se toman en la
// misma posicion de scroll, de modo que el recorte es identico.
const fingir = (v) => pagina.evaluate((estado) => {
  Object.defineProperty(document, 'visibilityState', { value: estado, configurable: true });
  document.dispatchEvent(new Event('visibilitychange'));
}, v);

await fingir('hidden');
await pagina.waitForTimeout(600);
await irA(pagina, 300);
const congelada = huella(await foto(pagina));
await fingir('visible');
await pagina.waitForTimeout(1200);
const revivida = huella(await foto(pagina));
anotar(3, 'Se oculta la pestana (para el bucle) y al volver revive',
  congelada !== revivida,
  `en S=300 con la pestana oculta ${congelada}, tras volver ${revivida}`);

// ── 5 · El cruce poster -> canvas ───────────────────────────────────────────
anotar(5, 'El cruce poster -> canvas no produce salto', cls <= 0.02,
  `CLS ${cls.toFixed(4)} (presupuesto 0,02)`);

anotar(7, 'El titular troceado sigue siendo un encabezado de nivel 1',
  encabezados.length === 1 && encabezados[0].partido && !encabezados[0].oculto && cuantos === 1,
  `h1 en el DOM: ${encabezados.length}, troceado: ${encabezados[0]?.partido}, ` +
  `aria-hidden sobre el h1: ${encabezados[0]?.oculto}; ` +
  `encabezados de nivel 1 en el arbol de accesibilidad: ${cuantos} — ${nombre.replace(/\s+/g, ' ')}`);

await contexto.close();

// ── 6 · prefers-reduced-motion ──────────────────────────────────────────────
const ctxReducido = await navegador.newContext({ viewport: { width: ANCHO, height: ALTO }, reducedMotion: 'reduce' });
const reducida = await ctxReducido.newPage();
const descargas = [];
reducida.on('request', (r) => { if (/three|motor/i.test(r.url())) descargas.push(r.url().split('/').pop()); });
await reducida.goto(BASE + RUTA, { waitUntil: 'networkidle' });
await reducida.waitForTimeout(4000);
const viva = await reducida.evaluate(() => document.querySelector('.escena')?.classList.contains('escena--viva') ?? false);
anotar(6, 'Con prefers-reduced-motion se queda en el poster y no descarga three',
  !viva && descargas.length === 0,
  `escena viva: ${viva}; descargas de three: ${descargas.length ? descargas.join(', ') : 'ninguna'}`);

await ctxReducido.close();
await navegador.close();

const fallos = resultados.filter((r) => !r.ok);
console.log(`\n${resultados.length - fallos.length}/${resultados.length} puntos en verde`);
process.exit(fallos.length === 0 ? 0 : 1);
