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
  // Alto antes de tocar nada: es la vara de medir de la comprobacion de abajo.
  const altoAntes = el.getBoundingClientRect().height;

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

  // `words,chars` y no solo `chars`: con los caracteres sueltos como
  // inline-block, la linea puede romper entre dos letras cualesquiera y los
  // titulares partian palabras por la mitad («en / cuentra»). Agrupados en
  // palabras, el salto vuelve a caer donde debe.
  const partido = new SplitType(visible, { types: 'words,chars' });

  /**
   * El troceo puede re-romper las lineas, y entonces el titular crece.
   *
   * SplitType envuelve cada palabra en un `inline-block`, y con eso el reparto
   * de la linea deja de ser exactamente el del texto suelto: medido en el
   * peor caso —la tipografia real todavia sin llegar y el navegador pintando
   * con la de respaldo— «Safetory Studio» pasaba de dos lineas a tres, el h1
   * de 125 a 188 px y el bloque del heroe, que esta anclado por abajo, se
   * desplazaba 54 px. **0,034 de CLS, todo de una vez**, y en el momento
   * peor: despues del primer pintado.
   *
   * Asi que el troceo se comprueba a si mismo. Si la caja no mide lo mismo
   * despues, se deshace y el titular se anima entero: se pierde el escalonado
   * carácter a carácter en ese caso concreto, que es justo el caso en el que
   * nadie lo estaba viendo bien.
   */
  if (Math.abs(el.getBoundingClientRect().height - altoAntes) > 1) {
    partido.revert();
    visible.textContent = original;
    apuntar(gsap.from(el, {
      yPercent: 8,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 82%', once: true },
    }));
    return;
  }

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
