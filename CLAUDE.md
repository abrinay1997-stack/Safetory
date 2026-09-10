# CLAUDE.md — reglas permanentes de este repositorio

> Claude Code lee este archivo en cada sesión: es la memoria del proyecto.

---

## AISLAMIENTO DEL REPOSITORIO — LÉELO PRIMERO

`C:\Users\MIPC` contiene un repositorio git que abarca la carpeta de usuario entera y apunta
al remoto `Acustica_Superior_DEMO`. Por eso, antes del 2026-09-07, cualquier sesión abierta
aquí veía los archivos de Acústica Superior, Feria del Lente, Infinity Gun Club y BukoFlow:
técnicamente eran el mismo repositorio.

**Resuelto.** Esta carpeta tiene repositorio propio con remoto `abrinay1997-stack/Safetory`.

- Este proyecto **no comparte nada** con ningún otro de `DESARROLLOS/`.
- No leas, no cites ni tomes decisiones basadas en otros proyectos de esa carpeta.
- `FLASK/` vive aquí como referencia de stack y movimiento, con su propio remoto
  (`abrinay1997-stack/FLASK`). Está en `.gitignore`. Consúltalo, no lo modifiques.

---

## Proyecto

- **Cliente:** Safetory Studio
- **Sector / zona:** Estudio de grabación, producción musical y ciclorama · Panamá, Panamá
- **Objetivo principal del sitio:** reservas (vía WhatsApp hasta la fase 2)
- **Familia de ADN:** **D — Creative Studio / WebGL**, con desviación cromática documentada:
  fondo `#080808` en vez de `#1a1a1a` y acento rojo único `#FF2D2D` en vez del par de neones.
  La desviación es deliberada: el espacio físico de Safetory es rojo laca y el wordmark es
  monocromo. Cumple el motor de variación anti-clon de `docs/ZERA-DNA-MASTER.md` §16.
- **Signature:** *El Inventario* — seis objetos reales del estudio modelados proceduralmente
  en Three.js, uno por ruta, recorridos por una cámara en espiral áurea.
- **Momento orquestado (uno solo):** el despiece del micrófono en `/`, bloque 3.
- **Arquitectura:** multipágina, 6 rutas, 37 pantallas a `100dvh`
- **Versión del kit:** `zera-kit v2.0`

## Documentos de referencia (léelos antes de codificar)

1. `docs/superpowers/specs/2026-09-07-safetory-sitio-3d-design.md` — **el diseño aprobado.**
   Es la referencia principal: rutas, bloques, tokens, sistema 3D, presupuesto y huecos.
2. `docs/ZERA-DNA-MASTER.md` — el genoma: tokens, familias, bloques, estándares.
3. `docs/SISTEMA-DE-PRODUCCION.md` — proceso y las cuatro pasadas de calidad.
4. `src/data/*.ts` — el contenido real. **Única fuente de verdad del texto y los precios.**

---

## Stack

Astro ^7.3.1 · three ^0.185.1 (import dinámico) · gsap ^3.15.0 · lenis ^1.3.26 · split-type ^0.3.4
Desarrollo: vitest ^5.0.0 · @types/three (no llegan al navegador).
Tipografía: Clash Display + Satoshi, auto-hospedadas.
Despliegue: GitHub → Netlify (preview en cada PR, producción en `main`).

**Sin React, sin React Three Fiber.** El 3D vive en islas de Astro con JavaScript plano;
meter React costaría el presupuesto de arranque entero.

## Comandos

```bash
npm run dev       # desarrollo
npm run build     # build de producción
npm run preview   # servir el build
```

---

## Reglas innegociables

1. **No inventes contenido.** Si un dato no está en `src/data/`, el bloque no se renderiza.
   Nunca cifras de relleno, testimonios ficticios ni logotipos de terceros.
   Los huecos conocidos están en el spec §9.5 — no los rellenes por tu cuenta.
2. **Cero placeholders en el código.** Ningún `lorem`, `your-…-code`, `G-XXXXXXXXXX`,
   `href="#"`. Los IDs de analítica van en variables de entorno.
