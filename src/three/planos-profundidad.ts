import * as THREE from 'three';

/**
 * Las fotografías del estudio como planos a distinta profundidad detrás del
 * objeto. No son fotografías navegables: son atmósfera, y el paralaje que
 * producen al girar la cámara es geométrico y real (spec §6.4).
 */
const CAPAS = [
  { z: -12, opacidad: 0.18, escala: 26 },
  { z: -6, opacidad: 0.10, escala: 14 },
] as const;

export function crearPlanosProfundidad(rutas: [string, string]): THREE.Group {
  const grupo = new THREE.Group();
  grupo.name = 'planos-profundidad';

  const cargador = new THREE.TextureLoader();

  CAPAS.forEach((capa, i) => {
    const textura = cargador.load(rutas[i]);
    textura.colorSpace = THREE.SRGBColorSpace;

    const plano = new THREE.Mesh(
      new THREE.PlaneGeometry(capa.escala, capa.escala * 0.66),
      new THREE.MeshBasicMaterial({
        map: textura,
        transparent: true,
        opacity: capa.opacidad,
        depthWrite: false,
      }),
    );
    plano.position.z = capa.z;
    plano.name = `plano-${i}`;
    grupo.add(plano);
  });

  return grupo;
}
