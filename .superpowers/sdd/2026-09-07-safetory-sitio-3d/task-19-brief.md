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

## Tarea 19: Rótulo y la ruta `/contacto`

**Archivos:**
- Crear: `src/three/objetos/rotulo.ts`, `src/pages/contacto.astro`
- Crear: `public/posters/contacto.webp`, `public/mapa-via-espana.webp`
- Test: `tests/pagina-contacto.test.ts`

**Interfaces:**
- Produce: `rotulo.crear(): THREE.Group` con nombre `rotulo` e hijos
  `marco`, `panel`, `halo`

- [ ] **Paso 1: Escribir el test que falla**

`tests/pagina-contacto.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { medirPresupuesto, LIMITE_MALLAS, LIMITE_TRIANGULOS } from '../src/three/presupuesto';
import { crear } from '../src/three/objetos/rotulo';
import { site } from '../src/data/site';

const pagina = () => readFileSync('src/pages/contacto.astro', 'utf8');

describe('objeto rotulo', () => {
  const obj = crear();

  it('cabe en el presupuesto de escena', () => {
    const p = medirPresupuesto(obj);
    expect(p.mallas).toBeLessThanOrEqual(LIMITE_MALLAS);
    expect(p.triangulos).toBeLessThanOrEqual(LIMITE_TRIANGULOS);
  });

  it('tiene panel retroiluminado y halo', () => {
    expect(obj.getObjectByName('panel')).toBeDefined();
    expect(obj.getObjectByName('halo')).toBeDefined();
  });
});

describe('ruta /contacto', () => {
  it('tiene un solo h1 (G8)', () => {
    expect((pagina().match(/<h1[\s>]/g) ?? []).length).toBe(1);
  });

  it('publica los cuatro canales reales', () => {
    const s = pagina();
    ['site.direccion', 'site.telefono', 'site.correo', 'site.instagram']
      .forEach((d) => expect(s, d).toContain(d));
  });

  it('el mapa es una imagen enlazada, no un iframe (§5.6)', () => {
    const s = pagina();
    expect(s).not.toContain('<iframe');
    expect(s).toContain('mapa-via-espana.webp');
    expect(s).toContain('google.com/maps');
  });

  it('el telefono se deriva de site.whatsapp, no se escribe a mano', () => {
    const s = pagina();
    expect(s).toContain('site.whatsapp');
    expect(s).not.toContain("'+507");
  });

  it('el horario sale de los datos y son tres franjas', () => {
    expect(site.horario).toHaveLength(3);
    expect(pagina()).toContain('site.horario');
  });

  it('los posters y el mapa existen', () => {
    expect(existsSync('public/posters/contacto.webp')).toBe(true);
    expect(existsSync('public/mapa-via-espana.webp')).toBe(true);
  });
});
```

- [ ] **Paso 2: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/pagina-contacto.test.ts`
Esperado: FAIL — `Cannot find module '../src/three/objetos/rotulo'`

- [ ] **Paso 3: Escribir el objeto**

`src/three/objetos/rotulo.ts`:

```ts
import * as THREE from 'three';
import { metalOscuro } from '../materiales';

/**
 * El rótulo retroiluminado que cuelga en la pared del Studio 1.
 * Objeto protagonista de `/contacto` y cierre del sitio: el letrero
 * se enciende al llegar la cámara.
 *
 * El wordmark va como textura, no como geometría de texto: cargar una
 * tipografía en formato three cuesta cientos de kilobytes y aquí basta
 * con el SVG que ya tenemos convertido a imagen.
 */
export function crear(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'rotulo';

  const marco = new THREE.Mesh(
    new THREE.BoxGeometry(3.0, 1.05, 0.14),
    metalOscuro(),
  );
  marco.name = 'marco';
  g.add(marco);

  const textura = new THREE.TextureLoader().load('/escena/wordmark.webp');
  textura.colorSpace = THREE.SRGBColorSpace;

  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(2.78, 0.86),
    new THREE.MeshStandardMaterial({
      map: textura,
      transparent: true,
      emissive: 0xffffff,
      emissiveMap: textura,
      emissiveIntensity: 1.5,
    }),
  );
  panel.name = 'panel';
  panel.position.z = 0.075;
  g.add(panel);

  // Halo: el resplandor que el rótulo proyecta sobre la pared.
  const halo = new THREE.Mesh(
    new THREE.PlaneGeometry(3.9, 1.9),
    new THREE.MeshBasicMaterial({
      color: 0xa9c4ff,
      transparent: true,
      opacity: 0.09,
      depthWrite: false,
    }),
  );
  halo.name = 'halo';
  halo.position.z = -0.12;
  g.add(halo);

  return g;
}
```

- [ ] **Paso 4: Preparar el wordmark y el mapa**

```bash
cp LOGO_SAFETORY.png public/escena/wordmark-origen.png
```

Convertir `public/escena/wordmark-origen.png` a `public/escena/wordmark.webp` con fondo
transparente, ancho 1024 px. Cualquier conversor sirve; con la herramienta de pósters ya
abierta en el navegador, también vale arrastrar el PNG a `https://squoosh.app` y exportar
WebP con calidad 80. Borrar después `wordmark-origen.png`.