3. **Accesibilidad = 100** en Lighthouse. `:focus-visible` en todo lo interactivo,
   contraste ≥4.5:1, `prefers-reduced-motion` real, teclado de principio a fin.
4. **Rendimiento:** LCP ≤1.8s · INP ≤150ms · CLS ≤0.02 · **JS inicial ≤140 KB gz.**
   Three.js pesa ~150 KB gz por sí solo: **jamás en el arranque.** Póster WebP como LCP,
   `import()` dinámico después del idle, cross-fade al primer frame. Spec §7.
5. **Animar sólo `transform` y `opacity`.** Nunca `width`, `height`, `top`, `left`.
6. **Máximo 2 secciones con `pin`** por página, ninguna con `pin` por debajo de 768px.
7. **Un solo `<h1>` por página** y jerarquía semántica real. El texto animado sigue existiendo
   en el DOM como texto. **Ninguna palabra del sitio existe solo dentro del canvas.**
8. **Un solo acento cromático:** `--rec` `#FF2D2D`. El ámbar y el violeta del estudio son
   temperatura de luz dentro de la escena 3D, nunca tokens de interfaz.
9. **Un momento orquestado por sitio.** Ya está asignado: el despiece del micrófono en `/`.
   El resto del movimiento es sobrio.
10. **Un commit por bloque**, con mensaje `feat(Sxx): descripción`.
11. **Toda sección ocupa `100dvh`.** `dvh` y no `vh`: la barra del navegador móvil provoca
    saltos con `vh`.
12. **Toda proporción sale de la escala φ.** `--phi-0` … `--phi-7`. Los repartos de ancho son
    61,8 / 38,2, nunca 50/50.

## Antes de escribir código

Muéstrame primero el plan (composición de bloques, decisiones de tipografía y movimiento)
en no más de 10 líneas, y espera mi visto bueno.

## Antes de decir que algo está terminado

Ejecuta las cuatro pasadas de calidad en este orden: **SEO → Accesibilidad → Rendimiento → Copy**
(ver `docs/SISTEMA-DE-PRODUCCION.md` §7) y entrégame el resultado de cada una.

## Nunca

- Añadir dependencias no listadas sin preguntar.
- Cambiar tokens globales para resolver un caso concreto.
- Publicar marcas y modelos de equipo sin confirmación escrita del cliente: identificar mal
  un equipo en la web de un estudio destruye la credibilidad ante un profesional.
- Publicar `aggregateRating` u otros datos estructurados sin evidencia real.
- Volver a depender de Setmore ni de ningún otro servicio de agendado de terceros.

---

## Estado actual — 2026-09-09 (publicado en el preview, con las dos rondas de revisión aplicadas)

**Las 23 tareas están cerradas y las dos revisiones del cliente, aplicadas y publicadas.**
Rama de trabajo: `claude/webpage-production-xbcpr1`, mergeada a `main` (avance rápido) el
2026-09-09. El despliegue de Pages de ese commit está en verde.

| | |
|---|---|
| Rutas publicables | 6: `/`, `/estudio`, `/ciclorama`, `/produccion`, `/membresia`, `/contacto` |
| Rutas legales | 2: `/privacidad`, `/aviso-legal` — enlazadas desde el pie |
| Tests | **358 en 26 archivos, todos en verde** |
| Verificación del motor 3D en navegador | **8/8** (`scripts/verificacion-3d.mjs`) |
| Verificación de degradación | **12/12** (`scripts/verificacion-degradacion.mjs`) |
| Lighthouse móvil, mediana de 3 pasadas, **las seis rutas** | Accesibilidad **100** · Prácticas **100** · SEO **100** · Rendimiento **100** |
| CLS | **0,000** en las seis rutas (presupuesto 0,02) |
| JS inicial | **8,8 KB gz** (presupuesto 140 KB gz) |
| LCP | 1,86 – 1,87 s (presupuesto 1,8 s) — **hay que volver a medirlo en producción**, ver abajo |

### Lo que pidió el cliente el 2026-09-09, y qué se hizo

1. **«Se ve amplio y luego se encoge», en todas las páginas.** Era real: el objeto encogía un
   10 % al cruzar del póster al canvas en toda pantalla más ancha que 16:10. Ver la bitácora.
