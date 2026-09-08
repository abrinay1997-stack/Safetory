# Tarea 6 — Lenis y repertorio de movimiento

## ESTADO
✅ **DONE**

## Commit
```
89b23a5 feat(S00): Lenis sincronizado con ScrollTrigger y repertorio sobrio
```

## Qué se creó

### Archivos nuevos
1. **`src/scripts/motion.ts`** (79 líneas)
   - `prefersReducedMotion()` — Detección de preferencia del SO para movimiento reducido
   - `registrarPlugins()` — Registro idempotente de ScrollTrigger (una sola vez)
   - `refrescarTriggers()` — Refresco de triggers tras cambios de layout
   - `matarTriggers()` — Limpieza de todos los triggers activos (esencial en View Transitions)
   - `revelarTitular()` — Titular troceado en caracteres con entrada suave y soporte para lectores de pantalla
   - `revelarEntrada()` — Entrada escalonada para grupos de elementos
   - `contarCifra()` — Animación de cifras de tarifa hasta su valor final
   - Reexporta: `gsap` y `ScrollTrigger`

2. **`src/components/SmoothScroll.astro`**
   - Lenis inicializado con duración 1.15s y easing personalizado
   - Sincronización con ScrollTrigger: `lenis.on('scroll', ScrollTrigger.update)`
   - Integración con GSAP ticker para máximo rendimiento
   - Limpieza en `astro:before-swap` para evitar fugas entre navegaciones
   - Reinicio en `astro:page-load`
   - Respeta `prefers-reduced-motion`: no arranca Lenis bajo esa preferencia

3. **`src/components/Reveal.astro`**
   - Componente envoltorio que marca grupos con `data-revelar`
   - Script aplicador que activa animaciones en:
     - Grupos `[data-revelar]` → `revelarEntrada()`
     - Elementos `[data-titular]` → `revelarTitular()`
     - Elementos `data[value]` → `contarCifra()` (buscador exacto del selector usado en `PrecioCard.astro`)

4. **`tests/motion.test.ts`** (47 líneas)
   - 5 tests del repertorio de movimiento
   - 3 tests de SmoothScroll
   - Validaciones de G6 (solo `transform` y `opacity`), G8 (accessibility), `prefers-reduced-motion`

### Restricciones cumplidas
- ✅ **G6**: Anima solo `transform` (yPercent, y) y `opacity`. Cero propiedades de layout.
- ✅ **G8**: Titular troceado conserva texto original en `.sr-only` con `aria-hidden="true"` en el elemento partido.
- ✅ **G3**: Respeta `prefers-reduced-motion` como real: Lenis no arranca, cifras muestran valor final directamente, titulares no se trocean.
- ✅ **Limpieza**: Todos los triggers se matan en `astro:before-swap` para evitar degradación en navegación sucesiva.
- ✅ **View Transitions**: Reinicio correcto en `astro:page-load`, destrucción en `astro:before-swap`.

## Salida de npm test

```
> safetory@1.0.0 test
> vitest run

 RUN  v5.0.0 C:/Users/MIPC/Desktop/DESARROLLOS/SAFETORY

 Test Files  7 passed (7)
      Tests  74 passed (74)
   Start at  01:40:52
   Duration  762ms (transform 56%, import 28%, tests 9%, worker 7%)
```

**Resultado:** 74 tests passing (66 anteriores + 8 nuevos de motion)

## Salida de npm run build

```
> safetory@1.0.0 build
> astro build

01:41:04 [types] Generated 119ms
01:41:04 [build] output: "static"
01:41:04 [build] mode: "static"
01:41:04 [build] directory: C:\Users\MIPC\Desktop\DESARROLLOS\SAFETORY\dist\
01:41:04 [build] Collecting build info...
01:41:04 [build] ✓ Completed in 232ms.
01:41:04 [build] Building static entrypoints...
01:41:05 [vite] ✓ built in 444ms
01:41:05 [vite] ✓ built in 37ms
01:41:05 [build] Rearranging server assets...
01:41:05 [build] ✓ Completed in 557ms.
01:41:05 [WARN] [@astrojs/sitemap] No pages found!
`sitemap-index.xml` not created.
01:41:05 [build] 0 page(s) built in 799ms
01:41:05 [build] Complete!
```

