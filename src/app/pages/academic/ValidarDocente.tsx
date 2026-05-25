import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, FileCheck, Save } from 'lucide-react';
import { mockDocentesAcademicos, type EstadoValidacion } from '../../data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';

export function ValidarDocente() {
  const { docenteId } = useParams();
  const navigate = useNavigate();

  const docente = mockDocentesAcademicos.find(d => d.id === parseInt(docenteId || '0'));

  const [estados, setEstados] = useState({
    cvActualizado: docente?.cvActualizado || 'Inexistente' as EstadoValidacion,
    certificadoTitulo: docente?.certificadoTitulo || 'Inexistente' as EstadoValidacion,
    certificadoAntecedentes: docente?.certificadoAntecedentes || 'Inexistente' as EstadoValidacion,
    certificadoInhabilidad: docente?.certificadoInhabilidad || 'Inexistente' as EstadoValidacion,
    carnetIdentidad: docente?.carnetIdentidad || 'Inexistente' as EstadoValidacion
  });

  useEffect(() => {
    if (docente) {
      setEstados({
        cvActualizado: docente.cvActualizado,
        certificadoTitulo: docente.certificadoTitulo,
        certificadoAntecedentes: docente.certificadoAntecedentes,
        certificadoInhabilidad: docente.certificadoInhabilidad,
        carnetIdentidad: docente.carnetIdentidad
      });
    }
  }, [docente]);

  if (!docente) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Docente no encontrado</h2>
          <Button className="mt-4" onClick={() => navigate('/academico/gestion-academica')}>
            Volver a Gestión Académica
          </Button>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    // Aquí se guardarían los cambios en la base de datos
    toast.success('Estados de validación actualizados exitosamente');
    navigate('/academico/gestion-academica');
  };

  const getEstadoBadge = (estado: EstadoValidacion) => {
    if (estado === 'Validado') {
      return <Badge variant="default" className="bg-green-600">Validado</Badge>;
    } else if (estado === 'Por Revisar') {
      return <Badge variant="outline" className="border-yellow-600 text-yellow-700">Por Revisar</Badge>;
    } else {
      return <Badge variant="destructive">Inexistente</Badge>;
    }
  };

  const documentos = [
    { id: 'cvActualizado', nombre: 'CV Actualizado', archivo: 'cv_actualizado.pdf' },
    { id: 'certificadoTitulo', nombre: 'Certificado de Título', archivo: 'certificado_titulo.pdf' },
    { id: 'certificadoAntecedentes', nombre: 'Certificado de Antecedentes', archivo: 'certificado_antecedentes.pdf' },
    { id: 'certificadoInhabilidad', nombre: 'Certificado de Inhabilidad', archivo: 'certificado_inhabilidad.pdf' },
    { id: 'carnetIdentidad', nombre: 'Carnet de Identidad', archivo: 'carnet_identidad.pdf' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/academico/gestion-academica')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Validación de Archivos</h1>
          <p className="mt-2 text-gray-600">
            {docente.nombreCompleto} - {docente.rut}
          </p>
        </div>
        <Button onClick={handleSave} size="lg">
          <Save className="mr-2 h-5 w-5" />
          Guardar Cambios
        </Button>
      </div>

      {/* Resumen */}
      <Card>
        <CardHeader>
          <CardTitle>Estado General</CardTitle>
          <CardDescription>
            Resumen de la validación de documentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-gray-600">Total Documentos</p>
              <p className="text-3xl font-bold">{documentos.length}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-gray-600">Validados</p>
              <p className="text-3xl font-bold text-green-600">
                {Object.values(estados).filter(e => e === 'Validado').length}
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-gray-600">Por Revisar</p>
              <p className="text-3xl font-bold text-yellow-600">
                {Object.values(estados).filter(e => e === 'Por Revisar').length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validación de Documentos */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos del Docente</CardTitle>
          <CardDescription>
            Revise y cambie el estado de validación de cada documento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {documentos.map((doc) => (
            <div key={doc.id} className="rounded-lg border p-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <FileCheck className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{doc.nombre}</h4>
                  <p className="text-sm text-gray-600">{doc.archivo}</p>
                  <div className="mt-3 grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor={`estado-${doc.id}`}>Estado de Validación</Label>
                      <Select
                        value={estados[doc.id as keyof typeof estados]}
                        onValueChange={(value) => setEstados({
                          ...estados,
                          [doc.id]: value as EstadoValidacion
                        })}
                      >
                        <SelectTrigger id={`estado-${doc.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inexistente">Inexistente</SelectItem>
                          <SelectItem value="Por Revisar">Por Revisar</SelectItem>
                          <SelectItem value="Validado">Validado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      {getEstadoBadge(estados[doc.id as keyof typeof estados])}
                    </div>
                  </div>
                  <div className="mt-3">
                    <Button variant="outline" size="sm">
                      Ver Documento
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Botones de Acción */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate('/academico/gestion-academica')}>
          Cancelar
        </Button>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Guardar Cambios
        </Button>
      </div>
    </div>
  );
}
