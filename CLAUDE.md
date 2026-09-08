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

## Estado actual — 2026-09-08 (cierre de sesión, traspaso)

**12 de 23 tareas cerradas y revisadas. La 13 está implementada pero sin revisar.**
**Rama de trabajo `feat/sitio-3d`, mergeada a `main` tras cada tarea.**

> **Este repositorio es autosuficiente.** Todo lo necesario para retomar está aquí dentro,
> incluido el registro de decisiones. No queda material en ninguna máquina local.

### Lo primero que tienes que leer

| Orden | Qué | Dónde |
|---|---|---|
| 1 | **El ledger.** Cada tarea, cada hallazgo y cada decisión con su justificación y su coste si resulta equivocada | `.superpowers/sdd/2026-09-07-safetory-sitio-3d/progress.md` |
| 2 | El diseño aprobado (autoridad vinculante) | `docs/superpowers/specs/2026-09-07-safetory-sitio-3d-design.md` |
| 3 | El plan: 23 tareas con el código completo | `docs/superpowers/plans/2026-09-07-safetory-sitio-3d.md` |
| 4 | Errores ya cometidos y cómo se resolvieron | `docs/errors-learned.md` |
| 5 | Trabajo pendiente, priorizado | `docs/PENDIENTE.md` |

**Si tu contexto y el ledger discrepan, manda el ledger y `git log`.**

### Cómo se está construyendo esto

Con la skill **`superpowers:subagent-driven-development`**: un subagente implementador por
tarea, una revisión después de cada una, y rondas de arreglo hasta que la revisión queda
limpia. **Retoma exactamente ese flujo.**

Los briefs se extraen con `bash .superpowers/sdd/2026-09-07-safetory-sitio-3d/brief.sh <N>`.
El `scripts/task-brief` de la skill **no funciona aquí**: busca cabeceras «Task N» en inglés
y este plan las tiene en español.

**Aviso sobre ese directorio:** hereda un `.gitignore` con `*`. Los archivos nuevos que
generes ahí **no se añaden solos** — hace falta `git add -f`.

### Orden de ejecución (reordenado, no es el numérico)

```
T1  ✓ andamiaje Astro, tokens phi, tests de contraste
T2  ✓ Clash Display y Satoshi auto-hospedadas
T3  ✓ capa de datos con el contenido real
T4  ✓ BaseLayout, SEO, LocalBusiness, skip link
T5  ✓ Nav, Footer, Bloque, PrecioCard
T23 ✓ ruta base por entorno + preview no indexable
T6  ✓ Lenis, ScrollTrigger, repertorio sobrio
T21 ✓ Netlify + workflow de preview + pagina 404
T7  ✓ espiral aurea (matematica pura)
T8  ✓ motor de render, deteccion de entorno, limpieza
T9  ✓ materiales, luces, planos de profundidad
T10 ✓ presupuesto de escena + objeto microfono
T11 ⟳ isla Escena3D + /dev/posters  — IMPLEMENTADA, SIN REVISAR, 1 test en rojo
────────────────────────────────────────────────────  ← AQUI ESTAMOS
T12   home: hero, manifiesto, equipo, cierre          ← la primera pagina visible
T13   el despiece del microfono (momento orquestado)
T14   los cuatro territorios de la home
T15   monitores + /estudio
T16   ciclorama + /ciclorama
T17   interfaz de audio + /produccion
T18   plato + /membresia
T19   rotulo + /contacto
T20   menu movil + transiciones entre escenas
T22   las cuatro pasadas de calidad
```

### Por dónde seguir, exactamente

**La T11 quedó a medias a propósito, y su test en rojo es conocido.** Está implementada y
commiteada (`9253eea`), pero le faltan tres cosas, en este orden:

1. **Capturar el póster de la Home.** `npm run dev` → `http://localhost:4321/dev/posters` →
   objeto `microfono` → encuadrar con la rueda → **Capturar WebP** → mover el archivo a
   `public/posters/home.webp`. Debe pesar menos de 60 KB.
   Mientras no exista, **el test «el póster de la home existe y pesa menos de 60 KB» está en
   rojo**, y es el único: 145 de 146 en verde. Es un rojo deliberado y documentado.
   **No lo pongas en verde con un archivo falso**: ese WebP es el elemento LCP de la portada.
2. **Ejecutar el Paso 5b del brief de la T11**, la lista de verificación en navegador. No es
   opcional (ver abajo, «Lo que ningún test cubre»).
3. **Revisar la tarea.** Nunca pasó por revisión: es la única del proyecto en ese estado.

Decisión del cliente ya tomada: **los seis pósters los captura el agente**, no él. Afecta
también a T15, T16, T17, T18 y T19, cada una con su captura.

### Lo que ningún test cubre — léelo antes de tocar el 3D

`motor.ts` (T8) y `planos-profundidad.ts` (T9) **no se pueden ejecutar en Node**: necesitan
DOM, WebGL, `ResizeObserver` e `IntersectionObserver`. Se decidió no montar un andamiaje de
mocks —verificaría el mock, no el motor— a cambio de comprobarlos en un navegador real. Esa
comprobación es el **Paso 5b de la T11** y es el único punto del proyecto donde se verifica
que ese código funciona.

