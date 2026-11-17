# Proposal — C-02 Esquema de datos y RLS

## Why

El proyecto ya compila, tiene shell visual y un cliente Supabase que lee la clave `anon` pública desde el navegador, pero **la base de datos no existe**: no hay tablas, constraints ni políticas de acceso. Sin esquema no se puede construir catálogo (C-04), filtros (C-08) ni panel (C-13); y sin RLS esa clave pública que ya viaja al navegador permitiría escribir en el catálogo.

C-02 cierra el modelo de datos y la política de acceso de una sola vez, antes de que cualquier change empiece a consultar tablas. Es el change de **governance CRÍTICO** del roadmap: lo que quede mal acá se propaga a todo lo demás y no se detecta mirando la UI.

## What Changes

- Se agregan **dos migraciones SQL versionadas** en `supabase/migrations/`: `0001_init.sql` (esquema) y `0002_rls.sql` (permisos y políticas).
- Se crean **nueve tablas**: `lineas`, `marcas`, `perfumes`, `presentaciones`, `acordes`, `perfume_acordes`, `frases`, `perfume_frases` y `settings`.
- **No hay estado de publicación**: no se crean columnas `activo`/`activa` ni `presentaciones.disponible`. Toda fila cargada es visible para el público; la única forma de sacar un perfume del catálogo es borrarlo (y el borrado queda restringido por las FKs).
- Se codifican los **constraints** del modelo: `slug` único, `genero` restringido a `masculino`/`femenino`/`unisex`, FKs de línea y marca con `ON DELETE RESTRICT`, `precio_ars >= 0`, `stock >= 0`, `precio_oferta_ars < precio_ars` y unicidad `(perfume_id, tipo, volumen_ml)`.
- Se agrega un **trigger que rechaza una cuarta frase** para un mismo perfume en `perfume_frases`.
- `settings` queda como **fila única** (`CHECK (id = 1)`) con `CHECK (whatsapp_destino ~ '^[0-9]{10,15}$')`; el público lee **solo el número**, nunca el resto de las columnas.
- **RLS en las nueve tablas**: `anon` solo `SELECT`; `authenticated` lee y escribe. Los permisos se otorgan explícitamente en la base, no se confía en la configuración del dashboard.
- Se generan los **tipos TypeScript de las filas** desde el proyecto, para que el borde de datos no use `any` (deuda que C-01 dejó explícitamente para este change).
- Se agrega un **script de verificación de seguridad** que corre contra el proyecto real con la clave `anon` y con una ruta autenticada, y que **no deja datos residuales**.
- **Cambio de entorno (decisión del usuario)**: no se usa Supabase local ni Docker. Las migraciones se aplican al **proyecto de Supabase en la nube (plan Free)** con `supabase link` + `supabase db push`, o pegándolas en el SQL Editor como alternativa documentada. En consecuencia, el criterio de aceptación de `CHANGES.md` §C-02 «`supabase db reset` aplica `0001` y `0002` sin error» se reemplaza por: **«las migraciones `0001_init.sql` y `0002_rls.sql` se aplican sin error sobre el proyecto de Supabase en la nube»**.

## Capabilities

### New Capabilities

- `catalog-schema`: el modelo de datos del catálogo como contrato de comportamiento —qué entidades existen, qué valores admite cada atributo, qué combinaciones rechaza la base (precios, stock, ofertas, formatos duplicados) y cuántas frases puede tener un perfume.
- `catalog-access-policy`: quién puede leer y escribir cada tabla del catálogo desde la API —lectura pública anónima de todo el catálogo, escritura solo autenticada, y exposición pública de `settings` limitada al número de WhatsApp.

### Modified Capabilities

Ninguna. `supabase-browser-client` no cambia: sigue leyendo solo `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY`. Esta política es justamente lo que vuelve segura esa clave pública, y `app-shell` y `design-tokens` son ajenos al cambio.

## Impact

- **Archivos nuevos**: `supabase/config.toml`, `supabase/migrations/0001_init.sql`, `supabase/migrations/0002_rls.sql`, `src/lib/supabase/database.types.ts` (generado), script de verificación de seguridad y su documentación de uso en `README.md`.
- **Dependencias**: Supabase CLI como dependencia de desarrollo con versión fijada y lockfile commiteado. No se agrega ningún runtime nuevo al sitio.
- **Configuración**: `.env.example` no cambia (sigue con las dos variables `PUBLIC_*`). La cadena de conexión directa y el password de la base se usan solo en local, nunca se versionan.
- **Base de datos**: proyecto Supabase en la nube ya existente; es el primer DDL que se le aplica. `0001` es puramente aditivo y `0002` solo agrega RLS, grants y políticas, así que reintentar es seguro y el estado por defecto es denegar.
- **Consumidores**: C-03 (seed de líneas y número), C-04/C-05/C-06/C-07/C-08 (catálogo y filtros), C-11 (carrito y mensaje), C-13/C-14/C-15/C-16 (panel) y C-19 (configuración) leen o escriben estas tablas; C-02 define el contrato que todos usan.
- **Riesgo principal**: aplicar DDL sobre una base compartida en la nube no tiene el botón de «reset» de un entorno local. Mitigación: migraciones aditivas, revisión previa con `--dry-run`, respaldo/export antes de aplicar y verificación criterio por criterio en el mismo change.
