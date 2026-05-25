import { Link } from 'react-router';
import { Users, FileText, Mail, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { mockDocentes } from '../../data/mockData';

export function AdminDashboard() {
  const totalDocentes = mockDocentes.length;
  const docentesDiurnos = mockDocentes.filter(d => d.jornada === 'Diurna').length;
  const docentesVespertinos = mockDocentes.filter(d => d.jornada === 'Vespertina').length;
  const totalPropuestas = mockDocentes.reduce((sum, d) => sum + d.montoTotalPropuesta, 0);
  const totalPagado = mockDocentes.filter(d => d.estado === 'Pagado').length;
  const totalPendiente = mockDocentes.filter(d => d.estado === 'Pendiente').length;
  const sinBoleta = mockDocentes.filter(d => !d.recepcionBHE).length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Módulo Administración</h1>
        <p className="mt-2 text-gray-600">
          Gestión de pagos y propuestas docentes - Semestre 1, 2026
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
            <div className="text-2xl font-bold">{totalDocentes}</div>
            <p className="text-xs text-gray-600">
              {docentesDiurnos} Diurnos / {docentesVespertinos} Vespertinos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Propuestas</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPropuestas)}</div>
            <p className="text-xs text-gray-600">Semestre completo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos Completos</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalPagado}/{totalDocentes}
            </div>
            <p className="text-xs text-gray-600">
              {Math.round((totalPagado / totalDocentes) * 100)}% completado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPendiente + sinBoleta}</div>
            <p className="text-xs text-gray-600">
              {totalPendiente} pendientes, {sinBoleta} sin boleta
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access */}
      <div className="grid gap-6 md:grid-cols-2">
        <Link to="/admin/docentes">
          <Card className="cursor-pointer transition-all hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Base de Datos Docentes</CardTitle>
                  <CardDescription>Gestión completa de docentes y pagos</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Acceda a la tabla principal con búsqueda, filtros, carga de boletas y gestión de cuotas.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card className="cursor-pointer transition-all hover:shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-3">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle>Correos Masivos</CardTitle>
                <CardDescription>Enviar comunicaciones a docentes</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Sistema de envío de correos masivos con redacción personalizada.
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-all hover:shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-3">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle>Informes y Reportes</CardTitle>
                <CardDescription>Totales y estadísticas semestrales</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Generación de informes con totales de propuestas y cuotas mensuales.
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-all hover:shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-100 p-3">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <CardTitle>Gestión de Boletas</CardTitle>
                <CardDescription>Carga y seguimiento de BHE</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Cargar y gestionar boletas de honorarios electrónicas por docente.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas y Pendientes */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas y Acciones Pendientes</CardTitle>
          <CardDescription>Docentes que requieren atención</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockDocentes
              .filter(d => d.estado === 'Pendiente' || !d.recepcionBHE)
              .map((docente) => (
                <div
                  key={docente.id}
                  className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4"
                >
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div className="flex-1">
                    <h4 className="font-medium">{docente.nombreCompleto}</h4>
                    <p className="text-sm text-gray-700">
                      {docente.carrera} - {docente.jornada}
                    </p>
                    <ul className="mt-1 space-y-1 text-sm text-gray-700">
                      {docente.estado === 'Pendiente' && <li>• Pago pendiente</li>}
                      {!docente.recepcionBHE && <li>• Falta recepción de boleta</li>}
                    </ul>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Saldo</p>
                    <p className="text-sm text-gray-600">{formatCurrency(docente.saldo)}</p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Cuotas por Jornada */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Jornada Diurna</CardTitle>
            <CardDescription>4 cuotas: Abril - Mayo - Junio - Julio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Docentes:</span>
                <span className="font-medium">{docentesDiurnos}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Propuestas:</span>
                <span className="font-medium">
                  {formatCurrency(
                    mockDocentes
                      .filter(d => d.jornada === 'Diurna')
                      .reduce((sum, d) => sum + d.montoTotalPropuesta, 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Cuota Mensual Promedio:</span>
                <span className="font-medium">
                  {formatCurrency(
                    mockDocentes
                      .filter(d => d.jornada === 'Diurna')
                      .reduce((sum, d) => sum + d.valorCuotaBruto, 0) / docentesDiurnos
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Jornada Vespertina</CardTitle>
            <CardDescription>5 cuotas: Abril - Mayo - Junio - Julio - Agosto</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Docentes:</span>
                <span className="font-medium">{docentesVespertinos}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Propuestas:</span>
                <span className="font-medium">
                  {formatCurrency(
                    mockDocentes
                      .filter(d => d.jornada === 'Vespertina')
                      .reduce((sum, d) => sum + d.montoTotalPropuesta, 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Cuota Mensual Promedio:</span>
                <span className="font-medium">
                  {formatCurrency(
                    mockDocentes
                      .filter(d => d.jornada === 'Vespertina')
                      .reduce((sum, d) => sum + d.valorCuotaBruto, 0) / docentesVespertinos
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}