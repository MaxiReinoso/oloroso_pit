# Spec Delta — admin-auth

## Purpose

Define el acceso al panel de administración: quién puede entrar, cómo se
comporta una sesión sin permisos, cómo se cierra sesión y por qué el alta de
administradores queda fuera de la aplicación.

## ADDED Requirements

### Requirement: Solo una sesión válida accede al panel

El panel SHALL requerir una sesión de Supabase Auth obtenida con correo y
contraseña válidos, y SHALL NOT ofrecer ningún camino de acceso sin
credenciales.

#### Scenario: Credenciales válidas abren el panel

- **WHEN** un administrador ingresa su correo y contraseña correctos en el login
- **THEN** la sesión queda iniciada y el navegador abre el panel
- **AND** las peticiones posteriores del panel viajan con esa sesión

#### Scenario: Credenciales inválidas no abren el panel

- **WHEN** se envían credenciales incorrectas
- **THEN** la sesión no se inicia
- **AND** el panel no se abre

#### Scenario: Un correo sin cuenta no se distingue de una contraseña incorrecta

- **WHEN** se intenta entrar con un correo que no existe
- **THEN** el mensaje de error es el mismo que con una contraseña incorrecta
- **AND** el mensaje no revela si el correo está registrado

### Requirement: Sin sesión, las rutas del panel redirigen al login

Toda ruta bajo `/admin` distinta del formulario de acceso SHALL considerarse
privada y SHALL redirigir al login cuando no haya una sesión iniciada.

#### Scenario: Entrada directa a una ruta privada sin sesión

- **WHEN** un visitante sin sesión abre cualquier ruta privada del panel
- **THEN** es redirigido a `/admin/login`
- **AND** no ve el contenido del panel mientras se resuelve la redirección

#### Scenario: Ruta privada sin sesión conserva el destino

- **WHEN** un visitante sin sesión abre una ruta privada del panel
- **THEN** el login recuerda esa ruta
- **AND** después de un login válido lo lleva a esa ruta

#### Scenario: El formulario de acceso es público

- **WHEN** un visitante sin sesión abre el login del panel
- **THEN** ve el formulario sin redirecciones adicionales

#### Scenario: Destino inválido no se usa

- **WHEN** el destino recordado no es una ruta interna del panel
- **THEN** después del login se abre el inicio del panel
- **AND** no se redirige fuera del sitio

### Requirement: La sesión persiste y se puede cerrar

La sesión del administrador SHALL mantenerse al recargar el panel mientras sea
válida y SHALL poder cerrarse explícitamente.

#### Scenario: Recargar mantiene la sesión

- **WHEN** el administrador recarga una ruta privada con una sesión válida
- **THEN** la ruta se muestra sin volver a pedir credenciales

#### Scenario: Cerrar sesión expulsa del panel

- **WHEN** el administrador cierra sesión
- **THEN** la sesión deja de existir
- **AND** cualquier ruta privada del panel vuelve a pedir credenciales

#### Scenario: La sesión expirada vuelve al login

- **WHEN** la sesión deja de ser válida mientras se usa el panel
- **THEN** el panel redirige al login
- **AND** no deja acciones del panel disponibles

### Requirement: El registro público está cerrado

La aplicación SHALL NOT permitir crear cuentas. El alta de usuarios SHALL
ocurrir fuera del sitio y el servidor de autenticación SHALL rechazar el
registro público.

#### Scenario: El cliente no registra usuarios

- **WHEN** se revisa el código de la aplicación y el artefacto publicado
- **THEN** no existe ninguna invocación de alta de usuario, ni de sesión anónima
- **AND** el formulario del panel solo ofrece iniciar sesión

#### Scenario: El servidor de autenticación rechaza el registro

- **WHEN** se consulta la configuración pública del servicio de autenticación
- **THEN** el registro de nuevos usuarios figura deshabilitado

#### Scenario: Las cuentas se crean fuera de la aplicación

- **WHEN** se necesita un administrador nuevo
- **THEN** su cuenta se crea desde la consola del proveedor de autenticación
- **AND** ninguna credencial queda en el repositorio ni en el sitio publicado

### Requirement: Un usuario autenticado que no es administrador no obtiene permisos

El acceso a los datos del panel SHALL depender de la autorización de la base y
SHALL NOT depender de que la interfaz oculte controles.

#### Scenario: Sesión válida sin permisos de escritura

- **WHEN** una sesión válida intenta escribir datos del catálogo sin estar
  autorizada por la base
- **THEN** la escritura es rechazada
- **AND** el rechazo no se evita ocultando o mostrando botones en el navegador
