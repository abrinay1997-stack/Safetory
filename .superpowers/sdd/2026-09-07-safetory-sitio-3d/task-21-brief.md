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

## Tarea 21: Despliegue — Netlify en producción, GitHub Pages como preview

**Archivos:**
- Crear: `netlify.toml`, `.github/workflows/preview.yml`, `README.md`, `src/pages/404.astro`
- Test: `tests/despliegue.test.ts`

> **La página 404 se adelanta aquí desde la Tarea 20.** Es la pieza más pequeña que ejercita
> el sistema de diseño completo —layout, navegación, pie, las dos tipografías y los tokens de
> color— y sin ella el preview publicaría un sitio vacío. Con ella, el cliente puede ver el
> aspecto real del sitio en un navegador y corregir el rumbo antes de que existan seis páginas
> construidas encima.

**Interfaces:**
- Consume: las variables de entorno que la Tarea 23 introdujo en `astro.config.mjs`
  (`SITE_URL`, `URL`, `BASE_PATH`, `PUBLIC_PREVIEW`)

### Los dos destinos

| | Producción | Preview |
|---|---|---|
| **Dónde** | Netlify | GitHub Pages |
| **URL** | raíz del dominio | `abrinay1997-stack.github.io/Safetory` |
| **Base** | ninguna | `/Safetory` |
| **Indexable** | sí | **no**, nunca |
| **Cuándo** | push a `main` | push a cualquier rama y cada PR |

El preview existe para mirar el sitio antes de publicarlo. Por eso se construye con
`PUBLIC_PREVIEW=true`, que marca todas las rutas como `noindex`: un preview indexado
compite en Google con la producción por el mismo contenido.

- [ ] **Paso 1: Escribir el test que falla**

`tests/despliegue.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const toml = () => readFileSync('netlify.toml', 'utf8');
const flujo = () => readFileSync('.github/workflows/preview.yml', 'utf8');

describe('netlify.toml — produccion', () => {
  it('publica dist con el comando de build correcto', () => {
    const s = toml();
    expect(s).toContain('publish = "dist"');
    expect(s).toContain('command = "npm run build"');
  });

  it('no fija BASE_PATH: produccion se sirve desde la raiz', () => {
    expect(toml()).not.toContain('BASE_PATH');
  });

  it('bloquea /dev/* con un 404', () => {
    const s = toml();
    expect(s).toContain('from = "/dev/*"');
    expect(s).toContain('status = 404');
  });

  it('cachea fuentes y posters de forma inmutable', () => {
    const s = toml();
    expect(s).toContain('/fonts/*');
    expect(s).toContain('/posters/*');
    expect(s).toContain('immutable');
  });

  it('declara cabeceras de seguridad basicas', () => {
    const s = toml();
    ['X-Content-Type-Options', 'Referrer-Policy'].forEach((h) =>
      expect(s, h).toContain(h));
  });
});

describe('pagina 404', () => {
  const p404 = () => readFileSync('src/pages/404.astro', 'utf8');

  it('tiene un solo h1 y esta marcada noindex', () => {
    expect((p404().match(/<h1[\s>]/g) ?? []).length).toBe(1);
    expect(p404()).toContain('noindex');
  });

  it('ofrece vuelta al inicio a traves del helper de ruta base (G2)', () => {
    const s = p404();
    // El fuente no contiene href="/" literal: la ruta pasa por el helper.
    expect(s).toContain("ruta('/')");
    expect(s).not.toContain('href="#"');
  });

  it('declara title y description propios', () => {
    const s = p404();
    expect(s).toMatch(/title="[^"]{5,}"/);
    expect(s).toMatch(/description="[^"]{20,}"/);
  });
});

describe('workflow de preview', () => {
  it('construye con la base y la marca de preview', () => {
    const s = flujo();
    expect(s).toContain('BASE_PATH: /Safetory');
    expect(s).toContain("PUBLIC_PREVIEW: 'true'");
  });

  it('ejecuta la suite antes de publicar nada', () => {
    const s = flujo();
    expect(s).toContain('npm test');
    expect(s.indexOf('npm test')).toBeLessThan(s.indexOf('upload-pages-artifact'));
  });

  it('usa el flujo oficial de Pages, sin token de terceros', () => {
    const s = flujo();
    expect(s).toContain('actions/upload-pages-artifact');
    expect(s).toContain('actions/deploy-pages');
    expect(s).not.toContain('peaceiris/actions-gh-pages');
  });

  it('declara los permisos minimos que exige Pages', () => {
    const s = flujo();
    ['pages: write', 'id-token: write', 'contents: read']
      .forEach((p) => expect(s, p).toContain(p));
  });

  it('fija la version de Node que usa el proyecto', () => {
    expect(flujo()).toContain("node-version: '22'");
  });

  it('cachea las dependencias para que el preview sea rapido', () => {
    expect(flujo()).toContain("cache: 'npm'");
  });
});
```

