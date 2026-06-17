import { useState } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { mockAsignaturas, mockCarreras, mockSeccionesAsignaturas, getEstadoAsignatura, type Asignatura, type SeccionAsignatura } from '../../data/mockData';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { Tooltip, TooltipTrigger, TooltipContent } from '../../components/ui/tooltip';
import { toast } from 'sonner';

export function TablaAsignaturas() {
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>(mockAsignaturas);
  const [searchTerm, setSearchTerm] = useState('');
  const [carreraFilter, setCarreraFilter] = useState<string>('todas');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAsignatura, setEditingAsignatura] = useState<Asignatura | null>(null);
  const [addingSeccionFor, setAddingSeccionFor] = useState<Asignatura | null>(null);

  const filteredAsignaturas = asignaturas.filter((asig: Asignatura) => {
    const matchesSearch =
      asig.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asig.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asig.sigla.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCarrera = carreraFilter === 'todas' || asig.carreraId === Number(carreraFilter);
    return matchesSearch && matchesCarrera;
  });

  const getCarreraNombre = (carreraId: number) => {
    return mockCarreras.find(c => c.id === carreraId)?.nombre || 'Desconocida';
  };

  const handleDeleteAsignatura = (id: number) => {
    if (confirm('¿Está seguro de eliminar esta asignatura?')) {
      setAsignaturas(asignaturas.filter((a: Asignatura) => a.id !== id));
      toast.success('Asignatura eliminada exitosamente');
    }
  };

  const handleEditAsignatura = (asignatura: Asignatura) => {
    setEditingAsignatura(asignatura);
    setOpenDialog(true);
  };

  const handleUpdateAsignatura = (updatedAsignatura: Asignatura) => {
    setAsignaturas(asignaturas.map((a: Asignatura) => a.id === updatedAsignatura.id ? updatedAsignatura : a));
    setEditingAsignatura(null);
    setOpenDialog(false);
    toast.success('Asignatura actualizada exitosamente');
  };

  // Group by carrera for summary
  const asignaturasPorCarrera = mockCarreras.map(carrera => ({
    carrera: carrera.nombre,
    count: asignaturas.filter((a: Asignatura) => a.carreraId === carrera.id).length
  })).filter(item => item.count > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Asignaturas</h2>
          <p className="mt-1 text-sm text-gray-600">
            Administración de asignaturas por carrera
          </p>
        </div>
        <Dialog open={openDialog} onOpenChange={(open: boolean) => {
          setOpenDialog(open);
          if (!open) setEditingAsignatura(null);
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Asignatura
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingAsignatura ? 'Editar Asignatura' : 'Agregar Nueva Asignatura'}</DialogTitle>
              <DialogDescription>
                {editingAsignatura
                  ? 'Actualice los datos de la asignatura'
                  : 'Complete la información de la nueva asignatura'
                }
              </DialogDescription>
            </DialogHeader>
            <FormularioAsignatura
              asignatura={editingAsignatura}
              onClose={() => {
                setOpenDialog(false);
                setEditingAsignatura(null);
              }}
              onSave={(asignaturaData) => {
                if (editingAsignatura) {
                  handleUpdateAsignatura({ ...asignaturaData, id: editingAsignatura.id });
                } else {
                  setAsignaturas([...asignaturas, { ...asignaturaData, id: asignaturas.length + 1 }]);
                  setOpenDialog(false);
                  toast.success('Asignatura agregada exitosamente');
                }
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Asignaturas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{asignaturas.length}</div>
          </CardContent>
        </Card>
        {asignaturasPorCarrera.slice(0, 3).map((item, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 truncate" title={item.carrera}>
                {item.carrera}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.count}</div>
              <p className="text-xs text-gray-600">asignaturas</p>
            </CardContent>
          </Card>
        ))}
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
          <CardTitle>Registro de Asignaturas</CardTitle>
          <CardDescription>
            Mostrando {filteredAsignaturas.length} de {asignaturas.length} asignaturas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Sigla</TableHead>
                  <TableHead>Nombre de la Asignatura</TableHead>
                  <TableHead>Carrera</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAsignaturas.map((asignatura: Asignatura) => {
                  const seccionesAsig = mockSeccionesAsignaturas.filter(s => s.asignaturaId === asignatura.id);
                  const { total, tieneGrupos } = getEstadoAsignatura(seccionesAsig);
                  const addDeshabilitado = total >= 3 || tieneGrupos;
                  let tooltipAdd = 'Agregar sección';
                  if (total >= 3) tooltipAdd = 'Máximo 3 secciones por asignatura';
                  if (tieneGrupos) tooltipAdd = 'No se pueden agregar secciones con grupos activos';
                  return (
                  <TableRow key={asignatura.id}>
                    <TableCell className="font-medium">{asignatura.id}</TableCell>
                    <TableCell className="font-mono text-sm">{asignatura.codigo}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{asignatura.sigla}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{asignatura.nombre}</TableCell>
                    <TableCell className="max-w-[200px]">
                      <div className="truncate" title={getCarreraNombre(asignatura.carreraId)}>
                        {getCarreraNombre(asignatura.carreraId)}
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
                                disabled={addDeshabilitado}
                                onClick={() => setAddingSeccionFor(asignatura)}
                              >
                                <Plus className="h-4 w-4 text-green-600" />
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>{tooltipAdd}</TooltipContent>
                        </Tooltip>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Editar Asignatura"
                          onClick={() => handleEditAsignatura(asignatura)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Eliminar Asignatura"
                          onClick={() => handleDeleteAsignatura(asignatura.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {/* Dialog para Agregar Sección/Grupo */}
      <Dialog open={addingSeccionFor !== null} onOpenChange={(open: boolean) => {
        if (!open) setAddingSeccionFor(null);
      }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              Nueva Sección - {addingSeccionFor?.sigla}
            </DialogTitle>
            <DialogDescription>
              Cree una nueva sección para la asignatura {addingSeccionFor?.nombre}. Las horas definidas aquí se usarán en la asignación PMA.
            </DialogDescription>
          </DialogHeader>
          {addingSeccionFor && (
            <FormularioSeccion
              asignatura={addingSeccionFor}
              onClose={() => setAddingSeccionFor(null)}
              onSave={(seccionData) => {
                // Crear nueva seccion en el mock
                const newId = mockSeccionesAsignaturas.length > 0 
                  ? Math.max(...mockSeccionesAsignaturas.map(s => s.id)) + 1 
                  : 1;
                
                const nuevaSeccion: SeccionAsignatura = {
                  id: newId,
                  asignaturaId: addingSeccionFor.id,
                  seccion: seccionData.seccion,
                  horasP: seccionData.horasP,
                  horasM: seccionData.horasM,
                  horasA: seccionData.horasA
                };
                
                mockSeccionesAsignaturas.push(nuevaSeccion);
                setAddingSeccionFor(null);
                toast.success('Sección creada exitosamente. Ahora está disponible en la Capa 2.');
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface FormularioSeccionProps {
  asignatura: Asignatura;
  onClose: () => void;
  onSave: (data: { seccion: number, horasP: number, horasM: number, horasA: number }) => void;
}

function FormularioSeccion({ asignatura, onClose, onSave }: FormularioSeccionProps) {
  // Pre-calcular el número sugerido (el siguiente disponible para esta asignatura)
  const seccionesActuales = mockSeccionesAsignaturas.filter(s => s.asignaturaId === asignatura.id);
  const nextSeccionNum = seccionesActuales.length + 1;

  const [formData, setFormData] = useState({
    seccion: nextSeccionNum,
    horasP: 0,
    horasM: 0,
    horasA: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.seccion <= 0) {
      toast.error('El número de sección debe ser mayor a 0');
      return;
    }

    // Validar que no exista ya otra sección/grupo con ese mismo número para esta asignatura
    const seccionExiste = seccionesActuales.some((s) => s.seccion === formData.seccion);
    if (seccionExiste) {
      toast.error(`El número de sección ${formData.seccion} ya existe en esta asignatura`);
      return;
    }

    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="seccionNum">Número de Sección *</Label>
          <Input
            id="seccionNum"
            type="number"
            min="1"
            value={formData.seccion}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, seccion: parseInt(e.target.value) || 0 })}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="horasP">Horas Presenciales (P)</Label>
          <Input
            id="horasP"
            type="number"
            min="0"
            value={formData.horasP}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, horasP: parseInt(e.target.value) || 0 })}
            required
          />
        </div>
        <div>
          <Label htmlFor="horasM">Horas Mixtas (M)</Label>
          <Input
            id="horasM"
            type="number"
            min="0"
            value={formData.horasM}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, horasM: parseInt(e.target.value) || 0 })}
            required
          />
        </div>
        <div>
          <Label htmlFor="horasA">Horas Autónomas (A)</Label>
          <Input
            id="horasA"
            type="number"
            min="0"
            value={formData.horasA}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, horasA: parseInt(e.target.value) || 0 })}
            required
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" className="flex-1">
          Guardar Sección
        </Button>
      </div>
    </form>
  );
}

interface FormularioAsignaturaProps {
  asignatura?: Asignatura | null;
  onClose: () => void;
  onSave: (asignatura: Omit<Asignatura, 'id'>) => void;
}

function FormularioAsignatura({ asignatura, onClose, onSave }: FormularioAsignaturaProps) {
  const [formData, setFormData] = useState<Omit<Asignatura, 'id'>>({
    codigo: asignatura?.codigo || '',
    sigla: asignatura?.sigla || '',
    nombre: asignatura?.nombre || '',
    carreraId: asignatura?.carreraId || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.codigo || !formData.sigla || !formData.nombre || !formData.carreraId) {
      toast.error('Complete todos los campos obligatorios');
      return;
    }

    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="carreraId">Carrera *</Label>
        <Select
          value={formData.carreraId.toString()}
          onValueChange={(value: string) => setFormData({ ...formData, carreraId: Number(value) })}
        >
          <SelectTrigger id="carreraId">
            <SelectValue placeholder="Seleccione una carrera" />
          </SelectTrigger>
          <SelectContent>
            {mockCarreras.map((carrera) => (
              <SelectItem key={carrera.id} value={carrera.id.toString()}>
                {carrera.nombre} ({carrera.jornada})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="codigo">Código *</Label>
          <Input
            id="codigo"
            placeholder="INF-101"
            value={formData.codigo}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
            required
          />
        </div>
        <div>
          <Label htmlFor="sigla">Sigla *</Label>
          <Input
            id="sigla"
            placeholder="PROG1"
            value={formData.sigla}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, sigla: e.target.value.toUpperCase() })}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="nombre">Nombre de la Asignatura *</Label>
        <Input
          id="nombre"
          placeholder="Programación I"
          value={formData.nombre}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, nombre: e.target.value })}
          required
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" className="flex-1">
          {asignatura ? 'Actualizar' : 'Guardar'} Asignatura
        </Button>
      </div>
    </form>
  );
}
