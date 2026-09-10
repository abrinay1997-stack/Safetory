# Trabajo pendiente — Safetory Studio

> Actualizado el **2026-09-09**, con las 23 tareas cerradas y las dos rondas de revisión del
> cliente aplicadas. Estado completo en `CLAUDE.md`,
> sección «Estado actual». Errores y sus causas en `docs/errors-learned.md`.
>
> Cada bloque está redactado para poder abrirse como issue de GitHub tal cual.

---

## Bloqueado por el cliente

Estos huecos **no se rellenan por cuenta propia**: la regla 1 prohíbe inventar contenido, y
publicar un dato equivocado en la web de un estudio de grabación destruye la credibilidad
ante un profesional. El sitio está construido y publicable **con** estos huecos; cada uno
mejora una parte concreta cuando llegue.

### 1. Precio y condiciones de la membresía
**Afecta a:** `/membresia`.
**Estado hoy:** publicada y funcional, sin cifra. Lista lo incluido desde
`src/data/membresia.ts` y el CTA lleva a consultar por WhatsApp. Un test prohíbe que aparezca
cualquier símbolo de dólar seguido de dígito o cualquier forma de «al mes».
**Qué hace falta:** precio, periodicidad, qué incluye y qué no, y condiciones de baja.
**Cómo entra:** un `precioMembresia: Tarifa` en `src/data/membresia.ts` y un `<PrecioCard>`
entre «Qué incluye» y «Siguiente paso». No hay que tocar ninguna plantilla más.

### 2. Marcas y modelos del equipo técnico, por escrito
**Afecta a:** el bloque de equipo de la home y `/estudio`.
**Estado hoy:** se publica la lista genérica de `src/data/equipo.ts` («micrófono de
condensador», «monitores de campo cercano»…), sin marcas. Dos tests prohíben que se cuele
una marca conocida.
**Por qué por escrito:** identificar mal un equipo ante un ingeniero de sonido cuesta la
credibilidad del estudio entero.

### 3. Texto de marca / historia del estudio
**Afecta a:** el bloque «manifiesto» de la home.
**Estado hoy:** usa únicamente el eslogan real, *«Donde la innovación se encuentra con la
perfección»*, a tamaño de portada. Funciona, pero es un bloque de una sola frase.
**Qué hace falta:** dos o tres párrafos sobre qué es Safetory y por qué existe.

### 4. Qué incluye el co-working
**Estado hoy:** **no se menciona en el sitio**, porque no se sabe qué incluye. Solo aparece
como parte del bloque de miembro del ciclorama, que es lo que sí consta en la fuente.

**2026-09-10 — hay una pista, no una confirmación.** En las capturas de Setmore que aportó
el cliente, los dos bloques de miembro del ciclorama se describen como «Alquiler de ciclorama
**y Co/Working** por 3 / 5 horas». Es la primera vez que el co-working aparece asociado a
algo concreto. Sigue sin decir qué incluye ni si se puede contratar por separado, así que no
entra al sitio hasta que el cliente lo escriba.

### 5. ~~El mapa de `/contacto`~~ — CERRADO el 2026-09-09
El cliente aportó el incrustado de su propia ficha de Google. De ahí salen las coordenadas
(`site.geo`), el mapa de `/contacto`, el enlace al punto exacto y un `GeoCoordinates` en el
LocalBusiness, que es SEO local real y no una estimación.

### 6. Revisión legal de `/privacidad` y `/aviso-legal`
**Afecta a:** las dos páginas legales, publicadas el 2026-09-09.
**Estado hoy:** describen **solo lo que el sitio hace de verdad** y es comprobable en el
build: páginas estáticas, sin formularios, sin analítica, sin cookies propias; el mapa de
Google en `/contacto` como único tercero incrustado; WhatsApp y correo como vías de
contacto. La identidad del aviso legal sale de `src/data/site.ts`. Un test comprueba que
cada afirmación siga siendo cierta: si algún día se añade un formulario, analítica o un
segundo incrustado, se pone rojo antes de que el sitio publique algo falso.
**Lo que NO dicen, a propósito:** responsable del tratamiento, base legal, plazos de
conservación, encargados, ni datos registrales del negocio. Nadie ha verificado esos datos
y afirmarlos en falso expone al cliente (regla 1).
**Qué hace falta:** que un abogado en Panamá revise el texto y aporte los datos
registrales, si el cliente quiere una política completa. Entran en `src/data/site.ts` y en
las dos páginas, sin tocar plantillas.

