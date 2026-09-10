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
      // `textContent` y no `innerText`: con `content-visibility: auto` el
      // navegador no maqueta lo que no se ve, e `innerText` —que depende de la
      // maquetacion— devuelve vacio para esas secciones. El texto esta ahi,
      // para el lector y para Google; lo que no esta es su caja.
      textoVisible: (document.querySelector('main')?.textContent ?? '').trim().length,
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

// ── 5 · Las tres reglas de la barra, y que no titile ───────────────────────
// bajando encoge · subiendo estira · quieta, entera. Y sobre todo: cuando la
// pagina se para, el estado cambia UNA vez. La inercia de Lenis sigue
// emitiendo scroll despues del ultimo golpe de rueda, cada vez mas corto —los
// ultimos, de un pixel cada 130 ms—; con un temporizador que cupiera entre dos
// de ellos, la barra estiraba, encogia y volvia a estirar. Se veia como una
// vibracion y no habia forma de que saliera en una captura: hay que contar los
// cambios de estado, no mirarlos.
{
  const problemas = [];
  const medir = (p) => p.evaluate(() => {
    const n = document.querySelector('.nav');
    return { alto: +n.getBoundingClientRect().height.toFixed(1),
             compacta: n.classList.contains('nav--compacta') };
  });
  const espiar = (p) => p.evaluate(() => {
    window.__cambios = [];
    const n = document.querySelector('.nav');
    new MutationObserver(() => window.__cambios.push({
      compacta: n.classList.contains('nav--compacta'), t: performance.now(),
    })).observe(n, { attributes: true, attributeFilter: ['class'] });
  });
  /** Marca el instante del ultimo gesto, en el reloj de la propia pagina. */
  const marcar = (p) => p.evaluate(() => performance.now());
  /**
   * La altura de la barra encogida, ya asentada — **sin dejar de bajar**.
   *
   * Dos trampas, y la segunda me costo la primera version de este ayudante:
   *
   * 1. La barra encoge con una transicion de `transform`. Leyendo justo
   *    despues del ultimo golpe de rueda se coge un valor a medio camino.
   * 2. Pero esperar quieto a que se asiente **la estira**: sin eventos de
   *    scroll, el temporizador de reposo hace su trabajo y lo que se acaba
   *    midiendo es la barra entera. La primera version devolvia 59,4 px y yo
   *    lo lei como «no encoge del todo», cuando lo que pasaba es que ya se
   *    habia vuelto a estirar.
   *
   * Asi que se sigue bajando mientras se mide.
   */
  const altoEncogidaBajando = async (p) => {
    let previo = -1;
    let estirones = 0;
    for (let i = 0; i < 30; i++) {
      await p.mouse.wheel(0, 160);
      await p.waitForTimeout(90);
      const v = await p.evaluate(() => {
        const n = document.querySelector('.nav');
        return { alto: +n.getBoundingClientRect().height.toFixed(1),
                 compacta: n.classList.contains('nav--compacta') };
      });
      // Bajando sin parar, la barra no tiene por que estirarse ni una sola vez.
      // Si lo hace, la altura que se acabe midiendo es la equivocada Y hay un
      // defecto: se dice asi, y no como «no encoge del todo».
      if (!v.compacta && i > 2) estirones++;
      if (v.alto === previo && v.compacta) return { alto: v.alto, estirones };
      previo = v.alto;
    }
    return { alto: previo, estirones };
  };
  const rodar = async (p, pasos, delta) => {
    for (let i = 0; i < pasos; i++) {
      await p.mouse.wheel(0, delta);
      await p.waitForTimeout(90);
    }
  };

  /**
   * Y se mide con la CPU FRENADA.
   *
   * Este punto estuvo en verde en local y rojo en el runner, y la diferencia
   * era la carga: la cola de inercia de Lenis llega a golpes de 17 a 91 px
   * separados de 140 a 360 ms cuando el hilo principal va lento, y ahi es
   * donde cabe el temporizador de reposo. En un contenedor ocioso los huecos
   * son de 30 ms y no cabe nada, asi que el defecto no se veia.
   *
   * Frenar la CPU convierte «depende de lo cargado que este el runner» en una
   * condicion fija. Diez, y no cuatro: con cuatro tampoco se reproducia.
   *
   * **Solo donde vive Lenis**, o sea de 900 px para arriba. En tactil el scroll
   * es el del navegador y no hay cola de inercia que perseguir, asi que el
   * freno no prueba nada — y en cambio inventa un defecto que no existe: con
   * la CPU a un decimo y una rueda cada 90 ms, los huecos entre eventos pasan
   * de 500 ms, el temporizador de reposo cae dentro y la barra parpadea
   * mientras se sigue bajando. Eso es el arnes, no la pagina: un dedo de
   * verdad desplaza desde el compositor y no deja huecos asi.
   */
  const FRENO_CPU = 10;
  const frenaLenis = (ancho) => ancho >= 900;

  for (const ancho of [1440, 390]) {
    const ctx = await navegador.newContext({
      viewport: { width: ancho, height: 800 }, isMobile: ancho < 900, hasTouch: ancho < 900,
    });
    const p = await ctx.newPage();
    if (frenaLenis(ancho)) {
      const cdp = await ctx.newCDPSession(p);
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: FRENO_CPU });
    }
    await p.goto(BASE + '/', { waitUntil: 'load' });
    await p.waitForTimeout(900);
    await espiar(p);

    const reposo = await medir(p);
    if (reposo.compacta) problemas.push(`${ancho}px: arranca ya encogida`);

    await rodar(p, 8, 160);
    const bajando = await medir(p);
    if (!bajando.compacta) problemas.push(`${ancho}px: no se encoge al bajar`);
    const encogida = await altoEncogidaBajando(p);
    if (encogida.estirones) {
      problemas.push(`${ancho}px: se estira ${encogida.estirones} veces mientras se SIGUE bajando`);
    }
    if (encogida.alto > 48) problemas.push(`${ancho}px: encogida mide ${encogida.alto}px, mas que las referencias`);

    // Subiendo se estira EN EL ACTO, sin esperar a que la pagina se pare.
    await rodar(p, 3, -160);
    const subiendo = await medir(p);
    if (subiendo.compacta) problemas.push(`${ancho}px: sigue encogida subiendo`);

    /**
     * Y ahora quieta. **Tres veces.**
     *
     * El titileo no es determinista: hace falta que el primer hueco de la cola
     * de inercia caiga justo por encima del tiempo de reposo, y eso depende de
     * como venga el fotograma. Una sola parada deja pasar la variante estrecha
     * del defecto —la que solo necesita que el gesto se siga dando por vivo
     * durante los 120 ms que `GESTO_VIVO` sobrevive al temporizador—. Se
     * repite, y mas veces donde vive Lenis, que es donde puede darse.
     */
    for (const vuelta of frenaLenis(ancho) ? [1, 2, 3, 4] : [1, 2]) {
    /**
     * Cada vuelta empieza donde el hilo principal esta MAS cargado: con el
     * pasillo de «En la Zona» en pantalla.
     *
     * Sin esto, la segunda vuelta y las siguientes miden ya muy por debajo de
     * la seccion, que por `content-visibility` ni siquiera se dibuja: no hay
     * jank, no hay huecos en la inercia y el defecto no aparece por mucho que
     * se repita. Repetir en el sitio equivocado no es repetir.
     */
    await p.evaluate(() => {
      const z = document.querySelector('#zona');
      if (z) window.scrollTo(0, z.offsetTop - 300);
    });
    await p.waitForTimeout(700);
    await rodar(p, 6, 160);
    const finGesto = await marcar(p);
    await p.waitForTimeout(2400);
    const quieta = await medir(p);
    if (quieta.compacta) problemas.push(`${ancho}px: sigue encogida con la pagina quieta (vuelta ${vuelta})`);
    if (Math.abs(quieta.alto - reposo.alto) > 1) {
      problemas.push(`${ancho}px: quieta mide ${quieta.alto} y en reposo media ${reposo.alto}`);
    }
    /**
     * El titileo, dicho exactamente.
     *
     * Contar cambios «a partir de un instante» no vale: con la CPU frenada el
     * manejador del ultimo golpe de rueda corre DESPUES de que el guion lo
     * haya dado por terminado, y ese encogido legitimo se contaba como
     * titileo. Y al reves, un umbral generoso se traga el defecto.
     *
     * La regla se puede decir sin margenes: **una vez que la barra se estira
     * —o sea, una vez que la pagina se ha dado por quieta— ya nada puede
     * volver a encogerla sin un gesto nuevo.** Asi que se busca el primer
     * estiron posterior al ultimo gesto y se exige que sea el ULTIMO cambio
     * que hubo.
     */
    const cola = await p.evaluate((t0) => window.__cambios.filter((c) => c.t >= t0), finGesto);
    const estiron = cola.findIndex((c) => !c.compacta);
    if (estiron !== -1 && estiron !== cola.length - 1) {
      const despues = cola.slice(estiron + 1).map((c) => (c.compacta ? 'encoge' : 'estira')).join('→');
      problemas.push(`${ancho}px: tras estirarse vuelve a cambiar (${despues}) sin gesto: titileo`);
    }
    }

    // Y los objetivos tactiles del menu siguen siendo alcanzables encogida.
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
  anotar('La barra encoge bajando, estira subiendo, vuelve al parar y no titila',
    problemas.length === 0,
    problemas.length ? problemas.join(' · ') : 'a 1440 y 390 px, con rueda real y contando cambios de estado');
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
        // Lo que se comprueba es lo que le pasa a la persona: que la pagina se
        // mueva de lado con el dedo. `scrollWidth > clientWidth` no basta —el
        // texto que desborda su caja lo infla sin que se pueda desplazar nada—
        // y por si mismo daba fallos donde no habia ningun sintoma.
        window.scrollTo(9999, 0);
        const desplazada = Math.round(window.scrollX);
        window.scrollTo(0, 0);

        // Un elemento encerrado en un ancestro que recorta no puede empujar
        // nada: el pasillo de «En la Zona» manda sus tarjetas fuera de cuadro a
        // proposito y `.zona` las recorta. Lo que hay que vigilar es el
        // ancestro que recorta, y ese lo mira el mismo bucle por su cuenta.
        const recortado = (e) => {
          // Se para en el `body`: ahi vive el `overflow-x: hidden` que tapa
          // el sintoma en vez de arreglarlo, y es justo lo que este punto
          // existe para ver por debajo. Solo cuenta un recorte de dentro.
          for (let n = e.parentElement; n && n !== document.body; n = n.parentElement) {
            if (getComputedStyle(n).overflowX !== 'visible') return true;
          }
          return false;
        };

        const malos = [];
        document.querySelectorAll('*').forEach((e) => {
          // `.sr-only` mide 1 px con overflow oculto: nunca empuja nada.
          if (e.classList.contains('sr-only')) return;
          const r = e.getBoundingClientRect();
          if (r.width > 0 && r.right > doc.clientWidth + 1 && !recortado(e)) {
            malos.push(`${e.tagName.toLowerCase()}.${(e.className || '').toString().trim().split(' ')[0]}`);
          }
        });
        if (desplazada === 0 && malos.length === 0) return null;
        return `${desplazada} px de desplazamiento real · ${[...new Set(malos)].slice(0, 3).join(', ')}`;
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

