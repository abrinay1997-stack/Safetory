# Safetory Studio — Plan de implementación

> **Para agentes ejecutores:** SUB-SKILL OBLIGATORIA: usa `superpowers:subagent-driven-development`
> (recomendada) o `superpowers:executing-plans` para implementar tarea a tarea.
> Los pasos usan casillas (`- [ ]`) para seguimiento.

**Objetivo:** Sitio multipágina de Safetory Studio: 6 rutas estáticas, 37 pantallas a `100dvh`,
cada ruta con un objeto 3D procedural recorrido por una cámara en espiral áurea.

**Arquitectura:** Astro estático genera un HTML por ruta. Three.js **nunca** entra en el
arranque: cada ruta sirve un póster WebP que es el elemento LCP, y la escena WebGL se carga por
`import()` dinámico tras el idle, haciendo cross-fade sobre el póster. Toda la geometría es
procedural, sin assets descargados. El contenido vive en `src/data/` y ninguna plantilla
escribe un precio a mano.

**Stack:** astro ^7.3.1 · three ^0.185.1 · gsap ^3.15.0 · lenis ^1.3.26 · split-type ^0.3.4 ·
@astrojs/sitemap ^3.7.3 · vitest ^5.0.0 (desarrollo) · @types/three (desarrollo)

**Spec:** `docs/superpowers/specs/2026-09-07-safetory-sitio-3d-design.md`

---

## Restricciones globales

Todas las tareas heredan estas reglas. Vienen de `CLAUDE.md` y del spec.

| # | Regla | Valor exacto |
|---|---|---|
| G1 | No inventar contenido | Si el dato no está en `src/data/`, el bloque **no se renderiza** |
| G2 | Cero placeholders | Prohibidos `lorem`, `href="#"`, `G-XXXXXXXXXX`, `TODO` |
| G3 | Accesibilidad | Lighthouse 100 · contraste ≥4,5:1 · teclado completo · `prefers-reduced-motion` real |
| G4 | Rendimiento | LCP ≤1,8 s · INP ≤150 ms · CLS ≤0,02 · **JS inicial ≤140 KB gz** |
| G5 | Three.js fuera del arranque | Solo por `import()` dinámico tras `requestIdleCallback` |
| G6 | Animación | Solo `transform` y `opacity`. Nunca `width`/`height`/`top`/`left` |
| G7 | Pins | Máximo 2 por página. Ninguno por debajo de 768 px |
| G8 | Semántica | Un solo `<h1>` por ruta. Ninguna palabra existe solo dentro del canvas |
| G9 | Color | Acento único `--rec` `#FF2D2D`. Ámbar y violeta solo como luz de escena |
| G10 | Momento orquestado | Uno en todo el sitio: el despiece del micrófono en `/` |
| G11 | Altura de sección | `min-height: 100dvh` siempre. `dvh`, nunca `vh` |
| G12 | Proporción | Escala φ `--phi-0`…`--phi-7`. Repartos 61,8/38,2, nunca 50/50 |
| G13 | Commits | Uno por bloque, mensaje `feat(Sxx): descripción` |
| G14 | Dependencias | Solo las del stack. Ninguna más sin preguntar |
| G15 | Equipo técnico | Nunca publicar marcas ni modelos sin confirmación escrita del cliente |

**Paleta exacta:**

```
--void      #080808
--bone      #EDEAE3
--ash       #8A8783
--rec       #FF2D2D
--hairline  rgba(237, 234, 227, 0.12)
```

**Escala φ exacta (px):** `10 · 16 · 26 · 42 · 68 · 110 · 178 · 288`

**Contacto exacto:**

```
Safetory Studio
Donde la innovación se encuentra con la perfección
Edificio Brasilia, Vía España, Panamá, Provincia de Panamá
6799-8881  ·  https://wa.me/50767998881
info@safetoryglobal.com
https://instagram.com/safetorystudio
Lunes a viernes: 24 horas · Sábado: 9:00–12:30 · Domingo: cerrado
```

---

## Estructura de archivos

