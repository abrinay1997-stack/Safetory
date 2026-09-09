import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';

const leer = (f: string) => readFileSync(`src/components/${f}`, 'utf8');

describe('Nav', () => {
  it('enlaza las seis rutas y ninguna mas', () => {
    const src = leer('Nav.astro');
    // Se comprueba el array `enlaces`, no `href="..."` en el marcado: los
    // enlaces se generan con un .map(), así que el fuente contiene
    // `href={e.href}`. Aserta sobre la fuente de verdad, que es el array.
    ['/', '/estudio', '/ciclorama', '/produccion', '/membresia', '/contacto']
      .forEach((r) => expect(src, r).toContain(`href: '${r}'`));
    expect(src).not.toContain('/reservar');
    expect(src).not.toContain('href="#"');
  });

  it('marca la ruta activa con aria-current', () => {
    expect(leer('Nav.astro')).toContain('aria-current');
  });
});

describe('Bloque', () => {
  it('usa dvh y nunca vh (G11)', () => {
    const src = leer('Bloque.astro');
    expect(src).toContain('100dvh');
    expect(src).not.toMatch(/\d+vh\b/);
  });

  it('reparte en 61,8 / 38,2 y nunca al 50 % (G12)', () => {
    const src = leer('Bloque.astro');
    expect(src).toContain('var(--mayor)');
    expect(src).toContain('var(--menor)');
    expect(src).not.toContain('1fr 1fr');
  });
});

describe('PrecioCard', () => {
  it('marca el precio con <data value> para lectura por maquina', () => {
    expect(leer('PrecioCard.astro')).toContain('<data value=');
  });

  it('trata precio null como incluido en la membresia, sin inventar cifra (G1)', () => {
    expect(leer('PrecioCard.astro')).toContain('Incluido con la membresía');
  });

  it('el CTA abre WhatsApp con rel de seguridad', () => {
    const src = leer('PrecioCard.astro');
    expect(src).toContain('enlaceWhatsApp');
    expect(src).toContain('rel="noopener noreferrer"');
  });
});

describe('Footer', () => {
  it('publica contacto y horario desde los datos, no a mano', () => {
    const src = leer('Footer.astro');
    ['site.direccion', 'site.horario', 'site.correo'].forEach((t) =>
      expect(src, t).toContain(t));
  });

  it('el telefono se deriva de site.whatsapp, no se escribe a mano', () => {
    const src = leer('Footer.astro');
    expect(src).toContain('site.whatsapp');
    // El prefijo del pais no se escribe a mano: ya esta dentro de site.whatsapp.
    expect(src).not.toContain("'+507");
    expect(src).not.toContain('+507$');
  });

  it('lista las cinco rutas interiores para navegacion movil', () => {
    const src = leer('Footer.astro');
    ['/estudio', '/ciclorama', '/produccion', '/membresia', '/contacto']
      .forEach((r) => expect(src, r).toContain(r));
  });
});

describe('fondos de seccion', () => {
  const bloque = () => readFileSync('src/components/Bloque.astro', 'utf8');

  it('la fotografia de fondo es decorativa, no contenido', () => {
    const s = bloque();
    // Es atmosfera: un lector de pantalla no tiene nada que anunciar aqui, y
    // un alt descriptivo solo anadiria ruido en cada seccion.
    expect(s).toContain('alt=""');
    expect(s).toContain('aria-hidden="true"');
  });

  it('no compite con el LCP: carga diferida', () => {
    expect(bloque()).toContain('loading="lazy"');
  });

  it('pasa por la ruta base o da 404 en el preview (T23)', () => {
    const s = bloque();
    expect(s).toContain("from '../data/rutas'");
    expect(s).toContain('ruta(fondo)');
  });

  it('ocupa la parte menor del reparto aureo, no media pantalla (G12)', () => {
    expect(bloque()).toContain('width: var(--menor)');
  });

  it('se retira en movil, donde quedaria debajo del texto', () => {
    const s = bloque();
    const movil = s.slice(s.indexOf('@media (max-width: 899px)'));
    expect(movil).toContain('.bloque__fondo { display: none; }');
  });

  it('las seis fotografias de fondo existen', () => {
    ['sala', 'sala-ancha', 'lounge', 'ciclorama', 'interfaz', 'microfono']
      .forEach((n) => expect(existsSync(`public/fondos/${n}.webp`), n).toBe(true));
  });
});
