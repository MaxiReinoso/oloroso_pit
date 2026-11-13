# Sistema visual — Oloroso Pit

```
Mode: system-and-mockups
Revision: 4
Approval: approved (2026-11-13, by user)
```

> **Identidad confirmada, logo todavía no.** Los clientes confirmaron la
> identidad visual el 2026-11-11 (decisión **D-07**): paleta morado/naranja,
> tipografía redondeada y estilo pop urbano. La **revisión 4 (2026-11-13)**
> ajusta los fondos lila a `--color-surface-alt: #CC7BCA`, `--color-paper:
> #F0BBEA` y oscurece `--color-ink-soft: #451452`. Los tokens
> `--color-lilac-050` y `--color-lilac-300` se conservan como estaban. El
> **logo real sigue siendo un placeholder** rotulado como tal: no existe un
> archivo de marca aprobado.

Este documento es la fuente de verdad de la fundación visual. Los mockups de
cada change (`openspec/changes/<name>/mockups/`) reutilizan esta misma revisión.

---

## 1. Política visual del proyecto

`Mode: system-and-mockups` — la política pedida para Oloroso Pit:

1. Se define el sistema visual una sola vez (este directorio).
2. Antes de implementar cada cambio visual se crea un mockup HTML local y se
   revisa con el usuario.
3. La implementación no empieza hasta que ese mockup esté aprobado.

**Estado:** `Revision: 4` **aprobada por el usuario el 2026-11-13**. La revisión 1
(verde pino + cobre + serif) fue aprobada el 2026-11-05 y **quedó reemplazada**
por la identidad oficial. La revisión 2 (fondos naranja) fue revisada por los
dueños, que pidieron fondos lila; la revisión 3 la reemplazó y la revisión 4
ajusta sus valores (`#CC7BCA` exterior, `#F0BBEA` interior, `#451452` tinta
suave) con contraste WCAG verificado. La revisión 4 queda vigente para los
mockups de cada change.

---

## 2. Contenido

| Archivo | Qué es |
|---|---|
| `README.md` | Este documento: política, alcance, reemplazos y decisiones abiertas. |
| `brand.md` | Nombre, tono, reglas de logo e imágenes, con fuente o `(TBD)`. |
| `brand.js` | Constante única del nombre + binding `[data-brand-name]`. |
| `tokens.css` | Variables de color, tipografía, espaciado, radios, sombras, foco y movimiento. |
| `components.html` | Referencia visual: cabecera, tarjetas, filtros, ficha, carrito, controles, formularios, login y estados. |
| `assets/logo.svg` | Logo **placeholder** rotulado como provisional, ya en la paleta nueva. |
| `assets/product-placeholder.svg` | Placeholder 4:5 para perfumes sin foto. |
| `previews/` | Capturas 390×844 y 1440×900 + instrucciones de re-render. |
| — | Los mockups de cada change viven en `openspec/changes/<name>/mockups/`; el shell de C-01 está en `openspec/changes/c-01-fundacion-proyecto/mockups/` (gate de aprobación). |

Sin build, sin Figma y sin cuentas pagas. **Sí hay dos fuentes de Google
Fonts** (DynaPuff y Nunito), decisión aceptada con la identidad oficial; en
producción se auto-hospedan (ver §8.4). Sin JS salvo `brand.js`.

---

## 3. Brief de diseño

### Producto

Catálogo web de perfumes importados (lanza con la línea Árabes) vendidos en su
mayoría **por encargo**. El cierre comercial ocurre en WhatsApp mediante un deep
link: **no hay checkout, ni pagos, ni cuentas de cliente, ni datos personales**.
También incluye un panel de administración para los dos dueños.

Fuente: `knowledge-base/01_vision_y_objetivos.md`,
`knowledge-base/02_descripcion_general.md`.

### Audiencias

- **Comprador final** (móvil, llega desde Instagram/WhatsApp): necesita ver
  precio y disponibilidad sin preguntar, filtrar por acordes y género, y armar
  el pedido rápido.
- **Administradores** (2 personas, sin perfil técnico): cargan perfumes y editan
  precios, stock e imágenes sin depender de un desarrollador.

Fuente: `knowledge-base/03_actores_y_roles.md`,
`knowledge-base/06_funcionalidades.md`.

### Restricciones que condicionan el diseño

