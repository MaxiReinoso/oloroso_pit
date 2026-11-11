# CHANGES — Secuencia de Implementación

> Índice canónico de los changes del proyecto **Oloroso Pit**.
> Cada change es atómico: una sola funcionalidad verificable, implementable en una sesión (~4-6 h).
> **Leer este archivo antes de ejecutar cualquier `/opsx:propose`.**

**Fuente de verdad**: `docs/discovery/brief-clientes.md` (v5, 2026-11-05). Manda sobre `knowledge-base/`, `discovery/` y el sistema visual. Donde la KB se aparta del brief, este documento aplica el brief y lo registra en §8.

**Estado del proyecto**: no hay código todavía. Todos los criterios de aceptación de este documento son **criterios a implementar**, no verificaciones hechas.

**Política visual**: `design-system/README.md` → `Mode: system-and-mockups`, `Revision: 2`, **aprobación pendiente (2026-11-11)**. La identidad de color y tipografía fue confirmada por los clientes (D-07); el logo sigue siendo un placeholder. Todo change marcado `Visual? Sí` requiere un mockup HTML local, renderizado a 390×844 y 1440×900, y **aprobación explícita del usuario antes de implementar**. Los mockups enlazan `Design system revision: 2` en su `design.md`.

---

## Cómo usar este documento

1. Elegí el change con menor `C-NN` cuyas dependencias estén cerradas y que no esté bloqueado por una definición pendiente (§6).
2. Leé los archivos de **Leer antes** de ese change. No improvises reglas: si algo no está, se registra como pregunta abierta, no se inventa.
3. Si el change es visual, creá y aprobá el mockup **antes** de escribir código (política `system-and-mockups`).
4. Corré `/opsx:propose C-NN-nombre-del-change`, implementá y archivá.
5. Marcá el `[ ]` como `[x]` solo cuando los criterios de aceptación se verifiquen. Actualizá este archivo si cambia el alcance.

---

## Árbol de dependencias

```
C-01 ─ C-02 ─┬─ C-03 ─ C-04 ─┬─ C-05
             │               ├─ C-06
             │               ├─ C-07
             │               ├─ C-08 ─┬─ C-09  (bloqueado por D-02)
             │               │        └─ C-11 ─ C-12 ─┬─ C-19 (también ← C-13)
             │               │                         └─ C-20 (también ← C-16)
             │               └─ C-10
             ├─ C-13 ─ C-14 ─ C-15 ─┬─ C-16
             │                       ├─ C-17
             │                       └─ C-18 (también ← C-14)
             └─ C-21  (importación, también ← D-08)

C-21 ══════> C-22   precedencia dura: no hay despliegue sin importación
resto del MVP ──> C-22
```

### Camino crítico (9 changes)

`C-01 → C-02 → C-03 → C-04 → C-08 → C-11 → C-12 → C-21 → C-22`

> C-21 solo necesita C-02, C-03 y D-08: puede ejecutarse temprano. Entra al camino crítico por **precedencia dura**, no por duración.

### Paralelismo por fase — GATES 0 a 11

```
GATE 0: C-01 ✓
  → C-02 esquema-datos-rls                              [Agente C · infra/datos]

GATE 1: C-02 ✓                                            ← PRIMER FORK
  → C-03 datos-base-lineas-whatsapp                     [Agente C · datos]
  → C-13 login-admin                                    [Agente B · panel]
  → C-21 importacion-planilla (habilitado si D-08 ✓)    [Agente C — no bloquea deploy hasta GATE 10]

GATE 2: C-03 ✓
  → C-04 catalogo-grilla                                [Agente A · público]

GATE 3: C-13 ✓
  → C-14 admin-taxonomias                               [Agente B]

GATE 4: C-04 ✓                                            ← FORK (5 ramas)
  → C-05 navegacion-linea                               [Agente A]
  → C-06 navegacion-marca                               [Agente A]
  → C-07 filtro-genero                                   [Agente A]
  → C-08 ficha-presentaciones                            [Agente A — camino crítico]
  → C-10 filtro-acordes                                  [Agente A]

GATE 5: C-14 ✓
  → C-15 admin-alta-perfume                              [Agente B]

GATE 6: C-08 ✓
  → C-11 carrito-local                                   [Agente A — camino crítico]
  → C-09 decants-presentacion (solo si D-02 ✓)           [Agente A]

GATE 7: C-15 ✓                                            ← FORK (3 ramas)
  → C-16 admin-editar-presentaciones                     [Agente B]
  → C-17 admin-editar-clasificacion                      [Agente B]
  → C-18 admin-frase-masiva                              [Agente B — si C-14 ✓]

GATE 8: C-11 ✓
  → C-12 pedido-whatsapp                                 [Agente A — camino crítico]

GATE 9: C-12 ✓ + C-13 ✓                                   ← FORK
  → C-19 admin-numero-whatsapp                           [Agente B]
  → C-20 ofertas (si C-16 ✓ y D-03 ✓)                    [Agente A]

GATE 10: C-21 ✓ ejecutada y verificada (D-08 ✓)
  → habilita el despliegue                               [Agente C]

GATE 11: MVP completo + C-21 ✓
  → C-22 despliegue-produccion                           [Agente C + A + B]
```

### Plan multi-agente

| Paso | Agente A (Catálogo público) | Agente B (Panel) | Agente C (Infra/datos) |
|---|---|---|---|
| 1 | — | — | C-01, C-02 |
| 2 | — | C-13 | C-03, C-21 (si D-08) |
| 3 | C-04 | C-14 | QA de RLS, keep-alive |
| 4 | C-05, C-06, C-07, C-08, C-10 | C-15 | C-21 / verificación |
| 5 | C-11, C-09 (si D-02) | C-16, C-17, C-18 | preparación de C-22 |
| 6 | C-12 | C-19 | C-21 / C-22 (tras GATE 10) |
| 7 | C-20 (si D-03) | — | C-22 |

> Con un solo desarrollador (contexto real del proyecto) los carriles se vuelven cola; los GATES marcan los puntos seguros para cambiar de contexto sin dejar trabajo a medias.

---

## FASE 0 — Fundación

