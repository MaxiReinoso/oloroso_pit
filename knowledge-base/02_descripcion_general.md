# Descripción General

## Resumen

Oloroso Pit es una **web app de catálogo** con dos superficies:

1. **Catálogo público**: navegación, filtros y armado de carrito. No requiere cuenta.
2. **Panel de administración**: CRUD de perfumes y taxonomías, con login. Solo para los dos dueños.

Entre ambas hay un límite duro: el pedido **sale del sitio** como mensaje de WhatsApp. No hay checkout, no hay órdenes persistidas y no se guardan datos del comprador.

## Stack tecnológico

**Estado: tentativo. Debe confirmarse antes de empezar el frontend.**

| Capa | Tecnología propuesta | Versión mínima | Estado |
|---|---|---|---|
| Frontend | Sitio estático (HTML/CSS/JS o framework con build estático: Astro, Vite + React, SvelteKit estático) | Por definir | [Propuesto] — la preferencia del cliente es "frontend estático" |
| Hosting frontend | Hosting estático gratuito (Netlify, Vercel, Cloudflare Pages, GitHub Pages) | — | [Propuesto] |
| Base de datos | Supabase (Postgres) — plan gratuito | Postgres 15 | [Propuesto] |
| Autenticación | Supabase Auth — plan gratuito | — | [Propuesto] |
| Storage de imágenes | Supabase Storage o carpeta local de assets | — | [Propuesto] / por definir |
| Dominio | Dominio propio ya disponible | — | [Acordado: el dominio existe] |
| Pasarela de pagos | **Ninguna** | — | **Restricción estricta del cliente** |
| Integración de pedidos | `wa.me` (deep link a WhatsApp) | — | [Acordado] |

**Por qué este stack encaja**: el cliente no tiene presupuesto y el equipo de desarrollo tiene hardware limitado. Un frontend estático + Supabase free tier evita servidor propio, build pesado y costos recurrentes, y cubre las dos necesidades reales (leer catálogo público, escribir desde un panel autenticado).

**Riesgos del stack que hay que validar antes de comprometerse**:

- **Límites del free tier de Supabase**: pausa de proyectos inactivos, cupo de ancho de banda y de filas/egress. Un catálogo con imágenes pesadas puede acercarse al límite de transferencia. Verificar los límites vigentes al momento de implementar; no asumirlos.
- **Login "usuario y contraseña" vs Supabase Auth**: Supabase Auth trabaja con email + contraseña (o magic link / OAuth). Si los dueños quieren un usuario genérico tipo `admin`, hay que decidir si se usa un email interno fijo o se cambia el requisito. Ver `10_preguntas_abiertas.md`.
- **Imágenes**: si se sirven desde Supabase Storage, cuentan contra el cupo. Si se sirven desde el repo estático, requieren redeploy por cada foto nueva. Es una decisión pendiente.
- **"Frontend estático" en sentido estricto**: con Supabase el frontend sigue siendo estático, pero necesita la `anon key` y políticas RLS correctas. No es "sin backend": es "sin backend propio".

## Arquitectura general

```
┌──────────────────────────────┐
│  Navegador (cliente final)   │
│  Catálogo · filtros · carrito│
└──────────────┬───────────────┘
               │ HTTPS (lectura)
               │ Supabase JS (anon key + RLS)
               ▼
┌──────────────────────────────┐        ┌─────────────────────────┐
│  Frontend estático           │───────▶│  Supabase (free tier)    │
│  (build sin servidor propio) │        │  Postgres + RLS          │
│                              │        │  Auth (admin)            │
│  - rutas públicas            │        │  Storage (imágenes, TBD) │
│  - ruta /admin protegida     │        └─────────────────────────┘
└──────────────┬───────────────┘
               │ deep link wa.me con texto prearmado
               ▼
┌──────────────────────────────┐
│  WhatsApp de Emi             │
│  (fuera del sistema)         │
└──────────────────────────────┘
```

**Decisiones de alto nivel y su justificación**:

- **El carrito vive en el navegador** (estado local / `localStorage`), no en la base. Motivo: no se almacenan datos de clientes y no hay órdenes. Consecuencia: el carrito no se sincroniza entre dispositivos y se pierde si el usuario limpia el navegador. Aceptable para el modelo de pedido por WhatsApp.
- **El pedido es un mensaje, no una entidad**. El sistema genera un texto formateado y abre `wa.me`. Motivo: restricción de no persistir datos de clientes. Consecuencia: no hay trazabilidad del pedido dentro del sistema.
- **Lectura pública, escritura autenticada**. El catálogo se lee con `anon key`; toda escritura requiere sesión de administrador y RLS. Motivo: el panel es el único punto de escritura y es el activo más sensible (precios y número de WhatsApp).
- **Taxonomías como datos, no como código**. Líneas, marcas, acordes y frases son tablas editables. Motivo: los dueños deben poder operar el catálogo sin tocar código. **[Acordado]**

