import * as THREE from 'three';
import { metalOscuro, blancoDifuso, emisivoAcento } from '../materiales';

/**
 * Ciclorama de curva infinita con el foco circular. Objeto protagonista de
 * `/ciclorama` y el único del sitio que no es un aparato sino un espacio.
 * La curva se genera con una LatheGeometry parcial: un cuarto de cilindro que
 * une pared y suelo sin arista visible, que es exactamente lo que hace un
 * ciclorama real.
 */
export function crear(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'ciclorama';

  // Perfil de la transición pared→suelo, de arriba abajo.
  //
  // Un ciclorama es exactamente esto: una pared vertical que se curva hasta
  // quedar horizontal, sin arista donde el ojo pueda agarrarse. La tangente
  // tiene que ser vertical arriba de la curva y horizontal abajo, o el efecto
  // no ocurre. El cuarto de circunferencia va centrado en (RADIO - COVE, 0):
  // en a=0 da (RADIO, 0) con tangente vertical y en a=π/2 da (RADIO - COVE,
  // -ALTO_SUELO) con tangente horizontal.
  const RADIO = 2.6;
  const COVE = 0.9;
  const SUELO_Y = -COVE;

  const perfil: THREE.Vector2[] = [new THREE.Vector2(RADIO, 1.6)];
  for (let i = 0; i <= 12; i++) {
    const a = (i / 12) * (Math.PI / 2);
    perfil.push(new THREE.Vector2(
      RADIO - COVE + Math.cos(a) * COVE,
      -Math.sin(a) * COVE,
    ));
  }

  // El material se prepara antes de montarlo: `mesh.material` es del tipo
  // Material | Material[], y tocarlo después obliga a un cast que oculta
  // errores reales.
  const superficie = blancoDifuso();
  superficie.side = THREE.DoubleSide;

  // El arco arranca en 1,15π y no en 0,15π: asi la pared queda centrada en -z
  // y el hueco del ciclorama mira a +z, que es la convencion del resto de
  // objetos y el lado desde el que arranca la camara. Centrada en +z, la
  // camara veia la pared por fuera y el foco quedaba escondido detras.
  const curva = new THREE.Mesh(
    new THREE.LatheGeometry(perfil, 40, Math.PI * 1.15, Math.PI * 0.7),
    superficie,
  );
  curva.name = 'curva';
  g.add(curva);

  // El suelo tiene que llegar exactamente hasta donde muere la curva, o queda
  // un anillo de vacio entre los dos y el espacio deja de leerse como espacio.
  const suelo = new THREE.Mesh(
    new THREE.CircleGeometry(RADIO - COVE + 0.02, 40),
    blancoDifuso(),
  );
  suelo.name = 'suelo';
  suelo.rotation.x = -Math.PI / 2;
  suelo.position.y = SUELO_Y;
  g.add(suelo);

  // Foco circular tipo panel LED, el que aparece en la fotografía.
  //
  // Es un disco CON grueso, no una cara plana: un panel apuntando al sujeto se
  // ve de canto desde la camara, y como cara plana desaparecia en una linea
  // negra. Con unos milimetros de grueso conserva un borde encendido desde
  // cualquier angulo de la espiral.
  const POSICION_FOCO = new THREE.Vector3(-1.35, 0.5, 1.45);

  // Un orientador auxiliar para no depender del orden de las rotaciones: el
  // aro usa la orientacion de `lookAt` tal cual —su plano ya queda de cara al
  // sujeto— y el disco la gira, porque el eje de un cilindro es Y y no -Z.
  const orientador = new THREE.Object3D();
  orientador.position.copy(POSICION_FOCO);
  orientador.lookAt(0, 0, 0);

  const foco = new THREE.Mesh(
    new THREE.CylinderGeometry(0.44, 0.44, 0.07, 32),
    new THREE.MeshStandardMaterial({
      color: 0xffd9a0,
      emissive: 0xffc98a,
      emissiveIntensity: 1.6,
    }),
  );
  foco.name = 'foco';
  foco.position.copy(POSICION_FOCO);
  foco.quaternion.copy(orientador.quaternion);
  foco.rotateX(Math.PI / 2);
  g.add(foco);

  const aro = new THREE.Mesh(
    new THREE.TorusGeometry(0.46, 0.03, 10, 32),
    metalOscuro(),
  );
  aro.name = 'aro-foco';
  aro.position.copy(POSICION_FOCO);
  aro.quaternion.copy(orientador.quaternion);
  g.add(aro);

  const pie = new THREE.Mesh(
    new THREE.CylinderGeometry(0.022, 0.022, 1.4, 10),
    metalOscuro(),
  );
  pie.name = 'pie';
  pie.position.set(-1.35, -0.2, 1.45);
  g.add(pie);

  // Testigo de grabación: el punto de acento obligatorio (G9). Va montado en
  // el pie del foco y no suelto en el aire, donde se leia como un punto rojo
  // flotando sin sujecion.
  const testigo = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 10), emisivoAcento());
  testigo.name = 'testigo';
  testigo.position.set(-1.35, 0.14, 1.5);
  g.add(testigo);

  return g;
}
