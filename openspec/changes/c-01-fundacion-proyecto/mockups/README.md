# Mockup — C-01 `fundacion-proyecto` · Shell del sitio

```
Design system revision: 4
Decision: yes
Approval: approved (2026-11-13, by user)
Preview: rendered (2026-11-13)
Visual verify: pending (se completa al implementar C-01)
```

Mockup local del **shell** (cabecera, portada, pie) con la identidad oficial
confirmada por los clientes el 2026-11-11 (D-07) y los fondos lila de la
revisión 4 (`#CC7BCA` exterior, `#F0BBEA` interior). No es código final: es el
artefacto de aprobación previo a implementar C-01.

## Archivos

| Archivo | Qué es |
|---|---|
| `shell.html` | Mockup navegable, responsive, sin build. Importa `design-system/tokens.css` y `assets/logo.svg` directamente. |
| `README.md` | Este documento: alcance, preview y aprobación. |
| `previews/shell-desktop-1440x900.png` | Captura de viewport 1440 × 900. |
| `previews/shell-mobile-390x844.png` | Captura de viewport 390 × 844. |
| `previews/shell-desktop-full.png` | Página completa a 1440 px (revisión de secciones). |
| `previews/shell-mobile-full.png` | Página completa a 390 px. |

Abrir con doble clic en Chrome/Edge/Firefox:

```
openspec/changes/c-01-fundacion-proyecto/mockups/shell.html
```

Las fuentes (DynaPuff y Nunito) se cargan del CDN de Google Fonts. Sin internet
se ven los fallbacks del sistema; el layout no cambia.

## Qué muestra

1. **Barra de anuncio** naranja con texto morado (regla: nunca blanco sobre
   naranja).
2. **Cabecera sticky** blanca: logo, navegación, buscador, carrito con contador
   y menú móvil.
3. **Portada lila interior** con titular DynaPuff naranja y extrusión sólida
   morada, CTA naranja con texto morado, y una tarjeta "sticker" de producto.
4. **Entrada por línea** con tarjetas blancas y sombra dura.
5. **Grilla ilustrativa** de 4 tarjetas (oferta, en stock, por encargo) sobre
   una franja lila exterior. El grid real y sus filtros son de C-04: acá solo
   valida la identidad.
6. **Franja "Cómo comprar"** en tres pasos.
7. **Pie morado** con wordmark naranja plano, columnas y nota de "no se paga
   en el sitio".

## Decisiones de alcance que conviene mirar

- **La navegación muestra solo Árabes y Ofertas.** La regla RN-CAT-02 dice que
  las líneas sin productos no se muestran; al lanzamiento, Diseñador y Nicho no
  tienen datos. El mockup lo refleja y lo aclara debajo de las tarjetas de
  línea. Si preferís mostrarlas igual, hay que cambiar la regla, no el mockup.
- **Ofertas está en la navegación** aunque su detalle sigue abierto en D-03. Si
  D-03 no se resuelve antes del lanzamiento, el ítem se retira (R-08).
- **El logo es el placeholder** recoloreado a la paleta nueva. La identidad de
  color está confirmada; el logo real no existe todavía.
- **La extrusión se usa solo en el H1.** Los H2 van en morado plano y el
  wordmark del pie en naranja plano: la extrusión morada no se ve sobre el
  fondo morado y los H2 priorizan legibilidad y contraste.
- **Buscador visible** en escritorio: el brief no lo incluye en v1
  (CHANGES §8.3). Está en el mockup porque el shell de C-01 todavía no decide
  retirarlo; se define en C-04. Si preferís sacarlo ya, se quita antes de
  implementar.

## Estados cubiertos

- Cabecera con carrito con 2 unidades.
- Tarjeta en oferta, en stock y sin stock (encargo).
- Hover y foco visibles en enlaces, botones y tarjetas (Tab).
- Móvil 390 px: navegación y buscador ocultos, menú visible, hero en una
  columna, grilla de 2 columnas.
- `prefers-reduced-motion`: sin desplazamientos.

No cubre: menú desplegable abierto, carrito desplegado, buscador en uso, login
ni panel. Eso pertenece a changes posteriores.

## Preview

Renderizado con Chrome headless + DevTools Protocol
(`Emulation.setDeviceMetricsOverride` a 390 × 844 y 1440 × 900), igual que
`design-system/previews/`. Las capturas de página completa se tomaron con
`captureBeyondViewport`.

Para re-renderizar a mano: abrir el HTML en Chrome, F12, Ctrl+Shift+M, elegir
390 × 844 (iPhone 12/13) y capturar; repetir con 1440 × 900.

## Aprobación

`Approval: approved (2026-11-13, by user)`.

El usuario revisó `shell.html` y las capturas y aprobó la dirección. Por lo
tanto:

1. Este mockup queda aprobado contra `Design system revision: 4`.
2. El bloque `## UI Mockups` de este README se copia al `design.md` del change
   cuando se corra `/opsx:propose c-01-fundacion-proyecto`.
3. Recién después se implementa C-01.

Un pedido de cambios deja `Approval: pending` y, si toca tokens compartidos,
sube la revisión del design system.

## Fuentes

- `design-system/README.md` §3–§4 (dirección y tokens, revisión 4)
- `design-system/tokens.css`
- `CHANGES.md` §C-01, §6 (D-07), §8
- `knowledge-base/05_reglas_de_negocio.md` (RN-CAT-02)
- Confirmación de identidad visual de los clientes (2026-11-11)
