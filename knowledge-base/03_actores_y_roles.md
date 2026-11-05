# Actores y Roles

## Actores del sistema

| Actor | Descripción | Cómo interactúa | Volumen esperado |
|---|---|---|---|
| **Cliente final** (visitante) | Comprador de perfumes. Llega desde Instagram, WhatsApp o el dominio propio. No se registra ni se identifica dentro del sitio. | Navega el catálogo, filtra, abre la ficha, arma un carrito y genera un mensaje de WhatsApp. | Público abierto; sin métrica definida |
| **Administrador** | Los **dos dueños** del emprendimiento. | Inicia sesión en el panel; gestiona perfumes, presentaciones, taxonomías, ofertas y el número de WhatsApp de destino. | 2 personas |
| **Sistema** (rol técnico) | El frontend + Supabase. | Sirve el catálogo, valida permisos por RLS y arma el mensaje de pedido. | — |
| **WhatsApp** (externo) | Canal de cierre del pedido. | Recibe el mensaje prearmado en el número configurado. No devuelve estado al sistema. | — |
| **Emi** | Persona que recibe los pedidos. Es uno de los dueños y el destinatario por defecto. | Recibe los mensajes de pedido. No es un rol distinto del administrador. | 1 persona |
| **Desarrollador / mantenedor** (fuera del runtime) | Responsable de la puesta en marcha y del import inicial de la planilla. | Carga inicial de datos, migraciones, configuración. No opera el catálogo en el día a día. | 1 persona |

**Aclaración importante**: el "administrador" es un rol funcional, no una persona. Hay dos dueños con las mismas capacidades. El sistema no necesita distinguir entre ellos en v1.

## RBAC — Matriz de permisos

Roles técnicos: `anon` (visitante sin sesión) y `authenticated` (administrador con sesión). No hay roles intermedios: no existe "editor", "vendedor" ni "cliente registrado".

| Recurso | `anon` (cliente final) | `authenticated` (administrador) |
|---|---|---|
| `perfumes` | R (solo activos/publicados) | R, C, U, D (incluye desactivar) |
| `presentaciones` | R (solo de perfumes publicados) | R, C, U, D |
| `lineas` | R (solo con productos) | R, C, U, D |
| `marcas` | R | R, C, U, D |
| `acordes` | R (solo en uso) | R, C, U, D |
| `perfume_acordes` | R | R, C, U, D |
| `frases` | R | R, C, U, D |
| `perfume_frases` | R | R, C, U, D (incluye asignación masiva) |
| `ofertas` / flags de oferta | R (solo vigentes) | R, C, U, D |
| `settings` (número de WhatsApp) | R (solo el campo del número) | R, U |
| `storage` (imágenes) | R | R, C, U, D |
| Carrito | C, U, D (solo en su navegador) | — |
| Datos de clientes | — | — (no existen) |

**Notas de implementación**:

- Toda la autorización de escritura se hace con **RLS en Supabase**, no solo ocultando botones en el frontend. Ocultar la UI no es seguridad.
- El rol `anon` nunca debe poder leer campos internos (por ejemplo, notas privadas, flags de borrado lógico o cualquier dato operativo que no sea parte del catálogo público).
- No hay endpoint de "registro" de administradores. Las cuentas se crean manualmente en Supabase. **[Propuesto]**
- No hay recuperación de contraseña autogestionada en v1, salvo que se habilite el flujo de Supabase Auth. **[Propuesto]** — ver `10_preguntas_abiertas.md`.

## Rutas públicas

Todas accesibles sin autenticación:

| Ruta | Contenido |
|---|---|
| `/` | Home del catálogo (destacados, líneas activas, acceso a ofertas) |
| `/perfumes` | Grilla completa con filtros (línea, marca, género, acordes, búsqueda) |
| `/perfumes/[slug]` | Ficha de producto con presentaciones, precio, stock, acordes y frases |
| `/linea/[slug]` | Catálogo filtrado por línea (Árabes; Diseñador y Nicho cuando existan productos) |
| `/marca/[slug]` | Catálogo filtrado por marca |
| `/ofertas` | Perfumes o presentaciones con oferta vigente |
| `/carrito` | Carrito local y botón de "Enviar pedido por WhatsApp" |
| `/acordes` (opcional) | Navegación por acordes olfativos |

## Rutas protegidas

| Ruta | Acceso | Comportamiento sin sesión |
|---|---|---|
| `/admin` | Administrador autenticado | Redirige a `/admin/login` |
| `/admin/login` | Pública (formulario) | — |
| `/admin/perfumes` | Administrador | Redirige a login |
| `/admin/perfumes/nuevo` | Administrador | Redirige a login |
| `/admin/perfumes/[id]` | Administrador | Redirige a login |
| `/admin/taxonomias` | Administrador | Redirige a login (líneas, marcas, acordes, frases) |
| `/admin/ofertas` | Administrador | Redirige a login |
| `/admin/configuracion` | Administrador | Redirige a login (número de WhatsApp destino) |

**Nota sobre el login**: `/admin/login` es pública porque es el formulario de acceso. No debe revelar si un email existe o no; el mensaje de error es genérico.

## Escenarios de abuso a considerar

| Escenario | Impacto | Mitigación |
|---|---|---|
| Cuenta de administrador comprometida | Cambio de precios, despublicación de productos o **desvío de todos los pedidos** cambiando el número de WhatsApp | Contraseña fuerte, no compartir credenciales, RLS, revisar el número de destino periódicamente |
| Escritura no autorizada vía `anon key` | Alteración del catálogo | RLS obligatorio en todas las tablas; probar explícitamente que `anon` no puede escribir |
| Scraping del catálogo | Copia de precios y fotos | Aceptado como riesgo bajo: el catálogo es público por definición |
| Alta masiva de basura | Ruido operativo | Sin registro público no hay vector directo; el único escritor es el admin |

El riesgo de mayor impacto **no es técnico sino operativo**: si alguien cambia el número de WhatsApp de destino, todos los pedidos se pierden en silencio. Debe quedar visible en el panel y en la documentación de operación. Ver `05_reglas_de_negocio.md` (RN-ADM).