2. **El logotipo desaparecía en `/contacto`.** El wordmark no pasaba por `ruta()`: 404 en el
   preview. Cuarta aparición del mismo defecto en el proyecto.
3. **El altavoz de `/estudio` no parecía un altavoz.** Era un cilindro achatado, y además el
   cono giraba sobre otro eje que su caja. Rehecho como torno con perfil real.
4. **El ciclorama podía mejorar.** Cámara de fotos sobre trípode delante, foco retirado al
   borde del cuadro y fondo con proporción de plató.
5. **Las secciones se sentían infinitas.** `Bloque` acepta una fotografía real del estudio al
   38,2 % opuesto al texto, al 14 % de opacidad.
6. **La home decía dos veces lo mismo.** El pin del despiece baja de 140 % a 70 % y los cuatro
   territorios pasan de cuatro pantallas a una tabla. De 9360 px de recorrido a 5400.
7. **El mapa exacto.** El cliente aportó su ficha de Google; con ella, coordenadas reales en
   `site.ts` y un `GeoCoordinates` en el dato estructurado.

### Lo que pidió el cliente en la segunda ronda, y qué se hizo

1. **La cámara del ciclorama estaba metida dentro del plató.** Sale del ciclorama, a 1,4× de
   tamaño, y las patas del trípode vuelven a tocar el suelo: hay que dibujarlas en la escala
   del propio grupo, no en la de la escena.
2. **Los fondos parecían desenfocados.** Era el `mask-image` que los difuminaba por un borde.
   Fuera: fotografías nítidas al **28 %** y en más secciones — 14 bloques en cinco rutas —,
   alternando lado en cada bloque, con el texto por defecto a la izquierda.
3. **La dirección y el mapa eran dos bloques.** Ahora son uno: «Dónde estamos», con la
   dirección y el mapa dentro.
4. **El pie.** Logotipo real, eslogan, cuatro columnas y una línea de cierre con el
   copyright y los enlaces legales.
5. **Páginas legales.** `/privacidad` y `/aviso-legal`, con lo que el sitio hace de verdad y
   nada más. Pendiente de revisión legal: `docs/PENDIENTE.md` §6.
6. **La bolita de `/estudio`.** Era el testigo rojo de grabación, suelto entre los altavoces.
   Eliminado; los altavoces se quedan como estaban.
7. **La barra que se encoge.** Como en las dos referencias del cliente, pero más pequeña:
   47 px en escritorio y 46 en móvil, contra los 58 de aquéllas. Con `transform: scale()`
   —G6 prohíbe animar la caja—, dos umbrales de histéresis y `requestAnimationFrame`.
   **Se encoge mientras se baja y vuelve sola medio segundo después de parar** (tercera
   ronda): encogida es una barra que se aparta para dejar leer, y con la página quieta no
   hay nada de lo que apartarse.

### Tercera ronda, 2026-09-09

1. **La barra no volvía a su tamaño.** Ver el punto 7 de arriba.
2. **La cámara de fotos del ciclorama disparaba de espaldas al fondo.** Dos defectos: estaba
   en el cuadrante opuesto a la luz —se leía como si estuviera detrás del ciclorama— y su
   giro llevaba un `+ Math.PI` de más desde que se creó el objeto. Ahora va al primer plano,
   del mismo lado que el foco y más cerca del espectador que él.

### Tercera ronda y auditoría de móvil, 2026-09-09

La barra volvía tarde y la cámara del ciclorama disparaba de espaldas (arriba). Y una
auditoría completa a 320, 390 y 768 px, que encontró lo que ninguna herramienta decía:

1. **El kicker se imprimía encima del título** en catorce secciones de las seis rutas.
   Estaba colgado con `position: absolute` a 110 px del borde; cuando el contenido no cabe
   en la pantalla, el bloque deja de centrarlo y el titular sube hasta ahí. Ahora va en el
   flujo, dentro de la columna del texto.
2. **Los kickers que repetían el titular, fuera:** los cinco de los héroes, los seis
   `0X · Servicio` y el `Legal` de las páginas legales.
