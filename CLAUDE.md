# CLAUDE.md — reglas permanentes de este repositorio

> Claude Code lee este archivo en cada sesión: es la memoria del proyecto.

---

## AISLAMIENTO DEL REPOSITORIO — LÉELO PRIMERO

`C:\Users\MIPC` contiene un repositorio git que abarca la carpeta de usuario entera y apunta
al remoto `Acustica_Superior_DEMO`. Por eso, antes del 2026-09-07, cualquier sesión abierta
aquí veía los archivos de Acústica Superior, Feria del Lente, Infinity Gun Club y BukoFlow:
técnicamente eran el mismo repositorio.

**Resuelto.** Esta carpeta tiene repositorio propio con remoto `abrinay1997-stack/Safetory`.

- Este proyecto **no comparte nada** con ningún otro de `DESARROLLOS/`.
- No leas, no cites ni tomes decisiones basadas en otros proyectos de esa carpeta.
- `FLASK/` vive aquí como referencia de stack y movimiento, con su propio remoto
  (`abrinay1997-stack/FLASK`). Está en `.gitignore`. Consúltalo, no lo modifiques.

---

## Proyecto

- **Cliente:** Safetory Studio
- **Sector / zona:** Estudio de grabación, producción musical y ciclorama · Panamá, Panamá
- **Objetivo principal del sitio:** reservas (vía WhatsApp hasta la fase 2)
- **Familia de ADN:** **D — Creative Studio / WebGL**, con desviación cromática documentada:
  fondo `#080808` en vez de `#1a1a1a` y acento rojo único `#FF2D2D` en vez del par de neones.
  La desviación es deliberada: el espacio físico de Safetory es rojo laca y el wordmark es
  monocromo. Cumple el motor de variación anti-clon de `docs/ZERA-DNA-MASTER.md` §16.
- **Signature:** *El Inventario* — seis objetos reales del estudio modelados proceduralmente
  en Three.js, uno por ruta, recorridos por una cámara en espiral áurea.
- **Momento orquestado (uno solo):** el despiece del micrófono en `/`, bloque 3.
- **Arquitectura:** multipágina, 6 rutas, 37 pantallas a `100dvh`
- **Versión del kit:** `zera-kit v2.0`

## Documentos de referencia (léelos antes de codificar)

1. `docs/superpowers/specs/2026-09-07-safetory-sitio-3d-design.md` — **el diseño aprobado.**
   Es la referencia principal: rutas, bloques, tokens, sistema 3D, presupuesto y huecos.
2. `docs/ZERA-DNA-MASTER.md` — el genoma: tokens, familias, bloques, estándares.
3. `docs/SISTEMA-DE-PRODUCCION.md` — proceso y las cuatro pasadas de calidad.
4. `src/data/*.ts` — el contenido real. **Única fuente de verdad del texto y los precios.**

---

## Stack

Astro ^7.3.1 · three ^0.185.1 (import dinámico) · gsap ^3.15.0 · lenis ^1.3.26 · split-type ^0.3.4
Desarrollo: vitest ^5.0.0 · @types/three (no llegan al navegador).
Tipografía: Clash Display + Satoshi, auto-hospedadas.
Despliegue: GitHub → Netlify (preview en cada PR, producción en `main`).

**Sin React, sin React Three Fiber.** El 3D vive en islas de Astro con JavaScript plano;
meter React costaría el presupuesto de arranque entero.

## Comandos

```bash
npm run dev       # desarrollo
npm run build     # build de producción
npm run preview   # servir el build
```

---

## Reglas innegociables

1. **No inventes contenido.** Si un dato no está en `src/data/`, el bloque no se renderiza.
   Nunca cifras de relleno, testimonios ficticios ni logotipos de terceros.
   Los huecos conocidos están en el spec §9.5 — no los rellenes por tu cuenta.
2. **Cero placeholders en el código.** Ningún `lorem`, `your-…-code`, `G-XXXXXXXXXX`,
   `href="#"`. Los IDs de analítica van en variables de entorno.
3. **Accesibilidad = 100** en Lighthouse. `:focus-visible` en todo lo interactivo,
   contraste ≥4.5:1, `prefers-reduced-motion` real, teclado de principio a fin.
4. **Rendimiento:** LCP ≤1.8s · INP ≤150ms · CLS ≤0.02 · **JS inicial ≤140 KB gz.**
   Three.js pesa ~150 KB gz por sí solo: **jamás en el arranque.** Póster WebP como LCP,
   `import()` dinámico después del idle, cross-fade al primer frame. Spec §7.
5. **Animar sólo `transform` y `opacity`.** Nunca `width`, `height`, `top`, `left`.
6. **Máximo 2 secciones con `pin`** por página, ninguna con `pin` por debajo de 768px.
7. **Un solo `<h1>` por página** y jerarquía semántica real. El texto animado sigue existiendo
   en el DOM como texto. **Ninguna palabra del sitio existe solo dentro del canvas.**
8. **Un solo acento cromático:** `--rec` `#FF2D2D`. El ámbar y el violeta del estudio son
   temperatura de luz dentro de la escena 3D, nunca tokens de interfaz.
9. **Un momento orquestado por sitio.** Ya está asignado: el despiece del micrófono en `/`.
   El resto del movimiento es sobrio.
10. **Un commit por bloque**, con mensaje `feat(Sxx): descripción`.
11. **Toda sección ocupa `100dvh`.** `dvh` y no `vh`: la barra del navegador móvil provoca
    saltos con `vh`.
12. **Toda proporción sale de la escala φ.** `--phi-0` … `--phi-7`. Los repartos de ancho son
    61,8 / 38,2, nunca 50/50.

## Antes de escribir código

Muéstrame primero el plan (composición de bloques, decisiones de tipografía y movimiento)
en no más de 10 líneas, y espera mi visto bueno.

## Antes de decir que algo está terminado

Ejecuta las cuatro pasadas de calidad en este orden: **SEO → Accesibilidad → Rendimiento → Copy**
(ver `docs/SISTEMA-DE-PRODUCCION.md` §7) y entrégame el resultado de cada una.

## Nunca

- Añadir dependencias no listadas sin preguntar.
- Cambiar tokens globales para resolver un caso concreto.
- Publicar marcas y modelos de equipo sin confirmación escrita del cliente: identificar mal
  un equipo en la web de un estudio destruye la credibilidad ante un profesional.
- Publicar `aggregateRating` u otros datos estructurados sin evidencia real.
- Volver a depender de Setmore ni de ningún otro servicio de agendado de terceros.

---

## Estado actual

**2026-09-07 — Diseño aprobado, sin código todavía.**

Hecho:
- Repositorio propio inicializado, aislado del repo de la carpeta de usuario.
- Contenido real extraído de Setmore (7 servicios de producción, tarifas de estudio y
  ciclorama, contacto y horario) y fotografías del cliente analizadas.
- Spec completo escrito y aprobado.

Siguiente: plan de implementación (skill `writing-plans`), después scaffolding de Astro.

Bloqueado esperando contenido del cliente (spec §9.5): precio de la membresía, marcas y
modelos del equipo, texto de marca, alcance del co-working, proyectos publicables.
