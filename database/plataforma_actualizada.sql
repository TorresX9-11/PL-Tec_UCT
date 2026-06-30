CREATE TABLE `archivos` (
  `id_archivo` int(11) NOT NULL AUTO_INCREMENT,
  `correo_usuario` varchar(32) DEFAULT NULL,
  `ruta` varchar(255) NOT NULL,
  `id_carrera` varchar(32) DEFAULT NULL,
  `id_curso` varchar(32) DEFAULT NULL,
  `fecha_subida` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_archivo`),
  KEY `correo_usuario` (`correo_usuario`),
  CONSTRAINT `archivos_ibfk_1` FOREIGN KEY (`correo_usuario`) REFERENCES `usuarios` (`correo_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `archivos_historicos` (
  `id_archivo` int(11) NOT NULL AUTO_INCREMENT,
  `periodo_nombre` varchar(50) NOT NULL,
  `fecha_cierre` datetime DEFAULT current_timestamp(),
  `url_pdf_historial` varchar(255) NOT NULL,
  `url_zip_boletas` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_archivo`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `capacitaciones` (
  `id_capacitacion` int(11) NOT NULL AUTO_INCREMENT,
  `rut_docente` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `institucion` varchar(100) DEFAULT NULL,
  `anio` int(11) DEFAULT NULL,
  `horas` int(11) DEFAULT NULL,
  `archivo_adjunto` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_capacitacion`),
  KEY `rut_docente` (`rut_docente`),
  CONSTRAINT `capacitaciones_ibfk_1` FOREIGN KEY (`rut_docente`) REFERENCES `docentes` (`rut_docente`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `carreras` (
  `id_carrera` varchar(4) NOT NULL,
  `nombre` varchar(64) NOT NULL,
  `jornada` enum('diurno','vespertino') NOT NULL DEFAULT 'diurno',
  PRIMARY KEY (`id_carrera`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `coordinadores` (
  `id_coordinador` int(11) NOT NULL AUTO_INCREMENT,
  `correo_usuario` varchar(32) NOT NULL,
  `id_carrera` varchar(32) DEFAULT NULL,
  `nombre` varchar(128) NOT NULL,
  `rut` varchar(20) NOT NULL,
  PRIMARY KEY (`id_coordinador`),
  KEY `correo_usuario` (`correo_usuario`),
  CONSTRAINT `coordinadores_ibfk_1` FOREIGN KEY (`correo_usuario`) REFERENCES `usuarios` (`correo_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `cursos` (
  `id_carrera` varchar(4) NOT NULL,
  `id_curso` varchar(5) NOT NULL,
  `jornada` enum('diurno','vespertino') NOT NULL DEFAULT 'diurno',
  `nombre` varchar(64) NOT NULL,
  `rut_docente` int(11) DEFAULT NULL,
  `semestre` enum('1','2','3','4','5','6') DEFAULT '1',
  `notas_ingresadas` tinyint(4) DEFAULT NULL,
  `notas_curso` tinyint(4) NOT NULL,
  PRIMARY KEY (`id_carrera`,`id_curso`),
  CONSTRAINT `cursos_ibfk_1` FOREIGN KEY (`id_carrera`) REFERENCES `carreras` (`id_carrera`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `docentes` (
  `rut_docente` int(11) NOT NULL,
  `dv` char(1) NOT NULL,
  `correo_usuario` varchar(32) DEFAULT NULL,
  `contacto` varchar(12) DEFAULT NULL,
  `nombre` varchar(64) NOT NULL,
  `nivel_docente` enum('A','B','C') DEFAULT NULL,
  `estado_cv` enum('Inexistente','Por Revisar','Validado') DEFAULT 'Inexistente',
  `estado_titulo` enum('Inexistente','Por Revisar','Validado') DEFAULT 'Inexistente',
  `estado_antecedentes` enum('Inexistente','Por Revisar','Validado') DEFAULT 'Inexistente',
  `estado_inhabilidad` enum('Inexistente','Por Revisar','Validado') DEFAULT 'Inexistente',
  `fecha_ingreso` date DEFAULT NULL,
  PRIMARY KEY (`rut_docente`),
  KEY `correo_usuario` (`correo_usuario`),
  CONSTRAINT `docentes_ibfk_1` FOREIGN KEY (`correo_usuario`) REFERENCES `usuarios` (`correo_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `evidencias_acreditacion` (
  `id_evidencia` int(11) NOT NULL AUTO_INCREMENT,
  `id_hito` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_subida` datetime DEFAULT current_timestamp(),
  `url_archivo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_evidencia`),
  KEY `id_hito` (`id_hito`),
  CONSTRAINT `evidencias_acreditacion_ibfk_1` FOREIGN KEY (`id_hito`) REFERENCES `hitos_acreditacion` (`id_hito`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `grupos` (
  `id_grupo` int(11) NOT NULL AUTO_INCREMENT,
  `id_carrera` varchar(4) NOT NULL,
  `id_curso` varchar(5) NOT NULL,
  `jornada` enum('diurno','vespertino') DEFAULT NULL,
  `seccion` enum('1','2','3') NOT NULL DEFAULT '1',
  `subgrupo` enum('A','B') DEFAULT NULL,
  `rut_docente` int(11) DEFAULT NULL,
  `horas_presencial` tinyint(4) DEFAULT NULL,
  `horas_mixto` tinyint(4) DEFAULT NULL,
  `horas_administrativo` tinyint(4) DEFAULT NULL,
  `contenido_blackboard` enum('Inexistente','Por Revisar','Validado') DEFAULT 'Inexistente',
  `guia_aprendizaje` enum('Inexistente','Por Revisar','Validado') DEFAULT 'Inexistente',
  `notas_estado` enum('Inexistente','Por Revisar','Validado') DEFAULT 'Por Revisar',
  PRIMARY KEY (`id_grupo`),
  KEY `id_carrera` (`id_carrera`,`id_curso`),
  KEY `rut_docente` (`rut_docente`),
  CONSTRAINT `grupos_ibfk_1` FOREIGN KEY (`id_carrera`, `id_curso`) REFERENCES `cursos` (`id_carrera`, `id_curso`),
  CONSTRAINT `grupos_ibfk_2` FOREIGN KEY (`rut_docente`) REFERENCES `docentes` (`rut_docente`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `historial_activo` (
  `id_historial` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` datetime DEFAULT current_timestamp(),
  `tipo` enum('Validación','Designación','Pago','Boleta','Sistema') NOT NULL,
  `modulo` varchar(100) NOT NULL,
  `actor` varchar(100) NOT NULL,
  `rut_docente` int(11) DEFAULT NULL,
  `descripcion` text NOT NULL,
  `estado` varchar(50) NOT NULL,
  PRIMARY KEY (`id_historial`),
  KEY `rut_docente` (`rut_docente`),
  CONSTRAINT `historial_activo_ibfk_1` FOREIGN KEY (`rut_docente`) REFERENCES `docentes` (`rut_docente`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `hitos_acreditacion` (
  `id_hito` int(11) NOT NULL AUTO_INCREMENT,
  `id_carrera` varchar(10) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_limite` date DEFAULT NULL,
  `estado` enum('Completo','En Progreso','Pendiente') DEFAULT 'Pendiente',
  `evidencias` int(11) DEFAULT 0,
  PRIMARY KEY (`id_hito`),
  KEY `id_carrera` (`id_carrera`),
  CONSTRAINT `hitos_acreditacion_ibfk_1` FOREIGN KEY (`id_carrera`) REFERENCES `carreras` (`id_carrera`)
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `pagos` (
  `id_pago` int(11) NOT NULL AUTO_INCREMENT,
  `id_propuesta` int(11) NOT NULL,
  `mes` enum('enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre') NOT NULL,
  `notas` mediumtext DEFAULT NULL,
  `estado_pago` enum('Pendiente','Pagada') DEFAULT 'Pendiente',
  `fecha_pago` date DEFAULT NULL,
  `estado_boleta` enum('Faltante','Subida','Procesada','Con Observación') DEFAULT 'Faltante',
  PRIMARY KEY (`id_pago`),
  KEY `id_propuesta` (`id_propuesta`),
  CONSTRAINT `pagos_ibfk_1` FOREIGN KEY (`id_propuesta`) REFERENCES `propuestas` (`id_propuesta`)
) ENGINE=InnoDB AUTO_INCREMENT=170 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `propuestas` (
  `id_propuesta` int(11) NOT NULL AUTO_INCREMENT,
  `rut_docente` int(11) NOT NULL,
  `valor_propuesta` int(11) NOT NULL,
  `cuotas` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`id_propuesta`),
  KEY `rut_docente` (`rut_docente`),
  CONSTRAINT `propuestas_ibfk_1` FOREIGN KEY (`rut_docente`) REFERENCES `docentes` (`rut_docente`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `usuarios` (
  `correo_usuario` varchar(32) NOT NULL,
  `nombre` varchar(128) DEFAULT NULL,
  `contrasena` varchar(255) NOT NULL,
  `nivel` enum('docente','coordinador','academico','admin','supervisor') DEFAULT NULL,
  `debe_cambiar_pass` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`correo_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

SET FOREIGN_KEY_CHECKS=0;

INSERT INTO `carreras` VALUES 
('EDDI', 'T.U. Edu. Dífer.', 'diurno'),
('EDPA', 'T.U. Edu. Parv. y NB1', 'diurno'),
('EEEV', 'T.U. Ele. y Efi. Ener. V.', 'vespertino'),
('EENE', 'T.U. Elect. y Efi. Ener.', 'diurno'),
('EPAV', 'T.U. Edu. Parv. NB1 V.', 'vespertino'),
('GADE', 'T.U. G. y Admin. Emp.', 'diurno'),
('GAEV', 'T.U. G. y Adm. Emp. V.', 'vespertino'),
('INFO', 'T.U. Informática', 'diurno'),
('INFV', 'T.U. Informática V.', 'vespertino'),
('PROA', 'T.U. Prod. Agro. Sost.', 'diurno');

INSERT INTO `cursos` VALUES 
('EDPA', 'EDU-1', 'diurno', 'Psicología del Desarrollo', NULL, '1', 0, 0),
('EDPA', 'EDU-2', 'diurno', 'Didáctica de la Educación Inicial', NULL, '1', 0, 0),
('EDPA', 'EDU-3', 'diurno', 'Evaluación en Educación Inicial', NULL, '1', 0, 0),
('EENE', 'ELE-1', 'diurno', 'Circuitos Eléctricos', NULL, '1', 0, 0),
('EENE', 'ELE-2', 'diurno', 'Electrónica Industrial', NULL, '1', 0, 0),
('EENE', 'ELE-3', 'diurno', 'Sistemas de Energía', NULL, '1', 0, 0),
('GADE', 'ADM-1', 'diurno', 'Contabilidad General', NULL, '1', 0, 0),
('GADE', 'ADM-2', 'diurno', 'Gestión de Recursos Humanos', NULL, '1', 0, 0),
('GADE', 'ADM-3', 'diurno', 'Marketing Estratégico', NULL, '1', 0, 0),
('GADE', 'ADM-4', 'diurno', 'Finanzas Corporativas', NULL, '1', 0, 0),
('INFO', 'INF-1', 'diurno', 'Programación I', NULL, '1', 0, 0),
('INFO', 'INF-2', 'diurno', 'Programación Orientada a Objetos', NULL, '1', 0, 0),
('INFO', 'INF-3', 'diurno', 'Bases de Datos', NULL, '1', 0, 0),
('INFO', 'INF-4', 'diurno', 'Redes de Computadores', NULL, '1', 0, 0);

SET FOREIGN_KEY_CHECKS=1;
