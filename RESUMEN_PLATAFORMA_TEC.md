# 📚 Plataforma TEC - Universidad Católica de Temuco
## Documentación Técnica Completa

---

## 📋 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Tecnologías Utilizadas](#tecnologías-utilizadas)
3. [Arquitectura del Sistema](#arquitectura-del-sistema)
4. [Módulos Principales](#módulos-principales)
5. [Sistema de Autenticación](#sistema-de-autenticación)
6. [Módulo 1: Administración](#módulo-1-administración)
7. [Módulo 2: Área Académica](#módulo-2-área-académica)
8. [Módulo 3: Portal Docente](#módulo-3-portal-docente)
9. [Estructura de Datos](#estructura-de-datos)
10. [Rutas del Sistema](#rutas-del-sistema)
11. [Credenciales de Prueba](#credenciales-de-prueba)

---

## 📖 Descripción General

Plataforma web interna para el área TEC (Técnico Educativo y Capacitación) de la Universidad Católica de Temuco. Sistema integral dividido en **3 módulos independientes** que gestionan diferentes aspectos administrativos y académicos del personal docente.

### Objetivos Principales:
- ✅ Gestión de pagos y honorarios docentes
- ✅ Seguimiento académico y acreditación
- ✅ Autogestión de perfiles y documentación docente
- ✅ Generación de reportes en PDF
- ✅ Sistema de validación manual de documentos

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** - Biblioteca principal
- **TypeScript** - Tipado estático
- **Tailwind CSS v4** - Estilos y diseño
- **React Router** - Navegación SPA
- **Vite** - Build tool y servidor de desarrollo

### UI Components
- **shadcn/ui** - Componentes de interfaz
- **lucide-react** - Sistema de iconos
- **sonner** - Notificaciones toast

### Generación de Documentos
- **jsPDF** - Creación de archivos PDF
- **jspdf-autotable** - Tablas en PDF

### Gestión de Estado
- **React Hooks** (useState, useEffect)
- **SessionStorage** - Persistencia de sesión
- **Context API** - Estado global (preparado para implementación)

## 🛠️ Tecnologias a utilizar (Para desarrollar)

### Frontend
- **Html
- **Css
- **JavaScript
### Backend
-PHP
-MariaDb

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                    LANDING PAGE                          │
│              (Punto de entrada único)                    │
└────────────┬──────────────────────┬─────────────────────┘
             │                      │
    ┌────────▼─────────┐   ┌───────▼──────────┐
    │  LOGIN ADMIN     │   │  LOGIN ACADÉMICO  │
    │  (Pagos)         │   │  (Dual: Admin/Doc)│
    └────────┬─────────┘   └───────┬──────────┘
             │                      │
             │              ┌───────┴────────┐
             │              │                │
    ┌────────▼─────────┐   │       ┌────────▼─────────┐
    │   MÓDULO ADMIN   │   │       │  MÓDULO ACADÉMICO│
    │   - Dashboard    │   │       │  - Plataforma    │
    │   - BD Docentes  │   │       │  - Gestión Acad. │
    │   - Reportes     │   │       │  - Acreditación  │
    └──────────────────┘   │       │  - Reportes      │
                           │       │  - Validación    │
                           │       └──────────────────┘
                           │
                   ┌───────▼──────────┐
                   │  PORTAL DOCENTE  │
                   │  - Mi Perfil     │
                   │  - CV            │
                   │  - Certificados  │
                   │  - Capacitaciones│
                   │  - Boletas       │
                   └──────────────────┘
```

---

## 📦 Módulos Principales

### 1. **Módulo de Administración** (Gestión de Pagos)
- **Usuarios:** Personal administrativo
- **Color:** Azul
- **Función:** Gestión de pagos, honorarios y propuestas docentes

### 2. **Módulo Área Académica** (Gestión Académica)
- **Usuarios:** Coordinadores académicos
- **Color:** Verde
- **Función:** Seguimiento académico, validación de documentos, acreditación

### 3. **Portal Docente** (Autogestión)
- **Usuarios:** Docentes individuales
- **Color:** Verde
- **Función:** Gestión personal de perfil, documentos y capacitaciones

---

## 🔐 Sistema de Autenticación

### Landing Page
- **Ruta:** `/`
- **Elementos:**
  - Botón "Módulo Administración" → `/admin/login`
  - Botón "Área Académica" → `/academico/login`

### Login Administrativo
- **Ruta:** `/admin/login`
- **Credenciales:** `admin` / `admin`
- **Redirección:** `/admin/dashboard`

### Login Área Académica (Dual)
- **Ruta:** `/academico/login`
- **Tipos de usuario:**
  
  **Administrador Académico:**
  - Usuario: `academico` / `academico`
  - Redirección: `/academico/dashboard`
  
  **Docente:**
  - Usuario: `juan.perez@uct.cl` (o RUT) / `docente123`
  - Redirección: `/docente/dashboard`

### Detección Automática de Rol
El sistema detecta automáticamente si el usuario es administrador o docente y lo redirige al módulo correspondiente.

---

## 📊 MÓDULO 1: ADMINISTRACIÓN

### 1.1 Dashboard (`/admin/dashboard`)

#### Estadísticas Generales
- **Total Docentes:** Cantidad total registrada
- **Pagos Completados:** Docentes con estado "Pagado"
- **Pagos Pendientes:** Docentes con estado "Pendiente"
- **Monto Total Propuestas:** Suma de todas las propuestas semestrales

#### Gráficos Visuales
1. **Distribución por Carrera** (Gráfico de barras)
2. **Estado de Pagos** (Gráfico circular)
3. **Distribución por Jornada** (Gráfico de dona)

---

### 1.2 Base de Datos Docentes (`/admin/docentes`)

#### Tabla Principal - Columnas:

| Columna | Tipo | Descripción |
|---------|------|-------------|
| **N°** | ID | Número consecutivo |
| **Carrera** | Texto | Nombre de la carrera asignada |
| **Jornada** | Badge | Diurna (azul) / Vespertina (gris) |
| **RUT** | Texto | Identificación del docente |
| **Nombre Completo** | Texto | Nombre del docente |
| **Nivel** | Badge | A (Superior) / B (Intermedio) / C (Básico) |
| **Correo** | Email | Correo electrónico |
| **Monto Total** | Moneda | Propuesta semestral en CLP |
| **Cuotas** | Número | 4 (Diurna) / 5 (Vespertina) |
| **Estado** | Badge | Pagado / En proceso / Pendiente |
| **Valor Cuota** | Moneda | Monto de cuota bruta |
| **Saldo** | Moneda | Saldo pendiente |
| **Boleta** | Botón | Hipervínculo a archivo |
| **Acciones** | Botón | Ver detalles |

#### Funcionalidades de la Tabla:

**1. Búsqueda y Filtros**
- Búsqueda por: Nombre, RUT o Carrera
- Búsqueda en tiempo real

**2. Botón "Nuevo Docente"**
Abre modal con formulario de designación:

**Formulario de Nuevo Docente:**
```
Campos Requeridos:
├─ RUT (Input)
├─ Nombre Completo (Input)
├─ Carrera (Select)
│  ├─ T.U. Informática
│  ├─ T.U. G. y Admin. Emp.
│  ├─ T.U. Elect. y Efi. Ener.
│  ├─ T.U. Edu. Parv. y NB1
│  ├─ T.U. Prod. Agro. Sost.
│  └─ T.U. Edu. Dífer.
├─ Jornada (Select)
│  ├─ Diurna (4 cuotas)
│  └─ Vespertina (5 cuotas)
├─ Correo de Contacto (Email)
├─ Nivel Docente (Select)
│  ├─ A (Nivel Superior)
│  ├─ B (Nivel Intermedio)
│  └─ C (Nivel Básico)
├─ Monto Total Propuesta (Number)
└─ Semestre/Año (Select + Input)
   ├─ Semestre: 1 o 2
   └─ Año: 2026
```

**3. Correo Masivo** (Modal mejorado)

**Sistema de Filtrado por Estado:**
```
┌─────────────────────────────────────────────┐
│ Seleccionar Estados:                        │
├─────────────────────────────────────────────┤
│                                             │
│  [ ✓ Pagado ]     [ ✓ En Proceso ]  [ ✗ Pendiente ]
│   3 docentes        2 docentes       2 docentes    │
│                                             │
│  📧 5 docente(s) recibirán este correo     │
│                                             │
│  Asunto: _____________________________     │
│                                             │
│  Mensaje:                                   │
│  ┌──────────────────────────────────────┐  │
│  │ Estimado(a) docente...               │  │
│  │                                      │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  [  Enviar a 5 docente(s)  ]               │
└─────────────────────────────────────────────┘
```

**Características del Correo Masivo:**
- ✅ Selección múltiple de estados (Pagado, En proceso, Pendiente)
- ✅ Contador dinámico de destinatarios
- ✅ Validación: mínimo 1 estado seleccionado
- ✅ Vista previa de cantidad por estado
- ✅ Campo de asunto personalizado
- ✅ Área de texto para mensaje

**4. Exportar**
- Exportación de datos (preparado para implementar)

**5. Borrar Todo**
- Protegido por contraseña: `TEC2026`
- Elimina toda la base de datos
- Confirmación requerida

#### Estadísticas Superiores

```
┌──────────────────┬──────────────────┬──────────────────┐
│ Total Docentes   │ Total Propuestas │ Total Cuota Mens.│
│       8          │  $17,350,000     │  $4,225,000      │
│ 5 D / 3 V        │ Suma semestral   │ Suma de cuotas   │
└──────────────────┴──────────────────┴──────────────────┘
```

---

### 1.3 Reportes (`/admin/reportes`)

#### Configuración de Reportes

**Filtros Disponibles:**
- **Estado:** Todos / Pagado / En proceso / Pendiente
- **Jornada:** Todas / Diurna / Vespertina

**Columnas del Reporte PDF:**
1. Carrera
2. Jornada
3. RUT
4. Nombre
5. Estado

**Características:**
- Formato PDF descargable
- Nombre de archivo: `reporte-docentes-YYYY-MM-DD.pdf`
- Encabezado con fecha y total de docentes
- Tabla con estilos profesionales
- Vista previa de cantidad de registros

**Estadísticas del Módulo:**
```
┌──────────────────┬──────────────────┬──────────────────┐
│ Total a Reportar │ Filtros Aplicados│ Última Generación│
│       8          │         0        │   26 Abr 2026    │
└──────────────────┴──────────────────┴──────────────────┘
```

---

## 🎓 MÓDULO 2: ÁREA ACADÉMICA

### 2.1 Dashboard (`/academico/dashboard`)

**Vista General:**
- Resumen de métricas académicas
- Accesos rápidos a módulos
- Alertas y notificaciones
- Estadísticas visuales

---

### 2.2 Plataforma Docentes (`/academico/plataforma-docentes`)

**Función:** Vista administrativa para gestionar docentes

#### Estadísticas Superiores

```
┌──────────────────┬──────────────────┬──────────────────┬──────────────────┐
│ Total Docentes   │ Documentación    │ CVs Actualizados │ Capacitaciones   │
│       4          │    Completa      │                  │   Promedio       │
│ Registrados      │     2/4          │       3/4        │       5          │
└──────────────────┴──────────────────┴──────────────────┴──────────────────┘
```

#### Tabla de Docentes

**Columnas:**
| Columna | Descripción |
|---------|-------------|
| Docente | Nombre completo |
| RUT | Identificación |
| Correo | Email institucional |
| CV | Badge: Al día / Pendiente |
| Certificados | Badge: Completos / Incompletos |
| Capacitaciones | Número total |
| Acciones | Botón "Ver Perfil" |

#### Funcionalidades:

**1. Búsqueda**
- Por nombre o RUT
- Búsqueda en tiempo real

**2. Ver Perfil (Modal)**

Al hacer clic en "Ver Perfil" se abre un modal con **4 pestañas:**

**Pestaña 1: Perfil y CV**
```
┌────────────────────────────────────────┐
│ Currículum Vitae                       │
│ Estado: [Actualizado]                  │
├────────────────────────────────────────┤
│                                        │
│ Datos Personales                       │
│ ├─ Nombre, RUT, Email                 │
│                                        │
│ Formación Académica                    │
│ ├─ Títulos y grados                   │
│                                        │
│ Experiencia Profesional                │
│ ├─ Historial laboral                  │
└────────────────────────────────────────┘
```

**Pestaña 2: Certificados**
```
Vista de 4 certificados:
├─ Certificado de Título
├─ Certificado de Antecedentes
├─ Certificado de Inhabilidad
└─ Carnet de Identidad

Cada uno muestra:
├─ Icono
├─ Nombre del archivo
├─ Badge: Disponible / No disponible
└─ Estado de validación
```

**Pestaña 3: Capacitaciones**
```
Listado con código de color:

🟢 Verde = UCT (institucionales)
│  ├─ Metodologías Activas de Aprendizaje
│  │  UCT - 40 horas | Marzo 2026
│  │  [Completado]
│  │
│  └─ Evaluación por Competencias
│     UCT - 30 horas | Enero 2026
│     [Completado]

🔵 Azul = Externas (otras instituciones)
│  └─ Tecnologías Educativas Digitales
│     MINEDUC - 60 horas | Nov 2025
│     [Completado]
```

**Pestaña 4: Boletas** (NUEVA)
```
┌────────────────────────────────────────┐
│ Boletas de Honorarios (2)              │
├────────────────────────────────────────┤
│ 📄 Boleta Marzo 2026                   │
│    boleta_marzo_2026.pdf               │
│    Subido el 15 Marzo 2026             │
│    [Disponible]                        │
│                                        │
│ 📄 Boleta Febrero 2026                 │
│    boleta_febrero_2026.pdf             │
│    Subido el 15 Febrero 2026           │
│    [Disponible]                        │
└────────────────────────────────────────┘
```

---

### 2.3 Gestión Académica (`/academico/gestion-academica`)

**Función:** Monitoreo de cumplimiento académico y validación de documentos

#### Estadísticas Superiores

```
┌──────────────────┬──────────────────┬──────────────────┬──────────────────┐
│ Total Docentes   │ Contenido Subido │ Notas al Día     │ Documentación    │
│       4          │      3/4         │      2/4         │      2/4         │
│ Docentes activos │   75% subido     │   50% al día     │   50% completa   │
└──────────────────┴──────────────────┴──────────────────┴──────────────────┘
```

#### Tabla de Reporte por Docente

**Columnas con Sistema de Validación:**

| Columna | Tipo | Estados |
|---------|------|---------|
| Docente | Texto | - |
| RUT | Texto | - |
| Contenido Subido | Icono | ✓ / ✗ |
| Notas al Día | Icono | ✓ / ✗ |
| **Guía Aprendizaje** | Badge | 🟢 Validado / 🟡 Pendiente / 🔴 Sin Guía |
| **CV Actualizado** | Badge | 🟢 Validado / 🟡 Por Revisar / 🔴 Inexistente |
| **Cert. Título** | Badge | 🟢 Validado / 🟡 Por Revisar / 🔴 Inexistente |
| **Cert. Antecedentes** | Badge | 🟢 Validado / 🟡 Por Revisar / 🔴 Inexistente |
| **Cert. Inhabilidad** | Badge | 🟢 Validado / 🟡 Por Revisar / 🔴 Inexistente |
| Capacitaciones | Número | Cantidad |
| Estado General | Badge | Completo / Pendiente |
| **Acciones** | Botón | **"Validar"** |

#### Sistema de Validación de 3 Estados

**Estados:**
- 🔴 **Inexistente:** Documento no subido
- 🟡 **Por Revisar:** Documento subido, pendiente de validación
- 🟢 **Validado:** Documento revisado y aprobado

**Botón "Validar"** → Redirige a `/academico/validar-docente/:id`

---

### 2.4 Validar Docente (`/academico/validar-docente/:docenteId`)

**Página dedicada para validación manual de archivos**

#### Estructura de la Página:

**1. Header**
```
← Volver | Validación de Archivos
         Juan Carlos Pérez González - 12.345.678-9
                                    [Guardar Cambios]
```

**2. Resumen Estadístico**
```
┌──────────────────┬──────────────────┬──────────────────┐
│ Total Documentos │ Validados        │ Por Revisar      │
│        5         │        4         │        1         │
└──────────────────┴──────────────────┴──────────────────┘
```

**3. Documentos a Validar**

Cada documento tiene:
```
┌────────────────────────────────────────────────────┐
│ 📄 [Icono]                                         │
│                                                    │
│    Certificado de Título                          │
│    certificado_titulo.pdf                         │
│                                                    │
│    Estado de Validación:                          │
│    [Select: Inexistente / Por Revisar / Validado] │
│                                                    │
│    Estado actual: [Badge: Validado]               │
│                                                    │
│    [Ver Documento]                                │
└────────────────────────────────────────────────────┘
```

**Documentos Gestionados:**
1. ✅ CV Actualizado
2. ✅ Certificado de Título
3. ✅ Certificado de Antecedentes
4. ✅ Certificado de Inhabilidad
5. ✅ Carnet de Identidad

**4. Botones de Acción**
- **Cancelar** → Vuelve sin guardar
- **Guardar Cambios** → Actualiza estados y vuelve a Gestión Académica

---

### 2.5 Acreditación (`/academico/acreditacion`)

**Función:** Panel de evidencias para acreditación institucional

**Funcionalidades:**
- Gestión de evidencias por hitos
- Subida de documentos
- Categorización de evidencias
- Seguimiento de cumplimiento

---

### 2.6 Reportes Académicos (`/academico/reportes`)

#### Tipos de Reportes PDF:

**1. Reporte General Académico**
```
Columnas:
├─ Docente
├─ RUT
├─ Contenido Subido
├─ Notas al Día
├─ Estado Guía Aprendizaje
├─ CV Actualizado
└─ N° Capacitaciones
```

**2. Reporte de Documentación**
```
Columnas:
├─ Docente
├─ RUT
├─ Estado CV
├─ Estado Cert. Título
├─ Estado Cert. Antecedentes
├─ Estado Cert. Inhabilidad
└─ Estado Carnet Identidad

Nota: Muestra el estado de validación (Validado/Por Revisar/Inexistente)
```

**3. Reporte de Capacitaciones**
```
Columnas:
├─ Docente
├─ RUT
├─ N° Capacitaciones
└─ Estado (Sobre promedio / Bajo promedio)

Incluye:
├─ Total capacitaciones institucional
└─ Promedio por docente
```

**Estadísticas:**
```
┌──────────────────┬──────────────────┬──────────────────┐
│ Total Docentes   │ Documentación    │ Total            │
│                  │ Completa         │ Capacitaciones   │
│       4          │        2         │       19         │
└──────────────────┴──────────────────┴──────────────────┘
```

---

## 👤 MÓDULO 3: PORTAL DOCENTE

**Usuario:** Docentes individuales  
**Acceso:** Desde el mismo login de Área Académica con credenciales docentes

---

### 3.1 Mi Perfil (Dashboard) (`/docente/dashboard`)

#### Información Personal
```
┌────────────────────────────────────────┐
│ 👤 Nombre Completo                     │
│    Juan Carlos Pérez González          │
│                                        │
│ 📄 RUT                                 │
│    12.345.678-9                        │
│                                        │
│ 📧 Correo Electrónico                  │
│    juan.perez@uct.cl                   │
│                                        │
│ 📞 Teléfono                            │
│    +56 9 1234 5678                     │
└────────────────────────────────────────┘
```

#### Progreso de Documentación
```
Estado de Documentación
2 de 5 documentos completos

Progreso General: 40%
[████████████████░░░░░░░░░░░░░░░░] 40%

✅ CV Actualizado          [Completo]
✅ Certificado de Título   [Completo]
❌ Certificado Antec.      [Pendiente]
❌ Certificado Inhabil.    [Pendiente]
❌ Carnet de Identidad     [Pendiente]
```

#### Resumen de Capacitaciones
```
┌────────────────────────────────────────┐
│  🏆                                    │
│   5                                    │
│   Capacitaciones registradas           │
└────────────────────────────────────────┘
```

#### Alertas
```
⚠️ Documentación Pendiente
Complete todos los documentos requeridos

Pendientes:
• Certificado de Antecedentes
• Certificado de Inhabilidad
• Carnet de Identidad
```

---

### 3.2 CV y Formación (`/docente/cv`)

**Formulario de CV:**

```
┌────────────────────────────────────────┐
│ Currículum Vitae        [✓ Actualizado]│
├────────────────────────────────────────┤
│                                        │
│ Datos Personales                       │
│ ┌────────────────────────────────────┐ │
│ │ Juan Carlos Pérez González         │ │
│ │ RUT: 12.345.678-9                  │ │
│ │ Email: juan.perez@uct.cl           │ │
│ └────────────────────────────────────┘ │
│                                        │
│ Formación Académica                    │
│ ┌────────────────────────────────────┐ │
│ │ Ing. Civil en Informática - UCT... │ │
│ │ Magíster en Educación - UFRO...   │ │
│ └────────────────────────────────────┘ │
│                                        │
│ Experiencia Profesional                │
│ ┌────────────────────────────────────┐ │
│ │ Docente UCT (2016 - Presente)     │ │
│ │ - Asignaturas: Programación...    │ │
│ └────────────────────────────────────┘ │
│                                        │
│ Publicaciones e Investigación          │
│ ┌────────────────────────────────────┐ │
│ │                                    │ │
│ └────────────────────────────────────┘ │
│                                        │
│ [💾 Guardar Cambios] [📤 Cargar PDF]  │
└────────────────────────────────────────┘
```

**Funcionalidades:**
- ✅ Edición de texto en tiempo real
- ✅ Guardar cambios
- ✅ Cargar CV en formato PDF
- ✅ Badge de estado actualizado

---

### 3.3 Certificados (`/docente/certificados`)

#### Resumen
```
┌────────────────────────────────────────┐
│ Estado de Documentación                │
│                                        │
│        80%                             │
│   4 de 5 certificados cargados         │
└────────────────────────────────────────┘
```

#### Gestión de Certificados (4 Cards)

**Estructura de cada certificado:**
```
┌────────────────────────────────────────┐
│ Certificado de Título            [✓]  │
│ Certificado de título profesional     │
├────────────────────────────────────────┤
│ ✅ certificado_titulo.pdf              │
│    Subido el 15 Marzo 2026             │
│    [Disponible]                        │
│                                        │
│ Reemplazar Certificado:                │
│ [Seleccionar archivo PDF...]           │
│                                        │
│ [🗑️ Eliminar]                         │
└────────────────────────────────────────┘
```

**Lista de Certificados:**
1. ✅ Certificado de Título
2. ✅ Certificado de Antecedentes
3. ✅ Certificado de Inhabilidad
4. ✅ Carnet de Identidad

**Funcionalidades por certificado:**
- ✅ Ver estado (Cargado / No cargado)
- ✅ Ver nombre de archivo y fecha
- ✅ Subir archivo PDF
- ✅ Reemplazar archivo existente
- ✅ Eliminar archivo

---

### 3.4 Capacitaciones (`/docente/capacitaciones`)

#### Estadísticas
```
┌──────────────────┬──────────────────┐
│ Total            │ Total Horas      │
│ Capacitaciones   │                  │
│       3          │      130         │
│ Registradas      │ Acumuladas       │
└──────────────────┴──────────────────┘
```

#### Listado con Código de Color

**Capacitaciones UCT (Verde):**
```
🟢 ┌────────────────────────────────────────┐
   │ 🏆 Metodologías Activas de Aprendizaje│
   │    UCT - 40 horas | Marzo 2026        │
   │    [cert_metodologias.pdf]            │
   │    [Completado]                   [🗑️]│
   └────────────────────────────────────────┘

🟢 ┌────────────────────────────────────────┐
   │ 🏆 Evaluación por Competencias        │
   │    UCT - 30 horas | Enero 2026        │
   │    [cert_evaluacion.pdf]              │
   │    [Completado]                   [🗑️]│
   └────────────────────────────────────────┘
```

**Capacitaciones Externas (Azul):**
```
🔵 ┌────────────────────────────────────────┐
   │ 🏆 Tecnologías Educativas Digitales   │
   │    MINEDUC - 60 horas | Nov 2025      │
   │    [cert_tecnologias.pdf]             │
   │    [Completado]                   [🗑️]│
   └────────────────────────────────────────┘
```

#### Formulario: Registrar Nueva Capacitación
```
┌────────────────────────────────────────┐
│ Registrar Nueva Capacitación           │
├────────────────────────────────────────┤
│ Nombre *: _________________________    │
│           Ej: Innovación en el Aula    │
│                                        │
│ Institución *: ___________  Horas *:__ │
│                UCT           40        │
│                                        │
│ Fecha: ____________________________    │
│        Ej: Marzo 2026                  │
│                                        │
│ Certificado (PDF): [Seleccionar...]    │
│                                        │
│ [Registrar Capacitación] [Cancelar]    │
└────────────────────────────────────────┘
```

**Funcionalidades:**
- ✅ Agregar nueva capacitación
- ✅ Cargar certificado PDF
- ✅ Eliminar capacitación
- ✅ Diferenciación visual por institución
- ✅ Contador de horas totales

---

### 3.5 Boletas (`/docente/boletas`) **NUEVO**

#### Subir Nueva Boleta
```
┌────────────────────────────────────────┐
│ Subir Nueva Boleta                     │
├────────────────────────────────────────┤
│ Nombre de la Boleta:                   │
│ _________________________________      │
│ Ej: Boleta Abril 2026                  │
│                                        │
│ Archivo PDF:                           │
│ [Seleccionar archivo...]               │
│ Solo archivos PDF. Máximo 5MB.         │
└────────────────────────────────────────┘
```

#### Resumen
```
┌────────────────────────────────────────┐
│ Total Boletas                          │
│        2                               │
│ Boletas registradas                    │
└────────────────────────────────────────┘
```

#### Listado de Boletas
```
┌────────────────────────────────────────┐
│ Boletas Registradas                    │
├────────────────────────────────────────┤
│                                        │
│ 📄 Boleta Marzo 2026                   │
│    boleta_marzo_2026.pdf               │
│    Subido el 15 Marzo 2026             │
│    [👁️ Ver] [⬇️ Descargar] [🗑️ Eliminar]│
│                                        │
│ 📄 Boleta Febrero 2026                 │
│    boleta_febrero_2026.pdf             │
│    Subido el 15 Febrero 2026           │
│    [👁️ Ver] [⬇️ Descargar] [🗑️ Eliminar]│
└────────────────────────────────────────┘
```

#### Información Importante
```
ℹ️  Información Importante

• Las boletas deben estar en formato PDF
• Asegúrese de que el nombre sea descriptivo
• Las boletas quedan disponibles para el área administrativa
• Mantenga sus boletas actualizadas para la gestión de pagos
```

**Funcionalidades:**
- ✅ Subir boletas en PDF con nombre personalizado
- ✅ Ver listado completo
- ✅ Ver detalle de cada boleta
- ✅ Descargar boletas
- ✅ Eliminar boletas
- ✅ Visibles desde el módulo de Área Académica

---

## 💾 Estructura de Datos

### Docente (Módulo Administración)
```typescript
interface Docente {
  id: number;
  carrera: string;
  jornada: 'Diurna' | 'Vespertina';
  rut: string;
  nombreCompleto: string;
  nivelDocente: 'A' | 'B' | 'C';  // ⭐ Actualizado
  semestre: number;
  año: number;
  correo: string;
  montoTotalPropuesta: number;
  numeroCuotas: number;  // 4 Diurna / 5 Vespertina
  estado: 'Pendiente' | 'Pagado' | 'En proceso';
  valorCuotaBruto: number;
  boletaUrl?: string;
  recepcionBHE: boolean;
  saldo: number;
}
```

### DocenteAcademico (Módulo Área Académica)
```typescript
type EstadoValidacion = 'Inexistente' | 'Por Revisar' | 'Validado';

interface Boleta {
  id: number;
  nombre: string;
  archivo: string;
  fecha: string;
}

interface DocenteAcademico {
  id: number;
  nombreCompleto: string;
  rut: string;
  correo: string;
  
  // Sistema de 3 estados ⭐
  cvActualizado: EstadoValidacion;
  certificadoTitulo: EstadoValidacion;
  certificadoAntecedentes: EstadoValidacion;
  certificadoInhabilidad: EstadoValidacion;
  carnetIdentidad: EstadoValidacion;
  
  capacitaciones: number;
  contenidoSubido: boolean;
  notasAlDia: boolean;
  guiaAprendizaje: 'Validado' | 'Pendiente' | 'Sin Guía';
  
  boletas: Boleta[];  // ⭐ Nuevo
  password?: string;
}
```

### Capacitacion
```typescript
interface Capacitacion {
  id: number;
  nombre: string;
  institucion: string;  // 'UCT' = verde, otros = azul
  horas: number;
  fecha: string;
  certificado: string;
}
```

---

## 🗺️ Rutas del Sistema

### Públicas
```
/                          → Landing Page
```

### Módulo Administración
```
/admin/login               → Login administrador
/admin/dashboard           → Dashboard con gráficos
/admin/docentes            → Base de datos docentes
/admin/reportes            → Generación de reportes PDF
```

### Módulo Área Académica
```
/academico/login                    → Login dual (admin/docente)
/academico/dashboard                → Dashboard académico
/academico/plataforma-docentes      → Gestión de docentes
/academico/gestion-academica        → Tabla de seguimiento
/academico/validar-docente/:id      → ⭐ Validación manual de archivos
/academico/acreditacion             → Panel de acreditación
/academico/reportes                 → Reportes académicos PDF
```

### Portal Docente
```
/docente/dashboard          → Mi perfil
/docente/cv                 → CV y formación
/docente/certificados       → Gestión de certificados
/docente/capacitaciones     → Gestión de capacitaciones
/docente/boletas            → ⭐ Gestión de boletas
```

---

## 🔑 Credenciales de Prueba

### Administración
```
Usuario:    admin
Contraseña: admin
Acceso a:   Módulo de Administración completo
```

### Área Académica (Administrador)
```
Usuario:    academico
Contraseña: academico
Acceso a:   Módulo Área Académica completo
            - Gestión de docentes
            - Validación de archivos
            - Reportes
            - Acreditación
```

### Docente
```
Usuario:    juan.perez@uct.cl  (o RUT: 12.345.678-9)
Contraseña: docente123
Acceso a:   Portal Docente
            - Mi perfil
            - CV
            - Certificados
            - Capacitaciones
            - Boletas
```

**Otros docentes de prueba:**
- maria.rodriguez@uct.cl / docente123
- pedro.morales@uct.cl / docente123
- ana.fernandez@uct.cl / docente123

---

## 🎨 Sistema de Colores

### Módulo Administración
```
Color principal: Azul (#2563eb)
- Headers: bg-blue-600
- Badges de jornada diurna: azul
- Botones principales: azul
```

### Módulo Área Académica
```
Color principal: Verde (#16a34a)
- Headers: bg-green-600
- Capacitaciones UCT: bg-green-50, border-green-200
- Badges validados: bg-green-600
```

### Portal Docente
```
Color principal: Verde (coherente con área académica)
- Misma paleta que Área Académica
```

### Estados de Validación
```
🟢 Validado:      bg-green-600
🟡 Por Revisar:   border-yellow-600, text-yellow-700
🔴 Inexistente:   bg-red-600
```

---

## 📈 Características Técnicas Destacadas

### 1. **Validación de Documentos de 3 Estados**
- Sistema completo de gestión de estados
- Página dedicada para validación manual
- Actualización en tiempo real en tabla principal
- Badges visuales distintos por estado

### 2. **Correo Masivo Selectivo**
- Filtrado por estado de pago
- Selección múltiple
- Contador dinámico de destinatarios
- Validación de campos requeridos

### 3. **Generación de PDFs**
- Múltiples tipos de reportes
- Filtros personalizables
- Formato profesional con autoTable
- Nombres de archivo con fecha

### 4. **Diferenciación Visual de Capacitaciones**
- Código de color por institución
- Verde = UCT
- Azul = Externas
- Aplicado en ambas vistas (admin y docente)

### 5. **Sistema de Boletas**
- Gestión completa por docente
- Visible desde área administrativa
- Upload, visualización y eliminación
- Integrado en perfil docente

### 6. **Navegación Multi-Rol**
- Login único para área académica
- Detección automática de rol
- Redirección inteligente
- SessionStorage para persistencia

### 7. **Búsqueda y Filtros**
- Búsqueda en tiempo real
- Filtros combinables
- Contadores dinámicos
- UX optimizada

---

## 🚀 Estado Actual del Proyecto

### ✅ Completado
- [x] Estructura completa de 3 módulos
- [x] Sistema de autenticación multi-rol
- [x] CRUD completo de docentes (admin)
- [x] Sistema de validación de 3 estados
- [x] Gestión de boletas
- [x] Generación de reportes PDF (ambos módulos)
- [x] Correo masivo con filtros
- [x] Portal docente completo
- [x] Diferenciación de capacitaciones
- [x] Diseño responsivo
- [x] Datos de ejemplo (mock data)

### ⏳ Pendiente de Integración
- [ ] Conexión con base de datos SQL
- [ ] Validación backend de autenticación
- [ ] API REST para operaciones CRUD
- [ ] Sistema de notificaciones por email
- [ ] Upload real de archivos
- [ ] Visualizador de PDFs inline

---

## 📝 Notas de Implementación

### Tecnologías de Base de Datos
- **SQL** será utilizado para la persistencia
- Actualmente funcionando con mock data
- Estructura de datos lista para migración

### Archivos Importantes
```
src/
├── app/
│   ├── components/
│   │   ├── AdminLayout.tsx
│   │   ├── AcademicLayout.tsx
│   │   └── DocenteLayout.tsx
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── DocentesTable.tsx
│   │   │   └── Reportes.tsx
│   │   ├── academic/
│   │   │   ├── AcademicDashboard.tsx
│   │   │   ├── PlataformaDocentes.tsx
│   │   │   ├── GestionAcademica.tsx
│   │   │   ├── ValidarDocente.tsx      ⭐ Nuevo
│   │   │   ├── Acreditacion.tsx
│   │   │   └── ReportesAcademicos.tsx
│   │   └── docente/
│   │       ├── DocenteDashboard.tsx
│   │       ├── DocenteCV.tsx
│   │       ├── DocenteCertificados.tsx
│   │       ├── DocenteCapacitaciones.tsx
│   │       └── DocenteBoletas.tsx      ⭐ Nuevo
│   ├── data/
│   │   └── mockData.ts
│   └── routes.tsx
```

### Próximos Pasos Recomendados

1. **Integración con Base de Datos:**
   - Crear esquema SQL
   - Implementar API REST
   - Conectar frontend con backend

2. **Sistema de Archivos:**
   - Implementar upload real de PDFs
   - Almacenamiento seguro de documentos
   - Visualizador de PDFs

3. **Autenticación:**
   - JWT tokens
   - Sesiones seguras
   - Recuperación de contraseña

4. **Notificaciones:**
   - Sistema de email real
   - Plantillas de correo
   - Log de envíos

---

## 📞 Contacto y Soporte

Este documento resume completamente la **Plataforma TEC - UCT** en su estado actual.

**Última actualización:** 26 de Abril 2026  
**Versión:** 1.0  
**Desarrollado con:** React + TypeScript + Tailwind CSS

---

*Documento generado para la Universidad Católica de Temuco - Área TEC*
