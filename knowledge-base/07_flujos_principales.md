# Flujos Principales

Cada flujo se documenta extremo a extremo. Los componentes son: **Cliente** (navegador), **Frontend** (sitio estático), **Supabase** (Postgres + Auth + RLS), **WhatsApp** (externo) y **Admin** (dueño en el panel).

---

## Flujo 1 — Explorar el catálogo y filtrar

**Disparador**: el cliente entra al sitio (link de Instagram, WhatsApp o dominio propio).
**Actor**: cliente final.

**Pasos**:
1. El navegador pide `/`.
2. El frontend consulta a Supabase los perfumes publicados, con marca, línea, género, acordes, frases y presentaciones.
3. Supabase aplica RLS de lectura para `anon` y devuelve solo filas publicadas.
4. El frontend renderiza la grilla y la navegación con las líneas que tienen al menos un perfume.
5. El cliente aplica un filtro (línea, marca, género, acorde o texto).
6. El frontend actualiza la URL con los filtros y vuelve a consultar (o filtra en cliente si el volumen lo permite).
7. El resultado se renderiza sin recargar la página.

**Diagrama**:
```
Cliente → Frontend → Supabase (RLS anon) → Frontend → Cliente
```

**Casos de error**:
- **Supabase no responde** → mostrar estado de error con botón de reintentar; no dejar la grilla en blanco sin explicación.
- **Sin resultados** → mensaje "No encontramos perfumes con esos filtros" + botón "Limpiar filtros".
- **Imagen rota** → placeholder; nunca el `alt` crudo gigante.
- **Filtro por una línea sin productos** (URL manual) → redirigir a `/perfumes` o mostrar estado vacío, no un 404 seco.

**Notas**:
- Sin métricas definidas, este flujo no deja rastro. Es intencional (no se rastrean clientes).
- El orden por defecto de la grilla no está definido: ¿destacados, alfabético, más nuevo? **Pendiente**.

---

## Flujo 2 — Abrir una ficha y elegir presentación

**Disparador**: el cliente toca una tarjeta del catálogo.
**Actor**: cliente final.

**Pasos**:
1. El frontend navega a `/perfumes/[slug]`.
2. Consulta el perfume con sus presentaciones, acordes y frases.
3. Si el perfume no existe o está desactivado → 404.
4. Renderiza la ficha con:
   - nombre, marca, línea, género, imagen, descripción;
   - selector de presentación (frasco sellado / decant 5 ml / decant 10 ml) con precio dinámico;
   - indicador "En stock" / "Sin stock, por encargo" por presentación;
   - acordes;
   - hasta 3 frases "ideal para...".
5. El cliente cambia de presentación: el precio y el estado de stock se actualizan sin recargar.
6. El cliente elige cantidad y agrega al carrito.

**Casos de error**:
- **Perfume sin presentaciones cargadas** → mostrar la ficha sin botón de compra y un aviso interno; es un error de carga, no un estado válido del catálogo.
- **Precio nulo o cero** → no mostrar "0"; tratarlo como dato incompleto y reportarlo.
- **Deep link a un perfume desactivado** → 404 con acceso al catálogo.

**Notas**:
- La forma de mostrar los decants (en la ficha, sección aparte o ambas) **no está decidida**. El modelo soporta las tres; la UI debe elegir una y documentarla.
- El patrón de selector con precio dinámico se toma de Juleriaque como inspiración, sin copiar contenido ni diseño.

---

## Flujo 3 — Armar el carrito

**Disparador**: el cliente agrega un ítem desde la ficha o la grilla.
**Actor**: cliente final.

**Pasos**:
1. El frontend lee el carrito actual desde `localStorage` (o estado en memoria + persistencia).
2. Si la presentación ya está en el carrito, incrementa la cantidad; si no, agrega una fila nueva.
3. Persiste el carrito en el navegador.
4. Actualiza el contador visible.
5. El cliente puede abrir `/carrito`, cambiar cantidades o quitar ítems.
6. El frontend recalcula subtotales por tipo (compra / encargo) y total.

