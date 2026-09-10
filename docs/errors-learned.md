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

## [2026-09-09] — El póster y el canvas encuadraban al revés, y el CLS lo daba por bueno

**Contexto:** Revisión del cliente sobre el sitio ya publicado. Lo describió como «el diseño
en el primer microsegundo está un poco amplio y luego se encoge», en todas las páginas.

**Error:** El objeto encogía un 10 % al cruzar del póster al canvas. Medido: −10,5 % en
1440×800 y −9,4 % en 1920×1080.

**Causa raíz:** Dos encuadres opuestos sobre la misma caja. El `<img>` usa `object-fit:
cover`, que en una pantalla más ancha que el póster recorta arriba y abajo y con ello
AGRANDA el objeto. Una cámara en perspectiva con el campo vertical fijo hace lo contrario:
al ensanchar enseña más a los lados y el objeto se queda igual.

Coincidían por casualidad justo en 16:10 —la relación del propio póster— y en móvil, que son
las dos medidas con las que se había comprobado todo. Y el presupuesto de CLS lo daba por
bueno con razón: **el salto no mueve ninguna caja del layout**, solo cambia de tamaño el
contenido de dentro de una caja que no se mueve. CLS no mide eso.

**Fix aplicado:** `fovParaCubrir` cierra el campo vertical en la misma proporción en que
`cover` recortaría. Punto 8 de la verificación en navegador, medido a 1920×1080 a propósito.

**Prevención:** Cuando dos elementos tienen que verse como uno solo —un póster que da paso a
un canvas, una imagen que sustituye a otra— hay que medirlos en una relación de pantalla
donde NO coincidan por construcción. Y no dar por hecho que un presupuesto de layout cubre
un salto visual: CLS mide cajas, no contenido.

**Archivos:** `src/three/camara-phi.ts`, `src/three/motor.ts`, `scripts/verificacion-3d.mjs`

---

## [2026-09-09] — El logotipo desaparecía en el sitio publicado, y solo ahí

**Contexto:** El cliente vio que en `/contacto` el logotipo del rótulo «se pierde en un
segundo tan pronto se carga la página».

**Error:** `rotulo.ts` cargaba `/escena/wordmark.webp` sin pasar por `ruta()`. En GitHub
Pages, que sirve desde `/Safetory`, eso es un 404: el panel se dibujaba liso.

**Causa raíz:** Es la CUARTA vez que este mismo defecto aparece en el proyecto —ya estaba
corregido en el póster, en las texturas de los planos, en los enlaces de los territorios y en
el mapa—, y aun así se coló, porque la ruta vivía dentro de un módulo de Three.js y no en una
plantilla. Nadie buscó el patrón ahí. Y `TextureLoader` no avisa cuando el archivo no está,
así que en desarrollo —servido desde la raíz— todo funcionaba.

**Fix aplicado:** `ruta(RUTA_WORDMARK)` y un aserto que prohíbe la forma sin base.

**Prevención:** El repaso de «¿pasa por `ruta()`?» no puede limitarse a los `.astro`.
Cualquier cadena que empiece por `/` y viaje al navegador es candidata, esté donde esté. Y
comprobar el build de preview, servido desde su base, antes de dar por bueno un cambio de
recursos: en la raíz los dos casos se ven idénticos.

**Archivos:** `src/three/objetos/rotulo.ts`

---

## [2026-09-09] — Otra vez un aserto en verde gracias a su propio comentario

**Contexto:** Al convertir los cuatro territorios de pantallas completas en filas de tabla.

**Error:** El aserto «cada territorio ocupa el viewport completo» siguió pasando después de
quitar el `100dvh` del componente. Pasaba por el comentario que explicaba que ANTES lo
ocupaba.

**Causa raíz:** La quinta vez que este proyecto tropieza con lo mismo, y la primera en que el
comentario lo escribió quien rompía el aserto, en el mismo cambio. `soloCodigo()` ya existía
en `tests/util.ts` desde el tropiezo anterior; simplemente no se usó.

