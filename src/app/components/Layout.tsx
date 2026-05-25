import { Link, Outlet, useLocation } from 'react-router';
import { GraduationCap, Users, FileText, BookOpen, LogOut } from 'lucide-react';

export function Layout() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-lg">
        <div className="mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-8 w-8" />
              <div>
                <h1 className="text-xl font-bold">TEC UCT</h1>
                <p className="text-sm text-blue-200">Universidad Católica de Temuco</p>
              </div>
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-blue-800 px-4 py-2 text-sm hover:bg-blue-700">
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b bg-white shadow-sm">
        <div className="mx-auto px-6">
          <div className="flex gap-1">
            <Link
              to="/"
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                location.pathname === '/'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              to="/administracion"
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                isActive('/administracion')
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
              }`}
            >
              <Users className="h-4 w-4" />
              Administración
            </Link>
            <Link
              to="/academico"
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                isActive('/academico')
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
              }`}
            >
              <FileText className="h-4 w-4" />
              Área Académica
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto px-6 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-6">
        <div className="mx-auto px-6 text-center text-sm text-gray-600">
          <p>&copy; 2026 Universidad Católica de Temuco - Plataforma TEC Interna</p>
        </div>
      </footer>
    </div>
  );
}
