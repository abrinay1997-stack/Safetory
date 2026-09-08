import type { Tarifa } from './tipos';

export const serviciosProduccion: Tarifa[] = [
  // Mixing y mastering se cobran por trabajo, no por tiempo. La fuente
  // registra «23h 59min», que es la longitud del hueco de reserva en la
  // agenda, no un plazo de entrega. Publicar un plazo sería inventar un
  // compromiso comercial (G1), así que estos tres van sin `duracion`.
  {
    id: 'mixing',
    nombre: 'Mixing',
    precio: 60,
    condicion: 'Stems ilimitados.',
  },
  {
    id: 'mastering',
    nombre: 'Mastering',
    precio: 50,
    condicion: 'Máximo 8 stems.',
  },
  {
    id: 'mixing-mastering',
    nombre: 'Mixing y Mastering',
    precio: 105,
    condicion: 'Stems de mixing ilimitados. Máximo 8 stems de mastering.',
  },
  {
    id: 'grabacion',
    nombre: 'Grabación',
    duracion: '3 horas',
    precio: 45,
    condicion: 'No incluido en la hora de alquiler del estudio.',
  },
  {
    id: 'grabacion-instrumental',
    nombre: 'Grabación sobre instrumental del cliente',
    duracion: '2 horas',
    precio: 80,
    condicion:
      'Ingeniero de grabación incluido. Pre-mezcla de voces con el instrumental. No incluye mixing ni mastering.',
  },
  {
    id: 'produccion-personalizada',
    nombre: 'Producción Personalizada',
    duracion: 'Hasta terminar el producto',
    precio: 300,
    condicion:
      'Instrumental desde cero · horas de estudio ilimitadas hasta terminar · grabación de voces · edición de voces · mixing · master · asesoría creativa.',
  },
];
