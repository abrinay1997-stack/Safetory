/**
 * Superficie mínima del navegador que necesita la detección.
 * Se aísla en una interfaz para poder probarla en Node sin DOM.
 */
export interface VentanaMinima {
  creaContextoWebGL: () => boolean;
  /**
   * Nombre del renderizador de WebGL, si el navegador lo expone.
   * `undefined` cuando la extensión de diagnóstico no está disponible.
   */
  rendererWebGL: () => string | undefined;
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
  /** WebGL existe, pero lo dibuja la CPU. Ver `esPorSoftware`. */
  porSoftware: boolean;
}

const MEMORIA_MINIMA_GB = 4;

/**
 * Rasterizadores por software. Que WebGL exista no significa que haya GPU:
 * cuando Chrome tiene la tarjeta en lista negra —o corre en una máquina
 * virtual— cae en SwiftShader y dibuja con la CPU.
 *
 * Medido con Lighthouse sobre esta misma escena: con GPU el bloqueo del hilo
 * principal es de 20 ms y el rendimiento sale 100; con SwiftShader el bloqueo
 * sube a CIENTO SESENTA SEGUNDOS y el rendimiento cae a 69. No es una escena
 * más lenta, es una página inservible. En ese caso nos quedamos en el póster,
 * que es exactamente la degradación que describe §7.3.
 */
const POR_SOFTWARE = /swiftshader|llvmpipe|software|basic render|mesa offscreen/i;

export function esPorSoftware(nombre: string | undefined): boolean {
  // Sin dato no se penaliza: no saberlo no es lo mismo que saber que es malo,
  // el mismo criterio que con `deviceMemory`.
  return nombre !== undefined && POR_SOFTWARE.test(nombre);
}

export function detectarEntorno(v: VentanaMinima): Entorno {
  return {
    webgl: v.creaContextoWebGL(),
    reduceMotion: v.coincideMedia('(prefers-reduced-motion: reduce)'),
    ahorroDatos: v.ahorroDatos,
    // Si el navegador no declara memoria, no penalizamos: no saberlo no es
    // lo mismo que saber que es poca.
    memoriaSuficiente: v.memoriaGB === undefined || v.memoriaGB >= MEMORIA_MINIMA_GB,
    porSoftware: esPorSoftware(v.rendererWebGL()),
  };
}

export function debeRenderizar(e: Entorno): boolean {
  return e.webgl && !e.porSoftware && !e.reduceMotion && !e.ahorroDatos && e.memoriaSuficiente;
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
    rendererWebGL: () => {
      try {
        const c = document.createElement('canvas');
        const gl = (c.getContext('webgl2') ?? c.getContext('webgl')) as WebGLRenderingContext | null;
        if (!gl) return undefined;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        if (!ext) return undefined;
        return String(gl.getParameter((ext as { UNMASKED_RENDERER_WEBGL: number }).UNMASKED_RENDERER_WEBGL));
      } catch {
        return undefined;
      }
    },
    coincideMedia: (q) => window.matchMedia(q).matches,
    ahorroDatos: Boolean(nav.connection?.saveData),
    memoriaGB: nav.deviceMemory,
  });
}
