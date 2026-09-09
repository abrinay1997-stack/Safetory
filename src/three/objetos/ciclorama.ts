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

  // Es, con diferencia, el objeto mas grande de los seis: los otros caben en
  // dos unidades y este es un espacio de mas de cinco. A la escala de los
  // demas desbordaba el encuadre por arriba y dejaba el tripode fuera de
  // cuadro. Se reduce y se baja, porque su centro visual esta muy por encima
  // del origen —la pared sube a 2,4 y el suelo baja a -0,9— y la camara mira
  // al origen.
  g.scale.setScalar(0.6);
  g.position.y = -0.35;

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

  // Mas alto que ancho de lo que era: con 1,6 de alto sobre 4,6 de cuerda el
  // fondo se leia como una franja tumbada. A 2,4 la proporcion se acerca al
  // fondo de un plato fotografico de verdad.
  const perfil: THREE.Vector2[] = [new THREE.Vector2(RADIO, 2.4)];
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
    new THREE.LatheGeometry(perfil, 40, Math.PI * 1.19, Math.PI * 0.62),
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
  // Retirado y fuera del eje. Antes estaba plantado en medio del plato,
  // delante del fondo; luego, al mandarlo «atras», cayo justo sobre la linea
  // de vision de la camara de la escena —que arranca en tres cuartos por la
  // derecha— y se comio el encuadre entero. Va alto y al costado, iluminando
  // el fondo desde el borde del cuadro, que es donde se planta de verdad.
  const POSICION_FOCO = new THREE.Vector3(3.3, 1.75, -1.35);

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
    new THREE.CylinderGeometry(0.022, 0.022, 2.1, 10),
    metalOscuro(),
  );
  pie.name = 'pie';
  pie.position.set(3.3, 0.7, -1.35);
  g.add(pie);

  g.add(camaraDeFotos());

  return g;
}

/** Coloca un cilindro entre dos puntos: es como se arma cada pata del trípode. */
function barra(desde: THREE.Vector3, hasta: THREE.Vector3, grosor: number): THREE.Mesh {
  const eje = new THREE.Vector3().subVectors(hasta, desde);
  const m = new THREE.Mesh(
    new THREE.CylinderGeometry(grosor, grosor, eje.length(), 8),
    metalOscuro(),
  );
  m.position.copy(desde).addScaledVector(eje, 0.5);
  // Un cilindro nace apuntando a +y; se gira hasta que apunte al otro punto.
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), eje.clone().normalize());
  return m;
}

/**
 * Cámara de fotos sobre trípode, plantada delante del ciclorama y apuntando a
 * él. Es lo que convierte la escena en un plató reconocible: un fondo curvo
 * solo, sin nada delante, es una pared blanca.
 *
 * Va a la izquierda de la línea de visión de la cámara de la escena, que
 * arranca en tres cuartos por la derecha: en medio taparía el fondo.
 */
const ESCALA_CAMARA = 1.4;

function camaraDeFotos(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'camara-foto';
  // Fuera de la curva y por delante, pero dentro del cuadro. Pegada al fondo
  // se leia como si estuviera DENTRO del plato; demasiado lejos, se salia por
  // el borde izquierdo. Este es el punto en que se ve entera y por delante.
  g.position.set(-2.25, 0, 3.15);
  // El ciclorama entero va a escala 0,6 y la camara se quedaba diminuta. Se
  // compensa en parte: una camara de fotos es pequena al lado de un plato,
  // pero tiene que reconocerse.
  g.scale.setScalar(ESCALA_CAMARA);
  // Encarada al centro del ciclorama.
  g.rotation.y = Math.atan2(-g.position.x, -g.position.z) + Math.PI;

  // El suelo del plato esta a -0,9 en el sistema del ciclorama, pero este
  // grupo va escalado: las patas tienen que dibujarse en SU escala para
  // acabar apoyadas donde toca. Con el valor sin dividir, atravesaban el
  // suelo un 40 %.
  const ALTURA_SUELO = -0.9 / ESCALA_CAMARA;
  const hub = new THREE.Vector3(0, 0.15, 0);

  // Tres patas abiertas hasta el suelo.
  [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].forEach((a, i) => {
    const pata = barra(
      hub,
      new THREE.Vector3(Math.cos(a) * 0.42, ALTURA_SUELO, Math.sin(a) * 0.42),
      0.018,
    );
    pata.name = `pata-${i}`;
    g.add(pata);
  });

  const columna = barra(hub, new THREE.Vector3(0, 0.34, 0), 0.022);
  columna.name = 'columna';
  g.add(columna);

  const cuerpo = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.21, 0.19), metalOscuro());
  cuerpo.name = 'cuerpo-camara';
  cuerpo.position.set(0, 0.44, 0);
  g.add(cuerpo);

  const objetivo = new THREE.Mesh(
    new THREE.CylinderGeometry(0.075, 0.085, 0.22, 20),
    metalOscuro(),
  );
  objetivo.name = 'objetivo';
  objetivo.rotation.x = Math.PI / 2;
  objetivo.position.set(0, 0.44, 0.18);
  g.add(objetivo);

  const parasol = new THREE.Mesh(
    new THREE.CylinderGeometry(0.105, 0.082, 0.09, 20, 1, true),
    metalOscuro(),
  );
  parasol.name = 'parasol';
  parasol.rotation.x = Math.PI / 2;
  parasol.position.set(0, 0.44, 0.32);
  g.add(parasol);

  // Testigo de grabación: el punto de acento obligatorio (G9). Va en la
  // cámara, que es donde vive de verdad, y no flotando en el aire.
  const testigo = new THREE.Mesh(new THREE.SphereGeometry(0.026, 12, 10), emisivoAcento());
  testigo.name = 'testigo';
  testigo.position.set(0.1, 0.55, 0.06);
  g.add(testigo);

  return g;
}
