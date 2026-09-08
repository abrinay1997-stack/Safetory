# Safetory Studio — Diseño del sitio web

**Fecha:** 2026-09-07
**Estado:** aprobado por el cliente, pendiente de plan de implementación
**Repositorio:** `abrinay1997-stack/Safetory`

---

## 1. Resumen

Sitio multipágina para **Safetory Studio**, estudio de grabación, producción musical y
ciclorama audiovisual en Vía España, Panamá.

Seis rutas estáticas, cada una construida alrededor de un objeto 3D real del estudio
modelado proceduralmente en Three.js. Arquitectura visual regida por la proporción áurea
(φ = 1,618) tanto en la escala tipográfica y de espaciado como en el recorrido de cámara.
Cada bloque ocupa el viewport completo: 34 pantallas en total.

El sitio **no depende de servicios de terceros**. Setmore queda fuera: los precios se
publican como tarifa y la llamada a la acción va a WhatsApp hasta que exista el motor de
agendado nativo (fase 2).

---

## 2. Contexto y restricciones

### 2.1 Origen del contenido

Todo el contenido textual y de precios procede de `https://safetorystudio.setmore.com/`,
extraído el 2026-09-07. Las imágenes proceden de `Imagenes/` en la raíz del repositorio,
aportadas por el cliente. **No se inventa ningún dato**: lo que no está en estas dos fuentes
no se renderiza (regla 1 de `CLAUDE.md`).

### 2.2 Restricciones heredadas de `CLAUDE.md`

| # | Restricción | Cómo se cumple aquí |
|---|---|---|
| 1 | No inventar contenido | §9 lista los huecos; esos bloques no se renderizan |
| 2 | Cero placeholders | Sin `href="#"`, sin `lorem`, IDs de analítica en `.env` |
| 3 | Accesibilidad 100 | §10 |
| 4 | LCP ≤1,8 s · INP ≤150 ms · CLS ≤0,02 · JS inicial ≤140 KB gz | §7 — Three.js fuera del arranque |
| 5 | Animar solo `transform` y `opacity` | §8 |
| 6 | Máximo 2 `pin` por página | §8.4 |
| 7 | Un solo `<h1>` por página | §5 tabla de rutas |
| 8 | Un solo acento cromático | §3.2 — `--rec` es el único; el resto es luz de escena |
| 9 | Un momento orquestado por sitio | §8.3 — el despiece del micrófono, solo en `/` |
| 10 | Un commit por bloque | Lo aplica el plan de implementación |

### 2.3 Aislamiento del repositorio

`C:\Users\MIPC` contiene un repositorio git que abarca la carpeta de usuario entera y apunta
al remoto `Acustica_Superior_DEMO`. Por eso cualquier sesión abierta dentro de SAFETORY veía
los archivos de Acústica Superior, Feria del Lente, Infinity Gun Club y demás: técnicamente
eran el mismo repositorio.

Resuelto inicializando un repositorio propio en `SAFETORY/` con remoto
`abrinay1997-stack/Safetory`. `FLASK/` queda en `.gitignore`: es un proyecto distinto, con su
propio remoto (`abrinay1997-stack/FLASK`), presente aquí solo como referencia de stack.

---

## 3. Marca

### 3.1 Identidad de partida

- **Wordmark:** `SAFETORY STUDIO®`, grotesco geométrico pesado, la `A` sin travesaño (Λ).
  Monocromo puro, sin color de marca definido.
- **Archivos:** `LOGO_SAFETORY.png` (blanco) y `LOGO_SAFETORY_BLACK.png` (negro), PNG con
  transparencia. Se convierten a SVG durante la implementación para que el rótulo 3D y el
  navegador usen la misma geometría.
- **Eslogan real:** *«Donde la innovación se encuentra con la perfección»*.

### 3.2 Tokens de color

El espacio físico de Safetory es rojo laca y madera ámbar, con lavado violeta en el
ciclorama. El acento de interfaz se deriva de ahí, pero **la interfaz usa un solo acento**;
los demás colores del espacio existen únicamente como temperatura de luz dentro de las
escenas 3D, nunca como token de UI.

