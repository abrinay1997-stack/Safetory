import type { Tarifa } from './tipos';

export const tarifasEstudio: Tarifa[] = [
  {
    id: 'estudio-1h',
    nombre: 'Studio 1 · hora suelta',
    duracion: '1 hora',
    precio: 50,
  },
  {
    id: 'estudio-3h',
    nombre: 'Studio 1 · bloque',
    duracion: '3 horas o más',
    precio: 35,
    condicion: 'Si alquilas 3 horas o más, cada hora consumida queda en $35.',
  },
];

export const bloquesEstudioMiembro: Tarifa[] = [
  { id: 'estudio-m3', nombre: 'Bloque de miembro', duracion: '3 horas', precio: null },
  { id: 'estudio-m5', nombre: 'Bloque de miembro', duracion: '5 horas', precio: null },
  { id: 'estudio-m8', nombre: 'Bloque de miembro', duracion: '8 horas', precio: null },
];
