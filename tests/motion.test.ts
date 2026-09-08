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

  it('el aria-hidden va al envoltorio, no al titular: el h1 sigue siendo h1', () => {
    const src = motion();
    // Sobre el propio elemento borraba el encabezado del arbol de
    // accesibilidad: el texto se leia, pero la pagina se quedaba sin nivel 1.
    expect(src).not.toContain("el.setAttribute('aria-hidden'");
    expect(src).toContain("visible.setAttribute('aria-hidden', 'true')");
    // Y el texto alterno va dentro del titular, no al lado.
    expect(src).not.toContain('el.after(alterno)');
    expect(src).toContain('el.append(visible, alterno)');
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

  it('libera el callback del ticker de gsap al destruir', () => {
    const src = smooth();
    expect(src).toContain('gsap.ticker.remove(tick)');
    // Una funcion anonima acumularia un callback por navegacion sin liberarse.
    expect(src).not.toMatch(/gsap\.ticker\.add\(\(/);
  });

  it('no monta el sistema dos veces en la carga inicial', () => {
    const src = smooth();
    // astro:page-load ya se dispara en la carga inicial: un segundo mecanismo
    // basado en readyState duplicaba el montaje en toda visita.
    expect(src).not.toContain('readyState');
    expect(src).not.toContain('DOMContentLoaded');
    expect(src).toContain('if (lenis) return');
  });

  it('solo limpia al salir, nunca al entrar', () => {
    const src = smooth();
    // Limpiar al entrar mataria los ScrollTrigger que Reveal acaba de crear.
    const entrada = src.slice(
      src.indexOf('astro:page-load'),
      src.indexOf('astro:before-swap'),
    );
    expect(entrada).not.toContain('destruir');
    expect(entrada).not.toContain('matarTriggers');
  });
});

describe('Reveal', () => {
  const reveal = () => readFileSync('src/components/Reveal.astro', 'utf8');

  it('usa un solo mecanismo de arranque', () => {
    expect(reveal()).not.toContain('readyState');
    expect(reveal()).toContain('astro:page-load');
  });
});

describe('registro de triggers', () => {
  it('mata solo los triggers propios, no los de toda la aplicacion', () => {
    const src = motion();
    // ScrollTrigger.getAll() incluiria los de otros modulos creados en el mismo
    // tick, y gsap.from() los dejaria clavados en opacity 0.
    expect(src).not.toContain('ScrollTrigger.getAll()');
    expect(src).toContain('propios');
  });

  it('las animaciones apuntan su trigger en el registro', () => {
    expect((motion().match(/apuntar\(/g) ?? []).length).toBe(4);
  });

  it('revelarEntrada y contarCifra tienen guarda de idempotencia', () => {
    const src = motion();
    expect(src).toContain("dataset.entrada === 'si'");
    expect(src).toContain("dataset.contada === 'si'");
  });
});
