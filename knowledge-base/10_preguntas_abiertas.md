# Preguntas Abiertas

> **Modo de generación**: Mode A (ingesta silenciosa desde `docs/`). Las dudas no se preguntaron durante la generación: se registran acá. Nada de lo que sigue debe resolverse por inferencia del equipo; requiere respuesta de los dueños o del responsable técnico.

## Inconsistencias detectadas

### IN-01 — Precio a nivel perfume vs. precio por presentación
**Documento A dice**: "Catálogo con nombre, marca, línea, género, **precio** e imagen" **[Acordado]** y "todos los perfumes muestran su precio" **[Acordado]**.
**Documento B dice**: "Cada perfume tiene una o más presentaciones (frasco sellado, decants) con **precio y stock propios**" **[Propuesto]**, y "el stock y el precio se manejan por presentación" **[Propuesto]**.

**Impacto**: si el precio vive en la presentación y un perfume tiene frasco + decant 5 ml + decant 10 ml, la tarjeta de la grilla tiene **tres precios posibles**. Sin una regla, la grilla muestra un precio arbitrario o queda vacía. También afecta el mensaje de WhatsApp y el ordenamiento por precio.

**Resolución propuesta**:
1. Confirmar con los dueños que el precio es por presentación (lo más consistente con los decants).
2. Definir qué muestra la tarjeta: "desde $X" (menor presentación) o el precio del frasco sellado con nota "decants desde $Y".
3. Si los dueños esperan "un precio por perfume", modelar el frasco como presentación principal y mostrar ese precio.

**Decisor**: dueños. **Bloquea**: catálogo, ficha y carrito.

---

### IN-02 — Línea única vs. navegación por línea
**Documento A dice**: "Navegación por línea y marca; las líneas sin productos no se muestran" **[Acordado]**.
**Documento B dice**: "Lanzamiento solo con la línea Árabes" **[Acordado, a confirmar]**.

**Impacto**: con una sola línea, la navegación por línea muestra un único ítem, lo que agrega ruido sin aportar valor. No es un error, pero es una decisión de UI sin definir.

**Resolución propuesta**: si al lanzar hay una sola línea, ocultar el selector de línea y mostrarlo cuando haya dos o más con productos. La lógica de "no mostrar líneas vacías" ya cubre el caso.

**Decisor**: equipo de frontend + confirmación de los dueños. **Bloquea**: navegación del catálogo (menor).

---

### IN-03 — Acordes editables vs. lista unificada pendiente de aprobación
**Documento A dice**: "Los acordes, las frases y las marcas son datos editables desde el panel" **[Acordado]**.
**Documento B dice**: "Aprobación de la lista unificada de acordes (tarea del desarrollador al importar la planilla)" **[Pregunta abierta]** y "se unifican términos equivalentes (afrutado/frutal)" **[Propuesto]**.

**Impacto**: la tabla `acordes` puede crearse vacía y funcionar, pero **el seed inicial no se puede escribir** sin la lista aprobada. Si se inventa la lista, se introducen términos que los dueños no validaron y se rompe la trazabilidad con la planilla.

**Resolución propuesta**: entregar a los dueños la lista de acordes detectada en la planilla, con la unificación propuesta, y pedir aprobación explícita antes del import. Mientras tanto, `acordes` queda como tabla vacía y sin seed.

**Decisor**: dueños (aprobar) + desarrollador (propone). **Bloquea**: import inicial, filtro de acordes, US-024.

---

### IN-04 — Investigación de competidores: "pendiente" en el brief vs. hecha en el informe
**Documento A (brief, prioridad) dice**: "Pendiente: investigación liviana de 3 o 4 catálogos más".
**Documento B (informe) dice**: se analizaron 5 catálogos (JFT, Vesper, Parfumerie, Rouge, Juleriaque).

**Impacto**: si alguien lee solo el brief, puede volver a encargar una investigación ya hecha. No afecta el sistema, pero sí el proceso.

**Resolución propuesta**: considerar el ítem del brief **satisfecho** por el informe, con la salvedad de que Parfumerie y Rouge fueron provistos manualmente y que la web search no estaba disponible. No reabrir la investigación salvo pedido explícito.

