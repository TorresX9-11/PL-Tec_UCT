import { useState, useEffect } from 'react';
import { Search, Plus, Pencil, Trash2, Users } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../components/ui/tooltip';
import { toast } from 'sonner';

import {
  listCoordinadores,
  createCoordinador,
  updateCoordinador,
  deleteCoordinador,
  type Coordinador,
} from '../../data/coordinadores';
import { listCarreras } from '../../data/carreras';

const SIN_CARRERA = '__sin_carrera__';

export function Coordinadores() {
  const [coordinadores, setCoordinadores] = useState<Coordinador[]>([]);
  const [carrerasDict, setCarrerasDict] = useState<Record<string, string>>({});
  const [carrerasDisponibles, setCarrerasDisponibles] = useState<{ id_carrera: string; nombre: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Dialog crear/editar
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Coordinador | null>(null);

  // Alert eliminar
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Coordinador | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [coordsRes, carrRes] = await Promise.all([
        listCoordinadores(),
        listCarreras()
      ]);
      setCoordinadores(coordsRes);
      
      const cDict: Record<string, string> = {};
      const cDisp: { id_carrera: string; nombre: string }[] = [];
      
      carrRes.data.forEach(c => {
        cDict[c.codigo] = c.nombre;
        cDisp.push({ id_carrera: c.codigo, nombre: c.nombre });
      });
      setCarrerasDict(cDict);
      setCarrerasDisponibles(cDisp);
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const filtered = coordinadores.filter(
    (c) =>
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.correo_usuario ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.rut.includes(searchTerm)
  );

  const totalConCarrera = coordinadores.filter((c) => c.id_carrera).length;

  const abrirCrear = () => {
    setEditing(null);
    setOpenForm(true);
  };

  const abrirEditar = (c: Coordinador) => {
    setEditing(c);
    setOpenForm(true);
  };

  const handleGuardar = async (data: Omit<Coordinador, 'id_coordinador'>) => {
    try {
      if (editing) {
        const updated = await updateCoordinador(editing.id_coordinador, data);
        setCoordinadores((prev) =>
          prev.map((c) => (c.id_coordinador === updated.id_coordinador ? updated : c))
        );
        toast.success('Coordinador actualizado');
      } else {
        const created = await createCoordinador(data);
        setCoordinadores((prev) => [...prev, created]);
        toast.success('Coordinador creado correctamente');
      }
      setOpenForm(false);
      setEditing(null);
    } catch (error: any) {
      toast.error(error.message || 'Ocurrió un error al guardar');
    }
  };

  const abrirEliminar = (c: Coordinador) => {
    setDeleteTarget(c);
    setOpenDelete(true);
  };

  const handleEliminar = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCoordinador(deleteTarget.id_coordinador);
      setCoordinadores((prev) => prev.filter((c) => c.id_coordinador !== deleteTarget.id_coordinador));
      toast.success('Coordinador eliminado');
      setOpenDelete(false);
      setDeleteTarget(null);
    } catch (error) {
      toast.error('Ocurrió un error al eliminar');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Cargando coordinadores...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Coordinadores</h2>
          <p className="mt-1 text-sm text-gray-600">
            Gestión de coordinadores de carrera. La contraseña inicial será el RUT sin dígito verificador.
          </p>
        </div>
        <Button onClick={abrirCrear}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Coordinador
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Coordinadores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coordinadores.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Con Carrera Asignada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConCarrera}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar por nombre, RUT o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Coordinadores</CardTitle>
          <CardDescription>
            Mostrando {filtered.length} de {coordinadores.length} coordinadores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>RUT</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Carrera Asignada</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-sm text-gray-500">
                      <Users className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                      No se encontraron coordinadores.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((c) => (
                    <TableRow key={c.id_coordinador}>
                      <TableCell className="font-medium">{c.nombre}</TableCell>
                      <TableCell className="text-sm text-gray-600">{c.rut}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {c.correo_usuario}
                      </TableCell>
                      <TableCell>
                        {c.id_carrera ? (
                          <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-700">
                            {carrerasDict[c.id_carrera] || 'Desconocida'}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-600">
                            Sin asignar
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => abrirEditar(c)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Editar coordinador</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => abrirEliminar(c)}>
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Eliminar coordinador</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog: Crear / Editar */}
      <Dialog
        open={openForm}
        onOpenChange={(open) => {
          setOpenForm(open);
          if (!open) setEditing(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Coordinador' : 'Nuevo Coordinador'}</DialogTitle>
            <DialogDescription>
              {editing
                ? 'Actualice los datos del coordinador.'
                : 'Complete los datos del nuevo coordinador. Su usuario se creará automáticamente y su contraseña será su RUT sin dígito verificador.'}
            </DialogDescription>
          </DialogHeader>
          <FormularioCoordinador
            coordinador={editing}
            carrerasDisponibles={carrerasDisponibles}
            carrerasOcupadas={
              new Set(
                coordinadores
                  .filter((c) => c.id_carrera && c.id_coordinador !== editing?.id_coordinador)
                  .map((c) => c.id_carrera as string)
              )
            }
            onClose={() => {
              setOpenForm(false);
              setEditing(null);
            }}
            onSave={handleGuardar}
          />
        </DialogContent>
      </Dialog>

      {/* Alert: Eliminar */}
      <AlertDialog
        open={openDelete}
        onOpenChange={(open) => {
          setOpenDelete(open);
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar coordinador</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar a {deleteTarget?.nombre}? Esta acción eliminará su cuenta de usuario también.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEliminar}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ============================================================================
// Formulario crear / editar coordinador
// ============================================================================

interface FormularioCoordinadorProps {
  coordinador?: Coordinador | null;
  carrerasDisponibles: { id_carrera: string; nombre: string }[];
  carrerasOcupadas: Set<string>;
  onClose: () => void;
  onSave: (data: Omit<Coordinador, 'id_coordinador'>) => void;
}

function FormularioCoordinador({
  coordinador,
  carrerasDisponibles,
  carrerasOcupadas,
  onClose,
  onSave,
}: FormularioCoordinadorProps) {
  const [nombre, setNombre] = useState(coordinador?.nombre ?? '');
  const [rutStr, setRutStr] = useState(coordinador?.rut ?? '');
  const [correo, setCorreo] = useState(coordinador?.correo_usuario ?? '');
  const [carrera, setCarrera] = useState<string>(coordinador?.id_carrera ?? SIN_CARRERA);

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9kK-]/gi, '').toUpperCase();
    setRutStr(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    
    if (!rutStr.trim() || rutStr.length < 7) {
      toast.error('Ingrese un RUT válido');
      return;
    }

    if (!correo.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      toast.error('El correo no tiene un formato válido');
      return;
    }

    onSave({
      nombre: nombre.trim(),
      rut: rutStr.trim(),
      correo_usuario: correo.trim(),
      id_carrera: carrera === SIN_CARRERA ? null : carrera,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="coord-nombre">Nombre completo *</Label>
        <Input
          id="coord-nombre"
          placeholder="María González"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="coord-rut">RUT *</Label>
        <Input
          id="coord-rut"
          placeholder="12345678-9"
          value={rutStr}
          onChange={handleRutChange}
          maxLength={10}
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          La contraseña inicial del usuario será este RUT sin el dígito verificador ni el guion.
        </p>
      </div>

      <div>
        <Label htmlFor="coord-correo">Correo institucional *</Label>
        <Input
          id="coord-correo"
          type="email"
          placeholder="coordinador@uct.cl"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          disabled={!!coordinador}
          required
        />
      </div>

      <div>
        <Label htmlFor="coord-carrera">Carrera asignada</Label>
        <Select value={carrera} onValueChange={setCarrera}>
          <SelectTrigger id="coord-carrera">
            <SelectValue placeholder="Seleccionar carrera" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={SIN_CARRERA}>Sin asignar</SelectItem>
            {carrerasDisponibles.map((c) => {
              const ocupada = carrerasOcupadas.has(c.id_carrera);
              return (
                <SelectItem key={c.id_carrera} value={c.id_carrera} disabled={ocupada}>
                  {c.nombre}
                  {ocupada && <span className="ml-1 text-xs text-gray-400">(Asignada)</span>}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" className="flex-1">
          Guardar
        </Button>
      </div>
    </form>
  );
}
