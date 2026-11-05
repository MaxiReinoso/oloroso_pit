# Funcionalidades

Organizadas por épica y luego por historia de usuario (`US-NNN`). Cada historia lleva su **estado** según el brief: **[Acordado]**, **[Propuesto]** o **[Acordado en concepto]**. Los criterios de aceptación (`CA`) son la base de las pruebas.

Regla transversal: ninguna historia puede contradecir `RN-GLB-01` (sin pagos), `RN-GLB-02` (sin datos de clientes) ni `RN-GLB-03` (sin costo).

---

## Épica 1 — Catálogo público

### US-001 — Ver el catálogo completo
**Como** cliente final
**Quiero** ver todos los perfumes disponibles en una grilla
**Para** descubrir qué ofrece Oloroso Pit sin depender de Instagram

**Estado**: [Acordado]

**Criterios de aceptación**:
- [ ] Cada tarjeta muestra nombre, marca, línea, género, precio e imagen.
- [ ] Solo aparecen perfumes publicados (`activo = true`).
- [ ] El precio se muestra siempre, incluso sin stock.
- [ ] La grilla es usable en móvil (390 px) y escritorio (1440 px).
- [ ] Si un perfume no tiene imagen, se muestra un placeholder, no un hueco roto.

**Reglas**: RN-CAT-01, RN-PRE-03, RN-CAT-11

### US-002 — Navegar por línea comercial
**Como** cliente final
**Quiero** navegar por Árabes, Diseñador y Nicho
**Para** ver solo el tipo de perfume que me interesa

**Estado**: [Acordado] / lanzamiento limitado a Árabes [Acordado, a confirmar]

**Criterios de aceptación**:
- [ ] La navegación muestra las líneas con al menos un perfume publicado.
- [ ] Una línea sin productos no aparece (ni como link vacío).
- [ ] En el lanzamiento solo Árabes es visible si es la única con productos.
- [ ] La URL de cada línea es estable y compartible.

**Reglas**: RN-CAT-02, RN-CAT-03

### US-003 — Navegar por marca
**Como** cliente final
**Quiero** ver los perfumes de una marca específica
**Para** encontrar rápido lo que ya conozco

**Estado**: [Acordado]

**Criterios de aceptación**:
- [ ] Se puede entrar a una marca desde la tarjeta del perfume o desde un listado.
- [ ] Solo se listan marcas con al menos un perfume publicado.
- [ ] La URL de marca es estable.

**Reglas**: RN-CAT-01, RN-CAT-11

### US-004 — Ver la ficha de un perfume
**Como** cliente final
**Quiero** abrir un perfume y ver su detalle
**Para** decidir si me sirve antes de pedirlo

**Estado**: [Acordado]

**Criterios de aceptación**:
- [ ] La ficha muestra nombre, marca, línea, género, imagen y descripción.
- [ ] Muestra las presentaciones disponibles con su precio y su estado ("En stock" / "Sin stock, por encargo").
- [ ] Muestra los acordes del perfume.
- [ ] Muestra hasta 3 frases "ideal para...".
- [ ] Permite agregar al carrito desde la ficha.
- [ ] Si el perfume no existe o está desactivado, devuelve 404 (no un error 500).

**Reglas**: RN-CAT-01, RN-CAT-05, RN-STK-01, RN-STK-04, RN-STK-02

### US-005 — Ver las presentaciones (frasco y decants)
**Como** cliente final
**Quiero** elegir entre frasco sellado, decant de 5 ml y decant de 10 ml
**Para** comprar según mi presupuesto

**Estado**: [Acordado en concepto] — presentaciones con precio/stock propios [Propuesto]

**Criterios de aceptación**:
- [ ] Cada presentación muestra su volumen, precio y disponibilidad.
- [ ] El precio cambia según la presentación seleccionada, sin recargar la página (patrón Juleriaque).
- [ ] Se puede agregar cada presentación al carrito por separado.
- [ ] Los precios de decant salen de la base, no están hardcodeados.

