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

## Tarea 10: Presupuesto de escena y el micrófono

**Archivos:**
- Crear: `src/three/presupuesto.ts`, `src/three/objetos/microfono.ts`
- Test: `tests/objetos.test.ts`

El conteo de triángulos se hace construyendo el grupo en Node: three arma el grafo de escena
sin necesitar contexto WebGL, así que el presupuesto de §7.4 es verificable en CI.

**Interfaces:**
- Consume: `metalOscuro`, `rejilla`, `emisivoAcento` (Tarea 9)
- Produce:
  - `interface Presupuesto { mallas: number; triangulos: number }`
  - `medirPresupuesto(g: THREE.Object3D): Presupuesto`
  - `LIMITE_MALLAS = 30`, `LIMITE_TRIANGULOS = 60000`
  - `microfono.crear(): THREE.Group` con hijos nombrados
    `cuerpo`, `rejilla`, `jaula`, `anillo`, `base`, `aro-superior`, `aro-inferior`

- [ ] **Paso 1: Escribir el test que falla**

`tests/objetos.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { medirPresupuesto, LIMITE_MALLAS, LIMITE_TRIANGULOS } from '../src/three/presupuesto';
import { crear as crearMicrofono } from '../src/three/objetos/microfono';

describe('presupuesto de escena (§7.4)', () => {
  it('mide mallas y triángulos de un grupo', () => {
    const p = medirPresupuesto(crearMicrofono());
    expect(p.mallas).toBeGreaterThan(0);
    expect(p.triangulos).toBeGreaterThan(0);
  });
});

describe('micrófono', () => {
  const mic = crearMicrofono();

  it('cabe en el presupuesto de mallas y triángulos', () => {
    const p = medirPresupuesto(mic);
    expect(p.mallas).toBeLessThanOrEqual(LIMITE_MALLAS);
    expect(p.triangulos).toBeLessThanOrEqual(LIMITE_TRIANGULOS);
  });

  it('expone las piezas que necesita el despiece de la Home', () => {
    ['cuerpo', 'rejilla', 'jaula', 'anillo', 'base']
      .forEach((n) => expect(mic.getObjectByName(n), n).toBeDefined());
  });

  it('el grupo se llama microfono, para que el motor lo identifique', () => {
    expect(mic.name).toBe('microfono');
  });

  it('está centrado en el origen: la cámara orbita alrededor de (0,0,0)', () => {
    expect(Math.abs(mic.position.x)).toBeLessThan(0.001);
    expect(Math.abs(mic.position.z)).toBeLessThan(0.001);
  });

  it('la jaula usa InstancedMesh: una sola llamada de dibujado', () => {
    const jaula = mic.getObjectByName('jaula');
    // `isInstancedMesh` y no `.type`: Three.js hereda type = 'Mesh' de Mesh y
    // nunca reasigna esa cadena en InstancedMesh, asi que un aserto sobre
    // `.type` obliga a escribirla a mano en el objeto de produccion. La propia
    // libreria distingue las instancias por esta bandera (Object3D.toJSON).
    expect((jaula as THREE.InstancedMesh)?.isInstancedMesh).toBe(true);
  });

  it('el presupuesto cuenta las copias de la jaula, no una sola', () => {
    // Sin multiplicar por `count`, medirPresupuesto devolveria menos triangulos
    // de los que la GPU dibuja de verdad, y el guardrail de rendimiento de los
    // cinco objetos que faltan quedaria en decorativo.
    const soloJaula = new THREE.Group();
    const jaula = mic.getObjectByName('jaula') as THREE.InstancedMesh;
    soloJaula.add(jaula.clone());
    const p = medirPresupuesto(soloJaula);
    const porCopia = medirPresupuesto(new THREE.Mesh(jaula.geometry)).triangulos;
    expect(p.triangulos).toBe(porCopia * jaula.count);
    expect(jaula.count).toBeGreaterThan(1);
  });
});
```

- [ ] **Paso 2: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/objetos.test.ts`
Esperado: FAIL — `Cannot find module '../src/three/presupuesto'`

- [ ] **Paso 3: Escribir `presupuesto.ts`**

```ts
import * as THREE from 'three';

