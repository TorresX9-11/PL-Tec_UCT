import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { GraduationCap, LogOut, Users, FileText } from 'lucide-react';
import { toast } from 'sonner';

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-6 w-6 text-blue-600" />
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
      <nav className="border-b bg-white">
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
              to="/admin/coordinadores"
              className={`flex items-center gap-1.5 border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                isActive('/admin/coordinadores')
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="h-4 w-4" />
              Coordinadores
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
