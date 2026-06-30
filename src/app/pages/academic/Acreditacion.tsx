import { useState, useEffect } from 'react';
import { FileText, Upload, Folder, Calendar, CheckCircle, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { toast } from 'sonner';
import { getHitosAcreditacion, updateHito, addEvidenciaHito, getEvidenciasRecientes, getEvidenciasHito, deleteEvidenciaHito, type HitoAcreditacion, type EvidenciaAcreditacion } from '../../data/academico';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';

export function Acreditacion() {
  const [hitos, setHitos] = useState<HitoAcreditacion[]>([]);
  const [recientes, setRecientes] = useState<EvidenciaAcreditacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHitoId, setSelectedHitoId] = useState<string>('');

  // Modals state
  const [isEvidenciasOpen, setIsEvidenciasOpen] = useState(false);
  const [selectedHitoForModal, setSelectedHitoForModal] = useState<number | null>(null);
  const [evidenciasHito, setEvidenciasHito] = useState<EvidenciaAcreditacion[]>([]);

  const carreraId = sessionStorage.getItem('coordinadorCarreraId') || sessionStorage.getItem('supervisandoCarreraId') || '';

  const loadData = async () => {
    if (!carreraId) return;
    try {
      const data = await getHitosAcreditacion(carreraId);
      setHitos(data);
      const rec = await getEvidenciasRecientes(carreraId);
      setRecientes(rec);
    } catch (err) {
      toast.error('Error al cargar datos de acreditación');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [carreraId]);

  const totalHitos = hitos.length;
  const hitosCompletos = hitos.filter(h => h.estado === 'Completo').length;
  const progreso = totalHitos > 0 ? Math.round((hitosCompletos / totalHitos) * 100) : 0;

  const getEstadoBadge = (estado: HitoAcreditacion['estado']) => {
    const variants = {
      'Completo': 'default' as const,
      'En Progreso': 'secondary' as const,
      'Pendiente': 'outline' as const
    };
    
    return <Badge variant={variants[estado]}>{estado}</Badge>;
  };

  const handleEstadoChange = async (id_hito: number, nuevoEstado: HitoAcreditacion['estado']) => {
    try {
      await updateHito(id_hito, nuevoEstado);
      toast.success('Estado actualizado correctamente');
      loadData();
    } catch (err) {
      toast.error('Error al actualizar estado');
    }
  };

  const handleUploadEvidencia = async () => {
    if (!selectedHitoId) {
      toast.error('Debe seleccionar un hito');
      return;
    }
    const tituloInput = document.getElementById('titulo-evidencia') as HTMLInputElement;
    const tipoInput = document.getElementById('tipo-evidencia') as HTMLSelectElement;
    const descInput = document.getElementById('descripcion-evidencia') as HTMLTextAreaElement;
    const fileInput = document.getElementById('archivo-evidencia') as HTMLInputElement;
    
    if (!tituloInput.value || !tipoInput.value) {
      toast.error('Título y tipo son requeridos');
      return;
    }

    if (!fileInput.files || fileInput.files.length === 0) {
      toast.error('Debe seleccionar un archivo');
      return;
    }

    const formData = new FormData();
    formData.append('titulo', tituloInput.value);
    formData.append('tipo', tipoInput.value);
    formData.append('descripcion', descInput.value);
    formData.append('archivo', fileInput.files[0]);

    try {
      await addEvidenciaHito(Number(selectedHitoId), formData);
      toast.success('Evidencia cargada exitosamente');
      setSelectedHitoId('');
      tituloInput.value = '';
      tipoInput.value = '';
      descInput.value = '';
      (document.getElementById('archivo-evidencia') as HTMLInputElement).value = '';
      
      loadData();
    } catch (err) {
      toast.error('Error al subir evidencia');
    }
  };

  const openEvidenciasModal = async (id_hito: number) => {
    setSelectedHitoForModal(id_hito);
    setIsEvidenciasOpen(true);
    try {
      const evs = await getEvidenciasHito(id_hito);
      setEvidenciasHito(evs);
    } catch (error) {
      toast.error('Error al cargar evidencias del hito');
    }
  };

  const handleDeleteEvidencia = async (id_evidencia: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta evidencia? Esta acción no se puede deshacer.')) return;
    
    try {
      await deleteEvidenciaHito(id_evidencia);
      toast.success('Evidencia eliminada exitosamente');
      // Recargar evidencias del hito actual
      if (selectedHitoForModal) {
        const evs = await getEvidenciasHito(selectedHitoForModal);
        setEvidenciasHito(evs);
      }
      // Recargar hitos y recientes
      await loadData();
    } catch (err) {
      toast.error('Error al eliminar la evidencia');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando...</div>;

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Proceso de Acreditación</h1>
        <p className="mt-2 text-gray-600">
          Gestión de evidencias y seguimiento del proceso de acreditación institucional
        </p>
      </div>

      {/* Progreso General */}
      <Card>
        <CardHeader>
          <CardTitle>Progreso del Proceso</CardTitle>
          <CardDescription>Estado general de la acreditación institucional</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Hitos Completados</span>
              <span className="text-gray-600">
                {hitosCompletos} de {totalHitos} ({progreso}%)
              </span>
            </div>
            <Progress value={progreso} className="h-2" />
          </div>
          
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <div className="text-2xl font-bold text-green-600">{hitosCompletos}</div>
              <p className="text-sm text-gray-600">Hitos Completos</p>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-2xl font-bold text-blue-600">
                {hitos.filter(h => h.estado === 'En Progreso').length}
              </div>
              <p className="text-sm text-gray-600">En Progreso</p>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-2xl font-bold text-gray-600">
                {hitos.filter(h => h.estado === 'Pendiente').length}
              </div>
              <p className="text-sm text-gray-600">Pendientes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hitos del Proceso */}
      <Card>
        <CardHeader>
          <CardTitle>Hitos del Proceso de Acreditación</CardTitle>
          <CardDescription>Seguimiento de cada etapa del proceso</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {hitos.map((hito, index) => (
              <div key={hito.id_hito} className="rounded-lg border p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{hito.nombre}</h4>
                        <Select value={hito.estado} onValueChange={(v: HitoAcreditacion['estado']) => handleEstadoChange(hito.id_hito, v)}>
                          <SelectTrigger className="h-7 text-xs w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pendiente">Pendiente</SelectItem>
                            <SelectItem value="En Progreso">En Progreso</SelectItem>
                            <SelectItem value="Completo">Completo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{hito.descripcion}</p>
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(hito.fecha_limite).toLocaleDateString('es-CL', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>{hito.evidencias} evidencias</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEvidenciasModal(hito.id_hito)}>
                      <Folder className="mr-2 h-4 w-4" />
                      Ver Evidencias
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cargar Nueva Evidencia */}
      <Card>
        <CardHeader>
          <CardTitle>Cargar Nueva Evidencia</CardTitle>
          <CardDescription>
            Agregue documentos y evidencias al proceso de acreditación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="hito-select">Hito Relacionado</Label>
              <select
                id="hito-select"
                value={selectedHitoId}
                onChange={(e) => setSelectedHitoId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
              >
                <option value="">Seleccione un hito...</option>
                {hitos.map((hito) => (
                  <option key={hito.id_hito} value={hito.id_hito}>
                    {hito.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="tipo-evidencia">Tipo de Evidencia</Label>
              <select
                id="tipo-evidencia"
                className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
              >
                <option value="">Seleccione tipo...</option>
                <option value="informe">Informe</option>
                <option value="acta">Acta</option>
                <option value="planificacion">Planificación</option>
                <option value="evaluacion">Evaluación</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="titulo-evidencia">Título de la Evidencia</Label>
            <Input
              id="titulo-evidencia"
              placeholder="Ej: Informe de Diagnóstico Institucional 2026"
            />
          </div>

          <div>
            <Label htmlFor="descripcion-evidencia">Descripción</Label>
            <Textarea
              id="descripcion-evidencia"
              placeholder="Describa brevemente el contenido de la evidencia..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="archivo-evidencia">Archivo</Label>
            <Input
              id="archivo-evidencia"
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
            />
            <p className="mt-1 text-xs text-gray-600">
              Formatos permitidos: PDF, DOC, DOCX, XLS, XLSX
            </p>
          </div>

          <Button onClick={handleUploadEvidencia} className="w-full">
            <Upload className="mr-2 h-4 w-4" />
            Cargar Evidencia
          </Button>
        </CardContent>
      </Card>

      {/* Evidencias Recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Evidencias Recientes</CardTitle>
          <CardDescription>Últimas evidencias cargadas en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {recientes.length === 0 ? (
            <p className="text-sm text-gray-500">No hay evidencias recientes.</p>
          ) : (
            <div className="space-y-3">
              {recientes.map((ev, index) => (
                <div key={index} className="flex items-start gap-3 rounded-lg border p-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{ev.titulo}</h4>
                      <Badge variant="outline" className="capitalize">{ev.tipo}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      Hito: {ev.nombre_hito} | Subido el {new Date(ev.fecha_subida).toLocaleDateString('es-CL')}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => window.open(`http://localhost:3001${ev.url_archivo}`, '_blank')}>
                    Ver
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>

      {/* Modal de Lista de Evidencias */}
      <Dialog open={isEvidenciasOpen} onOpenChange={setIsEvidenciasOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Evidencias del Hito</DialogTitle>
            <DialogDescription>
              Listado completo de documentos respaldatorios
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {evidenciasHito.length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-8">No hay evidencias cargadas para este hito.</p>
            ) : (
              evidenciasHito.map((ev) => (
                <div key={ev.id_evidencia} className="flex items-start justify-between border-b pb-3 mb-3 last:border-0">
                  <div>
                    <h5 className="font-medium text-gray-900">{ev.titulo}</h5>
                    <p className="text-xs text-gray-500 mt-1">{ev.descripcion}</p>
                    <div className="flex gap-3 mt-2">
                      <Badge variant="secondary" className="text-[10px] capitalize">{ev.tipo}</Badge>
                      <span className="text-[11px] text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(ev.fecha_subida).toLocaleDateString('es-CL')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => window.open(`http://localhost:3001${ev.url_archivo}`, '_blank')}>
                      Ver Archivo
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteEvidencia(ev.id_evidencia)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
