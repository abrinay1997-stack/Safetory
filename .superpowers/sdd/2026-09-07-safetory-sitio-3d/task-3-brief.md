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

## Tarea 3: Capa de datos y generador de WhatsApp

**Archivos:**
- Crear: `src/data/tipos.ts`, `src/data/site.ts`, `src/data/whatsapp.ts`,
  `src/data/estudio.ts`, `src/data/ciclorama.ts`, `src/data/produccion.ts`,
  `src/data/membresia.ts`, `src/data/equipo.ts`
- Test: `tests/datos.test.ts`

**Interfaces:**
- Produce:
  - `interface Tarifa { id: string; nombre: string; duracion: string; precio: number | null; condicion?: string }`
  - `site: { nombre, eslogan, direccion, telefono, whatsapp, correo, instagram, horario, lang, locale, themeColor }`
  - `enlaceWhatsApp(servicio: string): string`
  - `tarifasEstudio: Tarifa[]`, `bloquesEstudioMiembro: Tarifa[]`
  - `cicloramaFoto: Tarifa[]`, `cicloramaVideo: Tarifa[]`, `bloquesCicloramaMiembro: Tarifa[]`
  - `serviciosProduccion: Tarifa[]`
  - `incluidoMembresia: string[]`
  - `equipoVerificable: string[]`

- [ ] **Paso 1: Escribir el test que falla**