**Fix aplicado:** El aserto se reescribe con `soloCodigo()` y pasa a comprobar lo que ahora es
verdad: que quien garantiza el `100dvh` es el `Bloque` que los envuelve.

**Prevención:** Que un aserto de tipo «no debe aparecer X» use `soloCodigo()` **por defecto**,
no cuando ya ha fallado. Cuesta un `import`.

**Archivos:** `tests/territorios.test.ts`

---

## [2026-09-09] — La verificación de la barra probaba la restauración del navegador, no el código

**Contexto:** Al añadir la sexta comprobación de `verificacion-degradacion.mjs`, la de la barra
que se encoge al bajar.

**Error:** El punto que iba a demostrar que el estado se evalúa también al montar el
componente — no solo dentro del manejador de `scroll` — se escribió recargando la página con
la posición desplazada. Salió rojo, pero por otra razón: tras `reload()` el scroll no era 900
sino 8. `ClientRouter` pone `history.scrollRestoration = 'manual'` y restaura por su cuenta,
así que lo que el aserto medía era el momento de esa restauración, no el código propio.

**Causa raíz:** El aserto se escribió describiendo un mecanismo («al recargar, el navegador
restaura y por eso hace falta la llamada») en vez del resultado observable («la página se abre
desplazada y la barra sale encogida»).

**Fix aplicado:** El punto abre `/#visitanos`, comprueba el resultado y dice en su comentario
que no distingue por qué vía se consigue. La mutación lo confirmó: quitar la llamada de
`montar()` **no** lo pone rojo, porque el salto al ancla dispara `scroll` y lo resuelve la
escucha. La llamada se queda —cubre el hueco en que la restauración ocurre antes de que corra
el módulo diferido— y el comentario dice exactamente eso, sin atribuirse una cobertura que no
tiene.

**Prevención:** Cuando una mutación no pone rojo el aserto que debería, hay dos salidas
honestas: reescribir el aserto o documentar que esa línea no está cubierta. Dejar el
comentario diciendo que sí lo está es la tercera, y es la que miente.

**Archivos:** `scripts/verificacion-degradacion.mjs`, `src/components/Nav.astro`

---

## [2026-09-09] — Una cámara que llevaba desde el primer día disparando de espaldas

**Contexto:** Al recolocar la cámara de fotos del ciclorama por segunda vez, a petición del
cliente.

**Error:** La cámara apuntaba justo al revés que el ciclorama. El giro era
`Math.atan2(-x, -z) + Math.PI`, y ese `+ Math.PI` sobra: un objeto de three mira a +z, así
que el ángulo que lo encara al centro es exactamente `atan2(dx, dz)`. Llevaba así desde que
se creó el objeto, dos rondas de revisión y un despliegue.

**Causa raíz:** El único aserto que hablaba de la cámara comprobaba que existieran sus
piezas —cuerpo, objetivo, tres patas—, no hacia dónde miraban. Un objeto puede tener todas
sus piezas y estar puesto al revés. Y a simple vista, en una escena oscura y a 0,6 de escala,
un objetivo que asoma por el lado contrario no salta a la vista.

**Fix aplicado:** Fuera el `+ Math.PI`, y un aserto que mide la orientación **por sus
consecuencias**: si la cámara mira al fondo, el objetivo cae más cerca del eje del plato que
el cuerpo, y el parasol más todavía. Se pone rojo si alguien vuelve a girarla.

**Prevención:** Cuando se coloca un objeto en una escena, la posición y la **orientación** son
dos datos, no uno. Si el test solo dice «existe», falta la mitad. Y la forma de asertar una
orientación sin repetir la fórmula que se quiere comprobar es medir una consecuencia
geométrica: qué pieza queda más cerca de qué.

**Archivos:** `src/three/objetos/ciclorama.ts`, `tests/pagina-ciclorama.test.ts`

---

## [2026-09-09] — Un comentario corregido que se perdió en la siguiente restauración

**Contexto:** Durante las mutaciones de la barra que se encoge.

