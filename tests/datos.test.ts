import { describe, it, expect } from 'vitest';
import { site } from '../src/data/site';
import { enlaceWhatsApp } from '../src/data/whatsapp';
import { tarifasEstudio, bloquesEstudioMiembro } from '../src/data/estudio';
import { cicloramaFoto, cicloramaVideo } from '../src/data/ciclorama';
import { serviciosProduccion } from '../src/data/produccion';
import { incluidoMembresia } from '../src/data/membresia';
import { equipoVerificable } from '../src/data/equipo';

describe('identidad y contacto', () => {
  it('reproduce los datos reales de Safetory', () => {
    expect(site.nombre).toBe('Safetory Studio');
    expect(site.eslogan).toBe('Donde la innovación se encuentra con la perfección');
    expect(site.direccion).toBe('Edificio Brasilia, Vía España, Panamá, Provincia de Panamá');
    expect(site.telefono).toBe('6799-8881');
    expect(site.correo).toBe('info@safetoryglobal.com');
    expect(site.instagram).toBe('https://instagram.com/safetorystudio');
  });

  it('publica el horario tal y como lo declara el estudio', () => {
    expect(site.horario).toEqual([
      { dias: 'Lunes a viernes', horas: '24 horas' },
      { dias: 'Sábado', horas: '9:00–12:30' },
      { dias: 'Domingo', horas: 'Cerrado' },
    ]);
  });
});

describe('enlace de WhatsApp', () => {
  it('apunta al número con prefijo de Panamá', () => {
    expect(enlaceWhatsApp('Studio 1 · 3 horas')).toMatch(/^https:\/\/wa\.me\/50767998881\?text=/);
  });

  it('codifica el servicio dentro del mensaje', () => {
    const url = enlaceWhatsApp('Servicio de Mastering');
    expect(decodeURIComponent(url.split('text=')[1]))
      .toBe('Hola, quiero reservar: Servicio de Mastering');
  });

  it('no deja espacios sin codificar', () => {
    expect(enlaceWhatsApp('Studio 1')).not.toContain(' ');
  });
});

describe('tarifas de Studio 1', () => {
  it('cobra 50 la hora suelta', () => {
    const h = tarifasEstudio.find((t) => t.id === 'estudio-1h');
    expect(h?.precio).toBe(50);
    expect(h?.duracion).toBe('1 hora');
  });

  it('cobra 35 por hora a partir de 3 horas, con la condición literal', () => {
    const b = tarifasEstudio.find((t) => t.id === 'estudio-3h');
    expect(b?.precio).toBe(35);
    expect(b?.condicion).toBe(
      'Si alquilas 3 horas o más, cada hora consumida queda en $35.'
    );
  });

  it('los bloques de miembro no tienen precio', () => {
    expect(bloquesEstudioMiembro).toHaveLength(3);
    bloquesEstudioMiembro.forEach((b) => expect(b.precio).toBeNull());
    expect(bloquesEstudioMiembro.map((b) => b.duracion))
      .toEqual(['3 horas', '5 horas', '8 horas']);
  });
});

describe('tarifas de ciclorama', () => {
  it('fotografía cuesta 25 la primera hora y 20 las siguientes', () => {
    expect(cicloramaFoto).toHaveLength(1);
    expect(cicloramaFoto[0].precio).toBe(25);
    expect(cicloramaFoto[0].condicion).toBe('Hora adicional: $20.');
  });

  it('vídeo tiene tres bloques con los precios publicados', () => {
    expect(cicloramaVideo.map((t) => [t.duracion, t.precio])).toEqual([
      ['2 horas', 50],
      ['4 horas', 90],
      ['8 horas', 280],
    ]);
  });

  it('todos los bloques de vídeo declaran la hora adicional', () => {
    cicloramaVideo.forEach((t) => expect(t.condicion).toBe('Hora adicional: $25.'));
  });
});

describe('servicios de producción', () => {
  it('son seis, en orden, y con los precios exactos', () => {
    expect(serviciosProduccion.map((s) => [s.id, s.precio])).toEqual([
      ['mixing', 60],
      ['mastering', 50],
      ['mixing-mastering', 105],
      ['grabacion', 45],
      ['grabacion-instrumental', 80],
      ['produccion-personalizada', 300],
    ]);
  });

  it('ningún servicio de producción queda sin precio', () => {
    serviciosProduccion.forEach((s) => expect(s.precio).not.toBeNull());
  });

  it('mastering limita a 8 stems y mixing no limita', () => {
    expect(serviciosProduccion.find((s) => s.id === 'mixing')?.condicion)
      .toBe('Stems ilimitados.');
    expect(serviciosProduccion.find((s) => s.id === 'mastering')?.condicion)
      .toBe('Máximo 8 stems.');
  });

  it('la grabación avisa de que no entra en la hora de estudio', () => {
    expect(serviciosProduccion.find((s) => s.id === 'grabacion')?.condicion)
      .toBe('No incluido en la hora de alquiler del estudio.');
  });

  it('la producción personalizada enumera sus siete entregables', () => {
    const p = serviciosProduccion.find((s) => s.id === 'produccion-personalizada');
    expect(p?.precio).toBe(300);
    expect(p?.condicion).toContain('Instrumental desde cero');
    expect(p?.condicion).toContain('asesoría creativa');
  });
});

describe('huecos de contenido del spec §9.5', () => {
  it('la membresía describe los bloques pero no inventa precio', () => {
    expect(incluidoMembresia.length).toBeGreaterThan(0);
    incluidoMembresia.forEach((linea) => expect(linea).not.toMatch(/\$\d/));
  });

  it('el inventario de equipo no publica marcas ni modelos (G15)', () => {
    const prohibidas = ['Manley', 'Yamaha', 'Universal Audio', 'Apollo', 'HS5', 'HS8'];
    equipoVerificable.forEach((linea) => {
      prohibidas.forEach((m) => expect(linea).not.toContain(m));
    });
  });
});
