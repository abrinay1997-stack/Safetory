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
/** Las seis publicables mas las dos legales, que tambien llevan nav y pie. */
const TODAS = [...RUTAS, '/privacidad', '/aviso-legal'];

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

// ── 6 · Nada se sale de una pantalla estrecha ──────────────────────────────
// El scroll horizontal en un movil no da error: la pagina se ve «bien» y lo
// unico que pasa es que el dedo la mueve de lado y el contenido fijo —la
// pastilla del nav— se descoloca. Se comprueban tres anchos: 320 es el movil
// pequeno que todavia existe, 390 el comun, 768 la tableta en vertical.
{
  const problemas = [];
  for (const ancho of [320, 390, 768]) {
    const ctx = await navegador.newContext({
      viewport: { width: ancho, height: 800 }, isMobile: true, hasTouch: true,
    });
    const p = await ctx.newPage();
    for (const ruta of TODAS) {
      await p.goto(BASE + ruta, { waitUntil: 'networkidle' });
      await p.waitForTimeout(500);
      const culpables = await p.evaluate(() => {
        const doc = document.documentElement;
        if (doc.scrollWidth <= doc.clientWidth) return null;
        const malos = [];
        document.querySelectorAll('*').forEach((e) => {
          // `.sr-only` mide 1 px con overflow oculto: nunca empuja nada.
          if (e.classList.contains('sr-only')) return;
          const r = e.getBoundingClientRect();
          if (r.width > 0 && r.right > doc.clientWidth + 1) {
            malos.push(`${e.tagName.toLowerCase()}.${(e.className || '').toString().trim().split(' ')[0]}`);
          }
        });
        return `${doc.scrollWidth}px de ancho en ${doc.clientWidth}: ${[...new Set(malos)].slice(0, 3).join(', ')}`;
      });
      if (culpables) problemas.push(`${ancho}px ${ruta}: ${culpables}`);
    }
    await ctx.close();
  }
  anotar('Ninguna ruta se desplaza en horizontal en un movil',
    problemas.length === 0,
    problemas.length ? problemas.slice(0, 4).join(' · ') : 'ocho rutas a 320, 390 y 768 px');
}

// ── 7 · Ningun texto se escribe encima de otro ─────────────────────────────
// El kicker estuvo colgado en la esquina de la seccion con `position:
// absolute`. Cuando el contenido no cabe en la pantalla, el bloque deja de
// centrarlo y el titular sube justo hasta ahi: el resultado es el titulo y su
// rotulo impresos uno sobre otro. Nadie lo ve desde un escritorio.
{
  const problemas = [];
  for (const ancho of [390, 1440]) {
    const ctx = await navegador.newContext({
      viewport: { width: ancho, height: 844 }, isMobile: ancho < 900, hasTouch: ancho < 900,
    });
    const p = await ctx.newPage();
    for (const ruta of TODAS) {
      await p.goto(BASE + ruta, { waitUntil: 'networkidle' });
      await p.waitForTimeout(500);
      const choques = await p.evaluate(() => {
        const malos = [];
        const hojas = [...document.querySelectorAll('main h1, main h2, main h3, main p, main li, main dt, main dd, main address')]
          .filter((e) => e.textContent.trim() && !e.classList.contains('sr-only'))
          .map((e) => ({ e, r: e.getBoundingClientRect() }))
          .filter((x) => x.r.width > 0 && x.r.height > 0);
        for (let i = 0; i < hojas.length; i++) {
          for (let j = i + 1; j < hojas.length; j++) {
            const a = hojas[i], b = hojas[j];
            // Un ancestro y su descendiente se solapan por definicion.
            if (a.e.contains(b.e) || b.e.contains(a.e)) continue;
            const x = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
            const y = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
            // Cuatro pixeles de roce entre dos cajas de texto contiguas no son
            // un solape; media linea encima de otra, si.
            if (x > 4 && y > 4) {
              malos.push(`«${a.e.textContent.trim().slice(0, 16)}» sobre «${b.e.textContent.trim().slice(0, 16)}»`);
            }
          }
        }
        return [...new Set(malos)];
      });
      if (choques.length) problemas.push(`${ancho}px ${ruta}: ${choques.slice(0, 2).join(' · ')}`);
    }
    await ctx.close();
  }
  anotar('Ningun texto se imprime encima de otro',
    problemas.length === 0,
    problemas.length ? problemas.slice(0, 4).join(' | ') : 'ocho rutas, a 390 y 1440 px');
}

