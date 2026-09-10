import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, statSync } from 'node:fs';
import * as THREE from 'three';
import { medirPresupuesto, LIMITE_MALLAS, LIMITE_TRIANGULOS } from '../src/three/presupuesto';
import { crear } from '../src/three/objetos/interfaz';
import { serviciosProduccion } from '../src/data/produccion';

const pagina = () => readFileSync('src/pages/produccion.astro', 'utf8');

describe('objeto interfaz', () => {
  const obj = crear();

  it('cabe en el presupuesto de escena', () => {
    const p = medirPresupuesto(obj);
    expect(p.mallas).toBeLessThanOrEqual(LIMITE_MALLAS);
    expect(p.triangulos).toBeLessThanOrEqual(LIMITE_TRIANGULOS);
  });

  it('tiene el knob grande, que gira con el scroll', () => {
    expect(obj.getObjectByName('knob')).toBeDefined();
  });

  it('los botones usan InstancedMesh: una sola llamada de dibujado', () => {
    // `isInstancedMesh` y no `.type`, por lo mismo que en la Tarea 10.
    const botones = obj.getObjectByName('botones') as THREE.InstancedMesh;
    expect(botones?.isInstancedMesh).toBe(true);
  });
});

describe('el knob gira desde el motor', () => {
  const motor = () => readFileSync('src/three/motor.ts', 'utf8');

  it('resuelve el knob una sola vez, fuera del bucle de dibujado', () => {
    const src = motor();
    const dibujar = src.indexOf('function dibujar()');
    const busqueda = src.indexOf("getObjectByName('knob')");
    expect(busqueda).toBeGreaterThan(-1);
    // Dentro de dibujar() se ejecutaria 60 veces por segundo, y
    // `getObjectByName` recorre el grafo de escena entero cada vez.
    expect(busqueda).toBeLessThan(dibujar);
  });

  it('el giro depende del progreso de scroll, no del reloj', () => {
    expect(motor()).toContain('knob.rotation.y = progreso');
  });
});

describe('ruta /produccion', () => {
  it('tiene un solo h1 (G8)', () => {
    expect((pagina().match(/<h1[\s>]/g) ?? []).length).toBe(1);
  });

  it('publica los seis servicios desde los datos', () => {
    expect(serviciosProduccion).toHaveLength(6);
    expect(pagina()).toContain('serviciosProduccion');
  });

  it('los seis servicios caben en una pantalla, no en seis', () => {
    // Cada uno ocupaba una seccion de 100dvh con una sola cifra dentro, y
    // detras venia una tabla que los repetia los seis: ocho pantallas de negro
    // para seis precios. Ahora son una rejilla dentro de un solo Bloque.
    const html = readFileSync('dist/produccion.html', 'utf8');
    const secciones = (html.match(/<section/g) ?? []).length;
    expect(secciones, `la ruta tiene ${secciones} secciones`).toBeLessThanOrEqual(3);
    // Y las seis fichas viven en la misma.
    const servicios = html.slice(html.indexOf('id="servicios"'));
    const hastaElFinal = servicios.slice(0, servicios.indexOf('</section>'));
    expect((hastaElFinal.match(/servicios__ficha/g) ?? []).length).toBe(serviciosProduccion.length);
  });

  it('publica los seis servicios, ni uno mas ni uno menos', () => {
    // Este aserto decia «la tabla comparativa lista los seis» y comprobaba que
    // la pagina contuviera la palabra «comparativa». Al quitar la tabla siguio
    // en verde: la palabra se habia quedado en el comentario que explicaba por
    // que se quitaba. Sexta vez en el proyecto; ahora mira el HTML y cuenta.
    const html = readFileSync('dist/produccion.html', 'utf8');
    const fichas = html.match(/class="servicios__ficha"/g) ?? [];
    expect(fichas.length).toBe(serviciosProduccion.length);
    serviciosProduccion.forEach((s) => expect(html, s.nombre).toContain(s.nombre));
  });

  it('no se inventa un plazo para lo que no se mide en tiempo (G1)', () => {
    // Mixing y mastering se cobran por trabajo: `duracion` viene indefinida a
    // proposito. Antes lo vigilaba la tabla comparativa con una raya en la
    // celda; ahora que las seis fichas estan en una rejilla, lo que hay que
    // comprobar es lo mismo pero en el HTML: los servicios sin plazo se
    // publican SIN plazo, no con uno de relleno.
    const sinPlazo = serviciosProduccion.filter((s) => !s.duracion);
    expect(sinPlazo.length).toBeGreaterThan(0);
    const html = readFileSync('dist/produccion.html', 'utf8');
    sinPlazo.forEach((s) => {
      const ficha = html.slice(html.indexOf(`id="${s.id}"`));
      const hasta = ficha.slice(0, ficha.indexOf('</li>'));
      expect(hasta, `${s.nombre} publica una duracion`).not.toContain('precio__duracion');
    });
    // Y los que si lo tienen, lo publican tal cual esta en los datos.
    serviciosProduccion.filter((s) => s.duracion).forEach((s) => {
      expect(html, s.nombre).toContain(s.duracion!);
    });
  });

  it('no escribe ningun precio a mano (G1)', () => {
    expect(pagina()).not.toMatch(/\$\s?\d{2,}/);
  });

  it('ninguna seccion mide en vh (G11)', () => {
    expect(pagina()).not.toMatch(/[^d]vh\b/);
  });

  it('el poster existe y pesa menos de 60 KB', () => {
    expect(existsSync('public/posters/produccion.webp')).toBe(true);
    expect(statSync('public/posters/produccion.webp').size).toBeLessThan(60 * 1024);
  });
});
