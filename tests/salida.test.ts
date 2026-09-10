import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const RUTAS = ['index', 'estudio', 'ciclorama', 'produccion', 'membresia', 'contacto'];

function html(ruta: string): string {
  return readFileSync(`dist/${ruta}.html`, 'utf8');
}

/**
 * Los JS que el navegador se descarga SOLO por abrir la página: los que el
 * HTML referencia, más todo lo que esos importan de forma estática, en
 * cascada. Es la definición operativa de «JS inicial» del presupuesto (G4).
 *
 * Se sigue el grafo de verdad en vez de filtrar por nombre de archivo. El
 * plan filtraba por `f.includes('BaseLayout') || f.includes('client')`, y en
 * este build ningún chunk se llama así: el filtro devolvía la lista vacía y
 * el aserto pasaba sin comprobar absolutamente nada.
 */
function jsInicial(ruta: string): string[] {
  const entradas = [...html(ruta).matchAll(/src="([^"]*\/_astro\/[^"]+\.js)"/g)]
    .map((m) => m[1].split('/').pop()!);

  const vistos = new Set<string>();
  const pendientes = [...entradas];
  while (pendientes.length) {
    const archivo = pendientes.pop()!;
    if (vistos.has(archivo)) continue;
    vistos.add(archivo);
    const cuerpo = readFileSync(`dist/_astro/${archivo}`, 'utf8');
    // Vite emite `import"./chunk.js"` y `from"./chunk.js"`. Los import()
    // dinámicos NO cuentan: son justamente los que difieren la descarga.
    for (const m of cuerpo.matchAll(/(?:^|[;\s}])(?:import|from)\s*"\.\/([^"]+\.js)"/g)) {
      pendientes.push(m[1]);
    }
  }
  return [...vistos];
}

beforeAll(() => {
  if (!existsSync('dist/index.html')) {
    throw new Error('Ejecuta `npm run build` antes de esta suite.');
  }
});

