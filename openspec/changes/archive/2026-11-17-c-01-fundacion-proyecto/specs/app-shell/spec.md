# Spec Delta

## Purpose

Define la estructura de página del sitio: qué regiones componen el shell público y el de administración, cómo se comporta la navegación en móvil y escritorio, y qué metadatos y estados de interacción debe entregar cada página renderizada.

## ADDED Requirements

### Requirement: Ruta raíz estática

El sitio SHALL publicar una ruta raíz `/` como página HTML estática, servible desde hosting estático sin proceso de servidor en ejecución.

#### Scenario: La raíz se genera en el build

- **WHEN** se ejecuta el build de producción
- **THEN** se genera un archivo HTML para `/` que contiene la portada del shell
- **AND** no se requiere un servidor de aplicación para responder esa ruta

#### Scenario: La raíz se sirve en desarrollo

- **WHEN** se levanta el servidor de desarrollo y se solicita `/`
- **THEN** la respuesta es `200` con el HTML del shell

### Requirement: Composición del shell público

Cada página pública SHALL componerse de tres regiones en este orden: cabecera (con barra de anuncio), contenido principal y pie. El contenido principal SHALL ser la única región variable entre páginas.

#### Scenario: Una página pública muestra las tres regiones

- **WHEN** se renderiza cualquier página que usa el layout público
- **THEN** el documento contiene una cabecera, un `main` y un pie
- **AND** el `main` contiene el contenido específico de la página

#### Scenario: La cabecera permanece visible al desplazar en escritorio

- **WHEN** se desplaza la página hacia abajo en un viewport de escritorio
- **THEN** la cabecera sigue visible en el borde superior

### Requirement: Navegación del shell público

La cabecera SHALL incluir marca, navegación principal y control de menú móvil. En viewports angostos la navegación principal SHALL ocultarse y el control de menú SHALL quedar visible, accesible por teclado y con su estado expandido o contraído anunciado.

#### Scenario: Escritorio muestra la navegación completa

- **WHEN** se carga el shell en un viewport de 1440×900
- **THEN** la cabecera muestra la marca y la navegación principal

#### Scenario: Móvil reduce la navegación a un control de menú

- **WHEN** se carga el shell en un viewport de 390×844
- **THEN** la navegación principal no está visible
- **AND** el control de menú está visible y es alcanzable con Tab

#### Scenario: El control de menú anuncia su estado

- **WHEN** se activa el control de menú con teclado o puntero
- **THEN** el control refleja en un atributo accesible si el menú está expandido
- **AND** el foco puede volver al control al cerrar el menú

### Requirement: Shell de administración diferenciado

El layout de administración SHALL envolver sus páginas con su propio encabezado y pie, sin la barra de anuncio ni la navegación principal pública, y SHALL usar los mismos tokens visuales que el sitio público.

#### Scenario: Una página de administración no muestra la navegación pública

- **WHEN** se renderiza una página con el layout de administración
- **THEN** el documento no contiene la navegación principal pública ni la barra de anuncio
- **AND** el documento contiene un encabezado y un pie propios del área de administración

#### Scenario: El área de administración no se enlaza desde el sitio público

- **WHEN** se inspeccionan los enlaces de la cabecera y del pie públicos
- **THEN** ninguno apunta a una ruta de administración

### Requirement: Metadatos base del documento

Cada página SHALL declarar idioma español, codificación UTF-8, viewport responsive, un título descriptivo y el favicon del sitio.

#### Scenario: Una página declara sus metadatos

- **WHEN** se inspecciona el HTML generado de cualquier página del shell
- **THEN** el elemento raíz declara `lang="es"`
- **AND** declara `charset="utf-8"` y una etiqueta viewport
- **AND** el título no está vacío y referencia a Oloroso Pit
- **AND** se declara un favicon

### Requirement: Estados de foco y movimiento reducido

Todo elemento interactivo del shell SHALL mostrar un indicador de foco visible al navegar con teclado, y las animaciones SHALL desactivarse cuando el sistema operativo declara `prefers-reduced-motion: reduce`.

#### Scenario: El foco es visible sobre la cabecera y el pie

- **WHEN** se recorre el shell con Tab
- **THEN** cada enlace y botón enfocado muestra un contorno de foco perceptible
- **AND** el foco no queda oculto detrás de la cabecera fija

#### Scenario: Movimiento reducido desactiva las animaciones

- **WHEN** el usuario declara `prefers-reduced-motion: reduce`
- **THEN** el shell no aplica transiciones ni desplazamientos animados

### Requirement: El pie declara el cierre por WhatsApp

El pie SHALL informar que el pedido se completa fuera del sitio, por WhatsApp, y que no se realiza ningún pago en el sitio.

#### Scenario: El pie comunica el modelo de compra

- **WHEN** se renderiza el pie público
- **THEN** el texto visible indica que el pedido se cierra por WhatsApp
- **AND** indica que no se paga en el sitio
