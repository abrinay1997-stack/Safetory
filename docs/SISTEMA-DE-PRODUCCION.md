# SISTEMA-DE-PRODUCCION.md
## De 1 sitio a 300 — pipeline operativo con Claude Code

> El ADN (`ZERA-DNA-MASTER.md`) dice **cómo debe verse y funcionar**.
> Este documento dice **cómo se fabrica, en qué orden, quién hace qué y cuándo se entrega**.

---

## 1. EL MODELO DE FÁBRICA

No construyes 300 sitios. Construyes **un kit** y lo instancias 300 veces.

```
zera-kit/                        ← repo plantilla (el activo real)
├── src/
│   ├── styles/
│   │   ├── tokens.css           ← núcleo invariable (§5 del ADN)
│   │   └── themes/              ← a.css · b.css · c.css · d.css · e.css
│   ├── lib/
│   │   ├── smooth.js            ← Lenis + GSAP ticker + reduced-motion
│   │   ├── reveal.js            ← SplitType + reveals
│   │   ├── pin.js               ← proceso con pinning
│   │   ├── parallax.js
│   │   ├── counter.js
│   │   └── cursor.js
│   ├── blocks/                  ← S00…S23, uno por archivo, con props
│   │   ├── S00Preloader.jsx
│   │   ├── S02aHeroType.jsx
│   │   └── …
│   ├── seo/
│   │   ├── Meta.jsx
│   │   └── schema.js            ← generadores JSON-LD
│   └── App.jsx                  ← compone bloques leyendo brand.json
├── public/fonts/                ← .woff2 subseteados
├── brand.json                   ← ÚNICO archivo que cambia por cliente
├── netlify.toml
├── CLAUDE.md
└── docs/  (ZERA-DNA-MASTER.md · este archivo · BIBLIOTECA-DE-PROMPTS.md)
```

**Regla de oro:** si algo se repite en 3 proyectos, sube al kit. Si algo es de un cliente,
vive en `brand.json` o en `src/content/`. Nada intermedio.

### Convención de repos

```
kit:      zera-kit                       (plantilla, versionada: v1.3.0)
cliente:  web-<cliente>-<vertical>        ej. web-dcasa-muebles
ramas:    main (producción) · dev · feat/<bloque>
deploy:   Netlify → preview en cada PR, producción en merge a main
```

---

## 2. PIPELINE DE 8 FASES

| Fase | Nombre | Salida | Tiempo (fam. A–E) | Quién |
|---|---|---|---|---|
| 0 | Intake | `brief.md` completo | 30–45 min | Tú + cliente |
| 1 | Decisión de ADN | `brand.json` + lista de bloques + signature | 20 min | Tú (+ Claude como sparring) |
| 2 | Contenido | `content.json` con copy y assets reales | 2–4 h | Tú / cliente / Claude |
| 3 | Scaffold | Repo desde el kit, tema aplicado, deploy vacío en Netlify | 15 min | Claude Code |
| 4 | Construcción | Bloques ensamblados, animaciones, responsive | 3–8 h | Claude Code |
| 5 | Pasadas de calidad | SEO · A11y · Performance · Copy (4 pasadas separadas) | 1–2 h | Claude Code |
| 6 | Revisión humana | Regla del espejo + revisión de cliente | 1 h | Tú |
| 7 | Lanzamiento | Dominio, DNS, analítica real, sitemap, Search Console | 45 min | Tú |
| 8 | Post-lanzamiento | Monitorización, informe a 30 días | recurrente | Tú |

> **Estimación realista con el kit maduro:** 1–2 días de trabajo efectivo por sitio.
> Los tres primeros costarán el triple: estás construyendo el kit, no el sitio.

---

## 3. FASE 0 — BRIEF DE INTAKE (plantilla)

Copia esto tal cual para cada cliente. **Sin esto no se abre el repo.**

```markdown
# BRIEF — <cliente>

## Negocio
- Nombre legal y comercial:
- Qué vende exactamente (1 frase):
- Ticket medio / rango de precios:
- ¿Vende online, presencial o por cita?
- Zona de servicio (ciudad/es):
- Competidores directos (3 URLs):

## Público
- Cliente ideal (edad, situación, qué le duele):
- ¿Qué busca en Google literalmente?
- Objeción principal antes de comprar:

## Objetivo del sitio (elige UNO principal)
[ ] Llamadas/WhatsApp  [ ] Formulario de presupuesto  [ ] Reservas
[ ] Venta directa      [ ] Credibilidad/portfolio     [ ] Captación de leads

## Contenido disponible (esto decide el diseño)
- Fotos propias: sí/no · cuántas · calidad
- Vídeo: sí/no
- Testimonios con nombre real y permiso: cuántos
- Cifras verificables (años, proyectos, clientes, reseñas):
- Certificaciones/licencias:
- Precios publicables: sí/no

## Marca
- Logo (vectorial sí/no):
- Colores existentes:
- Referencias que le gustan (3 URLs) y por qué:
- Referencias que odia:

## Técnico
- Dominio (¿ya lo tiene? ¿dónde?):
- Email de contacto y teléfono:
- Cuentas de Google Analytics / Search Console / Meta:
- Idiomas:
- Integraciones (reservas, pagos, CRM, WhatsApp):

## Restricciones
- Fecha objetivo:
- Presupuesto:
- Sector regulado (salud, legal, financiero): sí/no → revisar reclamos publicitarios
```

