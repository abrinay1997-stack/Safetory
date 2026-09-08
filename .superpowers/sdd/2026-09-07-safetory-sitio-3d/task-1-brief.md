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
| `src/data/produccion.ts` | Los siete servicios de producción |
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

## Tarea 1: Andamiaje, tokens y tests de diseño

**Archivos:**
- Crear: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`
- Crear: `src/tokens/escala.ts`, `src/tokens/contraste.ts`, `src/styles/global.css`
- Test: `tests/tokens.test.ts`

**Interfaces:**
- Produce: `ESCALA_PHI: readonly number[]` (8 valores), `PHI: number`,
  `contraste(a: string, b: string): number`

- [ ] **Paso 1: Andamiar a mano e instalar el stack**

No uses `npm create astro`: la carpeta ya contiene `CLAUDE.md`, `docs/`, `Imagenes/`, los
logos y un repositorio git, y el asistente pediría confirmación interactiva o sobrescribiría
archivos. Los tres archivos de configuración se escriben enteros en el Paso 6.

```bash
npm init -y
npm install astro@^7.3.1 three@^0.185.1 gsap@^3.15.0 lenis@^1.3.26 split-type@^0.3.4 @astrojs/sitemap@^3.7.3
npm install -D vitest@^5.0.0 @types/three
mkdir -p src/tokens src/styles src/data src/layouts src/components src/scripts src/three/objetos src/pages public tests
```

Editar `package.json` para añadir `"type": "module"`, `"private": true` y borrar el campo
`"main"` que `npm init` deja puesto.

- [ ] **Paso 2: Escribir el test que falla**

`tests/tokens.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { PHI, ESCALA_PHI } from '../src/tokens/escala';
import { contraste } from '../src/tokens/contraste';

const VOID = '#080808';
const BONE = '#EDEAE3';
const ASH  = '#8A8783';
const REC  = '#FF2D2D';

describe('escala áurea', () => {
  it('tiene ocho pasos con los valores exactos del spec', () => {
    expect(ESCALA_PHI).toEqual([10, 16, 26, 42, 68, 110, 178, 288]);
  });

  it('cada paso es el anterior multiplicado por φ, con ±1px de redondeo', () => {
    for (let i = 1; i < ESCALA_PHI.length; i++) {
      expect(Math.abs(ESCALA_PHI[i] - ESCALA_PHI[i - 1] * PHI)).toBeLessThanOrEqual(1);
    }
  });
});