| Restricción | Consecuencia visual |
|---|---|
| Sin pasarela de pagos | Un único CTA de cierre: "Enviar pedido por WhatsApp". Nada de formularios de tarjeta. |
| No se guardan datos de clientes | El carrito es local; no hay "mi cuenta", login de comprador ni checkout. |
| Infraestructura gratuita, hardware limitado | CSS/SVG locales, sin librerías pesadas; las dos fuentes se auto-hospedan en producción. |
| Stock escaso, venta por encargo | "Sin stock" no es un error ni deshabilita la compra. |
| Precio siempre visible | El precio es el elemento de mayor jerarquía en la tarjeta. |
| Identidad oficial confirmada (D-07) | Paleta y tipografía ya no son propuesta: mandan sobre el brief anterior. |
| Logo real inexistente | El placeholder se rotula como provisional en todo contexto visible. |

Fuente: `docs/discovery/brief-clientes.md`,
`knowledge-base/06_funcionalidades.md`, confirmación de identidad del 2026-11-11.

### Dirección visual

**"Pop urbano".** Morado profundo, naranja vibrante, fondos lila y tipografía
redondeada con extrusión sólida. La referencia es una gráfica de Instagram de
barrio bien hecha: alegre, directa, sin solemnidad de joyería.

| Atributo | Sí | No |
|---|---|---|
| Temperamento | Pop, vibrante, urbano, cercano | Sobrio, editorial, minimalista frío |
| Color | Morado `#30004b`, naranja `#febd59`, lila exterior `#CC7BCA`, lila interior `#F0BBEA`, blanco puro | Beige/marrón de la planilla, fondos naranja, pasteles desaturados, oro + negro |
| Tipografía | DynaPuff para display; Nunito para cuerpo y UI | Serif, Molenila, sans geométricas finas de 300 |
| Forma | Radios grandes, sombras duras sin difuminado, bordes definidos | Sombras difusas, glassmorphism, degradados suaves |
| Títulos | Naranja con extrusión morada, tamaño grande | Extrusión en párrafos, precios o textos pequeños |
| Densidad | Aireada en catálogo; clara y directa en panel | Bloques apilados sin jerarquía |

Reglas de producto reflejadas en la interfaz:

- La tarjeta **no** agrega al carrito: lleva a la ficha, porque precio y stock
  dependen de la presentación (frasco o decant).
- Compra y encargo se separan en el carrito y en el mensaje de WhatsApp.
- Los estados llevan texto además de color.
- El panel usa la misma identidad, con menos decoración y más contraste.

---

## 4. Tokens (resumen)

Todo valor visual sale de `tokens.css`. No hay colores ni tamaños hardcodeados
en componentes, salvo valores geométricos de layout.

### 4.1 Color

| Token | Hex | Uso |
|---|---|---|
| `--color-primary-700` | `#30004b` | **Marca** y acción primaria |
| `--color-accent-600` | `#febd59` | **CTA, ofertas y énfasis** |
| `--color-accent-100` | `#ffdeab` | Texto suave sobre morado (pie); ya no es fondo |
| `--color-surface-alt` | `#CC7BCA` | **Fondo general/exterior** y secciones secundarias |
| `--color-paper` | `#F0BBEA` | **Paneles interiores**, avisos y portada |
| `--color-lilac-300` | `#e69ade` | Lila de la Rev. 3, conservado |
| `--color-lilac-050` | `#ffe6fb` | Lila de la Rev. 3, conservado |
| `--color-lilac-100` | `#ffabf8` | Base de referencia de la familia lila |
| `--color-surface` | `#FFFFFF` | Tarjetas, paneles, ficha |
| `--color-band` | `#30004B` | Franjas de marca (barra superior, pie) |
| `--color-ink` | `#30004B` | Texto principal |
| `--color-ink-soft` | `#451452` | Texto secundario; mínimo sobre lila exterior |
| `--color-ink-muted` | `#7A4A8A` | Metadatos y ayudas sobre blanco/interior (no sobre exterior) |
| `--color-line` | `#E9D5EF` | Bordes de 1 px |
| `--color-stock` | `#0F6B3F` | "En stock" |
| `--color-order` | `#8A5200` | "Sin stock · por encargo" |
| `--color-offer` | `#30004B` | Texto sobre la etiqueta de oferta |
| `--color-offer-soft` | `#FEBD59` | Fondo de la etiqueta de oferta |
| `--color-danger` | `#B3261E` | Errores reales |
| `--color-focus` | `#30004B` | Anillo de foco en fondos claros |

