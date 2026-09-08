# Bitácora de errores — Safetory Studio

> Una entrada por error distinto. Solo se AÑADE al final, nunca se sobrescribe.

---

## [2026-09-07] — Plazo de entrega inventado a partir de un dato de agenda

**Contexto:** Escritura de la capa de datos (`src/data/produccion.ts`) con los servicios de
producción extraídos de la página de reservas del cliente.

**Error:** Mixing, mastering y mixing+mastering se publicaron con
`duracion: 'Entrega en 24 horas'`. El estudio nunca ha prometido ese plazo.

**Causa raíz:** La fuente registra `23h 59min` para esos tres servicios. Eso es la longitud
del hueco que ocupan en la agenda de reservas —la forma que tiene la herramienta de
representar «bloque de día completo»—, no un compromiso de entrega. Al transcribir, se leyó
como plazo. Los 31 tests estaban en verde porque ninguno comprobaba ese campo: el mismo
documento que introdujo el dato falso escribió los tests que lo rodeaban.

**Fix aplicado:** `Tarifa.duracion` pasó a opcional y los tres servicios que no se miden en
tiempo la omiten. Dos tests nuevos: uno comprueba que ningún servicio menciona plazos
(`/entrega|plazo|24\s*horas/i`), otro que solo llevan duración `grabacion`,
`grabacion-instrumental` y `produccion-personalizada`.

**Prevención:** Un dato operativo de una herramienta de terceros (duración de un hueco,
identificador interno, estado por defecto) no es contenido publicable. Antes de convertirlo
en texto de la web, preguntar: ¿esto lo afirma el cliente, o lo afirma su software? Y al
revisar contenido, darle al revisor **la fuente original**, no solo el documento intermedio:
si solo ve el plan, verificará que el código coincide con el plan, y coincidirá.

**Archivos:** `src/data/produccion.ts`, `src/data/tipos.ts`, `tests/datos.test.ts:276-292`

---

## [2026-09-07] — Tests que leen el `.astro` como texto plano contra componentes generados

**Contexto:** Tarea 5, componente `Nav.astro`, que genera sus seis enlaces con un `.map()`
sobre un array `enlaces`.

**Error:** El test hacía `expect(src).toContain('href="/estudio"')` leyendo el archivo
`.astro` como texto. Con el `.map()`, el fuente contiene `href={e.href}`, nunca la cadena
literal. El test y la implementación de referencia del mismo documento se contradecían: si
alguien copiaba el código, el test fallaba.

**Causa raíz:** Confundir el **fuente** con lo **renderizado**. Un test de contenido de
archivo solo puede afirmar cosas sobre el texto que hay escrito, no sobre el HTML que ese
texto produce. Al escribir el test se pensó en el HTML de salida. El implementador resolvió
la contradicción sustituyendo el `.map()` por seis `<li>` a mano, lo que hacía pasar el test
a costa de repetir el mismo ternario `aria-current` seis veces.

**Fix aplicado:** Se restauró el `.map()` y el test pasó a asertar sobre la fuente de verdad
real, que es el array: `expect(src).toContain("href: '/estudio'")`. Es además una afirmación
más fuerte, porque comprueba que la ruta está en el array de navegación y no en cualquier
otro punto del archivo.

**Prevención:** Un test de texto de archivo sirve para prohibir (que **no** aparezca `vh`,
`href="#"`, una marca comercial) y para comprobar que se consume un dato (`site.direccion`).
No sirve para afirmar cómo queda el marcado. Si hace falta afirmar sobre el HTML de salida,
hay que renderizar el componente de verdad —`experimental_AstroContainer` en Astro— o dejar
esa comprobación para la suite que lee `dist/*.html` tras el build.

**Archivos:** `src/components/Nav.astro`, `tests/componentes.test.ts`

---

## [2026-09-08] — Un aserto que decía «pesa menos de 60 KB» solo comprobaba que el archivo existía

**Contexto:** Cierre de la Tarea 15 (`/estudio`) y siguientes.

**Error:** El test `el poster existe y pesa menos de 60 KB` del plan solo llamaba a
`existsSync`. Nunca miraba el tamaño.

**Causa raíz:** El nombre del test se escribió con la intención completa; el cuerpo, con la
mitad. Nadie lo notó porque el test estaba en verde, que es exactamente lo que se espera de
un test cuyo nombre suena bien.

**Fix aplicado:** `statSync(...).size` en las seis rutas.

**Prevención:** Leer el cuerpo de cada aserto contra su nombre, uno por uno, antes de darlo
por bueno. Un nombre que promete dos condiciones necesita dos asertos.

**Archivos:** `tests/pagina-estudio.test.ts` y las cuatro rutas siguientes.

---

## [2026-09-08] — Un archivo de tests que no llegaba a cargarse, con la línea «Tests» toda en verde

**Contexto:** Tarea 19, objeto `rotulo`, que carga el wordmark con `TextureLoader`.

**Error:** `crear()` reventaba en Node —`TextureLoader.load` crea un `<img>` y necesita
`document`— así que `tests/pagina-contacto.test.ts` fallaba al CARGARSE y no aportaba ni un
solo aserto. La ruta `/contacto` se dio por probada sin haber ejecutado nada suyo.

**Causa raíz:** Dos cosas a la vez. El objeto no aceptaba un cargador por parámetro, al
contrario que `crearPlanosProfundidad`, que ya tenía resuelto ese mismo problema. Y la
comprobación se hacía leyendo solo la línea `Tests  223 passed (223)` de la salida de vitest,
que cuenta los tests recogidos: un archivo que ni se carga no aporta ninguno y no resta
ninguno. El aviso estaba en la línea de arriba, `Test Files  20 passed | 1 failed (21)`.

