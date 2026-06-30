import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { LogOut, Users, FileText } from 'lucide-react';
import tecLogo from '../../styles/Logo TEC Dirección_01.png';
import { toast } from 'sonner';
import { RequirePasswordChange } from './RequirePasswordChange';

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    toast.success('Sesión cerrada');
    navigate('/admin/login');
  };

  return (
    <RequirePasswordChange>
      <div className="min-h-screen bg-gradient-to-br from-blue-100/50 via-blue-50/30 to-blue-200/20">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-blue-100 shadow-sm sticky top-0 z-20">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={tecLogo} alt="TEC UCT Logo" className="h-10 object-contain" />
              <div>
                <h1 className="font-bold text-gray-900">Plataforma TEC - Administración</h1>
                <p className="text-xs text-gray-600">Universidad Católica de Temuco</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-blue-100 shadow-sm sticky top-[73px] z-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex gap-8">
            <Link
              to="/admin/dashboard"
              className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                location.pathname === '/admin/dashboard'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/admin/carreras-asignaturas"
              className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                isActive('/admin/carreras-asignaturas')
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Carreras y Asignaturas
            </Link>
            <Link
              to="/admin/docentes"
              className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                isActive('/admin/docentes')
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Base de Datos
            </Link>
            <Link
              to="/admin/reportes"
              className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                isActive('/admin/reportes')
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Reportes
            </Link>
            <Link
              to="/admin/correos-masivos"
              className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                isActive('/admin/correos-masivos')
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Correos Masivos
            </Link>
            <Link
              to="/admin/historial"
              className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                isActive('/admin/historial')
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Historial
            </Link>
            <Link
              to="/admin/usuarios"
              className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                isActive('/admin/usuarios')
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Usuarios
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
    </RequirePasswordChange>
  );
}
