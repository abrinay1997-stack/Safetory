# Safetory Studio

Sitio multipágina de Safetory Studio — estudio de grabación, producción musical y ciclorama
en Vía España, Panamá.

## Comandos

    npm install
    npm run dev       # desarrollo en localhost:4321
    npm run build     # build de producción a dist/
    npm run preview   # servir el build
    npm test          # construye y ejecuta la suite de vitest

`npm test` construye antes de comprobar: la suite de las cuatro pasadas de calidad
(`tests/salida.test.ts`) lee el HTML de `dist/`.

## Verificación en navegador

Dos comprobaciones que `npm test` no puede hacer, porque necesitan DOM, WebGL,
`ResizeObserver` e `IntersectionObserver`. **El CI las ejecuta en cada push**, y son el único
punto del proyecto donde se comprueba que el motor 3D funciona: todos sus modos de fallo son
silenciosos.

    npm run build
    npx astro preview --port 4330 &

    CHROMIUM=/ruta/a/chrome node scripts/verificacion-3d.mjs
    CHROMIUM=/ruta/a/chrome node scripts/verificacion-degradacion.mjs

## Despliegue

| | Estado | Dónde |
|---|---|---|
| GitHub Pages, push a `main` | **activo** | `abrinay1997-stack.github.io/Safetory` |
| Netlify, raíz del dominio | **sin configurar** | `netlify.toml` está escrito y listo, pero no existe el proyecto en Netlify |

El preview se construye con `BASE_PATH=/Safetory` y `PUBLIC_PREVIEW=true`, que lo marca
como `noindex`: nunca debe competir en Google con la producción.

Para reproducir un build de preview en local:

    BASE_PATH=/Safetory PUBLIC_PREVIEW=true npm run build

**Requisito de configuración:** en *Settings → Pages*, la fuente debe estar en **GitHub
Actions**, no en una rama.

## Documentación

- `CLAUDE.md` — reglas permanentes del repositorio
- `docs/superpowers/specs/2026-09-07-safetory-sitio-3d-design.md` — el diseño aprobado
- `docs/superpowers/plans/2026-09-07-safetory-sitio-3d.md` — el plan de implementación
- `docs/errors-learned.md` — bitácora de errores de la sesión

## Herramienta interna

`/dev/posters` genera los pósters WebP de cada escena 3D. Está excluida del sitemap, bloqueada
en `robots.txt` y devuelta como 404 por `netlify.toml` en producción.

## Pendiente de contenido del cliente

Ver §9.5 del spec: precio de la membresía, marcas y modelos del equipo, texto de marca,
alcance del co-working y proyectos publicables.
