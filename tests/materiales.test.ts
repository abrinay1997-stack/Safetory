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

  it('el metal oscuro no es un metal puro: sin entorno se dibujaría negro', () => {
    const m = metalOscuro();
    // La escena no lleva mapa de entorno (spec §6.3) y en el modelo físico de
    // Three.js un metal no tiene difusa: con metalness alta la superficie
    // queda más oscura que el fondo --void y el póster LCP sale negro.
    // Medido antes del arreglo: luminancia 4,6 sobre un fondo de 8.
    expect(m.metalness).toBeLessThan(0.5);
    // Sigue siendo mate: el diseño pide penumbra, no un espejo.
    expect(m.roughness).toBeGreaterThan(0.3);
  });

  it('el color base del metal es más claro que el fondo, o no hay silueta', () => {
    // Sin esta diferencia el objeto no se separa de --void y la escena
    // entera se lee como un rectángulo negro.
    const canal = (hex: number) => [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
    const luz = (hex: number) => {
      const [r, g, b] = canal(hex);
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    expect(luz(metalOscuro().color.getHex())).toBeGreaterThan(luz(VOID));
  });

  it('la rejilla es transparente para dejar ver la malla', () => {
    expect(rejilla().transparent).toBe(true);
  });

  it('el emisivo de acento emite en --rec', () => {
    expect(emisivoAcento().emissive.getHex()).toBe(REC);
  });
});

describe('luces', () => {
  it('son exactamente cuatro: direccional, acento, contorno y ambiente', () => {
    const nombres = crearLuces('ambar').map((l) => l.name);
    expect(nombres).toEqual(['ambiente-direccional', 'acento', 'contorno', 'ambiente']);
  });

  it('la luz de contorno viene de detrás del objeto: es lo que da el filo', () => {
    const contorno = crearLuces('ambar').find((l) => l.name === 'contorno');
    // Delante del objeto no separaría la silueta del fondo, que es su único
    // trabajo. La cámara mira desde z positiva (camara-phi).
    expect(contorno).toBeDefined();
    expect(contorno!.position.z).toBeLessThan(0);
  });

  it('el contorno es el mismo en las cuatro rutas: no es carácter, es lectura', () => {
    const colores = (['ambar', 'ambar-apagado', 'violeta', 'neutro'] as const)
      .map((t) => crearLuces(t).find((l) => l.name === 'contorno')!.color.getHex());
    expect(new Set(colores).size).toBe(1);
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

    const plano0 = grupo.children[0] as THREE.Mesh;
    const plano1 = grupo.children[1] as THREE.Mesh;
    expect(plano0.name).toBe('plano-0');
    expect(plano1.name).toBe('plano-1');

    // Los dos van DETRAS del objeto, y a profundidades distintas: si
    // coincidieran no habria paralaje que ganar al girar la camara.
    expect(plano0.position.z).toBeLessThan(0);
    expect(plano1.position.z).toBeLessThan(0);
    expect(plano0.position.z).toBeLessThan(plano1.position.z);

    // Y son atmosfera, no fotografia (spec §6.4): a opacidad alta dejan de
    // ser un fondo y se leen como una imagen pegada detras, con el rotulo del
    // estudio compitiendo con el titular de la pagina.
    const op0 = (plano0.material as THREE.MeshBasicMaterial).opacity;
    const op1 = (plano1.material as THREE.MeshBasicMaterial).opacity;
    [op0, op1].forEach((o) => {
      expect(o).toBeGreaterThan(0);
      expect(o).toBeLessThan(0.25);
    });

    // Verificar que colorSpace se asignó correctamente en ambas texturas
    expect(texturasCargadas).toHaveLength(2);
    expect(texturasCargadas[0].colorSpace).toBe(THREE.SRGBColorSpace);
    expect(texturasCargadas[1].colorSpace).toBe(THREE.SRGBColorSpace);
  });
});
