# ZERA-DNA-MASTER.md
## ADN unificado de diseño, arquitectura y producción — v2.0

> **Qué es este documento.** La fusión de dos investigaciones independientes sobre el mismo
> creador (Zera Software Studio: hub comercial + 7 sitios/demos), auditada, deduplicada,
> corregida y convertida en un **genoma reproducible**: reglas, tokens, bloques, recetas de
> animación y estándares de calidad con los que Claude Code puede generar sitios del mismo
> nivel — de forma repetible y sin que todos parezcan el mismo sitio.
>
> **Diferencia clave con los documentos originales:** el Análisis A describe *qué hace* Zera
> y *dónde falla* (UX, SEO, CRO, accesibilidad 4/10). El Análisis B describe *cómo está hecho*
> (stack, bundles, fuentes, tokens). Este master **suma ambos y añade la capa que ninguno tenía:
> un sistema de tokens compartido, un motor de variación anti-clon y una definición de terminado.**

---

## ÍNDICE

| # | Sección | Para qué sirve |
|---|---|---|
| 0 | Cómo usar este sistema | Orden de carga en Claude Code |
| 1 | El objeto clonado | Qué es Zera, sus 7 sitios, su negocio |
| 2 | Auditoría de consistencia | Conflictos entre los dos análisis y su resolución |
| 3 | Los 12 principios del ADN | La tesis de diseño |
| 4 | Las 5 familias | Arquetipos completos listos para instanciar |
| 5 | Sistema de tokens | La capa que Zera **no** tiene y nosotros sí |
| 6 | Tipografía | Pares, escalas, self-hosting |
| 7 | Color | Paletas exactas + reglas de contraste |
| 8 | Movimiento | Tokens de motion + recetario GSAP/Lenis |
| 9 | Biblioteca de bloques | 24 secciones canónicas (S00–S23) |
| 10 | Componentes | Inventario con anatomía y estados |
| 11 | Copywriting | Voz, fórmulas, banco de titulares y CTAs |
| 12 | SEO y semántica | Lo que Zera hace mal y nuestro estándar |
| 13 | Rendimiento | Presupuestos numéricos |
| 14 | Accesibilidad | El fallo #1 del original, resuelto |
| 15 | Conversión (CRO) | Embudo, prueba social y plan de medición |
| 16 | Motor de variación | Cómo hacer 300 sitios sin 300 clones |
| 17 | Stack y decisiones | Árbol de decisión técnico |
| 18 | Antipatrones | Lista negra |
| 19 | Rúbrica de calidad | Definition of Done con notas objetivo |

---

## 0. CÓMO USAR ESTE SISTEMA

El sistema son **4 archivos**. Colócalos así en cada repo:

```
mi-proyecto/
├── CLAUDE.md                  ← reglas permanentes (Claude Code lo lee siempre)
├── docs/
│   ├── ZERA-DNA-MASTER.md     ← este archivo (el genoma)
│   ├── SISTEMA-DE-PRODUCCION.md
│   └── BIBLIOTECA-DE-PROMPTS.md
└── brand.json                 ← el ADN *de este cliente concreto*
```

**Orden de precedencia cuando algo entra en conflicto:**

`brand.json` (cliente) → `CLAUDE.md` (reglas del repo) → `ZERA-DNA-MASTER.md` (genoma) → criterio de Claude.

**Regla de invocación:** nunca digas "hazme una web bonita". Di:
> "Sitio nuevo. Familia **B (Quiet Luxury Gallery)**, tokens de `brand.json`, bloques
> S00→S02b→S03→S06→S05→S09→S11→S14→S19→S20, signature = *cortina de seda por scroll*.
> Cumple §13 (rendimiento) y §14 (accesibilidad). Entrega con `netlify.toml` y README."

---

## 1. EL OBJETO CLONADO

### 1.1 No es una web, es un ecosistema comercial

```
zerasoftwarestudio.com (HUB — Next.js App Router)
├── /portfolio ......... showcase de agencia (Services · Team · Works · Contact)
├── /webdeveloper ...... landing de venta de masterclass $29 (tráfico Meta Ads)
│
└── DEMOS = casos de estudio + plantillas vendibles (subdominios, stacks distintos)
    ├── portfolio7 ......... "Zera Studio Site" — WebGL/Three.js
    ├── portfolio8 ......... Detail Driven Niagara — detailing de autos
    ├── portfolio12 ........ Naveera — SaaS de transporte médico (NEMT)
    ├── eterna ............. Eterna — medicina regenerativa de lujo
    ├── ndarenovations ..... NDA Group — reformas de hogar (home + /about)
    └── georgiesaesthetics . Georgie's Aesthetics — clínica estética
```

**Modelo de negocio:** agencia productizada + educación.
1. Proyectos a medida ($5K–$20K por su propio copy).
2. Plantillas/licencias (las demos son reutilizables → es exactamente lo que tú vas a hacer).
3. Infoproducto tripwire ($499 tachado → $29) alimentado con Meta Ads.

**Doble audiencia con el mismo activo:** fundadores de marcas premium ↔ freelancers que
quieren aprender a construirlas. El portfolio es el "muro de credibilidad" de ambos.

**Propuesta de valor literal:** *"We shape websites through systems, restraint, and emotional precision."*
No venden "web bonita": venden **posicionamiento de marca mediante craft y movimiento**.

**Estrategia de conversión:** embudo por prestigio → demo cinemática → deseo → formulario de
**aplicación** ("By application only") para fabricar escasez y subir el valor percibido.

### 1.2 Ficha técnica consolidada de los 7 sitios

| Sitio | Vertical | Framework | Animación | 3D | Fuentes | Fondo | Acento | Hosting observado |
|---|---|---|---|---|---|---|---|---|
| **Hub** zerasoftwarestudio.com | Agencia | Next.js (App Router) | Lenis | — | Inter + Playfair Display *(en `/webdeveloper`: + Cormorant, Fraunces, Space Mono, Josefin)* | `#000` | mínimo | Heroku (SSR, `x-nextjs-cache`) |
| **/portfolio** | Showcase | Export estático tipo Webflow + jQuery 3.5.1 | GSAP (ScrollTrigger, Flip, SplitText) | — | — | `#000` | mínimo | — |
| **portfolio7** Zera Studio | Estudio creativo | Next.js + Tailwind | Lenis + GSAP + cursor custom | canvas WebGL | Boxing (display) + Satoshi | `#1a1a1a` / crema `#fffede` | `#25fea8` / `#e8fe25` | Next.js |
| **portfolio8** Detail Driven | Detailing autos | Vite (servidor Express) | GSAP full: ScrollTrigger + **ScrollSmoother** + Flip + Observer + Lenis | Three.js + GLTFLoader + **DRACOLoader** | Inter + Outfit + Instrument Serif | `#080808` | **`#c5a55a` dorado** | Express (Node) |
| **portfolio12** Naveera | SaaS/logística | Next.js + **Turbopack** | Lenis | — | Space Grotesk + Syne + JetBrains Mono | `#f5f5f7` | azul tech | Next.js |
| **eterna** | Medicina de lujo | Vite | GSAP (ScrollTrigger + Flip + Observer) + **Barba.js** + Lenis | canvas | **SangBleu Sunrise** (pago) + Manrope | `#000` | ninguno (monocromo) | — |
| **ndarenovations** | Reformas hogar | Next.js | Lenis | — | Inter + JetBrains Mono | `#0b1012` | neutro cálido | Next.js |
| **georgiesaesthetics** | Clínica estética | Vite + React (`createRoot`) | GSAP (ScrollTrigger + Flip + Observer) + Lenis | canvas + `<video>` | **Libre Bodoni** + Manrope | `#fbf7ef` crema | `#c5a55a` dorado suave | Caddy |

