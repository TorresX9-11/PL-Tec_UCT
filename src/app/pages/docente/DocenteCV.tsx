import { useState, useEffect } from 'react';
import { Upload, CheckCircle, XCircle, FileText, Calendar, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';

import { getDocente } from '../../data/docentes';
import { uploadFisico, listArchivos, deleteArchivo, Archivo } from '../../data/archivos';
import { validarDocente } from '../../data/academico';
import type { DocenteMaestro } from '../../data/mockData';

export function DocenteCV() {
  const [docente, setDocente] = useState<DocenteMaestro | null>(null);
  const [cvActualizado, setCvActualizado] = useState(false);
  const [fechaActualizacion, setFechaActualizacion] = useState<string>('No registrada');
  const [cvArchivo, setCvArchivo] = useState<Archivo | null>(null);
  const [uploading, setUploading] = useState(false);

  const checkCVStatus = async (d: DocenteMaestro) => {
    try {
      const allArchivos = await listArchivos();
      const cvFiles = allArchivos.filter(a => a.correoUsuario === d.correo && a.ruta.includes('_cv.pdf'));
      
      if (cvFiles.length > 0) {
        // Encontrar el CV más reciente
        const latestCV = cvFiles.reduce((latest, current) => {
          if (!latest.fechaSubida) return current;
          if (!current.fechaSubida) return latest;
          return new Date(current.fechaSubida).getTime() > new Date(latest.fechaSubida).getTime() ? current : latest;
        });

        setCvArchivo(latestCV);

        if (latestCV.fechaSubida) {
          const date = new Date(latestCV.fechaSubida);
          setFechaActualizacion(date.toLocaleDateString('es-CL'));
          
          // Verificar si han pasado menos de 6 meses
          const diffInMonths = (new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 30);
          setCvActualizado(diffInMonths <= 6);
        } else {
          setFechaActualizacion('Reciente');
          setCvActualizado(true);
        }
      } else {
        setCvArchivo(null);
        setCvActualizado(false);
        setFechaActualizacion('No registrada');
      }
    } catch (e) {
      console.error(e);
      // Fallback
      setCvActualizado(d.cvActualizado === 'Validado' || d.cvActualizado === 'Por Revisar');
    }
  };

  useEffect(() => {
    async function load() {
      const docenteIdRaw = sessionStorage.getItem('docenteId');
      if (!docenteIdRaw) return;
      const d = await getDocente(Number(docenteIdRaw));
      if (d) {
        setDocente(d);
        await checkCVStatus(d);
      }
    }
    load();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !docente) return;

    if (file.type !== 'application/pdf') {
      toast.error('Solo se permiten archivos PDF');
      return;
    }

    try {
      setUploading(true);
      
      // Eliminar el CV anterior si existiera para no sobrecargar de registros viejos
      const allArchivos = await listArchivos();
      const oldCVs = allArchivos.filter(a => a.correoUsuario === docente.correo && a.ruta.includes('_cv.pdf'));
      for (const old of oldCVs) {
        await deleteArchivo(old.id);
      }

      const ruta = `uploads/cv/docente_${docente.rut}_cv.pdf`;
      await uploadFisico(file, docente.correo, ruta);
      
      // Actualizar estado_cv
      await validarDocente(docente.rut, { estado_cv: 'Por Revisar' });

      toast.success('CV cargado exitosamente');
      await checkCVStatus(docente);
    } catch (err) {
      console.error(err);
      toast.error('Error al subir el CV');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!cvArchivo || !docente) return;
    
    try {
      setUploading(true);
      await deleteArchivo(cvArchivo.id);
      
      // Actualizar estado_cv
      await validarDocente(docente.rut, { estado_cv: 'Inexistente' });
      
      toast.success('CV eliminado exitosamente');
      await checkCVStatus(docente);
    } catch (e) {
      console.error(e);
      toast.error('Error al eliminar el CV');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Currículum Vitae</h1>
        <p className="mt-2 text-gray-600">
          Mantenga actualizada su información académica y profesional
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle>Estado del Currículum</CardTitle>
                <CardDescription>
                  {cvActualizado
                    ? 'Su CV está actualizado (tiene menos de 6 meses).'
                    : 'Su CV está desactualizado o no ha sido cargado.'}
                </CardDescription>
              </div>
            </div>
            {cvActualizado ? (
              <Badge variant="default" className="gap-1 bg-green-600">
                <CheckCircle className="h-3 w-3" />
                Actualizado
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1">
                <XCircle className="h-3 w-3" />
                Pendiente
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span>
                Última actualización:{' '}
                <span className="font-medium text-gray-800">{fechaActualizacion}</span>
              </span>
            </div>
            <div className="flex gap-2">
              {cvArchivo && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  onClick={handleDelete}
                  disabled={uploading}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar CV
                </Button>
              )}
              <Button variant="outline" size="sm" className="relative" disabled={uploading}>
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? 'Procesando...' : (cvArchivo ? 'Reemplazar CV' : 'Cargar CV')}
                <Input
                  type="file"
                  accept=".pdf"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