### 7. Proyectos publicables (opcional)
**Desbloquearía:** una ruta `/trabajos`, que hoy no existe en el plan.

### 8. Dos datos que no cuadran con la ficha de Setmore (2026-09-10)
El cliente pidió confirmar los precios contra sus capturas de Setmore. Los once coinciden;
**dos cosas no**, y ninguna se toca hasta que él lo diga por escrito:

| Qué | En el sitio (`src/data/`) | En Setmore | Qué hace falta |
|---|---|---|---|
| Ciclorama · vídeo, $280 | «8 horas» | duración **4h**, descripción «por 8 horas» | Cuál de las dos manda |
| Horario | «Lunes a viernes · 24 horas» | «Cierra a las 12 AM» | El horario real de atención |

En los dos casos el sitio publica hoy lo que el cliente dijo de viva voz; la ficha de Setmore
se contradice a sí misma en el primero. Cambiar un precio o un horario por cuenta propia es
justo lo que prohíbe la regla 1.

### 9. ~~Las fotografías de «En la Zona»~~ — CERRADO el 2026-09-10
El cliente las subió él mismo a `main`, en `Imagenes/`: dieciséis piezas de su propia serie,
a 1080×1350. De ahí salen las de `public/zona/`, a 420×525 (`scripts/zona-webp.mjs`).

Los originales siguen en `Imagenes/` en la raíz del repositorio. **No se sirven** —Astro solo
publica `public/`—, así que no pesan en el sitio; pesan 2,4 MB en el repositorio. Se dejan
donde el cliente los puso.

### 10. Acreditar en texto a quienes salen en «En la Zona»
**Estado hoy:** cada tarjeta lleva dentro de la imagen el nombre y el oficio —KAROL WILSON ·
artista, VICTORMARS · dj, YUNGSES · productor, y trece más—, pero el pasillo va `aria-hidden`
y nadie puede leer un nombre que pasa volando. Quien navegue con lector de pantalla no se
entera de que hay dieciséis personas ahí, y quien no llegue a mirar la sección entera tampoco.

Los dieciséis nombres están escritos en `src/data/zona.ts`, leídos de las propias tarjetas.
**Qué hace falta:** que el cliente decida si quiere una línea de créditos bajo el titular. No
se pone por cuenta propia: son personas reales y es él quien tiene la relación con ellas.

---

## Trabajo de código, en orden

### 7. Volver a medir el LCP sobre el despliegue real
**Es lo único del presupuesto de rendimiento que queda sin cerrar.**

Medido con Lighthouse móvil, mediana de tres pasadas, la mediana del LCP va de **1,56 s a
1,86 s** contra un presupuesto de 1,8 s (medición del 2026-09-09, tras la segunda ronda).

**No se puede cerrar aquí.** La medición corre en un contenedor sin GPU y con CPU compartida,
y el ruido entre pasadas (±0,5 s) es mayor que la diferencia entre las configuraciones que se
probaron. Sobre Netlify, con CDN y hardware real, el número será otro.

Lo que sí quedó establecido, y no hay que volver a descubrir:

- **El elemento LCP es el `<h1>`, no el póster.** Chrome descarta el póster por su bajísima
  entropía. Cualquier ajuste tiene que atacar el titular.
- Por eso se precarga **Clash Display y solo esa**: con `font-display: swap` el titular cambia
  de tamaño al llegar la fuente real, lo que crea un candidato a LCP nuevo y más tardío.
  Quitarla empeoraba el CLS de `/estudio` de 0,000 a 0,014.
- El resto de presupuestos están cumplidos: JS inicial 60,7 KB gz sobre 140 y Accesibilidad,
  Prácticas y SEO a 100 en las ocho rutas. El CLS máximo es **0,019 sobre 0,02**, y va todo
  al mismo sitio: `.hero__texto` de la home, el titular que se trocea. Es el único
  desplazamiento que Lighthouse encuentra en todo el sitio, y es el que menos margen deja:
  si alguna vez se toca la revelación del titular, hay que volver a medirlo.

