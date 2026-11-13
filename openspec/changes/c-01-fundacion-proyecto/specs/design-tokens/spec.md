# Spec Delta

## Purpose

Establece el contrato visual consumible por la aplicación: una única fuente de color, tipografía, espaciado, radios, sombras y foco, con tipografías propias servidas desde el sitio y pares de color que cumplen contraste AA.

## ADDED Requirements

### Requirement: Fuente única de valores visuales

La aplicación SHALL tomar color, tipografía, espaciado, radios, sombras y foco exclusivamente de los tokens del design system. Ningún valor de color SHALL declararse fuera de ese archivo de tokens.

#### Scenario: Los estilos de la aplicación consumen tokens

- **WHEN** se inspeccionan las hojas de estilo de la aplicación
- **THEN** los colores, radios y sombras se referencian mediante variables de token
- **AND** no aparecen literales de color hexadecimal en los estilos de componentes, layouts o páginas

#### Scenario: Un cambio de token se propaga sin editar componentes

- **WHEN** se modifica el valor de un token y se reconstruye el sitio
- **THEN** todos los elementos que usan ese token reflejan el nuevo valor
- **AND** no fue necesario editar componentes para lograrlo

### Requirement: Tipografías propias sin CDN

El sitio SHALL servir DynaPuff y Nunito desde su propio origen mediante `@font-face` con `font-display: swap`, y SHALL NOT realizar pedidos a CDNs de tipografías.

#### Scenario: La carga de fuentes no sale del sitio

- **WHEN** se carga cualquier página del shell con la red inspeccionada
- **THEN** los archivos de DynaPuff y Nunito se solicitan desde el origen del sitio
- **AND** no hay pedidos a `fonts.googleapis.com` ni a `fonts.gstatic.com`

#### Scenario: El texto se muestra antes de que llegue la fuente

- **WHEN** la fuente propia todavía no terminó de descargarse
- **THEN** el texto se renderiza con la familia de respaldo declarada
- **AND** el layout no salta de forma que oculte contenido

#### Scenario: Las familias se aplican según su rol

- **WHEN** se inspecciona el estilo calculado de un titular de portada y de un párrafo
- **THEN** el titular usa la familia de display y el párrafo usa la familia de texto

### Requirement: Contraste mínimo AA en texto y controles

Todo texto SHALL alcanzar contraste 4.5:1 contra su fondo; el texto grande y los límites de controles o indicadores de foco SHALL alcanzar 3:1. El blanco SHALL NOT usarse como color de texto sobre naranja ni sobre lila.

#### Scenario: Texto de cuerpo sobre las superficies del shell

- **WHEN** se mide el contraste del texto de cuerpo contra cada superficie donde se renderiza
- **THEN** la relación es de al menos 4.5:1

#### Scenario: Titulares sobre fondos lila

- **WHEN** se mide el contraste de un titular grande sobre fondo lila interior o exterior
- **THEN** la relación es de al menos 3:1

#### Scenario: Combinaciones prohibidas

- **WHEN** se revisan los pares de color declarados en los estilos
- **THEN** no existe texto blanco sobre naranja ni texto blanco sobre lila

#### Scenario: Indicador de foco perceptible

- **WHEN** se mide el contraste del anillo de foco contra el fondo adyacente
- **THEN** la relación es de al menos 3:1

### Requirement: Colores de estado sobre superficie blanca

Los estados de disponibilidad SHALL renderizarse como texto o etiqueta sobre superficie blanca, SHALL NOT depender solo del color y SHALL acompañarse de una palabra que nombre el estado.

#### Scenario: Etiqueta de estado legible

- **WHEN** se muestra una etiqueta de estado de disponibilidad
- **THEN** se apoya sobre fondo blanco
- **AND** incluye el nombre del estado en texto

#### Scenario: Estado distinguible sin color

- **WHEN** la página se percibe sin distinguir colores
- **THEN** cada estado sigue siendo identificable por su texto

### Requirement: Identidad de formas y elevación

Las tarjetas y bloques del shell SHALL usar los radios y las sombras duras definidos en los tokens, sin sombras difusas ni radios improvisados.

#### Scenario: Una tarjeta usa el token de elevación

- **WHEN** se inspecciona el estilo calculado de una tarjeta del shell
- **THEN** su sombra corresponde al token de sombra dura
- **AND** su radio corresponde a un token de radio
