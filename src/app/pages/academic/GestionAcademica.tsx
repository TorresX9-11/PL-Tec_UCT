import { useState, useEffect, useMemo } from 'react';
import { CheckCircle, AlertCircle, BookOpen, User, FileCheck, ArrowRight, Search, FilterX } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '../../components/ui/accordion';
import {
  getDocentesPorCarrera,
  getGruposPorCarrera,
  type DocenteAcademico,
  type GrupoAcademico
} from '../../data/academico';
import { listArchivos, type Archivo } from '../../data/archivos';

type EstadoValidacion = 'Validado' | 'Por Revisar' | 'Inexistente';

// ────────────────────────────────────────────────────────────────────────────
// Helpers de presentación (badges)
// ────────────────────────────────────────────────────────────────────────────
function badgeEstado(estado?: EstadoValidacion) {
  if (estado === 'Validado') {
    return <Badge variant="default" className="gap-1 bg-green-600 text-xs"><CheckCircle className="h-3 w-3" />Validado</Badge>;
  }
  if (estado === 'Por Revisar') {
    return <Badge variant="outline" className="gap-1 border-yellow-600 text-yellow-700 text-xs">Por Revisar</Badge>;
  }
  return <Badge variant="destructive" className="text-xs">Inexistente</Badge>;
}

// Eliminamos badgeNotas porque ahora usamos badgeEstado para las notas

