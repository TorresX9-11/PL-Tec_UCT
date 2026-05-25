# Plataforma TEC — UCT (P_LAB_TEC)

Plataforma web interna del área **TEC** de la **Universidad Católica de Temuco** para la administración de docentes a honorarios y la gestión del módulo académico (asignaturas, secciones, notas, contenido en Blackboard, propuestas económicas y pagos).

> Aplicación **no pública**, de uso interno. El frontend es una SPA estática servible desde cualquier servidor (Apache/Nginx/IIS) y consumirá un backend PHP REST cuando esté disponible.

---

## Stack

- **Frontend:** React 18 + TypeScript + Vite 6
- **UI:** TailwindCSS v4 + shadcn/ui (Radix) + MUI + `lucide-react`
- **Routing:** `react-router` v7
- **Datos:** mocks en `src/app/data/mockData.ts` (sin backend conectado todavía)
- **PDF / Reportes:** `jspdf` + `jspdf-autotable` + `recharts`
- **Gestor de paquetes:** **pnpm** vía Corepack (no usar `npm`)

---

## Requisitos

- Node.js 20+
- Corepack habilitado (`corepack enable`)
- pnpm 11.x (lo provee Corepack según `packageManager` en `package.json`)

---

## Instalación y desarrollo

```powershell
# 1) Habilitar corepack (una sola vez por máquina)
corepack enable

# 2) Instalar dependencias
corepack pnpm install

# 3) Levantar dev server
#    Workaround por bug de pnpm v11 con build scripts nativos
#    (esbuild / @tailwindcss/oxide / core-js quedan bloqueados a la espera de aprobación)
.\node_modules\.bin\vite.cmd --port 5173
```

App disponible en <http://localhost:5173/>.

### Build de producción

```powershell
corepack pnpm build
``` 

El bundle estático queda en `dist/` y puede servirse desde cualquier servidor HTTP.

---

## Estructura del proyecto

```
PL-Tec_UCT/
├── database/                # Esquema SQL del cliente (ver database/README.md)
│   └── schema.sql
├── guidelines/              # Lineamientos del proyecto
├── src/
│   ├── app/
│   │   ├── data/            # mockData.ts (estado simulado)
│   │   ├── pages/           # Páginas por rol (admin / academico / docente)
│   │   ├── components/      # Componentes shadcn/ui + propios
│   │   └── routes.tsx       # Definición de rutas
│   ├── styles/
│   └── main.tsx
├── index.html
├── vite.config.ts
├── package.json
├── PROGRESO.md              # Bitácora viva del proyecto (LEER PRIMERO)
└── RESUMEN_PLATAFORMA_TEC.md
```

---

## Rutas principales

### Público
- `/` — Landing

### Admin (`/admin/*`)
- `/admin/login`
- `/admin/dashboard`
- `/admin/carreras-asignaturas`
- `/admin/docentes`
- `/admin/reportes`

### Académico (`/academico/*`)
- `/academico/login`
- `/academico/dashboard`
- `/plataforma-docentes`
- `/gestion-academica`
- `/validar-docente/:id`
- `/acreditacion`
- `/reportes`

### Docente (`/docente/*`)
- `/docente/dashboard`
- `/cv`, `/certificados`, `/capacitaciones`, `/boletas`

---

## Reglas de negocio clave

- **Cuotas de pago:** docentes diurnos → 4 (Abr–Jul); vespertinos → 5 (Abr–Ago).
- **Niveles docente:** A / B / C (tarifas pendientes de confirmación por el cliente).
- **Valor de propuesta:** se ingresa el **valor total** a nivel propuesta-docente (`propuestas.valor_propuesta`); el **valor hora** es derivado (`valor_propuesta / total_horas`).
- **Lookup automático:** al seleccionar un docente en designación PMA se autocompletan RUT, DV y nivel desde la tabla maestra.
- **Borrado semestral:** acción protegida por clave + confirmación explícita.
- **Carreras:** orden fijo (6 diurnas + 4 vespertinas), escalable a 10–12.
- **Notas:** el avance se modela como `notasIngresadas / notasTotales` (alineado a `cursos.notas_ingresadas` / `cursos.notas_curso`).

---

## Base de datos

Esquema vigente entregado por el cliente en `database/schema.sql`. Ver `database/README.md` para detalle de tablas y cómo aplicarlo.

Tablas principales: `usuarios`, `carreras`, `cursos`, `grupos`, `docentes`, `propuestas`, `pagos`, `archivos`, `capacitaciones`, `coordinadores`.

El mapeo BD ↔ frontend está documentado en `PROGRESO.md` (sección 8).

---

## Backend (futuro)

PHP + API REST. Aún no implementado. Cuando exista:

- Crear `src/app/data/api.ts` con funciones tipadas que devuelvan los mismos shapes que `mockData.ts`.
- Reemplazar los imports de mocks por llamadas a la API sin tocar las vistas.

---

## Documentación interna

- **`PROGRESO.md`** — bitácora viva. **Leer primero** al retomar el proyecto en un chat nuevo.
- **`RESUMEN_PLATAFORMA_TEC.md`** — estado extendido y especificación detallada.
- **`guidelines/`** — lineamientos de diseño / código.
- **`ATTRIBUTIONS.md`** — créditos.

---

## Notas de pnpm v11

pnpm 11 bloquea la ejecución de scripts de build nativos (`esbuild`, `@tailwindcss/oxide`, `core-js`) hasta aprobarlos manualmente. Mientras no se apruebe, `pnpm dev` puede quedar colgado: por eso se invoca `vite` directamente desde `node_modules\.bin\vite.cmd`.

---

## Licencia

Uso interno UCT — área TEC. No distribuir.