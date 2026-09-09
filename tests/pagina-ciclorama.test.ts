import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
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

  it('el foco esta fuera del plato, no plantado delante del fondo', () => {
    const foco = obj.getObjectByName('foco')!;
    const suelo = obj.getObjectByName('suelo')!;
    // Un foco de estudio ilumina desde el borde del cuadro. Dentro del plato
    // tapaba el fondo, y sobre la linea de vision de la camara de la escena
    // —que arranca en tres cuartos por la derecha— se comia el encuadre.
    const radioFoco = Math.hypot(foco.position.x, foco.position.z);
    expect(radioFoco).toBeGreaterThan(2.8);
    expect(foco.position.y).toBeGreaterThan(suelo.position.y + 1.5);
  });

  it('hay una camara de fotos apuntando al ciclorama', () => {
    // Un fondo curvo solo, sin nada delante, es una pared blanca. La camara
    // es lo que convierte la escena en un plato reconocible.
    const camara = obj.getObjectByName('camara-foto');
    expect(camara).toBeDefined();
    ['cuerpo-camara', 'objetivo', 'pata-0', 'pata-1', 'pata-2']
      .forEach((n) => expect(camara!.getObjectByName(n), n).toBeDefined());
  });

  it('el tripode se apoya en el suelo, no flota', () => {
    obj.updateMatrixWorld(true);
    const suelo = obj.getObjectByName('suelo')!.getWorldPosition(new THREE.Vector3());
    const caja = new THREE.Box3().setFromObject(obj.getObjectByName('camara-foto')!);
    // Un tripode que no llega al suelo se lee como un objeto colgado.
    expect(Math.abs(caja.min.y - suelo.y)).toBeLessThan(0.08);
  });

  it('el testigo va montado en la camara, no suelto en el aire', () => {
    const testigo = obj.getObjectByName('camara-foto')!.getObjectByName('testigo');
    expect(testigo).toBeDefined();
  });

  it('el fondo es mas alto que ancho de lo que era: proporcion de plato', () => {
    const curva = obj.getObjectByName('curva') as THREE.Mesh;
    curva.geometry.computeBoundingBox();
    const c = curva.geometry.boundingBox!;
    const alto = c.max.y - c.min.y;
    const ancho = c.max.x - c.min.x;
    // Con 1,6 de alto sobre 4,6 de cuerda salia 2,9: una franja tumbada.
    expect(ancho / alto).toBeLessThan(1.7);
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
