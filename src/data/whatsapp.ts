import { site } from './site';

/**
 * Enlace de reserva con el mensaje ya escrito.
 * Punto único de cambio: cuando exista el agendado nativo (fase 2), solo
 * se reescribe esta función y ninguna plantilla se toca.
 */
export function enlaceWhatsApp(servicio: string): string {
  const texto = `Hola, quiero reservar: ${servicio}`;
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(texto)}`;
}