**Diagrama**:
```
Cliente → Frontend → localStorage
                    ← carrito actualizado
```

**Casos de error**:
- **`localStorage` deshabilitado o lleno** → el carrito funciona en memoria durante la sesión; avisar que no se conservará.
- **Datos del carrito desactualizados** (el admin cambió precio o stock) → al abrir el carrito, revalidar contra Supabase y avisar si algo cambió.
- **Producto despublicado que sigue en el carrito** → marcarlo como no disponible y ofrecer quitarlo.

**Notas**:
- **No hay reserva de stock**. Agregar al carrito no bloquea unidades.
- El carrito no se sincroniza entre dispositivos (no hay cuenta).
- La expiración del carrito no está definida; por defecto no expira dentro del navegador.

---

## Flujo 4 — Generar y enviar el pedido por WhatsApp (flujo crítico)

**Disparador**: el cliente toca "Enviar pedido por WhatsApp" en `/carrito`.
**Actor**: cliente final.
**Resultado esperado**: se abre WhatsApp con un mensaje prearmado, en el número configurado.

**Pasos**:
1. El frontend valida que el carrito no esté vacío.
2. Lee `settings.whatsapp_destino` desde Supabase (campo público).
3. Separa los ítems en **compra** (presentaciones con stock > 0) y **encargo** (stock = 0).
4. Arma el texto del mensaje con perfume, marca, presentación, cantidad y precio por ítem.
5. Calcula subtotales y total.
6. Codifica el texto con `encodeURIComponent`.
7. Construye `https://wa.me/<numero>?text=<mensaje>` y lo abre.
8. El cliente revisa y envía el mensaje desde WhatsApp.
9. El dueño recibe el pedido y responde por el mismo canal.

**Diagrama de secuencia**:
```
Cliente → Frontend: "Enviar pedido"
Frontend → Supabase: SELECT whatsapp_destino
Supabase → Frontend: 549XXXXXXXXXX
Frontend → Frontend: arma mensaje (compra / encargo)
Frontend → Cliente: abre wa.me/<numero>?text=...
Cliente → WhatsApp: envía el mensaje
WhatsApp → Dueño: pedido recibido
```

**Ejemplo de mensaje**:
```
Hola! Quiero hacer este pedido:

COMPRA (en stock)
- 1x Lattafa Khamrah — 100 ml — $XX.XXX
- 2x Lattafa Asad — decant 5 ml — $8.000 c/u

ENCARGO (sin stock)
- 1x Armaf Club de Nuit — 100 ml — $XX.XXX

Total: $XX.XXX
```

**Casos de error**:
- **Carrito vacío** → botón deshabilitado; no se genera link.
- **Sin número configurado** → bloquear el envío y mostrar un mensaje de error operativo (no abrir un WhatsApp sin destinatario).
- **Mensaje demasiado largo** (carrito muy grande) → el link puede truncarse. Validar el largo y, si excede el límite práctico, ofrecer enviar un resumen.
- **WhatsApp no instalado / sin sesión** → el deep link no completa el envío; el sistema no puede detectarlo. Mostrar una nota ("se abrirá WhatsApp") para no generar expectativa de envío automático.
- **Precio desactualizado entre el armado y el envío** → el mensaje lleva el precio que vio el cliente; el dueño confirma el precio final en la conversación. **Esto debe quedar claro operativamente.**

**Notas críticas**:
- **El sistema no sabe si el pedido se envió.** No hay confirmación, ni webhook, ni estado. Para el negocio, el pedido existe cuando llega el mensaje.
- **El sistema no descuenta stock.** El dueño lo ajusta a mano.
- **No se persiste ninguna orden.** Si el dueño pierde el mensaje, se pierde el pedido.

---

