# Sistema visual — Oloroso Pit

```
Mode: system-and-mockups
Revision: 1
Approval: pending (2026-11-05, pending user review)
```

> **Provisional.** Los colores, la tipografía, el logo y el nombre son propuestas
> pendientes de aprobación. Nada de este directorio debe presentarse a los
> dueños como identidad final.

Este documento es la fuente de verdad de la fundación visual. Los mockups de
cada change (`openspec/changes/<name>/mockups/`) reutilizan esta misma revisión.

---

## 1. Política visual del proyecto

`Mode: system-and-mockups` — la política pedida para Oloroso Pit:

1. Se define el sistema visual una sola vez (este directorio).
2. Antes de implementar cada cambio visual se crea un mockup HTML local y se
   revisa con el usuario.
3. La implementación no empieza hasta que ese mockup esté aprobado.

La política aplica al catálogo público y al panel. El gate de mockups por cambio
lo ejecuta la skill `design-mockups`; esta fundación no crea pantallas finales.

**Estado:** pendiente. La aprobación la otorga el usuario tras revisar
`components.html` y los previews. Hasta entonces, `Approval: pending`.

---

## 2. Contenido

| Archivo | Qué es |
|---|---|
| `README.md` | Este documento: política, alcance, reemplazos y decisiones abiertas. |
| `brand.md` | Nombre, tono, reglas de logo e imágenes, con fuente o `(TBD)`. |
| `brand.js` | Constante única del nombre + binding `[data-brand-name]`. |
| `tokens.css` | Variables de color, tipografía, espaciado, radios, sombras, foco y movimiento. |
| `components.html` | Referencia visual: cabecera, tarjetas, filtros, ficha, carrito, controles, formularios, login y estados. |
| `assets/logo.svg` | Logo **placeholder** rotulado como provisional. |
| `assets/product-placeholder.svg` | Placeholder 4:5 para perfumes sin foto. |
| `previews/` | Capturas 390×844 y 1440×900 + instrucciones de re-render. |

Sin dependencias, sin build, sin fuentes remotas, sin Figma, sin cuentas pagas.
Se abre con doble clic en cualquier navegador moderno.

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
| Infraestructura gratuita, hardware limitado | Solo CSS/SVG locales, sin fuentes remotas ni librerías pesadas. |
| Stock escaso, venta por encargo | "Sin stock" no es un error ni deshabilita la compra. |
| Precio siempre visible | El precio es el elemento de mayor jerarquía en la tarjeta. |
| Colores actuales (beige/marrón) se cambian | Paleta nueva propuesta, marcada como provisional. |

Fuente: `docs/discovery/brief-clientes.md`,
`knowledge-base/06_funcionalidades.md`.

### Dirección visual

**"Vidrio ahumado":** papel mineral cálido, verde pino profundo y cobre escaso.
Editorial y sobrio, sin el atajo oro + negro. La tipografía display es una serif
del sistema (Georgia/Palatino); la interfaz usa la sans del sistema. No se
descarga ninguna fuente.

Decisiones de producto reflejadas en la interfaz:

- La tarjeta **no** agrega al carrito: lleva a la ficha, porque precio y stock
  dependen de la presentación (frasco o decant).
- Compra y encargo se separan en el carrito y en el mensaje de WhatsApp.
- Los estados llevan texto además de color.
- El panel es sans, denso y directo; el catálogo es serif y aireado.

---

## 4. Tokens (resumen)

Todo valor visual sale de `tokens.css`. No hay colores ni tamaños hardcodeados
en componentes, salvo valores geométricos de layout.

### Color

| Token | Hex | Uso |
|---|---|---|
| `--color-paper` | `#F6F5F0` | Fondo del catálogo |
| `--color-surface` | `#FFFFFF` | Tarjetas, paneles, ficha |
| `--color-surface-alt` | `#EFEEE7` | Fondos secundarios |
| `--color-ink` | `#1B211E` | Texto principal (nunca `#000`) |
| `--color-ink-soft` | `#4B554F` | Texto secundario |
| `--color-ink-muted` | `#626C65` | Metadatos y ayudas |
| `--color-line` | `#DEDCD3` | Bordes de 1 px |
| `--color-primary-700` | `#1E3B31` | Marca y acción primaria |
| `--color-primary-100` | `#E4EBE6` | Selección, frases, fondos suaves |
| `--color-accent-600` | `#A05C3B` | Solo ofertas / énfasis |
| `--color-stock` | `#2C6A4C` | "En stock" |
| `--color-order` | `#7B6636` | "Sin stock · por encargo" |
| `--color-danger` | `#A33B33` | Errores reales |
| `--color-focus` | `#3E7E63` | Anillo de foco |

### Tipografía