**Reglas**: RN-CAT-08, RN-CAT-09, RN-STK-02, RN-PRE-02

### US-006 — Ver la sección de ofertas
**Como** cliente final
**Quiero** ver qué perfumes están en oferta
**Para** aprovechar un descuento

**Estado**: [Acordado en concepto, detalle por validar]

**Criterios de aceptación**:
- [ ] Existe una sección accesible desde la navegación principal.
- [ ] Solo muestra ofertas vigentes.
- [ ] El precio de oferta y el de lista se distinguen visualmente.
- [ ] El detalle exacto (tachado, %, vencimiento, decants) se define antes de implementar.

**Reglas**: RN-CAT-10, RN-PRE-05, RN-PRE-06

**Bloqueada por**: pregunta abierta sobre el detalle de ofertas.

---

## Épica 2 — Descubrimiento y asesoramiento

### US-007 — Filtrar por género
**Como** cliente final
**Quiero** filtrar por masculino, femenino o unisex
**Para** no perder tiempo con perfumes que no son para mí

**Estado**: [Acordado]

**Criterios de aceptación**:
- [ ] Los filtros son excluyentes entre sí (un género a la vez) o permiten selección múltiple; la decisión debe quedar documentada.
- [ ] El filtro se refleja en la URL para poder compartirlo.
- [ ] El filtro se puede limpiar en un clic.
- [ ] Combinado con otros filtros, el resultado es la intersección.

**Reglas**: RN-CAT-04

### US-008 — Filtrar por acordes olfativos
**Como** cliente final
**Quiero** filtrar por acordes (amaderado, dulce, especiado...)
**Para** encontrar perfumes con el estilo que me gusta

**Estado**: [Acordado]

**Criterios de aceptación**:
- [ ] El listado de acordes se arma con los acordes presentes en perfumes publicados.
- [ ] Si se agrega un acorde nuevo desde el panel, aparece en el filtro sin redeploy.
- [ ] Un perfume con varios acordes aparece al filtrar por cualquiera de ellos.
- [ ] Se pueden seleccionar varios acordes; el resultado es la unión (OR), no la intersección. **Esta semántica debe confirmarse.**
- [ ] Un acorde sin perfumes publicados no se muestra.

**Reglas**: RN-CAT-06, RN-CAT-07

### US-009 — Leer frases de asesoramiento
**Como** cliente final
**Quiero** ver frases tipo "ideal para citas o salir de noche"
**Para** elegir un perfume según la ocasión

**Estado**: [Acordado]

**Criterios de aceptación**:
- [ ] La ficha muestra hasta 3 frases por perfume.
- [ ] Las frases se muestran como texto legible, no como tags técnicas.
- [ ] No se muestran frases desactivadas.

**Reglas**: RN-CAT-05, RN-ADM-08

### US-010 — Buscar un perfume por nombre
**Como** cliente final
**Quiero** escribir el nombre y encontrarlo
**Para** ir directo a lo que busco

**Estado**: [Propuesto] — no figura en el brief. Es una funcionalidad de bajo costo y alto valor; confirmar si entra en v1 o queda para después.

**Criterios de aceptación**:
- [ ] La búsqueda matchea por nombre de perfume y por marca.
- [ ] Tolera mayúsculas, minúsculas y tildes.
- [ ] Sin resultados, muestra un mensaje claro y sugiere limpiar filtros.

---

## Épica 3 — Carrito y pedido por WhatsApp

### US-011 — Agregar perfumes al carrito
**Como** cliente final
**Quiero** agregar uno o varios perfumes, con cantidad
**Para** armar mi pedido

**Estado**: [Acordado]

