# Plataforma TEC — Backend (`/server`)

Backend REST tipado para la **Plataforma TEC UCT**. Express + TypeScript + MySQL2/MariaDB, validación con zod.

> Este paquete vive **fuera del proyecto Vite** (`/src`) intencionalmente: el frontend SPA y el backend son procesos separados que se comunican por HTTP. No comparten bundler.

---

## 1. Stack

- **Runtime:** Node.js 20+
- **Framework HTTP:** Express 4
- **DB driver:** `mysql2/promise` (pool con prepared statements + named placeholders)
- **Validación:** zod 3
- **Auth (preparada, no obligatoria aún):** JWT (`jsonwebtoken`) + bcrypt
- **Dev:** `tsx watch` (hot reload sin compilar)

---

## 2. Setup inicial

Desde la raíz `server/`:

```powershell
# 1. Instalar dependencias (paquete independiente, NO tocar el root pnpm install)
pnpm install --ignore-scripts

# 2. Copiar variables de entorno y editarlas
copy .env.example .env
# Editar .env: DB_PASSWORD, JWT_SECRET (al menos 16 chars).

# 3. Asegurarte de que la BD `plataforma` existe (definida en /database/schema.sql)
#    Si aún no, importarla en MariaDB:
#    mysql -u root -p < ..\database\schema.sql

# 4. Levantar en modo desarrollo (hot reload)
pnpm dev
```

Endpoint de salud: <http://localhost:3001/api/v1/health>

---

## 3. Scripts disponibles

| Script | Qué hace |
|--------|----------|
| `pnpm dev` | Levanta con `tsx watch` (recompila al guardar). |
| `pnpm build` | Compila TS → `dist/`. |
| `pnpm start` | Corre `dist/index.js` (producción). |
| `pnpm typecheck` | Solo verifica tipos, sin emitir. |

---

## 4. Estructura del código

```
server/src/
├── index.ts                ← bootstrap Express + middleware global
├── config/
│   ├── env.ts              ← carga + valida .env (zod)
│   └── db.ts               ← pool mysql2 + pingDatabase()
├── middleware/
│   ├── error.ts            ← HttpError + errorHandler + notFoundHandler
│   ├── asyncHandler.ts     ← wrapper para handlers async
│   └── auth.ts             ← signToken + requireAuth + requireLevel (JWT)
├── routes/
│   ├── index.ts            ← monta /api/v1/*
│   └── carreras.ts         ← rutas del recurso carreras
├── controllers/
│   └── carreras.controller.ts  ← valida input + llama service + responde
├── services/
│   └── carreras.service.ts ← SQL parametrizado (única capa que toca DB)
└── schemas/
    └── carreras.schema.ts  ← zod: input/output del recurso
```

### Convención por capa

- **schemas/** — zod, sin efectos. Define DTOs de entrada y salida.
- **services/** — única capa con SQL. Recibe/devuelve tipos del schema.
- **controllers/** — orquesta: parsea con zod, llama al service, traduce a HTTP. **Sin SQL.**
- **routes/** — solo asocia paths a controllers. Aquí se enchufa `requireAuth` cuando sea necesario.

---

## 5. Cómo agregar un recurso nuevo

Replica el patrón de `carreras` para cada tabla del esquema (`cursos`, `docentes`, `propuestas`, `pagos`, etc.).

1. **Schema:** `src/schemas/<recurso>.schema.ts` — define `RecursoSchema`, `Create...Schema`, `Update...Schema`, `...IdParamSchema`.
2. **Service:** `src/services/<recurso>.service.ts` — funciones `list/findById/create/update/delete` con `pool.execute(...)`.
3. **Controller:** `src/controllers/<recurso>.controller.ts` — `list/getOne/create/update/remove`.
4. **Router:** `src/routes/<recurso>.ts` — declara las 5 rutas REST envueltas en `asyncHandler`.
5. **Mount:** en `src/routes/index.ts` agregar `apiRouter.use('/<recurso>', <recurso>Router)`.

---

## 6. Convenciones REST

| Verbo | Path | Respuesta éxito | Respuesta error |
|-------|------|-----------------|-----------------|
| `GET` | `/api/v1/<recurso>` | 200 `{ data: [...] }` | 500 |
| `GET` | `/api/v1/<recurso>/:id` | 200 `{ data: {...} }` | 404 |
| `POST` | `/api/v1/<recurso>` | 201 `{ data: {...} }` | 400 (validación) / 409 (duplicado) |
| `PUT` | `/api/v1/<recurso>/:id` | 200 `{ data: {...} }` | 400 / 404 |
| `DELETE` | `/api/v1/<recurso>/:id` | 204 (sin body) | 404 |

Forma uniforme de error:

```json
{ "error": { "code": "NOT_FOUND", "message": "Carrera 'XYZ' no encontrada." } }
```

---

## 7. Autenticación (preparada, aún no obligatoria)

`src/middleware/auth.ts` ya provee:

- `signToken({ correo, nivel })` — firma JWT al hacer login.
- `requireAuth` — exige `Authorization: Bearer <token>`.
- `requireLevel('admin', 'academico')` — restringe por `usuarios.nivel`.

Aún no se aplica a las rutas de `carreras` para no bloquear el desarrollo. Cuando se implemente el endpoint `/auth/login` se enchufa así:

```ts
router.post('/', requireAuth, requireLevel('admin'), asyncHandler(carreras.create));
```

---

## 8. Decisiones (vinculadas a `PROGRESO.md`)

- **No NestJS, no Next.js**: el cliente del repositorio pidió Express simple en TypeScript. Decisión registrada al crear `/server` el 2026-05-27.
- **Frontend intacto**: nada en `/src/app/`, `vite.config.ts`, `index.html` ni `package.json` raíz se modifica.
- **`schema.sql` intacto**: el backend lee la BD existente, no la altera.
- **`src/api/`**: se mantiene vacía (puede usarse luego como capa de tipos compartidos cliente↔servidor).

---

## 9. Pendientes (próximas tareas)

- [ ] Replicar la plantilla para los 9 recursos restantes (`cursos`, `grupos`, `docentes`, `propuestas`, `pagos`, `archivos`, `capacitaciones`, `coordinadores`, `usuarios`).
- [ ] Endpoint `/auth/login` con bcrypt + `signToken`.
- [ ] Aplicar `requireAuth` + `requireLevel` a rutas según matriz de permisos.
- [ ] Tests (vitest + supertest) — un test por recurso.
- [ ] Migrar contraseñas de `usuarios.contrasena` (VARCHAR 32, parece texto plano) a hash bcrypt — coordinar con el cliente.