## Integraciones externas

| Servicio | Propósito | Tipo | Estado |
|---|---|---|---|
| WhatsApp (`wa.me`) | Enviar el pedido prearmado al número de destino | Deep link (`https://wa.me/<numero>?text=<mensaje>`) | [Acordado] |
| Supabase | Base de datos, autenticación de administradores y (a definir) storage de imágenes | SDK JS / REST | [Propuesto] |
| Hosting estático | Publicar el frontend | Deploy estático | [Propuesto] |
| Dominio propio | URL pública del catálogo | DNS | [Acordado: el dominio ya existe] |
| Pasarela de pagos | — | — | **Excluida por restricción** |

### Detalle de la integración con WhatsApp

- Es un **deep link**, no una API. No hay webhooks, ni confirmación de entrega, ni estado del pedido.
- El mensaje se arma en el cliente y se codifica con `encodeURIComponent`.
- El número de destino se lee de la configuración (tabla de settings) y se normaliza a solo dígitos con código de país. Formato esperado: `549...` para Argentina. **[Propuesto]**
- Limitación: la longitud de la URL tiene un techo práctico. Con carritos muy grandes conviene validar el largo del mensaje o truncar con un resumen.
- Limitación: si el usuario no tiene WhatsApp Web o la app instalada, el deep link no completa el envío. El sistema no puede detectarlo.

## API / superficie de datos

No hay API REST propia. El frontend habla directo con Supabase. Las "operaciones" son consultas y mutaciones sobre tablas, gobernadas por RLS.

**Lectura pública (rol `anon`)**

| Operación | Tabla / vista | Uso |
|---|---|---|
| Listar perfumes con marca, línea, género, acordes, frases y presentaciones | `perfumes` + joins | Grilla del catálogo y ficha |
| Filtrar por línea, marca, género, acorde, texto | `perfumes` | Filtros y buscador |
| Listar líneas con al menos un producto | `lineas` (filtrado) | Navegación; las líneas vacías no se muestran |
| Listar acordes en uso | `acordes` (filtrado) | Filtro por acordes |
| Listar ofertas vigentes | `perfumes` / `presentaciones` con flag de oferta | Sección de ofertas |
| Leer configuración pública (número de WhatsApp destino) | `settings` (solo campos públicos) | Generar el deep link |

**Escritura (rol autenticado, solo administradores)**

| Operación | Tabla | Uso |
|---|---|---|
| Crear / editar / desactivar perfume | `perfumes` | Alta y edición |
| Crear / editar presentaciones (precio, stock) | `presentaciones` | Frasco y decants |
| Crear / editar líneas, marcas, acordes, frases | taxonomías | Panel |
| Asignar acordes y frases a un perfume | tablas puente | Ficha |
| Asignar una frase a varios perfumes | tabla puente (batch) | Acción masiva |
| Actualizar número de WhatsApp destino | `settings` | Configuración |

> El detalle de entidades y relaciones está en `04_modelo_de_datos.md`. Las reglas que gobiernan cada operación están en `05_reglas_de_negocio.md`.

## Contexto competitivo (resumen)

Se analizaron cinco catálogos: JFT Perfumes (Pedix), Vesper, Parfumerie, Perfumerías Rouge y Juleriaque. El detalle está en `docs/discovery/informe-discovery.md` y en `discovery/sources/`.

Lo relevante para el diseño:

- **JFT es el precedente directo** del modelo "catálogo + pedido por WhatsApp sin pasarela", sobre la plataforma Pedix. Oloroso Pit se diferencia por filtros de acordes, frases de asesoramiento y modelo compra/encargo con stock por presentación.
- **Vesper, Parfumerie y Rouge** tienen carrito con checkout y cuotas: no son el modelo a seguir en el flujo de compra, pero sí en detalle de ficha y presentación de ofertas.
- **Ninguno de los cinco** evidenció una taxonomía propia de acordes olfativos ni un modelo explícito de encargo vs compra. Eso es "no evidenciado", no "nadie lo tiene": no se debe afirmar exclusividad de mercado.
- **Juleriaque** aporta el patrón de selector de presentación con precio dinámico, que encaja con el modelo de presentaciones por perfume.
