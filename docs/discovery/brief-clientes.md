# Brief de Clientes: Catálogo Oloroso Pit
*Fecha: 2026-11-03*
*Fuente: conversaciones con los dueños del negocio y análisis de sus publicaciones de Instagram. Cada requisito indica su estado: **[Acordado]** si lo validaron los dueños, **[Propuesto]** si lo propuso el desarrollador y falta validarlo.*

**1. Problema**
Oloroso Pit vende perfumes por encargo y a través de Instagram y WhatsApp. Actualmente no cuenta con un catálogo propio centralizado que incluya precios, disponibilidad de stock y herramientas de asesoramiento para el cliente.

**2. Usuarios**
- **Finales:** compradores de perfumes.
- **Administradores:** los dos dueños del emprendimiento.

**3. Casos de Uso**
- **Cliente:** ver el catálogo, filtrar por atributos, armar un pedido (carrito) y enviarlo por WhatsApp.
- **Administrador:** iniciar sesión y editar precios, imágenes, stock (sí/no) y atributos de los perfumes.

**4. Competidores**
- *Pendiente.* Investigación liviana de 5 o 6 catálogos de perfumes (Argentina y alguno internacional), solo para inspirarse en filtros, ficha de producto y manejo de stock. Los requisitos de este brief tienen prioridad sobre lo que se encuentre.

**5. Funcionalidades Necesarias (MVP)**
- Catálogo con nombre, precio e imagen. [Acordado]
- Indicador de stock: "En stock" / "Por encargo". [Acordado]
- Carrito que genera un mensaje predeterminado de WhatsApp indicando los perfumes elegidos; si no hay stock, el mensaje pasa a ser de encargo. [Acordado]
- Panel de administración con login simple (usuario y contraseña) para editar precios, imágenes y stock. [Acordado]
- Filtros por atributos (situación, estación, acordes, notas, duración, proyección, estela), editables por los administradores. [Acordado en concepto, atributos concretos por validar]

**6. Funcionalidades Opcionales (Fases Posteriores)**
- Cuestionario interactivo de asesoramiento. [Propuesto]
- Ficha detallada por perfume (estilo post de Instagram) con barras visuales de acordes. [Propuesto]

**7. Reglas de Negocio**
- Si un producto no tiene stock, el pedido se clasifica como "encargo". [Acordado]
- Si el carrito mezcla productos con y sin stock, el mensaje separa la sección "compra" de la sección "encargo". [Propuesto]
- Un carrito vacío no genera mensaje. [Propuesto]
- Duración, proyección y estela se manejan con escalas numéricas del 1 al 5. [Propuesto, basado en sus posts]
- Los atributos descriptivos (notas, situación, estación, acordes) se editan desde el panel sin modificar el código. [Acordado]

**8. Integraciones**
- WhatsApp (`wa.me`) para el envío de pedidos.
- Dominio propio (ya disponible).
- *Restricción estricta:* sin pasarela de pagos ni transacciones online.

**9. Restricciones**
- Sin presupuesto: solo infraestructura gratuita.
- Preferencia tentativa de stack: frontend estático con Supabase (plan gratuito) para base de datos y login. A confirmar en la knowledge-base.
- No se almacenan datos de clientes (no hay registro ni pagos).
- Equipo de desarrollo local con recursos de hardware limitados.

**10. Riesgos**
- Vulnerabilidades en el panel de administración si la autenticación es débil, incluidas contraseñas poco seguras de los administradores.
- Cambios de alcance por parte de los clientes durante el desarrollo.
- Fotografías de baja calidad o protegidas por derechos de autor.

**11. Preguntas Abiertas (a definir con los dueños)**
- Colores, estilo e interfaz de referencia.
- Cantidad inicial de perfumes en el catálogo.
- Quién saca y optimiza las fotos de los productos.
- Categorías y filtros definitivos.
- Login del admin: usuario genérico o email personal.
- A qué número de WhatsApp llegan los pedidos (uno o ambos dueños).
- Si se pueden pedir varias unidades del mismo perfume.
- Plazos habituales de los encargos y si se informan en la página.
- Moneda de los precios y frecuencia con que cambian.