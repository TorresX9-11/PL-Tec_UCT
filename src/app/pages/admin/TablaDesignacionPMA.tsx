import { useState, useEffect, Fragment } from 'react';
import { Search, ChevronDown, ChevronRight, UserPlus, Edit, Check, ChevronsUpDown, Split, Trash2, Download, FileText } from 'lucide-react';
import { getEstadoAsignatura, type SeccionAsignatura } from '../../data/mockData';
import { listGrupos, createGrupo, updateGrupo, deleteGrupo } from '../../data/grupos';
import { listCursos, type CursoAsignatura } from '../../data/cursos';
import { listCarreras, type Carrera } from '../../data/carreras';
import { listDocentes, type DocenteMaestro } from '../../data/docentes';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '../../components/ui/command';
import { Label } from '../../components/ui/label';
import { cn } from '../../components/ui/utils';
import { Tooltip, TooltipTrigger, TooltipContent } from '../../components/ui/tooltip';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function formatNombreSeccion(sec: { seccion: number; subGrupo?: string | null }) {
  if (sec.subGrupo) {
    const numGrupo = sec.subGrupo === 'A' ? 1 : 2;
    return `Grupo ${numGrupo} - S${sec.seccion}`;
  }
  return `Sección ${sec.seccion}`;
}

export function TablaDesignacionPMA() {
  const [secciones, setSecciones] = useState<SeccionAsignatura[]>([]);
  const [asignaturas, setAsignaturas] = useState<CursoAsignatura[]>([]);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [docentes, setDocentes] = useState<DocenteMaestro[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [carreraFilter, setCarreraFilter] = useState<string>('todas');
  const [expandedAsignaturas, setExpandedAsignaturas] = useState<Set<number>>(new Set());
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSeccion, setEditingSeccion] = useState<SeccionAsignatura | null>(null);
  const [tabSemestre, setTabSemestre] = useState<'1-3-5' | '2-4-5'>('1-3-5');

  const fetchData = async () => {
    try {
      const [resGrupos, resCursos, resCarreras, resDocentes] = await Promise.all([
        listGrupos(),
        listCursos(),
        listCarreras(),
        listDocentes()
      ]);
      setSecciones(resGrupos.data);
      setAsignaturas(resCursos.data);
      setCarreras(resCarreras.data);
      setDocentes(resDocentes.data);
    } catch (e) {
      toast.error('Error al cargar datos de designación');
    }
  };

  useEffect(() => {
    fetchData();
    const handler = () => fetchData();
    window.addEventListener('grupos:update', handler);
    return () => window.removeEventListener('grupos:update', handler);
  }, []);

  const semestresTab = tabSemestre === '1-3-5' ? [1, 3, 5] : [2, 4, 5];

  const filteredAsignaturas = asignaturas.filter((asig) => {
    const matchesSearch =
      asig.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asig.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asig.sigla.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCarrera = carreraFilter === 'todas' || asig.idCarrera === carreraFilter;
    return matchesSearch && matchesCarrera && semestresTab.includes(asig.semestre);
  });

  const getCarrera = (carreraIdStr: string) => {
    return carreras.find(c => c.codigo === carreraIdStr);
  };

  const getDocente = (docenteId?: number) => {
    if (!docenteId) return null;
    return docentes.find(d => d.id === docenteId);
  };

  const getSeccionesForAsignatura = (asignaturaId: number) => {
    return secciones.filter((s: SeccionAsignatura) => s.asignaturaId === asignaturaId);
  };

  const toggleExpanded = (asignaturaId: number) => {
    setExpandedAsignaturas((prev: Set<number>) => {
      const newSet = new Set(prev);
      if (newSet.has(asignaturaId)) {
        newSet.delete(asignaturaId);
      } else {
        newSet.add(asignaturaId);
      }
      return newSet;
    });
  };

  const handleAsignarDocente = (seccion: SeccionAsignatura) => {
    setEditingSeccion(seccion);
    setOpenDialog(true);
  };

  const handleCrearPrimeraSeccion = (asignaturaId: number) => {
    setEditingSeccion({
      id: -1,
      asignaturaId,
      seccion: 1,
      docenteId: undefined,
      horasP: 0,
      horasM: 0,
      horasA: 0
    });
    setOpenDialog(true);
  };

  const handleUpdateSeccion = async (updatedSeccion: SeccionAsignatura) => {
    try {
      const asig = asignaturas.find(a => a.id === updatedSeccion.asignaturaId);
      if (!asig) throw new Error("Asignatura no encontrada");
      const idCarrera = asig.idCarrera;

      if (updatedSeccion.id < 0) {
        await createGrupo({
          idCarrera,
          idCurso: asig.idCurso,
          seccion: updatedSeccion.seccion,
          subGrupo: updatedSeccion.subGrupo,
          docenteId: updatedSeccion.docenteId,
          horasP: updatedSeccion.horasP,
          horasM: updatedSeccion.horasM,
          horasA: updatedSeccion.horasA
        });
        toast.success('Sección creada y docente asignado');
      } else {
        await updateGrupo(updatedSeccion.id, {
          subGrupo: updatedSeccion.subGrupo,
          docenteId: updatedSeccion.docenteId,
          horasP: updatedSeccion.horasP,
          horasM: updatedSeccion.horasM,
          horasA: updatedSeccion.horasA
        });
        toast.success('Asignación actualizada exitosamente');
      }
      window.dispatchEvent(new Event('grupos:update'));
    } catch(e) {
      toast.error('Error al guardar sección');
    }
    setEditingSeccion(null);
    setOpenDialog(false);
  };

  const handleSplitSeccion = async (seccion: SeccionAsignatura) => {
    try {
      const asig = asignaturas.find(a => a.id === seccion.asignaturaId);
      if (!asig) throw new Error("Asignatura no encontrada");
      const idCarrera = asig.idCarrera;

      await updateGrupo(seccion.id, {
        subGrupo: 'A',
        docenteId: seccion.docenteId,
        horasP: seccion.horasP,
        horasM: seccion.horasM,
        horasA: seccion.horasA
      });

      await createGrupo({
        idCarrera,
        idCurso: asig.idCurso,
        seccion: seccion.seccion,
        subGrupo: 'B',
        docenteId: null,
        horasP: 0,
        horasM: 0,
        horasA: 0
      });

      window.dispatchEvent(new Event('grupos:update'));
      toast.success('Sección dividida en Grupo A y Grupo B');
    } catch(e) {
      toast.error('Error al dividir sección');
    }
  };

  const handleDeleteSeccion = async (id: number) => {
    if (confirm('¿Está seguro de eliminar esta sección/grupo?')) {
      try {
        const seccionEliminada = secciones.find(s => s.id === id);
        if (!seccionEliminada) return;

        await deleteGrupo(id);

        if (seccionEliminada.subGrupo) {
          const remaining = secciones.filter(
            s => s.asignaturaId === seccionEliminada.asignaturaId && s.seccion === seccionEliminada.seccion && s.id !== id
          );
          if (remaining.length === 1 && remaining[0].subGrupo === 'A') {
            await updateGrupo(remaining[0].id, {
              subGrupo: null,
              docenteId: remaining[0].docenteId,
              horasP: remaining[0].horasP,
              horasM: remaining[0].horasM,
              horasA: remaining[0].horasA
            });
          }
        }
        window.dispatchEvent(new Event('grupos:update'));
        toast.success('Sección eliminada exitosamente');
      } catch(e) {
        toast.error('Error al eliminar sección');
      }
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });

    doc.setFontSize(18);
    doc.text('Designación y PMA - TEC UCT', 14, 20);
    doc.setFontSize(11);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CL')}`, 14, 28);
    doc.text(`Total Asignaturas: ${filteredAsignaturas.length}`, 14, 34);

    const rows: (string | number)[][] = [];
    filteredAsignaturas.forEach((asig) => {
      const carrera = getCarrera(asig.idCarrera);
      const seccionesAsig = getSeccionesForAsignatura(asig.id);
      if (seccionesAsig.length === 0) {
        rows.push([
          asig.nombre,
          carrera?.nombre ?? '—',
          carrera?.jornada ?? '—',
          asig.sigla,
          '—',
          'Sin asignar',
          '—', '—',
          '—',
        ]);
      } else {
        seccionesAsig.forEach((sec: SeccionAsignatura) => {
          const d = getDocente(sec.docenteId);
          rows.push([
            asig.nombre,
            carrera?.nombre ?? '—',
            carrera?.jornada ?? '—',
            asig.sigla,
            formatNombreSeccion(sec),
            d?.nombreCompleto ?? 'Sin asignar',
            d ? `${d.rut}-${d.dv}` : '—',
            d?.nivelDocente ?? '—',
            `P:${sec.horasP} M:${sec.horasM} A:${sec.horasA}`,
          ]);
        });
      }
    });

    autoTable(doc, {
      head: [['Asignatura', 'Carrera', 'Jornada', 'Sigla', 'Sección/Grupo', 'Docente', 'RUT', 'Nivel', 'Horas PMA']],
      body: rows,
      startY: 40,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [37, 99, 235] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 40 },
    });

    doc.save(`designacion-pma-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('PDF generado exitosamente');
  };

  const totalSecciones = secciones.length;
  const seccionesAsignadas = secciones.filter((s: SeccionAsignatura) => s.docenteId).length;
  const seccionesSinAsignar = totalSecciones - seccionesAsignadas;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Designación y PMA</h2>
          <p className="mt-1 text-sm text-gray-600">
            Asignación de docentes por sección y gestión de horas PMA
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Secciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSecciones}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Secciones Asignadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{seccionesAsignadas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Sin Asignar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{seccionesSinAsignar}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, código o sigla..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={carreraFilter} onValueChange={setCarreraFilter}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Filtrar por carrera" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las carreras</SelectItem>
                {carreras.map((carrera) => (
                  <SelectItem key={carrera.codigo} value={carrera.codigo.toString()}>
                    {carrera.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Asignaturas y Asignaciones</CardTitle>
              <CardDescription>
                Mostrando {filteredAsignaturas.length} asignaturas
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <Download className="mr-2 h-4 w-4" />
              Descargar PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Asignatura</TableHead>
                  <TableHead>Carrera</TableHead>
                  <TableHead>Jornada</TableHead>
                  <TableHead>Periodo</TableHead>
                  <TableHead>Líneas</TableHead>
                  <TableHead>Sigla</TableHead>
                  <TableHead>Sección</TableHead>
                  <TableHead>Docente Asignado</TableHead>
                  <TableHead>RUT</TableHead>
                  <TableHead>DV</TableHead>
                  <TableHead>Nivel</TableHead>
                  <TableHead>PMA</TableHead>
                  <TableHead>Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAsignaturas.map((asignatura) => {
                  const carrera = getCarrera(asignatura.idCarrera);
                  const seccionesAsig = getSeccionesForAsignatura(asignatura.id);
                  const isExpanded = expandedAsignaturas.has(asignatura.id);
                  const hasMultipleSecciones = seccionesAsig.length > 1;

                  const primeraSeccion = seccionesAsig[0];
                  const docente = primeraSeccion ? getDocente(primeraSeccion.docenteId) : null;

                  const { total, tieneGrupos, seccionesSinGrupo } = getEstadoAsignatura(seccionesAsig);
                  const splitDeshabilitado =
                    tieneGrupos || seccionesSinGrupo.length > 1 || total === 0;
                  let tooltipSplit = 'Dividir sección en grupos';
                  if (tieneGrupos) tooltipSplit = 'Ya está dividida en grupos';
                  else if (seccionesSinGrupo.length > 1) tooltipSplit = 'No se puede dividir: existen 2 o más secciones';
                  else if (total === 0) tooltipSplit = 'Primero crea una sección';

                  return (
                    <Fragment key={asignatura.id}>
                      <TableRow>
                        <TableCell>
                          {hasMultipleSecciones && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpanded(asignatura.id)}
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{asignatura.nombre}</TableCell>
                        <TableCell className="max-w-[150px] truncate" title={carrera?.nombre}>
                          {carrera?.nombre}
                        </TableCell>
                        <TableCell>
                          <Badge variant={carrera?.jornada === 'Diurna' ? 'default' : 'secondary'}>
                            {carrera?.jornada}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {asignatura.semestre}° Sem {asignatura.año}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{seccionesAsig.length || 1}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{asignatura.sigla}</TableCell>
                        <TableCell>
                          {primeraSeccion ? formatNombreSeccion(primeraSeccion) : '-'}
                        </TableCell>
                        <TableCell>
                          {primeraSeccion ? (
                            docente ? (
                              <span className="font-medium">{docente.nombreCompleto}</span>
                            ) : (
                              <Badge variant="destructive">Sin asignar</Badge>
                            )
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {docente ? docente.rut : '-'}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {docente ? docente.dv : '-'}
                        </TableCell>
                        <TableCell>
                          {docente?.nivelDocente ? (
                            <Badge variant="outline">{docente.nivelDocente}</Badge>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {primeraSeccion ? (
                            <div className="text-xs">
                              <div>P: {primeraSeccion.horasP}h</div>
                              <div>M: {primeraSeccion.horasM}h</div>
                              <div>A: {primeraSeccion.horasA}h</div>
                            </div>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {primeraSeccion && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      disabled={splitDeshabilitado}
                                      onClick={() => handleSplitSeccion(primeraSeccion)}
                                    >
                                      <Split className="h-4 w-4" />
                                    </Button>
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>{tooltipSplit}</TooltipContent>
                              </Tooltip>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              title={
                                !primeraSeccion
                                  ? 'Crear sección y asignar docente'
                                  : docente
                                    ? 'Editar asignación'
                                    : 'Asignar docente'
                              }
                              onClick={() =>
                                primeraSeccion
                                  ? handleAsignarDocente(primeraSeccion)
                                  : handleCrearPrimeraSeccion(asignatura.id)
                              }
                            >
                              {docente ? <Edit className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {isExpanded && hasMultipleSecciones && seccionesAsig.slice(1).map((seccion: SeccionAsignatura) => {
                        const docenteSeccion = getDocente(seccion.docenteId);
                        return (
                          <TableRow key={seccion.id} className="bg-gray-50/50">
                            <TableCell></TableCell>
                            <TableCell className="text-gray-500">↳ {asignatura.nombre}</TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell>{formatNombreSeccion(seccion)}</TableCell>
                            <TableCell>
                              {docenteSeccion ? (
                                <span className="font-medium">{docenteSeccion.nombreCompleto}</span>
                              ) : (
                                <Badge variant="destructive">Sin asignar</Badge>
                              )}
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {docenteSeccion ? docenteSeccion.rut : '-'}
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {docenteSeccion ? docenteSeccion.dv : '-'}
                            </TableCell>
                            <TableCell>
                              {docenteSeccion?.nivelDocente ? (
                                <Badge variant="outline">{docenteSeccion.nivelDocente}</Badge>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="text-xs">
                                <div>P: {seccion.horasP}h</div>
                                <div>M: {seccion.horasM}h</div>
                                <div>A: {seccion.horasA}h</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        disabled={splitDeshabilitado}
                                        onClick={() => handleSplitSeccion(seccion)}
                                      >
                                        <Split className="h-4 w-4" />
                                      </Button>
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>{tooltipSplit}</TooltipContent>
                                </Tooltip>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleAsignarDocente(seccion)}
                                >
                                  {docenteSeccion ? <Edit className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Eliminar"
                                  onClick={() => handleDeleteSeccion(seccion.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onOpenChange={(open: boolean) => {
        setOpenDialog(open);
        if (!open) setEditingSeccion(null);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Asignar PMA</DialogTitle>
            <DialogDescription>
              {editingSeccion && (
                <>
                  {asignaturas.find(a => a.id === editingSeccion.asignaturaId)?.nombre} - {formatNombreSeccion(editingSeccion)}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {editingSeccion && (
            <FormularioAsignacion
              seccion={editingSeccion}
              docentes={docentes}
              onClose={() => {
                setOpenDialog(false);
                setEditingSeccion(null);
              }}
              onSave={handleUpdateSeccion}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface FormularioAsignacionProps {
  seccion: SeccionAsignatura;
  docentes: DocenteMaestro[];
  onClose: () => void;
  onSave: (seccion: SeccionAsignatura) => void;
}

function FormularioAsignacion({ seccion, docentes, onClose, onSave }: FormularioAsignacionProps) {
  const [formData, setFormData] = useState<SeccionAsignatura>({
    ...seccion
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.docenteId && (formData.horasP < 0 || formData.horasM < 0 || formData.horasA < 0)) {
      toast.error('Las horas PMA no pueden ser negativas');
      return;
    }

    onSave(formData);
  };

  const [comboOpen, setComboOpen] = useState(false);
  const docenteSeleccionado = docentes.find(d => d.id === formData.docenteId);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="docenteId">Docente</Label>
        <Popover open={comboOpen} onOpenChange={setComboOpen}>
          <PopoverTrigger asChild>
            <Button
              id="docenteId"
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={comboOpen}
              className={cn(
                'w-full justify-between font-normal',
                !docenteSeleccionado && 'text-muted-foreground'
              )}
            >
              {docenteSeleccionado
                ? `${docenteSeleccionado.nombreCompleto} (${docenteSeleccionado.rut}-${docenteSeleccionado.dv})${docenteSeleccionado.nivelDocente ? ` - Nivel ${docenteSeleccionado.nivelDocente}` : ''}`
                : 'Seleccione un docente o escriba para filtrar...'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            <Command
              filter={(value: string, search: string) =>
                value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
              }
            >
              <CommandInput placeholder="Buscar por nombre o RUT..." />
              <CommandList>
                <CommandEmpty>No se encontraron docentes.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    value="sin asignar"
                    onSelect={() => {
                      setFormData({ ...formData, docenteId: undefined });
                      setComboOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        !formData.docenteId ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    Sin asignar
                  </CommandItem>
                  {docentes.map((docente) => {
                    const label = `${docente.nombreCompleto} ${docente.rut}-${docente.dv}${docente.nivelDocente ? ` Nivel ${docente.nivelDocente}` : ''}`;
                    return (
                      <CommandItem
                        key={docente.id}
                        value={label}
                        onSelect={() => {
                          setFormData({ ...formData, docenteId: docente.id });
                          setComboOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            formData.docenteId === docente.id ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        <div className="flex flex-col">
                          <span>{docente.nombreCompleto}</span>
                          <span className="text-xs text-muted-foreground">
                            {docente.rut}-{docente.dv}
                            {docente.nivelDocente ? ` · Nivel ${docente.nivelDocente}` : ' · Sin nivel'}
                          </span>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="horasP">Horas Presenciales</Label>
          <Input
            id="horasP"
            type="number"
            min="0"
            value={formData.horasP}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, horasP: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label htmlFor="horasM">Horas Mixtas</Label>
          <Input
            id="horasM"
            type="number"
            min="0"
            value={formData.horasM}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, horasM: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label htmlFor="horasA">Horas Administrativas</Label>
          <Input
            id="horasA"
            type="number"
            min="0"
            value={formData.horasA}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, horasA: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" className="flex-1">
          Guardar Asignación
        </Button>
      </div>
    </form>
  );
}