### [C-01] `fundacion-proyecto`
- **Estado**: `[ ]` pendiente
- **Funcionalidad**: el shell estático del sitio compila y levanta con Supabase y los tokens visuales.
- **Visual?**: Sí — requiere mockup aprobado (revision 2). Mockup del shell en `openspec/changes/c-01-fundacion-proyecto/mockups/`, **pendiente de aprobación**.
- **Governance**: BAJO
- **Dependencias**: ninguna
- **Bloqueos de cliente**: ninguno (T-01 resuelta: Astro + islas React + Supabase).
- **Dentro**:
  - Proyecto Astro con islas React, estructura `src/pages`, `src/components`, `src/layouts`, `src/lib`, `src/styles`.
  - **DynaPuff y Nunito auto-hospedadas** con `@font-face` y `font-display: swap`; sin CDN de Google Fonts en producción.
  - Cliente Supabase browser (`src/lib/supabase/client.ts`) con `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY`.
  - `.env.example` versionado, `.env` en `.gitignore`.
  - Layouts `PublicLayout` y `AdminLayout` importando `design-system/tokens.css` y `design-system/brand.js`.
  - Ruta shell con cabecera y pie.
- **Fuera**: páginas de catálogo, auth, datos reales, buscador, home con destacados.
- **Criterios de aceptación**:
  - `npm run dev` levanta el sitio y `/` renderiza el shell.
  - `npm run build` genera salida estática sin servidor Node permanente.
  - Ningún color, radio, sombra ni tipografía está hardcodeado: todo sale de `var(--token)`.
  - Las variables `PUBLIC_*` se leen de `.env`; `.env` no está versionado y `.env.example` sí.
  - Las fuentes se sirven localmente: el build no hace requests a `fonts.googleapis.com` ni `fonts.gstatic.com`.
- **Leer antes**:
  - `knowledge-base/08_arquitectura_propuesta.md` §Estructura de directorios, §Variables de entorno, §Despliegue
  - `knowledge-base/02_descripcion_general.md` §Stack tecnológico
  - `design-system/README.md` §4 (tokens) y §5 (componentes)
  - brief §9 (restricciones de stack y costo)

### [C-02] `esquema-datos-rls`
- **Estado**: `[ ]` pendiente
- **Funcionalidad**: `anon` lee el catálogo y no puede escribir en ninguna tabla.
- **Visual?**: No
- **Governance**: CRÍTICO
- **Dependencias**: C-01
- **Bloqueos de cliente**: ninguno.
- **Dentro**:
  - Migración `0001_init.sql`: `lineas`, `marcas`, `perfumes`, `presentaciones`, `acordes`, `perfume_acordes`, `frases`, `perfume_frases`, `settings`. **Sin** columnas `activo`/`activa` ni `presentaciones.disponible`.
  - Constraints: `slug` único, `genero` enum (`masculino`/`femenino`/`unisex`), FK `ON DELETE RESTRICT` en línea/marca, `precio_ars >= 0`, `stock >= 0`, `precio_oferta_ars < precio_ars`, unicidad `(perfume_id, tipo, volumen_ml)`.
  - Migración `0002_rls.sql`: RLS en todas las tablas; `anon` solo `SELECT`; `authenticated` lectura y escritura.
  - `settings`: `CHECK (whatsapp_destino ~ '^[0-9]{10,15}$')` y `CHECK (id = 1)`; lectura pública solo de `whatsapp_destino`.
  - Trigger de máximo **3 frases por perfume** en `perfume_frases`.
  - Script de prueba de seguridad con `anon`.
- **Fuera**: seeds reales, datos de catálogo, UI, columnas definitivas de oferta (dependen de D-03).
- **Criterios de aceptación**:
  - `supabase db reset` aplica `0001` y `0002` sin error.
  - Un `INSERT`, `UPDATE` o `DELETE` con `anon` **falla en todas las tablas**.
  - `authenticated` puede escribir en todas las tablas del catálogo.
  - `anon` lee todas las filas cargadas (no existe estado de publicación) y solo el campo del número en `settings`.
  - Un `INSERT` directo de una **cuarta frase** para un mismo perfume **falla por trigger**.
  - El `CHECK` de WhatsApp rechaza `+`, espacios, guiones y letras; el `CHECK (id = 1)` impide una segunda fila.
  - Los `CHECK` rechazan precio negativo, stock negativo y oferta mayor o igual al precio de lista.
- **Leer antes**:
  - `knowledge-base/04_modelo_de_datos.md` completo (ERD, entidades, constraints, entidades ausentes)
  - `knowledge-base/05_reglas_de_negocio.md` §RN-ADM, §RN-PRE
  - `knowledge-base/08_arquitectura_propuesta.md` §Seguridad y RLS
  - `knowledge-base/03_actores_y_roles.md` §RBAC
  - brief §7 (reglas de negocio)

### [C-03] `datos-base-lineas-whatsapp`
- **Estado**: `[ ]` pendiente
- **Funcionalidad**: `anon` lee las tres líneas y el número de destino, sin poder modificarlo.
- **Visual?**: No
- **Governance**: MEDIO
- **Dependencias**: C-02
- **Bloqueos de cliente**: ninguno. **Dato operativo**: el número real se carga desde C-19 antes del lanzamiento.
- **Dentro**:
  - Migración `0003_seed.sql`: líneas Árabes, Diseñador y Nicho con `orden` 1, 2 y 3.
  - Fila única de `settings` con un **placeholder válido** que cumpla `^[0-9]{10,15}$`.
  - Vista o consulta pública que expone solo `whatsapp_destino`.
- **Fuera**: marcas, perfumes, acordes y frases (no hay datos aprobados; la carga real es C-21); el número real de Emi.
- **Criterios de aceptación**:
  - `anon` obtiene las 3 líneas con su orden.
  - `anon` obtiene el número placeholder y **no** puede hacer `UPDATE`.
  - La vista pública no expone columnas internas de `settings`.
  - El placeholder cumple el formato del `CHECK` de C-02.
- **Leer antes**:
  - `knowledge-base/04_modelo_de_datos.md` §lineas, §settings, §Seed data inicial
  - `knowledge-base/05_reglas_de_negocio.md` §RN-CAR-07, RN-CAR-08, RN-CAR-09
  - brief §5 (pedidos al WhatsApp de Emi) y §8 (integraciones)

---

## FASE 1 — Catálogo público

### [C-04] `catalogo-grilla`
- **Estado**: `[ ]` pendiente
- **Funcionalidad**: la grilla lista todos los perfumes cargados con nombre, marca, línea, género, precio e imagen.
- **Visual?**: Sí
- **Governance**: BAJO
- **Dependencias**: C-03
- **Bloqueos de cliente**: ninguno.
- **Dentro**:
  - `/perfumes` como catálogo; `/` como entrada al catálogo.
  - Consulta de todos los perfumes con marca, línea, género y presentaciones.
  - Tarjeta con nombre, marca, línea, género, **precio del frasco sellado** (D-01) e imagen o placeholder.
  - Estados de carga, vacío y error con reintento.
  - Responsive a 390×844 y 1440×900; título y descripción para SEO.
