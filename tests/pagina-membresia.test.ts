import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { medirPresupuesto, LIMITE_MALLAS, LIMITE_TRIANGULOS } from '../src/three/presupuesto';
import { crear } from '../src/three/objetos/plato';
import { incluidoMembresia } from '../src/data/membresia';

const pagina = () => readFileSync('src/pages/membresia.astro', 'utf8');

describe('objeto plato', () => {
  const obj = crear();

  it('cabe en el presupuesto de escena', () => {
    const p = medirPresupuesto(obj);
    expect(p.mallas).toBeLessThanOrEqual(LIMITE_MALLAS);
    expect(p.triangulos).toBeLessThanOrEqual(LIMITE_TRIANGULOS);
  });

  it('tiene disco y brazo', () => {
    expect(obj.getObjectByName('disco')).toBeDefined();
    expect(obj.getObjectByName('brazo')).toBeDefined();
  });

  it('la etiqueta cuelga del disco: giran juntas o no giran', () => {
    const disco = obj.getObjectByName('disco')!;
    // Colgadas del grupo por separado hay que acordarse de rotar las dos, y
    // el dia que una se quede atras el vinilo gira con la etiqueta quieta.
    expect(disco.getObjectByName('etiqueta')).toBeDefined();
  });
});

describe('ruta /membresia', () => {
  it('tiene un solo h1 (G8)', () => {
    expect((pagina().match(/<h1[\s>]/g) ?? []).length).toBe(1);
  });

  it('NO inventa precio de membresia: el dato no existe (§9.5)', () => {
    const s = pagina();
    expect(s).not.toMatch(/\$\s?\d/);
    expect(s).not.toMatch(/\d+\s*(al mes|mensual|\/mes)/i);
  });

  it('el CTA lleva a consultar, no a comprar', () => {
    const s = pagina();
    expect(s).toContain('Consultar membresía');
    expect(s).toContain('enlaceWhatsApp');
  });

  it('lista lo incluido desde los datos', () => {
    expect(incluidoMembresia).toHaveLength(2);
    expect(pagina()).toContain('incluidoMembresia');
  });

  it('ninguna seccion mide en vh (G11)', () => {
    expect(pagina()).not.toMatch(/[^d]vh\b/);
  });

  it('el poster existe y pesa menos de 60 KB', () => {
    expect(existsSync('public/posters/membresia.webp')).toBe(true);
    expect(statSync('public/posters/membresia.webp').size).toBeLessThan(60 * 1024);
  });
});
