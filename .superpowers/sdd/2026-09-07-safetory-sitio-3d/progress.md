# SDD ledger — plan: docs/superpowers/plans/2026-09-07-safetory-sitio-3d.md

Spec: docs/superpowers/specs/2026-09-07-safetory-sitio-3d-design.md (legible, autoridad vinculante)
Rama: feat/sitio-3d (creada desde main en 1f84031)

Ruling: trabajar en rama, no en worktree — el plan exige `npm install`, servidor de
desarrollo y capturas manuales en el navegador; un worktree duplicaría node_modules y
partiría los pasos manuales entre dos rutas. Coste si me equivoco: main queda sin aislar
frente a un `git checkout` accidental, recuperable con `git switch`.

---

## Escaneo previo — pares de tareas que comparten archivo o interfaz

| Par | Produce → consume | Resultado |
|---|---|---|
| T1 → T2 | `src/styles/global.css` creado / modificado | OK. T2 solo antepone `@font-face`; el test de T1 (`--phi-N`, sin `100vh`) sigue pasando |
| T1 → T5 | `--mayor` / `--menor` / `--phi-*` → Bloque, PrecioCard | OK |
| T3 → T5,12,14,15,16,17,18 | `Tarifa {id,nombre,duracion,precio,condicion?}` | OK, firma idéntica en los siete consumidores |
| T3 → T12,15,16,17,18,19 | `enlaceWhatsApp(servicio)` | OK |
| T4 → T5,T6 | BaseLayout importa Nav/Footer/SmoothScroll aún inexistentes | Transitorio conocido, documentado en T4 paso 4. Los tests de T4 son de contenido de archivo y pasan. El repo no compila entre T4 y T6 |
| T5 → T20 | `Nav.astro` `@media (max-width:899px)` sustituido | OK, instrucción de sustitución explícita |
| T5 → T6 | PrecioCard emite `<data value>` → `contarCifra` lo anima | OK |
| T6 → T13 | `gsap`, `ScrollTrigger`, `prefersReducedMotion` | OK |
| T7 → T8 | `puntoEnEspiral`, `ESPIRAL_POR_DEFECTO` | OK |
| T8 → T11 | `crearMotor(): Motor \| null` | OK, el `null` se comprueba en Escena3D |
| T8 → T17,T18 | `motor.ts` `dibujar()` modificado dos veces | OK secuencial: T18 inserta "tras la línea del knob", que T17 crea. Dependencia de orden anotada |
| T9 → T10,15,16,17,18,19 | `metalOscuro`, `blancoDifuso`, `emisivoAcento`, `Temperatura` | OK |
| T10 → T15,16,17,18,19 | `medirPresupuesto(): {mallas,triangulos}` | OK |
| T10 → T11 | `crear(): THREE.Group` | **F1 — conflicto, ver abajo** |
| T11 → T12..T19 | `Escena3D` props | OK |
| T13 → T11 | `window.__safetoryObjeto3D` | OK, T13 paso 4 modifica Escena3D |
| T19 → T9 | `rotulo.ts` carga `/escena/wordmark.webp` | OK, T19 paso 4 lo genera |
| T21 → T11 | `netlify.toml` bloquea `/dev/*` | OK |
| T22 → todas | lee `dist/*.html` | OK con `build.format: 'file'` |

## Escaneo previo — coherencia interna de cada tarea

| Tarea | Sus tests contra su código | Resultado |
|---|---|---|
| T1 | escala, contraste, global.css | OK. `--phi-0: 10px;` coincide literal con el aserto |
| T2 | 3× `font-display: swap` | OK, se declaran tres caras |
| T3 | 15 asertos contra los siete módulos | OK tras corregir el test de los seis servicios |
| T4 | asertos de contenido sobre BaseLayout | OK |
| T5 | `not.toMatch(/\d+vh\b/)` contra `100dvh` | OK: en `100dvh` el dígito precede a `d`, no a `v` |
| T6 | no anima layout | OK |
| T7 | 8 asertos matemáticos | OK |
| T8 | umbral de memoria inclusivo en 4 | OK |
| T9 | acento constante en las cuatro temperaturas | OK |
| T10 | presupuesto y piezas nombradas | OK |
| T11 | `import()` dinámico | **F1** |
| T12 | un solo h1, sin `/reservar` | OK |
| T13 | una sola `gsap.timeline(` | OK |
| T14 | `not.toContain('"05"')` | OK, no aparece |
| T15 | `not.toMatch(/\$\s?\d{2,}/)` | OK |
| T16 | tres bloques de vídeo | OK |
| T17 | `(s.match(/<Bloque/g)).length >= 8` | **F2 — conflicto, ver abajo** |
| T18 | sin cifra de precio | OK |
| T19 | mapa sin iframe | OK |
| T20 | menú móvil accesible | OK |
| T21 | netlify.toml | OK |
| T22 | asertos sobre `dist/` | OK, con un minor diferido |

---

## Hallazgos y rulings previos a la ejecución

**F1 — El mapa literal de `import()` rompe el build hasta la Tarea 19.**
`Escena3D.astro` y `dev/posters.astro` declaran un objeto literal con las seis rutas
`import('../three/objetos/<nombre>')`. Vite analiza los `import()` de forma estática y
falla el build con «Failed to resolve import» mientras cinco de los seis archivos no
existan. La Tarea 12 ejecuta `npm run build` y reventaría.

Ruling: sustituir el mapa literal por `import.meta.glob('../three/objetos/*.ts')` en
`Escena3D.astro` y en `dev/posters.astro`. Vite resuelve el glob contra los archivos que
existen en cada momento, mantiene un chunk por objeto y la carga sigue siendo diferida.
No se crean stubs: los stubs son placeholders y G2 los prohíbe. Plan corregido en T11.
Coste si me equivoco: si el glob no generase chunks separados, `three` podría acabar en
un bundle mayor de lo previsto; lo detecta el test de rendimiento de T22.

**F2 — El test de `<Bloque>` de la Tarea 17 cuenta el código fuente, no lo renderizado.**
`produccion.astro` genera los seis bloques de servicio con un `.map()`, así que en el
fuente hay 3 apariciones literales de `<Bloque`, no 8. El aserto
`toBeGreaterThanOrEqual(8)` fallaría siempre.

Ruling: sustituir ese aserto por `expect(pagina()).toContain('serviciosProduccion.map(')`,
que verifica lo que realmente importa —que cada servicio recibe su propio bloque— y dejar
la comprobación de pantallas renderizadas a la suite sobre `dist/` de T22. Plan corregido
en T17. Coste si me equivoco: ninguno; el aserto original era incorrecto, no exigente.

**F3 — `npm create astro` sobre una carpeta que ya tiene contenido.**
La Tarea 1 ejecuta `npm create astro@latest .` en un directorio que ya contiene
`CLAUDE.md`, `docs/`, `Imagenes/`, los logos y `.git`. El asistente puede negarse, pedir
confirmación interactiva o sobrescribir archivos existentes.

Ruling: andamiar a mano. `npm init -y`, instalar el stack con las versiones fijadas y
escribir `astro.config.mjs`, `tsconfig.json` y `vitest.config.ts` —que la tarea ya
proporciona íntegros— sin pasar por el asistente. Plan corregido en T1. Coste si me
equivoco: ninguno; el contenido de los archivos es el mismo y se evita un paso interactivo
que este entorno no puede responder.

**Minor diferido (no entra en el bucle):** el test de T22 «three viaja en su propio chunk»
filtra los assets por `f.includes('BaseLayout') || f.includes('client')`; si los nombres de
chunk de Astro 7 no contienen esas cadenas, el filtro devuelve vacío y el test pasa sin
comprobar nada. Se revisará en la Tarea 22 con los nombres reales de `dist/_astro`.