- **Fuera**: filtros (C-05, C-06, C-07, C-10), ficha (C-08), carrito (C-11), ofertas (C-20), buscador, home con destacados.
- **Criterios de aceptación**:
  - Aparecen **todos** los perfumes cargados; no existe filtro de publicación.
  - Cada tarjeta muestra los seis campos y el precio del frasco sellado.
  - Un perfume sin imagen muestra placeholder, nunca un hueco roto.
  - Un perfume sin stock muestra el precio y el texto "Sin stock, por encargo".
  - Sin resultados, muestra "No encontramos perfumes con esos filtros" y un botón para limpiar.
  - Si Supabase no responde, hay estado de error con reintento (la grilla no queda vacía sin explicación).
- **Leer antes**:
  - `knowledge-base/06_funcionalidades.md` §US-001
  - `knowledge-base/05_reglas_de_negocio.md` §RN-CAT-01, RN-PRE-03, RN-STK-04, RN-STK-05
  - `knowledge-base/07_flujos_principales.md` §Flujo 1
  - `knowledge-base/04_modelo_de_datos.md` §perfumes, §presentaciones
  - brief §5
  - `design-system/README.md` §3 (dirección visual), §5 (componentes)

### [C-05] `navegacion-linea`
- **Estado**: `[ ]` pendiente
- **Funcionalidad**: la navegación muestra solo líneas con al menos un perfume y su URL filtra el catálogo.
- **Visual?**: Sí
- **Governance**: BAJO
- **Dependencias**: C-04
- **Bloqueos de cliente**: ninguno.
- **Dentro**:
  - Ruta `/linea/[slug]` con URL estable y compartible.
  - Navegación que oculta líneas sin perfumes (regla de vacío, no de publicación).
  - Estado vacío para una línea sin perfumes accedida por URL manual.
- **Fuera**: edición de líneas (no están entre las taxonomías editables del brief §7).
- **Criterios de aceptación**:
  - Con solo Árabes cargada, la navegación muestra únicamente Árabes.
  - Al cargar el primer perfume en Diseñador, la línea aparece sin redeploy.
  - `/linea/disenador` sin perfumes no aparece como link y no rompe la página.
  - La URL de cada línea abre el mismo listado.
- **Leer antes**:
  - `knowledge-base/06_funcionalidades.md` §US-002
  - `knowledge-base/05_reglas_de_negocio.md` §RN-CAT-02, RN-CAT-03
  - `knowledge-base/07_flujos_principales.md` §Flujo 1 (casos de error)
  - brief §5

### [C-06] `navegacion-marca`
- **Estado**: `[ ]` pendiente
- **Funcionalidad**: el filtro por marca lista solo los perfumes cargados de esa marca.
- **Visual?**: Sí
- **Governance**: BAJO
- **Dependencias**: C-04
- **Bloqueos de cliente**: ninguno.
- **Dentro**:
  - Ruta `/marca/[slug]` con URL estable.
  - Acceso a la marca desde la tarjeta del perfume.
  - Ocultar marcas sin perfumes.
- **Fuera**: creación y edición de marcas (C-14).
- **Criterios de aceptación**:
  - Desde una tarjeta se entra a su marca y se listan sus perfumes.
  - Una marca sin perfumes no se ofrece en ningún listado.
  - La URL de marca es estable y compartible.
- **Leer antes**:
  - `knowledge-base/06_funcionalidades.md` §US-003
  - `knowledge-base/05_reglas_de_negocio.md` §RN-CAT-01
  - `knowledge-base/04_modelo_de_datos.md` §marcas
  - brief §5

### [C-07] `filtro-genero`
- **Estado**: `[ ]` pendiente
- **Funcionalidad**: el filtro de género (selección única) reduce la grilla y queda en la URL.
- **Visual?**: Sí
- **Governance**: BAJO
- **Dependencias**: C-04
- **Bloqueos de cliente**: ninguno (D-09 resuelta: género es selección única).
- **Dentro**:
  - Filtro masculino / femenino / unisex con **una sola opción activa**.
  - Estado en la URL y botón de limpiar en un clic.
  - Intersección con los demás filtros.
- **Fuera**: selección múltiple de géneros.
- **Criterios de aceptación**:
  - Solo puede haber un género seleccionado a la vez.
  - El filtro queda reflejado en la URL y se mantiene al recargar.
  - "Limpiar" devuelve el catálogo completo.
  - Combinado con línea, marca o acordes, el resultado es la intersección.
- **Leer antes**:
  - `knowledge-base/06_funcionalidades.md` §US-007
  - `knowledge-base/05_reglas_de_negocio.md` §RN-CAT-04
  - brief §5

### [C-08] `ficha-presentaciones`
- **Estado**: `[ ]` pendiente
- **Funcionalidad**: cambiar de presentación actualiza precio y stock sin recargar la página.
- **Visual?**: Sí
- **Governance**: MEDIO
- **Dependencias**: C-04
- **Bloqueos de cliente**: ninguno. Funciona con el **frasco sellado** como presentación base.
- **Dentro**:
  - Ruta `/perfumes/[slug]` con nombre, marca, línea, género, imagen, descripción, acordes y hasta 3 frases.
  - Selector de presentación con precio y estado propios por presentación, actualizados sin recargar.
  - Agregar al carrito **por presentación**, con cantidad.
  - 404 solo cuando el slug no existe.
  - Perfume sin presentaciones: aviso interno y sin botón de compra.
- **Fuera**: la composición final de los decants en la ficha (C-09), ficha con notas y barras (brief §6), plazos de encargo (D-06).
- **Criterios de aceptación**:
  - Cambiar de presentación actualiza precio y estado de stock en el mismo render.
  - Los precios salen de la base; ninguno está escrito en el código.
  - Cada presentación se puede agregar al carrito por separado, con cantidad mayor a uno.
  - `/perfumes/<slug-inexistente>` devuelve 404, no 500.
  - Un perfume sin presentaciones no permite comprar y muestra un aviso.
- **Leer antes**:
  - `knowledge-base/06_funcionalidades.md` §US-004, §US-005, §US-009
  - `knowledge-base/05_reglas_de_negocio.md` §RN-CAT-08, RN-CAT-09, RN-STK-01, RN-STK-02, RN-STK-04, RN-PRE-02
  - `knowledge-base/07_flujos_principales.md` §Flujo 2
  - `knowledge-base/04_modelo_de_datos.md` §presentaciones
  - brief §5 y §7
  - `design-system/README.md` §3 (la tarjeta lleva a la ficha, no agrega al carrito)

