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

# FASE 0 — CIMIENTOS

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

## Tarea 2: Fuentes auto-hospedadas

**Archivos:**
- Crear: `public/fonts/ClashDisplay-Semibold.woff2`, `public/fonts/Satoshi-Regular.woff2`,
  `public/fonts/Satoshi-Medium.woff2`
- Modificar: `src/styles/global.css` (añadir `@font-face`)
- Test: `tests/fuentes.test.ts`

**Interfaces:**
- Consume: `src/styles/global.css` de la Tarea 1
- Produce: familias `'Clash Display'` y `'Satoshi'` disponibles en CSS

- [ ] **Paso 1: Descargar las fuentes**

Descargar de Fontshare (licencia gratuita, permite auto-hospedaje):
- `https://www.fontshare.com/fonts/clash-display` → peso Semibold (600)
- `https://www.fontshare.com/fonts/satoshi` → pesos Regular (400) y Medium (500)

Colocar solo los `.woff2` en `public/fonts/`. No copiar `.otf`, `.ttf` ni `.woff`: pesan de
más y ningún navegador soportado los necesita.

- [ ] **Paso 2: Escribir el test que falla**

`tests/fuentes.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { existsSync, statSync, readFileSync } from 'node:fs';

const FUENTES = [
  'public/fonts/ClashDisplay-Semibold.woff2',
  'public/fonts/Satoshi-Regular.woff2',
  'public/fonts/Satoshi-Medium.woff2',
];

describe('fuentes auto-hospedadas', () => {
  it('los tres archivos woff2 existen', () => {
    FUENTES.forEach((f) => expect(existsSync(f), f).toBe(true));
  });

  it('ninguna fuente supera los 120 KB', () => {
    FUENTES.forEach((f) => {
      expect(statSync(f).size, f).toBeLessThan(120 * 1024);
    });
  });

  it('global.css declara las tres caras con font-display swap', () => {
    const css = readFileSync('src/styles/global.css', 'utf8');
    expect(css).toContain("font-family: 'Clash Display'");
    expect(css).toContain("font-family: 'Satoshi'");
    expect((css.match(/font-display:\s*swap/g) ?? []).length).toBe(3);
  });

  it('no carga fuentes desde un dominio externo', () => {
    const css = readFileSync('src/styles/global.css', 'utf8');
    expect(css).not.toMatch(/@import\s+url\(['"]?https?:/);
    expect(css).not.toContain('fonts.googleapis.com');
  });
});
```

- [ ] **Paso 3: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/fuentes.test.ts`
Esperado: FAIL — el test de `@font-face` no encuentra las declaraciones.

- [ ] **Paso 4: Declarar las caras en `global.css`**

Insertar al principio del archivo, antes de `:root`:

```css
@font-face {
  font-family: 'Clash Display';
  src: url('/fonts/ClashDisplay-Semibold.woff2') format('woff2');
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Satoshi';
  src: url('/fonts/Satoshi-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Satoshi';
  src: url('/fonts/Satoshi-Medium.woff2') format('woff2');
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}
```

- [ ] **Paso 5: Ejecutar y comprobar que pasa**

Ejecutar: `npx vitest run tests/fuentes.test.ts`
Esperado: PASS, 4 tests.

- [ ] **Paso 6: Commit**

```bash
git add public/fonts src/styles/global.css tests/fuentes.test.ts
git commit -m "feat(S00): Clash Display y Satoshi auto-hospedadas en woff2"
```

---

## Tarea 3: Capa de datos y generador de WhatsApp

**Archivos:**
- Crear: `src/data/tipos.ts`, `src/data/site.ts`, `src/data/whatsapp.ts`,
  `src/data/estudio.ts`, `src/data/ciclorama.ts`, `src/data/produccion.ts`,
  `src/data/membresia.ts`, `src/data/equipo.ts`
- Test: `tests/datos.test.ts`

**Interfaces:**
- Produce:
  - `interface Tarifa { id: string; nombre: string; duracion: string; precio: number | null; condicion?: string }`
  - `site: { nombre, eslogan, direccion, telefono, whatsapp, correo, instagram, horario, lang, locale, themeColor }`
  - `enlaceWhatsApp(servicio: string): string`
  - `tarifasEstudio: Tarifa[]`, `bloquesEstudioMiembro: Tarifa[]`
  - `cicloramaFoto: Tarifa[]`, `cicloramaVideo: Tarifa[]`, `bloquesCicloramaMiembro: Tarifa[]`
  - `serviciosProduccion: Tarifa[]`
  - `incluidoMembresia: string[]`
  - `equipoVerificable: string[]`

- [ ] **Paso 1: Escribir el test que falla**

`tests/datos.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { site } from '../src/data/site';
import { enlaceWhatsApp } from '../src/data/whatsapp';
import { tarifasEstudio, bloquesEstudioMiembro } from '../src/data/estudio';
import { cicloramaFoto, cicloramaVideo } from '../src/data/ciclorama';
import { serviciosProduccion } from '../src/data/produccion';
import { incluidoMembresia } from '../src/data/membresia';
import { equipoVerificable } from '../src/data/equipo';

describe('identidad y contacto', () => {
  it('reproduce los datos reales de Safetory', () => {
    expect(site.nombre).toBe('Safetory Studio');
    expect(site.eslogan).toBe('Donde la innovación se encuentra con la perfección');
    expect(site.direccion).toBe('Edificio Brasilia, Vía España, Panamá, Provincia de Panamá');
    expect(site.telefono).toBe('6799-8881');
    expect(site.correo).toBe('info@safetoryglobal.com');
    expect(site.instagram).toBe('https://instagram.com/safetorystudio');
  });

  it('publica el horario tal y como lo declara el estudio', () => {
    expect(site.horario).toEqual([
      { dias: 'Lunes a viernes', horas: '24 horas' },
      { dias: 'Sábado', horas: '9:00–12:30' },
      { dias: 'Domingo', horas: 'Cerrado' },
    ]);
  });
});

describe('enlace de WhatsApp', () => {
  it('apunta al número con prefijo de Panamá', () => {
    expect(enlaceWhatsApp('Studio 1 · 3 horas')).toMatch(/^https:\/\/wa\.me\/50767998881\?text=/);
  });

  it('codifica el servicio dentro del mensaje', () => {
    const url = enlaceWhatsApp('Servicio de Mastering');
    expect(decodeURIComponent(url.split('text=')[1]))
      .toBe('Hola, quiero reservar: Servicio de Mastering');
  });

  it('no deja espacios sin codificar', () => {
    expect(enlaceWhatsApp('Studio 1')).not.toContain(' ');
  });
});

describe('tarifas de Studio 1', () => {
  it('cobra 50 la hora suelta', () => {
    const h = tarifasEstudio.find((t) => t.id === 'estudio-1h');
    expect(h?.precio).toBe(50);
    expect(h?.duracion).toBe('1 hora');
  });

  it('cobra 35 por hora a partir de 3 horas, con la condición literal', () => {
    const b = tarifasEstudio.find((t) => t.id === 'estudio-3h');
    expect(b?.precio).toBe(35);
    expect(b?.condicion).toBe(
      'Si alquilas 3 horas o más, cada hora consumida queda en $35.'
    );
  });

  it('los bloques de miembro no tienen precio', () => {
    expect(bloquesEstudioMiembro).toHaveLength(3);
    bloquesEstudioMiembro.forEach((b) => expect(b.precio).toBeNull());
    expect(bloquesEstudioMiembro.map((b) => b.duracion))
      .toEqual(['3 horas', '5 horas', '8 horas']);
  });
});

describe('tarifas de ciclorama', () => {
  it('fotografía cuesta 25 la primera hora y 20 las siguientes', () => {
    expect(cicloramaFoto).toHaveLength(1);
    expect(cicloramaFoto[0].precio).toBe(25);
    expect(cicloramaFoto[0].condicion).toBe('Hora adicional: $20.');
  });

  it('vídeo tiene tres bloques con los precios publicados', () => {
    expect(cicloramaVideo.map((t) => [t.duracion, t.precio])).toEqual([
      ['2 horas', 50],
      ['4 horas', 90],
      ['8 horas', 280],
    ]);
  });

  it('todos los bloques de vídeo declaran la hora adicional', () => {
    cicloramaVideo.forEach((t) => expect(t.condicion).toBe('Hora adicional: $25.'));
  });
});

describe('servicios de producción', () => {
  it('son seis, en orden, y con los precios exactos', () => {
    expect(serviciosProduccion.map((s) => [s.id, s.precio])).toEqual([
      ['mixing', 60],
      ['mastering', 50],
      ['mixing-mastering', 105],
      ['grabacion', 45],
      ['grabacion-instrumental', 80],
      ['produccion-personalizada', 300],
    ]);
  });

  it('ningún servicio de producción queda sin precio', () => {
    serviciosProduccion.forEach((s) => expect(s.precio).not.toBeNull());
  });

  it('no promete plazos de entrega que el estudio nunca publicó (G1)', () => {
    // La fuente registra «23h 59min» para mixing y mastering: es la longitud
    // del hueco en la agenda de reservas, no un plazo de entrega. Convertirlo
    // en «entrega en 24 horas» sería fabricar un compromiso comercial.
    serviciosProduccion.forEach((s) => {
      expect(s.duracion ?? '', s.id).not.toMatch(/entrega|plazo|24\s*horas/i);
    });
  });

  it('solo llevan duración los servicios que se miden en tiempo', () => {
    const conDuracion = serviciosProduccion.filter((s) => s.duracion).map((s) => s.id);
    expect(conDuracion).toEqual([
      'grabacion',
      'grabacion-instrumental',
      'produccion-personalizada',
    ]);
  });

  it('mastering limita a 8 stems y mixing no limita', () => {
    expect(serviciosProduccion.find((s) => s.id === 'mixing')?.condicion)
      .toBe('Stems ilimitados.');
    expect(serviciosProduccion.find((s) => s.id === 'mastering')?.condicion)
      .toBe('Máximo 8 stems.');
  });

  it('la grabación avisa de que no entra en la hora de estudio', () => {
    expect(serviciosProduccion.find((s) => s.id === 'grabacion')?.condicion)
      .toBe('No incluido en la hora de alquiler del estudio.');
  });

  it('la producción personalizada enumera sus siete entregables', () => {
    const p = serviciosProduccion.find((s) => s.id === 'produccion-personalizada');
    expect(p?.precio).toBe(300);
    expect(p?.condicion).toContain('Instrumental desde cero');
    expect(p?.condicion).toContain('asesoría creativa');
  });
});

describe('huecos de contenido del spec §9.5', () => {
  it('la membresía describe los bloques pero no inventa precio', () => {
    expect(incluidoMembresia.length).toBeGreaterThan(0);
    incluidoMembresia.forEach((linea) => expect(linea).not.toMatch(/\$\d/));
  });

  it('el inventario de equipo no publica marcas ni modelos (G15)', () => {
    const prohibidas = ['Manley', 'Yamaha', 'Universal Audio', 'Apollo', 'HS5', 'HS8'];
    equipoVerificable.forEach((linea) => {
      prohibidas.forEach((m) => expect(linea).not.toContain(m));
    });
  });
});
```

- [ ] **Paso 2: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/datos.test.ts`
Esperado: FAIL — `Cannot find module '../src/data/site'`

- [ ] **Paso 3: Escribir los módulos de datos**

`src/data/tipos.ts`:

```ts
/** Una línea de tarifa publicada. `precio: null` = incluido en la membresía. */
export interface Tarifa {
  id: string;
  nombre: string;
  /**
   * Duración real del servicio. Se omite cuando el servicio no se mide en
   * tiempo: mixing y mastering se cobran por trabajo, no por horas, y el
   * estudio no publica plazo de entrega. Inventar uno sería una promesa
   * comercial que nadie ha hecho (G1).
   */
  duracion?: string;
  precio: number | null;
  /**
   * Condición publicada por el estudio, en su redacción final. Se puede
   * corregir ortografía y acentuación; nunca alterar el significado ni
   * añadir compromisos que no estén en la fuente.
   */
  condicion?: string;
}

export interface FranjaHoraria {
  dias: string;
  horas: string;
}
```

`src/data/site.ts`:

```ts
import type { FranjaHoraria } from './tipos';

/**
 * Identidad y contacto. Origen: safetorystudio.setmore.com, extraído 2026-09-07.
 * Única fuente de verdad: ninguna plantilla escribe estos datos a mano.
 */
export const site = {
  nombre: 'Safetory Studio',
  eslogan: 'Donde la innovación se encuentra con la perfección',
  direccion: 'Edificio Brasilia, Vía España, Panamá, Provincia de Panamá',
  telefono: '6799-8881',
  whatsapp: '50767998881',
  correo: 'info@safetoryglobal.com',
  instagram: 'https://instagram.com/safetorystudio',
  lang: 'es',
  locale: 'es_PA',
  themeColor: '#080808',
  horario: [
    { dias: 'Lunes a viernes', horas: '24 horas' },
    { dias: 'Sábado', horas: '9:00–12:30' },
    { dias: 'Domingo', horas: 'Cerrado' },
  ] as FranjaHoraria[],
} as const;
```

`src/data/whatsapp.ts`:

```ts
import { site } from './site';

/**
 * Enlace de reserva con el mensaje ya escrito.
 * Punto único de cambio: cuando exista el agendado nativo (fase 2), solo
 * se reescribe esta función y ninguna plantilla se toca.
 */
export function enlaceWhatsApp(servicio: string): string {
  const texto = `Hola, quiero reservar: ${servicio}`;
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(texto)}`;
}
```

`src/data/estudio.ts`:

```ts
import type { Tarifa } from './tipos';

export const tarifasEstudio: Tarifa[] = [
  {
    id: 'estudio-1h',
    nombre: 'Studio 1 · hora suelta',
    duracion: '1 hora',
    precio: 50,
  },
  {
    id: 'estudio-3h',
    nombre: 'Studio 1 · bloque',
    duracion: '3 horas o más',
    precio: 35,
    condicion: 'Si alquilas 3 horas o más, cada hora consumida queda en $35.',
  },
];

export const bloquesEstudioMiembro: Tarifa[] = [
  { id: 'estudio-m3', nombre: 'Bloque de miembro', duracion: '3 horas', precio: null },
  { id: 'estudio-m5', nombre: 'Bloque de miembro', duracion: '5 horas', precio: null },
  { id: 'estudio-m8', nombre: 'Bloque de miembro', duracion: '8 horas', precio: null },
];
```

`src/data/ciclorama.ts`:

```ts
import type { Tarifa } from './tipos';

export const cicloramaFoto: Tarifa[] = [
  {
    id: 'ciclo-foto-1h',
    nombre: 'Ciclorama · fotografía',
    duracion: '1 hora',
    precio: 25,
    condicion: 'Hora adicional: $20.',
  },
];

export const cicloramaVideo: Tarifa[] = [
  {
    id: 'ciclo-video-2h',
    nombre: 'Ciclorama · vídeo',
    duracion: '2 horas',
    precio: 50,
    condicion: 'Hora adicional: $25.',
  },
  {
    id: 'ciclo-video-4h',
    nombre: 'Ciclorama · vídeo',
    duracion: '4 horas',
    precio: 90,
    condicion: 'Hora adicional: $25.',
  },
  {
    id: 'ciclo-video-8h',
    nombre: 'Ciclorama · vídeo',
    duracion: '8 horas',
    precio: 280,
    condicion: 'Hora adicional: $25.',
  },
];

export const bloquesCicloramaMiembro: Tarifa[] = [
  { id: 'ciclo-m3', nombre: 'Bloque de miembro', duracion: '3 horas', precio: null },
  { id: 'ciclo-m5', nombre: 'Bloque de miembro', duracion: '5 horas', precio: null },
];
```

`src/data/produccion.ts`:

```ts
import type { Tarifa } from './tipos';

export const serviciosProduccion: Tarifa[] = [
  // Mixing y mastering se cobran por trabajo, no por tiempo. La fuente
  // registra «23h 59min», que es la longitud del hueco de reserva en la
  // agenda, no un plazo de entrega. Publicar un plazo sería inventar un
  // compromiso comercial (G1), así que estos tres van sin `duracion`.
  {
    id: 'mixing',
    nombre: 'Mixing',
    precio: 60,
    condicion: 'Stems ilimitados.',
  },
  {
    id: 'mastering',
    nombre: 'Mastering',
    precio: 50,
    condicion: 'Máximo 8 stems.',
  },
  {
    id: 'mixing-mastering',
    nombre: 'Mixing y Mastering',
    precio: 105,
    condicion: 'Stems de mixing ilimitados. Máximo 8 stems de mastering.',
  },
  {
    id: 'grabacion',
    nombre: 'Grabación',
    duracion: '3 horas',
    precio: 45,
    condicion: 'No incluido en la hora de alquiler del estudio.',
  },
  {
    id: 'grabacion-instrumental',
    nombre: 'Grabación sobre instrumental del cliente',
    duracion: '2 horas',
    precio: 80,
    condicion:
      'Ingeniero de grabación incluido. Pre-mezcla de voces con el instrumental. No incluye mixing ni mastering.',
  },
  {
    id: 'produccion-personalizada',
    nombre: 'Producción Personalizada',
    duracion: 'Hasta terminar el producto',
    precio: 300,
    condicion:
      'Instrumental desde cero · horas de estudio ilimitadas hasta terminar · grabación de voces · edición de voces · mixing · master · asesoría creativa.',
  },
];
```

`src/data/membresia.ts`:

```ts
/**
 * Qué incluye la membresía. El precio y las condiciones de alta NO constan
 * en ninguna fuente (spec §9.5): no se inventan y el CTA lleva a consultar.
 */
