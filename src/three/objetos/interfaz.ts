import * as THREE from 'three';
import { metalOscuro, emisivoAcento, blancoDifuso } from '../materiales';

const BOTONES = 8;

/**
 * Interfaz de audio de sobremesa con knob grande. Objeto protagonista de
 * `/produccion`. El knob es la pieza que la escena hace girar con el scroll:
 * es el mando de nivel, y mixing, mastering y grabación son cuestión de nivel.
 */
export function crear(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'interfaz';

  // Inclinada hacia la cámara y a escala de escena.
  //
  // Es el objeto más plano de los seis —16 x 3 x 10 cm a escala real— y la
  // cámara arranca a 0,4 de altura, casi a ras: sin inclinar se veía de canto,
  // como una raya. El giro es POSITIVO: en X positivo la normal de la cara
  // superior se acerca a +z, que es donde está la cámara. En negativo la
  // aleja, que fue el primer intento y dejaba ver la base.
  g.rotation.x = 0.45;
  g.scale.setScalar(1.9);

  const chasis = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.28, 1.05),
    metalOscuro(),
  );
  chasis.name = 'chasis';
  g.add(chasis);

  const knob = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.34, 0.2, 40),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.35, roughness: 0.3 }),
  );
  knob.name = 'knob';
  knob.position.set(0.28, 0.22, 0);
  g.add(knob);

  const anilloKnob = new THREE.Mesh(
    new THREE.TorusGeometry(0.38, 0.018, 10, 40),
    emisivoAcento(),
  );
  anilloKnob.name = 'anillo-knob';
  anilloKnob.position.set(0.28, 0.16, 0);
  anilloKnob.rotation.x = Math.PI / 2;
  g.add(anilloKnob);

  const pantalla = new THREE.Mesh(
    new THREE.PlaneGeometry(0.42, 0.16),
    new THREE.MeshStandardMaterial({
      color: 0x0a0a0a,
      emissive: 0x3d5a4a,
      emissiveIntensity: 0.9,
    }),
  );
  pantalla.name = 'pantalla';
  pantalla.position.set(-0.42, 0.145, 0.1);
  pantalla.rotation.x = -Math.PI / 2;
  g.add(pantalla);

  // Fila de botones: geometría única, ocho instancias, un draw call.
  const botones = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.07, 0.03, 0.05),
    blancoDifuso(),
    BOTONES,
  );
  botones.name = 'botones';
  const m = new THREE.Matrix4();
  for (let i = 0; i < BOTONES; i++) {
    m.makeTranslation(-0.62 + i * 0.09, 0.155, -0.28);
    botones.setMatrixAt(i, m);
  }
  botones.instanceMatrix.needsUpdate = true;
  g.add(botones);

  return g;
}
