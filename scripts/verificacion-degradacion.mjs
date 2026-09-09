/**
 * Paso 4 de la Tarea 22 — la degradación de §7.3, comprobada de verdad.
 *
 * El sitio promete que sigue completo y navegable cuando el 3D no puede o no
 * debe ejecutarse. Eso son tres caminos distintos, y los tres fallan en
 * silencio: la página se ve «bien» y nadie se entera de que la escena se
 * quedó a medias o de que el teclado no llega a un enlace.
 *
 *   npm run build
 *   npx astro preview --port 4330 &
 *   npm i --no-save playwright-core
 *   node scripts/verificacion-degradacion.mjs
 */
import { chromium } from 'playwright-core';

const BASE = process.env.BASE ?? 'http://localhost:4330';
const EJECUTABLE = process.env.CHROMIUM || undefined;
const RUTAS = ['/', '/estudio', '/ciclorama', '/produccion', '/membresia', '/contacto'];

const resultados = [];
function anotar(titulo, ok, detalle) {
  resultados.push({ titulo, ok });
  console.log(`${ok ? '  OK  ' : ' FALLA'} ${titulo}\n        ${detalle}`);
}

const navegador = await chromium.launch({
  executablePath: EJECUTABLE,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

// ── 1 · Sin WebGL ───────────────────────────────────────────────────────────
// Este contenedor ya arranca sin GPU, y `capacidades.ts` descarta los
// rasterizadores por software: es exactamente el caso «sin WebGL utilizable».
{
  const ctx = await navegador.newContext({ viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage();
  const descargas = [];
  p.on('request', (r) => { if (/three|motor/i.test(r.url())) descargas.push(r.url()); });
  const errores = [];
  p.on('pageerror', (e) => errores.push(e.message));

  const filas = [];
  for (const ruta of RUTAS) {
    await p.goto(BASE + ruta, { waitUntil: 'networkidle' });
    await p.waitForTimeout(1200);
    filas.push(await p.evaluate(() => ({
      poster: Boolean(document.querySelector('.escena__poster')),
      viva: document.querySelector('.escena')?.classList.contains('escena--viva') ?? false,
      textoVisible: (document.querySelector('main')?.innerText ?? '').trim().length,
      enlaces: document.querySelectorAll('main a[href]').length,
    })));
  }
  anotar('Sin GPU utilizable: se queda en el poster y la pagina sigue completa',
    filas.every((f) => f.poster && !f.viva && f.textoVisible > 300 && f.enlaces > 0) &&
      descargas.length === 0 && errores.length === 0,
    `posters ${filas.filter((f) => f.poster).length}/6 · escenas vivas ${filas.filter((f) => f.viva).length} · ` +
    `descargas de three ${descargas.length} · errores ${errores.length}`);
  await ctx.close();
}

// ── 2 · prefers-reduced-motion ──────────────────────────────────────────────
{
  const ctx = await navegador.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(BASE + '/', { waitUntil: 'networkidle' });

  await p.waitForTimeout(2000);
  const estado = await p.evaluate(() => ({
    lenis: document.documentElement.classList.contains('lenis'),
    despiece: document.querySelector('[data-despiece]')?.dataset.montado ?? 'no',
    // Sin movimiento, el titular no se trocea: tiene que seguir siendo texto.
    titular: (document.querySelector('h1')?.textContent ?? '').trim(),
    partido: document.querySelector('h1')?.dataset.partido ?? 'no',
  }));
  anotar('Con prefers-reduced-motion: sin Lenis, sin despiece y el titular intacto',
    !estado.lenis && estado.despiece === 'no' && estado.partido === 'no' && estado.titular.length > 0,
    `lenis ${estado.lenis} · despiece ${estado.despiece} · titular troceado ${estado.partido} · «${estado.titular}»`);
  await ctx.close();
}

// ── 3 · Teclado ─────────────────────────────────────────────────────────────
// Se recorre en escritorio Y en movil: el boton del menu solo existe bajo
// 900px, asi que una pasada sola deja sin comprobar la mitad de la interfaz.
for (const ancho of [1280, 390]) {
  const ctx = await navegador.newContext({ viewport: { width: ancho, height: 844 } });
  const p = await ctx.newPage();
  const problemas = [];
  for (const ruta of RUTAS) {
    await p.goto(BASE + ruta, { waitUntil: 'networkidle' });
    await p.waitForTimeout(800);

    await p.keyboard.press('Tab');
    const primero = await p.evaluate(() => ({
      texto: document.activeElement?.textContent?.trim(),
      href: document.activeElement?.getAttribute('href'),
    }));
    if (primero.href !== '#contenido') {
      problemas.push(`${ruta}: el primer foco no es el salto al contenido (${primero.href})`);
    }

    // Recorrer todo lo enfocable y comprobar que ninguno queda sin contorno.
    const sinContorno = await p.evaluate(() => {
      // Sin anotaciones de TypeScript: este archivo lo parsea Node antes de
      // enviar la funcion al navegador.
      const todos = document.querySelectorAll(
        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      // Solo lo que de verdad se puede enfocar: un elemento en display:none no
      // recibe foco, asi que medirle el contorno da un falso negativo. Es lo
      // que pasaba con el boton del menu movil en escritorio.
      const enfocables = [...todos].filter((el) => el.getClientRects().length > 0);
      const malos = [];
      enfocables.forEach((el) => {
        el.focus();
        const e = getComputedStyle(el);
        const sinOutline = e.outlineStyle === 'none' || e.outlineWidth === '0px';
        if (sinOutline) malos.push(`${el.tagName}.${el.className || '?'}[${(el.textContent || '').trim().slice(0, 20)}]`);
      });
      return { total: enfocables.length, malos };
    });
    if (sinContorno.malos.length) {
      problemas.push(`${ruta}: sin contorno de foco → ${sinContorno.malos.join(', ')}`);
    }
    if (sinContorno.total < 5) problemas.push(`${ruta}: solo ${sinContorno.total} elementos enfocables`);
  }
  anotar(`Teclado a ${ancho}px: el primer foco salta al contenido y todo lo interactivo se ve enfocado`,
    problemas.length === 0,
    problemas.length ? problemas.join(' · ') : 'las seis rutas, correctas');
  await ctx.close();
}

// ── 4 · Las fotografías de fondo no se meten debajo del texto ───────────────
// Van al 28 % de opacidad detrás del contenido. Mientras ocupen su columna y
// el texto la suya, el contraste de G3 no se toca. En cuanto se solapan, el
// texto pasa a leerse sobre una fotografía y nadie se entera: no hay error, no
// hay test rojo, y en la captura «casi no se nota».
{
  const problemas = [];
  for (const ancho of [1440, 1920]) {
    const ctx = await navegador.newContext({ viewport: { width: ancho, height: 900 } });
    const p = await ctx.newPage();
    for (const ruta of RUTAS) {
      await p.goto(BASE + ruta, { waitUntil: 'networkidle' });
      await p.waitForTimeout(600);
      const choques = await p.evaluate(() => {
        const malos = [];
        document.querySelectorAll('.bloque__fondo').forEach((img) => {
          const bloque = img.closest('section');
          const f = img.getBoundingClientRect();
          bloque.querySelectorAll('h1, h2, h3, p, dt, dd, address, a, td, th, li').forEach((t) => {
            if (!t.textContent.trim()) return;
            const c = t.getBoundingClientRect();
            if (c.width === 0 || c.height === 0) return;
            const solape = Math.max(0, Math.min(f.right, c.right) - Math.max(f.left, c.left));
            // Un par de pixeles de roce no son un problema de lectura; que una
            // palabra entera caiga encima, si.
            if (solape > 8) malos.push(`${bloque.id || '?'} › «${t.textContent.trim().slice(0, 24)}»`);
          });
        });
        return [...new Set(malos)];
      });
      if (choques.length) problemas.push(`${ancho}px ${ruta}: ${choques.join(', ')}`);
    }
    await ctx.close();
  }
  anotar('Ninguna fotografia de fondo cae debajo del texto de su bloque',
    problemas.length === 0,
    problemas.length ? problemas.slice(0, 4).join(' · ') : 'las seis rutas, a 1440 y 1920 px');
}

// ── 5 · La barra se encoge mientras se baja, y vuelve al parar ─────────────
// Tres cosas que fallan en silencio: que no se encoja, que se quede encogida
// cuando la pagina ya esta quieta, y que arriba del todo no recupere su sitio.
// El estado se lee por la clase —cambia en el mismo evento— y el resultado por
// la altura, ya con la transicion terminada.
{
  const problemas = [];
  const medir = (p) => p.evaluate(() => {
    const n = document.querySelector('.nav');
    return { alto: +n.getBoundingClientRect().height.toFixed(1),
             compacta: n.classList.contains('nav--compacta') };
  });
  // Rueda de verdad, no scrollTo: hay que mantener vivos los eventos para que
  // el temporizador de reposo no salte a mitad de la medicion.
  const rodar = async (p, pasos, delta) => {
    for (let i = 0; i < pasos; i++) {
      await p.mouse.wheel(0, delta);
      await p.waitForTimeout(90);
    }
  };

  for (const ancho of [1440, 390]) {
    const ctx = await navegador.newContext({ viewport: { width: ancho, height: 800 } });
    const p = await ctx.newPage();
    await p.goto(BASE + '/', { waitUntil: 'load' });
    await p.waitForTimeout(400);

    const reposo = await medir(p);
    if (reposo.compacta) problemas.push(`${ancho}px: arranca ya encogida`);

    // Ocho golpes de rueda seguidos: para cuando se mide, la clase lleva
    // puesta mas de la duracion de la transicion y el reposo sigue aplazado.
    await rodar(p, 8, 160);
    const bajando = await medir(p);
    if (!bajando.compacta) problemas.push(`${ancho}px: no se encoge al bajar`);
    if (bajando.alto > 48) problemas.push(`${ancho}px: encogida mide ${bajando.alto}px, mas que las referencias`);
    if (bajando.alto >= reposo.alto) problemas.push(`${ancho}px: encogida (${bajando.alto}) no es menor que en reposo (${reposo.alto})`);

    // Y ahora quieta: es lo que pidio el cliente, que vuelva sola. La espera es
    // generosa a proposito — Lenis sigue emitiendo scroll durante su inercia
    // bastante despues del ultimo golpe de rueda, y el reposo cuenta desde el
    // ultimo evento, no desde la ultima rueda. Primero el estado, que cambia
    // de golpe; despues la altura, ya con la transicion terminada.
    await p.waitForTimeout(1800);
    const parada = await p.evaluate(() => Math.round(window.scrollY));
    if ((await medir(p)).compacta) {
      problemas.push(`${ancho}px: sigue encogida con la pagina quieta en ${parada}px`);
    }
    await p.waitForTimeout(400);
    const quieta = await medir(p);
    if (Math.abs(quieta.alto - reposo.alto) > 1) {
      problemas.push(`${ancho}px: quieta mide ${quieta.alto} y en reposo media ${reposo.alto}`);
    }

    // Arriba del todo no se encoge aunque se siga moviendo la rueda.
    await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await p.waitForTimeout(700);
    await rodar(p, 2, -120);
    const arriba = await medir(p);
    if (arriba.compacta) problemas.push(`${ancho}px: se encoge arriba del todo`);

    // Los objetivos tactiles del menu siguen siendo alcanzables encogida.
    await rodar(p, 8, 160);
    const minimo = await p.evaluate(() => {
      const alturas = [...document.querySelectorAll('.nav__lista a, .nav__cta, .nav__toggle')]
        .map((e) => e.getBoundingClientRect().height)
        .filter((h) => h > 0);
      return alturas.length ? Math.min(...alturas) : 0;
    });
    if (minimo < 24) problemas.push(`${ancho}px: objetivo de ${minimo.toFixed(1)}px encogida`);

    await ctx.close();
  }
  anotar('La barra se encoge mientras se baja y vuelve sola al dejar de mover',
    problemas.length === 0,
    problemas.length ? problemas.join(' · ') : 'a 1440 y 390 px, con rueda real');
}

await navegador.close();
const fallos = resultados.filter((r) => !r.ok);
console.log(`\n${resultados.length - fallos.length}/${resultados.length} comprobaciones en verde`);
process.exit(fallos.length === 0 ? 0 : 1);
