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

