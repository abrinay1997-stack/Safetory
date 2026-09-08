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
import { ruta } from '../data/rutas';

interface Props {
  numero: string;
  nombre: string;
  /** Precio de entrada ya formateado, o cadena vacía si no hay dato (§9.5). */
  desde: string;
  href: string;
}
const { numero, nombre, desde, href } = Astro.props;

// Los cuatro enlaces de territorio son la navegación primaria de la portada.
// Sin la base, en el preview apuntan fuera del sitio: /estudio en vez de
// /Safetory/estudio. Se aplica aquí y no en las cuatro llamadas, para que sea
// un solo sitio el que tenga que acordarse. `ruta()` es idempotente.
const destino = ruta(href);
---

<section class="territorio">
  <a class="territorio__enlace" href={destino}>
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