**Criterios de aceptación**:
- [ ] Puedo agregar la misma presentación más de una vez y la cantidad se incrementa.
- [ ] Puedo cambiar la cantidad desde el carrito.
- [ ] Puedo quitar un ítem.
- [ ] El carrito persiste al navegar entre páginas y al recargar (mismo navegador).
- [ ] El contador del carrito refleja la cantidad total de unidades.

**Reglas**: RN-CAR-01, RN-CAR-11

### US-012 — Ver el carrito con compra y encargo separados
**Como** cliente final
**Quiero** ver qué ítems están en stock y cuáles son por encargo
**Para** saber qué me van a entregar ya y qué van a pedir

**Estado**: [Propuesto]

**Criterios de aceptación**:
- [ ] Cada ítem muestra si es compra o encargo.
- [ ] Los totales se muestran por separado (subtotal compra / subtotal encargo).
- [ ] Se muestra un total general.
- [ ] El carrito vacío muestra un estado vacío con acceso al catálogo.

**Reglas**: RN-CAR-03, RN-CAR-04, RN-STK-01

### US-013 — Enviar el pedido por WhatsApp
**Como** cliente final
**Quiero** generar un mensaje con mi pedido y enviarlo
**Para** cerrar la compra o el encargo sin crear una cuenta

**Estado**: [Acordado]

**Criterios de aceptación**:
- [ ] El botón abre WhatsApp (`wa.me`) con el mensaje prearmado y el número configurado.
- [ ] El mensaje incluye, por ítem: perfume, marca, presentación, cantidad y precio.
- [ ] El mensaje separa compra y encargo.
- [ ] El mensaje no incluye datos personales del cliente.
- [ ] Con el carrito vacío, el botón está deshabilitado y no se genera link.
- [ ] El mensaje se codifica correctamente (tildes, saltos de línea, símbolo `$`).
- [ ] El link funciona en móvil y en escritorio.

**Reglas**: RN-CAR-02, RN-CAR-03, RN-CAR-04, RN-CAR-05, RN-CAR-06, RN-CAR-07, RN-CAR-10

**Ejemplo de mensaje (propuesta, sujeta a validación)**:
```
Hola! Quiero hacer este pedido:

COMPRA (en stock)
- 1x Lattafa Khamrah — 100 ml — $XX.XXX
- 2x Lattafa Asad — decant 5 ml — $8.000 c/u

ENCARGO (sin stock)
- 1x Armaf Club de Nuit — 100 ml — $XX.XXX

Total: $XX.XXX
```

### US-014 — No encontrarme con un checkout
**Como** cliente final
**Quiero** que el sitio no me pida tarjeta ni datos de pago
**Para** pedir como siempre lo hice por WhatsApp

**Estado**: [Acordado — restricción estricta]

**Criterios de aceptación**:
- [ ] No existe ninguna pantalla de pago.
- [ ] No se solicita tarjeta, CBU, alias ni datos bancarios.
- [ ] No hay integración con ninguna pasarela.
- [ ] El único call-to-action de cierre es "Enviar pedido por WhatsApp".

**Reglas**: RN-CAR-10, RN-GLB-01

---

## Épica 4 — Administración: acceso

### US-015 — Iniciar sesión en el panel
**Como** administrador (dueño)
**Quiero** entrar al panel con usuario y contraseña
**Para** gestionar el catálogo

**Estado**: [Acordado]

**Criterios de aceptación**:
- [ ] Existe `/admin/login` con campos de usuario/email y contraseña.
- [ ] Con credenciales válidas, redirige a `/admin`.
- [ ] Con credenciales inválidas, muestra un error genérico (sin revelar si el usuario existe).
- [ ] Sin sesión, cualquier ruta `/admin/*` redirige al login.
- [ ] La sesión persiste al recargar (hasta expirar).
- [ ] Existe un botón de cerrar sesión.

**Reglas**: RN-ADM-01, RN-ADM-02, RN-ADM-06

**Pendiente**: usuario genérico vs email personal (ver `10_preguntas_abiertas.md`).