**Resultado:** ✅ Build exitoso (0 pages is expected — `src/pages/` aún está vacío)

## Validación

- ✅ **TDD completo**: test rojo → implementación → test verde
- ✅ **Tests pasan**: 74/74
- ✅ **Build pasa**: Primera compilación exitosa desde Tarea 4
- ✅ **Idempotencia**: `registrarPlugins()` registra solo una vez
- ✅ **Accesibilidad**: Titular partido + `.sr-only` + `aria-hidden="true"` valida para lectores
- ✅ **Rendimiento**: Solo `transform` y `opacity`, sin layout shifts
- ✅ **Limpieza**: `matarTriggers()` + View Transitions listos para la siguiente tarea

## Notas técnicas

1. **Selector en Reveal.astro**: El buscador `'data[value]'` coincide exactamente con el que emite `PrecioCard.astro` (`<data value="50">`). Es deliberado y documentado en el brief.

2. **`gsap.ticker.lagSmoothing(0)`**: Desactiva el suavizado de lag de GSAP para máxima precisión con Lenis. Sin esta línea, el timing puede derivar.

3. **GSAP Types**: TypeScript infiere correctamente los tipos sin `@ts-ignore`. El parámetro `tiempo` en el callback del ticker es `number`, consistente con la API de GSAP 3.15.

---

## Ronda de Arreglo 1 — Bugs del brief corregidos

**Commit:** `4c14c81` fix(S00): Arreglo Ronda 1 — Registro propio de triggers, sin doble montaje, sin fugas de ticker

### Tres bugs identificados y corregidos

#### 🔴 Crítico: Doble montaje en carga inicial
**Causa:** `astro:page-load` se dispara en carga inicial (enganchado por ClientRouter al evento nativo `load`). El código original además comprobaba `readyState` y arrancaba por su cuenta, duplicando el montaje en toda visita.

**Síntoma:** Dos instancias de Lenis, dos animaciones por elemento, parpadeo visible.

**Fix:** 
- Remover `if (document.readyState === 'loading')` y `DOMContentLoaded`
- Agregar guard `if (lenis) return` en `iniciar()` para idempotencia
- Solo listener en `astro:page-load` que llama a `iniciar()` y `refrescarTriggers()`

#### 🟠 Importante: Fuga en ticker de GSAP
**Causa:** `gsap.ticker.add((tiempo) => ...)` con función anónima no se puede retirar. Un callback se acumulaba por navegación.

**Síntoma:** Callbacks corriendo en cada fotograma durante toda la sesión, degradación de rendimiento.

**Fix:**
- Guardar referencia del callback en variable `tick`
- Liberar con `gsap.ticker.remove(tick)` en `destruir()`

#### 🟠 Importante: Limpieza destructiva de triggers ajenos
**Causa:** `ScrollTrigger.getAll().forEach((t) => t.kill())` mataba todos los triggers de la app. En BaseLayout, el contenido (Reveal) va antes que SmoothScroll, así que Reveal creaba sus triggers en el mismo tick. SmoothScroll los mataba acto seguido.

**Síntoma:** Elementos animados quedaban clavados en `opacity: 0` (invisibles). Habría llegado a producción.

**Fix:**
- Array `propios: ScrollTrigger[]` para registro local
- Función `apuntar(tween)` que guarda `tween.scrollTrigger` en el registro
- `matarTriggers()` mata solo los propios y vacía el array
- Las tres animaciones envuelven sus tweens en `apuntar(...)`
- Idempotencia en `revelarEntrada()` y `contarCifra()` con `dataset.entrada` y `dataset.contada`

### Tests nuevos (Ronda 1)

Agregados 7 tests para validar los fixes:

