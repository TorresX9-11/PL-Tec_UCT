# Plataforma TEC — Universidad Católica de Temuco (P_LAB_TEC)

Plataforma web interna del área **TEC** de la **Universidad Católica de Temuco** para la administración de docentes a honorarios y la gestión del módulo académico. 

> **IMPORTANTE:** Este documento sirve como la única fuente de verdad y bitácora viva del proyecto. **Cualquier cambio futuro que sea probado y confirmado debe ser registrado obligatoriamente en la sección de Registro de Cambios.**

---

## 🚀 Inicialización del Proyecto

El proyecto está configurado como un **Monorepo** utilizando `pnpm` (a través de Corepack), que contiene tanto el frontend (React) en la raíz, como el backend (Node.js/Express) en el directorio `server/`.

### Requisitos Previos
- Node.js 20+
- Corepack habilitado (`corepack enable`)
- Base de datos MySQL / MariaDB ejecutándose (puerto 3306)

### Pasos de Instalación y Ejecución

1. **Clonar e instalar dependencias:**
   Abre una terminal en la raíz del proyecto y ejecuta:
   ```powershell
   corepack pnpm install
   ```
   *(Esto instalará automáticamente las dependencias del frontend y del backend gracias a la configuración del workspace en `pnpm-workspace.yaml`).*

2. **Configurar Base de Datos:**
   - Importa el esquema inicial de la base de datos ubicado en `database/schema.sql` a tu servidor MySQL local.
   - Crea un archivo `.env` en la carpeta `server/` con tus credenciales de base de datos basándote en el `server/.env.example` (o ajusta el usuario `root` y clave por defecto).

3. **Levantar el Servidor Backend:**
   En una terminal nueva, asegúrate de estar dentro de la carpeta `server/` y ejecuta:
   ```powershell
   cd server
   corepack pnpm dev
   ```
   *(El backend se ejecutará y escuchará peticiones en http://localhost:3001, confirmando la conexión a la base de datos).*

4. **Levantar el Frontend:**
   En otra terminal separada, desde la raíz del proyecto, ejecuta:
   ```powershell
   corepack pnpm run dev
   ```
   *(El frontend estará disponible para abrir en el navegador en http://localhost:5173).*

---

## 🏗️ Arquitectura y Stack Tecnológico

- **Frontend:** React 18, TypeScript, Vite 6, TailwindCSS v4, shadcn/ui.
- **Backend:** Node.js, Express, TypeScript, Zod (validaciones API), pdfkit & archiver (generación de documentos históricos).
- **Base de Datos:** MySQL / MariaDB (Driver `mysql2`).
- **Gestor de paquetes:** `pnpm` (en modo workspace).

---

## 📝 Registro de Cambios Implementados

A continuación, se detalla el progreso y las implementaciones confirmadas en el sistema. 

> **Regla de Desarrollo:** Cada cambio que se implemente a partir de ahora, tras ser validado y confirmado en pruebas, debe anexarse a esta lista para mantener el histórico consolidado.

### 1. Conexión al Backend y Estructura Monorepo
- Se transformó el proyecto en un monorepo administrado de forma limpia por `pnpm`, con el frontend en la raíz y el backend en el subdirectorio `/server`.
- El backend fue inicializado de cero con Express y TypeScript (ESM), resolviendo configuraciones y conflictos de dependencias (ESM vs CJS).
- Se configuró el cliente HTTP en el frontend (`apiClient.ts`) para consumir los recursos estáticos y los endpoints del puerto `3001`.

### 2. Base de Datos y Modelado de Datos
- **Esquema Inicial:** Se integró formalmente el esquema de tablas proporcionado por el cliente en `database/schema.sql`.
- **Nuevas Tablas de Historial:** Se agregaron las tablas `historial_activo` (para registrar acciones "vivas" del semestre en curso) y `archivos_historicos` (para almacenar el registro consolidado al final del semestre). Se implementó integridad referencial mediante `ON DELETE SET NULL` hacia la tabla de `docentes`.

### 3. Backend: Integración del Módulo Historial ("Archivado Duro")
- Se crearon los endpoints bajo `/api/v1/historial/` para consultar el historial en vivo y los archivos históricos.
- Se inyectó código automatizado (`registrarEvento()`) en los controladores de subida de archivos y gestión de pagos para poblar la tabla `historial_activo` de manera transparente.
- **Cierre de Semestre:** Se programó un servicio `cerrarSemestre()` que genera un documento PDF maestro con todo el registro usando `pdfkit`, compila un archivo `.zip` usando `archiver` con todos los respaldos documentales y boletas subidas por los docentes, registra las URLs en `archivos_historicos`, y ejecuta un `TRUNCATE` sobre `historial_activo` para purgar la base de datos viva y ahorrar costos operativos.

### 4. Frontend: Actualización Visual del Historial
- El panel de **Historial** de la vista del Administrador (`Historial.tsx`) fue refactorizado, pasando de usar Mocks a consumir la API real.
- Se dividió la pantalla en dos pestañas claras: **Historial Activo** (registro de acciones en vivo) y **Archivos Históricos** (listado de semestres anteriores consolidados).
- Se agregó el botón crítico **"Cerrar Semestre"**, el cual emite una advertencia de sistema antes de contactar al backend y detonar el purgado y archivado masivo. 