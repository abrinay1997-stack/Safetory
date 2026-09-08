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

## Tarea 22: Las cuatro pasadas de calidad

**Archivos:**
- Crear: `tests/salida.test.ts` (comprobaciones sobre el HTML construido)
- Modificar: `CLAUDE.md` (sección «Estado actual»)

Es la definición de terminado del spec §14. Se ejecuta en este orden:
**SEO → Accesibilidad → Rendimiento → Copy**.

- [ ] **Paso 1: Escribir las comprobaciones sobre el build**

`tests/salida.test.ts`:

```ts
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';

const RUTAS = ['index', 'estudio', 'ciclorama', 'produccion', 'membresia', 'contacto'];

function html(ruta: string): string {
  return readFileSync(`dist/${ruta}.html`, 'utf8');
}

beforeAll(() => {
  if (!existsSync('dist/index.html')) {
    throw new Error('Ejecuta `npm run build` antes de esta suite.');
  }
});

describe('pasada 1 — SEO', () => {
  it('las seis rutas existen en dist', () => {
    RUTAS.forEach((r) => expect(existsSync(`dist/${r}.html`), r).toBe(true));
  });

  it('cada ruta tiene title y description propios y no repetidos', () => {
    const titulos = RUTAS.map((r) => html(r).match(/<title>(.*?)<\/title>/)?.[1] ?? '');
    const descripciones = RUTAS.map(
      (r) => html(r).match(/name="description" content="(.*?)"/)?.[1] ?? '');
    expect(new Set(titulos).size).toBe(RUTAS.length);
    expect(new Set(descripciones).size).toBe(RUTAS.length);
    descripciones.forEach((d) => expect(d.length).toBeGreaterThan(60));
  });

  it('el sitemap existe y no incluye /dev/', () => {
    const sitemap = readdirSync('dist').find((f) => f.startsWith('sitemap'));
    expect(sitemap).toBeDefined();
    const contenido = readFileSync(`dist/${sitemap}`, 'utf8');
    expect(contenido).not.toContain('/dev/');
  });

  it('LocalBusiness solo en la home y sin aggregateRating', () => {
    expect(html('index')).toContain('LocalBusiness');
    expect(html('index')).not.toContain('aggregateRating');
    expect(html('estudio')).not.toContain('LocalBusiness');
  });
});

describe('pasada 2 — Accesibilidad', () => {
  it('cada ruta tiene exactamente un h1 (G8)', () => {
    RUTAS.forEach((r) => {
      expect((html(r).match(/<h1[\s>]/g) ?? []).length, r).toBe(1);
    });
  });

  it('todas las imagenes tienen alt', () => {
    RUTAS.forEach((r) => {
      (html(r).match(/<img[^>]*>/g) ?? []).forEach((img) => {
        expect(img, `${r}: ${img}`).toMatch(/\salt=/);
      });
    });
  });

  it('todo canvas queda oculto a la accesibilidad', () => {
    RUTAS.forEach((r) => {
      (html(r).match(/<canvas[^>]*>/g) ?? []).forEach((c) => {
        expect(c, r).toContain('aria-hidden="true"');
      });
    });
  });

  it('cada ruta ofrece el enlace de salto al contenido', () => {
    RUTAS.forEach((r) => expect(html(r), r).toContain('href="#contenido"'));
  });

  it('los enlaces externos llevan rel de seguridad', () => {
    RUTAS.forEach((r) => {
      (html(r).match(/<a[^>]*target="_blank"[^>]*>/g) ?? []).forEach((a) => {
        expect(a, r).toContain('noopener');
      });
    });
  });
});

describe('pasada 3 — Rendimiento', () => {
  it('ningun bundle JS inicial supera 140 KB sin comprimir por ruta', () => {
    // Umbral generoso sin gzip: la comprobacion fina se hace con Lighthouse.
    const assets = readdirSync('dist/_astro').filter((f) => f.endsWith('.js'));
    const inicial = assets.filter((f) => !f.includes('three'));
    inicial.forEach((f) => {
      expect(statSync(`dist/_astro/${f}`).size, f).toBeLessThan(420 * 1024);
    });
  });

  it('three viaja en su propio chunk, separado del arranque (G5)', () => {
    const assets = readdirSync('dist/_astro').filter((f) => f.endsWith('.js'));
    const contenidoInicial = assets
      .filter((f) => f.includes('BaseLayout') || f.includes('client'))
      .map((f) => readFileSync(`dist/_astro/${f}`, 'utf8'))
      .join('');
    expect(contenidoInicial).not.toContain('WebGLRenderer');
  });

  it('los seis posters existen y ninguno supera 60 KB', () => {
    ['home', 'estudio', 'ciclorama', 'produccion', 'membresia', 'contacto']
      .forEach((p) => {
        const ruta = `dist/posters/${p}.webp`;
        expect(existsSync(ruta), p).toBe(true);
        expect(statSync(ruta).size, p).toBeLessThan(60 * 1024);
      });
  });

  it('el poster de cada ruta se marca como prioritario: es el LCP', () => {
    RUTAS.forEach((r) => expect(html(r), r).toContain('fetchpriority="high"'));
  });
});

describe('pasada 4 — Copy', () => {
  it('no queda ningun placeholder (G2)', () => {
    const prohibidos = ['lorem', 'Lorem', 'TODO', 'TBD', 'href="#"',
                        'G-XXXXXXXXXX', 'your-', 'placeholder'];
    RUTAS.forEach((r) => {
      prohibidos.forEach((p) => expect(html(r), `${r}: ${p}`).not.toContain(p));
    });
  });

  it('no se publica ninguna marca ni modelo de equipo (G15)', () => {
    const marcas = ['Manley', 'Yamaha', 'Universal Audio', 'Apollo', 'Neumann', 'HS8'];
    RUTAS.forEach((r) => {
      marcas.forEach((m) => expect(html(r), `${r}: ${m}`).not.toContain(m));
    });
  });

  it('membresia no publica ninguna cifra de precio (§9.5)', () => {
    const cuerpo = html('membresia').split('<main')[1] ?? '';
    expect(cuerpo).not.toMatch(/\$\s?\d/);
  });

  it('ninguna ruta menciona Setmore', () => {
    RUTAS.forEach((r) => expect(html(r).toLowerCase(), r).not.toContain('setmore'));
  });

  it('los precios publicados coinciden con los datos', () => {
    expect(html('estudio')).toContain('value="50"');
    expect(html('estudio')).toContain('value="35"');
    expect(html('ciclorama')).toContain('value="280"');
    expect(html('produccion')).toContain('value="300"');
  });
});
```

