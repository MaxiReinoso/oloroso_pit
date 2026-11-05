# Visión y Objetivos

## Propósito del sistema

**Un catálogo web propio para Oloroso Pit que muestre precios y disponibilidad reales y que convierta la exploración en un pedido por WhatsApp, sea compra o encargo.**

Oloroso Pit vende perfumes importados en Argentina, en su gran mayoría por encargo y con muy poco stock propio, a través de Instagram y WhatsApp. Hoy el catálogo es una planilla (hojas Árabes, Diseñador y Nicho, organizada por marca): tiene precios y marca "No disponible", pero no es navegable, no se puede filtrar y no permite armar un pedido. El sistema reemplaza esa planilla por un catálogo público con filtros por línea, marca, género y acordes olfativos, con frases de asesoramiento ("ideal para...") y con un carrito que genera un mensaje de WhatsApp con los ítems y cantidades.

El sistema **no procesa pagos**: la restricción es estricta. El cierre comercial ocurre en WhatsApp, igual que hoy.

## Objetivos por actor

| Actor | Objetivo principal | Objetivos secundarios |
|---|---|---|
| Cliente final (comprador) | Encontrar un perfume que le sirva y pedirlo por WhatsApp sin idas y vueltas | Ver precio siempre, saber si está en stock o es encargo, filtrar por acordes/género, comparar presentaciones (frasco sellado, decant 5 ml, decant 10 ml) |
| Administrador (los dos dueños) | Mantener el catálogo actualizado sin depender de un desarrollador | Editar precios, imágenes y stock; dar de alta perfumes; crear marcas, acordes y frases; asignar una frase a varios perfumes; cambiar el WhatsApp que recibe los pedidos |
| Sistema (rol técnico) | Servir el catálogo público y generar el mensaje de pedido correcto | Distinguir compra de encargo, respetar el stock por presentación, no exponer datos de clientes |
| WhatsApp (externo) | Recibir el pedido ya formateado | — |

## Alcance v1 (MVP)

Línea base: **brief de clientes v5** (`docs/discovery/brief-clientes.md`, 2026-11-05). Cada ítem conserva su estado original.

### Catálogo público
- Catálogo con nombre, marca, línea, género, precio e imagen. Navegación por línea y marca; las líneas sin productos no se muestran. **[Acordado]**
- Lanzamiento solo con la línea **Árabes**. Diseñador y Nicho se agregan cuando tengan productos. **[Acordado, a confirmar]**
- Clasificación en masculino, femenino y unisex, con filtro por género. **[Acordado]**
- Filtro por acordes: muestra todos los acordes presentes en los perfumes cargados y se actualiza si se agregan nuevos. **[Acordado]**
- Frases "ideal para..." (ej. "para citas o salir de noche"): las crean los dueños, se asignan a varios perfumes a la vez y cada perfume puede tener hasta 3. **[Acordado]**
- Todos los perfumes muestran su precio, haya stock o no. **[Acordado]**
- Indicador de stock: "En stock" / "Sin stock, por encargo". **[Acordado]**
- Sección de ofertas. **[Acordado en concepto, detalle por validar]**

### Pedido
- Carrito que genera un mensaje de WhatsApp con los perfumes elegidos y sus cantidades; si no hay stock, el mensaje es de encargo. **[Acordado]**
- Los pedidos llegan al WhatsApp de Emi. **[Acordado]** Los administradores pueden cambiar el número de destino desde su cuenta. **[Propuesto]**
- Se pueden agregar al carrito una o más unidades del mismo perfume. **[Acordado]**
- Decants de 5 ml ($8.000) y 10 ml ($15.000), que se agregan al carrito como cualquier otro producto, en cantidades mayores a uno. **[Acordado en concepto]** La forma de mostrarlos (integrados en la ficha, sección aparte o ambas) queda **por definir**.
- Cada perfume tiene una o más presentaciones (frasco sellado, decants) con precio y stock propios. Los precios se cargan como datos, no escritos en el código. **[Propuesto]**

### Administración
- Panel de administración con login simple (usuario y contraseña) para editar precios, imágenes y stock. **[Acordado]**
- Alta de perfumes nuevos desde el panel; marcas, acordes y frases se pueden crear desde la misma pantalla. **[Propuesto, respuesta ya enviada a los dueños]**

### Restricciones de alcance (no negociables)
- **Sin pasarela de pagos ni transacciones online.** Restricción estricta del cliente.
- **No se almacenan datos de clientes.** El pedido no se persiste como orden: se emite como mensaje de WhatsApp.
- **Solo infraestructura gratuita.** No hay presupuesto para servicios pagos.

## Fuera de alcance (v1)

- Checkout, carrito con pago, cobro online, cuotas, descuentos por transferencia o cualquier integración con PSP (Mercado Pago, Stripe, etc.). Excluido por restricción del cliente.
- Cuentas de cliente, login de compradores, historial de pedidos, wishlist y seguimiento de envíos.
- Persistencia de pedidos u órdenes en base de datos; el pedido vive únicamente en el mensaje de WhatsApp.
- Datos personales de compradores (nombre, teléfono, dirección, email).
- Gestión de envíos, cálculo de flete por código postal, códigos de seguimiento.
- Facturación electrónica y gestión contable.
- Multi-idioma y multi-moneda. El catálogo es en español rioplatense y en pesos argentinos.
- App móvil nativa. El sistema es web responsive.
- Sincronización automática con la planilla de origen. La importación es una sola vez y después la planilla deja de usarse. **[Propuesto]**

### Fases posteriores (opcionales, no v1)
- Cuestionario de asesoramiento que reutiliza acordes, género y frases. **[Propuesto]**
- Ficha detallada con notas y barras de acordes, estilo post de Instagram. **[Propuesto]**
- Combos y promociones tipo 3x2. **[Propuesto]**
- Importación inicial desde la copia de la planilla actual. **[Propuesto]**

> El cuestionario y la ficha detallada son las dos funcionalidades que sostienen el diferencial de "asesoramiento" del brief. En v1 ese diferencial se cubre solo con filtros de acordes, género y frases.

## Métricas de éxito

Ninguna métrica fue acordada con los dueños. Las siguientes son **propuestas de medición**, no compromisos:

| Métrica | Cómo se mediría | Estado |
|---|---|---|
| Pedidos iniciados por WhatsApp | Conteo manual de conversaciones que llegan con el formato del carrito | [Propuesto] |
| Reducción de consultas repetidas por DM ("¿cuánto sale?", "¿lo tenés?") | Comparación cualitativa antes/después | [Propuesto] |
| Catálogo actualizado sin intervención del desarrollador | Los dueños cargan y editan perfumes solos | [Propuesto] |
| Mezcla compra vs encargo | Proporción de pedidos que llegan como encargo | [Propuesto] — puede ser un indicador de negocio, no solo del sistema |
| Tiempo de carga del catálogo | Medición en móvil, red 4G | [Propuesto] |

**Cuidado con las métricas de conversión**: sin analítica ni cuentas de usuario no hay embudo medible dentro del sitio. Cualquier métrica de conversión requiere instrumentación adicional (Analytics gratuito) que hoy no está en el alcance.
