/** Una línea de tarifa publicada. `precio: null` = incluido en la membresía. */
export interface Tarifa {
  id: string;
  nombre: string;
  /**
   * Duración real del servicio. Se omite cuando el servicio no se mide en
   * tiempo: mixing y mastering se cobran por trabajo, no por horas, y el
   * estudio no publica plazo de entrega. Inventar uno sería una promesa
   * comercial que nadie ha hecho (G1).
   */
  duracion?: string;
  precio: number | null;
  /**
   * Condición publicada por el estudio, en su redacción final. Se puede
   * corregir ortografía y acentuación; nunca alterar el significado ni
   * añadir compromisos que no estén en la fuente.
   */
  condicion?: string;
}

export interface FranjaHoraria {
  dias: string;
  horas: string;
}
