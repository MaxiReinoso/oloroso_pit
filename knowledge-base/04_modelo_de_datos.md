# Modelo de Datos

## Principios

1. **El catálogo es la única fuente de verdad** una vez importada la planilla. La planilla se importa una sola vez y deja de usarse. **[Propuesto]**
2. **Las taxonomías son datos, no código**: líneas, marcas, acordes y frases se editan desde el panel. **[Acordado]**
3. **El pedido no es una entidad**. No hay tablas de órdenes, clientes ni carritos persistidos. El pedido existe solo como mensaje de WhatsApp.
4. **Precio y stock viven en la presentación**, no en el perfume. **[Propuesto]** — este punto es el que resuelve decants y frascos con precio y disponibilidad propios. Tiene una tensión con el requisito "catálogo con precio" a nivel perfume; se registra en `10_preguntas_abiertas.md` (IN-01).
5. **Nada se borra físicamente** si se puede desactivar. Los dueños necesitan poder sacar un perfume del catálogo sin perder el historial de datos cargados. **[Propuesto]**

## Dominios

| Dominio | Descripción | Entidades |
|---|---|---|
| Catálogo | Productos y su clasificación comercial | `perfumes`, `lineas`, `marcas`, `presentaciones` |
| Asesoramiento | Taxonomías que ayudan a elegir | `acordes`, `perfume_acordes`, `frases`, `perfume_frases` |
| Comercial | Precio, stock y ofertas | `presentaciones` (precio, stock, oferta) |
| Configuración | Parámetros operativos del sitio | `settings` |
| (Ausente a propósito) | Pedidos y clientes | — |

## ERD

```
┌──────────┐        ┌──────────────┐        ┌──────────┐
│  lineas  │1      *│   perfumes   │*      1│  marcas  │
│──────────│────────│──────────────│────────│──────────│
│ id       │        │ id           │        │ id       │
│ nombre   │        │ nombre       │        │ nombre   │
│ slug     │        │ slug         │        │ slug     │
│ orden    │        │ linea_id  FK │        │ activa   │
│ activa   │        │ marca_id  FK │        └──────────┘
└──────────┘        │ genero       │
                    │ descripcion  │
                    │ imagen_url   │
                    │ activo       │
                    └───┬──────┬───┘
                       1│      │1
                        │      │
              *         │      │        *
        ┌───────────────▼──┐  ┌▼─────────────────┐
        │  presentaciones  │  │ perfume_acordes  │
        │──────────────────│  │──────────────────│
        │ id               │  │ perfume_id  FK   │
        │ perfume_id   FK  │  │ acorde_id   FK   │
        │ tipo             │  └────────┬─────────┘
        │ volumen_ml       │           │*
        │ precio_ars       │         1 │
        │ stock            │  ┌────────▼─────────┐
        │ disponible       │  │     acordes      │
        │ precio_oferta    │  │──────────────────│
        │ oferta_desde     │  │ id, nombre, slug │
        │ oferta_hasta     │  └──────────────────┘
        └──────────────────┘
                       1│
        ┌───────────────▼──┐  ┌─────────────────┐
        │  perfume_frases  │* │     frases      │
        │──────────────────│──│─────────────────│
        │ perfume_id  FK   │1 │ id, texto       │
        │ frase_id    FK   │  │ activa          │
        │ orden            │  └─────────────────┘
        └──────────────────┘

┌───────────────────────────────┐
│           settings            │
│───────────────────────────────│
│ id (singleton = 1)            │
│ whatsapp_destino              │
│ updated_at, updated_by        │
└───────────────────────────────┘
```

## Entidades

### `lineas`
Líneas comerciales del catálogo (Árabes, Diseñador, Nicho).

| Atributo | Tipo | Nulo | Descripción |
|---|---|---|---|
| `id` | `uuid` / `bigserial` | no | PK |
| `nombre` | `text` | no | "Árabes", "Diseñador", "Nicho" |
| `slug` | `text` | no | Identificador para URL (`arabes`, `disenador`, `nicho`) |
| `orden` | `int` | no | Orden de navegación |
| `activa` | `boolean` | no | Default `true` |

- **Relaciones**: 1 línea → N perfumes.
- **Constraints**: `slug` único. `nombre` único (case-insensitive).
- **Índices**: `(activa, orden)`.
- **Regla asociada**: una línea sin perfumes publicados no aparece en la navegación (RN-CAT-02).

### `marcas`
Marcas de perfume. Se crean desde el panel al dar de alta un perfume. **[Propuesto]**

| Atributo | Tipo | Nulo | Descripción |
|---|---|---|---|
| `id` | `uuid` / `bigserial` | no | PK |
| `nombre` | `text` | no | Nombre de la marca |
| `slug` | `text` | no | Para URL de filtro |
| `activa` | `boolean` | no | Default `true` |

