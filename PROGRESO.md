# PROGRESO — Plataforma TEC UCT (P_LAB_TEC)

> Bitácora viva del proyecto. Cualquier chat nuevo de Cascade debe leer este archivo primero para retomar contexto sin perder hilo.

---

## 1. Contexto

- **Cliente:** área TEC, Universidad Católica de Temuco.
- **Producto:** plataforma web interna (no pública) para administración de docentes a honorarios + módulo académico.
- **Documento de requisitos original:** `c:\Users\JoTche_\Downloads\PROMPT_PLATAFORMA_TEC_UCT.md`.
- **Documento de estado extendido:** `RESUMEN_PLATAFORMA_TEC.md` (42 KB, en la raíz del proyecto).

---

## 2. Stack tecnológico (decidido)

- **Frontend:** React 18 + TypeScript + Vite 6 + TailwindCSS v4 + shadcn/ui (Radix) + MUI + `react-router` v7.
- **Estado:** mock data en `src/app/data/mockData.ts` (sin backend conectado todavía).
- **Backend futuro:** **NestJS** (API REST tipada con DTOs). El frontend se mantiene como SPA y consumirá la API por `fetch`. Se planificará una capa `src/app/data/api.ts` con tipos compartidos cliente↔servidor.
- **Gestor de paquetes:** **pnpm únicamente** (vía Corepack). NO usar `npm` por filtración reciente en el registro.

### Decisión de arquitectura
Se evaluó migrar a HTML+CSS+JS puro y se descartó: ya hay ~80 archivos hechos (3 layouts, ~20 páginas con tablas complejas, lib shadcn/ui completa). Vite genera bundle estático servible desde cualquier servidor estático; el backend NestJS corre independiente y se consume vía REST.

---

## 3. Cómo correr el proyecto

```powershell
# Una sola vez (instalación) — usar --ignore-scripts para evitar bloqueo de build scripts
corepack pnpm install --ignore-scripts

# Levantar dev server
.\node_modules\.bin\vite.cmd --port 5173
```

> **Nota pnpm v11:** `corepack pnpm install` (sin flags) bloquea con error al intentar ejecutar build scripts nativos (esbuild, @tailwindcss/oxide, core-js). Usar siempre `--ignore-scripts`.

URL local: <http://localhost:5173/>

---

## 4. Estructura de la aplicación

### Rutas activas (`src/app/routes.tsx`)

- `/` — `LandingPage`
- **Admin** (`/admin/*`):
  - `/admin/login`
  - `/admin/dashboard`, `/admin/carreras-asignaturas`, `/admin/docentes`, `/admin/reportes`
- **Académico** (`/academico/*`):
  - `/academico/login`
  - `/academico/dashboard`, `/plataforma-docentes`, `/gestion-academica`, `/validar-docente/:id`, `/acreditacion`, `/reportes`
- **Docente** (`/docente/*`):
  - `/docente/dashboard`, `/cv`, `/certificados`, `/capacitaciones`, `/boletas`

### Páginas huérfanas (existen pero NO están enrutadas)

Archivos en `src/app/pages/admin/` que el usuario aún no expone:
- `TablaCarreras.tsx`
- `TablaAsignaturas.tsx`
- `TablaDocentesMaestros.tsx` ← **Capa 1 del prompt** (tabla maestra docentes)
- `TablaDesignacionPMA.tsx` ← **Capa 2 del prompt** (designación PMA)
- `TablaPropuestasSemestrales.tsx` ← **Capa 3 del prompt** (estado de propuestas)

> Pendiente decidir con el cliente si estas tablas se enrutan, se fusionan con las existentes o se descartan.

---

## 5. Reglas de negocio clave (del prompt)

- **Cuotas:** diurnos 4 (Abr–Jul), vespertinos 5 (Abr–Ago).
- **Niveles docente:** A / B / C (tarifas vigentes — pendiente que el cliente las confirme).
- **Lookup automático:** seleccionar docente en designación PMA → autocompleta RUT, DV, nivel desde tabla maestra.
- **Borrado semestral:** botón protegido por clave + confirmación explícita.
- **Carreras:** orden fijo (6 diurnas + 4 vespertinas), escalable a 10–12.

---

## 6. Decisiones tomadas

| Fecha | Decisión |
|-------|----------|
| 2026-05-20 | Mantener stack React+TS, no migrar a HTML/PHP puro. |
| 2026-05-20 | Usar `pnpm` exclusivamente vía Corepack. |
| 2026-05-20 | Ignorar `database.sql` actual (desactualizado, el cliente sigue diseñando la BD real). |
| 2026-05-24 | Cliente entregó BD real: `c:\Users\JoTche_\Downloads\DLCSwitch\a_manito.sql`. Reemplaza al `database.sql` viejo. |
| 2026-05-25 | BD del cliente incorporada al proyecto en `database/schema.sql` (con README). `database.sql` viejo eliminado. |
| 2026-05-24 | El **valor total** se ingresa por **propuesta-docente** (tabla `propuestas.valor_propuesta`), NO por sección. El **valor hora** es derivado: `valor_propuesta / total_horas`. UI: input en tabla Propuestas Semestrales (botón ✏️), no en Designación PMA. |

