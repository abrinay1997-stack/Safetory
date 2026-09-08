# Bitácora de errores — Safetory Studio

> Una entrada por error distinto. Solo se AÑADE al final, nunca se sobrescribe.

---

## [2026-09-07] — Plazo de entrega inventado a partir de un dato de agenda

**Contexto:** Escritura de la capa de datos (`src/data/produccion.ts`) con los servicios de
producción extraídos de la página de reservas del cliente.

**Error:** Mixing, mastering y mixing+mastering se publicaron con
`duracion: 'Entrega en 24 horas'`. El estudio nunca ha prometido ese plazo.

**Causa raíz:** La fuente registra `23h 59min` para esos tres servicios. Eso es la longitud
del hueco que ocupan en la agenda de reservas —la forma que tiene la herramienta de
representar «bloque de día completo»—, no un compromiso de entrega. Al transcribir, se leyó
como plazo. Los 31 tests estaban en verde porque ninguno comprobaba ese campo: el mismo
documento que introdujo el dato falso escribió los tests que lo rodeaban.

**Fix aplicado:** `Tarifa.duracion` pasó a opcional y los tres servicios que no se miden en
tiempo la omiten. Dos tests nuevos: uno comprueba que ningún servicio menciona plazos
(`/entrega|plazo|24\s*horas/i`), otro que solo llevan duración `grabacion`,
`grabacion-instrumental` y `produccion-personalizada`.

**Prevención:** Un dato operativo de una herramienta de terceros (duración de un hueco,
identificador interno, estado por defecto) no es contenido publicable. Antes de convertirlo
en texto de la web, preguntar: ¿esto lo afirma el cliente, o lo afirma su software? Y al
revisar contenido, darle al revisor **la fuente original**, no solo el documento intermedio:
si solo ve el plan, verificará que el código coincide con el plan, y coincidirá.

**Archivos:** `src/data/produccion.ts`, `src/data/tipos.ts`, `tests/datos.test.ts:276-292`

---

## [2026-09-07] — Tests que leen el `.astro` como texto plano contra componentes generados

**Contexto:** Tarea 5, componente `Nav.astro`, que genera sus seis enlaces con un `.map()`
sobre un array `enlaces`.

**Error:** El test hacía `expect(src).toContain('href="/estudio"')` leyendo el archivo
`.astro` como texto. Con el `.map()`, el fuente contiene `href={e.href}`, nunca la cadena
literal. El test y la implementación de referencia del mismo documento se contradecían: si
alguien copiaba el código, el test fallaba.

**Causa raíz:** Confundir el **fuente** con lo **renderizado**. Un test de contenido de
archivo solo puede afirmar cosas sobre el texto que hay escrito, no sobre el HTML que ese
texto produce. Al escribir el test se pensó en el HTML de salida. El implementador resolvió
la contradicción sustituyendo el `.map()` por seis `<li>` a mano, lo que hacía pasar el test
a costa de repetir el mismo ternario `aria-current` seis veces.

**Fix aplicado:** Se restauró el `.map()` y el test pasó a asertar sobre la fuente de verdad
real, que es el array: `expect(src).toContain("href: '/estudio'")`. Es además una afirmación
más fuerte, porque comprueba que la ruta está en el array de navegación y no en cualquier
otro punto del archivo.

**Prevención:** Un test de texto de archivo sirve para prohibir (que **no** aparezca `vh`,
`href="#"`, una marca comercial) y para comprobar que se consume un dato (`site.direccion`).
No sirve para afirmar cómo queda el marcado. Si hace falta afirmar sobre el HTML de salida,
hay que renderizar el componente de verdad —`experimental_AstroContainer` en Astro— o dejar
esa comprobación para la suite que lee `dist/*.html` tras el build.

**Archivos:** `src/components/Nav.astro`, `tests/componentes.test.ts`

---