// ── 8 · Todo lo que se toca se puede tocar ─────────────────────────────────
// 24x24 px es el minimo con el que un dedo acierta. Los enlaces del pie median
// 23 de alto y la marca del nav 15: un pixel o diez, pero fallan igual.
{
  const problemas = [];
  const ctx = await navegador.newContext({
    viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true,
  });
  const p = await ctx.newPage();
  for (const ruta of TODAS) {
    await p.goto(BASE + ruta, { waitUntil: 'networkidle' });
    await p.waitForTimeout(500);
    const chicos = await p.evaluate(() => {
      const malos = [];
      document.querySelectorAll('a[href], button').forEach((e) => {
        const r = e.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return;
        // Un enlace dentro de una frase queda exento del tamano minimo (WCAG
        // 2.5.8, excepcion «inline»): agrandarlo romperia el renglon. Se
        // reconoce porque su padre lleva mas texto que el propio enlace.
        const padre = e.parentElement;
        const enFrase = padre !== null &&
          padre.textContent.trim().length > e.textContent.trim().length + 12;
        if (enFrase) return;
        if (r.height < 24 || r.width < 24) {
          malos.push(`«${e.textContent.trim().slice(0, 14)}» ${Math.round(r.width)}x${Math.round(r.height)}`);
        }
      });
      return [...new Set(malos)];
    });
    if (chicos.length) problemas.push(`${ruta}: ${chicos.slice(0, 3).join(', ')}`);
  }
  await ctx.close();
  anotar('Ningun objetivo tactil baja de 24x24 px',
    problemas.length === 0,
    problemas.length ? problemas.slice(0, 4).join(' · ') : 'las ocho rutas a 390 px');
}

// ── 9 · El fondo de seda no se come el contraste ni la bateria ─────────────
// Es un canvas: Lighthouse mide el contraste contra el color de fondo
// DECLARADO, asi que un fondo animado demasiado claro debajo del texto pasa
// desapercibido para toda herramienta automatica. Aqui se mide el pixel mas
// claro que llega a dibujarse y se comprueba contra los dos colores de texto
// con menos margen. Y que el bucle pare cuando la seccion no se ve.
{
  const luminancia = (c) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
  };
  const contraste = (a, b) => {
    const [hi, lo] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };

  const ctx = await navegador.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(BASE + '/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(600);
  const problemas = [];

  const existe = await p.evaluate(() => Boolean(document.querySelector('[data-silk]')));
  if (!existe) problemas.push('no hay canvas de seda en la home');

  // El pixel mas claro de la textura, leido del propio canvas.
  const masClaro = await p.evaluate(() => {
    const c = document.querySelector('[data-silk]');
    if (!c) return null;
    const g = c.getContext('2d');
    const d = g.getImageData(0, 0, c.width, c.height).data;
    let max = [0, 0, 0];
    let maxL = -1;
    for (let i = 0; i < d.length; i += 4) {
      const l = d[i] + d[i + 1] + d[i + 2];
      if (l > maxL) { maxL = l; max = [d[i], d[i + 1], d[i + 2]]; }
    }
    return max;
  });
  if (masClaro) {
    const ash = [0x8a, 0x87, 0x83];
    const rec = [0xff, 0x2d, 0x2d];
    const cAsh = contraste(ash, masClaro);
    const cRec = contraste(rec, masClaro);
    if (cAsh < 4.5) problemas.push(`--ash sobre la seda: ${cAsh.toFixed(2)}:1`);
    if (cRec < 4.5) problemas.push(`--rec sobre la seda: ${cRec.toFixed(2)}:1`);
  }

  // El bucle solo corre mientras la seccion se ve.
  const huella = () => p.evaluate(() => {
    const c = document.querySelector('[data-silk]');
    const d = c.getContext('2d').getImageData(0, 0, 40, 40).data;
    let h = 0;
    for (let i = 0; i < d.length; i += 4) h = (h * 31 + d[i]) % 1e9;
    return h;
  });
  await p.evaluate(() => document.getElementById('territorios').scrollIntoView({ block: 'center', behavior: 'instant' }));
  await p.waitForTimeout(400);
  const a1 = await huella();
  await p.waitForTimeout(500);
  const a2 = await huella();
  if (a1 === a2) problemas.push('la seda no se mueve mientras se ve');

  await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await p.waitForTimeout(900);
  const b1 = await huella();
  await p.waitForTimeout(600);
  const b2 = await huella();
  if (b1 !== b2) problemas.push('la seda sigue dibujando con la seccion fuera de pantalla');
  await ctx.close();

  // Y con reduce-motion se queda quieta.
  const quieto = await navegador.newContext({
    viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce',
  });
  const q = await quieto.newPage();
  await q.goto(BASE + '/', { waitUntil: 'networkidle' });
  await q.evaluate(() => document.getElementById('territorios').scrollIntoView({ block: 'center', behavior: 'instant' }));
  await q.waitForTimeout(700);
  const huellaQ = () => q.evaluate(() => {
    const c = document.querySelector('[data-silk]');
    const d = c.getContext('2d').getImageData(0, 0, 40, 40).data;
    let h = 0;
    for (let i = 0; i < d.length; i += 4) h = (h * 31 + d[i]) % 1e9;
    return h;
  });
  const q1 = await huellaQ();
  await q.waitForTimeout(600);
  const q2 = await huellaQ();
  if (q1 !== q2) problemas.push('con reduce-motion la seda sigue animando');
  // Pero la textura esta: es atmosfera, no adorno prescindible.
  if (q1 === 0) problemas.push('con reduce-motion no se dibuja nada');
  await quieto.close();

  anotar('El fondo de seda respeta el contraste, se para al salir de pantalla y con reduce-motion',
    problemas.length === 0,
    problemas.length ? problemas.join(' · ') : `pixel mas claro rgb(${masClaro?.join(',')}), bucle detenido fuera de vista`);
}

await navegador.close();
const fallos = resultados.filter((r) => !r.ok);
console.log(`\n${resultados.length - fallos.length}/${resultados.length} comprobaciones en verde`);
process.exit(fallos.length === 0 ? 0 : 1);
