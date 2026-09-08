# Tarea 21 — Informe de implementación

## Qué se creó

- `tests/despliegue.test.ts` — 14 tests (contenido exacto del brief).
- `netlify.toml` — build de producción, cero `BASE_PATH`, bloqueo de `/dev/*`, cacheo
  inmutable de `/fonts/*` y `/posters/*`, cabeceras de seguridad. **Una desviación del
  texto literal del brief**: el comentario original decía "sin BASE_PATH", lo que contiene
  la propia subcadena que el test `no fija BASE_PATH` prohíbe (`not.toContain('BASE_PATH')`).
  Es una contradicción del propio brief entre el Paso 1 (test) y el Paso 3 (código) — se
  reescribió el comentario a "sin ruta base fijada", mismo significado, sin la subcadena
  literal.
- `.github/workflows/preview.yml` — contenido exacto del brief: construye con
  `BASE_PATH=/Safetory` y `PUBLIC_PREVIEW=true`, corre `npm test` antes de publicar, usa
  `actions/upload-pages-artifact@v4` + `actions/deploy-pages@v4`, permisos mínimos
  (`contents: read`, `pages: write`, `id-token: write`), Node 22 con caché npm.
- `src/pages/404.astro` — un solo `<h1 data-titular>`, `noindex` vía prop de `BaseLayout`,
  enlace de vuelta al inicio con `href={ruta('/')}` (nunca `href="/"` literal). **Una
  adición sobre el código literal del Paso 5**: envolví el contenido de `.perdido` en
  `<Reveal>` (import añadido). Motivo: el script de `Reveal.astro` que procesa
  `[data-titular]` solo se incluye en el bundle de una página si el componente `<Reveal>`
  se renderiza en ella; sin esa envoltura el atributo `data-titular` del código literal del
  brief queda inerte. Esto cumple la resolución de ambigüedades del encargo ("marca el
  titular con `data-titular` para que `Reveal` lo anime"). Verificado en el build de
  preview: `Reveal.astro_astro_type_script_index_0_lang.*.js` aparece entre los `<script>`
  de `dist/404.html`. Ningún test del archivo depende de esta envoltura; los 14 tests
  pasan con o sin ella.
- `README.md` — contenido exacto del brief (comandos, tabla de destinos, reproducción
  local del preview, documentación, herramienta interna, pendientes de cliente).

## Nota sobre el brief truncado

El `task-21-brief.md` entregado se cortaba a mitad del README (línea 413, dentro del primer
párrafo). Regeneré el contenido completo de la Tarea 21 leyendo directamente
`docs/superpowers/plans/2026-09-07-safetory-sitio-3d.md` (líneas 5392–5770), que es la
fuente de la que `brief.sh` extrae los briefs por tarea. De ahí salió el mensaje de commit
exacto y el resto de Paso 6 en adelante.

También noto que el Paso 7 del brief dice "Esperado: 15 tests en el archivo nuevo"; el
archivo, contado literalmente desde el bloque de código del propio Paso 1, tiene 14 `it(...)`
(5 + 3 + 6). No cambié nada al respecto — es un desajuste de conteo en el texto del brief,
no en el código que especifica.

## Salida de `npx vitest run tests/despliegue.test.ts` (verde, tras el fix del comentario)

```
 RUN  v5.0.0 C:/Users/MIPC/Desktop/DESARROLLOS/SAFETORY

 Test Files  1 passed (1)
      Tests  14 passed (14)
   Start at  02:06:06
   Duration  345ms (transform 46%, import 28%, tests 17%, worker 9%)
```

(Previamente, en rojo tras el Paso 1: 14/14 tests fallando con
`ENOENT: no such file or directory, open '...\netlify.toml'` / `...\preview.yml` /
`...\404.astro`, como se esperaba.)

## Salida de `npm test` (suite completa)

```
> safetory@1.0.0 test
> vitest run

 RUN  v5.0.0 C:/Users/MIPC/Desktop/DESARROLLOS/SAFETORY

 Test Files  8 passed (8)
      Tests  95 passed (95)
   Start at  02:06:20
   Duration  1.22s (transform 62%, import 24%, tests 8%, worker 6%)
```

81 tests previos + 14 nuevos = 95. Todo en verde.

## Salida de `npm run build` (producción)

```
> safetory@1.0.0 build
> astro build

[build] output: "static"
[build] mode: "static"
[build] directory: C:\Users\MIPC\Desktop\DESARROLLOS\SAFETORY\dist\

 generating static routes 
  ├─ /404.html (+33ms)
[build] Completed in 68ms.
[build] Completed in 720ms.
[WARN] [@astrojs/sitemap] No pages found!
`sitemap-index.xml` not created.
[build] 1 page(s) built in 1.02s
[build] Complete!
```

Emite exactamente **1 página** (`dist/404.html`), como se esperaba. El warning de sitemap
es comportamiento normal de `@astrojs/sitemap`: excluye siempre `404`/`500` de cualquier
sitemap, y `404` es hoy la única ruta del sitio — se resolverá solo cuando existan páginas
de contenido real (Tareas 12+). No es un fallo de esta tarea.

## Salida del build de preview

Comando ejecutado (con `MSYS_NO_PATHCONV=1` — ver nota abajo):

```bash
MSYS_NO_PATHCONV=1 BASE_PATH=/Safetory PUBLIC_PREVIEW=true npm run build
```

```
[build] output: "static"
 generating static routes 
  ├─ /404.html (+30ms)
[WARN] [@astrojs/sitemap] No pages found!
[build] 1 page(s) built in 1.01s
[build] Complete!
```

**Nota sobre el entorno:** la primera vez que ejecuté el comando tal cual lo da el brief
(`BASE_PATH=/Safetory PUBLIC_PREVIEW=true npm run build`) en Git Bash sobre Windows, MSYS
reescribió automáticamente `/Safetory` a una ruta de sistema de archivos
(`/C:/Program Files/Git/Safetory`) antes de que Node la viera — un artefacto conocido de
Git Bash con cualquier argumento que empiece por `/`, no un bug del código. Repetí el
comando con `MSYS_NO_PATHCONV=1` y el resultado fue correcto. Documento esto porque quien
reproduzca el Paso 7 en Windows con Git Bash se topará con lo mismo.

### Comprobaciones del preview (`grep`)

```
$ grep -c '/Safetory/_astro/' dist/404.html
2
$ grep -c noindex dist/404.html
1
```

Y para confirmar visualmente el prefijo en todos los enlaces internos:

```
href="https://safetory.netlify.app/Safetory/404"      (canónica)
href="/Safetory/fonts/ClashDisplay-Semibold.woff2"     (preload de fuente)
href="/Safetory/fonts/Satoshi-Regular.woff2"
href="/Safetory/_astro/404.BZ8jUJv4.css"
href="/Safetory"                                       (Nav marca + boton "Volver al inicio")
href="/Safetory/estudio" ... /ciclorama /produccion /membresia /contacto
```

`<meta name="robots" content="noindex, nofollow">` presente.

Tras verificar el preview, reconstruí en modo producción (`rm -rf dist && npm run build`)
para dejar `dist/` en el estado final esperado por el contrato — confirmé además que
`dist/404.html` de producción no contiene ninguna ocurrencia de `/Safetory`
(`grep -c '/Safetory' dist/404.html` → `0`).

## Commit y push

```
git add netlify.toml .github/workflows/preview.yml README.md src/pages/404.astro tests/despliegue.test.ts
git commit -m "feat(S10): Netlify en produccion, preview en GitHub Pages y pagina 404"
git push
```

- Commit: `d31f890` sobre `feat/sitio-3d`
- `git status --short` antes de `git add` mostraba exactamente los 5 elementos nuevos de
  esta tarea (`.github/`, `README.md`, `netlify.toml`, `src/pages/`, `tests/despliegue.test.ts`)
  y nada más — no había cambios sin relación que arrastrar.
- Push: `f529a73..d31f890  feat/sitio-3d -> feat/sitio-3d` — confirmado en remoto.

## Pendiente para el humano (Paso 9, fuera del alcance de este agente)

Activar los dos destinos manualmente:
- **GitHub Pages**: *Settings → Pages* → Source: **GitHub Actions**.
- **Netlify**: *Add new site → Import from Git* → `abrinay1997-stack/Safetory`. Netlify lee
  `netlify.toml` sin configuración adicional. Verificar que el deploy de `main` sale verde
  y que `/dev/posters` devuelve 404 en la URL pública una vez activo.

## Preocupaciones

1. **Comentario de `netlify.toml` reescrito** (ver arriba) — cambio mínimo, cosmético,
   necesario para que el propio test del brief pasara.
2. **`<Reveal>` añadido en `404.astro`** (ver arriba) — no lo pide el código literal del
   Paso 5, pero sin él el `data-titular` del `<h1>` no se anima nunca en esa página. Lo
   marco explícitamente para que se revise si es la interpretación correcta.
3. Ninguna otra desviación del brief. No se tocaron `astro.config.mjs`, `public/.nojekyll`
   ni `public/robots.txt`, tal como exigía el contrato.

---

## Ronda de arreglo 1 — `npm ci` falla en CI: lockfile de npm 11, runner con npm 10

**Diagnóstico recibido del coordinador:** el workflow fallaba en el paso `npm ci` porque
`package-lock.json` lo escribió npm 11 (el del entorno de desarrollo) y
`actions/setup-node` con `node-version: '22'` instala Node 22 con npm 10 de serie. npm 11
poda dos dependencias transitivas de `sharp` (`@emnapi/core`, `@emnapi/wasi-threads`) que
npm 10 sigue esperando encontrar en el lockfile, y `npm ci` aborta con
`Missing: ... from lock file`.

### Cambios aplicados

- **`.github/workflows/preview.yml`** — entre `actions/setup-node` y `npm ci` se añadieron
  dos pasos: `Fijar la version de npm` (`npm install -g npm@11`) y
  `Diagnostico del entorno` (`node -v && npm -v && uname -sm`). `npm ci` quedó igual,
  después de ambos.
- **`package.json`** — se añadió `"engines": { "node": ">=22.12.0", "npm": ">=11" }` entre
  `"license"` y `"scripts"`. No se tocó nada más del archivo y no se ejecutó
  `npm install`: `package-lock.json` sigue exactamente igual (`git diff --stat
  package-lock.json` no produce salida).
- **`tests/despliegue.test.ts`** — dos tests nuevos dentro de
  `describe('workflow de preview')`: uno comprueba que `npm install -g npm@11` aparece antes
  que `npm ci`, otro que queda rastro de `node -v && npm -v`.

### Contratiempo encontrado y corregido en el propio ciclo

El primer intento de comentario explicativo sobre el paso `Fijar la version de npm` decía
"...y `npm ci` aborta" — la subcadena literal `npm ci` aparecía dentro del comentario,
**antes** en el archivo que la propia línea `npm install -g npm@11`. El test
`indexOf('npm install -g npm@11') < indexOf('npm ci')` comparaba contra esa primera
aparición (dentro del comentario) y fallaba: `809` no es menor que `704`. Es la misma clase
de error que el comentario de `netlify.toml` en la implementación original de esta tarea
(la subcadena que el test prohíbe/ordena aparece también en la prosa explicativa). Se
reescribió el comentario para no contener la subcadena `npm ci` literal, conservando el
mismo significado.

### `npm test` (suite completa, en verde)

```
> safetory@1.0.0 test
> vitest run

 RUN  v5.0.0 C:/Users/MIPC/Desktop/DESARROLLOS/SAFETORY

 Test Files  8 passed (8)
      Tests  97 passed (97)
   Start at  02:18:59
   Duration  1.36s (transform 57%, import 28%, tests 9%, worker 6%)
```

95 tests previos + 2 nuevos = 97. Todo en verde.

### Verificación real del arreglo, fuera del repositorio

Copié `package.json` y `package-lock.json` (sin tocar) a una carpeta temporal fuera del
repo (`%TEMP%/safetory-npm-check`, borrada al terminar) y reproduje ambos escenarios:

**Con npm 10 — reproduce el fallo original, confirma el diagnóstico:**

```
$ npx -y npm@10 ci
npm warn EBADENGINE Unsupported engine {
npm warn EBADENGINE   package: 'safetory@1.0.0',
npm warn EBADENGINE   required: { node: '>=22.12.0', npm: '>=11' },
npm warn EBADENGINE   current: { node: 'v22.19.0', npm: '10.9.9' }
npm warn EBADENGINE }
npm error code EUSAGE
npm error
npm error `npm ci` can only install packages when your package.json and package-lock.json or npm-shrinkwrap.json are in sync. Please update your lock file with `npm install` before continuing.
npm error
npm error Missing: @emnapi/core@1.11.3 from lock file
npm error Missing: @emnapi/wasi-threads@1.2.3 from lock file
...
EXIT_CODE=1
```

Nótese que el propio `engines` recién añadido ya dispara el aviso `EBADENGINE` con npm 10 —
efecto colateral esperado y correcto: documenta el requisito para quien lo lea.

**Con npm 11 — el mismo lockfile, sin tocar, instala limpio:**

```
$ rm -rf node_modules && npx -y npm@11 ci
added 317 packages, and audited 318 packages in 14s

109 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
EXIT_CODE=0
```

Confirma el diagnóstico del coordinador: el lockfile es válido para npm 11 e inválido para
npm 10, y fijar `npm install -g npm@11` en el runner antes de `npm ci` es la corrección
correcta.

### Commit y push de la ronda de arreglo

```
git add .github/workflows/preview.yml package.json tests/despliegue.test.ts
git commit -m "fix(S10): fijar npm 11 en CI para que npm ci lea el lockfile"
git push
```

`CLAUDE.md` aparecía modificado en el árbol de trabajo al llegar a esta ronda (actualización
externa del ledger del proyecto, ya con la lección de npm 11 incorporada en «Trampas ya
pisadas») pero no es parte de esta ronda de arreglo — se dejó sin *stage* y sin commitear,
tal como exige la regla de mínima superficie de cambio: solo se commitean los tres archivos
que esta ronda tocó.

---

## Ronda de arreglo 2 — concurrencia global, `publicar` corriendo en ramas que no pueden
## publicar, y `npm ci` sigue fallando sin visibilidad de logs

**Estado real reportado por el coordinador tras la ronda 1:**

```
feat/sitio-3d  880f524  failure    -> npm ci fallo, PESE a fijar npm@11
main           7133e6a  cancelled  -> lo cancelo el run de la otra rama
feat/sitio-3d  7133e6a  failure    -> npm ci fallo otra vez
```

Tres problemas distintos, todos en `.github/workflows/preview.yml`:

### Problema 1 — grupo de concurrencia global

`group: preview` era el mismo para todas las ramas: un push a `feat/sitio-3d` cancelaba el
run de `main` que ya estaba corriendo, y `main` es la única rama que puede publicar en el
entorno `github-pages`. Cambiado a `group: preview-${{ github.ref }}` — un run en curso solo
se cancela por otro push a la **misma** rama.

### Problema 2 — `publicar` intentando desplegar desde ramas sin permiso

El entorno `github-pages` de GitHub solo permite desplegar desde la rama por defecto; en
cualquier otra rama el job estaba condenado a fallar. Se añadió
`if: github.ref == 'refs/heads/main'` al job `publicar`. Ahora todas las ramas construyen y
corren la suite (CI útil en cada push) y solo `main` intenta publicar.

### Problema 3 — instalación limpia sigue fallando sin acceso a los logs del runner

El coordinador no tiene permisos de admin sobre el repositorio (la API le devuelve 403 al
pedir logs), así que lo único legible desde fuera son las anotaciones del check-run.
Sustituido `- run: npm ci` por el paso `Instalar dependencias`: intenta la instalación
limpia con `set -o pipefail` y `tee` a un log temporal; si falla, emite
`::warning::`/`::error::` línea a línea con las últimas 25 líneas del log (visibles como
anotaciones sin acceso a logs completos) y cae a una instalación normal
(`npm install --no-audit --no-fund`) en vez de bloquear el preview completo.

**Repetición deliberada de la misma clase de trampa, evitada esta vez:** el coordinador
señaló explícitamente que el comentario y los mensajes del nuevo paso no debían contener la
subcadena literal `npm ci`, porque ya había un aserto de orden que la busca (y que en la
ronda 1 encontró esa subcadena dentro de un comentario en vez de en el paso real). Revisé el
bloque `run:` del paso "Instalar dependencias" antes de escribirlo: el comando real
`npm ci` sí aparece literalmente dentro del script (es la línea que se ejecuta), pero el test
de orden ahora se reescribió para comparar contra el nombre del paso
(`indexOf('Instalar dependencias')`) en vez de contra la subcadena `npm ci`, así que el
propio comando ya no es un problema para el aserto.

### Cambios en `tests/despliegue.test.ts`

- El test `fija la version de npm que escribio el lockfile` ahora compara
  `indexOf('npm install -g npm@11') < indexOf('Instalar dependencias')` en vez de contra
  `indexOf('npm ci')`.
- Tres tests nuevos: el grupo de concurrencia contiene `${{ github.ref }}`
  (`group: preview-${{ github.ref }}`), el job `publicar` contiene
  `if: github.ref == 'refs/heads/main'`, y el paso de instalación contiene `::error::`.

### Verificación de sintaxis YAML

Antes de dar el workflow por bueno, lo parseé con la librería `yaml` disponible en
`node_modules` (transitiva de Astro) para descartar un error de indentación en el bloque
`run: |` multilínea nuevo:

```
YAML parsed OK
```

El árbol resultante confirma el paso `Instalar dependencias` con su `shell: bash` y el
script completo como una sola cadena multilínea, tal como se esperaba.

### `npm test` (suite completa, en verde)

```
> safetory@1.0.0 test
> vitest run

 RUN  v5.0.0 C:/Users/MIPC/Desktop/DESARROLLOS/SAFETORY

 Test Files  8 passed (8)
      Tests  100 passed (100)
   Start at  02:25:32
   Duration  905ms (transform 50%, import 30%, tests 11%, worker 8%)
```

97 tests previos + 3 nuevos = 100. Todo en verde.

### Commit y push de la ronda de arreglo 2

```
git add .github/workflows/preview.yml tests/despliegue.test.ts
git commit -m "fix(S10): concurrencia por rama, publicar solo en main, instalacion con anotaciones"
git push
```

Push de `feat/sitio-3d` únicamente — **sin mergear a `main`**, tal como pidió el
coordinador ("de eso me ocupo yo").