- [ ] **Paso 2: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/despliegue.test.ts`
Esperado: FAIL — `ENOENT: netlify.toml`

- [ ] **Paso 3: Escribir `netlify.toml`**

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "22"

# Produccion se sirve desde la raiz del dominio: sin BASE_PATH.
# `URL` la define Netlify sola y astro.config la lee como `site`.

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

- [ ] **Paso 4: Escribir el workflow de preview**

`.github/workflows/preview.yml`:

```yaml
name: Preview

on:
  push:
    branches: ['**']
  pull_request:
  workflow_dispatch:

# Permisos minimos que exige el despliegue oficial de Pages.
permissions:
  contents: read
  pages: write
  id-token: write

# Un preview a la vez: si llegan dos pushes seguidos, gana el ultimo.
concurrency:
  group: preview
  cancel-in-progress: true

jobs:
  construir:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5

      - uses: actions/setup-node@v5
        with:
          node-version: '22'
          cache: 'npm'

      - run: npm ci

      # La suite corre antes de publicar: un preview roto no aporta nada.
      - run: npm test

      - name: Construir el preview
        env:
          SITE_URL: https://abrinay1997-stack.github.io
          BASE_PATH: /Safetory
          PUBLIC_PREVIEW: 'true'
        run: npm run build

      - uses: actions/upload-pages-artifact@v4
        with:
          path: dist

  publicar:
    needs: construir
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.despliegue.outputs.page_url }}
    steps:
      - id: despliegue
        uses: actions/deploy-pages@v4
```

La URL del preview aparece en la pestaña **Actions**, en el resumen del workflow, y también
en **Settings → Pages** una vez publicado.

- [ ] **Paso 5: Escribir la pagina 404**

`src/pages/404.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { ruta } from '../data/rutas';
---

<BaseLayout
  title="Página no encontrada"
  description="La página que buscas no existe en Safetory Studio."
  ruta="/404"
  noindex
>
  <section class="perdido">
    <p class="kicker">Error 404</p>
    <h1 data-titular>Esta pista no existe</h1>
    <p class="perdido__texto">La página que buscas no está en el sitio.</p>
    <a class="boton" href={ruta('/')}>Volver al inicio</a>
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
    transition: transform 0.2s;
  }
  .boton:hover { transform: translateY(-2px); }
</style>
```

Con esta página el build deja de emitir cero rutas: el sitemap se genera y el preview tiene
algo que servir. En GitHub Pages, `404.html` se sirve automáticamente ante cualquier ruta que
no exista, así que la raíz del preview mostrará esta página hasta que llegue la Tarea 12.

- [ ] **Paso 6: Escribir el README**

`README.md`:

```markdown
# Safetory Studio

Sitio multipágina de Safetory Studio — estudio de grabación, producción musical y ciclorama
en Vía España, Panamá.