- **Relaciones**: 1 marca → N perfumes.
- **Constraints**: `slug` único; `nombre` único (case-insensitive) para evitar duplicados tipo "Lattafa" / "lattafa".
- **Índices**: `slug`, `nombre`.

### `perfumes`
Unidad de catálogo que ve el cliente.

| Atributo | Tipo | Nulo | Descripción |
|---|---|---|---|
| `id` | `uuid` | no | PK |
| `nombre` | `text` | no | Nombre comercial |
| `slug` | `text` | no | URL amigable, único |
| `linea_id` | `uuid` | no | FK → `lineas` |
| `marca_id` | `uuid` | no | FK → `marcas` |
| `genero` | `enum` | no | `masculino` / `femenino` / `unisex` |
| `descripcion` | `text` | sí | Texto libre breve |
| `imagen_url` | `text` | sí | Imagen principal (o referencia a Storage) |
| `activo` | `boolean` | no | Default `true`; `false` lo saca del catálogo |
| `destacado` | `boolean` | no | Default `false`; para home (opcional) |
| `created_at` / `updated_at` | `timestamptz` | no | Auditoría mínima |

- **Relaciones**: N perfumes → 1 línea; N → 1 marca; 1 perfume → N presentaciones; 1 → N acordes (N:N); 1 → hasta 3 frases (N:N).
- **Constraints**: `slug` único; `genero` restringido al enum; `linea_id` y `marca_id` con `ON DELETE RESTRICT` (no se puede borrar una marca en uso).
- **Índices**: `(activo, linea_id)`, `(activo, marca_id)`, `(activo, genero)`, `slug`, búsqueda por texto en `nombre` si el buscador entra en v1.
- **Nota**: el precio **no** vive acá. Ver `presentaciones` e IN-01.

### `presentaciones`
Cada forma de compra de un perfume: frasco sellado, decant de 5 ml, decant de 10 ml.

| Atributo | Tipo | Nulo | Descripción |
|---|---|---|---|
| `id` | `uuid` | no | PK |
| `perfume_id` | `uuid` | no | FK → `perfumes` |
| `tipo` | `enum` | no | `frasco_sellado` / `decant` |
| `volumen_ml` | `int` | no | 100, 50, 5, 10, etc. |
| `precio_ars` | `numeric(12,2)` | no | Precio de lista en pesos |
| `stock` | `int` | no | Unidades disponibles; `0` = sin stock |
| `disponible` | `boolean` | no | Permite ocultar una presentación sin borrarla |
| `precio_oferta_ars` | `numeric(12,2)` | sí | Precio con descuento, si hay oferta |
| `oferta_desde` | `date` | sí | Inicio de vigencia |
| `oferta_hasta` | `date` | sí | Fin de vigencia (si no hay fecha, la oferta no vence) |
| `created_at` / `updated_at` | `timestamptz` | no | Auditoría |

- **Relaciones**: N presentaciones → 1 perfume.
- **Constraints**: `precio_ars >= 0`; `stock >= 0`; `precio_oferta_ars < precio_ars` cuando existe; `volumen_ml > 0`; unicidad `(perfume_id, tipo, volumen_ml)` para evitar duplicados del mismo formato.
- **Índices**: `(perfume_id, disponible)`, `(disponible, stock)`.
- **Ofertas**: el modelo de columnas de oferta es **[Propuesto]**. El brief acuerda la sección en concepto pero no el detalle (precio anterior tachado, vencimiento, si aplica a decants). Ver `10_preguntas_abiertas.md`.
- **Decants**: los precios acordados son 5 ml = $8.000 y 10 ml = $15.000, cargados como datos (no hardcodeados). **[Acordado en concepto]** Cada perfume puede sobrescribir el precio de sus decants, porque el modelo es por presentación.

### `acordes`
Familias olfativas normalizadas (amaderado, especiado, dulce, etc.).

| Atributo | Tipo | Nulo | Descripción |
|---|---|---|---|
| `id` | `uuid` | no | PK |
| `nombre` | `text` | no | Término unificado |
| `slug` | `text` | no | Para filtros |

- **Relaciones**: N:N con `perfumes` vía `perfume_acordes`.
- **Constraints**: `slug` único; `nombre` único (case-insensitive) para que "afrutado" y "frutal" no convivan como acordes distintos. **[Propuesto]**
- **Índices**: `slug`.
- **Pendiente**: la lista unificada de acordes no está aprobada. Es una tarea del desarrollador al importar la planilla (ver `10_preguntas_abiertas.md`). **No inventar el listado en el código**: se carga como seed tras la aprobación.

### `perfume_acordes`
Tabla puente N:N.

