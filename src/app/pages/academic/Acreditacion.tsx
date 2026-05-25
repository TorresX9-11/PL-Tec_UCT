import { useState } from 'react';
import { FileText, Upload, Folder, Calendar, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { toast } from 'sonner';

interface Hito {
  id: number;
  nombre: string;
  descripcion: string;
  fechaLimite: string;
  estado: 'Completo' | 'En Progreso' | 'Pendiente';
  evidencias: number;
}

export function Acreditacion() {
  const [hitos] = useState<Hito[]>([
    {
      id: 1,
      nombre: 'Diagnóstico Institucional',
      descripcion: 'Autoevaluación y diagnóstico inicial',
      fechaLimite: '2026-05-30',
      estado: 'Completo',
      evidencias: 12
    },
    {
      id: 2,
      nombre: 'Plan de Mejora',
      descripcion: 'Elaboración del plan de mejora institucional',
      fechaLimite: '2026-07-15',
      estado: 'En Progreso',
      evidencias: 8
    },
    {
      id: 3,
      nombre: 'Documentación Académica',
      descripcion: 'Compilación de evidencias académicas',
      fechaLimite: '2026-08-30',
      estado: 'En Progreso',
      evidencias: 15
    },
    {
      id: 4,
      nombre: 'Informe de Autoevaluación',
      descripcion: 'Redacción del informe final',
      fechaLimite: '2026-10-31',
      estado: 'Pendiente',
      evidencias: 0
    },
    {
      id: 5,
      nombre: 'Visita de Pares',
      descripcion: 'Preparación para visita de evaluadores',
      fechaLimite: '2026-12-15',
      estado: 'Pendiente',
      evidencias: 0
    }
  ]);

  const totalHitos = hitos.length;
  const hitosCompletos = hitos.filter(h => h.estado === 'Completo').length;
  const progreso = Math.round((hitosCompletos / totalHitos) * 100);

  const getEstadoBadge = (estado: Hito['estado']) => {
    const variants = {
      'Completo': 'default' as const,
      'En Progreso': 'secondary' as const,
      'Pendiente': 'outline' as const
    };
    
    return <Badge variant={variants[estado]}>{estado}</Badge>;
  };

  const handleUploadEvidencia = () => {
    toast.success('Evidencia cargada exitosamente');
  };

  return (
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
              <div key={hito.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{hito.nombre}</h4>
                        {getEstadoBadge(hito.estado)}
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{hito.descripcion}</p>
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(hito.fechaLimite).toLocaleDateString('es-CL', {
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
                    <Button variant="outline" size="sm">
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
                className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
              >
                <option value="">Seleccione un hito...</option>
                {hitos.map((hito) => (
                  <option key={hito.id} value={hito.id}>
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
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-lg border p-3">
              <FileText className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Plan de Mejora Académica 2026</h4>
                  <Badge variant="outline">Informe</Badge>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  Hito: Plan de Mejora | Subido el 10 Abril 2026
                </p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>

            <div className="flex items-start gap-3 rounded-lg border p-3">
              <FileText className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Acta Consejo Académico - Marzo 2026</h4>
                  <Badge variant="outline">Acta</Badge>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  Hito: Documentación Académica | Subido el 5 Abril 2026
                </p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>

            <div className="flex items-start gap-3 rounded-lg border p-3">
              <FileText className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Evaluación Docente Semestre 1</h4>
                  <Badge variant="outline">Evaluación</Badge>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  Hito: Documentación Académica | Subido el 1 Abril 2026
                </p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
