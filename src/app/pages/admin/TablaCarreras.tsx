import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Loader2, WifiOff } from 'lucide-react';
import { type Carrera } from '../../data/mockData';
import {
  listCarreras,
  createCarrera,
  updateCarrera,
  deleteCarrera,
  type DataSource,
} from '../../data/carreras';
import { ApiError } from '../../data/apiClient';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';

/** Traduce un error de API a un mensaje claro para el usuario. */
function errMsg(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401) return 'Inicia sesión como administrador para guardar cambios.';
    if (err.status === 403) return 'No tienes permisos para esta acción.';
    return err.message;
  }
  return 'Ocurrió un error inesperado.';
}

export function TablaCarreras() {
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [source, setSource] = useState<DataSource>('backend');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [jornadaFilter, setJornadaFilter] = useState<string>('todas');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCarrera, setEditingCarrera] = useState<Carrera | null>(null);
  
  // Delete modal state
  const [carreraToDelete, setCarreraToDelete] = useState<Carrera | null>(null);
  const [deleteCountdown, setDeleteCountdown] = useState(5);

  const load = async () => {
    setLoading(true);
    try {
      const res = await listCarreras();
      setCarreras(res.data);
      setSource(res.source);
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredCarreras = carreras.filter((carrera) => {
    const matchesSearch =
      carrera.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      carrera.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJornada = jornadaFilter === 'todas' || carrera.jornada === jornadaFilter;
    return matchesSearch && matchesJornada;
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (carreraToDelete && deleteCountdown > 0) {
      timer = setTimeout(() => setDeleteCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [carreraToDelete, deleteCountdown]);

  const confirmDeleteCarrera = async () => {
    if (!carreraToDelete) return;
    const carrera = carreraToDelete;
    
    if (source === 'mock') {
      setCarreras((prev) => prev.filter((c) => c.id !== carrera.id));
      toast.success('Carrera eliminada (modo demo)');
      setCarreraToDelete(null);
      return;
    }
    
    try {
      await deleteCarrera(carrera.codigo);
      toast.success('Carrera eliminada exitosamente en cascada');
      await load();
      setCarreraToDelete(null);
    } catch (err) {
      toast.error(errMsg(err));
      setCarreraToDelete(null);
    }
  };

  const handleEditCarrera = (carrera: Carrera) => {
    setEditingCarrera(carrera);
    setOpenDialog(true);
  };

  const handleSaveCarrera = async (carreraData: Omit<Carrera, 'id'>) => {
    // Modo demo (backend caído): operaciones solo en memoria.
    if (source === 'mock') {
      if (editingCarrera) {
        setCarreras((prev) =>
          prev.map((c) => (c.id === editingCarrera.id ? { ...carreraData, id: editingCarrera.id } : c)),
        );
        toast.success('Carrera actualizada (modo demo)');
      } else {
        setCarreras((prev) => [...prev, { ...carreraData, id: (prev[prev.length - 1]?.id ?? 0) + 1 }]);
        toast.success('Carrera agregada (modo demo)');
      }
      setOpenDialog(false);
      setEditingCarrera(null);
      return;
    }
    // Modo backend real.
    try {
      if (editingCarrera) {
        await updateCarrera(editingCarrera.codigo, {
          nombre: carreraData.nombre,
          jornada: carreraData.jornada,
        });
        toast.success('Carrera actualizada exitosamente');
      } else {
        await createCarrera(carreraData);
        toast.success('Carrera agregada exitosamente');
      }
      setOpenDialog(false);
      setEditingCarrera(null);
      await load();
    } catch (err) {
      toast.error(errMsg(err));
    }
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
          <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingCarrera ? 'Editar Carrera' : 'Nueva Carrera'}</DialogTitle>
            <DialogDescription>
              {editingCarrera
                ? 'Modifique los detalles de la carrera seleccionada.'
                : 'Complete el formulario para agregar una nueva carrera al sistema.'}
            </DialogDescription>
          </DialogHeader>
          <FormularioCarrera
            carrera={editingCarrera}
            onSave={handleSaveCarrera}
            onClose={() => setOpenDialog(false)}
          />
        </DialogContent>
        </Dialog>
      </div>

      {/* Dialogo de Eliminación de Seguridad */}
      <Dialog open={!!carreraToDelete} onOpenChange={(open) => !open && setCarreraToDelete(null)}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Eliminación en Cascada
            </DialogTitle>
            <DialogDescription asChild>
              <div className="pt-3 text-sm text-gray-500">
                ¿Está a punto de eliminar la carrera <span className="font-bold text-black">{carreraToDelete?.nombre}</span>?
                <br /><br />
                <strong className="text-red-600">¡ADVERTENCIA!</strong> Esta acción es irreversible y borrará simultáneamente:
                <ul className="list-disc pl-5 mt-2 mb-2 text-sm text-gray-600">
                  <li>Todos los cursos vinculados a la malla de esta carrera.</li>
                  <li>Todas las secciones, grupos y registros.</li>
                  <li>Todos los hitos de acreditación.</li>
                  <li>Los archivos PDF físicos de evidencia subidos para estos hitos.</li>
                </ul>
                Los perfiles de coordinadores no se borrarán, pero quedarán sin carrera asignada.
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setCarreraToDelete(null)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteCarrera}
              disabled={deleteCountdown > 0}
            >
              {deleteCountdown > 0 ? `Eliminar Definitivamente (${deleteCountdown}s)` : 'Eliminar Definitivamente'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Aviso modo demo (backend no disponible) */}
      {source === 'mock' && (
        <div className="flex items-center gap-2 rounded-md border border-yellow-300 bg-yellow-50 px-4 py-2 text-sm text-yellow-800">
          <WifiOff className="h-4 w-4" />
          Sin conexión con el backend: mostrando datos de demostración. Los cambios no se guardarán.
        </div>
      )}

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
          <CardTitle className="flex items-center gap-2">
            Registro de Carreras
            {loading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
          </CardTitle>
          <CardDescription>
            {loading
              ? 'Cargando carreras...'
              : `Mostrando ${filteredCarreras.length} de ${carreras.length} carreras`}
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
                          className="text-red-600 hover:text-red-900 hover:bg-red-50"
                          onClick={() => {
                            setCarreraToDelete(carrera);
                            setDeleteCountdown(5);
                          }}
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
            placeholder="INF"
            maxLength={4}
            value={formData.codigo}
            onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
            required
          />
          <p className="mt-1 text-xs text-gray-500">Máximo 4 caracteres (restricción de la base de datos).</p>
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
