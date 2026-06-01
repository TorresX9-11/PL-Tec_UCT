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
# Editar .env: DB_PASSWORD, JWT_SECRET (REQUERIDO: mínimo 32 caracteres, debe incluir números y/o caracteres especiales)
# Generar JWT_SECRET fuerte ejecutando:
#   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Copia el resultado y pégalo en .env después de JWT_SECRET=

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

- [x] Replicar la plantilla para los 9 recursos restantes (`cursos`, `grupos`, `docentes`, `propuestas`, `pagos`, `archivos`, `capacitaciones`, `coordinadores`, `usuarios`). ✅ COMPLETADO
- [x] Endpoint `/auth/login` con bcrypt + `signToken`. ✅ COMPLETADO
- [x] Aplicar `requireAuth` a rutas de escritura (POST, PUT, DELETE). ✅ COMPLETADO
- [x] Migrar contraseñas a bcrypt. ✅ COMPLETADO
  - Actualizado `usuarios.contrasena` en schema.sql de VARCHAR(32) a VARCHAR(255)
  - Controller auth usa bcrypt.compare con fallback para contraseñas antiguas en texto plano
  - Controller usuarios hashea contraseñas con bcrypt.hash en create y update
- [x] Aplicar `requireLevel` a rutas según matriz de permisos. ✅ COMPLETADO
  - Recursos críticos (usuarios, docentes, cursos, grupos, propuestas, pagos, carreras): POST/PUT → admin + coordinador, DELETE → admin
  - Recursos secundarios (archivos, capacitaciones, coordinadores): POST/PUT/DELETE → cualquier usuario autenticado
- [ ] Tests (vitest + supertest) — pendiente para próxima sesión.

---

## 10. RESUMEN FINAL - ESTADO DEL BACKEND

### ✅ COMPLETADO (Sprint 1-3)

**Infraestructura**:
- ✅ Arquitectura Layered (config → middleware → routes → controllers → services → db)
- ✅ Validación de entrada con Zod
- ✅ Manejo centralizado de errores (HttpError + errorHandler)
- ✅ Prepared statements (SQL injection prevention)
- ✅ Middleware de autenticación JWT
- ✅ Middleware de autorización por roles (requireAuth, requireLevel)
- ✅ CORS, Helmet, Morgan configurados
- ✅ Variables de entorno validadas con Zod

**Recursos CRUD** (10 recursos):
- ✅ carreras
- ✅ usuarios
- ✅ docentes
- ✅ cursos (con PK compuesta)
- ✅ grupos
- ✅ propuestas
- ✅ pagos
- ✅ archivos
- ✅ capacitaciones
- ✅ coordinadores

**Autenticación & Seguridad**:
- ✅ Endpoint `/auth/login` con JWT
- ✅ Contraseñas hasheadas con bcrypt (salt rounds: 10)
- ✅ JWT_SECRET fuerte validado (mínimo 32 caracteres)
- ✅ Fallback para contraseñas antiguas en texto plano (migración gradual)
- ✅ Rutas de escritura protegidas con `requireAuth`
- ✅ Rutas críticas protegidas con `requireLevel` (admin, coordinador)

### 📋 PENDIENTE (Sprint 4+)

**Testing** (próxima sesión):
- [ ] Configurar Vitest + Supertest
- [ ] Tests para los 10 recursos (carreras, usuarios, docentes, cursos, grupos, propuestas, pagos, archivos, capacitaciones, coordinadores)
- [ ] Tests de integración para flujos complejos (ej: crear propuesta → crear pago)
- [ ] Tests de errores y edge cases

**Mejoras Futuras**:
- [ ] Rate limiting (express-rate-limit)
- [ ] Campos audit (created_at, updated_at, created_by, updated_by)
- [ ] Logging estructurado (winston o pino)
- [ ] Migraciones de BD (knex o typeorm)
- [ ] Documentación Swagger/OpenAPI
- [ ] Validación de archivos (tipo, tamaño)
- [ ] Paginación en endpoints GET
- [ ] Filtros y búsqueda avanzada
- [ ] Soft deletes
- [ ] Versionado de API (/api/v2, etc.)

**Producción**:
- [ ] PM2 para process management
- [ ] HTTPS/TLS
- [ ] Docker + docker-compose
- [ ] CI/CD (GitHub Actions, GitLab CI)
- [ ] Monitoreo y alertas
- [ ] Backup automático de BD

---

## 11. Cómo continuar

### Para ejecutar el backend:
```bash
cd server
pnpm install
pnpm dev
```

### Para agregar un nuevo recurso:
1. Crear schema en `src/schemas/<recurso>.schema.ts`
2. Crear service en `src/services/<recurso>.service.ts`
3. Crear controller en `src/controllers/<recurso>.controller.ts`
4. Crear router en `src/routes/<recurso>.ts`
5. Montar router en `src/routes/index.ts`

### Para cambiar permisos de una ruta:
Editar `src/routes/<recurso>.ts` y ajustar `requireLevel()`:
```ts
router.post('/', requireAuth, requireLevel('admin', 'coordinador'), asyncHandler(handler));
```
