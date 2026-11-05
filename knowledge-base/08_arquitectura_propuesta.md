# Arquitectura Propuesta

> **Estado**: propuesta técnica, no decisión cerrada. El stack figura como *tentativo* en el brief y debe confirmarse antes de empezar el frontend. Lo que sí está cerrado: frontend estático, sin backend propio, sin pasarela de pagos, sin datos de clientes, infraestructura gratuita.

## Restricciones que mandan sobre la arquitectura

| Restricción | Consecuencia arquitectónica |
|---|---|
| Sin presupuesto | Free tier obligatorio; sin servidores propios, sin servicios pagos, sin dominios extra |
| Frontend estático (preferencia del cliente) | Build sin runtime de servidor; datos vía SDK de Supabase desde el navegador |
| Sin pasarela de pagos | No hay checkout, no hay webhooks de pago, no hay estados de orden |
| No se almacenan datos de clientes | Sin tabla de usuarios/clientes, sin carrito persistido, sin analytics con datos personales |
| Equipo con hardware limitado | Build liviano, dependencias mínimas, sin contenedores ni orquestación local |
| Los dueños operan el catálogo | Panel de administración funcional y simple; taxonomías como datos |

## Patrones aplicados

| Patrón | Dónde se usa | Por qué |
|---|---|---|
| **Static Site + BaaS** | Todo el frontend contra Supabase | Elimina el backend propio y el costo de servidor; el free tier cubre lectura de catálogo y escritura de dos admins |
| **Lectura pública / escritura autenticada** | RLS en Supabase | El catálogo es público por definición; el panel es el único punto de escritura sensible |
| **Configuración como dato** | `settings`, taxonomías | El número de WhatsApp y las taxonomías se cambian sin redeploy |
| **Estado local del carrito** | `localStorage` | No se persisten datos de clientes ni órdenes |
| **Deep link como integración** | `wa.me` | Evita API, credenciales y webhooks de WhatsApp |
| **Capa de acceso a datos aislada** | `src/lib/db/*` | Si se cambia Supabase, solo se reescribe esa capa |
| **Borrado lógico** | `activo` en entidades de catálogo | Reorganizar el catálogo sin perder datos |
| **Componentes de presentación puros** | `src/components/*` | Reutilizar tarjeta, ficha, selector de presentación |
| **Mobile-first** | Layout y estilos | El tráfico de Instagram es mayoritariamente móvil |

## Estructura de directorios (propuesta)

```
oloroso_pit/
├── docs/                          # Documentos fuente (NO se tocan)
├── discovery/                     # Notas de competidores (NO se tocan)
├── knowledge-base/                # Esta KB
├── openspec/                      # Cambios y especificaciones
├── public/
│   ├── favicon.svg
│   └── images/                    # Solo si las imágenes se sirven desde el repo
├── src/
│   ├── pages/                     # Rutas
│   │   ├── index.astro            # Home / catálogo
│   │   ├── perfumes/
│   │   │   ├── index.astro        # Grilla con filtros
│   │   │   └── [slug].astro       # Ficha
│   │   ├── linea/[slug].astro
│   │   ├── marca/[slug].astro
│   │   ├── ofertas.astro
│   │   ├── carrito.astro
│   │   └── admin/
│   │       ├── index.astro
│   │       ├── login.astro
│   │       ├── perfumes/
│   │       │   ├── index.astro
│   │       │   ├── nuevo.astro
│   │       │   └── [id].astro
│   │       ├── taxonomias.astro
│   │       ├── ofertas.astro
│   │       └── configuracion.astro
│   ├── components/
│   │   ├── catalogo/
│   │   │   ├── PerfumeCard.astro
│   │   │   ├── Filtros.astro
│   │   │   ├── PresentacionSelector.astro
│   │   │   └── StockBadge.astro
│   │   ├── carrito/
│   │   │   ├── CarritoItem.astro
│   │   │   └── BotonWhatsApp.astro
│   │   └── admin/
│   │       ├── PerfumeForm.astro
│   │       ├── TaxonomiaSelect.astro
│   │       └── NumeroWhatsAppForm.astro
│   ├── layouts/
│   │   ├── PublicLayout.astro
│   │   └── AdminLayout.astro
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts          # Cliente browser (anon key)
│   │   │   └── auth.ts            # Login / logout / sesión
│   │   ├── db/
│   │   │   ├── perfumes.ts        # Lecturas públicas
│   │   │   ├── taxonomias.ts
│   │   │   ├── admin.ts           # Mutaciones
│   │   │   └── settings.ts
│   │   ├── carrito/
│   │   │   ├── storage.ts         # Leer/escribir localStorage
│   │   │   ├── estado.ts          # Agregar/quitar/cantidades
│   │   │   └── totales.ts         # Compra vs encargo
│   │   ├── whatsapp/
│   │   │   ├── mensaje.ts         # Formatear el pedido
│   │   │   └── link.ts            # Construir wa.me
│   │   └── utils/
│   │       ├── precio.ts          # Formato ARS
│   │       ├── slug.ts
│   │       └── validacion.ts
│   ├── styles/
│   │   └── global.css
│   └── env.d.ts
├── supabase/
│   ├── migrations/
│   │   ├── 0001_init.sql
│   │   ├── 0002_rls.sql
│   │   └── 0003_seed.sql
│   └── seed/
│       └── acordes.json           # Pendiente de aprobación
├── tests/
├── astro.config.mjs
├── package.json
├── .env.example
└── README.md
```

