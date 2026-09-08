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