### 4.2 Contraste — reglas duras

Medido con WCAG 2.1 sobre los pares reales de la **revisión 4**
(`#30004B` / `#451452` / `#7A4A8A` sobre `#FFFFFF`, `#F0BBEA` y `#CC7BCA`):

| Par | Ratio | Veredicto |
|---|---|---|
| Tinta `#30004B` sobre blanco | **17.11:1** | AAA |
| Tinta sobre papel lila `#F0BBEA` | **10.59:1** | AAA |
| Tinta sobre lila exterior `#CC7BCA` | **5.91:1** | AA |
| Texto suave `#451452` sobre blanco | **14.24:1** | AAA |
| Texto suave sobre papel lila | **8.81:1** | AAA |
| Texto suave sobre lila exterior | **4.92:1** | AA |
| Texto atenuado `#7A4A8A` sobre blanco | **6.62:1** | AA |
| Texto atenuado sobre papel lila | **4.10:1** | **solo texto grande** |
| Texto atenuado sobre lila exterior | **2.29:1** | **prohibido** |
| Naranja `#FEBD59` sobre morado | **10.30:1** | AAA |
| Morado sobre naranja `#FEBD59` | **10.30:1** | AAA |
| Blanco sobre naranja `#FEBD59` | **1.66:1** | **prohibido** |
| Blanco sobre papel lila `#F0BBEA` | **1.62:1** | **prohibido** |
| Blanco sobre lila exterior `#CC7BCA` | **2.90:1** | **prohibido para texto** |
| Naranja `#FEBD59` sobre papel lila | **1.03:1** | **prohibido** |
| Estados `#0F6B3F` / `#8A5200` / `#B3261E` sobre blanco | **6.57 / 6.39 / 6.54:1** | AA |
| Esos estados sobre papel lila | **≈ 4.0:1** | **solo texto grande** |
| Esos estados sobre lila exterior | **≈ 2.2:1** | **prohibido** |

Consecuencias obligatorias:

1. **Nunca texto blanco sobre naranja vibrante.** Todo relleno naranja lleva
   texto morado (`--color-offer` / `--color-primary-700`).
2. **Las tarjetas son blancas.** El lila exterior es el fondo general; el papel
   lila es para paneles, avisos y portada. Ningún texto blanco va sobre lila:
   2.90:1 en el exterior y 1.62:1 en el interior.
3. **El texto atenuado no va sobre el lila exterior** (2.29:1) **ni sobre el
   papel lila** para cuerpo de texto (4.10:1). En el exterior, usá
   `--color-ink-soft` (4.92:1). Los estados (`stock`, `order`, `danger`) van
   siempre sobre blanco; sobre papel lila solo en texto grande (≥ 24 px / 18.66
   px bold) y nunca sobre el exterior.
4. **El título extruido es decorativo, no cuerpo de texto.** El relleno naranja
   sobre blanco mide 1.66:1: solo se usa en titulares grandes (≥ 28 px). Sobre
   fondos claros siempre lleva `-webkit-text-stroke: var(--title-stroke-lg)` con
   `paint-order: stroke fill`, para que el contorno morado sostenga la forma.
   Precios, descripciones y navegación van siempre en morado.

### 4.3 Tipografía

| Token | Valor | Uso |
|---|---|---|
| `--font-display` | `"DynaPuff", ui-rounded, "Segoe UI Rounded", "Trebuchet MS", system-ui, sans-serif` | Nombres de perfume, h1/h2, cifras destacadas |
| `--font-sans` | `"Nunito", ui-sans-serif, "Segoe UI Variable Text", "Segoe UI", system-ui, …` | Interfaz, cuerpo, panel, precios |
| `--font-mono` | `ui-monospace, "Cascadia Mono", Consolas, …` | Valores técnicos y números de referencia |
| `--text-display` | `clamp(2.5rem, 1.35rem + 4vw, 4.25rem)` | Portada |
| `--text-2xs` … `--text-4xl` | `0.6875rem` … `3rem` | Escala completa |
| `--title-fill` | `#FEBD59` | Relleno de titulares extruidos |
| `--title-extrude` | `2px 2px 0 #30004B, 4px 4px 0 #30004B` | Extrusión estándar |
| `--title-extrude-lg` | `3px 3px 0 …, 6px 6px 0 …` | Portada (H1) |
| `--title-stroke` | `1px #30004B` | Contorno de seguridad sobre fondos claros |
| `--title-stroke-lg` | `2px #30004B` | Contorno de titulares grandes (≥ 48 px) |

