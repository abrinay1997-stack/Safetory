// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * El sitio se construye para dos destinos:
 *
 *   Netlify (producción)  →  raíz del dominio, sin base
 *   GitHub Pages (preview) →  /Safetory, con base
 *
 * Nada de esto se fija en el código: lo deciden las variables de entorno del
 * build. `URL` la define Netlify automáticamente.
 */
const SITE = process.env.SITE_URL || process.env.URL || 'https://safetory.netlify.app';
const BASE = process.env.BASE_PATH || undefined;

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'never',
  build: {
    format: 'file',
    /**
     * El CSS entero viaja dentro del HTML.
     *
     * Con `auto` quedaba fuera una hoja de 2,7 KB, y Lighthouse la media en
     * **302 ms de pintado bloqueado** sobre una red móvil: no es el peso, es
     * la ida y vuelta. La audiencia de este sitio llega desde redes sociales,
     * o sea siempre en primera visita y casi siempre con datos móviles, que
     * es justo el caso en el que una petición de más cuesta un tercio de
     * segundo. Incrustada, el navegador pinta con lo que ya tiene.
     */
    inlineStylesheets: 'always',
  },
  compressHTML: true,
  vite: {
    build: {
      /**
       * Sin transpilar para navegadores que ya no existen. Lighthouse marcaba
       * «legacy JavaScript» por los polyfills que Vite añade por defecto; con
       * este objetivo, el bundle sale como se escribió.
       */
      target: 'es2022',
    },
  },
  /**
   * Prefetch al tocar el enlace.
   *
   * `tap` y no `hover`: en un teléfono no hay hover, y `viewport` descargaría
   * las seis rutas por el mero hecho de que sus enlaces aparezcan en pantalla
   * —en el pie salen todos— con datos móviles. Al tocar, el navegador tiene
   * los ~150 ms del gesto para adelantar la descarga, que en una red móvil es
   * justo lo que dura la ida y vuelta.
   */
  prefetch: { prefetchAll: true, defaultStrategy: 'tap' },
  integrations: [
    sitemap({ filter: (page) => !page.includes('/dev/') }),
  ],
});
