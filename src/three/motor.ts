import * as THREE from 'three';
import { puntoEnEspiral, ESPIRAL_POR_DEFECTO, type OpcionesEspiral } from './camara-phi';
import { debeRenderizar, entornoDelNavegador } from './capacidades';

export interface OpcionesMotor {
  canvas: HTMLCanvasElement;
  contenedor: HTMLElement;
  objeto: THREE.Group;
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

  // Progreso de scroll del contenedor, 0..1
  let progreso = 0;
  function medirProgreso() {
    const r = o.contenedor.getBoundingClientRect();
    const recorrido = r.height + window.innerHeight;
    progreso = Math.min(1, Math.max(0, (window.innerHeight - r.top) / recorrido));
  }
  window.addEventListener('scroll', medirProgreso, { passive: true });
  medirProgreso();

  let visible = false;
  const io = new IntersectionObserver(
    (e) => { visible = e[0]?.isIntersecting ?? false; },
    { threshold: 0.01 },
  );
  io.observe(o.contenedor);

  let pestanaVisible = document.visibilityState === 'visible';
  const onVisibilidad = () => { pestanaVisible = document.visibilityState === 'visible'; };
  document.addEventListener('visibilitychange', onVisibilidad);

  let raf = 0;
  let vivo = true;
  let primerFrame = true;

  function dibujar() {
    if (!vivo) return;
    raf = requestAnimationFrame(dibujar);
    if (!visible || !pestanaVisible) return;

    const p = puntoEnEspiral(progreso, espiral);
    camara.position.set(p.x, p.y, p.z);
    camara.lookAt(0, 0, 0);

    renderer.render(escena, camara);

    if (primerFrame) {
      primerFrame = false;
      o.alListo();
    }
  }
  raf = requestAnimationFrame(dibujar);

  return {
    destruir() {
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
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else mat?.dispose();
      });

      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
