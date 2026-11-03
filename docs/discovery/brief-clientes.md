# Brief de Clientes: Catálogo Oloroso Pit
*Fuente: Reunión de levantamiento de requisitos con los dueños del negocio.*

**1. Problema**
Oloroso Pit vende perfumes por encargo y a través de Instagram y WhatsApp. Actualmente no cuentan con un catálogo propio centralizado que incluya precios, disponibilidad de stock y herramientas de asesoramiento para el cliente

**2. Usuarios**
- **Finales:** Compradores de perfumes.
- **Administradores:** Los dos dueños del emprendimiento.

**3. Casos de Uso**
- **Cliente:** Ver catálogo, filtrar por atributos, usar cuestionario de asesoramiento, armar un carrito de compras y enviar un pedido por WhatsApp.
- **Administrador:** Iniciar sesión y editar precios, imágenes, stock (sí/no) y atributos de los perfumes.

**4. Competidores**
- *Pendiente.* A completar por el agente mediante una investigación de mercado liviana (5 o 6 catálogos locales/internacionales).

**5. Funcionalidades Necesarias (MVP)**
- Catálogo visual (nombre, precio, imagen).
- Indicador binario de stock (En stock / Por encargo).
- Carrito de compras que genera un mensaje predeterminado de WhatsApp diferenciando el tipo de pedido.
- Panel de administración con login protegido.
- Filtros de búsqueda basados en atributos dinámicos.

**6. Funcionalidades Opcionales (Fases Posteriores)**
- Cuestionario interactivo de asesoramiento.
- Ficha detallada por perfume (estilo post de Instagram) incluyendo barras visuales de acordes e intensidad.

**7. Reglas de Negocio**
- Si un producto no tiene stock, el pedido se clasifica estrictamente como "encargo".
- Si el carrito contiene productos mixtos, el mensaje final de WhatsApp debe separar claramente la sección de "compra" de la sección de "encargo".
- Los atributos de intensidad (duración, proyección y estela) se manejan con escalas numéricas del 1 al 5.
- Los atributos descriptivos (notas, situación, estación) deben ser editables desde el panel sin requerir modificaciones en el código fuente.

**8. Integraciones**
- API de WhatsApp (`wa.me`) para el envío de pedidos.
- Dominio propio.
- *Restricción estricta:* Sin pasarela de pagos online.

**9. Restricciones**
- Presupuesto nulo (requiere uso de infraestructura gratuita, ej. Supabase en plan free).
- Catálogo con pocos productos.
- Equipo de desarrollo local con recursos de hardware limitados.

**10. Riesgos**
- Vulnerabilidades en el panel de administración si no se implementa una autenticación robusta.
- Cambios de alcance o ideas por parte de los clientes a mitad del desarrollo.
- Uso de fotografías de baja calidad o protegidas por derechos de autor.

**11. Preguntas Abiertas (A definir con los dueños)**
- Colores y referencias de interfaz gráfica (UI).
- Cantidad exacta inicial de perfumes en el catálogo.
- Responsable de la toma y optimización de las fotografías de los productos.
- Categorías y filtros definitivos a implementar.
- Preferencia de inicio de sesión para el admin (usuario genérico vs. email personal).