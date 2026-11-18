# Spec Delta — catalog-access-policy

## ADDED Requirements

### Requirement: La configuración pública se lee por una vista de solo número

La configuración operativa SHALL exponerse al público mediante una vista de lectura que devuelva únicamente el número de WhatsApp de destino, y SHALL NOT incluir identificadores, marcas de auditoría ni ninguna otra columna interna de la configuración.

#### Scenario: La vista pública devuelve el número

- **WHEN** un visitante sin sesión consulta la vista pública de configuración
- **THEN** obtiene el número de WhatsApp de destino vigente

#### Scenario: La vista pública tiene una sola columna

- **WHEN** se consulta la vista pública pidiendo todas sus columnas
- **THEN** la respuesta contiene únicamente el número de WhatsApp de destino
- **AND** no incluye el identificador de la fila ni las marcas de auditoría

#### Scenario: Una columna interna nueva no se filtra por la vista

- **WHEN** se agrega a la configuración una columna que no debe ser pública
- **THEN** la vista pública sigue devolviendo solo el número de WhatsApp de destino
- **AND** la columna nueva no aparece en la respuesta

#### Scenario: La vista pública es de solo lectura

- **WHEN** un visitante sin sesión intenta modificar el número a través de la vista pública
- **THEN** la operación es rechazada
- **AND** el número configurado no cambia

#### Scenario: La vista respeta el control de acceso por fila de la tabla

- **WHEN** se revisa la definición de la vista pública de configuración
- **THEN** la vista se ejecuta con los privilegios de quien consulta
- **AND** el control de acceso por fila de la configuración sigue aplicándose
