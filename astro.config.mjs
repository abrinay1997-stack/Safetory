// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://safetorystudio.com',
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'auto' },
  compressHTML: true,
  integrations: [
    sitemap({ filter: (page) => !page.includes('/dev/') }),
  ],
});
