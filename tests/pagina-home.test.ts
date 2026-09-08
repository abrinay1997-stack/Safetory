import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const home = () => readFileSync('src/pages/index.astro', 'utf8');

describe('Home', () => {
  it('tiene un solo h1 (G8)', () => {
    expect((home().match(/<h1[\s>]/g) ?? []).length).toBe(1);
  });

  it('usa el eslogan real y no inventa otro (G1)', () => {
    expect(home()).toContain('site.eslogan');
  });

  it('monta la escena del microfono con el poster de la home', () => {
    const s = home();
    expect(s).toContain('objeto="microfono"');
    expect(s).toContain('/posters/home.webp');
  });

  it('el equipo sale de los datos, no escrito a mano (G15)', () => {
    expect(home()).toContain('equipoVerificable');
  });

  it('publica direccion y horario desde los datos', () => {
    const s = home();
    expect(s).toContain('site.direccion');
    expect(s).toContain('site.horario');
  });

  it('el CTA va a WhatsApp y no a una ruta que no existe (G2)', () => {
    const s = home();
    expect(s).toContain('enlaceWhatsApp');
    expect(s).not.toContain('/reservar');
    expect(s).not.toContain('href="#"');
  });

  it('declara title y description propios de la ruta', () => {
    const s = home();
    expect(s).toMatch(/title="[^"]{10,}"/);
    expect(s).toMatch(/description="[^"]{40,}"/);
  });

  it('ninguna seccion mide en vh: la barra del movil la haria saltar (G11)', () => {
    // `dvh` contiene `vh`, asi que se busca `vh` no precedido de `d`.
    expect(home()).not.toMatch(/[^d]vh\b/);
  });

  it('no inventa marcas ni modelos de equipo (G15)', () => {
    const s = home().toLowerCase();
    ['neumann', 'shure', 'yamaha', 'krk', 'focusrite', 'universal audio', 'rode', 'akg']
      .forEach((marca) => expect(s, marca).not.toContain(marca));
  });
});
