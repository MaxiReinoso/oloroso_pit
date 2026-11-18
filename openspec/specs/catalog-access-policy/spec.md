# catalog-access-policy Specification

## Purpose
Define quién puede leer y escribir el catálogo desde la API: lectura pública anónima de todo el catálogo cargado, escritura reservada a usuarios autenticados y exposición pública de la configuración limitada al número de WhatsApp.

## Requirements

### Requirement: Control de acceso por fila activo en todas las tablas

Toda tabla del catálogo SHALL tener control de acceso por fila activo, de modo que ninguna quede accesible por la API sin una política que lo autorice.

#### Scenario: Ninguna tabla del catálogo queda sin control de acceso

- **WHEN** se revisan las tablas del catálogo
- **THEN** todas tienen control de acceso por fila activo
- **AND** ninguna es accesible con la clave anónima sin una política que lo permita

#### Scenario: Una tabla nueva sin política no expone datos

- **WHEN** una tabla del catálogo existe sin políticas definidas
- **THEN** la lectura y la escritura pública devuelven cero filas o son rechazadas
- **AND** no se produce una apertura accidental

### Requirement: Lectura pública del catálogo completo

El catálogo SHALL ser legible sin sesión iniciada, y toda fila cargada SHALL formar parte del catálogo público sin estados intermedios de publicación.

#### Scenario: Un visitante sin sesión lee el catálogo

- **WHEN** un visitante sin sesión consulta perfumes y presentaciones
- **THEN** obtiene las filas cargadas con sus precios y su stock

#### Scenario: Un perfume sin stock se lee igual

- **WHEN** un perfume tiene stock cero en todas sus presentaciones
- **THEN** un visitante sin sesión sigue leyendo el perfume y su precio
- **AND** el estado de stock no lo oculta del catálogo

#### Scenario: No hay estado de publicación

- **WHEN** se revisan las tablas del catálogo
- **THEN** ninguna tiene una columna que habilite o deshabilite la publicación de una fila
- **AND** toda fila guardada es visible para el público

### Requirement: La escritura anónima se rechaza en todas las tablas

Ninguna operación de alta, modificación o borrado SHALL tener éxito con el rol anónimo, en ninguna tabla del catálogo ni en la configuración.

#### Scenario: Alta anónima rechazada

- **WHEN** un visitante sin sesión intenta crear una fila en cualquier tabla del catálogo
- **THEN** la operación es rechazada
- **AND** no se crea ninguna fila

#### Scenario: Modificación y borrado anónimos rechazados

- **WHEN** un visitante sin sesión intenta modificar o borrar una fila existente
- **THEN** la operación es rechazada
- **AND** la fila conserva sus valores originales

#### Scenario: Cambio anónimo del número de WhatsApp rechazado

- **WHEN** un visitante sin sesión intenta cambiar el número de WhatsApp de destino
- **THEN** la operación es rechazada
- **AND** el número configurado no cambia

### Requirement: La escritura autenticada se permite en el catálogo

Un usuario autenticado SHALL poder crear, modificar y borrar filas en todas las tablas del catálogo.

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

### Requirement: La configuración expone públicamente solo el número

De la tabla de configuración, el público SHALL poder leer únicamente el número de WhatsApp de destino y SHALL NOT acceder a ninguna otra columna, presente o futura.

#### Scenario: Lectura pública del número

- **WHEN** un visitante sin sesión consulta el número de WhatsApp de destino
- **THEN** obtiene el valor configurado

#### Scenario: Lectura pública de otra columna de configuración

- **WHEN** un visitante sin sesión intenta leer una columna distinta del número de WhatsApp de destino
- **THEN** el acceso es rechazado
- **AND** no se devuelve ningún valor de esa columna

#### Scenario: Una columna interna nueva no se expone sola

- **WHEN** se agrega a la configuración una columna que no debe ser pública
- **THEN** el público sigue sin poder leerla
- **AND** el número de WhatsApp se sigue leyendo con normalidad

### Requirement: La lectura pública usa la clave anónima

La lectura pública del catálogo SHALL funcionar con la clave anónima que el navegador ya utiliza, sin sesión iniciada y sin ninguna clave privilegiada.

#### Scenario: Consulta pública sin sesión y sin clave privilegiada

- **WHEN** un cliente se configura solo con la URL del proyecto y la clave anónima
- **THEN** lee el catálogo con normalidad
- **AND** no requiere la clave de servicio ni ninguna credencial adicional

#### Scenario: Ningún camino público depende de la clave de servicio

- **WHEN** se revisan las operaciones de lectura pública
- **THEN** ninguna requiere la clave de servicio
- **AND** la clave de servicio no se distribuye al navegador

### Requirement: La política de acceso es verificable sin dejar residuos

El proyecto SHALL permitir verificar esta política contra el proyecto configurado ejercitando escrituras con el rol anónimo y con un rol autenticado, y la verificación SHALL NOT dejar filas nuevas, modificadas ni borradas al finalizar.

#### Scenario: La verificación confirma el rechazo anónimo

- **WHEN** se ejecuta la verificación de seguridad con la clave anónima sobre cada tabla
- **THEN** todas las escrituras resultan rechazadas
- **AND** el resultado se informa tabla por tabla

#### Scenario: La verificación confirma la escritura autenticada

- **WHEN** se ejecuta la verificación de seguridad por la vía autenticada
- **THEN** las escrituras de prueba son aceptadas
- **AND** el estado de la base queda igual que antes de la verificación

#### Scenario: Repetir la verificación da el mismo resultado

- **WHEN** la verificación de seguridad se ejecuta dos veces seguidas
- **THEN** ambos resultados coinciden
- **AND** no queda ningún dato de prueba en la base
