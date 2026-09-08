import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const motion = () => readFileSync('src/scripts/motion.ts', 'utf8');
const smooth = () => readFileSync('src/components/SmoothScroll.astro', 'utf8');

describe('repertorio de movimiento', () => {
  it('anima transform y opacity, nunca propiedades de layout (G6)', () => {
    const src = motion();
    [/\bwidth:\s*[\d'"]/, /\bheight:\s*[\d'"]/, /\btop:\s*[\d'"]/, /\bleft:\s*[\d'"]/]
      .forEach((p) => expect(src, String(p)).not.toMatch(p));
    expect(src).toMatch(/yPercent:|y:\s*\d/);
    expect(src).toMatch(/opacity:/);
  });

  it('expone la comprobacion de prefers-reduced-motion', () => {
    expect(motion()).toContain('prefers-reduced-motion');
  });

  it('registra ScrollTrigger una sola vez', () => {
    const src = motion();
    expect(src).toContain('gsap.registerPlugin(ScrollTrigger)');
    expect(src).toContain('if (registrado) return');
  });

  it('el titular troceado conserva el texto original para lectores (G8)', () => {
    const src = motion();
    expect(src).toContain('sr-only');
    expect(src).toContain("setAttribute('aria-hidden', 'true')");
  });

  it('la cifra animada muestra el valor final bajo reduce-motion', () => {
    expect(motion()).toMatch(/prefersReducedMotion\(\)\)\s*\{[\s\S]*?textContent\s*=/);
  });
});

describe('SmoothScroll', () => {
  it('no arranca Lenis bajo reduce-motion', () => {
    expect(smooth()).toContain('if (prefersReducedMotion()) return');
  });

  it('se limpia en astro:before-swap para no filtrar entre paginas', () => {
    expect(smooth()).toContain('astro:before-swap');
    expect(smooth()).toContain('astro:page-load');
  });

  it('sincroniza Lenis con ScrollTrigger', () => {
    expect(smooth()).toContain("lenis.on('scroll', ScrollTrigger.update)");
  });
});
