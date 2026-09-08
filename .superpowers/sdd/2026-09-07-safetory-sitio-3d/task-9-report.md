# Tarea 9 — Informe de implementación

## Qué implementé

Capa visual completa de la escena 3D: materiales, luces y planos de profundidad. Los tres módulos exportan las interfaces exactas que consumirán los objetos procedurales (T10) y las rutas futuras (T12-T19).

### Archivos creados

1. **`src/three/materiales.ts`** (46 líneas)
   - Constantes: `REC = 0xff2d2d`, `VOID = 0x080808`
   - Funciones:
     - `metalOscuro()`: Metal casi negro, muy poco brillo (metalness 0.85, roughness 0.42)
     - `rejilla()`: Malla metálica transparente (opacity 0.82, DoubleSide)
     - `emisivoAcento()`: Rojo REC que brilla (emissiveIntensity 0.65)
     - `blancoDifuso()`: Mate blanco (metalness 0.05, roughness 0.85)

2. **`src/three/luces.ts`** (38 líneas)
   - Tipo exportado: `Temperatura = 'ambar' | 'ambar-apagado' | 'violeta' | 'neutro'`
   - Función: `crearLuces(t)` retorna array de 3 luces:
     - Directional (luz ambiental, cambia color por temperatura)
     - Spot (acento rojo REC, invariante en todas las temperaturas)
     - Ambient (luz de relleno, siempre 0x2a2a2a)
   - Sin HDRI: reduce descarga manteniendo calidad visual

3. **`src/three/planos-profundidad.ts`** (38 líneas)
   - Función: `crearPlanosProfundidad(rutas: [string, string])`
   - Dos capas de profundidad:
     - Capa 1: z = -12, opacidad 0.18, escala 26
     - Capa 2: z = -6, opacidad 0.10, escala 14
   - Texturas cargadas con `THREE.SRGBColorSpace` para corrección de color
   - Geometría: PlaneGeometry con relación de aspecto 26 × 17.16 (escala × 0.66)

4. **`tests/materiales.test.ts`** (65 líneas)
   - 10 tests cobriendo:
     - Exactitud de constantes (REC, VOID)
     - Propiedades de materiales (metalness, roughness exactas con `toBeCloseTo`)
     - Transparencia y emisivo
     - Arquitectura de luces (3 siempre, acento invariante)
     - Cambio de temperatura solo en directional
     - Ausencia de HDRI (regex negativa en fuente)
     - Existencia de 6 texturas WebP
     - Presencia de valores críticos de profundidad (-12, -6) y opacidad (0.18, 0.10)

5. **Imágenes copiadas** (275 KB total)
   - `public/escena/microfono.webp` (33 KB)
   - `public/escena/sala.webp` (69 KB)
   - `public/escena/sala-ancha.webp` (44 KB)
   - `public/escena/ciclorama.webp` (45 KB)
   - `public/escena/interfaz.webp` (43 KB)
   - `public/escena/lounge.webp` (41 KB)

## Qué probé y resultados

### RED (test fallando antes de implementar)

```bash
$ npx vitest run tests/materiales.test.ts 2>&1 | head -10

FAIL  tests/materiales.test.ts
Error: Cannot find module '../src/three/materiales' imported from
C:/Users/MIPC/Desktop/DESARROLLOS/SAFETORY/tests/materiales.test.ts
 ❯ tests/materiales.test.ts:3:1
```

Esperado: Los módulos no existen. Falló como se anticipó.

### GREEN (test pasando después de implementar)

```bash
$ npx vitest run tests/materiales.test.ts

 Test Files  1 passed (1)
      Tests  10 passed (10)
   Start at  09:23:35
   Duration  889ms (import 71%, transform 20%, tests 6%, worker 2%)
```

Los 10 tests pasan:
- ✓ el acento es exactamente el token --rec
- ✓ el metal oscuro es metálico y poco brillante (spec §6.3)
- ✓ la rejilla es transparente para dejar ver la malla
- ✓ el emisivo de acento emite en --rec
- ✓ son exactamente tres: direccional, foco de acento y ambiente
- ✓ el foco de acento mantiene --rec en todas las temperaturas (G9)
- ✓ lo que cambia por ruta es la direccional, no el acento
- ✓ no hay entorno HDRI: encarece la descarga sin aportar (spec §6.3)
- ✓ las seis texturas están en public/escena
- ✓ los planos van detrás del objeto, con opacidad baja (spec §6.4)

### Build de producción

```bash
$ npm run build

[2m09:24:08[22m [34m[build][39m [32m✓ Completed in 1.78s.
[2m09:24:08[22m [34m[build][39m 1 page(s) built in [1m2.42s[22m
[2m09:24:08[22m [34m[build][39m [1mComplete![39m
```

Build verde, sin errores.

## Archivos cambiados