describe('contraste WCAG', () => {
  it('texto principal sobre fondo supera AAA', () => {
    expect(contraste(BONE, VOID)).toBeGreaterThanOrEqual(7);
  });

  it('texto secundario sobre fondo supera AA', () => {
    expect(contraste(ASH, VOID)).toBeGreaterThanOrEqual(4.5);
  });

  it('el acento sobre fondo supera AA', () => {
    expect(contraste(REC, VOID)).toBeGreaterThanOrEqual(4.5);
  });

  it('texto de fondo sobre botón de acento supera AA', () => {
    expect(contraste(VOID, REC)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('global.css no se desvía de la fuente', () => {
  const css = readFileSync('src/styles/global.css', 'utf8');

  it('declara los ocho pasos de la escala', () => {
    ESCALA_PHI.forEach((px, i) => {
      expect(css).toContain(`--phi-${i}: ${px}px;`);
    });
  });

  it('declara los cuatro colores exactos', () => {
    [VOID, BONE, ASH, REC].forEach((hex) => {
      expect(css.toUpperCase()).toContain(hex);
    });
  });

  it('no usa vh en alturas de sección', () => {
    expect(css).not.toMatch(/min-height:\s*100vh/);
  });
});
```

- [ ] **Paso 3: Ejecutar el test y comprobar que falla**

Ejecutar: `npx vitest run tests/tokens.test.ts`
Esperado: FAIL — `Cannot find module '../src/tokens/escala'`

- [ ] **Paso 4: Escribir la implementación mínima**

`src/tokens/escala.ts`:

```ts
/** Razón áurea. Rige tipografía, espaciado y recorrido de cámara. */
export const PHI = 1.618033988749895;

/**
 * Progresión geométrica de razón φ, base 16px, redondeada al entero.
 * Sirve a la vez para tamaño de tipo y para espaciado: son la misma escala.
 */
export const ESCALA_PHI = [10, 16, 26, 42, 68, 110, 178, 288] as const;
```

`src/tokens/contraste.ts`:

```ts
/** Canal sRGB → lineal, según WCAG 2.1. */
function lineal(canal: number): number {
  const c = canal / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminancia(hex: string): number {
  const v = hex.replace('#', '');
  const r = parseInt(v.slice(0, 2), 16);
  const g = parseInt(v.slice(2, 4), 16);
  const b = parseInt(v.slice(4, 6), 16);
  return 0.2126 * lineal(r) + 0.7152 * lineal(g) + 0.0722 * lineal(b);
}

/** Razón de contraste WCAG entre dos colores hexadecimales. Devuelve 1..21. */
export function contraste(a: string, b: string): number {
  const la = luminancia(a);
  const lb = luminancia(b);
  const claro = Math.max(la, lb);
  const oscuro = Math.min(la, lb);
  return (claro + 0.05) / (oscuro + 0.05);
}
```

`src/styles/global.css`:

```css
:root {
  /* Color — un solo acento (G9) */
  --void: #080808;
  --bone: #EDEAE3;
  --ash: #8A8783;
  --rec: #FF2D2D;
  --hairline: rgba(237, 234, 227, 0.12);

  /* Escala φ — tipografía Y espaciado (G12) */
  --phi-0: 10px;
  --phi-1: 16px;
  --phi-2: 26px;
  --phi-3: 42px;
  --phi-4: 68px;
  --phi-5: 110px;
  --phi-6: 178px;
  --phi-7: 288px;

  /* Reparto áureo (G12) */
  --mayor: 61.8%;
  --menor: 38.2%;

  --display: 'Clash Display', system-ui, sans-serif;
  --cuerpo: 'Satoshi', system-ui, sans-serif;
}

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

html { scroll-behavior: smooth; }
html.lenis-smooth { scroll-behavior: auto; }
html.lenis { height: auto; }
html.lenis-smooth body { overscroll-behavior: none; }

body {
  font-family: var(--cuerpo);
  background: var(--void);
  color: var(--bone);
  line-height: 1.45;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

a { color: inherit; text-decoration: none; }
img, canvas { display: block; max-width: 100%; }

:focus-visible {
  outline: 2px solid var(--rec);
  outline-offset: 3px;
  border-radius: 2px;
}

h1, h2, h3 {
  font-family: var(--display);
  font-weight: 600;
  line-height: 0.92;
  letter-spacing: -0.02em;
  text-wrap: balance;
}

h1 { font-size: clamp(var(--phi-4), 9vw, var(--phi-6)); }
h2 { font-size: clamp(var(--phi-3), 6vw, var(--phi-5)); }
h3 { font-size: clamp(var(--phi-2), 3vw, var(--phi-3)); }

.kicker {
  font-size: var(--phi-0);
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--ash);
}

.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.saltar {
  position: absolute;
  top: var(--phi-1);
  left: var(--phi-1);
  z-index: 999;
  padding: var(--phi-1) var(--phi-2);
  background: var(--rec);
  color: var(--void);
  font-weight: 600;
  transform: translateY(-200%);
  transition: transform 0.2s;
}
.saltar:focus { transform: translateY(0); }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Paso 5: Ejecutar el test y comprobar que pasa**

Ejecutar: `npx vitest run tests/tokens.test.ts`
Esperado: PASS, 8 tests.

- [ ] **Paso 6: Configurar Astro, TypeScript y Vitest**

`astro.config.mjs`:

```js
// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://safetorystudio.com',
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'auto' },
  compressHTML: true,
  integrations: [
    sitemap({ filter: (page) => !page.includes('/dev/') }),
  ],
});
```

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
```

Añadir a `package.json` → `scripts`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Paso 7: Verificar que la suite y el build arrancan**

Ejecutar: `npm test && npm run build`
Esperado: 8 tests PASS. El build avisa de que no hay páginas — es correcto en esta tarea.

- [ ] **Paso 8: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json vitest.config.ts src/tokens src/styles tests
git commit -m "feat(S00): andamiaje Astro, tokens phi y tests de escala y contraste"
```

---

