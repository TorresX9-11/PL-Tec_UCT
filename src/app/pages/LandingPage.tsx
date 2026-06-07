import { Link } from 'react-router';
import { GraduationCap, Users, FileText, Eye } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Plataforma TEC</h1>
              <p className="text-sm text-gray-600">Universidad Católica de Temuco</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Sistema de Gestión TEC
          </h2>
          <p className="text-gray-600">
            Seleccione el módulo al que desea acceder
          </p>
        </div>

        {/* Module Cards */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Administración */}
          <Link to="/admin/login">
            <div className="group relative h-full overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-6 transition-all hover:border-blue-500 hover:shadow-xl">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">
                RRHH / Pagos
              </h3>
              <p className="mb-4 text-sm text-gray-600">
                Gestión de pagos y propuestas docentes
              </p>
              <ul className="space-y-2 text-xs text-gray-600 mb-4">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
                  Base de datos de docentes
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
                  Gestión de cuotas y boletas
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
                  Correos masivos e informes
                </li>
              </ul>
              <div className="font-medium text-sm text-blue-600 group-hover:underline">
                Acceder →
              </div>
            </div>
          </Link>

          {/* Área Académica */}
          <Link to="/academico/login">
            <div className="group relative h-full overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-6 transition-all hover:border-green-500 hover:shadow-xl">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-green-100 text-green-600">
                <FileText className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">
                Área Académica
              </h3>
              <p className="mb-4 text-sm text-gray-600">
                Gestión para coordinadores y docentes
              </p>
              <ul className="space-y-2 text-xs text-gray-600 mb-4">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-600"></span>
                  Plataforma docentes (CV)
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-600"></span>
                  Validación y Gestión académica
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-600"></span>
                  Proceso de acreditación
                </li>
              </ul>
              <div className="font-medium text-sm text-green-600 group-hover:underline">
                Acceder →
              </div>
            </div>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 border-t bg-white py-6">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-gray-600">
          © 2026 Universidad Católica de Temuco - Área TEC
        </div>
      </footer>
    </div>
  );
}
