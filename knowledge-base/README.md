# Oloroso Pit — Base de Conocimiento

Base de conocimiento del catálogo web de **Oloroso Pit**, generada por ingesta silenciosa de los documentos del proyecto (`kb-creator`, Mode A).

- **Fecha de generación**: 2026-11-05
- **Fuente principal**: `docs/discovery/brief-clientes.md` (brief de clientes v5) — **tiene prioridad sobre cualquier otro documento**
- **Fuentes secundarias**: `docs/discovery/informe-discovery.md` y `discovery/sources/*.md` (5 competidores)
- **Estado de datos**: `.active-orchestrator-state.json` → sección `discovery` (producto/mercado)

> Esta KB **no reemplaza** los documentos fuente: los estructura y los hace navegables. `docs/` y `discovery/` se mantienen intactos.

## Índice de archivos

| Archivo | Contenido |
|---|---|
| [01_vision_y_objetivos.md](01_vision_y_objetivos.md) | Propósito, objetivos por actor, alcance del MVP, fuera de alcance, métricas propuestas |
| [02_descripcion_general.md](02_descripcion_general.md) | Stack tentativo, arquitectura general, integración con WhatsApp, superficie de datos, contexto competitivo |
| [03_actores_y_roles.md](03_actores_y_roles.md) | Actores, matriz RBAC (`anon` / `authenticated`), rutas públicas y protegidas, escenarios de abuso |
| [04_modelo_de_datos.md](04_modelo_de_datos.md) | Dominios, ERD, entidades con atributos y constraints, seed, entidades ausentes a propósito |
| [05_reglas_de_negocio.md](05_reglas_de_negocio.md) | Reglas codificadas `RN-XX-NN` con estado [Acordado]/[Propuesto], excepciones globales |
| [06_funcionalidades.md](06_funcionalidades.md) | 24 historias de usuario en 8 épicas, con criterios de aceptación y reglas vinculadas |
| [07_flujos_principales.md](07_flujos_principales.md) | 9 flujos extremo a extremo, con diagramas, casos de error y criticidad |
| [08_arquitectura_propuesta.md](08_arquitectura_propuesta.md) | Patrones, estructura de directorios, seguridad/RLS, variables de entorno, despliegue, testing |
| [09_decisiones_y_supuestos.md](09_decisiones_y_supuestos.md) | 10 decisiones documentadas (`DD`), 12 supuestos inferidos (`SU`), decisiones pendientes |
| [10_preguntas_abiertas.md](10_preguntas_abiertas.md) | 7 inconsistencias (`IN`), 22 preguntas priorizadas, incertidumbres de discovery |

## Resumen ejecutivo

Oloroso Pit vende perfumes importados en Argentina, mayormente **por encargo** y con poco stock propio, hoy por Instagram y WhatsApp con una planilla como catálogo. El proyecto construye un **catálogo web propio** con filtros por línea, marca, género y acordes olfativos, frases de asesoramiento ("ideal para...") y un carrito que genera un **mensaje de WhatsApp** con el pedido separado en compra y encargo.

Tres restricciones mandan sobre todo el diseño: **sin pasarela de pagos**, **sin almacenar datos de clientes** y **sin infraestructura paga**. El stack propuesto (frontend estático + Supabase free tier) es todavía **tentativo** y debe confirmarse antes de empezar el frontend.

Lo que hay que resolver antes de codificar: cómo se relaciona el precio con las presentaciones (IN-01), la lista unificada de acordes (IN-03) y el detalle de las ofertas (Q-02).

## Leyenda de estados

Cada requisito conserva el estado del brief de clientes:

| Etiqueta | Significado |
|---|---|
| **[Acordado]** | Validado por los dueños |
| **[Acordado, a confirmar]** | Acordado pero con un punto pendiente de confirmación |
| **[Acordado en concepto]** | La idea está acordada; el detalle no |
| **[Propuesto]** | Propuesto por el desarrollador, pendiente de validación |
| **[Derivada]** | Consecuencia técnica de otra regla acordada |
| **por definir** | Sin decisión tomada; registrado en `10_preguntas_abiertas.md` |

**Regla de lectura**: no implementar un requisito `[Propuesto]` como si estuviera acordado. Si hay que hacerlo para avanzar, registrar la decisión en `09_decisiones_y_supuestos.md`.

## Quick start para desarrolladores

