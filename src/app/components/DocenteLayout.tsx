import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { User, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export function DocenteLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    toast.success('Sesión cerrada');
    navigate('/academico/login');
  };

  // Obtener información del docente desde sessionStorage o contexto
  const docenteNombre = sessionStorage.getItem('docenteNombre') || 'Docente';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="h-6 w-6 text-green-600" />
              <div>
                <h1 className="font-bold text-gray-900">Portal Docente - TEC UCT</h1>
                <p className="text-xs text-gray-600">{docenteNombre}</p>
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
              to="/docente/dashboard"
              className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                location.pathname === '/docente/dashboard'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Mi Perfil
            </Link>
            <Link
              to="/docente/cv"
              className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                isActive('/docente/cv')
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              CV y Formación
            </Link>
            <Link
              to="/docente/certificados"
              className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                isActive('/docente/certificados')
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Certificados
            </Link>
            <Link
              to="/docente/capacitaciones"
              className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                isActive('/docente/capacitaciones')
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Capacitaciones
            </Link>
            <Link
              to="/docente/boletas"
              className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                isActive('/docente/boletas')
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Boletas
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
