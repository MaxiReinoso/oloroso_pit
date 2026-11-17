# Spec Delta — catalog-schema

## Purpose

Define el modelo de datos del catálogo como contrato de comportamiento: qué entidades existen, cómo se relacionan, qué valores admite cada atributo y qué combinaciones rechaza la base por sí misma, sin depender del panel ni del frontend.

## ADDED Requirements

### Requirement: Catálogo compuesto por líneas, marcas y perfumes

La base SHALL almacenar el catálogo en tablas separadas de líneas, marcas y perfumes, donde cada perfume pertenece a exactamente una línea y a exactamente una marca.

#### Scenario: Un perfume se registra con su línea y su marca

- **WHEN** se registra un perfume indicando una línea y una marca existentes
- **THEN** el perfume queda asociado a esa línea y a esa marca
- **AND** al leerlo se obtienen los datos de ambas

#### Scenario: Un perfume sin marca se rechaza

- **WHEN** se intenta registrar un perfume sin marca
- **THEN** la base rechaza la escritura
- **AND** el perfume no queda guardado

### Requirement: Identificador público único por entidad

Cada línea, marca, perfume y acorde SHALL tener un identificador legible para URL que sea único dentro de su propia entidad.

#### Scenario: Dos perfumes no comparten identificador

- **WHEN** se intenta registrar un segundo perfume con un identificador ya usado por otro perfume
- **THEN** la base rechaza la escritura
- **AND** el catálogo conserva un solo perfume con ese identificador

#### Scenario: El identificador resuelve a una sola fila

- **WHEN** se busca un perfume por su identificador
- **THEN** la consulta devuelve como máximo una fila

### Requirement: Género restringido a tres valores

Cada perfume SHALL tener un género y la base SHALL aceptar únicamente los valores masculino, femenino o unisex.

#### Scenario: Un género válido se acepta

- **WHEN** se registra un perfume con género masculino, femenino o unisex
- **THEN** la base acepta la escritura

#### Scenario: Un género inventado se rechaza

- **WHEN** se intenta registrar un perfume con un género distinto de los tres permitidos
- **THEN** la base rechaza la escritura

### Requirement: Una línea o marca en uso no se puede borrar

Borrar una línea o una marca que todavía tiene perfumes asociados SHALL ser rechazado por la base.

#### Scenario: Se intenta borrar una línea con perfumes

- **WHEN** se borra una línea que tiene al menos un perfume asociado
- **THEN** la base rechaza el borrado
- **AND** la línea y sus perfumes siguen existiendo

#### Scenario: Se intenta borrar una marca sin perfumes

- **WHEN** se borra una marca que no tiene perfumes asociados
- **THEN** la base elimina la marca

### Requirement: Precio y stock viven en la presentación

Cada forma de compra de un perfume SHALL ser una presentación propia —frasco sellado o decant— con su tipo, su volumen y su precio de lista, y cada presentación SHALL tener stock propio; el precio no se guarda en el perfume.

#### Scenario: Un perfume con frasco y decants

- **WHEN** se registra un perfume con una presentación de frasco sellado y dos decants
- **THEN** cada presentación conserva su propio precio y su propio stock
- **AND** el mismo perfume expone las tres presentaciones

#### Scenario: Cambiar el precio de un decant no cambia el del frasco

- **WHEN** se modifica el precio de la presentación de decant
- **THEN** las demás presentaciones del mismo perfume conservan su precio anterior

### Requirement: La base rechaza precios y stock inválidos

La base SHALL rechazar un precio de lista negativo, un stock negativo, un volumen no positivo y un precio de oferta que no sea estrictamente menor al precio de lista.

#### Scenario: Precio de lista negativo

- **WHEN** se registra una presentación con precio de lista negativo
- **THEN** la base rechaza la escritura

#### Scenario: Stock negativo

- **WHEN** se registra una presentación con stock negativo
- **THEN** la base rechaza la escritura

#### Scenario: Oferta igual o mayor al precio de lista

- **WHEN** se registra una presentación cuyo precio de oferta es igual o mayor a su precio de lista
- **THEN** la base rechaza la escritura

#### Scenario: Oferta menor al precio de lista

- **WHEN** se registra una presentación cuyo precio de oferta es menor a su precio de lista
- **THEN** la base acepta la escritura y conserva ambos precios

### Requirement: Un formato de presentación no se duplica por perfume

Para un mismo perfume SHALL existir como máximo una presentación de cada combinación de tipo y volumen.

#### Scenario: Segundo decant del mismo volumen

- **WHEN** se intenta registrar un segundo decant de 10 ml para un perfume que ya tiene uno
- **THEN** la base rechaza la escritura

#### Scenario: El mismo formato en otro perfume

- **WHEN** se registra un decant de 10 ml para un perfume distinto
- **THEN** la base acepta la escritura

### Requirement: Un perfume admite como máximo tres frases

La base SHALL rechazar cualquier intento de dejar más de tres frases asignadas a un mismo perfume, sin importar el orden ni el camino de escritura.

#### Scenario: Se asigna la cuarta frase

- **WHEN** se intenta asignar una cuarta frase a un perfume que ya tiene tres
- **THEN** la base rechaza la escritura
- **AND** el perfume conserva sus tres frases anteriores

#### Scenario: Se asignan tres frases en un solo lote

- **WHEN** se asignan tres frases a un perfume en una sola operación
- **THEN** la base acepta las tres y el perfume queda con tres frases

#### Scenario: Se asignan cuatro frases en un solo lote

- **WHEN** se intentan asignar cuatro frases a un perfume en una sola operación
- **THEN** la base rechaza la operación completa
- **AND** el perfume no queda con frases asignadas por esa operación

### Requirement: Acordes y frases se comparten entre perfumes

Un perfume SHALL poder tener varios acordes y la misma frase o el mismo acorde SHALL poder asignarse a varios perfumes, sin duplicar el término en cada perfume.

#### Scenario: El mismo acorde en dos perfumes

- **WHEN** un acorde se asigna a dos perfumes distintos
- **THEN** ambos perfumes quedan asociados a ese acorde
- **AND** el acorde existe una sola vez como término

#### Scenario: La misma frase en dos perfumes

- **WHEN** una frase se asigna a dos perfumes distintos
- **THEN** ambos perfumes quedan asociados a esa frase
- **AND** la frase existe una sola vez como texto

#### Scenario: Varios acordes en un solo perfume

- **WHEN** se asignan varios acordes a un mismo perfume
- **THEN** la base acepta la asignación de todos ellos

### Requirement: La configuración operativa es una fila única

La configuración del sitio SHALL existir como una sola fila y su número de WhatsApp de destino SHALL contener solo dígitos, con una longitud de 10 a 15 caracteres.

#### Scenario: Se intenta crear una segunda fila de configuración

- **WHEN** se intenta registrar una segunda fila de configuración
- **THEN** la base rechaza la escritura
- **AND** la configuración original no cambia

#### Scenario: Número con formato inválido

- **WHEN** se intenta guardar un número de destino con signo más, espacios, guiones o letras
- **THEN** la base rechaza la escritura

#### Scenario: Número de solo dígitos

- **WHEN** se guarda un número de destino compuesto solo por dígitos con código de país
- **THEN** la base acepta la escritura
