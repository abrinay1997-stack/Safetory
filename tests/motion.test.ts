import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { soloCodigo } from './util';

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

  it('el troceado agrupa por palabras: si no, la linea parte palabras', () => {
    // Con solo `chars`, cada letra es un inline-block y el salto de linea
    // puede caer entre dos letras: «Donde la innovacion se en / cuentra».
    expect(motion()).toContain("types: 'words,chars'");
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
    // El modulo de movimiento ya no es importacion estatica: se comprueba la
    // guarda tal como esta escrita ahora, contra el matchMedia directo.
    expect(soloCodigo(smooth())).toMatch(/if \(REDUCIDO\(\)\) return/);
    expect(soloCodigo(smooth())).toContain("matchMedia('(prefers-reduced-motion: reduce)')");
  });

  it('se limpia en astro:before-swap para no filtrar entre paginas', () => {
    expect(smooth()).toContain('astro:before-swap');
    expect(smooth()).toContain('astro:page-load');
  });

  it('sincroniza Lenis con ScrollTrigger', () => {
    expect(smooth()).toContain("lenis.on('scroll', motion.ScrollTrigger.update)");
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
    // La guarda de idempotencia sigue estando; lo que cambio es que ahora
    // comparte linea con la de pantalla tactil, donde Lenis no arranca.
    expect(soloCodigo(src)).toMatch(/if \(lenis \|\| ESTACTIL\(\)\) return/);
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
    // Cinco: las tres de siempre, la definicion de `apuntar` y el respaldo del
    // titular que no se puede trocear sin mover la maqueta.
    expect((motion().match(/apuntar\(/g) ?? []).length).toBe(5);
  });

  it('el troceo del titular se comprueba a si mismo', () => {
    // SplitType envuelve cada palabra en un inline-block y con eso el reparto
    // de la linea puede cambiar: medido, el titular de la portada pasaba de
    // 125 a 188 px de alto y el heroe —anclado por abajo— se desplazaba 54.
    // 0,034 de CLS de golpe, y despues del primer pintado.
    const src = soloCodigo(motion());
    expect(src).toContain('const altoAntes = el.getBoundingClientRect().height');
    expect(src).toMatch(/if \(Math\.abs\(el\.getBoundingClientRect\(\)\.height - altoAntes\) > 1\)/);
    expect(src).toContain('partido.revert()');
  });

  it('revelarEntrada y contarCifra tienen guarda de idempotencia', () => {
    const src = motion();
    expect(src).toContain("dataset.entrada === 'si'");
    expect(src).toContain("dataset.contada === 'si'");
  });
});
