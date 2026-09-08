import { PHI } from '../tokens/escala';

export interface PuntoCamara { x: number; y: number; z: number }

export interface OpcionesEspiral {
  /** Radio en t=0. En t=1 valdrá radioInicial / φ. */
  radioInicial: number;
  /** Vueltas completas alrededor del objeto durante el scroll. */
  vueltas: number;
  alturaInicial: number;
  /** Cuánto sube la cámara entre t=0 y t=1. */
  deltaAltura: number;
}

export const ESPIRAL_POR_DEFECTO: OpcionesEspiral = {
  radioInicial: 6.2,
  vueltas: 1,
  alturaInicial: 0.4,
  deltaAltura: 1.6,
};

/**
 * Punto de la espiral logarítmica de razón φ para un progreso de scroll t.
 *
 *   r(t) = r0 · φ^(−t)
 *   θ(t) = t · 2π · vueltas
 *
 * La cámara gira mientras se acerca: la espiral se cierra sobre el objeto.
 * φ rige el movimiento sin que la espiral llegue a dibujarse nunca en pantalla.
 */
export function puntoEnEspiral(
  t: number,
  o: OpcionesEspiral = ESPIRAL_POR_DEFECTO,
): PuntoCamara {
  const p = Math.min(1, Math.max(0, t));
  const r = o.radioInicial * Math.pow(PHI, -p);
  const theta = p * Math.PI * 2 * o.vueltas;
  return {
    x: r * Math.cos(theta),
    y: o.alturaInicial + p * o.deltaAltura,
    z: r * Math.sin(theta),
  };
}
