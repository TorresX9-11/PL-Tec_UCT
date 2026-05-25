import { useState } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { mockCarreras, type Carrera } from '../../data/mockData';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';

export function TablaCarreras() {
  const [carreras, setCarreras] = useState<Carrera[]>(mockCarreras);
  const [searchTerm, setSearchTerm] = useState('');
  const [jornadaFilter, setJornadaFilter] = useState<string>('todas');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCarrera, setEditingCarrera] = useState<Carrera | null>(null);

  const filteredCarreras = carreras.filter((carrera) => {
    const matchesSearch =
      carrera.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      carrera.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJornada = jornadaFilter === 'todas' || carrera.jornada === jornadaFilter;
    return matchesSearch && matchesJornada;
  });

  const handleDeleteCarrera = (id: number) => {
    if (confirm('¿Está seguro de eliminar esta carrera? Esto también afectará a sus asignaturas asociadas.')) {
      setCarreras(carreras.filter(c => c.id !== id));
      toast.success('Carrera eliminada exitosamente');
    }
  };

  const handleEditCarrera = (carrera: Carrera) => {
    setEditingCarrera(carrera);
    setOpenDialog(true);
  };

  const handleUpdateCarrera = (updatedCarrera: Carrera) => {
    setCarreras(carreras.map(c => c.id === updatedCarrera.id ? updatedCarrera : c));
    setEditingCarrera(null);
    setOpenDialog(false);
    toast.success('Carrera actualizada exitosamente');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Carreras</h2>
          <p className="mt-1 text-sm text-gray-600">
            Administración de carreras del instituto
          </p>
        </div>
        <Dialog open={openDialog} onOpenChange={(open) => {
          setOpenDialog(open);
          if (!open) setEditingCarrera(null);
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Carrera
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingCarrera ? 'Editar Carrera' : 'Agregar Nueva Carrera'}</DialogTitle>
              <DialogDescription>
                {editingCarrera
                  ? 'Actualice los datos de la carrera'
                  : 'Complete la información de la nueva carrera'
                }
              </DialogDescription>
            </DialogHeader>
            <FormularioCarrera
              carrera={editingCarrera}
              onClose={() => {
                setOpenDialog(false);
                setEditingCarrera(null);
              }}
              onSave={(carreraData) => {
                if (editingCarrera) {
                  handleUpdateCarrera({ ...carreraData, id: editingCarrera.id });
                } else {
                  setCarreras([...carreras, { ...carreraData, id: carreras.length + 1 }]);
                  setOpenDialog(false);
                  toast.success('Carrera agregada exitosamente');
                }
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Carreras</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{carreras.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Jornada Diurna</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{carreras.filter(c => c.jornada === 'Diurna').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Jornada Vespertina</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{carreras.filter(c => c.jornada === 'Vespertina').length}</div>
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
                  placeholder="Buscar por nombre o código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={jornadaFilter} onValueChange={setJornadaFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por jornada" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las jornadas</SelectItem>
                <SelectItem value="Diurna">Diurna</SelectItem>
                <SelectItem value="Vespertina">Vespertina</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Carreras</CardTitle>
          <CardDescription>
            Mostrando {filteredCarreras.length} de {carreras.length} carreras
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre de la Carrera</TableHead>
                  <TableHead>Jornada</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCarreras.map((carrera) => (
                  <TableRow key={carrera.id}>
                    <TableCell className="font-medium">{carrera.id}</TableCell>
                    <TableCell className="font-mono text-sm">{carrera.codigo}</TableCell>
                    <TableCell className="font-medium">{carrera.nombre}</TableCell>
                    <TableCell>
                      <Badge variant={carrera.jornada === 'Diurna' ? 'default' : 'secondary'}>
                        {carrera.jornada}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCarrera(carrera)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCarrera(carrera.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface FormularioCarreraProps {
  carrera?: Carrera | null;
  onClose: () => void;
  onSave: (carrera: Omit<Carrera, 'id'>) => void;
}

function FormularioCarrera({ carrera, onClose, onSave }: FormularioCarreraProps) {
  const [formData, setFormData] = useState<Omit<Carrera, 'id'>>({
    codigo: carrera?.codigo || '',
    nombre: carrera?.nombre || '',
    jornada: carrera?.jornada || 'Diurna'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.codigo || !formData.nombre) {
      toast.error('Complete todos los campos obligatorios');
      return;
    }

    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="codigo">Código de Carrera *</Label>
          <Input
            id="codigo"
            placeholder="TUI-D"
            value={formData.codigo}
            onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
            required
          />
        </div>
        <div>
          <Label htmlFor="jornada">Jornada *</Label>
          <Select
            value={formData.jornada}
            onValueChange={(value: 'Diurna' | 'Vespertina') => setFormData({ ...formData, jornada: value })}
          >
            <SelectTrigger id="jornada">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Diurna">Diurna</SelectItem>
              <SelectItem value="Vespertina">Vespertina</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="nombre">Nombre de la Carrera *</Label>
        <Input
          id="nombre"
          placeholder="T.U. Informática"
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          required
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" className="flex-1">
          {carrera ? 'Actualizar' : 'Guardar'} Carrera
        </Button>
      </div>
    </form>
  );
}