**Error:** El comentario de `montar()` que se había reescrito para no atribuirse una cobertura
que la mutación había desmentido volvió a su versión antigua, y así se publicó. La copia de
seguridad desde la que se restauraba el archivo entre mutación y mutación era anterior a la
corrección.

**Causa raíz:** La entrada anterior de esta bitácora daba por aplicado un arreglo que el
`cp` de la mutación siguiente deshizo. Nadie lo comprueba: un comentario no tiene test.

**Prevención:** La copia de seguridad para mutar se toma **del commit**, no de una copia a
mano hecha antes de las ediciones. `git stash` o commitear primero —que es la trampa 3 de
`CLAUDE.md`, otra vez la misma.

**Archivos:** `src/components/Nav.astro`

---

## [2026-09-09] — Catorce secciones con el título impreso dos veces, y ningún test rojo

**Contexto:** Auditoría de móvil pedida por el cliente, que lo describió como «se repite el
título dos veces».

**Error:** El kicker de `Bloque` estaba colgado de la esquina de la sección con
`position: absolute; top: var(--phi-5)`. Mientras el contenido cabe en la pantalla, el bloque
lo centra y el kicker queda encima, limpio. En cuanto no cabe —cualquier sección con lista o
tabla en un móvil— el centrado deja de operar, el titular sube hasta los 110 px y los dos se
imprimen uno sobre otro. Catorce secciones de las seis rutas.

**Causa raíz:** Sacar un elemento del flujo es declarar que su posición no depende de lo que
tenga alrededor. Aquí sí dependía: el kicker existe *en relación* con el titular. Nunca hubo
una razón para colgarlo; puesto encima del titular dice exactamente lo mismo.

**Fix aplicado:** Al flujo, dentro de la columna del texto —de donde hereda ancho y lado—, y
una comprobación de navegador que compara pares de cajas de texto dentro de cada sección y
falla si dos se solapan más de cuatro píxeles.

**Prevención:** Un `position: absolute` sobre contenido que se lee —no atmósfera, no
decoración— pide una razón escrita. Y las comprobaciones visuales tienen que correr en las
medidas donde el contenido NO cabe, que es donde se rompe la maqueta; a 1440 px todo esto
estaba perfecto.

**Archivos:** `src/components/Bloque.astro`, `scripts/verificacion-degradacion.mjs`

---

## [2026-09-09] — Un fondo animado puede romper el contraste sin que ninguna herramienta lo diga

**Contexto:** Al portar el fondo de seda que pidió el cliente.

**Error:** La primera versión llegaba a `rgb(58,58,59)` en sus crestas. El texto de la
sección se lee encima: el rojo del «Ver» caía a **3,1:1** y el gris a 3,3, contra el 4,5 que
exige G3. Lighthouse daba Accesibilidad 100.

**Causa raíz:** Las herramientas de contraste miden el **color de fondo declarado** del
elemento —aquí `--void`, negro— porque no pueden saber qué está pintando un canvas debajo. Un
fondo animado es un punto ciego completo para toda la cadena automática.

**Fix aplicado:** El techo de luminancia se calcula al revés, desde el requisito: se busca el
gris más claro con el que el color de texto de menos margen mantiene 4,5:1 —28— y se pone ahí
el máximo de la textura. Y una comprobación que lee el píxel más claro del propio canvas y
calcula los dos contrastes.

**Prevención:** Cualquier cosa que se dibuje debajo de texto y no sea un `background-color`
—canvas, vídeo, imagen— necesita su propia medida de contraste. La regla práctica: si el
fondo no está en el CSS, Lighthouse no lo ve.

**Archivos:** `src/components/FondoSilk.astro`, `scripts/verificacion-degradacion.mjs`

---

## [2026-09-10] — Un titileo que no salía en ninguna captura

**Contexto:** El cliente describió «una pequeña vibración en el navbar cuando dejo de
scrollear».

