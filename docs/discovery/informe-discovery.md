# Informe de Discovery — Oloroso Pit

**Fecha**: 2026-11-05
**Insumo principal**: `docs/discovery/brief-clientes.md`. Los requisitos del cliente tienen prioridad sobre cualquier hallazgo de la investigación.
**Catálogos analizados**: 5 (JFT, Vesper, Parfumerie y Rouge extraídos por el agente; Juleriaque no evidenciado por el agente y verificado manualmente por el desarrollador en navegador).

> **Origen de las URLs**: JFT y Vesper vinieron en el pedido inicial; Juleriaque fue mencionada como referencia por el cliente. Las URLs de **Parfumerie** y **Rouge** fueron **provistas manualmente por el desarrollador durante el proceso de ajuste**, no por búsqueda autónoma del agente. La web search no estuvo disponible en la sesión.

---

## 1. Problema

Oloroso Pit vende perfumes importados, en su gran mayoría por encargo y con muy poco stock propio, a través de Instagram y WhatsApp. Su catálogo hoy es una planilla (hojas Árabes, Diseñador y Nicho, organizada por marca) — la planilla sí tiene precios y marca "No disponible" — pero no cuentan con un catálogo web propio que incluya precios, disponibilidad y herramientas de asesoramiento.

## 2. Usuarios

- **Finales**: compradores de perfumes.
- **Administradores**: los dos dueños del emprendimiento.

## 3. Casos de uso

- **Cliente**: ver el catálogo por línea y marca, filtrar por acordes y género, armar un pedido (carrito) con una o más unidades de cada perfume y enviarlo por WhatsApp, ya sea como compra o como encargo.
- **Administrador**: iniciar sesión; agregar perfumes nuevos; editar precios, imágenes, stock, acordes, género y frases de cada perfume; asignar una frase a varios perfumes a la vez; cambiar el número de WhatsApp que recibe los pedidos.

## 4. Competidores y referencias

| Catálogo | URL | Origen de la URL | Estado | Qué se verificó |
|----------|-----|------------------|--------|-----------------|
| JFT Perfumes | https://pedix.app/jftperfumes | Pedido inicial | ✅ Extraído por el agente | Categorías por tipo (sellados, decants 5 ml, combos decants, Cybermonday), descuentos hasta 24% OFF, pedido por WhatsApp, plataforma Pedix |
| Vesper Perfumes | https://www.vesper.com.ar/ | Pedido inicial | ✅ Extraído por el agente + verificación manual | Catálogo por género/línea, decants 3x2, envío gratis > $60.000, 3 cuotas, 30% OFF transferencia, ficha con notas olfativas, WhatsApp. Verificado en navegador: ofertas con precio anterior tachado, % destacado ("50% OFF") y precio final visible |
| Parfumerie | https://www.parfumerie.com.ar/ | Provista manualmente en el ajuste | ✅ Extraído por el agente | Catálogo por género + maquillaje/tratamiento/capilar, filtro por marca, retiro gratis en sucursales, 12 cuotas, reintegro 15% |
| Perfumerías Rouge | https://www.perfumeriasrouge.com/ | Provista manualmente en el ajuste | ✅ Extraído por el agente + verificación manual | 2117 productos, filtros granulares (Marca, Formato, Tamaño, Clasificación, Género, Aroma, Rangos de precio), envío gratis > $50.000, +15 OFF Galicia. Verificado en navegador: ficha con desglose de notas olfativas (salida, corazón, fondo), descriptores de estilo y guía gráfica de "Modo de uso" |
| Juleriaque | https://www.juleriaque.com.ar/ | Mencionada por el cliente / pedido | ⚠️ No evidenciado por el agente → ✅ Verificación manual | SPA client-side: el agente solo obtuvo el título. Verificado en navegador: muestra presentaciones/tamaños (30 ml, 75 ml) en la misma tarjeta/interfaz de producto, con precio que cambia dinámicamente según la selección. **No descartada** |

## 5. Funcionalidades Necesarias (MVP)