> Astro es una **opción**, no una decisión. Cualquier framework con salida estática (Vite + React, SvelteKit con `adapter-static`, incluso HTML/CSS/JS a mano) es compatible con el modelo. Lo que no se debe elegir es un framework que fuerce un servidor Node permanente.

**Criterio de elección**: build rápido en hardware limitado, salida estática real, buena performance en móvil, cero costo de hosting. Si el equipo ya domina una herramienta, esa gana.

## Seguridad

### Autenticación
- **Supabase Auth** (email + contraseña) como mecanismo propuesto. El brief pide "login simple con usuario y contraseña". La brecha entre "usuario" y "email" está abierta (ver `10_preguntas_abiertas.md`).
- Sin registro público. Las cuentas se crean manualmente desde el dashboard de Supabase.
- Sesión persistida por el cliente de Supabase. Expiración por defecto.
- Recomendado: contraseñas largas y únicas, guardadas en un gestor. No compartir la cuenta entre los dos dueños si se puede evitar (pero el brief no lo prohíbe).

### Autorización
- **RLS activo en todas las tablas**, sin excepción. Una tabla sin RLS con `anon key` pública es una tabla abierta a escritura.
- El rol `anon` solo lee catálogo publicado y el número de WhatsApp.
- El rol `authenticated` lee y escribe; en v1 no hay distinción entre administradores.
- El frontend no es la frontera de seguridad: ocultar un botón no impide una llamada directa a la API.

**Esquema de políticas (referencia, no SQL final)**:

```sql
-- Catálogo: lectura pública solo de filas activas
alter table perfumes enable row level security;
create policy "perfumes_public_read" on perfumes
  for select using (activo = true);
create policy "perfumes_admin_all" on perfumes
  for all to authenticated using (true) with check (true);

-- Presentaciones: heredan la visibilidad del perfume
alter table presentaciones enable row level security;
create policy "presentaciones_public_read" on presentaciones
  for select using (
    exists (select 1 from perfumes p where p.id = perfume_id and p.activo = true)
  );

-- Configuración: lectura pública solo del número; escritura autenticada
alter table settings enable row level security;
create policy "settings_public_read" on settings
  for select using (true);
create policy "settings_admin_write" on settings
  for update to authenticated using (true) with check (true);
```

> Si `settings` crece con campos internos, hay que exponer solo una **vista** pública con el número, no la tabla completa. Es más limpio que depender de que nadie agregue una columna sensible.

### Validación de input
- Validación en el cliente (UX) **y** constraints en la base (verdad): `precio_ars >= 0`, `stock >= 0`, `whatsapp_destino ~ '^[0-9]{10,15}$'`, máximo 3 frases por perfume.
- Sanitizar el texto que va al deep link de WhatsApp con `encodeURIComponent`.
- No confiar en parámetros de URL para filtros: validar contra valores conocidos.

### Secrets
- La `anon key` de Supabase es **pública por diseño**. No es un secreto; su seguridad depende de RLS.
- La **`service_role key` nunca va al frontend**, ni al repo, ni a una variable `PUBLIC_*`. Si se necesita para scripts de migración, se usa localmente y no se commitea.
- El archivo `.env` va en `.gitignore`. Se versiona `.env.example` con valores vacíos.
- No hay credenciales de WhatsApp: es un deep link, no una API.

### Superficie de ataque
| Vector | Riesgo | Mitigación |
|---|---|---|
| Escritura con `anon key` | Alteración del catálogo | RLS probado explícitamente |
| Cuenta admin comprometida | Cambio de precios y desvío de pedidos | Contraseña fuerte, revisión del número de WhatsApp |
| `service_role key` filtrada | Control total de la base | Nunca en el frontend ni en el repo |
| XSS en campos editables | Ejecución de script en el panel | Escapar texto; no renderizar HTML crudo de la descripción |
| Deep link manipulado | Mensaje alterado antes de enviar | No es un riesgo real: el cliente controla su propio WhatsApp |

