import * as THREE from 'three';

export const LIMITE_MALLAS = 30;
export const LIMITE_TRIANGULOS = 60_000;

export interface Presupuesto {
  mallas: number;
  triangulos: number;
}

/**
 * Cuenta mallas y triángulos de un grafo de escena.
 * No necesita contexto WebGL, así que corre en Node y el presupuesto de
 * §7.4 se puede verificar en cada commit.
 */
export function medirPresupuesto(raiz: THREE.Object3D): Presupuesto {
  let mallas = 0;
  let triangulos = 0;

  raiz.traverse((n) => {
    const m = n as THREE.Mesh & { count?: number };
    if (!m.isMesh || !m.geometry) return;

    mallas += 1;

    const geo = m.geometry as THREE.BufferGeometry;
    const porInstancia = geo.index
      ? geo.index.count / 3
      : geo.attributes.position.count / 3;

    // InstancedMesh dibuja `count` copias de la misma geometría.
    triangulos += porInstancia * (m.count ?? 1);
  });

  return { mallas, triangulos: Math.round(triangulos) };
}