**Librerías presentes en la mayoría:** Lenis (6 de 7), GSAP + ScrollTrigger/Flip/Observer,
Three.js sólo donde aporta, Tailwind en los Next, React 18 en los Vite modernos.

**Marketing detectado en el hub:** GTM (`GTM-K6KSTS8X`), Google Ads (`gtag AW-`),
Meta Pixel (`fbevents.js`), meta OG/Twitter completos, PWA (theme-color, manifest).

---

## 2. AUDITORÍA DE CONSISTENCIA (conflictos entre los dos análisis)

Los dos informes se contradicen en 6 puntos. Esta es la resolución adoptada — **importa porque
si clonas el dato equivocado, clonas el error.**

| # | Conflicto | Análisis A | Análisis B | Resolución adoptada |
|---|---|---|---|---|
| 1 | Stack de **portfolio8** | Export tipo Webflow + jQuery + GSAP | Vite + Express + GSAP completo + Three.js/DRACO | **B manda** (inspección de bundles). Lo que A describe corresponde al hub `/portfolio`, no a portfolio8. Ambos datos son válidos, en sitios distintos. |
| 2 | Paleta de **Georgie's** | Negro cinematográfico + acento teal | Crema `#fbf7ef` + dorado `#c5a55a` | Ambos: **hero oscuro con vídeo + cuerpo de página crema**. Para tokens usa B (medición directa); para intención narrativa, A. |
| 3 | Paleta de **Naveera** | Azul sobre oscuro | `#f5f5f7` claro | **B manda** para tokens. A leyó probablemente el hero/estado inicial. |
| 4 | Hosting | AWS S3 + CloudFront + Route53 | Heroku/Express y Caddy | **B manda**: los headers HTTP no mienten; AWS es lo que dice su *copy*. Lección: el stack que anuncia un estudio ≠ el que corre. |
| 5 | Fuentes del hub | Inter + Cormorant + Fraunces + Space Mono + Josefin | Inter + Playfair Display | Rutas distintas: `/webdeveloper` (landing de venta) usa el stack rico; la home usa el sobrio. **Ambos ciertos.** |
| 6 | Animación de texto | GSAP **SplitText** | `split-type` como alternativa | **SplitText es de pago (GSAP Club)**. Usa `split-type` salvo que tengas licencia. Idéntico resultado. |

> **Nota sobre el Análisis A:** llegó truncado en el punto 42 de "Fortalezas" (faltan
> debilidades, mejoras y los apartados 14–19 de rediseño). Sus conclusiones críticas
> (accesibilidad 4/10, credibilidad placeholder, one-pagers sin SEO, `503` de hosting)
> están recogidas e integradas en §12, §13, §14, §15 y §18 de este documento.

---

## 3. LOS 12 PRINCIPIOS DEL ADN

**Los 9 que copiamos de Zera:**

1. **Movimiento como identidad.** Nada aparece de golpe. Todo entra por scroll con inercia. El scroll es "pesado" y cinemático.
2. **Tipografía protagonista.** Titulares de 72–214px. El tipo *es* la imagen; la imagen es soporte.
3. **Paleta de 2–3 colores.** Fondo casi negro (`#080808`) o crema (`#fbf7ef`) + **un** acento. Nunca dos acentos compitiendo.
4. **Espacio negativo caro.** Secciones a `100vh`/`h-dvh`, márgenes laterales generosos, respiración vertical enorme.
5. **Estructura editorial.** Numeración `01 / 02 / 03`, kickers en mono en mayúsculas, hairlines de 1px, headers de sección gigantes. *(Con la restricción del punto 12.)*
6. **Restraint.** Iconografía mínima y funcional. Cero decoración. Si un elemento no dice nada verdadero, se elimina.
7. **Copy de eslogan.** Frases cortas con punto final que dan cadencia: *"Strip. Cleanse. Reveal."* · *"Perfection, Refined."*
8. **Cierre por exclusividad.** CTA verbal fuerte + escasez real: "Apply to Work With Me", "Taking on a limited number of builds".
9. **Craft obsesivo.** Cursor custom, `mix-blend-mode`, grano/ruido, micro-hover en todo, fuentes auto-hospedadas y precargadas.

**Los 3 que Zera incumple y son innegociables para nosotros (aquí está tu ventaja competitiva):**

10. **Accesibilidad como parte del craft.** Zera saca **4/10**. Texto gris sobre negro, foco invisible, `canvas` sin alternativa, scroll-jacking. Un sitio inaccesible no es "premium", es descuidado. → §14.
11. **Credibilidad dura antes que persuasión blanda.** Zera muestra `0+ vehicles detailed`, testimonios de "James R." y `G-XXXXXXXXXX` en producción. Eso crea *uncanny valley* de confianza. Números reales o ningún número. → §15.
12. **La estructura debe significar algo.** Numerar `01/02/03` sólo si el contenido **es** una secuencia real. Un kicker que no aporta información es decoración disfrazada de sistema. La misma fórmula editorial aplicada a 300 sitios sin criterio es plantilla, no diseño. → §16.

---

## 4. LAS 5 FAMILIAS (arquetipos instanciables)

Cada familia es una configuración completa y coherente. Al iniciar un proyecto, **eliges familia
primero** y todo lo demás se deriva.

---

### FAMILIA A — DARK CINEMATIC LUXURY
*Referencia: Detail Driven Niagara (portfolio8)*

| Campo | Valor |
|---|---|
| **Verticales** | Detailing/tuning, joyería, relojería, náutica, barbería premium, whisky/cigarros, autos de lujo, seguridad privada de alto ticket |
| **Emoción** | Obsesión, precisión, deseo. *"This is what obsession looks like."* |
| **Fondo / Texto / Acento** | `#080808` / `#ededed` / **`#c5a55a`** (dorado champán) |
| **Tipografía** | Display: `Instrument Serif` o `Outfit` · Cuerpo: `Inter` · Utilidad: mono opcional |
| **Movimiento firma** | Spotlight/glow que sigue al hero + proceso con **pinning** 01→05 + producto 3D girando con el scroll |
| **3D** | Sí, si el producto es físico y fotogénico (`.glb` + DRACO, lazy) |
| **Bloques base** | S00 → S02c → S04 → S06 → S05 → S07 → S12 → S11 → S14 → S19 → S20 |
| **Signature sugerido** | Haz de luz que barre el objeto según la posición del scroll |
| **Riesgo** | El dorado sobre negro es el combo más imitado de 2024–2026. Diferénciate por textura (grano, metal, laca) y por el sello, no por el color. |
| **Stack** | Vite + React (one-pager) o Next.js si hay servicios múltiples |

---

### FAMILIA B — QUIET LUXURY GALLERY
*Referencia: Eterna*