---

## Ejecución

BASE de la Tarea 1: 032e8fc

Ruling: los briefs se extraen con `.superpowers/.../brief.sh`, un awk local, porque
`scripts/task-brief` de la skill busca cabeceras «Task N» en inglés y este plan las tiene
en español («Tarea N»). El contenido extraído es idéntico: cabecera del plan con las
restricciones globales más el texto íntegro de la tarea. Coste si me equivoco: ninguno,
es solo la herramienta de extracción.

Task 1: implementador a04d8506391ab9c8f (sonnet) → DONE, commit de7b5ff, 9/9 tests.
Task 1: revisión (sonnet) → spec ❌ (1 Importante), calidad aprobada con 1 Menor.
  Importante: package.json:29 declara @astrojs/sitemap ^3.7.4, el brief exige ^3.7.3.
  Menor: campos residuales de `npm init -y` en package.json.
  El revisor confirma que la discrepancia «8 vs 9 tests» es error de transcripción del
  brief, no defecto del implementador. No se toca el archivo de test.
Task 1: Ruling: el Menor de package.json entra en la ronda de arreglo 1 pese a ser Menor,
  porque toca exactamente el mismo archivo y la misma línea de trabajo que el Importante;
  no extiende el bucle. Coste si me equivoco: una ronda con un cambio de más, trivial de
  revertir.
Task 1: fix round 1/5 (2 atendidos, 0 abiertos; commits de7b5ff..362e816)
Task 1: complete (commits 032e8fc..362e816, review clean)

BASE de la Tarea 2: 362e816
Task 2: Ruling: el Paso 1 del brief (descargar las fuentes a mano desde fontshare.com) lo
  resolví yo por la API pública `api.fontshare.com/v2/css`, extrayendo las URL de CDN y
  descargando los tres .woff2 con curl. Verificada la firma `wOF2` en los tres y el tamaño
  (15/25/25 KB, muy por debajo del límite de 120 KB del test). Motivo: el paso exigía
  interacción manual del usuario y habría bloqueado el bucle; la licencia ITF Free Font de
  Fontshare permite el auto-hospedaje, que es exactamente lo que hace el plan. Coste si me
  equivoco: si el CDN sirviera un subconjunto incompleto, faltarían glifos —se detectaría al
  ver el sitio, y se corrige sustituyendo los archivos sin tocar código.
Task 2: implementador abac0c1a88fd8c4d6 (haiku) -> DONE, commit 9a96367, 13/13 tests.
Task 2: revision (haiku) -> spec OK, calidad aprobada sin hallazgos.
Task 2: complete (commits 362e816..9a96367, review clean)

BASE de la Tarea 3: 9a96367
Task 3: implementador ab540c82ceab4dc51 (haiku) -> DONE, commit a5f77a7, 31/31 tests.
Task 3: revision (sonnet) -> spec OK, calidad CON HALLAZGO CRITICO.
  Critico: produccion.ts daba `duracion: 'Entrega en 24 horas'` a mixing, mastering y
  mixing+mastering. Ese dato no existe en la fuente del cliente. Viene de malinterpretar
  el «23h 59min» de Setmore, que es la longitud del hueco en la agenda de reservas, no un
  plazo de entrega. Ningun test lo cubria, asi que pasaba en verde.
Task 3: Ruling: el hallazgo es correcto y el defecto es del plan, no del implementador
  —el brief mandaba ese valor. La autoridad vinculante es el spec, y su §9 dice que el
  contenido sale solo de la fuente. Publicar un plazo de entrega que el cliente nunca
  prometio es exactamente lo que G1 prohibe, y ademas es la clase de dato que genera una
  reclamacion real de un cliente. Decidido: `Tarifa.duracion` pasa a opcional y los tres
  servicios que no se miden en tiempo la omiten. Plan corregido en T3 (tipos, produccion,
  dos tests nuevos) y en T5 (PrecioCard solo renderiza duracion si existe). Briefs 3 y 5
  regenerados. Commit del plan: 1ebcf30.
  Coste si me equivoco: si el estudio si tuviera una politica publicada de 24 horas, la
  web deja de anunciar una ventaja real; se recupera anadiendo el dato en cuanto el
  cliente lo confirme por escrito, que es como debio entrar desde el principio.
Task 3: Ruling: el JSDoc de `condicion` decia «No parafrasear» mientras el propio dato era
  una parafrasis de un original con erratas y sin tildes («Si alquila 3 horas o mas... 35$»).
  Decidido: mantener la redaccion corregida y reescribir el JSDoc —se permite corregir
  ortografia, nunca alterar el significado ni anadir compromisos. Publicar las erratas del
  original no aporta veracidad, solo descuido. Coste si me equivoco: ninguno; el significado
  es identico y verificable contra la fuente.
Task 3: minor (deferido): ninguno pendiente; el «siete vs seis servicios» del brief era el
  error de plan ya corregido en el commit 1ebcf30.
Task 3: fix round 1/5 (1 critico atendido, 1 hallazgo nuevo REFUTADO; commits a5f77a7..940af44)
  El implementador murio por limite de gasto de la API justo despues de commitear; el
  commit 940af44 esta completo y el arbol quedo limpio. Verificado por mi: 33/33 en verde.
Task 3: parked -- la re-revision alego «ruptura critica: expect(valor, mensaje) es sintaxis
  invalida y hara fallar el test». Ruling: refutado con evidencia de ejecucion. (1) La suite
  corre 33/33 y los dos tests nuevos aparecen como ejecutados con `--reporter=verbose`.
  (2) Prueba de mutacion desechable: el aserto lanza correctamente ante
  `duracion: 'Entrega en 24 horas'`, luego no es un test hueco. El re-revisor aplico
  semantica de Jest —donde el segundo argumento de expect() es invalido— a Vitest, donde
  `expect(actual, message?)` es parte de la API. El codigo se mantiene.
  Coste si me equivoco: ninguno; la prueba de mutacion es la evidencia mas fuerte que existe
  de que el aserto funciona.
Task 3: complete (commits 9a96367..940af44, 1 parked con ruling)

BASE de la Tarea 4: 940af44

Ruling: el usuario pide desplegar por GitHub Actions en lugar de Netlify, cambiando el
  source de Pages a «Actions». Afecta solo a la Tarea 21 y al campo `site`/`base` de
  astro.config.mjs. No bloquea las Tareas 4-20: BaseLayout deriva las URL canonicas y OG
  de `Astro.site`, nunca de un dominio escrito a mano, asi que el cambio es de una linea
  de configuracion. Decidido: seguir el bucle y reescribir la Tarea 21 al llegar a ella.
  Coste si me equivoco: si el dominio final cambia, hay que tocar una linea y rehacer el
  build; nada del codigo de las paginas depende de ello.
Task 4: implementador a7b11df799db271d3 (haiku) -> DONE, commit 90ea60d, 41/41 tests.
Task 4: revision (sonnet) -> spec OK, calidad aprobada sin hallazgos accionables.
Task 4: minor (deferido): el JSON-LD reconstruye a mano streetAddress/addressLocality/
  addressRegion en vez de derivarlos de site.direccion; hoy coinciden pero pueden divergir.
Task 4: minor (deferido): el test de aggregateRating hace matching de texto libre sobre todo
  el archivo, no solo sobre el JSON-LD; obligo a reescribir un comentario. Replantearlo en T22.
Task 4: complete (commits 940af44..90ea60d, review clean)

