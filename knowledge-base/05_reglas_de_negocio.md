# Reglas de Negocio

Cada regla tiene un código `RN-{DOMINIO}-{NN}`. El **estado** replica el brief de clientes v5: **[Acordado]** (validado por los dueños) o **[Propuesto]** (propuesto por el desarrollador, pendiente de validación). No se debe implementar una regla `[Propuesto]` como si estuviera acordada sin confirmarla antes.

Convención: cuando una regla es una consecuencia técnica de otra regla acordada, se marca `[Derivada]` y se explica de qué regla sale.

---

## Dominio: Catálogo (RN-CAT)

- **RN-CAT-01** — El catálogo muestra, como mínimo: nombre, marca, línea, género, precio e imagen. **[Acordado]**
- **RN-CAT-02** — Las líneas sin productos publicados no se muestran en la navegación. **[Acordado]** — Justificación: evitar links a categorías vacías, que dan sensación de catálogo abandonado.
- **RN-CAT-03** — El lanzamiento incluye **solo la línea Árabes**. Diseñador y Nicho se agregan cuando tengan productos cargados. **[Acordado, a confirmar]** — La estructura de datos soporta las tres líneas desde el día uno; lo que no se muestra es la navegación, no la existencia de la línea.
- **RN-CAT-04** — Cada perfume tiene exactamente un género: `masculino`, `femenino` o `unisex`. No puede quedar vacío. **[Acordado]**
- **RN-CAT-05** — Cada perfume puede tener **como máximo 3 frases** "ideal para...". **[Acordado]**
- **RN-CAT-06** — Un perfume puede tener **varios acordes**. La planilla actual combina términos (ej. "amaderado especiado"), por lo que se separan en acordes individuales. **[Propuesto]**
- **RN-CAT-07** — El filtro de acordes muestra **solo los acordes que tienen al menos un perfume publicado**, y se actualiza automáticamente cuando se agregan acordes nuevos. **[Acordado]**
- **RN-CAT-08** — Cada perfume tiene una o más **presentaciones** (frasco sellado, decants) con precio y stock propios. **[Propuesto]**
- **RN-CAT-09** — Los decants son de **5 ml ($8.000)** y **10 ml ($15.000)**, se agregan al carrito como cualquier otro producto y admiten cantidades mayores a uno. **[Acordado en concepto]** — La forma de mostrarlos (dentro de la ficha, sección aparte o ambas) **no está definida**; el modelo de datos no debe forzar ninguna de las tres.
- **RN-CAT-10** — Existe una sección de ofertas. **[Acordado en concepto, detalle por validar]** — El detalle (precio anterior tachado, vencimiento, si aplica a decants) está en `10_preguntas_abiertas.md`.
- **RN-CAT-11** — Un perfume desactivado no aparece en el catálogo público, en filtros ni en búsquedas, pero no se borra de la base. **[Propuesto]**
- **RN-CAT-12** — El nombre del perfume, la marca y la línea se muestran tal como los cargó el administrador. No se normalizan mayúsculas ni tildes en la vista pública. **[Propuesto]**

## Dominio: Stock y encargo (RN-STK)

- **RN-STK-01** — Si una presentación no tiene stock, el pedido de esa presentación se clasifica como **"encargo"**. El precio se sigue mostrando igual. **[Acordado]** — Es la regla central del negocio: el cliente nunca debe encontrarse con un precio oculto.
- **RN-STK-02** — El stock se maneja **por presentación**, no por perfume. Un perfume puede tener el frasco sellado sin stock y el decant de 5 ml disponible. **[Propuesto]**
- **RN-STK-03** — Un perfume nuevo se carga por defecto como **"sin stock"** hasta que un administrador lo cambie. **[Propuesto]** — Evita prometer stock que no existe.
- **RN-STK-04** — El indicador de disponibilidad usa los textos **"En stock"** y **"Sin stock, por encargo"**. No se usan variantes ("agotado", "consultar", "últimas unidades"). **[Acordado]**
- **RN-STK-05** — Si el stock es mayor a cero, la presentación se muestra como "En stock", independientemente de cuántas unidades queden. No se muestra el número exacto. **[Propuesto]** — El brief no pide mostrar cantidades; mostrarlas expone información operativa.
- **RN-STK-06** — El stock **no se descuenta automáticamente** al generar un pedido por WhatsApp. **[Derivada de RN-CAR-02 y de la ausencia de órdenes persistidas]** — Consecuencia: el stock que ve el cliente puede estar desactualizado. El dueño lo ajusta a mano. Esto es aceptable para un negocio con poco stock y mucho encargo, pero debe quedar explícito.
- **RN-STK-07** — Un carrito puede mezclar presentaciones con stock y sin stock. **[Derivada de RN-STK-01 y RN-CAR-03]**
- **RN-STK-08** — No hay reserva de stock. Agregar al carrito no bloquea unidades. **[Derivada de RN-STK-06]**

