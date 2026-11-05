# Brief de Clientes: Catálogo Oloroso Pit (v5)
*Fecha: 2026-11-05*
*Fuente: conversaciones con los dueños, análisis de su catálogo en planilla y de sus publicaciones de Instagram. Cada requisito indica su estado: **[Acordado]** si lo validaron los dueños, **[Propuesto]** si lo propuso el desarrollador y falta validarlo.*

**1. Problema**
Oloroso Pit vende perfumes importados, en su gran mayoría por encargo y con muy poco stock propio, a través de Instagram y WhatsApp. Su catálogo hoy es una planilla (hojas Árabes, Diseñador y Nicho, organizada por marca) y no cuentan con un catálogo web propio que incluya precios, disponibilidad y herramientas de asesoramiento.

**2. Usuarios**
- **Finales:** compradores de perfumes.
- **Administradores:** los dos dueños del emprendimiento.

**3. Casos de Uso**
- **Cliente:** ver el catálogo por línea y marca, filtrar por acordes y género, armar un pedido (carrito) con una o más unidades de cada perfume y enviarlo por WhatsApp, ya sea como compra o como encargo.
- **Administrador:** iniciar sesión; agregar perfumes nuevos; editar precios, imágenes, stock, acordes, género y frases de cada perfume; asignar una frase a varios perfumes a la vez; cambiar el número de WhatsApp que recibe los pedidos.

**4. Competidores y referencias**
- Analizadas el 2026-11-03: JFT Perfumes (pedix.app) y Vesper Perfumes (vesper.com.ar). Solo se vio lo público; lo demás es "No evidenciado".
- Mencionada por el cliente como referencia para decants, sin analizar todavía: Juleriaque.
- Pendiente: investigación liviana de 3 o 4 catálogos más, solo para inspirarse en filtros, ficha de producto y manejo de stock. Los requisitos de este brief tienen prioridad sobre lo que se encuentre.
- Existe una plataforma (Pedix) que ofrece catálogo con pedidos por WhatsApp; el desarrollo propio se justifica por los filtros, el asesoramiento y el control de stock vs. encargo.

**5. Funcionalidades Necesarias (MVP)**
- Catálogo con nombre, marca, línea, género, precio e imagen. Navegación por línea y marca; las líneas sin productos no se muestran. [Acordado]
- Lanzamiento solo con la línea Árabes. Diseñador y Nicho se agregan cuando tengan productos. [Acordado, a confirmar]
- Clasificación de los perfumes en masculino, femenino y unisex, con filtro por género. [Acordado]
- Todos los perfumes muestran su precio, haya stock o no. [Acordado]
- Indicador de stock: "En stock" / "Sin stock, por encargo". [Acordado]
- Carrito que genera un mensaje de WhatsApp con los perfumes elegidos y sus cantidades; si no hay stock, el mensaje es de encargo. [Acordado]
- Los pedidos llegan al WhatsApp de Emi. Los administradores pueden cambiar el número de destino desde su cuenta. [Número de Emi: Acordado; cambio desde el panel: Propuesto]
- Se pueden agregar al carrito una o más unidades del mismo perfume. [Acordado]
- Decants de 5 ml ($8.000) y 10 ml ($15.000), que se agregan al carrito como cualquier otro producto, en cantidades mayores a uno. Forma de mostrarlos (integrados en la ficha del perfume, sección aparte o ambas) por definir. [Acordado en concepto]
- Cada perfume tiene una o más presentaciones (frasco sellado, decants) con precio y stock propios. Los precios se cargan como datos, no escritos en el código. [Propuesto]
- Panel de administración con login simple (usuario y contraseña) para editar precios, imágenes y stock. [Acordado]
- Alta de perfumes nuevos desde el panel; marcas, acordes y frases se pueden crear desde la misma pantalla. [Propuesto, respuesta ya enviada a los dueños]
- Filtro por acordes: muestra todos los acordes que tienen los perfumes cargados, y se actualiza si se agregan nuevos. [Acordado]
- Frases "ideal para..." (ej. "para citas o salir de noche"): las crean los dueños, se asignan a varios perfumes a la vez, y cada perfume puede tener hasta 3. [Acordado]
- Sección de ofertas. [Acordado en concepto, detalle por validar]