```
src/three/materiales.ts         — 46 líneas nuevas
src/three/luces.ts              — 38 líneas nuevas
src/three/planos-profundidad.ts — 38 líneas nuevas
tests/materiales.test.ts        — 65 líneas nuevas
public/escena/*                 — 6 imágenes WebP (275 KB)
```

## Auto-revisión

### Completitud
✓ Todos los archivos del brief implementados
✓ Todas las interfaces exportadas
✓ Las 6 imágenes copiadas y verificadas
✓ Tests cobriendo casos críticos

### Calidad
✓ Nombres descriptivos (`metalOscuro`, `crearLuces`, `crearPlanosProfundidad`)
✓ Comentarios documentando propósito de cada módulo
✓ Sem valores hardcodeados fuera del brief
✓ Respeto a regla G9: acento único (REC) en interfaz, ámbar/violeta solo como luz de escena

### Disciplina
✓ Solo lo pedido en el brief — sin funciones extra, sin refactorización
✓ Ningún `TODO`, `lorem`, placeholder
✓ Valores exactos del brief: metalness 0.85, roughness 0.42, z = -12, z = -6, opacidad 0.18, 0.10
✓ `THREE.SRGBColorSpace` en texturas (crítico para no lavar colores)
✓ Sin `dispose()` duplicado (motor.ts ya lo maneja)

### Tests
✓ 10 tests, todos verdes
✓ No tautológicos: cada uno fallaría si quitara la línea que verifica
  - `toBeCloseTo` en metalness/roughness: falla si cambio valores
  - Búsqueda por nombre en array: falla sin esa luz
  - Regex negativa en fuente: falla si añado RGBELoader
  - `existsSync`: falla sin los archivos
  - Búsqueda de strings numéricos: falla sin las profundidades exactas
✓ Cobertura de regla G9: verifica que acento es invariante en todas temperaturas

### Decisiones de diseño
✓ Dos capas de planos (z=-12, z=-6) vs. una: permite parallax geométrico suave
✓ Opacidades 0.18 y 0.10 vs. valores mayores: mantienen el objeto como protagonista
✓ Relación 0.66 en altura (26 × 17.16): proporción cinéfila, cabe cabeza-hombros en plano
✓ Sin entorno HDRI: T8 ya cubre iluminación con 3 luces puntuales, el HDRI solo encarecería

## Problemas o preocupaciones

Ninguno. El código está limpio, los tests son verdes, el build pasa, las imágenes entran en el commit. Listo para que el revisor valide.

---

## Ronda de arreglo 1 — Test de comportamiento para `crearPlanosProfundidad`

**Hallazgo:** El test original solo leía `planos-profundidad.ts` como texto y buscaba literales (`-12`, `-6`, `0.18`, `0.10`). No detectaría si las opacidades estuvieran intercambiadas o si las profundidades fueran incorrectas. Además, no verificaba que `colorSpace` se asignara correctamente.

**Solución:** Refactorizar para ejecutar la función con un mock `TextureLoader` que devuelve texturas vacías sin tocar DOM (vitest corre en environment Node).

### Cambios

1. **`src/three/planos-profundidad.ts`**: Añadir parámetro opcional `cargador?: THREE.TextureLoader`
   - Valor por defecto: `new THREE.TextureLoader()` → comportamiento original sin cambios
   - Permite inyectar mock en tests

2. **`tests/materiales.test.ts`**: Reemplazar test de texto por test de comportamiento real
   - Importar `THREE` y `vi` (spy mock)
   - Importar función `crearPlanosProfundidad`
   - Crear mock `TextureLoader` que devuelve `THREE.Texture()` vacía
   - Verificar que el Group construido tiene:
     - 2 hijos exactamente
     - Plano 0: z = -12, opacity = 0.18, name = 'plano-0'
     - Plano 1: z = -6, opacity = 0.10, name = 'plano-1'
     - Ambos con `colorSpace = THREE.SRGBColorSpace`
   - Verificar que el cargador fue llamado exactamente 2 veces con las rutas en orden

### Prueba de mutación

Se intercambiaron las opacidades en `CAPAS` para verificar que el test detecta el error:

**Mutación (opacidades invertidas):**
```ts
const CAPAS = [
  { z: -12, opacidad: 0.10, escala: 26 },  // ERA 0.18
  { z: -6, opacidad: 0.18, escala: 14 },   // ERA 0.10
] as const;
```

**Salida del test con mutación (RED):**
```bash
$ npx vitest run tests/materiales.test.ts 2>&1

FAIL  tests/materiales.test.ts > planos de profundidad > construye el Group...
AssertionError: expected 0.1 to be 0.18 // Object.is equality

- Expected
+ Received

- 0.18
+ 0.1

 ❯ tests/materiales.test.ts:89:66
     87|     const plano0 = grupo.children[0] as THREE.Mesh;
     88|     expect(plano0.position.z).toBe(-12);
     89|     expect((plano0.material as THREE.MeshBasicMaterial).opacity).toBe(…
       |                                                                  ^
     90|     expect(plano0.name).toBe('plano-0');

Test Files  1 failed (1)
Tests  1 failed | 9 passed (10)
```

