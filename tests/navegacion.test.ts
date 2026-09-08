import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { soloCodigo } from './util';

const nav = () => readFileSync('src/components/Nav.astro', 'utf8');
const escena = () => readFileSync('src/components/Escena3D.astro', 'utf8');

describe('menu movil', () => {
  it('el boton declara aria-expanded y aria-controls', () => {
    const s = nav();
    expect(s).toContain('aria-expanded');
    expect(s).toContain('aria-controls');
  });

  it('el aria-controls apunta a un id que existe en el marcado', () => {
    const s = nav();
    const control = s.match(/aria-controls="([^"]+)"/)?.[1];
    expect(control).toBeDefined();
    expect(s).toContain(`id="${control}"`);
  });

  it('se cierra con Escape', () => {
    expect(nav()).toContain("'Escape'");
  });

  it('Escape devuelve el foco al boton', () => {
    // Sin esto el foco se queda en un enlace que acaba de ocultarse y el
    // teclado pierde el punto de partida.
    expect(nav()).toContain('boton.focus()');
  });

  it('el manejador de Escape se registra una sola vez, no por navegacion', () => {
    const s = nav();
    const dentroDeMontar = s.slice(s.indexOf('function montar()'), s.indexOf('document.addEventListener(\'keydown\''));
    // `document` sobrevive a los cambios de ruta y astro:page-load dispara en
    // cada uno: registrarlo dentro de montar() deja un manejador pegado al
    // documento por cada pagina visitada.
    expect(dentroDeMontar).not.toContain('keydown');
  });

  it('el boton tiene nombre accesible', () => {
    expect(nav()).toContain('aria-label');
  });

  it('usa un solo mecanismo de arranque', () => {
    const s = nav();
    // Sobre el codigo y no sobre el archivo entero: el comentario que explica
    // por que no se usa readyState contiene la palabra, y prohibirla a secas
    // obliga a borrar la explicacion para callar al test.
    expect(soloCodigo(s)).not.toContain('readyState');
    expect(s).toContain('astro:page-load');
  });
});

describe('transicion entre escenas', () => {
  it('la escena se aleja en Z antes del cambio de pagina (§8.5)', () => {
    expect(escena()).toContain('transition-');
  });

  it('la transicion anima solo transform y opacity (G6)', () => {
    const s = escena();
    const bloque = s.slice(s.indexOf('@keyframes escena-sale'), s.indexOf('::view-transition-new'));
    expect(bloque).toMatch(/transform:/);
    expect(bloque).not.toMatch(/(?<![-\w])(width|height|top|left):\s*[\d'"]/);
  });

  it('respeta reduce-motion: corte limpio', () => {
    expect(escena()).toContain('prefers-reduced-motion');
  });
});
