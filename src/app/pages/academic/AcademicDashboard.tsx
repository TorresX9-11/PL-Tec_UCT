import { Link } from 'react-router';
import { FileText, Users, Award, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { mockDocentesAcademicos } from '../../data/mockData';

export function AcademicDashboard() {
  const totalDocentes = mockDocentesAcademicos.length;
  const cvCompleto = mockDocentesAcademicos.filter(d => d.cvActualizado === 'Validado').length;
  const documentacionCompleta = mockDocentesAcademicos.filter(
    d => d.certificadoTitulo === 'Validado' && d.certificadoAntecedentes === 'Validado' && d.certificadoInhabilidad === 'Validado'
  ).length;
  const contenidoAlDia = mockDocentesAcademicos.filter(d => d.contenidoSubido).length;
  const notasAlDia = mockDocentesAcademicos.filter(d => d.notasTotales > 0 && d.notasIngresadas >= d.notasTotales).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Área Académica</h1>
        <p className="mt-2 text-gray-600">
          Gestión académica, acreditación y desarrollo docente
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Docentes Activos</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDocentes}</div>
            <p className="text-xs text-gray-600">Total en plataforma</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CV Actualizado</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cvCompleto}/{totalDocentes}
            </div>
            <p className="text-xs text-gray-600">
              {Math.round((cvCompleto / totalDocentes) * 100)}% completado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentación</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documentacionCompleta}/{totalDocentes}
            </div>
            <p className="text-xs text-gray-600">Certificados completos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cumplimiento GA</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(((contenidoAlDia + notasAlDia) / (totalDocentes * 2)) * 100)}%
            </div>
            <p className="text-xs text-gray-600">Contenido y notas</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Modules */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link to="/academico/plataforma-docentes">
          <Card className="cursor-pointer transition-all hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Plataforma Docentes</CardTitle>
                  <CardDescription>CV y Certificados</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
                  Gestión de CV
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
                  Certificados
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
                  Capacitaciones
                </li>
              </ul>
            </CardContent>
          </Card>
        </Link>

        <Link to="/academico/gestion-academica">
          <Card className="cursor-pointer transition-all hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-3">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle>Gestión Académica</CardTitle>
                  <CardDescription>Reportes GA</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-600"></div>
                  Contenido Blackboard
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-600"></div>
                  Notas al día
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-600"></div>
                  Reportes
                </li>
              </ul>
            </CardContent>
          </Card>
        </Link>

        <Link to="/academico/acreditacion">
          <Card className="cursor-pointer transition-all hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-100 p-3">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Acreditación</CardTitle>
                  <CardDescription>Proceso institucional</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-600"></div>
                  Hitos del proceso
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-600"></div>
                  Evidencias
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-600"></div>
                  Seguimiento
                </li>
              </ul>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Alertas */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas y Pendientes</CardTitle>
          <CardDescription>Acciones que requieren atención</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockDocentesAcademicos
              .filter(d => d.cvActualizado !== 'Validado' || d.certificadoAntecedentes !== 'Validado' || !d.contenidoSubido || d.notasIngresadas < d.notasTotales)
              .map((docente) => (
                <div
                  key={docente.id}
                  className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4"
                >
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div className="flex-1">
                    <h4 className="font-medium">{docente.nombreCompleto}</h4>
                    <ul className="mt-1 space-y-1 text-sm text-gray-700">
                      {docente.cvActualizado !== 'Validado' && <li>• Actualizar CV</li>}
                      {docente.certificadoAntecedentes !== 'Validado' && <li>• Subir certificado de antecedentes</li>}
                      {!docente.contenidoSubido && <li>• Subir contenido a plataformas</li>}
                      {docente.notasIngresadas < docente.notasTotales && (
                        <li>• Actualizar registro de notas ({docente.notasIngresadas}/{docente.notasTotales})</li>
                      )}
                    </ul>
                  </div>
                </div>
              ))}

            {mockDocentesAcademicos.filter(
              d => d.cvActualizado === 'Validado' && d.certificadoAntecedentes === 'Validado' && d.contenidoSubido && d.notasTotales > 0 && d.notasIngresadas >= d.notasTotales
            ).length === totalDocentes && (
              <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Todos los docentes están al día</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas de Capacitaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Capacitaciones y Desarrollo Docente</CardTitle>
          <CardDescription>Resumen de capacitaciones registradas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">
                    {mockDocentesAcademicos.reduce((sum, d) => sum + d.capacitaciones, 0)}
                  </div>
                  <p className="text-sm text-gray-600">Total Capacitaciones</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">
                    {(
                      mockDocentesAcademicos.reduce((sum, d) => sum + d.capacitaciones, 0) /
                      totalDocentes
                    ).toFixed(1)}
                  </div>
                  <p className="text-sm text-gray-600">Promedio por Docente</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">
                    {Math.max(...mockDocentesAcademicos.map(d => d.capacitaciones))}
                  </div>
                  <p className="text-sm text-gray-600">Máximo por Docente</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