**Semáforo de contenido — se decide aquí, no después:**

| Contenido real disponible | Consecuencia de diseño |
|---|---|
| Fotos propias buenas + testimonios + cifras | Familia libre. Puedes usar S07, S09, S11, S10 |
| Sólo fotos regulares | Familias A o B (el negro perdona), tipografía dominante, **sin S09 grande** |
| Nada más que texto | Familia B o C. El sitio se construye con tipografía y espacio. Prohibido stock genérico |

---

## 4. FASE 1 — DECISIÓN DE ADN (checklist de 6 respuestas)

1. **Familia** (A–E, §4 del ADN) → justifícala en una línea.
2. **Paleta** → tokens en `brand.json`.
3. **Par tipográfico** → distinto al de tu último sitio del mismo sector.
4. **Bloques** → lista ordenada de S-IDs.
5. **Signature** → uno del catálogo §16.2, o inventado desde el mundo del cliente.
6. **Arquitectura** → one-pager vs multipágina (§12.2: negocio local ⇒ multipágina).

Escribe la decisión en `docs/DECISION.md` del repo. Es lo que leerá Claude Code cada vez
que abras el proyecto meses después.

---

## 5. FASE 2 — CONTENIDO ANTES QUE CÓDIGO

**Nunca construyas con lorem ipsum.** El copy define el ritmo tipográfico; si lo cambias
después, se rompe la composición.

`content.json` mínimo:
```jsonc
{
  "meta": { "title": "", "description": "", "ogImage": "" },
  "hero": { "kicker": "", "h1": "", "sub": "", "cta": { "label": "", "href": "" } },
  "services": [{ "n": "01", "title": "", "text": "", "image": "" }],
  "process": [{ "stage": "01", "title": "", "text": "" }],
  "stats": [{ "value": 127, "suffix": "+", "label": "", "source": "verificado 2026-07" }],
  "testimonials": [{ "name": "", "role": "", "photo": "", "quote": "", "result": "", "date": "" }],
  "faq": [{ "q": "", "a": "" }],
  "nap": { "address": "", "phone": "", "hours": [], "maps": "" },
  "legal": { "company": "", "vat": "", "privacyUrl": "" }
}
```
**Regla:** un campo sin dato real se **elimina del JSON**, y su bloque no se renderiza.
Nunca se rellena con un placeholder.

---

## 6. FASES 3–4 — CONSTRUCCIÓN CON CLAUDE CODE

**Orden de construcción que evita retrabajo:**

1. Tokens y tema (nada de componentes todavía).
2. Layout base: contenedor, gutters, tipografía, nav y footer.
3. Hero. *Se aprueba antes de seguir* — marca el tono de todo.
4. Bloques en orden narrativo, uno por commit.
5. Smooth scroll y reveals **al final**, cuando el layout es estable.
   *(Animar antes de tener el layout definitivo es la principal causa de retrabajo.)*
6. Responsive: escritorio → tablet → móvil, con revisión de cada `pin`.
7. Estados: hover, focus, disabled, vacío, error, cargando.

**Ritmo de commits:** uno por bloque, mensaje `feat(S05): servicios numerados con hover-reveal`.
Así puedes revertir un bloque sin tocar el resto.

---

## 7. FASE 5 — LAS CUATRO PASADAS DE CALIDAD

Se hacen **por separado y en este orden**. Mezclarlas produce revisiones superficiales.

### Pasada 1 — SEO
- [ ] Un `<h1>`, jerarquía sin saltos
- [ ] `title` ≤60 · `description` ≤155 · `canonical`
- [ ] OG 1200×630 + Twitter card
- [ ] JSON-LD válido (probado en el validador de Google)
- [ ] `sitemap.xml` + `robots.txt`
- [ ] URLs limpias, sin duplicados
- [ ] Texto animado presente en el HTML servido

### Pasada 2 — Accesibilidad
- [ ] Checklist §14 del ADN, completa
- [ ] Recorrido sólo con teclado, de principio a fin
- [ ] Prueba con `prefers-reduced-motion` activado
- [ ] Lighthouse Accesibilidad = 100

### Pasada 3 — Rendimiento
- [ ] Presupuestos §13 en móvil con 4G simulado
- [ ] Fuentes: máx 2–3, precargadas, subseteadas
- [ ] Imágenes AVIF/WebP + `srcset` + `fetchpriority` en el LCP
- [ ] 3D/vídeo lazy con fallback
- [ ] Sin librerías duplicadas (`npx depcheck`)