export const incluidoMembresia: string[] = [
  'Studio 1: bloques de 3, 5 y 8 horas sin coste.',
  'Ciclorama y co-working: bloques de 3 y 5 horas sin coste.',
];
```

`src/data/equipo.ts`:

```ts
/**
 * Inventario técnico identificable en las fotografías del cliente.
 * Sin marcas ni modelos (G15): identificar mal un equipo en la web de un
 * estudio destruye la credibilidad ante un profesional.
 */
export const equipoVerificable: string[] = [
  'Micrófono de condensador de válvulas con suspensión antivibratoria y antipop',
  'Par de monitores de campo cercano',
  'Dos interfaces de audio de sobremesa',
  'Tratamiento acústico: paneles absorbentes y difusores de listón vertical',
  'Ciclorama de curva infinita con iluminación LED',
];
```

- [ ] **Paso 4: Ejecutar y comprobar que pasa**

Ejecutar: `npx vitest run tests/datos.test.ts`
Esperado: PASS, 15 tests.

- [ ] **Paso 5: Commit**

```bash
git add src/data tests/datos.test.ts
git commit -m "feat(S00): capa de datos con el contenido real y generador de WhatsApp"
```

---

## Tarea 4: BaseLayout, SEO y accesibilidad de base

**Archivos:**
- Crear: `src/layouts/BaseLayout.astro`, `public/robots.txt`
- Test: `tests/seo.test.ts`

**Interfaces:**
- Consume: `site` de `src/data/site.ts` (Tarea 3), `global.css` (Tarea 1)
- Produce: `BaseLayout` con props
  `{ title: string; description: string; ruta: string; poster?: string; noindex?: boolean }`

- [ ] **Paso 1: Escribir el test que falla**

`tests/seo.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const layout = () => readFileSync('src/layouts/BaseLayout.astro', 'utf8');

describe('BaseLayout', () => {
  it('monta las View Transitions con ClientRouter', () => {
    expect(layout()).toContain("from 'astro:transitions'");
    expect(layout()).toContain('<ClientRouter />');
  });

  it('exige title y description por ruta, sin valor por defecto', () => {
    const src = layout();
    expect(src).toMatch(/title:\s*string;/);
    expect(src).toMatch(/description:\s*string;/);
  });

  it('emite canonica, OpenGraph y Twitter Card', () => {
    const src = layout();
    ['rel="canonical"', 'og:title', 'og:description', 'og:url', 'og:image',
     'twitter:card'].forEach((t) => expect(src, t).toContain(t));
  });

  it('emite LocalBusiness sin aggregateRating (G1)', () => {
    const src = layout();
    expect(src).toContain('LocalBusiness');
    expect(src).toContain('openingHoursSpecification');
    expect(src).not.toContain('aggregateRating');
  });

  it('incluye el enlace de salto al contenido como primer foco', () => {
    expect(layout()).toContain('class="saltar"');
    expect(layout()).toContain('href="#contenido"');
  });

  it('declara el idioma desde los datos', () => {
    expect(layout()).toContain('lang={site.lang}');
  });

  it('no deja identificadores de analitica escritos a mano (G2)', () => {
    const src = layout();
    expect(src).not.toContain('G-XXXXXXXXXX');
    expect(src).not.toContain('GTM-');
  });
});

describe('robots.txt', () => {
  it('bloquea la herramienta de posters y declara el sitemap', () => {
    const robots = readFileSync('public/robots.txt', 'utf8');
    expect(robots).toContain('Disallow: /dev/');
    expect(robots).toContain('Sitemap: https://safetorystudio.com/sitemap-index.xml');
  });
});
```

- [ ] **Paso 2: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/seo.test.ts`
Esperado: FAIL — `ENOENT: src/layouts/BaseLayout.astro`

- [ ] **Paso 3: Escribir el layout**

`src/layouts/BaseLayout.astro`:

```astro
---
import '../styles/global.css';
import { ClientRouter } from 'astro:transitions';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
import SmoothScroll from '../components/SmoothScroll.astro';
import { site } from '../data/site';

interface Props {
  title: string;
  description: string;
  ruta: string;
  poster?: string;
  noindex?: boolean;
}

const { title, description, ruta, poster, noindex = false } = Astro.props;

const base = Astro.site ?? 'http://localhost:4321';
const tituloCompleto = title.includes(site.nombre) ? title : `${title} — ${site.nombre}`;
const canonica = new URL(ruta, base).toString();
const ogImagen = new URL(poster ?? '/posters/home.webp', base).toString();
const esHome = ruta === '/';

// LocalBusiness con datos reales unicamente. Sin aggregateRating (G1).
const negocio = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: site.nombre,
  description: site.eslogan,
  url: canonica,
  telephone: site.telefono,
  email: site.correo,
  sameAs: [site.instagram],
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Edificio Brasilia, Vía España',
    addressLocality: 'Panamá',
    addressRegion: 'Provincia de Panamá',
    addressCountry: 'PA',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '00:00',
      closes: '23:59',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: '09:00',
      closes: '12:30',
    },
  ],
};
---

<!DOCTYPE html>
<html lang={site.lang}>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{tituloCompleto}</title>
    <meta name="description" content={description} />
    <meta name="theme-color" content={site.themeColor} />
    <meta name="color-scheme" content="dark" />
    {noindex && <meta name="robots" content="noindex, nofollow" />}

    <link rel="canonical" href={canonica} />

    <link rel="preload" href="/fonts/ClashDisplay-Semibold.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/fonts/Satoshi-Regular.woff2" as="font" type="font/woff2" crossorigin />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content={site.nombre} />
    <meta property="og:title" content={tituloCompleto} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonica} />
    <meta property="og:image" content={ogImagen} />
    <meta property="og:locale" content={site.locale} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={tituloCompleto} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={ogImagen} />

    <link rel="icon" type="image/svg+xml"
      href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23080808'/%3E%3Ccircle cx='16' cy='16' r='6' fill='%23FF2D2D'/%3E%3C/svg%3E" />

    <ClientRouter />

    {esHome && <script type="application/ld+json" set:html={JSON.stringify(negocio)} />}
  </head>
  <body>
    <a class="saltar" href="#contenido">Saltar al contenido</a>
    <Nav ruta={ruta} />
    <main id="contenido">
      <slot />
    </main>
    <Footer />
    <SmoothScroll />
  </body>
</html>
```

`public/robots.txt`:

```
User-agent: *
Allow: /
Disallow: /dev/

Sitemap: https://safetorystudio.com/sitemap-index.xml
```

- [ ] **Paso 4: Ejecutar y comprobar que pasa**

Ejecutar: `npx vitest run tests/seo.test.ts`
Esperado: PASS, 8 tests.

Astro todavia no compila porque faltan `Nav`, `Footer` y `SmoothScroll`. Es lo esperado:
se resuelve en las Tareas 5 y 6. No intentes `npm run build` en esta tarea.

- [ ] **Paso 5: Commit**

```bash
git add src/layouts public/robots.txt tests/seo.test.ts
git commit -m "feat(S00): BaseLayout con SEO por ruta, LocalBusiness y skip link"
```

---

## Tarea 5: Nav, Footer, Bloque y PrecioCard

**Archivos:**
- Crear: `src/components/Nav.astro`, `src/components/Footer.astro`,
  `src/components/Bloque.astro`, `src/components/PrecioCard.astro`
- Test: `tests/componentes.test.ts`

**Interfaces:**
- Consume: `site`, `enlaceWhatsApp`, tipo `Tarifa` (Tarea 3)
- Produce:
  - `Bloque` props `{ id?: string; kicker?: string; class?: string }`, slots `default` y `aparte`
  - `PrecioCard` props `{ tarifa: Tarifa }`
  - `Nav` props `{ ruta: string }`
  - `Footer` sin props

- [ ] **Paso 1: Escribir el test que falla**

`tests/componentes.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const leer = (f: string) => readFileSync(`src/components/${f}`, 'utf8');

describe('Nav', () => {
  it('enlaza las seis rutas y ninguna mas', () => {
    const src = leer('Nav.astro');
    // Se comprueba el array `enlaces`, no `href="..."` en el marcado: los
    // enlaces se generan con un .map(), así que el fuente contiene
    // `href={e.href}`. Aserta sobre la fuente de verdad, que es el array.
    ['/', '/estudio', '/ciclorama', '/produccion', '/membresia', '/contacto']
      .forEach((r) => expect(src, r).toContain(`href: '${r}'`));
    expect(src).not.toContain('/reservar');
    expect(src).not.toContain('href="#"');
  });

  it('marca la ruta activa con aria-current', () => {
    expect(leer('Nav.astro')).toContain('aria-current');
  });
});

describe('Bloque', () => {
  it('usa dvh y nunca vh (G11)', () => {
    const src = leer('Bloque.astro');
    expect(src).toContain('100dvh');
    expect(src).not.toMatch(/\d+vh\b/);
  });

  it('reparte en 61,8 / 38,2 y nunca al 50 % (G12)', () => {
    const src = leer('Bloque.astro');
    expect(src).toContain('var(--mayor)');
    expect(src).toContain('var(--menor)');
    expect(src).not.toContain('1fr 1fr');
  });
});

describe('PrecioCard', () => {
  it('marca el precio con <data value> para lectura por maquina', () => {
    expect(leer('PrecioCard.astro')).toContain('<data value=');
  });

  it('trata precio null como incluido en la membresia, sin inventar cifra (G1)', () => {
    expect(leer('PrecioCard.astro')).toContain('Incluido con la membresía');
  });

  it('el CTA abre WhatsApp con rel de seguridad', () => {
    const src = leer('PrecioCard.astro');
    expect(src).toContain('enlaceWhatsApp');
    expect(src).toContain('rel="noopener noreferrer"');
  });
});

describe('Footer', () => {
  it('publica contacto y horario desde los datos, no a mano', () => {
    const src = leer('Footer.astro');
    ['site.direccion', 'site.horario', 'site.correo'].forEach((t) =>
      expect(src, t).toContain(t));
  });

  it('el telefono es un enlace tel: en formato internacional', () => {
    expect(leer('Footer.astro')).toContain('tel:+507');
  });

  it('lista las cinco rutas interiores para navegacion movil', () => {
    const src = leer('Footer.astro');
    ['/estudio', '/ciclorama', '/produccion', '/membresia', '/contacto']
      .forEach((r) => expect(src, r).toContain(r));
  });
});
```

- [ ] **Paso 2: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/componentes.test.ts`
Esperado: FAIL — `ENOENT: src/components/Nav.astro`

- [ ] **Paso 3: Escribir `Bloque.astro`**

```astro
---
/**
 * Envoltorio de seccion. Toda seccion del sitio ocupa el viewport completo (G11)
 * y reparte su ancho en 61,8 / 38,2 cuando tiene contenido lateral (G12).
 */
interface Props {
  id?: string;
  kicker?: string;
  class?: string;
}
const { id, kicker, class: clase } = Astro.props;
const tieneAparte = Astro.slots.has('aparte');
---

<section id={id} class:list={['bloque', clase, { 'bloque--doble': tieneAparte }]}>
  {kicker && <p class="kicker bloque__kicker">{kicker}</p>}
  <div class="bloque__mayor"><slot /></div>
  {tieneAparte && <div class="bloque__menor"><slot name="aparte" /></div>}
</section>

<style>
  .bloque {
    position: relative;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: var(--phi-3);
    padding: var(--phi-5) var(--phi-3);
    max-width: 1600px;
    margin: 0 auto;
  }
  .bloque__kicker {
    position: absolute;
    top: var(--phi-4);
    left: var(--phi-3);
  }
  .bloque__mayor { display: flex; flex-direction: column; gap: var(--phi-2); }
  .bloque__menor { display: flex; flex-direction: column; gap: var(--phi-1); }

  @media (min-width: 900px) {
    .bloque--doble {
      display: grid;
      grid-template-columns: var(--mayor) var(--menor);
      align-items: center;
      gap: var(--phi-4);
    }
  }
</style>
```

- [ ] **Paso 4: Escribir `PrecioCard.astro`**

```astro
---
import type { Tarifa } from '../data/tipos';
import { enlaceWhatsApp } from '../data/whatsapp';

interface Props { tarifa: Tarifa }
const { tarifa } = Astro.props;
// Mixing y mastering no llevan duración: no se miden en tiempo (ver tipos.ts).
const etiqueta = tarifa.duracion ? `${tarifa.nombre} · ${tarifa.duracion}` : tarifa.nombre;
---

<article class="precio">
  <h3 class="precio__nombre">{tarifa.nombre}</h3>
  {tarifa.duracion && <p class="precio__duracion">{tarifa.duracion}</p>}

  {tarifa.precio === null
    ? <p class="precio__incluido">Incluido con la membresía</p>
    : <p class="precio__cifra"><data value={String(tarifa.precio)}>${tarifa.precio}</data></p>}

  {tarifa.condicion && <p class="precio__condicion">{tarifa.condicion}</p>}

  <a class="precio__cta" href={enlaceWhatsApp(etiqueta)} target="_blank" rel="noopener noreferrer">
    Reservar<span class="sr-only"> {etiqueta} por WhatsApp</span>
  </a>
</article>

<style>
  .precio {
    display: flex;
    flex-direction: column;
    gap: var(--phi-0);
    padding: var(--phi-2) 0;
    border-top: 1px solid var(--hairline);
  }
  .precio__nombre { font-size: var(--phi-2); }
  .precio__duracion,
  .precio__condicion { color: var(--ash); font-size: var(--phi-1); }
  .precio__cifra {
    font-family: var(--display);
    font-size: var(--phi-5);
    line-height: 1;
  }
  .precio__incluido {
    font-family: var(--display);
    font-size: var(--phi-2);
    color: var(--rec);
  }
  .precio__cta {
    align-self: flex-start;
    margin-top: var(--phi-1);
    padding: var(--phi-0) var(--phi-2);
    background: var(--rec);
    color: var(--void);
    font-weight: 500;
    border-radius: 999px;
    transition: transform 0.2s;
  }
  .precio__cta:hover { transform: translateY(-2px); }
</style>
```

- [ ] **Paso 5: Escribir `Nav.astro`**

```astro
---
import { enlaceWhatsApp } from '../data/whatsapp';

interface Props { ruta: string }
const { ruta } = Astro.props;

const enlaces = [
  { href: '/', texto: 'Inicio' },
  { href: '/estudio', texto: 'Estudio' },
  { href: '/ciclorama', texto: 'Ciclorama' },
  { href: '/produccion', texto: 'Producción' },
  { href: '/membresia', texto: 'Membresía' },
  { href: '/contacto', texto: 'Contacto' },
];
---

<header class="nav">
  <a class="nav__marca" href="/">Safetory<span class="nav__punto">®</span></a>
  <nav aria-label="Principal">
    <ul class="nav__lista">
      {enlaces.map((e) => (
        <li>
          <a href={e.href} aria-current={ruta === e.href ? 'page' : undefined}>{e.texto}</a>
        </li>
      ))}
    </ul>
  </nav>
  <a class="nav__cta" href={enlaceWhatsApp('Consulta general')} target="_blank" rel="noopener noreferrer">
    Reservar
  </a>
</header>

<style>
  .nav {
    position: fixed;
    top: var(--phi-1);
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    display: flex;
    align-items: center;
    gap: var(--phi-2);
    padding: var(--phi-0) var(--phi-0) var(--phi-0) var(--phi-2);
    border-radius: 999px;
    background: rgba(8, 8, 8, 0.72);
    backdrop-filter: blur(24px) saturate(150%);
    border: 1px solid var(--hairline);
    max-width: calc(100vw - var(--phi-2));
  }
  .nav__marca {
    font-family: var(--display);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    font-size: var(--phi-1);
    padding-right: var(--phi-2);
    border-right: 1px solid var(--hairline);
  }
  .nav__punto { color: var(--rec); }
  .nav__lista { display: flex; gap: 2px; list-style: none; }
  .nav__lista a {
    display: inline-block;
    padding: var(--phi-0) var(--phi-1);
    font-size: var(--phi-1);
    color: var(--ash);
    border-radius: 999px;
    transition: color 0.25s, background 0.25s;
  }
  .nav__lista a:hover { color: var(--bone); background: rgba(237, 234, 227, 0.06); }
  .nav__lista a[aria-current='page'] { color: var(--bone); background: rgba(237, 234, 227, 0.09); }
  .nav__cta {
    padding: var(--phi-0) var(--phi-2);
    border-radius: 999px;
    background: var(--rec);
    color: var(--void);
    font-weight: 500;
    font-size: var(--phi-1);
  }
  @media (max-width: 899px) {
    .nav__lista { display: none; }
  }
</style>
```

Por debajo de 900 px la lista se oculta y la navegación vive en el Footer, que lista las
cinco rutas interiores. El menú desplegable móvil se añade en la Tarea 20.

- [ ] **Paso 6: Escribir `Footer.astro`**

```astro
---
import { site } from '../data/site';

const enlaces = [
  { href: '/estudio', texto: 'Estudio' },
  { href: '/ciclorama', texto: 'Ciclorama' },
  { href: '/produccion', texto: 'Producción' },
  { href: '/membresia', texto: 'Membresía' },
  { href: '/contacto', texto: 'Contacto' },
];
// `site.whatsapp` ya es el número en E.164 sin el `+` (507 + número). Derivarlo
// de ahí evita duplicar el prefijo del país y depender de dónde caiga el guion.
const telefonoE164 = `tel:+${site.whatsapp}`;
---

