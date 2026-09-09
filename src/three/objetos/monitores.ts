import * as THREE from 'three';
import { metalOscuro, blancoDifuso, emisivoAcento } from '../materiales';

const SEPARACION = 1.15;
/** Giro de cada caja hacia el punto de escucha. */
const CONVERGENCIA = 0.22;

/**
 * Perfil del altavoz de graves, en (radio, profundidad).
 *
 * Un cono de verdad no es un disco: sale de la cesta, sube en la suspensión,
 * baja hacia el centro y remata en la tapa de polvo, que abomba hacia fuera.
 * Antes era un cilindro achatado —`CylinderGeometry(0.2, 0.24, 0.09)`— que a
 * cualquier distancia se leía como un círculo plano pegado a la caja.
 */
const PERFIL_CONO: Array<[number, number]> = [
  [0.000, 0.034],  // cima de la tapa de polvo
  [0.030, 0.030],
  [0.052, 0.014],  // borde de la tapa
  [0.062, 0.006],
  [0.178, -0.052], // la pendiente del cono
  [0.196, -0.044],
  [0.212, -0.028], // corona de la suspensión
  [0.228, -0.046],
  [0.238, -0.056], // asiento en la cesta
];

/** Goma de la suspensión: mate y oscura, para que el cono destaque. */
function goma(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color: 0x161616, metalness: 0.1, roughness: 0.9 });
}

/**
 * Una bocina completa, montada en su propio grupo y mirando a +z.
 *
 * Todo cuelga del grupo y nada se orienta por su cuenta. Antes la caja giraba
 * sobre Y y el cono sobre Z: los dos conos apuntaban a sitios distintos y el
 * par no se leía como un par. Girando solo el grupo, la simetría es una
 * consecuencia de la construcción y no algo que haya que acordarse de mantener.
 */
function bocina(sufijo: string): THREE.Group {
  const g = new THREE.Group();
  g.name = `bocina-${sufijo}`;

  const caja = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.95, 0.5), metalOscuro());
  caja.name = `caja-${sufijo}`;
  g.add(caja);

  // El cono se modela de perfil y se tumba para mirar a +z, como la caja.
  // El perfil se recorre del borde al centro. `LatheGeometry` decide hacia
  // donde miran las normales por el orden de los puntos: escrito al reves
  // —del centro al borde, con la profundidad bajando— el cono quedaba con las
  // caras hacia dentro y desde el frente se veia como un agujero negro.
  const cono = new THREE.Mesh(
    new THREE.LatheGeometry(
      [...PERFIL_CONO].reverse().map(([r, y]) => new THREE.Vector2(r, y)),
      40,
    ),
    blancoDifuso(),
  );
  cono.name = `cono-${sufijo}`;
  cono.rotation.x = Math.PI / 2;
  cono.position.set(0, -0.16, 0.25);
  g.add(cono);

  const suspension = new THREE.Mesh(new THREE.TorusGeometry(0.212, 0.026, 12, 40), goma());
  suspension.name = `suspension-${sufijo}`;
  suspension.position.set(0, -0.16, 0.235);
  g.add(suspension);

  const cesta = new THREE.Mesh(new THREE.TorusGeometry(0.246, 0.016, 10, 44), metalOscuro());
  cesta.name = `cesta-${sufijo}`;
  cesta.position.set(0, -0.16, 0.246);
  g.add(cesta);

  // Tweeter: media esfera, no una bola. Una esfera entera sobresale como una
  // canica pegada al frente.
  const tweeter = new THREE.Mesh(
    new THREE.SphereGeometry(0.058, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    blancoDifuso(),
  );
  tweeter.name = `tweeter-${sufijo}`;
  tweeter.rotation.x = Math.PI / 2;
  tweeter.position.set(0, 0.26, 0.252);
  g.add(tweeter);

  const aroTweeter = new THREE.Mesh(new THREE.TorusGeometry(0.072, 0.012, 10, 32), metalOscuro());
  aroTweeter.name = `aro-tweeter-${sufijo}`;
  aroTweeter.position.set(0, 0.26, 0.25);
  g.add(aroTweeter);

  const puerto = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 0.12, 16, 1, true),
    metalOscuro(),
  );
  puerto.name = `puerto-${sufijo}`;
  puerto.rotation.x = Math.PI / 2;
  puerto.position.set(0, -0.36, 0.22);
  g.add(puerto);

  return g;
}

/**
 * Par de monitores de campo cercano. Objeto protagonista de `/estudio`.
 * Van en estéreo real: uno a cada lado del origen, para que la cámara
 * pase entre ellos al cerrarse la espiral.
 */
export function crear(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'monitores';

  ([-1, 1] as const).forEach((lado) => {
    const b = bocina(lado === -1 ? 'izq' : 'der');
    b.position.x = lado * SEPARACION;
    b.rotation.y = -lado * CONVERGENCIA;
    g.add(b);
  });

  // Testigo de encendido: el único punto de acento de la escena.
  const testigo = new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 10), emisivoAcento());
  testigo.name = 'testigo';
  testigo.position.set(-SEPARACION + 0.2, -0.42, 0.28);
  g.add(testigo);

  return g;
}