**Siguiente paso:** ejecutar Lighthouse sobre la URL de Netlify una vez publicado. Si alguna
ruta pasa de 1,8 s de forma consistente, mirar el titular, no el póster.

### 8. Medir el 3D con GPU real
`scripts/verificacion-3d.mjs` comprueba que el motor **funciona**, pero no cuánto cuesta:
este contenedor no tiene GPU y la escena, correctamente, ni siquiera monta. El coste del
camino 3D (INP, bloqueo del hilo principal) **no está medido en ninguna máquina con GPU**.

Con SwiftShader se midió 162 s de bloqueo, que es la razón por la que ahora se descarta ese
caso; con GPU real debería ser despreciable, pero eso hay que verlo.

### 9. Menores aplazados
Ninguno bloquea nada:

- **`motor.ts`:** el arranque síncrono del bucle es código muerto. Cuando se ejecuta,
  `visible` todavía es `false` porque el callback del `IntersectionObserver` es asíncrono, así
  que quien arranca el bucle siempre es la rama de re-arranque. Comprobado por mutación.
- **`motor.ts`:** sin `try/catch` alrededor de `new THREE.WebGLRenderer()`.
- **`BaseLayout.astro`:** el JSON-LD reconstruye a mano `streetAddress` / `addressLocality` /
  `addressRegion` en vez de derivarlos de `site.direccion`.
- **`tests/motion.test.ts`:** dos asertos siguen prohibiendo `readyState` sobre el archivo
  entero en vez de sobre el código. Hoy pasan porque esos comentarios no usan la palabra, pero
  son la misma trampa que ya costó tres fallos. Usar `soloCodigo()` de `tests/util.ts`.
- **`blancoDifuso()`** usa `0xe9e6df`, cercano pero no idéntico a `--bone`. Es color de
  material 3D, no token de interfaz.
- **`/ciclorama`:** el encuentro entre el suelo y la curva deja un pequeño escalón visible en
  el póster. Geometría, no diseño.

---

## Infraestructura

### 11. Netlify: aplazado por decisión del cliente (2026-09-09)
**No existe proyecto de Netlify para Safetory.** Consultada la cuenta, hay 22 sitios y
ninguno es este. `netlify.toml` está escrito y correcto —comando de build, carpeta `dist`,
cabeceras y el 404 de `/dev/*`—, pero no hay nada al otro lado.

**Decidido:** de momento basta con el preview de GitHub Pages. El sitio **no está en la raíz
de un dominio propio**, y hasta que lo esté sigue marcado `noindex`, así que no aparece en
Google.

**Cuando se retome**, no hay nada que preparar en el repositorio. En Netlify:
*Add new site → Import an existing project → GitHub → `abrinay1997-stack/Safetory`*. El
`netlify.toml` rellena solo el comando y la carpeta. Hay que quitar `PUBLIC_PREVIEW` de las
variables (no debe existir en producción) y dejar que `URL` la ponga Netlify.

Un agente no puede hacerlo entero: la API permite crear el sitio, pero **no enlazar el
repositorio**, que es la parte que hace que un push publique. Esa autorización se da en el
panel.


### 10. ~~Decidir si `playwright-core` entra como dependencia de desarrollo~~ — CERRADO
**Decidido el 2026-09-08: sí.** `playwright-core` entra como `devDependency` y el workflow
ejecuta los dos scripts de verificación en cada push, con el Chrome que ya trae el runner —de
ahí `playwright-core` y no `playwright`, que arrastraría una descarga de navegador.

El motor 3D deja de depender de que alguien se acuerde de comprobarlo a mano.

De propina, regenerar el lockfile arregló la trampa histórica de `npm ci`: le faltaban
`@emnapi/core` y `@emnapi/wasi-threads`, dos transitivas de `sharp`, y por eso la instalación
limpia fallaba con npm 10 y funcionaba con npm 11. Ahora funciona con las dos.
