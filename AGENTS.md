# Oloroso Pit — Instrucciones para Agentes

> Este archivo (y su copia `CLAUDE.md`) es lo PRIMERO que todo agente lee al entrar al repo.
> Generado a partir de `knowledge-base/`, `CHANGES.md`, `design-system/` y `.atl/skill-registry.md`.
> No editar a mano sin re-sincronizar ambos archivos.

---

## Fuente de verdad

**`docs/discovery/brief-clientes.md` (v5, 2026-11-05) manda sobre cualquier otro documento.**

Jerarquía ante conflicto:

1. `docs/discovery/brief-clientes.md` v5 — fuente de verdad del producto.
2. `CHANGES.md` — índice operativo: qué se construye, en qué orden, con qué criterios de aceptación.
3. `knowledge-base/` — estructura navegable del dominio (no reemplaza al brief).
4. `design-system/` — contrato visual.
5. `discovery/` — investigación de competidores (contexto, no requisito).

Si la KB, `CHANGES.md` o un mockup contradicen el brief, **gana el brief** y la contradicción se registra como pregunta abierta. No se inventa una regla para destrabar el conflicto.

---

## Stack Tecnológico

Stack **decidido** en T-01 (`CHANGES.md` §C-01). No propongas alternativas.

| Capa | Tecnología | Notas |
|------|------------|-------|
| Frontend | Astro (sitio estático) + islas React | Hidratación selectiva; sin servidor propio |
| Base de datos | Supabase Postgres (free tier) | RLS obligatoria en toda tabla |
| Autenticación | Supabase Auth (solo administradores) | `signUp` público cerrado |
| Storage de imágenes | Supabase Storage | Q-10 abierta: Storage vs. repo estático |
| Hosting | Hosting estático gratuito | **Sin VPS**, sin infraestructura paga |
| Pedidos | Deep link `wa.me` | Sin pasarela de pagos, sin checkout |
| Lenguaje | TypeScript estricto | Tipos de filas generados desde Supabase |
| Visual | `design-system/` revisión 4 (aprobada 2026-11-13) | Mockup aprobado por change visual |

> ⚠️ `knowledge-base/02_descripcion_general.md` todavía describe el stack como **[Propuesto]**.
> T-01 lo cerró en `CHANGES.md`; al refrescar la KB hay que sincronizar esa tabla. Mientras
> tanto, manda este archivo.

Detalle completo: [knowledge-base/02_descripcion_general.md](knowledge-base/02_descripcion_general.md) · [knowledge-base/08_arquitectura_propuesta.md](knowledge-base/08_arquitectura_propuesta.md)

---

## Base de Conocimiento

La fuente de verdad del dominio vive en `knowledge-base/`. **Leé el archivo relevante ANTES de implementar.**

| Archivo | Cuándo leerlo |
|---------|---------------|
| [01_vision_y_objetivos.md](knowledge-base/01_vision_y_objetivos.md) | Propósito, alcance del MVP, fuera de alcance |
| [02_descripcion_general.md](knowledge-base/02_descripcion_general.md) | Stack, arquitectura general, integración WhatsApp |
| [03_actores_y_roles.md](knowledge-base/03_actores_y_roles.md) | Actores, matriz RBAC `anon` / `authenticated`, rutas protegidas |
| [04_modelo_de_datos.md](knowledge-base/04_modelo_de_datos.md) | Entidades, ERD, constraints, seed |
| [05_reglas_de_negocio.md](knowledge-base/05_reglas_de_negocio.md) | Reglas codificadas `RN-XX-NN` |
| [06_funcionalidades.md](knowledge-base/06_funcionalidades.md) | 24 historias de usuario en 8 épicas |
| [07_flujos_principales.md](knowledge-base/07_flujos_principales.md) | Flujos extremo a extremo y casos de error |
| [08_arquitectura_propuesta.md](knowledge-base/08_arquitectura_propuesta.md) | Estructura de directorios, RLS, env vars, testing |
| [09_decisiones_y_supuestos.md](knowledge-base/09_decisiones_y_supuestos.md) | Decisiones (`DD`) y supuestos (`SU`) |
| [10_preguntas_abiertas.md](knowledge-base/10_preguntas_abiertas.md) | ⚠️ Inconsistencias y preguntas priorizadas |

> ⚠️ Antes del primer change, revisá las preguntas **Alta** de `10_preguntas_abiertas.md`
> y los bloqueos de cliente de `CHANGES.md` §6. Una pregunta Alta sin resolver se registra
> como bloqueo del change, no se responde por suposición.

---

## Skills Disponibles

Fuente de verdad: `.atl/skill-registry.md` (generado por `skill-registry`, **no versionado**).