```css
--void:     #080808;                    /* fondo                            */
--bone:     #EDEAE3;                    /* texto principal   16,7:1  ✓ AAA  */
--ash:      #8A8783;                    /* texto secundario   5,6:1  ✓ AA   */
--rec:      #FF2D2D;                    /* ACENTO ÚNICO       5,4:1  ✓ AA   */
--hairline: rgba(237, 234, 227, 0.12);  /* filetes de 1px                   */
```

Contrastes calculados sobre `--void` según WCAG 2.1. `--void` sobre `--rec` da igualmente
5,4:1, lo que permite texto negro sobre botón rojo.

**Uso del acento:** dosis mínima. Punto de grabación, estado activo de navegación, botón
principal, luz rasante de las escenas 3D. Nunca en superficies grandes ni en texto corrido.

### 3.3 Tipografía

| Rol | Familia | Origen | Uso |
|---|---|---|---|
| Display | **Clash Display** | Fontshare, gratuita | `h1`–`h3`, cifras de tarifa |
| Cuerpo | **Satoshi** | Fontshare, gratuita | Texto corrido, navegación, etiquetas |

Ambas auto-hospedadas en `public/fonts/` como `.woff2`, subconjunto latino, precargadas con
`<link rel="preload">` y servidas con `font-display: swap`.

Clash Display comparte las formas geométricas anchas y pesadas del wordmark: los titulares
leen como continuación del logo. Se descarta Archivo deliberadamente — es la familia de
FLASK, y los dos sitios no deben emparentarse.

### 3.4 Escala áurea

Una sola progresión geométrica de razón 1,618 sirve a la vez para tipografía y espaciado.
Base 16 px.

```
--phi-0:  10px      --phi-4:   68px
--phi-1:  16px      --phi-5:  110px
--phi-2:  26px      --phi-6:  178px
--phi-3:  42px      --phi-7:  288px
```

**División de retícula:** todo reparto de ancho es 61,8 % / 38,2 %. La columna mayor lleva
el contenido; la menor, el aire, la cifra o el objeto. Nunca se usa 50/50.

**Sección:** `min-height: 100dvh` en todos los bloques, sin excepción. `dvh` y no `vh` para
que la barra de direcciones móvil no provoque saltos.

---

## 4. Stack

```
Astro 5              multipágina estático, un HTML por ruta
three                escenas 3D, cargado por import() dinámico
gsap + ScrollTrigger líneas de tiempo amarradas al scroll
lenis                scroll con inercia
split-type           titulares animados por carácter
@astrojs/sitemap     sitemap.xml
```

Despliegue: GitHub → Netlify. Preview por PR, producción en `main`.

No se añade ninguna dependencia fuera de esta lista sin consultar (regla «Nunca» de
`CLAUDE.md`). En particular: **no se usa React ni React Three Fiber** — el 3D vive en
islas de Astro con JavaScript plano, y meter React costaría el presupuesto de arranque
entero.

---

## 5. Arquitectura de información

Seis rutas. Cada una: un `<h1>` único, un objeto 3D propio, y bloques a pantalla completa.

| Ruta | `<h1>` | Objeto 3D | Bloques |
|---|---|---|---|
| `/` | Safetory Studio | Micrófono de válvulas | 9 |
| `/estudio` | Studio 1 | Par de monitores de campo cercano | 6 |
| `/ciclorama` | Ciclorama | Foco circular + superficie curva | 5 |
| `/produccion` | Producción | Interfaz de audio | 9 |
| `/membresia` | Membresía | Plato y vinilo | 3 |
| `/contacto` | Contacto | Rótulo retroiluminado | 5 |

**Total: 37 pantallas completas.**

`/reservar` queda reservada y **no se crea** en esta fase: crear una ruta vacía sería un
placeholder, y la regla 2 lo prohíbe. Se creará con el motor de agendado nativo (§11).

### 5.1 `/` — Home

| # | Bloque | Contenido |
|---|---|---|
| 1 | Hero | `h1` + eslogan + micrófono 3D + CTA |
| 2 | Manifiesto | El eslogan a `--phi-5`, revelado por carácter |
| 3 | **Despiece** | El micrófono se separa en piezas etiquetadas — momento orquestado |
| 4 | Territorio: Estudio | Enlace a `/estudio` |
| 5 | Territorio: Ciclorama | Enlace a `/ciclorama` |
| 6 | Territorio: Producción | Enlace a `/produccion` |
| 7 | Territorio: Membresía | Enlace a `/membresia` |
| 8 | Equipo real | Inventario verificable (§9) |
| 9 | Dónde y cuándo + CTA | Dirección, horario, WhatsApp |