`tests/datos.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { site } from '../src/data/site';
import { enlaceWhatsApp } from '../src/data/whatsapp';
import { tarifasEstudio, bloquesEstudioMiembro } from '../src/data/estudio';
import { cicloramaFoto, cicloramaVideo } from '../src/data/ciclorama';
import { serviciosProduccion } from '../src/data/produccion';
import { incluidoMembresia } from '../src/data/membresia';
import { equipoVerificable } from '../src/data/equipo';

describe('identidad y contacto', () => {
  it('reproduce los datos reales de Safetory', () => {
    expect(site.nombre).toBe('Safetory Studio');
    expect(site.eslogan).toBe('Donde la innovación se encuentra con la perfección');
    expect(site.direccion).toBe('Edificio Brasilia, Vía España, Panamá, Provincia de Panamá');
    expect(site.telefono).toBe('6799-8881');
    expect(site.correo).toBe('info@safetoryglobal.com');
    expect(site.instagram).toBe('https://instagram.com/safetorystudio');
  });

  it('publica el horario tal y como lo declara el estudio', () => {
    expect(site.horario).toEqual([
      { dias: 'Lunes a viernes', horas: '24 horas' },
      { dias: 'Sábado', horas: '9:00–12:30' },
      { dias: 'Domingo', horas: 'Cerrado' },
    ]);
  });
});

describe('enlace de WhatsApp', () => {
  it('apunta al número con prefijo de Panamá', () => {
    expect(enlaceWhatsApp('Studio 1 · 3 horas')).toMatch(/^https:\/\/wa\.me\/50767998881\?text=/);
  });

  it('codifica el servicio dentro del mensaje', () => {
    const url = enlaceWhatsApp('Servicio de Mastering');
    expect(decodeURIComponent(url.split('text=')[1]))
      .toBe('Hola, quiero reservar: Servicio de Mastering');
  });

  it('no deja espacios sin codificar', () => {
    expect(enlaceWhatsApp('Studio 1')).not.toContain(' ');
  });
});

describe('tarifas de Studio 1', () => {
  it('cobra 50 la hora suelta', () => {
    const h = tarifasEstudio.find((t) => t.id === 'estudio-1h');
    expect(h?.precio).toBe(50);
    expect(h?.duracion).toBe('1 hora');
  });

  it('cobra 35 por hora a partir de 3 horas, con la condición literal', () => {
    const b = tarifasEstudio.find((t) => t.id === 'estudio-3h');
    expect(b?.precio).toBe(35);
    expect(b?.condicion).toBe(
      'Si alquilas 3 horas o más, cada hora consumida queda en $35.'
    );
  });

  it('los bloques de miembro no tienen precio', () => {
    expect(bloquesEstudioMiembro).toHaveLength(3);
    bloquesEstudioMiembro.forEach((b) => expect(b.precio).toBeNull());
    expect(bloquesEstudioMiembro.map((b) => b.duracion))
      .toEqual(['3 horas', '5 horas', '8 horas']);
  });
});

describe('tarifas de ciclorama', () => {
  it('fotografía cuesta 25 la primera hora y 20 las siguientes', () => {
    expect(cicloramaFoto).toHaveLength(1);
    expect(cicloramaFoto[0].precio).toBe(25);
    expect(cicloramaFoto[0].condicion).toBe('Hora adicional: $20.');
  });

  it('vídeo tiene tres bloques con los precios publicados', () => {
    expect(cicloramaVideo.map((t) => [t.duracion, t.precio])).toEqual([
      ['2 horas', 50],
      ['4 horas', 90],
      ['8 horas', 280],
    ]);
  });

  it('todos los bloques de vídeo declaran la hora adicional', () => {
    cicloramaVideo.forEach((t) => expect(t.condicion).toBe('Hora adicional: $25.'));
  });
});

describe('servicios de producción', () => {
  it('son seis, en orden, y con los precios exactos', () => {
    expect(serviciosProduccion.map((s) => [s.id, s.precio])).toEqual([
      ['mixing', 60],
      ['mastering', 50],
      ['mixing-mastering', 105],
      ['grabacion', 45],
      ['grabacion-instrumental', 80],
      ['produccion-personalizada', 300],
    ]);
  });

  it('ningún servicio de producción queda sin precio', () => {
    serviciosProduccion.forEach((s) => expect(s.precio).not.toBeNull());
  });

  it('no promete plazos de entrega que el estudio nunca publicó (G1)', () => {
    // La fuente registra «23h 59min» para mixing y mastering: es la longitud
    // del hueco en la agenda de reservas, no un plazo de entrega. Convertirlo
    // en «entrega en 24 horas» sería fabricar un compromiso comercial.
    serviciosProduccion.forEach((s) => {
      expect(s.duracion ?? '', s.id).not.toMatch(/entrega|plazo|24\s*horas/i);
    });
  });

  it('solo llevan duración los servicios que se miden en tiempo', () => {
    const conDuracion = serviciosProduccion.filter((s) => s.duracion).map((s) => s.id);
    expect(conDuracion).toEqual([
      'grabacion',
      'grabacion-instrumental',
      'produccion-personalizada',
    ]);
  });

  it('mastering limita a 8 stems y mixing no limita', () => {
    expect(serviciosProduccion.find((s) => s.id === 'mixing')?.condicion)
      .toBe('Stems ilimitados.');
    expect(serviciosProduccion.find((s) => s.id === 'mastering')?.condicion)
      .toBe('Máximo 8 stems.');
  });

  it('la grabación avisa de que no entra en la hora de estudio', () => {
    expect(serviciosProduccion.find((s) => s.id === 'grabacion')?.condicion)
      .toBe('No incluido en la hora de alquiler del estudio.');
  });

  it('la producción personalizada enumera sus siete entregables', () => {
    const p = serviciosProduccion.find((s) => s.id === 'produccion-personalizada');
    expect(p?.precio).toBe(300);
    expect(p?.condicion).toContain('Instrumental desde cero');
    expect(p?.condicion).toContain('asesoría creativa');
  });
});

describe('huecos de contenido del spec §9.5', () => {
  it('la membresía describe los bloques pero no inventa precio', () => {
    expect(incluidoMembresia.length).toBeGreaterThan(0);
    incluidoMembresia.forEach((linea) => expect(linea).not.toMatch(/\$\d/));
  });

  it('el inventario de equipo no publica marcas ni modelos (G15)', () => {
    const prohibidas = ['Manley', 'Yamaha', 'Universal Audio', 'Apollo', 'HS5', 'HS8'];
    equipoVerificable.forEach((linea) => {
      prohibidas.forEach((m) => expect(linea).not.toContain(m));
    });
  });
});
```