**Fix aplicado:** El cargador entra por parámetro. Y la comprobación pasa a mirar siempre las
dos líneas.

**Prevención:** Al revisar una suite, **`Test Files` antes que `Tests`**. Y cuando un módulo
nuevo toque una API del navegador, comprobar que se puede instanciar en Node antes de
escribir sus tests, no después.

**Archivos:** `src/three/objetos/rotulo.ts`, `tests/pagina-contacto.test.ts`

---

## [2026-09-08] — La escena en reposo se componía desde un ángulo que nadie había diseñado

**Contexto:** Captura del póster de `/estudio`, el primero de un objeto que no es simétrico.

**Error:** El póster salió negro: la cámara miraba los monitores por detrás. El micrófono de
la home había ocultado el problema durante toda la fase 1 porque es cilíndrico y se ve igual
desde cualquier ángulo.

**Causa raíz:** Dos decisiones tomadas por separado que nunca se comprobaron juntas.
`medirProgreso` medía el recorrido completo del contenedor por el viewport —de «asomando por
abajo» a «fuera por arriba»—, con lo que una sección de `100dvh` en lo alto de la página
arranca en t=0,5 y no en 0. Y la espiral empezaba en ángulo 0, que es el eje +x. El resultado
combinado dejaba la cámara a 180 grados del frente, mientras que los objetos se modelan
mirando a +z y los planos de profundidad se colocan a z negativa, «detrás». Ninguna de las
dos decisiones es incorrecta por sí sola.

**Fix aplicado:** `medirProgreso` mide el recorrido propio de la sección, y la espiral recibe
una fase inicial de π/3 —frontal pero descentrada, para que un objeto de caras planas tenga
aristas en fuga—.

**Prevención:** Un sistema que compone imagen no está verificado hasta que se ha mirado su
salida con el objeto **menos** favorable, no con el más. El micrófono simétrico daba una
señal falsamente tranquilizadora.

**Archivos:** `src/three/motor.ts`, `src/three/camara-phi.ts`

---

## [2026-09-08] — WebGL existía, pero lo dibujaba la CPU: 162 segundos de hilo principal bloqueado

**Contexto:** Pasada de rendimiento de la Tarea 22.

**Error:** `capacidades.ts` comprobaba que se pudiera crear un contexto WebGL, y daba por
buena la escena. Un Chrome con la GPU en lista negra crea el contexto igualmente y dibuja con
SwiftShader, por software.

**Causa raíz:** «Hay WebGL» se confundió con «hay GPU». Medido con Lighthouse sobre la misma
página: con aceleración, 20 ms de bloqueo del hilo principal y rendimiento 100; con
SwiftShader, 162 000 ms y rendimiento 69. La página no es más lenta: es inservible.

**Fix aplicado:** Se lee `WEBGL_debug_renderer_info` y se descartan los rasterizadores por
software. Esas máquinas se quedan en el póster, que es la degradación ya diseñada en §7.3.

**Prevención:** Una comprobación de capacidad tiene que preguntar por la capacidad que de
verdad se necesita —aquí, dibujar 60 veces por segundo sin bloquear—, no por la API que la
expone.

**Archivos:** `src/three/capacidades.ts`

---

## [2026-09-08] — El elemento LCP no era el que todo el mundo daba por supuesto

**Contexto:** Ajuste del LCP en la pasada de rendimiento.

**Error:** El spec, el plan y el código dan por hecho que el póster WebP es el elemento LCP
de cada ruta, y sobre esa premisa se decidió precargarlo y marcarlo `fetchpriority="high"`.
Medido con la API de LCP en el navegador, el elemento LCP es el `<h1>`.

**Causa raíz:** Chrome descarta como candidatos a LCP las imágenes de entropía muy baja, y
estos pósters pesan 8 KB para 1280×800. La consecuencia práctica es la contraria de lo que
se estaba haciendo: lo que hay que precargar es la fuente de titulares, porque con
`font-display: swap` el titular cambia de tamaño al llegar la fuente real y eso genera un
candidato a LCP **nuevo y más tardío**, además de un salto de layout.

**Fix aplicado:** Se precarga Clash Display y solo esa. Quitarla empeoraba el CLS de
`/estudio` de 0,000 a 0,014.

**Prevención:** No optimizar el LCP sin haber preguntado al navegador cuál es el elemento
LCP. Cuesta diez líneas de `PerformanceObserver` y evita optimizar el elemento equivocado.

**Archivos:** `src/layouts/BaseLayout.astro`

---

## [2026-09-08] — Tres asertos tumbados por el comentario que los explicaba

**Contexto:** Tareas 19, 20 y 22.

**Error:** Tres veces seguidas, un aserto del tipo «que no aparezca X en este archivo» falló
por el comentario que explica **por qué** X no debe aparecer: `mapa-via-espana` en
`contacto.astro`, `readyState` en `Nav.astro`, y un `<h1>` literal dentro de un comentario de
`BaseLayout.astro` que además se contaba como encabezado de verdad.

**Causa raíz:** El aserto se escribe sobre el archivo entero, pero solo pretende hablar del
código. La salida fácil es borrar el comentario, y con él la explicación que costó descubrir.

**Fix aplicado:** `tests/util.ts` con `soloCodigo()`, que quita comentarios antes de
comprobar. En el caso del `<h1>`, además, el comentario pasó a comentario de plantilla: los
`<!-- -->` de Astro viajan al navegador, así que aquel texto se estaba enviando a cada
visitante en las seis rutas.

**Prevención:** Un aserto que prohíbe una cadena tiene que mirar el código, no el archivo. Si
falla por un comentario, el defecto está en el aserto.

**Archivos:** `tests/util.ts`, `tests/navegacion.test.ts`, `tests/pagina-contacto.test.ts`,
`src/layouts/BaseLayout.astro`

---
