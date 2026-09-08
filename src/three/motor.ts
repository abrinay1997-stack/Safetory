import * as THREE from 'three';
import { puntoEnEspiral, ESPIRAL_POR_DEFECTO, type OpcionesEspiral } from './camara-phi';
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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const escena = new THREE.Scene();
  escena.add(o.objeto);
  o.luces.forEach((l) => escena.add(l));

  const camara = new THREE.PerspectiveCamera(38, 1, 0.1, 100);

  function medir() {
    const { clientWidth: w, clientHeight: h } = o.contenedor;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    camara.aspect = w / h;
    camara.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(medir);
  ro.observe(o.contenedor);
  medir();

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
  function medirProgreso() {
    const r = o.contenedor.getBoundingClientRect();
    progreso = Math.min(1, Math.max(0, -r.top / Math.max(r.height, 1)));
  }
  window.addEventListener('scroll', medirProgreso, { passive: true });
  medirProgreso();

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