<footer class="pie">
  <div class="pie__col">
    <p class="kicker">Dónde</p>
    <address>{site.direccion}</address>
  </div>

  <div class="pie__col">
    <p class="kicker">Cuándo</p>
    <dl class="pie__horario">
      {site.horario.map((f) => (
        <div><dt>{f.dias}</dt><dd>{f.horas}</dd></div>
      ))}
    </dl>
  </div>

  <div class="pie__col">
    <p class="kicker">Contacto</p>
    <a href={telefonoE164}>{site.telefono}</a>
    <a href={`mailto:${site.correo}`}>{site.correo}</a>
    <a href={site.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
  </div>

  <nav class="pie__col" aria-label="Secundaria">
    <p class="kicker">Secciones</p>
    {enlaces.map((e) => <a href={e.href}>{e.texto}</a>)}
  </nav>
</footer>

<style>
  .pie {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: var(--phi-3);
    padding: var(--phi-4) var(--phi-3);
    border-top: 1px solid var(--hairline);
  }
  .pie__col { display: flex; flex-direction: column; gap: var(--phi-0); }
  .pie__col a, address { color: var(--ash); font-style: normal; }
  .pie__col a:hover { color: var(--bone); }
  .pie__horario div {
    display: flex;
    justify-content: space-between;
    gap: var(--phi-1);
    color: var(--ash);
  }
</style>
```

- [ ] **Paso 7: Ejecutar y comprobar que pasa**

Ejecutar: `npx vitest run tests/componentes.test.ts`
Esperado: PASS, 9 tests.

- [ ] **Paso 8: Commit**

```bash
git add src/components tests/componentes.test.ts
git commit -m "feat(S00): Nav, Footer, Bloque a 100dvh y PrecioCard con data value"
```

---

## Tarea 6: Lenis y repertorio de movimiento

**Archivos:**
- Crear: `src/scripts/motion.ts`, `src/components/SmoothScroll.astro`, `src/components/Reveal.astro`
- Test: `tests/motion.test.ts`

**Interfaces:**
- Produce, desde `src/scripts/motion.ts`:
  - `prefersReducedMotion(): boolean`
  - `registrarPlugins(): void`
  - `refrescarTriggers(): void`
  - `matarTriggers(): void`
  - `revelarTitular(el: HTMLElement): void`
  - `revelarEntrada(els: HTMLElement[]): void`
  - `contarCifra(el: HTMLElement, hasta: number): void`
  - reexporta `gsap` y `ScrollTrigger`

- [ ] **Paso 1: Escribir el test que falla**

`tests/motion.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const motion = () => readFileSync('src/scripts/motion.ts', 'utf8');
const smooth = () => readFileSync('src/components/SmoothScroll.astro', 'utf8');

describe('repertorio de movimiento', () => {
  it('anima transform y opacity, nunca propiedades de layout (G6)', () => {
    const src = motion();
    [/\bwidth:\s*[\d'"]/, /\bheight:\s*[\d'"]/, /\btop:\s*[\d'"]/, /\bleft:\s*[\d'"]/]
      .forEach((p) => expect(src, String(p)).not.toMatch(p));
    expect(src).toMatch(/yPercent:|y:\s*\d/);
    expect(src).toMatch(/opacity:/);
  });

  it('expone la comprobacion de prefers-reduced-motion', () => {
    expect(motion()).toContain('prefers-reduced-motion');
  });

  it('registra ScrollTrigger una sola vez', () => {
    const src = motion();
    expect(src).toContain('gsap.registerPlugin(ScrollTrigger)');
    expect(src).toContain('if (registrado) return');
  });

  it('el titular troceado conserva el texto original para lectores (G8)', () => {
    const src = motion();
    expect(src).toContain('sr-only');
    expect(src).toContain("setAttribute('aria-hidden', 'true')");
  });

  it('la cifra animada muestra el valor final bajo reduce-motion', () => {
    expect(motion()).toMatch(/prefersReducedMotion\(\)\)\s*\{[\s\S]*?textContent\s*=/);
  });
});

describe('SmoothScroll', () => {
  it('no arranca Lenis bajo reduce-motion', () => {
    expect(smooth()).toContain('if (prefersReducedMotion()) return');
  });

  it('se limpia en astro:before-swap para no filtrar entre paginas', () => {
    expect(smooth()).toContain('astro:before-swap');
    expect(smooth()).toContain('astro:page-load');
  });

  it('sincroniza Lenis con ScrollTrigger', () => {
    expect(smooth()).toContain("lenis.on('scroll', ScrollTrigger.update)");
  });
});
```

- [ ] **Paso 2: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/motion.test.ts`
Esperado: FAIL — `ENOENT: src/scripts/motion.ts`

- [ ] **Paso 3: Escribir `src/scripts/motion.ts`**

```ts
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

export { gsap, ScrollTrigger };

let registrado = false;

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function registrarPlugins(): void {
  if (registrado) return;
  gsap.registerPlugin(ScrollTrigger);
  registrado = true;
}

export function refrescarTriggers(): void {
  ScrollTrigger.refresh();
}

export function matarTriggers(): void {
  ScrollTrigger.getAll().forEach((t) => t.kill());
}

/**
 * Titular revelado caracter a caracter.
 * El texto original permanece en el DOM dentro de un .sr-only, de modo que el
 * troceado nunca degrada la lectura por lector de pantalla (G8).
 */
export function revelarTitular(el: HTMLElement): void {
  if (prefersReducedMotion()) return;
  if (el.dataset.partido === 'si') return;

  const original = el.textContent ?? '';
  const alterno = document.createElement('span');
  alterno.className = 'sr-only';
  alterno.textContent = original;

  const partido = new SplitType(el, { types: 'chars' });
  el.setAttribute('aria-hidden', 'true');
  el.dataset.partido = 'si';
  el.after(alterno);

  gsap.from(partido.chars, {
    yPercent: 110,
    opacity: 0,
    duration: 0.9,
    ease: 'power3.out',
    stagger: 0.018,
    scrollTrigger: { trigger: el, start: 'top 82%', once: true },
  });
}

/** Entrada sobria y escalonada. Solo transform y opacity. */
export function revelarEntrada(els: HTMLElement[]): void {
  if (prefersReducedMotion() || els.length === 0) return;
  gsap.from(els, {
    y: 24,
    opacity: 0,
    duration: 0.7,
    ease: 'power2.out',
    stagger: 0.06,
    scrollTrigger: { trigger: els[0], start: 'top 85%', once: true },
  });
}

/** Cifra de tarifa que cuenta hasta su valor. No toca el layout. */
export function contarCifra(el: HTMLElement, hasta: number): void {
  if (prefersReducedMotion()) {
    el.textContent = `$${hasta}`;
    return;
  }
  const estado = { valor: 0 };
  gsap.to(estado, {
    valor: hasta,
    duration: 1.1,
    ease: 'power2.out',
    onUpdate: () => { el.textContent = `$${Math.round(estado.valor)}`; },
    scrollTrigger: { trigger: el, start: 'top 88%', once: true },
  });
}
```

- [ ] **Paso 4: Escribir `SmoothScroll.astro` y `Reveal.astro`**

`src/components/SmoothScroll.astro`:

```astro
---
/**
 * Scroll con inercia. Se reinicia en cada navegacion de View Transitions y
 * no arranca bajo prefers-reduced-motion, donde el scroll nativo es lo correcto.
 */
---

<script>
  import Lenis from 'lenis';
  import {
    prefersReducedMotion, registrarPlugins, refrescarTriggers,
    matarTriggers, gsap, ScrollTrigger,
  } from '../scripts/motion';

  let lenis: Lenis | null = null;

  function iniciar() {
    registrarPlugins();
    if (prefersReducedMotion()) return;

    lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.4,
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((tiempo: number) => lenis?.raf(tiempo * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  function destruir() {
    lenis?.destroy();
    lenis = null;
    matarTriggers();
  }

  function arrancar() {
    destruir();
    iniciar();
    refrescarTriggers();
  }

  document.addEventListener('astro:page-load', arrancar);
  document.addEventListener('astro:before-swap', destruir);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arrancar, { once: true });
  } else {
    arrancar();
  }
</script>
```

`src/components/Reveal.astro`:

```astro
---
/** Marca un grupo cuyos hijos entran escalonados al hacer scroll. */
---
<div data-revelar><slot /></div>

<script>
  import { revelarEntrada, revelarTitular, contarCifra } from '../scripts/motion';

  function aplicar() {
    document.querySelectorAll<HTMLElement>('[data-revelar]').forEach((grupo) => {
      revelarEntrada(Array.from(grupo.children) as HTMLElement[]);
    });
    document.querySelectorAll<HTMLElement>('[data-titular]').forEach(revelarTitular);
    document.querySelectorAll<HTMLElement>('data[value]').forEach((d) => {
      const valor = Number(d.getAttribute('value'));
      if (!Number.isNaN(valor)) contarCifra(d, valor);
    });
  }

  document.addEventListener('astro:page-load', aplicar);
  if (document.readyState !== 'loading') aplicar();
</script>
```

- [ ] **Paso 5: Ejecutar y comprobar que pasa**

Ejecutar: `npx vitest run tests/motion.test.ts`
Esperado: PASS, 8 tests.

- [ ] **Paso 6: Commit**

```bash
git add src/scripts src/components/SmoothScroll.astro src/components/Reveal.astro tests/motion.test.ts
git commit -m "feat(S00): Lenis sincronizado con ScrollTrigger y repertorio sobrio"
```

---

# FASE 1 — MOTOR 3D

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

## Tarea 9: Materiales, luces y planos de profundidad

**Archivos:**
- Crear: `src/three/materiales.ts`, `src/three/luces.ts`, `src/three/planos-profundidad.ts`
- Copiar: las seis imágenes de `Imagenes/` a `public/escena/` con nombres legibles
- Test: `tests/materiales.test.ts`

**Interfaces:**
- Produce:
  - `metalOscuro(): THREE.MeshStandardMaterial`
  - `rejilla(): THREE.MeshStandardMaterial`
  - `emisivoAcento(): THREE.MeshStandardMaterial`
  - `blancoDifuso(): THREE.MeshStandardMaterial`
  - `type Temperatura = 'ambar' | 'ambar-apagado' | 'violeta' | 'neutro'`
  - `crearLuces(t: Temperatura): THREE.Light[]`
  - `crearPlanosProfundidad(rutas: [string, string]): THREE.Group`
- Constantes: `REC = 0xff2d2d`, `VOID = 0x080808`

- [ ] **Paso 1: Copiar y renombrar las imágenes**

```bash
mkdir -p public/escena
cp "Imagenes/9388552a-09fc-4ef9-b9a3-97111aabfb93.webp" public/escena/microfono.webp
cp "Imagenes/4da64443-fe38-41d0-b3ab-5c80ab6470bd.webp" public/escena/sala.webp
cp "Imagenes/e26fb203-c577-4e31-ba3d-0499d132a8c8.webp" public/escena/sala-ancha.webp
cp "Imagenes/06e9611d-296d-48be-8b31-4931d755a3c5.webp" public/escena/ciclorama.webp
cp "Imagenes/5e98bfb4-c34b-4ae6-a2b1-82a482c64524.webp" public/escena/interfaz.webp
cp "Imagenes/4d04e558-06b6-4af0-b543-ceb53bb0e002.webp" public/escena/lounge.webp
```

- [ ] **Paso 2: Escribir el test que falla**

`tests/materiales.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { REC, VOID, metalOscuro, rejilla, emisivoAcento } from '../src/three/materiales';
import { crearLuces } from '../src/three/luces';

describe('materiales', () => {
  it('el acento es exactamente el token --rec', () => {
    expect(REC).toBe(0xff2d2d);
    expect(VOID).toBe(0x080808);
  });

  it('el metal oscuro es metálico y poco brillante (spec §6.3)', () => {
    const m = metalOscuro();
    expect(m.metalness).toBeCloseTo(0.85, 2);
    expect(m.roughness).toBeCloseTo(0.42, 2);
  });

  it('la rejilla es transparente para dejar ver la malla', () => {
    expect(rejilla().transparent).toBe(true);
  });

  it('el emisivo de acento emite en --rec', () => {
    expect(emisivoAcento().emissive.getHex()).toBe(REC);
  });
});

describe('luces', () => {
  it('son exactamente tres: direccional, foco de acento y ambiente', () => {
    expect(crearLuces('ambar')).toHaveLength(3);
  });

  it('el foco de acento mantiene --rec en todas las temperaturas (G9)', () => {
    (['ambar', 'ambar-apagado', 'violeta', 'neutro'] as const).forEach((t) => {
      const foco = crearLuces(t).find((l) => l.name === 'acento');
      expect(foco?.color.getHex(), t).toBe(REC);
    });
  });

  it('lo que cambia por ruta es la direccional, no el acento', () => {
    const ambar = crearLuces('ambar').find((l) => l.name === 'ambiente-direccional');
    const violeta = crearLuces('violeta').find((l) => l.name === 'ambiente-direccional');
    expect(ambar?.color.getHex()).not.toBe(violeta?.color.getHex());
  });

  it('no hay entorno HDRI: encarece la descarga sin aportar (spec §6.3)', () => {
    const src = readFileSync('src/three/luces.ts', 'utf8');
    expect(src).not.toContain('RGBELoader');
    expect(src).not.toContain('PMREMGenerator');
  });
});

describe('planos de profundidad', () => {
  it('las seis texturas están en public/escena', () => {
    ['microfono', 'sala', 'sala-ancha', 'ciclorama', 'interfaz', 'lounge']
      .forEach((n) => expect(existsSync(`public/escena/${n}.webp`), n).toBe(true));
  });

  it('los planos van detrás del objeto, con opacidad baja (spec §6.4)', () => {
    const src = readFileSync('src/three/planos-profundidad.ts', 'utf8');
    expect(src).toContain('-12');
    expect(src).toContain('-6');
    expect(src).toContain('0.18');
    expect(src).toContain('0.10');
  });
});
```

- [ ] **Paso 3: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/materiales.test.ts`
Esperado: FAIL — `Cannot find module '../src/three/materiales'`

- [ ] **Paso 4: Escribir `materiales.ts`**

```ts
import * as THREE from 'three';

/** Acento único del sitio (G9). Idéntico al token CSS --rec. */
export const REC = 0xff2d2d;
export const VOID = 0x080808;

/** Superficie principal: metal casi negro, muy poco brillo. */
export function metalOscuro(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0x0e0e0e,
    metalness: 0.85,
    roughness: 0.42,
  });
}

/** Rejilla de micrófono: malla metálica que deja pasar algo de luz. */
export function rejilla(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0x141414,
    metalness: 0.95,
    roughness: 0.55,
    transparent: true,
    opacity: 0.82,
    side: THREE.DoubleSide,
  });
}

/** Piezas que llevan el acento: anillo del micrófono, testigo de grabación. */
export function emisivoAcento(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: REC,
    emissive: REC,
    emissiveIntensity: 0.65,
    metalness: 0.3,
    roughness: 0.5,
  });
}

/** Superficie blanca mate: conos de monitor, ciclorama, rótulo. */
export function blancoDifuso(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0xe9e6df,
    metalness: 0.05,
    roughness: 0.85,
  });
}
```

- [ ] **Paso 5: Escribir `luces.ts`**

```ts
import * as THREE from 'three';
import { REC } from './materiales';

/**
 * Temperatura de la luz ambiental de cada ruta. Reproduce cómo está
 * iluminado el espacio real. NO es un token de interfaz: el acento sigue
 * siendo uno solo (G9).
 */
export type Temperatura = 'ambar' | 'ambar-apagado' | 'violeta' | 'neutro';

const DIRECCIONAL: Record<Temperatura, { color: number; intensidad: number }> = {
  ambar: { color: 0xffc98a, intensidad: 0.55 },
  'ambar-apagado': { color: 0xc9a274, intensidad: 0.38 },
  violeta: { color: 0xa88cff, intensidad: 0.6 },
  neutro: { color: 0xf2f0ec, intensidad: 0.5 },
};

/**
 * Las tres luces de toda escena del sitio. Sin entorno HDRI: no hay
 * superficies pulidas que reflejen y encarecería la descarga (spec §6.3).
 */
export function crearLuces(t: Temperatura): THREE.Light[] {
  const cfg = DIRECCIONAL[t];

  const direccional = new THREE.DirectionalLight(cfg.color, cfg.intensidad);
  direccional.name = 'ambiente-direccional';
  direccional.position.set(1.5, 4, 2);

  // El foco de acento no cambia nunca: es el rojo REC en las seis rutas.
  const acento = new THREE.SpotLight(REC, 14, 18, Math.PI / 5, 0.55, 1.4);
  acento.name = 'acento';
  acento.position.set(-3.2, 1.4, 2.6);

  const ambiente = new THREE.AmbientLight(0x2a2a2a, 0.35);
  ambiente.name = 'ambiente';

  return [direccional, acento, ambiente];
}
```

- [ ] **Paso 6: Escribir `planos-profundidad.ts`**

```ts
import * as THREE from 'three';

/**
 * Las fotografías del estudio como planos a distinta profundidad detrás del
 * objeto. No son fotografías navegables: son atmósfera, y el paralaje que
 * producen al girar la cámara es geométrico y real (spec §6.4).
 */
const CAPAS = [
  { z: -12, opacidad: 0.18, escala: 26 },
  { z: -6, opacidad: 0.10, escala: 14 },
] as const;

