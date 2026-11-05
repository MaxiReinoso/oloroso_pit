# Decisiones y Supuestos

Este documento separa dos cosas:

- **Decisiones documentadas (`DD`)**: se eligió algo, con contexto y alternativas. Pueden estar acordadas con el cliente o ser decisiones técnicas del equipo.
- **Supuestos inferidos (`SU`)**: se asume algo que **no está escrito en las fuentes**. Si un supuesto es falso, cambia el diseño. Cada uno trae cómo validarlo.

---

## Decisiones documentadas

### DD-01 — Catálogo web propio en lugar de una plataforma existente

**Decisión**: construir un catálogo propio en vez de usar Pedix u otra plataforma de "catálogo + WhatsApp".
**Contexto**: existe Pedix, que ofrece catálogo con pedidos por WhatsApp y es el precedente directo del modelo (JFT lo usa). Sería más rápido y barato que desarrollar.
**Alternativas consideradas**:
- (a) Usar Pedix.
- (b) Usar Tienda Nube o similar.
- (c) Desarrollo propio.

**Justificación**: el brief justifica el desarrollo propio por tres cosas que una plataforma genérica no da: **filtros por acordes**, **herramientas de asesoramiento** (frases "ideal para...") y **control de stock vs. encargo por presentación**. Además, Tienda Nube implica un modelo de checkout que choca con la restricción de no pagos online.
**Trade-offs aceptados**: costo de desarrollo y mantenimiento; dependencia del equipo técnico para cambios estructurales.

**Estado**: [Acordado] (implícito en el brief).

---

### DD-02 — Sin pasarela de pagos: el pedido sale por WhatsApp

**Decisión**: el sistema no cobra. El carrito genera un mensaje de WhatsApp con el pedido y el cierre ocurre en la conversación.
**Contexto**: restricción estricta del cliente, repetida en el brief y en el informe de discovery.
**Alternativas consideradas**:
- (a) Mercado Pago / link de pago.
- (b) Transferencia con comprobante.
- (c) Pedido por WhatsApp sin pago online.

**Justificación**: es una restricción del negocio, no una limitación técnica. El negocio ya opera así y quiere seguir operando así. Además evita cumplimiento de PCI, datos de tarjetas y complejidad legal.
**Trade-offs aceptados**: no hay confirmación automática del pedido, no hay trazabilidad, el stock no se descuenta, la conversión depende de que el cliente complete el envío en WhatsApp.

**Estado**: [Acordado — restricción estricta]. **No revisable sin decisión explícita del cliente.**

---

### DD-03 — Frontend estático + Supabase (free tier)

**Decisión**: sitio estático que habla directo con Supabase para datos y autenticación.
**Contexto**: sin presupuesto, equipo con hardware limitado, necesidad de un panel de administración con login.
**Alternativas consideradas**:
- (a) Backend propio (Node/Express) + Postgres gratuito (Neon/Supabase) + frontend.
- (b) Firebase.
- (c) WordPress + WooCommerce (descartado por el modelo de checkout).
- (d) Frontend estático + Supabase.

**Justificación**: elimina el servidor y su mantenimiento; el free tier cubre lectura pública y dos administradores; RLS permite delegar autorización a la base; el SDK funciona desde el navegador.
**Trade-offs aceptados**: dependencia del free tier (pausas, límites), lógica de negocio en el cliente, sin backend para tareas programadas.

**Estado**: [Propuesto] — es la preferencia tentativa del brief y **debe confirmarse en la KB** antes de empezar el frontend.

---

### DD-04 — Precio y stock por presentación

**Decisión**: cada perfume tiene una o más presentaciones (frasco sellado, decant 5 ml, decant 10 ml), cada una con precio y stock propios.
**Contexto**: el brief acuerda decants con precios propios ($8.000 / $15.000) y, a la vez, pide "todos los perfumes muestran su precio". Un precio único a nivel perfume no alcanza para modelar decants con precio distinto.
**Alternativas consideradas**:
- (a) Precio único en el perfume y decants como productos separados.
- (b) Precio por presentación.
- (c) Precio único y "a consultar" para decants.