### US-016 — Recuperar el acceso
**Como** administrador
**Quiero** poder recuperar mi contraseña
**Para** no quedar bloqueado

**Estado**: [Propuesto] — no figura en el brief, pero es un riesgo operativo real con solo dos usuarios.

**Criterios de aceptación**:
- [ ] Existe un mecanismo de reseteo (email de Supabase Auth o reseteo manual documentado).
- [ ] El procedimiento está documentado para los dueños.

---

## Épica 5 — Administración: catálogo

### US-017 — Dar de alta un perfume
**Como** administrador
**Quiero** cargar un perfume nuevo
**Para** que aparezca en el catálogo

**Estado**: [Propuesto, respuesta ya enviada a los dueños]

**Criterios de aceptación**:
- [ ] El formulario pide nombre, marca, línea, género, descripción, imagen, acordes, frases y al menos una presentación.
- [ ] Se puede crear una marca nueva desde el mismo formulario.
- [ ] Se puede crear un acorde nuevo desde el mismo formulario.
- [ ] Se puede crear una frase nueva desde el mismo formulario.
- [ ] El perfume se crea como **sin stock** por defecto.
- [ ] Si falta un campo obligatorio, se muestra el error junto al campo.
- [ ] Al guardar, el perfume aparece en el catálogo público.

**Reglas**: RN-STK-03, RN-ADM-10, RN-ADM-08

### US-018 — Editar precio, stock e imagen
**Como** administrador
**Quiero** cambiar el precio, el stock o la foto de un perfume
**Para** mantener el catálogo al día sin ayuda técnica

**Estado**: [Acordado]

**Criterios de aceptación**:
- [ ] Se puede editar el precio de cada presentación.
- [ ] Se puede editar el stock de cada presentación (incluido pasar de 0 a > 0).
- [ ] Se puede reemplazar la imagen.
- [ ] Los cambios se reflejan en el catálogo sin redeploy.
- [ ] Se rechazan precios negativos y stock negativo.
- [ ] Se muestra confirmación de guardado.

**Reglas**: RN-PRE-02, RN-PRE-08, RN-STK-02, RN-CAT-08

### US-019 — Despublicar un perfume
**Como** administrador
**Quiero** sacar un perfume del catálogo sin borrarlo
**Para** no perder los datos si vuelve a estar disponible

**Estado**: [Propuesto]

**Criterios de aceptación**:
- [ ] Un perfume desactivado no aparece en el catálogo público.
- [ ] Sus datos siguen en el panel y se puede reactivar.
- [ ] La URL pública del perfume desactivado devuelve 404.

**Reglas**: RN-CAT-11

---

## Épica 6 — Administración: asesoramiento y taxonomías

### US-020 — Gestionar acordes
**Como** administrador
**Quiero** crear, renombrar y desactivar acordes
**Para** mantener el filtro ordenado

**Estado**: [Acordado] (editables sin código)

**Criterios de aceptación**:
- [ ] Se pueden crear acordes desde el panel.
- [ ] Renombrar un acorde actualiza todas las fichas que lo usan.
- [ ] Un acorde sin perfumes no aparece en el filtro público.
- [ ] No se permiten duplicados por nombre (case-insensitive).

**Reglas**: RN-ADM-08, RN-CAT-07, RN-DAT-03

### US-021 — Asignar una frase a varios perfumes
**Como** administrador
**Quiero** elegir una frase y aplicarla a varios perfumes a la vez
**Para** no repetir la carga uno por uno

**Estado**: [Acordado]

**Criterios de aceptación**:
- [ ] Se puede seleccionar una frase y marcar varios perfumes.
- [ ] La asignación respeta el máximo de 3 frases por perfume; si un perfume ya tiene 3, se informa y no se agrega.
- [ ] Se muestra un resumen de cuántos perfumes se actualizaron.
- [ ] La operación es atómica: si falla a mitad, no deja asignaciones parciales.