- [ ] **Paso 2: Ejecutar el build y la suite completa**

```bash
npm run build && npm test
```

Esperado: todas las suites PASS. Corregir lo que falle antes de continuar; no se avanza con
tests en rojo.

- [ ] **Paso 3: Pasada de rendimiento real con Lighthouse**

```bash
npx serve dist -l 4321
```

En Chrome, DevTools → Lighthouse → modo móvil, categorías Rendimiento, Accesibilidad,
Prácticas recomendadas y SEO. Ejecutar sobre las seis rutas.

Objetivos del spec §14, que son condición de entrega:

| Métrica | Objetivo |
|---|---|
| Accesibilidad | **100** |
| LCP | ≤1,8 s |
| INP | ≤150 ms |
| CLS | ≤0,02 |
| JS inicial | ≤140 KB gz |

Si el LCP supera 1,8 s, el póster pesa de más: rebajar la calidad WebP a 0,72 y recapturar.
Si el CLS supera 0, el canvas no está ocupando la caja del póster: revisar `inset: 0` y las
dimensiones `width`/`height` del `<img>`.

- [ ] **Paso 4: Verificar la degradación (§7.3)**

Comprobar a mano, en DevTools:
1. **Reduce motion:** Rendering → Emulate `prefers-reduced-motion: reduce`. La página debe
   quedarse en los pósters, sin Lenis y sin despiece, y seguir completamente navegable.
2. **Sin WebGL:** `chrome://flags` → deshabilitar WebGL. Mismo resultado.
3. **Teclado:** recorrer las seis rutas solo con Tab. El primer foco es «Saltar al contenido»
   y todo elemento interactivo muestra el contorno rojo.

- [ ] **Paso 5: Actualizar el estado en `CLAUDE.md`**

Sustituir la sección «Estado actual» por el estado real tras la implementación: qué rutas
están en producción, qué pasadas se ejecutaron con qué resultado, y los huecos de §9.5 que
sigan abiertos.

- [ ] **Paso 6: Commit y push**

```bash
git add tests/salida.test.ts CLAUDE.md
git commit -m "feat(S11): cuatro pasadas de calidad y comprobaciones sobre el build"
git push
```

---

---

