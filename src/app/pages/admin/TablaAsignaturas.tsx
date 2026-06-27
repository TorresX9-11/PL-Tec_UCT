import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Loader2, WifiOff } from 'lucide-react';
import { getEstadoAsignatura, type SeccionAsignatura, type Carrera } from '../../data/mockData';
import { listGrupos, createGrupo } from '../../data/grupos';
import {
  listCursos,
  createCurso,
  updateCurso,
  deleteCurso,
  syntheticCursoId,
  type CursoAsignatura,
  type CursoInput,
  type DataSource,
} from '../../data/cursos';
import { listCarreras } from '../../data/carreras';
import { ApiError } from '../../data/apiClient';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
// imports limpios
import { toast } from 'sonner';

/** Traduce un error de API a un mensaje claro para el usuario. */
function errMsg(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401) return 'Inicia sesión como administrador para guardar cambios.';
    if (err.status === 403) return 'No tienes permisos para esta acción.';
    if (err.status === 409) return 'Ya existe un curso con esa carrera y sigla.';
    if (err.code === 'DB_ERROR') {
      return 'No se pudo guardar: verifica que la carrera exista y que la sigla no esté duplicada.';
    }
    return err.message;
  }
  return 'Ocurrió un error inesperado.';
}

export function TablaAsignaturas() {
  const [asignaturas, setAsignaturas] = useState<CursoAsignatura[]>([]);
  const [secciones, setSecciones] = useState<SeccionAsignatura[]>([]);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [source, setSource] = useState<DataSource>('backend');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [carreraFilter, setCarreraFilter] = useState<string>('todas');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAsignatura, setEditingAsignatura] = useState<CursoAsignatura | null>(null);
  const [addingSeccionFor, setAddingSeccionFor] = useState<CursoAsignatura | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [cursosRes, carrerasRes, gruposRes] = await Promise.all([listCursos(), listCarreras(), listGrupos()]);
      setAsignaturas(cursosRes.data);
      setSource(cursosRes.source);
      setCarreras(carrerasRes.data);
      setSecciones(gruposRes.data);
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    const handler = () => load();
    window.addEventListener('grupos:update', handler);
    return () => window.removeEventListener('grupos:update', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredAsignaturas = asignaturas.filter((asig) => {
    const matchesSearch =
      asig.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asig.sigla.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCarrera = carreraFilter === 'todas' || asig.idCarrera === carreraFilter;
    return matchesSearch && matchesCarrera;
  });

  const carreraNombre = (a: CursoAsignatura) =>
    carreras.find((c) => c.codigo === a.idCarrera)?.nombre ?? a.idCarrera;

  const handleDeleteAsignatura = async (asignatura: CursoAsignatura) => {
    if (!confirm('¿Está seguro de eliminar esta asignatura?')) return;
    if (source === 'mock') {
      setAsignaturas((prev) => prev.filter((a) => a.id !== asignatura.id));
      toast.success('Asignatura eliminada (modo demo)');
      return;
    }
    try {
      await deleteCurso(asignatura.idCarrera, asignatura.idCurso);
      toast.success('Asignatura eliminada exitosamente');
      await load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const handleEditAsignatura = (asignatura: CursoAsignatura) => {
    setEditingAsignatura(asignatura);
    setOpenDialog(true);
  };

  const handleSaveAsignatura = async (input: CursoInput) => {
    if (source === 'mock') {
      if (editingAsignatura) {
        setAsignaturas((prev) =>
          prev.map((a) =>
            a.id === editingAsignatura.id
              ? { ...a, nombre: input.nombre, semestre: input.semestre }
              : a,
          ),
        );
        toast.success('Asignatura actualizada (modo demo)');
      } else {
        const nuevo: CursoAsignatura = {
          id: syntheticCursoId(input.idCarrera, input.sigla),
          codigo: input.sigla,
          sigla: input.sigla,
          nombre: input.nombre,
          carreraId: 0,
          lineasIngreso: 1,
          tipoSeccion: 'Sección',
          semestre: input.semestre,
          año: new Date().getFullYear(),
          idCarrera: input.idCarrera,
          idCurso: input.sigla,
        };
        setAsignaturas((prev) => [...prev, nuevo]);
        toast.success('Asignatura agregada (modo demo)');
      }
      setOpenDialog(false);
      setEditingAsignatura(null);
      return;
    }
    try {
      if (editingAsignatura) {
        await updateCurso(editingAsignatura.idCarrera, editingAsignatura.idCurso, {
          nombre: input.nombre,
          semestre: input.semestre,
          jornada: input.jornada,
        });
        toast.success('Asignatura actualizada exitosamente');
      } else {
        await createCurso(input);
        toast.success('Asignatura agregada exitosamente');
      }
      setOpenDialog(false);
      setEditingAsignatura(null);
      await load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  // Resumen por carrera (usa las carreras cargadas del backend/mock)
  const asignaturasPorCarrera = carreras
    .map((carrera) => ({
      carrera: carrera.nombre,
      count: asignaturas.filter((a) => a.idCarrera === carrera.codigo).length,
    }))
    .filter((item) => item.count > 0);

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
              carreras={carreras}
              onClose={() => {
                setOpenDialog(false);
                setEditingAsignatura(null);
              }}
              onSave={handleSaveAsignatura}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Aviso modo demo (backend no disponible) */}
      {source === 'mock' && (
        <div className="flex items-center gap-2 rounded-md border border-yellow-300 bg-yellow-50 px-4 py-2 text-sm text-yellow-800">
          <WifiOff className="h-4 w-4" />
          Sin conexión con el backend: mostrando datos de demostración. Los cambios no se guardarán.
        </div>
      )}

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
                {carreras.map((carrera) => (
                  <SelectItem key={carrera.codigo} value={carrera.codigo}>
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
          <CardTitle className="flex items-center gap-2">
            Registro de Asignaturas
            {loading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
          </CardTitle>
          <CardDescription>
            {loading
              ? 'Cargando asignaturas...'
              : `Mostrando ${filteredAsignaturas.length} de ${asignaturas.length} asignaturas`}
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
                {filteredAsignaturas.map((asignatura: CursoAsignatura) => {
                  const seccionesAsig = secciones.filter(s => s.asignaturaId === asignatura.id);
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
                      <div className="truncate" title={carreraNombre(asignatura)}>
                        {carreraNombre(asignatura)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <span title={tooltipAdd}>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={addDeshabilitado}
                            onClick={() => setAddingSeccionFor(asignatura)}
                          >
                            <Plus className={`h-4 w-4 ${addDeshabilitado ? 'text-gray-400' : 'text-green-600'}`} />
                          </Button>
                        </span>
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
                          onClick={() => handleDeleteAsignatura(asignatura)}
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
              seccionesActuales={secciones.filter(s => s.asignaturaId === addingSeccionFor.id)}
              onClose={() => setAddingSeccionFor(null)}
              onSave={async (seccionData) => {
                try {
                  await createGrupo({
                    idCarrera: addingSeccionFor.idCarrera,
                    idCurso: addingSeccionFor.idCurso,
                    seccion: seccionData.seccion,
                    horasP: seccionData.horasP,
                    horasM: seccionData.horasM,
                    horasA: seccionData.horasA
                  });
                  window.dispatchEvent(new Event('grupos:update'));
                  setAddingSeccionFor(null);
                  toast.success('Sección creada exitosamente. Ahora está disponible en la Capa 2.');
                } catch (e) {
                  toast.error('Error al crear sección');
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface FormularioSeccionProps {
  asignatura: CursoAsignatura;
  seccionesActuales: SeccionAsignatura[];
  onClose: () => void;
  onSave: (data: { seccion: number, horasP: number, horasM: number, horasA: number }) => void;
}

function FormularioSeccion({ asignatura, seccionesActuales, onClose, onSave }: FormularioSeccionProps) {
  // Pre-calcular el número sugerido (el siguiente disponible para esta asignatura)
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
  asignatura?: CursoAsignatura | null;
  carreras: Carrera[];
  onClose: () => void;
  onSave: (input: CursoInput) => void;
}

function FormularioAsignatura({ asignatura, carreras, onClose, onSave }: FormularioAsignaturaProps) {
  const editing = Boolean(asignatura);
  const [idCarrera, setIdCarrera] = useState<string>(asignatura?.idCarrera ?? '');
  const [sigla, setSigla] = useState(asignatura?.sigla ?? '');
  const [nombre, setNombre] = useState(asignatura?.nombre ?? '');
  const [semestre, setSemestre] = useState<number>(asignatura?.semestre ?? 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!idCarrera || !sigla.trim() || !nombre.trim()) {
      toast.error('Complete todos los campos obligatorios');
      return;
    }
    if (sigla.trim().length > 5) {
      toast.error('La sigla no puede superar 5 caracteres (es el identificador del curso).');
      return;
    }

    const carrera = carreras.find((c) => c.codigo === idCarrera);
    const jornada: 'diurno' | 'vespertino' =
      carrera?.jornada === 'Vespertina' ? 'vespertino' : 'diurno';

    onSave({
      idCarrera,
      sigla: sigla.trim().toUpperCase(),
      nombre: nombre.trim(),
      semestre,
      jornada,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="carreraId">Carrera *</Label>
        <Select value={idCarrera} onValueChange={setIdCarrera} disabled={editing}>
          <SelectTrigger id="carreraId">
            <SelectValue placeholder="Seleccione una carrera" />
          </SelectTrigger>
          <SelectContent>
            {carreras.map((carrera) => (
              <SelectItem key={carrera.codigo} value={carrera.codigo}>
                {carrera.nombre} ({carrera.jornada})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="sigla">Sigla * (identificador del curso)</Label>
          <Input
            id="sigla"
            placeholder="PROG1"
            value={sigla}
            maxLength={5}
            disabled={editing}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSigla(e.target.value.toUpperCase())}
            required
          />
        </div>
        <div>
          <Label htmlFor="semestre">Semestre *</Label>
          <Select value={String(semestre)} onValueChange={(v: string) => setSemestre(Number(v))}>
            <SelectTrigger id="semestre">
              <SelectValue placeholder="Semestre" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="nombre">Nombre de la Asignatura *</Label>
        <Input
          id="nombre"
          placeholder="Programación I"
          value={nombre}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNombre(e.target.value)}
          required
        />
      </div>

      {editing && (
        <p className="text-xs text-gray-500">
          La carrera y la sigla forman el identificador del curso y no pueden modificarse. Para
          cambiarlos, elimine y vuelva a crear la asignatura.
        </p>
      )}

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
