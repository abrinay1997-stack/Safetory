# BIBLIOTECA-DE-PROMPTS.md
## Prompts listos para pegar en Claude Code

> **Regla de oro de cada prompt:** `CONTEXTO → OBJETIVO → RESTRICCIONES → ENTREGABLE → CRITERIO DE ACEPTACIÓN`.
> Un prompt sin criterio de aceptación produce un resultado que no puedes rechazar con argumentos.

---

## P00 — Construir el kit (una sola vez)

```
Lee docs/ZERA-DNA-MASTER.md completo antes de escribir código.

OBJETIVO: crear el kit base reutilizable "zera-kit" del que saldrán todos mis sitios.

STACK: Vite + React 18 + Tailwind + Lenis + GSAP (ScrollTrigger, Flip, Observer) + split-type.

ENTREGABLE:
1. src/styles/tokens.css exactamente con los tokens de §5.1 del ADN.
2. src/styles/themes/{a,b,c,d,e}.css con las paletas de §7.1, cada una sobrescribiendo
   sólo las variables de color y las 3 familias tipográficas.
3. src/lib/: smooth.js (Lenis+GSAP ticker+reduced-motion según §8.2 y §8.4),
   reveal.js, pin.js, parallax.js, counter.js, cursor.js, marquee.js.
4. src/blocks/ con S00, S01, S02a–e, S03, S04, S05, S06, S07, S08, S09, S10, S11,
   S12, S13, S14, S15, S16, S17, S18, S19, S20 como componentes con props tipadas por
   JSDoc, que leen su contenido de content.json y NO renderizan si falta el dato.
5. src/seo/: componente Meta + schema.js con generadores de LocalBusiness, Service,
   FAQPage, BreadcrumbList y Organization.
6. brand.json y content.json de ejemplo con el esquema de §5.2 y §5 de producción.
7. netlify.toml (§17 del ADN), .gitignore, README con pasos de despliegue.

RESTRICCIONES:
- Animar sólo transform y opacity.
- Cada componente interactivo con :focus-visible y objetivo táctil ≥44px.
- Ningún ID de analítica ni verificación en el código: siempre variables de entorno.
- Cero dependencias fuera de las listadas.

ACEPTACIÓN: `npm run build` limpio, Lighthouse ≥90/100/90/90 en la página de ejemplo,
y puedo cambiar de familia editando una sola línea de brand.json.
```

---

## P01 — Sitio nuevo desde un brief

```
CONTEXTO: docs/ZERA-DNA-MASTER.md + docs/DECISION.md + brief.md (adjunto).
Cliente: <nombre>. Sector: <sector>. Zona: <ciudad>.

OBJETIVO: construir el sitio completo partiendo del kit.

CONFIGURACIÓN:
- Familia: <A|B|C|D|E>
- Paleta: bg <hex> · fg <hex> · acento <hex>
- Tipografía: display <fuente> · cuerpo <fuente> · utilidad <fuente|ninguna>
- Bloques, en orden: <S01, S02b, S05, …>
- Signature: <descripción en una frase>
- Arquitectura: <one-pager | multipágina: home + N servicios + localidad>
- Idioma: <es|en|bilingüe>

CONTENIDO: usa content.json. Si un dato no existe, elimina el bloque; nunca inventes
cifras, testimonios ni logotipos.

RESTRICCIONES: §13 (rendimiento), §14 (accesibilidad) y §12 (SEO) del ADN son obligatorios.
Máximo 2 secciones con pin. Un solo momento orquestado.

ENTREGABLE: repo funcionando, brand.json, content.json, netlify.toml, README de despliegue,
y docs/DECISION.md actualizado con lo que realmente construiste.

ACEPTACIÓN: pasa las 4 pasadas de calidad de SISTEMA-DE-PRODUCCION.md §7.
Antes de escribir código, muéstrame en 10 líneas el plan de composición y espera mi OK.
```

---

## P02 — Arranques por familia (copia el que toque)

**A · Dark Cinematic Luxury**
```
Sitio familia A del ADN. bg #080808 · fg #ededed · acento #c5a55a.
Display Instrument Serif + cuerpo Inter + mono JetBrains Mono.
Bloques: S00(≤1.2s) → S02c → S04 → S06(pin, 4 etapas) → S05 → S07 → S12 → S11 → S14 → S19 → S20.
Signature: barrido de spotlight sobre el producto ligado a la posición de scroll.
3D sólo si adjunto un .glb; si no, imagen con máscara de luz en CSS.
Tono de copy: obsesión y precisión, frases de 3–5 palabras con punto final.
```

**B · Quiet Luxury Gallery**
```
Sitio familia B. bg #000 · fg #EDEAE3 · sin acento cromático.
Display Fraunces (sustituto libre de SangBleu) + cuerpo Manrope.
Multipágina con transiciones (View Transitions API, sin Barba).
Bloques: S00 → S02a → S03 → S06 → S05 → S15 → S11 → S17(3 pasos) → S20.
Signature: cortina de velo con el nombre de la sección en cada navegación.
Duraciones 1.2–1.6s, ease --ease-inout, cero rebote. Copy sobrio, sin exclamaciones.
SSG obligatorio: este cliente depende de búsqueda orgánica.
```

