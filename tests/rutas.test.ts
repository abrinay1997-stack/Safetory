import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { ruta, aplicarBase } from '../src/data/rutas';

const leer = (f: string) => readFileSync(f, 'utf8');

describe('helper de ruta base', () => {
  // Sin BASE_PATH definido (el caso de Netlify y de `astro dev`), la base es
  // la raiz y el helper es practicamente la identidad.
  it('deja la ruta intacta cuando no hay base', () => {
    expect(ruta('/posters/home.webp')).toBe('/posters/home.webp');
  });

  it('la raiz sigue siendo la raiz', () => {
    expect(ruta('/')).toBe('/');
  });

  it('deja intactas las URL y esquemas externos', () => {
    expect(ruta('https://wa.me/50767998881')).toBe('https://wa.me/50767998881');
    expect(ruta('mailto:info@safetoryglobal.com')).toBe('mailto:info@safetoryglobal.com');
    expect(ruta('tel:+50767998881')).toBe('tel:+50767998881');
    expect(ruta('#contenido')).toBe('#contenido');
  });

  it('nunca produce una barra doble', () => {
    ['/', '/estudio', '/posters/home.webp'].forEach((p) => {
      expect(ruta(p), p).not.toMatch(/\/\//);
    });
  });
});

describe('la rama con base, que es la del preview', () => {
  // `BASE_URL` se fija en tiempo de build, asi que la rama con base solo se
  // puede ejercitar a traves de la funcion pura. Sin esto, el caso que de
  // verdad rompe en produccion se quedaria sin cobertura.
  const B = '/Safetory/';

  it('antepone la base a una ruta interna', () => {
    expect(aplicarBase(B, '/posters/home.webp')).toBe('/Safetory/posters/home.webp');
  });

  it('la raiz del sitio queda en la base, sin barra sobrante', () => {
    expect(aplicarBase(B, '/')).toBe('/Safetory');
  });

  it('es idempotente: aplicarla dos veces no duplica la base', () => {
    ['/', '/estudio', '/posters/home.webp'].forEach((p) => {
      const una = aplicarBase(B, p);
      expect(aplicarBase(B, una), p).toBe(una);
    });
  });

  it('sigue dejando intactos los esquemas externos', () => {
    ['https://wa.me/50767998881', 'mailto:info@safetoryglobal.com',
     'tel:+50767998881', '#contenido'].forEach((p) => {
      expect(aplicarBase(B, p), p).toBe(p);
    });
  });

  it('nunca produce una barra doble', () => {
    ['/', '/estudio', '/posters/home.webp'].forEach((p) => {
      expect(aplicarBase(B, p), p).not.toMatch(/\/\//);
    });
  });
});

describe('configuracion de despliegue', () => {
  const cfg = () => leer('astro.config.mjs');

  it('la base se toma del entorno, nunca fija en el codigo', () => {
    expect(cfg()).toContain('BASE_PATH');
    expect(cfg()).not.toContain("base: '/Safetory'");
  });

  it('el site tambien se toma del entorno, con Netlify como respaldo', () => {
    const s = cfg();
    expect(s).toContain('SITE_URL');
    expect(s).toContain('process.env.URL');
  });

  it('existe .nojekyll: GitHub Pages ignora los directorios con guion bajo', () => {
    expect(existsSync('public/.nojekyll')).toBe(true);
  });
});

describe('el preview nunca se indexa', () => {
  it('BaseLayout marca noindex cuando el build es de preview', () => {
    const src = leer('src/layouts/BaseLayout.astro');
    expect(src).toContain('PREVIEW');
    expect(src).toContain('noindex');
  });
});

describe('ninguna ruta interna escrita a mano', () => {
  const ARCHIVOS = [
    'src/components/Nav.astro',
    'src/components/Footer.astro',
  ];

  it('los componentes de navegacion usan el helper', () => {
    ARCHIVOS.forEach((f) => {
      const src = leer(f);
      const crudas = src.match(/href="\/[^"]*"/g) ?? [];
      expect(crudas, `${f}: ${crudas.join(', ')}`).toEqual([]);
      expect(src, f).toContain("from '../data/rutas'");
    });
  });

  it('Nav sigue declarando las seis rutas logicas en su array', () => {
    const src = leer('src/components/Nav.astro');
    ['/', '/estudio', '/ciclorama', '/produccion', '/membresia', '/contacto']
      .forEach((r) => expect(src, r).toContain(`href: '${r}'`));
  });
});
