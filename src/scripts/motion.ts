import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

export { gsap, ScrollTrigger };

let registrado = false;

/**
 * Registro propio de ScrollTrigger. Si se usan todos los triggers de la app,
 * matarlos destruye tambien los que otro modulo acaba de crear en el mismo tick.
 * Cada trigger creado aqui se apunta, y solo se matan los propios.
 */
const propios: ScrollTrigger[] = [];

function apuntar(tween: gsap.core.Tween): void {
  const t = tween.scrollTrigger;
  if (t) propios.push(t);
}

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
  propios.forEach((t) => t.kill());
  propios.length = 0;
}

/**
 * Titular revelado caracter a caracter.
 * El texto original permanece en el DOM dentro de un .sr-only, de modo que el
 * troceado nunca degrada la lectura por lector de pantalla (G8).
 *
 * Lo que se trocea y se oculta es un envoltorio interno, NUNCA el elemento que
 * se pasa. Poniendo `aria-hidden` sobre el propio `<h1>` el texto seguia
 * leyendose —desde el `.sr-only` que se colocaba al lado— pero como texto
 * suelto: el encabezado desaparecia del arbol de accesibilidad y la pagina se
 * quedaba sin nivel 1. La regla 7 pide jerarquia semantica real, no solo que
 * las palabras esten en el DOM.
 */
export function revelarTitular(el: HTMLElement): void {
  if (prefersReducedMotion()) return;
  if (el.dataset.partido === 'si') return;

  const original = el.textContent ?? '';

  const visible = document.createElement('span');
  visible.className = 'titular__visible';
  visible.textContent = original;
  visible.setAttribute('aria-hidden', 'true');

  const alterno = document.createElement('span');
  alterno.className = 'sr-only';
  alterno.textContent = original;

  // Los dos van DENTRO del titular: asi el elemento conserva su papel y toma
  // su nombre accesible del texto alterno.
  el.textContent = '';
  el.append(visible, alterno);
  el.dataset.partido = 'si';

  const partido = new SplitType(visible, { types: 'chars' });

  apuntar(gsap.from(partido.chars, {
    yPercent: 110,
    opacity: 0,
    duration: 0.9,
    ease: 'power3.out',
    stagger: 0.018,
    scrollTrigger: { trigger: el, start: 'top 82%', once: true },
  }));
}

/** Entrada sobria y escalonada. Solo transform y opacity. */
export function revelarEntrada(els: HTMLElement[]): void {
  if (prefersReducedMotion() || els.length === 0) return;
  if (els[0].dataset.entrada === 'si') return;
  els[0].dataset.entrada = 'si';

  apuntar(gsap.from(els, {
    y: 24,
    opacity: 0,
    duration: 0.7,
    ease: 'power2.out',
    stagger: 0.06,
    scrollTrigger: { trigger: els[0], start: 'top 85%', once: true },
  }));
}

/** Cifra de tarifa que cuenta hasta su valor. No toca el layout. */
export function contarCifra(el: HTMLElement, hasta: number): void {
  if (el.dataset.contada === 'si') return;
  el.dataset.contada = 'si';

  if (prefersReducedMotion()) {
    el.textContent = `$${hasta}`;
    return;
  }
  const estado = { valor: 0 };
  apuntar(gsap.to(estado, {
    valor: hasta,
    duration: 1.1,
    ease: 'power2.out',
    onUpdate: () => { el.textContent = `$${Math.round(estado.valor)}`; },
    scrollTrigger: { trigger: el, start: 'top 88%', once: true },
  }));
}