| Campo | Valor |
|---|---|
| **Verticales** | Medicina regenerativa/longevidad, cirugía plástica, arquitectura, arte, alta joyería, inmobiliaria de lujo, moda |
| **Emoción** | Discreción, autoridad silenciosa, tiempo. *"The version of you that time hasn't met yet."* |
| **Fondo / Texto / Acento** | `#000` o `#0a0a0a` / `#EDEAE3` (piedra/off-white) / **ninguno** — el lujo aquí es la ausencia de saturación |
| **Tipografía** | Display: `SangBleu Sunrise` (pago) → libre: **`Fraunces`** o `Playfair Display` · Cuerpo: `Manrope` |
| **Movimiento firma** | **Transiciones de página completas** (Barba.js / View Transitions API) + fades largos (1.2–1.6s) + cero rebote |
| **3D** | Rara vez. Canvas sutil de partículas o ruido como máximo |
| **Bloques base** | S00 → S02a → S03 → S06 → S05 → S15 → S11 → S17 (aplicación privada) → S20 |
| **Signature sugerido** | Cortina/velo que cubre la pantalla en cada navegación, con el nombre de la sección en el centro |
| **Riesgo** | Se vuelve frío y vacío si no hay contenido real (protocolos, credenciales médicas, nombres). Necesita **sustancia**, no sólo atmósfera. |
| **Stack** | Next.js SSG (los pacientes buscan en Google: el SEO no es opcional) |

---

### FAMILIA C — TECH EDITORIAL
*Referencia: Naveera (claro) · NDA Group (oscuro)*

| Campo | Valor |
|---|---|
| **Verticales** | SaaS, B2B, fintech, logística, salud digital, dev tools, reformas/construcción técnica |
| **Emoción** | Competencia, claridad, confianza operativa |
| **Fondo / Texto / Acento** | Claro: `#f5f5f7` / `#0a0a0a` · Oscuro: `#0b1012` / `#ededed` · Acento: azul/verde funcional |
| **Tipografía** | Display: `Space Grotesk` o `Syne` · Cuerpo: `Inter` · Utilidad: **`JetBrains Mono`** para labels, datos y kickers |
| **Movimiento firma** | **Contadores animados**, reveals cortos (0.6s), datos que se construyen, diagramas que se dibujan. Sobriedad. |
| **3D** | No. Aquí el 3D resta credibilidad. |
| **Bloques base** | S01 → S02e (split) → S08 (bento) → S16 → S07 → S12 → S11 → S13 → S14 → S17 → S19 → S20 |
| **Signature sugerido** | Un diagrama vivo del producto que se ensambla mientras haces scroll |
| **Riesgo** | Caer en el "SaaS genérico". Sálvalo con datos reales y con el uso disciplinado del mono. |
| **Stack** | Next.js (App Router) + Tailwind. SSG/ISR. |

---

### FAMILIA D — CREATIVE STUDIO / WEBGL
*Referencia: portfolio7 (Zera Studio Site)*

| Campo | Valor |
|---|---|
| **Verticales** | Estudios de diseño, productoras, fotógrafos, agencias, artistas, portfolios personales, música |
| **Emoción** | Talento, atrevimiento, "mira lo que sé hacer" |
| **Fondo / Texto / Acento** | `#1a1a1a` / crema `#fffede` / neones `#25fea8` + `#e8fe25` |
| **Tipografía** | Display custom o de carácter (`Boxing` → libre: **`Clash Display`**, Fontshare) · Cuerpo: **`Satoshi`** (gratis en Fontshare) |
| **Movimiento firma** | **Cursor custom con `mix-blend-mode: difference`**, WebGL/shaders, títulos a `13.75rem`, distorsión en hover |
| **3D** | Sí, es el argumento del sitio. Aun así: lazy y con fallback estático. |
| **Bloques base** | S00 → S02d (WebGL) → S09 → S05 → S03 → S15 → S19 → S20 |
| **Signature sugerido** | Shader que reacciona a la velocidad del scroll o del puntero |
| **Riesgo** | Bundle Three.js ≈ **550 KB**. Sin lazy-load matas el LCP. Y sin fallback, en móvil gama media es una pantalla negra. |
| **Stack** | Next.js + Tailwind + `@react-three/fiber` + `drei` |

---

### FAMILIA E — WARM EDITORIAL LIGHT
*Referencia: Georgie's Aesthetics*

| Campo | Valor |
|---|---|
| **Verticales** | Clínicas estéticas, wellness, spa, odontología, nutrición, hospitality, cafés/restaurantes, tiendas de decoración, reformas residenciales |
| **Emoción** | Cercanía cara. Confianza cálida, no fría. |
| **Fondo / Texto / Acento** | `#fbf7ef` (crema cálido) / `#1a1a1a` / **`#c5a55a`** dorado suave |
| **Tipografía** | Display: **`Libre Bodoni`** (serif de alto contraste) · Cuerpo: `Manrope` |
| **Movimiento firma** | Vídeo de fondo en el hero + parallax suave en galería + reveals cálidos, más lentos que en C |
| **3D** | No |
| **Bloques base** | S01 → S02b (vídeo) → S05 → S10 (antes/después) → S16 → S11 → S12 → S18 (mapa/NAP) → S14 → S19 → S20 |
| **Signature sugerido** | Comparador antes/después con arrastre, tratado como pieza editorial y no como widget |
| **Riesgo** | **Es un negocio local: el SEO manda sobre el espectáculo.** One-pager = suicidio comercial. Exige multipágina + `LocalBusiness` schema. |
| **Stack** | Next.js SSG con página por servicio y por localidad |

---

### 4.6 Selector rápido de familia

```
¿El cliente vende un objeto físico deseable?            → A
¿Vende discreción, salud premium o tiempo?              → B
¿Vende software, procesos o datos?                      → C
¿Se vende a sí mismo (portfolio/creatividad)?           → D
¿Es un negocio local que necesita que lo encuentren?    → E
```

---

## 5. SISTEMA DE TOKENS UNIFICADO

> **Esto es lo que Zera NO tiene.** Cada demo suya reinventa su escala de espaciado. Para hacer
> 300 sitios necesitas lo contrario: **un núcleo único + una capa de tema por marca**.

### 5.1 `tokens.css` (núcleo — idéntico en todos los proyectos)

