# Previews

Capturas de `components.html` en los dos tamaños de referencia:

| Archivo | Viewport |
|---|---|
| `components-mobile-390x844.png` | 390 × 844 |
| `components-desktop-1440x900.png` | 1440 × 900 |

Generadas el 2026-11-11 (revisión 3) con Chrome headless y emulación de viewport
por DevTools (`Emulation.setDeviceMetricsOverride`). No son full-page: muestran
el primer viewport. El resto del documento se revisa abriendo
`../components.html`.

Los archivos `check-*.png` (capturas de control de tipografía, cabecera, tarjetas,
controles y formas) son descartables: se borran al cerrar cada revisión y se
pueden regenerar.

## Re-renderizar

En Windows, `--window-size=390,844` **no** da 390 px de layout: Chrome impone un
mínimo de ventana (~485 px) y la captura sale recortada. Opciones correctas:

1. **Manual:** abrir `components.html`, F12, Ctrl+Shift+M, elegir 390 × 844
   (o 1440 × 900) y capturar.
2. **Automatizada:** DevTools Protocol con `Emulation.setDeviceMetricsOverride`
   antes de `Page.captureScreenshot`.

Comprobar con la consola:

```js
document.documentElement.clientWidth    // debe ser 390 o 1440
document.documentElement.scrollWidth    // debe ser igual, sin scroll horizontal
```

## Nota

Los previews acompañan la **revisión 3** del sistema (identidad oficial
confirmada el 2026-11-11; fondos lila a pedido de los dueños). Si cambia un
token o el logo, hay que volver a generarlos y pedir aprobación de nuevo. El
mockup del shell de C-01 tiene sus propios previews en
`openspec/changes/c-01-fundacion-proyecto/mockups/previews/`.