## Variables de entorno

| Variable | Descripción | Ejemplo | Sensible |
|---|---|---|---|
| `PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | `https://xxxx.supabase.co` | No |
| `PUBLIC_SUPABASE_ANON_KEY` | Clave pública `anon` (protegida por RLS) | `eyJhbGci...` | No (pública por diseño) |
| `PUBLIC_SITE_URL` | URL pública del sitio, para links canónicos | `https://olorosopit.com.ar` | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo para scripts de migración/seed locales | `eyJhbGci...` | **Sí** — nunca en el frontend ni en el repo |

**Nota**: en un sitio estático, cualquier variable `PUBLIC_*` termina en el bundle del navegador. No poner ahí nada que no pueda ser público.

## Performance y SEO

| Aspecto | Enfoque |
|---|---|
| Renderizado | Preferir generación estática de las rutas de catálogo; revalidar cuando el admin cambia datos (o hidratar en cliente) |
| Imágenes | Formatos modernos (WebP/AVIF), `loading="lazy"`, tamaños acordes al viewport |
| Peso | Evitar librerías grandes; el catálogo debe cargar rápido en 4G |
| SEO | Títulos y descripciones por página, `sitemap.xml`, `robots.txt`, datos estructurados de producto (sin precio si se prefiere no exponerlo a Google) |
| Accesibilidad | Contraste, foco visible, labels en formularios, navegación por teclado en el panel |
| Sin JS | El catálogo debería poder verse aunque falle el JS (si el framework lo permite); el carrito sí requiere JS |

**Tensión a resolver**: si el catálogo se genera estático en build, un cambio de precio del admin no se refleja hasta el próximo build. Opciones:
1. **Hidratar en cliente** (recomendado): el HTML estático sirve de shell y los datos se piden a Supabase en el navegador.
2. **Rebuild automático** ante cambios: agrega complejidad y depende de webhooks.
3. **SSR en el free tier**: contradice la preferencia de frontend estático.

La opción 1 es la más coherente con el stack propuesto y con la necesidad de que los dueños editen sin redeploy.

## Despliegue

| Etapa | Enfoque |
|---|---|
| Repositorio | Git, un solo repo |
| Build | Comando de build estático, sin pasos pesados |
| Hosting | Netlify / Vercel / Cloudflare Pages / GitHub Pages (free tier) |
| Base de datos | Proyecto Supabase free tier |
| Migraciones | SQL versionado en `supabase/migrations/`, aplicado manualmente o con Supabase CLI |
| Entornos | Solo producción en v1. Opcional: un proyecto Supabase de staging si el free tier lo permite |
| Backups | Export periódico del free tier; **verificar la política real de retención** |

**Riesgos de infraestructura a validar**:
- Proyectos Supabase free se **pausan por inactividad**. Un catálogo con poco tráfico puede pausarse y quedar offline. Verificar la política vigente y planificar un "keep-alive" o aceptar el riesgo.
- Límite de ancho de banda/egress del free tier: las imágenes son el mayor consumidor.
- Hosting estático gratuito: límites de build minutes y de ancho de banda. Para este volumen, holgados.
- Sin monitoreo pago: no hay alertas automáticas si el sitio se cae. Mitigación: chequeo manual o un servicio gratuito de uptime.

## Testing (propuesta)

| Nivel | Qué cubrir |
|---|---|
| Unitario | Formateo del mensaje de WhatsApp (compra/encargo, cantidades, totales), formato de precio ARS, validación de número |
| Integración | Lecturas públicas contra Supabase con RLS; que `anon` no pueda escribir |
| E2E | Flujo completo: catálogo → ficha → carrito → link de WhatsApp; login → alta → edición → despublicar |
| Manual | Los dueños cargan un perfume real y verifican que se vea bien en móvil |

**Prueba de seguridad imprescindible**: intentar escribir en cada tabla con la `anon key` y confirmar que falla. Es la prueba que separa "parece seguro" de "es seguro".

## Deuda técnica aceptada (consciente)

1. Sin backend propio: la lógica de negocio vive en el frontend y en constraints de la base. Si crece, habrá que moverla.
2. Sin trazabilidad de pedidos: no se puede auditar qué se pidió.
3. Sin reserva ni descuento de stock: el stock es una foto, no un valor transaccional.
4. Sin entorno de staging: los cambios se prueban en producción con dos usuarios.
5. Sin monitoreo: las caídas se detectan cuando un cliente avisa.
