import { useState } from 'react';
import { Award, Plus, Trash2, Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';

interface Capacitacion {
  id: number;
  nombre: string;
  institucion: string;
  horas: number;
  fecha: string;
  certificado: string;
}

export function DocenteCapacitaciones() {
  const [capacitaciones, setCapacitaciones] = useState<Capacitacion[]>([
    {
      id: 1,
      nombre: 'Metodologías Activas de Aprendizaje',
      institucion: 'UCT',
      horas: 40,
      fecha: 'Marzo 2026',
      certificado: 'cert_metodologias.pdf'
    },
    {
      id: 2,
      nombre: 'Evaluación por Competencias',
      institucion: 'UCT',
      horas: 30,
      fecha: 'Enero 2026',
      certificado: 'cert_evaluacion.pdf'
    },
    {
      id: 3,
      nombre: 'Tecnologías Educativas Digitales',
      institucion: 'MINEDUC',
      horas: 60,
      fecha: 'Noviembre 2025',
      certificado: 'cert_tecnologias.pdf'
    }
  ]);

  const [nuevaCapacitacion, setNuevaCapacitacion] = useState({
    nombre: '',
    institucion: '',
    horas: '',
    fecha: ''
  });

  const [showForm, setShowForm] = useState(false);

  const handleAddCapacitacion = () => {
    if (!nuevaCapacitacion.nombre || !nuevaCapacitacion.institucion || !nuevaCapacitacion.horas) {
      toast.error('Complete todos los campos requeridos');
      return;
    }

    const nueva: Capacitacion = {
      id: capacitaciones.length + 1,
      nombre: nuevaCapacitacion.nombre,
      institucion: nuevaCapacitacion.institucion,
      horas: parseInt(nuevaCapacitacion.horas),
      fecha: nuevaCapacitacion.fecha || new Date().toLocaleDateString('es-CL'),
      certificado: 'certificado.pdf'
    };

    setCapacitaciones([...capacitaciones, nueva]);
    setNuevaCapacitacion({ nombre: '', institucion: '', horas: '', fecha: '' });
    setShowForm(false);
    toast.success('Capacitación registrada exitosamente');
  };

  const handleDeleteCapacitacion = (id: number) => {
    setCapacitaciones(capacitaciones.filter(c => c.id !== id));
    toast.success('Capacitación eliminada exitosamente');
  };

  const totalHoras = capacitaciones.reduce((sum, c) => sum + c.horas, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Capacitaciones</h1>
          <p className="mt-2 text-gray-600">
            Registre y gestione sus capacitaciones y cursos de formación continua
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Capacitación
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Capacitaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{capacitaciones.length}</div>
            <p className="text-xs text-gray-600">Capacitaciones registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Horas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalHoras}</div>
            <p className="text-xs text-gray-600">Horas de capacitación acumuladas</p>
          </CardContent>
        </Card>
      </div>

      {/* Formulario para Nueva Capacitación */}
      {showForm && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle>Registrar Nueva Capacitación</CardTitle>
            <CardDescription>Complete los datos de la capacitación realizada</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cap-nombre">Nombre de la Capacitación *</Label>
              <Input
                id="cap-nombre"
                placeholder="Ej: Innovación en el Aula"
                value={nuevaCapacitacion.nombre}
                onChange={(e) => setNuevaCapacitacion({ ...nuevaCapacitacion, nombre: e.target.value })}
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label htmlFor="cap-institucion">Institución *</Label>
                <Input
                  id="cap-institucion"
                  placeholder="UCT"
                  value={nuevaCapacitacion.institucion}
                  onChange={(e) => setNuevaCapacitacion({ ...nuevaCapacitacion, institucion: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="cap-horas">Horas *</Label>
                <Input
                  id="cap-horas"
                  type="number"
                  placeholder="40"
                  value={nuevaCapacitacion.horas}
                  onChange={(e) => setNuevaCapacitacion({ ...nuevaCapacitacion, horas: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="cap-fecha">Fecha</Label>
              <Input
                id="cap-fecha"
                placeholder="Ej: Marzo 2026"
                value={nuevaCapacitacion.fecha}
                onChange={(e) => setNuevaCapacitacion({ ...nuevaCapacitacion, fecha: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="cap-certificado">Certificado (PDF)</Label>
              <Input id="cap-certificado" type="file" accept=".pdf" />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddCapacitacion}>
                Registrar Capacitación
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Listado de Capacitaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Capacitaciones Registradas</CardTitle>
          <CardDescription>Historial de capacitaciones y cursos realizados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {capacitaciones.length === 0 ? (
            <div className="py-12 text-center">
              <Award className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-600">No hay capacitaciones registradas</p>
              <p className="text-sm text-gray-500">
                Haga clic en "Nueva Capacitación" para agregar una
              </p>
            </div>
          ) : (
            capacitaciones.map((cap) => (
              <div
                key={cap.id}
                className={`flex items-start gap-3 rounded-lg border p-4 hover:opacity-90 ${
                  cap.institucion === 'UCT'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <Award className={`h-5 w-5 mt-0.5 ${
                  cap.institucion === 'UCT' ? 'text-green-600' : 'text-blue-600'
                }`} />
                <div className="flex-1">
                  <h4 className="font-medium">{cap.nombre}</h4>
                  <p className={`text-sm ${
                    cap.institucion === 'UCT' ? 'text-green-700' : 'text-blue-700'
                  }`}>
                    {cap.institucion} - {cap.horas} horas | {cap.fecha}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        cap.institucion === 'UCT'
                          ? 'border-green-600 text-green-700'
                          : 'border-blue-600 text-blue-700'
                      }`}
                    >
                      {cap.certificado}
                    </Badge>
                    <Badge variant="default" className="text-xs">Completado</Badge>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteCapacitacion(cap.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