### 5.2 `/estudio` — Studio 1

| # | Bloque | Contenido |
|---|---|---|
| 1 | Hero | `h1` + monitores 3D en estéreo |
| 2 | La sala | Tratamiento acústico y monitorización de campo cercano |
| 3 | Tarifa por hora | 1 hora — **$50** |
| 4 | Tarifa por bloque | 3 horas o más — **$35/hora**, aplicado a todas las horas consumidas |
| 5 | Bloques de miembro | 3 h · 5 h · 8 h, incluidos en la membresía |
| 6 | CTA | WhatsApp |

### 5.3 `/ciclorama` — Ciclorama

| # | Bloque | Contenido |
|---|---|---|
| 1 | Hero | `h1` + foco y curva 3D |
| 2 | Fotografía | 1 hora — **$25**. Hora adicional **$20** |
| 3 | Vídeo | 2 h **$50** · 4 h **$90** · 8 h **$280**. Hora adicional **$25** |
| 4 | Bloques de miembro | 3 h · 5 h, ciclorama y co-working |
| 5 | CTA | WhatsApp |

### 5.4 `/produccion` — Producción

| # | Bloque | Servicio | Precio | Condición literal |
|---|---|---|---|---|
| 1 | Hero | — | — | `h1` + interfaz de audio 3D |
| 2 | Mixing | Servicio de Mixing | **$60** | Stems ilimitados |
| 3 | Mastering | Servicio de Mastering | **$50** | Máximo 8 stems |
| 4 | Mixing y Mastering | Servicio de Mixing y Mastering | **$105** | Stems de mixing ilimitados, máximo 8 de mastering |
| 5 | Grabación | Servicio de grabación · 3 h | **$45** | No incluido en la hora de alquiler del estudio |
| 6 | Sobre instrumental | Grabación en instrumental traído por el cliente · 2 h | **$80** | Ingeniero incluido. Pre-mezcla de voces con el instrumental. No incluye mixing ni mastering |
| 7 | Producción Personalizada | Producción Personalizada | **$300** | Instrumental desde cero · horas de estudio ilimitadas hasta terminar · grabación de voces · edición de voces · mixing · master · asesoría creativa |
| 8 | Comparativa | Tabla de los siete servicios | — | Misma información, formato escaneable |
| 9 | CTA | — | — | WhatsApp |

### 5.5 `/membresia` — Membresía

| # | Bloque | Contenido |
|---|---|---|
| 1 | Hero | `h1` + plato y vinilo 3D |
| 2 | Qué incluye | Studio 1: bloques de 3 h, 5 h y 8 h. Ciclorama y co-working: bloques de 3 h y 5 h. Todos sin coste para el miembro |
| 3 | CTA | «Consultar membresía» → WhatsApp |

El precio y las condiciones de la membresía no constan en ninguna fuente. Ver §9.

### 5.6 `/contacto` — Contacto

| # | Bloque | Contenido |
|---|---|---|
| 1 | Hero | `h1` + rótulo retroiluminado 3D encendiéndose |
| 2 | Dirección | Edificio Brasilia, Vía España, Panamá, Provincia de Panamá |
| 3 | Canales | Tel. 6799-8881 · info@safetoryglobal.com · Instagram @safetorystudio |
| 4 | Horario | Lunes a viernes 24 horas · Sábado 9:00–12:30 · Domingo cerrado |
| 5 | Mapa + CTA | Mapa estático enlazado a Google Maps, WhatsApp |

El mapa es una **imagen estática enlazada**, no un iframe embebido: un iframe de Google Maps
cuesta entre 400 KB y 900 KB y rompe el presupuesto de §7.

---

## 6. Sistema 3D — *El Inventario*

### 6.1 Principio

Seis objetos reales de Safetory, uno por ruta, todos presentes en las fotografías del
cliente. Ninguno inventado. Todos construidos con el mismo lenguaje de materiales y de luz,
de modo que el sitio se lee como un solo cuerpo aunque el objeto cambie en cada página.

