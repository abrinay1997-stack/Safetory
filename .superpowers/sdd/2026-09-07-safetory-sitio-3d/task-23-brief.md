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

## Tarea 23: Ruta base configurable y preview de GitHub Pages

> **Orden de ejecución:** esta tarea va **inmediatamente después de la Tarea 5**, no al final.
> Está numerada 23 para no renumerar el resto del plan.

**Archivos:**
- Crear: `src/data/rutas.ts`, `public/.nojekyll`
- Modificar: `astro.config.mjs`, `src/layouts/BaseLayout.astro`, `src/components/Nav.astro`,
  `src/components/Footer.astro`
- Test: `tests/rutas.test.ts`

**Interfaces:**
- Produce: `ruta(p: string): string` — antepone la ruta base del despliegue a una ruta
  absoluta interna. **A partir de aquí ninguna ruta interna se escribe a mano.**

### Por qué esta tarea existe

El sitio tiene **dos destinos con forma distinta**:

| Destino | URL | Base |
|---|---|---|
| **Producción** — Netlify | raíz del dominio | ninguna |
| **Preview** — GitHub Pages vía Actions | `abrinay1997-stack.github.io/Safetory` | `/Safetory` |

Una ruta escrita como `/posters/home.webp` funciona en Netlify y **rompe en el preview**,
porque allí el sitio cuelga de un subdirectorio. El fallo es traicionero: `astro dev` sirve
desde la raíz, así que en desarrollo todo se ve bien y la imagen solo desaparece después de
publicar el preview.

La base no puede quedar fija en el código: se decide en tiempo de build, por variable de
entorno. `import.meta.env.BASE_URL` la expone al cliente, y el helper `ruta()` la aplica.

- [ ] **Paso 1: Escribir el test que falla**

`tests/rutas.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { ruta, aplicarBase } from '../src/data/rutas';

const leer = (f: string) => readFileSync(f, 'utf8');

describe('helper de ruta base', () => {
  // Sin BASE_PATH definido (el caso de Netlify y de `astro dev`), la base es
  // la raiz y el helper es practicamente la identidad.
  it('deja la ruta intacta cuando no hay base', () => {
    expect(ruta('/posters/home.webp')).toBe('/posters/home.webp');
  });

  it('la raiz sigue siendo la raiz', () => {
    expect(ruta('/')).toBe('/');
  });

  it('deja intactas las URL y esquemas externos', () => {
    expect(ruta('https://wa.me/50767998881')).toBe('https://wa.me/50767998881');
    expect(ruta('mailto:info@safetoryglobal.com')).toBe('mailto:info@safetoryglobal.com');
    expect(ruta('tel:+50767998881')).toBe('tel:+50767998881');
    expect(ruta('#contenido')).toBe('#contenido');
  });

  it('nunca produce una barra doble', () => {
    ['/', '/estudio', '/posters/home.webp'].forEach((p) => {
      expect(ruta(p), p).not.toMatch(/\/\//);
    });
  });
});

describe('la rama con base, que es la del preview', () => {
  // `BASE_URL` se fija en tiempo de build, asi que la rama con base solo se
  // puede ejercitar a traves de la funcion pura. Sin esto, el caso que de
  // verdad rompe en produccion se quedaria sin cobertura.
  const B = '/Safetory/';

  it('antepone la base a una ruta interna', () => {
    expect(aplicarBase(B, '/posters/home.webp')).toBe('/Safetory/posters/home.webp');
  });

  it('la raiz del sitio queda en la base, sin barra sobrante', () => {
    expect(aplicarBase(B, '/')).toBe('/Safetory');
  });

  it('es idempotente: aplicarla dos veces no duplica la base', () => {
    ['/', '/estudio', '/posters/home.webp'].forEach((p) => {
      const una = aplicarBase(B, p);
      expect(aplicarBase(B, una), p).toBe(una);
    });
  });

  it('sigue dejando intactos los esquemas externos', () => {
    ['https://wa.me/50767998881', 'mailto:info@safetoryglobal.com',
     'tel:+50767998881', '#contenido'].forEach((p) => {
      expect(aplicarBase(B, p), p).toBe(p);
    });
  });

  it('nunca produce una barra doble', () => {
    ['/', '/estudio', '/posters/home.webp'].forEach((p) => {
      expect(aplicarBase(B, p), p).not.toMatch(/\/\//);
    });
  });
});

describe('configuracion de despliegue', () => {
  const cfg = () => leer('astro.config.mjs');

  it('la base se toma del entorno, nunca fija en el codigo', () => {
    expect(cfg()).toContain('BASE_PATH');
    expect(cfg()).not.toContain("base: '/Safetory'");
  });

  it('el site tambien se toma del entorno, con Netlify como respaldo', () => {
    const s = cfg();
    expect(s).toContain('SITE_URL');
    expect(s).toContain('process.env.URL');
  });

  it('existe .nojekyll: GitHub Pages ignora los directorios con guion bajo', () => {
    expect(existsSync('public/.nojekyll')).toBe(true);
  });
});

describe('el preview nunca se indexa', () => {
  it('BaseLayout marca noindex cuando el build es de preview', () => {
    const src = leer('src/layouts/BaseLayout.astro');
    expect(src).toContain('PREVIEW');
    expect(src).toContain('noindex');
  });
});

describe('ninguna ruta interna escrita a mano', () => {
  const ARCHIVOS = [
    'src/components/Nav.astro',
    'src/components/Footer.astro',
  ];

  it('los componentes de navegacion usan el helper', () => {
    ARCHIVOS.forEach((f) => {
      const src = leer(f);
      const crudas = src.match(/href="\/[^"]*"/g) ?? [];
      expect(crudas, `${f}: ${crudas.join(', ')}`).toEqual([]);
      expect(src, f).toContain("from '../data/rutas'");
    });
  });

  it('Nav sigue declarando las seis rutas logicas en su array', () => {
    const src = leer('src/components/Nav.astro');
    ['/', '/estudio', '/ciclorama', '/produccion', '/membresia', '/contacto']
      .forEach((r) => expect(src, r).toContain(`href: '${r}'`));
  });
});
```

