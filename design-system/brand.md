# Marca — Oloroso Pit

> **Estado: provisional (TBD).** Este documento propone una dirección visual; no
> afirma hechos de marca aprobados por los dueños. Cada punto indica su fuente o
> queda marcado como pendiente.

- **Revisión:** 1
- **Aprobación:** pendiente (2026-11-05)
- **Alcance:** catálogo público + panel de administración (web responsive)

---

## 1. Nombre

| Campo | Valor | Fuente |
|---|---|---|
| Nombre comercial | **Oloroso Pit** | `docs/discovery/brief-clientes.md` (v5) y `knowledge-base/01_vision_y_objetivos.md` |
| Uso en interfaz | Sin artículo y sin sufijo: "Oloroso Pit", "Catálogo Oloroso Pit" | Propuesta de redacción **(TBD)** |
| Bajada / descriptor | "Perfumes importados" — usado solo como texto de contexto, no como parte del logo | `knowledge-base/02_descripcion_general.md` |
| Dominio | Existe un dominio propio, no registrado en la KB | `knowledge-base/02_descripcion_general.md` **(TBD: cuál es)** |
| Handle de Instagram / WhatsApp | No documentado en la KB | **(TBD)** |

**Punto único de cambio:** `brand.js` → constante `BRAND_NAME`. Todo HTML de
preview usa `data-brand-name`.

---

## 2. Tono visual

**Dirección propuesta: "vidrio ahumado".** Un catálogo editorial, cálido y
sobrio, con verde pino profundo sobre papel mineral. La referencia es una
perfumería de barrio bien curada, no una joyería.

| Atributo | Sí | No |
|---|---|---|
| Temperamento | Sobrio, cálido, preciso | Frío, tecnológico, estridente |
| Lujo | Discreto, por material y espacio | Oro + negro, brillos, mármol genérico |
| Color | Neutros cálidos + un verde profundo + cobre escaso | Beige/marrón de la planilla, lila IA, neón |
| Tipografía | Serif local para nombres; sans para interfaz | Inter, fuentes remotas, serif en el panel |
| Densidad | Aireada en catálogo; compacta y clara en admin | Tarjetas apiladas sin jerarquía |

**Fuente del tono:** propuesta del desarrollador a partir de
`knowledge-base/01_vision_y_objetivos.md` (compra por encargo, asesoramiento,
cierre por WhatsApp) y `knowledge-base/02_descripcion_general.md` (catálogo
público + panel).

**Restricción explícita del cliente:** "los colores de la planilla actual (beige
y marrón) se van a cambiar. Colores nuevos sin definir" —
`docs/discovery/brief-clientes.md`. Por eso esta paleta es una propuesta, no una
continuidad.

**TBD:**
- Validar la dirección con los dueños (¿les resulta "de perfume importado"?).
- Confirmar si el negocio quiere un tono más juvenil (público de Instagram) o
  más sobrio (público de nicho).
- Referencias visuales propias: no hay ninguna en el repositorio.

---

## 3. Voz y redacción

| Regla | Ejemplo | Fuente |
|---|---|---|
| Español rioplatense, trato de "vos" | "Elegí la presentación", "Revisá los datos" | `knowledge-base/01` (catálogo en español rioplatense) |
| Precios siempre visibles, sin letra chica | "$52.400" junto a "Sin stock · por encargo" | `knowledge-base/06_funcionalidades.md` (US-001) |
| "Encargo" no es error | "Sin stock · por encargo", en tono neutro | `knowledge-base/05_reglas_de_negocio.md` |
| Asesoramiento concreto, sin superlativos | "Citas o salir de noche" | `knowledge-base/06` (US-009) |
| Nada de promesas de pago online | "El pedido se envía por WhatsApp. No se paga en el sitio." | `knowledge-base/01` (restricción estricta) |

Evitar: "elevá", "sin límites", "experiencia única", "fragancia de lujo",
signos de exclamación en serie. No usar emojis en la interfaz.

---

## 4. Logo

### Archivo

- Ruta estable: `design-system/assets/logo.svg`
- Formato: SVG con `viewBox="0 0 320 88"`, sin fuentes remotas.
- Composición: sello cuadrado con monograma "OP" + logotipo serif + etiqueta
  cobre "MARCA PROVISIONAL · PLACEHOLDER" con línea punteada.
- El archivo **dice explícitamente que es provisional**. No debe presentarse
  como identidad aprobada.

### Reglas de uso

