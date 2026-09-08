import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { medirPresupuesto, LIMITE_MALLAS, LIMITE_TRIANGULOS } from '../src/three/presupuesto';
import { crear } from '../src/three/objetos/rotulo';
import { site } from '../src/data/site';

const pagina = () => readFileSync('src/pages/contacto.astro', 'utf8');

describe('objeto rotulo', () => {
  const obj = crear();

  it('cabe en el presupuesto de escena', () => {
    const p = medirPresupuesto(obj);
    expect(p.mallas).toBeLessThanOrEqual(LIMITE_MALLAS);
    expect(p.triangulos).toBeLessThanOrEqual(LIMITE_TRIANGULOS);
  });

  it('tiene panel retroiluminado y halo', () => {
    expect(obj.getObjectByName('panel')).toBeDefined();
    expect(obj.getObjectByName('halo')).toBeDefined();
  });

  it('el wordmark existe como textura: sin el, el rotulo sale en blanco', () => {
    // TextureLoader no avisa si el archivo no esta: el panel se dibujaria
    // liso y nadie se enteraria hasta mirar el poster.
    expect(existsSync('public/escena/wordmark.webp')).toBe(true);
  });
});

describe('ruta /contacto', () => {
  it('tiene un solo h1 (G8)', () => {
    expect((pagina().match(/<h1[\s>]/g) ?? []).length).toBe(1);
  });

  it('publica los cuatro canales reales', () => {
    const s = pagina();
    ['site.direccion', 'site.telefono', 'site.correo', 'site.instagram']
      .forEach((d) => expect(s, d).toContain(d));
  });

  it('el mapa es un enlace, nunca un iframe (§5.6)', () => {
    const s = pagina();
    expect(s).not.toContain('<iframe');
    expect(s).toContain('google.com/maps');
  });

  it('no publica un mapa dibujado por nosotros (G1)', () => {
    // El plan pedia una captura de Google Maps. No es nuestra para
    // republicar, y dibujar uno obliga a fijar coordenadas que nadie ha
    // verificado: Via Espana es una avenida larga y marcar el edificio en el
    // sitio equivocado manda al cliente a la otra punta.
    expect(pagina()).not.toContain('mapa-via-espana');
    expect(existsSync('public/mapa-via-espana.webp')).toBe(false);
  });

  it('el telefono se deriva de site.whatsapp, no se escribe a mano', () => {
    const s = pagina();
    expect(s).toContain('site.whatsapp');
    expect(s).not.toContain("'+507");
  });

  it('el horario sale de los datos y son tres franjas', () => {
    expect(site.horario).toHaveLength(3);
    expect(pagina()).toContain('site.horario');
  });

  it('ninguna seccion mide en vh (G11)', () => {
    expect(pagina()).not.toMatch(/[^d]vh\b/);
  });

  it('el poster existe y pesa menos de 60 KB', () => {
    expect(existsSync('public/posters/contacto.webp')).toBe(true);
    expect(statSync('public/posters/contacto.webp').size).toBeLessThan(60 * 1024);
  });
});
