import { useState } from 'react';
import { Upload, CheckCircle, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';

export function DocenteCV() {
  const [cvActualizado, setCvActualizado] = useState(true);
  const [datosPersonales, setDatosPersonales] = useState(
    'Juan Carlos Pérez González\nRUT: 12.345.678-9\nEmail: juan.perez@uct.cl'
  );
  const [formacion, setFormacion] = useState(
    'Ingeniero Civil en Informática - Universidad Católica de Temuco (2010)\nMagíster en Educación - Universidad de La Frontera (2015)'
  );
  const [experiencia, setExperiencia] = useState(
    'Docente UCT (2016 - Presente)\n- Asignaturas: Programación, Base de Datos\n\nDesarrollador Senior - Empresa X (2010-2016)'
  );
  const [publicaciones, setPublicaciones] = useState('');

  const handleSave = () => {
    setCvActualizado(true);
    toast.success('CV guardado exitosamente');
  };

  const handleFileUpload = () => {
    toast.success('CV cargado exitosamente');
    setCvActualizado(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Currículum Vitae</h1>
          <p className="mt-2 text-gray-600">
            Mantenga actualizada su información académica y profesional
          </p>
        </div>
        {cvActualizado && (
          <Badge variant="default" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            CV Actualizado
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del CV</CardTitle>
          <CardDescription>Complete o actualice los campos de su currículum</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="datos-personales">Datos Personales</Label>
            <Textarea
              id="datos-personales"
              placeholder="Nombre completo, RUT, dirección, contacto..."
              rows={3}
              value={datosPersonales}
              onChange={(e) => setDatosPersonales(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="formacion">Formación Académica</Label>
            <Textarea
              id="formacion"
              placeholder="Títulos, grados, instituciones..."
              rows={4}
              value={formacion}
              onChange={(e) => setFormacion(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="experiencia">Experiencia Profesional</Label>
            <Textarea
              id="experiencia"
              placeholder="Historial laboral..."
              rows={5}
              value={experiencia}
              onChange={(e) => setExperiencia(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="publicaciones">Publicaciones e Investigación</Label>
            <Textarea
              id="publicaciones"
              placeholder="Artículos, papers, proyectos..."
              rows={3}
              value={publicaciones}
              onChange={(e) => setPublicaciones(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Guardar Cambios
            </Button>
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Cargar PDF
              <Input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileUpload}
              />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
