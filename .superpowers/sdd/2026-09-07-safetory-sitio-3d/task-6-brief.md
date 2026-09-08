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

  it('libera el callback del ticker de gsap al destruir', () => {
    const src = smooth();
    expect(src).toContain('gsap.ticker.remove(tick)');
    // Una funcion anonima acumularia un callback por navegacion sin liberarse.
    expect(src).not.toMatch(/gsap\.ticker\.add\(\(/);
  });

  it('no monta el sistema dos veces en la carga inicial', () => {
    const src = smooth();
    // astro:page-load ya se dispara en la carga inicial: un segundo mecanismo
    // basado en readyState duplicaba el montaje en toda visita.
    expect(src).not.toContain('readyState');
    expect(src).not.toContain('DOMContentLoaded');
    expect(src).toContain('if (lenis) return');
  });

  it('solo limpia al salir, nunca al entrar', () => {
    const src = smooth();
    // Limpiar al entrar mataria los ScrollTrigger que Reveal acaba de crear.
    const entrada = src.slice(
      src.indexOf('astro:page-load'),
      src.indexOf('astro:before-swap'),
    );
    expect(entrada).not.toContain('destruir');
    expect(entrada).not.toContain('matarTriggers');
  });
});

describe('Reveal', () => {
  const reveal = () => readFileSync('src/components/Reveal.astro', 'utf8');

  it('usa un solo mecanismo de arranque', () => {
    expect(reveal()).not.toContain('readyState');
    expect(reveal()).toContain('astro:page-load');
  });
});

describe('registro de triggers', () => {
  it('mata solo los triggers propios, no los de toda la aplicacion', () => {
    const src = motion();
    // ScrollTrigger.getAll() incluiria los de otros modulos creados en el mismo
    // tick, y gsap.from() los dejaria clavados en opacity 0.
    expect(src).not.toContain('ScrollTrigger.getAll()');
    expect(src).toContain('propios');
  });

  it('las animaciones apuntan su trigger en el registro', () => {
    expect((motion().match(/apuntar\(/g) ?? []).length).toBe(4);
  });

  it('revelarEntrada y contarCifra tienen guarda de idempotencia', () => {
    const src = motion();
    expect(src).toContain("dataset.entrada === 'si'");
    expect(src).toContain("dataset.contada === 'si'");
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

/**
 * Registro propio de ScrollTrigger. `ScrollTrigger.getAll()` devuelve los de
 * toda la aplicacion: matarlos todos destruiria tambien los que otro modulo
 * acabe de crear en el mismo tick. Cada trigger creado aqui se apunta, y solo
 * se matan los propios.
 */
const propios: ScrollTrigger[] = [];

function apuntar(tween: gsap.core.Tween): void {
  const t = tween.scrollTrigger;
  if (t) propios.push(t);
}

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
  propios.forEach((t) => t.kill());
  propios.length = 0;
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

  apuntar(gsap.from(partido.chars, {
    yPercent: 110,
    opacity: 0,
    duration: 0.9,
    ease: 'power3.out',
    stagger: 0.018,
    scrollTrigger: { trigger: el, start: 'top 82%', once: true },
  }));
}

/** Entrada sobria y escalonada. Solo transform y opacity. */
export function revelarEntrada(els: HTMLElement[]): void {
  if (prefersReducedMotion() || els.length === 0) return;
  if (els[0].dataset.entrada === 'si') return;
  els[0].dataset.entrada = 'si';

  apuntar(gsap.from(els, {
    y: 24,
    opacity: 0,
    duration: 0.7,
    ease: 'power2.out',
    stagger: 0.06,
    scrollTrigger: { trigger: els[0], start: 'top 85%', once: true },
  }));
}

/** Cifra de tarifa que cuenta hasta su valor. No toca el layout. */
export function contarCifra(el: HTMLElement, hasta: number): void {
  if (el.dataset.contada === 'si') return;
  el.dataset.contada = 'si';

  if (prefersReducedMotion()) {
    el.textContent = `$${hasta}`;
    return;
  }
  const estado = { valor: 0 };
  apuntar(gsap.to(estado, {
    valor: hasta,
    duration: 1.1,
    ease: 'power2.out',
    onUpdate: () => { el.textContent = `$${Math.round(estado.valor)}`; },
    scrollTrigger: { trigger: el, start: 'top 88%', once: true },
  }));
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
  let tick: ((tiempo: number) => void) | null = null;

  function iniciar() {
    registrarPlugins();
    if (lenis) return; // ya montado: astro:page-load puede repetirse
    if (prefersReducedMotion()) return;

    lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.4,
    });

    lenis.on('scroll', ScrollTrigger.update);

    // La referencia se guarda para poder retirarla: gsap.ticker.add() con una
    // funcion anonima acumula un callback por navegacion que nunca se libera.
    tick = (tiempo: number) => lenis?.raf(tiempo * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
  }

  function destruir() {
    if (tick) {
      gsap.ticker.remove(tick);
      tick = null;
    }
    lenis?.destroy();
    lenis = null;
    matarTriggers();
  }

  // Se limpia SOLO al salir de la pagina. Limpiar tambien al entrar mataria los
  // ScrollTrigger que Reveal acaba de crear: en BaseLayout el contenido va antes
  // que SmoothScroll, asi que Reveal corre primero en el mismo tick y sus
  // elementos se quedarian clavados en opacity 0.
  document.addEventListener('astro:page-load', () => {
    iniciar();
    refrescarTriggers();
  });
  document.addEventListener('astro:before-swap', destruir);

  // Sin arranque manual: ClientRouter dispara astro:page-load tambien en la
  // carga inicial, enganchado al evento nativo `load`. Anadir un segundo
  // mecanismo montaba el sistema dos veces en cada visita.
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

  // Un solo mecanismo: ClientRouter dispara astro:page-load tambien en la carga
  // inicial. Las tres funciones llevan ademas su propia guarda de idempotencia.
  document.addEventListener('astro:page-load', aplicar);
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