Pesos: DynaPuff en 600–700 para titulares; Nunito 400/500/600/700 para UI.
Nunca 300 (se pierde legibilidad en pantallas de gama baja).

### 4.4 Espaciado, forma y movimiento

- Espaciado: escala de 4 px (`--space-1` = 4 px … `--space-9` = 96 px).
- Radios: `6` / `10` / `14` / `20` / `28` / `pill`. Más redondeados que la
  revisión 1 para acompañar la estética pop.
- Sombras: **duras, sin blur**, en morado (`2px`, `4px`, `6px` de offset).
  `--shadow-hard-accent` existe para fondos morados.
- Movimiento: `120 ms`, `180 ms`, `240 ms`; curvas
  `cubic-bezier(0.23, 1, 0.32, 1)`, `cubic-bezier(0.77, 0, 0.175, 1)` y
  `--ease-pop` para micro-rebotes.
- Presión táctil: `scale(0.97)` en 120 ms; hover de tarjeta: `translateY(-3px)`.
- `prefers-reduced-motion`: sin desplazamientos; color/opacidad en 80 ms.
- Contenedor: `max-width: 1240px`, padding lateral fluido.

---

## 5. Componentes incluidos

`components.html` cubre, con sus estados:

1. **Fundamentos:** swatches, escala tipográfica, extrusión, radios, sombras, espaciado.
2. **Cabecera:** marca, navegación por línea, buscador, carrito con contador,
   variante móvil.
3. **Tarjetas:** en stock, sin stock (encargo), oferta, con decants.
4. **Filtros:** línea, género, acordes, oferta, contador de resultados y
   "limpiar".
5. **Ficha:** acordes, frases "ideal para…", selector de presentación con precio
   y stock, cantidad, agregar al pedido, aviso de WhatsApp.
6. **Carrito:** compra y encargo separados, subtotales, total, CTA WhatsApp,
   microcopy de "no se paga en el sitio" y vista del mensaje que recibe el
   WhatsApp.
7. **Controles:** botones primario/secundario/terciario/peligro/deshabilitado/
   cargando, tamaños, tags y estados de stock.
8. **Formularios:** campos con ayuda y error, select, textarea, checkbox, switch,
   confirmación.
9. **Admin:** login con error genérico y nota de recuperación.
10. **Estados:** skeleton de carga, carrito vacío, sin resultados, alertas.

No incluye pantallas completas de home, listado o panel: eso corresponde a los
mockups de cada change.

---

## 6. Preview

### Capturas renderizadas

| Archivo | Viewport | Revisión |
|---|---|---|
| `previews/components-mobile-390x844.png` | 390 × 844 | rev 4 (2026-11-13) |
| `previews/components-desktop-1440x900.png` | 1440 × 900 | rev 4 (2026-11-13) |
| `../openspec/changes/c-01-fundacion-proyecto/mockups/previews/shell-mobile-390x844.png` | 390 × 844 | rev 4 (2026-11-13) |
| `../openspec/changes/c-01-fundacion-proyecto/mockups/previews/shell-desktop-1440x900.png` | 1440 × 900 | rev 4 (2026-11-13) |

Se generan con Chrome headless + DevTools Protocol y
`Emulation.setDeviceMetricsOverride` (390 × 844 exactos). No hay Playwright MCP
instalado en el entorno. Las capturas de este directorio son de viewport; el
mockup del shell también tiene versiones de página completa.

El HTML se abre localmente, sin servidor:

- `design-system/components.html` (doble clic).
- `openspec/changes/c-01-fundacion-proyecto/mockups/shell.html` (doble clic).

Las fuentes se cargan del CDN de Google Fonts en los previews. Para revisar sin
internet, usar los fallbacks del sistema (cambia el aspecto, no el layout).

### Re-renderizar

**Importante (Windows):** `chrome --headless --window-size=390,844` **no**
produce un viewport de 390 px: Chrome impone un ancho mínimo de ventana y el
layout sale a ~485 px, por lo que la captura queda recortada. Hay dos formas
correctas:

1. **Manual (recomendada para revisar):** abrir el HTML en Chrome,
   F12 → activar la barra de dispositivos (Ctrl+Shift+M) → elegir 390 × 844
   (iPhone 12/13) → capturar. Repetir con 1440 × 900.
