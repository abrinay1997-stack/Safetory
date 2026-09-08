/**
 * Superficie mínima del navegador que necesita la detección.
 * Se aísla en una interfaz para poder probarla en Node sin DOM.
 */
export interface VentanaMinima {
  creaContextoWebGL: () => boolean;
  coincideMedia: (consulta: string) => boolean;
  ahorroDatos: boolean;
  /** `navigator.deviceMemory`. `undefined` si el navegador no lo expone. */
  memoriaGB: number | undefined;
}

export interface Entorno {
  webgl: boolean;
  reduceMotion: boolean;
  ahorroDatos: boolean;
  memoriaSuficiente: boolean;
}

const MEMORIA_MINIMA_GB = 4;

export function detectarEntorno(v: VentanaMinima): Entorno {
  return {
    webgl: v.creaContextoWebGL(),
    reduceMotion: v.coincideMedia('(prefers-reduced-motion: reduce)'),
    ahorroDatos: v.ahorroDatos,
    // Si el navegador no declara memoria, no penalizamos: no saberlo no es
    // lo mismo que saber que es poca.
    memoriaSuficiente: v.memoriaGB === undefined || v.memoriaGB >= MEMORIA_MINIMA_GB,
  };
}

export function debeRenderizar(e: Entorno): boolean {
  return e.webgl && !e.reduceMotion && !e.ahorroDatos && e.memoriaSuficiente;
}

/** Lee el entorno real del navegador. Solo se llama desde el cliente. */
export function entornoDelNavegador(): Entorno {
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean };
    deviceMemory?: number;
  };
  return detectarEntorno({
    creaContextoWebGL: () => {
      try {
        const c = document.createElement('canvas');
        return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
      } catch {
        return false;
      }
    },
    coincideMedia: (q) => window.matchMedia(q).matches,
    ahorroDatos: Boolean(nav.connection?.saveData),
    memoriaGB: nav.deviceMemory,
  });
}
