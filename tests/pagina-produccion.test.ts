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

  it('cada servicio recibe su propio bloque a pantalla completa (G11)', () => {
    // Los seis bloques de servicio se generan con un .map(), así que en el
    // fuente hay una sola aparición literal de <Bloque> para los seis. El
    // recuento de pantallas renderizadas se verifica en la suite sobre dist/.
    expect(pagina()).toContain('serviciosProduccion.map(');
  });

  it('la tabla comparativa lista los seis, no siete', () => {
    const s = pagina();
    expect(s).toContain('comparativa');
    expect(s).not.toContain('siete servicios');
  });

  it('la celda de duracion no inventa un plazo cuando no lo hay (G1)', () => {
    // Mixing y mastering se cobran por trabajo: `duracion` viene indefinida a
    // proposito, y la tabla tiene que decirlo, no rellenarlo.
    expect(serviciosProduccion.filter((s) => !s.duracion).length).toBeGreaterThan(0);
    expect(pagina()).toContain('s.duracion ??');
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