Todos sus modos de fallo son **silenciosos**: una escena que se congela al volver de otra
pestaña, unos planos de profundidad en negro porque una textura no resolvió. Ni excepción,
ni test en rojo, ni nada en consola.

### La lección que más caro ha salido

Seis rondas de arreglo, todas por la misma causa: **un aserto que pasa por una razón distinta
de la que dice vigilar.** Los casos reales de este proyecto:

1. `'dispose()'` era subcadena de `'geometry.dispose()'` en su propia lista de asertos.
2. `'bucleActivo = true'` aparecía tres veces en el archivo: el aserto pasaba aunque se
   borrara entero el trozo que vigilaba.
3. Un aserto sobre el texto del archivo donde cabía uno sobre el comportamiento.
4. Un mock que devolvía siempre la misma instancia, y confundía dos escrituras en una.
5. Un aserto sobre `.type` que la propia Three.js no usa — y que arrastró al implementador a
   escribir `jaula.type = 'InstancedMesh'` en el **código de producción** para que pasara.

De ahí salen dos reglas que **debes aplicar a cada test que escribas**:

- **¿Fallaría este aserto si borro justo lo que dice vigilar?** Si no es un sí claro,
  reescríbelo. Compruébalo con una **prueba de mutación desechable**: rompe a mano lo que el
  test protege, mira que se ponga rojo, deshaz con `git checkout --`. Cuesta dos comandos.
- **Si un aserto solo pasa cuando retocas el objeto que estás probando, el defecto está en el
  aserto**, no en el objeto.

### Defectos del plan encontrados y corregidos — el escaneo previo vale la pena

Cuatro correcciones, y **todas salvo una estaban duplicadas en más de una tarea**. Todas
habrían fallado solo en el sitio publicado, nunca en desarrollo:

| Dónde | Qué | Commit |
|---|---|---|
| T11 | `src={poster}` y `fondos` sin `ruta()`: 404 en el elemento LCP y texturas en negro | `9535d9d` |
| T14, T19 | `href={href}` de los cuatro territorios y `src` del mapa sin `ruta()`: la navegación primaria de la portada apuntaba fuera del sitio | `38d45bb` |
| T10, T17 | Aserto sobre `.type` que obliga a mutar el objeto de producción | `ae62628` |
| T11, T13, T19 | El doble montaje por `document.readyState`, ya corregido en T6, seguía escrito en el plan tres veces | ver `git log docs/` |

**Antes de cada tarea, escanea su brief buscando estos patrones.** Es más barato que
descubrirlos en revisión.

### Despliegue

| | Producción | Preview |
|---|---|---|
| Netlify, raíz del dominio | `netlify.toml` | — |
| GitHub Pages vía Actions | — | `abrinay1997-stack.github.io/Safetory` |

**Verde y publicando.** Lo único visible hoy es la página 404, en
`https://abrinay1997-stack.github.io/Safetory/404.html`. La raíz devuelve ese mismo contenido
con estado 404, que es lo correcto de Pages mientras no exista `index` (llega en la T12).

El preview se construye con `BASE_PATH=/Safetory` y `PUBLIC_PREVIEW=true`, que lo marca
`noindex` para que no compita con producción en Google.

**El entorno `github-pages` solo permite desplegar desde la rama por defecto.** Hay que
mergear a `main` tras cada tarea, no solo al final.

### Trampas ya pisadas — no vuelvas a caer

1. **`npm ci` falla en CI aunque funcione en local.** El lockfile lo escribe npm 11 y Node 22
   trae npm 10; npm 11 poda dos dependencias transitivas de `sharp` que npm 10 espera. El
   workflow fija `npm install -g npm@11` antes de `npm ci`.
2. **Un aserto sobre el texto de un `.astro` solo puede prohibir** (que no aparezca `vh`,
   `href="#"`, una marca) **o comprobar que se consume un dato** (`site.direccion`). Nunca
   puede afirmar cómo queda el marcado: eso es de la suite que lee `dist/*.html` en la T22.
3. **`ScrollTrigger.getAll()` devuelve los de toda la aplicación.** `motion.ts` lleva su
   propio registro y solo mata los suyos, y limpia únicamente en `astro:before-swap`.
4. **`astro:page-load` se dispara también en la carga inicial**, enganchado al evento nativo
   `load`. Un segundo arranque con `readyState` monta el sistema dos veces.
5. **Commitea cada corrección del plan en el acto.** Una edición se perdió del árbol de
   trabajo mientras corría un subagente.
6. **En Git Bash, `BASE_PATH=/Safetory` se reescribe a una ruta de Windows.** Usa
   `MSYS_NO_PATHCONV=1` al reproducir el build de preview a mano.
7. **Las APIs de Three.js prefieren no molestar.** `getObjectByName` devuelve `undefined` en
   vez de lanzar, `TextureLoader` no avisa si el archivo no está, `Material.dispose()` no
   libera las texturas asociadas. Cada error de tipeo se convierte en un bug invisible.

### Lo que necesita el cliente, no el código

Ver `docs/PENDIENTE.md`, sección «Bloqueado por el cliente». En resumen: precio y condiciones
de la membresía, marcas y modelos del equipo por escrito, texto de marca, y qué incluye el
co-working. **Ninguno de esos huecos se rellena por cuenta propia** (regla 1).
