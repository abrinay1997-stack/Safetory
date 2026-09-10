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
    // El cuerpo de montar(), y no «desde montar hasta el manejador de Escape»:
    // ahora hay escuchas de gesto entre medias que tambien miran `keydown`, y
    // el corte antiguo se las tragaba.
    const desde = s.slice(s.indexOf('function montar()'));
    const cuerpo = desde.slice(0, desde.indexOf('\n  }'));
    // `document` sobrevive a los cambios de ruta y astro:page-load dispara en
    // cada uno: registrarlo dentro de montar() deja un manejador pegado al
    // documento por cada pagina visitada.
    expect(cuerpo).not.toContain('keydown');
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

  it('se encoge bajando y se estira subiendo, no por un umbral de posicion', () => {
    // Las tres reglas del cliente: bajando encoge, subiendo estira en el acto,
    // quieta esta entera. Lo que decide es la DIRECCION del movimiento, no la
    // altura a la que se este.
    const s = soloCodigo(nav());
    const desde = s.slice(s.indexOf('function alDesplazar()'));
    const cuerpo = desde.slice(0, desde.indexOf('\n  }'));
    expect(cuerpo).toContain('const avance = y - ultimaY');
    expect(cuerpo).toContain('else if (avance < 0) fijar(false)');
    expect(cuerpo).toContain('else if (conduciendo()) fijar(true)');
  });

  it('encoger depende de un gesto de verdad, no de la inercia', () => {
    // Medir la direccion basta en un ordenador ocioso. Con el hilo principal
    // cargado no: la cola de inercia de Lenis pasa a llegar a golpes de 17 a
    // 91 px separados de 140 a 360 ms, y ahi vuelve a caber el temporizador de
    // reposo. Ningun umbral de tiempo ni de distancia gana esa carrera, porque
    // el hueco lo decide lo lento que vaya el aparato. Lo que cambia es el
    // criterio: encoger solo mientras hay un gesto vivo.
    const s = soloCodigo(nav());
    expect(s).toContain('function conduciendo()');
    // Las cuatro formas de mover la pagina a mano. Falta una y hay gente cuya
    // barra no encogeria nunca.
    //
    // Y se mira el BLOQUE de las escuchas de gesto, no el archivo: `keydown`
    // aparece tambien en el manejador de Escape, asi que buscarlo suelto pasa
    // aunque se caiga de esta lista. Comprobado por mutacion — la primera
    // version de este aserto no se enteraba.
    // Acotado por arriba Y por abajo: de `marcarGesto` al final del archivo
    // cae dentro el manejador de Escape, que tambien dice `keydown`.
    const bloque = s.slice(s.indexOf('const marcarGesto'), s.indexOf("document.addEventListener('keydown'"));
    for (const evento of ['wheel', 'touchmove', 'keydown', 'pointerdown']) {
      expect(bloque, `sin ${evento} hay una forma de desplazar que no encoge`).toContain(`'${evento}'`);
    }
    // Y el temporizador de reposo tiene que ANULAR el gesto. Si no, GESTO_VIVO
    // le sobrevive y deja una ventana por la que la inercia vuelve a encoger
    // la barra recien estirada.
    const gesto = Number(s.match(/GESTO_VIVO = (\d+)/)?.[1]);
    const reposo = Number(s.match(/REPOSO_MS = (\d+)/)?.[1]);
    expect(gesto, 'no hay ventana de gesto').toBeGreaterThan(0);
    expect(gesto, 'un gesto tan corto se comeria una rueda lenta').toBeGreaterThan(reposo);
    const desde = s.slice(s.indexOf('function alDesplazar()'));
    const cuerpo = desde.slice(0, desde.indexOf('\n  }'));
    expect(cuerpo, 'el reposo no anula el gesto').toContain('ultimoGesto = 0');
  });

  it('exige un movimiento minimo: es lo que quita el titileo', () => {
    // La inercia de Lenis sigue emitiendo scroll despues del ultimo golpe de
    // rueda, cada vez mas corto: los ultimos, de UN pixel cada 130 ms. El
    // temporizador de reposo cabia entre dos y la barra estiraba, encogia y
    // volvia a estirar. Medido: 86 cambios de estado en dos segundos.
    const s = soloCodigo(nav());
    const minimo = Number(s.match(/MOVIMIENTO_MINIMO = (\d+)/)?.[1]);
    expect(minimo, 'no hay umbral de movimiento').toBeGreaterThanOrEqual(2);
    expect(minimo, 'un umbral asi se comeria un scroll lento de verdad').toBeLessThanOrEqual(10);
    expect(s).toContain('Math.abs(avance) < MOVIMIENTO_MINIMO');
  });

  it('arriba del todo se queda entera aunque se siga bajando', () => {
    const s = soloCodigo(nav());
    expect(Number(s.match(/UMBRAL_ARRIBA = (\d+)/)?.[1])).toBeGreaterThan(0);
    expect(s).toContain('if (y < UMBRAL_ARRIBA) fijar(false)');
  });

  it('no toca el DOM cuando el estado no cambia', () => {
    // Escribir la clase en cada fotograma daba 86 mutaciones de atributo en
    // dos segundos de scroll, todas para dejarlo como ya estaba.
    const s = soloCodigo(nav());
    const desde = s.slice(s.indexOf('function fijar('));
    const cuerpo = desde.slice(0, desde.indexOf('\n  }'));
    expect(cuerpo).toContain("classList.contains('nav--compacta') === compacta");
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
    expect(cuerpo).toMatch(/setTimeout\([\s\S]*fijar\(false\);[\s\S]*\}, REPOSO_MS\)/);
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