**6. Funcionalidades Opcionales (Fases Posteriores)**
- Cuestionario de asesoramiento (reutiliza acordes, género y frases). [Propuesto]
- Ficha detallada con notas y barras de acordes, estilo post de Instagram. [Propuesto]
- Combos y promociones tipo 3x2. [Propuesto]
- Importación inicial desde la copia de la planilla actual. [Propuesto]

**7. Reglas de Negocio**
- Sin stock, el pedido se clasifica como "encargo" y el precio se sigue mostrando. [Acordado]
- Los precios de la planilla corresponden al perfume completo sellado. [Acordado]
- Un mismo perfume puede pedirse en cantidad mayor a uno; el mensaje de WhatsApp indica la cantidad. [Acordado]
- Cada perfume tiene como máximo 3 frases "ideal para...". [Acordado]
- Cada perfume tiene un género: masculino, femenino o unisex. [Acordado]
- Un carrito con ítems mixtos separa "compra" y "encargo" en el mensaje. [Propuesto]
- Un carrito vacío no genera mensaje. [Propuesto]
- El stock y el precio se manejan por presentación. [Propuesto]
- Los perfumes nuevos se cargan por defecto como "sin stock" hasta que un administrador lo cambie. [Propuesto]
- Los acordes, las frases y las marcas son datos editables desde el panel, sin tocar el código. [Acordado]
- Los acordes de un perfume pueden ser varios (la planilla actual combina, por ejemplo, "amaderado especiado"). Se unifican términos equivalentes (ej. afrutado/frutal). [Propuesto]
- El número de WhatsApp de destino solo lo pueden cambiar los administradores y debe tener un formato válido (código de país y solo dígitos). [Propuesto]

**8. Integraciones**
- WhatsApp (`wa.me`) para el envío de pedidos.
- Dominio propio (ya disponible).
- *Restricción estricta:* sin pasarela de pagos ni transacciones online.

**9. Restricciones**
- Sin presupuesto: solo infraestructura gratuita.
- Preferencia tentativa de stack: frontend estático con Supabase (plan gratuito) para base de datos y login. A confirmar en la knowledge-base.
- La fuente de datos es la base de datos propia; la planilla actual se importa una sola vez y deja de usarse. [Propuesto]
- No se almacenan datos de clientes.
- No se pide ni se guarda acceso a la cuenta de OneDrive o Drive de los dueños; se trabaja con una copia descargada.
- Equipo de desarrollo con recursos de hardware limitados.
- Diseño: los colores de la planilla actual (beige y marrón) se van a cambiar. Colores nuevos sin definir; se define al empezar el frontend. [Acordado]

**10. Riesgos**
- Panel de administración vulnerable si la autenticación es débil. Una cuenta vulnerada podría cambiar precios o desviar los pedidos cambiando el número de WhatsApp.
- Cambios de alcance durante el desarrollo.
- Fotografías de baja calidad o protegidas por derechos de autor.
- Datos de la planilla inconsistentes (nombres, precios, familias olfativas) que requieren limpieza.
- Que la planilla y la base de datos convivan y queden con información distinta.

**11. Preguntas Abiertas (a definir con los dueños)**
- Decants: si van integrados en la ficha, en sección aparte o ambas.
- Ofertas: precio anterior tachado, con fecha de vencimiento o sin ella; si aplican a decants.
- Login del admin: usuario genérico o email personal.
- Fotos: si usan las de la planilla, si tienen mejor calidad o van a sacar nuevas, y quién las sube.
- Plazos habituales de los encargos y si se informan en la página (se resuelve más adelante).
- Colores y referencias de estilo (se resuelve al empezar el frontend).
- Aprobación de la lista unificada de acordes (tarea del desarrollador al importar la planilla).