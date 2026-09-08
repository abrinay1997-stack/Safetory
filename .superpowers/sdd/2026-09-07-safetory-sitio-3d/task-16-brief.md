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

## Tarea 16: Ciclorama y la ruta `/ciclorama`

**Archivos:**
- Crear: `src/three/objetos/ciclorama.ts`, `src/pages/ciclorama.astro`
- Crear: `public/posters/ciclorama.webp`
- Test: `tests/pagina-ciclorama.test.ts`

**Interfaces:**
- Produce: `ciclorama.crear(): THREE.Group` con nombre `ciclorama` e hijos
  `curva`, `suelo`, `foco`, `aro-foco`, `pie`

- [ ] **Paso 1: Escribir el test que falla**

`tests/pagina-ciclorama.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { medirPresupuesto, LIMITE_MALLAS, LIMITE_TRIANGULOS } from '../src/three/presupuesto';
import { crear } from '../src/three/objetos/ciclorama';
import { cicloramaFoto, cicloramaVideo, bloquesCicloramaMiembro } from '../src/data/ciclorama';

const pagina = () => readFileSync('src/pages/ciclorama.astro', 'utf8');

describe('objeto ciclorama', () => {
  const obj = crear();

  it('cabe en el presupuesto de escena', () => {
    const p = medirPresupuesto(obj);
    expect(p.mallas).toBeLessThanOrEqual(LIMITE_MALLAS);
    expect(p.triangulos).toBeLessThanOrEqual(LIMITE_TRIANGULOS);
  });

  it('es el unico objeto que ES un espacio: tiene curva y suelo', () => {
    expect(obj.getObjectByName('curva')).toBeDefined();
    expect(obj.getObjectByName('suelo')).toBeDefined();
  });

  it('lleva el foco circular que se ve en la fotografia del cliente', () => {
    expect(obj.getObjectByName('foco')).toBeDefined();
  });
});

describe('ruta /ciclorama', () => {
  it('tiene un solo h1 (G8)', () => {
    expect((pagina().match(/<h1[\s>]/g) ?? []).length).toBe(1);
  });

  it('usa la temperatura violeta del espacio real (§6.3)', () => {
    expect(pagina()).toContain('temperatura="violeta"');
  });

  it('publica la tarifa de foto, los tres bloques de video y los de miembro', () => {
    expect(cicloramaFoto).toHaveLength(1);
    expect(cicloramaVideo).toHaveLength(3);
    expect(bloquesCicloramaMiembro).toHaveLength(2);
    const s = pagina();
    ['cicloramaFoto', 'cicloramaVideo', 'bloquesCicloramaMiembro']
      .forEach((d) => expect(s, d).toContain(d));
  });

  it('no escribe ningun precio a mano (G1)', () => {
    expect(pagina()).not.toMatch(/\$\s?\d{2,}/);
  });

  it('el poster existe', () => {
    expect(existsSync('public/posters/ciclorama.webp')).toBe(true);
  });
});
```

- [ ] **Paso 2: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/pagina-ciclorama.test.ts`
Esperado: FAIL — `Cannot find module '../src/three/objetos/ciclorama'`

- [ ] **Paso 3: Escribir el objeto**

`src/three/objetos/ciclorama.ts`:

```ts
import * as THREE from 'three';
import { metalOscuro, blancoDifuso, emisivoAcento } from '../materiales';

/**
 * Ciclorama de curva infinita con el foco circular. Objeto protagonista de
 * `/ciclorama` y el único del sitio que no es un aparato sino un espacio.
 * La curva se genera extruyendo una LatheGeometry parcial: un cuarto de
 * cilindro que une pared y suelo sin arista visible, que es exactamente lo
 * que hace un ciclorama real.
 */