```css
:root {
  /* ---------- ESPACIADO (escala geométrica base 4) ---------- */
  --sp-1: 0.25rem;  --sp-2: 0.5rem;   --sp-3: 0.75rem;  --sp-4: 1rem;
  --sp-6: 1.5rem;   --sp-8: 2rem;     --sp-12: 3rem;    --sp-16: 4rem;
  --sp-24: 6rem;    --sp-32: 8rem;    --sp-48: 12rem;   --sp-64: 16rem;

  /* Ritmo de sección: el "aire caro" es una variable, no una improvisación */
  --section-y:      clamp(6rem, 12vh, 12rem);
  --section-y-lg:   clamp(10rem, 20vh, 20rem);
  --block-gap:      clamp(2rem, 5vw, 6rem);

  /* ---------- LAYOUT ---------- */
  --gutter:      clamp(1.25rem, 5vw, 5rem);
  --container:   80rem;      /* 1280px */
  --container-wide: 100rem;
  --measure:     68ch;       /* longitud máxima de línea de texto */

  /* ---------- TIPOGRAFÍA FLUIDA (min 360px → max 1440px) ---------- */
  --fs-mono:    0.6875rem;                              /* kickers 11px */
  --fs-xs:      clamp(0.75rem, 0.72rem + 0.15vw, 0.8125rem);
  --fs-sm:      clamp(0.875rem, 0.84rem + 0.18vw, 0.9375rem);
  --fs-base:    clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  --fs-lg:      clamp(1.25rem, 1.1rem + 0.7vw, 1.5rem);
  --fs-xl:      clamp(1.75rem, 1.4rem + 1.6vw, 2.5rem);
  --fs-2xl:     clamp(2.25rem, 1.6rem + 3vw, 4rem);
  --fs-3xl:     clamp(3rem, 1.8rem + 6vw, 6.5rem);
  --fs-hero:    clamp(3.5rem, 1.5rem + 11vw, 13.75rem);  /* 214px = escala Zera */

  --lh-tight: 0.92;  --lh-snug: 1.08;  --lh-body: 1.6;  --lh-relaxed: 1.75;
  --tr-display: -0.03em;   /* tracking negativo en display grande */
  --tr-body: 0em;
  --tr-mono: 0.14em;       /* kickers en mayúsculas, muy abiertos */

  /* ---------- LÍNEAS, RADIOS, ELEVACIÓN ---------- */
  --hairline: 1px;
  --r-none: 0; --r-sm: 4px; --r-pill: 999px;
  --shadow-glow: 0 0 80px -20px var(--accent);

  /* ---------- MOVIMIENTO ---------- */
  --d-fast:   0.25s;   /* micro-hover  */
  --d-base:   0.6s;    /* reveal corto */
  --d-slow:   1.0s;    /* reveal hero  */
  --d-cine:   1.4s;    /* transición de página */
  --ease-out:   cubic-bezier(0.16, 1, 0.3, 1);      /* ≈ expo.out  */
  --ease-inout: cubic-bezier(0.76, 0, 0.24, 1);     /* cortinas    */
  --ease-soft:  cubic-bezier(0.33, 1, 0.68, 1);     /* ≈ power3.out*/
  --stagger: 0.045s;

  /* ---------- CAPAS ---------- */
  --z-canvas: 0; --z-content: 10; --z-nav: 100; --z-cursor: 500; --z-overlay: 1000;
}

@media (prefers-reduced-motion: reduce) {
  :root { --d-fast:0.01s; --d-base:0.01s; --d-slow:0.01s; --d-cine:0.01s; --stagger:0s; }
}
```

### 5.2 Capa de tema (`brand.json` → variables CSS)

```jsonc
{
  "brand": "detail-driven",
  "family": "A",
  "color": {
    "bg":      "#080808",
    "surface": "#0f0f0f",
    "fg":      "#ededed",
    "muted":   "rgba(255,255,255,0.62)",   // ⚠ 0.62 mínimo, NO 0.4 (contraste)
    "line":    "rgba(255,255,255,0.12)",
    "accent":  "#c5a55a",
    "accent-fg": "#080808"
  },
  "type": {
    "display": "Instrument Serif",
    "body":    "Inter",
    "utility": "JetBrains Mono",
    "displayWeight": 400,
    "heroScale": 1.0
  },
  "motion": { "intensity": "high", "smoothScroll": true, "pageTransitions": false },
  "signature": "spotlight-sweep",
  "sections": ["S00","S02c","S04","S06","S05","S07","S12","S11","S14","S19","S20"]
}
```

> **Por qué importa:** con esto, generar el sitio nº 87 es cambiar un JSON y elegir bloques.
> Sin esto, es reescribir CSS desde cero 87 veces.

---

## 6. SISTEMA TIPOGRÁFICO

### 6.1 Tres roles, nunca más

| Rol | Función | Uso |
|---|---|---|
| **Display** | La personalidad | Sólo H1/H2 y statements. Con moderación. |
| **Cuerpo** | La legibilidad | Todo el texto corrido, botones, nav |
| **Utilidad (mono)** | El sistema | Kickers, numeración, datos, tags, labels. **Siempre mayúsculas + tracking `0.14em` + 11–12px** |

### 6.2 Pares confirmados (y su equivalente gratuito)

| Dirección | Display | Cuerpo | Utilidad | Nota de licencia |
|---|---|---|---|---|
| Lujo editorial (B/E) | SangBleu Sunrise | Manrope | — | **De pago.** Libre: **Fraunces** o Playfair Display |
| Clínica cálida (E) | Libre Bodoni | Manrope | — | Todo gratis (Google Fonts) |
| Automotriz (A) | Instrument Serif / Outfit | Inter | JetBrains Mono | Todo gratis |
| Tech (C) | Space Grotesk / Syne | Inter | JetBrains Mono | Todo gratis |
| Estudio creativo (D) | Boxing | Satoshi | — | Libre: **Clash Display** + **Satoshi** (Fontshare, gratis) |

### 6.3 Reglas de escala

- **Contraste dramático de tamaño:** hero `--fs-hero` (hasta 214px) contra cuerpo 16–18px. El salto *es* el diseño.
- **Peso invertido:** cuanto más grande, más ligero. Titulares gigantes en 100–400, nunca en 700. *(Naveera usa Outfit 100; portfolio12 Space Grotesk 400 a 110px.)*
- **Tracking negativo** en display (`-0.02` a `-0.04em`), **positivo** en mono (`+0.14em`).
- **`line-height` 0.92–1.08** en display; 1.6 en cuerpo.
- **Máximo 68ch** de ancho de línea. Whitespace no es dejar el texto a 1400px de ancho.

### 6.4 Self-hosting obligatorio

```html
<link rel="preload" href="/fonts/display.woff2" as="font" type="font/woff2" crossorigin>
```
```css
@font-face{
  font-family:'Display'; src:url('/fonts/display.woff2') format('woff2');
  font-weight:400; font-display:swap;
  size-adjust:104%; ascent-override:92%;   /* ajusta la métrica del fallback → CLS ≈ 0 */
}
```
- Máximo **3 archivos** de fuente en el crítico. Subsetea (latin + latin-ext).
- En Next.js: `next/font/local` (precarga y elimina el layout shift automáticamente).

---

## 7. SISTEMA DE COLOR

### 7.1 Paletas exactas observadas

```css
/* A — DARK CINEMATIC (Detail Driven) */
--bg:#080808; --fg:#ededed; --accent:#c5a55a;
--muted:rgba(255,255,255,.62); --line:rgba(255,255,255,.12);

/* B — QUIET LUXURY (Eterna) */
--bg:#000; --fg:#EDEAE3; --accent:none; --line:rgba(237,234,227,.14);

/* C — TECH CLARO (Naveera) / TECH OSCURO (NDA) */
--bg:#f5f5f7; --fg:#0a0a0a;        |  --bg:#0b1012; --fg:#ededed;

/* D — CREATIVE STUDIO (portfolio7) */
--bg:#1a1a1a; --fg:#fffede; --accent-1:#25fea8; --accent-2:#e8fe25;

/* E — WARM EDITORIAL (Georgie's) */
--bg:#fbf7ef; --fg:#1a1a1a; --accent:#c5a55a;
```

### 7.2 Reglas duras

