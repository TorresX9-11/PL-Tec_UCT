import { useState, useEffect } from 'react';
import { Search, Eye, User, FileText, Award, Shield, Receipt, BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { getDocentesPorCarrera, getGruposPorCarrera, type DocenteAcademico, type GrupoAcademico } from '../../data/academico';
import { toast } from 'sonner';

export function PlataformaDocentes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocente, setSelectedDocente] = useState<number | null>(null);
  const [docentes, setDocentes] = useState<DocenteAcademico[]>([]);
  const [grupos, setGrupos] = useState<GrupoAcademico[]>([]);
  const [loading, setLoading] = useState(true);

  const carreraFiltradaId = sessionStorage.getItem('coordinadorCarreraId') || sessionStorage.getItem('supervisandoCarreraId') || '';

  useEffect(() => {
    async function loadData() {
      if (!carreraFiltradaId) {
        setLoading(false);
        return;
      }
      try {
        const [docs, grps] = await Promise.all([
          getDocentesPorCarrera(carreraFiltradaId),
          getGruposPorCarrera(carreraFiltradaId)
        ]);
        setDocentes(docs);
        setGrupos(grps);
      } catch (err) {
        toast.error('No se pudieron cargar los docentes.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [carreraFiltradaId]);

  const filteredDocentes = docentes.filter(d =>
    d.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.rut_docente.toString().includes(searchTerm)
  );

  const currentDocente = selectedDocente ? docentes.find(d => d.rut_docente === selectedDocente) : null;

  const estadisticas = {
    totalDocentes: docentes.length,
    documentacionCompleta: docentes.filter(
      d => d.estado_titulo === 'Validado' && 
           d.estado_antecedentes === 'Validado' && 
           d.estado_inhabilidad === 'Validado'
    ).length,
    cvActualizados: docentes.filter(d => d.estado_cv === 'Validado').length,
    promedioCapacitaciones: docentes.length > 0 
      ? Math.round(docentes.reduce((sum, d) => sum + d.capacitaciones, 0) / docentes.length)
      : 0
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Docentes</h1>
        <p className="mt-2 text-gray-600">
          Administre el personal docente y su documentación
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
            <p className="text-xs text-gray-600">Docentes registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Documentación Completa</CardTitle>
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

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">CV Actualizados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estadisticas.cvActualizados}/{estadisticas.totalDocentes}
            </div>
            <p className="text-xs text-gray-600">
              {Math.round((estadisticas.cvActualizados / estadisticas.totalDocentes) * 100)}% al día
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Capacitaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.promedioCapacitaciones}</div>
            <p className="text-xs text-gray-600">Promedio por docente</p>
          </CardContent>
        </Card>
      </div>

      {/* Listado de Docentes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Listado de Docentes</CardTitle>
              <CardDescription>Visualice y gestione los perfiles docentes</CardDescription>
            </div>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar por nombre o RUT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Docente</TableHead>
                  <TableHead>RUT</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Ramos Asignados</TableHead>
                  <TableHead className="text-center">CV</TableHead>
                  <TableHead className="text-center">Certificados</TableHead>
                  <TableHead className="text-center">Capacitaciones</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocentes.map((docente) => {
                  const certificadosCompletos =
                    docente.estado_titulo === 'Validado' &&
                    docente.estado_antecedentes === 'Validado' &&
                    docente.estado_inhabilidad === 'Validado';

                  // Filtrar grupos que pertenezcan a este docente
                  const ramos = grupos.filter(g => g.rut_docente === docente.rut_docente);

                  return (
                    <TableRow key={docente.rut_docente}>
                      <TableCell className="font-medium">{docente.nombre}</TableCell>
                      <TableCell className="font-mono text-sm">{docente.rut_docente}-{docente.dv}</TableCell>
                      <TableCell className="text-sm">{docente.correo_usuario}</TableCell>
                      <TableCell>
                        {ramos.length === 0 ? (
                          <span className="text-xs italic text-gray-400">Sin ramos asignados</span>
                        ) : (
                          <ul className="space-y-1">
                            {ramos.map((g) => (
                              <li key={g.id_grupo} className="flex items-start gap-1.5 text-xs">
                                <BookOpen className="mt-0.5 h-3 w-3 shrink-0 text-green-600" />
                                <span>
                                  <span className="font-mono font-medium">{g.id_curso}</span>
                                  <span className="ml-1 text-gray-500">· Sec {g.seccion}</span>
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {docente.estado_cv === 'Validado' ? (
                          <Badge variant="default" className="text-xs">Al día</Badge>
                        ) : docente.estado_cv === 'Por Revisar' ? (
                          <Badge variant="outline" className="text-xs border-yellow-600 text-yellow-700">Por Revisar</Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">Pendiente</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {certificadosCompletos ? (
                          <Badge variant="default" className="text-xs">Completos</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">Incompletos</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{docente.capacitaciones}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedDocente(docente.rut_docente)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Ver detalles</span>
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

      {/* Dialog de Perfil del Docente */}
      <Dialog open={selectedDocente !== null} onOpenChange={() => setSelectedDocente(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {currentDocente && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-green-600" />
                  {currentDocente.nombre}
                </DialogTitle>
                <DialogDescription>
                  RUT: {currentDocente.rut_docente}-{currentDocente.dv} | {currentDocente.correo_usuario}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="perfil" className="mt-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="perfil">
                    <User className="mr-2 h-4 w-4" />
                    Perfil y CV
                  </TabsTrigger>
                  <TabsTrigger value="certificados">
                    <Shield className="mr-2 h-4 w-4" />
                    Certificados
                  </TabsTrigger>
                  <TabsTrigger value="capacitaciones">
                    <Award className="mr-2 h-4 w-4" />
                    Capacitaciones
                  </TabsTrigger>
                </TabsList>

                {/* Perfil y CV */}
                <TabsContent value="perfil" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Currículum Vitae</CardTitle>
                      <CardDescription>
                        Estado: {currentDocente.estado_cv === 'Validado' ? (
                          <Badge variant="default" className="ml-2">Al Día</Badge>
                        ) : currentDocente.estado_cv === 'Por Revisar' ? (
                          <Badge variant="outline" className="ml-2 border-yellow-600 text-yellow-700">Por Revisar</Badge>
                        ) : (
                          <Badge variant="destructive" className="ml-2">Pendiente</Badge>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg bg-gray-50">
                        <FileText className="h-10 w-10 text-gray-400 mb-2" />
                        <h4 className="text-sm font-medium text-gray-900 mb-1">Curriculum Vitae</h4>
                        {currentDocente.estado_cv === 'Inexistente' ? (
                          <p className="text-xs text-gray-500">El docente aún no ha subido su CV.</p>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => window.open(`http://localhost:3001/api/v1/archivos/docente_${currentDocente.rut_docente}_cv.pdf`, '_blank')}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Ver PDF
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Certificados */}
                <TabsContent value="certificados" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Certificado de Título</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          {currentDocente.estado_titulo === 'Validado' ? (
                            <>
                              <FileText className="h-4 w-4 text-green-600" />
                              <span className="text-sm">certificado_titulo.pdf</span>
                              <Badge variant="default" className="ml-auto text-xs bg-green-600">Validado</Badge>
                            </>
                          ) : currentDocente.estado_titulo === 'Por Revisar' ? (
                            <>
                              <FileText className="h-4 w-4 text-yellow-600" />
                              <span className="text-sm">certificado_titulo.pdf</span>
                              <Badge variant="outline" className="ml-auto text-xs border-yellow-600 text-yellow-700">Por Revisar</Badge>
                            </>
                          ) : (
                            <Badge variant="destructive" className="text-xs">Inexistente</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Certificado de Antecedentes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          {currentDocente.estado_antecedentes === 'Validado' ? (
                            <>
                              <FileText className="h-4 w-4 text-green-600" />
                              <span className="text-sm">certificado_antecedentes.pdf</span>
                              <Badge variant="default" className="ml-auto text-xs bg-green-600">Validado</Badge>
                            </>
                          ) : currentDocente.estado_antecedentes === 'Por Revisar' ? (
                            <>
                              <FileText className="h-4 w-4 text-yellow-600" />
                              <span className="text-sm">certificado_antecedentes.pdf</span>
                              <Badge variant="outline" className="ml-auto text-xs border-yellow-600 text-yellow-700">Por Revisar</Badge>
                            </>
                          ) : (
                            <Badge variant="destructive" className="text-xs">Inexistente</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Certificado de Inhabilidad</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          {currentDocente.estado_inhabilidad === 'Validado' ? (
                            <>
                              <FileText className="h-4 w-4 text-green-600" />
                              <span className="text-sm">certificado_inhabilidad.pdf</span>
                              <Badge variant="default" className="ml-auto text-xs bg-green-600">Validado</Badge>
                            </>
                          ) : currentDocente.estado_inhabilidad === 'Por Revisar' ? (
                            <>
                              <FileText className="h-4 w-4 text-yellow-600" />
                              <span className="text-sm">certificado_inhabilidad.pdf</span>
                              <Badge variant="outline" className="ml-auto text-xs border-yellow-600 text-yellow-700">Por Revisar</Badge>
                            </>
                          ) : (
                            <Badge variant="destructive" className="text-xs">Inexistente</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Carnet de Identidad</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          {currentDocente.carnetIdentidad === 'Validado' ? (
                            <>
                              <FileText className="h-4 w-4 text-green-600" />
                              <span className="text-sm">carnet_identidad.pdf</span>
                              <Badge variant="default" className="ml-auto text-xs bg-green-600">Validado</Badge>
                            </>
                          ) : currentDocente.carnetIdentidad === 'Por Revisar' ? (
                            <>
                              <FileText className="h-4 w-4 text-yellow-600" />
                              <span className="text-sm">carnet_identidad.pdf</span>
                              <Badge variant="outline" className="ml-auto text-xs border-yellow-600 text-yellow-700">Por Revisar</Badge>
                            </>
                          ) : (
                            <Badge variant="destructive" className="text-xs">Inexistente</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Capacitaciones */}
                <TabsContent value="capacitaciones" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Capacitaciones Registradas ({currentDocente.capacitaciones})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
                        <Award className="h-5 w-5 text-green-600" />
                        <div className="flex-1">
                          <h4 className="font-medium">Metodologías Activas de Aprendizaje</h4>
                          <p className="text-sm text-green-700">UCT - 40 horas | Marzo 2026</p>
                          <Badge variant="outline" className="mt-2 text-xs border-green-600 text-green-700">Completado</Badge>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
                        <Award className="h-5 w-5 text-green-600" />
                        <div className="flex-1">
                          <h4 className="font-medium">Evaluación por Competencias</h4>
                          <p className="text-sm text-green-700">UCT - 30 horas | Enero 2026</p>
                          <Badge variant="outline" className="mt-2 text-xs border-green-600 text-green-700">Completado</Badge>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                        <Award className="h-5 w-5 text-blue-600" />
                        <div className="flex-1">
                          <h4 className="font-medium">Tecnologías Educativas Digitales</h4>
                          <p className="text-sm text-blue-700">MINEDUC - 60 horas | Noviembre 2025</p>
                          <Badge variant="outline" className="mt-2 text-xs border-blue-600 text-blue-700">Completado</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>


              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
