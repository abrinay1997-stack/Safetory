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

/**
 * Relación del póster WebP de cada ruta. El `<img>` que lo muestra usa
 * `object-fit: cover`.
 */
export const ASPECTO_POSTER = 1280 / 800;

/** Campo de visión vertical de referencia, en grados. */
export const FOV_BASE = 38;

/**
 * Campo vertical que hace que la cámara encuadre igual que `object-fit: cover`.
 *
 * El póster y el canvas ocupan la misma caja, pero encuadraban distinto:
 *
 * - `cover` escala la imagen hasta llenar la caja y RECORTA lo que sobra. En
 *   una pantalla más ancha que el póster, recorta arriba y abajo, y con ello
 *   AGRANDA el objeto.
 * - Una cámara en perspectiva con el campo vertical fijo hace lo contrario:
 *   al ensanchar enseña más a los lados y el objeto se queda igual.
 *
 * Resultado: el objeto encogía al cruzar del póster al canvas. Medido sobre la
 * home antes del arreglo: −10,5 % en 1440×800 y −9,4 % en 1920×1080. En 16:10
 * —la relación del propio póster— y en móvil coincidían por casualidad, que es
 * la razón de que ni el presupuesto de CLS ni ninguna captura lo delataran:
 * el salto no mueve ninguna caja del layout, solo el contenido de dentro.
 *
 * `cover` deja ver el mayor rectángulo de la relación del contenedor que cabe
 * dentro del cuadro del póster. Su media altura es `H · min(1, R/A)`, y de ahí
 * sale directamente el campo vertical.
 */
export function fovParaCubrir(
  aspectoContenedor: number,
  fovBase = FOV_BASE,
  aspectoPoster = ASPECTO_POSTER,
): number {
  if (!Number.isFinite(aspectoContenedor) || aspectoContenedor <= 0) return fovBase;
  const factor = Math.min(1, aspectoPoster / aspectoContenedor);
  const mediaBase = Math.tan((fovBase * Math.PI) / 360);
  return (2 * Math.atan(mediaBase * factor) * 180) / Math.PI;
}