**Reglas**: RN-ADM-09, RN-CAT-05

### US-022 — Asignar acordes y frases a un perfume
**Como** administrador
**Quiero** editar los acordes y las frases de un perfume
**Para** ajustar su clasificación

**Estado**: [Acordado]

**Criterios de aceptación**:
- [ ] Se pueden seleccionar varios acordes.
- [ ] Se pueden seleccionar hasta 3 frases.
- [ ] Al intentar una cuarta frase, el sistema lo impide con un mensaje claro.
- [ ] Los cambios se reflejan en la ficha pública.

**Reglas**: RN-CAT-05, RN-CAT-06

---

## Épica 7 — Administración: configuración

### US-023 — Cambiar el número de WhatsApp que recibe los pedidos
**Como** administrador
**Quiero** cambiar el número de destino
**Para** que los pedidos lleguen a la persona correcta

**Estado**: [Propuesto]

**Criterios de aceptación**:
- [ ] Solo un administrador autenticado puede cambiar el número.
- [ ] El campo acepta solo dígitos con código de país.
- [ ] Se rechazan formatos inválidos (espacios, `+`, guiones, letras).
- [ ] Se muestra el número actual de forma visible antes y después del cambio.
- [ ] El cambio aplica de inmediato, sin redeploy.
- [ ] Se registra quién y cuándo cambió el número.

**Reglas**: RN-CAR-08, RN-CAR-09, RN-ADM-03, RN-ADM-11, RN-ADM-12

**Riesgo**: es la acción de mayor impacto del panel. Un cambio malicioso desvía todos los pedidos. Ver `03_actores_y_roles.md`.

---

## Épica 8 — Puesta en marcha de datos

### US-024 — Importar el catálogo desde la planilla
**Como** administrador / desarrollador
**Quiero** cargar una vez los datos de la planilla
**Para** no tipear cientos de perfumes a mano

**Estado**: [Propuesto]

**Criterios de aceptación**:
- [ ] Se importan perfumes, marcas, líneas, precios y acordes de la hoja Árabes primero.
- [ ] Los registros con datos faltantes se reportan, no se completan con valores inventados.
- [ ] Los acordes equivalentes se unifican según la lista aprobada.
- [ ] La importación se corre una sola vez y la planilla deja de usarse.
- [ ] Queda un reporte de cuántos registros se importaron y cuántos quedaron incompletos.

**Reglas**: RN-DAT-01, RN-DAT-02, RN-DAT-03, RN-DAT-05

**Bloqueada por**: aprobación de la lista unificada de acordes.

---

## Fases posteriores (fuera del MVP)

| Funcionalidad | Estado | Nota |
|---|---|---|
| Cuestionario de asesoramiento (acordes + género + frases) | [Propuesto] | Reutiliza las taxonomías existentes; no requiere modelo nuevo |
| Ficha detallada con notas y barras de acordes, estilo post de Instagram | [Propuesto] | Requiere campos de notas (salida, corazón, fondo) que hoy no están en el modelo |
| Combos y promociones tipo 3x2 | [Propuesto] | Requiere reglas de precio compuesto que chocan con "precio por presentación" |
| Importación inicial desde la planilla | [Propuesto] | Ver US-024 |

## Resumen de alcance

| Épica | Historias | Acordadas o en concepto | Propuestas |
|---|---|---|---|
| Catálogo público | 6 | 6 | 0 |
| Descubrimiento | 4 | 3 | 1 (US-010 buscador) |
| Carrito y pedido | 4 | 3 | 1 |
| Acceso admin | 2 | 1 | 1 |
| Catálogo admin | 3 | 1 | 2 |
| Taxonomías admin | 3 | 3 | 0 |
| Configuración | 1 | 0 | 1 |
| Datos | 1 | 0 | 1 |
| **Total** | **24** | **17** | **7** |