1. **Un acento.** Dos sólo en familia D, y uno debe ser claramente secundario.
2. **El "muted" de Zera está roto.** `rgba(255,255,255,0.4)` sobre `#080808` da ~4.0:1 → falla AA en texto normal. **Mínimo `0.62`** (≈7:1). El look gris apenas cambia; la accesibilidad, mucho.
3. **Contraste mínimo:** 4.5:1 texto normal · 3:1 texto ≥24px y elementos de UI · 3:1 el anillo de foco contra su fondo.
4. **Texto sobre imagen/vídeo:** siempre con capa `linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.2))` o `backdrop-filter`. Nunca texto blanco directo sobre fotograma variable.
5. **Grano/ruido:** `.noise{position:fixed;inset:0;pointer-events:none;opacity:.035;background:url(noise.png);mix-blend-mode:overlay}` — 3.5% máximo. Más es suciedad.
6. **Glow del acento** en lugar de sombras: `--shadow-glow`.

---

## 8. SISTEMA DE MOVIMIENTO

### 8.1 Tokens y jerarquía

| Nivel | Duración | Ease | Uso |
|---|---|---|---|
| Micro | 0.2–0.3s | `--ease-soft` | hover, underline, cursor |
| Reveal | 0.6–0.8s | `--ease-out` | entradas por scroll |
| Hero | 1.0–1.2s | `--ease-out` | apertura de página |
| Cine | 1.4–1.6s | `--ease-inout` | transiciones de página, cortinas |

**Regla del momento único:** un sitio tiene **un** momento orquestado (el hero o la sección de
proceso). Todo lo demás es sobrio. Efectos dispersos = sensación de plantilla generada.

**Presupuesto de scroll:** máximo **2 secciones con `pin`** por página. Cada pin roba scroll real
al usuario; tres pines seguidos son una cárcel.

### 8.2 Base: Lenis + GSAP (idéntico en todos los proyectos)

```js
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const lenis = new Lenis({ lerp: 0.1, smoothWheel: !reduce, syncTouch: false })
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add(t => lenis.raf(t * 1000))
gsap.ticker.lagSmoothing(0)
if (reduce) lenis.destroy()
```
> `syncTouch:false`: en móvil el smooth-scroll pelea con el scroll nativo. No lo fuerces.

### 8.3 Recetario

**Reveal de titular por palabras (SplitType, alternativa gratuita a SplitText):**
```js
import SplitType from 'split-type'
const s = new SplitType('h1', { types: 'lines,words' })
gsap.from(s.words, {
  yPercent: 120, opacity: 0, duration: 1, ease: 'power4.out', stagger: 0.045,
  scrollTrigger: { trigger: 'h1', start: 'top 85%' }
})
```
⚠️ Tras animar, **restaura el DOM accesible**: `s.revert()` en `prefers-reduced-motion` y
asegúrate de que el `<h1>` conserva su texto plano para lectores de pantalla y crawlers.

**Sección con pinning (proceso 01→05):**
```js
ScrollTrigger.create({
  trigger: '.process', start: 'top top', end: '+=3000', pin: true, scrub: 1,
  onUpdate: self => setStage(Math.floor(self.progress * stages.length))
})
```

**Parallax de imágenes:**
```js
gsap.utils.toArray('.parallax img').forEach(img =>
  gsap.to(img, { yPercent: -20, ease: 'none', scrollTrigger: { trigger: img, scrub: true } }))
```

**Contador animado:**
```js
gsap.to(obj, { val: 240, duration: 2, ease: 'power2.out', snap: { val: 1 },
  onUpdate: () => el.textContent = obj.val,
  scrollTrigger: { trigger: el, start: 'top 85%', once: true } })
```

**Marquee infinito sin salto:** duplica el contenido y anima `xPercent: -50` en loop lineal
(`repeat:-1, ease:'none'`), pausando en hover y con `aria-hidden="true"` en la copia.

**Cursor custom (familia D):**
```js
const x = gsap.quickTo('.cursor','x',{duration:.4,ease:'power3'})
const y = gsap.quickTo('.cursor','y',{duration:.4,ease:'power3'})
addEventListener('pointermove', e => { x(e.clientX); y(e.clientY) })
```
`mix-blend-mode:difference` + `pointer-events:none`. **Oculto en `(pointer: coarse)`** y jamás
sustituye al foco de teclado.

**Transición de página (familia B):** Barba.js o la **View Transitions API** nativa
(`document.startViewTransition`) — más ligera y sin dependencia.

**Escena 3D (familias A/D):** `.glb` comprimido con DRACO, `PerspectiveCamera`, rotación
enganchada a `ScrollTrigger.scrub`. Carga **lazy** (`React.lazy` / `dynamic(ssr:false)`) y sólo
si el ancho ≥1024px y `deviceMemory ≥ 4`. Fallback: imagen estática del render.

### 8.4 `prefers-reduced-motion` bien hecho

```js
const mm = gsap.matchMedia()
mm.add('(prefers-reduced-motion: no-preference)', () => { /* animaciones completas */ })
mm.add('(prefers-reduced-motion: reduce)', () => { gsap.set('[data-anim]', {opacity:1, y:0, clearProps:'all'}) })
```
Reducir movimiento **no** es esconder contenido: el contenido aparece, sin recorrido.

---

## 9. BIBLIOTECA DE BLOQUES (S00–S23)

Nomenclatura estable para pedir composiciones a Claude Code: *"S02b + S06 + S10"*.

