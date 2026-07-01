import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { LogOut, LayoutDashboard, Users, UserCog } from 'lucide-react';
import tecLogo from '../../styles/Logo TEC Dirección_01.png';
import { toast } from 'sonner';
import { RequirePasswordChange } from './RequirePasswordChange';
import { logout } from '../data/auth';

export function SupervisorLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada');
    sessionStorage.removeItem('supervisorId');
    sessionStorage.removeItem('supervisorNombre');
    sessionStorage.removeItem('supervisandoCarreraId');
    sessionStorage.removeItem('supervisandoCarreraNombre');
    navigate('/academico/login');
  };

  const supervisorNombre = sessionStorage.getItem('supervisorNombre') || 'Supervisor';

  return (
    <RequirePasswordChange>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={tecLogo} alt="TEC UCT Logo" className="h-10 object-contain" />
              <div>
                <h1 className="font-bold text-gray-900">Plataforma TEC - Supervisión</h1>
                <p className="text-xs text-gray-600">Universidad Católica de Temuco</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-sm font-medium text-gray-700 hidden sm:block">
                {supervisorNombre}
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
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex gap-8">
            <Link
              to="/supervisor/dashboard"
              className={`flex items-center gap-1.5 border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                isActive('/supervisor/dashboard')
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard de Carreras
            </Link>
            <Link
              to="/supervisor/coordinadores"
              className={`flex items-center gap-1.5 border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                isActive('/supervisor/coordinadores')
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="h-4 w-4" />
              Gestión de Coordinadores
            </Link>
            <Link
              to="/supervisor/usuarios"
              className={`flex items-center gap-1.5 border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                isActive('/supervisor/usuarios')
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <UserCog className="h-4 w-4" />
              Cuentas de Usuarios
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
