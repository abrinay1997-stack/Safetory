import * as THREE from 'three';

/**
 * Las fotografías del estudio como planos a distinta profundidad detrás del
 * objeto. No son fotografías navegables: son atmósfera, y el paralaje que
 * producen al girar la cámara es geométrico y real (spec §6.4).
 *
 * Las texturas de `public/escena` van desenfocadas a propósito (ver
 * `scripts/desenfocar-fondos.mjs`): a 6 y 12 unidades de distancia una cámara
 * real las daría fuera de foco, y nítidas se leían como fotografías pegadas
 * al fondo, con el rótulo del estudio duplicado compitiendo con el titular de
 * la página.
 */
// La escala tiene que cubrir el encuadre desde CUALQUIER angulo de la
// espiral, no solo de frente. Con la camara en tres cuartos el plano se ve
// escorzado —mas estrecho— y con 26 unidades se le veia el borde recto
// cortando el fondo. 52 y 30 lo dejan fuera de cuadro en toda la vuelta.
const CAPAS = [
  { z: -12, opacidad: 0.16, escala: 52 },
  { z: -6, opacidad: 0.09, escala: 30 },
] as const;

export function crearPlanosProfundidad(
  rutas: [string, string],
  cargador?: THREE.TextureLoader
): THREE.Group {
  const grupo = new THREE.Group();
  grupo.name = 'planos-profundidad';

  const cargadorReal = cargador ?? new THREE.TextureLoader();

  CAPAS.forEach((capa, i) => {
    const textura = cargadorReal.load(rutas[i]);
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
