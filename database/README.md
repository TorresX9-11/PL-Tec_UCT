# Base de datos — Plataforma TEC

Este directorio contiene los archivos SQL del proyecto.

## Archivos

| Archivo | Descripción |
|---------|-------------|
| `schema.sql` | Esquema **vigente** entregado por el cliente. Crea la base `plataforma` y todas las tablas. |

## Cómo aplicar el esquema (MariaDB/MySQL)

```bash
mysql -u root -p < database/schema.sql
```

O desde el cliente:

```sql
SOURCE database/schema.sql;
```

## Tablas

- `usuarios` — cuentas con nivel `docente | coordinador | admin`.
- `carreras` — catálogo de carreras.
- `cursos` — asignaturas asociadas a una carrera (incluye `notas_ingresadas` / `notas_curso`).
- `grupos` — secciones (1, 2, 3) de un curso con horas P/M/A.
- `docentes` — registro maestro (`rut_docente`, `dv`, `nivel_docente`).
- `propuestas` — propuesta económica semestral por docente (`valor_propuesta`, `cuotas`).
- `pagos` — cuotas mensuales de una propuesta.
- `archivos` — documentos cargados por usuarios (CV, certificados, boletas).
- `capacitaciones` — capacitaciones declaradas por un docente.
- `coordinadores` — coordinadores asignados a una carrera.

## Notas

- El esquema puede seguir evolucionando. Mantener este archivo sincronizado con la última versión entregada por el cliente.
- El mapeo BD ↔ frontend está documentado en `../PROGRESO.md`.
