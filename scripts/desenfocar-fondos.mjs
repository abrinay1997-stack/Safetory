/**
 * Desenfoca las fotografías que hacen de planos de profundidad.
 *
 * Los planos viven a 6 y 12 unidades por detrás del objeto: a esa distancia
 * una cámara real los daría fuera de foco. Nítidas se leen como fotografías
 * pegadas al fondo —con el rótulo del estudio compitiendo con el <h1> de la
 * página, y duplicado, porque las dos capas muestran el mismo cartel a
 * escalas distintas— en vez de como la atmósfera que pide el spec §6.4.
 *
 * De paso pesan menos: se reduce el ancho, que desenfocadas no aporta nada.
 *
 * Uso: node scripts/desenfocar-fondos.mjs <entrada.webp> <salida.webp>
 *
 * NO es idempotente: aplicarlo dos veces sobre el mismo archivo lo desenfoca
 * dos veces. Los originales están en el historial de git.
 */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const sharp = require('sharp');

const [entrada, salida] = process.argv.slice(2);
if (!entrada || !salida) {
  console.error('uso: node scripts/desenfocar-fondos.mjs <entrada> <salida>');
  process.exit(1);
}

const ANCHO = 720;
const SIGMA = 9;

const buffer = await sharp(entrada)
  .resize({ width: ANCHO, withoutEnlargement: true })
  .blur(SIGMA)
  .webp({ quality: 72, effort: 6 })
  .toBuffer();

const { writeFileSync } = await import('node:fs');
writeFileSync(salida, buffer);
console.log(`${salida}: ${(buffer.length / 1024).toFixed(1)} KB`);
