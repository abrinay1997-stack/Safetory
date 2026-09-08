import { describe, it, expect } from 'vitest';
import { existsSync, statSync, readFileSync } from 'node:fs';

const FUENTES = [
  'public/fonts/ClashDisplay-Semibold.woff2',
  'public/fonts/Satoshi-Regular.woff2',
  'public/fonts/Satoshi-Medium.woff2',
];

describe('fuentes auto-hospedadas', () => {
  it('los tres archivos woff2 existen', () => {
    FUENTES.forEach((f) => expect(existsSync(f), f).toBe(true));
  });

  it('ninguna fuente supera los 120 KB', () => {
    FUENTES.forEach((f) => {
      expect(statSync(f).size, f).toBeLessThan(120 * 1024);
    });
  });

  it('global.css declara las tres caras con font-display swap', () => {
    const css = readFileSync('src/styles/global.css', 'utf8');
    expect(css).toContain("font-family: 'Clash Display'");
    expect(css).toContain("font-family: 'Satoshi'");
    expect((css.match(/font-display:\s*swap/g) ?? []).length).toBe(3);
  });

  it('no carga fuentes desde un dominio externo', () => {
    const css = readFileSync('src/styles/global.css', 'utf8');
    expect(css).not.toMatch(/@import\s+url\(['"]?https?:/);
    expect(css).not.toContain('fonts.googleapis.com');
  });
});