## Flujo 5 — Login del administrador

**Disparador**: un dueño entra a `/admin`.
**Actor**: administrador.

**Pasos**:
1. Sin sesión, el frontend redirige a `/admin/login`.
2. El admin ingresa credenciales.
3. El frontend llama a Supabase Auth (`signInWithPassword` o el método definido).
4. Supabase valida y devuelve una sesión con JWT.
5. El frontend guarda la sesión (persistencia de Supabase) y redirige a `/admin`.
6. Cada consulta/escritura posterior viaja con el JWT y RLS evalúa el rol `authenticated`.

**Casos de error**:
- **Credenciales inválidas** → error genérico ("Usuario o contraseña incorrectos"), sin distinguir cuál falló.
- **Usuario sin permisos** → si existe un usuario autenticado que no es admin, RLS debe rechazar la escritura igual. No confiar solo en el frontend.
- **Sesión expirada** → redirigir al login sin perder el contexto de la pantalla (si es posible).
- **Sin conexión** → mensaje claro, no un spinner infinito.

**Notas**:
- No hay registro público. Las cuentas se crean manualmente en Supabase.
- El mecanismo exacto (email + contraseña vs usuario genérico) está **pendiente**. Ver `10_preguntas_abiertas.md`.
- Con solo dos usuarios, conviene documentar el procedimiento de reseteo de contraseña.

---

## Flujo 6 — Alta de un perfume nuevo

**Disparador**: el admin toca "Nuevo perfume".
**Actor**: administrador autenticado.

**Pasos**:
1. El frontend abre `/admin/perfumes/nuevo`.
2. El admin completa: nombre, marca (existente o nueva), línea, género, descripción, imagen, acordes, frases y al menos una presentación con precio.
3. Si crea una marca/acorde/frase nueva, se inserta primero (o en la misma transacción) y queda disponible para seleccionar.
4. El admin guarda.
5. El frontend valida los campos obligatorios y los rangos (precio ≥ 0, stock ≥ 0, máximo 3 frases).
6. Inserta el perfume y sus relaciones.
7. El perfume se crea con `stock = 0` por defecto → se muestra como "Sin stock, por encargo".
8. El perfume aparece en el catálogo público.

**Casos de error**:
- **Slug duplicado** → generar uno alternativo o pedir corrección.
- **Cuarta frase** → bloquear con mensaje claro.
- **Imagen demasiado grande** → validar tamaño antes de subir.
- **Falla a mitad de la inserción** → no dejar un perfume sin presentaciones; usar transacción.
- **Sesión expirada al guardar** → no perder lo cargado; pedir re-login y reintentar.

**Notas**:
- El alta completa (con creación de taxonomías en la misma pantalla) es **[Propuesto]**; el brief confirma el alta de perfumes, no necesariamente la creación de marcas/acordes ahí mismo.
- La carga de imágenes no está resuelta: ¿Supabase Storage, repo estático o URL externa? **Pendiente.**

---

## Flujo 7 — Asignación masiva de una frase

**Disparador**: el admin decide aplicar una frase a varios perfumes.
**Actor**: administrador autenticado.

**Pasos**:
1. El admin elige una frase existente.
2. Selecciona varios perfumes (lista con búsqueda o checkboxes).
3. El frontend envía la operación.
4. El backend (RLS + lógica) verifica cuántas frases tiene cada perfume.
5. Agrega la frase solo a los perfumes con menos de 3; a los que ya tienen 3, los excluye.
6. Devuelve un resumen: "Se actualizaron N perfumes; M no se modificaron porque ya tenían 3 frases".
7. El admin ve el resultado.

**Casos de error**:
- **Todos los perfumes seleccionados ya tienen 3 frases** → no hacer nada y explicarlo.
- **Falla parcial** → la operación debe ser atómica o reportar exactamente qué se aplicó.

