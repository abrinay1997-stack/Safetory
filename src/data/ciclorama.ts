import type { Tarifa } from './tipos';

export const cicloramaFoto: Tarifa[] = [
  {
    id: 'ciclo-foto-1h',
    nombre: 'Ciclorama · fotografía',
    duracion: '1 hora',
    precio: 25,
    condicion: 'Hora adicional: $20.',
  },
];

export const cicloramaVideo: Tarifa[] = [
  {
    id: 'ciclo-video-2h',
    nombre: 'Ciclorama · vídeo',
    duracion: '2 horas',
    precio: 50,
    condicion: 'Hora adicional: $25.',
  },
  {
    id: 'ciclo-video-4h',
    nombre: 'Ciclorama · vídeo',
    duracion: '4 horas',
    precio: 90,
    condicion: 'Hora adicional: $25.',
  },
  {
    id: 'ciclo-video-8h',
    nombre: 'Ciclorama · vídeo',
    duracion: '8 horas',
    precio: 280,
    condicion: 'Hora adicional: $25.',
  },
];

export const bloquesCicloramaMiembro: Tarifa[] = [
  { id: 'ciclo-m3', nombre: 'Bloque de miembro', duracion: '3 horas', precio: null },
  { id: 'ciclo-m5', nombre: 'Bloque de miembro', duracion: '5 horas', precio: null },
];
