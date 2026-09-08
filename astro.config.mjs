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
  build: { format: 'file', inlineStylesheets: 'auto' },
  compressHTML: true,
  integrations: [
    sitemap({ filter: (page) => !page.includes('/dev/') }),
  ],
});
