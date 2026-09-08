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

## Tarea 9: Materiales, luces y planos de profundidad

**Archivos:**
- Crear: `src/three/materiales.ts`, `src/three/luces.ts`, `src/three/planos-profundidad.ts`
- Copiar: las seis imágenes de `Imagenes/` a `public/escena/` con nombres legibles
- Test: `tests/materiales.test.ts`

**Interfaces:**
- Produce:
  - `metalOscuro(): THREE.MeshStandardMaterial`
  - `rejilla(): THREE.MeshStandardMaterial`
  - `emisivoAcento(): THREE.MeshStandardMaterial`
  - `blancoDifuso(): THREE.MeshStandardMaterial`
  - `type Temperatura = 'ambar' | 'ambar-apagado' | 'violeta' | 'neutro'`
  - `crearLuces(t: Temperatura): THREE.Light[]`
  - `crearPlanosProfundidad(rutas: [string, string]): THREE.Group`
- Constantes: `REC = 0xff2d2d`, `VOID = 0x080808`

- [ ] **Paso 1: Copiar y renombrar las imágenes**

```bash
mkdir -p public/escena
cp "Imagenes/9388552a-09fc-4ef9-b9a3-97111aabfb93.webp" public/escena/microfono.webp
cp "Imagenes/4da64443-fe38-41d0-b3ab-5c80ab6470bd.webp" public/escena/sala.webp
cp "Imagenes/e26fb203-c577-4e31-ba3d-0499d132a8c8.webp" public/escena/sala-ancha.webp
cp "Imagenes/06e9611d-296d-48be-8b31-4931d755a3c5.webp" public/escena/ciclorama.webp
cp "Imagenes/5e98bfb4-c34b-4ae6-a2b1-82a482c64524.webp" public/escena/interfaz.webp
cp "Imagenes/4d04e558-06b6-4af0-b543-ceb53bb0e002.webp" public/escena/lounge.webp
```

- [ ] **Paso 2: Escribir el test que falla**

`tests/materiales.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { REC, VOID, metalOscuro, rejilla, emisivoAcento } from '../src/three/materiales';
import { crearLuces } from '../src/three/luces';

describe('materiales', () => {
  it('el acento es exactamente el token --rec', () => {
    expect(REC).toBe(0xff2d2d);
    expect(VOID).toBe(0x080808);
  });

  it('el metal oscuro es metálico y poco brillante (spec §6.3)', () => {
    const m = metalOscuro();
    expect(m.metalness).toBeCloseTo(0.85, 2);
    expect(m.roughness).toBeCloseTo(0.42, 2);
  });

  it('la rejilla es transparente para dejar ver la malla', () => {
    expect(rejilla().transparent).toBe(true);
  });

  it('el emisivo de acento emite en --rec', () => {
    expect(emisivoAcento().emissive.getHex()).toBe(REC);
  });
});

describe('luces', () => {
  it('son exactamente tres: direccional, foco de acento y ambiente', () => {
    expect(crearLuces('ambar')).toHaveLength(3);
  });

  it('el foco de acento mantiene --rec en todas las temperaturas (G9)', () => {
    (['ambar', 'ambar-apagado', 'violeta', 'neutro'] as const).forEach((t) => {
      const foco = crearLuces(t).find((l) => l.name === 'acento');
      expect(foco?.color.getHex(), t).toBe(REC);
    });
  });

  it('lo que cambia por ruta es la direccional, no el acento', () => {
    const ambar = crearLuces('ambar').find((l) => l.name === 'ambiente-direccional');
    const violeta = crearLuces('violeta').find((l) => l.name === 'ambiente-direccional');
    expect(ambar?.color.getHex()).not.toBe(violeta?.color.getHex());
  });

  it('no hay entorno HDRI: encarece la descarga sin aportar (spec §6.3)', () => {
    const src = readFileSync('src/three/luces.ts', 'utf8');
    expect(src).not.toContain('RGBELoader');
    expect(src).not.toContain('PMREMGenerator');
  });
});

describe('planos de profundidad', () => {
  it('las seis texturas están en public/escena', () => {
    ['microfono', 'sala', 'sala-ancha', 'ciclorama', 'interfaz', 'lounge']
      .forEach((n) => expect(existsSync(`public/escena/${n}.webp`), n).toBe(true));
  });

  it('los planos van detrás del objeto, con opacidad baja (spec §6.4)', () => {
    const src = readFileSync('src/three/planos-profundidad.ts', 'utf8');
    expect(src).toContain('-12');
    expect(src).toContain('-6');
    expect(src).toContain('0.18');
    expect(src).toContain('0.10');
  });
});
```

