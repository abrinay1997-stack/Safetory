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

## Tarea 15: Monitores y la ruta `/estudio`

**Archivos:**
- Crear: `src/three/objetos/monitores.ts`, `src/pages/estudio.astro`
- Crear: `public/posters/estudio.webp`
- Test: `tests/pagina-estudio.test.ts`

**Interfaces:**
- Consume: `metalOscuro`, `blancoDifuso`, `emisivoAcento` (Tarea 9), `medirPresupuesto` (Tarea 10)
- Produce: `monitores.crear(): THREE.Group` con nombre `monitores` e hijos
  `caja-izq`, `caja-der`, `cono-izq`, `cono-der`, `tweeter-izq`, `tweeter-der`, `testigo`

- [ ] **Paso 1: Escribir el test que falla**

`tests/pagina-estudio.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { medirPresupuesto, LIMITE_MALLAS, LIMITE_TRIANGULOS } from '../src/three/presupuesto';
import { crear } from '../src/three/objetos/monitores';
import { tarifasEstudio, bloquesEstudioMiembro } from '../src/data/estudio';

const pagina = () => readFileSync('src/pages/estudio.astro', 'utf8');

describe('objeto monitores', () => {
  const obj = crear();

  it('cabe en el presupuesto de escena', () => {
    const p = medirPresupuesto(obj);
    expect(p.mallas).toBeLessThanOrEqual(LIMITE_MALLAS);
    expect(p.triangulos).toBeLessThanOrEqual(LIMITE_TRIANGULOS);
  });

  it('son un par en estereo, simetrico respecto al origen', () => {
    const izq = obj.getObjectByName('caja-izq');
    const der = obj.getObjectByName('caja-der');
    expect(izq).toBeDefined();
    expect(der).toBeDefined();
    expect(izq!.position.x).toBeCloseTo(-der!.position.x, 5);
  });

  it('lleva el testigo de acento encendido', () => {
    expect(obj.getObjectByName('testigo')).toBeDefined();
  });
});

describe('ruta /estudio', () => {
  it('tiene un solo h1 (G8)', () => {
    expect((pagina().match(/<h1[\s>]/g) ?? []).length).toBe(1);
  });

  it('publica las dos tarifas y los tres bloques de miembro', () => {
    expect(tarifasEstudio).toHaveLength(2);
    expect(bloquesEstudioMiembro).toHaveLength(3);
    const s = pagina();
    expect(s).toContain('tarifasEstudio');
    expect(s).toContain('bloquesEstudioMiembro');
  });

  it('no escribe ningun precio a mano (G1)', () => {
    expect(pagina()).not.toMatch(/\$\s?\d{2,}/);
  });

  it('monta la escena de monitores con su poster', () => {
    const s = pagina();
    expect(s).toContain('objeto="monitores"');
    expect(s).toContain('/posters/estudio.webp');
  });

  it('el poster existe y pesa menos de 60 KB', () => {
    expect(existsSync('public/posters/estudio.webp')).toBe(true);
  });
});
```

- [ ] **Paso 2: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/pagina-estudio.test.ts`
Esperado: FAIL — `Cannot find module '../src/three/objetos/monitores'`

- [ ] **Paso 3: Escribir el objeto**

`src/three/objetos/monitores.ts`:

```ts
import * as THREE from 'three';
import { metalOscuro, blancoDifuso, emisivoAcento } from '../materiales';

const SEPARACION = 1.15;

/**
 * Par de monitores de campo cercano. Objeto protagonista de `/estudio`.
 * Van en estéreo real: uno a cada lado del origen, para que la cámara
 * pase entre ellos al cerrarse la espiral.
 */
