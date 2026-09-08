import type { Tarifa } from './tipos';

export const serviciosProduccion: Tarifa[] = [
  {
    id: 'mixing',
    nombre: 'Mixing',
    duracion: 'Entrega en 24 horas',
    precio: 60,
    condicion: 'Stems ilimitados.',
  },
  {
    id: 'mastering',
    nombre: 'Mastering',
    duracion: 'Entrega en 24 horas',
    precio: 50,
    condicion: 'Máximo 8 stems.',
  },
  {
    id: 'mixing-mastering',
    nombre: 'Mixing y Mastering',
    duracion: 'Entrega en 24 horas',
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