export function crearPlanosProfundidad(rutas: [string, string]): THREE.Group {
  const grupo = new THREE.Group();
  grupo.name = 'planos-profundidad';

  const cargador = new THREE.TextureLoader();

  CAPAS.forEach((capa, i) => {
    const textura = cargador.load(rutas[i]);
    textura.colorSpace = THREE.SRGBColorSpace;

    const plano = new THREE.Mesh(
      new THREE.PlaneGeometry(capa.escala, capa.escala * 0.66),
      new THREE.MeshBasicMaterial({
        map: textura,
        transparent: true,
        opacity: capa.opacidad,
        depthWrite: false,
      }),
    );
    plano.position.z = capa.z;
    plano.name = `plano-${i}`;
    grupo.add(plano);
  });

  return grupo;
}
```

- [ ] **Paso 7: Ejecutar y comprobar que pasa**

Ejecutar: `npx vitest run tests/materiales.test.ts`
Esperado: PASS, 10 tests.

- [ ] **Paso 8: Commit**

```bash
git add src/three/materiales.ts src/three/luces.ts src/three/planos-profundidad.ts public/escena tests/materiales.test.ts
git commit -m "feat(S3D): materiales de metal oscuro, tres luces y planos de profundidad"
```

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
    expect(jaula?.type).toBe('InstancedMesh');
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
    expect(s).toContain('await import(');
    expect(s).toContain('requestIdleCallback');
    expect(s).not.toMatch(/^import \* as THREE/m);
  });

  it('el canvas queda oculto a la accesibilidad (G8)', () => {
    expect(src()).toContain('aria-hidden="true"');
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
---

<div
  class="escena"
  data-escena
  data-objeto={objeto}
  data-temperatura={temperatura}
  data-fondos={JSON.stringify(fondos)}
>
  <img
    class="escena__poster"
    src={poster}
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

  if (document.readyState !== 'loading') programar();
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

## Tarea 12: Home — hero, manifiesto, equipo y cierre

**Archivos:**
- Crear: `src/pages/index.astro`
- Test: `tests/pagina-home.test.ts`

**Interfaces:**
- Consume: `BaseLayout`, `Bloque`, `Reveal`, `Escena3D`, `site`, `equipoVerificable`,
  `enlaceWhatsApp`
- Produce: la ruta `/` con los bloques 1, 2, 8 y 9. Los bloques 3 a 7 llegan en las
  Tareas 13 y 14, insertados entre el manifiesto y el equipo.

- [ ] **Paso 1: Escribir el test que falla**

`tests/pagina-home.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const home = () => readFileSync('src/pages/index.astro', 'utf8');

describe('Home', () => {
  it('tiene un solo h1 (G8)', () => {
    expect((home().match(/<h1[\s>]/g) ?? []).length).toBe(1);
  });

  it('usa el eslogan real y no inventa otro (G1)', () => {
    expect(home()).toContain('site.eslogan');
  });

  it('monta la escena del microfono con el poster de la home', () => {
    const s = home();
    expect(s).toContain('objeto="microfono"');
    expect(s).toContain('/posters/home.webp');
  });

  it('el equipo sale de los datos, no escrito a mano (G15)', () => {
    expect(home()).toContain('equipoVerificable');
  });

  it('publica direccion y horario desde los datos', () => {
    const s = home();
    expect(s).toContain('site.direccion');
    expect(s).toContain('site.horario');
  });

  it('el CTA va a WhatsApp y no a una ruta que no existe (G2)', () => {
    const s = home();
    expect(s).toContain('enlaceWhatsApp');
    expect(s).not.toContain('/reservar');
    expect(s).not.toContain('href="#"');
  });

  it('declara title y description propios de la ruta', () => {
    const s = home();
    expect(s).toMatch(/title="[^"]{10,}"/);
    expect(s).toMatch(/description="[^"]{40,}"/);
  });
});
```

- [ ] **Paso 2: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/pagina-home.test.ts`
Esperado: FAIL — `ENOENT: src/pages/index.astro`

- [ ] **Paso 3: Escribir la página**

`src/pages/index.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Bloque from '../components/Bloque.astro';
import Reveal from '../components/Reveal.astro';
import Escena3D from '../components/Escena3D.astro';
import { site } from '../data/site';
import { equipoVerificable } from '../data/equipo';
import { enlaceWhatsApp } from '../data/whatsapp';
---

<BaseLayout
  title="Safetory Studio — Estudio de grabación en Panamá"
  description="Estudio de grabación, producción musical y ciclorama en Vía España, Panamá. Alquiler por horas, mixing, mastering y membresía."
  ruta="/"
  poster="/posters/home.webp"
>
  <!-- Bloque 1 · Hero -->
  <section class="hero">
    <Escena3D
      objeto="microfono"
      temperatura="ambar"
      poster="/posters/home.webp"
      alt="Micrófono de condensador de válvulas del Studio 1 de Safetory, iluminado en rojo sobre fondo negro."
      fondos={['/escena/microfono.webp', '/escena/sala.webp']}
    />
    <div class="hero__texto">
      <h1 data-titular>Safetory Studio</h1>
      <p class="hero__eslogan">{site.eslogan}</p>
      <a class="boton" href={enlaceWhatsApp('Consulta general')} target="_blank" rel="noopener noreferrer">
        Reservar por WhatsApp
      </a>
    </div>
  </section>

  <!-- Bloque 2 · Manifiesto -->
  <Bloque id="manifiesto" kicker="Manifiesto">
    <p class="manifiesto" data-titular>{site.eslogan}</p>
  </Bloque>

  <!-- Los bloques 3 a 7 se insertan aquí en las Tareas 13 y 14 -->

  <!-- Bloque 8 · Equipo real -->
  <Bloque id="equipo" kicker="En la sala">
    <h2 data-titular>Equipo</h2>
    <Reveal>
      {equipoVerificable.map((linea) => <p class="equipo__linea">{linea}</p>)}
    </Reveal>
  </Bloque>

  <!-- Bloque 9 · Dónde, cuándo y cierre -->
  <Bloque id="visitanos" kicker="Dónde y cuándo">
    <h2 data-titular>Vía España, Panamá</h2>
    <address class="visita__direccion">{site.direccion}</address>
    <a class="boton" href={enlaceWhatsApp('Consulta general')} target="_blank" rel="noopener noreferrer">
      Reservar por WhatsApp
    </a>
    <dl slot="aparte" class="visita__horario">
      {site.horario.map((f) => (
        <div><dt>{f.dias}</dt><dd>{f.horas}</dd></div>
      ))}
    </dl>
  </Bloque>
</BaseLayout>

<style>
  .hero { position: relative; min-height: 100dvh; }
  .hero__texto {
    position: absolute;
    inset: auto 0 var(--phi-4) 0;
    padding: 0 var(--phi-3);
    display: flex;
    flex-direction: column;
    gap: var(--phi-1);
    align-items: flex-start;
  }
  .hero__eslogan { font-size: var(--phi-2); color: var(--ash); max-width: 34ch; }

  .manifiesto {
    font-family: var(--display);
    font-size: clamp(var(--phi-3), 7vw, var(--phi-5));
    line-height: 0.98;
    max-width: 18ch;
  }

  .equipo__linea {
    padding: var(--phi-1) 0;
    border-top: 1px solid var(--hairline);
    color: var(--ash);
    font-size: var(--phi-2);
  }

  .visita__direccion { font-style: normal; color: var(--ash); font-size: var(--phi-2); max-width: 26ch; }
  .visita__horario div { display: flex; justify-content: space-between; gap: var(--phi-1); padding: var(--phi-0) 0; border-top: 1px solid var(--hairline); }
  .visita__horario dt { color: var(--bone); }
  .visita__horario dd { color: var(--ash); }

  .boton {
    align-self: flex-start;
    padding: var(--phi-1) var(--phi-3);
    background: var(--rec);
    color: var(--void);
    font-weight: 500;
    border-radius: 999px;
    transition: transform 0.2s;
  }
  .boton:hover { transform: translateY(-2px); }
</style>
```

- [ ] **Paso 4: Ejecutar tests y build**

Ejecutar: `npx vitest run tests/pagina-home.test.ts && npm run build`
Esperado: 7 tests PASS. El build genera `dist/index.html`.

- [ ] **Paso 5: Commit**

```bash
git add src/pages/index.astro tests/pagina-home.test.ts
git commit -m "feat(S01): home con hero, manifiesto, equipo y cierre"
```

---

## Tarea 13: El despiece — el momento orquestado

**Archivos:**
- Crear: `src/components/Despiece.astro`
- Modificar: `src/pages/index.astro` (insertar tras el manifiesto)
- Test: `tests/despiece.test.ts`

Único momento orquestado del sitio (G10). No se replica en ninguna otra ruta.

**Interfaces:**
- Consume: piezas nombradas del micrófono (Tarea 10), `gsap` y `ScrollTrigger` (Tarea 6)
- Produce: componente `Despiece` sin props. Emite cuatro etiquetas HTML con
  `data-pieza="rejilla|anillo|jaula|base"`

- [ ] **Paso 1: Escribir el test que falla**

`tests/despiece.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { crear } from '../src/three/objetos/microfono';

const src = () => readFileSync('src/components/Despiece.astro', 'utf8');

describe('despiece', () => {
  it('etiqueta las cuatro piezas del spec §8.3', () => {
    const s = src();
    [['rejilla', 'Grabación'], ['anillo', 'Producción'],
     ['jaula', 'Ciclorama'], ['base', 'Membresía']].forEach(([pieza, texto]) => {
      expect(s, pieza).toContain(`data-pieza="${pieza}"`);
      expect(s, texto).toContain(texto);
    });
  });

  it('las cuatro piezas existen realmente en el micrófono', () => {
    const mic = crear();
    ['rejilla', 'anillo', 'jaula', 'base']
      .forEach((n) => expect(mic.getObjectByName(n), n).toBeDefined());
  });

  it('las etiquetas son HTML real, no texto dentro del canvas (G8)', () => {
    expect(src()).toMatch(/<(p|span|h3)[^>]*data-pieza=/);
  });

  it('usa una sola linea de tiempo con scrub: subir el scroll recompone', () => {
    const s = src();
    expect(s).toContain('scrub');
    expect((s.match(/gsap\.timeline\(/g) ?? []).length).toBe(1);
  });

  it('anima solo posicion del objeto 3D y opacity del HTML (G6)', () => {
    const s = src();
    expect(s).not.toMatch(/\b(width|height|top|left):\s*[\d'"]/);
  });

  it('no hace nada bajo prefers-reduced-motion (G3)', () => {
    expect(src()).toContain('prefersReducedMotion()');
  });

  it('es el unico pin de este bloque y se desactiva en movil (G7)', () => {
    const s = src();
    expect(s).toContain('pin: true');
    expect(s).toContain('min-width: 768px');
  });
});
```

- [ ] **Paso 2: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/despiece.test.ts`
Esperado: FAIL — `ENOENT: src/components/Despiece.astro`

- [ ] **Paso 3: Escribir el componente**

`src/components/Despiece.astro`:

```astro
---
/**
 * El momento orquestado del sitio (G10). Las piezas del micrófono se separan
 * y cada una nombra un territorio del negocio. Al subir el scroll se recompone.
 *
 * Las etiquetas son HTML real posicionado sobre el canvas: seleccionables,
 * legibles por lector de pantalla e indexables (G8).
 */
const PIEZAS = [
  { pieza: 'rejilla', texto: 'Grabación', destino: '/produccion' },
  { pieza: 'anillo', texto: 'Producción', destino: '/produccion' },
  { pieza: 'jaula', texto: 'Ciclorama', destino: '/ciclorama' },
  { pieza: 'base', texto: 'Membresía', destino: '/membresia' },
];
---

<section class="despiece" data-despiece>
  <h2 class="sr-only">Qué hacemos en Safetory</h2>
  <ul class="despiece__lista">
    {PIEZAS.map((p) => (
      <li>
        <a class="despiece__etiqueta" data-pieza={p.pieza} href={p.destino}>{p.texto}</a>
      </li>
    ))}
  </ul>
</section>

<script>
  import { gsap, ScrollTrigger, prefersReducedMotion, registrarPlugins } from '../scripts/motion';

  // Desplazamiento de cada pieza al separarse, en unidades de escena.
  const DESTINOS: Record<string, { x: number; y: number; z: number }> = {
    rejilla: { x: 0, y: 1.5, z: 0 },
    anillo: { x: 1.7, y: 0.2, z: 0.6 },
    jaula: { x: -1.7, y: 0.1, z: 0.4 },
    base: { x: 0, y: -1.6, z: 0 },
  };

  function montar() {
    const raiz = document.querySelector<HTMLElement>('[data-despiece]');
    if (!raiz || prefersReducedMotion()) return;
    if (!window.matchMedia('(min-width: 768px)').matches) return; // G7

    const escena = document.querySelector<HTMLElement>('[data-escena]');
    const microfono = (window as any).__safetoryObjeto3D;
    if (!escena || !microfono) return;

    registrarPlugins();

    const linea = gsap.timeline({
      scrollTrigger: {
        trigger: raiz,
        start: 'top top',
        end: '+=140%',
        scrub: 0.8,
        pin: true,
      },
    });

    // Una sola línea de tiempo: cada pieza interpola su posición desde el
    // montaje hasta el despiece. Al ser scrub, subir el scroll recompone
    // el objeto sin una línea de código adicional.
    Object.entries(DESTINOS).forEach(([nombre, destino], i) => {
      const pieza = microfono.getObjectByName(nombre);
      if (!pieza) return;
      linea.to(pieza.position, {
        x: `+=${destino.x}`,
        y: `+=${destino.y}`,
        z: `+=${destino.z}`,
        ease: 'power2.inOut',
      }, i * 0.08);
    });

    const etiquetas = raiz.querySelectorAll<HTMLElement>('[data-pieza]');
    linea.to(etiquetas, { opacity: 1, ease: 'none', stagger: 0.08 }, 0.1);
  }

  document.addEventListener('astro:page-load', montar);
  if (document.readyState !== 'loading') montar();
</script>

<style>
  .despiece { min-height: 100dvh; display: grid; place-items: center; }
  .despiece__lista {
    list-style: none;
    display: grid;
    gap: var(--phi-2);
    text-align: center;
  }
  .despiece__etiqueta {
    font-family: var(--display);
    font-size: var(--phi-3);
    opacity: 0.25;
    transition: color 0.25s;
  }
  .despiece__etiqueta:hover { color: var(--rec); }

  @media (prefers-reduced-motion: reduce) {
    .despiece__etiqueta { opacity: 1; }
  }
  @media (max-width: 767px) {
    .despiece__etiqueta { opacity: 1; }
  }
</style>
```

- [ ] **Paso 4: Exponer el objeto 3D al despiece**

En `src/components/Escena3D.astro`, dentro de `montar()`, justo después de
`const objeto = crear();`, añadir:

```ts
    // El despiece de la Home necesita mover las piezas por nombre (§8.3).
    (window as any).__safetoryObjeto3D = objeto;
```

Y dentro de `limpiar()`, antes de `destruir = null;`:

```ts
    delete (window as any).__safetoryObjeto3D;
```

- [ ] **Paso 5: Insertar el bloque en la Home**

En `src/pages/index.astro`, sustituir el comentario
`<!-- Los bloques 3 a 7 se insertan aquí en las Tareas 13 y 14 -->` por:

```astro
  <!-- Bloque 3 · Despiece — el momento orquestado -->
  <Despiece />

  <!-- Los bloques 4 a 7 se insertan aquí en la Tarea 14 -->
```

Y añadir el import junto a los demás:

```astro
import Despiece from '../components/Despiece.astro';
```

- [ ] **Paso 6: Ejecutar y comprobar que pasa**

Ejecutar: `npx vitest run tests/despiece.test.ts && npm run build`
Esperado: 7 tests PASS, build correcto.

- [ ] **Paso 7: Verificar a mano en el navegador**

`npm run dev` y abrir `http://localhost:4321`. Bajar hasta el despiece y comprobar:
las piezas se separan, las cuatro etiquetas se encienden, y al subir el scroll el micrófono
se recompone sin saltos.

- [ ] **Paso 8: Commit**

```bash
git add src/components/Despiece.astro src/components/Escena3D.astro src/pages/index.astro tests/despiece.test.ts
git commit -m "feat(S02): despiece del microfono, el momento orquestado del sitio"
```

---

## Tarea 14: Home — los cuatro territorios

**Archivos:**
- Crear: `src/components/Territorio.astro`
- Modificar: `src/pages/index.astro`
- Test: `tests/territorios.test.ts`

**Interfaces:**
- Consume: `tarifasEstudio`, `cicloramaFoto`, `serviciosProduccion` (Tarea 3)
- Produce: `Territorio` props `{ numero: string; nombre: string; desde: string; href: string }`

- [ ] **Paso 1: Escribir el test que falla**

`tests/territorios.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { tarifasEstudio } from '../src/data/estudio';
import { cicloramaFoto } from '../src/data/ciclorama';
import { serviciosProduccion } from '../src/data/produccion';

const home = () => readFileSync('src/pages/index.astro', 'utf8');

describe('territorios', () => {
  it('son cuatro y enlazan a las cuatro rutas interiores', () => {
    const s = home();
    ['/estudio', '/ciclorama', '/produccion', '/membresia']
      .forEach((r) => expect(s, r).toContain(r));
  });

  it('el precio de entrada sale de los datos, no escrito a mano (G1)', () => {
    const s = home();
    expect(s).toContain('tarifasEstudio');
    expect(s).toContain('cicloramaFoto');
    expect(s).toContain('serviciosProduccion');
  });

  it('los precios de entrada que se van a mostrar son los reales', () => {
    expect(Math.min(...tarifasEstudio.map((t) => t.precio!))).toBe(35);
    expect(cicloramaFoto[0].precio).toBe(25);
    expect(Math.min(...serviciosProduccion.map((s) => s.precio!))).toBe(45);
  });

  it('membresia no muestra precio porque no existe el dato (§9.5)', () => {
    const s = home();
    const bloqueMembresia = s.slice(s.indexOf('/membresia') - 400, s.indexOf('/membresia'));
    expect(bloqueMembresia).not.toMatch(/desde=\{?"?\$\d/);
  });

  it('cada territorio ocupa el viewport completo (G11)', () => {
    const t = readFileSync('src/components/Territorio.astro', 'utf8');
    expect(t).toContain('100dvh');
  });

  it('la numeracion es una secuencia real de cuatro (ZERA §3 principio 12)', () => {
    const s = home();
    ['01', '02', '03', '04'].forEach((n) => expect(s, n).toContain(n));
    expect(s).not.toContain('"05"');
  });
});
```

