import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { medirPresupuesto, LIMITE_MALLAS, LIMITE_TRIANGULOS } from '../src/three/presupuesto';
import { crear } from '../src/three/objetos/monitores';
import { tarifasEstudio, bloquesEstudioMiembro } from '../src/data/estudio';

const pagina = () => readFileSync('src/pages/estudio.astro', 'utf8');

describe('objeto monitores', () => {
  const obj = crear();

  it('cabe en el presupuesto de escena', () => {
    const p = medirPresupuesto(obj);
    expect(p.mallas).toBeLessThanOrEqual(LIMITE_MALLAS);
    expect(p.triangulos).toBeLessThanOrEqual(LIMITE_TRIANGULOS);
  });

  it('son un par en estereo, simetrico respecto al origen', () => {
    const izq = obj.getObjectByName('caja-izq');
    const der = obj.getObjectByName('caja-der');
    expect(izq).toBeDefined();
    expect(der).toBeDefined();
    expect(izq!.position.x).toBeCloseTo(-der!.position.x, 5);
  });

  it('lleva el testigo de acento encendido', () => {
    expect(obj.getObjectByName('testigo')).toBeDefined();
  });
});

describe('ruta /estudio', () => {
  it('tiene un solo h1 (G8)', () => {
    expect((pagina().match(/<h1[\s>]/g) ?? []).length).toBe(1);
  });

  it('publica las dos tarifas y los tres bloques de miembro', () => {
    expect(tarifasEstudio).toHaveLength(2);
    expect(bloquesEstudioMiembro).toHaveLength(3);
    const s = pagina();
    expect(s).toContain('tarifasEstudio');
    expect(s).toContain('bloquesEstudioMiembro');
  });

  it('no escribe ningun precio a mano (G1)', () => {
    expect(pagina()).not.toMatch(/\$\s?\d{2,}/);
  });

  it('no inventa marcas ni modelos de equipo (G15)', () => {
    const s = pagina().toLowerCase();
    ['neumann', 'shure', 'yamaha', 'krk', 'focusrite', 'universal audio', 'rode', 'akg']
      .forEach((marca) => expect(s, marca).not.toContain(marca));
  });

  it('ninguna seccion mide en vh (G11)', () => {
    expect(pagina()).not.toMatch(/[^d]vh\b/);
  });

  it('monta la escena de monitores con su poster', () => {
    const s = pagina();
    expect(s).toContain('objeto="monitores"');
    expect(s).toContain('/posters/estudio.webp');
  });

  it('el poster existe y pesa menos de 60 KB', () => {
    // El tamano se comprueba de verdad: el plan solo miraba que el archivo
    // existiera, y el aserto no vigilaba lo que su nombre prometia.
    expect(existsSync('public/posters/estudio.webp')).toBe(true);
    expect(statSync('public/posters/estudio.webp').size).toBeLessThan(60 * 1024);
  });
});