**Decisor**: orquestador / desarrollador. **Bloquea**: nada.

---

### IN-05 — Juleriaque: "no evidenciado" vs. "verificado manualmente"
**Documento A (nota de fuente) dice**: el agente no pudo extraer el catálogo (SPA); "No evidenciado".
**Documento B (informe) dice**: el desarrollador lo verificó manualmente y confirmó presentaciones con precio dinámico.

**Impacto**: si se cita la nota de fuente sin el contexto, se concluye erróneamente que Juleriaque no aporta nada. La conclusión correcta es que **sí aporta** el patrón de selector de presentación.

**Resolución propuesta**: al citar competidores, usar siempre el informe consolidado, no la nota aislada. La nota individual documenta el estado de la extracción, no el estado del sitio.

**Decisor**: nadie; es una nota de lectura. **Bloquea**: nada.

---

### IN-06 — "Todos los perfumes muestran su precio" vs. perfumes sin presentaciones cargadas
**Documento A dice**: todos los perfumes muestran su precio, haya stock o no **[Acordado]**.
**Documento B (modelo propuesto) dice**: el precio vive en la presentación.

**Impacto**: un perfume recién creado, sin presentaciones, no tiene precio que mostrar. Con RN-STK-03 (nuevo = sin stock), el perfume podría publicarse sin precio, violando la regla acordada.

**Resolución propuesta**: impedir la publicación de un perfume sin al menos una presentación con precio. El borrador puede existir en el panel, pero no en el catálogo público.

**Decisor**: equipo técnico (regla de implementación). **Bloquea**: alta de perfumes.

---

### IN-07 — "Sin presupuesto" vs. riesgo de pausa del free tier
**Documento A dice**: "Sin presupuesto: solo infraestructura gratuita" **[Restricción]**.
**Documento B (realidad del free tier) dice**: los proyectos gratuitos pueden pausarse por inactividad y tienen límites de transferencia.

**Impacto**: el sitio puede quedar offline sin que nadie lo note, y la única salida (plan pago) está prohibida por restricción.

**Resolución propuesta**: aceptar el riesgo con mitigación gratuita (ping periódico, chequeo manual semanal) y documentarlo como riesgo operativo del negocio. No asumir que "gratis" equivale a "siempre disponible".

**Decisor**: dueños + técnico. **Bloquea**: nada (es un riesgo aceptado, no un bloqueante).

---

## Preguntas abiertas (priorizadas)

### Heredadas del brief

| # | Prioridad | Pregunta | Bloquea | Decisor |
|---|---|---|---|---|
| Q-01 | **Alta** | ¿Los decants van integrados en la ficha del perfume, en una sección aparte o en ambas? | Diseño del catálogo y de la ficha | Dueños |
| Q-02 | **Alta** | Ofertas: ¿precio anterior tachado? ¿Con fecha de vencimiento o sin ella? ¿Aplican a decants? | Sección de ofertas (US-006) | Dueños |
| Q-03 | **Alta** | Login del admin: ¿usuario genérico o email personal? | Autenticación (US-015) | Dueños + técnico |
| Q-04 | **Alta** | Lista unificada de acordes: ¿se aprueba la propuesta del desarrollador? | Import, seed y filtro de acordes | Dueños |
| Q-05 | Media | Fotos: ¿se usan las de la planilla, hay mejores, se sacan nuevas? ¿Quién las sube? | Carga inicial y calidad del catálogo | Dueños |
| Q-06 | Media | ¿Se informan los plazos habituales de encargo en la página? | Contenido y ficha | Dueños |
| Q-07 | Baja (postergada) | Colores y referencias de estilo | Frontend | Dueños + diseño (se define al empezar el frontend) |

### Surgidas de la ingeniería

