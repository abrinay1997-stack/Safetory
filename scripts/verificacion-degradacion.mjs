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

// ── 5 · La barra se encoge al bajar, y vuelve ──────────────────────────────
// Tres cosas que fallan en silencio: que no se encoja (nadie ve un error), que
// se quede encogida al volver arriba, y que aparezca grande a media página al
// recargar, porque el navegador restaura el scroll y el estado se calculó solo
// con el evento. La histéresis se comprueba en el hueco entre los dos
// umbrales: ahí el estado tiene que quedarse como estaba.
{
  const problemas = [];
  const medir = (p) => p.evaluate(() => {
    const n = document.querySelector('.nav');
    const c = n.getBoundingClientRect();
    return { alto: +c.height.toFixed(1), compacta: n.classList.contains('nav--compacta') };
  });
  // `instant` a proposito: `html { scroll-behavior: smooth }` convierte un
  // scrollTo normal en una animacion, y se mediria a mitad de camino.
  const irA = async (p, y) => {
    await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y);
    await p.waitForTimeout(450);
  };

  for (const ancho of [1440, 390]) {
    const ctx = await navegador.newContext({ viewport: { width: ancho, height: 800 } });
    const p = await ctx.newPage();
    await p.goto(BASE + '/', { waitUntil: 'load' });
    await p.waitForTimeout(300);

    const reposo = await medir(p);
    if (reposo.compacta) problemas.push(`${ancho}px: arranca ya encogida`);

    await irA(p, 600);
    const compacta = await medir(p);
    if (!compacta.compacta) problemas.push(`${ancho}px: no se encoge al bajar`);
    if (compacta.alto > 48) problemas.push(`${ancho}px: encogida mide ${compacta.alto}px, mas que las referencias`);
    if (compacta.alto >= reposo.alto) problemas.push(`${ancho}px: encogida (${compacta.alto}) no es menor que en reposo (${reposo.alto})`);

    // Entre los dos umbrales no se toca nada: si un solo punto de corte
    // decidiera el estado, aqui ya habria vuelto a crecer.
    await irA(p, 20);
    if (!(await medir(p)).compacta) problemas.push(`${ancho}px: vuelve a crecer dentro de la histeresis`);

    await irA(p, 0);
    const vuelta = await medir(p);
    if (vuelta.compacta) problemas.push(`${ancho}px: se queda encogida arriba del todo`);
    if (Math.abs(vuelta.alto - reposo.alto) > 1) {
      problemas.push(`${ancho}px: al volver mide ${vuelta.alto} y no ${reposo.alto}`);
    }

    // Abrir el enlace directamente en una seccion de mas abajo: la pagina nace
    // ya desplazada. Comprueba el resultado — que la barra salga encogida —,
    // no por que via se consigue: aqui el salto al ancla dispara `scroll`, asi
    // que lo resuelve la escucha; la llamada al montar cubre el caso en que la
    // posicion se restaura antes de que corra el modulo.
    await p.goto(`${BASE}/#visitanos`, { waitUntil: 'load' });
    await p.waitForTimeout(700);
    const profundo = await p.evaluate(() => Math.round(window.scrollY));
    const tras = await medir(p);
    if (profundo > 40 && !tras.compacta) {
      problemas.push(`${ancho}px: abierta en #visitanos (${profundo}px) sale grande`);
    }
    if (profundo <= 40) problemas.push(`${ancho}px: #visitanos no desplazo la pagina`);

    // Y los objetivos tactiles del menu siguen siendo alcanzables encogidos.
    await irA(p, 600);
    const minimo = await p.evaluate(() => {
      const alturas = [...document.querySelectorAll('.nav__lista a, .nav__cta, .nav__toggle')]
        .map((e) => e.getBoundingClientRect().height)
        .filter((h) => h > 0);
      return alturas.length ? Math.min(...alturas) : 0;
    });
    if (minimo < 24) problemas.push(`${ancho}px: objetivo de ${minimo.toFixed(1)}px encogida`);

    await ctx.close();
  }
  anotar('La barra se encoge al bajar, aguanta la histeresis y vuelve al subir',
    problemas.length === 0,
    problemas.length ? problemas.join(' · ') : 'a 1440 y 390 px, incluida la apertura directa en una seccion de mas abajo');
}

await navegador.close();
const fallos = resultados.filter((r) => !r.ok);
console.log(`\n${resultados.length - fallos.length}/${resultados.length} comprobaciones en verde`);
process.exit(fallos.length === 0 ? 0 : 1);
