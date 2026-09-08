# Informe — Tarea 23: Ruta base configurable y preview de GitHub Pages

**Commit:** `e17a856` — `feat(S00): ruta base configurable por entorno y preview no indexable`

## Contexto de ejecución

Ejecutada inmediatamente después de la Tarea 5, tal como indica el brief, para que ninguna
página futura escriba rutas absolutas a mano. `src/components/SmoothScroll.astro` (Tarea 6)
todavía no existe, así que el repositorio no compila: por instrucción explícita del director,
se saltó `npm run build` y la verificación por `grep` del Paso 7, y solo se ejecutó `npm test`.

## Ciclo TDD seguido

1. **Rojo:** se creó `tests/rutas.test.ts` con los 10 tests del brief y se ejecutó
   `npx vitest run tests/rutas.test.ts`. Falló como se esperaba:
   `Error: Cannot find module '../src/data/rutas'`.
2. Se creó `src/data/rutas.ts` (helper `ruta()`) y se volvió a ejecutar el test aislado:
   5 tests pasaron (el helper en sí) y 5 fallaron (configuración/componentes aún no tocados),
   confirmando que el helper es correcto antes de tocar el resto.
3. **Verde:** se aplicaron los cambios en `astro.config.mjs`, `public/.nojekyll`,
   `src/layouts/BaseLayout.astro`, `src/components/Nav.astro` y `src/components/Footer.astro`.
   `npx vitest run tests/rutas.test.ts` pasó 10/10.
4. Se ejecutó la suite completa (`npm test`): **61/61** (51 previos + 10 nuevos).

## Archivos modificados/creados, por bloque

### `src/data/rutas.ts` (nuevo)
Helper `ruta(p: string): string` que antepone `import.meta.env.BASE_URL` (sin barra final) a
rutas internas, dejando intactas URLs externas, `mailto:`, `tel:`, `data:` y anclas `#...`, y
la raíz `/`. Código idéntico al del brief (Paso 3).

### `astro.config.mjs`
Sustituido el bloque inicial por la versión del brief: `SITE` sale de
`process.env.SITE_URL || process.env.URL || 'https://safetory.netlify.app'` y `BASE` de
`process.env.BASE_PATH || undefined`, pasados a `site` y `base` de `defineConfig`. Nada de la
base ni del dominio de producción queda fijo en el código.

### `public/.nojekyll` (nuevo, vacío)
Creado con `touch`, sin contenido, tal como pide el brief.

### `src/layouts/BaseLayout.astro`
- Añadido `import { ruta } from '../data/rutas';` (línea 8).
- Prop desestructurada renombrada: `const { title, description, ruta: rutaProp, poster,
  noindex = false } = Astro.props;` (línea 18) — la interfaz `Props` conserva el nombre
  `ruta: string` sin cambios (es un tipo, no colisiona con el helper).
- Nueva constante `ES_PREVIEW = import.meta.env.PUBLIC_PREVIEW === 'true'` (línea 22).
- `canonica` y `ogImagen` ahora pasan sus rutas internas por `ruta(...)` (líneas 26-27).
- `esHome` compara contra `rutaProp` (línea 28).
- Meta robots: `{(noindex || ES_PREVIEW) && <meta name="robots" content="noindex, nofollow" />}`
  (línea 73).
- Los dos `<link rel="preload">` de fuentes usan `ruta(...)` (líneas 77-78).
- `<Nav ruta={rutaProp} />` (línea 101).
- `href="#contenido"` del enlace de salto: **no tocado**, según instrucción explícita (línea 100).

### `src/components/Nav.astro`
- Añadido `import { ruta } from '../data/rutas';` (línea 3).
- Prop renombrada: `const { ruta: rutaActiva } = Astro.props;` (línea 6). El array `enlaces`
  no se tocó (línea 8-15, mismas seis rutas lógicas).
- `href={ruta('/')}` en el logo (línea 19).
- `href={ruta(e.href)}` y `aria-current={rutaActiva === e.href ...}` en el `.map()` (línea 24).

### `src/components/Footer.astro`
- Añadido `import { ruta } from '../data/rutas';` (línea 3).
- `telefonoE164` simplificado a `` `tel:+${site.whatsapp}` `` (línea 12), eliminando el
  recorte/reconstrucción manual del prefijo `+507`.
- Los cinco enlaces de sección: `{enlaces.map((e) => <a href={ruta(e.href)}>{e.texto}</a>)}`
  (línea 39). `telefonoE164`, el `mailto:` y el enlace de Instagram no se tocaron.