### [C-09] `decants-presentacion`
- **Estado**: `[ ]` pendiente
- **Funcionalidad**: los decants de 5 y 10 ml se muestran en la forma definida en D-02.
- **Visual?**: Sí
- **Governance**: BAJO
- **Dependencias**: C-08
- **Bloqueos de cliente**: **D-02 — bloqueo total**. No se implementa hasta que se defina si van integrados en la ficha, en sección aparte o en ambas.
- **Dentro**:
  - Implementar la forma elegida por D-02.
  - Decants de 5 ml y 10 ml con precio y stock propios, leídos de la base.
  - Agregables al carrito por separado, en cantidades mayores a uno.
- **Fuera**: decidir la forma de mostrarlos (D-02); precios hardcodeados; combos de decants (brief §6).
- **Criterios de aceptación**:
  - Los decants se muestran según la forma definida en D-02.
  - Cada decant muestra volumen, precio y estado ("En stock" / "Sin stock, por encargo").
  - Cada decant se agrega al carrito por separado con cantidad mayor a uno.
  - Los precios provienen de la base y reflejan los valores cargados (5 ml y 10 ml).
- **Leer antes**:
  - brief §5 (decants de 5 ml y 10 ml, "acordado en concepto") y §11 (forma de mostrarlos, por definir)
  - `knowledge-base/06_funcionalidades.md` §US-005
  - `knowledge-base/05_reglas_de_negocio.md` §RN-CAT-09
  - `knowledge-base/07_flujos_principales.md` §Flujo 2 (notas)
  - `knowledge-base/10_preguntas_abiertas.md` §Q-01

### [C-10] `filtro-acordes`
- **Estado**: `[ ]` pendiente
- **Funcionalidad**: el filtro de acordes usa los acordes cargados y combina con OR, sin tope.
- **Visual?**: Sí
- **Governance**: BAJO
- **Dependencias**: C-04
- **Bloqueos de cliente**: D-08 (parcial) — el mecanismo se implementa; la validación con datos reales espera la lista aprobada.
- **Dentro**:
  - Lista de acordes construida con los acordes presentes en perfumes cargados.
  - Selección múltiple con semántica **OR** (al menos uno de los seleccionados) y **sin tope**.
  - Actualización automática al crear un acorde, sin redeploy.
  - Un acorde sin perfumes no se muestra.
- **Fuera**: la lista unificada de acordes (D-08); semántica AND.
- **Criterios de aceptación**:
  - Un acorde recién creado y asignado aparece en el filtro sin rebuild.
  - Un acorde sin perfumes no aparece.
  - Seleccionar dos acordes devuelve la unión de resultados.
  - No hay límite de acordes seleccionables.
  - "Limpiar" devuelve el catálogo completo.
- **Leer antes**:
  - `knowledge-base/06_funcionalidades.md` §US-008
  - `knowledge-base/05_reglas_de_negocio.md` §RN-CAT-06, RN-CAT-07
  - `knowledge-base/04_modelo_de_datos.md` §acordes, §perfume_acordes
  - `knowledge-base/10_preguntas_abiertas.md` §IN-03
  - brief §5

---

## FASE 2 — Carrito y pedido

### [C-11] `carrito-local`
- **Estado**: `[ ]` pendiente
- **Funcionalidad**: agregar, cambiar cantidad y quitar ítems persiste al recargar el navegador.
- **Visual?**: Sí
- **Governance**: MEDIO
- **Dependencias**: C-08
- **Bloqueos de cliente**: ninguno. **No depende de D-02.**
- **Dentro**:
  - Agregar una presentación con cantidad desde la ficha.
  - Incrementar cantidad si la presentación ya está en el carrito.
  - Editar cantidad y quitar ítems.
  - Persistencia en `localStorage` y contador de unidades.
  - Revalidación de precio y stock al abrir el carrito.
  - Presentación inexistente marcada como no disponible, con opción de quitarla.
  - Estado vacío con acceso al catálogo.
- **Fuera**: reserva o descuento de stock, sincronización entre dispositivos, expiración del carrito.
- **Criterios de aceptación**:
  - Recargar la página conserva el carrito y sus cantidades.
  - Agregar dos veces la misma presentación deja cantidad 2, no dos filas.
  - El contador refleja el total de unidades.
  - Una presentación que ya no existe se marca y se puede quitar.
  - Con `localStorage` bloqueado, el carrito funciona en memoria durante la sesión y avisa que no se conservará.
- **Leer antes**:
  - `knowledge-base/06_funcionalidades.md` §US-011, §US-012
  - `knowledge-base/05_reglas_de_negocio.md` §RN-CAR-01, RN-CAR-11, RN-CAR-12
  - `knowledge-base/07_flujos_principales.md` §Flujo 3
  - `knowledge-base/09_decisiones_y_supuestos.md` §DD-06

### [C-12] `pedido-whatsapp`
- **Estado**: `[ ]` pendiente
- **Funcionalidad**: el CTA abre `wa.me` con el mensaje correcto y compra/encargo separados.
- **Visual?**: Sí
- **Governance**: CRÍTICO
- **Dependencias**: C-11, C-03
- **Bloqueos de cliente**: D-10 (parcial) — el link y el encoding se implementan; la estructura y el copy final del mensaje esperan confirmación.
- **Dentro**:
  - `/carrito` con subtotal de compra, subtotal de encargo y total.
  - CTA "Enviar pedido por WhatsApp".
  - Lectura de `settings.whatsapp_destino`.
  - Mensaje con perfume, marca, presentación, cantidad y precio por ítem.
  - Separación de ítems en compra (stock > 0) y encargo (stock = 0).
  - `encodeURIComponent` sobre el texto.
  - Botón deshabilitado con carrito vacío; error operativo si no hay número.
  - Nota "se abrirá WhatsApp"; sin datos personales del cliente.
- **Fuera**: persistencia del pedido, webhooks, estados de orden, pasarela de pagos.
- **Criterios de aceptación**:
  - El link `https://wa.me/<numero>?text=...` abre con tildes, saltos de línea y `$` intactos.
  - Un carrito mixto separa "COMPRA (en stock)" y "ENCARGO (sin stock)".
  - Con el carrito vacío no se genera link y el botón está deshabilitado.
  - Sin número configurado se bloquea el envío con un mensaje operativo.
  - El mensaje no incluye nombre, teléfono ni dirección del cliente.
- **Leer antes**:
  - `knowledge-base/06_funcionalidades.md` §US-013, §US-014
  - `knowledge-base/05_reglas_de_negocio.md` §RN-CAR-02 a RN-CAR-10, §RN-GLB-01
  - `knowledge-base/07_flujos_principales.md` §Flujo 4 (crítico)
  - `knowledge-base/02_descripcion_general.md` §Detalle de la integración con WhatsApp
  - brief §5, §7 y §8

