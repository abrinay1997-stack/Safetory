import * as THREE from 'three';
import { metalOscuro } from '../materiales';
import { ruta } from '../../data/rutas';

/** Único sitio donde se escribe la ruta del wordmark. */
export const RUTA_WORDMARK = '/escena/wordmark.webp';

/**
 * El rótulo retroiluminado que cuelga en la pared del Studio 1.
 * Objeto protagonista de `/contacto` y cierre del sitio: el letrero
 * se enciende al llegar la cámara.
 *
 * El wordmark va como textura, no como geometría de texto: cargar una
 * tipografía en formato three cuesta cientos de kilobytes y aquí basta
 * con el logotipo real del cliente convertido a WebP con transparencia.
 *
 * El cargador entra por parámetro, igual que en `crearPlanosProfundidad`.
 * `TextureLoader.load` crea un `<img>` y por tanto necesita `document`: sin
 * esta puerta, el objeto no se puede instanciar en Node y su archivo de tests
 * ni siquiera llega a cargarse — que es como se descubrió, con vitest dando
 * «20 de 21 ficheros» y todos los tests contados en verde.
 */
export function crear(cargador?: THREE.TextureLoader): THREE.Group {
  const g = new THREE.Group();
  g.name = 'rotulo';

  const marco = new THREE.Mesh(
    new THREE.BoxGeometry(3.0, 1.05, 0.14),
    metalOscuro(),
  );
  marco.name = 'marco';
  g.add(marco);

  // `ruta()` y no la constante a pelo: el preview de GitHub Pages sirve desde
  // /Safetory, asi que la ruta absoluta daba 404. `TextureLoader` no avisa
  // cuando el archivo no esta, de modo que el panel se dibujaba liso y el
  // logotipo desaparecia al cruzar del poster al canvas — sin un solo error en
  // consola. Es la cuarta vez que este mismo defecto aparece en el proyecto.
  const textura = (cargador ?? new THREE.TextureLoader()).load(ruta(RUTA_WORDMARK));
  textura.colorSpace = THREE.SRGBColorSpace;

  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(2.78, 0.86),
    new THREE.MeshStandardMaterial({
      map: textura,
      transparent: true,
      emissive: 0xffffff,
      emissiveMap: textura,
      emissiveIntensity: 1.5,
    }),
  );
  panel.name = 'panel';
  panel.position.z = 0.075;
  g.add(panel);

  // Halo: el resplandor que el rótulo proyecta sobre la pared.
  const halo = new THREE.Mesh(
    new THREE.PlaneGeometry(3.9, 1.9),
    new THREE.MeshBasicMaterial({
      color: 0xa9c4ff,
      transparent: true,
      opacity: 0.09,
      depthWrite: false,
    }),
  );
  halo.name = 'halo';
  halo.position.z = -0.12;
  g.add(halo);

  return g;
}
