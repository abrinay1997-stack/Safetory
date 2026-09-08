import * as THREE from 'three';
import { REC } from './materiales';

/**
 * Temperatura de la luz ambiental de cada ruta. Reproduce cómo está
 * iluminado el espacio real. NO es un token de interfaz: el acento sigue
 * siendo uno solo (G9).
 */
export type Temperatura = 'ambar' | 'ambar-apagado' | 'violeta' | 'neutro';

const DIRECCIONAL: Record<Temperatura, { color: number; intensidad: number }> = {
  ambar: { color: 0xffc98a, intensidad: 0.55 },
  'ambar-apagado': { color: 0xc9a274, intensidad: 0.38 },
  violeta: { color: 0xa88cff, intensidad: 0.6 },
  neutro: { color: 0xf2f0ec, intensidad: 0.5 },
};

/**
 * Las tres luces de toda escena del sitio. Sin entorno HDRI: no hay
 * superficies pulidas que reflejen y encarecería la descarga (spec §6.3).
 */
export function crearLuces(t: Temperatura): THREE.Light[] {
  const cfg = DIRECCIONAL[t];

  const direccional = new THREE.DirectionalLight(cfg.color, cfg.intensidad);
  direccional.name = 'ambiente-direccional';
  direccional.position.set(1.5, 4, 2);

  // El foco de acento no cambia nunca: es el rojo REC en las seis rutas.
  const acento = new THREE.SpotLight(REC, 14, 18, Math.PI / 5, 0.55, 1.4);
  acento.name = 'acento';
  acento.position.set(-3.2, 1.4, 2.6);

  const ambiente = new THREE.AmbientLight(0x2a2a2a, 0.35);
  ambiente.name = 'ambiente';

  return [direccional, acento, ambiente];
}