| ID | Bloque | Anatomía | Animación | Cuándo NO usarlo |
|---|---|---|---|---|
| **S00** | Preloader / Intro | Logo + contador 0–100 o "ENTER STUDIO" | Fade + cortina de salida | Si el tráfico es frío/de pago: añade fricción. Máx **1.2s** y `sessionStorage` para no repetirlo |
| **S01** | Nav minimal | Logo · 3–4 links · CTA. Variantes: barra, **pill flotante**, hamburger fullscreen | Se oculta al bajar, aparece al subir | Nunca sin estado `:focus-visible` |
| **S02a** | Hero **tipográfico** | Palabra gigante + subtítulo + indicador scroll | SplitType por palabras | — |
| **S02b** | Hero **vídeo** | `<video muted playsinline poster>` + overlay + titular | Fade + escala 1.06→1 | Vídeo >2MB o sin `poster` |
| **S02c** | Hero **producto/3D** | Objeto centrado + spotlight | Rotación con scrub | Móvil gama baja → usa imagen |
| **S02d** | Hero **WebGL** | Canvas shader a pantalla completa | Reacción a puntero/scroll | Si no eres estudio creativo |
| **S02e** | Hero **split** | 50% copy / 50% visual + CTA doble | Reveal escalonado | — |
| **S03** | Statement break | Una frase a pantalla completa, sin nada más | Palabra a palabra con scrub | Más de 2 por página |
| **S04** | Marquee / ticker | Cinta de servicios, premios o logos en bucle | Loop lineal, pausa en hover | Si el contenido no es real |
| **S05** | Servicios numerados | Lista `01→0n` con hover-reveal de imagen + micro-testimonio | Reveal + imagen que sigue al cursor | Si no hay orden real → usa grid sin números |
| **S06** | Proceso con pinning | Fondo fijo + pasos que cambian (STAGE 01…05) | `pin + scrub` | Más de 5 pasos o en móvil sin adaptar a stack vertical |
| **S07** | Stats / contadores | 3–4 cifras grandes + label mono | Conteo `once:true` | **Si no tienes cifras reales** (el `0+` de Zera destruye confianza) |
| **S08** | Bento / features grid | Rejilla asimétrica de 4–7 celdas | Reveal escalonado | Familias A/B (rompe el minimalismo) |
| **S09** | Galería / proyectos | Grid o carrusel con tags y parallax por imagen | Parallax + hover zoom | Con menos de 4 piezas reales |
| **S10** | Antes / después | Slider de arrastre + leyenda | Arrastre nativo, sin GSAP | Si las fotos no son del cliente |
| **S11** | Testimonios | **Nombre completo + foto + cargo/resultado + fecha** | Carrusel o lista 001–00n | **Iniciales anónimas ("James R.") — prohibido** |
| **S12** | Logos / certificaciones | Rejilla en escala de grises, color en hover | Fade escalonado | Logos que no tienes derecho a usar |
| **S13** | Pricing / paquetes | 2–3 tarjetas, una destacada, checklist, garantía | Reveal simple | Si el precio es "consultar" → usa S17 |
| **S14** | FAQ acordeón | 5–8 preguntas, una abierta por defecto | Altura animada + `aria-expanded` | Sin `FAQPage` schema (§12) |
| **S15** | Equipo | Retrato + nombre + rol + una línea | Hover: retrato en color | Si sólo hay una persona → fúndelo con S03 |
| **S16** | Timeline / cómo funciona | 3–5 pasos horizontales o verticales | Línea que se dibuja con scrub | Si ya usaste S06 (redundante) |
| **S17** | Formulario multi-step | Paso 1 datos · 2 contexto · 3 objetivo/presupuesto | Transición entre pasos + barra de progreso | **Tráfico frío**: usa 1 solo paso, 3 campos |
| **S18** | Mapa + NAP local | Dirección, teléfono clicable, horario, mapa embebido lazy | — | **Obligatorio** en negocio local |
| **S19** | CTA de cierre | Frase enorme + botón + email directo | Reveal + glow | Nunca sin salida alternativa (WhatsApp/tel) |
| **S20** | Footer estructurado | 3 columnas (Servicios · Empresa · Contacto) + legales + firma | — | — |
| **S21** | Blog / recursos | Listado con fecha, categoría y tiempo de lectura | — | Si no vas a publicar (peor un blog muerto) |
| **S22** | Página de servicio | H1 propio, 600–900 palabras, FAQ, CTA, schema `Service` | — | **Obligatorio** para SEO local (§12) |
| **S23** | Página de localidad | "Servicio X en Ciudad Y" con contenido único real | — | Si vas a duplicar contenido → penalización |

**Composición mínima viable de una página que convierte:**
`S01 → S02 → S05 → S07(real) → S11 → S14 → S19 → S20` — todo lo demás es amplificación.

---

## 10. INVENTARIO DE COMPONENTES

| Componente | Especificación |
|---|---|
| **Botón** | Texto + subrayado animado, o pill con borde `--hairline`. Alto mínimo 44px. Estados: `hover` (invert/underline), `:focus-visible` (anillo 2px offset 3px), `active` (escala 0.98), `disabled` (opacidad .45 + `cursor:not-allowed` + `aria-disabled`) |
| **Card de servicio** | Número mono · título display · 1 línea · imagen revelada en hover · micro-testimonio opcional |
| **Input** | Sin caja: línea inferior 1px, label flotante, `:focus` cambia la línea al acento. Nunca placeholder como label |
| **Acordeón** | `<button aria-expanded>` + `<div role="region">`; icono `+/−` que rota |
| **Badge/tag** | Mono 11px, mayúsculas, borde hairline, `--r-pill` |
| **Tarjeta de precio** | Ancla tachada → precio real, lista de checks, garantía, CTA. Una destacada por borde de acento |
| **Modal / panel** | Entra desde el lateral; **focus trap**, `Esc` cierra, `aria-modal`, scroll bloqueado |
| **Cursor custom** | Sólo en `(pointer: fine)`; nunca como único indicador de interactividad |
| **Marquee** | Duplicado + `aria-hidden` en la copia |
| **Toast/confirmación** | El verbo del botón se conserva: "Enviar" → "Enviado" |

---

## 11. COPYWRITING — EL ADN VERBAL

### 11.1 Voz

Editorial, aspiracional, sentenciosa. **Frases cortas con punto final** que crean cadencia.
Copy de campaña de perfume aplicado a servicios.

Ejemplos reales del original: *"Strip. Cleanse. Reveal."* · *"Perfection, Refined."* ·
*"We don't treat symptoms. We refine the system."* · *"This is what obsession looks like."*

### 11.2 Arco de página (invariable)

```
1. PROMESA EMOCIONAL   (hero)         → deseo
2. AUTORIDAD/PROCESO   (steps)        → cómo lo consigues
3. EVIDENCIA           (stats/testim) → por qué creerte
4. INVITACIÓN EXCLUSIVA(CTA)          → qué hago ahora
```

### 11.3 Fórmulas de titular (rellenables)

| Fórmula | Original | Plantilla |
|---|---|---|
| Tríada imperativa | Strip. Cleanse. Reveal. | `[Verbo]. [Verbo]. [Verbo].` |
| Sustantivo + refinamiento | Perfection, Refined. | `[Valor], [Participio].` |
| Negación + reencuadre | We don't treat symptoms. We refine the system. | `No [lo obvio]. [Lo verdadero].` |
| Identidad | For owners who view their vehicle as an extension of identity | `Para [persona] que ve [objeto] como [identidad]` |
| Futuro personal | The version of you that time hasn't met yet | `[El resultado] que [obstáculo] todavía no conoce` |
| Categoría + lugar | Private regenerative medicine, West Palm Beach | `[Servicio] en [ciudad]` ← **el mejor para SEO local** |

### 11.4 Banco de CTAs

Alto ticket: `Solicitar plaza` · `Aplicar para trabajar juntos` · `Reservar consulta` ·
`Iniciar tu proyecto` · `Solicitar propuesta privada`
Volumen: `Ver disponibilidad` · `Obtener acceso` · `Pedir presupuesto en 24h` · `Escríbenos por WhatsApp`

**Regla:** el verbo del CTA se mantiene idéntico en el botón, el formulario y la confirmación.

### 11.5 Gatillos y su límite ético

Escasez (`plazas limitadas este trimestre`), autoridad (`certificado por…`), prueba social,
ancla de precio (`$499 → $29`), aversión a la pérdida (garantía), aspiración/identidad.

> **Límite innegociable:** todo gatillo debe ser **verificable**. Si dices "plazas limitadas",
> que lo sean. La persuasión de Zera es de nivel alto pero está hueca por dentro
> (testimonios anónimos, `0+`); eso es exactamente lo que hace que un visitante atento
> desconfíe de todo lo demás.

---

## 12. SEO Y SEMÁNTICA

### 12.1 Diagnóstico del original