- Catálogo con nombre, marca, línea, género, precio e imagen. Navegación por línea y marca; las líneas sin productos no se muestran. **[Acordado]**
- Lanzamiento solo con la línea Árabes. Diseñador y Nicho se agregan cuando tengan productos. **[Acordado, a confirmar]**
- Clasificación de los perfumes en masculino, femenino y unisex, con filtro por género. **[Acordado]**
- Todos los perfumes muestran su precio, haya stock o no. **[Acordado]**
- Indicador de stock: "En stock" / "Sin stock, por encargo". **[Acordado]**
- Carrito que genera un mensaje de WhatsApp con los perfumes elegidos y sus cantidades; si no hay stock, el mensaje es de encargo. **[Acordado]**
- Los pedidos llegan al WhatsApp de Emi. Los administradores pueden cambiar el número de destino desde su cuenta. **[Número de Emi: Acordado; cambio desde el panel: Propuesto]**
- Se pueden agregar al carrito una o más unidades del mismo perfume. **[Acordado]**
- Decants de 5 ml ($8.000) y 10 ml ($15.000), que se agregan al carrito como cualquier otro producto, en cantidades mayores a uno. Forma de mostrarlos (integrados en la ficha del perfume, sección aparte o ambas) por definir. **[Acordado en concepto]**
- Cada perfume tiene una o más presentaciones (frasco sellado, decants) con precio y stock propios. Los precios se cargan como datos, no escritos en el código. **[Propuesto]**
- Panel de administración con login simple (usuario y contraseña) para editar precios, imágenes y stock. **[Acordado]**
- Alta de perfumes nuevos desde el panel; marcas, acordes y frases se pueden crear desde la misma pantalla. **[Propuesto, respuesta ya enviada a los dueños]**
- Filtro por acordes: muestra todos los acordes que tienen los perfumes cargados, y se actualiza si se agregan nuevos. **[Acordado]**
- Frases "ideal para..." (ej. "para citas o salir de noche"): las crean los dueños, se asignan a varios perfumes a la vez, y cada perfume puede tener hasta 3. **[Acordado]**
- Sección de ofertas. **[Acordado en concepto, detalle por validar]**

## 6. Funcionalidades Opcionales (Fases Posteriores)

- Cuestionario de asesoramiento (reutiliza acordes, género y frases). **[Propuesto]**
- Ficha detallada con notas y barras de acordes, estilo post de Instagram. **[Propuesto]**
- Combos y promociones tipo 3x2. **[Propuesto]**
- Importación inicial desde la copia de la planilla actual. **[Propuesto]**

## 7. Reglas de Negocio

- Sin stock, el pedido se clasifica como "encargo" y el precio se sigue mostrando. **[Acordado]**
- Los precios de la planilla corresponden al perfume completo sellado. **[Acordado]**
- Un mismo perfume puede pedirse en cantidad mayor a uno; el mensaje de WhatsApp indica la cantidad. **[Acordado]**
- Cada perfume tiene como máximo 3 frases "ideal para...". **[Acordado]**
- Cada perfume tiene un género: masculino, femenino o unisex. **[Acordado]**
- Un carrito con ítems mixtos separa "compra" y "encargo" en el mensaje. **[Propuesto]**
- Un carrito vacío no genera mensaje. **[Propuesto]**
- El stock y el precio se manejan por presentación. **[Propuesto]**
- Los perfumes nuevos se cargan por defecto como "sin stock" hasta que un administrador lo cambie. **[Propuesto]**
- Los acordes, las frases y las marcas son datos editables desde el panel, sin tocar el código. **[Acordado]**
- Los acordes de un perfume pueden ser varios (la planilla actual combina, por ejemplo, "amaderado especiado"). Se unifican términos equivalentes (ej. afrutado/frutal). **[Propuesto]**
- El número de WhatsApp de destino solo lo pueden cambiar los administradores y debe tener un formato válido (código de país y solo dígitos). **[Propuesto]**

## 8. Integraciones

- WhatsApp (`wa.me`) para el envío de pedidos.
- Dominio propio (ya disponible).
- **Restricción estricta:** sin pasarela de pagos ni transacciones online.

## 9. Restricciones

- Sin presupuesto: solo infraestructura gratuita.
- Preferencia tentativa de stack: frontend estático con Supabase (plan gratuito) para base de datos y login. A confirmar en la knowledge-base.
- La fuente de datos es la base de datos propia; la planilla actual se importa una sola vez y deja de usarse. **[Propuesto]**
- No se almacenan datos de clientes.
- No se pide ni se guarda acceso a la cuenta de OneDrive o Drive de los dueños; se trabaja con una copia descargada.
- Equipo de desarrollo con recursos de hardware limitados.
- Diseño: los colores de la planilla actual (beige y marrón) se van a cambiar. Colores nuevos sin definir; se define al empezar el frontend. **[Acordado]**