### Pasada 4 — Copy y credibilidad
- [ ] Cero placeholders (`lorem`, `your-`, `G-XXXX`, `0+`, `#`)
- [ ] Cada cifra tiene fuente y fecha
- [ ] Cada testimonio tiene nombre real y permiso
- [ ] Verbos de CTA consistentes de principio a fin
- [ ] Ortografía y coherencia de idioma (incluidos `alt` y `aria-label`)
- [ ] Sector regulado: ningún reclamo de resultado garantizado

---

## 8. FASE 6 — REVISIÓN HUMANA

1. **Regla del espejo** (§16.3): al lado de tus 3 últimos del mismo sector. ¿Se distinguen?
2. **Prueba de los 5 segundos:** enséñaselo a alguien ajeno. ¿Sabe qué se vende y qué hacer?
3. **Prueba del móvil real** (no el simulador): un dispositivo de gama media, con datos móviles.
4. **Prueba del pulgar:** ¿los CTAs quedan en la zona alcanzable?
5. Entrega al cliente con **una ronda de cambios acotada** y por escrito.

---

## 9. FASE 7 — LANZAMIENTO

```
[ ] Dominio apuntado (Netlify DNS o registros A/CNAME) + HTTPS activo
[ ] www → apex (o al revés) con redirección 301, elige uno
[ ] GA4 con ID real + Meta Pixel con ID real
[ ] Google Search Console: propiedad verificada + sitemap enviado
[ ] Google Business Profile enlazado (negocio local)
[ ] Formulario probado de extremo a extremo (llega el email, hay confirmación visible)
[ ] Teléfono y WhatsApp clicables probados desde móvil
[ ] Página 404 con salida
[ ] Aviso legal, privacidad y cookies (obligatorio si hay analítica en UE)
[ ] Monitorización de caídas (UptimeRobot o similar) — recuerda el 503 de Zera
[ ] Copia de seguridad: repo + assets originales del cliente archivados
```

---

## 10. FASE 8 — POST-LANZAMIENTO

- **Día 7:** revisar Search Console (indexación, errores) y primeros eventos en GA4.
- **Día 30:** informe corto — sesiones, origen, eventos de conversión, páginas que fallan.
- **Trimestral:** Lighthouse de control, actualización de dependencias, contenido nuevo (S21/S22/S23).
- **Oferta de retainer:** mantenimiento + contenido SEO mensual. Es lo que convierte un
  proyecto puntual en ingreso recurrente, y es exactamente el hueco que el modelo de Zera
  no cubre.

---

## 11. ESCALAR: DE 1 KIT A UN CATÁLOGO

### 11.1 Versionado del kit
```
v1.0.0  primer kit funcional (bloques S00–S20)
v1.1.0  + S22/S23 (SEO local) 
v1.2.0  + módulo 3D lazy
v2.0.0  cambio de tokens (BREAKING: requiere migrar temas)
```
Cada sitio anota en su README la versión del kit con la que nació. **No migres sitios
antiguos salvo que cobres por ello.**

### 11.2 Catálogo comercial (lo que enseñas al vender)
Cinco demos vivas, una por familia, con dominio propio y datos ficticios pero **coherentes**
(nunca `0+`). Ese es tu "muro de credibilidad", igual que las demos de Zera — pero honesto:
etiquétalas como *concepto de demostración*.

### 11.3 Productización de la oferta

| Paquete | Contenido | Familia típica |
|---|---|---|
| **Landing** | One-pager, 6–8 bloques, 1 idioma | A · D |
| **Negocio local** | Home + 3–5 servicios + localidad + NAP + schema | E · C |
| **Marca premium** | Multipágina, signature a medida, transiciones, copy incluido | B · A |
| **Retainer** | Mantenimiento + contenido + informes | cualquiera |

### 11.4 Qué hace Claude Code y qué haces tú

| Claude Code | Tú |
|---|---|
| Scaffold, bloques, animaciones, responsive | Elegir familia, paleta y signature |
| Pasadas de SEO/A11y/Performance | Conseguir contenido real del cliente |
| JSON-LD, meta, sitemap | Regla del espejo y criterio estético |
| Refactors, migraciones, auditorías | Relación con el cliente y precio |
| Documentación y README | Decidir qué NO se construye |

---

## 12. MÉTRICAS DE LA FÁBRICA

Lleva un registro (una hoja basta) con: cliente · familia · signature · kit version ·
horas reales · Lighthouse final · fecha de lanzamiento · conversiones a 30 días.

Tres cosas se ven ahí y en ningún otro sitio:
1. Qué familia te sale más rentable por hora.
2. Qué bloques nunca usas (elimínalos del kit).
3. Si tus sitios están convergiendo hacia el mismo diseño (mira la columna *signature*:
   si se repite, tienes un problema de catálogo, no de diseño).
