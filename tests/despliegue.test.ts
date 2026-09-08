import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const toml = () => readFileSync('netlify.toml', 'utf8');
const flujo = () => readFileSync('.github/workflows/preview.yml', 'utf8');

describe('netlify.toml — produccion', () => {
  it('publica dist con el comando de build correcto', () => {
    const s = toml();
    expect(s).toContain('publish = "dist"');
    expect(s).toContain('command = "npm run build"');
  });

  it('no fija BASE_PATH: produccion se sirve desde la raiz', () => {
    expect(toml()).not.toContain('BASE_PATH');
  });

  it('bloquea /dev/* con un 404', () => {
    const s = toml();
    expect(s).toContain('from = "/dev/*"');
    expect(s).toContain('status = 404');
  });

  it('cachea fuentes y posters de forma inmutable', () => {
    const s = toml();
    expect(s).toContain('/fonts/*');
    expect(s).toContain('/posters/*');
    expect(s).toContain('immutable');
  });

  it('declara cabeceras de seguridad basicas', () => {
    const s = toml();
    ['X-Content-Type-Options', 'Referrer-Policy'].forEach((h) =>
      expect(s, h).toContain(h));
  });
});

describe('pagina 404', () => {
  const p404 = () => readFileSync('src/pages/404.astro', 'utf8');

  it('tiene un solo h1 y esta marcada noindex', () => {
    expect((p404().match(/<h1[\s>]/g) ?? []).length).toBe(1);
    expect(p404()).toContain('noindex');
  });

  it('ofrece vuelta al inicio a traves del helper de ruta base (G2)', () => {
    const s = p404();
    // El fuente no contiene href="/" literal: la ruta pasa por el helper.
    expect(s).toContain("ruta('/')");
    expect(s).not.toContain('href="#"');
  });

  it('declara title y description propios', () => {
    const s = p404();
    expect(s).toMatch(/title="[^"]{5,}"/);
    expect(s).toMatch(/description="[^"]{20,}"/);
  });
});

describe('workflow de preview', () => {
  it('construye con la base y la marca de preview', () => {
    const s = flujo();
    expect(s).toContain('BASE_PATH: /Safetory');
    expect(s).toContain("PUBLIC_PREVIEW: 'true'");
  });

  it('ejecuta la suite antes de publicar nada', () => {
    const s = flujo();
    expect(s).toContain('npm test');
    expect(s.indexOf('npm test')).toBeLessThan(s.indexOf('upload-pages-artifact'));
  });

  it('usa el flujo oficial de Pages, sin token de terceros', () => {
    const s = flujo();
    expect(s).toContain('actions/upload-pages-artifact');
    expect(s).toContain('actions/deploy-pages');
    expect(s).not.toContain('peaceiris/actions-gh-pages');
  });

  it('declara los permisos minimos que exige Pages', () => {
    const s = flujo();
    ['pages: write', 'id-token: write', 'contents: read']
      .forEach((p) => expect(s, p).toContain(p));
  });

  it('fija la version de Node que usa el proyecto', () => {
    expect(flujo()).toContain("node-version: '22'");
  });

  it('cachea las dependencias para que el preview sea rapido', () => {
    expect(flujo()).toContain("cache: 'npm'");
  });
});
