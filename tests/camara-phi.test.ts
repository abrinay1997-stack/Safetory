import { describe, it, expect } from 'vitest';
import { PHI } from '../src/tokens/escala';
import {
  puntoEnEspiral, ESPIRAL_POR_DEFECTO, type OpcionesEspiral,
} from '../src/three/camara-phi';

const O: OpcionesEspiral = {
  radioInicial: 10,
  vueltas: 1,
  alturaInicial: 0,
  deltaAltura: 4,
  faseInicial: 0,
};

const radio = (p: { x: number; z: number }) => Math.hypot(p.x, p.z);

describe('espiral áurea', () => {
  it('en t=0 arranca en el radio inicial y la altura inicial', () => {
    const p = puntoEnEspiral(0, O);
    expect(radio(p)).toBeCloseTo(10, 6);
    expect(p.y).toBeCloseTo(0, 6);
  });

  it('en t=1 el radio se ha dividido exactamente por φ', () => {
    const p = puntoEnEspiral(1, O);
    expect(radio(p)).toBeCloseTo(10 / PHI, 6);
  });

  it('la cámara sube linealmente hasta deltaAltura', () => {
    expect(puntoEnEspiral(0.5, O).y).toBeCloseTo(2, 6);
    expect(puntoEnEspiral(1, O).y).toBeCloseTo(4, 6);
  });

  it('el radio decrece de forma monótona: la espiral se cierra', () => {
    let anterior = Infinity;
    for (let t = 0; t <= 1; t += 0.05) {
      const r = radio(puntoEnEspiral(t, O));
      expect(r).toBeLessThan(anterior);
      anterior = r;
    }
  });

  it('recorre una vuelta completa cuando vueltas = 1', () => {
    const inicio = puntoEnEspiral(0, O);
    const fin = puntoEnEspiral(1, O);
    const anguloInicio = Math.atan2(inicio.z, inicio.x);
    const anguloFin = Math.atan2(fin.z, fin.x);
    expect(Math.abs(anguloFin - anguloInicio)).toBeLessThan(1e-6);
  });

  it('acota t fuera del rango [0,1] en vez de extrapolar', () => {
    expect(puntoEnEspiral(-3, O)).toEqual(puntoEnEspiral(0, O));
    expect(puntoEnEspiral(7, O)).toEqual(puntoEnEspiral(1, O));
  });

  it('nunca devuelve NaN', () => {
    for (let t = 0; t <= 1; t += 0.1) {
      const p = puntoEnEspiral(t);
      [p.x, p.y, p.z].forEach((v) => expect(Number.isNaN(v)).toBe(false));
    }
  });

  it('por defecto arranca en tres cuartos frontales, no de perfil ni de frente', () => {
    const p = puntoEnEspiral(0);
    // Frontal: los objetos miran a +z y los planos de profundidad van detrás,
    // a z negativa. Con la cámara en x, los planos quedarían de canto.
    expect(p.z).toBeGreaterThan(0);
    // Pero descentrada: de frente exacto (x = 0) un objeto de caras planas se
    // dibuja sin ninguna arista en fuga. El póster es el LCP de cada ruta.
    expect(p.x).toBeGreaterThan(0);
    const grados = (Math.atan2(p.z, p.x) * 180) / Math.PI;
    expect(grados).toBeGreaterThan(25);
    expect(grados).toBeLessThan(75);
  });

  it('la fase desplaza el ángulo sin tocar el radio', () => {
    const sinFase = puntoEnEspiral(0.3, { ...O, faseInicial: 0 });
    const conFase = puntoEnEspiral(0.3, { ...O, faseInicial: Math.PI / 2 });
    expect(radio(conFase)).toBeCloseTo(radio(sinFase), 9);
    // `atan2` devuelve en (-π, π], asi que la resta cruda de dos angulos da
    // el suplementario cuando la suma pasa de π. Se normaliza antes de medir.
    const crudo = Math.atan2(conFase.z, conFase.x) - Math.atan2(sinFase.z, sinFase.x);
    const giro = Math.atan2(Math.sin(crudo), Math.cos(crudo));
    expect(Math.abs(giro)).toBeCloseTo(Math.PI / 2, 9);
  });

  it('las opciones por defecto colocan la cámara fuera del objeto', () => {
    expect(ESPIRAL_POR_DEFECTO.radioInicial).toBeGreaterThan(1);
    expect(radio(puntoEnEspiral(1))).toBeGreaterThan(1);
  });
});