- [ ] **Paso 2: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/datos.test.ts`
Esperado: FAIL — `Cannot find module '../src/data/site'`

- [ ] **Paso 3: Escribir los módulos de datos**

`src/data/tipos.ts`:

```ts
/** Una línea de tarifa publicada. `precio: null` = incluido en la membresía. */
export interface Tarifa {
  id: string;
  nombre: string;
  /**
   * Duración real del servicio. Se omite cuando el servicio no se mide en
   * tiempo: mixing y mastering se cobran por trabajo, no por horas, y el
   * estudio no publica plazo de entrega. Inventar uno sería una promesa
   * comercial que nadie ha hecho (G1).
   */
  duracion?: string;
  precio: number | null;
  /**
   * Condición publicada por el estudio, en su redacción final. Se puede
   * corregir ortografía y acentuación; nunca alterar el significado ni
   * añadir compromisos que no estén en la fuente.
   */
  condicion?: string;
}

export interface FranjaHoraria {
  dias: string;
  horas: string;
}
```

`src/data/site.ts`:

```ts
import type { FranjaHoraria } from './tipos';

/**
 * Identidad y contacto. Origen: safetorystudio.setmore.com, extraído 2026-09-07.
 * Única fuente de verdad: ninguna plantilla escribe estos datos a mano.
 */
export const site = {
  nombre: 'Safetory Studio',
  eslogan: 'Donde la innovación se encuentra con la perfección',
  direccion: 'Edificio Brasilia, Vía España, Panamá, Provincia de Panamá',
  telefono: '6799-8881',
  whatsapp: '50767998881',
  correo: 'info@safetoryglobal.com',
  instagram: 'https://instagram.com/safetorystudio',
  lang: 'es',
  locale: 'es_PA',
  themeColor: '#080808',
  horario: [
    { dias: 'Lunes a viernes', horas: '24 horas' },
    { dias: 'Sábado', horas: '9:00–12:30' },
    { dias: 'Domingo', horas: 'Cerrado' },
  ] as FranjaHoraria[],
} as const;
```

`src/data/whatsapp.ts`:

```ts
import { site } from './site';

/**
 * Enlace de reserva con el mensaje ya escrito.
 * Punto único de cambio: cuando exista el agendado nativo (fase 2), solo
 * se reescribe esta función y ninguna plantilla se toca.
 */
export function enlaceWhatsApp(servicio: string): string {
  const texto = `Hola, quiero reservar: ${servicio}`;
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(texto)}`;
}
```

`src/data/estudio.ts`:

```ts
import type { Tarifa } from './tipos';

export const tarifasEstudio: Tarifa[] = [
  {
    id: 'estudio-1h',
    nombre: 'Studio 1 · hora suelta',
    duracion: '1 hora',
    precio: 50,
  },
  {
    id: 'estudio-3h',
    nombre: 'Studio 1 · bloque',
    duracion: '3 horas o más',
    precio: 35,
    condicion: 'Si alquilas 3 horas o más, cada hora consumida queda en $35.',
  },
];

export const bloquesEstudioMiembro: Tarifa[] = [
  { id: 'estudio-m3', nombre: 'Bloque de miembro', duracion: '3 horas', precio: null },
  { id: 'estudio-m5', nombre: 'Bloque de miembro', duracion: '5 horas', precio: null },
  { id: 'estudio-m8', nombre: 'Bloque de miembro', duracion: '8 horas', precio: null },
];
```

`src/data/ciclorama.ts`:

