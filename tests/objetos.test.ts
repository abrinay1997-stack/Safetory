import { describe, it, expect } from 'vitest';
import { medirPresupuesto, LIMITE_MALLAS, LIMITE_TRIANGULOS } from '../src/three/presupuesto';
import { crear as crearMicrofono } from '../src/three/objetos/microfono';

describe('presupuesto de escena (§7.4)', () => {
  it('mide mallas y triángulos de un grupo', () => {
    const p = medirPresupuesto(crearMicrofono());
    expect(p.mallas).toBeGreaterThan(0);
    expect(p.triangulos).toBeGreaterThan(0);
  });
});

describe('micrófono', () => {
  const mic = crearMicrofono();

  it('cabe en el presupuesto de mallas y triángulos', () => {
    const p = medirPresupuesto(mic);
    expect(p.mallas).toBeLessThanOrEqual(LIMITE_MALLAS);
    expect(p.triangulos).toBeLessThanOrEqual(LIMITE_TRIANGULOS);
  });

  it('expone las piezas que necesita el despiece de la Home', () => {
    ['cuerpo', 'rejilla', 'jaula', 'anillo', 'base']
      .forEach((n) => expect(mic.getObjectByName(n), n).toBeDefined());
  });

  it('el grupo se llama microfono, para que el motor lo identifique', () => {
    expect(mic.name).toBe('microfono');
  });

  it('está centrado en el origen: la cámara orbita alrededor de (0,0,0)', () => {
    expect(Math.abs(mic.position.x)).toBeLessThan(0.001);
    expect(Math.abs(mic.position.z)).toBeLessThan(0.001);
  });

  it('la jaula usa InstancedMesh: una sola llamada de dibujado', () => {
    const jaula = mic.getObjectByName('jaula');
    expect(jaula?.type).toBe('InstancedMesh');
  });
});
