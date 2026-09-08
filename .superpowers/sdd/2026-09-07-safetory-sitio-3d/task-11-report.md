# Tarea 11 — La isla `Escena3D` y la herramienta de pósters

## Estado: DONE_WITH_CONCERNS

Implementados los pasos 1 a 4 del brief. El paso 5 (captura manual del póster de la Home) y
el paso 5b (checklist en navegador) quedan para el controlador, tal como se me indicó. Por
tanto queda exactamente un test en rojo: el que comprueba `public/posters/home.webp`.

## Qué implementé

1. `tests/escena.test.ts` — la suite del Paso 1, con una corrección propia (ver «Hallazgo de
   auto-revisión» más abajo).
2. `src/components/Escena3D.astro` — la isla: póster `<img>` como LCP, `<canvas>` oculto a
   accesibilidad, montaje diferido tras idle con `import()` dinámico de `motor`, `luces` y
   `planos-profundidad`, resolución del objeto vía `import.meta.glob('../three/objetos/*.ts')`,
   destrucción en `astro:before-swap`, y las dos rutas (`poster`, `fondos`) pasadas por `ruta()`.
   Con una corrección de ciclo de vida respecto al literal del brief (ver abajo).
3. `src/pages/dev/posters.astro` — herramienta interna de captura: selector de objeto, canvas
   1280×800, cámara sobre `puntoEnEspiral`, encuadre por rueda del ratón, descarga WebP vía
   `toDataURL`. Marcada `noindex` a través de `BaseLayout`. Código literal del brief, sin
   cambios.

## Hallazgo de auto-revisión — dos correcciones sobre el literal del brief

### 1. Aserto roto por una contradicción interna del propio brief

El test del Paso 1 exige `expect(s).toContain('await import(')`, pero el código que el mismo
brief da en el Paso 3 escribe:

```ts
const [{ crearMotor }, { crearLuces }, { crearPlanosProfundidad }] = await Promise.all([
  import('../three/motor'),
  import('../three/luces'),
  import('../three/planos-profundidad'),
]);
```

Aquí `await` e `import(` nunca quedan pegados como subcadena literal (hay `Promise.all([` de
por medio), así que el aserto falla siempre, sin importar cuán correcto sea el código. Apliqué
el listón de este proyecto: «si un aserto solo pasa cuando retocas el objeto que estás
probando, el defecto está en el aserto, no en el objeto». No toqué el componente (habría sido
inventar código muerto solo para colar la subcadena); corregí el aserto para que comprobara el
mismo hecho — carga dinámica, con `await`, del motor — sin depender del formato de línea:

```ts
it('carga three solo por import dinamico y tras el idle (G5)', () => {
  const s = src();
  expect(s).toContain('await Promise.all([');
  expect(s).toContain("import('../three/motor')");
  expect(s).toContain('requestIdleCallback');
  expect(s).not.toMatch(/^import \* as THREE/m);
});
```

Fallaría si se quitara el `await Promise.all(`, si se dejara de importar dinámicamente el
motor, si se quitara `requestIdleCallback`, o si apareciera un `import * as THREE` estático de
nivel superior. Cubre exactamente lo que el nombre del test promete (G5).

### 2. Doble montaje — la misma trampa de la Tarea 6, reintroducida por el literal del brief

El código del Paso 3 termina con:

```ts
document.addEventListener('astro:page-load', programar);
document.addEventListener('astro:before-swap', limpiar);

if (document.readyState !== 'loading') programar();
```

`CLAUDE.md` documenta como trampa ya pisada: «`astro:page-load` se dispara también en la carga
inicial, enganchado al evento nativo `load`. Añadir un segundo arranque con `readyState` monta
el sistema dos veces.» Comprobé el resto del código base — `src/components/Reveal.astro` y
`src/components/SmoothScroll.astro`, ambos con el mismo problema ya resuelto — y los dos usan
un solo mecanismo: solo el listener de `astro:page-load`, sin el `if (document.readyState
!== 'loading')` añadido. El literal del brief para `Escena3D.astro` reintroducía exactamente
ese doble arranque: en la carga inicial de cada una de las seis rutas, `programar()` se
llamaría dos veces (una por el chequeo de `readyState`, otra por el evento `astro:page-load`
disparado sobre `load`), programando dos llamadas a `montar()` y, en el caso normal, creando
dos motores/dos contextos WebGL para la misma escena.

Quité la línea `if (document.readyState !== 'loading') programar();` y dejé el mismo
comentario que ya usan `Reveal.astro`/`SmoothScroll.astro` explicando el porqué. No añadí
ninguna guarda extra de idempotencia: con un solo mecanismo de arranque no hace falta, igual
que en esos dos componentes.

Ninguno de los 8 tests que sí pasan dependía de esa línea, así que la suite sigue en verde
tras quitarla.

## Qué probé y resultados

