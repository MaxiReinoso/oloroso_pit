# Marca — Oloroso Pit

> **Estado: identidad confirmada, logo pendiente.** Los clientes confirmaron la
> paleta, la tipografía y el estilo general el 2026-11-11 (D-07). El logo real
> todavía no existe: el archivo actual es un placeholder rotulado.

- **Revisión:** 2
- **Aprobación:** pendiente (2026-11-11)
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

**Dirección confirmada: "pop urbano".** Morado profundo, naranja vibrante y
tipografía redondeada con extrusión sólida. La referencia es una gráfica de
Instagram de barrio bien hecha: alegre, directa y cercana, sin solemnidad de
joyería.

| Atributo | Sí | No |
|---|---|---|
| Temperamento | Pop, vibrante, urbano | Sobrio, editorial, frío |
| Lujo | Cercano y honesto: buen precio, buen perfume | Oro + negro, mármol, brillos |
| Color | Morado `#30004B` + naranja `#FEBD59` + naranja claro `#FFDEAB` + blanco puro | Beige/marrón de la planilla, pasteles desaturados |
| Tipografía | DynaPuff para display; Nunito para cuerpo y UI | Serif, Molenila, sans finas de 300 |
| Forma | Radios grandes, sombras duras sin difuminado | Sombras difusas, glassmorphism, degradados suaves |
| Densidad | Aireada en catálogo; clara y directa en admin | Tarjetas apiladas sin jerarquía |

**Fuente del tono:** confirmación de identidad visual de los clientes
(2026-11-11, decisión D-07), sobre
`knowledge-base/01_vision_y_objetivos.md` y
`knowledge-base/02_descripcion_general.md`.

**Restricción explícita del cliente:** "los colores de la planilla actual (beige
y marrón) se van a cambiar" — `docs/discovery/brief-clientes.md`. La identidad
oficial los reemplaza por morado y naranja; no hay continuidad con el beige.

**TBD:** validar el nombre y la bajada; conseguir el logo real.

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
- Composición: sello redondeado morado con monograma "OP" en naranja +
  logotipo redondeado morado con extrusión naranja + etiqueta
  "MARCA PROVISIONAL · PLACEHOLDER" con línea punteada.
- El archivo **dice explícitamente que es provisional**. No debe presentarse
  como identidad aprobada.
- El SVG no puede cargar webfonts: usa una sans redondeada del sistema como
  aproximación de DynaPuff. El wordmark definitivo debe venir como vector.

### Reglas de uso

| Regla | Valor |
|---|---|
| Altura en cabecera | 44 px escritorio / 34 px móvil (el asset se escala desde 88 px) |
| Área de resguardo | Mínimo el alto de la "O" del wordmark a cada lado |
| Fondo | Blanco, naranja claro `#FFDEAB` o morado; nunca sobre foto sin velo |
| Color | Solo la versión original; no recolorear a mano sin actualizar el asset |
| Distorsión | Prohibido estirar, rotar o aplicar sombras adicionales |
| Extrusión | Ya está dentro del SVG; no duplicarla con CSS sobre la imagen |
| Versión reducida | Solo el sello "OP" en contextos menores a 120 px de ancho |

**TBD:**
- ¿Existe un logo real? No hay archivos de marca en el repositorio.
- ¿El nombre lleva alguna bajada ("Perfumes", "Importados")?
- ¿Se usa el monograma como avatar de Instagram/WhatsApp?
- Tipografía definitiva del wordmark: hoy es una aproximación; la marca usa
  DynaPuff en la web.

### Reemplazo

Ver `README.md` → "Cómo reemplazar". Al reemplazar el logo hay que quitar la
leyenda de placeholder, mantener el `viewBox` y volver a renderizar los previews.

---

## 5. Imágenes de producto

| Regla | Valor | Fuente |
|---|---|---|
| Proporción | 4:5 vertical, encuadre centrado | Propuesta de diseño |
| Fondo | Degradado `#FFF2DD → #FFDEAB` (`--product-bg`), sin blanco puro | Identidad pop urbana |
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

La paleta completa vive en `tokens.css`. Dirección **pop urbana**:

- **Morado marca** `#30004B`: marca, botones primarios, franjas, texto.
- **Naranja vibrante** `#FEBD59`: CTA, ofertas, etiquetas, títulos extruidos.
- **Naranja claro** `#FFDEAB`: fondo general y secciones secundarias.
- **Blanco puro** `#FFFFFF`: tarjetas, paneles y ficha. Sin tints.
- **Verde stock** `#0F6B3F` y **ámbar encargo** `#8A5200`: estados.
- **Alerta** `#B3261E`: solo errores reales.

Reglas duras:

1. **Nunca blanco sobre naranja** (1.66:1). Todo relleno naranja lleva texto
   morado.
2. **Un solo color de acción por pantalla.** El CTA principal es morado con
   texto blanco; el naranja se reserva para ofertas y acciones secundarias de
   énfasis.
3. **Tarjetas siempre blancas.** El naranja claro es fondo, no superficie de
   lectura.
4. **El estado nunca se comunica solo por color:** siempre lleva texto.
5. **La extrusión es decorativa.** Nunca en precios, párrafos ni botones.

Ratios verificados: tinta sobre blanco 17.11:1, tinta sobre naranja claro
13.27:1, naranja sobre morado 10.30:1, blanco sobre morado 17.11:1.

---

## 7. Movimiento

- Entradas con `--ease-out` (arranca rápido), 120–240 ms.
- Presión de botón: `scale(0.97)` en 120 ms.
- Hover de tarjeta: `translateY(-3px)` + sombra dura de 4 px (sin blur).
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
- Texto blanco sobre naranja vibrante (falla contraste).
- Degradados suaves, glows, sombras difusas: la identidad usa sombras duras.
- Serif o Molenila (descartadas por el cliente): la marca es redondeada.
- Extrusión en cuerpos de texto, precios, botones o íconos.
- Emojis en la interfaz o en el logo.
- Mostrar "agotado" en gris deshabilitado: el encargo es una venta válida.
- Prometer pago online, cuotas o checkout.
- Usar el logo provisional en materiales externos (redes, impresos) sin
  reemplazarlo antes.

---

## Fuentes consultadas

- `docs/discovery/brief-clientes.md` (v5, 2026-11-05)
- Confirmación de identidad visual de los clientes (2026-11-11, D-07)
- `knowledge-base/01_vision_y_objetivos.md`
- `knowledge-base/02_descripcion_general.md`
- `knowledge-base/03_actores_y_roles.md`
- `knowledge-base/06_funcionalidades.md`
- `design-system/tokens.css`, `design-system/brand.js`, `design-system/assets/logo.svg`
