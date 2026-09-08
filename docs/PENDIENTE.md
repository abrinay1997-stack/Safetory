# Trabajo pendiente — Safetory Studio

> Actualizado el **2026-09-08**, con las 23 tareas cerradas. Estado completo en `CLAUDE.md`,
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

### 5. El mapa de `/contacto`
**Estado hoy:** el bloque «Cómo llegar» publica la dirección real y un enlace a Google Maps.
**No se publica una imagen de mapa**, y un test lo impide: una captura de Google Maps no es
nuestra para republicar, y dibujar uno obliga a fijar unas coordenadas que nadie ha
verificado. Vía España es una avenida larga y marcar el edificio en el punto equivocado manda
a un cliente a la otra punta.
**Qué hace falta:** una captura propia del mapa, o las coordenadas confirmadas del Edificio
Brasilia. Entra como `public/mapa-via-espana.webp` con su `<img>` dentro del enlace.

### 6. Proyectos publicables (opcional)
**Desbloquearía:** una ruta `/trabajos`, que hoy no existe en el plan.

---

## Trabajo de código, en orden

### 7. Volver a medir el LCP sobre el despliegue real
**Es lo único del presupuesto de rendimiento que queda sin cerrar.**

Medido con Lighthouse móvil, mediana de tres pasadas, la mediana del LCP va de **1,35 s a
1,97 s** contra un presupuesto de 1,8 s: cuatro rutas por debajo y dos por encima.

**No se puede cerrar aquí.** La medición corre en un contenedor sin GPU y con CPU compartida,
y el ruido entre pasadas (±0,5 s) es mayor que la diferencia entre las configuraciones que se
probaron. Sobre Netlify, con CDN y hardware real, el número será otro.

Lo que sí quedó establecido, y no hay que volver a descubrir:

- **El elemento LCP es el `<h1>`, no el póster.** Chrome descarta el póster por su bajísima
  entropía. Cualquier ajuste tiene que atacar el titular.
- Por eso se precarga **Clash Display y solo esa**: con `font-display: swap` el titular cambia
  de tamaño al llegar la fuente real, lo que crea un candidato a LCP nuevo y más tardío.
  Quitarla empeoraba el CLS de `/estudio` de 0,000 a 0,014.
- El resto de presupuestos están cumplidos con margen: JS inicial 60,7 KB gz sobre 140, CLS
  máximo 0,017 sobre 0,02, Accesibilidad 100 en las seis rutas.

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

### 10. Decidir si `playwright-core` entra como dependencia de desarrollo
Las dos verificaciones en navegador —las únicas que comprueban el motor 3D y la degradación—
viven en `scripts/` y **no se ejecutan en CI**, porque `playwright-core` no es dependencia del
proyecto y añadirla no se ha consultado (regla «nunca añadir dependencias sin preguntar»).

Hoy hay que acordarse de ejecutarlas a mano. Si entraran como `devDependency`, el CI podría
correrlas en cada push y el motor 3D dejaría de depender de que alguien se acuerde.

**Decisión del cliente.** Coste: una dependencia de desarrollo y un Chromium en CI.
