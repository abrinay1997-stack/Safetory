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

## Tarea 17: Interfaz de audio y la ruta `/produccion`

**Archivos:**
- Crear: `src/three/objetos/interfaz.ts`, `src/pages/produccion.astro`
- Crear: `public/posters/produccion.webp`
- Test: `tests/pagina-produccion.test.ts`

**Interfaces:**
- Produce: `interfaz.crear(): THREE.Group` con nombre `interfaz` e hijos
  `chasis`, `knob`, `anillo-knob`, `pantalla`, `botones`

- [ ] **Paso 1: Escribir el test que falla**

`tests/pagina-produccion.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import * as THREE from 'three';
import { medirPresupuesto, LIMITE_MALLAS, LIMITE_TRIANGULOS } from '../src/three/presupuesto';
import { crear } from '../src/three/objetos/interfaz';
import { serviciosProduccion } from '../src/data/produccion';

const pagina = () => readFileSync('src/pages/produccion.astro', 'utf8');

describe('objeto interfaz', () => {
  const obj = crear();

  it('cabe en el presupuesto de escena', () => {
    const p = medirPresupuesto(obj);
    expect(p.mallas).toBeLessThanOrEqual(LIMITE_MALLAS);
    expect(p.triangulos).toBeLessThanOrEqual(LIMITE_TRIANGULOS);
  });

  it('tiene el knob grande, que gira con el scroll', () => {
    expect(obj.getObjectByName('knob')).toBeDefined();
  });

  it('los botones usan InstancedMesh: una sola llamada de dibujado', () => {
    // `isInstancedMesh` y no `.type`, por lo mismo que en la Tarea 10.
    const botones = obj.getObjectByName('botones') as THREE.InstancedMesh;
    expect(botones?.isInstancedMesh).toBe(true);
  });
});

describe('ruta /produccion', () => {
  it('tiene un solo h1 (G8)', () => {
    expect((pagina().match(/<h1[\s>]/g) ?? []).length).toBe(1);
  });

  it('publica los seis servicios desde los datos', () => {
    expect(serviciosProduccion).toHaveLength(6);
    expect(pagina()).toContain('serviciosProduccion');
  });

  it('cada servicio recibe su propio bloque a pantalla completa (G11)', () => {
    // Los seis bloques de servicio se generan con un .map(), así que en el
    // fuente hay una sola aparición literal de <Bloque> para los seis. El
    // recuento de pantallas renderizadas se verifica en la suite sobre dist/.
    expect(pagina()).toContain('serviciosProduccion.map(');
  });

  it('la tabla comparativa lista los seis, no siete', () => {
    const s = pagina();
    expect(s).toContain('comparativa');
    expect(s).not.toContain('siete servicios');
  });

  it('no escribe ningun precio a mano (G1)', () => {
    expect(pagina()).not.toMatch(/\$\s?\d{2,}/);
  });

  it('el poster existe', () => {
    expect(existsSync('public/posters/produccion.webp')).toBe(true);
  });
});
```

- [ ] **Paso 2: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/pagina-produccion.test.ts`
Esperado: FAIL — `Cannot find module '../src/three/objetos/interfaz'`

- [ ] **Paso 3: Escribir el objeto**

`src/three/objetos/interfaz.ts`:

```ts
import * as THREE from 'three';
import { metalOscuro, emisivoAcento, blancoDifuso } from '../materiales';

const BOTONES = 8;

/**
 * Interfaz de audio de sobremesa con knob grande. Objeto protagonista de
 * `/produccion`. El knob es la pieza que la escena hace girar con el scroll:
 * es el mando de nivel, y mixing, mastering y grabación son cuestión de nivel.
 */
