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
    // Los originales del cliente vienen a 1080x1350. En una seccion con
    // dieciseis tarjetas, sin tocar, eso son dos megas y medio en el movil de
    // quien llega desde redes.
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
    // Y llegan al HTML: los cuatro rieles —dos sentidos por dos geometrias—
    // con una parada por porcentaje.
    for (const n of ['zona-der', 'zona-izq', 'zona-der-m', 'zona-izq-m']) {
      const bloque = html.match(new RegExp(`@keyframes ${n}\\{([^}]*\\}){2,}`));
      expect(bloque, `falta @keyframes ${n}`).not.toBeNull();
      expect((bloque![0].match(/%\{transform:/g) ?? []).length,
        `${n} traza pocos pasos`).toBeGreaterThanOrEqual(13);
    }
  });

  it('en vertical el pasillo tiene su propia geometria, no un zoom', () => {
    // Escalar el espacio agranda tambien el recorrido lateral: las tarjetas
    // grandes salen de cuadro antes de que se las vea, y la seccion queda en
    // un hilo en medio de una pantalla vacia. En vertical viajan MENOS de lado
    // y crecen MAS.
    const s = soloCodigo(componente());
    const bloque = (nombre: string) => {
      const desde = s.slice(s.indexOf(`const ${nombre} = {`));
      return desde.slice(0, desde.indexOf('\n};'));
    };
    const dato = (texto: string, clave: string) => Number(texto.match(new RegExp(`${clave}: ([\\d.]+)`))?.[1]);
    const movil = bloque('MOVIL');
    expect(movil, 'no hay geometria vertical').toContain('...BASE');
    expect(dato(movil, 'salida'), 'en vertical el riel deberia abrir menos')
      .toBeLessThan(dato(bloque('BASE'), 'salida'));
    expect(dato(movil, 'altoAlSalir'), 'en vertical la tarjeta deberia crecer mas')
      .toBeGreaterThan(dato(bloque('BASE'), 'altoAlSalir'));
    // Y no vuelve el atajo del escalado.
    expect(s).not.toMatch(/\.zona__espacio\s*\{[^}]*transform:\s*scale/);
  });

  it('las tarjetas van nitidas y se apagan al final, no translucidas todo el rato', () => {
    // El cliente: «que sean completamente nitidas con una opacidad al cien por
    // ciento y que a medida de que ya estan muy cerca que la opacidad se
    // vaya». Antes iban al 78 % durante todo el recorrido.
    const s = soloCodigo(componente());
    expect(s, 'vuelve la opacidad fija por debajo de 1')
      .not.toMatch(/\.zona__tarjeta[^{]*\{[^}]*opacity: 0\.\d/);

    const html = home();
    const tramo = html.match(/@keyframes zona-der\{[^@]*/)![0];
    const ops = [...tramo.matchAll(/opacity:([\d.]+)/g)].map((m) => Number(m[1]));
    expect(ops.length, 'los fotogramas no llevan opacidad').toBeGreaterThan(10);
    expect(ops[0], 'nace translucida').toBe(1);
    expect(ops[ops.length - 1], 'no llega a apagarse del todo').toBeLessThan(0.05);
    // Entera durante la mayor parte del viaje: si se desvaneciera desde el
    // principio volveriamos a tener tarjetas translucidas, que es lo que no
    // gustaba.
    expect(ops.filter((o) => o === 1).length / ops.length,
      'se apaga demasiado pronto').toBeGreaterThan(0.5);
    // Y baja de forma monotona: nada de reaparecer al final.
    const cola = ops.slice(ops.findIndex((o) => o < 1));
    cola.forEach((o, i) => { if (i) expect(o, 'la opacidad sube y baja').toBeLessThanOrEqual(cola[i - 1]); });
  });

  it('la caja de la tarjeta sale de la misma tabla que la curva', () => {
    // Escrita a mano en el CSS, un dia se cambia `altoTarjeta` en la tabla, la
    // regla se queda con el numero viejo y la tarjeta deja de encajar con el
    // recorrido sin que nada avise.
    const s = soloCodigo(componente());
    expect(s).toMatch(/\.zona__tarjeta \{[\s\S]*?width: var\(--ancho\)/);
    expect(s).not.toMatch(/\.zona__tarjeta \{[\s\S]*?(width|height): [\d.]+cqw/);
    // Y el valor calculado llega al HTML.
    expect(home()).toMatch(/--alto: [\d.]+cqw/);
  });

  it('el nombre de la animacion no viaja en el atributo style', () => {
    // Un estilo en linea gana a cualquier media query: con el nombre ahi
    // dentro, la geometria vertical no llegaria a aplicarse nunca. Mismo
    // motivo por el que `--eje` pasa por una variable propia: `define:vars`
    // tambien escribe en linea.
    const html = home();
    expect(html).not.toMatch(/style="[^"]*animation-name/);
    expect(soloCodigo(componente())).toContain('--eje: var(--ejeAncho)');
  });

  it('cada tarjeta sale con su retraso, para que el pasillo nazca lleno', () => {
    // Sin el retraso negativo, todas arrancan juntas desde el punto de fuga y
    // la primera vuelta se ve vacia.
    const retrasos = [...home().matchAll(/animation-delay:(-[\d.]+)s/g)].map((m) => Number(m[1]));
    expect(retrasos.length).toBeGreaterThan(10);
    expect(new Set(retrasos).size, 'todas las tarjetas comparten retraso').toBeGreaterThan(3);
  });

  it('salen las dieciseis piezas de la serie, no la mitad dos veces', () => {
    // Los dos rieles repartian la MISMA lista, asi que con siete por riel
    // nueve de las dieciseis no aparecian nunca.
    const usadas = [...home().matchAll(/<img[^>]*src="[^"]*\/zona\/([^."]+)\.webp"/g)].map((m) => m[1]);
    const distintas = new Set(usadas);
    expect(usadas.length).toBe(fotosZona.length);
    expect(distintas.size, 'hay piezas repetidas o ausentes').toBe(fotosZona.length);
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