**Justificación**: (b) es la única que soporta las tres formas de mostrar decants (en la ficha, sección aparte o ambas) sin decidir por los dueños. También es el patrón que usa Juleriaque (selector de presentación con precio dinámico).
**Trade-offs aceptados**: el panel es un poco más complejo (hay que cargar una presentación por cada formato); la grilla necesita definir qué precio mostrar si hay varias presentaciones.

**Estado**: [Propuesto]. Genera la inconsistencia IN-01 (precio a nivel perfume vs. presentación): resolver antes de implementar el catálogo.

---

### DD-05 — Taxonomías como datos editables

**Decisión**: líneas, marcas, acordes y frases son tablas administrables desde el panel, no constantes en el código.
**Contexto**: los dueños necesitan operar el catálogo sin desarrollador; el brief lo marca como acordado para acordes, frases y marcas.
**Alternativas consideradas**:
- (a) Listas fijas en el código.
- (b) Tablas editables.

**Justificación**: una lista en el código obliga a un deploy por cada acorde nuevo o marca nueva. Inaceptable para un negocio que cambia catálogo seguido.
**Trade-offs aceptados**: hay que validar duplicados y normalizar términos; la calidad de los datos depende de la disciplina de carga.

**Estado**: [Acordado].

---

### DD-06 — Carrito en el navegador, sin persistencia en base

**Decisión**: el carrito vive en `localStorage`/estado local. No hay tabla de carritos ni de órdenes.
**Contexto**: no se almacenan datos de clientes; no hay cuentas; el pedido es un mensaje.
**Alternativas consideradas**:
- (a) Carrito persistido con identificador anónimo.
- (b) Carrito en cookie de sesión del servidor.
- (c) Carrito local.

**Justificación**: (c) es la única que cumple estrictamente "no se almacenan datos de clientes" sin agregar infraestructura.
**Trade-offs aceptados**: el carrito no se sincroniza entre dispositivos, se pierde al limpiar el navegador y no permite recuperar pedidos abandonados.

**Estado**: [Derivada de RN-ADM-05 y RN-CAR-11].

---

### DD-07 — Lanzamiento solo con la línea Árabes

**Decisión**: el sitio sale con Árabes. Diseñador y Nicho se agregan cuando tengan productos.
**Contexto**: el brief lo marca como acordado pero "a confirmar". El modelo soporta las tres líneas desde el inicio.
**Alternativas consideradas**:
- (a) Lanzar con las tres líneas aunque estén vacías.
- (b) Lanzar solo con Árabes.

**Justificación**: (b) evita categorías vacías y reduce el trabajo de carga inicial.
**Trade-offs aceptados**: el catálogo se ve más chico al lanzar.

**Estado**: [Acordado, a confirmar] — confirmar antes del lanzamiento.

---

### DD-08 — Número de WhatsApp configurable desde el panel

**Decisión**: el número de destino se guarda en `settings` y se edita desde el panel.
**Contexto**: hoy los pedidos van al WhatsApp de Emi. El brief propone que los admins puedan cambiarlo.
**Alternativas consideradas**:
- (a) Número en variable de entorno (requiere redeploy).
- (b) Número en la base, editable desde el panel.

**Justificación**: (b) cumple el requisito de autogestión y evita un deploy por un cambio operativo.
**Trade-offs aceptados**: es el punto de mayor riesgo del sistema. Un cambio no autorizado desvía todos los pedidos. Requiere RLS estricto y visibilidad del número actual.

**Estado**: [Propuesto] — el número de Emi es [Acordado]; el cambio desde el panel, no.

---

### DD-09 — Importación única desde la planilla

**Decisión**: los datos se importan una sola vez desde una copia de la planilla y después la base es la única fuente.
**Contexto**: la planilla es el catálogo actual, con hojas por línea y organización por marca.
**Alternativas consideradas**:
- (a) Integración/sincronización continua con la planilla.
- (b) Import único.

**Justificación**: (b) elimina el riesgo de dos fuentes de verdad y no requiere acceso a OneDrive/Drive (prohibido por el brief).
**Trade-offs aceptados**: el corte es irreversible; si la importación queda incompleta, hay que corregir a mano en el panel.

**Estado**: [Propuesto].

---