| Archivo | Responsabilidad |
|---|---|
| `src/tokens/escala.ts` | La progresión φ como dato. Fuente de los `--phi-*` |
| `src/tokens/contraste.ts` | Cálculo de contraste WCAG. Solo se usa en tests |
| `src/styles/global.css` | Tokens CSS, reset, tipografía, utilidades de bloque |
| `src/data/site.ts` | Identidad, contacto, horario, redes |
| `src/data/whatsapp.ts` | Generador de enlaces con mensaje prellenado |
| `src/data/estudio.ts` | Tarifas de Studio 1 |
| `src/data/ciclorama.ts` | Tarifas de fotografía y vídeo |
| `src/data/produccion.ts` | Los seis servicios de producción |
| `src/data/membresia.ts` | Bloques incluidos |
| `src/data/equipo.ts` | Inventario técnico genérico (G15) |
| `src/data/tipos.ts` | `Tarifa`, `Bloque`, tipos compartidos |
| `src/layouts/BaseLayout.astro` | `<head>`, SEO, JSON-LD, skip link, ClientRouter |
| `src/components/Nav.astro` | Navegación de 6 rutas |
| `src/components/Footer.astro` | Contacto y horario |
| `src/components/Bloque.astro` | Envoltorio de sección a `100dvh` con reparto 61,8/38,2 |
| `src/components/PrecioCard.astro` | Tarjeta de tarifa con `<data value>` |
| `src/components/Escena3D.astro` | Isla: póster + canvas + carga diferida + cross-fade |
| `src/components/SmoothScroll.astro` | Lenis, sincronizado con ScrollTrigger |
| `src/scripts/motion.ts` | Registro de GSAP, repertorio sobrio, `prefersReducedMotion` |
| `src/three/camara-phi.ts` | Espiral áurea. Matemática pura, sin dependencia de three |
| `src/three/capacidades.ts` | Detección de entorno y decisión de renderizar |
| `src/three/motor.ts` | Renderer, bucle, `IntersectionObserver`, limpieza |
| `src/three/materiales.ts` | Metal oscuro, rejilla, emisivo de acento |
| `src/three/luces.ts` | Las tres luces + temperatura por ruta |
| `src/three/planos-profundidad.ts` | Fotos del cliente como planos en Z |
| `src/three/presupuesto.ts` | Conteo de mallas y triángulos de un `Group` |
| `src/three/objetos/*.ts` | Seis objetos. Todos exponen `crear(): THREE.Group` |
| `src/pages/*.astro` | Las seis rutas + 404 |
| `src/pages/dev/posters.astro` | Herramienta de captura de pósters. `noindex`, bloqueada en producción |

Cada objeto 3D vive en su archivo y expone la misma interfaz, de modo que `motor.ts` no sabe
qué renderiza y cada objeto se entiende y ajusta por separado.

---


---

## Tarea 11: La isla `Escena3D` y la herramienta de pósters

**Archivos:**
- Crear: `src/components/Escena3D.astro`, `src/pages/dev/posters.astro`
- Crear: `public/posters/home.webp` (capturado con la herramienta)
- Test: `tests/escena.test.ts`

**Interfaces:**
- Consume: `crearMotor` (Tarea 8), `crearLuces` (Tarea 9), `crear` de cada objeto (Tarea 10)
- Produce: `Escena3D` props
  `{ objeto: 'microfono' | 'monitores' | 'ciclorama' | 'interfaz' | 'plato' | 'rotulo'; temperatura: Temperatura; poster: string; alt: string; fondos: [string, string] }`

- [ ] **Paso 1: Escribir el test que falla**

