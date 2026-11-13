# Spec Delta

## Purpose

Define cómo la aplicación obtiene su conexión a Supabase desde el navegador: qué credenciales públicas usa, cómo falla cuando falta configuración y qué garantías existen de que ninguna clave sensible llega al bundle ni se persisten datos del comprador.

## ADDED Requirements

### Requirement: Cliente de Supabase configurado por variables públicas

La aplicación SHALL exponer un cliente de Supabase para el navegador construido a partir de la URL del proyecto y la clave `anon`, leídas de variables públicas de entorno.

#### Scenario: El cliente se crea con la configuración del entorno

- **WHEN** el entorno define la URL del proyecto y la clave `anon`
- **THEN** el cliente queda inicializado apuntando a esa URL
- **AND** usa la clave `anon` como credencial

#### Scenario: Una URL con formato inválido no inicializa el cliente

- **WHEN** se inicia la aplicación con una URL de proyecto que no es una URL válida
- **THEN** el arranque falla con un mensaje que nombra la variable de URL
- **AND** no se crea el cliente

### Requirement: Configuración faltante falla de forma explícita

Si falta la URL del proyecto o la clave `anon`, la aplicación SHALL fallar de forma explícita con un mensaje que nombre la variable faltante, y SHALL NOT inicializar el cliente con valores vacíos.

#### Scenario: Falta la URL del proyecto

- **WHEN** se inicia la aplicación sin la variable de URL
- **THEN** el arranque falla con un mensaje que nombra esa variable
- **AND** no se crea un cliente apuntando a una URL vacía

#### Scenario: Falta la clave anon

- **WHEN** se inicia la aplicación sin la variable de clave `anon`
- **THEN** el arranque falla con un mensaje que nombra esa variable
- **AND** no se crea un cliente con credencial vacía

### Requirement: Ninguna clave sensible en el bundle

El código servido al navegador SHALL NOT contener la clave de servicio (`service_role`) ni variables de entorno no públicas.

#### Scenario: El bundle no expone la clave de servicio

- **WHEN** se busca la clave de servicio en los archivos generados por el build
- **THEN** no aparece en ninguno
- **AND** solo se referencian variables públicas de entorno

#### Scenario: Las variables públicas son las únicas embebidas

- **WHEN** se revisan los valores de entorno incluidos en el bundle
- **THEN** todos corresponden a variables declaradas como públicas

### Requirement: Una sola instancia del cliente por documento

La aplicación SHALL reutilizar una única instancia del cliente de Supabase durante la vida del documento, de modo que los módulos que lo importan compartan la misma conexión.

#### Scenario: Dos importaciones comparten el cliente

- **WHEN** dos módulos distintos importan el cliente en la misma página
- **THEN** ambos reciben la misma instancia

### Requirement: Inicializar el cliente no persiste datos del comprador

Cargar el shell SHALL NOT crear sesión de comprador, SHALL NOT guardar datos personales en el navegador y SHALL NOT emitir pedidos de red a Supabase.

#### Scenario: La portada no contacta a Supabase

- **WHEN** se carga la portada del shell con la red inspeccionada
- **THEN** no se realiza ningún pedido al proyecto de Supabase

#### Scenario: No se persiste información del comprador

- **WHEN** se inspecciona el almacenamiento del navegador después de cargar la portada
- **THEN** no existen sesiones de comprador ni datos personales guardados

### Requirement: Variables documentadas y secretos fuera del repositorio

El proyecto SHALL documentar las variables de entorno requeridas en un archivo de ejemplo versionado y SHALL NOT versionar valores reales ni la clave de servicio.

#### Scenario: El archivo de ejemplo lista las variables requeridas

- **WHEN** se revisa el archivo de ejemplo versionado
- **THEN** incluye la URL del proyecto y la clave `anon`
- **AND** no incluye valores reales de ningún entorno

#### Scenario: Los archivos de entorno reales quedan ignorados

- **WHEN** se revisa la configuración de control de versiones
- **THEN** los archivos `.env` están excluidos del repositorio
- **AND** el archivo de ejemplo está incluido