| Atributo | Tipo | Nulo |
|---|---|---|
| `perfume_id` | `uuid` | no |
| `acorde_id` | `uuid` | no |

- **PK compuesta**: `(perfume_id, acorde_id)`.
- **Constraints**: FKs con `ON DELETE CASCADE`.
- **Regla**: un perfume puede tener varios acordes; la planilla actual combina términos ("amaderado especiado"). **[Propuesto]**

### `frases`
Frases de asesoramiento tipo "ideal para...".

| Atributo | Tipo | Nulo | Descripción |
|---|---|---|---|
| `id` | `uuid` | no | PK |
| `texto` | `text` | no | Ej. "para citas o salir de noche" |
| `activa` | `boolean` | no | Default `true` |

- **Relaciones**: N:N con `perfumes` vía `perfume_frases`.
- **Constraints**: `texto` único.
- **Índices**: `activa`.

### `perfume_frases`
Tabla puente con orden de presentación.

| Atributo | Tipo | Nulo | Descripción |
|---|---|---|---|
| `perfume_id` | `uuid` | no | FK |
| `frase_id` | `uuid` | no | FK |
| `orden` | `int` | no | 1..3 para mostrar en ficha |

- **PK compuesta**: `(perfume_id, frase_id)`.
- **Constraints**: máximo **3 frases por perfume** (RN-CAT-05). Se puede enforcear con trigger o validar en la capa de aplicación; el trigger es más seguro porque el panel no es el único camino posible de escritura.
- **Índices**: `perfume_id`.

### `settings`
Configuración operativa. Una sola fila.

| Atributo | Tipo | Nulo | Descripción |
|---|---|---|---|
| `id` | `int` | no | PK, siempre `1` |
| `whatsapp_destino` | `text` | no | Solo dígitos con código de país; ej. `549...` |
| `updated_at` | `timestamptz` | no | — |
| `updated_by` | `uuid` | sí | FK → `auth.users` |

- **Constraints**: `CHECK (whatsapp_destino ~ '^[0-9]{10,15}$')`; `CHECK (id = 1)`.
- **Seguridad**: lectura pública **solo** de `whatsapp_destino`. Escritura solo autenticada. No guardar acá datos que no deban ser públicos.

### Entidades explícitamente ausentes

| Entidad | Por qué no existe |
|---|---|
| `clientes` / `usuarios` | No se almacenan datos de clientes (restricción del cliente). |
| `pedidos` / `ordenes` | El pedido es un mensaje de WhatsApp; no se persiste. |
| `carrito` (persistido) | El carrito vive en el navegador del cliente. |
| `pagos` / `transacciones` | Sin pasarela de pagos ni transacciones online. |
| `envios` | Sin gestión de envíos en v1. |

## Seed data inicial

| Tabla | Datos | Estado |
|---|---|---|
| `lineas` | Árabes, Diseñador, Nicho (con `orden` 1, 2, 3) | [Acordado]; solo Árabes con productos en el lanzamiento |
| `marcas` | Se cargan desde la planilla importada | [Propuesto] — depende del import |
| `perfumes` | Se cargan desde la planilla importada (hoja Árabes primero) | [Propuesto] |
| `presentaciones` | Frasco sellado por perfume; decants 5 ml ($8.000) y 10 ml ($15.000) | [Acordado en concepto] |
| `acordes` | Lista unificada pendiente de aprobación | **Bloqueado** — ver IN-03 |
| `frases` | Al menos las frases de ejemplo del brief ("para citas o salir de noche") | [Acordado] como concepto |
| `settings` | `whatsapp_destino` = número de Emi | [Acordado] |

**Datos mínimos para que el sitio no se vea vacío**: al menos un puñado de perfumes de la línea Árabes con imagen, precio y una presentación cargada. La cantidad exacta depende del import y no está definida.

## Decisiones de modelado a validar

| # | Decisión | Alternativa | Riesgo si se elige mal |
|---|---|---|---|
| M-1 | Precio y stock por presentación | Precio único en `perfumes` | Si los dueños esperan un precio por perfume, el panel se vuelve más complejo de operar |
| M-2 | Oferta como columnas en `presentaciones` | Tabla `ofertas` separada | Si las ofertas se combinan o tienen reglas propias, las columnas no alcanzan |
| M-3 | Borrado lógico (`activo`) | Borrado físico | Datos huérfanos o pérdida de información al reorganizar el catálogo |
| M-4 | Máximo 3 frases por trigger | Validación solo en frontend | Se puede romper la regla escribiendo directo a la base |
| M-5 | `whatsapp_destino` en `settings` | Variable de entorno con redeploy | Cambiar el número requeriría un deploy, algo que el brief quiere evitar |
