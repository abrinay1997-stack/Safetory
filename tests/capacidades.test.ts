import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { detectarEntorno, debeRenderizar, type VentanaMinima } from '../src/three/capacidades';

function ventana(p: Partial<VentanaMinima> = {}): VentanaMinima {
  return {
    creaContextoWebGL: () => true,
    coincideMedia: () => false,
    ahorroDatos: false,
    memoriaGB: 8,
    ...p,
  };
}

describe('detección de entorno', () => {
  it('un equipo normal renderiza', () => {
    expect(debeRenderizar(detectarEntorno(ventana()))).toBe(true);
  });

  it('sin contexto WebGL no renderiza', () => {
    expect(debeRenderizar(detectarEntorno(ventana({ creaContextoWebGL: () => false })))).toBe(false);
  });

  it('con prefers-reduced-motion no renderiza (G3)', () => {
    expect(debeRenderizar(detectarEntorno(ventana({ coincideMedia: () => true })))).toBe(false);
  });

  it('con ahorro de datos activo no renderiza', () => {
    expect(debeRenderizar(detectarEntorno(ventana({ ahorroDatos: true })))).toBe(false);
  });

  it('con menos de 4 GB de memoria declarada no renderiza', () => {
    expect(debeRenderizar(detectarEntorno(ventana({ memoriaGB: 2 })))).toBe(false);
  });

  it('con exactamente 4 GB sí renderiza: el umbral es inclusivo', () => {
    expect(debeRenderizar(detectarEntorno(ventana({ memoriaGB: 4 })))).toBe(true);
  });

  it('si el navegador no declara memoria, no se penaliza', () => {
    expect(debeRenderizar(detectarEntorno(ventana({ memoriaGB: undefined })))).toBe(true);
  });
});

describe('motor', () => {
  const src = () => readFileSync('src/three/motor.ts', 'utf8');

  it('limita el devicePixelRatio a 2 (§7.4)', () => {
    expect(src()).toContain('Math.min(window.devicePixelRatio || 1, 2)');
  });

  it('detiene el render fuera de viewport y en pestaña oculta', () => {
    expect(src()).toContain('IntersectionObserver');
    expect(src()).toContain('visibilitychange');
  });

  it('libera geometrias, materiales y contexto al destruir', () => {
    const s = src();
    ['geometry.dispose()', 'instanceof THREE.Texture', 'renderer.dispose()', 'forceContextLoss()']
      .forEach((t) => expect(s, t).toContain(t));
  });

  it('re-arranca el bucle desde el IntersectionObserver cuando entra al viewport', () => {
    const s = src();
    // Extraer la región del IntersectionObserver: desde "const io = new" hasta "io.observe("
    // Así se asegura que solo se verifica el callback del observer, no onVisibilidad
    const ioMatch = s.match(/const io = new IntersectionObserver[\s\S]*?io\.observe\(/);
    expect(ioMatch, 'IntersectionObserver setup not found').toBeTruthy();
    const ioRegion = ioMatch![0];
    // Dentro de esa región debe estar: la asignación de bucleActivo dentro del callback
    expect(ioRegion).toContain('bucleActivo = true');
    expect(ioRegion).toContain('requestAnimationFrame(dibujar)');
  });

  it('devuelve null si el entorno no admite render', () => {
    expect(src()).toContain('if (!debeRenderizar(');
    expect(src()).toContain('return null');
  });
});