BASE de la Tarea 5: 90ea60d
Task 5: implementador adf2f8e0668b7ef2b (haiku) -> DONE, commit 1cfb2ed, 51/51 tests.
Task 5: revision (sonnet) -> spec OK, 1 Importante (seis <li> duplicados en Nav) + 5 Menores.
Task 5: Ruling: el defecto de fondo es MI test, no la implementacion. `toContain('href="/estudio")`
  lee el .astro como texto y es incompatible con un componente que genera marcado con .map().
  Decidido: restaurar el .map() y asertar sobre el array `enlaces` (`href: '/estudio'`), que es
  la fuente de verdad real. Coste si me equivoco: ninguno; el aserto nuevo es mas fuerte.
Task 5: fix round 1/5 (1 atendido; commit 22080b1) -- pero introduce una regresion propia:
  Footer paso a `tel:+507${site.whatsapp.substring(3)}`, que recorta el prefijo del pais para
  volver a anadirlo. Misma causa raiz: el test `toContain('tel:+507')` tambien lee el fuente.

Ruling (de clase, no de instancia): un aserto sobre el TEXTO de un .astro solo puede ser
  negativo (prohibir `vh`, `href="#"`, una marca comercial) o comprobar que se consume un
  modulo de datos (`site.direccion`). Nunca puede afirmar como queda el marcado: eso es de la
  suite que lee `dist/*.html` tras el build. Audite los 11 asertos literales del plan y corregi
  los tres rotos: Footer (T5), contacto (T19) y 404 (T20). Los demas son negativos o leen dist,
  y son correctos. Registrado en docs/errors-learned.md.
  Coste si me equivoco: si algun aserto negativo tambien fuera fragil, aparecera como
  implementador peleandose con un test; ya se como se ve.

Ruling: el usuario aclara que produccion sera NETLIFY y que GitHub Actions es solo para tener
  un enlace de preview antes de publicar. Eso invalida la base fija `/Safetory` que habia
  decidido: Netlify sirve desde la raiz y Pages desde el subdirectorio. Decidido: la base se
  fija por variable de entorno (`BASE_PATH`), el helper `ruta()` la aplica, y el build de
  preview lleva `PUBLIC_PREVIEW=true` que marca todas las rutas `noindex` -- un preview
  indexado competiria en Google con la produccion por el mismo contenido.
  Tarea 21 reescrita para los dos destinos. Tarea 23 nueva (ruta base) creada.
  Coste si me equivoco: si Netlify acabara sirviendo tambien desde un subdirectorio, basta
  definir BASE_PATH en netlify.toml; el codigo ya lo soporta.

Ruling: el usuario pide ir subiendo por partes para ver el avance. Decidido: (a) push tras
  cada tarea completada, no solo al final; (b) reordenar la ejecucion a T23 -> T6 -> T21, para
  que el workflow de preview exista cuanto antes y cada push publique algo visible. El preview
  no sera util hasta la T12, que es la primera pagina, pero estara publicando desde antes.
  Coste si me equivoco: ninguno; la rama es feat/sitio-3d y main queda intacta.
Task 5: Ruling: el .map() de Nav esta restaurado y verificado por mi (51/51). La regresion del
  telefono en Footer NO abre una ronda 2: la Tarea 23 modifica Footer.astro de todos modos, asi
  que la arreglo alli con el aserto ya corregido, y la revision de T23 la cubre. Consolidar
  evita una ronda entera de ida y vuelta sobre el mismo archivo.
  Coste si me equivoco: si T23 se saltara el arreglo, el telefono seguiria con substring(3);
  el aserto nuevo del brief de T23 lo hace imposible.
Task 5: complete (commits 90ea60d..22080b1, 1 arreglo trasladado a T23)

ORDEN REORDENADO: T23 -> T6 -> T21 -> T7..T20 -> T22
BASE de la Tarea 23: cc0b011
Task 23: implementador a66fb441a8a3946e8 (sonnet) -> DONE, commit e17a856, 61/61 tests.
Task 23: revision (sonnet) -> spec OK, 1 Importante + 1 Menor.
  Importante: `ruta()` no es idempotente con base. `ruta(ruta('/'))` -> '/Safetory/Safetory'.
  Menor: la suite solo ejercitaba la rama SIN base, porque BASE_URL se fija en build.
  Es decir: la rama que de verdad se despliega en el preview no tenia cobertura ninguna.
Task 23: Ruling: los dos hallazgos son el mismo problema visto por dos lados. Decidido:
  extraer la logica a `aplicarBase(base, p)` pura y exportada, dejando `ruta(p)` como una
  linea que la llama con BASE_URL. Eso arregla la idempotencia y ademas hace testeable la
  rama del preview, que es la que rompe en produccion y no en desarrollo. Cinco tests nuevos.
  Coste si me equivoco: una funcion exportada de mas en la superficie del modulo; a cambio,
  el unico camino que no se puede probar de otra forma queda cubierto.

Ruling: el usuario aclara que si publico previews tengo que ir mergeando a main, o no vera
  nada. Es tecnicamente correcto y no solo una preferencia: el entorno `github-pages` que crea
  `actions/deploy-pages` trae por omision una regla de proteccion que solo permite desplegar
  desde la rama por defecto. Un push a feat/sitio-3d construiria pero no publicaria.
  Decidido: mantener feat/sitio-3d como rama del bucle (para conservar revision por tarea) y
  hacer merge a main + push de ambas al cerrar cada tarea. Autorizacion explicita del usuario
  en este turno; main no tiene otros colaboradores y el proyecto es nuevo.
  Coste si me equivoco: main recibe codigo revisado por tarea pero sin la revision final de
  rama completa; se compensa con la Tarea 22 y la revision final, que siguen ejecutandose.
Task 23: fix round 1/5 (2 atendidos, 0 abiertos; commits e17a856..18109b5)
Task 23: complete (commits cc0b011..18109b5, review clean)

BASE de la Tarea 6: 18109b5
Task 6: implementador a1b62bb486585daaa (haiku) -> DONE, commit 89b23a5, 74/74 tests, build OK.
Task 6: revision (sonnet) -> spec OK, 1 CRITICO + 2 IMPORTANTES, los tres del plan:
  Critico: doble montaje en toda carga inicial. ClientRouter engancha astro:page-load al
    evento nativo `load`, y el script ademas comprobaba readyState. Verificado por el revisor
    en node_modules/astro/dist/transitions/router.js:414. Dos Lenis y dos animaciones por
    elemento en cada visita.
  Importante: gsap.ticker.add() con funcion anonima, nunca retirada. Un callback por
    navegacion durante toda la sesion.
  Importante: matarTriggers() usaba ScrollTrigger.getAll(), que devuelve los de toda la app.
    En BaseLayout el contenido va antes que SmoothScroll, asi que Reveal creaba sus triggers
    y SmoothScroll los mataba en el mismo tick. Con gsap.from() eso deja el contenido en
    opacity 0 de forma permanente.
Task 6: Ruling: los tres son reales y estructurales, y el tercero es el mas grave del
  proyecto hasta ahora: habria publicado texto invisible sin que ningun test lo notara,
  porque src/pages/ esta vacio y no hay nada donde verlo. Decidido: (a) un solo mecanismo de
  arranque, astro:page-load, que ya cubre la carga inicial; (b) referencia guardada del tick
  y gsap.ticker.remove() en destruir(); (c) registro propio de ScrollTrigger y limpieza
  unicamente en astro:before-swap, nunca al entrar. Siete tests nuevos. Plan corregido en
  3f0da37. Coste si me equivoco: si ClientRouter dejara de disparar page-load en la carga
  inicial, el sitio se quedaria sin movimiento —visible al instante y de una linea de arreglo,
  frente a un texto invisible que nadie detecta.