`tests/escena.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { existsSync, statSync, readFileSync } from 'node:fs';

const src = () => readFileSync('src/components/Escena3D.astro', 'utf8');

describe('isla Escena3D', () => {
  it('el poster es una imagen real, no un canvas vacio: es el LCP (§7.2)', () => {
    const s = src();
    expect(s).toContain('<img');
    expect(s).toContain('fetchpriority="high"');
    expect(s).toContain('loading="eager"');
  });

  it('carga three solo por import dinamico y tras el idle (G5)', () => {
    const s = src();
    // El motor —y con el, three— se carga dentro de un `await Promise.all([`,
    // asi que la subcadena 'await import(' no aparece nunca aunque la carga si
    // sea dinamica y esperada. Se comprueban las dos piezas por separado.
    expect(s).toContain('await Promise.all([');
    expect(s).toContain("import('../three/motor')");
    expect(s).toContain('requestIdleCallback');
    expect(s).not.toMatch(/^import \* as THREE/m);
  });

  it('el canvas queda oculto a la accesibilidad (G8)', () => {
    expect(src()).toContain('aria-hidden="true"');
  });

  it('el poster y las texturas pasan por la ruta base (T23)', () => {
    const s = src();
    expect(s).toContain("from '../data/rutas'");
    expect(s).toContain('ruta(poster)');
    expect(s).toContain('fondos.map((f) => ruta(f))');
    // El poster es el LCP: servido sin base, la pagina publicada en el preview
    // se queda sin su imagen principal y las texturas fallan en silencio.
    expect(s).not.toContain('src={poster}');
  });

  it('poster y canvas ocupan la misma caja: CLS cero', () => {
    const s = src();
    expect(s).toContain('position: absolute');
    expect(s).toContain('inset: 0');
  });

  it('se destruye en astro:before-swap para no filtrar contextos WebGL', () => {
    expect(src()).toContain('astro:before-swap');
  });

  it('no arranca si el motor devuelve null: se queda en el poster', () => {
    expect(src()).toContain('if (!motor) return');
  });
});

describe('poster de la home', () => {
  it('existe y pesa menos de 60 KB', () => {
    expect(existsSync('public/posters/home.webp')).toBe(true);
    expect(statSync('public/posters/home.webp').size).toBeLessThan(60 * 1024);
  });
});

describe('herramienta de posters', () => {
  it('esta marcada noindex y avisada como interna', () => {
    const s = readFileSync('src/pages/dev/posters.astro', 'utf8');
    expect(s).toContain('noindex');
  });
});
```

- [ ] **Paso 2: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/escena.test.ts`
Esperado: FAIL — `ENOENT: src/components/Escena3D.astro`

- [ ] **Paso 3: Escribir `Escena3D.astro`**

```astro
---
import type { Temperatura } from '../three/luces';
import { ruta } from '../data/rutas';

export type NombreObjeto =
  | 'microfono' | 'monitores' | 'ciclorama' | 'interfaz' | 'plato' | 'rotulo';

interface Props {
  objeto: NombreObjeto;
  temperatura: Temperatura;
  /** Ruta del póster WebP. Es el elemento LCP de la página (§7.2). */
  poster: string;
  /** Descripción del objeto para quien no ve la escena. */
  alt: string;
  /** Dos fotografías del espacio, para los planos de profundidad. */
  fondos: [string, string];
}

const { objeto, temperatura, poster, alt, fondos } = Astro.props;

// El poster es el elemento LCP y los fondos son texturas de WebGL: los dos son
// rutas absolutas, y una ruta absoluta escrita a mano rompe en el preview, que
// GitHub Pages sirve desde /Safetory. El poster daria 404 —la pagina se queda
// sin su imagen principal— y las texturas fallarian en silencio, dejando los
// planos de profundidad en negro. `ruta()` es idempotente, asi que aplicarla
// aqui es seguro aunque quien llame ya la hubiera aplicado.
const posterBase = ruta(poster);
const fondosBase = fondos.map((f) => ruta(f)) as [string, string];
---

<div
  class="escena"
  data-escena
  data-objeto={objeto}
  data-temperatura={temperatura}
  data-fondos={JSON.stringify(fondosBase)}
>
  <img
    class="escena__poster"
    src={posterBase}
    alt={alt}
    width="1280"
    height="800"
    loading="eager"
    fetchpriority="high"
    decoding="async"
  />
  <canvas class="escena__canvas" data-canvas aria-hidden="true"></canvas>
</div>

<script>
  let destruir: (() => void) | null = null;

  async function montar() {
    const raiz = document.querySelector<HTMLElement>('[data-escena]');
    const canvas = raiz?.querySelector<HTMLCanvasElement>('[data-canvas]');
    if (!raiz || !canvas) return;

    // three entra aquí y solo aquí: fuera del arranque (G5).
    const [{ crearMotor }, { crearLuces }, { crearPlanosProfundidad }] = await Promise.all([
      import('../three/motor'),
      import('../three/luces'),
      import('../three/planos-profundidad'),
    ]);

    const nombre = raiz.dataset.objeto!;

    // import.meta.glob y no un mapa literal de import(): Vite resuelve los
    // import() de forma estática y fallaría el build mientras falten objetos
    // por crear. El glob solo enlaza los archivos que existen, y sigue
    // generando un chunk diferido por objeto.
    const modulos = import.meta.glob<{ crear: () => any }>('../three/objetos/*.ts');
    const cargar = modulos[`../three/objetos/${nombre}.ts`];
    if (!cargar) return;

    const { crear } = await cargar();
    const objeto = crear();
    const fondos = JSON.parse(raiz.dataset.fondos ?? '[]') as [string, string];
    if (fondos.length === 2) objeto.add(crearPlanosProfundidad(fondos));

    const motor = crearMotor({
      canvas,
      contenedor: raiz,
      objeto,
      luces: crearLuces(raiz.dataset.temperatura as any),
      alListo: () => raiz.classList.add('escena--viva'),
    });

    // Sin WebGL, con reduce-motion o con ahorro de datos: nos quedamos
    // en el póster y la página sigue completa (§7.3).
    if (!motor) return;
    destruir = () => motor.destruir();
  }

  function programar() {
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(montar, { timeout: 2500 });
    } else {
      setTimeout(montar, 400);
    }
  }

  function limpiar() {
    destruir?.();
    destruir = null;
  }

  document.addEventListener('astro:page-load', programar);
  document.addEventListener('astro:before-swap', limpiar);
</script>

<style>
  .escena {
    position: relative;
    width: 100%;
    height: 100dvh;
  }
  .escena__poster,
  .escena__canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  /* El canvas ocupa exactamente la caja del póster: el intercambio no
     mueve un solo píxel y el CLS se mantiene en 0 (§7.2). */
  .escena__canvas { opacity: 0; transition: opacity 0.6s ease; }
  .escena--viva .escena__canvas { opacity: 1; }
  .escena--viva .escena__poster { opacity: 0; transition: opacity 0.6s ease; }
</style>
```

- [ ] **Paso 4: Escribir la herramienta de captura**

`src/pages/dev/posters.astro`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';

// Herramienta interna. Marcada noindex, excluida del sitemap y bloqueada
// por robots.txt y por netlify.toml en producción.
---

<BaseLayout
  title="Captura de pósters"
  description="Herramienta interna para generar los pósters WebP de cada escena 3D."
  ruta="/dev/posters"
  noindex
>
  <section class="util">
    <h1>Captura de pósters</h1>
    <p>
      Elige un objeto, ajusta el encuadre con el scroll y pulsa Capturar.
      El archivo se descarga como <code>&lt;objeto&gt;.webp</code>; muévelo a
      <code>public/posters/</code>.
    </p>

    <label>
      Objeto
      <select id="objeto">
        <option value="microfono">microfono → home</option>
        <option value="monitores">monitores → estudio</option>
        <option value="ciclorama">ciclorama → ciclorama</option>
        <option value="interfaz">interfaz → produccion</option>
        <option value="plato">plato → membresia</option>
        <option value="rotulo">rotulo → contacto</option>
      </select>
    </label>

    <button id="capturar" type="button">Capturar WebP</button>

    <div class="util__lienzo">
      <canvas id="lienzo" width="1280" height="800"></canvas>
    </div>
  </section>
</BaseLayout>

<script>
  import * as THREE from 'three';
  import { crearLuces, type Temperatura } from '../../three/luces';
  import { puntoEnEspiral } from '../../three/camara-phi';

  const TEMPERATURAS: Record<string, Temperatura> = {
    microfono: 'ambar',
    monitores: 'ambar',
    ciclorama: 'violeta',
    interfaz: 'ambar-apagado',
    plato: 'ambar-apagado',
    rotulo: 'neutro',
  };

  const lienzo = document.getElementById('lienzo') as HTMLCanvasElement;
  const selector = document.getElementById('objeto') as HTMLSelectElement;

  const renderer = new THREE.WebGLRenderer({
    canvas: lienzo,
    antialias: true,
    alpha: false,
    preserveDrawingBuffer: true, // necesario para toDataURL
  });
  renderer.setPixelRatio(2);
  renderer.setSize(1280, 800, false);

  const camara = new THREE.PerspectiveCamera(38, 1280 / 800, 0.1, 100);
  let escena = new THREE.Scene();
  let t = 0.18; // encuadre inicial: la espiral aún abierta

  // Mismo motivo que en Escena3D: glob, no mapa literal de import().
  const modulos = import.meta.glob<{ crear: () => THREE.Group }>('../../three/objetos/*.ts');

  async function cargar(nombre: string) {
    const cargador = modulos[`../../three/objetos/${nombre}.ts`];
    if (!cargador) {
      console.warn(`[posters] ${nombre} aún no existe`);
      return;
    }

    const { crear } = await cargador();
    escena = new THREE.Scene();
    escena.background = new THREE.Color(0x080808);
    escena.add(crear());
    crearLuces(TEMPERATURAS[nombre]).forEach((l) => escena.add(l));
  }

  function dibujar() {
    requestAnimationFrame(dibujar);
    const p = puntoEnEspiral(t);
    camara.position.set(p.x, p.y, p.z);
    camara.lookAt(0, 0, 0);
    renderer.render(escena, camara);
  }

  lienzo.addEventListener('wheel', (e) => {
    e.preventDefault();
    t = Math.min(1, Math.max(0, t + e.deltaY * 0.0004));
  }, { passive: false });

  selector.addEventListener('change', () => cargar(selector.value));

  document.getElementById('capturar')!.addEventListener('click', () => {
    const a = document.createElement('a');
    a.download = `${selector.value}.webp`;
    a.href = lienzo.toDataURL('image/webp', 0.82);
    a.click();
  });

  cargar(selector.value).then(dibujar);
</script>

<style>
  .util { padding: var(--phi-5) var(--phi-3); display: flex; flex-direction: column; gap: var(--phi-2); }
  .util__lienzo { border: 1px solid var(--hairline); max-width: 100%; }
  #lienzo { width: 100%; height: auto; }
  select, button { padding: var(--phi-0) var(--phi-1); font: inherit; }
  button { background: var(--rec); color: var(--void); border: 0; border-radius: 999px; cursor: pointer; }
</style>
```

> **Nota:** esta herramienta importa los seis objetos, pero en esta tarea solo existe
> `microfono.ts`. El `import()` de los otros cinco falla en silencio hasta que se creen en
> las Tareas 15–19. Es correcto: solo se captura `microfono` ahora.

- [ ] **Paso 5: Capturar el póster de la Home**

```bash
npm run dev
```

Abrir `http://localhost:4321/dev/posters`, dejar el objeto en `microfono`, ajustar el encuadre
con la rueda y pulsar **Capturar WebP**. Mover el archivo descargado:

```bash
mkdir -p public/posters
mv ~/Downloads/microfono.webp public/posters/home.webp
```

Si supera 60 KB, repetir bajando la calidad en `toDataURL('image/webp', 0.72)`.

- [ ] **Paso 5b: Verificacion en navegador — la unica que existe para el motor**

Con el navegador ya abierto para capturar, recorrer esta lista. No es opcional: el motor de
la Tarea 8 y los planos de la Tarea 9 no se pueden ejecutar en Node —necesitan DOM, WebGL,
ResizeObserver e IntersectionObserver—, asi que sus tests comprueban la forma del codigo y
**este es el unico punto del proyecto donde se comprueba que funcionan**. Anotar el resultado
de cada punto en el informe de la tarea.

1. **La escena se ve y responde al scroll.** El microfono aparece y la camara se acerca
   girando conforme se baja. Si no gira, la espiral de la Tarea 7 no esta conectada.
2. **Salir del viewport y volver.** Bajar hasta que la escena quede fuera de pantalla, volver
   a subir. La escena debe seguir animandose. Si se queda congelada, el re-arranque del bucle
   desde el `IntersectionObserver` no funciona.
3. **Ocultar la pestana y volver.** Cambiar a otra pestana varios segundos y regresar. La
   escena debe seguir viva. Este camino es distinto del anterior: lo re-arranca el manejador
   de `visibilitychange`, y una escena puede sobrevivir al punto 2 y morir en este.
4. **Los planos de profundidad se ven.** Detras del objeto deben distinguirse las dos fotos
   del estudio, tenues. Si estan en negro, o las rutas de textura no resuelven o se perdio el
   `SRGBColorSpace`. Ninguna de las dos cosas lanza error: fallan en silencio.
5. **El cruce poster -> canvas no salta.** Al cargar, la imagen debe dar paso a la escena sin
   que el contenido se mueva. Cualquier salto es CLS, y el presupuesto es 0,02.
6. **Con menos movimiento, no hay escena.** Activar `prefers-reduced-motion` en el sistema
   operativo y recargar: debe quedarse en el poster para siempre, y en la pestana de red del
   navegador **no debe aparecer ninguna descarga de three**. Es a la vez G3 y G4.

- [ ] **Paso 6: Ejecutar y comprobar que pasa**

Ejecutar: `npx vitest run tests/escena.test.ts`
Esperado: PASS, 8 tests.

- [ ] **Paso 7: Commit**

```bash
git add src/components/Escena3D.astro src/pages/dev public/posters tests/escena.test.ts
git commit -m "feat(S3D): isla Escena3D con poster como LCP y herramienta de captura"
```

---

# FASE 2 — LAS SEIS RUTAS

**Regla de copy para toda la fase.** El único texto de marca disponible es el eslogan real.
Los titulares nombran lo que hay; las descripciones se derivan de `src/data/`. Ninguna
afirmación sobre calidad, experiencia o resultados: no hay fuente que la respalde (G1).

