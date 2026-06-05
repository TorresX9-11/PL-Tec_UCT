import { createBrowserRouter } from 'react-router';
import { LandingPage } from './pages/LandingPage';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AcademicLogin } from './pages/academic/AcademicLogin';
import { AdminLayout } from './components/AdminLayout';
import { AcademicLayout } from './components/AcademicLayout';
import { DocenteLayout } from './components/DocenteLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { CarrerasAsignaturas } from './pages/admin/CarrerasAsignaturas';
import { DocentesTable } from './pages/admin/DocentesTable';
import { Reportes } from './pages/admin/Reportes';
import { CorreosMasivos } from './pages/admin/CorreosMasivos';
import { Coordinadores } from './pages/admin/Coordinadores';
import { AcademicDashboard } from './pages/academic/AcademicDashboard';
import { PlataformaDocentes } from './pages/academic/PlataformaDocentes';
import { GestionAcademica } from './pages/academic/GestionAcademica';
import { Acreditacion } from './pages/academic/Acreditacion';
import { ReportesAcademicos } from './pages/academic/ReportesAcademicos';
import { ValidarDocente } from './pages/academic/ValidarDocente';
import { DocenteDashboard } from './pages/docente/DocenteDashboard';
import { DocenteCV } from './pages/docente/DocenteCV';
import { DocenteCertificados } from './pages/docente/DocenteCertificados';
import { DocenteCapacitaciones } from './pages/docente/DocenteCapacitaciones';
import { DocenteBoletas } from './pages/docente/DocenteBoletas';

export const router = createBrowserRouter([
  // Landing Page
  {
    path: '/',
    Component: LandingPage,
  },
  
  // Módulo Administración
  {
    path: '/admin/login',
    Component: AdminLogin,
  },
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      { path: 'dashboard', Component: AdminDashboard },
      { path: 'carreras-asignaturas', Component: CarrerasAsignaturas },
      { path: 'docentes', Component: DocentesTable },
      { path: 'coordinadores', Component: Coordinadores },
      { path: 'reportes', Component: Reportes },
      { path: 'correos-masivos', Component: CorreosMasivos },
    ],
  },
  
  // Módulo Académico
  {
    path: '/academico/login',
    Component: AcademicLogin,
  },
  {
    path: '/academico',
    Component: AcademicLayout,
    children: [
      { path: 'dashboard', Component: AcademicDashboard },
      { path: 'plataforma-docentes', Component: PlataformaDocentes },
      { path: 'gestion-academica', Component: GestionAcademica },
      { path: 'validar-docente/:docenteId', Component: ValidarDocente },
      { path: 'acreditacion', Component: Acreditacion },
      { path: 'reportes', Component: ReportesAcademicos },
    ],
  },

  // Módulo Docente
  {
    path: '/docente',
    Component: DocenteLayout,
    children: [
      { path: 'dashboard', Component: DocenteDashboard },
      { path: 'cv', Component: DocenteCV },
      { path: 'certificados', Component: DocenteCertificados },
      { path: 'capacitaciones', Component: DocenteCapacitaciones },
      { path: 'boletas', Component: DocenteBoletas },
    ],
  },
]);
