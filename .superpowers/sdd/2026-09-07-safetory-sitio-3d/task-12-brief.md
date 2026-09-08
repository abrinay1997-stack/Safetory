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