Ruling: la edicion del plan de la T23 se perdio del arbol de trabajo mientras corria un
  subagente (el codigo si la llevaba). Decidido: commitear cada correccion del plan en el
  acto, antes de dispatchar nada. Coste si me equivoco: ninguno; solo mas commits de docs.
Task 6: fix round 1/5 (3 atendidos, 0 abiertos; commits 89b23a5..4c14c81)
Task 6: complete (commits 18109b5..4c14c81, review clean). 81/81 tests, build OK.

Ruling: el usuario ya puso Source: GitHub Actions y no ve nada. Es correcto: no existe
  .github/workflows/ (lo crea T21) ni ninguna pagina (src/pages/ vacio, la primera es T12).
  Decidido: adelantar la pagina 404 de la T20 a la T21. Es la pieza mas pequena que ejercita
  el sistema de diseno completo -layout, nav, pie, ambas tipografias, tokens- y sin ella el
  preview publicaria un sitio vacio. En GitHub Pages 404.html se sirve ante cualquier ruta
  inexistente, asi que la raiz del preview la mostrara hasta que llegue la T12.
  Coste si me equivoco: si el 404 no representara bien el sistema visual, el usuario juzgaria
  el diseno por una pagina de error; lo aviso explicitamente al entregarlo.

BASE de la Tarea 21: 4c14c81
Task 21: implementador a7dfedae8e14ceac2 (sonnet) -> DONE, commit d31f890, 95/95 tests,
  build produccion 1 pagina + build preview con prefijo y noindex verificados.
  Concerns declaradas: (a) el brief extraido estaba truncado y completo desde el plan;
  (b) el comentario del netlify.toml contradecia su propio test, reescrito; (c) anadio
  <Reveal> al 404 porque sin el el script de animacion no entra en el bundle de esa pagina;
  (d) en Git Bash BASE_PATH=/Safetory se reescribe a ruta de Windows, usa MSYS_NO_PATHCONV=1.

Task 21: FALLO EN CI. El workflow corrio en feat/sitio-3d y aborto en `npm ci`.
  Diagnostico con evidencia, reproducido en local con `npx npm@10 ci`:
    npm error Missing: @emnapi/core@1.11.3 from lock file
    npm error Missing: @emnapi/wasi-threads@1.2.3 from lock file
  El lockfile lo escribe npm 11.6.0 (este entorno) y Node 22 trae npm 10. npm 11 poda dos
  dependencias transitivas del fallback wasm de sharp que npm 10 sigue esperando.
  Descartado antes de llegar aqui, con comprobaciones: versiones de las actions (todas
  existen), binarios linux-x64 en el lockfile (los 7 presentes), paquetes de otra plataforma
  marcados obligatorios (ninguno), lockfile ausente del commit (presente, 156901 bytes).
Task 21: Ruling: no regenerar el lockfile con npm 10 -la proxima instalacion local lo
  reescribiria con npm 11 y el fallo volveria-, sino fijar npm 11 en el runner. Ademas
  `engines` en package.json para que quede documentado y npm avise, y dos pasos de
  diagnostico (`node -v && npm -v && uname -sm`) que dejen rastro en futuros fallos.
  Coste si me equivoco: si el problema fuera otro, el diagnostico del propio workflow lo
  dira en el siguiente run en vez de obligar a otra ronda de hipotesis.
Task 21: fix round 1/5 (npm 11 fijado en CI; commits d31f890..880f524). 97/97 tests.
  Verificado por el implementador: `npx -y npm@11 ci` sobre copia aislada -> exit 0.
  Con npm@10 sobre la misma copia -> el fallo exacto reportado. Diagnostico confirmado.
  Nota util: su primer comentario del paso contenia la subcadena `npm ci` en la prosa, lo
  que hacia que el aserto de orden `indexOf('npm ci')` la encontrara antes que el paso real.
  Mismo tipo de trampa que ya aparecio en netlify.toml. Reescrito.
Task 21: complete (commits f529a73..880f524, pendiente de confirmar el run verde en main)

Mergeado a main: 7133e6a, 24 commits. main es la unica rama desde la que el entorno
  github-pages permite desplegar.

=== ESTADO AL CERRAR LA SESION (2026-09-08, 02:30 aprox) ===
Cerradas y revisadas: T1, T2, T3, T4, T5, T23, T6, T21  -> 8 de 23.
Siguiente tarea: T7 (espiral aurea). BASE: el HEAD de feat/sitio-3d tras el ultimo merge.
Los 23 briefs estan generados en este mismo directorio (task-N-brief.md).
El traspaso legible para humanos esta en CLAUDE.md, seccion "Estado actual".
Task 21: fix round 2/5 (3 problemas; commit a98e6f9, 100/100 tests)
  - concurrencia por rama: un push a feat cancelaba el run de main, la unica que publica
  - publicar solo si github.ref == refs/heads/main
  - instalacion con anotaciones ::error:: y respaldo a npm install
Task 21: Ruling: sin permisos de admin la API devuelve 403 en los logs del runner, asi que
  las anotaciones del check-run son el unico canal legible desde fuera. Se instrumenta el
  paso para emitirlas, y se anade respaldo a npm install porque un preview no necesita la
  garantia de reproducibilidad de una instalacion limpia: mejor publicar algo mirable que
  quedarse bloqueado. Coste si me equivoco: el preview podria construirse con un arbol de
  dependencias ligeramente distinto al de produccion; Netlify si usa la instalacion limpia.
Mergeado a main: a98e6f9

BASE de la Tarea 7: a98e6f9

=== SESION 2026-09-08 (reanudacion) ===
Task 7: Ruling: al reanudar, `src/three/camara-phi.ts` y `tests/camara-phi.test.ts` estaban
  en el arbol SIN COMMITEAR —escritos al cierre de la sesion anterior, misma perdida que la
  trampa n5 de CLAUDE.md. Verificado contra el brief: transcripcion literal del plan, 108/108
  en verde. Decidido: NO re-dispatchar un implementador para reteclear texto identico al
  plan; commitear lo que hay y mandar la revision de tarea, que es el gate que aporta valor.
  El informe de tarea declara la procedencia para que el revisor no lo trate como codigo ya
  visto por nadie. Coste si me equivoco: ninguna mirada de implementador sobre el codigo, lo
  que compensa la revision con el brief delante; si el revisor lo tumba, entra en ronda 1.
Task 7: Desviacion frente al brief anotada: tests/camara-phi.test.ts:57 llama
  `puntoEnEspiral(t)` sin opciones donde el brief pasa `O`. Cubre ESPIRAL_POR_DEFECTO en vez
  de las opciones de prueba. Sometida al juicio del revisor, no pre-juzgada.
Task 7: commit 3ae4998, 108/108 tests. Revision dispatchada (sonnet).
Task 7: revision (sonnet) -> spec OK, calidad APROBADA. 0 criticos, 0 importantes, 1 menor.
  Verifico a mano las formulas r(t)=r0*PHI^-t y theta(t)=t*2pi*vueltas contra los 8 asertos.
Task 7: minor (deferido): el test «nunca devuelve NaN» ya no dice que configuracion prueba,
  porque llama sin opciones. El revisor lo juzga neutro-a-positivo (unica cobertura de
  ESPIRAL_POR_DEFECTO). Se replantea el nombre en T22 si sigue molestando.
Task 7: ⚠️ resuelto por el controlador: radioInicial 6.2 / deltaAltura 1.6 solo se validan
  contra la escala real de los objetos, que llega en T10. No es un hueco: es una dependencia
  de orden ya prevista. Se lleva a la T10 como comprobacion explicita.
Task 7: complete (commits a98e6f9..3ae4998, review clean). 108/108 tests, build OK.

