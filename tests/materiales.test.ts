import { describe, it, expect, vi } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import * as THREE from 'three';
import { REC, VOID, metalOscuro, rejilla, emisivoAcento } from '../src/three/materiales';
import { crearLuces } from '../src/three/luces';
import { crearPlanosProfundidad } from '../src/three/planos-profundidad';

describe('materiales', () => {
  it('el acento es exactamente el token --rec', () => {
    expect(REC).toBe(0xff2d2d);
    expect(VOID).toBe(0x080808);
  });

  it('el metal oscuro es metálico y poco brillante (spec §6.3)', () => {
    const m = metalOscuro();
    expect(m.metalness).toBeCloseTo(0.85, 2);
    expect(m.roughness).toBeCloseTo(0.42, 2);
  });

  it('la rejilla es transparente para dejar ver la malla', () => {
    expect(rejilla().transparent).toBe(true);
  });

  it('el emisivo de acento emite en --rec', () => {
    expect(emisivoAcento().emissive.getHex()).toBe(REC);
  });
});

describe('luces', () => {
  it('son exactamente tres: direccional, foco de acento y ambiente', () => {
    expect(crearLuces('ambar')).toHaveLength(3);
  });

  it('el foco de acento mantiene --rec en todas las temperaturas (G9)', () => {
    (['ambar', 'ambar-apagado', 'violeta', 'neutro'] as const).forEach((t) => {
      const foco = crearLuces(t).find((l) => l.name === 'acento');
      expect(foco?.color.getHex(), t).toBe(REC);
    });
  });

  it('lo que cambia por ruta es la direccional, no el acento', () => {
    const ambar = crearLuces('ambar').find((l) => l.name === 'ambiente-direccional');
    const violeta = crearLuces('violeta').find((l) => l.name === 'ambiente-direccional');
    expect(ambar?.color.getHex()).not.toBe(violeta?.color.getHex());
  });

  it('no hay entorno HDRI: encarece la descarga sin aportar (spec §6.3)', () => {
    const src = readFileSync('src/three/luces.ts', 'utf8');
    expect(src).not.toContain('RGBELoader');
    expect(src).not.toContain('PMREMGenerator');
  });
});

describe('planos de profundidad', () => {
  it('las seis texturas están en public/escena', () => {
    ['microfono', 'sala', 'sala-ancha', 'ciclorama', 'interfaz', 'lounge']
      .forEach((n) => expect(existsSync(`public/escena/${n}.webp`), n).toBe(true));
  });

  it('construye el Group con profundidad correcta, opacidades y colorSpace', () => {
    // Capturar las texturas devueltas por cada llamada a load
    const texturasCargadas: THREE.Texture[] = [];

    const mockCargador = {
      load: vi.fn((url: string) => {
        const textura = new THREE.Texture();
        textura.colorSpace = THREE.LinearSRGBColorSpace; // estado inicial falso
        texturasCargadas.push(textura);
        return textura;
      }),
    } as unknown as THREE.TextureLoader;

    const rutas: [string, string] = [
      '/escena/microfono.webp',
      '/escena/sala.webp',
    ];

    const grupo = crearPlanosProfundidad(rutas, mockCargador);

    // Verificar que se llamó al cargador con las rutas en orden
    expect(mockCargador.load).toHaveBeenCalledTimes(2);
    expect(mockCargador.load).toHaveBeenNthCalledWith(1, rutas[0]);
    expect(mockCargador.load).toHaveBeenNthCalledWith(2, rutas[1]);

    // Verificar estructura: 2 hijos exactamente
    expect(grupo.children).toHaveLength(2);

    // Plano 0: z = -12, opacidad = 0.18
    const plano0 = grupo.children[0] as THREE.Mesh;
    expect(plano0.position.z).toBe(-12);
    expect((plano0.material as THREE.MeshBasicMaterial).opacity).toBe(0.18);
    expect(plano0.name).toBe('plano-0');

    // Plano 1: z = -6, opacidad = 0.10
    const plano1 = grupo.children[1] as THREE.Mesh;
    expect(plano1.position.z).toBe(-6);
    expect((plano1.material as THREE.MeshBasicMaterial).opacity).toBe(0.10);
    expect(plano1.name).toBe('plano-1');

    // Verificar que colorSpace se asignó correctamente en ambas texturas
    expect(texturasCargadas).toHaveLength(2);
    expect(texturasCargadas[0].colorSpace).toBe(THREE.SRGBColorSpace);
    expect(texturasCargadas[1].colorSpace).toBe(THREE.SRGBColorSpace);
  });
});