| Agente | Rol | Skills que carga |
|--------|-----|------------------|
| **Orquestación (OPSX)** | Coordinar changes, no implementar | `active-orchestrator`, `openspec-explore`, `openspec-propose`, `openspec-apply-change`, `openspec-update-change`, `openspec-archive-change`, `openspec-sync-specs` |
| **Datos / Backend** | Esquema, migraciones, RLS, Auth, Storage | `supabase`, `supabase-postgres-best-practices` |
| **Frontend** | Astro, islas React, tipos | `typescript-advanced-types`, `emil-design-eng`, `design-taste-frontend-v1` (soft) |
| **UI / Accesibilidad** | Contraste, foco, teclado, labels | `accessibility` |
| **Testing** | Carrito, precios, mensaje de WhatsApp, filtros | `vitest` |
| **Fundación** (ya ejecutadas) | No re-ejecutar | `discovery-research`, `kb-creator`, `design-system`, `roadmap-generator`, `find-skill`, `skill-registry`, `agent-instruction` |

Cargá la skill correspondiente al contexto ANTES de escribir código.

> Los compact rules de cada skill los resuelve el orquestador desde `.atl/skill-registry.md` (generado por `skill-registry`; no versionado — no está en el repo). Esta tabla solo mapea skill→rol.

---

## Roadmap de Changes

El plan completo está en [CHANGES.md](CHANGES.md). Resumen:

- **Total**: 22 changes (`C-01` … `C-22`) en 6 fases.
- **Camino crítico** (9): `C-01 → C-02 → C-03 → C-04 → C-08 → C-11 → C-12 → C-21 → C-22`.
- **Primer change**: `C-01` (`fundacion-proyecto`).

**Antes de cualquier `/opsx:propose`**: leé `CHANGES.md`, identificá las dependencias del change y sus archivos de "Leer antes".

### Estado de la fundación

| Fase | Estado |
|------|--------|
| Discovery | ✅ `discovery/` + `docs/discovery/` |
| Knowledge base | ✅ 11 archivos en `knowledge-base/` |
| Design system | ✅ revisión 4 **aprobada** (2026-11-13), `Mode: system-and-mockups` |
| Roadmap | ✅ `CHANGES.md` (22 changes) |
| Skills | ✅ `supabase`, `supabase-postgres-best-practices`, `accessibility` instaladas |
| Skill registry | ✅ `.atl/skill-registry.md` |
| Agentes | ✅ este archivo + `CLAUDE.md` |

`CHANGES.md` C-01 ya referencia el mockup del shell **aprobado** contra `Design system revision: 4`.

> Ningún change se ejecuta sin pedido explícito del usuario. La fundación termina acá;
> `C-01` arranca cuando el usuario lo confirme.

---

## Reglas Duras

> Reglas **globales** ya definidas en `~/.config/opencode/AGENTS.md` (orquestador, governance por dominio, TDD, engram): el proyecto las **hereda**, no se repiten acá. Acá viven las reglas específicas de Oloroso Pit.

Son contrato. Romperlas es un defecto, no un estilo.

1. **NUNCA** contradecir `docs/discovery/brief-clientes.md` v5 → el brief manda sobre KB, `discovery/`, `CHANGES.md` y diseño; si hay conflicto, se registra como pregunta abierta.
2. **NUNCA** cambiar el stack decidido (T-01: Astro + islas React + Supabase) → sin VPS y sin infraestructura paga; el sitio es estático con hosting gratuito.
3. **NUNCA** agregar checkout ni pasarela de pagos → el pedido se cierra con un deep link `wa.me` con texto prearmado.
4. **NUNCA** usar otra referencia visual que no sea `design-system/` revisión 4 → los mockups declaran `Design system revision: 4`.
5. **NUNCA** cambiar un token o asset compartido sin subir `Revision:` y volver `Approval: pending` en `design-system/README.md` → assets: `tokens.css`, `brand.js`, `brand.md`, `assets/*`.
6. **NUNCA** usar `any` ni tipos sueltos en el borde de datos → TypeScript estricto y tipos de filas generados desde Supabase.
7. **NUNCA** dejar una tabla en `public` sin RLS → `anon` solo lee catálogo público; la escritura requiere rol `authenticated`; el registro público está cerrado.
8. **NUNCA** hardcodear precios, marcas, acordes, frases ni el número de WhatsApp → son datos en Supabase, editables desde el panel sin tocar código.
9. **NUNCA** persistir datos del comprador → el carrito vive en `localStorage`; no hay cuentas de cliente ni órdenes guardadas.
10. **NUNCA** escribir hex o tamaños de color fuera de `tokens.css` → todo sale de tokens; blanco nunca sobre naranja ni sobre lila; los estados (`stock`, `encargo`, `alerta`) van sobre blanco.
11. **NUNCA** hidratar islas React con `client:load` por defecto → `client:visible` o `client:idle` salvo interacción inmediata.

---

## Flujo de Trabajo

```
1. Leer el brief y la KB relevante             → entender el dominio
2. Identificar el change en CHANGES.md         → respetar dependencias y bloqueos
3. /opsx:propose C-NN-nombre                   → proposal + design + specs + tasks
4. Mockup aprobado (si Visual? Sí)             → gate de design-mockups antes de codear
5. Implementar las tasks (cargando skills)     → respetando las reglas duras
6. /opsx:archive C-NN-nombre + marcar [x]      → cerrar el change
```

Aplicar TODAS las reglas duras en cada paso. Ante conflicto entre la KB y este archivo, las reglas duras prevalecen; ante conflicto con el brief, prevalece el brief.