| # | Prioridad | Pregunta | Bloquea | Decisor |
|---|---|---|---|---|
| Q-08 | **Alta** | ¿Se confirma el stack frontend estático + Supabase free tier? ¿Qué framework? | Inicio del frontend y todo el plan técnico | Técnico + dueños (costo) |
| Q-09 | **Alta** | ¿Qué precio muestra la tarjeta de la grilla cuando hay varias presentaciones? (ver IN-01) | Catálogo y ordenamiento | Dueños |
| Q-10 | **Alta** | ¿Dónde se alojan las imágenes: Supabase Storage o repo estático? | Panel de alta y límites del free tier | Técnico |
| Q-11 | **Alta** | ¿Quién y cómo ajusta el stock después de cada pedido? ¿Se documenta el procedimiento? | Operación diaria y veracidad del catálogo | Dueños |
| Q-12 | Media | Filtro de acordes: al seleccionar varios, ¿se muestra la unión (OR) o la intersección (AND)? | Filtros | Dueños / producto |
| Q-13 | Media | ¿Entra un buscador por nombre en v1? | Alcance del MVP | Dueños |
| Q-14 | Media | ¿Cuál es el orden por defecto de la grilla? (destacados, alfabético, más reciente) | Catálogo | Dueños |
| Q-15 | Media | ¿Cada cuánto cambian los precios? ¿Necesitan actualización masiva por porcentaje? | Panel (posible funcionalidad faltante) | Dueños |
| Q-16 | Media | ¿Desde qué dispositivo administran: computadora o celular? | Diseño del panel | Dueños |
| Q-17 | Media | ¿Qué pasa después de que llega el mensaje de WhatsApp? (confirmación, seña, plazo, entrega) | Proceso operativo y contenido del sitio | Dueños |
| Q-18 | Baja | ¿Se permite analítica agregada y sin datos personales (conteo de visitas) o ni eso? | Métricas de éxito | Dueños |
| Q-19 | Baja | ¿Quién administra el DNS del dominio propio? ¿Hay acceso para apuntarlo al hosting? | Puesta en producción | Dueños |
| Q-20 | Baja | ¿Los dueños prevén sumar más personas al panel en el próximo año? | Modelo de roles (SU-02) | Dueños |
| Q-21 | Baja | ¿Cuántos perfumes hay en la planilla? (define paginación y filtrado) | Diseño de grilla y performance | Desarrollador (contando la planilla) |
| Q-22 | Baja | ¿Se necesita recuperación de contraseña autogestionada o alcanza con reseteo manual? | US-016 | Técnico + dueños |

---

## Incertidumbres de discovery registradas (Mode A)

Las siguientes etiquetas `[DISCOVERY]` siguen el contrato de la skill: son campos del bloque `kb.discovery` que no se pudieron inferir con confianza total desde las fuentes.

**[DISCOVERY] `stack`** — El stack está marcado explícitamente como **tentativo** en el brief ("preferencia tentativa de stack: frontend estático con Supabase, a confirmar en la knowledge-base"). Se registró `["Frontend estático", "Supabase (plan gratuito)"]` como mejor esfuerzo, pero **no es una decisión confirmada**. Confirmar: ¿se adopta ese stack? ¿Qué framework de frontend? ¿Se usa Supabase Storage para imágenes? Si se elige otro backend (Firebase, Node propio), cambian `08_arquitectura_propuesta.md` y varias reglas de seguridad.

**[DISCOVERY] `domain`** — Se registró `ecommerce` por el tipo de negocio (catálogo, precios, pedidos), pero es un ecommerce **atípico**: sin checkout, sin pagos, sin órdenes persistidas. Si el dominio se usa para elegir plantillas o benchmarks, conviene leerlo como "catálogo comercial con pedido por WhatsApp", no como ecommerce transaccional.

**[DISCOVERY] `scale`** — Se registró `public_multi_user` (catálogo público + dos administradores). No hay datos de volumen de tráfico ni de tamaño del catálogo en las fuentes; la etiqueta describe la **naturaleza** de la audiencia, no su tamaño. El volumen real es una pregunta abierta (Q-21).

---

## Preguntas que NO corresponden a esta etapa

Para evitar ruido, se dejan explícitamente fuera:

- **Pasarela de pagos**: descartada por restricción. No es una pregunta abierta.
- **Datos de clientes**: descartado por restricción. No es una pregunta abierta.
- **Integración con Instagram**: fuera de alcance v1. El sitio se enlaza desde Instagram, no se integra con su API.
- **App móvil**: fuera de alcance.
- **Facturación electrónica**: fuera de alcance; se resuelve fuera del sistema.