export function crear(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'monitores';

  ([-1, 1] as const).forEach((lado) => {
    const sufijo = lado === -1 ? 'izq' : 'der';
    const x = lado * SEPARACION;

    const caja = new THREE.Mesh(
      new THREE.BoxGeometry(0.62, 0.95, 0.5),
      metalOscuro(),
    );
    caja.name = `caja-${sufijo}`;
    caja.position.set(x, 0, 0);
    caja.rotation.y = -lado * 0.22; // ligeramente giradas hacia el punto de escucha
    g.add(caja);

    const cono = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.24, 0.09, 28),
      blancoDifuso(),
    );
    cono.name = `cono-${sufijo}`;
    cono.position.set(x + lado * 0.02, -0.16, 0.26);
    cono.rotation.x = Math.PI / 2;
    cono.rotation.z = -lado * 0.22;
    g.add(cono);

    const tweeter = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 16, 12),
      blancoDifuso(),
    );
    tweeter.name = `tweeter-${sufijo}`;
    tweeter.position.set(x + lado * 0.02, 0.26, 0.26);
    g.add(tweeter);

    const puerto = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.12, 16, 1, true),
      metalOscuro(),
    );
    puerto.name = `puerto-${sufijo}`;
    puerto.position.set(x, -0.36, 0.22);
    puerto.rotation.x = Math.PI / 2;
    g.add(puerto);
  });

  // Testigo de encendido: el único punto de acento de la escena.
  const testigo = new THREE.Mesh(
    new THREE.SphereGeometry(0.035, 12, 10),
    emisivoAcento(),
  );
  testigo.name = 'testigo';
  testigo.position.set(-SEPARACION, -0.4, 0.27);
  g.add(testigo);

  return g;
}
```

- [ ] **Paso 4: Escribir la ruta**

`src/pages/estudio.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Bloque from '../components/Bloque.astro';
import Reveal from '../components/Reveal.astro';
import Escena3D from '../components/Escena3D.astro';
import PrecioCard from '../components/PrecioCard.astro';
import { tarifasEstudio, bloquesEstudioMiembro } from '../data/estudio';
import { equipoVerificable } from '../data/equipo';
import { enlaceWhatsApp } from '../data/whatsapp';

const [horaSuelta, bloque] = tarifasEstudio;
---

<BaseLayout
  title="Studio 1 — Alquiler de estudio de grabación en Panamá"
  description="Alquiler de Studio 1 en Vía España, Panamá: sala tratada acústicamente con monitorización de campo cercano. Por hora o por bloque."
  ruta="/estudio"
  poster="/posters/estudio.webp"
>
  <section class="hero">
    <Escena3D
      objeto="monitores"
      temperatura="ambar"
      poster="/posters/estudio.webp"
      alt="Par de monitores de campo cercano del Studio 1 de Safetory, con el testigo de encendido en rojo."
      fondos={['/escena/sala.webp', '/escena/sala-ancha.webp']}
    />
    <div class="hero__texto">
      <p class="kicker">01 · Estudio</p>
      <h1 data-titular>Studio 1</h1>
    </div>
  </section>

  <Bloque id="sala" kicker="La sala">
    <h2 data-titular>Tratada, no improvisada</h2>
    <Reveal>
      {equipoVerificable.map((linea) => <p class="lista__linea">{linea}</p>)}
    </Reveal>
  </Bloque>

  <Bloque id="hora" kicker="Tarifa por hora">
    <h2 data-titular>Hora suelta</h2>
    <PrecioCard tarifa={horaSuelta} />
  </Bloque>

  <Bloque id="bloque" kicker="Tarifa por bloque">
    <h2 data-titular>Tres horas o más</h2>
    <PrecioCard tarifa={bloque} />
  </Bloque>

  <Bloque id="miembros" kicker="Con membresía">
    <h2 data-titular>Bloques de miembro</h2>
    <Reveal>
      {bloquesEstudioMiembro.map((b) => <PrecioCard tarifa={b} />)}
    </Reveal>
  </Bloque>

  <Bloque id="reservar" kicker="Siguiente paso">
    <h2 data-titular>Reserva Studio 1</h2>
    <a class="boton" href={enlaceWhatsApp('Studio 1')} target="_blank" rel="noopener noreferrer">
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
  .lista__linea {
    padding: var(--phi-1) 0;
    border-top: 1px solid var(--hairline);
    color: var(--ash);
    font-size: var(--phi-2);
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

`npm run dev` → `http://localhost:4321/dev/posters` → objeto `monitores` → Capturar.

```bash
mv ~/Downloads/monitores.webp public/posters/estudio.webp
```

- [ ] **Paso 6: Ejecutar y comprobar que pasa**

Ejecutar: `npx vitest run tests/pagina-estudio.test.ts && npm run build`
Esperado: 8 tests PASS.

- [ ] **Paso 7: Commit**

```bash
git add src/three/objetos/monitores.ts src/pages/estudio.astro public/posters/estudio.webp tests/pagina-estudio.test.ts
git commit -m "feat(S04): monitores procedurales y ruta /estudio"
```

---