| Ruta | Objeto | Presente en |
|---|---|---|
| `/` | Micrófono de válvulas con jaula y anillo rojo | `9388552a…webp` |
| `/estudio` | Par de monitores de campo cercano | `4da64443…webp`, `e26fb203…webp` |
| `/ciclorama` | Foco circular + superficie curva infinita | `06e9611d…webp` |
| `/produccion` | Interfaz de audio de sobremesa con knob grande | `5e98bfb4…webp` |
| `/membresia` | Plato y vinilo del lounge | `4d04e558…webp` |
| `/contacto` | Rótulo retroiluminado del wordmark | `4da64443…webp`, `9388552a…webp` |

### 6.2 Construcción: procedural

Cada objeto se levanta con primitivas de Three.js. **Cero assets de geometría descargados.**
El acabado es una interpretación estilizada, no una réplica fotorrealista.

Ejemplo, el micrófono de `/`:

```
CylinderGeometry   cuerpo
CylinderGeometry   rejilla (material con alphaMap de malla)
BoxGeometry ×6     jaula, dispuestas en anillo
TorusGeometry      anillo de acento
CylinderGeometry   base
TorusGeometry ×2   aros del shockmount
```

Los cinco objetos restantes siguen el mismo criterio: entre 5 y 12 primitivas cada uno.
Las repeticiones (barras de la jaula, aros) usan `InstancedMesh`.

### 6.3 Materiales y luz

```
Superficie   MeshStandardMaterial
             color    #0E0E0E
             metalness 0.85
             roughness 0.42

Luces        1× DirectionalLight  blanco, intensidad baja, cenital
             1× SpotLight         --rec #FF2D2D, rasante, dibuja los cantos
             1× AmbientLight      muy tenue, evita el negro absoluto
```

El objeto emerge de la oscuridad. Sin entorno HDRI: encarece la descarga y aquí no aporta,
porque no hay superficies pulidas que reflejen.

**Temperatura por ruta.** La `SpotLight` de acento mantiene `--rec` en las seis rutas. Lo que
cambia es la `DirectionalLight`, que adopta la luz real de cada espacio: ámbar cálido en `/`
y `/estudio`, violeta frío en `/ciclorama`, ámbar apagado en `/produccion` y `/membresia`,
blanco neutro en `/contacto`. Esto es iluminación de escena, no un token de interfaz: la
regla del acento único se mantiene intacta.

### 6.4 Las fotografías como profundidad

Las seis imágenes de `Imagenes/` **no aparecen como fotografías navegables**. Se usan como
textura sobre planos situados a distinta profundidad Z detrás del objeto, con desenfoque y
opacidad baja, de forma que el paralaje al mover la cámara sea geométrico y real, no simulado
con CSS.

```
z = -12   plano de fondo   opacidad 0.18   desenfoque fuerte
z =  -6   plano medio      opacidad 0.10   desenfoque medio
z =   0   OBJETO 3D
```

Cada plano recibe la foto que corresponde a su espacio. Las texturas se cargan a 1280 px de
ancho como máximo, en WebP, con `KTX2` descartado por no compensar a este tamaño.

### 6.5 Cámara: la espiral áurea

Al hacer scroll, la cámara recorre una espiral logarítmica de razón φ alrededor del objeto,
parametrizada por el progreso de scroll de la página:

```
r(t) = r₀ · φ^(−t)          t ∈ [0, 1], progreso de scroll
θ(t) = t · 2π · 1.618
x = r(t) · cos θ(t)
z = r(t) · sin θ(t)
y = y₀ + t · Δy
```

La cámara se acerca al objeto mientras gira, cerrando la espiral. La proporción áurea rige el
movimiento sin que la espiral se dibuje nunca en pantalla.

---

## 7. Rendimiento

### 7.1 El problema

El núcleo de Three.js pesa unos 150 KB comprimido. El presupuesto de JavaScript inicial es de
140 KB. **Three.js no puede formar parte del arranque.**

### 7.2 La solución: póster primero, WebGL después

1. El servidor entrega HTML con un `<img>` WebP: un frame prerenderizado del objeto, ~30 KB.
   **Ese `<img>` es el elemento LCP.**
2. El HTML crítico, el CSS, Lenis y el núcleo de GSAP suman ~48 KB gz. La página es legible y
   navegable aquí.
