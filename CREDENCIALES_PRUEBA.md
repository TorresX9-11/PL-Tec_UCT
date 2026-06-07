# Credenciales de Prueba — Plataforma TEC UCT

> Archivo para testing interno. **No distribuir al cliente.**

---

## Módulo Administración (TEC / RRHH)

URL: `/admin/login`

| Usuario | Contraseña | Nota |
|---------|-----------|------|
| Cualquiera | `admin` | Backdoor de desarrollo |

---

## Módulo Académico — Coordinadores

URL: `/academico/login`

| Nombre | Correo | Contraseña | Carrera asignada |
|--------|--------|------------|------------------|
| María González | `mgonzalez@uct.cl` | `12222222` (RUT sin DV) | T.U. G. y Admin. Emp. (GADE) |
| Ana Rodríguez | `arodriguez@uct.cl` | `14444444` (RUT sin DV) | *(sin carrera)* |
| Coordinador genérico | `academico` | `academico` | Backdoor de desarrollo |

**Carlos Pérez** actualmente no tiene correo asignado en el mock → no puede iniciar sesión.

---

## Módulo Docente

URL: `/academico/login` *(mismo login que coordinadores)*

| Nombre | Correo | Contraseña |
|--------|--------|------------|
| Juan Carlos Pérez González | `juan.perez@uct.cl` | `12345678` (su RUT) o `docente123` |
| María Teresa Rodríguez Silva | `maria.rodriguez@uct.cl` | `13456789` o `docente123` |
| Cualquier docente del mock | Su correo registrado | Su RUT sin DV o `docente123` |

---

## Supervisor de Coordinadores

URL: `/academico/login` *(mismo login)*

| Nombre | Correo | Contraseña | Nota |
|--------|--------|------------|------|
| Director Área TEC | `director.tec@uct.cl` | `11111111` (RUT sin DV) | Ingresa, luego accede a `/supervisor/dashboard` |

---

## Modo Supervisión (desde Supervisor)

1. Iniciar sesión como **Director Área TEC** (`director.tec@uct.cl` / `11111111`)
2. Ir a **Dashboard de Carreras**
3. Hacer clic en **"Supervisar"** sobre una carrera con coordinador asignado
4. El sistema redirige al módulo académico en **modo solo lectura**
5. El supervisor puede **visualizar** docentes, validaciones y reportes, pero **no modificar** nada
6. Para salir: clic en **"Salir Modo Supervisión"** (header)

---

## Carreras disponibles para supervisión

| Código | Nombre completo |
|--------|-----------------|
| GADE | T.U. G. y Admin. Emp. |
| EENE | T.U. Elect. y Efi. Ener. |
| EDPA | T.U. Edu. Parv. y NB1 |
| PROA | T.U. Prod. Agro. Sost. |
| INFO | T.U. Informática |
| EDDI | T.U. Edu. Dífer. |
| EPAV | T.U. Edu. Parv. NB1 V. |
| EEEV | T.U. Ele. y Efi. Ener. V. |
| GAEV | T.U. G. y Adm. Emp. V. |
| INFV | T.U. Informática V. |
