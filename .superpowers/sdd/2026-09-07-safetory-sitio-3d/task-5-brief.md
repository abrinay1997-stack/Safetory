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

