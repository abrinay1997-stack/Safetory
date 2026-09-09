import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { medirPresupuesto, LIMITE_MALLAS, LIMITE_TRIANGULOS } from '../src/three/presupuesto';
import * as THREE from 'three';
import { crear, RUTA_WORDMARK } from '../src/three/objetos/rotulo';
import { ruta } from '../src/data/rutas';
import { site } from '../src/data/site';

const pagina = () => readFileSync('src/pages/contacto.astro', 'utf8');

/** Cargador de mentira: una textura NUEVA por llamada, nunca la misma. */
function cargadorFalso() {
  const pedidas: string[] = [];
  const cargador = {
    load: (url: string) => { pedidas.push(url); return new THREE.Texture(); },
  } as unknown as THREE.TextureLoader;
  return { cargador, pedidas };
}

describe('objeto rotulo', () => {
  const obj = crear(cargadorFalso().cargador);

  it('cabe en el presupuesto de escena', () => {
    const p = medirPresupuesto(obj);
    expect(p.mallas).toBeLessThanOrEqual(LIMITE_MALLAS);
    expect(p.triangulos).toBeLessThanOrEqual(LIMITE_TRIANGULOS);
  });

  it('tiene panel retroiluminado y halo', () => {
    expect(obj.getObjectByName('panel')).toBeDefined();
    expect(obj.getObjectByName('halo')).toBeDefined();
  });

  it('pide exactamente el wordmark que hay en disco', () => {
    // TextureLoader no avisa si el archivo no esta: el panel se dibujaria
    // liso y nadie se enteraria hasta mirar el poster. Se comprueban las dos
    // mitades — que se pida esa ruta y que esa ruta exista — porque cada una
    // sin la otra deja pasar el fallo.
    const { cargador, pedidas } = cargadorFalso();
    crear(cargador);
    expect(pedidas).toEqual([ruta(RUTA_WORDMARK)]);
    expect(existsSync(`public${RUTA_WORDMARK}`)).toBe(true);
  });

  it('el wordmark pasa por la ruta base o el rotulo sale sin logo (T23)', () => {
    const src = readFileSync('src/three/objetos/rotulo.ts', 'utf8');
    // En el preview, servido desde /Safetory, la ruta absoluta da 404 y
    // TextureLoader no dice nada: el panel se dibuja liso y el logotipo
    // desaparece al cruzar del poster al canvas.
    expect(src).toContain("from '../../data/rutas'");
    expect(src).toContain('load(ruta(RUTA_WORDMARK))');
    expect(src).not.toContain('load(RUTA_WORDMARK)');
  });

  it('el wordmark se marca como sRGB o el rotulo sale lavado', () => {
    const { cargador } = cargadorFalso();
    const panel = crear(cargador).getObjectByName('panel') as THREE.Mesh;
    const material = panel.material as THREE.MeshStandardMaterial;
    expect(material.map!.colorSpace).toBe(THREE.SRGBColorSpace);
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
    // Se vigila el MARCADO, no el texto del archivo: prohibir la cadena suelta
    // hacia fallar el aserto por el comentario que explica por que no hay
    // mapa. Un aserto sobre un .astro solo puede prohibir marcado o comprobar
    // que se consume un dato (trampa 2 del CLAUDE.md).
    expect(pagina()).not.toMatch(/<img[^>]*mapa/i);
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