## 10. Riesgos

- Panel de administración vulnerable si la autenticación es débil. Una cuenta vulnerada podría cambiar precios o desviar los pedidos cambiando el número de WhatsApp.
- Cambios de alcance durante el desarrollo.
- Fotografías de baja calidad o protegidas por derechos de autor.
- Datos de la planilla inconsistentes (nombres, precios, familias olfativas) que requieren limpieza.
- Que la planilla y la base de datos convivan y queden con información distinta.

## 11. Preguntas Abiertas (a definir con los dueños)

- Decants: si van integrados en la ficha, en sección aparte o ambas.
- Ofertas: precio anterior tachado, con fecha de vencimiento o sin ella; si aplican a decants.
- Login del admin: usuario genérico o email personal.
- Fotos: si usan las de la planilla, si tienen mejor calidad o van a sacar nuevas, y quién las sube.
- Plazos habituales de los encargos y si se informan en la página (se resuelve más adelante).
- Colores y referencias de estilo (se resuelve al empezar el frontend).
- Aprobación de la lista unificada de acordes (tarea del desarrollador al importar la planilla).

---

## Análisis competitivo: qué se observó en los catálogos

> Ninguna celda marca ausencia confirmada. "No evidenciado" significa que no se pudo verificar públicamente, no que la funcionalidad no exista.

| Aspecto | JFT | Vesper | Parfumerie | Rouge | Juleriaque |
|---------|-----|--------|------------|-------|------------|
| Catálogo web navegable | ✓ | ✓ | ✓ | ✓ | ✓ (manual) |
| Promociones/descuentos visibles | ✓ | ✓ | ✓ | ✓ | No evidenciado |
| Navegación por género | No evidenciado (categorías por tipo) | ✓ | ✓ | ✓ | No evidenciado |
| Carrito web | No evidenciado (pedido por WhatsApp) | ✓ | ✓ | ✓ | No evidenciado |
| Pago online | No evidenciado | No evidenciado sin completar checkout | No evidenciado sin completar checkout | No evidenciado sin completar checkout | No evidenciado |
| Cuotas sin interés | No evidenciado | ✓ | ✓ | ✓ | No evidenciado |
| WhatsApp | ✓ | ✓ | No evidenciado (chatbot "Pia") | ✓ | No evidenciado |
| Decants | ✓ 5 ml / combos | ✓ 3x2 | No evidenciado | No evidenciado | No evidenciado |
| Ficha de producto detallada | No evidenciado | ✓ (notas, rendimiento) | No evidenciado | ✓ (notas salida/corazón/fondo, modo de uso — manual) | No evidenciado |
| Múltiples tamaños/presentaciones | No evidenciado | No evidenciado | No evidenciado | ✓ (90/50/30 ml visibles) | ✓ (30/75 ml, precio dinámico — manual) |
| Envío gratis | No evidenciado | ✓ > $60.000 | No evidenciado (retiro gratis) | ✓ > $50.000 | No evidenciado |
| Descuento por transferencia | No evidenciado | ✓ 30% | No evidenciado | No evidenciado | No evidenciado |
| Filtro por acordes / aroma | No evidenciado | No evidenciado | No evidenciado | ✓ filtro "Aroma" (sin taxonomía de acordes) | No evidenciado |
| Modelo encargo vs compra | No evidenciado | No evidenciado | No evidenciado | No evidenciado | No evidenciado |

**Observado en los 4 verificados por el agente (JFT, Vesper, Parfumerie, Rouge):**
- Catálogo web navegable.
- Promociones/descuentos visibles.

**Observado en 3 de los 4:**
- Navegación por género (Vesper, Parfumerie, Rouge).
- Carrito web (Vesper, Parfumerie, Rouge) — sin evidencia de pago online sin completar el checkout.
- Cuotas sin interés (Vesper, Parfumerie, Rouge).
- WhatsApp (JFT, Vesper, Rouge).

**Observado en 2 de los 4:**
- Decants (JFT, Vesper).
- Ficha de producto detallada (Vesper, Rouge).