**Error:** La barra se estiraba, se encogía y volvía a estirarse en unos 250 ms. La causa: el
temporizador de reposo estaba en 120 ms y la inercia de Lenis sigue emitiendo eventos de
scroll después del último golpe de rueda, cada vez más espaciados y más cortos —los últimos,
de **un píxel cada 130 ms**—. El temporizador cabía entre dos de ellos: estiraba, llegaba el
evento de 1 px, la lógica volvía a encogerla, y 120 ms después estiraba otra vez.

**Causa raíz:** La regla era «cualquier scroll por debajo de 40 px encoge». Un evento de un
píxel es scroll. Con el temporizador en medio segundo el hueco nunca era tan grande y el
defecto estaba ahí, dormido.

**Fix aplicado:** La regla pasa a mirar la **dirección** y a exigir un movimiento mínimo de
cuatro píxeles. Y una comprobación que **cuenta cambios de estado** tras parar: uno es el
estirón, dos o más es el titileo. Es la única forma de verlo — una captura no lo enseña.

**Prevención:** Un umbral de tiempo contra una fuente de eventos que se va espaciando es una
carrera, no una regla. Y cuando el cliente describe un defecto de movimiento, el instrumento
no es una captura: es registrar los cambios con su instante.

**Archivos:** `src/components/Nav.astro`, `scripts/verificacion-degradacion.mjs`

---

## [2026-09-10] — `position: fixed` que no era fijo

**Contexto:** Al convertir el menú de móvil en un panel a pantalla completa.

**Error:** El panel, con `position: fixed; inset: 0`, salió de 116 px de ancho dentro de la
pastilla del nav, con el botón de reserva partido en cuatro líneas.

**Causa raíz:** `position: fixed` se resuelve contra el viewport **solo si ningún ancestro
crea un bloque contenedor**. `transform` lo crea —la barra lo usa para encogerse— y
`backdrop-filter` también. La pastilla lleva los dos.

**Fix aplicado:** El panel se mide en unidades de viewport (`100vw` / `100dvh`) y se posiciona
desde la caja de relleno de la pastilla, que es la referencia real. Y abrir el panel devuelve
la barra a su tamaño, porque si no heredaría también la escala.

**Prevención:** Antes de dar por fijo un elemento, mirar la cadena de ancestros buscando
`transform`, `filter`, `backdrop-filter`, `perspective`, `contain` y `will-change`. Y medirlo:
`getBoundingClientRect()` contra `window.innerWidth` lo dice en una línea.

**Archivos:** `src/components/Nav.astro`

---

## [2026-09-10] — Dos porcentajes que suman 100, más un hueco

**Contexto:** Al montar el pie nuevo, la columna de contacto se salía de la pantalla.

**Error:** `grid-template-columns: 61.8% 38.2%` con `gap: 68px`. Los dos porcentajes ya suman
el ancho completo del contenedor; el hueco se añade **encima**, y el sobrante sale por la
derecha. Estaba igual en `Bloque` desde el principio, sin que se notara porque ahí las dos
columnas nunca se llenaban del todo.

**Fix aplicado:** `minmax(0, 0.618fr) minmax(0, 0.382fr)`. Las fracciones se reparten lo que
queda **después** del hueco, así que la proporción áurea se mantiene y la suma cuadra. El
`minmax(0, …)` además permite que una columna se encoja por debajo de su contenido, que es lo
que evita que un correo largo la empuje.

**Prevención:** En una rejilla con `gap`, los tramos van en `fr`. Un porcentaje solo es seguro
si la suma deja sitio para los huecos.

**Archivos:** `src/components/Footer.astro`, `src/components/Bloque.astro`

---

## [2026-09-10] — Un punto ciego: nada de lo medido incluía el coste del 3D

**Contexto:** Al empezar la ronda de rendimiento en móvil.

**Error:** Durante cuatro rondas se dio por bueno «rendimiento 98-100» sin caer en que **este
contenedor no tiene GPU**. `capacidades.ts` descarta los rasterizadores por software, así que
en toda medición de Lighthouse la escena 3D **no se ejecutaba**: se medía la página sin lo más
caro que tiene.

