-- ============================================================================
-- Plataforma TEC — Esquema de base de datos
-- ----------------------------------------------------------------------------
-- Sistema de gestión docente, académica y administrativa.
-- Motor: MariaDB / MySQL.
--
-- Origen: entregado por el cliente (archivo "a_manito.sql").
-- Última actualización: 2026-05-25
-- ============================================================================

CREATE DATABASE IF NOT EXISTS plataforma;

USE plataforma;

-- ----------------------------------------------------------------------------
-- usuarios: cuentas de acceso al sistema
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  correo_usuario VARCHAR(32) NOT NULL,
  nombre         VARCHAR(128),
  contrasena     VARCHAR(255) NOT NULL,
  nivel          ENUM('docente', 'coordinador', 'academico', 'supervisor', 'admin'),
  PRIMARY KEY (correo_usuario)
);

-- ----------------------------------------------------------------------------
-- carreras: catálogo de carreras impartidas
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS carreras (
  id_carrera CHAR(4)  NOT NULL,
  jornada    ENUM('diurno', 'vespertino') NOT NULL DEFAULT 'diurno',
  nombre     VARCHAR(64) NOT NULL,
  PRIMARY KEY (id_carrera, jornada)
);

-- ----------------------------------------------------------------------------
-- cursos: asignaturas asociadas a una carrera
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cursos (
  id_carrera        CHAR(4)  NOT NULL,
  id_curso          CHAR(4)  NOT NULL,
  jornada           ENUM('diurno', 'vespertino') NOT NULL DEFAULT 'diurno',
  nombre            VARCHAR(64) NOT NULL,
  rut_docente       INT,
  semestre          ENUM('1', '2', '3', '4', '5', '6') DEFAULT '1',
  notas_ingresadas  TINYINT,
  notas_curso       TINYINT NOT NULL,
  PRIMARY KEY (id_carrera, id_curso, jornada),
  FOREIGN KEY (id_carrera, jornada) REFERENCES carreras(id_carrera, jornada)
);

-- ----------------------------------------------------------------------------
-- grupos: secciones de un curso (1, 2 o 3) con carga horaria PMA
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS grupos (
  id_grupo             INT AUTO_INCREMENT NOT NULL,
  id_carrera           VARCHAR(4)  NOT NULL,
  id_curso             VARCHAR(5)  NOT NULL,
  jornada           ENUM('diurno', 'vespertino'),
  seccion              ENUM('1', '2', '3') NOT NULL DEFAULT '1',
  subgrupo             ENUM('A', 'B') DEFAULT NULL,
  rut_docente          INT DEFAULT NULL,
  horas_presencial     TINYINT,
  horas_mixto          TINYINT,
  horas_administrativo TINYINT,
  PRIMARY KEY (id_grupo),
  FOREIGN KEY (id_carrera, id_curso) REFERENCES cursos(id_carrera, id_curso),
  FOREIGN KEY (rut_docente) REFERENCES docentes(rut_docente)
);

-- ----------------------------------------------------------------------------
-- docentes: registro maestro de docentes
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS docentes (
  rut_docente    INT         NOT NULL,
  dv             CHAR(1)     NOT NULL,
  correo_usuario VARCHAR(32),
  contacto       VARCHAR(12),
  nombre         VARCHAR(64) NOT NULL,
  nivel_docente  ENUM('A', 'B', 'C'),
  PRIMARY KEY (rut_docente),
  FOREIGN KEY (correo_usuario) REFERENCES usuarios(correo_usuario)
);

-- ----------------------------------------------------------------------------
-- propuestas: propuesta económica semestral por docente
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS propuestas (
  id_propuesta    INT AUTO_INCREMENT NOT NULL ,
  rut_docente     INT NOT NULL,
  valor_propuesta INT NOT NULL,
  cuotas          TINYINT,
  PRIMARY KEY (id_propuesta),
  FOREIGN KEY (rut_docente) REFERENCES docentes(rut_docente)
);

-- ----------------------------------------------------------------------------
-- pagos: cuotas asociadas a una propuesta
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pagos (
  id_pago      INT AUTO_INCREMENT NOT NULL ,
  id_propuesta INT NOT NULL,
  mes          ENUM('enero','febrero','marzo','abril',
                    'mayo','junio','julio','agosto',
                    'septiembre','octubre','noviembre','diciembre') NOT NULL,
  notas        TEXT(32767),
  estado_pago  ENUM('Pendiente', 'Pagada') DEFAULT 'Pendiente',
  fecha_pago   DATE,
  estado_boleta ENUM('Faltante', 'Subida', 'Procesada', 'Con Observación') DEFAULT 'Faltante',
  PRIMARY KEY (id_pago),
  FOREIGN KEY (id_propuesta) REFERENCES propuestas(id_propuesta)
);

-- ----------------------------------------------------------------------------
-- archivos: documentos cargados por usuarios (CV, certificados, boletas, etc.)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS archivos (
  id_archivo     INT AUTO_INCREMENT NOT NULL,
  correo_usuario VARCHAR(32),
  ruta           VARCHAR(255) NOT NULL,
  PRIMARY KEY (id_archivo),
  FOREIGN KEY (correo_usuario) REFERENCES usuarios(correo_usuario)
);

-- ----------------------------------------------------------------------------
-- capacitaciones: capacitaciones declaradas por cada docente
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS capacitaciones (
  id_capacitacion INT AUTO_INCREMENT NOT NULL,
  rut_docente     INT,
  titulo          VARCHAR(64),
  descripcion     TEXT(16383),
  PRIMARY KEY (id_capacitacion),
  FOREIGN KEY (rut_docente) REFERENCES docentes(rut_docente)
);

-- ----------------------------------------------------------------------------
-- coordinadores: usuarios coordinadores asignados a una carrera
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coordinadores (
  id_coordinador INT AUTO_INCREMENT NOT NULL,
  correo_usuario VARCHAR(32),
  id_carrera     VARCHAR(4),
  PRIMARY KEY (id_coordinador),
  FOREIGN KEY (correo_usuario) REFERENCES usuarios(correo_usuario)
);
