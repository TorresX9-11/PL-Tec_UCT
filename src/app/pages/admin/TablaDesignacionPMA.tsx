import { useState, useEffect, Fragment } from 'react';
import { Search, ChevronDown, ChevronRight, UserPlus, Edit, Check, ChevronsUpDown, Split, Trash2 } from 'lucide-react';
import { mockAsignaturas, mockCarreras, mockSeccionesAsignaturas, mockDocentesMaestros, type SeccionAsignatura } from '../../data/mockData';
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
import { toast } from 'sonner';

export function TablaDesignacionPMA() {
  const [secciones, setSecciones] = useState<SeccionAsignatura[]>(mockSeccionesAsignaturas);
  const [searchTerm, setSearchTerm] = useState('');
  const [carreraFilter, setCarreraFilter] = useState<string>('todas');
  const [expandedAsignaturas, setExpandedAsignaturas] = useState<Set<number>>(new Set());
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSeccion, setEditingSeccion] = useState<SeccionAsignatura | null>(null);
  const [splittingSeccion, setSplittingSeccion] = useState<SeccionAsignatura | null>(null);

  // Actualizar cuando cambia la vista o el mock global
  useEffect(() => {
    setSecciones([...mockSeccionesAsignaturas]);
  }, []);

  const filteredAsignaturas = mockAsignaturas.filter((asig) => {
    const matchesSearch =
      asig.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asig.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asig.sigla.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCarrera = carreraFilter === 'todas' || asig.carreraId === Number(carreraFilter);
    return matchesSearch && matchesCarrera;
  });

  const getCarrera = (carreraId: number) => {
    return mockCarreras.find(c => c.id === carreraId);
  };

  const getDocente = (docenteId?: number) => {
    if (!docenteId) return null;
    return mockDocentesMaestros.find(d => d.id === docenteId);
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

  // Para asignaturas que aún no tienen ninguna sección registrada:
  // creamos una sección "borrador" en memoria (id = -1) y la pasamos al dialog.
  // Si el admin guarda, `handleUpdateSeccion` detecta el id negativo y la inserta como nueva.
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

  const handleUpdateSeccion = (updatedSeccion: SeccionAsignatura) => {
    if (updatedSeccion.id < 0) {
      // Nueva sección: asignar id real y agregar al listado
      const nuevoId = mockSeccionesAsignaturas.length > 0 ? Math.max(...mockSeccionesAsignaturas.map(s => s.id)) + 1 : 1;
      const nueva = { ...updatedSeccion, id: nuevoId };
      mockSeccionesAsignaturas.push(nueva);
      setSecciones([...mockSeccionesAsignaturas]);
      toast.success('Sección creada y docente asignado');
    } else {
      const index = mockSeccionesAsignaturas.findIndex(s => s.id === updatedSeccion.id);
      if (index >= 0) {
        mockSeccionesAsignaturas[index] = updatedSeccion;
      }
      setSecciones([...mockSeccionesAsignaturas]);
      toast.success('Asignación actualizada exitosamente');
    }
    setEditingSeccion(null);
    setOpenDialog(false);
  };

  const handleSplitSeccion = (seccion: SeccionAsignatura, partes: number) => {
    const index = mockSeccionesAsignaturas.findIndex(s => s.id === seccion.id);
    if (index === -1) return;

    // Modificar la original para que sea 'A'
    const seccionOriginal = { ...seccion, subGrupo: 'A' };
    mockSeccionesAsignaturas[index] = seccionOriginal;

    // Crear las nuevas partes B, C, etc.
    const letras = ['B', 'C', 'D', 'E', 'F'];
    const nuevasSecciones: SeccionAsignatura[] = [];
    
    let maxId = Math.max(...mockSeccionesAsignaturas.map(s => s.id));
    
    for (let i = 0; i < partes - 1; i++) {
      maxId++;
      nuevasSecciones.push({
        ...seccion,
        id: maxId,
        subGrupo: letras[i],
        docenteId: undefined, // El nuevo grupo nace sin docente
      });
    }

    mockSeccionesAsignaturas.push(...nuevasSecciones);
    setSecciones([...mockSeccionesAsignaturas]);
    setSplittingSeccion(null);
    toast.success(`Sección dividida en ${partes} grupos exitosamente`);
  };

  const handleDeleteSeccion = (id: number) => {
    if (confirm('¿Está seguro de eliminar esta sección/grupo?')) {
      const index = mockSeccionesAsignaturas.findIndex(s => s.id === id);
      if (index === -1) return;
      
      const seccionEliminada = mockSeccionesAsignaturas[index];
      mockSeccionesAsignaturas.splice(index, 1);

      // Si era un subgrupo, verificamos si quedó solo el 'A' para limpiarlo
      if (seccionEliminada.subGrupo) {
        const remaining = mockSeccionesAsignaturas.filter(
          s => s.asignaturaId === seccionEliminada.asignaturaId && s.seccion === seccionEliminada.seccion
        );
        if (remaining.length === 1 && remaining[0].subGrupo === 'A') {
          remaining[0].subGrupo = undefined;
        }
      }

      setSecciones([...mockSeccionesAsignaturas]);
      toast.success('Sección eliminada exitosamente');
    }
  };

  // Count stats
  const totalSecciones = secciones.length;
  const seccionesAsignadas = secciones.filter((s: SeccionAsignatura) => s.docenteId).length;
  const seccionesSinAsignar = totalSecciones - seccionesAsignadas;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Designación y PMA</h2>
          <p className="mt-1 text-sm text-gray-600">
            Asignación de docentes por sección y gestión de horas PMA
          </p>
        </div>
      </div>

      {/* Summary Cards */}
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

      {/* Filters */}
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
                {mockCarreras.map((carrera) => (
                  <SelectItem key={carrera.id} value={carrera.id.toString()}>
                    {carrera.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Asignaturas y Asignaciones</CardTitle>
          <CardDescription>
            Mostrando {filteredAsignaturas.length} asignaturas
          </CardDescription>
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
                  const carrera = getCarrera(asignatura.carreraId);
                  const seccionesAsig = getSeccionesForAsignatura(asignatura.id);
                  const isExpanded = expandedAsignaturas.has(asignatura.id);
                  const hasMultipleSecciones = seccionesAsig.length > 1;

                  // Show first section in main row
                  const primeraSeccion = seccionesAsig[0];
                  const docente = primeraSeccion ? getDocente(primeraSeccion.docenteId) : null;

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
                          <Badge variant="outline">{asignatura.lineasIngreso}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{asignatura.sigla}</TableCell>
                        <TableCell>
                          {primeraSeccion ? `Sección ${primeraSeccion.seccion}${primeraSeccion.subGrupo ? `-${primeraSeccion.subGrupo}` : ''}` : '-'}
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
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Dividir en subgrupos"
                                onClick={() => setSplittingSeccion(primeraSeccion)}
                              >
                                <Split className="h-4 w-4" />
                              </Button>
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

                      {/* Additional sections (expanded) */}
                      {isExpanded && hasMultipleSecciones && seccionesAsig.slice(1).map((seccion: SeccionAsignatura) => {
                        const docenteSeccion = getDocente(seccion.docenteId);
                        return (
                          <TableRow key={seccion.id} className="bg-gray-50">
                            <TableCell></TableCell>
                            <TableCell className="text-gray-500">↳ {asignatura.nombre}</TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell>Sección {seccion.seccion}{seccion.subGrupo ? `-${seccion.subGrupo}` : ''}</TableCell>
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
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Dividir en subgrupos"
                                  onClick={() => setSplittingSeccion(seccion)}
                                >
                                  <Split className="h-4 w-4" />
                                </Button>
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

      {/* Asignar Docente Dialog */}
      <Dialog open={openDialog} onOpenChange={(open: boolean) => {
        setOpenDialog(open);
        if (!open) setEditingSeccion(null);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Asignar Docente</DialogTitle>
            <DialogDescription>
              {editingSeccion && (
                <>
                  {mockAsignaturas.find(a => a.id === editingSeccion.asignaturaId)?.nombre} - Sección {editingSeccion.seccion}{editingSeccion.subGrupo ? `-${editingSeccion.subGrupo}` : ''}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {editingSeccion && (
            <FormularioAsignacion
              seccion={editingSeccion}
              onClose={() => {
                setOpenDialog(false);
                setEditingSeccion(null);
              }}
              onSave={handleUpdateSeccion}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Split Section Dialog */}
      <Dialog open={splittingSeccion !== null} onOpenChange={(open: boolean) => {
        if (!open) setSplittingSeccion(null);
      }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Dividir Sección</DialogTitle>
            <DialogDescription>
              {splittingSeccion && (
                <>
                  ¿En cuántos grupos deseas dividir la <strong>Sección {splittingSeccion.seccion}{splittingSeccion.subGrupo ? `-${splittingSeccion.subGrupo}` : ''}</strong>?
                  <br /><br />
                  Las horas PMA ({splittingSeccion.horasP}P / {splittingSeccion.horasM}M / {splittingSeccion.horasA}A) se clonarán para cada nuevo grupo.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {splittingSeccion && (
            <FormularioSplit
              onClose={() => setSplittingSeccion(null)}
              onSave={(partes) => handleSplitSeccion(splittingSeccion, partes)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface FormularioSplitProps {
  onClose: () => void;
  onSave: (partes: number) => void;
}

function FormularioSplit({ onClose, onSave }: FormularioSplitProps) {
  const [partes, setPartes] = useState(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (partes < 2 || partes > 5) {
      toast.error('Puedes dividir la sección entre 2 y 5 grupos');
      return;
    }
    onSave(partes);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div>
        <Label htmlFor="partes">Cantidad de grupos resultantes</Label>
        <Input
          id="partes"
          type="number"
          min="2"
          max="5"
          value={partes}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPartes(parseInt(e.target.value) || 2)}
        />
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" className="flex-1">
          Dividir
        </Button>
      </div>
    </form>
  );
}

interface FormularioAsignacionProps {
  seccion: SeccionAsignatura;
  onClose: () => void;
  onSave: (seccion: SeccionAsignatura) => void;
}

function FormularioAsignacion({ seccion, onClose, onSave }: FormularioAsignacionProps) {
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
  const docenteSeleccionado = mockDocentesMaestros.find(d => d.id === formData.docenteId);

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
                  {mockDocentesMaestros.map((docente) => {
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