**No evidenciado en ninguno de los 5:**
- Una taxonomía de acordes olfativos propia (Rouge tiene un filtro "Aroma", pero no se evidenció una taxonomía de acordes como la que plantea el brief).
- Un modelo explícito de "encargo vs compra" con stock por presentación.
- Pago online probado sin completar el flujo de checkout.

## Qué es diferenciador / propuesta de valor

La propuesta de valor de Oloroso Pit sale del brief y **no depende de la ausencia en competidores**:

- **Filtro por acordes** olfativos + **frases "ideal para..."** como herramientas de asesoramiento.
- **Modelo compra vs encargo** con stock por presentación (frasco sellado, decants).
- **Sin pasarela de pagos**: carrito → mensaje de WhatsApp. JFT es el **precedente directo** de "pedidos por WhatsApp sin pasarela de pagos". La **separación del carrito en compra vs encargo es una propuesta propia del brief**, no algo observado en JFT.
- **Ficha de producto** con notas y estética tipo Instagram (fase posterior).

En los catálogos analizados, la taxonomía de acordes y el modelo encargo/compra quedan como **"No evidenciado"**, no como "nadie los tiene".

## Vacíos / oportunidades (formulados con cautela)

- **No evidenciado** en los 5 catálogos un filtro por acordes con taxonomía propia. Es una oportunidad de diferenciación, sin afirmar que no exista en el mercado.
- **No evidenciado** en los 5 un modelo explícito de encargo vs compra por presentación.
- Vesper, Parfumerie y Rouge muestran carrito web y cuotas; no se evidenció pago online sin completar el checkout. Oloroso Pit tiene restricción de **sin pagos online**, así que el pedido por WhatsApp (como JFT) encaja mejor con su modelo.
- Los 3 competidores verificados muestran un nivel de detalle de ficha que Oloroso Pit puede tomar como inspiración: Vesper (precio tachado + % destacado), Rouge (notas salida/corazón/fondo + modo de uso), Juleriaque (selector de presentación con precio dinámico).

## Recomendaciones para el MVP

1. **Modelo de datos con presentaciones por perfume** (frasco sellado, decant 5 ml, decant 10 ml), cada una con precio y stock propios. Este modelo **soporta las tres formas de mostrar decants** (en la ficha, en sección aparte o ambas) sin decidir por los dueños: la decisión de presentación queda como **pregunta abierta**.
2. **Sin checkout:** respetar la restricción de sin pagos online; carrito → mensaje de WhatsApp. JFT es el precedente directo del modelo; la separación compra/encargo es propuesta del brief.
3. **Filtro por acordes + frases "ideal para..."** como propuesta de valor del brief.
4. **Stock:** indicador "En stock" / "Sin stock, por encargo" con precio siempre visible.
5. **Ficha de producto:** inspirarse en Vesper (precio anterior tachado + % destacado), Rouge (notas salida/corazón/fondo + modo de uso) y Juleriaque (selector de presentación con precio dinámico), sin copiar contenido.

## Verificación de fuentes por el desarrollador

| Fuente | URL | Fecha de consulta | Extraído por el agente | Verificado manualmente por el desarrollador |
|--------|-----|-------------------|------------------------|---------------------------------------------|
| JFT Perfumes | https://pedix.app/jftperfumes | 2026-11-05 | ✅ Home y categorías | No |
| Vesper Perfumes | https://www.vesper.com.ar/ | 2026-11-05 | ✅ Home, catálogo y ficha | ✅ Ofertas con precio anterior tachado, % destacado ("50% OFF") y precio final visible |
| Parfumerie | https://www.parfumerie.com.ar/ | 2026-11-05 | ✅ Home y categorías | No |
| Perfumerías Rouge | https://www.perfumeriasrouge.com/ | 2026-11-05 | ✅ Home y `/perfumes-y-fragancias` | ✅ Ficha con desglose de notas olfativas (salida, corazón, fondo), descriptores de estilo y guía gráfica de "Modo de uso" |
| Juleriaque | https://www.juleriaque.com.ar/ | 2026-11-05 | ⚠️ No evidenciado (SPA; solo el título) | ✅ Presentaciones/tamaños (30 ml, 75 ml) con precio dinámico en la misma tarjeta/interfaz de producto |

**Reglas aplicadas:** solo fuentes verificables con URL y fecha de consulta; lo no demostrado públicamente queda como "No evidenciado"; se distingue funcionalidad comprobada (extraída del sitio o verificada en navegador) de afirmación comercial (mensajes del propio sitio).
