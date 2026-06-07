import { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { GraduationCap, LogOut, ArrowLeftCircle, Bell } from 'lucide-react';
import { toast } from 'sonner';

export function AcademicLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  // Verificar si estamos en "Modo Supervisión"
  const isSupervising = !!sessionStorage.getItem('supervisandoCarreraId');
  const carreraSupervisada = sessionStorage.getItem('supervisandoCarreraNombre');
  const coordinadorSupervisado = sessionStorage.getItem('userName');
  
  // Notificación mock al iniciar sesión
  useEffect(() => {
    const role = sessionStorage.getItem('userRole');
    const checked = sessionStorage.getItem('coordinador_check_mensajes');
    
    if (role === 'admin_academico' && !checked && !isSupervising) {
      sessionStorage.setItem('coordinador_check_mensajes', '1');
      
      const timer = window.setTimeout(() => {
        toast.message('Tienes nuevas actualizaciones', {
          description: 'Juan Carlos Pérez ha actualizado su CV y requiere validación.',
          icon: <Bell className="h-5 w-5 text-green-600" />,
          duration: 8000,
          action: {
            label: 'Ver Docente',
            onClick: () => navigate('/academico/plataforma-docentes')
          }
        });
      }, 800);
      
      return () => window.clearTimeout(timer);
    }
  }, [navigate, isSupervising]);

  const handleLogout = () => {
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('modoSupervision');
    toast.success('Sesión cerrada');
    navigate('/academico/login');
  };

  const handleExitSupervision = () => {
    // Restaurar rol a supervisor
    sessionStorage.setItem('userRole', 'supervisor');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('supervisandoCarreraId');
    sessionStorage.removeItem('supervisandoCarreraNombre');
    sessionStorage.removeItem('modoSupervision');

    toast.info('Saliendo del modo supervisión');
    navigate('/supervisor/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-6 w-6 text-green-600" />
              <div>
                <h1 className="font-bold text-gray-900">
                  Plataforma TEC - Área Académica
                  {isSupervising && <span className="ml-2 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full border border-indigo-200">Modo Supervisión: {carreraSupervisada} ({coordinadorSupervisado})</span>}
                </h1>
                <p className="text-xs text-gray-600">Universidad Católica de Temuco</p>
              </div>
            </div>
            {isSupervising ? (
              <button
                onClick={handleExitSupervision}
                className="flex items-center gap-2 text-sm font-medium text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors"
              >
                <ArrowLeftCircle className="h-4 w-4" />
                Salir Modo Supervisión
              </button>
            ) : (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex gap-8">
            <Link
              to="/academico/dashboard"
              className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                location.pathname === '/academico/dashboard'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/academico/plataforma-docentes"
              className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                isActive('/academico/plataforma-docentes')
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Plataforma Docentes
            </Link>
            <Link
              to="/academico/gestion-academica"
              className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                isActive('/academico/gestion-academica')
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Gestión Académica
            </Link>
            <Link
              to="/academico/acreditacion"
              className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                isActive('/academico/acreditacion')
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Acreditación
            </Link>
            <Link
              to="/academico/reportes"
              className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                isActive('/academico/reportes')
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Reportes
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
