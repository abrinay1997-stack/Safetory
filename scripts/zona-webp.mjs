/**
 * Las tarjetas de «En la Zona», de los originales del cliente a lo que se sirve.
 *
 *   node scripts/zona-webp.mjs
 *
 * Entra `Imagenes/`, que es donde el cliente subió su serie a 1080×1350, y sale
 * `public/zona/` a 420×525. **La proporción es la nativa de la pieza (4:5)**: con
 * cualquier otra, el `object-fit: cover` del pasillo se come el rótulo «EN LA
 * ZONA» de arriba o el nombre de abajo, que son parte del diseño de la tarjeta.
 *
 * La tabla de abajo es también el orden en que salen y de dónde viene
 * `src/data/zona.ts`; el nombre y el oficio están **leídos de cada tarjeta**.
 */
import sharp from 'sharp';
import { mkdirSync, rmSync, statSync } from 'node:fs';

/** Nombre de archivo del cliente → quién sale y a qué se dedica, leído de la propia tarjeta. */
const FICHA = [
  ['1.jpg',                                                    'karol-wilson', 'KAROL WILSON',    'artista'],
  ['615272326_17892765225397066_7571763632816764122_n.jpg',    'five-7',       'FIVE 7',          'artista'],
  ['615436187_17892765252397066_8014312470961761129_n.jpg',    'kays',         'KAYS',            'artista'],
  ['615585719_17892765237397066_6159368061904461009_n.jpg',    'ngpa',         'NGPA',            'artista'],
  ['615682317_17892765243397066_5603110540337120240_n.jpg',    'el10',         'EL10',            'artista'],
  ['615806952_17892765216397066_1781925325694338720_n.jpg',    'kabliz',       'KABLIZ',          'artista'],
  ['616321070_17892765207397066_6647862945543537243_n.jpg',    'mariana-hidalgo', 'MARIANA HIDALGO', 'creador digital'],
  ['682619194_17913219813397066_3906645764382155874_n.jpg',    'twelvevii',    'TWELVEVII',       'artista'],
  ['704048389_17913219861397066_4202827658564127096_n.jpg',    'yonmaik',      'YONMAIK',         'artista'],
  ['704097777_17913219816397066_6316005868533827920_n.jpg',    'elay',         'ELAY',            'artista'],
  ['704507206_17913219864397066_8151694802353104069_n.jpg',    'tommy-fraser', 'TOMMY FRASER',    'artista'],
  ['704751764_17913219834397066_2937056542781189277_n.jpg',    'otto',         'OTTO',            'artista'],
  ['705246947_17913219795397066_1733739361935293911_n.jpg',    'emmxnuel',     'EMMXNUEL',        'artista'],
  ['705429026_17913219831397066_9177013601095985467_n.jpg',    'victormars',   'VICTORMARS',      'dj'],
  ['705662290_17913219879397066_1741501439228997672_n.jpg',    'yungses',      'YUNGSES',         'productor'],
  ['706090468_17913219846397066_785025379656324581_n.jpg',     'rigosaxx',     'RIGOSAXX',        'artista'],
];

// 420x525 es la proporcion nativa de las tarjetas (4:5): asi no se recorta ni
// el rotulo «EN LA ZONA» de arriba ni el nombre de abajo.
const ANCHO = 420, ALTO = 525;

rmSync('public/zona', { recursive: true, force: true });
mkdirSync('public/zona', { recursive: true });

let total = 0;
for (const [origen, slug] of FICHA) {
  const destino = `public/zona/${slug}.webp`;
  await sharp(`Imagenes/${origen}`).resize(ANCHO, ALTO, { fit: 'cover' })
    .webp({ quality: 72, effort: 6 }).toFile(destino);
  const kb = statSync(destino).size / 1024;
  total += kb;
  console.log(`${slug.padEnd(16)} ${kb.toFixed(1)} KB`);
}
console.log(`\n${FICHA.length} tarjetas, ${total.toFixed(0)} KB en total`);

// Y el fichero de datos, generado de la misma tabla para que no puedan divergir.
const filas = FICHA.map(([, slug, nombre, rol]) =>
  `  { src: '/zona/${slug}.webp', nombre: ${JSON.stringify(nombre)}, rol: ${JSON.stringify(rol)} },`).join('\n');
console.log('\n--- datos ---\n' + filas);
