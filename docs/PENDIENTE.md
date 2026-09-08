# Trabajo pendiente — Safetory Studio

> Cierre de sesión: **2026-09-08**. Estado: 12 de 23 tareas cerradas, la T11 implementada
> sin revisar. Contexto completo en `CLAUDE.md`, sección «Estado actual».
>
> Cada bloque de este documento está redactado para poder abrirse como issue de GitHub tal
> cual. No se abrieron desde la sesión porque `gh` no estaba autenticado y el servidor MCP de
> GitHub falló al conectar (`400 — Authorization header is badly formatted`).

---

## Bloqueado por el cliente

Estos huecos **no se rellenan por cuenta propia**: la regla 1 del proyecto prohíbe inventar
contenido, y publicar un dato equivocado en la web de un estudio de grabación destruye la
credibilidad ante un profesional. Cada uno bloquea una parte concreta del sitio.

### 1. Precio y condiciones de la membresía
**Bloquea:** la ruta `/membresia` (T18).
**Estado hoy:** la página se construirá sin cifra. `src/data/membresia.ts` lista los bloques
incluidos, pero no hay precio ni condiciones.
**Qué hace falta:** precio, periodicidad, qué incluye y qué no, y condiciones de baja.

### 2. Marcas y modelos del equipo técnico, por escrito
**Bloquea:** el bloque de equipo de la home (T12) y `/estudio` (T15).
**Estado hoy:** se publica la lista genérica de `src/data/equipo.ts` («micrófono de
condensador», «monitores de campo cercano»…), sin marcas.
**Por qué por escrito:** identificar mal un equipo ante un ingeniero de sonido cuesta la
credibilidad del estudio entero. Regla explícita del proyecto: nunca publicar marcas ni
modelos sin confirmación escrita.

### 3. Texto de marca / historia del estudio
**Bloquea:** el bloque «manifiesto» de la home (T12).
**Estado hoy:** el manifiesto usa únicamente el eslogan real, *«Donde la innovación se
encuentra con la perfección»*. No hay historia, ni años de trayectoria, ni cifras.
**Qué hace falta:** dos o tres párrafos sobre qué es Safetory y por qué existe.

### 4. Qué incluye el co-working
**Bloquea:** su mención en cualquier ruta.
**Estado hoy:** **no se menciona en el sitio**, porque no se sabe qué incluye.

### 5. Proyectos publicables (opcional)
**Desbloquearía:** una ruta `/trabajos`, que hoy no existe en el plan.
**Qué hace falta:** trabajos que el estudio pueda mostrar, con permiso de sus dueños.

---

## Trabajo de código, en orden

### 6. Terminar la T11 — isla Escena3D
**Estado:** implementada y commiteada (`9253eea`), **sin revisar**, con **1 test en rojo
deliberado** de 146.

Tres pasos, en este orden:

1. **Capturar el póster de la Home.**
   ```bash
   npm run dev
   ```
   → `http://localhost:4321/dev/posters` → objeto `microfono` → encuadrar con la rueda →
   **Capturar WebP** → mover el archivo descargado a `public/posters/home.webp`.
   Debe pesar **menos de 60 KB**; si se pasa, bajar la calidad en
   `toDataURL('image/webp', 0.72)`.

   El test rojo es `poster de la home > existe y pesa menos de 60 KB`. **No se pone en verde
   con un archivo falso:** ese WebP es el elemento LCP de la portada, y un placeholder ahí
   significa publicar basura en la pieza más visible del sitio con el test diciendo que todo
   va bien.

2. **Ejecutar el Paso 5b** del brief de la T11 (lista de verificación en navegador). Ver el
   issue 7.

3. **Revisar la tarea** con el flujo habitual: `review-package` + revisor + rondas de arreglo.
   Es la única tarea del proyecto que nunca pasó por revisión.

### 6b. CI EN ROJO — el preview no se actualiza

**Estado:** el workflow `Preview` ejecuta `npm test`, y el test del póster de la home está en
rojo, así que **el CI falla y GitHub Pages no publica nada nuevo**.

Lo publicado hoy —la página 404, en `https://abrinay1997-stack.github.io/Safetory/404.html`—
**sigue en línea y no está afectado**: corresponde a un despliegue anterior que sí fue verde.

**Se arregla capturando el póster (issue 6).** No hay nada que reparar en el workflow.
No lo resuelvas marcando el test como `skip`: el test es correcto, lo que falta es el archivo.

### 6c. La escena 3D está demasiado oscura — decisión de diseño

Verificado en navegador el 2026-09-08: **el sistema 3D arranca y renderiza correctamente**.
Se ven la jaula instanciada, el cuerpo, la tapa esférica y el anillo emisivo en `#FF2D2D`.
Eso cierra en positivo la duda que arrastraban la T8 y la T9, cuyos tests solo comprueban la
forma del código.

**Pero el cuerpo del micrófono apenas se separa del fondo `#080808`.** Lo único que se lee con
claridad es el anillo rojo. Como póster —el elemento LCP de la portada, lo primero que ve un
visitante— hoy sería casi un rectángulo negro.

