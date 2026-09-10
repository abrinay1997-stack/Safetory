/**
 * Las fotografías que recorren el pasillo de «En la Zona».
 *
 * Son las del estudio de verdad, las mismas que están al fondo de las
 * secciones, recortadas a la proporción de las tarjetas. Cuando lleguen las
 * del cliente se añaden aquí y la sección se rehace sola: el número de
 * tarjetas sale de esta lista.
 *
 * El pasillo entero es decorativo —va `aria-hidden`—, así que el texto
 * alternativo no llega a leerse. Se guarda igualmente porque describe qué es
 * cada archivo, y porque el día que estas fotos se usen en otro sitio hará
 * falta.
 */
export interface FotoZona {
  src: string;
  alt: string;
}

export const fotosZona: FotoZona[] = [
  { src: '/zona/sala.webp', alt: 'La sala del Studio 1' },
  { src: '/zona/microfono.webp', alt: 'El micrófono de condensador en su suspensión' },
  { src: '/zona/ciclorama.webp', alt: 'El ciclorama de curva infinita' },
  { src: '/zona/interfaz.webp', alt: 'La mesa de control' },
  { src: '/zona/lounge.webp', alt: 'La zona de estar del estudio' },
  { src: '/zona/sala-ancha.webp', alt: 'La sala vista de lado a lado' },
];