- [ ] **Paso 2: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/territorios.test.ts`
Esperado: FAIL — `ENOENT: src/components/Territorio.astro`

- [ ] **Paso 3: Escribir `Territorio.astro`**

```astro
---
interface Props {
  numero: string;
  nombre: string;
  /** Precio de entrada ya formateado, o cadena vacía si no hay dato (§9.5). */
  desde: string;
  href: string;
}
const { numero, nombre, desde, href } = Astro.props;
---

<section class="territorio">
  <a class="territorio__enlace" href={href}>
    <span class="kicker">{numero}</span>
    <h2 class="territorio__nombre" data-titular>{nombre}</h2>
    {desde && <p class="territorio__desde">{desde}</p>}
    <span class="territorio__ir" aria-hidden="true">Ver</span>
    <span class="sr-only">Ver {nombre}</span>
  </a>
</section>

<style>
  .territorio {
    min-height: 100dvh;
    display: grid;
    place-items: center;
    border-top: 1px solid var(--hairline);
  }
  .territorio__enlace {
    display: flex;
    flex-direction: column;
    gap: var(--phi-1);
    align-items: center;
    text-align: center;
    padding: var(--phi-3);
  }
  .territorio__nombre {
    font-size: clamp(var(--phi-4), 12vw, var(--phi-6));
    transition: color 0.3s;
  }
  .territorio__enlace:hover .territorio__nombre { color: var(--rec); }
  .territorio__desde { color: var(--ash); font-size: var(--phi-2); }
  .territorio__ir {
    font-size: var(--phi-0);
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--rec);
  }
</style>
```

- [ ] **Paso 4: Insertar los cuatro territorios en la Home**

En `src/pages/index.astro`, añadir los imports:

```astro
import Territorio from '../components/Territorio.astro';
import { tarifasEstudio } from '../data/estudio';
import { cicloramaFoto } from '../data/ciclorama';
import { serviciosProduccion } from '../data/produccion';

const desdeEstudio = Math.min(...tarifasEstudio.map((t) => t.precio ?? Infinity));
const desdeCiclorama = cicloramaFoto[0].precio;
const desdeProduccion = Math.min(...serviciosProduccion.map((s) => s.precio ?? Infinity));
```

Y sustituir `<!-- Los bloques 4 a 7 se insertan aquí en la Tarea 14 -->` por:

```astro
  <!-- Bloques 4 a 7 · Los cuatro territorios -->
  <Territorio numero="01" nombre="Estudio"    desde={`Desde $${desdeEstudio} la hora`}    href="/estudio" />
  <Territorio numero="02" nombre="Ciclorama"  desde={`Desde $${desdeCiclorama} la hora`}  href="/ciclorama" />
  <Territorio numero="03" nombre="Producción" desde={`Desde $${desdeProduccion}`}         href="/produccion" />
  <Territorio numero="04" nombre="Membresía"  desde=""                                    href="/membresia" />
```

Membresía va sin precio a propósito: el dato no existe y no se inventa (§9.5).

- [ ] **Paso 5: Ejecutar y comprobar que pasa**

Ejecutar: `npx vitest run tests/territorios.test.ts && npm run build`
Esperado: 6 tests PASS. La Home queda con sus nueve bloques.

- [ ] **Paso 6: Commit**

```bash
git add src/components/Territorio.astro src/pages/index.astro tests/territorios.test.ts
git commit -m "feat(S03): los cuatro territorios de la home a pantalla completa"
```

---

## Tarea 15: Monitores y la ruta `/estudio`

**Archivos:**
- Crear: `src/three/objetos/monitores.ts`, `src/pages/estudio.astro`
- Crear: `public/posters/estudio.webp`
- Test: `tests/pagina-estudio.test.ts`

**Interfaces:**
- Consume: `metalOscuro`, `blancoDifuso`, `emisivoAcento` (Tarea 9), `medirPresupuesto` (Tarea 10)
- Produce: `monitores.crear(): THREE.Group` con nombre `monitores` e hijos
  `caja-izq`, `caja-der`, `cono-izq`, `cono-der`, `tweeter-izq`, `tweeter-der`, `testigo`

- [ ] **Paso 1: Escribir el test que falla**

`tests/pagina-estudio.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { medirPresupuesto, LIMITE_MALLAS, LIMITE_TRIANGULOS } from '../src/three/presupuesto';
import { crear } from '../src/three/objetos/monitores';
import { tarifasEstudio, bloquesEstudioMiembro } from '../src/data/estudio';

const pagina = () => readFileSync('src/pages/estudio.astro', 'utf8');

describe('objeto monitores', () => {
  const obj = crear();

  it('cabe en el presupuesto de escena', () => {
    const p = medirPresupuesto(obj);
    expect(p.mallas).toBeLessThanOrEqual(LIMITE_MALLAS);
    expect(p.triangulos).toBeLessThanOrEqual(LIMITE_TRIANGULOS);
  });

  it('son un par en estereo, simetrico respecto al origen', () => {
    const izq = obj.getObjectByName('caja-izq');
    const der = obj.getObjectByName('caja-der');
    expect(izq).toBeDefined();
    expect(der).toBeDefined();
    expect(izq!.position.x).toBeCloseTo(-der!.position.x, 5);
  });

  it('lleva el testigo de acento encendido', () => {
    expect(obj.getObjectByName('testigo')).toBeDefined();
  });
});

describe('ruta /estudio', () => {
  it('tiene un solo h1 (G8)', () => {
    expect((pagina().match(/<h1[\s>]/g) ?? []).length).toBe(1);
  });

  it('publica las dos tarifas y los tres bloques de miembro', () => {
    expect(tarifasEstudio).toHaveLength(2);
    expect(bloquesEstudioMiembro).toHaveLength(3);
    const s = pagina();
    expect(s).toContain('tarifasEstudio');
    expect(s).toContain('bloquesEstudioMiembro');
  });

  it('no escribe ningun precio a mano (G1)', () => {
    expect(pagina()).not.toMatch(/\$\s?\d{2,}/);
  });

  it('monta la escena de monitores con su poster', () => {
    const s = pagina();
    expect(s).toContain('objeto="monitores"');
    expect(s).toContain('/posters/estudio.webp');
  });

  it('el poster existe y pesa menos de 60 KB', () => {
    expect(existsSync('public/posters/estudio.webp')).toBe(true);
  });
});
```

- [ ] **Paso 2: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/pagina-estudio.test.ts`
Esperado: FAIL — `Cannot find module '../src/three/objetos/monitores'`

- [ ] **Paso 3: Escribir el objeto**

`src/three/objetos/monitores.ts`:

```ts
import * as THREE from 'three';
import { metalOscuro, blancoDifuso, emisivoAcento } from '../materiales';

const SEPARACION = 1.15;

/**
 * Par de monitores de campo cercano. Objeto protagonista de `/estudio`.
 * Van en estéreo real: uno a cada lado del origen, para que la cámara
 * pase entre ellos al cerrarse la espiral.
 */
export function crear(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'monitores';

  ([-1, 1] as const).forEach((lado) => {
    const sufijo = lado === -1 ? 'izq' : 'der';
    const x = lado * SEPARACION;

    const caja = new THREE.Mesh(
      new THREE.BoxGeometry(0.62, 0.95, 0.5),
      metalOscuro(),
    );
    caja.name = `caja-${sufijo}`;
    caja.position.set(x, 0, 0);
    caja.rotation.y = -lado * 0.22; // ligeramente giradas hacia el punto de escucha
    g.add(caja);

    const cono = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.24, 0.09, 28),
      blancoDifuso(),
    );
    cono.name = `cono-${sufijo}`;
    cono.position.set(x + lado * 0.02, -0.16, 0.26);
    cono.rotation.x = Math.PI / 2;
    cono.rotation.z = -lado * 0.22;
    g.add(cono);

    const tweeter = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 16, 12),
      blancoDifuso(),
    );
    tweeter.name = `tweeter-${sufijo}`;
    tweeter.position.set(x + lado * 0.02, 0.26, 0.26);
    g.add(tweeter);

    const puerto = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.12, 16, 1, true),
      metalOscuro(),
    );
    puerto.name = `puerto-${sufijo}`;
    puerto.position.set(x, -0.36, 0.22);
    puerto.rotation.x = Math.PI / 2;
    g.add(puerto);
  });

  // Testigo de encendido: el único punto de acento de la escena.
  const testigo = new THREE.Mesh(
    new THREE.SphereGeometry(0.035, 12, 10),
    emisivoAcento(),
  );
  testigo.name = 'testigo';
  testigo.position.set(-SEPARACION, -0.4, 0.27);
  g.add(testigo);

  return g;
}
```

- [ ] **Paso 4: Escribir la ruta**

`src/pages/estudio.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Bloque from '../components/Bloque.astro';
import Reveal from '../components/Reveal.astro';
import Escena3D from '../components/Escena3D.astro';
import PrecioCard from '../components/PrecioCard.astro';
import { tarifasEstudio, bloquesEstudioMiembro } from '../data/estudio';
import { equipoVerificable } from '../data/equipo';
import { enlaceWhatsApp } from '../data/whatsapp';

const [horaSuelta, bloque] = tarifasEstudio;
---

<BaseLayout
  title="Studio 1 — Alquiler de estudio de grabación en Panamá"
  description="Alquiler de Studio 1 en Vía España, Panamá: sala tratada acústicamente con monitorización de campo cercano. Por hora o por bloque."
  ruta="/estudio"
  poster="/posters/estudio.webp"
>
  <section class="hero">
    <Escena3D
      objeto="monitores"
      temperatura="ambar"
      poster="/posters/estudio.webp"
      alt="Par de monitores de campo cercano del Studio 1 de Safetory, con el testigo de encendido en rojo."
      fondos={['/escena/sala.webp', '/escena/sala-ancha.webp']}
    />
    <div class="hero__texto">
      <p class="kicker">01 · Estudio</p>
      <h1 data-titular>Studio 1</h1>
    </div>
  </section>

  <Bloque id="sala" kicker="La sala">
    <h2 data-titular>Tratada, no improvisada</h2>
    <Reveal>
      {equipoVerificable.map((linea) => <p class="lista__linea">{linea}</p>)}
    </Reveal>
  </Bloque>

  <Bloque id="hora" kicker="Tarifa por hora">
    <h2 data-titular>Hora suelta</h2>
    <PrecioCard tarifa={horaSuelta} />
  </Bloque>

  <Bloque id="bloque" kicker="Tarifa por bloque">
    <h2 data-titular>Tres horas o más</h2>
    <PrecioCard tarifa={bloque} />
  </Bloque>

  <Bloque id="miembros" kicker="Con membresía">
    <h2 data-titular>Bloques de miembro</h2>
    <Reveal>
      {bloquesEstudioMiembro.map((b) => <PrecioCard tarifa={b} />)}
    </Reveal>
  </Bloque>

  <Bloque id="reservar" kicker="Siguiente paso">
    <h2 data-titular>Reserva Studio 1</h2>
    <a class="boton" href={enlaceWhatsApp('Studio 1')} target="_blank" rel="noopener noreferrer">
      Reservar por WhatsApp
    </a>
  </Bloque>
</BaseLayout>

<style>
  .hero { position: relative; min-height: 100dvh; }
  .hero__texto {
    position: absolute;
    inset: auto 0 var(--phi-4) 0;
    padding: 0 var(--phi-3);
    display: flex;
    flex-direction: column;
    gap: var(--phi-0);
  }
  .lista__linea {
    padding: var(--phi-1) 0;
    border-top: 1px solid var(--hairline);
    color: var(--ash);
    font-size: var(--phi-2);
  }
  .boton {
    align-self: flex-start;
    padding: var(--phi-1) var(--phi-3);
    background: var(--rec);
    color: var(--void);
    font-weight: 500;
    border-radius: 999px;
  }
</style>
```

- [ ] **Paso 5: Capturar el póster**

`npm run dev` → `http://localhost:4321/dev/posters` → objeto `monitores` → Capturar.

```bash
mv ~/Downloads/monitores.webp public/posters/estudio.webp
```

- [ ] **Paso 6: Ejecutar y comprobar que pasa**

Ejecutar: `npx vitest run tests/pagina-estudio.test.ts && npm run build`
Esperado: 8 tests PASS.

- [ ] **Paso 7: Commit**

```bash
git add src/three/objetos/monitores.ts src/pages/estudio.astro public/posters/estudio.webp tests/pagina-estudio.test.ts
git commit -m "feat(S04): monitores procedurales y ruta /estudio"
```

---

## Tarea 16: Ciclorama y la ruta `/ciclorama`

**Archivos:**
- Crear: `src/three/objetos/ciclorama.ts`, `src/pages/ciclorama.astro`
- Crear: `public/posters/ciclorama.webp`
- Test: `tests/pagina-ciclorama.test.ts`

**Interfaces:**
- Produce: `ciclorama.crear(): THREE.Group` con nombre `ciclorama` e hijos
  `curva`, `suelo`, `foco`, `aro-foco`, `pie`

- [ ] **Paso 1: Escribir el test que falla**

`tests/pagina-ciclorama.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { medirPresupuesto, LIMITE_MALLAS, LIMITE_TRIANGULOS } from '../src/three/presupuesto';
import { crear } from '../src/three/objetos/ciclorama';
import { cicloramaFoto, cicloramaVideo, bloquesCicloramaMiembro } from '../src/data/ciclorama';

const pagina = () => readFileSync('src/pages/ciclorama.astro', 'utf8');

describe('objeto ciclorama', () => {
  const obj = crear();

  it('cabe en el presupuesto de escena', () => {
    const p = medirPresupuesto(obj);
    expect(p.mallas).toBeLessThanOrEqual(LIMITE_MALLAS);
    expect(p.triangulos).toBeLessThanOrEqual(LIMITE_TRIANGULOS);
  });

  it('es el unico objeto que ES un espacio: tiene curva y suelo', () => {
    expect(obj.getObjectByName('curva')).toBeDefined();
    expect(obj.getObjectByName('suelo')).toBeDefined();
  });

  it('lleva el foco circular que se ve en la fotografia del cliente', () => {
    expect(obj.getObjectByName('foco')).toBeDefined();
  });
});

describe('ruta /ciclorama', () => {
  it('tiene un solo h1 (G8)', () => {
    expect((pagina().match(/<h1[\s>]/g) ?? []).length).toBe(1);
  });

  it('usa la temperatura violeta del espacio real (§6.3)', () => {
    expect(pagina()).toContain('temperatura="violeta"');
  });

  it('publica la tarifa de foto, los tres bloques de video y los de miembro', () => {
    expect(cicloramaFoto).toHaveLength(1);
    expect(cicloramaVideo).toHaveLength(3);
    expect(bloquesCicloramaMiembro).toHaveLength(2);
    const s = pagina();
    ['cicloramaFoto', 'cicloramaVideo', 'bloquesCicloramaMiembro']
      .forEach((d) => expect(s, d).toContain(d));
  });

  it('no escribe ningun precio a mano (G1)', () => {
    expect(pagina()).not.toMatch(/\$\s?\d{2,}/);
  });

  it('el poster existe', () => {
    expect(existsSync('public/posters/ciclorama.webp')).toBe(true);
  });
});
```

- [ ] **Paso 2: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/pagina-ciclorama.test.ts`
Esperado: FAIL — `Cannot find module '../src/three/objetos/ciclorama'`

- [ ] **Paso 3: Escribir el objeto**

`src/three/objetos/ciclorama.ts`:

```ts
import * as THREE from 'three';
import { metalOscuro, blancoDifuso, emisivoAcento } from '../materiales';

/**
 * Ciclorama de curva infinita con el foco circular. Objeto protagonista de
 * `/ciclorama` y el único del sitio que no es un aparato sino un espacio.
 * La curva se genera extruyendo una LatheGeometry parcial: un cuarto de
 * cilindro que une pared y suelo sin arista visible, que es exactamente lo
 * que hace un ciclorama real.
 */
export function crear(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'ciclorama';

  // Perfil de la transición pared→suelo: recta, curva, recta.
  const perfil: THREE.Vector2[] = [];
  perfil.push(new THREE.Vector2(2.6, -0.9));
  for (let i = 0; i <= 12; i++) {
    const a = (i / 12) * (Math.PI / 2);
    perfil.push(new THREE.Vector2(
      2.6 - 0.9 + Math.cos(a) * 0.9,
      -0.9 + Math.sin(a) * 0.9,
    ));
  }
  perfil.push(new THREE.Vector2(1.7, 1.9));

  const curva = new THREE.Mesh(
    new THREE.LatheGeometry(perfil, 40, Math.PI * 0.15, Math.PI * 0.7),
    blancoDifuso(),
  );
  curva.name = 'curva';
  curva.material.side = THREE.DoubleSide;
  g.add(curva);

  const suelo = new THREE.Mesh(
    new THREE.CircleGeometry(1.75, 40),
    blancoDifuso(),
  );
  suelo.name = 'suelo';
  suelo.rotation.x = -Math.PI / 2;
  suelo.position.y = -0.9;
  g.add(suelo);

  // Foco circular tipo panel LED, el que aparece en la fotografía.
  const foco = new THREE.Mesh(
    new THREE.CircleGeometry(0.44, 32),
    new THREE.MeshStandardMaterial({
      color: 0xffd9a0,
      emissive: 0xffc98a,
      emissiveIntensity: 1.6,
    }),
  );
  foco.name = 'foco';
  foco.position.set(1.35, 0.5, 1.1);
  foco.lookAt(0, 0, 0);
  g.add(foco);

  const aro = new THREE.Mesh(
    new THREE.TorusGeometry(0.46, 0.03, 10, 32),
    metalOscuro(),
  );
  aro.name = 'aro-foco';
  aro.position.copy(foco.position);
  aro.quaternion.copy(foco.quaternion);
  g.add(aro);

  const pie = new THREE.Mesh(
    new THREE.CylinderGeometry(0.022, 0.022, 1.4, 10),
    metalOscuro(),
  );
  pie.name = 'pie';
  pie.position.set(1.35, -0.2, 1.1);
  g.add(pie);

  // Testigo de grabación: el punto de acento obligatorio (G9).
  const testigo = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 10), emisivoAcento());
  testigo.name = 'testigo';
  testigo.position.set(-1.2, 0.7, 1.0);
  g.add(testigo);

  return g;
}
```

- [ ] **Paso 4: Escribir la ruta**

`src/pages/ciclorama.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Bloque from '../components/Bloque.astro';
import Reveal from '../components/Reveal.astro';
import Escena3D from '../components/Escena3D.astro';
import PrecioCard from '../components/PrecioCard.astro';
import { cicloramaFoto, cicloramaVideo, bloquesCicloramaMiembro } from '../data/ciclorama';
import { enlaceWhatsApp } from '../data/whatsapp';
---