Para el mapa: abrir Google Maps en `Edificio Brasilia, Vía España, Panamá`, encuadrar la zona,
capturar la pantalla y guardarla como `public/mapa-via-espana.webp` a 1280 px de ancho.

- [ ] **Paso 5: Escribir la ruta**

`src/pages/contacto.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Bloque from '../components/Bloque.astro';
import Reveal from '../components/Reveal.astro';
import Escena3D from '../components/Escena3D.astro';
import { site } from '../data/site';
import { enlaceWhatsApp } from '../data/whatsapp';
import { ruta } from '../data/rutas';

const telefonoE164 = `tel:+${site.whatsapp}`;
const mapa = 'https://www.google.com/maps/search/?api=1&query=Edificio+Brasilia+Via+Espana+Panama';
---

<BaseLayout
  title="Contacto — Safetory Studio, Vía España, Panamá"
  description="Safetory Studio está en Edificio Brasilia, Vía España, Panamá. Abierto 24 horas de lunes a viernes y los sábados por la mañana."
  ruta="/contacto"
  poster="/posters/contacto.webp"
>
  <section class="hero">
    <Escena3D
      objeto="rotulo"
      temperatura="neutro"
      poster="/posters/contacto.webp"
      alt="Rótulo retroiluminado de Safetory Studio encendido sobre la pared del estudio."
      fondos={['/escena/sala.webp', '/escena/microfono.webp']}
    />
    <div class="hero__texto">
      <p class="kicker">Contacto</p>
      <h1 data-titular>Contacto</h1>
    </div>
  </section>

  <Bloque id="direccion" kicker="Dónde">
    <h2 data-titular>Vía España, Panamá</h2>
    <address class="direccion">{site.direccion}</address>
  </Bloque>

  <Bloque id="canales" kicker="Canales">
    <h2 data-titular>Escríbenos</h2>
    <Reveal>
      <a class="canal" href={telefonoE164}>{site.telefono}</a>
      <a class="canal" href={`mailto:${site.correo}`}>{site.correo}</a>
      <a class="canal" href={site.instagram} target="_blank" rel="noopener noreferrer">@safetorystudio</a>
    </Reveal>
  </Bloque>

  <Bloque id="horario" kicker="Cuándo">
    <h2 data-titular>Horario</h2>
    <dl class="horario">
      {site.horario.map((f) => (
        <div><dt>{f.dias}</dt><dd>{f.horas}</dd></div>
      ))}
    </dl>
  </Bloque>

  <Bloque id="mapa" kicker="Cómo llegar">
    <h2 data-titular>Edificio Brasilia</h2>
    <a class="mapa" href={mapa} target="_blank" rel="noopener noreferrer">
      <img
        src={ruta("/mapa-via-espana.webp")}
        alt="Mapa de la zona de Vía España, Panamá, con la ubicación del Edificio Brasilia."
        width="1280" height="720" loading="lazy" decoding="async"
      />
      <span class="mapa__pie">Abrir en Google Maps</span>
    </a>
  </Bloque>

  <Bloque id="reservar" kicker="Siguiente paso">
    <h2 data-titular>Reserva tu sesión</h2>
    <a class="boton" href={enlaceWhatsApp('Consulta general')} target="_blank" rel="noopener noreferrer">
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
  .direccion { font-style: normal; font-family: var(--display); font-size: var(--phi-3); max-width: 22ch; }
  .canal {
    display: block;
    padding: var(--phi-1) 0;
    border-top: 1px solid var(--hairline);
    font-family: var(--display);
    font-size: var(--phi-3);
    transition: color 0.25s;
  }
  .canal:hover { color: var(--rec); }
  .horario div {
    display: flex;
    justify-content: space-between;
    gap: var(--phi-2);
    padding: var(--phi-1) 0;
    border-top: 1px solid var(--hairline);
    font-size: var(--phi-2);
  }
  .horario dd { color: var(--ash); }
  .mapa { display: block; }
  .mapa img { width: 100%; height: auto; filter: grayscale(1) contrast(1.1) brightness(0.7); }
  .mapa__pie { display: inline-block; margin-top: var(--phi-1); color: var(--rec); font-size: var(--phi-1); }
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

`http://localhost:4321/dev/posters` → objeto `rotulo` → Capturar.

```bash
mv ~/Downloads/rotulo.webp public/posters/contacto.webp
npx vitest run tests/pagina-contacto.test.ts && npm run build
```

Esperado: 8 tests PASS.

- [ ] **Paso 7: Commit**

```bash
git add src/three/objetos/rotulo.ts src/pages/contacto.astro public/posters/contacto.webp public/mapa-via-espana.webp public/escena/wordmark.webp tests/pagina-contacto.test.ts
git commit -m "feat(S08): rotulo retroiluminado y ruta /contacto con mapa estatico"
```

---