| Token | Valor | Uso |
|---|---|---|
| `--font-display` | `ui-serif, "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif` | Nombres de perfume, títulos del catálogo |
| `--font-sans` | `ui-sans-serif, "Segoe UI Variable Text", "Segoe UI", system-ui, …` | Interfaz, cuerpo, panel |
| `--font-mono` | `ui-monospace, "Cascadia Mono", Consolas, …` | Valores técnicos y números de referencia |
| `--text-display` | `clamp(2.25rem, 1.4rem + 3.2vw, 3.75rem)` | Portada |
| `--text-2xs` … `--text-4xl` | `0.6875rem` … `3rem` | Escala completa |
| `--measure` | `65ch` | Ancho de lectura |

### Espaciado, forma y movimiento

- Espaciado: escala de 4 px (`--space-1` = 4 px … `--space-9` = 96 px).
- Radios: `4` / `6` / `10` / `16` / `24` / `pill`.
- Sombras: teñidas de verde (`rgba(20, 41, 31, …)`), sin glow.
- Movimiento: `120 ms`, `180 ms`, `240 ms`; curvas
  `cubic-bezier(0.23, 1, 0.32, 1)` y `cubic-bezier(0.77, 0, 0.175, 1)`.
- Presión táctil: `scale(0.98)` en 120 ms.
- `prefers-reduced-motion`: sin desplazamientos; color/opacidad en 80 ms.
- Contenedor: `max-width: 1240px`, padding lateral fluido.

### Contraste

Verificado sobre los pares principales: tinta sobre papel ≈ 15:1, texto suave
sobre papel ≈ 5:1, blanco sobre verde pino ≈ 12:1, cobre sobre blanco ≈ 6.8:1.
**TBD:** si los dueños cambian la paleta, hay que volver a medir.

---

## 5. Componentes incluidos

`components.html` cubre, con sus estados:

1. **Fundamentos:** swatches, escala tipográfica, radios, sombras, espaciado.
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

| Archivo | Viewport |
|---|---|
| `previews/components-mobile-390x844.png` | 390 × 844 |
| `previews/components-desktop-1440x900.png` | 1440 × 900 |

Se generaron con Chrome headless + emulación de dispositivo por DevTools
(390 × 844 exactos). No hay Playwright MCP instalado en el entorno.

El HTML se abre localmente, sin servidor:

- `design-system/components.html` (doble clic).

### Re-renderizar

**Importante (Windows):** `chrome --headless --window-size=390,844` **no**
produce un viewport de 390 px: Chrome impone un ancho mínimo de ventana y el
layout sale a ~485 px, por lo que la captura queda recortada. Hay dos formas
correctas:

1. **Manual (recomendada para revisar):** abrir `components.html` en Chrome,
   F12 → activar la barra de dispositivos (Ctrl+Shift+M) → elegir 390 × 844
   (iPhone 12/13) → capturar. Repetir con 1440 × 900.
2. **Automatizada:** usar DevTools Protocol con
   `Emulation.setDeviceMetricsOverride` antes de `Page.captureScreenshot`
   (es lo que se usó para los PNG de este directorio).

Si se usa `--screenshot`, verificar el resultado: el header debe entrar en una
columna y no debe haber scroll horizontal. En este documento
`document.documentElement.scrollWidth` es igual al viewport en ambos tamaños.

### Qué mirar

- La cabecera no se rompe a 390 px (se ocultan nav y buscador).
- La ficha pasa a una columna y el selector de presentación sigue legible.
- El carrito no supera el ancho de la pantalla.
- Los textos no se cortan ni se superponen.
- El foco visible funciona con Tab en botones, chips y campos.
- El logo muestra su leyenda de provisional.

---

## 7. Aprobación

`Approval: pending (2026-11-05, pending user review)`

Para aprobar, el usuario debe revisar `components.html` y los previews y decir
explícitamente que la fundación sirve. Recién entonces:

1. Cambiar en este archivo a `Approval: approved (<fecha>, by user)`.
2. Registrar `visual_design.status: "approved"` en
   `.active-orchestrator-state.json` (lo hace el orquestador).

Un pedido de cambios mantiene `Approval: pending` y sube la revisión si se
modifica un token o asset compartido.

**Se puede aprobar con `(TBD)` visibles** (nombre, logo, fotos) siempre que estén
rotulados como provisionales. Lo que no se puede es presentarlos como finales.

---

## 8. Cómo reemplazar

### 8.1 El nombre

1. Abrir `design-system/brand.js`.
2. Cambiar solo la constante:
   ```js
   var BRAND_NAME = "Nuevo Nombre";
   ```
3. Actualizar también el texto de respaldo en `components.html` (los elementos
   con `data-brand-name`) para que el HTML siga siendo correcto sin JS.
4. Actualizar `brand.md` §1 y la tabla de fuentes.
5. Re-renderizar los previews.
6. Subir `Revision:` en este README y volver a pedir aprobación.

No hace falta tocar CSS: el nombre no está en ningún token.

### 8.2 El logo

1. Reemplazar el archivo en `design-system/assets/logo.svg` (mismo nombre y
   ruta). Mantener un `viewBox` horizontal similar a `0 0 320 88`.