// ── 10 · El panel de movil ────────────────────────────────────────────────
// `position: fixed` se resuelve contra el viewport SOLO si ningun ancestro
// lleva transform ni backdrop-filter. La pastilla lleva los dos: con `inset:
// 0` el panel se quedaba dentro de ella —116 px de ancho— y el boton de
// reserva salia partido en cuatro lineas. Se mide de verdad.
{
  const problemas = [];
  for (const ancho of [320, 390]) {
    const ctx = await navegador.newContext({
      viewport: { width: ancho, height: 844 }, isMobile: true, hasTouch: true,
    });
    const p = await ctx.newPage();
    await p.goto(BASE + '/estudio', { waitUntil: 'networkidle' });
    await p.waitForTimeout(500);

    const cerrado = await p.evaluate(() => ({
      cta: document.querySelector('.nav__cta').getBoundingClientRect().width,
      rayitas: document.querySelector('.nav__toggle').getBoundingClientRect().width,
    }));
    if (cerrado.cta > 0) problemas.push(`${ancho}px: el boton de reserva se ve con el menu cerrado`);
    if (cerrado.rayitas === 0) problemas.push(`${ancho}px: no hay boton de menu`);

    await p.click('.nav__toggle');
    await p.waitForTimeout(400);
    const abierto = await p.evaluate(() => {
      const panel = document.getElementById('menu-movil').getBoundingClientRect();
      const cta = document.querySelector('.nav__cta').getBoundingClientRect();
      const enlaces = [...document.querySelectorAll('.nav__lista a')]
        .map((a) => a.getBoundingClientRect().height);
      return {
        panel: { w: Math.round(panel.width), h: Math.round(panel.height), x: Math.round(panel.left), y: Math.round(panel.top) },
        cta: { w: Math.round(cta.width), h: Math.round(cta.height) },
        minEnlace: Math.min(...enlaces),
        fondoApagado: document.querySelector('main').inert === true,
        sinScroll: getComputedStyle(document.documentElement).overflow === 'hidden',
        vp: { w: window.innerWidth, h: window.innerHeight },
      };
    });
    if (Math.abs(abierto.panel.w - abierto.vp.w) > 1 || abierto.panel.x !== 0) {
      problemas.push(`${ancho}px: el panel mide ${abierto.panel.w} y empieza en x=${abierto.panel.x}`);
    }
    if (Math.abs(abierto.panel.h - abierto.vp.h) > 2 || Math.abs(abierto.panel.y) > 2) {
      problemas.push(`${ancho}px: el panel mide ${abierto.panel.h} de alto desde y=${abierto.panel.y}`);
    }
    // El boton, ancho y de una sola linea: partido en dos sube de 80 px.
    if (abierto.cta.w < abierto.vp.w * 0.6) problemas.push(`${ancho}px: el boton de reserva mide ${abierto.cta.w}`);
    if (abierto.cta.h > 80) problemas.push(`${ancho}px: el boton de reserva parte en varias lineas (${abierto.cta.h}px)`);
    if (abierto.minEnlace < 44) problemas.push(`${ancho}px: enlace de ${abierto.minEnlace}px en el panel`);
    if (!abierto.fondoApagado) problemas.push(`${ancho}px: la pagina de detras sigue viva para el teclado`);
    if (!abierto.sinScroll) problemas.push(`${ancho}px: la pagina de detras se desplaza`);

    // Escape cierra y devuelve la pagina.
    await p.keyboard.press('Escape');
    await p.waitForTimeout(300);
    const tras = await p.evaluate(() => ({
      abierto: document.getElementById('menu-movil').classList.contains('nav__lista--abierta'),
      fondo: document.querySelector('main').inert === true,
      foco: document.activeElement?.className ?? '',
    }));
    if (tras.abierto) problemas.push(`${ancho}px: Escape no cierra`);
    if (tras.fondo) problemas.push(`${ancho}px: la pagina sigue apagada tras cerrar`);
    if (!tras.foco.includes('nav__toggle')) problemas.push(`${ancho}px: el foco no vuelve al boton`);

    await ctx.close();
  }
  anotar('El panel de movil ocupa la pantalla, lleva dentro el boton de reserva y apaga lo de detras',
    problemas.length === 0,
    problemas.length ? problemas.join(' · ') : 'a 320 y 390 px, incluido el cierre con Escape');
}