3. **Scroll horizontal** en `/contacto` (el correo a 42 px medía 525 en una columna de 306)
   y, a 320 px, en la home y en las rutas con precio. Las tres medidas pasan a `clamp`.
4. **Objetivos táctiles por debajo de 24 px**: los enlaces del pie, la línea legal, la marca
   del nav y el botón de menú encogido.
5. **Texto a 10 px** en kickers y en la barra. Suelo en 12.
6. **El pie, en tres bandas**, con el crédito «Página creada por panaclaw.com».
7. **Fondo de seda** en la sección de los cuatro territorios, portado del componente React
   que pasó el cliente a un canvas 2D con JavaScript plano.

### Cuarta ronda, 2026-09-10

1. **La barra titilaba al parar.** Medido: la inercia de Lenis emite eventos de un píxel
   cada 130 ms y el temporizador de 120 ms cabía entre dos. Ahora manda la **dirección** —
   bajando encoge, subiendo vuelve entera en el acto, quieta está entera— con un mínimo de
   cuatro píxeles de movimiento. De 86 cambios de estado en dos segundos de scroll a 2.
2. **El menú de móvil.** La pastilla se queda con logotipo y rayitas; el botón de reserva
   se va dentro del panel, que ocupa la pantalla entera. `inert` sobre lo que queda detrás.
3. **`/producción` pasa de ocho pantallas a tres**: los seis servicios en una rejilla de
   3×2 y fuera la tabla comparativa, que repetía lo mismo. De 8491 a 3473 px.
4. **El pie, como la referencia del cliente**: marca con los cuatro servicios y su precio a
   la izquierda, tres columnas de enlaces a la derecha, línea legal debajo.
5. **`src/data/territorios.ts`**, nuevo: la lista que usan la portada y el pie.
6. **Un defecto de aritmetica en las dos rejillas áureas:** `61.8% 38.2%` con `gap` pide
   más ancho del que hay. En `minmax(0, 0.618fr)` el hueco se descuenta primero.

### Quinta ronda — rendimiento en móvil, 2026-09-10

La audiencia llega desde redes sociales: primera visita, datos móviles, teléfono.
Medido con Lighthouse móvil y con una traza propia a **CPU 1/4 y Slow 4G**.

| | antes | ahora |
|---|---|---|
| Rendimiento (las seis rutas) | 98-99 | **100** |
| LCP | 1,86-1,95 s | **1,50-1,51 s** |
| CLS | 0,017 | **0,000** |
| TBT | 84-109 ms | **11-30 ms** |
| JS inicial | 60,7 KB gz | **8,8 KB gz** |

1. **El CSS entero va dentro del HTML.** Una hoja de 2,7 KB costaba 302 ms de pintado
   bloqueado: no el peso, la ida y vuelta.
2. **GSAP, Lenis y SplitType salen del arranque** — 48 KB con el 56 % sin usar. Se piden tras
   el primer pintado; con reduce-motion no se piden. El contenido se lee sin ellos.
3. **Lenis no arranca en pantallas táctiles.** Suaviza la rueda del ratón; el dedo usa el
   scroll nativo. En un teléfono solo mantenía un bucle vivo por fotograma.
4. **`content-visibility: auto`** en las secciones: 577 ms de maquetación eran, casi todos,
   trabajo sobre contenido a cinco pantallas de distancia.
5. **La tipografía de cuerpo, precargada.** Era la causa nombrada del último desplazamiento.
6. **La escena 3D, más barata:** densidad de pintado 1,5 en táctil (la mitad de píxeles),
   gama baja al póster por `hardwareConcurrency`, y fuera el reflujo forzado por evento de
   scroll de `medirProgreso`.
7. **«Producción» no cabía.** A 68 px medía 379 px en una columna de 306: el navegador
   partía la palabra por la mitad en el elemento más visible del sitio.

### Lo primero que tienes que leer

