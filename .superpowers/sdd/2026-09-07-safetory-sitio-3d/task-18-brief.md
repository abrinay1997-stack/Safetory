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

## Tarea 18: Plato y la ruta `/membresia`

**Archivos:**
- Crear: `src/three/objetos/plato.ts`, `src/pages/membresia.astro`
- Crear: `public/posters/membresia.webp`
- Test: `tests/pagina-membresia.test.ts`

**Interfaces:**
- Produce: `plato.crear(): THREE.Group` con nombre `plato` e hijos
  `base`, `disco`, `etiqueta`, `brazo`, `capsula`

- [ ] **Paso 1: Escribir el test que falla**

`tests/pagina-membresia.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { medirPresupuesto, LIMITE_MALLAS, LIMITE_TRIANGULOS } from '../src/three/presupuesto';
import { crear } from '../src/three/objetos/plato';
import { incluidoMembresia } from '../src/data/membresia';

const pagina = () => readFileSync('src/pages/membresia.astro', 'utf8');

describe('objeto plato', () => {
  const obj = crear();

  it('cabe en el presupuesto de escena', () => {
    const p = medirPresupuesto(obj);
    expect(p.mallas).toBeLessThanOrEqual(LIMITE_MALLAS);
    expect(p.triangulos).toBeLessThanOrEqual(LIMITE_TRIANGULOS);
  });

  it('tiene disco y brazo', () => {
    expect(obj.getObjectByName('disco')).toBeDefined();
    expect(obj.getObjectByName('brazo')).toBeDefined();
  });
});

describe('ruta /membresia', () => {
  it('tiene un solo h1 (G8)', () => {
    expect((pagina().match(/<h1[\s>]/g) ?? []).length).toBe(1);
  });

  it('NO inventa precio de membresia: el dato no existe (§9.5)', () => {
    const s = pagina();
    expect(s).not.toMatch(/\$\s?\d/);
    expect(s).not.toMatch(/\d+\s*(al mes|mensual|\/mes)/i);
  });

  it('el CTA lleva a consultar, no a comprar', () => {
    const s = pagina();
    expect(s).toContain('Consultar membresía');
    expect(s).toContain('enlaceWhatsApp');
  });

  it('lista lo incluido desde los datos', () => {
    expect(incluidoMembresia).toHaveLength(2);
    expect(pagina()).toContain('incluidoMembresia');
  });

  it('el poster existe', () => {
    expect(existsSync('public/posters/membresia.webp')).toBe(true);
  });
});
```

- [ ] **Paso 2: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/pagina-membresia.test.ts`
Esperado: FAIL — `Cannot find module '../src/three/objetos/plato'`

- [ ] **Paso 3: Escribir el objeto**

`src/three/objetos/plato.ts`:

```ts
import * as THREE from 'three';
import { metalOscuro, emisivoAcento, blancoDifuso } from '../materiales';

/**
 * Plato y vinilo del lounge. Objeto protagonista de `/membresia`.
 * El disco gira en bucle continuo: el acceso de miembro no se detiene.
 */
export function crear(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'plato';

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 0.18, 1.7),
    metalOscuro(),
  );
  base.name = 'base';
  base.position.y = -0.12;
  g.add(base);

  const disco = new THREE.Mesh(
    new THREE.CylinderGeometry(0.78, 0.78, 0.014, 64),
    new THREE.MeshStandardMaterial({ color: 0x0b0b0b, metalness: 0.4, roughness: 0.35 }),
  );
  disco.name = 'disco';
  disco.position.y = 0.005;
  g.add(disco);

  const etiqueta = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.24, 0.016, 40),
    emisivoAcento(),
  );
  etiqueta.name = 'etiqueta';
  etiqueta.position.y = 0.008;
  g.add(etiqueta);

  const eje = new THREE.Mesh(
    new THREE.CylinderGeometry(0.014, 0.014, 0.09, 12),
    blancoDifuso(),
  );
  eje.name = 'eje';
  eje.position.y = 0.05;
  g.add(eje);

  const brazo = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.018, 1.05, 12),
    metalOscuro(),
  );
  brazo.name = 'brazo';
  brazo.position.set(0.62, 0.14, -0.42);
  brazo.rotation.set(0, 0, Math.PI / 2);
  brazo.rotation.y = -0.75;
  g.add(brazo);

  const capsula = new THREE.Mesh(
    new THREE.BoxGeometry(0.09, 0.06, 0.05),
    blancoDifuso(),
  );
  capsula.name = 'capsula';
  capsula.position.set(0.28, 0.09, 0.02);
  g.add(capsula);

  return g;
}
```

- [ ] **Paso 4: Hacer girar el disco en bucle**

En `src/three/motor.ts`, dentro de `dibujar()`, tras la línea del knob, añadir:

```ts
    // El disco de /membresia gira en bucle continuo: el acceso no se detiene.
    const disco = o.objeto.getObjectByName('disco');
    if (disco) disco.rotation.y += 0.006;
    const etiqueta = o.objeto.getObjectByName('etiqueta');
    if (etiqueta) etiqueta.rotation.y += 0.006;
