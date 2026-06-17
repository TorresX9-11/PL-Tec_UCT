import { useMemo, useState } from 'react';
import { CheckCircle, AlertCircle, BookOpen, User, FileCheck, ArrowRight, Search, FilterX } from 'lucide-react';
import { useNavigate } from 'react-router';
import {
  mockDocentesAcademicos,
  mockSeccionesAsignaturas,
  mockAsignaturas,
  getRamosDocente,
  getCarrerasByCoordinadorId,
  type EstadoValidacion,
  type DocenteAcademico
} from '../../data/mockData';
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

function badgeNotas(ingresadas?: number, totales?: number) {
  const ing = ingresadas ?? 0;
  const tot = totales ?? 0;
  if (tot <= 0) {
    return <Badge variant="outline" className="text-xs text-gray-600">Sin cursos</Badge>;
  }
  const pct = Math.round((ing / tot) * 100);
  let cls = 'border-green-600 bg-green-50 text-green-700';
  if (ing === 0) cls = 'border-red-500 bg-red-50 text-red-700';
  else if (ing < tot) cls = 'border-orange-500 bg-orange-50 text-orange-700';
  return (
    <div className="inline-flex items-center gap-1.5">
      <Badge variant="outline" className={`${cls} font-semibold text-xs`}>{ing} / {tot}</Badge>
      <span className="text-[10px] text-gray-500">{pct}%</span>
    </div>
  );
}