3. Tras `requestIdleCallback`, y solo si la isla está en viewport, un `import()` dinámico trae
   Three.js y monta la escena en un `<canvas>` con `opacity: 0`.
4. Al primer frame renderizado, el canvas hace *cross-fade* sobre el póster (600 ms).

```
Arranque    HTML + CSS + Lenis + GSAP        ~48 KB gz    ✓
LCP         póster WebP                      ~30 KB       < 1,8 s
Diferido    three + escena                   ~150 KB gz   fuera de LCP
```

El póster ocupa exactamente la caja del canvas, así que el intercambio no mueve un solo píxel:
CLS = 0.

### 7.3 Degradación

El póster se queda, y la página funciona igual, cuando:

- No hay contexto WebGL disponible.
- `prefers-reduced-motion: reduce` está activo.
- `navigator.connection.saveData` es verdadero.
- El dispositivo declara `deviceMemory < 4`.

### 7.4 Presupuesto de escena

| Métrica | Límite |
|---|---|
| Draw calls por escena | ≤ 30 |
| Triángulos por escena | ≤ 60 000 |
| Texturas por escena | ≤ 3, máximo 1280 px de ancho |
| `devicePixelRatio` | limitado a 2 |
| Render fuera de viewport | detenido por `IntersectionObserver` |
| Render en pestaña oculta | detenido por `visibilitychange` |

Una sola instancia de `WebGLRenderer` por página, destruida en `astro:before-swap` para que
las View Transitions no filtren contextos.

---

## 8. Movimiento

### 8.1 Base

Lenis para el scroll con inercia, con `lerp` bajo para dar peso cinematográfico. Se desactiva
`scroll-behavior: smooth` nativo cuando Lenis toma el control. GSAP ScrollTrigger se sincroniza
con el bucle de Lenis mediante `lenis.on('scroll', ScrollTrigger.update)`.

**Solo se animan `transform` y `opacity`.** Nunca `width`, `height`, `top` ni `left`.

### 8.2 Repertorio sobrio

| Efecto | Dónde |
|---|---|
| Titular revelado por carácter (`split-type`) | Un `h1` o `h2` por bloque, no más |
| Entrada por `translateY(24px)` + `opacity` | Párrafos y tarjetas, escalonadas 60 ms |
| Filete de 1px que se dibuja (`scaleX`) | Separadores entre bloques |
| Cifra de tarifa que cuenta hasta su valor | Solo en los bloques de precio |

### 8.3 El momento orquestado (uno en todo el sitio)

En `/`, bloque 3. Al entrar en viewport, las piezas del micrófono se separan en el aire y cada
una recibe una etiqueta que nombra un territorio del negocio:

```
rejilla      →  Grabación
anillo       →  Producción
jaula        →  Ciclorama
base         →  Membresía
```

Al seguir bajando, se recompone.

Implementación: **una sola línea de tiempo de GSAP** amarrada a ScrollTrigger con `scrub`.
Cada pieza interpola su `position` desde la posición de montaje hasta la de despiece. Al ser
`scrub`, subir el scroll recompone el objeto sin código adicional.

Las etiquetas son **HTML real posicionado sobre el canvas**, no texto dentro de WebGL: son
seleccionables, las lee un lector de pantalla y Google las indexa. Ninguna palabra del sitio
existe solo dentro del 3D.

### 8.4 Pins

Máximo dos `pin` por página, según la regla 6. En `/` los dos están asignados: el despiece
(bloque 3) y la transición de territorios (bloques 4–7). Por debajo de 768 px de ancho ambos
se desactivan y los bloques se recorren en scroll normal.

### 8.5 Entre páginas

View Transitions de Astro. El objeto de la página actual se aleja en Z y se desvanece; el de
la nueva llega desde el fondo. Duración 700 ms. Desactivado bajo `prefers-reduced-motion`,
donde la transición es un corte limpio.

---

## 9. Contenido

### 9.1 Fuente de verdad

`src/data/*.ts`, tipado con TypeScript. Los precios, duraciones y condiciones se escriben una
sola vez y se consumen desde ahí. Ningún precio se escribe a mano dentro de una plantilla.

