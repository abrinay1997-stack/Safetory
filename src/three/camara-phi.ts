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
  /**
   * Ángulo de partida, en radianes. Por defecto π/3: tres cuartos frontales,
   * mirando desde delante y algo a la derecha.
   *
   * No es decorativo, y no es π/2 por dos razones distintas:
   *
   * - Tiene que ser frontal. Los objetos se modelan con su frente hacia +z y
   *   los planos de profundidad se colocan a z negativa, «detrás». Con fase 0
   *   la cámara arranca en +x —de perfil— y los planos quedan de canto.
   * - Pero no de frente exacto. A π/2 la cámara queda en el eje +z y un objeto
   *   con caras planas, como el par de monitores, se dibuja sin una sola
   *   arista en fuga: rectángulos pegados. π/3 da la perspectiva, y de paso
   *   coloca la cámara del lado de la luz principal, que está en +x +z.
   */
  faseInicial: number;
}

export const ESPIRAL_POR_DEFECTO: OpcionesEspiral = {
  radioInicial: 6.2,
  vueltas: 1,
  alturaInicial: 0.4,
  deltaAltura: 1.6,
  faseInicial: Math.PI / 3,
};

/**
 * Punto de la espiral logarítmica de razón φ para un progreso de scroll t.
 *
 *   r(t) = r0 · φ^(−t)
 *   θ(t) = θ0 + t · 2π · vueltas
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
  const theta = (o.faseInicial ?? 0) + p * Math.PI * 2 * o.vueltas;
  return {
    x: r * Math.cos(theta),
    y: o.alturaInicial + p * o.deltaAltura,
    z: r * Math.sin(theta),
  };
}