export function GestionAcademica() {
  const navigate = useNavigate();
  
  const coordinadorCarreraIdStr = sessionStorage.getItem('coordinadorCarreraId') || sessionStorage.getItem('supervisandoCarreraId');
  const carreraFiltradaId = coordinadorCarreraIdStr;

  // Modo supervisión: el supervisor solo visualiza, no valida
  const isReadOnly = !!sessionStorage.getItem('modoSupervision');

  const docentes = useMemo(() => {
    return mockDocentesAcademicos.filter(d => {
      if (!carreraFiltradaId) return true; // Mostrar todos si no hay filtro de carrera
      
      const ramos = getRamosDocente(d.id);
      return ramos.some(ramo => {
        if (!ramo.carrera) return false;
        const idsPermitidos = getCarrerasByCoordinadorId(carreraFiltradaId);
        return idsPermitidos.includes(ramo.carrera.id);
      });
    });
  }, [carreraFiltradaId]);

  // ─── Stats agregadas a nivel SECCIÓN (nueva fuente de verdad) ─────────────
  const stats = useMemo(() => {
    const seccionesAsignadas = mockSeccionesAsignaturas.filter(s => s.docenteId);
    const totalSec = seccionesAsignadas.length;
    const blackboardOK = seccionesAsignadas.filter(s => s.contenidoBlackboard === 'Validado').length;
    const notasOK = seccionesAsignadas.filter(s =>
      (s.notasTotales ?? 0) > 0 && (s.notasIngresadas ?? 0) >= (s.notasTotales ?? 0)
    ).length;
    const guiaOK = seccionesAsignadas.filter(s => s.guiaAprendizaje === 'Validado').length;
    const docsCompletos = docentes.filter(d =>
      d.cvActualizado === 'Validado' &&
      d.certificadoTitulo === 'Validado' &&
      d.certificadoAntecedentes === 'Validado' &&
      d.certificadoInhabilidad === 'Validado' &&
      d.carnetIdentidad === 'Validado'
    ).length;
    return { totalDocentes: docentes.length, totalSec, blackboardOK, notasOK, guiaOK, docsCompletos };
  }, [docentes]);

  // Construye el array de docs personales del docente (orden estable)
  const docsPersonales = (d: DocenteAcademico) => [
    { label: 'CV Actualizado', estado: d.cvActualizado },
    { label: 'Cert. Título', estado: d.certificadoTitulo },
    { label: 'Cert. Antecedentes', estado: d.certificadoAntecedentes },
    { label: 'Cert. Inhabilidad', estado: d.certificadoInhabilidad },
    { label: 'Carnet Identidad', estado: d.carnetIdentidad }
  ];

  const irValidarAcademicos = (docenteId: number, seccionId: number) =>
    navigate(`/academico/validar-docente/${docenteId}?tipo=academico&seccion=${seccionId}`);

  const irValidarPersonales = (docenteId: number) =>
    navigate(`/academico/validar-docente/${docenteId}?tipo=personal`);

  // ─── Filtros ───────────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState('');
  const [asignaturaId, setAsignaturaId] = useState<string>('all');

  // Opciones de select: todas las asignaturas con al menos un docente asignado
  const asignaturasOptions = useMemo(() => {
    const ids = new Set<number>();
    mockSeccionesAsignaturas.forEach(s => {
      if (!s.docenteId) return;
      const a = mockAsignaturas.find(x => x.id === s.asignaturaId);
      if (!a) return;
      ids.add(a.id);
    });
    return mockAsignaturas.filter(a => ids.has(a.id));
  }, []);

  // Listado filtrado (AND de los 3 criterios)
  const filteredDocentes = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    const asignaturaNum = asignaturaId === 'all' ? null : Number(asignaturaId);

    return docentes.filter(d => {
      // Búsqueda por nombre o RUT
      if (search) {
        const nombre = d.nombreCompleto.toLowerCase();
        const rut = d.rut.toLowerCase();
        if (!nombre.includes(search) && !rut.includes(search)) return false;
      }
      // Filtro por asignatura: requiere ramos del docente
      if (asignaturaNum !== null) {
        const ramos = getRamosDocente(d.id);
        if (ramos.length === 0) return false;
        const matches = ramos.some(({ asignatura }) => {
          if (!asignatura) return false;
          if (asignaturaNum !== null && asignatura.id !== asignaturaNum) return false;
          return true;
        });
        if (!matches) return false;
      }
      return true;
    });
  }, [docentes, searchTerm, asignaturaId]);

  const filtrosActivos = searchTerm.trim() !== '' || asignaturaId !== 'all';
  const limpiarFiltros = () => { setSearchTerm(''); setAsignaturaId('all'); };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión Académica (GA)</h1>
        <p className="mt-2 text-gray-600">
          Monitoreo del cumplimiento académico y plataformas educativas
        </p>
      </div>

      {/* Estadísticas (agregadas por sección) */}
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
                    <SelectItem key={a.id} value={String(a.id)}>
                      <span className="font-mono">{a.sigla}</span> · {a.nombre}
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
            const ramos = getRamosDocente(docente.id);
            const personales = docsPersonales(docente);
            const personalesCompletos = personales.every(p => p.estado === 'Validado');
            const academicosCompletos = ramos.length > 0 && ramos.every(({ seccion }) =>
              seccion.contenidoBlackboard === 'Validado' &&
              (seccion.notasTotales ?? 0) > 0 &&
              (seccion.notasIngresadas ?? 0) >= (seccion.notasTotales ?? 0) &&
              seccion.guiaAprendizaje === 'Validado'
            );
            const todoCompleto = personalesCompletos && academicosCompletos && ramos.length > 0;

            return (
              <AccordionItem
                key={docente.id}
                value={`docente-${docente.id}`}
                className="rounded-lg border bg-white overflow-hidden"
              >
                {/* Trigger del docente (vista colapsada) */}
                <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 hover:no-underline data-[state=open]:bg-gray-50 data-[state=open]:border-b">
                  <div className="flex flex-1 flex-wrap items-center justify-between gap-3 pr-3">
                    <div className="flex items-center gap-3 text-left">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                        <User className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{docente.nombreCompleto}</h3>
                        <p className="text-xs text-gray-500 font-normal">
                          <span className="font-mono">{docente.rut}</span>
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

                {/* Contenido expandido: académicos + personales */}
                <AccordionContent className="pb-0">
                  {/* Académicos por ramo */}
                  <div className="border-b p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-green-600" />
                    <h4 className="text-sm font-semibold">Archivos Académicos (por ramo)</h4>
                  </div>

                  {ramos.length === 0 ? (
                    <p className="text-xs italic text-gray-400">Este docente no tiene ramos asignados este semestre.</p>
                  ) : ramos.length === 1 ? (
                    // 1 ramo → render inline (sin acordeón)
                    <RamoBloque
                      sigla={ramos[0].asignatura?.sigla ?? '—'}
                      nombre={ramos[0].asignatura?.nombre ?? '—'}
                      seccionNum={ramos[0].seccion.seccion}
                      contenido={ramos[0].seccion.contenidoBlackboard}
                      notasIng={ramos[0].seccion.notasIngresadas}
                      notasTot={ramos[0].seccion.notasTotales}
                      guia={ramos[0].seccion.guiaAprendizaje}
                      onValidar={() => irValidarAcademicos(docente.id, ramos[0].seccion.id)}
                      readOnly={isReadOnly}
                    />
                  ) : (
                    // 2+ ramos → acordeón
                    <Accordion type="multiple" className="w-full">
                      {ramos.map(({ seccion, asignatura }) => {
                        const ramoCompleto =
                          seccion.contenidoBlackboard === 'Validado' &&
                          (seccion.notasTotales ?? 0) > 0 &&
                          (seccion.notasIngresadas ?? 0) >= (seccion.notasTotales ?? 0) &&
                          seccion.guiaAprendizaje === 'Validado';

                        return (
                          <AccordionItem key={seccion.id} value={`ramo-${seccion.id}`} className="border rounded-md mb-2 px-3">
                            <AccordionTrigger className="py-3 hover:no-underline">
                              <div className="flex flex-1 items-center justify-between pr-3 text-sm">
                                <span className="flex items-center gap-2">
                                  <BookOpen className="h-4 w-4 text-green-600" />
                                  <span className="font-mono font-semibold">{asignatura?.sigla ?? '—'}</span>
                                  <span className="text-gray-700">{asignatura?.nombre ?? '—'}</span>
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
                                sigla={asignatura?.sigla ?? '—'}
                                nombre={asignatura?.nombre ?? '—'}
                                seccionNum={seccion.seccion}
                                contenido={seccion.contenidoBlackboard}
                                notasIng={seccion.notasIngresadas}
                                notasTot={seccion.notasTotales}
                                guia={seccion.guiaAprendizaje}
                                onValidar={() => irValidarAcademicos(docente.id, seccion.id)}
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

                {/* Personales (una sola vez por docente) */}
                <div className="p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <h4 className="text-sm font-semibold">Archivos Personales (una vez por docente)</h4>
                    </div>
                    <Button
                      size="sm"
                      variant={isReadOnly || personalesCompletos ? 'outline' : 'default'}
                      onClick={() => irValidarPersonales(docente.id)}
                      className={isReadOnly || personalesCompletos ? '' : 'bg-blue-600 hover:bg-blue-700'}
                    >
                      <FileCheck className="mr-1.5 h-4 w-4" />
                      {isReadOnly ? 'Ver detalle' : 'Validar archivos personales'}
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="grid gap-2 md:grid-cols-5">
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
  notasIng?: number;
  notasTot?: number;
  guia?: EstadoValidacion;
  onValidar: () => void;
  hideHeader?: boolean;
  readOnly?: boolean;
}) {
  return (
    <div className="space-y-3">
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
          {badgeNotas(props.notasIng, props.notasTot)}
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