- `npx vitest run tests/escena.test.ts` → **8 en verde, 1 en rojo** (el del póster de la
  Home), antes y después de las dos correcciones anteriores.
- `npx vitest run` (suite completa) → **145 en verde, 1 en rojo, 146 en total**. Antes de esta
  tarea el proyecto tenía 137 en verde; los 9 tests nuevos de `tests/escena.test.ts` explican
  la diferencia (146 − 137 = 9).
- `npm run build` → build limpio, dos rutas generadas (`/404.html`, `/dev/posters.html`; las
  seis rutas del sitio llegan en tareas posteriores). El aviso de Vite sobre un chunk >500 kB
  corresponde a `three` importado de forma estática dentro del script de
  `dev/posters.astro` — es la herramienta interna, no una ruta pública, y el brief la diseña
  así a propósito (necesita cargar `three` inmediatamente para dibujar en el lienzo de
  captura). No aplica G5, que rige las seis rutas del sitio, no esta herramienta.

## Test que queda en rojo, y por qué

```
FAIL  tests/escena.test.ts > poster de la home > existe y pesa menos de 60 KB
AssertionError: expected false to be true // Object.is equality
 ❯ tests/escena.test.ts:56:52
     56|     expect(existsSync('public/posters/home.webp')).toBe(true);
```

Es el esperado: `public/posters/home.webp` lo produce el Paso 5 (captura manual en
`/dev/posters`), que ejecuta el controlador, no yo. No creé ningún archivo — ni vacío, ni
marcador — en `public/posters/`: habría sido un placeholder prohibido por G2 y habría tapado
el elemento LCP real del sitio con basura.

## Evidencia TDD

**RED** (antes de escribir `Escena3D.astro` y `dev/posters.astro`):

```
FAIL  tests/escena.test.ts > isla Escena3D > el poster es una imagen real...
Error: ENOENT: no such file or directory, open '...src\components\Escena3D.astro'
...
Test Files  1 failed (1)
     Tests  9 failed (9)
```

**GREEN** (tras implementar los pasos 3 y 4, y corregir el aserto de G5):

```
Test Files  1 failed (1)
     Tests  1 failed | 8 passed (9)
```

(El único rojo es el del póster, discutido arriba.)

## Archivos cambiados

- `tests/escena.test.ts` — nuevo. Suite del Paso 1, con el aserto de G5 corregido.
- `src/components/Escena3D.astro` — nuevo. Literal del brief, salvo la línea de doble
  arranque eliminada (ver «Hallazgo 2»).
- `src/pages/dev/posters.astro` — nuevo. Literal del brief, sin cambios.

No se creó `public/posters/home.webp` (pendiente del Paso 5, a cargo del controlador).

## Hallazgos de auto-revisión

- **Completitud:** los cuatro pasos asignados están completos. Los pasos 5, 5b y 6 (tal como
  el brief los formula, con el poster ya existente) no me correspondían, según las
  instrucciones del controlador.
- **Ciclo de vida:** revisado a fondo por la advertencia explícita del controlador sobre la
  Tarea 6. Encontré y corregí un doble montaje real (ver «Hallazgo 2»). La destrucción ocurre
  en `astro:before-swap`, coherente con `motion.ts`/`SmoothScroll.astro` (limpieza solo al
  salir, nunca al entrar, para no matar lo que `Reveal.astro` acaba de montar en el mismo
  tick).
- **`crearMotor()` devolviendo `null`:** tratado como rama normal (`if (!motor) return;`), sin
  logging de error ni intento de reintentar. La página se queda en el póster, que es el
  comportamiento correcto según el brief y el contexto del controlador.
- **`import.meta.glob`:** conservado tal cual en los dos archivos, sin sustituir por imports
  literales, como pedía explícitamente el controlador.
- **Rutas base:** `ruta(poster)` y `fondos.map((f) => ruta(f))` aplicados tal cual el literal;
  no hay ninguna ruta absoluta escrita a mano.
- **Disciplina:** no añadí nada fuera de los tres archivos previstos por el brief. No creé
  ningún archivo en `public/posters/`.
- **Nombres:** `montar`, `programar`, `limpiar`, `destruir` — describen exactamente su
  función; sin cambios respecto al brief.

## Problemas o preocupaciones

1. **El test del póster de la Home queda en rojo** — esperado, documentado arriba, pendiente
   del Paso 5 manual del controlador.
2. **Dos discrepancias entre el brief y la realidad del proyecto**, ambas corregidas y
   documentadas arriba: el aserto de G5 con una subcadena literal que el propio código del
   mismo brief nunca produce, y la reintroducción del doble montaje ya resuelto en la Tarea 6.
   Recomiendo que quien mantenga el documento del plan corrija el Paso 1 y el Paso 3 del
   brief maestro para que futuras lecturas del plan no repitan el mismo error.
3. Ningún otro hallazgo. Build y suite completa verificados tras cada corrección.