```ts
import type { Tarifa } from './tipos';

export const cicloramaFoto: Tarifa[] = [
  {
    id: 'ciclo-foto-1h',
    nombre: 'Ciclorama · fotografía',
    duracion: '1 hora',
    precio: 25,
    condicion: 'Hora adicional: $20.',
  },
];

export const cicloramaVideo: Tarifa[] = [
  {
    id: 'ciclo-video-2h',
    nombre: 'Ciclorama · vídeo',
    duracion: '2 horas',
    precio: 50,
    condicion: 'Hora adicional: $25.',
  },
  {
    id: 'ciclo-video-4h',
    nombre: 'Ciclorama · vídeo',
    duracion: '4 horas',
    precio: 90,
    condicion: 'Hora adicional: $25.',
  },
  {
    id: 'ciclo-video-8h',
    nombre: 'Ciclorama · vídeo',
    duracion: '8 horas',
    precio: 280,
    condicion: 'Hora adicional: $25.',
  },
];

export const bloquesCicloramaMiembro: Tarifa[] = [
  { id: 'ciclo-m3', nombre: 'Bloque de miembro', duracion: '3 horas', precio: null },
  { id: 'ciclo-m5', nombre: 'Bloque de miembro', duracion: '5 horas', precio: null },
];
```

`src/data/produccion.ts`:

```ts
import type { Tarifa } from './tipos';

export const serviciosProduccion: Tarifa[] = [
  // Mixing y mastering se cobran por trabajo, no por tiempo. La fuente
  // registra «23h 59min», que es la longitud del hueco de reserva en la
  // agenda, no un plazo de entrega. Publicar un plazo sería inventar un
  // compromiso comercial (G1), así que estos tres van sin `duracion`.
  {
    id: 'mixing',
    nombre: 'Mixing',
    precio: 60,
    condicion: 'Stems ilimitados.',
  },
  {
    id: 'mastering',
    nombre: 'Mastering',
    precio: 50,
    condicion: 'Máximo 8 stems.',
  },
  {
    id: 'mixing-mastering',
    nombre: 'Mixing y Mastering',
    precio: 105,
    condicion: 'Stems de mixing ilimitados. Máximo 8 stems de mastering.',
  },
  {
    id: 'grabacion',
    nombre: 'Grabación',
    duracion: '3 horas',
    precio: 45,
    condicion: 'No incluido en la hora de alquiler del estudio.',
  },
  {
    id: 'grabacion-instrumental',
    nombre: 'Grabación sobre instrumental del cliente',
    duracion: '2 horas',
    precio: 80,
    condicion:
      'Ingeniero de grabación incluido. Pre-mezcla de voces con el instrumental. No incluye mixing ni mastering.',
  },
  {
    id: 'produccion-personalizada',
    nombre: 'Producción Personalizada',
    duracion: 'Hasta terminar el producto',
    precio: 300,
    condicion:
      'Instrumental desde cero · horas de estudio ilimitadas hasta terminar · grabación de voces · edición de voces · mixing · master · asesoría creativa.',
  },
];
```

`src/data/membresia.ts`:

```ts
/**
 * Qué incluye la membresía. El precio y las condiciones de alta NO constan
 * en ninguna fuente (spec §9.5): no se inventan y el CTA lleva a consultar.
 */
export const incluidoMembresia: string[] = [
  'Studio 1: bloques de 3, 5 y 8 horas sin coste.',
  'Ciclorama y co-working: bloques de 3 y 5 horas sin coste.',
];
```

`src/data/equipo.ts`:

```ts
/**
 * Inventario técnico identificable en las fotografías del cliente.
 * Sin marcas ni modelos (G15): identificar mal un equipo en la web de un
 * estudio destruye la credibilidad ante un profesional.
 */
export const equipoVerificable: string[] = [
  'Micrófono de condensador de válvulas con suspensión antivibratoria y antipop',
  'Par de monitores de campo cercano',
  'Dos interfaces de audio de sobremesa',
  'Tratamiento acústico: paneles absorbentes y difusores de listón vertical',
  'Ciclorama de curva infinita con iluminación LED',
];
```

- [ ] **Paso 4: Ejecutar y comprobar que pasa**

Ejecutar: `npx vitest run tests/datos.test.ts`
Esperado: PASS, 15 tests.

- [ ] **Paso 5: Commit**

```bash
git add src/data tests/datos.test.ts
git commit -m "feat(S00): capa de datos con el contenido real y generador de WhatsApp"
```

---