El test **falló correctamente** al detectar que el plano 0 tenía opacity 0.1 en lugar de 0.18.

**Reversión (valores correctos restaurados):**
```bash
$ npx vitest run tests/materiales.test.ts

 Test Files  1 passed (1)
      Tests  10 passed (10)
   Start at  09:34:18
   Duration  827ms
```

El test **pasó nuevamente** tras restaurar los valores originales.

### Tests finales

Ahora el suite contiene 10 tests verificados:

- 4 de materiales (constantes, metalness/roughness, transparencia, emisivo) ✓
- 4 de luces (cantidad, invariancia de acento en G9, cambio de directional, sin HDRI) ✓
- 2 de planos:
  - Existencia de las 6 imágenes WebP ✓
  - **Comportamiento real: estructura, profundidades, opacidades y colorSpace** ✓

Commit: `6ef9fe9` (fix(S3D): test de comportamiento real para crearPlanosProfundidad)

---

## Ronda de arreglo 2 — Aserto de `colorSpace` debe discriminar ambas texturas

**Hallazgo:** El mock devolvía la **misma instancia** de `THREE.Texture` en ambas llamadas a `load()`. El aserto final verificaba `colorSpace` en esa instancia única, lo que permitía pasar incluso si se asignara `colorSpace` solo en la primera iteración (no se discriminaba en ambas).

**Solución:** Hacer que `load()` devuelva una **nueva instancia** en cada llamada, capturar ambas en un array, y verificar `colorSpace` en cada una por separado.

### Cambios

**`tests/materiales.test.ts`**: Actualizar mock y asertos

```ts
// Antes: una instancia compartida
const mockTexture = new THREE.Texture();
const mockCargador = { load: vi.fn(() => mockTexture) };
// ...
expect(mockTexture.colorSpace).toBe(THREE.SRGBColorSpace);

// Después: instancias nuevas capturadas
const texturasCargadas: THREE.Texture[] = [];
const mockCargador = {
  load: vi.fn((url: string) => {
    const textura = new THREE.Texture();
    textura.colorSpace = THREE.LinearSRGBColorSpace;  // estado inicial falso
    texturasCargadas.push(textura);
    return textura;
  }),
};
// ...
expect(texturasCargadas[0].colorSpace).toBe(THREE.SRGBColorSpace);
expect(texturasCargadas[1].colorSpace).toBe(THREE.SRGBColorSpace);
```

### Prueba de mutación

Se condicionó la asignación de `colorSpace` solo a la primera iteración:

**Mutación (en `src/three/planos-profundidad.ts`):**
```ts
if (i === 0) textura.colorSpace = THREE.SRGBColorSpace;
```

**Salida del test con mutación (RED):**
```bash
$ npx vitest run tests/materiales.test.ts 2>&1

FAIL  tests/materiales.test.ts > planos de profundidad > construye el Group...
AssertionError: expected 'srgb-linear' to be 'srgb' // Object.is equality

Expected: "srgb"
Received: "srgb-linear"

 ❯ tests/materiales.test.ts:103:44
    101|     expect(texturasCargadas).toHaveLength(2);
    102|     expect(texturasCargadas[0].colorSpace).toBe(THREE.SRGBColorSpace);
    103|     expect(texturasCargadas[1].colorSpace).toBe(THREE.SRGBColorSpace);
       |                                            ^

Test Files  1 failed (1)
Tests  1 failed | 9 passed (10)
```

El test **falló en la segunda textura** (índice 1), donde el `colorSpace` se quedó en `'srgb-linear'` (el valor inicial falso) porque la asignación fue saltada por la condición `i === 0`.

**Reversión (archivo restaurado con `git checkout`):**
```bash
$ git checkout -- src/three/planos-profundidad.ts
$ npx vitest run tests/materiales.test.ts 2>&1

 Test Files  1 passed (1)
      Tests  10 passed (10)
   Start at  09:41:31
   Duration  691ms
```

El test **pasó nuevamente** tras restaurar `colorSpace` sin condicionar.

### Tests finales

El suite mantiene 10 tests, todos pasando:

- 4 de materiales ✓
- 4 de luces ✓
- **2 de planos:**
  - Existencia de 6 imágenes ✓
  - **Comportamiento real: estructura, profundidades, opacidades y colorSpace en ambas texturas** ✓ (ahora discrimina la segunda)

Commit: `0106ddf` (fix(S3D): mock de texturas devuelve instancias nuevas, verifica colorSpace en ambas)

