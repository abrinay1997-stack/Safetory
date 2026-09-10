import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { soloCodigo } from './util';
import { fotosZona } from '../src/data/zona';

const componente = () => readFileSync('src/components/EnLaZona.astro', 'utf8');
const home = () => readFileSync('dist/index.html', 'utf8');

beforeAll(() => {
  if (!existsSync('dist/index.html')) throw new Error('Ejecuta `npm run build` antes.');
});

describe('En la Zona', () => {
  it('las fotografias que declara existen en disco y pesan poco', () => {
    // Las de Instagram vienen a mas de un mega. En una seccion con catorce
    // tarjetas eso son catorce megas en el movil de quien llega desde redes.
    fotosZona.forEach((f) => {
      const ruta = `public${f.src}`;
      expect(existsSync(ruta), f.src).toBe(true);
      expect(statSync(ruta).size / 1024, `${f.src} pesa de mas`).toBeLessThan(40);
    });
  });

  it('el pasillo no lleva JavaScript', () => {
    // Los fotogramas clave se calculan en el build y viajan como CSS: en el
    // navegador no corre nada, lo mueve el compositor.
    expect(componente()).not.toContain('<script');
    expect(soloCodigo(componente())).toContain('function fotogramas(');
  });

  it('los fotogramas trazan la curva de verdad, no dos extremos', () => {
    // Con solo inicio y fin, el navegador interpola en linea recta y el
    // pasillo deja de tener perspectiva.
    const s = soloCodigo(componente());
    const paradas = Number(s.match(/paradas: (\d+)/)?.[1]);
    expect(paradas).toBeGreaterThanOrEqual(12);
    const html = home();
    // Y llegan al HTML: una parada por porcentaje, en las dos direcciones.
    expect((html.match(/@keyframes zona-derecha/g) ?? []).length).toBe(1);
    expect((html.match(/@keyframes zona-izquierda/g) ?? []).length).toBe(1);
  });

  it('cada tarjeta sale con su retraso, para que el pasillo nazca lleno', () => {
    // Sin el retraso negativo, las catorce arrancan juntas desde el punto de
    // fuga y la primera vuelta se ve vacia.
    const retrasos = [...home().matchAll(/animation-delay:(-[\d.]+)s/g)].map((m) => Number(m[1]));
    expect(retrasos.length).toBeGreaterThan(10);
    expect(new Set(retrasos).size, 'todas las tarjetas comparten retraso').toBeGreaterThan(3);
  });

  it('es decorativo: ni lo lee un lector ni se puede tocar', () => {
    const html = home();
    const pasillo = html.slice(html.indexOf('class="zona"'), html.indexOf('</div>', html.indexOf('class="zona"')));
    expect(html).toMatch(/<div class="zona"[^>]*aria-hidden="true"/);
    expect(pasillo).not.toContain('href');
    expect(soloCodigo(componente())).toContain('pointer-events: none');
    // Las imagenes van sin texto alternativo porque el conjunto ya esta
    // oculto: repetirlo dentro seria ruido para el lector.
    expect(pasillo).not.toMatch(/alt="[^"]+"/);
  });

  it('con reduce-motion se congela, no desaparece', () => {
    const s = soloCodigo(componente());
    const bloque = s.slice(s.indexOf('prefers-reduced-motion'));
    expect(bloque).toContain('animation-play-state: paused');
    expect(bloque).not.toContain('display: none');
  });

  it('las fotos se cargan en diferido y declaran su tamano', () => {
    const html = home();
    const tarjetas = html.match(/<img[^>]*zona[^>]*>/g) ?? [];
    expect(tarjetas.length).toBeGreaterThan(10);
    tarjetas.forEach((t) => {
      expect(t).toContain('loading="lazy"');
      expect(t).toMatch(/width="\d+"/);
      expect(t).toMatch(/height="\d+"/);
    });
  });

  it('el titular no cae encima del pasillo', () => {
    // El bloque se apoya arriba y la mascara recorta esa banda entera. Un velo
    // por encima no valia: con `preserve-3d`, las tarjetas que vienen hacia
    // quien mira se pintan por delante de cualquier hermano posterior.
    // El nombre de la clase vive tambien dentro de la hoja de estilos, que va
    // incrustada en el HTML: buscarlo suelto pasa aunque ningun elemento lo
    // lleve. Se mira la etiqueta.
    expect(home()).toMatch(/<section[^>]*class="[^"]*bloque--arriba/);
    const s = soloCodigo(componente());
    expect(s).toMatch(/mask-image:\s*linear-gradient\([\s\S]*transparent 27%/);
  });

  it('la portada ya no repite los cuatro nombres tres veces', () => {
    // Aqui estaba el despiece: nombraba los mismos cuatro territorios que la
    // tabla de abajo da con su precio, y por debajo de 768 px ni siquiera
    // llegaba a animarse.
    expect(existsSync('src/components/Despiece.astro')).toBe(false);
    expect(home()).not.toContain('data-despiece');
  });
});
