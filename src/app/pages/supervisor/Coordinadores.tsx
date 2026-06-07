import { useState } from 'react';
import { Search, Plus, Pencil, KeyRound, Trash2, Users } from 'lucide-react';
import {
  mockCoordinadores,
  mockCarrerasDisponibles,
  getNombreCarrera,
  type Coordinador,
} from '../../data/mockData';
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

const SIN_CARRERA = '__sin_carrera__';

export function Coordinadores() {
  const [coordinadores, setCoordinadores] = useState<Coordinador[]>(mockCoordinadores);
  const [searchTerm, setSearchTerm] = useState('');

  // Dialog crear/editar
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Coordinador | null>(null);

  // Dialog credenciales
  const [openCreds, setOpenCreds] = useState(false);
  const [credsTarget, setCredsTarget] = useState<Coordinador | null>(null);

  // Alert eliminar
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Coordinador | null>(null);

  const filtered = coordinadores.filter(
    (c) =>
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.correo_usuario ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalConCarrera = coordinadores.filter((c) => c.id_carrera).length;
  const totalSinCredenciales = coordinadores.filter((c) => !c.tieneCredenciales).length;

  // --- Handlers crear/editar ---
  const abrirCrear = () => {
    setEditing(null);
    setOpenForm(true);
  };

  const abrirEditar = (c: Coordinador) => {
    setEditing(c);
    setOpenForm(true);
  };

  const handleGuardar = (data: Omit<Coordinador, 'id_coordinador' | 'tieneCredenciales'>) => {
    if (editing) {
      // TODO: reemplazar con llamada a API (PUT /api/v1/coordinadores/:id)
      // TODO: si cambió id_carrera, llamar a PUT /api/v1/coordinadores/:id/carrera
      setCoordinadores((prev) =>
        prev.map((c) => (c.id_coordinador === editing.id_coordinador ? { ...c, ...data } : c))
      );
      toast.success('Coordinador actualizado');
    } else {
      // TODO: reemplazar con llamada a API (POST /api/v1/coordinadores)
      const nextId = coordinadores.reduce((max, c) => Math.max(max, c.id_coordinador), 0) + 1;
      setCoordinadores((prev) => [
        ...prev,
        { ...data, id_coordinador: nextId, tieneCredenciales: false },
      ]);
      toast.success('Coordinador creado');
    }
    setOpenForm(false);
    setEditing(null);
  };

  // --- Handlers credenciales ---
  const abrirCredenciales = (c: Coordinador) => {
    setCredsTarget(c);
    setOpenCreds(true);
  };

  const handleGuardarCredenciales = (correo: string) => {
    if (!credsTarget) return;
    // TODO: reemplazar con llamada a API (POST /api/v1/coordinadores/:id/credenciales)
    setCoordinadores((prev) =>
      prev.map((c) =>
        c.id_coordinador === credsTarget.id_coordinador
          ? { ...c, correo_usuario: correo, tieneCredenciales: true }
          : c
      )
    );
    toast.success(
      credsTarget.tieneCredenciales ? 'Contraseña actualizada' : 'Credenciales creadas'
    );
    setOpenCreds(false);
    setCredsTarget(null);
  };

  // --- Handlers eliminar ---
  const abrirEliminar = (c: Coordinador) => {
    setDeleteTarget(c);
    setOpenDelete(true);
  };

  const handleEliminar = () => {
    if (!deleteTarget) return;
    // TODO: reemplazar con llamada a API (DELETE /api/v1/coordinadores/:id)
    setCoordinadores((prev) => prev.filter((c) => c.id_coordinador !== deleteTarget.id_coordinador));
    toast.success('Coordinador eliminado');
    setOpenDelete(false);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Coordinadores</h2>
          <p className="mt-1 text-sm text-gray-600">
            Gestión de coordinadores de carrera y sus credenciales de acceso
          </p>
        </div>
        <Button onClick={abrirCrear}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Coordinador
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
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
        <Card className={totalSinCredenciales > 0 ? 'border-orange-300 bg-orange-50' : ''}>
          <CardHeader className="pb-3">
            <CardTitle
              className={`text-sm font-medium ${totalSinCredenciales > 0 ? 'text-orange-700' : 'text-gray-600'}`}
            >
              Sin Credenciales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalSinCredenciales > 0 ? 'text-orange-900' : ''}`}>
              {totalSinCredenciales}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar por nombre o correo..."
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
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>RUT</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Carrera Asignada</TableHead>
                  <TableHead>Credenciales</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-sm text-gray-500">
                      <Users className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                      No se encontraron coordinadores.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((c) => (
                    <TableRow key={c.id_coordinador}>
                      <TableCell className="font-medium">{c.id_coordinador}</TableCell>
                      <TableCell className="font-medium">{c.nombre}</TableCell>
                      <TableCell className="text-sm text-gray-600">{c.rut}{c.dv ? `-${c.dv}` : ''}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {c.correo_usuario ?? <span className="text-gray-400">—</span>}
                      </TableCell>
                      <TableCell>
                        {c.id_carrera ? (
                          <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-700">
                            {getNombreCarrera(c.id_carrera)}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-600">
                            Sin asignar
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {c.tieneCredenciales ? (
                          <Badge variant="outline" className="border-green-300 bg-green-50 text-green-700">
                            Activas
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-orange-300 bg-orange-50 text-orange-700">
                            Sin credenciales
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
                              <Button variant="ghost" size="sm" onClick={() => abrirCredenciales(c)}>
                                <KeyRound className="h-4 w-4 text-blue-600" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {c.tieneCredenciales ? 'Actualizar contraseña' : 'Gestionar credenciales'}
                            </TooltipContent>
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
                : 'Complete los datos del nuevo coordinador. Las credenciales se gestionan por separado.'}
            </DialogDescription>
          </DialogHeader>
          <FormularioCoordinador
            coordinador={editing}
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

      {/* Dialog: Credenciales */}
      <Dialog
        open={openCreds}
        onOpenChange={(open) => {
          setOpenCreds(open);
          if (!open) setCredsTarget(null);
        }}
      >
        <DialogContent className="max-w-md">
          {credsTarget && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {credsTarget.tieneCredenciales ? 'Actualizar contraseña' : 'Gestionar credenciales'}
                </DialogTitle>
                <DialogDescription>
                  {credsTarget.tieneCredenciales
                    ? 'Establezca una nueva contraseña para el usuario asociado.'
                    : 'Cree el usuario de acceso para este coordinador.'}
                </DialogDescription>
              </DialogHeader>
              <FormularioCredenciales
                coordinador={credsTarget}
                onClose={() => {
                  setOpenCreds(false);
                  setCredsTarget(null);
                }}
                onSave={handleGuardarCredenciales}
              />
            </>
          )}
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
              ¿Estás seguro de que deseas eliminar a {deleteTarget?.nombre}? Esta acción no se puede
              deshacer.
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
  carrerasOcupadas: Set<string>;
  onClose: () => void;
  onSave: (data: Omit<Coordinador, 'id_coordinador' | 'tieneCredenciales'>) => void;
}

function FormularioCoordinador({
  coordinador,
  carrerasOcupadas,
  onClose,
  onSave,
}: FormularioCoordinadorProps) {
  const [nombre, setNombre] = useState(coordinador?.nombre ?? '');
  const [rutStr, setRutStr] = useState(coordinador ? `${coordinador.rut}-${coordinador.dv}` : '');
  const [correo, setCorreo] = useState(coordinador?.correo_usuario ?? '');
  const [carrera, setCarrera] = useState<string>(coordinador?.id_carrera ?? SIN_CARRERA);

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Mantener solo números y letra K, y poner guión automático antes del último dígito
    let val = e.target.value.replace(/[^0-9kK]/gi, '').toUpperCase();
    if (val.length > 1) {
      setRutStr(`${val.slice(0, -1)}-${val.slice(-1)}`);
    } else {
      setRutStr(val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    
    const cleanRut = rutStr.replace('-', '');
    if (cleanRut.length < 7) {
      toast.error('Ingrese un RUT válido');
      return;
    }
    const rutBase = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1);

    if (correo.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      toast.error('El correo no tiene un formato válido');
      return;
    }
    onSave({
      nombre: nombre.trim(),
      rut: rutBase,
      dv: dv,
      correo_usuario: correo.trim() || null,
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
      </div>

      <div>
        <Label htmlFor="coord-correo">Correo institucional</Label>
        <Input
          id="coord-correo"
          type="email"
          placeholder="coordinador@uct.cl"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
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
            {mockCarrerasDisponibles.map((c) => {
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

// ============================================================================
// Formulario gestionar credenciales
// ============================================================================

interface FormularioCredencialesProps {
  coordinador: Coordinador;
  onClose: () => void;
  onSave: (correo: string) => void;
}

function FormularioCredenciales({ coordinador, onClose, onSave }: FormularioCredencialesProps) {
  const yaExiste = coordinador.tieneCredenciales;
  const [correo, setCorreo] = useState(coordinador.correo_usuario ?? '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!yaExiste) {
      if (!correo.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
        toast.error('Ingrese un correo válido');
        return;
      }
    }
    if (password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (password !== confirm) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    onSave(yaExiste ? coordinador.correo_usuario ?? correo.trim() : correo.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Coordinador</Label>
        <Input value={coordinador.nombre} disabled readOnly />
      </div>

      <div>
        <Label htmlFor="cred-correo">Correo usuario *</Label>
        <Input
          id="cred-correo"
          type="email"
          placeholder="coordinador@uct.cl"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          disabled={yaExiste}
          required={!yaExiste}
        />
        {yaExiste && (
          <p className="mt-1 text-xs text-gray-500">
            El correo no puede modificarse una vez creadas las credenciales.
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="cred-pass">Contraseña *</Label>
        <Input
          id="cred-pass"
          type="password"
          placeholder="Mínimo 8 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="cred-confirm">Confirmar contraseña *</Label>
        <Input
          id="cred-confirm"
          type="password"
          placeholder="Repita la contraseña"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
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