1. **Entender el negocio** → [01](01_vision_y_objetivos.md), [03](03_actores_y_roles.md)
2. **Entender las restricciones duras** → [01](01_vision_y_objetivos.md#fuera-de-alcance-v1), [05](05_reglas_de_negocio.md#excepciones-globales)
3. **Entender los datos** → [04](04_modelo_de_datos.md)
4. **Entender las reglas** → [05](05_reglas_de_negocio.md)
5. **Entender la arquitectura** → [02](02_descripcion_general.md), [08](08_arquitectura_propuesta.md)
6. **Implementar** → [07](07_flujos_principales.md), [06](06_funcionalidades.md)
7. **Antes de codificar** → [10](10_preguntas_abiertas.md) y [09](09_decisiones_y_supuestos.md)

### Orden de lectura sugerido por rol

| Rol | Orden |
|---|---|
| Producto / dueños | 01 → 06 → 10 |
| Frontend | 01 → 04 → 05 → 07 → 08 → 06 |
| Backend / datos (Supabase) | 04 → 05 → 08 → 03 |
| Diseño UI | 01 → 06 → 07 (flujos 1–4) → 10 (Q-01, Q-02, Q-07) |
| QA | 06 (criterios de aceptación) → 05 → 07 (casos de error) |

## Las tres restricciones que no se negocian

1. **No hay pagos online.** Ni checkout, ni pasarela, ni link de pago. El pedido termina en WhatsApp. (`RN-CAR-10`, `RN-GLB-01`)
2. **No se guardan datos de clientes.** Ni cuentas, ni teléfonos, ni historial. El carrito vive en el navegador. (`RN-ADM-05`, `RN-GLB-02`, `RN-CAR-11`)
3. **No hay presupuesto.** Solo free tier. Si algo requiere pagar, se descarta o se busca alternativa. (`RN-GLB-03`)

## Naturaleza de esta KB

- **Modo de generación**: Mode A (ingesta silenciosa). No se hicieron preguntas durante la generación.
- **Qué significa**: todo lo que no estaba en las fuentes se marca como `[Propuesto]`, `[Derivada]` o queda como pregunta abierta. **No se inventaron datos de negocio** (precios, marcas, acordes, cantidad de perfumes).
- **Qué falta**: la identidad visual (colores, tipografía) se define al empezar el frontend; la lista de acordes requiere aprobación de los dueños; el stack requiere confirmación.
- **Qué NO es**: no es una especificación de implementación cerrada. Es la base para escribir los cambios de OpenSpec.

## Cómo mantenerla

| Cuándo | Qué actualizar |
|---|---|
| Se responde una pregunta abierta | Mover la decisión a `09_decisiones_y_supuestos.md` y quitarla de `10_preguntas_abiertas.md` |
| Cambia el alcance | `01` (alcance), `06` (historias), `09` (DD nueva) |
| Cambia el stack | `02`, `08`, y revisar `05` (reglas de seguridad) |
| Se aprueba la lista de acordes | `04` (seed) y `10` (IN-03) |
| Cambia una regla de negocio | `05` (con su código) y las historias vinculadas en `06` |
| Se agrega una funcionalidad | `06` (nueva US), `07` (flujo si es nuevo), `05` (reglas si aplica) |

## Fuentes utilizadas

| Fuente | Rol | Fecha |
|---|---|---|
| `docs/discovery/brief-clientes.md` | **Prioridad**: requisitos del cliente con estados | 2026-11-05 |
| `docs/discovery/informe-discovery.md` | Análisis competitivo consolidado y recomendaciones | 2026-11-05 |
| `discovery/sources/jft-perfumes.md` | Competidor: precedente directo de catálogo + WhatsApp | 2026-11-05 |
| `discovery/sources/vesper-perfumes.md` | Competidor: ficha detallada, ofertas, decants | 2026-11-05 |
| `discovery/sources/parfumerie.md` | Competidor: catálogo amplio, retiro en sucursal | 2026-11-05 |
| `discovery/sources/perfumerias-rouge.md` | Competidor: filtros granulares, ficha de notas | 2026-11-05 |
| `discovery/sources/juleriaque.md` | Competidor: selector de presentación con precio dinámico | 2026-11-05 |
| `.active-orchestrator-state.json` (`discovery`) | Contexto de producto/mercado ya relevado | 2026-11-05 |

**Advertencia sobre los competidores**: varias celdas del informe dicen "No evidenciado", lo que significa "no se pudo verificar públicamente", **no** "la funcionalidad no existe". No usar esa ausencia como argumento de diferenciación.
