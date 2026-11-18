# Proposal — C-03 Datos base: líneas y WhatsApp

## Why

C-02 dejó el esquema y la política de acceso listos, pero **la base está vacía**: no existe ninguna línea comercial ni la fila de configuración con el número que recibe los pedidos. Sin las tres líneas, C-04 y C-05 no tienen en qué agrupar el catálogo; sin un destino válido, C-12 no puede construir el link `wa.me`. La lectura empírica de filas reales con la clave `anon` —que C-02 solo pudo verificar estructuralmente— también queda pendiente hasta que haya datos que leer.

C-03 carga ese mínimo operativo y fija el contrato público del número, antes de que cualquier change de catálogo empiece a consultarlo.

## What Changes

- Se agrega **una migración versionada** `supabase/migrations/0003_seed.sql` con el **dato base** del catálogo:
  - las tres líneas comerciales con su orden de navegación: Árabes (`arabes`, 1), Diseñador (`disenador`, 2), Nicho (`nicho`, 3);
  - la **fila única de `settings`** (`id = 1`) con un **número placeholder válido** que cumple el `CHECK` de C-02 (`^[0-9]{10,15}$`).
- Los `INSERT` del seed son **idempotentes** (`ON CONFLICT DO NOTHING`): re-ejecutar la migración —o aplicarla dos veces desde el SQL Editor— no duplica líneas y **no pisa el número real** que C-19 cargue más adelante.
- Se crea la **vista pública de configuración** `public.configuracion_publica` **`WITH (security_invoker = true)`**, que expone únicamente `whatsapp_destino`, con `SELECT` para `anon` y `authenticated`. Se mantiene el grant por columna de C-02, así que el número se puede leer por la vista o con `select('whatsapp_destino')`.
- Se agrega un **script de verificación** `npm run verify:seed` que corre contra el proyecto real **solo con la clave `anon`**: comprueba las tres líneas con su orden, la forma de la vista (una sola columna), el formato del número, el rechazo de escrituras anónimas y la lectura real de filas cargadas (el criterio que C-02 dejó pendiente).
- Se **regeneran los tipos** TypeScript (`npm run db:types`) para incluir la vista, y se documenta el seed, el placeholder y la verificación en `README.md`.

**Fuera de alcance**: marcas, perfumes, presentaciones, acordes y frases (no hay datos aprobados; la carga real es C-21), el número real de Emi (se carga desde C-19 antes del lanzamiento) y cualquier UI o consulta del catálogo (C-04 en adelante).

## Capabilities

### New Capabilities

- `catalog-baseline`: el estado mínimo con el que el catálogo puede operar —las tres líneas comerciales con su orden de navegación y la configuración operativa inicial—, incluida la regla de que el seed no duplica filas ni pisa un número ya configurado.

### Modified Capabilities

- `catalog-access-policy`: se agrega el contrato de la **vista pública de configuración**, que expone solo el número de WhatsApp y ninguna columna interna de `settings`, ahora y ante columnas futuras.

## Impact

- **Archivos nuevos**: `supabase/migrations/0003_seed.sql`, `scripts/verify-seed.mjs`.
- **Archivos modificados**: `src/lib/supabase/database.types.ts` (regenerado con la vista), `package.json` (script `verify:seed`), `README.md` (§Base de datos: seed, vista, placeholder y verificación).
- **Base de datos**: es la primera escritura de datos sobre el proyecto en la nube. El seed es aditivo e idempotente; la vista es un objeto nuevo de solo lectura. No hay cambios de esquema en tablas ni en políticas existentes.
- **Configuración**: no se agregan variables de entorno. La verificación usa las dos `PUBLIC_*` que ya existen en `.env`.
- **Consumidores**: C-04 (catálogo y navegación por línea), C-05 (líneas con perfumes), C-12 (destino del pedido) y C-19 (cambio del número real). C-03 deja el contrato de lectura listo para ellos.
- **Riesgo principal**: se escribe en la base compartida sin entorno local. Mitigación: `INSERT … ON CONFLICT DO NOTHING`, revisión con `db push --dry-run`, verificación con la clave `anon` antes de dar el change por cerrado y registro explícito de que el número es un placeholder reemplazable.