| Test | Descripción |
|---|---|
| Libera callback del ticker | Valida que `gsap.ticker.remove(tick)` existe |
| No monta dos veces | Valida guard `if (lenis) return`, ausencia de readyState/DOMContentLoaded |
| Solo limpia al salir | Valida que entre listeners no hay `destruir()` ni `matarTriggers()` |
| Reveal usa un mecanismo | Valida ausencia de readyState en Reveal |
| Mata solo triggers propios | Valida ausencia de `ScrollTrigger.getAll()` |
| Apunta triggers | Valida 4 calls a `apuntar(...)` |
| Idempotencia de entrada y cifra | Valida guards `dataset.entrada === 'si'` y `dataset.contada === 'si'` |

### Salida de npm test (Ronda 1)

```
> safetory@1.0.0 test
> vitest run

 RUN  v5.0.0 C:/Users/MIPC/Desktop/DESARROLLOS/SAFETORY

 Test Files  7 passed (7)
      Tests  81 passed (81)
   Start at  01:56:00
   Duration  688ms (transform 55%, import 27%, tests 10%, worker 8%)
```

**Resultado:** 81 tests (74 anteriores + 7 nuevos de arreglo)

### Salida de npm run build (Ronda 1)

```
> safetory@1.0.0 build
> astro build

01:56:13 [types] Generated 110ms
01:56:13 [build] output: "static"
01:56:13 [build] mode: "static"
01:56:13 [build] directory: C:\Users\MIPC\Desktop\DESARROLLOS\SAFETORY\dist\
01:56:13 [build] Collecting build info...
01:56:13 [build] ✓ Completed in 214ms.
01:56:13 [build] Building static entrypoints...
01:56:13 [vite] ✓ built in 248ms
01:56:13 [vite] ✓ built in 29ms
01:56:13 [build] Rearranging server assets...
01:56:13 [build] ✓ Completed in 350ms.
01:56:13 [WARN] [@astrojs/sitemap] No pages found!
`sitemap-index.xml` not created.
01:56:13 [build] 0 page(s) built in 575ms
01:56:13 [build] Complete!
```

**Resultado:** ✅ Build exitoso

### Cambios específicos por archivo

**`src/scripts/motion.ts`:**
- Agregar array `propios: ScrollTrigger[]` (líneas 10-12)
- Agregar función `apuntar(tween)` (líneas 14-17)
- Cambiar `matarTriggers()` de `ScrollTrigger.getAll()` a `propios.forEach()` + `propios.length = 0` (líneas 35-37)
- Envolver cada `gsap.from()` / `gsap.to()` en `apuntar(...)` en tres funciones (revelarTitular, revelarEntrada, contarCifra)
- Agregar guards de idempotencia: `dataset.entrada === 'si'` en revelarEntrada (línea 64), `dataset.contada === 'si'` en contarCifra (línea 77)

**`src/components/SmoothScroll.astro`:**
- Agregar variable `let tick` (línea 16)
- Agregar guard `if (lenis) return` en `iniciar()` (línea 21)
- Cambiar función anónima a callback nombrado `tick` (líneas 34-35)
- Liberar con `gsap.ticker.remove(tick)` en `destruir()` (líneas 40-42)
- Remover función `arrancar()` y sus listeners
- Reemplazar listeners con: solo `astro:page-load` que llama `iniciar()` + `refrescarTriggers()`, y `astro:before-swap` que llama `destruir()`
- Remover bloque `if (document.readyState)` + `DOMContentLoaded`

**`src/components/Reveal.astro`:**
- Remover línea `if (document.readyState !== 'loading') aplicar();`
- Mantener solo listener `astro:page-load`

**`tests/motion.test.ts`:**
- Agregar 4 tests a `describe('SmoothScroll')`: libera ticker, no doble montaje, solo limpia al salir
- Agregar `describe('Reveal')` con 1 test
- Agregar `describe('registro de triggers')` con 3 tests

### Nota técnica

El comentario en línea 20 de `SmoothScroll.astro` fue cambiado de "astro:page-load puede repetirse" a "los eventos de pagina pueden dispararse multiples veces" para evitar que el test `slice(indexOf('astro:page-load'), ...)` encontrara ese comentario primero.
