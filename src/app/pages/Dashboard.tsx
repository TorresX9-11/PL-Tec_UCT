import { Link } from 'react-router';
import { Users, FileText, DollarSign, BookOpen, TrendingUp, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard TEC</h1>
        <p className="mt-2 text-gray-600">
          Bienvenido a la plataforma de gestión interna del área TEC
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Docentes</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-gray-600">Semestre actual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monto Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$17.37M</div>
            <p className="text-xs text-gray-600">Propuestas semestrales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos al Día</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3/8</div>
            <p className="text-xs text-gray-600">Docentes completos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa Cumplimiento</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">75%</div>
            <p className="text-xs text-gray-600">Documentación académica</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Modules */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-gray-900">Accesos Rápidos</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Administración Module */}
          <Link to="/administracion">
            <Card className="cursor-pointer transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-3">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>Módulo Administración</CardTitle>
                    <CardDescription>Gestión de Pago Docentes</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
                    Base de datos de docentes
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
                    Gestión de cuotas y pagos
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
                    Carga de boletas
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
                    Envío de correos masivos
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
                    Informes y totales
                  </li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          {/* Área Académica Module */}
          <Link to="/academico">
            <Card className="cursor-pointer transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-100 p-3">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle>Área Académica</CardTitle>
                    <CardDescription>Gestión Académica y Acreditación</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-600"></div>
                    Plataforma docentes (CV y certificados)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-600"></div>
                    Gestión de capacitaciones
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-600"></div>
                    Proceso de acreditación
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-600"></div>
                    GA - Gestión Académica
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-600"></div>
                    Reportes de desempeño
                  </li>
                </ul>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>Últimas actualizaciones del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-full bg-green-100 p-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Boleta recibida - Juan Carlos Pérez</p>
                <p className="text-xs text-gray-600">Hace 2 horas</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-full bg-blue-100 p-1">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">CV actualizado - María Teresa Rodríguez</p>
                <p className="text-xs text-gray-600">Hace 5 horas</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-full bg-blue-100 p-1">
                <BookOpen className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Nueva capacitación registrada - Pedro Morales</p>
                <p className="text-xs text-gray-600">Hace 1 día</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