**Causa raíz:** La misma protección que salvó al sitio del desastre de SwiftShader —quedarse
en el póster— hacía invisible el coste real en el instrumento de medida.

**Fix aplicado:** Una traza propia con la GPU fingida, CPU a 1/4 y Slow 4G, que sí monta la
escena. Con ella se vieron los 4,7 s hasta el primer fotograma y las 60 tareas largas. Y se
dice con todas las letras lo que sigue sin poder medirse aquí: el coste de **pintar** con una
GPU de verdad. Lo que sí se midió y se arregló es todo lo demás — bytes, parseo, maquetación,
reflujos.

**Prevención:** Antes de creerse una métrica, preguntarse qué parte del sistema **no** se está
ejecutando mientras se mide. Una degradación por capacidades es también un filtro sobre el
instrumento.

**Archivos:** `scripts/`, medición

---

## [2026-09-10] — La palabra más importante del sitio no cabía

**Contexto:** Auditoría de rendimiento; apareció de rebote.

**Error:** «Producción», el `<h1>` de su ruta, mide 379 px a 68 px de cuerpo. La columna de
texto de un móvil de 390 tiene 306. El navegador hacía lo único que podía: partir la palabra
por la mitad, **«Produ / cción»**, en el elemento más visible de la página. Llevaba así desde
el primer día, en las cuatro rutas de nombre largo.

**Causa raíz:** El `clamp()` del titular tenía como **mínimo** 68 px. Un `clamp` protege del
extremo grande; del pequeño solo protege si el mínimo cabe en la pantalla más estrecha que se
soporta. Y el aserto de scroll horizontal no lo veía: la caja del h1 mide lo que le toca, lo
que desborda es su contenido.

**Fix aplicado:** Por debajo de 480 px el titular se mide contra la pantalla. Y una
comprobación que mide `scrollWidth` contra `clientWidth` de cada encabezado, en ocho rutas por
cinco anchos.

**Prevención:** Un `clamp(min, fluido, max)` en tipografía grande necesita que `min` quepa a
320 px. Comprobarlo con la palabra más larga que vaya a existir, no con la del ejemplo.

**Archivos:** `src/styles/global.css`, `scripts/verificacion-degradacion.mjs`

---

## [2026-09-10] — El parpadeo que solo existía en un teléfono, y por qué

**Contexto:** El cliente: «tan pronto empiezo a scrollear, titilea una pantalla negra; si
sigo, ya no».

**Error:** Redimensionar un canvas de WebGL **vacía su búfer**. Como el bucle de dibujo va en
`requestAnimationFrame`, entre el cambio de tamaño y el siguiente dibujo el navegador compone
un fotograma con el canvas transparente — negro a pantalla completa sobre el fondo del sitio.

**Causa raíz:** No era el scroll: era el **cambio de alto del viewport**. Al empezar a bajar,
un navegador móvil esconde su barra de direcciones; el viewport crece, y con él la sección de
`100dvh` y el canvas que la llena. Por eso ocurría exactamente al primer gesto y no volvía a
ocurrir: la barra ya no vuelve a esconderse. En escritorio no pasa porque nadie redimensiona
la ventana mientras mira.

**Fix aplicado:** Dibujar en el mismo `medir()`, sin esperar al siguiente fotograma.

**Prevención — dos, y la segunda es la que vale:**

1. Todo canvas que se redimensione tiene que repintarse en el mismo paso, no en el siguiente.
2. **Para reproducir un defecto de movimiento hace falta el instrumento adecuado.** Aquí no
   se veía con capturas: el hueco dura UN fotograma y `page.screenshot()` tarda más que eso.
   La primera versión de la comprobación usaba capturas y **seguía en verde con el arreglo
   quitado**. Con `Page.screencast` a 60 fps salió a la primera: un fotograma de brillo 8
   entre dos de 30. Cuando una mutación no pone rojo lo que debería, sospechar del
   instrumento antes que del diagnóstico.

**Archivos:** `src/three/motor.ts`, `scripts/verificacion-3d.mjs`

---
