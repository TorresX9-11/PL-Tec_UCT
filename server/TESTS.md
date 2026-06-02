# Resultados de Pruebas - Backend PL-Tec UCT

## Resumen de Ejecución

| Métrica | Valor |
|---------|-------|
| **Fecha de ejecución** | 2026-06-02 |
| **Total de tests** | **98** |
| **Estado** | ✅ **TODOS PASAN** |
| **Endpoints cubiertos** | 11 recursos |
| **Framework** | Vitest + Supertest |

## Estructura de Tests

```
tests/
├── helpers/
│   ├── app.ts          # Factory de app Express para tests
│   ├── auth.ts         # Generadores de tokens JWT
│   └── setup.ts        # Configuración global
└── integration/
    ├── health.test.ts      # Health check
    ├── auth.test.ts        # Autenticación
    ├── carreras.test.ts    # Carreras
    ├── usuarios.test.ts    # Usuarios
    ├── docentes.test.ts    # Docentes
    ├── cursos.test.ts      # Cursos
    ├── grupos.test.ts      # Grupos
    ├── propuestas.test.ts  # Propuestas
    ├── pagos.test.ts       # Pagos
    ├── archivos.test.ts    # Archivos
    ├── capacitaciones.test.ts # Capacitaciones
    └── coordinadores.test.ts  # Coordinadores
```

## Endpoints Testeados

### 1. Health Check
- ✅ `GET /api/v1/health` - Estado del servidor

### 2. Autenticación (`/api/v1/auth`)
- ✅ `POST /login` - Validación de credenciales
- ✅ Manejo de errores (credenciales inválidas, formato email, longitud contraseña)

### 3. Carreras (`/api/v1/carreras`)
- ✅ `GET /` - Listar carreras (público)
- ✅ `GET /:id` - Obtener carrera (público)
- ✅ `POST /` - Crear carrera (admin/coordinador)
- ✅ `PUT /:id` - Actualizar carrera (admin/coordinador)
- ✅ `DELETE /:id` - Eliminar carrera (solo admin)

### 4. Usuarios (`/api/v1/usuarios`)
- ✅ `GET /` - Listar usuarios (público)
- ✅ `GET /:id` - Obtener usuario (público)
- ✅ `POST /` - Crear usuario (solo admin)
- ✅ `PUT /:id` - Actualizar usuario (solo admin)
- ✅ `DELETE /:id` - Eliminar usuario (solo admin)

### 5. Docentes (`/api/v1/docentes`)
- ✅ `GET /` - Listar docentes
- ✅ `GET /:id` - Obtener docente
- ✅ `POST /` - Crear docente (admin/coordinador)
- ✅ `PUT /:id` - Actualizar docente (admin/coordinador)
- ✅ `DELETE /:id` - Eliminar docente (solo admin)

### 6. Cursos (`/api/v1/cursos`)
- ✅ `GET /` - Listar cursos
- ✅ `GET /:id_carrera/:id_curso` - Obtener curso (PK compuesta)
- ✅ `POST /` - Crear curso (admin/coordinador)
- ✅ `PUT /:id_carrera/:id_curso` - Actualizar curso
- ✅ `DELETE /:id_carrera/:id_curso` - Eliminar curso (solo admin)

### 7. Grupos (`/api/v1/grupos`)
- ✅ `GET /` - Listar grupos
- ✅ `GET /:id` - Obtener grupo
- ✅ `POST /` - Crear grupo (admin/coordinador)
- ✅ `PUT /:id` - Actualizar grupo
- ✅ `DELETE /:id` - Eliminar grupo (solo admin)

### 8. Propuestas (`/api/v1/propuestas`)
- ✅ `GET /` - Listar propuestas
- ✅ `GET /:id` - Obtener propuesta
- ✅ `POST /` - Crear propuesta (admin/coordinador)
- ✅ `PUT /:id` - Actualizar propuesta
- ✅ `DELETE /:id` - Eliminar propuesta (solo admin)

### 9. Pagos (`/api/v1/pagos`)
- ✅ `GET /` - Listar pagos
- ✅ `GET /:id` - Obtener pago
- ✅ `POST /` - Crear pago (admin/coordinador)
- ✅ `PUT /:id` - Actualizar pago
- ✅ `DELETE /:id` - Eliminar pago (solo admin)

### 10. Archivos (`/api/v1/archivos`)
- ✅ `GET /` - Listar archivos
- ✅ `GET /:id` - Obtener archivo
- ✅ `POST /` - Crear archivo (cualquier usuario autenticado)
- ✅ `PUT /:id` - Actualizar archivo (cualquier usuario autenticado)
- ✅ `DELETE /:id` - Eliminar archivo (cualquier usuario autenticado)

### 11. Capacitaciones (`/api/v1/capacitaciones`)
- ✅ `GET /` - Listar capacitaciones (público)
- ✅ `GET /:id` - Obtener capacitación (público)
- ✅ `POST /` - Crear capacitación (cualquier usuario autenticado)
- ✅ `PUT /:id` - Actualizar capacitación
- ✅ `DELETE /:id` - Eliminar capacitación

### 12. Coordinadores (`/api/v1/coordinadores`)
- ✅ `GET /` - Listar coordinadores (público)
- ✅ `GET /:id` - Obtener coordinador (público)
- ✅ `POST /` - Crear coordinador (cualquier usuario autenticado)
- ✅ `PUT /:id` - Actualizar coordinador
- ✅ `DELETE /:id` - Eliminar coordinador

## Casos de Prueba Implementados

### Validación de Autenticación
- ✅ Token JWT válido
- ✅ Token JWT ausente
- ✅ Token JWT inválido/expirado
- ✅ Niveles de usuario (admin, coordinador, docente, académico)

### Validación de Autorización
- ✅ Acceso público a endpoints de lectura
- ✅ Restricción de escritura según nivel de usuario
- ✅ Solo admin puede eliminar recursos

### Validación de Datos
- ✅ Campos requeridos
- ✅ Formatos válidos (email, enums)
- ✅ Longitudes mínimas/máximas
- ✅ Valores permitidos en enums (nivel, jornada, semestre, etc.)

### Manejo de Errores
- ✅ 400 - Bad Request (datos inválidos)
- ✅ 401 - Unauthorized (sin autenticación)
- ✅ 403 - Forbidden (sin permisos)
- ✅ 404 - Not Found (recurso no existe)
- ✅ 409 - Conflict (duplicados/dependencias)

## Cómo Ejecutar

```bash
# Instalar dependencias
pnpm install

# Ejecutar todos los tests
pnpm test

# Ejecutar en modo watch
pnpm test:watch

# Ejecutar con cobertura
pnpm test:coverage

# Ejecutar un archivo específico
pnpm vitest run tests/integration/auth.test.ts
```

## Configuración Requerida

Variables de entorno por defecto para tests (`.env.test`):

```env
NODE_ENV=test
PORT=3001
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=plataforma_test
JWT_SECRET=test-secret-key-must-be-32-chars-long!!!
JWT_EXPIRES_IN=1h
```

## Resultados de Ejecución

```
Test Files  12 passed (12)
Tests       98 passed (98)
Duration    6.56s
```

## Notas

- Los tests de integración requieren una base de datos MySQL/MariaDB disponible
- Las pruebas utilizan tokens JWT generados dinámicamente para simular diferentes roles
- Los tests están diseñados para manejar errores de BD (FK constraints, duplicados) como casos válidos
- Se recomienda ejecutar los tests contra una base de datos de prueba separada