- [ ] **Paso 2: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/rutas.test.ts`
Esperado: FAIL — `Cannot find module '../src/data/rutas'`

- [ ] **Paso 3: Escribir el helper**

`src/data/rutas.ts`:

```ts
/**
 * Antepone la ruta base del despliegue a una ruta absoluta interna.
 *
 * El sitio se publica en dos sitios con forma distinta: Netlify lo sirve desde
 * la raíz del dominio y el preview de GitHub Pages desde `/Safetory`. Una ruta
 * escrita a mano funciona en uno y rompe en el otro, y el fallo no se ve en
 * desarrollo: solo aparece después de publicar.
 *
 * `BASE_URL` lo fija Astro en tiempo de build desde `BASE_PATH`. Sin esa
 * variable vale `/` y esta función se comporta como la identidad.
 */
/** Esquemas y anclas que nunca llevan base. */
const EXTERNA = /^(https?:|mailto:|tel:|data:|#)/;

/**
 * La lógica pura, con la base como parámetro. Se exporta para poder probar
 * las dos ramas —con base y sin ella— desde una misma suite: `BASE_URL` se
 * fija en tiempo de build y un test no puede cambiarla.
 *
 * Es idempotente: aplicarla dos veces sobre el mismo valor no duplica la base.
 */
export function aplicarBase(base: string, p: string): string {
  const b = base.replace(/\/$/, '');
  if (EXTERNA.test(p)) return p;
  if (b && (p === b || p.startsWith(`${b}/`))) return p;
  if (p === '/') return b || '/';
  return `${b}${p}`;
}

export function ruta(p: string): string {
  return aplicarBase(import.meta.env.BASE_URL, p);
}
```

- [ ] **Paso 4: Configurar Astro por entorno**

Sustituir el principio de `astro.config.mjs`:

```js
// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * El sitio se construye para dos destinos:
 *
 *   Netlify (producción)  →  raíz del dominio, sin base
 *   GitHub Pages (preview) →  /Safetory, con base
 *
 * Nada de esto se fija en el código: lo deciden las variables de entorno del
 * build. `URL` la define Netlify automáticamente.
 */
const SITE = process.env.SITE_URL || process.env.URL || 'https://safetory.netlify.app';
const BASE = process.env.BASE_PATH || undefined;

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'auto' },
  compressHTML: true,
  integrations: [
    sitemap({ filter: (page) => !page.includes('/dev/') }),
  ],
});
```

Crear `public/.nojekyll` **vacío**. GitHub Pages ignora por omisión los directorios que
empiezan por guion bajo, y Astro emite todos sus assets en `_astro/`. Sin ese archivo el
preview se publica sin CSS ni JavaScript.

```bash
touch public/.nojekyll
```

`public/robots.txt` **no se toca**: apunta al dominio de producción, que es el único que
debe indexarse.

- [ ] **Paso 5: Marcar el preview como no indexable en `BaseLayout.astro`**

Un preview indexado compite en Google con la producción por el mismo contenido. El build de
preview marca todas las rutas como `noindex`.

Añadir el import junto a los demás:

```astro
import { ruta } from '../data/rutas';
```

Añadir, junto al resto de constantes del frontmatter:

```astro
// Los builds de preview (GitHub Pages) nunca se indexan: competirían con
// producción por el mismo contenido.
const ES_PREVIEW = import.meta.env.PUBLIC_PREVIEW === 'true';
```

Sustituir la línea del `<meta name="robots">`:

```astro
    {(noindex || ES_PREVIEW) && <meta name="robots" content="noindex, nofollow" />}
