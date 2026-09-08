import * as THREE from 'three';
import { metalOscuro, rejilla, emisivoAcento } from '../materiales';

const BARRAS_JAULA = 6;
const RADIO_JAULA = 0.44;

/**
 * Micrófono de condensador de válvulas con jaula y anillo de acento.
 * Objeto protagonista de `/`. Siete piezas, todas nombradas: el despiece
 * de la Home las mueve por nombre (§8.3).
 */
export function crear(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'microfono';

  const cuerpo = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.32, 1.0, 28),
    metalOscuro(),
  );
  cuerpo.name = 'cuerpo';
  cuerpo.position.y = -0.1;
  g.add(cuerpo);

  const malla = new THREE.Mesh(
    new THREE.CylinderGeometry(0.33, 0.33, 0.62, 28, 1, true),
    rejilla(),
  );
  malla.name = 'rejilla';
  malla.position.y = 0.68;
  g.add(malla);

  const tapa = new THREE.Mesh(new THREE.SphereGeometry(0.33, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), rejilla());
  tapa.name = 'rejilla-tapa';
  tapa.position.y = 0.99;
  g.add(tapa);

  // Jaula: seis barras idénticas en anillo, una sola llamada de dibujado.
  const jaula = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.035, 1.4, 0.035),
    metalOscuro(),
    BARRAS_JAULA,
  );
  jaula.name = 'jaula';
  const m = new THREE.Matrix4();
  for (let i = 0; i < BARRAS_JAULA; i++) {
    const a = (i / BARRAS_JAULA) * Math.PI * 2;
    m.makeTranslation(Math.cos(a) * RADIO_JAULA, 0.42, Math.sin(a) * RADIO_JAULA);
    jaula.setMatrixAt(i, m);
  }
  jaula.instanceMatrix.needsUpdate = true;
  g.add(jaula);

  const anillo = new THREE.Mesh(
    new THREE.TorusGeometry(0.33, 0.035, 12, 32),
    emisivoAcento(),
  );
  anillo.name = 'anillo';
  anillo.position.y = 0.35;
  anillo.rotation.x = Math.PI / 2;
  g.add(anillo);

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.22, 0.2, 20),
    metalOscuro(),
  );
  base.name = 'base';
  base.position.y = -0.72;
  g.add(base);

  [0.9, -0.05].forEach((y, i) => {
    const aro = new THREE.Mesh(
      new THREE.TorusGeometry(RADIO_JAULA + 0.02, 0.022, 10, 36),
      metalOscuro(),
    );
    aro.name = i === 0 ? 'aro-superior' : 'aro-inferior';
    aro.position.y = y;
    aro.rotation.x = Math.PI / 2;
    g.add(aro);
  });

  return g;
}
