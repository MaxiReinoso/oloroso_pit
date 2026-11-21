# Spec Delta — catalog-access-policy

## MODIFIED Requirements

### Requirement: La escritura autenticada se permite en el catálogo

Un usuario autenticado con una sesión que no sea anónima SHALL poder crear, modificar y borrar filas en todas las tablas del catálogo. Una sesión anónima del proveedor de autenticación SHALL NOT poder escribir, aunque reciba el rol `authenticated`.

#### Scenario: Alta de una línea y una marca desde una sesión

- **WHEN** un usuario autenticado crea una línea y una marca
- **THEN** ambas filas quedan guardadas

#### Scenario: Alta y edición de un perfume con presentaciones

- **WHEN** un usuario autenticado crea un perfume con presentaciones y después cambia su precio y su stock
- **THEN** la base acepta la creación y la edición
- **AND** los nuevos valores son los que se leen después

#### Scenario: Borrado de una fila de catálogo

- **WHEN** un usuario autenticado borra una fila de catálogo que no está referenciada por otras
- **THEN** la fila deja de existir

#### Scenario: Escritura de una sesión anónima rechazada

- **WHEN** una sesión del proveedor de autenticación tiene el claim de anónima activo e intenta crear, modificar o borrar una fila en cualquier tabla del catálogo
- **THEN** la operación es rechazada por la política de acceso por fila
- **AND** la fila no se crea ni se modifica
- **AND** el rechazo ocurre en las nueve tablas del catálogo y en la configuración

#### Scenario: Escritura de una sesión no anónima sigue funcionando

- **WHEN** una sesión autenticada sin el claim de anónima intenta crear una fila
- **THEN** la operación es aceptada por la política de acceso por fila

### Requirement: La política de acceso es verificable sin dejar residuos

El proyecto SHALL permitir verificar esta política contra el proyecto configurado ejercitando escrituras con el rol anónimo, con una sesión que declare ser anónima y con un rol autenticado, y la verificación SHALL NOT dejar filas nuevas, modificadas ni borradas al finalizar.

#### Scenario: La verificación confirma el rechazo anónimo

- **WHEN** se ejecuta la verificación de seguridad con la clave anónima sobre cada tabla
- **THEN** todas las escrituras resultan rechazadas
- **AND** el resultado se informa tabla por tabla

#### Scenario: La verificación confirma la escritura autenticada

- **WHEN** se ejecuta la verificación de seguridad por la vía autenticada
- **THEN** las escrituras de prueba son aceptadas
- **AND** el estado de la base queda igual que antes de la verificación

#### Scenario: La verificación confirma el rechazo de sesiones anónimas

- **WHEN** se ejecuta la verificación simulando una sesión autenticada que declara el claim de anónima
- **THEN** todas las escrituras resultan rechazadas en las nueve tablas
- **AND** la verificación no requiere habilitar el acceso anónimo del proveedor
- **AND** con el claim de anónima ausente las mismas escrituras son aceptadas y se revierten al final

#### Scenario: Repetir la verificación da el mismo resultado

- **WHEN** la verificación de seguridad se ejecuta dos veces seguidas
- **THEN** ambos resultados coinciden
- **AND** no queda ningún dato de prueba en la base