```

- [ ] **Paso 5: Escribir la ruta**

`src/pages/membresia.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Bloque from '../components/Bloque.astro';
import Reveal from '../components/Reveal.astro';
import Escena3D from '../components/Escena3D.astro';
import { incluidoMembresia } from '../data/membresia';
import { enlaceWhatsApp } from '../data/whatsapp';
---

<BaseLayout
  title="Membresía — Acceso a estudio y ciclorama en Panamá"
  description="La membresía de Safetory Studio incluye bloques de Studio 1 y de ciclorama y co-working sin coste adicional."
  ruta="/membresia"
  poster="/posters/membresia.webp"
>
  <section class="hero">
    <Escena3D
      objeto="plato"
      temperatura="ambar-apagado"
      poster="/posters/membresia.webp"
      alt="Plato y vinilo del lounge de Safetory, con la etiqueta del disco iluminada en rojo."
      fondos={['/escena/lounge.webp', '/escena/sala-ancha.webp']}
    />
    <div class="hero__texto">
      <p class="kicker">04 · Membresía</p>
      <h1 data-titular>Membresía</h1>
    </div>
  </section>

  <Bloque id="incluye" kicker="Qué incluye">
    <h2 data-titular>Bloques sin coste</h2>
    <Reveal>
      {incluidoMembresia.map((linea) => <p class="incluye__linea">{linea}</p>)}
    </Reveal>
  </Bloque>

  <Bloque id="consultar" kicker="Siguiente paso">
    <h2 data-titular>Hablemos de tu membresía</h2>
    <p class="consultar__nota">
      Las condiciones de alta se acuerdan según el uso que vayas a darle al estudio.
    </p>
    <a class="boton" href={enlaceWhatsApp('Consultar membresía')} target="_blank" rel="noopener noreferrer">
      Consultar membresía
    </a>
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
    gap: var(--phi-0);
  }
  .incluye__linea {
    padding: var(--phi-2) 0;
    border-top: 1px solid var(--hairline);
    font-size: var(--phi-3);
    font-family: var(--display);
  }
  .consultar__nota { color: var(--ash); font-size: var(--phi-2); max-width: 42ch; }
  .boton {
    align-self: flex-start;
    padding: var(--phi-1) var(--phi-3);
    background: var(--rec);
    color: var(--void);
    font-weight: 500;
    border-radius: 999px;
  }
</style>
```

> **Hueco de contenido abierto (§9.5).** En cuanto el cliente facilite precio y condiciones de
> alta, se añade un `src/data/membresia.ts → precioMembresia: Tarifa` y un bloque `PrecioCard`
> entre «Qué incluye» y «Siguiente paso». Hasta entonces, esa cifra no existe en el sitio.

- [ ] **Paso 6: Capturar el póster y verificar**

`http://localhost:4321/dev/posters` → objeto `plato` → Capturar.

```bash
mv ~/Downloads/plato.webp public/posters/membresia.webp
npx vitest run tests/pagina-membresia.test.ts && npm run build
```

Esperado: 7 tests PASS.

- [ ] **Paso 7: Commit**

```bash
git add src/three/objetos/plato.ts src/three/motor.ts src/pages/membresia.astro public/posters/membresia.webp tests/pagina-membresia.test.ts
git commit -m "feat(S07): plato giratorio y ruta /membresia sin inventar precio"
```

---