---

## FASE 3 — Panel de administración

### [C-13] `login-admin`
- **Estado**: `[ ]` pendiente
- **Funcionalidad**: sin sesión `/admin/*` redirige, con credenciales válidas entra, y el registro público está cerrado.
- **Visual?**: Sí
- **Governance**: CRÍTICO
- **Dependencias**: C-01, C-02
- **Bloqueos de cliente**: D-04 (parcial) — campo y copy del login.
- **Dentro**:
  - `/admin/login` con `signIn` contra Supabase Auth.
  - Guard en todas las rutas `/admin/*`; sesión persistente; logout.
  - Error genérico sin revelar si el usuario existe.
  - Layout de panel.
  - **Registro público deshabilitado**: "Allow new users to sign up" en off, `auth.signUp` prohibido en el cliente, `anon` sin `INSERT` por RLS.
- **Fuera**: registro público, roles intermedios, recuperación de contraseña autogestionada (fuera del brief).
- **Criterios de aceptación**:
  - Sin sesión, cualquier `/admin/*` redirige a `/admin/login`.
  - Credenciales inválidas muestran un error genérico.
  - Login válido redirige a `/admin`; recargar mantiene la sesión; logout la cierra.
  - **Un `signUp` anónimo falla**; no existe llamada a `auth.signUp` en el bundle del cliente.
  - `anon` no puede insertar filas en ninguna tabla del catálogo.
- **Leer antes**:
  - `knowledge-base/06_funcionalidades.md` §US-015
  - `knowledge-base/05_reglas_de_negocio.md` §RN-ADM-01, RN-ADM-02, RN-ADM-04, RN-ADM-06
  - `knowledge-base/07_flujos_principales.md` §Flujo 5
  - `knowledge-base/08_arquitectura_propuesta.md` §Seguridad / Autenticación
  - `knowledge-base/03_actores_y_roles.md` §Rutas protegidas
  - brief §5

### [C-14] `admin-taxonomias`
- **Estado**: `[ ]` pendiente
- **Funcionalidad**: crear una marca, un acorde o una frase se refleja en el catálogo sin redeploy.
- **Visual?**: Sí
- **Governance**: MEDIO
- **Dependencias**: C-13
- **Bloqueos de cliente**: ninguno.
- **Dentro**:
  - Crear **marcas**, **acordes** y **frases** desde el panel.
  - Unicidad case-insensitive por nombre.
  - Reflejo inmediato en ficha, filtros y formularios de alta.
- **Fuera**: renombrar y desactivar (ver §9, sin change); gestión de líneas (seed en C-03); creación inline en el alta (C-15).
- **Criterios de aceptación**:
  - Una marca creada acá puede seleccionarse al dar de alta un perfume.
  - Un acorde creado aparece en el filtro público cuando se asigna a un perfume, sin rebuild.
  - Una frase creada puede asignarse a perfumes.
  - El sistema rechaza duplicados por nombre ignorando mayúsculas.
- **Leer antes**:
  - `knowledge-base/06_funcionalidades.md` §US-020 (solo la parte de creación)
  - `knowledge-base/05_reglas_de_negocio.md` §RN-ADM-08, RN-CAT-07
  - `knowledge-base/04_modelo_de_datos.md` §marcas, §acordes, §frases
  - brief §5 y §7

### [C-15] `admin-alta-perfume`
- **Estado**: `[ ]` pendiente
- **Funcionalidad**: un perfume creado desde el panel aparece sin stock y con precio del frasco sellado.
- **Visual?**: Sí
- **Governance**: MEDIO
- **Dependencias**: C-14
- **Bloqueos de cliente**: D-05 (parcial) — origen y alojamiento de las fotos.
- **Dentro**:
  - Formulario con nombre, marca (existente o nueva), línea, género, descripción, imagen, acordes, frases y al menos un frasco sellado con precio.
  - Inserción transaccional del perfume y sus relaciones.
  - Perfume nuevo con `stock = 0` en su frasco.
  - Validación de obligatorios junto al campo; slug único.
  - Creación inline de marca, acorde y frase.
  - Rechazo de alta sin frasco sellado con precio (D-01).
- **Fuera**: edición posterior (C-16, C-17), importación masiva (C-21).
- **Criterios de aceptación**:
  - Un perfume creado aparece en el catálogo con "Sin stock, por encargo" y **con precio**.
  - Sin al menos un frasco sellado con precio, el alta se rechaza con mensaje claro.
  - Una marca, acorde o frase creada inline queda disponible al instante.
  - Un fallo a mitad no deja un perfume sin presentaciones.
  - Un slug duplicado se reporta o se genera uno alternativo.
- **Leer antes**:
  - `knowledge-base/06_funcionalidades.md` §US-017
  - `knowledge-base/05_reglas_de_negocio.md` §RN-STK-03, RN-ADM-08, RN-ADM-10
  - `knowledge-base/07_flujos_principales.md` §Flujo 6
  - `knowledge-base/04_modelo_de_datos.md` §perfumes, §presentaciones
  - `knowledge-base/10_preguntas_abiertas.md` §IN-06
  - brief §5

### [C-16] `admin-editar-presentaciones`
- **Estado**: `[ ]` pendiente
- **Funcionalidad**: cambiar precio y stock de una presentación se refleja en el catálogo sin redeploy.
- **Visual?**: Sí
- **Governance**: ALTO
- **Dependencias**: C-15
- **Bloqueos de cliente**: D-05 (parcial) — reemplazo de imagen.
- **Dentro**:
  - Editar precio y stock por presentación.
  - Reemplazar la imagen del perfume.
  - Rechazar precios y stocks negativos.
  - Confirmación de guardado y reflejo inmediato en tarjeta y ficha.
- **Fuera**: clasificación (C-17), carga de ofertas (C-20).
- **Criterios de aceptación**:
  - Cambiar el precio de una presentación se ve en el catálogo sin redeploy.
  - Llevar el stock de 0 a más de 0 cambia el indicador a "En stock".
  - Precio o stock negativos se rechazan.
  - La imagen reemplazada se ve en tarjeta y ficha.
- **Leer antes**:
  - `knowledge-base/06_funcionalidades.md` §US-018
  - `knowledge-base/05_reglas_de_negocio.md` §RN-PRE-02, RN-PRE-08, RN-STK-02, RN-STK-05
  - `knowledge-base/07_flujos_principales.md` §Flujo 6
  - `knowledge-base/04_modelo_de_datos.md` §presentaciones
  - brief §3 y §5