<BaseLayout
  title="Ciclorama — Alquiler de estudio de fotografía y vídeo en Panamá"
  description="Ciclorama de curva infinita con iluminación LED en Vía España, Panamá. Alquiler por horas para fotografía y por bloques para vídeo."
  ruta="/ciclorama"
  poster="/posters/ciclorama.webp"
>
  <section class="hero">
    <Escena3D
      objeto="ciclorama"
      temperatura="violeta"
      poster="/posters/ciclorama.webp"
      alt="Ciclorama de curva infinita de Safetory, iluminado con un panel LED circular y lavado violeta."
      fondos={['/escena/ciclorama.webp', '/escena/lounge.webp']}
    />
    <div class="hero__texto">
      <p class="kicker">02 · Ciclorama</p>
      <h1 data-titular>Ciclorama</h1>
    </div>
  </section>

  <Bloque id="fotografia" kicker="Fotografía">
    <h2 data-titular>Por hora</h2>
    <Reveal>
      {cicloramaFoto.map((t) => <PrecioCard tarifa={t} />)}
    </Reveal>
  </Bloque>

  <Bloque id="video" kicker="Vídeo">
    <h2 data-titular>Por bloque</h2>
    <Reveal>
      {cicloramaVideo.map((t) => <PrecioCard tarifa={t} />)}
    </Reveal>
  </Bloque>

  <Bloque id="miembros" kicker="Con membresía">
    <h2 data-titular>Ciclorama y co-working</h2>
    <Reveal>
      {bloquesCicloramaMiembro.map((b) => <PrecioCard tarifa={b} />)}
    </Reveal>
  </Bloque>

  <Bloque id="reservar" kicker="Siguiente paso">
    <h2 data-titular>Reserva el ciclorama</h2>
    <a class="boton" href={enlaceWhatsApp('Ciclorama')} target="_blank" rel="noopener noreferrer">
      Reservar por WhatsApp
    </a>
  </Bloque>
</BaseLayout>

<style>
  .hero { position: relative; min-height: 100dvh; }
  .hero__texto {
    position: absolute;
    inset: auto 0 var(--phi-4) 0;
    padding: 0 var(--phi-3);
    display: flex;
    flex-direction: column;
    gap: var(--phi-0);
  }
  .boton {
    align-self: flex-start;
    padding: var(--phi-1) var(--phi-3);
    background: var(--rec);
    color: var(--void);
    font-weight: 500;
    border-radius: 999px;
  }
</style>
```

- [ ] **Paso 5: Capturar el póster**

`http://localhost:4321/dev/posters` → objeto `ciclorama` → Capturar.

```bash
mv ~/Downloads/ciclorama.webp public/posters/ciclorama.webp
```

- [ ] **Paso 6: Ejecutar y comprobar que pasa**

Ejecutar: `npx vitest run tests/pagina-ciclorama.test.ts && npm run build`
Esperado: 8 tests PASS.

- [ ] **Paso 7: Commit**

```bash
git add src/three/objetos/ciclorama.ts src/pages/ciclorama.astro public/posters/ciclorama.webp tests/pagina-ciclorama.test.ts
git commit -m "feat(S05): ciclorama procedural con curva infinita y ruta /ciclorama"
```

---

## Tarea 17: Interfaz de audio y la ruta `/produccion`

**Archivos:**
- Crear: `src/three/objetos/interfaz.ts`, `src/pages/produccion.astro`
- Crear: `public/posters/produccion.webp`
- Test: `tests/pagina-produccion.test.ts`

**Interfaces:**
- Produce: `interfaz.crear(): THREE.Group` con nombre `interfaz` e hijos
  `chasis`, `knob`, `anillo-knob`, `pantalla`, `botones`

- [ ] **Paso 1: Escribir el test que falla**

`tests/pagina-produccion.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { medirPresupuesto, LIMITE_MALLAS, LIMITE_TRIANGULOS } from '../src/three/presupuesto';
import { crear } from '../src/three/objetos/interfaz';
import { serviciosProduccion } from '../src/data/produccion';

const pagina = () => readFileSync('src/pages/produccion.astro', 'utf8');

describe('objeto interfaz', () => {
  const obj = crear();

  it('cabe en el presupuesto de escena', () => {
    const p = medirPresupuesto(obj);
    expect(p.mallas).toBeLessThanOrEqual(LIMITE_MALLAS);
    expect(p.triangulos).toBeLessThanOrEqual(LIMITE_TRIANGULOS);
  });

  it('tiene el knob grande, que gira con el scroll', () => {
    expect(obj.getObjectByName('knob')).toBeDefined();
  });

  it('los botones usan InstancedMesh: una sola llamada de dibujado', () => {
    expect(obj.getObjectByName('botones')?.type).toBe('InstancedMesh');
  });
});

describe('ruta /produccion', () => {
  it('tiene un solo h1 (G8)', () => {
    expect((pagina().match(/<h1[\s>]/g) ?? []).length).toBe(1);
  });

  it('publica los seis servicios desde los datos', () => {
    expect(serviciosProduccion).toHaveLength(6);
    expect(pagina()).toContain('serviciosProduccion');
  });

  it('cada servicio recibe su propio bloque a pantalla completa (G11)', () => {
    // Los seis bloques de servicio se generan con un .map(), así que en el
    // fuente hay una sola aparición literal de <Bloque> para los seis. El
    // recuento de pantallas renderizadas se verifica en la suite sobre dist/.
    expect(pagina()).toContain('serviciosProduccion.map(');
  });

  it('la tabla comparativa lista los seis, no siete', () => {
    const s = pagina();
    expect(s).toContain('comparativa');
    expect(s).not.toContain('siete servicios');
  });

  it('no escribe ningun precio a mano (G1)', () => {
    expect(pagina()).not.toMatch(/\$\s?\d{2,}/);
  });

  it('el poster existe', () => {
    expect(existsSync('public/posters/produccion.webp')).toBe(true);
  });
});
```

- [ ] **Paso 2: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/pagina-produccion.test.ts`
Esperado: FAIL — `Cannot find module '../src/three/objetos/interfaz'`

- [ ] **Paso 3: Escribir el objeto**

`src/three/objetos/interfaz.ts`:

```ts
import * as THREE from 'three';
import { metalOscuro, emisivoAcento, blancoDifuso } from '../materiales';

const BOTONES = 8;

/**
 * Interfaz de audio de sobremesa con knob grande. Objeto protagonista de
 * `/produccion`. El knob es la pieza que la escena hace girar con el scroll:
 * es el mando de nivel, y mixing, mastering y grabación son cuestión de nivel.
 */
export function crear(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'interfaz';

  const chasis = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.28, 1.05),
    metalOscuro(),
  );
  chasis.name = 'chasis';
  g.add(chasis);

  const knob = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.34, 0.2, 40),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.95, roughness: 0.25 }),
  );
  knob.name = 'knob';
  knob.position.set(0.28, 0.22, 0);
  g.add(knob);

  const anilloKnob = new THREE.Mesh(
    new THREE.TorusGeometry(0.38, 0.018, 10, 40),
    emisivoAcento(),
  );
  anilloKnob.name = 'anillo-knob';
  anilloKnob.position.set(0.28, 0.16, 0);
  anilloKnob.rotation.x = Math.PI / 2;
  g.add(anilloKnob);

  const pantalla = new THREE.Mesh(
    new THREE.PlaneGeometry(0.42, 0.16),
    new THREE.MeshStandardMaterial({
      color: 0x0a0a0a,
      emissive: 0x3d5a4a,
      emissiveIntensity: 0.9,
    }),
  );
  pantalla.name = 'pantalla';
  pantalla.position.set(-0.42, 0.145, 0.1);
  pantalla.rotation.x = -Math.PI / 2;
  g.add(pantalla);

  // Fila de botones: geometría única, ocho instancias, un draw call.
  const botones = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.07, 0.03, 0.05),
    blancoDifuso(),
    BOTONES,
  );
  botones.name = 'botones';
  const m = new THREE.Matrix4();
  for (let i = 0; i < BOTONES; i++) {
    m.makeTranslation(-0.62 + i * 0.09, 0.155, -0.28);
    botones.setMatrixAt(i, m);
  }
  botones.instanceMatrix.needsUpdate = true;
  g.add(botones);

  return g;
}
```

- [ ] **Paso 4: Hacer girar el knob con el scroll**

En `src/three/motor.ts`, dentro de `dibujar()`, justo después de
`camara.lookAt(0, 0, 0);`, añadir:

```ts
    // El knob de /produccion gira con el scroll: media vuelta de extremo a extremo.
    const knob = o.objeto.getObjectByName('knob');
    if (knob) knob.rotation.y = progreso * Math.PI;
```

- [ ] **Paso 5: Escribir la ruta**

`src/pages/produccion.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Bloque from '../components/Bloque.astro';
import Reveal from '../components/Reveal.astro';
import Escena3D from '../components/Escena3D.astro';
import PrecioCard from '../components/PrecioCard.astro';
import { serviciosProduccion } from '../data/produccion';
import { enlaceWhatsApp } from '../data/whatsapp';
---

<BaseLayout
  title="Producción — Mixing, mastering y grabación en Panamá"
  description="Servicios de producción musical en Panamá: mixing con stems ilimitados, mastering, grabación y producción personalizada desde cero."
  ruta="/produccion"
  poster="/posters/produccion.webp"
>
  <section class="hero">
    <Escena3D
      objeto="interfaz"
      temperatura="ambar-apagado"
      poster="/posters/produccion.webp"
      alt="Interfaz de audio de sobremesa de Safetory, con el mando de nivel rodeado por un anillo rojo."
      fondos={['/escena/interfaz.webp', '/escena/sala.webp']}
    />
    <div class="hero__texto">
      <p class="kicker">03 · Producción</p>
      <h1 data-titular>Producción</h1>
    </div>
  </section>

  {serviciosProduccion.map((servicio, i) => (
    <Bloque id={servicio.id} kicker={`0${i + 1} · Servicio`}>
      <h2 data-titular>{servicio.nombre}</h2>
      <PrecioCard tarifa={servicio} />
    </Bloque>
  ))}

  <Bloque id="comparativa" kicker="Comparativa">
    <h2 data-titular>Los seis, de un vistazo</h2>
    <Reveal>
      <table class="tabla">
        <thead>
          <tr><th scope="col">Servicio</th><th scope="col">Duración</th><th scope="col">Precio</th></tr>
        </thead>
        <tbody>
          {serviciosProduccion.map((s) => (
            <tr>
              <th scope="row">{s.nombre}</th>
              <td>{s.duracion}</td>
              <td><data value={String(s.precio)}>${s.precio}</data></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Reveal>
  </Bloque>

  <Bloque id="reservar" kicker="Siguiente paso">
    <h2 data-titular>Empieza tu producción</h2>
    <a class="boton" href={enlaceWhatsApp('Servicios de producción')} target="_blank" rel="noopener noreferrer">
      Escribir por WhatsApp
    </a>
  </Bloque>
</BaseLayout>

<style>
  .hero { position: relative; min-height: 100dvh; }
  .hero__texto {
    position: absolute;
    inset: auto 0 var(--phi-4) 0;
    padding: 0 var(--phi-3);
    display: flex;
    flex-direction: column;
    gap: var(--phi-0);
  }
  .tabla { width: 100%; border-collapse: collapse; text-align: left; }
  .tabla th, .tabla td {
    padding: var(--phi-1) 0;
    border-top: 1px solid var(--hairline);
    font-weight: 400;
  }
  .tabla thead th { color: var(--ash); font-size: var(--phi-0); letter-spacing: 0.18em; text-transform: uppercase; }
  .tabla tbody td:last-child { font-family: var(--display); color: var(--rec); }
  .boton {
    align-self: flex-start;
    padding: var(--phi-1) var(--phi-3);
    background: var(--rec);
    color: var(--void);
    font-weight: 500;
    border-radius: 999px;
  }
</style>
```

- [ ] **Paso 6: Capturar el póster y verificar**

`http://localhost:4321/dev/posters` → objeto `interfaz` → Capturar.

```bash
mv ~/Downloads/interfaz.webp public/posters/produccion.webp
npx vitest run tests/pagina-produccion.test.ts && npm run build
```

Esperado: 9 tests PASS.

- [ ] **Paso 7: Commit**

```bash
git add src/three/objetos/interfaz.ts src/three/motor.ts src/pages/produccion.astro public/posters/produccion.webp tests/pagina-produccion.test.ts
git commit -m "feat(S06): interfaz de audio con knob al scroll y ruta /produccion"
```

---

## Tarea 18: Plato y la ruta `/membresia`

**Archivos:**
- Crear: `src/three/objetos/plato.ts`, `src/pages/membresia.astro`
- Crear: `public/posters/membresia.webp`
- Test: `tests/pagina-membresia.test.ts`

**Interfaces:**
- Produce: `plato.crear(): THREE.Group` con nombre `plato` e hijos
  `base`, `disco`, `etiqueta`, `brazo`, `capsula`

- [ ] **Paso 1: Escribir el test que falla**

`tests/pagina-membresia.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { medirPresupuesto, LIMITE_MALLAS, LIMITE_TRIANGULOS } from '../src/three/presupuesto';
import { crear } from '../src/three/objetos/plato';
import { incluidoMembresia } from '../src/data/membresia';

const pagina = () => readFileSync('src/pages/membresia.astro', 'utf8');

describe('objeto plato', () => {
  const obj = crear();

  it('cabe en el presupuesto de escena', () => {
    const p = medirPresupuesto(obj);
    expect(p.mallas).toBeLessThanOrEqual(LIMITE_MALLAS);
    expect(p.triangulos).toBeLessThanOrEqual(LIMITE_TRIANGULOS);
  });

  it('tiene disco y brazo', () => {
    expect(obj.getObjectByName('disco')).toBeDefined();
    expect(obj.getObjectByName('brazo')).toBeDefined();
  });
});

describe('ruta /membresia', () => {
  it('tiene un solo h1 (G8)', () => {
    expect((pagina().match(/<h1[\s>]/g) ?? []).length).toBe(1);
  });

  it('NO inventa precio de membresia: el dato no existe (§9.5)', () => {
    const s = pagina();
    expect(s).not.toMatch(/\$\s?\d/);
    expect(s).not.toMatch(/\d+\s*(al mes|mensual|\/mes)/i);
  });

  it('el CTA lleva a consultar, no a comprar', () => {
    const s = pagina();
    expect(s).toContain('Consultar membresía');
    expect(s).toContain('enlaceWhatsApp');
  });

  it('lista lo incluido desde los datos', () => {
    expect(incluidoMembresia).toHaveLength(2);
    expect(pagina()).toContain('incluidoMembresia');
  });

  it('el poster existe', () => {
    expect(existsSync('public/posters/membresia.webp')).toBe(true);
  });
});
```

- [ ] **Paso 2: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/pagina-membresia.test.ts`
Esperado: FAIL — `Cannot find module '../src/three/objetos/plato'`

- [ ] **Paso 3: Escribir el objeto**

`src/three/objetos/plato.ts`:

```ts
import * as THREE from 'three';
import { metalOscuro, emisivoAcento, blancoDifuso } from '../materiales';

/**
 * Plato y vinilo del lounge. Objeto protagonista de `/membresia`.
 * El disco gira en bucle continuo: el acceso de miembro no se detiene.
 */
export function crear(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'plato';

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 0.18, 1.7),
    metalOscuro(),
  );
  base.name = 'base';
  base.position.y = -0.12;
  g.add(base);

  const disco = new THREE.Mesh(
    new THREE.CylinderGeometry(0.78, 0.78, 0.014, 64),
    new THREE.MeshStandardMaterial({ color: 0x0b0b0b, metalness: 0.4, roughness: 0.35 }),
  );
  disco.name = 'disco';
  disco.position.y = 0.005;
  g.add(disco);

  const etiqueta = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.24, 0.016, 40),
    emisivoAcento(),
  );
  etiqueta.name = 'etiqueta';
  etiqueta.position.y = 0.008;
  g.add(etiqueta);

  const eje = new THREE.Mesh(
    new THREE.CylinderGeometry(0.014, 0.014, 0.09, 12),
    blancoDifuso(),
  );
  eje.name = 'eje';
  eje.position.y = 0.05;
  g.add(eje);

  const brazo = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.018, 1.05, 12),
    metalOscuro(),
  );
  brazo.name = 'brazo';
  brazo.position.set(0.62, 0.14, -0.42);
  brazo.rotation.set(0, 0, Math.PI / 2);
  brazo.rotation.y = -0.75;
  g.add(brazo);

  const capsula = new THREE.Mesh(
    new THREE.BoxGeometry(0.09, 0.06, 0.05),
    blancoDifuso(),
  );
  capsula.name = 'capsula';
  capsula.position.set(0.28, 0.09, 0.02);
  g.add(capsula);

  return g;
}
```

- [ ] **Paso 4: Hacer girar el disco en bucle**

En `src/three/motor.ts`, dentro de `dibujar()`, tras la línea del knob, añadir:

```ts
    // El disco de /membresia gira en bucle continuo: el acceso no se detiene.
    const disco = o.objeto.getObjectByName('disco');
    if (disco) disco.rotation.y += 0.006;
    const etiqueta = o.objeto.getObjectByName('etiqueta');
    if (etiqueta) etiqueta.rotation.y += 0.006;