export function crear(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'ciclorama';

  // Perfil de la transición pared→suelo: recta, curva, recta.
  const perfil: THREE.Vector2[] = [];
  perfil.push(new THREE.Vector2(2.6, -0.9));
  for (let i = 0; i <= 12; i++) {
    const a = (i / 12) * (Math.PI / 2);
    perfil.push(new THREE.Vector2(
      2.6 - 0.9 + Math.cos(a) * 0.9,
      -0.9 + Math.sin(a) * 0.9,
    ));
  }
  perfil.push(new THREE.Vector2(1.7, 1.9));

  const curva = new THREE.Mesh(
    new THREE.LatheGeometry(perfil, 40, Math.PI * 0.15, Math.PI * 0.7),
    blancoDifuso(),
  );
  curva.name = 'curva';
  curva.material.side = THREE.DoubleSide;
  g.add(curva);

  const suelo = new THREE.Mesh(
    new THREE.CircleGeometry(1.75, 40),
    blancoDifuso(),
  );
  suelo.name = 'suelo';
  suelo.rotation.x = -Math.PI / 2;
  suelo.position.y = -0.9;
  g.add(suelo);

  // Foco circular tipo panel LED, el que aparece en la fotografía.
  const foco = new THREE.Mesh(
    new THREE.CircleGeometry(0.44, 32),
    new THREE.MeshStandardMaterial({
      color: 0xffd9a0,
      emissive: 0xffc98a,
      emissiveIntensity: 1.6,
    }),
  );
  foco.name = 'foco';
  foco.position.set(1.35, 0.5, 1.1);
  foco.lookAt(0, 0, 0);
  g.add(foco);

  const aro = new THREE.Mesh(
    new THREE.TorusGeometry(0.46, 0.03, 10, 32),
    metalOscuro(),
  );
  aro.name = 'aro-foco';
  aro.position.copy(foco.position);
  aro.quaternion.copy(foco.quaternion);
  g.add(aro);

  const pie = new THREE.Mesh(
    new THREE.CylinderGeometry(0.022, 0.022, 1.4, 10),
    metalOscuro(),
  );
  pie.name = 'pie';
  pie.position.set(1.35, -0.2, 1.1);
  g.add(pie);

  // Testigo de grabación: el punto de acento obligatorio (G9).
  const testigo = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 10), emisivoAcento());
  testigo.name = 'testigo';
  testigo.position.set(-1.2, 0.7, 1.0);
  g.add(testigo);

  return g;
}
```

- [ ] **Paso 4: Escribir la ruta**

`src/pages/ciclorama.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Bloque from '../components/Bloque.astro';
import Reveal from '../components/Reveal.astro';
import Escena3D from '../components/Escena3D.astro';
import PrecioCard from '../components/PrecioCard.astro';
import { cicloramaFoto, cicloramaVideo, bloquesCicloramaMiembro } from '../data/ciclorama';
import { enlaceWhatsApp } from '../data/whatsapp';
---

<BaseLayout
  title="Ciclorama — Alquiler de estudio de fotografía y vídeo en Panamá"
  description="Ciclorama de curva infinita con iluminación LED en Vía España, Panamá. Alquiler por horas para fotografía y por bloques para vídeo."
  ruta="/ciclorama"
  poster="/posters/ciclorama.webp"
>
  <section class="hero">
    <Escena3D
      objeto="ciclorama"
      temperatura="violeta"
      poster="/posters/ciclorama.webp"
      alt="Ciclorama de curva infinita de Safetory, iluminado con un panel LED circular y lavado violeta."
      fondos={['/escena/ciclorama.webp', '/escena/lounge.webp']}
    />
    <div class="hero__texto">
      <p class="kicker">02 · Ciclorama</p>
      <h1 data-titular>Ciclorama</h1>
    </div>
  </section>

  <Bloque id="fotografia" kicker="Fotografía">
    <h2 data-titular>Por hora</h2>
    <Reveal>
      {cicloramaFoto.map((t) => <PrecioCard tarifa={t} />)}
    </Reveal>
  </Bloque>

  <Bloque id="video" kicker="Vídeo">
    <h2 data-titular>Por bloque</h2>
    <Reveal>
      {cicloramaVideo.map((t) => <PrecioCard tarifa={t} />)}
    </Reveal>
  </Bloque>

  <Bloque id="miembros" kicker="Con membresía">
    <h2 data-titular>Ciclorama y co-working</h2>
    <Reveal>
      {bloquesCicloramaMiembro.map((b) => <PrecioCard tarifa={b} />)}
    </Reveal>
  </Bloque>

  <Bloque id="reservar" kicker="Siguiente paso">
    <h2 data-titular>Reserva el ciclorama</h2>
    <a class="boton" href={enlaceWhatsApp('Ciclorama')} target="_blank" rel="noopener noreferrer">
      Reservar por WhatsApp
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

- [ ] **Paso 5: Capturar el póster**

`http://localhost:4321/dev/posters` → objeto `ciclorama` → Capturar.

```bash
mv ~/Downloads/ciclorama.webp public/posters/ciclorama.webp
```

- [ ] **Paso 6: Ejecutar y comprobar que pasa**

Ejecutar: `npx vitest run tests/pagina-ciclorama.test.ts && npm run build`
Esperado: 8 tests PASS.

- [ ] **Paso 7: Commit**

```bash
git add src/three/objetos/ciclorama.ts src/pages/ciclorama.astro public/posters/ciclorama.webp tests/pagina-ciclorama.test.ts
git commit -m "feat(S05): ciclorama procedural con curva infinita y ruta /ciclorama"
```

---