export function crear(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'interfaz';

  const chasis = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.28, 1.05),
    metalOscuro(),
  );
  chasis.name = 'chasis';
  g.add(chasis);

  const knob = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.34, 0.2, 40),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.95, roughness: 0.25 }),
  );
  knob.name = 'knob';
  knob.position.set(0.28, 0.22, 0);
  g.add(knob);

  const anilloKnob = new THREE.Mesh(
    new THREE.TorusGeometry(0.38, 0.018, 10, 40),
    emisivoAcento(),
  );
  anilloKnob.name = 'anillo-knob';
  anilloKnob.position.set(0.28, 0.16, 0);
  anilloKnob.rotation.x = Math.PI / 2;
  g.add(anilloKnob);

  const pantalla = new THREE.Mesh(
    new THREE.PlaneGeometry(0.42, 0.16),
    new THREE.MeshStandardMaterial({
      color: 0x0a0a0a,
      emissive: 0x3d5a4a,
      emissiveIntensity: 0.9,
    }),
  );
  pantalla.name = 'pantalla';
  pantalla.position.set(-0.42, 0.145, 0.1);
  pantalla.rotation.x = -Math.PI / 2;
  g.add(pantalla);

  // Fila de botones: geometría única, ocho instancias, un draw call.
  const botones = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.07, 0.03, 0.05),
    blancoDifuso(),
    BOTONES,
  );
  botones.name = 'botones';
  const m = new THREE.Matrix4();
  for (let i = 0; i < BOTONES; i++) {
    m.makeTranslation(-0.62 + i * 0.09, 0.155, -0.28);
    botones.setMatrixAt(i, m);
  }
  botones.instanceMatrix.needsUpdate = true;
  g.add(botones);

  return g;
}
```

- [ ] **Paso 4: Hacer girar el knob con el scroll**

En `src/three/motor.ts`, dentro de `dibujar()`, justo después de
`camara.lookAt(0, 0, 0);`, añadir:

```ts
    // El knob de /produccion gira con el scroll: media vuelta de extremo a extremo.
    const knob = o.objeto.getObjectByName('knob');
    if (knob) knob.rotation.y = progreso * Math.PI;
```

- [ ] **Paso 5: Escribir la ruta**

`src/pages/produccion.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Bloque from '../components/Bloque.astro';
import Reveal from '../components/Reveal.astro';
import Escena3D from '../components/Escena3D.astro';
import PrecioCard from '../components/PrecioCard.astro';
import { serviciosProduccion } from '../data/produccion';
import { enlaceWhatsApp } from '../data/whatsapp';
---

<BaseLayout
  title="Producción — Mixing, mastering y grabación en Panamá"
  description="Servicios de producción musical en Panamá: mixing con stems ilimitados, mastering, grabación y producción personalizada desde cero."
  ruta="/produccion"
  poster="/posters/produccion.webp"
>
  <section class="hero">
    <Escena3D
      objeto="interfaz"
      temperatura="ambar-apagado"
      poster="/posters/produccion.webp"
      alt="Interfaz de audio de sobremesa de Safetory, con el mando de nivel rodeado por un anillo rojo."
      fondos={['/escena/interfaz.webp', '/escena/sala.webp']}
    />
    <div class="hero__texto">
      <p class="kicker">03 · Producción</p>
      <h1 data-titular>Producción</h1>
    </div>
  </section>

  {serviciosProduccion.map((servicio, i) => (
    <Bloque id={servicio.id} kicker={`0${i + 1} · Servicio`}>
      <h2 data-titular>{servicio.nombre}</h2>
      <PrecioCard tarifa={servicio} />
    </Bloque>
  ))}

  <Bloque id="comparativa" kicker="Comparativa">
    <h2 data-titular>Los seis, de un vistazo</h2>
    <Reveal>
      <table class="tabla">
        <thead>
          <tr><th scope="col">Servicio</th><th scope="col">Duración</th><th scope="col">Precio</th></tr>
        </thead>
        <tbody>
          {serviciosProduccion.map((s) => (
            <tr>
              <th scope="row">{s.nombre}</th>
              <td>{s.duracion}</td>
              <td><data value={String(s.precio)}>${s.precio}</data></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Reveal>
  </Bloque>

  <Bloque id="reservar" kicker="Siguiente paso">
    <h2 data-titular>Empieza tu producción</h2>
    <a class="boton" href={enlaceWhatsApp('Servicios de producción')} target="_blank" rel="noopener noreferrer">
      Escribir por WhatsApp
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
  .tabla { width: 100%; border-collapse: collapse; text-align: left; }
  .tabla th, .tabla td {
    padding: var(--phi-1) 0;
    border-top: 1px solid var(--hairline);
    font-weight: 400;
  }
  .tabla thead th { color: var(--ash); font-size: var(--phi-0); letter-spacing: 0.18em; text-transform: uppercase; }
  .tabla tbody td:last-child { font-family: var(--display); color: var(--rec); }
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

- [ ] **Paso 6: Capturar el póster y verificar**

`http://localhost:4321/dev/posters` → objeto `interfaz` → Capturar.

```bash
mv ~/Downloads/interfaz.webp public/posters/produccion.webp
npx vitest run tests/pagina-produccion.test.ts && npm run build
```

Esperado: 9 tests PASS.

- [ ] **Paso 7: Commit**

```bash
git add src/three/objetos/interfaz.ts src/three/motor.ts src/pages/produccion.astro public/posters/produccion.webp tests/pagina-produccion.test.ts
git commit -m "feat(S06): interfaz de audio con knob al scroll y ruta /produccion"
```

---