export function GestionAcademica() {
  const navigate = useNavigate();
  
  const coordinadorCarreraIdStr = sessionStorage.getItem('coordinadorCarreraId') || sessionStorage.getItem('supervisandoCarreraId') || '';
  const isReadOnly = !!sessionStorage.getItem('modoSupervision');

  const [docentes, setDocentes] = useState<DocenteAcademico[]>([]);
  const [grupos, setGrupos] = useState<GrupoAcademico[]>([]);
  const [archivosDb, setArchivosDb] = useState<Archivo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!coordinadorCarreraIdStr) return;
      try {
        const [d, g, a] = await Promise.all([
          getDocentesPorCarrera(coordinadorCarreraIdStr),
          getGruposPorCarrera(coordinadorCarreraIdStr),
          listArchivos()
        ]);
        setDocentes(d);
        setGrupos(g);
        setArchivosDb(a);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [coordinadorCarreraIdStr]);

  // ─── Stats agregadas a nivel SECCIÓN ─────────────
  const stats = useMemo(() => {
    const totalSec = grupos.length;
    const blackboardOK = grupos.filter(s => s.contenido_blackboard === 'Validado').length;
    const notasOK = grupos.filter(s => s.notas_estado === 'Validado').length;
    const guiaOK = grupos.filter(s => s.guia_aprendizaje === 'Validado').length;
    
    const docsCompletos = docentes.filter(d => {
      const dArchivos = archivosDb.filter(a => a.correoUsuario === d.correo_usuario);
      const cvExists = dArchivos.some(a => a.ruta.includes('_cv.pdf'));
      const tituloExists = dArchivos.some(a => a.ruta.includes('_cert_titulo.pdf'));
      const antecedentesExists = dArchivos.some(a => a.ruta.includes('_cert_antecedentes.pdf'));
      const inhabilidadExists = dArchivos.some(a => a.ruta.includes('_cert_inhabilidad.pdf'));

      return (
        (cvExists ? d.estado_cv : 'Inexistente') === 'Validado' &&
        (tituloExists ? d.estado_titulo : 'Inexistente') === 'Validado' &&
        (antecedentesExists ? d.estado_antecedentes : 'Inexistente') === 'Validado' &&
        (inhabilidadExists ? d.estado_inhabilidad : 'Inexistente') === 'Validado'
      );
    }).length;
    
    return { totalDocentes: docentes.length, totalSec, blackboardOK, notasOK, guiaOK, docsCompletos };
  }, [docentes, grupos, archivosDb]);

  // Construye el array de docs personales del docente (orden estable)
  const docsPersonales = (d: DocenteAcademico) => {
    const dArchivos = archivosDb.filter(a => a.correoUsuario === d.correo_usuario);
    const cvExists = dArchivos.some(a => a.ruta.includes('_cv.pdf'));
    const tituloExists = dArchivos.some(a => a.ruta.includes('_cert_titulo.pdf'));
    const antecedentesExists = dArchivos.some(a => a.ruta.includes('_cert_antecedentes.pdf'));
    const inhabilidadExists = dArchivos.some(a => a.ruta.includes('_cert_inhabilidad.pdf'));

    return [
      { label: 'CV Actualizado', estado: cvExists ? d.estado_cv : 'Inexistente' },
      { label: 'Cert. Título', estado: tituloExists ? d.estado_titulo : 'Inexistente' },
      { label: 'Cert. Antecedentes', estado: antecedentesExists ? d.estado_antecedentes : 'Inexistente' },
      { label: 'Cert. Inhabilidad', estado: inhabilidadExists ? d.estado_inhabilidad : 'Inexistente' }
    ];
  };

  const irValidarAcademicos = (rutDocente: number, seccionId: number) =>
    navigate(`/academico/validar-docente/${rutDocente}?tipo=academico&seccion=${seccionId}`);

  const irValidarPersonales = (rutDocente: number) =>
    navigate(`/academico/validar-docente/${rutDocente}?tipo=personal`);

  // ─── Filtros ───────────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState('');
  const [asignaturaId, setAsignaturaId] = useState<string>('all');

  // Opciones de select: todas las asignaturas únicas de los grupos actuales
  const asignaturasOptions = useMemo(() => {
    const map = new Map<string, { id_curso: string, nombre_curso: string }>();
    grupos.forEach(g => {
      if (!map.has(g.id_curso)) {
        map.set(g.id_curso, { id_curso: g.id_curso, nombre_curso: g.nombre_curso });
      }
    });
    return Array.from(map.values());
  }, [grupos]);

  // Listado filtrado (AND de los 3 criterios)
  const filteredDocentes = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    
    return docentes.filter(d => {
      // Búsqueda por nombre o RUT
      if (search) {
        const nombre = d.nombre.toLowerCase();
        const rut = String(d.rut_docente).toLowerCase();
        if (!nombre.includes(search) && !rut.includes(search)) return false;
      }
      // Filtro por asignatura
      if (asignaturaId !== 'all') {
        const dGrupos = grupos.filter(g => g.rut_docente === d.rut_docente);
        if (dGrupos.length === 0) return false;
        const hasMatch = dGrupos.some(g => g.id_curso === asignaturaId);
        if (!hasMatch) return false;
      }
      return true;
    });
  }, [docentes, grupos, searchTerm, asignaturaId]);

  const filtrosActivos = searchTerm.trim() !== '' || asignaturaId !== 'all';
  const limpiarFiltros = () => { setSearchTerm(''); setAsignaturaId('all'); };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando...</div>;

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
            <div className="text-2xl font-bold">{stats.totalDocentes}</div>
            <p className="text-xs text-gray-600">{stats.totalSec} secciones asignadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Contenido Blackboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.blackboardOK}/{stats.totalSec}</div>
            <p className="text-xs text-gray-600">
              {stats.totalSec > 0 ? Math.round((stats.blackboardOK / stats.totalSec) * 100) : 0}% de secciones validadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Notas al Día</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.notasOK}/{stats.totalSec}</div>
            <p className="text-xs text-gray-600">
              {stats.totalSec > 0 ? Math.round((stats.notasOK / stats.totalSec) * 100) : 0}% de secciones completas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Documentación Personal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.docsCompletos}/{stats.totalDocentes}</div>
            <p className="text-xs text-gray-600">
              {stats.totalDocentes > 0 ? Math.round((stats.docsCompletos / stats.totalDocentes) * 100) : 0}% de docentes al día
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Reporte por Docente */}
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <CardTitle>Reporte por Docente</CardTitle>
              <CardDescription>
                Presione un docente para desplegar sus ramos y archivos.
                Validación académica <strong>por ramo</strong> y personal <strong>por docente</strong>.
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              {filteredDocentes.length} de {docentes.length} docentes
            </Badge>
          </div>

          {/* Barra de filtros */}
          <div className="grid gap-3 md:grid-cols-12">
            <div className="md:col-span-7 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar por nombre o RUT..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="md:col-span-4">
              <Select
                value={asignaturaId}
                onValueChange={(v: string) => setAsignaturaId(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas las asignaturas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las asignaturas</SelectItem>
                  {asignaturasOptions.map(a => (
                    <SelectItem key={a.id_curso} value={a.id_curso}>
                      <span className="font-mono">{a.id_curso}</span> · {a.nombre_curso}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-1 flex">
              <Button
                variant="outline"
                size="default"
                onClick={limpiarFiltros}
                disabled={!filtrosActivos}
                className="w-full"
                title="Limpiar filtros"
              >
                <FilterX className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredDocentes.length === 0 ? (
            <div className="py-12 text-center">
              <Search className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-3 text-sm text-gray-600">
                Ningún docente coincide con los filtros aplicados.
              </p>
              {filtrosActivos && (
                <Button variant="outline" size="sm" className="mt-4" onClick={limpiarFiltros}>
                  <FilterX className="mr-2 h-4 w-4" />
                  Limpiar filtros
                </Button>
              )}
            </div>
          ) : (
          <Accordion type="multiple" className="w-full space-y-3">
          {filteredDocentes.map(docente => {
            const ramos = grupos.filter(g => g.rut_docente === docente.rut_docente);
            const personales = docsPersonales(docente);
            const personalesCompletos = personales.every(p => p.estado === 'Validado');
            const academicosCompletos = ramos.length > 0 && ramos.every(seccion =>
              seccion.contenido_blackboard === 'Validado' &&
              seccion.notas_estado === 'Validado' &&
              seccion.guia_aprendizaje === 'Validado'
            );
            const todoCompleto = personalesCompletos && academicosCompletos && ramos.length > 0;

            return (
              <AccordionItem
                key={docente.rut_docente}
                value={`docente-${docente.rut_docente}`}
                className="rounded-lg border bg-white overflow-hidden"
              >
                <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 hover:no-underline data-[state=open]:bg-gray-50 data-[state=open]:border-b">
                  <div className="flex flex-1 flex-wrap items-center justify-between gap-3 pr-3">
                    <div className="flex items-center gap-3 text-left">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                        <User className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{docente.nombre}</h3>
                        <p className="text-xs text-gray-500 font-normal">
                          <span className="font-mono">{docente.rut_docente}-{docente.dv}</span>
                          <span className="mx-1.5">·</span>
                          {ramos.length === 0
                            ? 'Sin ramos asignados'
                            : `${ramos.length} ${ramos.length === 1 ? 'ramo' : 'ramos'}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {todoCompleto ? (
                        <Badge variant="default" className="gap-1 bg-green-600 text-xs">
                          <CheckCircle className="h-3 w-3" /> Completo
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1 text-xs">
                          <AlertCircle className="h-3 w-3" /> Pendiente
                        </Badge>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="pb-0">
                  <div className="border-b p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-green-600" />
                    <h4 className="text-sm font-semibold">Archivos Académicos (por ramo)</h4>
                  </div>

                  {ramos.length === 0 ? (
                    <p className="text-xs italic text-gray-400">Este docente no tiene ramos asignados este semestre.</p>
                  ) : ramos.length === 1 ? (
                    <RamoBloque
                      sigla={ramos[0].id_curso}
                      nombre={ramos[0].nombre_curso}
                      seccionNum={ramos[0].seccion}
                      contenido={ramos[0].contenido_blackboard}
                      notasEstado={ramos[0].notas_estado}
                      guia={ramos[0].guia_aprendizaje}
                      onValidar={() => irValidarAcademicos(docente.rut_docente, ramos[0].id_grupo)}
                      readOnly={isReadOnly}
                    />
                  ) : (
                    <Accordion type="multiple" className="w-full">
                      {ramos.map((seccion) => {
                        const ramoCompleto =
                          seccion.contenido_blackboard === 'Validado' &&
                          seccion.notas_estado === 'Validado' &&
                          seccion.guia_aprendizaje === 'Validado';

                        return (
                          <AccordionItem key={seccion.id_grupo} value={`ramo-${seccion.id_grupo}`} className="border rounded-md mb-2 px-3">
                            <AccordionTrigger className="py-3 hover:no-underline">
                              <div className="flex flex-1 items-center justify-between pr-3 text-sm">
                                <span className="flex items-center gap-2">
                                  <BookOpen className="h-4 w-4 text-green-600" />
                                  <span className="font-mono font-semibold">{seccion.id_curso}</span>
                                  <span className="text-gray-700">{seccion.nombre_curso}</span>
                                  <span className="text-gray-500">· Sec {seccion.seccion}</span>
                                </span>
                                {ramoCompleto ? (
                                  <Badge variant="default" className="gap-1 bg-green-600 text-xs">
                                    <FileCheck className="h-3 w-3" /> OK
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="border-yellow-600 text-yellow-700 text-xs">
                                    Pendiente
                                  </Badge>
                                )}
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2">
                              <RamoBloque
                                sigla={seccion.id_curso}
                                nombre={seccion.nombre_curso}
                                seccionNum={seccion.seccion}
                                contenido={seccion.contenido_blackboard}
                                notasEstado={seccion.notas_estado}
                                guia={seccion.guia_aprendizaje}
                                onValidar={() => irValidarAcademicos(docente.rut_docente, seccion.id_grupo)}
                                hideHeader
                                readOnly={isReadOnly}
                              />
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  )}
                </div>

                <div className="p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <h4 className="text-sm font-semibold">Archivos Personales (una vez por docente)</h4>
                    </div>
                    <Button
                      size="sm"
                      variant={isReadOnly || personalesCompletos ? 'outline' : 'default'}
                      onClick={() => irValidarPersonales(docente.rut_docente)}
                      className={isReadOnly || personalesCompletos ? '' : 'bg-blue-600 hover:bg-blue-700'}
                    >
                      <FileCheck className="mr-1.5 h-4 w-4" />
                      {isReadOnly ? 'Ver detalle' : 'Validar archivos personales'}
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="grid gap-2 md:grid-cols-4">
                    {personales.map(doc => (
                      <div key={doc.label} className="flex flex-col gap-1 rounded-md border bg-gray-50 p-2">
                        <span className="text-[11px] text-gray-600">{doc.label}</span>
                        {badgeEstado(doc.estado)}
                      </div>
                    ))}
                  </div>
                </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
          </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Subcomponente: bloque de validaciones de UN ramo (3 docs + botón)
// ────────────────────────────────────────────────────────────────────────────
function RamoBloque(props: {
  sigla: string;
  nombre: string;
  seccionNum: number;
  contenido?: EstadoValidacion;
  notasEstado?: EstadoValidacion;
  guia?: EstadoValidacion;
  onValidar: () => void;
  hideHeader?: boolean;
  readOnly?: boolean;
}) {
  return (
    <div className="space-y-3 pb-3">
      {!props.hideHeader && (
        <div className="flex items-center gap-2 text-sm">
          <BookOpen className="h-4 w-4 text-green-600" />
          <span className="font-mono font-semibold">{props.sigla}</span>
          <span className="text-gray-700">{props.nombre}</span>
          <span className="text-gray-500">· Sec {props.seccionNum}</span>
        </div>
      )}
      <div className="grid gap-2 md:grid-cols-3">
        <div className="flex flex-col gap-1 rounded-md border bg-gray-50 p-2">
          <span className="text-[11px] text-gray-600">Contenido Blackboard</span>
          {badgeEstado(props.contenido)}
        </div>
        <div className="flex flex-col gap-1 rounded-md border bg-gray-50 p-2">
          <span className="text-[11px] text-gray-600">Notas al Día</span>
          {badgeEstado(props.notasEstado)}
        </div>
        <div className="flex flex-col gap-1 rounded-md border bg-gray-50 p-2">
          <span className="text-[11px] text-gray-600">Guía de Aprendizaje</span>
          {badgeEstado(props.guia)}
        </div>
      </div>
      {!props.readOnly && (
        <div className="flex justify-end">
          <Button size="sm" onClick={props.onValidar} className="bg-green-600 hover:bg-green-700">
            <FileCheck className="mr-1.5 h-4 w-4" />
            Validar archivos académicos
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