- SPAs Vite sin SSR (Eterna, Georgie's) → HTML inicial pobre para crawlers.
- Georgie's: **2 × H1** (error). Los one-pagers meten el texto como `div` animados con SplitText → **no cuenta como heading**.
- Falta **JSON-LD** en negocios locales. Oportunidad enorme perdida: Detail Driven, NDA y Georgie's deberían tener `LocalBusiness` con dirección, teléfono y horario.
- One-pager = superficie de ranking mínima. `portfolio8` duplicado sin `canonical`.
- `503` observado → fragilidad de hosting (Google no indexa lo que no responde).

### 12.2 Estándar obligatorio

1. **Un solo `<h1>` por página**, con la keyword principal, y jerarquía real `h2 > h3` — semántica, no `div` estilizados.
2. **Negocio local ⇒ multipágina.** Home + **una página por servicio (S22)** + una por localidad (S23, con contenido único) + contacto. One-pager sólo para portfolios y landings de campaña.
3. **Render:** SSG/ISR (Next.js) o prerender para cualquier sitio que dependa de búsqueda orgánica. Vite+SPA sólo para one-pagers de campaña con tráfico pagado.
4. **Metadatos completos y sin placeholders:** `title` (≤60), `description` (≤155), OG image 1200×630, Twitter card, `canonical`, `sitemap.xml`, `robots.txt`, `hreflang` si hay idiomas.
5. **JSON-LD por tipo:** `LocalBusiness` / `Service` / `FAQPage` / `BreadcrumbList` / `Organization` / `Person`.

```html
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"AutoDetailing",
 "name":"Detail Driven Niagara","image":"https://…/og.jpg",
 "address":{"@type":"PostalAddress","streetAddress":"…","addressLocality":"Niagara","addressRegion":"ON","postalCode":"…","addressCountry":"CA"},
 "telephone":"+1-…","priceRange":"$$$",
 "openingHoursSpecification":[{"@type":"OpeningHoursSpecification","dayOfWeek":["Monday","Tuesday"],"opens":"09:00","closes":"18:00"}],
 "aggregateRating":{"@type":"AggregateRating","ratingValue":"4.9","reviewCount":"127"}}
</script>
```
> `aggregateRating` **sólo si las reseñas existen y son verificables**. Inventarlo es una
> violación de las directrices de Google y puede costar la ficha entera.

6. **El texto animado sigue siendo texto.** Si usas SplitType, el contenido original debe permanecer en el DOM (no lo sustituyas por spans vacíos) y ser legible con JS desactivado si el render es SSR.

---

## 13. PRESUPUESTO DE RENDIMIENTO

> Zera prioriza *craft* sobre velocidad: JS redundante (jQuery + GSAP juntos), SPAs sin SSR,
> preloaders visibles, un `503`. Nosotros no negociamos estos números.

| Métrica | Objetivo | Límite duro |
|---|---|---|
| LCP (móvil 4G) | ≤ 1.8s | 2.5s |
| INP | ≤ 150ms | 200ms |
| CLS | ≤ 0.02 | 0.05 |
| JS inicial (gzip) | ≤ 140 KB | 180 KB |
| Peso total 1ª vista | ≤ 1.2 MB | 1.8 MB |
| Archivos de fuente críticos | 2 | 3 |
| Lighthouse Performance | ≥ 92 | 90 |
| Lighthouse Accesibilidad | **100** | 95 |

**Reglas de ejecución**
- Three.js (~550 KB) **siempre lazy** y sólo si el dispositivo lo aguanta; fallback estático.
- Preloader ≤1.2s, con salida forzada por timeout y omitido en visitas repetidas.
- Imágenes AVIF/WebP, `srcset`, `loading="lazy"` bajo el pliegue, **`fetchpriority="high"` en el LCP**.
- Vídeo de hero: ≤2 MB, `poster` siempre, `preload="metadata"`, y sustituido por imagen en `(max-width: 768px)` o `saveData`.
- Animar **sólo** `transform` y `opacity`. Nada de `top/left/width/height`.
- `Cache-Control: public, max-age=31536000, immutable` para assets con hash.
- Nunca jQuery si ya usas GSAP.

---

## 14. ACCESIBILIDAD (la nota 4/10 del original, corregida)

Lista de comprobación innegociable:

- [ ] Contraste ≥4.5:1 (texto) y ≥3:1 (grandes y UI). **Elimina `rgba(...,0.4)`.**
- [ ] `:focus-visible` visible en **todo** elemento interactivo (anillo 2px, offset 3px, color con contraste ≥3:1).
- [ ] Skip link "Ir al contenido" como primer elemento tabulable.
- [ ] Landmarks: `header`, `nav`, `main`, `footer`. Un solo `main`.
- [ ] El smooth-scroll **no** rompe la navegación por teclado ni `Ctrl/⌘+F`; nada de scroll-jacking que impida avanzar.
- [ ] `prefers-reduced-motion` implementado de verdad (§8.4) y verificado.
- [ ] `<canvas>`/WebGL decorativo: `aria-hidden="true"` + el mensaje del hero en texto real.
- [ ] Vídeo: `muted playsinline`, sin autoplay con sonido, control de pausa disponible.
- [ ] Objetivos táctiles ≥44×44px.
- [ ] Formularios: `<label>` real (no sólo placeholder), errores en texto + `aria-live`, `autocomplete`.
- [ ] Modal: focus trap, cierre con `Esc`, foco devuelto al disparador.
- [ ] El cursor custom nunca es el único indicador de interactividad.
- [ ] Navegación completa con teclado, de arriba a abajo, sin trampas.
- [ ] Jerarquía de encabezados sin saltos (h1→h2→h3).

**Objetivo: 100 en Lighthouse Accesibilidad.** Es alcanzable sin sacrificar ni un ápice del look.

---

## 15. CONVERSIÓN (CRO)

### 15.1 El embudo de Zera (y cómo mejorarlo)

```
Meta Ads → landing tripwire ($29)  ─┐
                                     ├→ deseo → aplicación → llamada → proyecto $5–20K
Orgánico/referido → demo o hub  ────┘
```
Dos velocidades: **volumen** (infoproducto) y **exclusividad** (servicios).

### 15.2 Fricción calibrada (regla nueva)

| Origen del tráfico | Formulario | Motivo |
|---|---|---|
| Frío (ads) | 1 paso, 3 campos, sin preloader | Cada paso extra cuesta ~10–20% de envíos |
| Tibio (orgánico/servicio) | 2 pasos | Equilibrio |
| Alto ticket / referido | Multi-step + "área de interés" | Filtra y sube el valor percibido |

### 15.3 Credibilidad dura (el gran fallo a corregir)

| Elemento | Zera hace | Nosotros hacemos |
|---|---|---|
| Testimonio | "James R.", "001 Founder" | Nombre completo, foto, empresa, resultado medible, fecha |
| Stat | `0+ vehicles detailed` | Cifra real o se elimina el bloque |
| Caso | Sólo estética | Situación → intervención → **número** |
| Analítica | `G-XXXXXXXXXX` en producción | ID real verificado antes de lanzar |
| Precio | Ausente | Rango o "desde X" — la ausencia total de precio filtra, pero también expulsa |

### 15.4 Plan de medición mínimo (idéntico en todos los sitios)

`view_hero` · `scroll_50` · `scroll_90` · `cta_click` (con `label`) · `form_start` ·
`form_step_{n}` · `form_submit` · `tel_click` · `whatsapp_click` · `video_play`

GTM + GA4 + Meta Pixel con IDs reales. Consentimiento de cookies donde aplique (RGPD/UE).

---

## 16. MOTOR DE VARIACIÓN — CÓMO HACER 300 SITIOS SIN 300 CLONES

> **El riesgo real de tu operación.** Este ADN es tan definido que, aplicado sin criterio,
> produce 300 páginas idénticas con distinto logo. Además, la estética "negro + serif de alto
> contraste + acento dorado/terracota" y "negro + acento neón" son hoy dos de los looks más
> reconocibles como *generados por IA*. Si todos tus sitios los usan, tu firma será "plantilla".

### 16.1 Los 8 ejes de variación

Cambia **al menos 4** entre un proyecto y el siguiente del mismo sector:

| # | Eje | Rango |
|---|---|---|
| 1 | Familia/paleta | A · B · C · D · E (+ inversión claro/oscuro) |
| 2 | Par tipográfico | serif alto contraste · grotesk · geométrica · condensada · display de carácter |
| 3 | Ritmo de escala | hero 214px agresivo ↔ hero 64px contenido con imagen dominante |
| 4 | Layout del hero | centrado · split · asimétrico · texto abajo · pantalla partida horizontal |
| 5 | Sistema estructural | numeración · sin numeración · etiquetas de categoría · fechas · índice lateral |
| 6 | Textura | limpio · grano · papel · metal · degradado suave · retícula visible |
| 7 | Densidad | editorial aireado ↔ revista densa a columnas |
| 8 | **Signature** | el elemento único memorable (ver 16.2) |

### 16.2 Catálogo de "signatures" (elige UNO por sitio)

Barrido de spotlight · cortina de transición con nombre de sección · comparador antes/después
editorial · diagrama que se ensambla · índice lateral que sigue el scroll · cursor que revela
otra capa · marquee vertical · retícula que respira · imagen que se recorta al hacer scroll ·
contador de inventario en vivo · mapa animado de cobertura · timeline horizontal arrastrable ·
tipografía que reacciona a la velocidad del scroll · foto que pasa de B/N a color por sección ·
menú radial · reproductor de audio ambiental (con control) · shader de agua/humo ·
lista de precios que se calcula sola · testimonios como notas manuscritas ·
"antes de nosotros / después de nosotros" a pantalla partida.

### 16.3 Regla del espejo

Antes de entregar, pon el sitio nuevo al lado de los **3 anteriores del mismo sector**.
Si un cliente pudiera confundirlos, no está terminado. Cambia el eje 8 primero, luego el 2 y el 4.

### 16.4 Fundamentar en el sujeto

La variación buena no sale de un generador aleatorio: sale del **mundo del cliente**.
Los materiales, herramientas, jerga y artefactos de su oficio son la fuente de las decisiones
distintivas (la textura de la laca en un detailing, el instrumental de una clínica, los planos
de una reforma). Antes de diseñar, escribe una línea: *"El sujeto es X, su público es Y, y el
trabajo único de esta página es Z."*

---

## 17. STACK Y ÁRBOL DE DECISIÓN

```
¿Necesita posicionar en Google (negocio local, servicios, contenido)?
├─ SÍ → Next.js (App Router) + Tailwind, SSG/ISR, multipágina (S22/S23)
│         Deploy: Netlify con @netlify/plugin-nextjs  ·  o output:'export' si es 100% estático
└─ NO (one-pager de campaña, portfolio, demo)
   → Vite + React + Tailwind → /dist estático → Netlify directo
```

**Núcleo de dependencias**
```jsonc
{
  "dependencies": {
    "react": "^18", "react-dom": "^18",
    "lenis": "^1.1",            // smooth scroll (antes @studio-freight/lenis)
    "gsap": "^3.12",            // ScrollTrigger, Flip y Observer vienen en el paquete gratuito
    "split-type": "^0.3",       // alternativa libre a SplitText (de pago)
    "three": "^0.160",          // SÓLO si hay 3D
    "@react-three/fiber": "^8", "@react-three/drei": "^9"
  },
  "devDependencies": {
    "vite": "^5", "@vitejs/plugin-react": "^4",
    "tailwindcss": "^3.4", "postcss": "^8", "autoprefixer": "^10"
  }
}
```

**`netlify.toml` base**
```toml
[build]
  command = "npm run build"
  publish = "dist"        # "out" con Next export · ".next" con el plugin

# [[plugins]]
#   package = "@netlify/plugin-nextjs"   # sólo si usas SSR/ISR

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[redirects]]           # fallback SPA (sólo Vite/React Router)
  from = "/*"
  to = "/index.html"
  status = 200
```

**Flujo:** repo en GitHub → Netlify conectado → auto-deploy en `main` → deploy preview en cada PR
→ dominio propio + HTTPS gratis.

---

## 18. ANTIPATRONES (lista negra)

**Heredados de los originales — no los repitas:**
1. IDs de verificación/analítica como placeholder en producción (`your-google-verification-code`, `G-XXXXXXXXXX`).
2. Doble `<meta viewport>` y metadatos duplicados.
3. jQuery conviviendo con GSAP (redundancia pura).
4. SPA sin SSR para un negocio que vive del SEO local.
5. Stats en `0+` y testimonios con iniciales.
6. Texto `rgba(255,255,255,0.4)` sobre negro.
7. Fuentes de pago (SangBleu) sin licencia.
8. Servidor Node (Heroku/Express) para un sitio esencialmente estático.
9. Preloader largo delante de tráfico pagado.
10. Dos H1 en la misma página.
11. Contenido real metido en `div` animados en lugar de headings.
12. Three.js cargado siempre, aunque no se vea.
13. Dependencia de un `503` — hosting sin monitorización.

**Añadidos por nosotros:**
14. Tres secciones con `pin` seguidas.
15. Numeración `01/02/03` sobre contenido que no es una secuencia.
16. Cursor custom como único indicador de interactividad.
17. Animar propiedades que provocan layout (`width`, `top`, `height`).
18. Smooth-scroll forzado en táctil (`syncTouch: true`).
19. Copiar la misma paleta y el mismo par tipográfico en dos clientes del mismo sector.
20. Entregar sin `brand.json` — el sitio nº 2 se vuelve imposible de mantener.

---

## 19. RÚBRICA DE CALIDAD (Definition of Done)

Baseline = puntuación auditada del ecosistema Zera. Objetivo = lo que entregas tú.

| Dimensión | Zera | **Objetivo** | Cómo se verifica |
|---|---|---|---|
| Experiencia de usuario | 7.5 | **8.5** | Test con 3 personas: ¿entienden el servicio en 5s? |
| Facilidad de navegación | 6 | **8.5** | Nav visible, anclas, breadcrumb en interiores |
| Claridad de propuesta | 6.5 | **9** | Qué es / para quién / qué hago ahora, sobre el pliegue |
| Velocidad de comprensión | 6 | **9** | LCP con texto real, no con loader |
| Fricción | 6 | **8** | Formulario adaptado al origen del tráfico (§15.2) |
| Confianza | 6.5 | **9** | Cero placeholders; testimonios verificables |
| **Accesibilidad** | **4** | **10** | Lighthouse 100 + checklist §14 completa |
| Rendimiento | ~5 | **9** | Presupuestos §13 cumplidos en móvil |
| SEO | ~5 | **9** | 1 H1, JSON-LD, sitemap, canonical, multipágina si local |
| Distinción visual | 9 | **9** | Regla del espejo §16.3 superada |

**No se entrega un sitio que no cumpla:** Lighthouse ≥90/100/90/90 · cero placeholders ·
checklist de accesibilidad completa · `brand.json` versionado · README de despliegue.

---

*Fin del genoma. La ejecución operativa está en `SISTEMA-DE-PRODUCCION.md`;
los prompts listos para pegar, en `BIBLIOTECA-DE-PROMPTS.md`.*