export const LIMITE_MALLAS = 30;
export const LIMITE_TRIANGULOS = 60_000;

export interface Presupuesto {
  mallas: number;
  triangulos: number;
}

/**
 * Cuenta mallas y triángulos de un grafo de escena.
 * No necesita contexto WebGL, así que corre en Node y el presupuesto de
 * §7.4 se puede verificar en cada commit.
 */
export function medirPresupuesto(raiz: THREE.Object3D): Presupuesto {
  let mallas = 0;
  let triangulos = 0;

  raiz.traverse((n) => {
    const m = n as THREE.Mesh & { count?: number };
    if (!m.isMesh || !m.geometry) return;

    mallas += 1;

    const geo = m.geometry as THREE.BufferGeometry;
    const porInstancia = geo.index
      ? geo.index.count / 3
      : geo.attributes.position.count / 3;

    // InstancedMesh dibuja `count` copias de la misma geometría.
    triangulos += porInstancia * (m.count ?? 1);
  });

  return { mallas, triangulos: Math.round(triangulos) };
}
```

- [ ] **Paso 4: Escribir `objetos/microfono.ts`**

```ts
import * as THREE from 'three';
import { metalOscuro, rejilla, emisivoAcento } from '../materiales';

const BARRAS_JAULA = 6;
const RADIO_JAULA = 0.44;

/**
 * Micrófono de condensador de válvulas con jaula y anillo de acento.
 * Objeto protagonista de `/`. Siete piezas, todas nombradas: el despiece
 * de la Home las mueve por nombre (§8.3).
 */
export function crear(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'microfono';

  const cuerpo = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.32, 1.0, 28),
    metalOscuro(),
  );
  cuerpo.name = 'cuerpo';
  cuerpo.position.y = -0.1;
  g.add(cuerpo);

  const malla = new THREE.Mesh(
    new THREE.CylinderGeometry(0.33, 0.33, 0.62, 28, 1, true),
    rejilla(),
  );
  malla.name = 'rejilla';
  malla.position.y = 0.68;
  g.add(malla);

  const tapa = new THREE.Mesh(new THREE.SphereGeometry(0.33, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), rejilla());
  tapa.name = 'rejilla-tapa';
  tapa.position.y = 0.99;
  g.add(tapa);

  // Jaula: seis barras idénticas en anillo, una sola llamada de dibujado.
  const jaula = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.035, 1.4, 0.035),
    metalOscuro(),
    BARRAS_JAULA,
  );
  jaula.name = 'jaula';
  const m = new THREE.Matrix4();
  for (let i = 0; i < BARRAS_JAULA; i++) {
    const a = (i / BARRAS_JAULA) * Math.PI * 2;
    m.makeTranslation(Math.cos(a) * RADIO_JAULA, 0.42, Math.sin(a) * RADIO_JAULA);
    jaula.setMatrixAt(i, m);
  }
  jaula.instanceMatrix.needsUpdate = true;
  g.add(jaula);

  const anillo = new THREE.Mesh(
    new THREE.TorusGeometry(0.33, 0.035, 12, 32),
    emisivoAcento(),
  );
  anillo.name = 'anillo';
  anillo.position.y = 0.35;
  anillo.rotation.x = Math.PI / 2;
  g.add(anillo);

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.22, 0.2, 20),
    metalOscuro(),
  );
  base.name = 'base';
  base.position.y = -0.72;
  g.add(base);

  [0.9, -0.05].forEach((y, i) => {
    const aro = new THREE.Mesh(
      new THREE.TorusGeometry(RADIO_JAULA + 0.02, 0.022, 10, 36),
      metalOscuro(),
    );
    aro.name = i === 0 ? 'aro-superior' : 'aro-inferior';
    aro.position.y = y;
    aro.rotation.x = Math.PI / 2;
    g.add(aro);
  });

  return g;
}
```

- [ ] **Paso 5: Ejecutar y comprobar que pasa**

Ejecutar: `npx vitest run tests/objetos.test.ts`
Esperado: PASS, 6 tests.

- [ ] **Paso 6: Commit**

```bash
git add src/three/presupuesto.ts src/three/objetos/microfono.ts tests/objetos.test.ts
git commit -m "feat(S3D): microfono procedural y presupuesto de escena verificable"
```

---