| Orden | Qué | Dónde |
|---|---|---|
| 1 | Errores ya cometidos y cómo se resolvieron. Es lo que más tiempo ahorra | `docs/errors-learned.md` |
| 2 | Trabajo pendiente, priorizado | `docs/PENDIENTE.md` |
| 3 | El diseño aprobado (autoridad vinculante) | `docs/superpowers/specs/2026-09-07-safetory-sitio-3d-design.md` |
| 4 | El ledger de la primera fase | `.superpowers/sdd/2026-09-07-safetory-sitio-3d/progress.md` |

**Si tu contexto y `git log` discrepan, manda `git log`.**

### Las dos verificaciones que no son tests — **las ejecuta el CI**

`npm test` no las cubre y no puede: necesitan un navegador de verdad. **El workflow las corre
en cada push**, con el Chrome que ya trae el runner; por eso la dependencia es
`playwright-core` y no `playwright`, que arrastraría una descarga de navegador.

Para ejecutarlas en local:

```bash
npm run build
npx astro preview --port 4330 &

CHROMIUM=/ruta/a/chrome node scripts/verificacion-3d.mjs          # 8 puntos: el motor y los planos
CHROMIUM=/ruta/a/chrome node scripts/verificacion-degradacion.mjs # 12 puntos: GPU, reduce-motion, teclado, fondos, barra, movil, seda, menu, titulares
```

**`scripts/verificacion-3d.mjs` es el único punto del proyecto donde se comprueba que
`motor.ts` y `planos-profundidad.ts` funcionan.** Todos sus modos de fallo son silenciosos.
Sus ocho puntos están validados por mutación: se rompió a mano lo que cada uno dice vigilar
y se comprobó que se pone rojo, y solo el que corresponde.

**Los dos scripts fingen una GPU real** parcheando `getParameter`. Es necesario desde que
`capacidades.ts` descarta los rasterizadores por software, y este contenedor no tiene GPU. El
parche vive en el arnés de pruebas y **no debe bajar al código de producción**: un interruptor
para forzar el 3D sería una puerta abierta a servir una página que bloquea el hilo principal
dos minutos y medio.

### Lo que se decidió y por qué — cambios sobre el plan

Todos están razonados en su commit; aquí solo el titular:

1. **La cámara en reposo miraba al sitio equivocado.** `medirProgreso` arrancaba en t=0,5 y la
   espiral en el eje +x, así que el reposo caía a 180° del frente. Los objetos se modelan
   mirando a +z. Corregidos los dos.
2. **Los planos de profundidad van desenfocados.** Están a 6 y 12 unidades: nítidos se leían
   como fotografías pegadas al fondo, con el rótulo del estudio duplicado compitiendo con el
   `<h1>`. `scripts/desenfocar-fondos.mjs`. De paso, 272 KB → 56 KB.
3. **`metalOscuro()` bajó de `metalness` 0.85 a 0.35 y hay una cuarta luz de contorno.** Un
   metal sin mapa de entorno no tiene componente difusa: el micrófono se dibujaba MÁS OSCURO
   que el fondo. Medido: luminancia 4,6 sobre un fondo de 8, ahora 9,1.
4. **El despiece escucha un evento.** El plan leía `window.__safetoryObjeto3D` en
   `astro:page-load`, pero la isla monta en `requestIdleCallback`: el objeto no existía y el
   único momento orquestado del sitio no habría ocurrido nunca.
5. **Sin GPU no hay escena.** Ver la bitácora de errores.
6. **El mapa de `/contacto` se incrusta con la ficha del cliente.** Se aparta del §5.6 del
   spec, que prohibía el iframe; manda la instrucción del cliente, que aportó su propio mapa.
7. **La cámara encuadra como el póster** (`fovParaCubrir`), no con el campo vertical fijo.
   Sin eso el objeto encoge un 10 % al aparecer el canvas en cualquier pantalla panorámica.

### Despliegue

| | Estado | Dónde |
|---|---|---|
| GitHub Pages vía Actions | **activo**, marcado `noindex` | `abrinay1997-stack.github.io/Safetory` |
| Netlify, raíz del dominio | **sin configurar**, aplazado por el cliente el 2026-09-09 | `netlify.toml` listo, sin proyecto al otro lado |

