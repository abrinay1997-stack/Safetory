import * as THREE from 'three';

/** Acento único del sitio (G9). Idéntico al token CSS --rec. */
export const REC = 0xff2d2d;
export const VOID = 0x080808;

/**
 * Superficie principal: metal oscuro, muy poco brillo.
 *
 * `metalness` se mantiene por debajo de 0,5 a propósito. En el modelo físico
 * de Three.js un metal no tiene componente difusa: todo su color sale de lo
 * que refleja. Como la escena no lleva mapa de entorno (spec §6.3), un metal
 * casi puro no tiene nada que reflejar y se dibuja MÁS OSCURO que el fondo
 * `--void`: medido, el micrófono daba luminancia 4,6 sobre un fondo de 8, y
 * el póster LCP salía negro. Bajar `metalness` devuelve la difusa y con ella
 * la silueta, sin tocar la penumbra que pide el diseño.
 */
export function metalOscuro(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0x1c1c1c,
    metalness: 0.35,
    roughness: 0.45,
  });
}

/** Rejilla de micrófono: malla metálica que deja pasar algo de luz. */
export function rejilla(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0x141414,
    metalness: 0.95,
    roughness: 0.55,
    transparent: true,
    opacity: 0.82,
    side: THREE.DoubleSide,
  });
}

/** Piezas que llevan el acento: anillo del micrófono, testigo de grabación. */
export function emisivoAcento(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: REC,
    emissive: REC,
    emissiveIntensity: 0.65,
    metalness: 0.3,
    roughness: 0.5,
  });
}

/** Superficie blanca mate: conos de monitor, ciclorama, rótulo. */
export function blancoDifuso(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0xe9e6df,
    metalness: 0.05,
    roughness: 0.85,
  });
}