### DD-10 — No almacenar datos de clientes

**Decisión**: no hay cuentas de comprador, ni tabla de clientes, ni historial de pedidos, ni datos personales en logs.
**Contexto**: restricción del brief.
**Alternativas consideradas**:
- (a) Cuentas opcionales para "mis pedidos".
- (b) Sin cuentas.

**Justificación**: (b) reduce superficie legal y técnica; el modelo de pedido por WhatsApp no necesita identidad en el sitio.
**Trade-offs aceptados**: sin personalización, sin historial, sin recuperación de carrito, sin métricas de conversión por usuario.

**Estado**: [Acordado].

---

## Supuestos inferidos

### SU-01 — El tráfico y el volumen de datos entran en el free tier
**Supuesto**: el catálogo (cientos de perfumes, pocas imágenes por perfume) y el tráfico esperado caben en los límites gratuitos de Supabase y del hosting estático.
**Origen**: brief ("sin presupuesto: solo infraestructura gratuita") + tamaño del negocio (dos dueños, ventas por Instagram/WhatsApp).
**Riesgo si es falso**: el sitio se pausa o se bloquea por exceso de ancho de banda; habría que pagar o reducir imágenes.
**Cómo validar**: estimar cantidad de perfumes × peso de imagen × visitas mensuales; comparar con los límites vigentes del free tier al momento de implementar.

---

### SU-02 — Solo hay dos administradores y no habrá más roles
**Supuesto**: no se necesita distinguir permisos entre los dueños ni crear roles intermedios.
**Origen**: brief ("los dos dueños del emprendimiento").
**Riesgo si es falso**: si el negocio crece y suma un empleado que solo debe cargar fotos, el modelo de permisos (un solo rol `authenticated`) no alcanza.
**Cómo validar**: preguntar a los dueños si prevén sumar personas en los próximos 12 meses.

---

### SU-03 — Los clientes van a completar el envío en WhatsApp
**Supuesto**: quien arma el carrito efectivamente envía el mensaje; el deep link es suficiente.
**Origen**: el negocio ya vende por WhatsApp y JFT opera así con Pedix.
**Riesgo si es falso**: el carrito se convierte en un paso muerto y la conversión cae. Sin analítica, no se detectaría.
**Cómo validar**: comparar el volumen de pedidos recibidos antes y después del lanzamiento; preguntar a los dueños si notan más o menos pedidos.

---

### SU-04 — Los precios se manejan en pesos argentinos y se actualizan a mano
**Supuesto**: no hay multi-moneda, ni actualización automática por inflación, ni precios por tipo de cambio.
**Origen**: brief (precios en la planilla, decants en $8.000/$15.000) y contexto del mercado argentino.
**Riesgo si es falso**: si se necesita actualización masiva de precios por inflación, el panel actual (editar uno por uno) es insuficiente.
**Cómo validar**: preguntar con qué frecuencia cambian los precios y si necesitan actualización masiva (ej. porcentaje a todo el catálogo).

---

### SU-05 — El catálogo es de cientos de perfumes, no de miles
**Supuesto**: el volumen permite filtrar en el cliente o hacer consultas simples, sin paginación compleja ni búsqueda full-text avanzada.
**Origen**: una planilla de tres hojas manejada por dos personas.
**Riesgo si es falso**: si son miles de perfumes, la grilla y los filtros necesitan paginación, índices específicos y quizás búsqueda server-side.
**Cómo validar**: contar filas de la planilla antes de diseñar la grilla.

---

### SU-06 — Los administradores operan el panel desde una computadora
**Supuesto**: el panel está pensado para escritorio; no se optimiza para carga de perfumes desde el celular.
**Origen**: no hay mención en el brief; se infiere de que la carga de datos es una tarea de escritorio.
**Riesgo si es falso**: si los dueños cargan perfumes desde el celular, el formulario y la subida de imágenes se vuelven incómodos.
**Cómo validar**: preguntar desde qué dispositivo van a administrar.

---

