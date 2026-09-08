import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { medirPresupuesto, LIMITE_MALLAS, LIMITE_TRIANGULOS } from '../src/three/presupuesto';
import { crear } from '../src/three/objetos/ciclorama';
import { cicloramaFoto, cicloramaVideo, bloquesCicloramaMiembro } from '../src/data/ciclorama';

const pagina = () => readFileSync('src/pages/ciclorama.astro', 'utf8');

describe('objeto ciclorama', () => {
  const obj = crear();

  it('cabe en el presupuesto de escena', () => {
    const p = medirPresupuesto(obj);
    expect(p.mallas).toBeLessThanOrEqual(LIMITE_MALLAS);
    expect(p.triangulos).toBeLessThanOrEqual(LIMITE_TRIANGULOS);
  });

  it('es el unico objeto que ES un espacio: tiene curva y suelo', () => {
    expect(obj.getObjectByName('curva')).toBeDefined();
    expect(obj.getObjectByName('suelo')).toBeDefined();
  });

  it('la curva se ve por dentro: sin DoubleSide el espacio queda hueco', () => {
    const curva = obj.getObjectByName('curva') as import('three').Mesh;
    const material = curva.material as import('three').Material;
    // La camara acaba dentro del ciclorama al cerrarse la espiral. Con el
    // lado por defecto, las caras traseras no se dibujan y el espacio
    // desaparece justo en el momento mas cercano.
    expect(material.side).toBe(2); // THREE.DoubleSide
  });

  it('lleva el foco circular que se ve en la fotografia del cliente', () => {
    expect(obj.getObjectByName('foco')).toBeDefined();
  });
});

describe('ruta /ciclorama', () => {
  it('tiene un solo h1 (G8)', () => {
    expect((pagina().match(/<h1[\s>]/g) ?? []).length).toBe(1);
  });

  it('usa la temperatura violeta del espacio real (§6.3)', () => {
    expect(pagina()).toContain('temperatura="violeta"');
  });

  it('publica la tarifa de foto, los tres bloques de video y los de miembro', () => {
    expect(cicloramaFoto).toHaveLength(1);
    expect(cicloramaVideo).toHaveLength(3);
    expect(bloquesCicloramaMiembro).toHaveLength(2);
    const s = pagina();
    ['cicloramaFoto', 'cicloramaVideo', 'bloquesCicloramaMiembro']
      .forEach((d) => expect(s, d).toContain(d));
  });

  it('no escribe ningun precio a mano (G1)', () => {
    expect(pagina()).not.toMatch(/\$\s?\d{2,}/);
  });

  it('ninguna seccion mide en vh (G11)', () => {
    expect(pagina()).not.toMatch(/[^d]vh\b/);
  });

  it('el poster existe y pesa menos de 60 KB', () => {
    expect(existsSync('public/posters/ciclorama.webp')).toBe(true);
    expect(statSync('public/posters/ciclorama.webp').size).toBeLessThan(60 * 1024);
  });
});
