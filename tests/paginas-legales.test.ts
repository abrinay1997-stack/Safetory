import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { site } from '../src/data/site';

const LEGALES = ['privacidad', 'aviso-legal'];
const PUBLICAS = ['index', 'estudio', 'ciclorama', 'produccion', 'membresia', 'contacto'];
const TODAS = [...PUBLICAS, ...LEGALES];

const html = (r: string) => readFileSync(`dist/${r}.html`, 'utf8');

beforeAll(() => {
  if (!existsSync('dist/privacidad.html')) {
    throw new Error('Ejecuta `npm run build` antes de esta suite.');
  }
});

describe('paginas legales', () => {
  it('las dos existen en dist', () => {
    LEGALES.forEach((r) => expect(existsSync(`dist/${r}.html`), r).toBe(true));
  });

  it('cada una tiene title, description y canonica propios', () => {
    const titulos = LEGALES.map((r) => html(r).match(/<title>(.*?)<\/title>/)?.[1] ?? '');
    const descripciones = LEGALES.map(
      (r) => html(r).match(/name="description" content="(.*?)"/)?.[1] ?? '');
    const canonicas = LEGALES.map(
      (r) => html(r).match(/rel="canonical" href="([^"]+)"/)?.[1] ?? '');
    expect(new Set(titulos).size).toBe(LEGALES.length);
    expect(new Set(canonicas).size).toBe(LEGALES.length);
    descripciones.forEach((d, i) => expect(d.length, LEGALES[i]).toBeGreaterThan(60));
  });

  it('cumplen lo mismo que el resto del sitio: un h1, idioma y salto al contenido', () => {
    LEGALES.forEach((r) => {
      expect((html(r).match(/<h1[\s>]/g) ?? []).length, r).toBe(1);
      expect(html(r), r).toMatch(/<html[^>]+lang="es"/);
      expect(html(r), r).toContain('href="#contenido"');
      expect(html(r), r).not.toContain('<!--');
    });
  });

  it('no cargan three: son texto', () => {
    // Un documento de texto que arrastrase el motor 3D seria 150 KB gz por
    // una pagina que nadie recorre.
    LEGALES.forEach((r) => expect(html(r), r).not.toContain('escena__canvas'));
  });

  it('la identidad sale de src/data, no escrita a mano', () => {
    const aviso = html('aviso-legal');
    [site.nombre, site.direccion, site.correo, site.telefono].forEach(
      (d) => expect(aviso, d).toContain(d));
  });

  it('lo que la politica afirma del sitio es cierto en el build', () => {
    // La politica dice: sin formularios, sin analitica, sin cookies propias.
    // Si alguna vez se anade cualquiera de las tres, este aserto avisa antes
    // de que el sitio publique una afirmacion falsa (G1).
    const politica = html('privacidad');
    expect(politica).toContain('No tiene formularios');
    expect(politica).toContain('analítica');
    TODAS.forEach((r) => {
      expect(html(r), `${r}: formulario`).not.toContain('<form');
      ['gtag(', 'googletagmanager', 'google-analytics.com', 'plausible.io', 'document.cookie']
        .forEach((p) => expect(html(r), `${r}: ${p}`).not.toContain(p));
    });
  });

  it('el mapa de Google que la politica menciona es el que hay, y va diferido', () => {
    const contacto = html('contacto');
    const iframes = contacto.match(/<iframe[^>]*>/g) ?? [];
    expect(iframes.length, 'contacto no incrusta ningun mapa').toBe(1);
    expect(iframes[0]).toContain('google.com/maps/embed');
    expect(iframes[0]).toContain('loading="lazy"');
    expect(html('privacidad')).toContain('Google Maps');
    // Ninguna otra ruta incrusta nada de terceros: la politica solo declara este.
    TODAS.filter((r) => r !== 'contacto').forEach(
      (r) => expect(html(r).match(/<iframe/g), r).toBeNull());
  });

  it('no quedan placeholders', () => {
    const prohibidos = ['lorem', 'Lorem', 'TODO', 'TBD', 'href="#"', 'your-', 'placeholder'];
    LEGALES.forEach((r) => {
      prohibidos.forEach((p) => expect(html(r), `${r}: ${p}`).not.toContain(p));
    });
  });
});

describe('pie de pagina', () => {
  it('las ocho rutas enlazan las dos paginas legales', () => {
    TODAS.forEach((r) => {
      LEGALES.forEach((l) => expect(html(r), `${r} -> ${l}`).toMatch(
        new RegExp(`href="[^"]*/${l}"`)));
    });
  });

  it('el pie muestra el logotipo real, y el archivo existe', () => {
    // TextureLoader no es el unico que calla: un <img> a un archivo que no
    // esta deja un hueco y el pie se queda sin marca.
    TODAS.forEach((r) => expect(html(r), r).toMatch(/<img[^>]+logo-safetory\.webp/));
    expect(existsSync('dist/logo-safetory.webp')).toBe(true);
    expect(statSync('dist/logo-safetory.webp').size).toBeLessThan(60 * 1024);
  });

  it('el logotipo del pie declara medidas y no compite con el LCP', () => {
    const img = html('index').match(/<img[^>]+logo-safetory\.webp[^>]*>/)?.[0] ?? '';
    expect(img).toMatch(/width="\d+"/);
    expect(img).toMatch(/height="\d+"/);
    expect(img).toContain('loading="lazy"');
    expect(img).toMatch(/\salt="[^"]+"/);
  });

  it('el pie no repite el aviso de copyright de otro ano', () => {
    expect(html('index')).toContain(`© ${new Date().getFullYear()}`);
  });
});