2. **Automatizada:** usar DevTools Protocol con
   `Emulation.setDeviceMetricsOverride` antes de `Page.captureScreenshot`
   (es lo que se usó para los PNG de este directorio).

Si se usa `--screenshot`, verificar el resultado: el header debe entrar en una
columna y no debe haber scroll horizontal.

### Qué mirar

- La cabecera no se rompe a 390 px (se ocultan nav y buscador).
- El morado y el naranja no se tocan sin separación (bordes o blanco de por
  medio) y ningún texto blanco cae sobre naranja.
- El lila exterior no lleva texto atenuado ni texto blanco; el texto vive sobre
  interior o blanco.
- La extrusión no invade el titular siguiente ni se corta en el borde.
- La ficha pasa a una columna y el selector de presentación sigue legible.
- El carrito no supera el ancho de la pantalla.
- Los precios se leen sin esfuerzo (Nunito, ≥ 16 px, morado).
- El foco visible funciona con Tab en botones, chips y campos.
- El logo muestra su leyenda de provisional.

---

## 7. Aprobación

`Approval: approved (2026-11-13, by user)` — revisión 4 aprobada por el usuario
tras revisar `components.html`, el mockup del shell de C-01 y los previews.

La aprobación cubre la fundación visual, **no** cada mockup de change: en
`system-and-mockups` cada change visual sigue necesitando su propio mockup
aprobado antes de implementar.

Si se pide un cambio de tokens o assets compartidos, se sube la revisión y la
aprobación vuelve a `pending` hasta una nueva revisión explícita.

Un pedido de cambios mantiene `Approval: pending` y sube la revisión si se
modifica un token o asset compartido.

**Se puede aprobar con `(TBD)` visibles** (logo, fotos) siempre que estén
rotulados como provisionales. Lo que no se puede es presentarlos como finales.

---

## 8. Cómo reemplazar

### 8.1 El nombre

1. Abrir `design-system/brand.js`.
2. Cambiar solo la constante:
   ```js
   var BRAND_NAME = "Nuevo Nombre";
   ```
3. Actualizar también el texto de respaldo en `components.html` y en los
   mockups (los elementos con `data-brand-name`) para que el HTML siga siendo
   correcto sin JS.
4. Actualizar `brand.md` §1 y la tabla de fuentes.
5. Re-renderizar los previews.
6. Subir `Revision:` en este README y volver a pedir aprobación.

No hace falta tocar CSS: el nombre no está en ningún token.

### 8.2 El logo

1. Reemplazar el archivo en `design-system/assets/logo.svg` (mismo nombre y
   ruta). Mantener un `viewBox` horizontal similar a `0 0 320 88`.
2. Quitar la leyenda "MARCA PROVISIONAL · PLACEHOLDER" del SVG únicamente cuando
   exista un logo aprobado.
3. Verificar que se lea a 30–38 px de alto (tamaño de cabecera) y que la
   extrusión no se empaste a ese tamaño.
4. Revisar `assets/` en busca de copias antiguas; no debe quedar más de un logo.
5. Actualizar `brand.md` §4 (origen, reglas, autor).
6. Re-renderizar los previews y pedir aprobación.

Para el logo reducido (sello "OP") se recomienda un archivo aparte,
`assets/logo-mark.svg`, cuando exista la identidad real.

### 8.3 Colores, tipografía y demás tokens

1. Editar **solo** `design-system/tokens.css`.
2. No escribir valores hex ni `px` de color dentro de `components.html` ni de
   los mockups; usar `var(--token)`.
3. Verificar contraste de los pares texto/fondo (mínimo 4.5:1 para texto normal,
   3:1 para texto grande y bordes de foco). Recordar las reglas del naranja y
   del lila exterior.
4. Revisar que "En stock", "Encargo", "Oferta" y "Alerta" sigan diferenciándose,
   y que el estado no dependa solo del color.
5. Re-renderizar los previews y los mockups afectados.
6. Subir `Revision:` y listar los mockups afectados. La aprobación vuelve a
   `pending`.
7. Actualizar el resumen de §4 en este README y `brand.md` §6.

### 8.4 Fuentes (DynaPuff + Nunito)