**C · Tech Editorial**
```
Sitio familia C. bg #f5f5f7 · fg #0a0a0a (o modo oscuro #0b1012).
Display Space Grotesk + cuerpo Inter + JetBrains Mono para labels y datos.
Bloques: S01 → S02e → S08(bento) → S16 → S07 → S12 → S11 → S13 → S14 → S17 → S19 → S20.
Signature: diagrama del producto que se ensambla con el scroll.
Reveals cortos (0.6s). Sin 3D. Los datos son el espectáculo: contadores con cifras reales.
```

**D · Creative Studio / WebGL**
```
Sitio familia D. bg #1a1a1a · fg #fffede · acentos #25fea8 y #e8fe25 (uno dominante).
Display Clash Display + cuerpo Satoshi (ambas de Fontshare, autohospedadas).
Bloques: S00 → S02d(WebGL) → S09 → S05 → S03 → S15 → S19 → S20.
Signature: shader que reacciona a la velocidad del scroll.
Three.js con React.lazy, sólo en ≥1024px y deviceMemory ≥4; fallback imagen estática.
Cursor custom con mix-blend-mode:difference, oculto en (pointer: coarse).
```

**E · Warm Editorial Light (negocio local)**
```
Sitio familia E. bg #fbf7ef · fg #1a1a1a · acento #c5a55a.
Display Libre Bodoni + cuerpo Manrope.
ARQUITECTURA MULTIPÁGINA: home + una página por servicio (S22) + página de localidad (S23)
+ contacto. Nada de one-pager: este negocio vive del SEO local.
Bloques home: S01 → S02b(vídeo con poster) → S05 → S10 → S16 → S11 → S12 → S18 → S14 → S19 → S20.
Signature: comparador antes/después tratado como pieza editorial.
JSON-LD LocalBusiness + Service + FAQPage con NAP real. Teléfono y WhatsApp clicables.
```

---

## P03 — Un bloque concreto

```
Construye el bloque <S06 — proceso con pinning> siguiendo §9 del ADN.

Contenido: 4 etapas de content.json.process.
Comportamiento: fondo fijo, el texto de la etapa cambia con el progreso del scroll,
indicador 01/04 en mono, duración total 3000px de scroll.
Móvil (<768px): sin pin, se convierte en pila vertical con reveal por etapa.
Accesibilidad: el contenido de las 4 etapas existe en el DOM desde el inicio;
con prefers-reduced-motion se muestra como lista estática sin scroll secuestrado.
Aceptación: navegable con teclado, sin capturar el scroll más allá de su sección,
y sin provocar layout shift al entrar.
```

---

## P04 — Animación específica

```
Añade <el reveal de titular por palabras> a <selector/componente>.

Usa split-type + GSAP, stagger 0.045, duración 1s, ease power4.out, yPercent 120→0,
disparado con ScrollTrigger start 'top 85%', once.
Obligatorio: revert() bajo prefers-reduced-motion, el texto original permanece en el DOM,
y no se animan propiedades de layout.
Aceptación: sin CLS, sin parpadeo en la primera pintura (FOUC), y el H1 sigue siendo
un H1 con texto plano para lectores de pantalla.
```

---

## P05 — Pasada de SEO

```
Pasada de SEO sobre este repo, siguiendo §12 del ADN. NO cambies el diseño.

1. Audita: cuenta de H1 por página, jerarquía de headings, títulos y descripciones,
   canonical, OG/Twitter, sitemap, robots, JSON-LD, texto real en el HTML servido.
2. Corrige todo lo que falle.
3. Genera JSON-LD apropiado al tipo de negocio con los datos de content.json.
   No inventes aggregateRating ni reseñas.
4. Si es negocio local y hoy es one-pager, propón (sin ejecutar) la estructura
   multipágina con las URLs concretas.

Entrega: informe en Markdown de qué estaba mal, qué cambiaste y qué queda pendiente,
con los archivos tocados.
```

---

## P06 — Pasada de accesibilidad

```
Pasada de accesibilidad. Objetivo: Lighthouse Accesibilidad = 100 y la checklist
completa de §14 del ADN.

Revisa uno por uno: contraste (elimina cualquier rgba con alfa <0.62 en texto),
:focus-visible en todo lo interactivo, skip link, landmarks, orden de tabulación,
focus trap en modales, labels reales en formularios, errores con aria-live,
alternativas para canvas/vídeo, objetivos táctiles ≥44px, prefers-reduced-motion real,
y que el smooth-scroll no impida navegar con teclado.

No degrades el diseño para conseguirlo: ajusta valores, no elimines elementos.
Entrega: lista de cada corrección con el archivo y la línea.
```

---

## P07 — Pasada de rendimiento

