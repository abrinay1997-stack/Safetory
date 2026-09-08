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
/** Esquemas y anclas que nunca llevan base. */
const EXTERNA = /^(https?:|mailto:|tel:|data:|#)/;

/**
 * La lógica pura, con la base como parámetro. Se exporta para poder probar
 * las dos ramas —con base y sin ella— desde una misma suite: `BASE_URL` se
 * fija en tiempo de build y un test no puede cambiarla.
 *
 * Es idempotente: aplicarla dos veces sobre el mismo valor no duplica la base.
 */
export function aplicarBase(base: string, p: string): string {
  const b = base.replace(/\/$/, '');
  if (EXTERNA.test(p)) return p;
  if (b && (p === b || p.startsWith(`${b}/`))) return p;
  if (p === '/') return b || '/';
  return `${b}${p}`;
}

export function ruta(p: string): string {
  return aplicarBase(import.meta.env.BASE_URL, p);
}
