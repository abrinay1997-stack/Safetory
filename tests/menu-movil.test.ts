import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { soloCodigo } from './util';

const nav = () => readFileSync('src/components/Nav.astro', 'utf8');

describe('menu de movil', () => {
  it('el boton de reserva es UNO solo, y vive dentro del menu', () => {
    // Duplicarlo —uno para la pastilla y otro para el panel— deja dos enlaces
    // identicos en el DOM: el lector los anuncia los dos y el teclado pasa por
    // los dos. Es un elemento con dos presentaciones.
    const marcado = nav().split('<script>')[0];
    expect((marcado.match(/class="nav__cta"/g) ?? []).length).toBe(1);
    const lista = marcado.slice(marcado.indexOf('<ul'), marcado.indexOf('</ul>'));
    expect(lista).toContain('nav__cta');
  });

  it('en movil la pastilla solo lleva la marca y las rayitas', () => {
    const s = soloCodigo(nav());
    const movil = s.slice(s.indexOf('@media (max-width: 899px)'));
    // La lista —con el boton dentro— se oculta hasta que se abre el panel.
    expect(movil).toMatch(/\.nav__lista\s*\{[^}]*display: none/);
    expect(movil).toMatch(/\.nav__toggle\s*\{[^}]*display: flex/);
  });

  it('el panel se mide en unidades de viewport, no con inset', () => {
    // `position: fixed` se resuelve contra el viewport solo si ningun ancestro
    // lleva transform ni backdrop-filter. La pastilla lleva los dos, asi que
    // un `inset: 0` se quedaba dentro de ella: 116 px de ancho.
    const s = soloCodigo(nav());
    const movil = s.slice(s.indexOf('@media (max-width: 899px)'));
    const panel = movil.match(/\.nav__lista\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(panel).toContain('position: fixed');
    expect(panel).toContain('width: 100vw');
    expect(panel).toContain('height: 100dvh');
    expect(panel).not.toMatch(/inset:\s*0/);
  });

  it('abrir el panel devuelve la barra a su tamano', () => {
    // El panel es descendiente de la pastilla: con la barra encogida heredaria
    // la escala y el menu entero saldria al 78 %.
    const s = soloCodigo(nav());
    const desde = s.slice(s.indexOf("boton.addEventListener('click'"));
    expect(desde.slice(0, desde.indexOf('});'))).toContain('fijar(false)');
  });

  it('lo que queda detras del panel se apaga para el teclado', () => {
    const s = soloCodigo(nav());
    expect(s).toContain('e.inert = apagado');
    expect(s).toMatch(/querySelectorAll<HTMLElement>\('main, footer'\)/);
    // Y la pagina de debajo no se desplaza mientras dure.
    expect(s).toContain("classList.toggle('menu-abierto', apagado)");
    const global = soloCodigo(readFileSync('src/styles/global.css', 'utf8'));
    expect(global).toMatch(/\.menu-abierto[^{]*\{[^}]*overflow: hidden/);
  });

  it('cerrar devuelve la pagina de detras y el foco', () => {
    const s = soloCodigo(nav());
    const desde = s.slice(s.indexOf('function cerrar('));
    const cuerpo = desde.slice(0, desde.indexOf('\n  }'));
    expect(cuerpo).toContain('apagarElFondo(false)');
    expect(cuerpo).toContain('boton.focus()');
  });
});
