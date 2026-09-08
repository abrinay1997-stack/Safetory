import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { PHI, ESCALA_PHI } from '../src/tokens/escala';
import { contraste } from '../src/tokens/contraste';

const VOID = '#080808';
const BONE = '#EDEAE3';
const ASH  = '#8A8783';
const REC  = '#FF2D2D';

describe('escala áurea', () => {
  it('tiene ocho pasos con los valores exactos del spec', () => {
    expect(ESCALA_PHI).toEqual([10, 16, 26, 42, 68, 110, 178, 288]);
  });

  it('cada paso es el anterior multiplicado por φ, con ±1px de redondeo', () => {
    for (let i = 1; i < ESCALA_PHI.length; i++) {
      expect(Math.abs(ESCALA_PHI[i] - ESCALA_PHI[i - 1] * PHI)).toBeLessThanOrEqual(1);
    }
  });
});

describe('contraste WCAG', () => {
  it('texto principal sobre fondo supera AAA', () => {
    expect(contraste(BONE, VOID)).toBeGreaterThanOrEqual(7);
  });

  it('texto secundario sobre fondo supera AA', () => {
    expect(contraste(ASH, VOID)).toBeGreaterThanOrEqual(4.5);
  });

  it('el acento sobre fondo supera AA', () => {
    expect(contraste(REC, VOID)).toBeGreaterThanOrEqual(4.5);
  });

  it('texto de fondo sobre botón de acento supera AA', () => {
    expect(contraste(VOID, REC)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('global.css no se desvía de la fuente', () => {
  const css = readFileSync('src/styles/global.css', 'utf8');

  it('declara los ocho pasos de la escala', () => {
    ESCALA_PHI.forEach((px, i) => {
      expect(css).toContain(`--phi-${i}: ${px}px;`);
    });
  });

  it('declara los cuatro colores exactos', () => {
    [VOID, BONE, ASH, REC].forEach((hex) => {
      expect(css.toUpperCase()).toContain(hex);
    });
  });

  it('no usa vh en alturas de sección', () => {
    expect(css).not.toMatch(/min-height:\s*100vh/);
  });
});
