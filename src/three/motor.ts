import * as THREE from 'three';
import {
  puntoEnEspiral, ESPIRAL_POR_DEFECTO, fovParaCubrir, FOV_BASE, type OpcionesEspiral,
} from './camara-phi';
import { debeRenderizar, entornoDelNavegador } from './capacidades';

export interface OpcionesMotor {
  canvas: HTMLCanvasElement;
  contenedor: HTMLElement;
  /** Creado por quien llama. Propiedad transferida: `crearMotor` lo añade a la escena
   * y `destruir()` lo libera. No reutilizar instancias entre montajes. */
  objeto: THREE.Group;
  /** Creados por quien llama. Propiedad transferida: `crearMotor` los añade a la escena
   * y `destruir()` los libera. No reutilizar instancias entre montajes. */
  luces: THREE.Light[];
  espiral?: OpcionesEspiral;
  /** Se llama tras el primer frame dibujado: dispara el cross-fade del póster. */
  alListo: () => void;
}

export interface Motor {
  destruir(): void;
}

/**
 * Monta una escena y la mantiene viva mientras esté en pantalla.
 * Devuelve null cuando el entorno no admite WebGL o el usuario pidió
 * menos movimiento: en ese caso la página se queda en el póster (§7.3).
 */
export function crearMotor(o: OpcionesMotor): Motor | null {
  if (!debeRenderizar(entornoDelNavegador())) return null;

  const espiral = o.espiral ?? ESPIRAL_POR_DEFECTO;

  const renderer = new THREE.WebGLRenderer({
    canvas: o.canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  /**
   * Densidad de pintado, con techo distinto en teléfono y en escritorio.
   *
   * Un móvil moderno declara `devicePixelRatio` 3: a tope, un lienzo de 390
   * puntos son 1170 píxeles de ancho y **el triple de trabajo por fotograma**
   * que a densidad 1. La escena es una silueta oscura sobre negro, sin texto
   * ni detalle fino, así que la diferencia entre 1,5 y 3 no se ve — y sí se
   * nota en la batería y en la temperatura del aparato, que es lo que acaba
   * frenando al teléfono a los treinta segundos.
   */
  const TECHO_DENSIDAD = window.matchMedia('(pointer: coarse)').matches ? 1.5 : 2;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, TECHO_DENSIDAD));

  const escena = new THREE.Scene();
  escena.add(o.objeto);
  o.luces.forEach((l) => escena.add(l));

  const camara = new THREE.PerspectiveCamera(FOV_BASE, 1, 0.1, 100);

  function medir() {
    const { clientWidth: w, clientHeight: h } = o.contenedor;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    camara.aspect = w / h;
    // El campo vertical se ajusta para encuadrar igual que el `object-fit:
    // cover` del poster. Sin esto el objeto encoge al cruzar del poster al
    // canvas en toda pantalla mas ancha que 16:10 — ver `fovParaCubrir`.
    camara.fov = fovParaCubrir(camara.aspect);
    camara.updateProjectionMatrix();
  }

  // Progreso de scroll del contenedor, 0..1.
  //
  // 0 cuando el borde superior del contenedor esta en lo alto del viewport, y
  // 1 cuando ha terminado de salir por arriba. Antes se media el recorrido
  // completo por el viewport —de «asomando por abajo» a «fuera por arriba»—,
  // asi que una seccion de 100dvh en lo alto de la pagina arrancaba en 0,5:
  // la mitad de la espiral no se veia nunca y el frame en reposo caia en un
  // angulo lateral que nadie habia compuesto, con los planos de profundidad
  // de canto en vez de al fondo.
  let progreso = 0;
  /**
   * Alto y posición del contenedor, cacheados.
   *
   * `getBoundingClientRect()` obliga al navegador a rehacer la maquetación si
   * hay algo pendiente, y esto se llamaba en CADA evento de scroll: es un
   * reflujo forzado por evento, justo en el camino que Google mide como INP.
   * El contenedor no se mueve mientras se hace scroll —solo al redimensionar,
   * y de eso ya avisa el ResizeObserver—, así que su sitio se guarda una vez
   * y el progreso sale de `scrollY`, que no cuesta maquetación ninguna.
   */
  let arriba = 0;
  let alto = 1;
  function medirCaja() {
    const r = o.contenedor.getBoundingClientRect();
    arriba = r.top + window.scrollY;
    alto = Math.max(r.height, 1);
  }
  function medirProgreso() {
    progreso = Math.min(1, Math.max(0, (window.scrollY - arriba) / alto));
  }
  window.addEventListener('scroll', medirProgreso, { passive: true });
  medirCaja();
  medirProgreso();

  const ro = new ResizeObserver(() => {
    medir();
    // La caja cacheada del progreso se vuelve a medir aqui, que es el unico
    // momento en el que puede haber cambiado.
    medirCaja();
    medirProgreso();
  });
  ro.observe(o.contenedor);
  medir();

  let visible = false;
  let bucleActivo = false;
  const io = new IntersectionObserver(
    (e) => {
      visible = e[0]?.isIntersecting ?? false;
      // Re-arrancar el bucle si entra en viewport y la pestaña es visible
      if (visible && pestanaVisible && !bucleActivo) {
        bucleActivo = true;
        raf = requestAnimationFrame(dibujar);
      }
    },
    { threshold: 0.01 },
  );
  io.observe(o.contenedor);

  let pestanaVisible = document.visibilityState === 'visible';
  const onVisibilidad = () => {
    pestanaVisible = document.visibilityState === 'visible';
    // Re-arrancar el bucle si la pestaña vuelve a ser visible
    if (visible && pestanaVisible && !bucleActivo) {
      bucleActivo = true;
      raf = requestAnimationFrame(dibujar);
    }
  };
  document.addEventListener('visibilitychange', onVisibilidad);

  let raf = 0;
  let vivo = true;
  let primerFrame = true;

  // El knob de /produccion gira con el scroll: media vuelta de extremo a
  // extremo. Se resuelve UNA vez y no en cada frame — `getObjectByName`
  // recorre el grafo entero, y hacerlo 60 veces por segundo para una pieza
  // que no cambia de sitio es trabajo tirado. Vale `undefined` en las cinco
  // rutas que no tienen knob, y entonces no cuesta nada.
  const knob = o.objeto.getObjectByName('knob');

  // El disco de /membresia gira en bucle continuo: el acceso de miembro no se
  // detiene. Se resuelve aqui por la misma razon que el knob. La etiqueta
  // cuelga del disco, asi que con una sola rotacion van las dos.
  const disco = o.objeto.getObjectByName('disco');

  function dibujar() {
    if (!bucleActivo || !vivo) return;
    // Detener el bucle si sale del viewport o la pestaña se oculta
    if (!visible || !pestanaVisible) {
      bucleActivo = false;
      return;
    }
    raf = requestAnimationFrame(dibujar);

    const p = puntoEnEspiral(progreso, espiral);
    camara.position.set(p.x, p.y, p.z);
    camara.lookAt(0, 0, 0);

    if (knob) knob.rotation.y = progreso * Math.PI;
    if (disco) disco.rotation.y += 0.006;

    renderer.render(escena, camara);

    if (primerFrame) {
      primerFrame = false;
      o.alListo();
    }
  }
  // Arrancar el bucle solo si el contenedor está visible
  if (visible && pestanaVisible) {
    bucleActivo = true;
    raf = requestAnimationFrame(dibujar);
  }

  return {
    destruir() {
      if (!vivo) return;
      vivo = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('scroll', medirProgreso);
      document.removeEventListener('visibilitychange', onVisibilidad);

      escena.traverse((n) => {
        const m = n as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) {
          mat.forEach((x) => {
            // Material.dispose() no libera texturas asociadas; hacerlo manualmente
            Object.values(x).forEach((v) => {
              if (v instanceof THREE.Texture) v.dispose();
            });
            x.dispose();
          });
        } else if (mat) {
          // Material.dispose() no libera texturas asociadas; hacerlo manualmente
          Object.values(mat).forEach((v) => {
            if (v instanceof THREE.Texture) v.dispose();
          });
          mat.dispose();
        }
      });

      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
