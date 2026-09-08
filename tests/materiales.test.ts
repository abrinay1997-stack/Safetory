import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { REC, VOID, metalOscuro, rejilla, emisivoAcento } from '../src/three/materiales';
import { crearLuces } from '../src/three/luces';

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

  it('los planos van detrás del objeto, con opacidad baja (spec §6.4)', () => {
    const src = readFileSync('src/three/planos-profundidad.ts', 'utf8');
    expect(src).toContain('-12');
    expect(src).toContain('-6');
    expect(src).toContain('0.18');
    expect(src).toContain('0.10');
  });
});
