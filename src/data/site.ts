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
  /**
   * Ubicación confirmada por el cliente el 2026-09-09, con el mapa incrustado
   * de su propia ficha de Google. Antes de esto no se publicaba mapa alguno:
   * Vía España es una avenida larga y marcar el edificio en el punto
   * equivocado manda a un cliente a la otra punta (G1).
   */
  geo: { lat: 8.9879226, lon: -79.522887 },
  mapaIncrustado:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.8285123382093!2d-79.522887!3d8.9879226!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8faca95f5550d60d%3A0x8816b8226bda976a!2sSafetory%20Studio!5e0!3m2!1ses!2spa!4v1788968629339!5m2!1ses!2spa',
  lang: 'es',
  locale: 'es_PA',
  themeColor: '#080808',
  horario: [
    { dias: 'Lunes a viernes', horas: '24 horas' },
    { dias: 'Sábado', horas: '9:00–12:30' },
    { dias: 'Domingo', horas: 'Cerrado' },
  ] as FranjaHoraria[],
} as const;
