import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { crear } from '../src/three/objetos/microfono';
import { contraste } from '../src/tokens/contraste';

const src = () => readFileSync('src/components/Despiece.astro', 'utf8');

describe('despiece', () => {
  it('etiqueta las cuatro piezas del spec §8.3', () => {
    const s = src();
    // El atributo se enlaza desde el array, asi que buscar `data-pieza="rejilla"`
    // literal no encuentra nada: se comprueba el dato y el enlace por separado.
    [['rejilla', 'Grabación'], ['anillo', 'Producción'],
     ['jaula', 'Ciclorama'], ['base', 'Membresía']].forEach(([pieza, texto]) => {
      expect(s, pieza).toContain(`pieza: '${pieza}'`);
      expect(s, texto).toContain(`texto: '${texto}'`);
    });
    expect(s).toContain('data-pieza={p.pieza}');
  });

  it('las cuatro piezas existen realmente en el micrófono', () => {
    const mic = crear();
    ['rejilla', 'anillo', 'jaula', 'base']
      .forEach((n) => expect(mic.getObjectByName(n), n).toBeDefined());
  });

  it('las etiquetas son HTML real, no texto dentro del canvas (G8)', () => {
    expect(src()).toMatch(/<(a|p|span|h3)[^>]*data-pieza=/);
  });

  it('usa una sola linea de tiempo con scrub: subir el scroll recompone', () => {
    const s = src();
    expect(s).toContain('scrub');
    expect((s.match(/gsap\.timeline\(/g) ?? []).length).toBe(1);
  });

  it('anima solo posicion del objeto 3D y opacity del HTML (G6)', () => {
    // El `(?<![-\w])` descarta `min-width` y `min-height` de las consultas de
    // medios: sin el, la propia consulta que apaga el pin en movil hacia
    // fallar el aserto que vigila que no se animen propiedades de layout.
    expect(src()).not.toMatch(/(?<![-\w])(width|height|top|left):\s*[\d'"]/);
  });

  it('no hace nada bajo prefers-reduced-motion (G3)', () => {
    // La guarda se comprueba ANTES de pedir el modulo de movimiento —de ahi
    // que ya no llame a `prefersReducedMotion()`—, y por eso mismo el modulo
    // no se descarga siquiera cuando el visitante ha pedido menos movimiento.
    expect(src()).toContain("matchMedia('(prefers-reduced-motion: reduce)')");
    const desde = src().slice(src().indexOf('async function montar()'));
    const guardas = desde.slice(0, desde.indexOf("await import('../scripts/motion')"));
    expect(guardas, 'la guarda llega despues de la descarga').toContain('prefers-reduced-motion');
  });

  it('es el unico pin de este bloque y se desactiva en movil (G7)', () => {
    const s = src();
    expect(s).toContain('pin: true');
    expect(s).toContain('min-width: 768px');
  });

  it('los destinos pasan por la ruta base o rompen en el preview (T23)', () => {
    const s = src();
    expect(s).toContain("from '../data/rutas'");
    expect(s).toContain('ruta(p.destino)');
    // Escrito a pelo, los cuatro territorios apuntarian fuera del sitio en
    // GitHub Pages, que lo sirve desde /Safetory. Ya paso en T14 y T19.
    expect(s).not.toContain('href={p.destino}');
  });

  it('espera a que el objeto 3D exista en vez de suponerlo (§8.3)', () => {
    const s = src();
    // Escena3D monta dentro de requestIdleCallback, o sea DESPUES de
    // astro:page-load. Leer el objeto en ese evento lo encuentra siempre sin
    // definir y el momento orquestado no llega a ocurrir nunca, en silencio.
    expect(s).toContain('safetory:objeto-listo');
  });

  it('las etiquetas en reposo cumplen el contraste minimo (G3)', () => {
    const s = src();
    const m = s.match(/--reposo:\s*([\d.]+)/);
    expect(m, 'falta el token --reposo con la opacidad en reposo').not.toBeNull();
    const opacidad = Number(m![1]);

    // Una etiqueta a media opacidad sobre --void es, a efectos de lectura, un
    // gris: se calcula la mezcla real y se mide como cualquier otro color.
    const bone = [0xed, 0xea, 0xe3];
    const fondo = [0x08, 0x08, 0x08];
    const mezcla = bone
      .map((c, i) => Math.round(opacidad * c + (1 - opacidad) * fondo[i]))
      .map((n) => n.toString(16).padStart(2, '0'))
      .join('');
    expect(contraste(`#${mezcla}`, '#080808')).toBeGreaterThanOrEqual(4.5);
  });
});