## Dominio: Carrito y pedido (RN-CAR)

- **RN-CAR-01** — Se pueden agregar **una o más unidades** del mismo perfume/presentación al carrito. **[Acordado]**
- **RN-CAR-02** — El carrito genera un **mensaje de WhatsApp** con los perfumes elegidos y sus cantidades, y lo abre en el número configurado. **[Acordado]**
- **RN-CAR-03** — Un carrito con ítems mixtos **separa "compra" y "encargo"** en el mensaje. **[Propuesto]**
- **RN-CAR-04** — Un carrito vacío **no genera mensaje**. El botón de envío está deshabilitado. **[Propuesto]**
- **RN-CAR-05** — El mensaje de WhatsApp incluye, por ítem: nombre del perfume, marca, presentación (volumen), cantidad y precio. **[Propuesto]** — El brief pide "los perfumes elegidos y sus cantidades"; el detalle exacto del texto es una propuesta.
- **RN-CAR-06** — El mensaje **no incluye datos personales del cliente**: ni nombre, ni teléfono, ni dirección. El cliente los aporta, si quiere, dentro de la conversación de WhatsApp. **[Derivada de "no se almacenan datos de clientes"]**
- **RN-CAR-07** — Los pedidos llegan al **WhatsApp de Emi**. **[Acordado]**
- **RN-CAR-08** — Los administradores pueden **cambiar el número de WhatsApp de destino** desde su cuenta. **[Propuesto]**
- **RN-CAR-09** — El número de destino debe tener un **formato válido**: código de país y solo dígitos. Se rechaza cualquier valor con espacios, guiones, "+" o letras. **[Propuesto]**
- **RN-CAR-10** — **No hay pasarela de pagos ni transacciones online.** El sistema no cobra, no reserva, no confirma pagos. **[Acordado — restricción estricta]**
- **RN-CAR-11** — El carrito vive **solo en el navegador** del cliente. No se sincroniza entre dispositivos ni se recupera si el cliente limpia los datos del navegador. **[Derivada de la restricción de no almacenar datos]**
- **RN-CAR-12** — El carrito no vence por tiempo dentro de la sesión del navegador. **[Propuesto]** — Si se implementa expiración, debe ser una decisión explícita, no un efecto colateral.

## Dominio: Precios y ofertas (RN-PRE)

- **RN-PRE-01** — Los precios de la planilla original corresponden al **perfume completo sellado**. **[Acordado]**
- **RN-PRE-02** — Los precios se cargan como **datos** y se editan desde el panel. No se escriben en el código ni en el HTML. **[Propuesto]**
- **RN-PRE-03** — **Todos los perfumes muestran su precio**, haya stock o no. **[Acordado]**
- **RN-PRE-04** — La moneda es el **peso argentino (ARS)**. Los precios se muestran con separador de miles y sin decimales. **[Propuesto]** — Inferido de los precios de la planilla y del mercado argentino; confirmar el formato exacto.
- **RN-PRE-05** — El precio que se muestra y el que va al mensaje de WhatsApp es el **mismo**. Si hay oferta vigente, se usa el precio de oferta. **[Propuesto]**
- **RN-PRE-06** — Una oferta vencida deja de mostrarse automáticamente; el precio vuelve al de lista. **[Propuesto]** — Solo aplica si se define fecha de vencimiento (ver pregunta abierta).
- **RN-PRE-07** — El precio de oferta debe ser menor al precio de lista. El sistema rechaza lo contrario. **[Propuesto]**
- **RN-PRE-08** — Un cambio de precio impacta el catálogo público de inmediato, sin redeploy. **[Derivada de RN-PRE-02]**

## Dominio: Administración y seguridad (RN-ADM)