BASE de la Tarea 8: 3ae4998
Task 21: CONFIRMADO VERDE en main. Run #6 (34199402180, push a main, 2026-09-08 07:27 UTC)
  conclusion=success. Los dos fallos previos (#2, #4) son los de npm ci ya diagnosticados,
  ambos en feat/sitio-3d y anteriores al fix de npm 11. El run #3 en main quedo «cancelled»,
  que es exactamente lo que arreglo la concurrencia por rama del commit a98e6f9.
  Consultado por la API publica de GitHub: el MCP de github fallo al conectar en esta sesion
  (400, Authorization header is badly formatted) y gh no esta autenticado.
Task 21: PREVIEW VIVO Y VERIFICADO. https://abrinay1997-stack.github.io/Safetory/404.html
  devuelve la pagina con nav de 6 rutas, ambas tipograflas, y el pie con la direccion, el
  horario y el contacto reales. La raiz del preview devuelve HTTP 404 con ESE cuerpo, que es
  el comportamiento correcto de Pages mientras no exista index (llega en la T12).
Task 8: implementador ac59c9f16f68dc620 (haiku) -> DONE, commit 68691ef, 119/119 tests,
  build verde. Verificado por mi de forma independiente: 119/119, 10 archivos de test.
Task 8: revision (sonnet) dispatchada con foco explicito en ciclo de vida —fugas de
  listeners/observers, doble destruir(), liberacion de GPU, alListo() una sola vez, y quien
  posee objeto y luces—. Motivo: los tres bugs de la T6 fueron todos de ciclo de vida y el
  motor se monta y destruye en cada navegacion entre rutas.
Task 8: revision (sonnet) -> spec OK, calidad NECESITA ARREGLOS. 0 criticos, 3 importantes,
  4 menores. El revisor verifica uno a uno los cinco pares registro/baja de listeners y
  observers: los cinco completos, sin fugas.
  Importante 1: destruir() libera geometry y material pero NUNCA las texturas.
    Material.dispose() de three no libera sus mapas; hace falta texture.dispose() explicito.
  Importante 2 (exigido por el plan): los cuatro tests de motor.ts leen el fuente con
    readFileSync y comprueban substrings. Una cadena escrita en un comentario los aprobaria.
  Importante 3 (exigido por el plan): el aserto 'dispose()' esta subsumido por
    'geometry.dispose()' —la subcadena ya esta contenida—, asi que no puede fallar.

Task 8: Ruling sobre el Importante 1 (texturas): ARREGLAR, entra en ronda 1. Es una fuga de
  VRAM real, no teorica, y esta a una tarea de activarse: la T9 crea planos-profundidad.ts
  con TextureLoader sobre las seis fotos del estudio, y el motor se destruye en CADA
  navegacion entre rutas. Seis rutas navegadas = seis texturas huerfanas en GPU.
  Coste si me equivoco: ninguno; disponer una textura ya liberada es idempotente en three.

Task 8: Ruling sobre el Importante 2 (tests de texto): PARKED, el codigo se mantiene.
  El hallazgo es correcto en el fondo y aun asi no hay mejor opcion disponible: motor.ts no
  se puede instanciar en Node —necesita DOM, WebGL, ResizeObserver e IntersectionObserver—
  y la alternativa, mockear THREE.WebGLRenderer entero, verificaria el mock, no el motor.
  Rediseniar crearMotor() para inyeccion de dependencias cambiaria la interfaz que ya
  consumen T11, T17 y T18, y seria sobreingenieria por un test. Decidido: los tests de texto
  se quedan como red estructural, y la verificacion de comportamiento real se traslada a la
  T11, donde el motor se ejecuta por primera vez en un navegador de verdad al capturar los
  seis posters. Anotado como comprobacion explicita del brief de la T11.
  Coste si me equivoco: si el motor tuviera un fallo de ejecucion, ningun test lo atrapa y
  aparece a mano en la T11 en vez de en CI. Se acepta a cambio de no construir un andamiaje
  de mocks que daria falsa confianza.

Task 8: Ruling sobre el Importante 3 (aserto tautologico): ARREGLAR, y aprovecharlo.
  Se sustituye el aserto muerto 'dispose()' por uno que compruebe la liberacion de texturas
  del Importante 1. Elimina la tautologia y cubre el arreglo nuevo con el mismo cambio.
Task 8: Ruling: entran ademas tres Menores en la ronda 1 porque tocan exactamente las mismas
  funciones que el Importante 1 —destruir() y dibujar()— y no alargan el bucle: guarda de
  idempotencia en destruir(), parada real del bucle rAF fuera de viewport (lo pide el spec
  §7.4 literalmente, y hoy solo se omite el render, no el tick), y documentar en OpcionesMotor
  quien posee objeto y luces, que es lo que van a leer T17 y T18.
  Coste si me equivoco: la parada del rAF es el cambio con mas riesgo —si el re-arranque
  desde el IntersectionObserver fallara, la escena se queda congelada al volver al viewport—.
  Por eso se exige cubrirlo. Es visible al instante en la T11.
Task 8: Menor (diferido): sin try/catch alrededor de new THREE.WebGLRenderer(). Anade una
  rama sin test y no toca la linea de trabajo de esta ronda. Se replantea en T22.

Task 11: DEFECTO DEL PLAN detectado en el escaneo previo, corregido antes de llegar a la
  tarea. Escena3D.astro renderizaba `src={poster}` y `JSON.stringify(fondos)` crudos, sin
  pasar por `ruta()`. En el preview, servido desde /Safetory, el poster habria dado 404 —y
  el poster ES el elemento LCP de cada ruta, o sea que el sitio publicado se queda sin su
  imagen principal y sin cumplir el presupuesto de rendimiento— y las seis texturas de los
  planos de profundidad habrian fallado en silencio, dejandolos en negro.
  Ruling: corregir en Escena3D.astro, no en las seis paginas que le pasan las props.
  Centraliza el arreglo en un componente en vez de exigir que seis plantillas se acuerden,
  y `aplicarBase` es idempotente desde el arreglo de la T23, asi que aplicarla ahi es seguro
  aunque la pagina ya la hubiera aplicado. Anadido un test que lo cubre y que ademas prohibe
  el `src={poster}` crudo. Plan corregido y commiteado en el acto; brief 11 regenerado.
  Coste si me equivoco: si algun consumidor necesitara la ruta sin base, tendria que
  saltarse el componente; ninguno lo necesita, las seis rutas son internas.
Task 8: fix round 1/5 (5 atendidos segun el implementador; commit f2b51e3). 120/120 tests,
  build verde, verificado por mi de forma independiente. Re-revision scoped dispatchada.
  Riesgo que hago verificar explicitamente: al parar el bucle de verdad, si solo el
  IntersectionObserver lo re-arranca, una pestana que se oculta y se vuelve a mostrar sin que
  cambie la interseccion podria quedarse congelada. Es la misma clase de bug que la T6:
  invisible en test, visible solo en un navegador.

Task 7 -> ⚠️ RESUELTO por calculo, sin esperar a la T10. La duda era si radioInicial 6.2 y
  deltaAltura 1.6 encuadran bien los objetos reales. Medido contra la geometria del microfono
  del brief de la T10 (cuerpo Cylinder 0.3/0.32 x 1.0, tapa Sphere 0.33, horquilla Box de
  1.4 de alto -> objeto de ~1.8 de alto) y el FOV 38 de motor.ts:
    t=0, distancia 6.20 -> altura visible 4.27 -> el microfono ocupa el 42% del encuadre
    t=1, distancia 3.83 -> altura visible 2.64 -> el microfono ocupa el 68% del encuadre
  Empieza holgado y se cierra sin desbordar. near 0.1 y far 100 dejan el recorrido entero
  dentro del frustum, sin clipping en ningun punto. Los valores por defecto son correctos y
  no hay que tocarlos en la T10.
Task 8: re-revision ronda 1 (sonnet) -> 4 de 5 atendidos, 0 roturas nuevas, 0 desviaciones.
  El riesgo que hice verificar quedo DESCARTADO con razonamiento sobre el codigo:
  onVisibilidad no solo actualiza pestanaVisible, repite la condicion de arranque completa
  (visible && pestanaVisible && !bucleActivo) y relanza el bucle. Ocultar y volver a mostrar
  la pestana sin que cambie la interseccion NO congela la escena.
  Abierto: el aserto de re-arranque, `toContain('bucleActivo = true')`, no discrimina —esa
  cadena aparece 3 veces en motor.ts, asi que pasaria aunque se borrara entera la logica del
  observer. Mismo defecto que el aserto tautologico de la ronda 1, con otra forma.
Task 8: Ruling: entra en ronda 2 pese a ser un cambio de una linea de test. El codigo de
  produccion esta verificado y correcto; lo que falla es la red que deberia protegerlo, y
  este archivo lo van a modificar la T17 y la T18. Un aserto que no puede fallar es peor que
  ninguno: da permiso para romper la logica sin que nadie se entere. Exijo prueba de mutacion
  como evidencia, que es lo unico que distingue un aserto vivo de uno decorativo —el mismo
  metodo que ya zanjo la disputa de la T3. Coste si me equivoco: una ronda de mas por un test.
Task 8: fix round 2/5 (1 atendido; commit ae39b4d). 120/120 tests. Verificado por mi:
  el commit toca UNICAMENTE tests/capacidades.test.ts (9 lineas); `git diff f2b51e3 ae39b4d
  -- src/three/motor.ts` sale vacio, o sea que la prueba de mutacion no dejo residuo.
  El aserto pasa a ser regional: extrae /const io = new IntersectionObserver[\s\S]*?io\.observe\(/
  y comprueba dentro de esa region tanto `bucleActivo = true` como `requestAnimationFrame(dibujar)`.
  Re-revision scoped (haiku) dispatchada con encargo de REPRODUCIR ella misma la prueba de
  mutacion, no de creersela: es el unico punto que distingue este aserto del anterior.
Task 8: re-revision ronda 2 (haiku) -> HALLAZGO ATENDIDO. La prueba de mutacion la reprodujo
  el propio revisor, no se fio de la del implementador: borro `bucleActivo = true` de la
  linea 75 y el test cayo en rojo con el mensaje esperado; restauro con git checkout y volvio
  a verde. El aserto discrimina de verdad. Confirmado ademas que ae39b4d toca solo el test.
Task 8: complete (commits 3ae4998..ae39b4d, review clean). 120/120 tests, build verde.

BASE de la Tarea 9: ae39b4d
Escaneo previo de la T9 antes de dispatchar: (a) las seis imagenes de Imagenes/ existen con
  los nombres exactos de los `cp` del brief, verificadas una a una con su tamano; (b) el
  brief SI fija `textura.colorSpace = THREE.SRGBColorSpace`, que es lo que evita que las
  fotos salgan lavadas en three >=0.152 —no hay que anadirlo—; (c) .gitignore no excluye
  public/ ni Imagenes/, asi que las copias entran en el commit sin sorpresas.
Task 9: implementador a2fb8ef2276e5b3a8 (haiku) -> DONE, commit 36ebe85. Verificado por mi
  de forma independiente: 130/130 en la suite completa (el implementador reporto 10/10, que
  era solo su archivo), build verde, y las seis .webp dentro del commit (275 KB en total).
Task 9: revision (sonnet) dispatchada con cuatro riesgos nombrados: G9 cromatica —enumerar
  todos los colores literales y clasificarlos—, ausencia de limpieza propia de recursos,
  colorSpace SRGB en las dos texturas, y las seis imagenes con sus nombres.

T14 y T19: DEFECTO DEL PLAN, misma clase que el de la T11, encontrado extendiendo el escaneo
  a todas las paginas. Commit 38d45bb.
  T14: Territorio.astro renderizaba `href={href}` crudo y la portada le pasa /estudio,
    /ciclorama, /produccion y /membresia. Son la navegacion primaria del sitio: en el preview
    los cuatro enlaces apuntaban FUERA del sitio publicado.
  T19: la imagen del mapa usaba `src="/mapa-via-espana.webp"` a mano.
  Ruling: en T14 se corrige dentro del componente, no en las cuatro llamadas —un solo sitio
  que tenga que acordarse—; en T19 se aplica `ruta()` en el src y se anade el import que
  faltaba en contacto.astro. Briefs 14 y 19 regenerados. Verificado despues: cero
  coincidencias de `href={href}` y de `src="/mapa-via-espana` en el plan.
  Coste si me equivoco: ninguno; `aplicarBase` es idempotente y las rutas son todas internas.
  Nota: los `poster=` y `fondos=` crudos de T12 y T15-T19 NO son defecto: los absorbe
  Escena3D.astro, que ya aplica `ruta()` desde la correccion de la T11.
Task 9: revision (sonnet) -> spec OK, calidad APROBADA. 0 criticos, 1 importante, 2 menores.
  El revisor enumera y clasifica los nueve colores literales del diff: acento 0xff2d2d y
  VOID 0x080808 exactos, dos neutros de material del spec, y ambar/violeta CONFINADOS a
  luces.ts sin filtrarse a materiales ni exportarse como tokens. G9 respetada.
  Confirmado ademas: cero .dispose() propios (no duplica la limpieza de motor.ts), y
  SRGBColorSpace aplicado a las dos texturas dentro del forEach.
  Importante (exigido por el plan): crearPlanosProfundidad nunca se EJECUTA en los tests.
    El unico test lee planos-profundidad.ts como texto y busca las subcadenas -12, -6, 0.18
    y 0.10. Detecta que se borren los literales, pero no que la opacidad se asigne al plano
    equivocado ni que se pierda el colorSpace. Causa: vitest corre con environment 'node' y
    THREE.TextureLoader necesita DOM.

Task 9: Ruling sobre el Importante: ARREGLAR, y NO parkearlo como hice con el equivalente
  de la T8. La diferencia entre los dos casos es real y merece explicarse. En la T8 habria
  hecho falta mockear THREE.WebGLRenderer entero, y un test asi verifica el mock, no el
  motor. Aqui el objeto bajo prueba es el Group que la funcion construye —dos planos, sus z,
  sus opacidades, su colorSpace—, que es geometria pura y perfectamente comprobable en Node;
  lo unico que estorba es de donde salen las texturas. Decidido: anadir un parametro opcional
  de cargador con `new THREE.TextureLoader()` por defecto. No cambia ninguna llamada
  existente —la T11 sigue llamando crearPlanosProfundidad(fondos)— y convierte un aserto de
  texto en uno de comportamiento sobre lo que de verdad importa.
  Es load-bearing: T10 y T15-T19 dependen de que los planos esten donde deben. Una z o una
  opacidad mal puestas tapan el objeto o lo dejan invisible, y hoy nada lo atraparia.
  Coste si me equivoco: un parametro opcional de mas en la firma publica, revertible sin
  tocar a ningun consumidor.
Task 9: minor (diferido): blancoDifuso usa 0xe9e6df, cercano pero no identico a --bone
  #EDEAE3. Es color de material 3D, no token de interfaz, y viene literal del plan. Se anota
  para que T10 no lo confunda con el token del CSS.
Task 9: minor (diferido): el test «no hay entorno HDRI» solo impide reintroducir las cadenas
  RGBELoader/PMREMGenerator, no un HDRI por otra via. Guardrail util pero parcial.
Task 9: fix round 1/5 (1 atendido; commit 6ef9fe9). 130/130, build verde, verificado por mi.
  El arreglo es correcto en la forma: `cargador?: THREE.TextureLoader` con
  `cargador ?? new THREE.TextureLoader()`, ninguna llamada existente cambia, y el test nuevo
  ejecuta la funcion y comprueba dos hijos, z, opacidades, nombres, orden de las rutas y
  colorSpace.
  Riesgo que detecto al leer el diff y que NO pre-juzgo: el mock construye UNA sola
  THREE.Texture fuera de load() y devuelve esa misma instancia en las dos llamadas, asi que
  el aserto de colorSpace podria pasar aunque el codigo solo lo asignara en una de las dos
  iteraciones. Seria el mismo defecto que esta ronda venia a corregir, un nivel mas abajo.
  Lo mando a la re-revision como riesgo nombrado, con instruccion de resolverlo por mutacion
  —condicionar la asignacion al indice y ver si el test cae— en vez de por lectura.
Task 9: re-revision ronda 1 (sonnet) -> 6 de 7 asertos discriminan; el de colorSpace NO.
  CONFIRMADO POR MUTACION, no por lectura: condicionando la asignacion a `i === 0` el test
  siguio en verde 10/10. El riesgo que nombre al dispatchar era real. Las opacidades si
  discriminan: intercambiar 0.18 y 0.10 dio «expected 0.1 to be 0.18». Sin roturas nuevas,
  sin dependencias, sin tocar vitest.config.ts ni materiales.ts ni luces.ts.
Task 9: fix round 2/5 dispatchada: que el mock devuelva una THREE.Texture nueva por llamada
  y se comprueben las dos. Solo toca tests/materiales.test.ts.
  Nota de patron, ya son cuatro en dos tareas: aserto subsumido por otro de su lista (T8 r1),
  cadena que aparece tres veces en el archivo (T8 r2), aserto de texto donde cabia uno de
  comportamiento (T9 r1), e instancia compartida que absorbe las dos escrituras (T9 r2).
  Los cuatro son la misma familia: el aserto pasa por una razon distinta de la que vigila.
  La unica defensa que ha funcionado siempre es la prueba de mutacion.
Task 9: fix round 2/5 (1 atendido; commit 0106ddf). 130/130. Verificado por mi: el commit
  toca SOLO tests/materiales.test.ts (10 lineas) y planos-profundidad.ts quedo intacto. El
  mock construye ahora una THREE.Texture nueva por llamada, arrancando cada una en
  LinearSRGBColorSpace —estado inicial falso, para que el aserto no pueda pasar por omision—,
  las captura en un array y comprueba las dos por separado.

Escaneo previo de la T10, hecho mientras corria la re-revision de la T9:
  (a) ACOPLAMIENTO POR NOMBRE T10 -> T13 verificado, que es el riesgo real de esta tarea: el
      despiece del microfono de la T13 —el unico momento orquestado del sitio— mueve las
      piezas buscandolas por cadena. T10 produce 'microfono', 'cuerpo', 'rejilla',
      'rejilla-tapa', 'jaula', 'anillo' y 'base'; T13 consume 'rejilla', 'jaula' y 'anillo'.
      Los tres existen y se escriben igual. Sin desajuste. Si alguna vez se renombra una
      pieza en T10, el despiece falla en silencio: getObjectByName devuelve undefined y la
      animacion simplemente no ocurre.
  (b) Los limites LIMITE_MALLAS = 30 y LIMITE_TRIANGULOS = 60000 dejan al microfono muy
      holgado, asi que ese test no es exigente hoy. No es un aserto muerto: es un guardrail
      contra regresiones de los cinco objetos que vienen despues. Se deja como esta.
  (c) Los tests de la T10 ejecutan crear() y miden el Group de verdad, no leen el fuente:
      la geometria pura de three si funciona en Node —lo que no funciona son texturas y
      renderer—, asi que aqui no reaparece el problema de la T8 y la T9.
Task 9: re-revision ronda 2 (haiku) -> HALLAZGO ATENDIDO. Mutacion reproducida por el propio
  revisor: con `if (i === 0)` el test cae con «expected 'srgb-linear' to be 'srgb'» en
  texturasCargadas[1], exactamente la segunda textura. Revertido, vuelve a verde. El aserto
  discrimina. Alcance respetado, sin roturas.
Task 9: complete (commits ae39b4d..0106ddf, review clean). 130/130 tests, build verde.

BASE de la Tarea 10: 0106ddf
Task 10: implementador a0c21343ff4a29316 (haiku) -> DONE, commit 75616e1. 136/136 en la
  suite completa (esta vez si reporto el total), build verde. Presupuesto medido: 8 mallas y
  3080 triangulos, contra limites de 30 y 60000.
Task 10: verificado por mi antes de mandar a revision, con evidencia y sin dictar veredicto:
  (a) los siete `name` del codigo coinciden EXACTAMENTE con los siete del brief —cuerpo,
      rejilla, rejilla-tapa, jaula, anillo, base, microfono—. El «aro-superior/aro-inferior»
      que aparecia en su mensaje de resumen no esta en el codigo: era ruido del informe.
      La interfaz por nombre con la T13 queda intacta.
  (b) el diagnostico tecnico de su preocupacion es CORRECTO: node_modules/three/src/objects/
      Mesh.js:60 asigna `this.type = 'Mesh'` e InstancedMesh.js no lo reasigna, asi que en
      r185 una InstancedMesh reporta type 'Mesh'.
  (c) su SOLUCION es lo que mando a examinar: microfono.ts:44 escribe
      `jaula.type = 'InstancedMesh'` en el objeto de produccion para que pase un aserto del
      brief. Es modificar el codigo para satisfacer el test en vez de corregir el test, y
      `type` no es decorativa en three —la usan toJSON y ObjectLoader—. Lo mando como riesgo
      nombrado a la revision, con encargo de verificar el hecho por su cuenta y juzgar la
      solucion, incluida la alternativa de asertar con `instanceof THREE.InstancedMesh` o
      `isInstancedMesh`. No pre-juzgo el veredicto.
Task 10: revision (sonnet) -> spec OK, calidad NECESITA ARREGLOS. 1 importante, 1 menor.
  Correccion a mi propia nota anterior: el brief SI pedia 'aro-superior' y 'aro-inferior'.
  Mi grep de `.name = '...'` no los capturo porque se asignan por indice. Los siete nombres
  del codigo coinciden caracter por caracter con los del brief, verificado por el revisor con
  mutacion (renombrar 'anillo' a 'anillo-x' tumba el test). La interfaz con la T13 esta bien.
  Importante (exigido por el plan): el aserto `jaula?.type === 'InstancedMesh'` arrastro al
    implementador a escribir `jaula.type = 'InstancedMesh'` en el objeto de PRODUCCION.
    Evidencia decisiva del revisor: Object3D.toJSON de la propia three usa `isInstancedMesh`
    y NUNCA compara `.type`. Si la libreria no se fia de esa cadena, un test tampoco.
  Menor: quitar `* (m.count ?? 1)` de presupuesto.ts NO rompe ningun test. Los unicos
    asertos son techos de 30 y 60000, tan holgados que una formula rota pasa inadvertida.

Task 10: Ruling: el Menor sube a la ronda 1 con el Importante. medirPresupuesto es el
  guardrail de rendimiento de los cinco objetos que faltan (T15-T19); un guardrail que no
  puede fallar no protege nada, y el arreglo toca el mismo archivo de test que el Importante,
  asi que no alarga el bucle. Mismo criterio que en T1 y T8.
  Coste si me equivoco: un test mas que acopla ligeramente a la geometria de la jaula; se
  compara contra una copia medida en el momento, no contra un numero escrito a mano, asi que
  no se rompe si el diseno del microfono cambia.

Task 10: DEFECTO DEL PLAN corregido y commiteado en el acto (ae62628). El aserto malo estaba
  DOS veces: la jaula del microfono (T10) y los botones de la interfaz de audio (T17). De no
  haberlo mirado, la T17 habria repetido exactamente el mismo error dentro de siete tareas.
  Corregidos los dos a `isInstancedMesh`, anadido el test del multiplicador por instancia, y
  anadido `import * as THREE from 'three'` a los dos archivos de test, que hacia falta.
  Briefs 10 y 17 regenerados. Verificado: cero asertos `?.type).toBe('InstancedMesh')`.
  Coste si me equivoco: ninguno; `isInstancedMesh` es la bandera que la propia three usa.
Task 10: fix round 1/5 (2 atendidos; commit f360d91). 137/137.
Task 10: re-revision ronda 1 (haiku) -> AMBOS ATENDIDOS, con las dos mutaciones reproducidas.
  (a) con `jaula.type = 'Mesh'` puesto a mano, el aserto de isInstancedMesh NO se inmuta:
      7/7 en verde. Queda demostrado que mide la realidad y no una cadena.
  (b) quitando `* (m.count ?? 1)`, el test cae con «expected 12 to be 72»: detecta el factor
      6 exacto de la jaula.
  (c) La circularidad que mande examinar: SIN RIESGO, y el razonamiento es correcto. Las dos
      mitades recorren ramas DISTINTAS de medirPresupuesto —jaula.clone() conserva count=6 y
      pasa por el multiplicador; new THREE.Mesh(geometry) tiene count undefined y toma el
      camino `?? 1`—. Un error generico en el conteo por instancia afectaria a las dos por
      igual, pero eso seria un bug real de la funcion, no un defecto del test.
Task 10: complete (commits 0106ddf..f360d91, review clean). 137/137 tests, build verde.
  12 de 23 tareas cerradas.

BASE de la Tarea 11: f360d91

DECISION DEL USUARIO (2026-09-08): que capture yo los posters en el navegador, no el.
  Eso desbloquea el paso manual que el plan dejaba en sus manos desde la T11 hasta la T19
  —seis posters, uno por ruta— y de paso me pone delante el Paso 5b, la verificacion en
  navegador que es la unica comprobacion de comportamiento que tendran el motor (T8) y los
  planos de profundidad (T9).
  Consecuencia para el resto del plan: los pasos de captura de T15, T16, T17, T18 y T19 los
  ejecuto yo tras cada objeto, no el usuario. El encuadre se lo enseno para que lo apruebe.

=== CIERRE DE SESION 2026-09-08 — TRASPASO ===
Task 11: implementador a73e21dff4c4f5ee1 (sonnet) -> DONE_WITH_CONCERNS, commit 9253eea.
  146 tests: 145 verdes y 1 rojo DELIBERADO (el poster de la home, que produce el paso manual).
  Encontro DOS defectos del plan por su cuenta, y los dos son buenos hallazgos:
  (a) el aserto `toContain('await import(')` no puede pasar nunca: el brief carga el motor
      dentro de `await Promise.all([import(...)])`, donde esa subcadena no aparece. Lo
      sustituyo por las dos piezas reales.
  (b) el brief REINTRODUCIA el doble montaje de la T6 —`if (document.readyState !== 'loading')`
      junto al listener de astro:page-load—. Lo comparo con Reveal.astro y SmoothScroll.astro,
      vio que alli ya se habia resuelto con un solo mecanismo, y lo quito.
Task 11: PENDIENTE de: (1) capturar el poster, (2) ejecutar el Paso 5b, (3) REVISION. Es la
  unica tarea del proyecto que no ha pasado por revision.
Task 11: Ruling sobre (b): el defecto estaba TRES veces en el plan —T11, T13 y T19—, no una.
  Corregidas las tres antes de que T13 y T19 lo repitieran. Corregido tambien el aserto de
  (a). Plan commiteado en el acto.
  Coste si me equivoco: ninguno; el codigo de las tres queda igual que Reveal y SmoothScroll,
  que llevan funcionando desde la T6.

Ledger, informes y briefs FORZADOS al repositorio con `git add -f` (commit af41cfd). El
  workspace vivia bajo `.superpowers/sdd/.gitignore` con `*`, asi que todo este registro
  estaba solo en la maquina local. Para un traspaso es lo peor que se puede perder: el codigo
  se lee, pero por que se decidio cada cosa solo esta aqui.
  AVISO para quien siga: los archivos NUEVOS de este directorio no se anaden solos. `git add -f`.

Traspaso escrito en CLAUDE.md (seccion «Estado actual») y en docs/PENDIENTE.md, este ultimo
  con once bloques redactados para abrirse como issues tal cual. No se abrieron desde la
  sesion: `gh` sin autenticar y el MCP de GitHub caido (400, Authorization header is badly
  formatted). Se suplio con la API publica, que sirve para leer pero no para escribir.

VERIFICACION EN NAVEGADOR (Paso 5b de la T11), ejecutada parcialmente al cierre.
El sistema 3D ARRANCA Y RENDERIZA. Primera evidencia visual de que el motor (T8), los
  materiales y las luces (T9) y el microfono (T10) funcionan de verdad: se ven la jaula
  instanciada, el cuerpo, la tapa esferica y el anillo emisivo en el acento #FF2D2D.
  Eso cierra en positivo la duda de fondo que arrastraban la T8 y la T9, cuyos tests solo
  comprueban la forma del codigo.

DOS HALLAZGOS DE DISENO, no de codigo, que necesitan decision del cliente:
  H1. La escena esta MUY oscura. El cuerpo del microfono apenas se separa del fondo #080808;
      lo unico que se lee con claridad es el anillo rojo. Como poster —que es el elemento LCP
      de la portada y lo primero que ve un visitante— hoy seria casi un rectangulo negro.
      Candidatos a revisar, por orden: la intensidad de las tres luces de luces.ts, el
      roughness/metalness de metalOscuro(), y si hace falta una luz de contorno que separe la
      silueta del fondo. NO se toca sin decidirlo: el diseno pide penumbra deliberadamente.
  H2. El objeto desborda el encuadre por abajo en la herramienta de posters, y el scroll de
      la pagina no lo corrige de forma perceptible. Contradice el calculo que hice sobre la
      espiral —42% del cuadro en t=0, 68% en t=1—, asi que la herramienta probablemente no
      esta mapeando el progreso de scroll al mismo rango que usara la isla real, o el canvas
      a pantalla completa cambia el aspecto respecto al que asumi. Hay que mirarlo antes de
      capturar los seis posters, o los seis saldran mal encuadrados.
  H3. En la herramienta no se ven los planos de profundidad. Puede ser correcto —quiza solo
      los monta la isla Escena3D y no /dev/posters— pero hay que confirmarlo, porque si la
      isla tampoco los muestra estariamos ante el fallo silencioso del punto 4 del Paso 5b.

POSTER NO CAPTURADO. La descarga del boton no llego a disco. No se forzo por otra via, y la
  razon principal no es tecnica: con H1 y H2 sin resolver, el poster que saldria hoy seria
  malo, y es la imagen mas visible del sitio. Un LCP feo capturado por prisa es peor que un
  hueco documentado.
CONSECUENCIA: el test del poster sigue en rojo y `npm test` forma parte del workflow, asi que
  el CI queda EN ROJO y el preview no se actualiza. Lo publicado hoy —la pagina 404— sigue en
  linea y no se ve afectado, porque corresponde a un despliegue anterior que si fue verde.
