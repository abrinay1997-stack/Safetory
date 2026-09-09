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

describe('barra que se encoge', () => {
  it('se encoge con transform, nunca con caja (G6)', () => {
    const s = soloCodigo(nav());
    // Las dos reglas: la de escritorio y la del movil.
    const reglas = [...s.matchAll(/\.nav--compacta \{([^}]*)\}/g)].map((m) => m[1]);
    expect(reglas.length, 'no hay regla para el estado compacto').toBeGreaterThan(0);
    const regla = reglas.join(' ');
    expect(regla).toContain('scale(');
    // La barra esta fija y se toca en cada fotograma del scroll: animar su
    // padding o su alto obligaria a rehacer el reparto del menu entero.
    ['height:', 'width:', 'padding:', 'top:', 'font-size:'].forEach(
      (p) => expect(regla, p).not.toContain(p));
  });

  it('la transicion de la barra solo declara transform y opacity (G6)', () => {
    const s = soloCodigo(nav());
    const declaracion = s.match(/\.nav \{[^}]*transition:([^;]+);/s)?.[1] ?? '';
    expect(declaracion.length, 'la barra no declara transicion').toBeGreaterThan(0);
    expect(declaracion).not.toMatch(/\b(height|width|padding|top|left|margin)\b/);
  });

  it('queda mas pequena que las dos referencias del cliente', () => {
    // 65 px en reposo por 0.72 = 47, contra los 58 de PanaClaw y JuancitoAds.
    const escala = Number(soloCodigo(nav()).match(/\.nav--compacta \{\s*transform:[^;]*scale\(([\d.]+)\)/)?.[1]);
    expect(escala).toBeGreaterThan(0);
    expect(65 * escala).toBeLessThan(58);
  });

  it('usa dos umbrales, no uno: si no, parpadea en el punto de corte', () => {
    const s = soloCodigo(nav());
    const encoge = Number(s.match(/UMBRAL_ENCOGE = (\d+)/)?.[1]);
    const crece = Number(s.match(/UMBRAL_CRECE = (\d+)/)?.[1]);
    expect(encoge).toBeGreaterThan(0);
    expect(crece).toBeGreaterThan(0);
    expect(crece).toBeLessThan(encoge);
  });

  it('el scroll no se lee mas de una vez por fotograma', () => {
    const s = soloCodigo(nav());
    expect(s).toContain('requestAnimationFrame');
    expect(s).toMatch(/addEventListener\('scroll'[^)]*passive: true/);
  });

  it('la escucha de scroll se registra una sola vez, no por navegacion', () => {
    const s = soloCodigo(nav());
    const desdeMontar = s.slice(s.indexOf('function montar()'));
    const cuerpoMontar = desdeMontar.slice(0, desdeMontar.indexOf('\n  }'));
    // Las dos mitades: que la escucha exista — si no, el aserto de abajo
    // pasaria porque no hay nada que registrar — y que no viva en montar(),
    // donde `window` acumularia un manejador por cada pagina visitada.
    expect(s).toContain("window.addEventListener('scroll'");
    expect(cuerpoMontar).not.toContain("addEventListener('scroll'");
  });

  it('vuelve a su tamano cuando se deja de hacer scroll', () => {
    const s = soloCodigo(nav());
    const ms = Number(s.match(/REPOSO_MS = (\d+)/)?.[1]);
    expect(ms, 'no hay espera de reposo').toBeGreaterThan(0);
    // El cliente lo pidio inmediato: medio segundo se sentia lento. Lo que
    // marca el limite por abajo es no estirarse entre dos golpes de rueda.
    expect(ms, 'tardaria demasiado en volver').toBeLessThanOrEqual(200);
    expect(ms, 'se estiraria entre dos golpes de rueda').toBeGreaterThanOrEqual(80);
    // Quien deshace el encogido es un temporizador, y cada evento de scroll lo
    // aplaza: sin el clearTimeout, el primer evento fijaria el momento de
    // estirarse y la barra creceria en plena bajada.
    const desde = s.slice(s.indexOf('function alDesplazar()'));
    const cuerpo = desde.slice(0, desde.indexOf('\n  }'));
    expect(cuerpo).toContain('clearTimeout(reposo)');
    expect(cuerpo).toContain('setTimeout(estirar, REPOSO_MS)');
    expect(s).toMatch(/function estirar\(\)[\s\S]{0,160}classList\.remove\('nav--compacta'\)/);
  });

  it('al cambiar de ruta no queda pendiente el regreso de la pagina anterior', () => {
    const s = soloCodigo(nav());
    const desde = s.slice(s.indexOf('function montar()'));
    // El header es otro; un temporizador del anterior llegaria a destiempo.
    expect(desde.slice(0, desde.indexOf('\n  }'))).toContain('clearTimeout(reposo)');
  });

  it('con reduce-motion desaparece el recorrido, no el estado', () => {
    const s = soloCodigo(nav());
    const bloque = s.slice(s.indexOf('prefers-reduced-motion'));
    expect(bloque.slice(0, 160)).toContain('transition: none');
    // El tamano compacto sigue aplicandose: es informacion, no adorno.
    expect(s.indexOf('.nav--compacta')).toBeLessThan(s.indexOf('prefers-reduced-motion'));
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
