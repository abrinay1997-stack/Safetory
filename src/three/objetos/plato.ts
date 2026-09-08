import * as THREE from 'three';
import { metalOscuro, emisivoAcento, blancoDifuso } from '../materiales';

/**
 * Plato y vinilo del lounge. Objeto protagonista de `/membresia`.
 * El disco gira en bucle continuo: el acceso de miembro no se detiene.
 */
export function crear(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'plato';

  // Inclinado y a escala, por lo mismo que la interfaz de /produccion: es un
  // aparato plano y la cámara arranca casi a su altura, así que sin inclinar
  // se vería de canto. En X positivo la cara superior se acerca a +z.
  g.rotation.x = 0.42;
  g.scale.setScalar(1.5);

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 0.18, 1.7),
    metalOscuro(),
  );
  base.name = 'base';
  base.position.y = -0.12;
  g.add(base);

  const disco = new THREE.Mesh(
    new THREE.CylinderGeometry(0.78, 0.78, 0.014, 64),
    new THREE.MeshStandardMaterial({ color: 0x0b0b0b, metalness: 0.4, roughness: 0.35 }),
  );
  disco.name = 'disco';
  disco.position.y = 0.005;
  g.add(disco);

  // La etiqueta cuelga del disco y no del grupo: así una sola rotación mueve
  // las dos piezas y no pueden desincronizarse nunca.
  const etiqueta = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.24, 0.016, 40),
    emisivoAcento(),
  );
  etiqueta.name = 'etiqueta';
  etiqueta.position.y = 0.003;
  disco.add(etiqueta);

  const eje = new THREE.Mesh(
    new THREE.CylinderGeometry(0.014, 0.014, 0.09, 12),
    blancoDifuso(),
  );
  eje.name = 'eje';
  eje.position.y = 0.05;
  g.add(eje);

  const brazo = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.018, 1.05, 12),
    metalOscuro(),
  );
  brazo.name = 'brazo';
  brazo.position.set(0.62, 0.14, -0.42);
  brazo.rotation.set(0, -0.75, Math.PI / 2);
  g.add(brazo);

  const capsula = new THREE.Mesh(
    new THREE.BoxGeometry(0.09, 0.06, 0.05),
    blancoDifuso(),
  );
  capsula.name = 'capsula';
  capsula.position.set(0.28, 0.09, 0.02);
  g.add(capsula);

  return g;
}