### [C-17] `admin-editar-clasificacion`
- **Estado**: `[ ]` pendiente
- **Funcionalidad**: una cuarta frase falla por trigger de base y no se guarda.
- **Visual?**: Sí
- **Governance**: MEDIO
- **Dependencias**: C-15
- **Bloqueos de cliente**: ninguno.
- **Dentro**:
  - Editar género, acordes (varios) y hasta 3 frases de un perfume.
  - Bloqueo de la cuarta frase con mensaje claro, respaldado por el trigger de C-02.
  - Reflejo en ficha y filtros.
- **Fuera**: asignación masiva (C-18), creación de taxonomías (C-14).
- **Criterios de aceptación**:
  - Intentar una cuarta frase se bloquea con mensaje y no se persiste.
  - Un `INSERT` directo de una cuarta frase falla por trigger.
  - Los acordes editados se reflejan en la ficha y en el filtro.
  - Cambiar el género mueve el perfume entre los resultados del filtro.
- **Leer antes**:
  - `knowledge-base/06_funcionalidades.md` §US-022
  - `knowledge-base/05_reglas_de_negocio.md` §RN-CAT-04, RN-CAT-05, RN-CAT-06
  - `knowledge-base/04_modelo_de_datos.md` §perfume_acordes, §perfume_frases
  - brief §3 y §7

### [C-18] `admin-frase-masiva`
- **Estado**: `[ ]` pendiente
- **Funcionalidad**: asignar una frase a varios perfumes respeta el máximo de 3 e informa el resultado.
- **Visual?**: Sí
- **Governance**: MEDIO
- **Dependencias**: C-14, C-15
- **Bloqueos de cliente**: ninguno.
- **Dentro**:
  - Seleccionar una frase existente y varios perfumes.
  - Aplicar solo a los perfumes con menos de 3 frases.
  - Resumen "N actualizados, M excluidos por tener 3 frases".
  - Operación atómica e idempotente.
- **Fuera**: creación de frases (C-14), edición individual (C-17).
- **Criterios de aceptación**:
  - Correr la misma operación dos veces no duplica asignaciones.
  - Los perfumes con 3 frases no se modifican y se informan en el resumen.
  - Una falla a mitad no deja asignaciones parciales.
  - El trigger de C-02 sigue impidiendo una cuarta frase incluso por escritura directa.
- **Leer antes**:
  - `knowledge-base/06_funcionalidades.md` §US-021
  - `knowledge-base/05_reglas_de_negocio.md` §RN-ADM-09, RN-CAT-05
  - `knowledge-base/07_flujos_principales.md` §Flujo 7
  - `knowledge-base/04_modelo_de_datos.md` §perfume_frases
  - brief §5

### [C-19] `admin-numero-whatsapp`
- **Estado**: `[ ]` pendiente
- **Funcionalidad**: un número válido cambia el destino del próximo pedido sin redeploy.
- **Visual?**: Sí
- **Governance**: CRÍTICO
- **Dependencias**: C-12, C-13
- **Bloqueos de cliente**: ninguno.
- **Dentro**:
  - `/admin/configuracion` con el número actual visible y destacado.
  - Validación de solo dígitos con código de país.
  - Confirmación explícita antes de guardar.
  - Registro de `updated_at` y `updated_by`.
  - Aplicación inmediata al próximo pedido.
  - Carga del número real de Emi antes del lanzamiento.
- **Fuera**: múltiples destinatarios, historial de números, notificaciones.
- **Criterios de aceptación**:
  - Valores con `+`, espacios, guiones o letras se rechazan con el formato esperado.
  - Un número válido cambia el destino del siguiente link `wa.me` sin redeploy.
  - Queda registrado quién y cuándo cambió el número.
  - `anon` no puede escribir `settings`; el `CHECK` de base rechaza formatos inválidos.
- **Leer antes**:
  - `knowledge-base/06_funcionalidades.md` §US-023
  - `knowledge-base/05_reglas_de_negocio.md` §RN-CAR-08, RN-CAR-09, RN-ADM-03, RN-ADM-11, RN-ADM-12
  - `knowledge-base/07_flujos_principales.md` §Flujo 8
  - `knowledge-base/03_actores_y_roles.md` §Escenarios de abuso
  - brief §5 y §7

---

## FASE 4 — Ofertas

### [C-20] `ofertas`
- **Estado**: `[ ]` pendiente
- **Funcionalidad**: las ofertas vigentes aparecen en su sección y su precio se usa en todo el flujo.
- **Visual?**: Sí
- **Governance**: MEDIO
- **Dependencias**: C-12, C-16
- **Bloqueos de cliente**: **D-03 — bloqueo total**. **No bloquea C-22**: el despliegue puede ejecutarse con ofertas pendientes.
- **Dentro**:
  - Ruta `/ofertas` accesible desde la navegación.
  - Solo ofertas vigentes.
  - Distinción visual entre precio de lista y de oferta.
  - El precio de oferta se usa también en ficha, carrito y mensaje.
  - Marcar y desmarcar una oferta por presentación desde el panel.
- **Fuera**: combos y promociones 3x2 (brief §6), cupones, descuentos automáticos por porcentaje.
- **Criterios de aceptación**:
  - Solo aparecen ofertas vigentes.
  - El precio que muestran ficha, carrito y mensaje es el de oferta.
  - Una oferta vencida deja de mostrarse si se definió vencimiento.
  - El sistema rechaza un precio de oferta mayor o igual al de lista.
- **Leer antes**:
  - brief §5 (sección de ofertas, "acordado en concepto") y §11 (detalle por validar)
  - `knowledge-base/06_funcionalidades.md` §US-006
  - `knowledge-base/05_reglas_de_negocio.md` §RN-CAT-10, RN-PRE-05, RN-PRE-06, RN-PRE-07
  - `knowledge-base/04_modelo_de_datos.md` §presentaciones (ofertas)
  - `knowledge-base/10_preguntas_abiertas.md` §Q-02

---

## FASE 5 — Datos y producción

### [C-21] `importacion-planilla`
- **Estado**: `[ ]` pendiente
- **Funcionalidad**: importar una vez la planilla y dejar la base como única fuente.
- **Visual?**: No
- **Governance**: ALTO
- **Dependencias**: C-02, C-03 y **D-08** (lista unificada de acordes).
- **Bloqueos de cliente**: **D-08 — bloqueo total**.
- **Naturaleza**: **decisión de desarrollo del usuario**, NO requisito del brief. El brief §6 ubica la importación en fases posteriores; se incorpora acá como tarea operativa obligatoria y así debe quedar rotulada en el `propose` y en el `archive`.
- **Precedencia**: **C-22 no puede empezar sin C-21 ejecutada y verificada.**
- **Dentro**:
  - Trabajar sobre una copia descargada de la planilla (sin acceso a OneDrive/Drive).
  - Limpiar nombres, precios, marcas y familias olfativas.
  - Unificar acordes equivalentes según la lista aprobada (D-08).
  - Cargar líneas, marcas y acordes; luego los perfumes de la hoja Árabes con frasco y decants.
  - Reporte de registros importados, incompletos y descartados.
  - Revisión de una muestra por los dueños y marca de la planilla como obsoleta.