### SU-07 — Hay fotos utilizables de los perfumes
**Supuesto**: existen imágenes de calidad razonable (en la planilla, en Instagram o nuevas) y los dueños pueden proveerlas.
**Origen**: brief menciona riesgo de "fotografías de baja calidad o protegidas por derechos de autor".
**Riesgo si es falso**: el catálogo se ve incompleto o se usan imágenes de terceros con riesgo legal.
**Cómo validar**: revisar la planilla e Instagram; definir quién saca/subí las fotos faltantes.

---

### SU-08 — No se necesita facturación ni gestión de envíos
**Supuesto**: el sistema termina en el pedido por WhatsApp; facturación, cobro y logística quedan fuera.
**Origen**: alcance del brief y restricción de no pagos.
**Riesgo si es falso**: si los dueños esperan que el sitio genere comprobantes o cálculos de envío, hay que ampliar el alcance.
**Cómo validar**: confirmar explícitamente qué pasa después de que llega el mensaje de WhatsApp.

---

### SU-09 — El proyecto de Supabase no se va a pausar por inactividad
**Supuesto**: el tráfico es suficiente para mantener el proyecto activo, o la reactivación es aceptable.
**Origen**: free tier de Supabase (comportamiento conocido, a verificar en la versión vigente).
**Riesgo si es falso**: el catálogo deja de funcionar sin aviso hasta que alguien lo reactive manualmente.
**Cómo validar**: leer la política vigente del free tier y definir un chequeo periódico o un ping programado.

---

### SU-10 — "Usuario y contraseña" se puede implementar con email y contraseña
**Supuesto**: los dueños aceptan usar un email como identificador de login, o se usa un email interno fijo por cuenta.
**Origen**: brief pide "login simple (usuario y contraseña)"; Supabase Auth trabaja con email.
**Riesgo si es falso**: si insisten en un nombre de usuario tipo `admin`, hay que agregar una capa de mapeo usuario → email o cambiar de mecanismo.
**Cómo validar**: pregunta abierta prioritaria (ver `10_preguntas_abiertas.md`).

---

### SU-11 — El stock se ajusta manualmente después de cada pedido
**Supuesto**: el dueño actualiza el stock en el panel cuando vende o encarga; el sistema no lo hace solo.
**Origen**: no hay órdenes persistidas ni descuento automático.
**Riesgo si es falso**: si esperan stock automático, el modelo actual no lo soporta. Si no lo ajustan, el catálogo miente.
**Cómo validar**: acordar el procedimiento operativo con los dueños y documentarlo.

---

### SU-12 — El proyecto se desarrolla y mantiene con una sola persona
**Supuesto**: no hay equipo rotativo ni necesidad de documentación de onboarding extensa.
**Origen**: contexto del proyecto (equipo con hardware limitado, desarrollador único).
**Riesgo si es falso**: si entra otra persona, la KB y el `AGENTS.md` son el punto de entrada; hay que mantenerlos.
**Cómo validar**: no aplica; es un supuesto de contexto.

---

## Decisiones pendientes (no tomadas)

| # | Decisión | Bloquea | Dónde se resuelve |
|---|---|---|---|
| P-01 | Framework del frontend (Astro, Vite+React, SvelteKit, HTML/JS) | Inicio del frontend | `10_preguntas_abiertas.md` |
| P-02 | Dónde se alojan las imágenes (Supabase Storage vs repo) | Panel de alta | `10_preguntas_abiertas.md` |
| P-03 | Cómo se muestran los decants (ficha, sección, ambas) | Diseño del catálogo | `10_preguntas_abiertas.md` |
| P-04 | Detalle de las ofertas (tachado, vencimiento, decants) | Sección de ofertas | `10_preguntas_abiertas.md` |
| P-05 | Login con email vs usuario genérico | Autenticación | `10_preguntas_abiertas.md` |
| P-06 | Definición de "precio" en la grilla si hay varias presentaciones | Catálogo | IN-01 |
| P-07 | Semántica del filtro de acordes (OR vs AND) | Filtros | `10_preguntas_abiertas.md` |
| P-08 | Orden por defecto de la grilla | Catálogo | `10_preguntas_abiertas.md` |
| P-09 | Lista unificada de acordes | Import y seeds | `10_preguntas_abiertas.md` |
| P-10 | Colores e identidad visual | Frontend | Se define al empezar el frontend [Acordado] |
