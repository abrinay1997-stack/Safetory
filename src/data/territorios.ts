import { tarifasEstudio } from './estudio';
import { cicloramaFoto } from './ciclorama';
import { serviciosProduccion } from './produccion';

export interface Territorio {
  numero: string;
  nombre: string;
  href: string;
  /** Precio de entrada ya formateado. Cadena vacía cuando no hay dato (§9.5). */
  desde: string;
}

const menorPrecio = (precios: (number | null | undefined)[]): number =>
  Math.min(...precios.map((p) => p ?? Infinity));

/**
 * Los cuatro territorios, con su precio de entrada calculado sobre los datos
 * reales de cada ruta.
 *
 * Vive aquí y no en la página porque lo usan dos sitios —la tabla de la home y
 * el pie, que sale en las ocho rutas— y una tarifa escrita a mano en el
 * segundo se queda desfasada en cuanto cambie la primera (G1).
 *
 * La membresía va sin cifra a propósito: el cliente no la ha dado todavía y no
 * se inventa (§9.5). El componente que la pinta escribe «Consultar».
 */
export const territorios: Territorio[] = [
  {
    numero: '01',
    nombre: 'Estudio',
    href: '/estudio',
    desde: `Desde $${menorPrecio(tarifasEstudio.map((t) => t.precio))} la hora`,
  },
  {
    numero: '02',
    nombre: 'Ciclorama',
    href: '/ciclorama',
    desde: `Desde $${cicloramaFoto[0].precio} la hora`,
  },
  {
    numero: '03',
    nombre: 'Producción',
    href: '/produccion',
    desde: `Desde $${menorPrecio(serviciosProduccion.map((s) => s.precio))}`,
  },
  { numero: '04', nombre: 'Membresía', href: '/membresia', desde: '' },
];
