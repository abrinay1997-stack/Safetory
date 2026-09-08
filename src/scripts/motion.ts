import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

export { gsap, ScrollTrigger };

let registrado = false;

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function registrarPlugins(): void {
  if (registrado) return;
  gsap.registerPlugin(ScrollTrigger);
  registrado = true;
}

export function refrescarTriggers(): void {
  ScrollTrigger.refresh();
}

export function matarTriggers(): void {
  ScrollTrigger.getAll().forEach((t) => t.kill());
}

/**
 * Titular revelado caracter a caracter.
 * El texto original permanece en el DOM dentro de un .sr-only, de modo que el
 * troceado nunca degrada la lectura por lector de pantalla (G8).
 */
export function revelarTitular(el: HTMLElement): void {
  if (prefersReducedMotion()) return;
  if (el.dataset.partido === 'si') return;

  const original = el.textContent ?? '';
  const alterno = document.createElement('span');
  alterno.className = 'sr-only';
  alterno.textContent = original;

  const partido = new SplitType(el, { types: 'chars' });
  el.setAttribute('aria-hidden', 'true');
  el.dataset.partido = 'si';
  el.after(alterno);

  gsap.from(partido.chars, {
    yPercent: 110,
    opacity: 0,
    duration: 0.9,
    ease: 'power3.out',
    stagger: 0.018,
    scrollTrigger: { trigger: el, start: 'top 82%', once: true },
  });
}

/** Entrada sobria y escalonada. Solo transform y opacity. */
export function revelarEntrada(els: HTMLElement[]): void {
  if (prefersReducedMotion() || els.length === 0) return;
  gsap.from(els, {
    y: 24,
    opacity: 0,
    duration: 0.7,
    ease: 'power2.out',
    stagger: 0.06,
    scrollTrigger: { trigger: els[0], start: 'top 85%', once: true },
  });
}

/** Cifra de tarifa que cuenta hasta su valor. No toca el layout. */
export function contarCifra(el: HTMLElement, hasta: number): void {
  if (prefersReducedMotion()) {
    el.textContent = `$${hasta}`;
    return;
  }
  const estado = { valor: 0 };
  gsap.to(estado, {
    valor: hasta,
    duration: 1.1,
    ease: 'power2.out',
    onUpdate: () => { el.textContent = `$${Math.round(estado.valor)}`; },
    scrollTrigger: { trigger: el, start: 'top 88%', once: true },
  });
}
