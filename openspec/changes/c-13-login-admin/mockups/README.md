# Mockups — C-13 Login del administrador

**Design system revision:** 4 (aprobada 2026-11-13)
**Approval:** approved (2026-11-20, by user)

## Pantallas

| Archivo | Qué muestra | Estados incluidos |
|---|---|---|
| `login.html` | `/admin/login`: formulario de correo y contraseña y contexto del panel. Las notas técnicas quedan como anotaciones del mockup, fuera de la pantalla. | Error genérico, envío en curso, sesión ya iniciada. A 390 px el formulario va primero y el texto de contexto después. |
| `panel.html` | Layout del panel (`/admin`): cabecera con marca y sesión, navegación de secciones, saludo con el email de la sesión y tarjetas de secciones futuras. | Guard verificando, sin sesión (redirige al login) y error de red con reintento. Navegación apilada en móvil. |

## Fuentes

- `design-system/README.md` revisión 4 y `design-system/components.html` §9 (login del panel).
- `design-system/tokens.css`, `design-system/brand.js` y `design-system/assets/logo.svg`
  (los mockups los importan por ruta relativa; no copian valores).
- `CHANGES.md` §C-13 y `knowledge-base/06_funcionalidades.md` §US-015.
- `docs/discovery/brief-clientes.md` §5 (panel con login simple) y §11 (D-04).
- Decisión del usuario para C-13: email personal por administrador, cuentas
  creadas desde el dashboard, sin `signUp` en el cliente.

## Decisiones visuales

- Login sobrio, sin lenguaje de marketing: una tarjeta blanca sobre lila
  exterior, marca provisional visible y un único CTA naranja con texto morado.
- Error genérico junto al campo, con texto además de color, como pide la
  revisión 4.
- El panel usa la misma identidad con menos decoración: cabecera morada, tarjetas
  blancas, sombras duras y navegación mínima. Las secciones futuras se anuncian
  como «Próximamente», sin códigos de change ni botones que prometan acciones
  inexistentes.
- El saludo del panel no inventa un nombre: dice «Hola» y debajo muestra el email
  de la sesión real.
- Las notas técnicas de ambos mockups viven en un bloque de anotaciones fuera de
  la pantalla; no aparecen como texto de la interfaz.
- El contenido del panel queda oculto mientras el guard verifica la sesión; el
  estado se representa en `panel.html` (bloque «Estados del guard»).
- El logo se mantiene rotulado como provisional (`MARCA PROVISIONAL ·
  PLACEHOLDER`). No se inventó una marca final.

## Cómo revisar

Sin servidor ni build; abrir los HTML con doble clic:

- `openspec/changes/c-13-login-admin/mockups/login.html`
- `openspec/changes/c-13-login-admin/mockups/panel.html`

Capturas renderizadas con Playwright (Chromium), viewport exacto y página
completa:

| Archivo | Viewport |
|---|---|
| `previews/login-mobile-390x844.png` | 390 × 844 |
| `previews/login-desktop-1440x900.png` | 1440 × 900 |
| `previews/panel-mobile-390x844.png` | 390 × 844 |
| `previews/panel-desktop-1440x900.png` | 1440 × 900 |

Re-renderizar:

```powershell
$base = "file:///C:/Users/Admin/Documents/Proyectos/Oloroso%20Pit/oloroso_pit/openspec/changes/c-13-login-admin/mockups"
npx playwright screenshot --viewport-size "390,844" --full-page "$base/login.html" "openspec/changes/c-13-login-admin/mockups/previews/login-mobile-390x844.png"
npx playwright screenshot --viewport-size "1440,900" --full-page "$base/login.html" "openspec/changes/c-13-login-admin/mockups/previews/login-desktop-1440x900.png"
npx playwright screenshot --viewport-size "390,844" --full-page "$base/panel.html" "openspec/changes/c-13-login-admin/mockups/previews/panel-mobile-390x844.png"
npx playwright screenshot --viewport-size "1440,900" --full-page "$base/panel.html" "openspec/changes/c-13-login-admin/mockups/previews/panel-desktop-1440x900.png"
```

## Qué mirar

- El formulario entra sin scroll horizontal a 390 px y el foco es visible.
- No hay texto blanco sobre naranja ni texto atenuado sobre el lila exterior.
- El error se lee como error (texto + ícono, no solo color).
- La cabecera del panel no se rompe en móvil: el email se recorta, el botón de
  salir sigue visible.
- Las secciones futuras se ven como no disponibles, no como enlaces activos.
- El logo muestra su leyenda de provisional.

## Aprobación

`Approval: approved (2026-11-20, by user)` — registrado también en `design.md`
§UI Mockups.

El usuario aprobó esta revisión con cuatro ajustes, ya aplicados y re-renderizados:

1. Login: se quitaron de la pantalla las viñetas que explicaban el acceso (email
   personal, error genérico, cerrar sesión). Las notas técnicas quedaron como
   anotaciones del mockup.
2. Panel: el saludo dice «Hola» y muestra el email de la sesión; no se inventó un
   nombre.
3. Panel: las secciones futuras dicen «Próximamente», sin códigos de change.
4. Capturas de `login.html` y `panel.html` re-renderizadas en ambos viewports.

Un pedido de cambios vuelve a `pending` y no cambia la revisión del design system
(no se tocan tokens ni assets compartidos).