**No se toca sin decidirlo:** el diseño pide penumbra deliberadamente, y subir las luces por
cuenta propia sería cambiar el carácter visual del sitio. Candidatos a revisar, por orden:
intensidad de las tres luces de `luces.ts`; `roughness` / `metalness` de `metalOscuro()`; y si
hace falta una luz de contorno que separe la silueta del fondo.

**Decide esto antes de capturar los seis pósters**, o habrá que repetirlos.

### 6d. El encuadre desborda en la herramienta de pósters

El objeto se sale por abajo, y el scroll de la página no lo corrige de forma perceptible.
Contradice el cálculo hecho sobre la espiral (el micrófono debería ocupar el 42 % del cuadro
en `t=0` y el 68 % en `t=1`, sin clipping).

**Hipótesis a comprobar:** que `/dev/posters` no mapee el progreso de scroll al mismo rango
que usará la isla real, o que el canvas a pantalla completa cambie la relación de aspecto
respecto a la asumida.

Relacionado: **en la herramienta no se ven los planos de profundidad.** Puede ser correcto
—quizá solo los monta `Escena3D.astro` y no `/dev/posters`— pero hay que confirmarlo: si la
isla real tampoco los mostrara, estaríamos ante el fallo silencioso del punto 4 del Paso 5b.

### 7. Verificación en navegador del sistema 3D
**Es el único punto del proyecto donde se comprueba que el motor 3D funciona.**

`motor.ts` (T8) y `planos-profundidad.ts` (T9) no se pueden ejecutar en Node: necesitan DOM,
WebGL, `ResizeObserver` e `IntersectionObserver`. Se decidió no montar un andamiaje de mocks
—verificaría el mock, no el motor— a cambio de comprobarlo en un navegador real.

La lista está en el **Paso 5b** del brief de la T11. Los seis puntos:

1. La escena se ve y la cámara se acerca girando al hacer scroll.
2. Salir del viewport y volver: la escena **sigue animándose**.
3. Ocultar la pestaña y volver: sigue viva. *Camino distinto del anterior* — lo re-arranca
   `visibilitychange`, y una escena puede sobrevivir al punto 2 y morir en este.
4. Los planos de profundidad se ven, tenues, detrás del objeto. En negro = ruta de textura
   rota o `SRGBColorSpace` perdido.
5. El cruce póster → canvas no produce salto (CLS ≤ 0,02).
6. Con `prefers-reduced-motion` activo: se queda en el póster **y no descarga Three.js**.

**Los cuatro primeros fallan en silencio si están rotos.** Ni excepción, ni test rojo, ni nada
en consola.

### 8. Seguir el plan: T12 → T22
Orden y estado en `CLAUDE.md`. La **T12 (home)** es la primera página visible del sitio: hasta
que exista, lo único publicado es la página 404.

Las capturas de póster de **T15, T16, T17, T18 y T19** las hace el agente (decisión del
cliente del 2026-09-08), no el cliente.

### 9. Menores aplazados, para la T22
Recogidos del ledger. Ninguno bloquea nada:

- **T4:** el JSON-LD reconstruye a mano `streetAddress` / `addressLocality` / `addressRegion`
  en vez de derivarlos de `site.direccion`. Hoy coinciden, pero pueden divergir.
- **T4:** el test de `aggregateRating` hace *matching* de texto libre sobre todo el archivo en
  vez de sobre el JSON-LD; obligó a reescribir un comentario inocente.
- **T8:** sin `try/catch` alrededor de `new THREE.WebGLRenderer()`. Si la creación fallara
  pese a pasar la detección de capacidades, la excepción no se contendría.
- **T9:** `blancoDifuso()` usa `0xe9e6df`, cercano pero no idéntico a `--bone` `#EDEAE3`. Es
  color de material 3D, no token de interfaz — no es violación de G9, pero conviene saberlo.
- **T9:** el test «no hay entorno HDRI» solo impide reintroducir las cadenas
  `RGBELoader`/`PMREMGenerator`, no un HDRI por otra vía.
- **T22:** el test «three viaja en su propio chunk» filtra los assets por
  `f.includes('BaseLayout') || f.includes('client')`. Si los nombres de chunk de Astro 7 no
  contienen esas cadenas, el filtro devuelve vacío y **el test pasa sin comprobar nada**.
  Revisar con los nombres reales de `dist/_astro`.
- **T7:** el test «nunca devuelve NaN» ya no dice qué configuración prueba, porque llama sin
  opciones. Es cobertura extra, pero el nombre engaña.

---

## Infraestructura

### 10. El servidor MCP de GitHub no conecta
**Error:** `400 — Authorization header is badly formatted`, al arrancar la sesión.
**Efecto:** no se pueden crear issues ni consultar Actions desde el agente. Durante la sesión
se suplió con la API pública de GitHub (el repositorio es público), que basta para leer pero
no para escribir.
**Arreglo:** revisar el token en la configuración del plugin, o autenticar `gh auth login`.

### 11. El workspace de la skill vive bajo un `.gitignore` con `*`
`.superpowers/sdd/.gitignore` contiene `*`, así que **nada de ese directorio se añade solo**.
El ledger, los informes y los briefs se forzaron al repositorio con `git add -f` (commit
`af41cfd`) porque son el registro de decisiones del proyecto.

**Al añadir archivos nuevos ahí, usa `git add -f`** o se quedarán fuera sin avisar.
