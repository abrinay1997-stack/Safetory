import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const layout = () => readFileSync('src/layouts/BaseLayout.astro', 'utf8');

describe('BaseLayout', () => {
  it('monta las View Transitions con ClientRouter', () => {
    expect(layout()).toContain("from 'astro:transitions'");
    expect(layout()).toContain('<ClientRouter />');
  });

  it('exige title y description por ruta, sin valor por defecto', () => {
    const src = layout();
    expect(src).toMatch(/title:\s*string;/);
    expect(src).toMatch(/description:\s*string;/);
  });

  it('emite canonica, OpenGraph y Twitter Card', () => {
    const src = layout();
    ['rel="canonical"', 'og:title', 'og:description', 'og:url', 'og:image',
     'twitter:card'].forEach((t) => expect(src, t).toContain(t));
  });

  it('emite LocalBusiness sin aggregateRating (G1)', () => {
    const src = layout();
    expect(src).toContain('LocalBusiness');
    expect(src).toContain('openingHoursSpecification');
    expect(src).not.toContain('aggregateRating');
  });

  it('incluye el enlace de salto al contenido como primer foco', () => {
    expect(layout()).toContain('class="saltar"');
    expect(layout()).toContain('href="#contenido"');
  });

  it('declara el idioma desde los datos', () => {
    expect(layout()).toContain('lang={site.lang}');
  });

  it('no deja identificadores de analitica escritos a mano (G2)', () => {
    const src = layout();
    expect(src).not.toContain('G-XXXXXXXXXX');
    expect(src).not.toContain('GTM-');
  });
});

describe('robots.txt', () => {
  it('bloquea la herramienta de posters y declara el sitemap', () => {
    const robots = readFileSync('public/robots.txt', 'utf8');
    expect(robots).toContain('Disallow: /dev/');
    expect(robots).toContain('Sitemap: https://safetorystudio.com/sitemap-index.xml');
  });
});
