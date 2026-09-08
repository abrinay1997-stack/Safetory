/** Razón áurea. Rige tipografía, espaciado y recorrido de cámara. */
export const PHI = 1.618033988749895;

/**
 * Progresión geométrica de razón φ, base 16px, redondeada al entero.
 * Sirve a la vez para tamaño de tipo y para espaciado: son la misma escala.
 */
export const ESCALA_PHI = [10, 16, 26, 42, 68, 110, 178, 288] as const;
