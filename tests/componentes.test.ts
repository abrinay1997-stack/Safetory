import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { soloCodigo } from './util';

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

  it('no lleva degradado: se leia como una foto desenfocada, no tenue', () => {
    // La mascara la desvanecia por los dos bordes y el resultado parecia un
    // blur. El cliente pidio opaco, no difuminado.
    expect(soloCodigo(bloque())).not.toContain('mask-image');
  });

  it('el contenido se ata a su columna cuando hay fotografia', () => {
    const s = bloque();
    // Sin esto el texto ocupa el ancho completo y se mete por debajo de la
    // foto: a 1440 px pasaba en catorce bloques de cinco rutas.
    expect(s).toContain('.bloque--con-fondo > .bloque__mayor { max-width:');
    expect(s).toContain('.bloque--fondo-izquierda > .bloque__mayor { margin-left:');
  });

  it('se retira en movil, donde quedaria debajo del texto', () => {
    const s = bloque();
    const movil = s.slice(s.indexOf('@media (max-width: 899px)'));
    expect(movil).toContain('.bloque__fondo { display: none; }');
  });

  it('ningun bloque pone la fotografia debajo de su propio texto', () => {
    // La foto ocupa el 38,2 % de un lado. Si el contenido del bloque abarca el
    // ancho completo —una tabla, por ejemplo— la foto le queda debajo y pasa a
    // tener que responder por el contraste (G3). En ese caso no se pone.
    const paginas = ['index', 'estudio', 'ciclorama', 'produccion', 'membresia', 'contacto'];
    paginas.forEach((p) => {
      const s = readFileSync(`src/pages/${p}.astro`, 'utf8');
      const conFondo = [...s.matchAll(/<Bloque[^>]*fondo="[^"]+"[^>]*>([\s\S]*?)<\/Bloque>/g)];
      conFondo.forEach((m) => {
        expect(m[1], `${p}: un bloque con fondo contiene una tabla`).not.toContain('<table');
        expect(m[1], `${p}: un bloque con fondo contiene una lista a lo ancho`).not.toContain('<ul class="territorios"');
      });
    });
  });

  it('los fondos alternan de lado: dos seguidos al mismo lado se leen como un patron', () => {
    ['index', 'estudio', 'ciclorama', 'produccion', 'membresia', 'contacto'].forEach((p) => {
      const s = readFileSync(`src/pages/${p}.astro`, 'utf8');
      const lados = [...s.matchAll(/<Bloque id="([a-z-]+)"[^>]*ladoFondo="(izquierda|derecha)"/g)]
        .map((m) => ({ id: m[1], lado: m[2] }));
      lados.forEach((b, i) => {
        if (i === 0) return;
        expect(b.lado, `${p}: ${lados[i - 1].id} y ${b.id} caen al mismo lado`)
          .not.toBe(lados[i - 1].lado);
      });
    });
  });

  it('las seis fotografias de fondo existen', () => {
    ['sala', 'sala-ancha', 'lounge', 'ciclorama', 'interfaz', 'microfono']
      .forEach((n) => expect(existsSync(`public/fondos/${n}.webp`), n).toBe(true));
  });
});