- **Fuera**: sincronización continua, integración con Drive/OneDrive, importación de imágenes no provistas, importación de Diseñador y Nicho si aún no tienen datos validados.
- **Criterios de aceptación**:
  - El proceso importa N registros e informa cuántos quedaron importados y cuántos incompletos.
  - Los registros con datos faltantes se reportan, **no se completan con valores inventados**.
  - Los acordes equivalentes quedan unificados según la lista aprobada.
  - La planilla queda marcada como obsoleta y la base es la única fuente.
  - Al terminar, el catálogo público muestra los perfumes importados con su frasco, precio y stock.
- **Leer antes**:
  - `knowledge-base/07_flujos_principales.md` §Flujo 9
  - `knowledge-base/06_funcionalidades.md` §US-024
  - `knowledge-base/05_reglas_de_negocio.md` §RN-DAT-01 a RN-DAT-06
  - `knowledge-base/04_modelo_de_datos.md` §Seed data inicial
  - `knowledge-base/10_preguntas_abiertas.md` §IN-03
  - brief §9 (copia descargada, sin acceso a OneDrive/Drive)

### [C-22] `despliegue-produccion`
- **Estado**: `[ ]` pendiente
- **Funcionalidad**: el dominio sirve el catálogo y un pedido de prueba llega al WhatsApp configurado.
- **Visual?**: No (usa la identidad confirmada, `design-system` revisión 2; el logo sigue provisional y se reemplaza cuando exista el archivo real).
- **Governance**: ALTO
- **Dependencias**: todas las del MVP + **C-21 con precedencia dura**.
- **Bloqueos de cliente**: D-07 (identidad final del lanzamiento); D-05 (contenido fotográfico).
- **Dentro**:
  - Build estático de Astro, hosting gratuito y dominio propio.
  - Variables de entorno de producción.
  - Verificación de RLS contra el proyecto real y **re-verificación de que el registro público está deshabilitado**.
  - `sitemap.xml`, `robots.txt` y metadatos.
  - Checklist de keep-alive del free tier y de revisión del número de WhatsApp.
  - Carga del número real de Emi desde C-19.
- **Fuera**: staging pago, monitoreo pago, CI/CD complejo, analítica con datos personales.
- **Criterios de aceptación**:
  - El dominio propio sirve el catálogo.
  - Un pedido de prueba genera y abre el link correcto al WhatsApp configurado.
  - Un intento de escritura con `anon` en producción falla en todas las tablas.
  - Un `signUp` anónimo falla en producción.
  - El catálogo carga en móvil 4G sin errores de consola ni requests fallidos.
  - **C-21 está ejecutada, verificada y la planilla marcada como obsoleta.**
- **Leer antes**:
  - `knowledge-base/08_arquitectura_propuesta.md` §Despliegue, §Performance y SEO, §Riesgos de infraestructura
  - `knowledge-base/10_preguntas_abiertas.md` §IN-07
  - `design-system/README.md` §7 (aprobación) y §8 (reemplazos)
  - brief §8 y §9

---

## 6. Definiciones pendientes del cliente

> Ninguna se resuelve en este documento. `total` = no se implementa sin respuesta; `parcial` = se puede construir el mecanismo, no cerrar UI/aceptación.

| # | Tema | Qué falta decidir | Bloquea |
|---|---|---|---|
| **D-02** | Decants | ¿Integrados en la ficha, en sección aparte o en ambas? (brief §5, §11) | **C-09 — total** |
| **D-03** | Ofertas | ¿Precio anterior tachado? ¿Con vencimiento o sin él? ¿Aplican a decants? (brief §5, §11) | **C-20 — total**. No bloquea C-22 |
| **D-04** | Login del admin | ¿Usuario genérico o email personal? (brief §5, §11) | C-13 — parcial |
| **D-05** | Fotos | Origen y calidad, quién las sube **y alojamiento de imágenes** (absorbe el antiguo T-02) (brief §10, §11) | C-15 y C-16 — parcial; C-22 — contenido |
| **D-06** | Plazos de encargo | ¿Se informan en la página y con qué texto? (brief §11) | Ninguna |
| **D-07** | Colores y logo | **Paleta e identidad resueltas (2026-11-11):** morado `#30004B`, naranja `#FEBD59`, naranja claro `#FFDEAB`, DynaPuff + Nunito. Falta el **archivo de logo real** (hoy placeholder). | C-22 — la paleta ya no bloquea; el logo pendiente es contenido |
| **D-08** | Lista unificada de acordes | Aprobación de la lista y de la unificación de equivalentes (brief §11) | **C-21 — total**; C-10 — parcial |
| **D-10** | Formato del mensaje de WhatsApp | ¿Separa compra y encargo? ¿Qué campos por ítem? ¿Copy final? (brief §5, §7) | C-12 — parcial |

**No son definiciones pendientes**: D-01, la **paleta de D-07** y D-09 están resueltas (§7). Del D-07 solo queda pendiente el archivo de logo real.

**Dato operativo (no definición de producto)**: el número inicial de WhatsApp se siembra como **placeholder válido** en C-03 y se reemplaza por el real desde C-19 antes del lanzamiento.

---

## 7. Decisiones técnicas resueltas

| # | Decisión | Consecuencia |
|---|---|---|
| **T-01** | Stack: **Astro + islas React + Supabase** | C-01 deja de estar bloqueado. La salida es estática; la hidratación es por islas. |
| **D-01** | La tarjeta muestra el **precio del frasco sellado**; decants y precios se ven en la ficha | El alta exige al menos un frasco sellado con precio. No bloquea el esquema. |
| **D-09** | Género **selección única**; acordes **OR**, **sin tope** de selección | C-07 y C-10 quedan sin bloqueo de semántica. |
| **D-07** | **Identidad visual confirmada por los clientes (2026-11-11)**: pop urbano, morado `#30004B` + naranja `#FEBD59` + naranja claro `#FFDEAB`, DynaPuff + Nunito, sombras duras | `design-system` revisión 2; C-01 y C-22 desbloqueados en lo visual. El logo real sigue pendiente (placeholder). |
| **T-02** | **Eliminado**: el alojamiento de imágenes queda dentro de **D-05** | No existe como decisión separada. |
| **—** | **Eliminación de `activo`/`activa`** en perfumes, líneas, marcas y frases | No hay estado publicado/despublicado. Para retirar un perfume hay que borrarlo (ver R-05). |
| **—** | **Eliminación de `presentaciones.disponible`** | Un solo concepto de visibilidad. No se puede ocultar una presentación sin borrarla. |

