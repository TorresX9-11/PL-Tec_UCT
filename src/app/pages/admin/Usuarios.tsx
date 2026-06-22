import { useEffect, useState, FormEvent } from 'react';
import { Search, Plus, Edit, Trash2, Loader2, WifiOff, KeyRound, Users as UsersIcon } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';
import {
  listUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  type Usuario,
  type Nivel,
  type DataSource,
} from '../../data/usuarios';
import { ApiError } from '../../data/apiClient';

const NIVELES: Nivel[] = ['docente', 'coordinador', 'academico', 'supervisor', 'admin'];

const NIVEL_STYLES: Record<Nivel, string> = {
  docente: 'border-blue-300 bg-blue-50 text-blue-700',
  coordinador: 'border-green-300 bg-green-50 text-green-700',
  academico: 'border-teal-300 bg-teal-50 text-teal-700',
  supervisor: 'border-indigo-300 bg-indigo-50 text-indigo-700',
  admin: 'border-purple-300 bg-purple-50 text-purple-700',
};

function errMsg(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401) return 'Inicia sesión como administrador para realizar esta acción.';
    if (err.status === 403) return 'Solo un administrador puede gestionar usuarios.';
    if (err.status === 409) return 'Ya existe un usuario con ese correo.';
    if (err.code === 'DB_ERROR') {
      return 'No se pudo completar: el usuario podría estar referenciado por docentes o coordinadores.';
    }
    return err.message;
  }
  return 'Ocurrió un error inesperado.';
}