**Notas**:
- Es una de las pocas acciones masivas del panel. Debe ser idempotente: correrla dos veces no debe duplicar la asignación.

---

## Flujo 8 — Cambio del número de WhatsApp de destino

**Disparador**: cambia la persona que recibe los pedidos.
**Actor**: administrador autenticado.

**Pasos**:
1. El admin entra a `/admin/configuracion`.
2. El panel muestra el número actual de forma destacada.
3. El admin ingresa el nuevo número.
4. El frontend valida: solo dígitos, código de país, longitud razonable.
5. Se actualiza `settings.whatsapp_destino`.
6. Se registra `updated_at` y `updated_by`.
7. El cambio aplica de inmediato a todos los nuevos pedidos.
8. El panel confirma el cambio mostrando el número nuevo.

**Casos de error**:
- **Formato inválido** → rechazar y explicar el formato esperado.
- **Número con `+`, espacios o guiones** → normalizar o rechazar; no guardar un valor que rompa el deep link.
- **Cambio accidental** → exigir confirmación explícita ("¿Seguro que querés que los pedidos vayan a este número?").
- **Usuario no autorizado** → RLS rechaza la escritura aunque la UI esté visible.

**Notas**:
- Es la operación de mayor impacto del sistema. Un error acá desvía **todos** los pedidos sin que nadie lo note.
- Mitigación recomendada: mostrar el número en el footer público o en el panel de inicio, para que un cambio no deseado sea detectable.

---

## Flujo 9 — Importación inicial desde la planilla (una sola vez)

**Disparador**: puesta en marcha del catálogo.
**Actor**: desarrollador, con validación de los dueños.

**Pasos**:
1. Se trabaja sobre una **copia descargada** de la planilla (no se accede a OneDrive/Drive).
2. Se limpian los datos: nombres, precios, marcas, familias olfativas.
3. Se unifican los acordes equivalentes según la lista aprobada.
4. Se cargan líneas, marcas y acordes.
5. Se cargan los perfumes de la hoja **Árabes** con sus presentaciones.
6. Se cargan precios como datos; los decants 5 ml y 10 ml con sus precios acordados.
7. Se genera un reporte de registros importados, incompletos y descartados.
8. Los dueños revisan una muestra y aprueban.
9. La planilla se marca como obsoleta y deja de usarse.

**Casos de error**:
- **Precio faltante o ilegible** → reportar, no inventar.
- **Acorde no reconocido** → mapear al más cercano o dejar pendiente de aprobación.
- **Perfume duplicado** (mismo nombre/marca) → reportar para decisión manual.
- **Imágenes referenciadas en la planilla** → verificar que existan y que se puedan usar.

**Notas**:
- Es un flujo de una sola vez, no una integración. No hay sincronización posterior.
- **Riesgo**: que la planilla y la base convivan con información distinta. Mitigación: marcar la planilla como obsoleta el mismo día del corte.
- Este flujo está **[Propuesto]** y bloqueado por la aprobación de la lista de acordes.

---

## Resumen de flujos

| # | Flujo | Actor | Estado | Criticidad |
|---|---|---|---|---|
| 1 | Explorar y filtrar catálogo | Cliente | [Acordado] | Alta |
| 2 | Abrir ficha y elegir presentación | Cliente | [Acordado] / [Propuesto] | Alta |
| 3 | Armar carrito | Cliente | [Acordado] | Alta |
| 4 | Enviar pedido por WhatsApp | Cliente | [Acordado] | **Crítica** |
| 5 | Login admin | Admin | [Acordado] | **Crítica** |
| 6 | Alta de perfume | Admin | [Propuesto] | Alta |
| 7 | Asignación masiva de frase | Admin | [Acordado] | Media |
| 8 | Cambio de número de WhatsApp | Admin | [Propuesto] | **Crítica** (riesgo) |
| 9 | Import inicial desde planilla | Dev + dueños | [Propuesto] | Alta (una vez) |