// ── 12 · Ningun titular se sale de su caja ────────────────────────────────
// «Producción» a 68 px mide 379 px, y la columna de texto de un movil de 390
// tiene 306: la palabra no cabia y el navegador la partia por la mitad,
// «Produ / cción», en el elemento mas visible de la pagina. No daba error, no
// desplazaba la pagina y en escritorio se veia perfecto.
{
  const problemas = [];
  for (const ancho of [320, 360, 390, 480, 768]) {
    const ctx = await navegador.newContext({
      viewport: { width: ancho, height: 844 }, isMobile: ancho < 900, hasTouch: ancho < 900,
    });
    const p = await ctx.newPage();
    for (const ruta of TODAS) {
      await p.goto(BASE + ruta, { waitUntil: 'domcontentloaded' });
      await p.waitForTimeout(350);
      const malos = await p.evaluate(() => {
        const out = [];
        document.querySelectorAll('h1, h2, h3').forEach((h) => {
          // Los encabezados solo para lector miden 1 px por diseno.
          if (h.classList.contains('sr-only')) return;
          if (h.scrollWidth > h.clientWidth + 1) {
            out.push(`${h.tagName} «${h.textContent.trim().slice(0, 16)}» ${h.scrollWidth}>${h.clientWidth}`);
          }
        });
        return out;
      });
      if (malos.length) problemas.push(`${ancho}px ${ruta}: ${malos.join(' | ')}`);
    }
    await ctx.close();
  }
  anotar('Ningun titular desborda su columna',
    problemas.length === 0,
    problemas.length ? problemas.slice(0, 4).join(' · ') : 'ocho rutas a 320, 360, 390, 480 y 768 px');
}