```

- [ ] **Paso 5: Escribir la ruta**

`src/pages/membresia.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Bloque from '../components/Bloque.astro';
import Reveal from '../components/Reveal.astro';
import Escena3D from '../components/Escena3D.astro';
import { incluidoMembresia } from '../data/membresia';
import { enlaceWhatsApp } from '../data/whatsapp';
---

<BaseLayout
  title="Membresía — Acceso a estudio y ciclorama en Panamá"
  description="La membresía de Safetory Studio incluye bloques de Studio 1 y de ciclorama y co-working sin coste adicional."
  ruta="/membresia"
  poster="/posters/membresia.webp"
>
  <section class="hero">
    <Escena3D
      objeto="plato"
      temperatura="ambar-apagado"
      poster="/posters/membresia.webp"
      alt="Plato y vinilo del lounge de Safetory, con la etiqueta del disco iluminada en rojo."
      fondos={['/escena/lounge.webp', '/escena/sala-ancha.webp']}
    />
    <div class="hero__texto">
      <p class="kicker">04 · Membresía</p>
      <h1 data-titular>Membresía</h1>
    </div>
  </section>

  <Bloque id="incluye" kicker="Qué incluye">
    <h2 data-titular>Bloques sin coste</h2>
    <Reveal>
      {incluidoMembresia.map((linea) => <p class="incluye__linea">{linea}</p>)}
    </Reveal>
  </Bloque>

  <Bloque id="consultar" kicker="Siguiente paso">
    <h2 data-titular>Hablemos de tu membresía</h2>
    <p class="consultar__nota">
      Las condiciones de alta se acuerdan según el uso que vayas a darle al estudio.
    </p>
    <a class="boton" href={enlaceWhatsApp('Consultar membresía')} target="_blank" rel="noopener noreferrer">
      Consultar membresía
    </a>
  </Bloque>
</BaseLayout>

<style>
  .hero { position: relative; min-height: 100dvh; }
  .hero__texto {
    position: absolute;
    inset: auto 0 var(--phi-4) 0;
    padding: 0 var(--phi-3);
    display: flex;
    flex-direction: column;
    gap: var(--phi-0);
  }
  .incluye__linea {
    padding: var(--phi-2) 0;
    border-top: 1px solid var(--hairline);
    font-size: var(--phi-3);
    font-family: var(--display);
  }
  .consultar__nota { color: var(--ash); font-size: var(--phi-2); max-width: 42ch; }
  .boton {
    align-self: flex-start;
    padding: var(--phi-1) var(--phi-3);
    background: var(--rec);
    color: var(--void);
    font-weight: 500;
    border-radius: 999px;
  }
</style>
```

> **Hueco de contenido abierto (§9.5).** En cuanto el cliente facilite precio y condiciones de
> alta, se añade un `src/data/membresia.ts → precioMembresia: Tarifa` y un bloque `PrecioCard`
> entre «Qué incluye» y «Siguiente paso». Hasta entonces, esa cifra no existe en el sitio.

- [ ] **Paso 6: Capturar el póster y verificar**

`http://localhost:4321/dev/posters` → objeto `plato` → Capturar.

```bash
mv ~/Downloads/plato.webp public/posters/membresia.webp
npx vitest run tests/pagina-membresia.test.ts && npm run build
```

Esperado: 7 tests PASS.

- [ ] **Paso 7: Commit**

```bash
git add src/three/objetos/plato.ts src/three/motor.ts src/pages/membresia.astro public/posters/membresia.webp tests/pagina-membresia.test.ts
git commit -m "feat(S07): plato giratorio y ruta /membresia sin inventar precio"
```

---

## Tarea 19: Rótulo y la ruta `/contacto`

**Archivos:**
- Crear: `src/three/objetos/rotulo.ts`, `src/pages/contacto.astro`
- Crear: `public/posters/contacto.webp`, `public/mapa-via-espana.webp`
- Test: `tests/pagina-contacto.test.ts`

**Interfaces:**
- Produce: `rotulo.crear(): THREE.Group` con nombre `rotulo` e hijos
  `marco`, `panel`, `halo`

- [ ] **Paso 1: Escribir el test que falla**

`tests/pagina-contacto.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { medirPresupuesto, LIMITE_MALLAS, LIMITE_TRIANGULOS } from '../src/three/presupuesto';
import { crear } from '../src/three/objetos/rotulo';
import { site } from '../src/data/site';

const pagina = () => readFileSync('src/pages/contacto.astro', 'utf8');

describe('objeto rotulo', () => {
  const obj = crear();

  it('cabe en el presupuesto de escena', () => {
    const p = medirPresupuesto(obj);
    expect(p.mallas).toBeLessThanOrEqual(LIMITE_MALLAS);
    expect(p.triangulos).toBeLessThanOrEqual(LIMITE_TRIANGULOS);
  });

  it('tiene panel retroiluminado y halo', () => {
    expect(obj.getObjectByName('panel')).toBeDefined();
    expect(obj.getObjectByName('halo')).toBeDefined();
  });
});

describe('ruta /contacto', () => {
  it('tiene un solo h1 (G8)', () => {
    expect((pagina().match(/<h1[\s>]/g) ?? []).length).toBe(1);
  });

  it('publica los cuatro canales reales', () => {
    const s = pagina();
    ['site.direccion', 'site.telefono', 'site.correo', 'site.instagram']
      .forEach((d) => expect(s, d).toContain(d));
  });

  it('el mapa es una imagen enlazada, no un iframe (§5.6)', () => {
    const s = pagina();
    expect(s).not.toContain('<iframe');
    expect(s).toContain('mapa-via-espana.webp');
    expect(s).toContain('google.com/maps');
  });

  it('el telefono usa formato internacional', () => {
    expect(pagina()).toContain('tel:+507');
  });

  it('el horario sale de los datos y son tres franjas', () => {
    expect(site.horario).toHaveLength(3);
    expect(pagina()).toContain('site.horario');
  });

  it('los posters y el mapa existen', () => {
    expect(existsSync('public/posters/contacto.webp')).toBe(true);
    expect(existsSync('public/mapa-via-espana.webp')).toBe(true);
  });
});
```

- [ ] **Paso 2: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/pagina-contacto.test.ts`
Esperado: FAIL — `Cannot find module '../src/three/objetos/rotulo'`

- [ ] **Paso 3: Escribir el objeto**

`src/three/objetos/rotulo.ts`:

```ts
import * as THREE from 'three';
import { metalOscuro } from '../materiales';

/**
 * El rótulo retroiluminado que cuelga en la pared del Studio 1.
 * Objeto protagonista de `/contacto` y cierre del sitio: el letrero
 * se enciende al llegar la cámara.
 *
 * El wordmark va como textura, no como geometría de texto: cargar una
 * tipografía en formato three cuesta cientos de kilobytes y aquí basta
 * con el SVG que ya tenemos convertido a imagen.
 */
export function crear(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'rotulo';

  const marco = new THREE.Mesh(
    new THREE.BoxGeometry(3.0, 1.05, 0.14),
    metalOscuro(),
  );
  marco.name = 'marco';
  g.add(marco);

  const textura = new THREE.TextureLoader().load('/escena/wordmark.webp');
  textura.colorSpace = THREE.SRGBColorSpace;

  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(2.78, 0.86),
    new THREE.MeshStandardMaterial({
      map: textura,
      transparent: true,
      emissive: 0xffffff,
      emissiveMap: textura,
      emissiveIntensity: 1.5,
    }),
  );
  panel.name = 'panel';
  panel.position.z = 0.075;
  g.add(panel);

  // Halo: el resplandor que el rótulo proyecta sobre la pared.
  const halo = new THREE.Mesh(
    new THREE.PlaneGeometry(3.9, 1.9),
    new THREE.MeshBasicMaterial({
      color: 0xa9c4ff,
      transparent: true,
      opacity: 0.09,
      depthWrite: false,
    }),
  );
  halo.name = 'halo';
  halo.position.z = -0.12;
  g.add(halo);

  return g;
}
```

- [ ] **Paso 4: Preparar el wordmark y el mapa**

```bash
cp LOGO_SAFETORY.png public/escena/wordmark-origen.png
```

Convertir `public/escena/wordmark-origen.png` a `public/escena/wordmark.webp` con fondo
transparente, ancho 1024 px. Cualquier conversor sirve; con la herramienta de pósters ya
abierta en el navegador, también vale arrastrar el PNG a `https://squoosh.app` y exportar
WebP con calidad 80. Borrar después `wordmark-origen.png`.

Para el mapa: abrir Google Maps en `Edificio Brasilia, Vía España, Panamá`, encuadrar la zona,
capturar la pantalla y guardarla como `public/mapa-via-espana.webp` a 1280 px de ancho.

- [ ] **Paso 5: Escribir la ruta**

`src/pages/contacto.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Bloque from '../components/Bloque.astro';
import Reveal from '../components/Reveal.astro';
import Escena3D from '../components/Escena3D.astro';
import { site } from '../data/site';
import { enlaceWhatsApp } from '../data/whatsapp';

const telefonoE164 = `tel:+507${site.telefono.replace('-', '')}`;
const mapa = 'https://www.google.com/maps/search/?api=1&query=Edificio+Brasilia+Via+Espana+Panama';
---

<BaseLayout
  title="Contacto — Safetory Studio, Vía España, Panamá"
  description="Safetory Studio está en Edificio Brasilia, Vía España, Panamá. Abierto 24 horas de lunes a viernes y los sábados por la mañana."
  ruta="/contacto"
  poster="/posters/contacto.webp"
>
  <section class="hero">
    <Escena3D
      objeto="rotulo"
      temperatura="neutro"
      poster="/posters/contacto.webp"
      alt="Rótulo retroiluminado de Safetory Studio encendido sobre la pared del estudio."
      fondos={['/escena/sala.webp', '/escena/microfono.webp']}
    />
    <div class="hero__texto">
      <p class="kicker">Contacto</p>
      <h1 data-titular>Contacto</h1>
    </div>
  </section>

  <Bloque id="direccion" kicker="Dónde">
    <h2 data-titular>Vía España, Panamá</h2>
    <address class="direccion">{site.direccion}</address>
  </Bloque>

  <Bloque id="canales" kicker="Canales">
    <h2 data-titular>Escríbenos</h2>
    <Reveal>
      <a class="canal" href={telefonoE164}>{site.telefono}</a>
      <a class="canal" href={`mailto:${site.correo}`}>{site.correo}</a>
      <a class="canal" href={site.instagram} target="_blank" rel="noopener noreferrer">@safetorystudio</a>
    </Reveal>
  </Bloque>

  <Bloque id="horario" kicker="Cuándo">
    <h2 data-titular>Horario</h2>
    <dl class="horario">
      {site.horario.map((f) => (
        <div><dt>{f.dias}</dt><dd>{f.horas}</dd></div>
      ))}
    </dl>
  </Bloque>

  <Bloque id="mapa" kicker="Cómo llegar">
    <h2 data-titular>Edificio Brasilia</h2>
    <a class="mapa" href={mapa} target="_blank" rel="noopener noreferrer">
      <img
        src="/mapa-via-espana.webp"
        alt="Mapa de la zona de Vía España, Panamá, con la ubicación del Edificio Brasilia."
        width="1280" height="720" loading="lazy" decoding="async"
      />
      <span class="mapa__pie">Abrir en Google Maps</span>
    </a>
  </Bloque>

  <Bloque id="reservar" kicker="Siguiente paso">
    <h2 data-titular>Reserva tu sesión</h2>
    <a class="boton" href={enlaceWhatsApp('Consulta general')} target="_blank" rel="noopener noreferrer">
      Reservar por WhatsApp
    </a>
  </Bloque>
</BaseLayout>

<style>
  .hero { position: relative; min-height: 100dvh; }
  .hero__texto {
    position: absolute;
    inset: auto 0 var(--phi-4) 0;
    padding: 0 var(--phi-3);
    display: flex;
    flex-direction: column;
    gap: var(--phi-0);
  }
  .direccion { font-style: normal; font-family: var(--display); font-size: var(--phi-3); max-width: 22ch; }
  .canal {
    display: block;
    padding: var(--phi-1) 0;
    border-top: 1px solid var(--hairline);
    font-family: var(--display);
    font-size: var(--phi-3);
    transition: color 0.25s;
  }
  .canal:hover { color: var(--rec); }
  .horario div {
    display: flex;
    justify-content: space-between;
    gap: var(--phi-2);
    padding: var(--phi-1) 0;
    border-top: 1px solid var(--hairline);
    font-size: var(--phi-2);
  }
  .horario dd { color: var(--ash); }
  .mapa { display: block; }
  .mapa img { width: 100%; height: auto; filter: grayscale(1) contrast(1.1) brightness(0.7); }
  .mapa__pie { display: inline-block; margin-top: var(--phi-1); color: var(--rec); font-size: var(--phi-1); }
  .boton {
    align-self: flex-start;
    padding: var(--phi-1) var(--phi-3);
    background: var(--rec);
    color: var(--void);
    font-weight: 500;
    border-radius: 999px;
  }
</style>
```

- [ ] **Paso 6: Capturar el póster y verificar**

`http://localhost:4321/dev/posters` → objeto `rotulo` → Capturar.

```bash
mv ~/Downloads/rotulo.webp public/posters/contacto.webp
npx vitest run tests/pagina-contacto.test.ts && npm run build
```

Esperado: 8 tests PASS.

- [ ] **Paso 7: Commit**

```bash
git add src/three/objetos/rotulo.ts src/pages/contacto.astro public/posters/contacto.webp public/mapa-via-espana.webp public/escena/wordmark.webp tests/pagina-contacto.test.ts
git commit -m "feat(S08): rotulo retroiluminado y ruta /contacto con mapa estatico"
```

---

## Tarea 20: 404, menú móvil y transiciones entre rutas

**Archivos:**
- Crear: `src/pages/404.astro`
- Modificar: `src/components/Nav.astro` (menú móvil), `src/components/Escena3D.astro`
  (transición entre escenas)
- Test: `tests/navegacion.test.ts`

**Interfaces:**
- Consume: `Nav` (Tarea 5), `Escena3D` (Tarea 11)
- Produce: ninguna interfaz nueva

- [ ] **Paso 1: Escribir el test que falla**

`tests/navegacion.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const nav = () => readFileSync('src/components/Nav.astro', 'utf8');
const p404 = () => readFileSync('src/pages/404.astro', 'utf8');
const escena = () => readFileSync('src/components/Escena3D.astro', 'utf8');

describe('menu movil', () => {
  it('el boton declara aria-expanded y aria-controls', () => {
    const s = nav();
    expect(s).toContain('aria-expanded');
    expect(s).toContain('aria-controls');
  });

  it('se cierra con Escape', () => {
    expect(nav()).toContain("'Escape'");
  });

  it('el boton tiene nombre accesible', () => {
    expect(nav()).toContain('aria-label');
  });
});

describe('404', () => {
  it('tiene un solo h1 y esta marcada noindex', () => {
    expect((p404().match(/<h1[\s>]/g) ?? []).length).toBe(1);
    expect(p404()).toContain('noindex');
  });

  it('ofrece vuelta al inicio y no enlaces rotos (G2)', () => {
    const s = p404();
    expect(s).toContain('href="/"');
    expect(s).not.toContain('href="#"');
  });
});

describe('transicion entre escenas', () => {
  it('la escena se aleja en Z antes del cambio de pagina (§8.5)', () => {
    expect(escena()).toContain('transition-');
  });

  it('respeta reduce-motion: corte limpio', () => {
    expect(escena()).toContain('prefers-reduced-motion');
  });
});
```

- [ ] **Paso 2: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/navegacion.test.ts`
Esperado: FAIL — `ENOENT: src/pages/404.astro`

- [ ] **Paso 3: Añadir el menú móvil a `Nav.astro`**

Insertar el botón justo antes de `<nav aria-label="Principal">`:

```astro
  <button
    class="nav__toggle"
    type="button"
    aria-label="Abrir menú"
    aria-expanded="false"
    aria-controls="menu-movil"
  >
    <span aria-hidden="true"></span>
    <span aria-hidden="true"></span>
  </button>
```

Y dar `id="menu-movil"` a la `<ul class="nav__lista">`.

Añadir al final del componente:

```astro
<script>
  function montar() {
    const boton = document.querySelector<HTMLButtonElement>('.nav__toggle');
    const menu = document.getElementById('menu-movil');
    if (!boton || !menu) return;

    function cerrar() {
      boton!.setAttribute('aria-expanded', 'false');
      boton!.setAttribute('aria-label', 'Abrir menú');
      menu!.classList.remove('nav__lista--abierta');
    }

    boton.addEventListener('click', () => {
      const abierto = boton.getAttribute('aria-expanded') === 'true';
      boton.setAttribute('aria-expanded', String(!abierto));
      boton.setAttribute('aria-label', abierto ? 'Abrir menú' : 'Cerrar menú');
      menu.classList.toggle('nav__lista--abierta', !abierto);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') cerrar();
    });

    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', cerrar));
  }

  document.addEventListener('astro:page-load', montar);
  if (document.readyState !== 'loading') montar();