---

## 7. Cambios pedidos por el cliente (reunión)

> Se irán agregando aquí a medida que el usuario los indique. Formato: una entrada por cambio, con fecha, ubicación afectada, descripción y estado.

| # | Fecha | Pantalla / Archivo | Cambio | Estado |
|---|-------|--------------------|--------|--------|
| 1 | 2026-05-24 | Admin → Designación PMA + Propuestas Semestrales | Quitar "Valor Hora" del form de PMA. Agregar edición manual del **Valor Total** a nivel propuesta-docente y mostrar columna **Valor Hora** derivada en Propuestas. | ✅ |
| 2 | 2026-05-25 | Académico → Gestión Académica / Dashboard / Reportes | Renombrar columna y referencias **"Contenido Subido"** → **"Contenido Blackboard"**. | ✅ |
| 3 | 2026-05-25 | Académico → Gestión Académica (tabla y alertas) | "Notas al Día" deja de ser ✓/✗. Modelo cambia a `notasIngresadas`/`notasTotales` (alineado a `cursos.notas_ingresadas`/`notas_curso` de la BD). UI: badge **"X / Y"** con color (verde=completo, naranja=parcial, rojo=ninguna) + porcentaje. | ✅ |
| 4 | 2026-05-25 | Admin → Base de datos (pestañas) | Renombrar pestaña **"Capa 1: Maestro Docentes" → "Capa 1: Docentes"**. | ✅ |
| 5 | 2026-05-25 | Admin → Capa 1: Docentes | Nueva acción **"Editar ramos"** (ícono libro): dialog con secciones asignadas (quitar) y disponibles (asignar). Refresca la columna **Ramos Asignados**. | ✅ |
| 6 | 2026-05-26 | Admin → Capa 3: Propuestas Semestrales | **Recálculo automático**: el listado se genera con `useMemo` recorriendo `mockSeccionesAsignaturas` + `calcularPropuestaSemestral`. Valor total manual por docente persistido en `localStorage` (`valores_propuesta_manual`). Totales y `Valor Hora` se actualizan en vivo. | ✅ |
| 7 | 2026-05-26 | Admin → Detalle de Propuesta (botón 👁️) | Nueva tarjeta **"Ramos Asignados"** (Asignatura, Sigla, Sección, Hrs P/M/A, Total) antes de Distribución de Horas PMA. Dialog con scroll vertical (`max-h-[90vh]` + body scroll) y tablas con `overflow-x-auto`. | ✅ |
| 8 | 2026-05-26 | Admin ↔ Docente → Notas por cuota | **Mensajes del admin sincronizados a boletas del docente**. Centralizado en `src/app/data/mensajesAdmin.ts` (storage `mensajes_propuesta_${docenteId}`, keyed por `cuotaId` real de `mockCuotasMensuales`). Admin escribe nota desde "Detalle de Cuotas"; el docente la ve **inline bajo su boleta** correspondiente, o en card "Notas pendientes" si aún no subió la boleta. Sincronización en vivo via `StorageEvent` + custom event `mensajes-admin:update`. | ✅ |

---

## 8. Pendientes / TODO

- [ ] Recibir BD definitiva del cliente.
- [ ] Definir qué hacer con las páginas huérfanas (enrutar vs eliminar vs fusionar).
- [ ] Confirmar tarifas por nivel docente (A/B/C).
- [ ] Diseñar backend **NestJS** (REST + DTOs) cuando llegue la BD.
  - Crear `src/app/data/api.ts` con funciones tipadas que devuelvan los mismos shapes del mock.
  - Reemplazar `src/app/data/mensajesAdmin.ts` (`load/save/setMensajeCuota`) por llamadas REST manteniendo la misma firma. Las notas mapean 1:1 a la futura columna `pagos.observaciones` (o tabla `mensajes_cuota`) keyed por `cuotaId`.
  - Mapeo BD → frontend: `rut_docente`→`rut`, `nivel_docente`→`nivelDocente`, `valor_propuesta`→`montoTotalPropuesta`, `notas_ingresadas`/`notas_curso`→`notasIngresadas`/`notasTotales`.
  - Estados derivados (`boletasEstado`, `valorCuotaBruto`, `saldo`) los calcula backend o frontend.
  - Pedir al cliente agregar `rut_docente` a `grupos` si quieren docente-por-sección (hoy en BD está solo en `cursos`).
- [ ] Implementar autenticación real (hoy solo hay pantallas de login mockeadas).

---

## 9. Cómo continuar entre chats

1. Abre **`P_LAB_TEC`** como workspace en Windsurf (no `LAB_TEC`).
2. Empieza el chat pidiéndole a Cascade: *"Lee `PROGRESO.md` y continuemos."*
3. Cascade tiene además una memoria persistente con el contexto clave del proyecto.
