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

  // Un solo mecanismo de arranque: ClientRouter engancha astro:page-load al
  // evento nativo `load`, asi que tambien dispara en la carga inicial. Anadir
  // un segundo arranque con document.readyState monta el sistema dos veces.
  document.addEventListener('astro:page-load', montar);
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