```
src/data/site.ts        nombre, eslogan, dirección, teléfono, correo, redes, horario
src/data/estudio.ts     tarifas de Studio 1
src/data/ciclorama.ts   tarifas de fotografía y vídeo
src/data/produccion.ts  los siete servicios de producción
src/data/membresia.ts   bloques incluidos
src/data/equipo.ts      inventario técnico verificable
```

### 9.2 Datos de contacto

```
Nombre       Safetory Studio
Eslogan      Donde la innovación se encuentra con la perfección
Dirección    Edificio Brasilia, Vía España, Panamá, Provincia de Panamá
Teléfono     6799-8881
WhatsApp     https://wa.me/50767998881
Correo       info@safetoryglobal.com
Instagram    https://instagram.com/safetorystudio
Horario      Lunes a viernes: 24 horas
             Sábado: 9:00–12:30
             Domingo: cerrado
```

### 9.3 Llamada a la acción

Todo botón «Reservar» abre WhatsApp en pestaña nueva con el mensaje prellenado del servicio
correspondiente:

```
https://wa.me/50767998881?text=Hola%2C%20quiero%20reservar%20Studio%201%20·%203%20horas
```

El texto se genera desde `src/data/*.ts`, de modo que cambiar un servicio cambia el mensaje.
El día que exista el agendado nativo basta con cambiar el generador de `href`.

### 9.4 Inventario técnico verificable

Solo se publica el equipo identificable en las fotografías del cliente:

```
Micrófono de condensador de válvulas con shockmount y antipop
Par de monitores de campo cercano
2× interfaz de audio de sobremesa
Tratamiento acústico: paneles absorbentes y difusores de listón vertical
Ciclorama de curva infinita con iluminación LED
```

Los modelos y marcas exactos **no se publican** hasta que el cliente los confirme por escrito:
identificar mal un equipo en una web de estudio destruye credibilidad ante un profesional.

### 9.5 Huecos de contenido

Estos datos no constan en ninguna fuente disponible. Los bloques afectados **no se renderizan**
hasta recibirlos.

| Falta | Impacto | Comportamiento provisional |
|---|---|---|
| Precio y condiciones de la membresía | `/membresia` bloque 2 queda descriptivo, sin cifra | CTA «Consultar membresía» → WhatsApp |
| Marcas y modelos exactos del equipo | Bloque «Equipo real» en `/` y `/estudio` | Se publica la lista genérica de §9.4 |
| Texto de marca / historia del estudio | Manifiesto de `/` | Se usa únicamente el eslogan real |
| Qué incluye el co-working | Mencionado en el rótulo y en los bloques de miembro | No se menciona en el sitio |
| Proyectos o clientes con permiso de publicación | No hay ruta `/trabajos` | Ruta no creada |

---

## 10. Accesibilidad

Objetivo: **100 en Lighthouse**, sin excepciones.

- Todo elemento interactivo tiene `:focus-visible` con contorno de 2 px en `--rec` y
  desplazamiento de 3 px.
- Contraste mínimo 4,5:1 verificado en §3.2 para las tres combinaciones en uso.
- `prefers-reduced-motion: reduce` desactiva Lenis, ScrollTrigger, las View Transitions y el
  render 3D; el sitio se queda en los pósters estáticos y sigue completo.
- Los `<canvas>` llevan `aria-hidden="true"`. Todo su significado existe también en HTML.
- El texto animado con `split-type` sigue existiendo en el DOM como texto continuo; se envuelve
  el original en un `<span class="sr-only">` cuando el troceado por caracteres pueda confundir
  a un lector de pantalla.
- Navegación completa por teclado, con enlace «Saltar al contenido» como primer foco.
- Jerarquía semántica real: un `<h1>` por ruta, `<h2>` por bloque, sin saltos de nivel.
- Los precios se marcan con `<data value="50">$50</data>` para que su valor sea legible por
  máquina sin depender del formato.

---

## 11. SEO

Cada ruta ataca una intención de búsqueda distinta — es la razón principal de que el sitio sea
multipágina y no un one-pager.

| Ruta | Intención objetivo |
|---|---|
| `/` | estudio de grabación Panamá |
| `/estudio` | alquiler estudio de grabación Panamá |
| `/ciclorama` | alquiler ciclorama Panamá, estudio fotografía Panamá |
| `/produccion` | mixing y mastering Panamá, producción musical Panamá |
| `/membresia` | membresía estudio de grabación Panamá |
| `/contacto` | safetory studio dirección |

