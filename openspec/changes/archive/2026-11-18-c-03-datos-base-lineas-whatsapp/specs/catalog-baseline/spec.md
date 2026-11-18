# Spec Delta — catalog-baseline

## Purpose

Define el estado mínimo con el que el catálogo puede operar desde el primer día: las tres líneas comerciales con su orden de navegación y la configuración operativa inicial, sin inventar datos que todavía no están aprobados.

## ADDED Requirements

### Requirement: El catálogo arranca con las tres líneas comerciales

La base SHALL contener exactamente tres líneas comerciales —Árabes, Diseñador y Nicho— con identificadores `arabes`, `disenador` y `nicho`, y orden de navegación 1, 2 y 3 respectivamente.

#### Scenario: Un proyecto recién sembrado tiene las tres líneas

- **WHEN** se consultan las líneas del catálogo con la clave anónima
- **THEN** se obtienen exactamente tres filas
- **AND** sus nombres son Árabes, Diseñador y Nicho

#### Scenario: Las líneas salen en orden de navegación

- **WHEN** se leen las líneas ordenadas por su orden de navegación
- **THEN** Árabes queda primera, Diseñador segunda y Nicho tercera

#### Scenario: Cada línea tiene un identificador estable para URL

- **WHEN** se busca una línea por su identificador
- **THEN** `arabes`, `disenador` y `nicho` resuelven cada uno a una sola fila

### Requirement: La configuración arranca con un destino de pedidos válido

La base SHALL contener una única fila de configuración (`id = 1`) cuyo número de WhatsApp de destino contenga solo dígitos, con una longitud de 10 a 15, de modo que el sitio pueda construir un link de pedido desde el primer arranque.

#### Scenario: La fila de configuración existe una sola vez

- **WHEN** se consulta la configuración
- **THEN** existe exactamente una fila
- **AND** su identificador es 1

#### Scenario: El destino inicial cumple el formato exigido

- **WHEN** se lee el número de WhatsApp de destino
- **THEN** el valor contiene solo dígitos
- **AND** su longitud está entre 10 y 15 caracteres

#### Scenario: El destino inicial es reemplazable

- **WHEN** un administrador guarda más adelante el número real en la misma fila
- **THEN** la fila sigue siendo única y la configuración no requiere redeploy ni un seed nuevo

### Requirement: El seed no duplica filas ni pisa la configuración vigente

Aplicar el seed de datos base SHALL ser idempotente: repetirlo no SHALL crear líneas duplicadas ni SHALL sobrescribir un número de WhatsApp ya configurado.

#### Scenario: Se aplica el seed dos veces

- **WHEN** el seed se ejecuta sobre una base que ya lo tenía aplicado
- **THEN** el catálogo sigue teniendo tres líneas
- **AND** el número de WhatsApp conserva el valor vigente

#### Scenario: El seed no pisa el número real cargado desde el panel

- **WHEN** el número de destino ya fue reemplazado por el real y el seed se vuelve a ejecutar
- **THEN** el número real permanece sin cambios

### Requirement: El seed solo carga datos aprobados

El seed SHALL limitarse a las líneas y a la configuración operativa, y SHALL NOT crear marcas, perfumes, presentaciones, acordes ni frases mientras no exista una lista aprobada.

#### Scenario: Las tablas sin datos aprobados quedan vacías

- **WHEN** se consultan marcas, perfumes, presentaciones, acordes y frases después del seed
- **THEN** todas están vacías
- **AND** el catálogo no muestra datos inventados ni de ejemplo