export function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [source, setSource] = useState<DataSource>('backend');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [nivelFilter, setNivelFilter] = useState<string>('todos');
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState<Usuario | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await listUsuarios();
      setUsuarios(res.data);
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

  const filtered = usuarios.filter((u) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      u.correo_usuario.toLowerCase().includes(q) || u.nombre.toLowerCase().includes(q);
    const matchesNivel = nivelFilter === 'todos' || u.nivel === nivelFilter;
    return matchesSearch && matchesNivel;
  });

  const handleDelete = async (usuario: Usuario) => {
    if (!confirm(`¿Eliminar al usuario ${usuario.correo_usuario}? Esta acción no se puede deshacer.`)) {
      return;
    }
    try {
      await deleteUsuario(usuario.correo_usuario);
      toast.success('Usuario eliminado exitosamente');
      await load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const handleSave = async (data: {
    correo_usuario: string;
    nombre: string;
    nivel: Nivel;
    contrasena: string;
  }) => {
    try {
      if (editing) {
        await updateUsuario(editing.correo_usuario, {
          nombre: data.nombre,
          nivel: data.nivel,
          contrasena: data.contrasena || undefined,
        });
        toast.success('Usuario actualizado exitosamente');
      } else {
        await createUsuario({
          correo_usuario: data.correo_usuario,
          nombre: data.nombre,
          nivel: data.nivel,
          contrasena: data.contrasena,
        });
        toast.success('Usuario creado exitosamente');
      }
      setOpenDialog(false);
      setEditing(null);
      await load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const countByNivel = (n: Nivel) => usuarios.filter((u) => u.nivel === n).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900">
            <UsersIcon className="h-7 w-7 text-blue-600" />
            Gestión de Usuarios
          </h1>
          <p className="mt-2 text-gray-600">
            Cuentas de acceso al sistema (correo, nivel y contraseña).
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setOpenDialog(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Aviso modo demo */}
      {source === 'mock' && (
        <div className="flex items-center gap-2 rounded-md border border-yellow-300 bg-yellow-50 px-4 py-2 text-sm text-yellow-800">
          <WifiOff className="h-4 w-4" />
          Sin conexión con el backend: la gestión de usuarios requiere el servidor en ejecución.
        </div>
      )}

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-5">
        {NIVELES.map((n) => (
          <Card key={n}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium capitalize text-gray-600">{n}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{countByNivel(n)}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap gap-4 pt-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar por correo o nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={nivelFilter} onValueChange={setNivelFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por nivel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los niveles</SelectItem>
              {NIVELES.map((n) => (
                <SelectItem key={n} value={n} className="capitalize">
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Registro de Usuarios
            {loading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
          </CardTitle>
          <CardDescription>
            {loading ? 'Cargando usuarios...' : `Mostrando ${filtered.length} de ${usuarios.length} usuarios`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Correo</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Nivel</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!loading && filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-sm text-gray-500">
                    <UsersIcon className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                    No hay usuarios que coincidan.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((u) => (
                  <TableRow key={u.correo_usuario}>
                    <TableCell className="font-mono text-sm">{u.correo_usuario}</TableCell>
                    <TableCell className="font-medium">{u.nombre}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`capitalize ${NIVEL_STYLES[u.nivel]}`}>
                        {u.nivel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Editar usuario"
                          onClick={() => {
                            setEditing(u);
                            setOpenDialog(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Eliminar usuario"
                          onClick={() => handleDelete(u)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog crear/editar */}
      <Dialog
        open={openDialog}
        onOpenChange={(open) => {
          setOpenDialog(open);
          if (!open) setEditing(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
            <DialogDescription>
              {editing
                ? 'Actualice los datos del usuario. Deje la contraseña vacía para no cambiarla.'
                : 'Complete los datos de la nueva cuenta de acceso.'}
            </DialogDescription>
          </DialogHeader>
          <FormularioUsuario
            usuario={editing}
            onClose={() => {
              setOpenDialog(false);
              setEditing(null);
            }}
            onSave={handleSave}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface FormularioUsuarioProps {
  usuario: Usuario | null;
  onClose: () => void;
  onSave: (data: { correo_usuario: string; nombre: string; nivel: Nivel; contrasena: string }) => void;
}

function FormularioUsuario({ usuario, onClose, onSave }: FormularioUsuarioProps) {
  const isEdit = usuario !== null;
  const [correo, setCorreo] = useState(usuario?.correo_usuario ?? '');
  const [nombre, setNombre] = useState(usuario?.nombre ?? '');
  const [nivel, setNivel] = useState<Nivel>(usuario?.nivel ?? 'docente');
  const [contrasena, setContrasena] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!isEdit) {
      if (!correo.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
        toast.error('Ingrese un correo válido');
        return;
      }
      if (correo.trim().length > 32) {
        toast.error('El correo no puede superar 32 caracteres (restricción de la BD).');
        return;
      }
      if (contrasena.length < 4) {
        toast.error('La contraseña es obligatoria (mínimo 4 caracteres).');
        return;
      }
    }
    if (!nombre.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    onSave({ correo_usuario: correo.trim(), nombre: nombre.trim(), nivel, contrasena });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="u-correo">Correo *</Label>
        <Input
          id="u-correo"
          type="email"
          placeholder="usuario@uct.cl"
          value={correo}
          maxLength={32}
          disabled={isEdit}
          onChange={(e) => setCorreo(e.target.value)}
          required={!isEdit}
        />
        {isEdit && (
          <p className="mt-1 text-xs text-gray-500">El correo es la clave del usuario y no puede modificarse.</p>
        )}
      </div>

      <div>
        <Label htmlFor="u-nombre">Nombre completo *</Label>
        <Input
          id="u-nombre"
          placeholder="Juan Pérez"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="u-nivel">Nivel *</Label>
        <Select value={nivel} onValueChange={(v: Nivel) => setNivel(v)}>
          <SelectTrigger id="u-nivel">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {NIVELES.map((n) => (
              <SelectItem key={n} value={n} className="capitalize">
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="u-pass" className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-gray-500" />
          Contraseña {isEdit ? '(opcional)' : '*'}
        </Label>
        <Input
          id="u-pass"
          type="password"
          placeholder={isEdit ? 'Dejar vacío para no cambiar' : 'Mínimo 4 caracteres'}
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          required={!isEdit}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" className="flex-1">
          {isEdit ? 'Actualizar' : 'Crear'} Usuario
        </Button>
      </div>
    </form>
  );
}
