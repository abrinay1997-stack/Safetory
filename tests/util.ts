/**
 * Utilidades de test compartidas.
 *
 * Este proyecto ya tropezó dos veces con lo mismo: un aserto que prohíbe una
 * cadena en TODO el archivo salta por el comentario que explica precisamente
 * por qué esa cadena no debe estar. El comentario es lo primero que se
 * reescribe para callar al test, y así se pierde justo la explicación que
 * costó descubrir.
 *
 * `soloCodigo` quita comentarios antes de comprobar, de modo que un aserto
 * puede prohibir una construcción sin prohibir hablar de ella.
 */
export function soloCodigo(fuente: string): string {
  return fuente
    .replace(/\/\*[\s\S]*?\*\//g, ' ')   // bloque
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ') // bloque dentro de JSX
    .replace(/^[ \t]*\/\/.*$/gm, ' ')     // línea entera
    .replace(/([^:])\/\/.*$/gm, '$1');    // al final de una línea de código
}
