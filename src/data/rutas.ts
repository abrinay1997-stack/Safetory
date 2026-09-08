/**
 * Antepone la ruta base del despliegue a una ruta absoluta interna.
 *
 * El sitio se publica en dos sitios con forma distinta: Netlify lo sirve desde
 * la raíz del dominio y el preview de GitHub Pages desde `/Safetory`. Una ruta
 * escrita a mano funciona en uno y rompe en el otro, y el fallo no se ve en
 * desarrollo: solo aparece después de publicar.
 *
 * `BASE_URL` lo fija Astro en tiempo de build desde `BASE_PATH`. Sin esa
 * variable vale `/` y esta función se comporta como la identidad.
 */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Esquemas y anclas que nunca llevan base. */
const EXTERNA = /^(https?:|mailto:|tel:|data:|#)/;

export function ruta(p: string): string {
  if (EXTERNA.test(p)) return p;
  if (BASE && p.startsWith(`${BASE}/`)) return p;
  if (p === '/') return BASE || '/';
  return `${BASE}${p}`;
}
