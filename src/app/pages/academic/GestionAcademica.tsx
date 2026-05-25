import { CheckCircle, XCircle, AlertCircle, FileCheck, Clock, FileX, Settings } from 'lucide-react';
import { useNavigate } from 'react-router';
import { mockDocentesAcademicos, type EstadoValidacion } from '../../data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

export function GestionAcademica() {
  const navigate = useNavigate();
  const docentes = mockDocentesAcademicos;

  const estadisticas = {
    totalDocentes: docentes.length,
    contenidoCompleto: docentes.filter(d => d.contenidoSubido).length,
    notasAlDia: docentes.filter(d => d.notasIngresadas >= d.notasTotales && d.notasTotales > 0).length,
    documentacionCompleta: docentes.filter(
      d => d.cvActualizado && d.certificadoTitulo && d.certificadoAntecedentes && d.certificadoInhabilidad
    ).length
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    );
  };

  const getNotasBadge = (ingresadas: number, totales: number) => {
    if (totales <= 0) {
      return <Badge variant="outline" className="text-gray-600">Sin cursos</Badge>;
    }
    const pct = Math.round((ingresadas / totales) * 100);
    let cls = 'border-green-600 bg-green-50 text-green-700';
    if (ingresadas === 0) cls = 'border-red-500 bg-red-50 text-red-700';
    else if (ingresadas < totales) cls = 'border-orange-500 bg-orange-50 text-orange-700';
    return (
      <div className="flex flex-col items-center gap-0.5">
        <Badge variant="outline" className={`${cls} font-semibold`}>{ingresadas} / {totales}</Badge>
        <span className="text-[10px] text-gray-500">{pct}%</span>
      </div>
    );
  };

  const getGuiaAprendizajeBadge = (estado: 'Validado' | 'Pendiente' | 'Sin Guía') => {
    if (estado === 'Validado') {
      return (
        <Badge variant="default" className="gap-1 bg-green-600">
          <FileCheck className="h-3 w-3" />
          Validado
        </Badge>
      );
    } else if (estado === 'Pendiente') {
      return (
        <Badge variant="outline" className="gap-1 border-yellow-600 text-yellow-700">
          <Clock className="h-3 w-3" />
          Pendiente
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive" className="gap-1">
          <FileX className="h-3 w-3" />
          Sin Guía
        </Badge>
      );
    }
  };

  const getEstadoValidacionBadge = (estado: EstadoValidacion) => {
    if (estado === 'Validado') {
      return <Badge variant="default" className="text-xs bg-green-600">Validado</Badge>;
    } else if (estado === 'Por Revisar') {
      return <Badge variant="outline" className="text-xs border-yellow-600 text-yellow-700">Por Revisar</Badge>;
    } else {
      return <Badge variant="destructive" className="text-xs">Inexistente</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión Académica (GA)</h1>
        <p className="mt-2 text-gray-600">
          Monitoreo del cumplimiento académico y plataformas educativas
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Docentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.totalDocentes}</div>
            <p className="text-xs text-gray-600">Docentes activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Contenido Blackboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estadisticas.contenidoCompleto}/{estadisticas.totalDocentes}
            </div>
            <p className="text-xs text-gray-600">
              {Math.round((estadisticas.contenidoCompleto / estadisticas.totalDocentes) * 100)}% completado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Notas al Día</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estadisticas.notasAlDia}/{estadisticas.totalDocentes}
            </div>
            <p className="text-xs text-gray-600">
              {Math.round((estadisticas.notasAlDia / estadisticas.totalDocentes) * 100)}% al día
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Documentación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estadisticas.documentacionCompleta}/{estadisticas.totalDocentes}
            </div>
            <p className="text-xs text-gray-600">
              {Math.round((estadisticas.documentacionCompleta / estadisticas.totalDocentes) * 100)}% completa
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Reporte */}
      <Card>
        <CardHeader>
          <CardTitle>Reporte por Docente</CardTitle>
          <CardDescription>
            Estado de cumplimiento de plataformas académicas y notas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Docente</TableHead>
                  <TableHead>RUT</TableHead>
                  <TableHead className="text-center">Contenido Blackboard</TableHead>
                  <TableHead className="text-center">Notas al Día</TableHead>
                  <TableHead className="text-center">Guía Aprendizaje</TableHead>
                  <TableHead className="text-center">CV Actualizado</TableHead>
                  <TableHead className="text-center">Cert. Título</TableHead>
                  <TableHead className="text-center">Cert. Antecedentes</TableHead>
                  <TableHead className="text-center">Cert. Inhabilidad</TableHead>
                  <TableHead className="text-center">Capacitaciones</TableHead>
                  <TableHead>Estado General</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {docentes.map((docente) => {
                  const notasAlDia = docente.notasTotales > 0 && docente.notasIngresadas >= docente.notasTotales;
                  const cumplimientoCompleto =
                    docente.contenidoSubido &&
                    notasAlDia &&
                    docente.cvActualizado === 'Validado' &&
                    docente.certificadoTitulo === 'Validado' &&
                    docente.certificadoAntecedentes === 'Validado' &&
                    docente.certificadoInhabilidad === 'Validado';

                  return (
                    <TableRow key={docente.id}>
                      <TableCell className="font-medium">{docente.nombreCompleto}</TableCell>
                      <TableCell className="font-mono text-sm">{docente.rut}</TableCell>
                      <TableCell className="text-center">
                        {getStatusIcon(docente.contenidoSubido)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getNotasBadge(docente.notasIngresadas, docente.notasTotales)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getGuiaAprendizajeBadge(docente.guiaAprendizaje)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getEstadoValidacionBadge(docente.cvActualizado)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getEstadoValidacionBadge(docente.certificadoTitulo)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getEstadoValidacionBadge(docente.certificadoAntecedentes)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getEstadoValidacionBadge(docente.certificadoInhabilidad)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{docente.capacitaciones}</Badge>
                      </TableCell>
                      <TableCell>
                        {cumplimientoCompleto ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Completo
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Pendiente
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/academico/validar-docente/${docente.id}`)}
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Validar
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Alertas */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas y Acciones Requeridas</CardTitle>
          <CardDescription>Docentes que requieren atención</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {docentes
              .filter(d => !d.contenidoSubido || d.notasIngresadas < d.notasTotales)
              .map((docente) => (
                
                <div key={docente.id} className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div className="flex-1">
                    <h4 className="font-medium">{docente.nombreCompleto}</h4>
                    <ul className="mt-1 space-y-1 text-sm text-gray-700">
                      {!docente.contenidoSubido && (
                        <li>• Pendiente: Subir contenido a plataformas académicas</li>
                      )}
                      {docente.notasIngresadas < docente.notasTotales && (
                        <li>• Pendiente: registrar notas ({docente.notasIngresadas}/{docente.notasTotales})</li>
                      )}
                    </ul>
                  </div>
                </div>
              ))}
            
            {docentes.filter(d => !d.contenidoSubido || d.notasIngresadas < d.notasTotales).length === 0 && (
              <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Todos los docentes están al día con sus responsabilidades académicas</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