describe('pasada 1 — SEO', () => {
  it('las seis rutas existen en dist', () => {
    RUTAS.forEach((r) => expect(existsSync(`dist/${r}.html`), r).toBe(true));
  });

  it('cada ruta tiene title y description propios y no repetidos', () => {
    const titulos = RUTAS.map((r) => html(r).match(/<title>(.*?)<\/title>/)?.[1] ?? '');
    const descripciones = RUTAS.map(
      (r) => html(r).match(/name="description" content="(.*?)"/)?.[1] ?? '');
    expect(new Set(titulos).size).toBe(RUTAS.length);
    expect(new Set(descripciones).size).toBe(RUTAS.length);
    descripciones.forEach((d) => expect(d.length).toBeGreaterThan(60));
  });

  it('cada ruta declara su canonica, y son distintas entre si', () => {
    const canonicas = RUTAS.map((r) => html(r).match(/rel="canonical" href="([^"]+)"/)?.[1] ?? '');
    canonicas.forEach((c, i) => expect(c, RUTAS[i]).toMatch(/^https?:\/\//));
    expect(new Set(canonicas).size).toBe(RUTAS.length);
  });

  it('el sitemap existe y no incluye /dev/', () => {
    const sitemap = readdirSync('dist').find((f) => f.startsWith('sitemap'));
    expect(sitemap).toBeDefined();
    const contenido = readFileSync(`dist/${sitemap}`, 'utf8');
    expect(contenido).not.toContain('/dev/');
  });

  it('LocalBusiness solo en la home y sin aggregateRating', () => {
    expect(html('index')).toContain('LocalBusiness');
    expect(html('index')).not.toContain('aggregateRating');
    expect(html('estudio')).not.toContain('LocalBusiness');
  });
});

describe('pasada 2 — Accesibilidad', () => {
  it('cada ruta tiene exactamente un h1 (G8)', () => {
    RUTAS.forEach((r) => {
      expect((html(r).match(/<h1[\s>]/g) ?? []).length, r).toBe(1);
    });
  });

  it('la jerarquia de encabezados no salta niveles', () => {
    RUTAS.forEach((r) => {
      const niveles = [...html(r).matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
      niveles.forEach((n, i) => {
        if (i === 0) return;
        expect(n - Math.min(...niveles.slice(0, i)), `${r}: h${niveles[i - 1]} -> h${n}`)
          .toBeLessThanOrEqual(niveles.slice(0, i).length);
        expect(n, `${r}: salto a h${n}`).toBeLessThanOrEqual(Math.max(...niveles.slice(0, i)) + 1);
      });
    });
  });

  it('todas las imagenes tienen alt', () => {
    RUTAS.forEach((r) => {
      (html(r).match(/<img[^>]*>/g) ?? []).forEach((img) => {
        expect(img, `${r}: ${img}`).toMatch(/\salt=/);
      });
    });
  });

  it('todo canvas queda oculto a la accesibilidad', () => {
    RUTAS.forEach((r) => {
      (html(r).match(/<canvas[^>]*>/g) ?? []).forEach((c) => {
        expect(c, r).toContain('aria-hidden="true"');
      });
    });
  });

  it('cada ruta ofrece el enlace de salto al contenido', () => {
    RUTAS.forEach((r) => expect(html(r), r).toContain('href="#contenido"'));
  });

  it('los enlaces externos llevan rel de seguridad', () => {
    RUTAS.forEach((r) => {
      (html(r).match(/<a[^>]*target="_blank"[^>]*>/g) ?? []).forEach((a) => {
        expect(a, r).toContain('noopener');
      });
    });
  });

  it('todo iframe tiene nombre accesible', () => {
    RUTAS.forEach((r) => {
      (html(r).match(/<iframe[^>]*>/g) ?? []).forEach((f) => {
        expect(f, r).toMatch(/\stitle="[^"]+"/);
        expect(f, `${r}: iframe sin carga diferida`).toContain('loading="lazy"');
      });
    });
  });

  it('el negocio publica sus coordenadas reales', () => {
    // Dato confirmado por el cliente. Sin `geo`, una ficha de negocio local
    // depende de que Google acierte geocodificando la calle.
    expect(html('index')).toContain('GeoCoordinates');
    expect(html('index')).toContain('8.9879226');
  });

  it('el idioma esta declarado en cada ruta', () => {
    RUTAS.forEach((r) => expect(html(r), r).toMatch(/<html[^>]+lang="es"/));
  });
});

describe('pasada 3 — Rendimiento', () => {
  it('el JS inicial de cada ruta cabe en 140 KB gz (G4)', () => {
    RUTAS.forEach((r) => {
      const archivos = jsInicial(r);
      expect(archivos.length, `${r}: no se resolvio ningun script`).toBeGreaterThan(0);
      const gz = archivos.reduce(
        (t, f) => t + gzipSync(readFileSync(`dist/_astro/${f}`)).length, 0);
      expect(Math.round(gz / 1024), `${r}: ${archivos.length} archivos`).toBeLessThanOrEqual(140);
    });
  });

  it('three viaja en su propio chunk, separado del arranque (G5)', () => {
    // Que exista de verdad en algun chunk: si no, el aserto de abajo pasaria
    // porque three no se ha construido, no porque este bien separado.
    const todos = readdirSync('dist/_astro').filter((f) => f.endsWith('.js'));
    const conThree = todos.filter(
      (f) => readFileSync(`dist/_astro/${f}`, 'utf8').includes('WebGLRenderer'));
    expect(conThree.length, 'three no aparece en ningun chunk').toBeGreaterThan(0);

    // Y que ninguno de esos chunks entre en la carga inicial de ninguna ruta.
    RUTAS.forEach((r) => {
      const inicial = jsInicial(r);
      expect(inicial.length, r).toBeGreaterThan(0);
      conThree.forEach((f) => expect(inicial, `${r} descarga ${f} de arranque`).not.toContain(f));
    });
  });

  it('los seis posters existen y ninguno supera 60 KB', () => {
    ['home', 'estudio', 'ciclorama', 'produccion', 'membresia', 'contacto']
      .forEach((p) => {
        const ruta = `dist/posters/${p}.webp`;
        expect(existsSync(ruta), p).toBe(true);
        expect(statSync(ruta).size, p).toBeLessThan(60 * 1024);
      });
  });

  it('el poster de cada ruta se marca como prioritario: es el LCP', () => {
    RUTAS.forEach((r) => expect(html(r), r).toContain('fetchpriority="high"'));
  });

  it('ningun comentario HTML viaja al navegador', () => {
    // Astro emite los `<!-- -->` tal cual. Un comentario de plantilla que
    // explica una decision de diseno acabo viajando entero a cada visitante en
    // las seis rutas — y contenia un `<h1>` literal que el aserto de «un solo
    // h1» contaba como encabezado de verdad.
    RUTAS.forEach((r) => expect(html(r), r).not.toContain('<!--'));
  });

  it('el poster declara ancho y alto: sin ellos el navegador no reserva sitio', () => {
    RUTAS.forEach((r) => {
      const img = html(r).match(/<img[^>]*escena__poster[^>]*>/)?.[0] ?? '';
      expect(img, r).toMatch(/width="\d+"/);
      expect(img, r).toMatch(/height="\d+"/);
    });
  });
});

describe('pasada 4 — Copy', () => {
  it('no queda ningun placeholder (G2)', () => {
    const prohibidos = ['lorem', 'Lorem', 'TODO', 'TBD', 'href="#"',
                        'G-XXXXXXXXXX', 'your-', 'placeholder'];
    RUTAS.forEach((r) => {
      prohibidos.forEach((p) => expect(html(r), `${r}: ${p}`).not.toContain(p));
    });
  });

  it('no se publica ninguna marca ni modelo de equipo (G15)', () => {
    const marcas = ['Manley', 'Yamaha', 'Universal Audio', 'Apollo', 'Neumann', 'HS8'];
    RUTAS.forEach((r) => {
      marcas.forEach((m) => expect(html(r), `${r}: ${m}`).not.toContain(m));
    });
  });

  it('membresia no publica ninguna cifra de precio (§9.5)', () => {
    // Solo el <main>. El pie sale en las ocho rutas y lista los precios de
    // entrada de los otros tres servicios —que si existen— con la membresia
    // marcada «Consultar»: eso no es publicar el precio de la membresia.
    const pagina = html('membresia');
    const cuerpo = pagina.slice(pagina.indexOf('<main'), pagina.indexOf('</main>'));
    expect(cuerpo).not.toMatch(/\$\s?\d/);
    // Y el pie, en esa misma ruta, tampoco le pone cifra a la membresia.
    const pie = pagina.slice(pagina.indexOf('<footer'));
    const fila = pie.slice(pie.indexOf('Membresía'));
    expect(fila.slice(0, 200)).toContain('Consultar');
  });

  it('ninguna ruta menciona Setmore', () => {
    RUTAS.forEach((r) => expect(html(r).toLowerCase(), r).not.toContain('setmore'));
  });

  it('los precios publicados coinciden con los datos', () => {
    expect(html('estudio')).toContain('value="50"');
    expect(html('estudio')).toContain('value="35"');
    expect(html('ciclorama')).toContain('value="280"');
    expect(html('produccion')).toContain('value="300"');
  });

  it('toda reserva sale por WhatsApp al numero real', () => {
    RUTAS.forEach((r) => {
      const enlaces = html(r).match(/href="https:\/\/wa\.me\/[^"]+"/g) ?? [];
      expect(enlaces.length, `${r}: ningun enlace de reserva`).toBeGreaterThan(0);
      enlaces.forEach((e) => expect(e, r).toContain('wa.me/50767998881'));
    });
  });
});