```
Pasada de rendimiento contra los presupuestos de §13 del ADN (LCP ≤1.8s, INP ≤150ms,
CLS ≤0.02, JS inicial ≤140KB gz, Lighthouse Performance ≥92 en móvil).

1. Mide el bundle (`npm run build` + análisis) y dime los 5 mayores contribuyentes.
2. Aplica: lazy de Three.js/vídeo, code-splitting por ruta, imágenes AVIF/WebP con
   srcset y fetchpriority en el LCP, subset y preload de fuentes (máx 3 archivos),
   eliminación de dependencias duplicadas.
3. Verifica que sigues animando sólo transform/opacity.
Entrega: tabla antes/después por métrica.
```

---

## P08 — Pasada de copy y credibilidad

```
Pasada de copy siguiendo §11 y §15.3 del ADN.

1. Busca y elimina TODO placeholder: lorem, "your-", G-XXXXXXXXXX, "0+", href="#",
   imágenes de ejemplo, textos de relleno.
2. Cada cifra debe tener fuente y fecha en content.json; si no la tiene, elimina el bloque
   y avísame de cuál era.
3. Testimonios: nombre completo, cargo y resultado. Si sólo hay iniciales, márcalos para
   que yo pida permiso al cliente; no los publiques.
4. Unifica los verbos de CTA entre botón, formulario y confirmación.
5. Revisa idioma y ortografía, incluidos alt y aria-label.
Entrega: informe de lo eliminado y lo que necesito conseguir del cliente.
```

---

## P09 — Auditoría final (antes de entregar)

```
Auditoría completa contra la rúbrica §19 del ADN. Puntúa de 1 a 10 cada dimensión
(UX, navegación, claridad, comprensión, fricción, confianza, accesibilidad, rendimiento,
SEO, distinción visual), con evidencia concreta de por qué esa nota.

Marca en rojo todo lo que esté por debajo del objetivo y dame el plan de corrección
ordenado por impacto/esfuerzo. No corrijas todavía: primero quiero el diagnóstico.
```

---

## P10 — Variación anti-clon

```
Este sitio se parece demasiado a <proyecto anterior>. Aplica §16 del ADN.

Cambia al menos 4 de los 8 ejes de variación manteniendo la familia y sin tocar el contenido:
propón dos direcciones distintas (paleta, par tipográfico, layout de hero, sistema
estructural, textura, densidad y sobre todo un SIGNATURE nuevo derivado del mundo del
cliente: <describe el oficio, materiales y jerga del cliente>).

Entrega: dos propuestas en texto + ASCII wireframe del hero de cada una. Elijo yo,
y sólo entonces implementas.
```

---

## P11 — Convertir one-pager en arquitectura SEO

```
Este sitio es un one-pager y el cliente es un negocio local (<sector>, <ciudad>).
Conviértelo a multipágina según §12.2 del ADN, sin perder el diseño.

Estructura objetivo: home (resumen) + /servicios/<slug> por cada servicio (S22, 600–900
palabras únicas, FAQ propia, CTA, schema Service) + /<ciudad> (S23) + /contacto.
Migra a SSG. Añade breadcrumbs, enlazado interno coherente y sitemap.
Cuidado: nada de contenido duplicado entre páginas de localidad.
Entrega: mapa de URLs, redirecciones necesarias y el plan de contenido que debo escribir.
```

---

## P12 — Refactor de un sitio antiguo al kit

```
Este repo se hizo antes del sistema de tokens. Refactorízalo:
1. Sustituye todos los valores de color, espaciado, tipografía y timing por las variables
   de tokens.css (§5.1) sin cambiar el resultado visual.
2. Extrae las secciones a bloques S-ID equivalentes.
3. Crea brand.json y content.json a partir de lo que hoy está hardcodeado.
4. Documenta en el README con qué versión del kit queda alineado.
Aceptación: capturas antes/después idénticas y `git diff` sin cambios de píxel no justificados.
```

---

## Micro-prompts de corrección (para el día a día)

```
· "Este hero tarda en aparecer: mueve el reveal a CSS y deja GSAP sólo para el stagger."
· "El pin secuestra el scroll en móvil. Desactívalo bajo 768px y conviértelo en pila."
· "Estos tres bloques usan tres escalas distintas. Unifícalos con --section-y."
· "El foco no se ve sobre el fondo oscuro. Anillo 2px del color de acento, offset 3px."
· "Quita una cosa: sobra decoración. Dime qué eliminarías tú primero y por qué."
· "Este número no tiene fuente en content.json. Elimínalo y dime qué le pido al cliente."
· "Hazlo sin JavaScript: si se puede resolver con CSS, no uses GSAP."
· "Muéstrame el plan antes de tocar código."
```

---

## Prompt de arranque diario (pégalo al abrir sesión)

```
Antes de nada: lee CLAUDE.md, docs/ZERA-DNA-MASTER.md y docs/DECISION.md de este repo.
Resúmeme en 5 líneas dónde quedó el proyecto, qué bloques faltan y qué está bloqueado
esperando contenido del cliente. Luego espera instrucciones.
```