Los previews las cargan del CDN de Google Fonts para revisión sin setup:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DynaPuff:wght@400..700&family=Nunito:wght@400;500;600;700&display=swap" rel="stylesheet">
```

**En producción se auto-hospedan** (C-01). Motivo: la restricción del proyecto
es infraestructura gratuita y hardware limitado; no conviene depender de un CDN
externo para la tipografía de marca.

1. Descargar los `.woff2` (subset latin) de DynaPuff 400–700 y Nunito 400–700.
2. Copiarlos a `design-system/assets/fonts/`.
3. Declarar `@font-face` en `tokens.css` con `font-display: swap` y ruta
   relativa.
4. Confirmar licencia (ambas son SIL Open Font License) e incluirla en
   `assets/fonts/`.
5. Mantener `--font-display` / `--font-sans` apuntando a las mismas familias.
6. Re-renderizar y aprobar.

### 8.5 Cambiar la política visual

Solo por pedido explícito del usuario. Actualizar `Mode:` acá y
`visual_design.mode` en `.active-orchestrator-state.json`. Si pasa a `off` o
`system-only`, no se borra esta fundación: se conserva para cuando se retome.

---

## 9. Reglas de revisión

- Cambiar un token o asset compartido = **nueva revisión**.
- Cambiar el texto de un componente sin tocar tokens = no cambia la revisión,
  pero sí se re-renderiza el preview.
- Nunca editar un mockup aprobado en silencio: se muestra el cambio.
- Los mockups de cada change enlazan esta revisión en su `design.md`
  (`Design system revision: 4`).
- Ningún componente puede introducir un color propio: si falta un matiz, se
  agrega el token acá.

---

## 10. Decisiones abiertas `(TBD)`

| # | Decisión | Impacto | Estado |
|---|---|---|---|
| 1 | ~~Paleta definitiva~~ | Toda la interfaz | **Resuelta (D-07, 2026-11-11; Rev. 4, 2026-11-13):** morado `#30004b`, naranja `#febd59`, lila exterior `#CC7BCA`, lila interior `#F0BBEA`, tinta suave `#451452`, DynaPuff + Nunito |
| 2 | **Logo real** y versión reducida | Cabecera, redes, impresos | **Pendiente**: solo existe placeholder; la paleta ya está confirmada |
| 3 | Nombre exacto y bajada ("Oloroso Pit" / "Perfumes") | `brand.js`, logo | A confirmar |
| 4 | Fotos: origen, calidad y responsable de subirlas | Tarjetas y ficha | Abierto en la KB |
| 5 | Detalle de ofertas (% o precio tachado, vencimiento, decants) | Tag y precio | Abierto (US-006) |
| 6 | Decants integrados / sección aparte / ambos | Ficha y navegación | Abierto en la KB |
| 7 | Semántica de acordes múltiples (OR) | Filtros y contadores | Resuelta a nivel técnico (D-09), falta validar datos |
| 8 | Buscador en v1 (US-010) | Cabecera | Fuera del MVP según CHANGES §8 |
| 9 | Login con correo vs. usuario genérico | Campo del login | Abierto |
| 10 | Recuperación de contraseña en v1 | Nota del login | Fuera del MVP |
| 11 | Tono: más juvenil (Instagram) o más sobrio | Dirección visual | **Resuelta:** pop urbano (identidad confirmada) |

---

## 11. Fuera de alcance de esta fundación

- Pantallas completas y flujos navegables (van en mockups por change).
- Ilustraciones, iconografía propia o fotografía de producto.
- Modo oscuro (no está en el brief; la paleta actual es solo clara).
- Internacionalización y multi-moneda.
- Cualquier recurso pago.

---

## 12. Fuentes

- `docs/discovery/brief-clientes.md` (v5, 2026-11-05)
- Confirmación de identidad visual de los clientes (2026-11-11, decisión D-07)
- `knowledge-base/01_vision_y_objetivos.md`
- `knowledge-base/02_descripcion_general.md`
- `knowledge-base/03_actores_y_roles.md`
- `knowledge-base/06_funcionalidades.md`
- `CHANGES.md` §6 (D-07) y §7
- `.active-orchestrator-state.json` (política `visual_design`)
- `design-system/brand.md`, `tokens.css`, `brand.js`, `components.html`

---

**Handoff:** mode `system-and-mockups` · revision `4` · status `approved` (2026-11-13) ·
previews en `design-system/previews/` · mockup del shell en
`openspec/changes/c-01-fundacion-proyecto/mockups/` · decisiones abiertas en §10.