- [ ] **Paso 3: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/materiales.test.ts`
Esperado: FAIL — `Cannot find module '../src/three/materiales'`

- [ ] **Paso 4: Escribir `materiales.ts`**

```ts
import * as THREE from 'three';

/** Acento único del sitio (G9). Idéntico al token CSS --rec. */
export const REC = 0xff2d2d;
export const VOID = 0x080808;

/** Superficie principal: metal casi negro, muy poco brillo. */
export function metalOscuro(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0x0e0e0e,
    metalness: 0.85,
    roughness: 0.42,
  });
}

/** Rejilla de micrófono: malla metálica que deja pasar algo de luz. */
export function rejilla(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0x141414,
    metalness: 0.95,
    roughness: 0.55,
    transparent: true,
    opacity: 0.82,
    side: THREE.DoubleSide,
  });
}

/** Piezas que llevan el acento: anillo del micrófono, testigo de grabación. */
export function emisivoAcento(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: REC,
    emissive: REC,
    emissiveIntensity: 0.65,
    metalness: 0.3,
    roughness: 0.5,
  });
}

/** Superficie blanca mate: conos de monitor, ciclorama, rótulo. */
export function blancoDifuso(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0xe9e6df,
    metalness: 0.05,
    roughness: 0.85,
  });
}
```

- [ ] **Paso 5: Escribir `luces.ts`**

```ts
import * as THREE from 'three';
import { REC } from './materiales';

/**
 * Temperatura de la luz ambiental de cada ruta. Reproduce cómo está
 * iluminado el espacio real. NO es un token de interfaz: el acento sigue
 * siendo uno solo (G9).
 */
export type Temperatura = 'ambar' | 'ambar-apagado' | 'violeta' | 'neutro';

const DIRECCIONAL: Record<Temperatura, { color: number; intensidad: number }> = {
  ambar: { color: 0xffc98a, intensidad: 0.55 },
  'ambar-apagado': { color: 0xc9a274, intensidad: 0.38 },
  violeta: { color: 0xa88cff, intensidad: 0.6 },
  neutro: { color: 0xf2f0ec, intensidad: 0.5 },
};

/**
 * Las tres luces de toda escena del sitio. Sin entorno HDRI: no hay
 * superficies pulidas que reflejen y encarecería la descarga (spec §6.3).
 */
export function crearLuces(t: Temperatura): THREE.Light[] {
  const cfg = DIRECCIONAL[t];

  const direccional = new THREE.DirectionalLight(cfg.color, cfg.intensidad);
  direccional.name = 'ambiente-direccional';
  direccional.position.set(1.5, 4, 2);

  // El foco de acento no cambia nunca: es el rojo REC en las seis rutas.
  const acento = new THREE.SpotLight(REC, 14, 18, Math.PI / 5, 0.55, 1.4);
  acento.name = 'acento';
  acento.position.set(-3.2, 1.4, 2.6);

  const ambiente = new THREE.AmbientLight(0x2a2a2a, 0.35);
  ambiente.name = 'ambiente';

  return [direccional, acento, ambiente];
}
```

- [ ] **Paso 6: Escribir `planos-profundidad.ts`**

```ts
import * as THREE from 'three';

/**
 * Las fotografías del estudio como planos a distinta profundidad detrás del
 * objeto. No son fotografías navegables: son atmósfera, y el paralaje que
 * producen al girar la cámara es geométrico y real (spec §6.4).
 */
const CAPAS = [
  { z: -12, opacidad: 0.18, escala: 26 },
  { z: -6, opacidad: 0.10, escala: 14 },
] as const;

export function crearPlanosProfundidad(rutas: [string, string]): THREE.Group {
  const grupo = new THREE.Group();
  grupo.name = 'planos-profundidad';

  const cargador = new THREE.TextureLoader();

  CAPAS.forEach((capa, i) => {
    const textura = cargador.load(rutas[i]);
    textura.colorSpace = THREE.SRGBColorSpace;

    const plano = new THREE.Mesh(
      new THREE.PlaneGeometry(capa.escala, capa.escala * 0.66),
      new THREE.MeshBasicMaterial({
        map: textura,
        transparent: true,
        opacity: capa.opacidad,
        depthWrite: false,
      }),
    );
    plano.position.z = capa.z;
    plano.name = `plano-${i}`;
    grupo.add(plano);
  });

  return grupo;
}
```

- [ ] **Paso 7: Ejecutar y comprobar que pasa**

Ejecutar: `npx vitest run tests/materiales.test.ts`
Esperado: PASS, 10 tests.

- [ ] **Paso 8: Commit**

```bash
git add src/three/materiales.ts src/three/luces.ts src/three/planos-profundidad.ts public/escena tests/materiales.test.ts
git commit -m "feat(S3D): materiales de metal oscuro, tres luces y planos de profundidad"
```

---

