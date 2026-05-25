import { useState, Fragment } from 'react';
import { Search, ChevronDown, ChevronRight, UserPlus, Edit } from 'lucide-react';
import { mockAsignaturas, mockCarreras, mockSeccionesAsignaturas, mockDocentesMaestros, type SeccionAsignatura } from '../../data/mockData';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';

export function TablaDesignacionPMA() {
  const [secciones, setSecciones] = useState<SeccionAsignatura[]>(mockSeccionesAsignaturas);
  const [searchTerm, setSearchTerm] = useState('');
  const [carreraFilter, setCarreraFilter] = useState<string>('todas');
  const [expandedAsignaturas, setExpandedAsignaturas] = useState<Set<number>>(new Set());
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSeccion, setEditingSeccion] = useState<SeccionAsignatura | null>(null);

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
    return secciones.filter(s => s.asignaturaId === asignaturaId);
  };

  const toggleExpanded = (asignaturaId: number) => {
    setExpandedAsignaturas(prev => {
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

  const handleUpdateSeccion = (updatedSeccion: SeccionAsignatura) => {
    setSecciones(secciones.map(s => s.id === updatedSeccion.id ? updatedSeccion : s));
    setEditingSeccion(null);
    setOpenDialog(false);
    toast.success('Asignación actualizada exitosamente');
  };

  // Count stats
  const totalSecciones = secciones.length;
  const seccionesAsignadas = secciones.filter(s => s.docenteId).length;
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
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                  const hasMultipleSecciones = asignatura.lineasIngreso > 1;

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
                          {primeraSeccion ? `Sección ${primeraSeccion.seccion}` : '-'}
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
                          {primeraSeccion && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAsignarDocente(primeraSeccion)}
                            >
                              {docente ? <Edit className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>

                      {/* Additional sections (expanded) */}
                      {isExpanded && hasMultipleSecciones && seccionesAsig.slice(1).map((seccion) => {
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
                            <TableCell>Sección {seccion.seccion}</TableCell>
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
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAsignarDocente(seccion)}
                              >
                                {docenteSeccion ? <Edit className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                              </Button>
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
      <Dialog open={openDialog} onOpenChange={(open) => {
        setOpenDialog(open);
        if (!open) setEditingSeccion(null);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Asignar Docente</DialogTitle>
            <DialogDescription>
              {editingSeccion && (
                <>
                  {mockAsignaturas.find(a => a.id === editingSeccion.asignaturaId)?.nombre} - Sección {editingSeccion.seccion}
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
    </div>
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="docenteId">Docente</Label>
        <Select
          value={formData.docenteId?.toString() || 'sin-asignar'}
          onValueChange={(value) => setFormData({
            ...formData,
            docenteId: value === 'sin-asignar' ? undefined : Number(value)
          })}
        >
          <SelectTrigger id="docenteId">
            <SelectValue placeholder="Seleccione un docente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sin-asignar">Sin asignar</SelectItem>
            {mockDocentesMaestros.map((docente) => (
              <SelectItem key={docente.id} value={docente.id.toString()}>
                {docente.nombreCompleto} ({docente.rut}-{docente.dv}) {docente.nivelDocente ? `- Nivel ${docente.nivelDocente}` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="horasP">Horas Presenciales</Label>
          <Input
            id="horasP"
            type="number"
            min="0"
            value={formData.horasP}
            onChange={(e) => setFormData({ ...formData, horasP: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label htmlFor="horasM">Horas Mixtas</Label>
          <Input
            id="horasM"
            type="number"
            min="0"
            value={formData.horasM}
            onChange={(e) => setFormData({ ...formData, horasM: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label htmlFor="horasA">Horas Administrativas</Label>
          <Input
            id="horasA"
            type="number"
            min="0"
            value={formData.horasA}
            onChange={(e) => setFormData({ ...formData, horasA: Number(e.target.value) })}
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
