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

## Tarea 8: Detección de capacidades y motor de render

**Archivos:**
- Crear: `src/three/capacidades.ts`, `src/three/motor.ts`
- Test: `tests/capacidades.test.ts`

**Interfaces:**
- Consume: `puntoEnEspiral`, `ESPIRAL_POR_DEFECTO` (Tarea 7)
- Produce:
  - `interface Entorno { webgl: boolean; reduceMotion: boolean; ahorroDatos: boolean; memoriaSuficiente: boolean }`
  - `detectarEntorno(v: VentanaMinima): Entorno`
  - `debeRenderizar(e: Entorno): boolean`
  - `interface Motor { destruir(): void }`
  - `crearMotor(o: OpcionesMotor): Motor | null` con
    `OpcionesMotor = { canvas: HTMLCanvasElement; contenedor: HTMLElement; objeto: THREE.Group; luces: THREE.Light[]; alListo: () => void }`

- [ ] **Paso 1: Escribir el test que falla**

`tests/capacidades.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { detectarEntorno, debeRenderizar, type VentanaMinima } from '../src/three/capacidades';

function ventana(p: Partial<VentanaMinima> = {}): VentanaMinima {
  return {
    creaContextoWebGL: () => true,
    coincideMedia: () => false,
    ahorroDatos: false,
    memoriaGB: 8,
    ...p,
  };
}

describe('detección de entorno', () => {
  it('un equipo normal renderiza', () => {
    expect(debeRenderizar(detectarEntorno(ventana()))).toBe(true);
  });

  it('sin contexto WebGL no renderiza', () => {
    expect(debeRenderizar(detectarEntorno(ventana({ creaContextoWebGL: () => false })))).toBe(false);
  });

  it('con prefers-reduced-motion no renderiza (G3)', () => {
    expect(debeRenderizar(detectarEntorno(ventana({ coincideMedia: () => true })))).toBe(false);
  });

  it('con ahorro de datos activo no renderiza', () => {
    expect(debeRenderizar(detectarEntorno(ventana({ ahorroDatos: true })))).toBe(false);
  });

  it('con menos de 4 GB de memoria declarada no renderiza', () => {
    expect(debeRenderizar(detectarEntorno(ventana({ memoriaGB: 2 })))).toBe(false);
  });

  it('con exactamente 4 GB sí renderiza: el umbral es inclusivo', () => {
    expect(debeRenderizar(detectarEntorno(ventana({ memoriaGB: 4 })))).toBe(true);
  });

  it('si el navegador no declara memoria, no se penaliza', () => {
    expect(debeRenderizar(detectarEntorno(ventana({ memoriaGB: undefined })))).toBe(true);
  });
});

describe('motor', () => {
  const src = () => readFileSync('src/three/motor.ts', 'utf8');

  it('limita el devicePixelRatio a 2 (§7.4)', () => {
    expect(src()).toContain('Math.min(window.devicePixelRatio || 1, 2)');
  });

  it('detiene el render fuera de viewport y en pestaña oculta', () => {
    expect(src()).toContain('IntersectionObserver');
    expect(src()).toContain('visibilitychange');
  });

  it('libera geometrias, materiales y contexto al destruir', () => {
    const s = src();
    ['geometry.dispose()', 'dispose()', 'renderer.dispose()', 'forceContextLoss()']
      .forEach((t) => expect(s, t).toContain(t));
  });

  it('devuelve null si el entorno no admite render', () => {
    expect(src()).toContain('if (!debeRenderizar(');
    expect(src()).toContain('return null');
  });
});
```

- [ ] **Paso 2: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/capacidades.test.ts`
Esperado: FAIL — `Cannot find module '../src/three/capacidades'`

- [ ] **Paso 3: Escribir `capacidades.ts`**

```ts
/**
 * Superficie mínima del navegador que necesita la detección.
 * Se aísla en una interfaz para poder probarla en Node sin DOM.
 */
export interface VentanaMinima {
  creaContextoWebGL: () => boolean;
  coincideMedia: (consulta: string) => boolean;
  ahorroDatos: boolean;
  /** `navigator.deviceMemory`. `undefined` si el navegador no lo expone. */
  memoriaGB: number | undefined;
}

export interface Entorno {
  webgl: boolean;
  reduceMotion: boolean;
  ahorroDatos: boolean;
  memoriaSuficiente: boolean;
}

const MEMORIA_MINIMA_GB = 4;