// ── 13 · El titular de «En la Zona» no se apoya en una fotografia ─────────
// Las tarjetas del pasillo van al 100 % de opacidad, y algunas son casi
// blancas. Lo unico que separa el titular de una de ellas es que la mascara
// RECORTA la banda de arriba entera. Si alguien la relaja, el titulo pasa a
// leerse sobre una foto en movimiento y nadie se entera: Lighthouse mide el
// contraste contra el color de fondo declarado, no contra lo que se pinta.
{
  const problemas = [];
  const detallesContraste = [];
  const lum = (r, g, b) => {
    const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  for (const ancho of [1440, 390]) {
    const ctx = await navegador.newContext({
      viewport: { width: ancho, height: ancho < 900 ? 844 : 900 },
      isMobile: ancho < 900, hasTouch: ancho < 900, deviceScaleFactor: 1,
    });
    const p = await ctx.newPage();
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    // Dos veces: con `content-visibility: auto` la seccion no esta maquetada
    // la primera vez y el salto cae donde no es.
    for (const _ of [1, 2]) {
      await p.evaluate(() => document.querySelector('#zona')?.scrollIntoView({ block: 'start' }));
      await p.waitForTimeout(500);
    }
    const color = await p.evaluate(() => getComputedStyle(document.querySelector('#zona h2')).color);
    const [tr, tg, tb] = color.match(/\d+/g).map(Number);
    const Lt = lum(tr, tg, tb);

    let peor = Infinity, culpable = null;
    const detalles = detallesContraste;
    // El pasillo se mueve: manda el peor fotograma, no el primero.
    for (let i = 0; i < 10; i++) {
      await p.waitForTimeout(200);
      const caja = await p.evaluate(() => {
        const r = document.querySelector('#zona h2').getBoundingClientRect();
        const x = Math.max(0, Math.round(r.x)), y = Math.max(0, Math.round(r.y));
        return { x, y,
          width: Math.max(1, Math.min(Math.round(r.width), innerWidth - x)),
          height: Math.max(1, Math.min(Math.round(r.height), innerHeight - y)) };
      });
      // Se esconde el TEXTO: si no, el pixel mas claro que se encuentra es el
      // propio glifo y la relacion sale 1,00:1, el titular contra si mismo.
      await p.evaluate(() => { document.querySelector('#zona h2').style.visibility = 'hidden'; });
      const buf = await p.screenshot({ clip: caja });
      await p.evaluate(() => { document.querySelector('#zona h2').style.visibility = ''; });
      // La captura se decodifica DENTRO del navegador, sobre un canvas: asi el
      // arnes no necesita un decodificador de imagenes, y `sharp` solo llega
      // aqui de rebote como dependencia de astro.
      const { maxL, pix } = await p.evaluate(async (b64) => {
        const bmp = await createImageBitmap(await (await fetch('data:image/png;base64,' + b64)).blob());
        const c = document.createElement('canvas');
        c.width = bmp.width; c.height = bmp.height;
        c.getContext('2d').drawImage(bmp, 0, 0);
        const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
        const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
        let maxL = 0, pix = null;
        for (let k = 0; k < d.length; k += 4) {
          const L = 0.2126 * f(d[k]) + 0.7152 * f(d[k + 1]) + 0.0722 * f(d[k + 2]);
          if (L > maxL) { maxL = L; pix = [d[k], d[k + 1], d[k + 2]]; }
        }
        return { maxL, pix };
      }, buf.toString('base64'));
      const ratio = (Math.max(Lt, maxL) + 0.05) / (Math.min(Lt, maxL) + 0.05);
      if (ratio < peor) { peor = ratio; culpable = pix; }
    }
    if (peor < 4.5) {
      problemas.push(`${ancho}px: ${peor.toFixed(2)}:1 detras del titular (lo mas claro, rgb(${culpable.join(',')}))`);
    }
    detalles.push(`${ancho}px ${peor.toFixed(1)}:1`);
    await ctx.close();
  }
  anotar('El titular de «En la Zona» no se apoya en una fotografia',
    problemas.length === 0,
    problemas.length ? problemas.join(' · ') : `contraste minimo ${detallesContraste.join(' · ')} (minimo 4,5:1)`);
}

await navegador.close();
const fallos = resultados.filter((r) => !r.ok);
console.log(`\n${resultados.length - fallos.length}/${resultados.length} comprobaciones en verde`);
process.exit(fallos.length === 0 ? 0 : 1);
