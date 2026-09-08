/** Una línea de tarifa publicada. `precio: null` = incluido en la membresía. */
export interface Tarifa {
  id: string;
  nombre: string;
  duracion: string;
  precio: number | null;
  /** Condición literal publicada por el estudio. No parafrasear. */
  condicion?: string;
}

export interface FranjaHoraria {
  dias: string;
  horas: string;
}
