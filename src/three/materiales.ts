import * as THREE from 'three';

/** Acento único del sitio (G9). Idéntico al token CSS --rec. */
export const REC = 0xff2d2d;
export const VOID = 0x080808;

/** Superficie principal: metal casi negro, muy poco brillo. */
export function metalOscuro(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0x0e0e0e,
    metalness: 0.85,
    roughness: 0.42,
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