### `tests/rutas.test.ts` (nuevo)
Copia exacta del brief: helper de ruta base, configuración de despliegue, `.nojekyll`,
noindex de preview, y ausencia de rutas internas escritas a mano en Nav/Footer.

### `tests/componentes.test.ts`
Dentro de `describe('Footer')`, se sustituyó el test `'el telefono es un enlace tel: en formato
internacional'` (que buscaba literalmente `'tel:+507'` en la fuente, y por tanto habría hecho
fallar el código nuevo) por el test dado en el arreglo de la Tarea 5:
`'el telefono se deriva de site.whatsapp, no se escribe a mano'`, que comprueba que la fuente
contiene `site.whatsapp` y no contiene `'+507` escrito a mano.

## Comando de test y salida literal (verificación final antes de commit)

```
$ npm test

> safetory@1.0.0 test
> vitest run


 RUN  v5.0.0 C:/Users/MIPC/Desktop/DESARROLLOS/SAFETORY


 Test Files  6 passed (6)
      Tests  61 passed (61)
   Start at  01:26:53
   Duration  653ms (transform 57%, import 28%, tests 8%, worker 6%)
```

61/61 (51 previos de las Tareas 1-5 + 10 nuevos de `rutas.test.ts`).

## Desviaciones del brief

Ninguna. Se siguió el brief al pie de la letra, incluyendo:
- El salto del build/grep del Paso 7 (SmoothScroll no existe todavía — Tarea 6).
- El arreglo del teléfono y su test, tal como los dio el director en el encargo.

## No se tocaron

- `public/robots.txt` — apunta a producción, no debe cambiar (regla explícita).
- `href="#contenido"` en `BaseLayout.astro` — ancla de la misma página, sin base.
- El array `enlaces` de `Nav.astro` — sigue declarando las seis rutas lógicas sin cambios,
  solo el marcado pasa `e.href` por el helper.

---

## Ronda de arreglo 1 — hallazgo Importante: helper no idempotente con base

**Hallazgo del revisor:** en `src/data/rutas.ts`, `if (p === '/') return BASE || '/';` solo
reconocía `/` como entrada, no el valor ya procesado por la base. Con `BASE = '/Safetory'`,
`ruta(ruta('/'))` devolvía `'/Safetory/Safetory'`. Nada en el código de hoy aplica el helper
dos veces, pero es un helper compartido que usarán todas las páginas y módulos 3D restantes,
y el diseño exige idempotencia. Causa de fondo: `BASE_URL` se fija en tiempo de build, así
que la suite original solo ejercitaba la rama sin base — la rama que de verdad se despliega
en el preview no tenía cobertura.

### Qué cambié

- **`src/data/rutas.ts`** — reescrito siguiendo el brief corregido (Paso 3). Se extrajo la
  lógica a una función pura y exportada `aplicarBase(base: string, p: string): string`, que
  recibe la base como parámetro en vez de leerla de `import.meta.env`. Dentro, la base se
  normaliza sin barra final (`const b = base.replace(/\/$/, '')`) y la condición de
  idempotencia pasó a ser `if (b && (p === b || p.startsWith(\`${b}/\`))) return p;` — ahora
  reconoce tanto la ruta ya prefijada (`/Safetory/estudio`) como la base sola (`/Safetory`), no
  solo la raíz cruda. `ruta(p)` quedó como una línea: `return aplicarBase(import.meta.env.BASE_URL, p);`.

- **`tests/rutas.test.ts`** — se importó también `aplicarBase` (línea 3) y se añadió el bloque
  `describe('la rama con base, que es la del preview', ...)` completo, con `B = '/Safetory/'`:
  antepone la base a una ruta interna, la raíz queda en la base sin barra sobrante, es
  idempotente (aplicada dos veces no duplica la base — el test que directamente reproduce el
  bug reportado), deja intactos los esquemas externos, y nunca produce barra doble. Esta suite
  ejercita la rama con base sin depender de `BASE_URL` en tiempo de build, cerrando el hueco de
  cobertura que señaló el revisor.

No se tocó nada más: `astro.config.mjs`, `BaseLayout.astro`, `Nav.astro`, `Footer.astro` y el
arreglo del teléfono quedaron sin cambios, tal como confirmó la revisión.

### Comando y salida literal

```
$ npm test

> safetory@1.0.0 test
> vitest run


 RUN  v5.0.0 C:/Users/MIPC/Desktop/DESARROLLOS/SAFETORY


 Test Files  6 passed (6)
      Tests  66 passed (66)
   Start at  01:33:40
   Duration  749ms (transform 51%, import 31%, tests 10%, worker 8%)
```

66/66 (61 anteriores + 5 nuevos del bloque de idempotencia).

**Commit del arreglo:** ver hash abajo.