---

## 8. Contradicciones KB ↔ brief

> La KB tiene seis desviaciones respecto del brief. Este documento aplica el brief y las registra; **la KB queda pendiente de sincronizar** y no se edita en esta fase.

| # | Documento | Dice | Aplicado |
|---|---|---|---|
| 1 | KB `01` / `06` §US-024 · brief §6 | La importación desde la planilla es fase posterior | **C-21 en el plan**, rotulada como **decisión de desarrollo del usuario** y obligatoria antes de C-22. El brief sigue mandando como fuente. |
| 2 | KB `04` §117 y M-3 · `06` §US-001/003/004/008 | Borrado lógico con `activo` y catálogo solo de publicados | **Se elimina el estado publicado/`activo`**; los criterios hablan de "todos los perfumes cargados". KB pendiente de sincronizar. |
| 3 | KB `06` §US-010 | Buscador por nombre en v1 | **Fuera**: no está en el brief §5. |
| 4 | KB `06` §US-016 | Recuperación de contraseña | **Fuera**: no está en el brief. Riesgo operativo asumido (R-06). |
| 5 | KB `04` §117-118 · `03` §49 | Campo `destacado` y home con destacados | **Fuera**: el brief no pide home con destacados. La entrada es el catálogo. |
| 6 | KB `04` §presentaciones | Columnas completas de oferta | **Condicionadas a D-03**; el brief solo acuerda la sección "en concepto". |

**Nota de mockup**: `design-system/components.html` incluye un **buscador en la cabecera** que no está en el brief. No se implementa; en el mockup de C-04 se decide explícitamente si se retira de la cabecera.

---

## 9. Fuera del MVP — [Propuesto]

Sin change. No se implementan en esta fase.

| Ítem | Origen | Nota |
|---|---|---|
| Despublicar / reactivar un perfume | KB `06` US-019, `04` §117, M-3 | Eliminado junto con el estado `activo`. Retirar un perfume implica borrarlo (ver R-05). |
| Renombrar y desactivar taxonomías | KB `06` US-020 (parcial) | C-14 solo crea marcas, acordes y frases. |
| Cuestionario de asesoramiento | brief §6 | Fase posterior. |
| Ficha detallada con notas y barras de acordes | brief §6 | Fase posterior; requiere campos que el modelo no tiene. |
| Combos y promociones tipo 3x2 | brief §6 | Fase posterior; choca con el precio por presentación. |
| Buscador por nombre | KB US-010, no brief | Fuera del MVP. |
| Recuperación de contraseña autogestionada | KB US-016, no brief | Fuera del MVP; se documenta el reseteo manual en C-22. |

---

## 10. Riesgos de secuenciación

| # | Riesgo | Impacto | Mitigación |
|---|---|---|---|
| **R-01** | **D-08 sin resolver bloquea C-21**, y C-21 es obligatoria antes del deploy | El lanzamiento queda bloqueado por una tarea que no es del brief | Cerrar la lista de acordes antes de GATE 1. Es la primera definición a destrabar. |
| **R-02** | **La importación no está lista antes del despliegue**: planilla sucia, precios faltantes o corrida incompleta | C-22 no puede ejecutarse; el corte es irreversible y la planilla queda fuera de uso | Reporte de importados/incompletos como criterio bloqueante; revisión de una muestra antes de marcar la planilla como obsoleta. |
| **R-03** | **D-10 retrasa el mensaje de WhatsApp** (C-12 está en el camino crítico) | Frena el flujo central y, por arrastre, el despliegue | Validar copy y separación compra/encargo con los dueños antes de GATE 8. |
| **R-04** | **D-02 sin resolver deja los decants fuera del lanzamiento** (C-09 no bloquea C-22) | El MVP sale con frascos y sin decants, que son "acordado en concepto" §5 | Aceptarlo explícitamente o cerrar D-02 antes de GATE 6. |
| **R-05** | **Sin estado publicado, no hay forma de retirar un perfume sin borrarlo** | Se pierde el historial de datos cargados; contradice la recomendación de borrado lógico de la KB | Documentar el procedimiento operativo en C-22. Si molesta, es una decisión futura, no un cambio silencioso. |
| **R-06** | **D-05 (fotos + alojamiento) sin resolver** | El alta funciona con placeholder, pero el catálogo real se ve incompleto | Alta con placeholder; cerrar D-05 antes de la carga real de C-21. |
| **R-07** | **RLS o registro público mal configurados** | Con `anon key` pública, el panel queda expuesto | Criterios bloqueantes en C-02 y C-13; re-verificación obligatoria en C-22. |
| **R-08** | **Ofertas (D-03) pendientes al desplegar** | El sitio sale sin la sección acordada "en concepto" | Aceptado por diseño: C-22 puede ejecutarse con C-20 pendiente, sin dejar el ítem de navegación vacío. |
| **R-09** | **Pausa del free tier** | El catálogo puede quedar offline sin aviso | Checklist de keep-alive en C-22; riesgo aceptado por restricción de costo. |

---

## 11. Governance resumido

| Nivel | Changes |
|---|---|
| **CRÍTICO** | C-02, C-12, C-13, C-19 |
| **ALTO** | C-16, C-21, C-22 |
| **MEDIO** | C-03, C-08, C-11, C-14, C-15, C-17, C-18, C-20 |
| **BAJO** | C-01, C-04, C-05, C-06, C-07, C-09, C-10 |

---

## 12. Resumen

| Métrica | Valor |
|---|---|
| Changes | **22** |
| Fases | 6 (Fundación, Catálogo, Pedido, Panel, Ofertas, Datos y producción) |
| Camino crítico | **9** (`C-01 → C-02 → C-03 → C-04 → C-08 → C-11 → C-12 → C-21 → C-22`) |
| GATES | **12** (GATE 0 a GATE 11) |
| Changes con UI (mockup obligatorio) | **18** |
| Bloqueados totales por cliente | C-09 (D-02), C-20 (D-03), C-21 (D-08) |
| Primer change recomendado | **C-01 `fundacion-proyecto`** |

Para arrancar: `/opsx:propose C-01-fundacion-proyecto`