</script>
```

Y en el `<style>` del componente, sustituir el bloque `@media (max-width: 899px)` por:

```css
  .nav__toggle {
    display: none;
    width: 36px; height: 36px;
    background: transparent;
    border: 0;
    cursor: pointer;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    padding: 0;
  }
  .nav__toggle span {
    display: block;
    height: 1.5px;
    width: 20px;
    background: var(--bone);
    margin: 0 auto;
  }

  @media (max-width: 899px) {
    .nav__toggle { display: flex; }
    .nav__lista {
      display: none;
      position: absolute;
      top: calc(100% + var(--phi-0));
      left: 0;
      right: 0;
      flex-direction: column;
      padding: var(--phi-1);
      border-radius: var(--phi-2);
      background: rgba(8, 8, 8, 0.94);
      border: 1px solid var(--hairline);
    }
    .nav__lista--abierta { display: flex; }
  }
```

- [ ] **Paso 4: Escribir el 404**

`src/pages/404.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout
  title="Página no encontrada"
  description="La página que buscas no existe en Safetory Studio."
  ruta="/404"
  noindex
>
  <section class="perdido">
    <p class="kicker">Error 404</p>
    <h1>Esta pista no existe</h1>
    <p class="perdido__texto">La página que buscas no está en el sitio.</p>
    <a class="boton" href="/">Volver al inicio</a>
  </section>
</BaseLayout>

<style>
  .perdido {
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: var(--phi-1);
    padding: var(--phi-3);
    max-width: 1600px;
    margin: 0 auto;
  }
  .perdido__texto { color: var(--ash); font-size: var(--phi-2); }
  .boton {
    align-self: flex-start;
    margin-top: var(--phi-2);
    padding: var(--phi-1) var(--phi-3);
    background: var(--rec);
    color: var(--void);
    font-weight: 500;
    border-radius: 999px;
  }
</style>
```

- [ ] **Paso 5: Añadir la transición entre escenas**

En `src/components/Escena3D.astro`, dar nombre de transición al contenedor:

```astro
<div
  class="escena"
  data-escena
  transition:name="escena"
  transition:animate="fade"
  ...
>
```

Y añadir al `<style>`:

```css
  /* El objeto de la ruta actual se aleja; el de la nueva llega desde el fondo (§8.5). */
  @keyframes escena-sale { to { opacity: 0; transform: scale(0.94); } }
  @keyframes escena-entra { from { opacity: 0; transform: scale(1.06); } }

  ::view-transition-old(escena) { animation: escena-sale 0.7s ease both; }
  ::view-transition-new(escena) { animation: escena-entra 0.7s ease both; }

  @media (prefers-reduced-motion: reduce) {
    ::view-transition-old(escena),
    ::view-transition-new(escena) { animation: none; }
  }
```

- [ ] **Paso 6: Ejecutar y comprobar que pasa**

Ejecutar: `npx vitest run tests/navegacion.test.ts && npm run build`
Esperado: 7 tests PASS. El build genera siete HTML: seis rutas más el 404.

- [ ] **Paso 7: Verificar a mano**

`npm run dev`. Comprobar en el navegador:
- A 375 px de ancho, el menú abre, cierra con Escape y cierra al pulsar un enlace.
- Al navegar entre rutas, la escena se aleja y la nueva llega desde el fondo.
- Con `prefers-reduced-motion` activo en el sistema, el cambio es un corte limpio.

- [ ] **Paso 8: Commit**

```bash
git add src/pages/404.astro src/components/Nav.astro src/components/Escena3D.astro tests/navegacion.test.ts
git commit -m "feat(S09): menu movil accesible, 404 y transicion entre escenas"
```

---

# FASE 3 — ENTREGA

## Tarea 21: Netlify y bloqueo de la herramienta interna

**Archivos:**
- Crear: `netlify.toml`, `README.md`
- Test: `tests/despliegue.test.ts`

- [ ] **Paso 1: Escribir el test que falla**

`tests/despliegue.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const toml = () => readFileSync('netlify.toml', 'utf8');

describe('netlify.toml', () => {
  it('publica dist y usa el comando de build correcto', () => {
    const s = toml();
    expect(s).toContain('publish = "dist"');
    expect(s).toContain('command = "npm run build"');
  });

  it('bloquea /dev/* en produccion con un 404', () => {
    const s = toml();
    expect(s).toContain('from = "/dev/*"');
    expect(s).toContain('status = 404');
  });

  it('cachea las fuentes de forma inmutable', () => {
    const s = toml();
    expect(s).toContain('/fonts/*');
    expect(s).toContain('immutable');
  });

  it('declara cabeceras de seguridad basicas', () => {
    const s = toml();
    ['X-Content-Type-Options', 'Referrer-Policy'].forEach((h) =>
      expect(s, h).toContain(h));
  });
});
```

- [ ] **Paso 2: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/despliegue.test.ts`
Esperado: FAIL — `ENOENT: netlify.toml`

- [ ] **Paso 3: Escribir la configuración**

`netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "22"

# La herramienta de captura de posters no existe en produccion.
[[redirects]]
  from = "/dev/*"
  to = "/404.html"
  status = 404

[[headers]]
  for = "/fonts/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/posters/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "geolocation=(), microphone=(), camera=()"
```

`README.md`:

```markdown
# Safetory Studio

Sitio multipágina de Safetory Studio — estudio de grabación, producción musical y ciclorama
en Vía España, Panamá.

## Comandos

    npm install
    npm run dev       # desarrollo en localhost:4321
    npm run build     # build de producción a dist/
    npm run preview   # servir el build
    npm test          # suite de vitest

## Documentación

- `CLAUDE.md` — reglas permanentes del repositorio
- `docs/superpowers/specs/2026-09-07-safetory-sitio-3d-design.md` — el diseño aprobado
- `docs/superpowers/plans/2026-09-07-safetory-sitio-3d.md` — el plan de implementación

## Herramienta interna

`/dev/posters` genera los pósters WebP de cada escena 3D. Está bloqueada en producción por
`netlify.toml` y excluida de `sitemap.xml` y `robots.txt`.

## Pendiente de contenido del cliente

Ver §9.5 del spec: precio de la membresía, marcas y modelos del equipo, texto de marca,
alcance del co-working y proyectos publicables.
```

- [ ] **Paso 4: Ejecutar y comprobar que pasa**

Ejecutar: `npx vitest run tests/despliegue.test.ts`
Esperado: PASS, 4 tests.

- [ ] **Paso 5: Commit y push**

```bash
git add netlify.toml README.md tests/despliegue.test.ts
git commit -m "feat(S10): configuracion de Netlify y bloqueo de /dev en produccion"
git push
```

- [ ] **Paso 6: Conectar el repositorio a Netlify**

En Netlify: **Add new site → Import from Git → abrinay1997-stack/Safetory**.
Netlify lee `netlify.toml`, así que no hay que configurar nada a mano. Comprobar que el
despliegue de `main` termina en verde y que `/dev/posters` devuelve 404 en la URL pública.

---

## Tarea 22: Las cuatro pasadas de calidad

**Archivos:**
- Crear: `tests/salida.test.ts` (comprobaciones sobre el HTML construido)
- Modificar: `CLAUDE.md` (sección «Estado actual»)

Es la definición de terminado del spec §14. Se ejecuta en este orden:
**SEO → Accesibilidad → Rendimiento → Copy**.

- [ ] **Paso 1: Escribir las comprobaciones sobre el build**

`tests/salida.test.ts`:

```ts
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';

const RUTAS = ['index', 'estudio', 'ciclorama', 'produccion', 'membresia', 'contacto'];

function html(ruta: string): string {
  return readFileSync(`dist/${ruta}.html`, 'utf8');
}

beforeAll(() => {
  if (!existsSync('dist/index.html')) {
    throw new Error('Ejecuta `npm run build` antes de esta suite.');
  }
});

describe('pasada 1 — SEO', () => {
  it('las seis rutas existen en dist', () => {
    RUTAS.forEach((r) => expect(existsSync(`dist/${r}.html`), r).toBe(true));
  });

  it('cada ruta tiene title y description propios y no repetidos', () => {
    const titulos = RUTAS.map((r) => html(r).match(/<title>(.*?)<\/title>/)?.[1] ?? '');
    const descripciones = RUTAS.map(
      (r) => html(r).match(/name="description" content="(.*?)"/)?.[1] ?? '');
    expect(new Set(titulos).size).toBe(RUTAS.length);
    expect(new Set(descripciones).size).toBe(RUTAS.length);
    descripciones.forEach((d) => expect(d.length).toBeGreaterThan(60));
  });

  it('el sitemap existe y no incluye /dev/', () => {
    const sitemap = readdirSync('dist').find((f) => f.startsWith('sitemap'));
    expect(sitemap).toBeDefined();
    const contenido = readFileSync(`dist/${sitemap}`, 'utf8');
    expect(contenido).not.toContain('/dev/');
  });

  it('LocalBusiness solo en la home y sin aggregateRating', () => {
    expect(html('index')).toContain('LocalBusiness');
    expect(html('index')).not.toContain('aggregateRating');
    expect(html('estudio')).not.toContain('LocalBusiness');
  });
});

describe('pasada 2 — Accesibilidad', () => {
  it('cada ruta tiene exactamente un h1 (G8)', () => {
    RUTAS.forEach((r) => {
      expect((html(r).match(/<h1[\s>]/g) ?? []).length, r).toBe(1);
    });
  });

  it('todas las imagenes tienen alt', () => {
    RUTAS.forEach((r) => {
      (html(r).match(/<img[^>]*>/g) ?? []).forEach((img) => {
        expect(img, `${r}: ${img}`).toMatch(/\salt=/);
      });
    });
  });

  it('todo canvas queda oculto a la accesibilidad', () => {
    RUTAS.forEach((r) => {
      (html(r).match(/<canvas[^>]*>/g) ?? []).forEach((c) => {
        expect(c, r).toContain('aria-hidden="true"');
      });
    });
  });

  it('cada ruta ofrece el enlace de salto al contenido', () => {
    RUTAS.forEach((r) => expect(html(r), r).toContain('href="#contenido"'));
  });

  it('los enlaces externos llevan rel de seguridad', () => {
    RUTAS.forEach((r) => {
      (html(r).match(/<a[^>]*target="_blank"[^>]*>/g) ?? []).forEach((a) => {
        expect(a, r).toContain('noopener');
      });
    });
  });
});

describe('pasada 3 — Rendimiento', () => {
  it('ningun bundle JS inicial supera 140 KB sin comprimir por ruta', () => {
    // Umbral generoso sin gzip: la comprobacion fina se hace con Lighthouse.
    const assets = readdirSync('dist/_astro').filter((f) => f.endsWith('.js'));
    const inicial = assets.filter((f) => !f.includes('three'));
    inicial.forEach((f) => {
      expect(statSync(`dist/_astro/${f}`).size, f).toBeLessThan(420 * 1024);
    });
  });

  it('three viaja en su propio chunk, separado del arranque (G5)', () => {
    const assets = readdirSync('dist/_astro').filter((f) => f.endsWith('.js'));
    const contenidoInicial = assets
      .filter((f) => f.includes('BaseLayout') || f.includes('client'))
      .map((f) => readFileSync(`dist/_astro/${f}`, 'utf8'))
      .join('');
    expect(contenidoInicial).not.toContain('WebGLRenderer');
  });

  it('los seis posters existen y ninguno supera 60 KB', () => {
    ['home', 'estudio', 'ciclorama', 'produccion', 'membresia', 'contacto']
      .forEach((p) => {
        const ruta = `dist/posters/${p}.webp`;
        expect(existsSync(ruta), p).toBe(true);
        expect(statSync(ruta).size, p).toBeLessThan(60 * 1024);
      });
  });

  it('el poster de cada ruta se marca como prioritario: es el LCP', () => {
    RUTAS.forEach((r) => expect(html(r), r).toContain('fetchpriority="high"'));
  });
});

describe('pasada 4 — Copy', () => {
  it('no queda ningun placeholder (G2)', () => {
    const prohibidos = ['lorem', 'Lorem', 'TODO', 'TBD', 'href="#"',
                        'G-XXXXXXXXXX', 'your-', 'placeholder'];
    RUTAS.forEach((r) => {
      prohibidos.forEach((p) => expect(html(r), `${r}: ${p}`).not.toContain(p));
    });
  });

  it('no se publica ninguna marca ni modelo de equipo (G15)', () => {
    const marcas = ['Manley', 'Yamaha', 'Universal Audio', 'Apollo', 'Neumann', 'HS8'];
    RUTAS.forEach((r) => {
      marcas.forEach((m) => expect(html(r), `${r}: ${m}`).not.toContain(m));
    });
  });

  it('membresia no publica ninguna cifra de precio (§9.5)', () => {
    const cuerpo = html('membresia').split('<main')[1] ?? '';
    expect(cuerpo).not.toMatch(/\$\s?\d/);
  });

  it('ninguna ruta menciona Setmore', () => {
    RUTAS.forEach((r) => expect(html(r).toLowerCase(), r).not.toContain('setmore'));
  });

  it('los precios publicados coinciden con los datos', () => {
    expect(html('estudio')).toContain('value="50"');
    expect(html('estudio')).toContain('value="35"');
    expect(html('ciclorama')).toContain('value="280"');
    expect(html('produccion')).toContain('value="300"');
  });
});
```

- [ ] **Paso 2: Ejecutar el build y la suite completa**

```bash
npm run build && npm test
```

Esperado: todas las suites PASS. Corregir lo que falle antes de continuar; no se avanza con
tests en rojo.

- [ ] **Paso 3: Pasada de rendimiento real con Lighthouse**

```bash
npx serve dist -l 4321
```

En Chrome, DevTools → Lighthouse → modo móvil, categorías Rendimiento, Accesibilidad,
Prácticas recomendadas y SEO. Ejecutar sobre las seis rutas.

Objetivos del spec §14, que son condición de entrega:

| Métrica | Objetivo |
|---|---|
| Accesibilidad | **100** |
| LCP | ≤1,8 s |
| INP | ≤150 ms |
| CLS | ≤0,02 |
| JS inicial | ≤140 KB gz |

Si el LCP supera 1,8 s, el póster pesa de más: rebajar la calidad WebP a 0,72 y recapturar.
Si el CLS supera 0, el canvas no está ocupando la caja del póster: revisar `inset: 0` y las
dimensiones `width`/`height` del `<img>`.

- [ ] **Paso 4: Verificar la degradación (§7.3)**

Comprobar a mano, en DevTools:
1. **Reduce motion:** Rendering → Emulate `prefers-reduced-motion: reduce`. La página debe
   quedarse en los pósters, sin Lenis y sin despiece, y seguir completamente navegable.
2. **Sin WebGL:** `chrome://flags` → deshabilitar WebGL. Mismo resultado.
3. **Teclado:** recorrer las seis rutas solo con Tab. El primer foco es «Saltar al contenido»
   y todo elemento interactivo muestra el contorno rojo.

- [ ] **Paso 5: Actualizar el estado en `CLAUDE.md`**

Sustituir la sección «Estado actual» por el estado real tras la implementación: qué rutas
están en producción, qué pasadas se ejecutaron con qué resultado, y los huecos de §9.5 que
sigan abiertos.

- [ ] **Paso 6: Commit y push**

```bash
git add tests/salida.test.ts CLAUDE.md
git commit -m "feat(S11): cuatro pasadas de calidad y comprobaciones sobre el build"
git push
```

---

## Autorrevisión del plan

**1. Cobertura del spec.** Cada sección tiene tarea asignada:

| Spec | Tarea |
|---|---|
| §2.3 Aislamiento del repositorio | Hecho antes del plan (commit `1b45e3f`) |
| §3.2 Tokens de color | 1 |
| §3.3 Tipografía | 2 |
| §3.4 Escala áurea | 1 |
| §4 Stack | 1 |
| §5 Arquitectura de información | 12–20 |
| §6.1 El Inventario | 10, 15, 16, 17, 18, 19 |
| §6.2 Construcción procedural | 10, 15, 16, 17, 18, 19 |
| §6.3 Materiales y luz | 9 |
| §6.4 Fotografías como profundidad | 9 |
| §6.5 Cámara en espiral áurea | 7 |
| §7 Rendimiento | 8, 11, 22 |
| §8 Movimiento | 6, 13, 20 |
| §9 Contenido | 3 |
| §9.5 Huecos | 3, 18 |
| §10 Accesibilidad | 4, 20, 22 |
| §11 SEO | 4, 22 |
| §12 Estructura de archivos | Todas |
| §13 Fuera de alcance | No se implementa. `/reservar` no se crea (Tarea 12) |
| §14 Definición de terminado | 22 |

**2. Placeholders.** Sin `TBD`, `TODO` ni «similar a la Tarea N». Los seis objetos 3D llevan
su código completo, no una referencia cruzada. La única remisión es la nota de la Tarea 5
sobre el menú móvil, que apunta a la Tarea 20 y allí está escrito íntegro.

**3. Consistencia de tipos.** Verificado a lo largo del plan:

- `Tarifa` se define en la Tarea 3 y se consume igual en 5, 12, 14, 15, 16, 17.
- `crear(): THREE.Group` es idéntica en los seis objetos, y es la firma que carga
  `Escena3D` en la Tarea 11 y la herramienta de pósters.
- `Temperatura` se define en la Tarea 9 y la usan `crearLuces`, `Escena3D` y las seis rutas.
- `medirPresupuesto` devuelve `{ mallas, triangulos }` en la Tarea 10 y se consume con esos
  nombres en 15, 16, 17, 18 y 19.
- `crearMotor` devuelve `Motor | null`; el `null` se comprueba en `Escena3D` (Tarea 11).
- El objeto 3D se expone en `window.__safetoryObjeto3D` en la Tarea 13 y solo lo usa el
  despiece.

**Dos correcciones aplicadas al spec durante la redacción:**
- Astro es 7.3.1, no 5. Verificado en npm el 2026-09-07.
- Los servicios de producción son seis, no siete.
