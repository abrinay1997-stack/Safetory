/**
 * «En la Zona»: la serie del propio estudio.
 *
 * Cada tarjeta es una pieza que Safetory ya publicó — lleva el rótulo «EN LA
 * ZONA», el wordmark, el nombre de quien sale y a qué se dedica, todo dentro
 * de la propia imagen. Las aportó el cliente el 2026-09-10, en `Imagenes/`.
 *
 * Los nombres y los oficios de aquí están **leídos de las tarjetas**, no
 * inventados ni deducidos de la cara de nadie (regla 1). Sirven para dos
 * cosas: saber qué archivo es cuál sin abrirlo, y tener la lista escrita el
 * día que el cliente quiera acreditarlos en texto — hoy no lo están, porque el
 * pasillo va `aria-hidden` y sus nombres solo existen dentro de la imagen.
 *
 * Se recortan a 420×525, que es la proporción nativa de la pieza (4:5): así no
 * se pierde ni el rótulo de arriba ni el nombre de abajo. `scripts/zona-webp.mjs`.
 */
export interface FotoZona {
  src: string;
  /** Quién sale, tal y como lo escribe la tarjeta. */
  nombre: string;
  /** Su oficio, tal y como lo escribe la tarjeta. */
  rol: string;
}

export const fotosZona: FotoZona[] = [
  { src: '/zona/karol-wilson.webp', nombre: 'KAROL WILSON', rol: 'artista' },
  { src: '/zona/five-7.webp', nombre: 'FIVE 7', rol: 'artista' },
  { src: '/zona/kays.webp', nombre: 'KAYS', rol: 'artista' },
  { src: '/zona/ngpa.webp', nombre: 'NGPA', rol: 'artista' },
  { src: '/zona/el10.webp', nombre: 'EL10', rol: 'artista' },
  { src: '/zona/kabliz.webp', nombre: 'KABLIZ', rol: 'artista' },
  { src: '/zona/mariana-hidalgo.webp', nombre: 'MARIANA HIDALGO', rol: 'creador digital' },
  { src: '/zona/twelvevii.webp', nombre: 'TWELVEVII', rol: 'artista' },
  { src: '/zona/yonmaik.webp', nombre: 'YONMAIK', rol: 'artista' },
  { src: '/zona/elay.webp', nombre: 'ELAY', rol: 'artista' },
  { src: '/zona/tommy-fraser.webp', nombre: 'TOMMY FRASER', rol: 'artista' },
  { src: '/zona/otto.webp', nombre: 'OTTO', rol: 'artista' },
  { src: '/zona/emmxnuel.webp', nombre: 'EMMXNUEL', rol: 'artista' },
  { src: '/zona/victormars.webp', nombre: 'VICTORMARS', rol: 'dj' },
  { src: '/zona/yungses.webp', nombre: 'YUNGSES', rol: 'productor' },
  { src: '/zona/rigosaxx.webp', nombre: 'RIGOSAXX', rol: 'artista' },
];
