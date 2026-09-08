import * as THREE from 'three';
import { metalOscuro, blancoDifuso, emisivoAcento } from '../materiales';

const SEPARACION = 1.15;

/**
 * Par de monitores de campo cercano. Objeto protagonista de `/estudio`.
 * Van en estéreo real: uno a cada lado del origen, para que la cámara
 * pase entre ellos al cerrarse la espiral.
 */
export function crear(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'monitores';

  ([-1, 1] as const).forEach((lado) => {
    const sufijo = lado === -1 ? 'izq' : 'der';
    const x = lado * SEPARACION;

    const caja = new THREE.Mesh(
      new THREE.BoxGeometry(0.62, 0.95, 0.5),
      metalOscuro(),
    );
    caja.name = `caja-${sufijo}`;
    caja.position.set(x, 0, 0);
    caja.rotation.y = -lado * 0.22; // ligeramente giradas hacia el punto de escucha
    g.add(caja);

    const cono = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.24, 0.09, 28),
      blancoDifuso(),
    );
    cono.name = `cono-${sufijo}`;
    cono.position.set(x + lado * 0.02, -0.16, 0.26);
    cono.rotation.x = Math.PI / 2;
    cono.rotation.z = -lado * 0.22;
    g.add(cono);

    const tweeter = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 16, 12),
      blancoDifuso(),
    );
    tweeter.name = `tweeter-${sufijo}`;
    tweeter.position.set(x + lado * 0.02, 0.26, 0.26);
    g.add(tweeter);

    const puerto = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.12, 16, 1, true),
      metalOscuro(),
    );
    puerto.name = `puerto-${sufijo}`;
    puerto.position.set(x, -0.36, 0.22);
    puerto.rotation.x = Math.PI / 2;
    g.add(puerto);
  });

  // Testigo de encendido: el único punto de acento de la escena.
  const testigo = new THREE.Mesh(
    new THREE.SphereGeometry(0.035, 12, 10),
    emisivoAcento(),
  );
  testigo.name = 'testigo';
  testigo.position.set(-SEPARACION, -0.4, 0.27);
  g.add(testigo);

  return g;
}
