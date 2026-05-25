import { useState } from 'react';
import { Search, Plus, Edit, Trash2, BookOpen, X } from 'lucide-react';
import { mockDocentesMaestros, mockSeccionesAsignaturas, mockAsignaturas, formatRUT, type DocenteMaestro } from '../../data/mockData';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';

export function TablaDocentesMaestros() {
  const [docentes, setDocentes] = useState<DocenteMaestro[]>(mockDocentesMaestros);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDocente, setEditingDocente] = useState<DocenteMaestro | null>(null);
  // Estado para el dialog de edición de ramos. `seccionesVersion` fuerza rerender al mutar el mock.
  const [openRamosDialog, setOpenRamosDialog] = useState(false);
  const [docenteRamos, setDocenteRamos] = useState<DocenteMaestro | null>(null);
  const [seccionesVersion, setSeccionesVersion] = useState(0);

  const abrirEditarRamos = (docente: DocenteMaestro) => {
    setDocenteRamos(docente);
    setOpenRamosDialog(true);
  };

  const asignarSeccion = (seccionId: number) => {
    if (!docenteRamos) return;
    const seccion = mockSeccionesAsignaturas.find(s => s.id === seccionId);
    if (!seccion) return;
    seccion.docenteId = docenteRamos.id;
    setSeccionesVersion(v => v + 1);
    toast.success('Ramo asignado');
  };

  const quitarSeccion = (seccionId: number) => {
    const seccion = mockSeccionesAsignaturas.find(s => s.id === seccionId);
    if (!seccion) return;
    seccion.docenteId = undefined;
    setSeccionesVersion(v => v + 1);
    toast.success('Ramo desasignado');
  };

  const filteredDocentes = docentes.filter(
    (docente) =>
      docente.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      docente.rut.includes(searchTerm) ||
      docente.correo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteDocente = (id: number) => {
    if (confirm('¿Está seguro de eliminar este docente? Esta acción no se puede deshacer.')) {
      setDocentes(docentes.filter(d => d.id !== id));
      toast.success('Docente eliminado exitosamente');
    }
  };

  const handleEditDocente = (docente: DocenteMaestro) => {
    setEditingDocente(docente);
    setOpenDialog(true);
  };

  const handleUpdateDocente = (updatedDocente: DocenteMaestro) => {
    setDocentes(docentes.map(d => d.id === updatedDocente.id ? updatedDocente : d));
    setEditingDocente(null);
    setOpenDialog(false);
    toast.success('Docente actualizado exitosamente');
  };

  const docentesSinNivel = docentes.filter(d => !d.nivelDocente).length;

  // Obtener ramos asignados a un docente
  // (depende de seccionesVersion para refrescar tras mutar el mock)
  const getRamosAsignados = (docenteId: number): string[] => {
    // referencia muda al counter para que React detecte la dependencia
    void seccionesVersion;
    const secciones = mockSeccionesAsignaturas.filter(s => s.docenteId === docenteId);
    const asignaturasIds = [...new Set(secciones.map(s => s.asignaturaId))];
    return asignaturasIds.map(id => {
      const asig = mockAsignaturas.find(a => a.id === id);
      return asig ? asig.nombre : '';
    }).filter(Boolean);
  };

  // Detalle de secciones para el dialog de edición
  const getSeccionesDelDocente = (docenteId: number) => {
    void seccionesVersion;
    return mockSeccionesAsignaturas
      .filter(s => s.docenteId === docenteId)
      .map(s => ({
        ...s,
        asignatura: mockAsignaturas.find(a => a.id === s.asignaturaId)
      }));
  };

  const getSeccionesDisponibles = () => {
    void seccionesVersion;
    return mockSeccionesAsignaturas
      .filter(s => s.docenteId === undefined)
      .map(s => ({
        ...s,
        asignatura: mockAsignaturas.find(a => a.id === s.asignaturaId)
      }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tabla Maestra de Docentes</h2>
          <p className="mt-1 text-sm text-gray-600">
            Registro base de docentes del instituto
          </p>
        </div>
        <Dialog open={openDialog} onOpenChange={(open) => {
          setOpenDialog(open);
          if (!open) setEditingDocente(null);
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Docente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingDocente ? 'Editar Docente' : 'Agregar Nuevo Docente'}</DialogTitle>
              <DialogDescription>
                {editingDocente
                  ? 'Actualice los datos básicos del docente'
                  : 'Complete los datos básicos del docente. La asignación de ramos se realiza en Designación PMA.'
                }
              </DialogDescription>
            </DialogHeader>
            <FormularioDocente
              docente={editingDocente}
              onClose={() => {
                setOpenDialog(false);
                setEditingDocente(null);
              }}
              onSave={(docenteData) => {
                if (editingDocente) {
                  handleUpdateDocente({ ...docenteData, id: editingDocente.id });
                } else {
                  setDocentes([...docentes, { ...docenteData, id: docentes.length + 1 }]);
                  setOpenDialog(false);
                  toast.success('Docente agregado exitosamente');
                }
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Docentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{docentes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Nivel A</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{docentes.filter(d => d.nivelDocente === 'A').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Nivel B</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{docentes.filter(d => d.nivelDocente === 'B').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Nivel C</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{docentes.filter(d => d.nivelDocente === 'C').length}</div>
          </CardContent>
        </Card>
        <Card className={docentesSinNivel > 0 ? 'border-orange-300 bg-orange-50' : ''}>
          <CardHeader className="pb-3">
            <CardTitle className={`text-sm font-medium ${docentesSinNivel > 0 ? 'text-orange-700' : 'text-gray-600'}`}>
              Sin Nivel Asignado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${docentesSinNivel > 0 ? 'text-orange-900' : ''}`}>
              {docentesSinNivel}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert para docentes sin nivel */}
      {docentesSinNivel > 0 && (
        <Card className="border-orange-300 bg-orange-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-orange-200 p-2">
                <Search className="h-5 w-5 text-orange-700" />
              </div>
              <div>
                <h4 className="font-semibold text-orange-900">Docentes pendientes de categorización</h4>
                <p className="mt-1 text-sm text-orange-800">
                  Hay {docentesSinNivel} docente(s) sin nivel asignado. No se pueden crear propuestas económicas
                  hasta completar la categorización A/B/C.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Bar */}
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
          <CardTitle>Registro de Docentes</CardTitle>
          <CardDescription>
            Mostrando {filteredDocentes.length} de {docentes.length} docentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>RUT</TableHead>
                  <TableHead>DV</TableHead>
                  <TableHead>Nombre Completo</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Ramos Asignados</TableHead>
                  <TableHead>Nivel</TableHead>
                  <TableHead>Fecha Ingreso</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocentes.map((docente) => {
                  const ramos = getRamosAsignados(docente.id);

                  return (
                    <TableRow key={docente.id}>
                      <TableCell className="font-medium">{docente.id}</TableCell>
                      <TableCell className="font-mono text-sm">{docente.rut}</TableCell>
                      <TableCell className="font-mono text-sm font-semibold">{docente.dv}</TableCell>
                      <TableCell className="font-medium">{docente.nombreCompleto}</TableCell>
                      <TableCell className="text-sm text-gray-600">{docente.correo}</TableCell>
                      <TableCell>
                        {ramos.length > 0 ? (
                          <div className="max-w-[200px]">
                            <div className="flex flex-wrap gap-1">
                              {ramos.slice(0, 2).map((ramo, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {ramo}
                                </Badge>
                              ))}
                              {ramos.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{ramos.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Sin asignar</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {docente.nivelDocente ? (
                          <Badge variant="outline">{docente.nivelDocente}</Badge>
                        ) : (
                          <Badge variant="outline" className="border-orange-400 bg-orange-50 text-orange-700">
                            Sin asignar
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(docente.fechaIngreso).toLocaleDateString('es-CL')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Editar datos del docente"
                            onClick={() => handleEditDocente(docente)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Editar ramos asignados"
                            onClick={() => abrirEditarRamos(docente)}
                          >
                            <BookOpen className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Eliminar docente"
                            onClick={() => handleDeleteDocente(docente.id)}
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

      {/* Dialog: Editar Ramos Asignados */}
      <Dialog open={openRamosDialog} onOpenChange={(open) => {
        setOpenRamosDialog(open);
        if (!open) setDocenteRamos(null);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Ramos Asignados</DialogTitle>
            <DialogDescription>
              {docenteRamos && (
                <>{docenteRamos.nombreCompleto} — RUT {formatRUT(docenteRamos.rut, docenteRamos.dv)}</>
              )}
            </DialogDescription>
          </DialogHeader>
          {docenteRamos && (
            <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
              {/* Asignadas */}
              <div>
                <h4 className="mb-2 text-sm font-semibold text-gray-800">
                  Ramos asignados actualmente ({getSeccionesDelDocente(docenteRamos.id).length})
                </h4>
                {getSeccionesDelDocente(docenteRamos.id).length === 0 ? (
                  <p className="rounded-md border border-dashed border-gray-300 p-3 text-sm text-gray-500">
                    Este docente aún no tiene ramos asignados.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {getSeccionesDelDocente(docenteRamos.id).map(s => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between rounded-md border border-green-200 bg-green-50 px-3 py-2"
                      >
                        <div className="min-w-0">
                          <div className="truncate font-medium text-green-900">
                            {s.asignatura?.sigla} — {s.asignatura?.nombre}
                          </div>
                          <div className="text-xs text-green-700">
                            Sección {s.seccion} • {s.horasP + s.horasM + s.horasA} hrs (P{s.horasP}/M{s.horasM}/A{s.horasA})
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => quitarSeccion(s.id)}
                          title="Quitar este ramo"
                        >
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Disponibles */}
              <div>
                <h4 className="mb-2 text-sm font-semibold text-gray-800">
                  Ramos disponibles ({getSeccionesDisponibles().length})
                </h4>
                {getSeccionesDisponibles().length === 0 ? (
                  <p className="rounded-md border border-dashed border-gray-300 p-3 text-sm text-gray-500">
                    No hay secciones sin docente asignado.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {getSeccionesDisponibles().map(s => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2"
                      >
                        <div className="min-w-0">
                          <div className="truncate font-medium">
                            {s.asignatura?.sigla} — {s.asignatura?.nombre}
                          </div>
                          <div className="text-xs text-gray-500">
                            Sección {s.seccion} • {s.horasP + s.horasM + s.horasA} hrs (P{s.horasP}/M{s.horasM}/A{s.horasA})
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => asignarSeccion(s.id)}
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          Asignar
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="outline" onClick={() => setOpenRamosDialog(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <div className="text-sm text-blue-800">
            <p className="font-semibold text-blue-900 mb-2">Información Importante</p>
            <ul className="space-y-1">
              <li>• Esta tabla muestra únicamente los datos básicos de los docentes</li>
              <li>• La asignación de ramos se realiza en la Capa 2: Designación PMA</li>
              <li>• El nivel docente puede asignarse ahora o posteriormente al editar</li>
              <li>• Sin nivel asignado, no se pueden generar propuestas económicas</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface FormularioDocenteProps {
  docente?: DocenteMaestro | null;
  onClose: () => void;
  onSave: (docente: Omit<DocenteMaestro, 'id'>) => void;
}

function FormularioDocente({ docente, onClose, onSave }: FormularioDocenteProps) {
  const [formData, setFormData] = useState<Omit<DocenteMaestro, 'id'>>({
    rut: docente?.rut || '',
    dv: docente?.dv || '',
    nombreCompleto: docente?.nombreCompleto || '',
    correo: docente?.correo || '',
    nivelDocente: docente?.nivelDocente,
    fechaIngreso: docente?.fechaIngreso || new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.rut || !formData.dv || !formData.nombreCompleto || !formData.correo) {
      toast.error('Complete todos los campos obligatorios');
      return;
    }

    // Validar que RUT sea numérico
    if (!/^\d+$/.test(formData.rut)) {
      toast.error('El RUT debe contener solo números');
      return;
    }

    // Validar DV
    if (formData.dv.length !== 1) {
      toast.error('El dígito verificador debe ser un solo carácter');
      return;
    }

    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <Label htmlFor="rut">RUT (sin puntos ni guión) *</Label>
          <Input
            id="rut"
            placeholder="12345678"
            value={formData.rut}
            onChange={(e) => setFormData({ ...formData, rut: e.target.value.replace(/\D/g, '') })}
            maxLength={8}
            required
          />
        </div>
        <div>
          <Label htmlFor="dv">DV *</Label>
          <Input
            id="dv"
            placeholder="9"
            value={formData.dv}
            onChange={(e) => setFormData({ ...formData, dv: e.target.value.toUpperCase() })}
            maxLength={1}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="nombreCompleto">Nombre Completo *</Label>
        <Input
          id="nombreCompleto"
          placeholder="Juan Pérez González"
          value={formData.nombreCompleto}
          onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="correo">Correo Electrónico *</Label>
        <Input
          id="correo"
          type="email"
          placeholder="docente@uct.cl"
          value={formData.correo}
          onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="nivelDocente" className="flex items-center gap-2">
            Nivel Docente
            <span className="text-xs text-gray-500">(opcional)</span>
          </Label>
          <Select
            value={formData.nivelDocente || 'sin-asignar'}
            onValueChange={(value) => setFormData({
              ...formData,
              nivelDocente: value === 'sin-asignar' ? undefined : value as 'A' | 'B' | 'C'
            })}
          >
            <SelectTrigger id="nivelDocente">
              <SelectValue placeholder="Seleccionar nivel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sin-asignar">Sin Asignar</SelectItem>
              <SelectItem value="A">A (Nivel Superior)</SelectItem>
              <SelectItem value="B">B (Nivel Intermedio)</SelectItem>
              <SelectItem value="C">C (Nivel Básico)</SelectItem>
            </SelectContent>
          </Select>
          {!formData.nivelDocente && (
            <p className="mt-1 text-xs text-orange-600">
              ⚠️ Sin nivel no se pueden crear propuestas económicas
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="fechaIngreso">Fecha de Ingreso *</Label>
          <Input
            id="fechaIngreso"
            type="date"
            value={formData.fechaIngreso}
            onChange={(e) => setFormData({ ...formData, fechaIngreso: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> La asignación de ramos se realiza posteriormente en la Capa 2: Designación PMA
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" className="flex-1">
          {docente ? 'Actualizar' : 'Guardar'} Docente
        </Button>
      </div>
    </form>
  );
}