```

Aplicar el helper a los dos `<link rel="preload">`:

```astro
    <link rel="preload" href={ruta('/fonts/ClashDisplay-Semibold.woff2')} as="font" type="font/woff2" crossorigin />
    <link rel="preload" href={ruta('/fonts/Satoshi-Regular.woff2')} as="font" type="font/woff2" crossorigin />
```

Renombrar la prop desestructurada para no chocar con el helper, y usar el nuevo nombre en
las tres derivaciones y en el `<Nav>`:

```astro
const { title, description, ruta: rutaProp, poster, noindex = false } = Astro.props;
...
const canonica = new URL(ruta(rutaProp), base).toString();
const ogImagen = new URL(ruta(poster ?? '/posters/home.webp'), base).toString();
const esHome = rutaProp === '/';
...
    <Nav ruta={rutaProp} />
```

**No toques `href="#contenido"`** del enlace de salto: es un ancla de la misma página y no
lleva base.

- [ ] **Paso 6: Aplicar el helper en `Nav.astro` y `Footer.astro`**

En ambos:

```astro
import { ruta } from '../data/rutas';
```

En `Nav.astro`, el array `enlaces` **no cambia** —guarda las rutas lógicas—, pero el marcado
las pasa por el helper. Renombra también la prop:

```astro
interface Props { ruta: string }
const { ruta: rutaActiva } = Astro.props;
```

```astro
  <a class="nav__marca" href={ruta('/')}>Safetory<span class="nav__punto">®</span></a>
  ...
        <a href={ruta(e.href)} aria-current={rutaActiva === e.href ? 'page' : undefined}>{e.texto}</a>
```

En `Footer.astro`, los cinco enlaces de sección:

```astro
    {enlaces.map((e) => <a href={ruta(e.href)}>{e.texto}</a>)}
```

`telefonoE164`, el `mailto:` y el enlace de Instagram no se tocan.

- [ ] **Paso 7: Verificar los dos modos de build**

```bash
npm test
```

Y comprobar que la base se aplica solo cuando toca. Con `SmoothScroll` aún sin existir el
build fallará; si esta tarea se ejecuta antes que la Tarea 6, salta este paso y hazlo al
terminar aquélla:

```bash
npm run build
grep -c '"/_astro/' dist/index.html        # produccion: rutas desde la raiz

BASE_PATH=/Safetory PUBLIC_PREVIEW=true npm run build
grep -c '"/Safetory/_astro/' dist/index.html   # preview: rutas con prefijo
grep -c 'noindex' dist/index.html              # preview: no indexable
```

- [ ] **Paso 8: Commit**

```bash
git add astro.config.mjs public/.nojekyll src/data/rutas.ts src/layouts/BaseLayout.astro src/components/Nav.astro src/components/Footer.astro tests/rutas.test.ts
git commit -m "feat(S00): ruta base configurable por entorno y preview no indexable"
```

---