- **RN-ADM-01** — El panel de administración tiene **login simple con usuario y contraseña**. **[Acordado]** — La implementación concreta (email + contraseña de Supabase Auth vs usuario genérico) está pendiente; ver `10_preguntas_abiertas.md`.
- **RN-ADM-02** — Solo los administradores autenticados pueden crear, editar o desactivar perfumes, presentaciones y taxonomías. **[Acordado]**
- **RN-ADM-03** — Solo los administradores pueden cambiar el número de WhatsApp de destino. **[Propuesto]**
- **RN-ADM-04** — No hay registro público de administradores. Las cuentas se crean manualmente. **[Propuesto]**
- **RN-ADM-05** — **No se almacenan datos de clientes.** Ni cuentas, ni emails, ni teléfonos, ni direcciones, ni historial de pedidos. **[Acordado]**
- **RN-ADM-06** — Las reglas de acceso se aplican en la base (RLS), no solo ocultando controles en el frontend. **[Propuesto — requisito técnico]** — Sin esto, la `anon key` pública permitiría escrituras.
- **RN-ADM-07** — No se pide ni se guarda acceso a las cuentas de OneDrive o Drive de los dueños. Se trabaja con una copia descargada de la planilla. **[Acordado]**
- **RN-ADM-08** — Los acordes, las frases y las marcas son **datos editables desde el panel**, sin tocar el código. **[Acordado]**
- **RN-ADM-09** — Se puede asignar una misma frase a **varios perfumes a la vez** desde el panel. **[Acordado]**
- **RN-ADM-10** — Se pueden crear marcas, acordes y frases desde la misma pantalla de alta de perfume. **[Propuesto, respuesta ya enviada a los dueños]**
- **RN-ADM-11** — El panel muestra de forma visible el número de WhatsApp actualmente configurado, para detectar un cambio no deseado. **[Propuesto — mitigación de riesgo]**
- **RN-ADM-12** — Si se cambia el número de WhatsApp de destino, el cambio aplica al instante y no requiere redeploy. **[Propuesto]**

## Dominio: Datos y migración (RN-DAT)

- **RN-DAT-01** — La **base de datos es la fuente de verdad** una vez hecho el import inicial. La planilla deja de usarse. **[Propuesto]**
- **RN-DAT-02** — La importación desde la planilla se hace **una sola vez**. No hay sincronización bidireccional. **[Propuesto]**
- **RN-DAT-03** — Los acordes equivalentes se unifican en un término canónico (ej. afrutado/frutal → uno solo). **[Propuesto]**
- **RN-DAT-04** — No se cargan imágenes de terceros sin derechos de uso. Las fotos deben ser propias, provistas por los dueños o con licencia. **[Propuesto — mitigación de riesgo legal]**
- **RN-DAT-05** — No se inventan datos faltantes durante el import: si un perfume no tiene precio o acordes, se marca como incompleto y se avisa, en lugar de completarlo con un valor supuesto. **[Propuesto]**
- **RN-DAT-06** — La planilla y la base no conviven. Si se detecta una diferencia, gana la base. **[Propuesto]**

---

## Excepciones globales

- **RN-GLB-01 — Restricción de pagos**: ninguna funcionalidad puede introducir cobro, checkout, tokenización de tarjetas, cuotas o link de pago. Cualquier pedido de este tipo contradice el brief y requiere una decisión explícita del cliente, no una interpretación del equipo.
- **RN-GLB-02 — Restricción de datos personales**: ninguna funcionalidad puede almacenar información identificable de compradores. Esto incluye logs, analítica con datos personales y cookies de seguimiento avanzadas.
- **RN-GLB-03 — Restricción de costo**: ninguna dependencia puede requerir un plan pago. Si una funcionalidad necesita un servicio pago, se descarta o se busca alternativa gratuita.
- **RN-GLB-04 — Prioridad de fuentes**: ante conflicto entre el brief de clientes y cualquier hallazgo competitivo, **gana el brief**. La investigación de competidores es inspiración, no requisito.
- **RN-GLB-05 — Estado de los requisitos**: una regla `[Propuesto]` no se implementa como definitiva sin confirmación. Si hay que implementarla para avanzar, se deja detrás de una decisión documentada en `09_decisiones_y_supuestos.md`.
- **RN-GLB-06 — Sin datos de la planilla hardcodeados**: ni precios, ni marcas, ni acordes, ni frases van en el código. Todo es dato editable. **[Derivada de RN-ADM-08]**
