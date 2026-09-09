import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { soloCodigo } from './util';
import { tarifasEstudio } from '../src/data/estudio';
import { cicloramaFoto } from '../src/data/ciclorama';
import { serviciosProduccion } from '../src/data/produccion';

const home = () => readFileSync('src/pages/index.astro', 'utf8');
const territorio = () => readFileSync('src/components/Territorio.astro', 'utf8');

describe('territorios', () => {
  it('son cuatro y enlazan a las cuatro rutas interiores', () => {
    const s = home();
    ['/estudio', '/ciclorama', '/produccion', '/membresia']
      .forEach((r) => expect(s, r).toContain(`href="${r}"`));
  });

  it('el precio de entrada sale de los datos, no escrito a mano (G1)', () => {
    const s = home();
    expect(s).toContain('tarifasEstudio');
    expect(s).toContain('cicloramaFoto');
    expect(s).toContain('serviciosProduccion');
  });

  it('los precios de entrada que se van a mostrar son los reales', () => {
    expect(Math.min(...tarifasEstudio.map((t) => t.precio!))).toBe(35);
    expect(cicloramaFoto[0].precio).toBe(25);
    expect(Math.min(...serviciosProduccion.map((s) => s.precio!))).toBe(45);
  });

  it('membresia no muestra precio porque no existe el dato (§9.5)', () => {
    // Se aisla LA linea del territorio de membresia. Mirar los 400 caracteres
    // anteriores incluia los otros tres territorios, que si llevan precio, y
    // el aserto pasaba sin comprobar nada de membresia.
    const linea = home().split('\n').find((l) => l.includes('href="/membresia"'));
    expect(linea, 'no hay territorio de membresia').toBeDefined();
    expect(linea).toContain('desde=""');
    expect(linea).not.toMatch(/\$/);
  });

  it('los cuatro territorios caben en una sola pantalla, dentro de un Bloque (G11)', () => {
    // Antes cada territorio era una seccion de 100dvh: cuatro pantallas para
    // una lista de cuatro nombres que el despiece, justo encima, ya nombraba.
    // Ahora cada uno es una fila y quien garantiza el 100dvh es el Bloque.
    const t = soloCodigo(territorio());
    expect(t).not.toContain('100dvh');
    expect(t).toContain('<li');

    const h = home();
    const bloque = h.slice(h.indexOf('<Bloque id="territorios"'), h.indexOf('</Bloque>', h.indexOf('<Bloque id="territorios"')));
    expect(bloque, 'los territorios no estan dentro de su Bloque').toContain('<Territorio');
    expect((bloque.match(/<Territorio/g) ?? []).length).toBe(4);
    // Y el Bloque es quien pone la pantalla completa.
    expect(readFileSync('src/components/Bloque.astro', 'utf8')).toContain('min-height: 100dvh');
  });

  it('el despiece no obliga a arrastrar dos pantallas para salir', () => {
    const d = readFileSync('src/components/Despiece.astro', 'utf8');
    const recorrido = d.match(/end: '\+=(\d+)%'/);
    expect(recorrido, 'no se encuentra el recorrido del pin').not.toBeNull();
    expect(Number(recorrido![1])).toBeLessThanOrEqual(80);
  });

  it('el enlace pasa por la ruta base: es la navegacion primaria de la portada', () => {
    const t = territorio();
    expect(t).toContain("from '../data/rutas'");
    expect(t).toContain('ruta(href)');
    // Sin base, los cuatro enlaces apuntan fuera del sitio en GitHub Pages.
    expect(t).not.toContain('href={href}');
  });

  it('la numeracion es una secuencia real de cuatro (ZERA §3 principio 12)', () => {
    const s = home();
    ['01', '02', '03', '04'].forEach((n) => expect(s, n).toContain(`numero="${n}"`));
    expect(s).not.toContain('numero="05"');
  });
});
