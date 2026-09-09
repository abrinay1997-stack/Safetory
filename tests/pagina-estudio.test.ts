import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, statSync } from 'node:fs';
import * as THREE from 'three';
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
    // Se mide en coordenadas de MUNDO, no locales. Cada bocina cuelga de su
    // propio grupo, asi que sus posiciones locales valen las dos cero y
    // compararlas seria comparar 0 con -0: un aserto que pasa siempre.
    obj.updateMatrixWorld(true);
    const mundo = (n: string) => {
      const o = obj.getObjectByName(n);
      expect(o, n).toBeDefined();
      return o!.getWorldPosition(new THREE.Vector3());
    };
    const izq = mundo('caja-izq');
    const der = mundo('caja-der');
    expect(izq.x).toBeCloseTo(-der.x, 5);
    expect(Math.abs(izq.x)).toBeGreaterThan(0.5);
    expect(izq.y).toBeCloseTo(der.y, 5);
    expect(izq.z).toBeCloseTo(der.z, 5);
  });

  it('el cono sigue a su caja: los dos giran con el mismo grupo', () => {
    // El cono giraba sobre Z mientras la caja giraba sobre Y, asi que cada
    // cono apuntaba a un sitio distinto y el par no se leia como un par.
    obj.updateMatrixWorld(true);
    const eje = (n: string) => {
      const o = obj.getObjectByName(n)!;
      return new THREE.Vector3(0, 0, 1).applyQuaternion(o.getWorldQuaternion(new THREE.Quaternion()));
    };
    const ejeCaja = eje('caja-izq');
    // El cono esta tumbado 90 grados para mirar a +z, asi que su eje propio es
    // el Y local; lo que se compara es hacia donde apunta cada uno.
    const conoIzq = obj.getObjectByName('cono-izq')!;
    const normalCono = new THREE.Vector3(0, 1, 0)
      .applyQuaternion(conoIzq.getWorldQuaternion(new THREE.Quaternion()));
    expect(normalCono.angleTo(ejeCaja)).toBeLessThan(0.01);

    // Y el par es simetrico: los dos conos convergen el mismo angulo.
    const conoDer = obj.getObjectByName('cono-der')!;
    const normalDer = new THREE.Vector3(0, 1, 0)
      .applyQuaternion(conoDer.getWorldQuaternion(new THREE.Quaternion()));
    expect(normalCono.x).toBeCloseTo(-normalDer.x, 6);
    expect(normalCono.z).toBeCloseTo(normalDer.z, 6);
  });

  it('el cono tiene volumen: no es un disco plano', () => {
    const cono = obj.getObjectByName('cono-izq') as THREE.Mesh;
    cono.geometry.computeBoundingBox();
    const c = cono.geometry.boundingBox!;
    const profundidad = c.max.y - c.min.y;   // el eje del torno, antes de tumbarlo
    const diametro = c.max.x - c.min.x;
    // Un cilindro achatado de 0,09 de alto sobre 0,48 de ancho daba 0,19.
    expect(profundidad / diametro).toBeGreaterThan(0.15);
    expect(cono.geometry.attributes.position.count).toBeGreaterThan(200);
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