- `title` y `meta description` únicos por ruta, escritos a mano, sin plantilla automática.
- Open Graph y Twitter Card completos, con imagen generada a partir del póster 3D de cada ruta.
- `sitemap.xml` vía `@astrojs/sitemap`, `robots.txt` explícito.
- Datos estructurados `LocalBusiness` con dirección, teléfono y `openingHoursSpecification`
  reales. **Sin `aggregateRating`**: no hay reseñas verificables, y publicarlo sin evidencia
  está prohibido por `CLAUDE.md`.
- IDs de analítica en variables de entorno. Si la variable no existe, el script no se emite.

---

## 12. Estructura de archivos

```
SAFETORY/
├── CLAUDE.md
├── astro.config.mjs
├── netlify.toml
├── .gitignore                      FLASK/ y pixaai.zip excluidos
├── docs/
│   ├── ZERA-DNA-MASTER.md
│   ├── SISTEMA-DE-PRODUCCION.md
│   ├── BIBLIOTECA-DE-PROMPTS.md
│   ├── DECISION.md                 resumen de este spec para consulta rápida
│   └── superpowers/specs/
│       └── 2026-09-07-safetory-sitio-3d-design.md
├── public/
│   ├── fonts/                      Clash Display + Satoshi, .woff2
│   └── posters/                    6 pósters WebP, uno por ruta
├── Imagenes/                       fuente original, no se sirve
└── src/
    ├── data/                       §9.1 — única fuente de verdad del texto
    ├── layouts/BaseLayout.astro
    ├── components/
    │   ├── Nav.astro
    │   ├── Footer.astro
    │   ├── SmoothScroll.astro
    │   ├── Reveal.astro
    │   ├── PrecioCard.astro
    │   └── Escena3D.astro          isla: póster + canvas + carga diferida
    ├── three/
    │   ├── motor.ts                renderer, bucle, limpieza, degradación
    │   ├── camara-phi.ts           espiral áurea
    │   ├── materiales.ts           metal oscuro + luces
    │   ├── planos-profundidad.ts   §6.4
    │   └── objetos/
    │       ├── microfono.ts
    │       ├── monitores.ts
    │       ├── ciclorama.ts
    │       ├── interfaz.ts
    │       ├── plato.ts
    │       └── rotulo.ts
    ├── scripts/motion.ts           GSAP + Lenis + repertorio de §8.2
    ├── styles/global.css           tokens de §3
    └── pages/
        ├── index.astro
        ├── estudio.astro
        ├── ciclorama.astro
        ├── produccion.astro
        ├── membresia.astro
        ├── contacto.astro
        └── 404.astro
```

Cada objeto 3D vive en su propio archivo y expone la misma interfaz
(`crear(): THREE.Group`), de modo que `motor.ts` no sabe qué está renderizando y cada objeto
puede entenderse y ajustarse por separado.

---

## 13. Fuera de alcance

Explícitamente **no** forma parte de esta fase:

- **Motor de agendado nativo.** Es la fase 2 y necesita su propio spec: calendario,
  disponibilidad, bloques de miembro, pagos y notificaciones. La ruta `/reservar` se creará
  entonces.
- **Área de miembros con autenticación.**
- **Ruta `/trabajos`** y cualquier portfolio: no hay proyectos con permiso de publicación.
- **Ruta `/nosotros`**: no hay texto de marca ni fotos de equipo.
- **Versión en inglés.** El sitio se entrega solo en español.
- **Blog o contenido editorial.**

---

## 14. Definición de terminado

El sitio no se considera entregado hasta pasar, en este orden, las cuatro pasadas de
`docs/SISTEMA-DE-PRODUCCION.md` §7:

| Pasada | Criterio |
|---|---|
| **SEO** | `title`/`description` únicos por ruta · OG completo · sitemap · `LocalBusiness` sin `aggregateRating` |
| **Accesibilidad** | Lighthouse 100 · teclado completo · `prefers-reduced-motion` real · contraste verificado |
| **Rendimiento** | LCP ≤1,8 s · INP ≤150 ms · CLS ≤0,02 · JS inicial ≤140 KB gz · presupuesto de escena de §7.4 |
| **Copy** | Cero placeholders · cero datos inventados · todo precio trazable a `src/data/` |