| Regla | Valor |
|---|---|
| Altura en cabecera | 38 px escritorio / 30 px móvil (el asset se escala desde 88 px) |
| Área de resguardo | Mínimo el alto de la "O" del wordmark a cada lado |
| Fondo | Papel `--color-paper` o superficie blanca; no sobre fotos sin velo |
| Color | Solo la versión original; no recolorear a mano sin actualizar el asset |
| Distorsión | Prohibido estirar, rotar o aplicar sombras |
| Versión reducida | Solo el sello "OP" en contextos menores a 120 px de ancho |

**TBD:**
- ¿Existe un logo real? No hay archivos de marca en el repositorio.
- ¿El nombre lleva alguna bajada ("Perfumes", "Importados")?
- ¿Se usa el monograma como avatar de Instagram/WhatsApp?
- Tipografía definitiva del wordmark: hoy es una serif del sistema
  (Georgia/Palatino), no una fuente de marca.

### Reemplazo

Ver `README.md` → "Cómo reemplazar". Al reemplazar el logo hay que quitar la
leyenda de placeholder, mantener el `viewBox` y volver a renderizar los previews.

---

## 5. Imágenes de producto

| Regla | Valor | Fuente |
|---|---|---|
| Proporción | 4:5 vertical, encuadre centrado | Propuesta de diseño |
| Fondo | Gradiente mineral `#F1F0E9 → #E7E6DC`, sin fondo blanco puro | Propuesta de diseño |
| Objeto | Frasco completo, sin recortes ni manos | **(TBD)** calidad de las fotos |
| Tratamiento | Sin filtros de color fuertes; sin marcos ni brillos | Propuesta de diseño |
| Texto sobre imagen | Permitido solo el tag de oferta o estado | Propuesta de diseño |
| Placeholder | `assets/product-placeholder.svg` con leyenda "SIN IMAGEN" | `knowledge-base/06` (US-001: no mostrar hueco roto) |
| Alt text | "Frasco de {marca} {nombre}" cuando exista foto real | Accesibilidad |

**TBD:**
- Origen de las fotos: ¿las de la planilla, nuevas, o provistas por los dueños?
- Quién las sube y con qué calidad mínima.
- Si se permite una segunda imagen por perfume (no está en el alcance v1).

Nunca usar fotos de stock con marcas de agua, capturas de Instagram con textos
superpuestos, ni imágenes de otro perfume como relleno.

---

## 6. Color y material (resumen)

La paleta completa vive en `tokens.css`. Dirección:

- **Papel** `#F6F5F0` y **arena** `#EFEEE7`: base cálida, no beige.
- **Verde pino** `#1E3B31`: marca, botones, selección.
- **Cobre** `#A05C3B`: exclusivamente ofertas y énfasis editorial.
- **Verde stock** `#2C6A4C` y **oliva encargo** `#7B6636`: estados.
- **Tinta** `#1B211E`: nunca negro puro.
- **Alerta** `#A33B33`: solo errores reales.

Regla: un solo color de acción por pantalla. El cobre no se usa para botones
primarios. El estado nunca se comunica solo por color: siempre lleva texto.

**TBD:** aprobación de la paleta por los dueños; verificar contraste si se
ajustan los valores.

---

## 7. Movimiento

- Entradas con `--ease-out` (arranca rápido), 120–240 ms.
- Presión de botón: `scale(0.98)` en 120 ms.
- Sin animaciones en acciones de teclado ni en listas de uso frecuente.
- `prefers-reduced-motion`: se elimina todo desplazamiento; quedan transiciones
  de color de 80 ms.
- Sin parallax, sin autoplay de video, sin carga pesada: el hardware del equipo
  es limitado (`knowledge-base/01`).

**TBD:** el nivel de movimiento del catálogo final; esta base propone el mínimo
necesario.

---

## 8. Qué evitar

- Repetir el beige/marrón de la planilla como color principal.
- Oro + negro + mármol como atajo de "lujo".
- Degradados de texto, glows, neón, lila IA.
- Emojis en la interfaz o en el logo.
- Mostrar "agotado" en gris deshabilitado: el encargo es una venta válida.
- Prometer pago online, cuotas o checkout.
- Usar el logo provisional en materiales externos (redes, impresos) sin
  reemplazarlo antes.

---

## Fuentes consultadas

- `docs/discovery/brief-clientes.md` (v5, 2026-11-05)
- `knowledge-base/01_vision_y_objetivos.md`
- `knowledge-base/02_descripcion_general.md`
- `knowledge-base/03_actores_y_roles.md`
- `knowledge-base/06_funcionalidades.md`
- `design-system/tokens.css`, `design-system/brand.js`, `design-system/assets/logo.svg`
