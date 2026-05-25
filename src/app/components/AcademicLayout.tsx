import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { GraduationCap, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export function AcademicLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    toast.success('Sesión cerrada');
    navigate('/academico/login');
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
                <h1 className="font-bold text-gray-900">Plataforma TEC - Área Académica</h1>
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