2. Quitar la leyenda "MARCA PROVISIONAL · PLACEHOLDER" del SVG únicamente cuando
   exista un logo aprobado.
3. Verificar que se lea a 30–38 px de alto (tamaño de cabecera).
4. Revisar `assets/` en busca de copias antiguas; no debe quedar más de un logo.
5. Actualizar `brand.md` §4 (origen, reglas, autor).
6. Re-renderizar los previews y pedir aprobación.

Para el logo reducido (sello "OP") se recomienda un archivo aparte,
`assets/logo-mark.svg`, cuando exista la identidad real.

### 8.3 Colores, tipografía y demás tokens

1. Editar **solo** `design-system/tokens.css`.
2. No escribir valores hex ni `px` de color dentro de `components.html` ni de
   futuros mockups; usar `var(--token)`.
3. Verificar contraste de los pares texto/fondo (mínimo 4.5:1 para texto normal,
   3:1 para texto grande y bordes de foco).
4. Revisar que "En stock", "Encargo", "Oferta" y "Alerta" sigan diferenciándose,
   y que el estado no dependa solo del color.
5. Re-renderizar los previews.
6. Subir `Revision:` y listar los mockups afectados. La aprobación vuelve a
   `pending`.
7. Actualizar el resumen de §4 en este README y `brand.md` §6.

### 8.4 Reemplazar la tipografía por una fuente local propia

1. Copiar el archivo `.woff2` a `design-system/assets/fonts/`.
2. Declarar `@font-face` en `tokens.css` con `font-display: swap` y la ruta
   relativa.
3. Cambiar `--font-display` / `--font-sans` por la familia declarada.
4. Confirmar licencia de uso e incluirla en `assets/fonts/`.
5. Re-renderizar y aprobar.

No se permite una fuente remota (Google Fonts, CDN): la restricción es
infraestructura gratuita y hardware limitado.

### 8.5 Cambiar la política visual

Solo por pedido explícito del usuario. Actualizar `Mode:` acá y
`visual_design.mode` en `.active-orchestrator-state.json`. Si pasa a `off` o
`system-only`, no se borra esta fundación: se conserva para cuando se retome.

---

## 9. Reglas de revisión

- Cambiar un token o asset compartido = **nueva revisión**.
- Cambiar el texto de un componente sin tocar tokens = no cambia la revisión,
  pero sí se re-renderiza el preview.
- Nunca editar un mockup ya aprobado en silencio: se muestra el cambio.
- Los mockups de cada change enlazan esta revisión en su `design.md`
  (`Design system revision: 1`).

---

## 10. Decisiones abiertas `(TBD)`

| # | Decisión | Impacto | Estado |
|---|---|---|---|
| 1 | Paleta definitiva (verde pino + cobre vs. otra dirección) | Toda la interfaz | Pendiente de dueños |
| 2 | Logo real y tipografía de marca | Cabecera, redes, impresos | No existe asset |
| 3 | Nombre exacto y bajada ("Oloroso Pit" / "Perfumes") | `brand.js`, logo | A confirmar |
| 4 | Fotos: origen, calidad y responsable de subirlas | Tarjetas y ficha | Abierto en la KB |
| 5 | Detalle de ofertas (% o precio tachado, vencimiento, decants) | Tag y precio | Abierto (US-006) |
| 6 | Decants integrados / sección aparte / ambos | Ficha y navegación | Abierto en la KB |
| 7 | Semántica de acordes múltiples (OR) | Filtros y contadores | A confirmar (US-008) |
| 8 | Buscador en v1 (US-010) | Cabecera | Propuesto |
| 9 | Login con correo vs. usuario genérico | Campo del login | Abierto |
| 10 | Recuperación de contraseña en v1 | Nota del login | Propuesto |
| 11 | Tono: más juvenil (Instagram) o más sobrio (nicho) | Dirección visual | Pendiente de dueños |

Ninguna de estas decisiones bloquea la aprobación de la fundación si el usuario
acepta que están rotuladas como provisionales.

---

## 11. Fuera de alcance de esta fundación

- Pantallas completas y flujos navegables (van en mockups por change).
- Ilustraciones, iconografía propia o fotografía de producto.
- Modo oscuro (no está en el brief; la paleta actual es solo clara).
- Internacionalización y multi-moneda.
- Cualquier recurso remoto o servicio pago.

---

## 12. Fuentes

- `docs/discovery/brief-clientes.md` (v5, 2026-11-05)
- `knowledge-base/01_vision_y_objetivos.md`
- `knowledge-base/02_descripcion_general.md`
- `knowledge-base/03_actores_y_roles.md`
- `knowledge-base/06_funcionalidades.md`
- `.active-orchestrator-state.json` (política `visual_design`)
- `design-system/brand.md`, `tokens.css`, `brand.js`, `components.html`

---

**Handoff:** mode `system-and-mockups` · revision `1` · status `pending` ·
previews en `design-system/previews/` · decisiones abiertas en §10.
