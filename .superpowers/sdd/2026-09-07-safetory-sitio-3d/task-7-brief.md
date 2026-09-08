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

## Tarea 7: La espiral áurea

**Archivos:**
- Crear: `src/three/camara-phi.ts`
- Test: `tests/camara-phi.test.ts`

Matemática pura, sin dependencia de three. Se puede probar al 100 % en Node.

**Interfaces:**
- Consume: `PHI` de `src/tokens/escala.ts` (Tarea 1)
- Produce:
  - `interface PuntoCamara { x: number; y: number; z: number }`
  - `interface OpcionesEspiral { radioInicial: number; vueltas: number; alturaInicial: number; deltaAltura: number }`
  - `ESPIRAL_POR_DEFECTO: OpcionesEspiral`
  - `puntoEnEspiral(t: number, o?: OpcionesEspiral): PuntoCamara`

- [ ] **Paso 1: Escribir el test que falla**

`tests/camara-phi.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { PHI } from '../src/tokens/escala';
import {
  puntoEnEspiral, ESPIRAL_POR_DEFECTO, type OpcionesEspiral,
} from '../src/three/camara-phi';

const O: OpcionesEspiral = {
  radioInicial: 10,
  vueltas: 1,
  alturaInicial: 0,
  deltaAltura: 4,
};

const radio = (p: { x: number; z: number }) => Math.hypot(p.x, p.z);

describe('espiral áurea', () => {
  it('en t=0 arranca en el radio inicial y la altura inicial', () => {
    const p = puntoEnEspiral(0, O);
    expect(radio(p)).toBeCloseTo(10, 6);
    expect(p.y).toBeCloseTo(0, 6);
  });

  it('en t=1 el radio se ha dividido exactamente por φ', () => {
    const p = puntoEnEspiral(1, O);
    expect(radio(p)).toBeCloseTo(10 / PHI, 6);
  });

  it('la cámara sube linealmente hasta deltaAltura', () => {
    expect(puntoEnEspiral(0.5, O).y).toBeCloseTo(2, 6);
    expect(puntoEnEspiral(1, O).y).toBeCloseTo(4, 6);
  });

  it('el radio decrece de forma monótona: la espiral se cierra', () => {
    let anterior = Infinity;
    for (let t = 0; t <= 1; t += 0.05) {
      const r = radio(puntoEnEspiral(t, O));
      expect(r).toBeLessThan(anterior);
      anterior = r;
    }
  });

  it('recorre una vuelta completa cuando vueltas = 1', () => {
    const inicio = puntoEnEspiral(0, O);
    const fin = puntoEnEspiral(1, O);
    const anguloInicio = Math.atan2(inicio.z, inicio.x);
    const anguloFin = Math.atan2(fin.z, fin.x);
    expect(Math.abs(anguloFin - anguloInicio)).toBeLessThan(1e-6);
  });

  it('acota t fuera del rango [0,1] en vez de extrapolar', () => {
    expect(puntoEnEspiral(-3, O)).toEqual(puntoEnEspiral(0, O));
    expect(puntoEnEspiral(7, O)).toEqual(puntoEnEspiral(1, O));
  });

  it('nunca devuelve NaN', () => {
    for (let t = 0; t <= 1; t += 0.1) {
      const p = puntoEnEspiral(t, O);
      [p.x, p.y, p.z].forEach((v) => expect(Number.isNaN(v)).toBe(false));
    }
  });

  it('las opciones por defecto colocan la cámara fuera del objeto', () => {
    expect(ESPIRAL_POR_DEFECTO.radioInicial).toBeGreaterThan(1);
    expect(radio(puntoEnEspiral(1))).toBeGreaterThan(1);
  });
});
```

- [ ] **Paso 2: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/camara-phi.test.ts`
Esperado: FAIL — `Cannot find module '../src/three/camara-phi'`

- [ ] **Paso 3: Escribir la implementación**

`src/three/camara-phi.ts`:

```ts
import { PHI } from '../tokens/escala';

export interface PuntoCamara { x: number; y: number; z: number }

export interface OpcionesEspiral {
  /** Radio en t=0. En t=1 valdrá radioInicial / φ. */
  radioInicial: number;
  /** Vueltas completas alrededor del objeto durante el scroll. */
  vueltas: number;
  alturaInicial: number;
  /** Cuánto sube la cámara entre t=0 y t=1. */
  deltaAltura: number;
}

export const ESPIRAL_POR_DEFECTO: OpcionesEspiral = {
  radioInicial: 6.2,
  vueltas: 1,
  alturaInicial: 0.4,
  deltaAltura: 1.6,
};

/**
 * Punto de la espiral logarítmica de razón φ para un progreso de scroll t.
 *
 *   r(t) = r0 · φ^(−t)
 *   θ(t) = t · 2π · vueltas
 *
 * La cámara gira mientras se acerca: la espiral se cierra sobre el objeto.
 * φ rige el movimiento sin que la espiral llegue a dibujarse nunca en pantalla.
 */
export function puntoEnEspiral(
  t: number,
  o: OpcionesEspiral = ESPIRAL_POR_DEFECTO,
): PuntoCamara {
  const p = Math.min(1, Math.max(0, t));
  const r = o.radioInicial * Math.pow(PHI, -p);
  const theta = p * Math.PI * 2 * o.vueltas;
  return {
    x: r * Math.cos(theta),
    y: o.alturaInicial + p * o.deltaAltura,
    z: r * Math.sin(theta),
  };
}
```

- [ ] **Paso 4: Ejecutar y comprobar que pasa**

Ejecutar: `npx vitest run tests/camara-phi.test.ts`
Esperado: PASS, 8 tests.

- [ ] **Paso 5: Commit**

```bash
git add src/three/camara-phi.ts tests/camara-phi.test.ts
git commit -m "feat(S3D): recorrido de camara en espiral aurea"
```

---

