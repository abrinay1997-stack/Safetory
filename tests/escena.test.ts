import { describe, it, expect } from 'vitest';
import { existsSync, statSync, readFileSync } from 'node:fs';

const src = () => readFileSync('src/components/Escena3D.astro', 'utf8');

describe('isla Escena3D', () => {
  it('el poster es una imagen real, no un canvas vacio: es el LCP (§7.2)', () => {
    const s = src();
    expect(s).toContain('<img');
    expect(s).toContain('fetchpriority="high"');
    expect(s).toContain('loading="eager"');
  });

  it('carga three solo por import dinamico y tras el idle (G5)', () => {
    const s = src();
    // El motor (y con él, three) se carga con un import() dinámico dentro de
    // un await Promise.all — no hay "await import(" pegado como substring
    // literal, pero sigue siendo una carga dinámica y esperada.
    expect(s).toContain('await Promise.all([');
    expect(s).toContain("import('../three/motor')");
    expect(s).toContain('requestIdleCallback');
    expect(s).not.toMatch(/^import \* as THREE/m);
  });

  it('consulta las capacidades ANTES de descargar three (G4, §7.3)', () => {
    const s = src();
    const capacidades = s.indexOf("import('../three/capacidades')");
    const motor = s.indexOf("import('../three/motor')");
    // `capacidades.ts` no importa three; `motor.ts` si. Consultar la deteccion
    // despues —esta dentro de crearMotor— descarga los ~150 KB gz de three
    // para descartarlos acto seguido: verificado en navegador, con
    // prefers-reduced-motion activo se pedian motor.js y three.core.js.
    expect(capacidades).toBeGreaterThan(-1);
    expect(motor).toBeGreaterThan(-1);
    expect(capacidades).toBeLessThan(motor);
    // Y el resultado tiene que cortar el montaje, no solo consultarse.
    expect(s).toContain('if (!debeRenderizar(entornoDelNavegador())) return;');
  });

  it('el canvas queda oculto a la accesibilidad (G8)', () => {
    expect(src()).toContain('aria-hidden="true"');
  });

  it('el poster y las texturas pasan por la ruta base (T23)', () => {
    const s = src();
    expect(s).toContain("from '../data/rutas'");
    expect(s).toContain('ruta(poster)');
    expect(s).toContain('fondos.map((f) => ruta(f))');
    // El poster es el LCP: servido sin base, la pagina publicada en el preview
    // se queda sin su imagen principal y las texturas fallan en silencio.
    expect(s).not.toContain('src={poster}');
  });

  it('poster y canvas ocupan la misma caja: CLS cero', () => {
    const s = src();
    expect(s).toContain('position: absolute');
    expect(s).toContain('inset: 0');
  });

  it('avisa cuando el objeto 3D existe: el despiece no puede adivinarlo', () => {
    const s = src();
    // Esta isla monta dentro de requestIdleCallback, o sea despues de
    // astro:page-load. Sin el aviso, el despiece de la Home leia el objeto
    // antes de que existiera y el unico momento orquestado del sitio no
    // ocurria nunca, sin error ni rastro en consola.
    expect(s).toContain("new CustomEvent('safetory:objeto-listo')");
    expect(s).toContain('__safetoryObjeto3D');
    // Y se retira al salir de la pagina, o la siguiente ruta hereda un objeto
    // de una escena ya destruida.
    expect(s).toContain('delete (window as any).__safetoryObjeto3D');
  });

  it('se destruye en astro:before-swap para no filtrar contextos WebGL', () => {
    expect(src()).toContain('astro:before-swap');
  });

  it('no arranca si el motor devuelve null: se queda en el poster', () => {
    expect(src()).toContain('if (!motor) return');
  });
});

describe('poster de la home', () => {
  it('existe y pesa menos de 60 KB', () => {
    expect(existsSync('public/posters/home.webp')).toBe(true);
    expect(statSync('public/posters/home.webp').size).toBeLessThan(60 * 1024);
  });
});

describe('herramienta de posters', () => {
  it('esta marcada noindex y avisada como interna', () => {
    const s = readFileSync('src/pages/dev/posters.astro', 'utf8');
    expect(s).toContain('noindex');
  });
});
