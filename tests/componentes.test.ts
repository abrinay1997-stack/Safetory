import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

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

  it('el telefono es un enlace tel: en formato internacional', () => {
    expect(leer('Footer.astro')).toContain('tel:+507');
  });

  it('lista las cinco rutas interiores para navegacion movil', () => {
    const src = leer('Footer.astro');
    ['/estudio', '/ciclorama', '/produccion', '/membresia', '/contacto']
      .forEach((r) => expect(src, r).toContain(r));
  });
});
