import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
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
    // `isInstancedMesh` y no `.type`: Three.js hereda type = 'Mesh' de Mesh y
    // nunca reasigna esa cadena en InstancedMesh, asi que un aserto sobre
    // `.type` obliga a escribirla a mano en el objeto de produccion. La propia
    // libreria distingue las instancias por esta bandera (Object3D.toJSON).
    expect((jaula as THREE.InstancedMesh)?.isInstancedMesh).toBe(true);
  });

  it('el presupuesto cuenta las copias de la jaula, no una sola', () => {
    // Sin multiplicar por `count`, medirPresupuesto devolveria menos triangulos
    // de los que la GPU dibuja de verdad, y el guardrail de rendimiento de los
    // cinco objetos que faltan quedaria en decorativo.
    const soloJaula = new THREE.Group();
    const jaula = mic.getObjectByName('jaula') as THREE.InstancedMesh;
    soloJaula.add(jaula.clone());
    const p = medirPresupuesto(soloJaula);
    const porCopia = medirPresupuesto(new THREE.Mesh(jaula.geometry)).triangulos;
    expect(p.triangulos).toBe(porCopia * jaula.count);
    expect(jaula.count).toBeGreaterThan(1);
  });
});