export function detectarEntorno(v: VentanaMinima): Entorno {
  return {
    webgl: v.creaContextoWebGL(),
    reduceMotion: v.coincideMedia('(prefers-reduced-motion: reduce)'),
    ahorroDatos: v.ahorroDatos,
    // Si el navegador no declara memoria, no penalizamos: no saberlo no es
    // lo mismo que saber que es poca.
    memoriaSuficiente: v.memoriaGB === undefined || v.memoriaGB >= MEMORIA_MINIMA_GB,
  };
}

export function debeRenderizar(e: Entorno): boolean {
  return e.webgl && !e.reduceMotion && !e.ahorroDatos && e.memoriaSuficiente;
}

/** Lee el entorno real del navegador. Solo se llama desde el cliente. */
export function entornoDelNavegador(): Entorno {
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean };
    deviceMemory?: number;
  };
  return detectarEntorno({
    creaContextoWebGL: () => {
      try {
        const c = document.createElement('canvas');
        return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
      } catch {
        return false;
      }
    },
    coincideMedia: (q) => window.matchMedia(q).matches,
    ahorroDatos: Boolean(nav.connection?.saveData),
    memoriaGB: nav.deviceMemory,
  });
}
```

- [ ] **Paso 4: Escribir `motor.ts`**

```ts
import * as THREE from 'three';
import { puntoEnEspiral, ESPIRAL_POR_DEFECTO, type OpcionesEspiral } from './camara-phi';
import { debeRenderizar, entornoDelNavegador } from './capacidades';

export interface OpcionesMotor {
  canvas: HTMLCanvasElement;
  contenedor: HTMLElement;
  objeto: THREE.Group;
  luces: THREE.Light[];
  espiral?: OpcionesEspiral;
  /** Se llama tras el primer frame dibujado: dispara el cross-fade del póster. */
  alListo: () => void;
}

export interface Motor {
  destruir(): void;
}

/**
 * Monta una escena y la mantiene viva mientras esté en pantalla.
 * Devuelve null cuando el entorno no admite WebGL o el usuario pidió
 * menos movimiento: en ese caso la página se queda en el póster (§7.3).
 */
export function crearMotor(o: OpcionesMotor): Motor | null {
  if (!debeRenderizar(entornoDelNavegador())) return null;

  const espiral = o.espiral ?? ESPIRAL_POR_DEFECTO;

  const renderer = new THREE.WebGLRenderer({
    canvas: o.canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const escena = new THREE.Scene();
  escena.add(o.objeto);
  o.luces.forEach((l) => escena.add(l));

  const camara = new THREE.PerspectiveCamera(38, 1, 0.1, 100);

  function medir() {
    const { clientWidth: w, clientHeight: h } = o.contenedor;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    camara.aspect = w / h;
    camara.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(medir);
  ro.observe(o.contenedor);
  medir();

  // Progreso de scroll del contenedor, 0..1
  let progreso = 0;
  function medirProgreso() {
    const r = o.contenedor.getBoundingClientRect();
    const recorrido = r.height + window.innerHeight;
    progreso = Math.min(1, Math.max(0, (window.innerHeight - r.top) / recorrido));
  }
  window.addEventListener('scroll', medirProgreso, { passive: true });
  medirProgreso();

  let visible = false;
  const io = new IntersectionObserver(
    (e) => { visible = e[0]?.isIntersecting ?? false; },
    { threshold: 0.01 },
  );
  io.observe(o.contenedor);

  let pestanaVisible = document.visibilityState === 'visible';
  const onVisibilidad = () => { pestanaVisible = document.visibilityState === 'visible'; };
  document.addEventListener('visibilitychange', onVisibilidad);

  let raf = 0;
  let vivo = true;
  let primerFrame = true;

  function dibujar() {
    if (!vivo) return;
    raf = requestAnimationFrame(dibujar);
    if (!visible || !pestanaVisible) return;

    const p = puntoEnEspiral(progreso, espiral);
    camara.position.set(p.x, p.y, p.z);
    camara.lookAt(0, 0, 0);

    renderer.render(escena, camara);

    if (primerFrame) {
      primerFrame = false;
      o.alListo();
    }
  }
  raf = requestAnimationFrame(dibujar);

  return {
    destruir() {
      vivo = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('scroll', medirProgreso);
      document.removeEventListener('visibilitychange', onVisibilidad);

      escena.traverse((n) => {
        const m = n as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else mat?.dispose();
      });

      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
```

- [ ] **Paso 5: Ejecutar y comprobar que pasa**

Ejecutar: `npx vitest run tests/capacidades.test.ts`
Esperado: PASS, 11 tests.

- [ ] **Paso 6: Commit**

```bash
git add src/three/capacidades.ts src/three/motor.ts tests/capacidades.test.ts
git commit -m "feat(S3D): motor de render con degradacion, pausa y limpieza"
```

---

