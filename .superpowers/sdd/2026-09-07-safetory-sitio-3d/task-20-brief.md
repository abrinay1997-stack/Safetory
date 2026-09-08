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

## Tarea 20: 404, menú móvil y transiciones entre rutas

**Archivos:**
- Modificar: `src/components/Nav.astro` (menú móvil), `src/components/Escena3D.astro`
  (transición entre escenas)

> La página `404.astro` **no es de esta tarea**: se adelantó a la Tarea 21 para tener algo
> publicado en el preview antes de que existieran las rutas reales.
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
Esperado: FAIL — el test del menú móvil no encuentra `aria-expanded`.

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
Esperado: 5 tests PASS. El build genera siete HTML: seis rutas más el 404.

- [ ] **Paso 7: Verificar a mano**

`npm run dev`. Comprobar en el navegador:
- A 375 px de ancho, el menú abre, cierra con Escape y cierra al pulsar un enlace.
- Al navegar entre rutas, la escena se aleja y la nueva llega desde el fondo.
- Con `prefers-reduced-motion` activo en el sistema, el cambio es un corte limpio.

- [ ] **Paso 8: Commit**

```bash
git add src/components/Nav.astro src/components/Escena3D.astro tests/navegacion.test.ts
git commit -m "feat(S09): menu movil accesible y transicion entre escenas"
```

---

# FASE 3 — ENTREGA