**El entorno `github-pages` solo despliega desde la rama por defecto**, así que hay que
mergear a `main` para que el preview se actualice. El CI está en verde y ejecuta también las
dos verificaciones en navegador.

Mientras no exista el sitio de Netlify, **lo publicado va `noindex`**: no compite en Google
porque no está indexado en absoluto. Ver `docs/PENDIENTE.md` §11 para retomarlo.

### Trampas ya pisadas — no vuelvas a caer

1. **`npm ci` fallaba con npm 10 y funcionaba con npm 11.** ARREGLADO: al lockfile le
   faltaban `@emnapi/core` y `@emnapi/wasi-threads`, dos transitivas de `sharp`. Regenerado,
   la instalación limpia funciona con las dos versiones. Si vuelve a divergir, regenera el
   lockfile con la misma npm que fija el workflow: `npx -y npm@11 install`.
2. **Al revisar vitest, mira `Test Files` ANTES que `Tests`.** Un archivo que falla al
   cargarse no aporta tests ni resta ninguno: la línea `Tests` sale toda en verde.
3. **`git checkout -- archivo` restaura desde HEAD.** Si estabas probando una mutación sobre
   una edición sin commitear, te la llevas por delante. Commitea antes de mutar.
4. **Un aserto que prohíbe una cadena tiene que mirar el CÓDIGO, no el archivo**, o pasa —o
   falla— por el comentario que lo explica. Usa `soloCodigo()` de `tests/util.ts` **por
   defecto**: van cinco tropiezos con esto, y el último lo provocó el propio comentario que
   documentaba el cambio que rompía el aserto.
5. **`ruta()` no es solo cosa de los `.astro`.** Cualquier cadena que empiece por `/` y viaje
   al navegador la necesita, incluidas las que viven dentro de módulos de Three.js. Van cuatro
   apariciones del mismo defecto. Y se comprueba sirviendo el build de preview desde
   `/Safetory`: en la raíz, con base y sin base se ven idénticos.
6. **CLS no ve un salto de contenido.** Mide cajas. Un póster y un canvas que encuadran
   distinto cambian de tamaño sin mover una sola caja, y el presupuesto lo da por bueno.
7. **Los comentarios `<!-- -->` de Astro viajan al navegador.** Usa `{/* */}`.
8. **`locator.screenshot()` de Playwright desplaza la página** para encuadrar el elemento. En
   una escena cuyo encuadre depende del scroll, devuelve siempre el mismo frame.
9. **El canvas no se puede leer con `drawImage`**: sin `preserveDrawingBuffer` el buffer queda
   vacío tras componer y se lee negro transparente. Un aserto escrito así pasa por la razón
   equivocada.
10. **`ScrollTrigger.getAll()` devuelve los de toda la aplicación.** `motion.ts` lleva su
   propio registro.
11. **`astro:page-load` se dispara también en la carga inicial.** Un segundo arranque con
   `readyState` monta el sistema dos veces.
12. **Las APIs de Three.js prefieren no molestar.** `getObjectByName` devuelve `undefined` en
    vez de lanzar, `TextureLoader` no avisa si el archivo no está, `Material.dispose()` no
    libera las texturas asociadas.
13. **En Git Bash, `BASE_PATH=/Safetory` se reescribe a una ruta de Windows.** Usa
    `MSYS_NO_PATHCONV=1`.
14. **`.superpowers/sdd/.gitignore` contiene `*`.** Los archivos nuevos de ahí necesitan
    `git add -f`.

### Lo que necesita el cliente, no el código

Ver `docs/PENDIENTE.md`. En resumen, y **ninguno se rellena por cuenta propia** (regla 1):

- **Precio y condiciones de la membresía.** `/membresia` está publicada sin cifra.
- **Marcas y modelos del equipo, por escrito.** Se publica la lista genérica.
- **Texto de marca / historia.** El manifiesto usa solo el eslogan real.
- **Qué incluye el co-working.** No se menciona en el sitio.
- ~~Una captura del mapa~~ — **CERRADO el 2026-09-09**: el cliente aportó su ficha de Google
  y de ahí salen las coordenadas, el mapa incrustado y el `GeoCoordinates`.
