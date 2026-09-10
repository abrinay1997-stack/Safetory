import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { soloCodigo } from './util';
import { territorios } from '../src/data/territorios';

const RUTAS = ['index', 'estudio', 'ciclorama', 'produccion', 'membresia', 'contacto',
               'privacidad', 'aviso-legal'];
const html = (r: string) => readFileSync(`dist/${r}.html`, 'utf8');

/** Sin acentos, sin numeracion de kicker, sin mayusculas ni espacios de mas. */
function normalizar(t: string): string {
  return t
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/^\s*\d+\s*[·.\-]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/** Texto plano de un fragmento de HTML. */
const texto = (h: string) => normalizar(h.replace(/<[^>]+>/g, ' '));

beforeAll(() => {
  if (!existsSync('dist/index.html')) throw new Error('Ejecuta `npm run build` antes.');
});

describe('la linea pequena no repite el titular', () => {
  it('ningun kicker dice lo mismo que un encabezado de su pagina', () => {
    // El cliente lo leyo como «el titulo escrito dos veces»: en cada heroe
    // habia un `01 · Estudio` encima de un `Studio 1`, y en /contacto un
    // «Donde estamos» que volvia a aparecer identico dos secciones despues.
    const choques: string[] = [];
    RUTAS.forEach((r) => {
      // Se compara DENTRO de cada region: el pie tiene una columna «Contacto»
      // y /contacto un h1 «Contacto», y eso no es una repeticion, son dos
      // sitios distintos de la pagina. Lo que el cliente senalo es la linea
      // pequena pegada encima del titulo, y esa vive en la misma seccion.
      const principal = html(r).split('<main')[1]?.split('</main>')[0] ?? '';
      const regiones = principal.split(/<section\b/).slice(1);
      (regiones.length ? regiones : [principal]).forEach((region) => {
        const kickers = [...region.matchAll(/<p class="kicker[^"]*"[^>]*>(.*?)<\/p>/g)].map((m) => texto(m[1]));
        // Solo el titulo de la seccion: los h3 son fichas de precio, y que una
        // ficha se llame «Ciclorama · fotografia» bajo un rotulo «Fotografia»
        // es contexto, no la repeticion que hay que cazar.
        const titulos = [...region.matchAll(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/g)].map((m) => texto(m[1]));
        kickers.forEach((k) => {
          if (!k) return;
          titulos.forEach((t) => {
            if (t && (k === t || t.includes(k))) choques.push(`${r}: «${k}» ya esta en «${t}»`);
          });
        });
      });
    });
    expect(choques).toEqual([]);
  });

  it('ningun heroe lleva linea pequena', () => {
    // El heroe tiene el h1 a tamano de portada: cualquier cosa encima compite.
    RUTAS.forEach((r) => {
      const heroe = html(r).match(/<div class="hero__texto"[^>]*>[\s\S]*?<\/div>/)?.[0];
      if (!heroe) return;
      expect(heroe, `${r}: el heroe lleva kicker`).not.toContain('class="kicker');
    });
  });
});

describe('el kicker no se cuelga de la esquina', () => {
  it('va en el flujo, no en posicion absoluta', () => {
    // Colgado con `position: absolute` a 110 px del borde, en cuanto el
    // contenido no cabia en la pantalla el titular subia hasta el y se leian
    // encima. Pasaba en catorce secciones de las seis rutas.
    const s = soloCodigo(readFileSync('src/components/Bloque.astro', 'utf8'));
    const regla = s.match(/\.bloque__kicker\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(regla.length, 'no hay regla para el kicker').toBeGreaterThan(0);
    expect(regla).not.toContain('position: absolute');
  });

  it('el kicker vive dentro de la columna del texto', () => {
    // Fuera de ella no hereda ni su ancho ni su lado, que es lo que le hacia
    // falta cuando la fotografia de fondo va a la izquierda.
    const s = readFileSync('src/components/Bloque.astro', 'utf8');
    const mayor = s.slice(s.indexOf('<div class="bloque__mayor"'), s.indexOf('</div>', s.indexOf('<div class="bloque__mayor"')));
    expect(mayor).toContain('bloque__kicker');
  });
});

describe('nada se sale de una pantalla estrecha', () => {
  it('las cifras y los nombres grandes se miden contra el ancho de pantalla', () => {
    // A tamano fijo, «$280» pedia 340 px y «Membresia» mas «Consultar» 356:
    // en un movil de 320 la pagina entera se desplazaba en horizontal.
    const precio = soloCodigo(readFileSync('src/components/PrecioCard.astro', 'utf8'));
    expect(precio).toMatch(/\.precio__cifra\s*\{[^}]*font-size:\s*clamp\(/);
    const territorio = soloCodigo(readFileSync('src/components/Territorio.astro', 'utf8'));
    expect(territorio).toMatch(/@media \(max-width: 599px\)[\s\S]*grid-template-columns: 1fr;/);
    const contacto = soloCodigo(readFileSync('src/pages/contacto.astro', 'utf8'));
    expect(contacto).toMatch(/\.canal\s*\{[^}]*font-size:\s*clamp\(/);
    // Un correo no tiene donde partir: sin esto, la palabra sola desborda.
    expect(contacto).toMatch(/\.canal\s*\{[^}]*overflow-wrap:\s*anywhere/);
  });

  it('ningun texto del sitio baja de 12 px', () => {
    // 10 px con 0,22em de letterspacing no se lee en un movil.
    const global = soloCodigo(readFileSync('src/styles/global.css', 'utf8'));
    expect(global).toMatch(/\.kicker\s*\{[^}]*font-size:\s*max\(var\(--phi-0\), 0\.75rem\)/);
    const nav = soloCodigo(readFileSync('src/components/Nav.astro', 'utf8'));
    const movil = nav.slice(nav.indexOf('@media (max-width: 899px)'));
    expect(movil).not.toMatch(/font-size:\s*var\(--phi-0\)\s*;/);
  });
});

describe('el pie', () => {
  it('acredita a panaclaw entre el copyright y los enlaces legales', () => {
    RUTAS.forEach((r) => {
      const pagina = html(r);
      const enlace = pagina.match(/<a class="pie__autor"[^>]*>[\s\S]*?<\/a>/)?.[0];
      expect(enlace, `${r}: sin credito`).toBeDefined();
      expect(enlace).toContain('href="https://panaclaw.com"');
      expect(enlace).toContain('rel="noopener noreferrer"');
      expect(enlace!.replace(/<[^>]+>/g, '').trim()).toBe('Página creada por panaclaw.com');
      // El orden en el DOM es el orden en que se lee, tambien con lector.
      const copia = pagina.indexOf('pie__copia');
      const autor = pagina.indexOf('pie__autor');
      const legales = pagina.indexOf('pie__legales');
      expect(copia, r).toBeLessThan(autor);
      expect(autor, r).toBeLessThan(legales);
    });
  });

  it('se ordena como la referencia: marca, columnas y linea legal', () => {
    // El marcado, no la hoja de estilos: dejar la regla CSS de una parte que
    // ya no usa nadie deja el aserto en verde sin que el pie la tenga.
    const marcado = readFileSync('src/components/Footer.astro', 'utf8').split('<style>')[0];
    ['pie__marca', 'pie__servicios', 'pie__cta', 'pie__columnas', 'pie__legal']
      .forEach((b) => expect(marcado, b).toContain(b));
    // Y en ese orden, que es como se lee de arriba abajo.
    expect(marcado.indexOf('pie__marca')).toBeLessThan(marcado.indexOf('pie__columnas'));
    expect(marcado.indexOf('pie__columnas')).toBeLessThan(marcado.indexOf('pie__legal'));
  });

  it('los servicios del pie salen de los datos, con su precio', () => {
    // La misma lista que la tabla de la portada: escrita a mano aqui, se
    // queda desfasada en cuanto cambie una tarifa (G1).
    const componente = readFileSync('src/components/Footer.astro', 'utf8');
    expect(componente).toContain("from '../data/territorios'");
    const pie = html('index').slice(html('index').indexOf('<footer'));
    territorios.forEach((t) => {
      expect(pie, t.nombre).toContain(t.nombre);
      if (t.desde) expect(pie, t.desde).toContain(t.desde);
    });
  });
});

describe('presupuesto de arranque en movil', () => {
  const jsInicial = (ruta: string): number => {
    const pagina = html(ruta);
    const entradas = [...pagina.matchAll(/src="([^"]*\/_astro\/[^"]+\.js)"/g)]
      .map((m) => m[1].split('/').pop()!);
    const vistos = new Set<string>();
    const pendientes = [...entradas];
    while (pendientes.length) {
      const archivo = pendientes.pop()!;
      if (vistos.has(archivo)) continue;
      vistos.add(archivo);
      const cuerpo = readFileSync(`dist/_astro/${archivo}`, 'utf8');
      for (const m of cuerpo.matchAll(/(?:^|[;\s}])(?:import|from)\s*"\.\/([^"]+\.js)"/g)) {
        pendientes.push(m[1]);
      }
    }
    return [...vistos].reduce(
      (t, f) => t + gzipSync(readFileSync(`dist/_astro/${f}`)).length, 0);
  };

  it('ninguna ruta arranca con mas de 20 KB gz de JavaScript', () => {
    // El presupuesto de G4 son 140 KB, pero eso es un techo, no una meta: la
    // audiencia llega desde redes sociales, o sea en primera visita y con
    // datos moviles. GSAP, ScrollTrigger, SplitType y Lenis —48 KB, de los
    // que Lighthouse marcaba el 56 % sin usar— se piden despues del primer
    // pintado, y en un telefono el despiece ni siquiera los pide.
    RUTAS.forEach((r) => {
      const kb = jsInicial(r) / 1024;
      expect(kb, `${r}: ${kb.toFixed(1)} KB gz`).toBeLessThanOrEqual(20);
    });
  });

  it('el modulo de movimiento no entra en el arranque de ninguna ruta', () => {
    // Que exista de verdad en algun trozo: si no, el aserto pasaria porque no
    // se ha construido, no porque este bien separado.
    const trozos = readdirSync('dist/_astro').filter((f) => f.endsWith('.js'));
    // `scrollerProxy` y no `ScrollTrigger`: lo segundo aparece tambien en la
    // isla que USA la libreria —`motion.ScrollTrigger.update`, 940 bytes— y el
    // aserto la senalaba a ella en vez de a los 125 KB de la libreria.
    const conGsap = trozos.filter(
      (f) => readFileSync(`dist/_astro/${f}`, 'utf8').includes('scrollerProxy'));
    expect(conGsap.length, 'gsap no aparece en ningun trozo').toBeGreaterThan(0);
    RUTAS.forEach((r) => {
      const pagina = html(r);
      const entradas = [...pagina.matchAll(/src="([^"]*\/_astro\/[^"]+\.js)"/g)]
        .map((m) => m[1].split('/').pop()!);
      conGsap.forEach((f) => expect(entradas, `${r} arranca con ${f}`).not.toContain(f));
    });
  });

  it('ninguna ruta pide una hoja de estilos aparte', () => {
    // Una hoja externa de 2,7 KB costaba 302 ms de pintado bloqueado en una
    // red movil: no es el peso, es la ida y vuelta.
    RUTAS.forEach((r) => {
      expect(html(r), r).not.toMatch(/<link[^>]+rel="stylesheet"/);
    });
  });
});

describe('lo que hace falta antes del primer pintado', () => {
  it('las dos tipografias que salen en el heroe van precargadas', () => {
    // Lighthouse lo nombro sin ambiguedad: «Web font loaded ·
    // Satoshi-Regular.woff2» como causa del unico desplazamiento que quedaba.
    // El bloque del heroe esta anclado por abajo, asi que cuando la tipografia
    // de cuerpo llegaba tarde y las lineas se re-repartian, el titular y el
    // boton se movian. Precargada, el cambio ocurre antes del primer pintado.
    RUTAS.forEach((r) => {
      const pagina = html(r);
      ['ClashDisplay-Semibold.woff2', 'Satoshi-Regular.woff2'].forEach((f) => {
        expect(pagina, `${r}: ${f} sin precargar`).toMatch(
          new RegExp(`rel="preload"[^>]*${f.replace('.', '\\.')}`));
      });
    });
  });

  it('no se precarga mas de lo que se usa antes de pintar', () => {
    // Cada precarga compite por el ancho de banda con el elemento LCP. La
    // tipografia de medias —Satoshi-Medium— solo aparece mas abajo.
    const precargas = html('index').match(/rel="preload"[^>]*as="font"/g) ?? [];
    expect(precargas.length).toBeLessThanOrEqual(2);
  });
});
