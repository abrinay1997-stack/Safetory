import type { FranjaHoraria } from './tipos';

/**
 * Identidad y contacto. Origen: safetorystudio.setmore.com, extraído 2026-09-07.
 * Única fuente de verdad: ninguna plantilla escribe estos datos a mano.
 */
export const site = {
  nombre: 'Safetory Studio',
  eslogan: 'Donde la innovación se encuentra con la perfección',
  direccion: 'Edificio Brasilia, Vía España, Panamá, Provincia de Panamá',
  telefono: '6799-8881',
  whatsapp: '50767998881',
  correo: 'info@safetoryglobal.com',
  instagram: 'https://instagram.com/safetorystudio',
  lang: 'es',
  locale: 'es_PA',
  themeColor: '#080808',
  horario: [
    { dias: 'Lunes a viernes', horas: '24 horas' },
    { dias: 'Sábado', horas: '9:00–12:30' },
    { dias: 'Domingo', horas: 'Cerrado' },
  ] as FranjaHoraria[],
} as const;
