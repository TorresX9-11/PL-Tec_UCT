import { useState, useEffect } from 'react';
import { Upload, CheckCircle, XCircle, FileText, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';

import { getDocente } from '../../data/docentes';
import { uploadFisico, deleteArchivo, listArchivos, Archivo } from '../../data/archivos';
import { validarDocente } from '../../data/academico';
import type { DocenteMaestro } from '../../data/mockData';

export function DocenteCertificados() {
  const [docente, setDocente] = useState<DocenteMaestro | null>(null);
  const [archivosDb, setArchivosDb] = useState<Archivo[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  
  const loadData = async () => {
    const docenteIdRaw = sessionStorage.getItem('docenteId');
    if (!docenteIdRaw) return;
    const d = await getDocente(Number(docenteIdRaw));
    if (d) setDocente(d);
    const docs = await listArchivos();
    if (d) {
      setArchivosDb(docs.filter(a => a.correoUsuario === d.correo && a.ruta.includes('cert_')));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getArchivoInfo = (tipoId: string) => {
    return archivosDb.find(a => a.ruta.includes(`cert_${tipoId}`));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, tipoId: string, tipoNombre: string) => {
    const file = event.target.files?.[0];
    if (!file || !docente) return;
    if (file.type !== 'application/pdf') {
      toast.error('Solo PDF permitido');
      return;
    }

    try {
      setUploading(tipoId);
      const ruta = `uploads/certificados/docente_${docente.rut}_cert_${tipoId}.pdf`;
      await uploadFisico(file, docente.correo, ruta);
      
      // Mapear tipoId a la columna de la DB (titulo -> estado_titulo, antecedentes -> estado_antecedentes, inhabilidad -> estado_inhabilidad)
      if (tipoId === 'titulo' || tipoId === 'antecedentes' || tipoId === 'inhabilidad') {
        const campoEstado = `estado_${tipoId}` as 'estado_titulo' | 'estado_antecedentes' | 'estado_inhabilidad';
        await validarDocente(docente.rut, { [campoEstado]: 'Por Revisar' });
      } else if (tipoId === 'carnetIdentidad') {
        // DocenteAcademico doesn't have estado_carnet currently, so skip it unless added
      }

      toast.success(`${tipoNombre} cargado exitosamente`);
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error(`Error subiendo ${tipoNombre}`);
    } finally {
      setUploading(null);
    }
  };

  const handleFileDelete = async (id: number, tipoNombre: string) => {
    try {
      await deleteArchivo(id);
      
      // Determine which state to update
      const certId = Object.keys(certificadosRequeridos).find(key => certificadosRequeridos[key as any].nombre === tipoNombre);
      const tipoId = certificadosRequeridos.find(c => c.nombre === tipoNombre)?.id;
      if (tipoId && (tipoId === 'titulo' || tipoId === 'antecedentes' || tipoId === 'inhabilidad')) {
        const campoEstado = `estado_${tipoId}` as 'estado_titulo' | 'estado_antecedentes' | 'estado_inhabilidad';
        if (docente) {
          await validarDocente(docente.rut, { [campoEstado]: 'Inexistente' });
        }
      }

      toast.success(`${tipoNombre} eliminado exitosamente`);
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error(`Error eliminando ${tipoNombre}`);
    }
  };

  const certificadosRequeridos = [
    { id: 'titulo', nombre: 'Certificado de Título', descripcion: 'Certificado de título profesional' },
    { id: 'antecedentes', nombre: 'Certificado de Antecedentes', descripcion: 'Certificado de antecedentes para fines especiales' },
    { id: 'inhabilidad', nombre: 'Certificado de Inhabilidad', descripcion: 'Certificado de inhabilidad para trabajar con menores' },
    { id: 'carnetIdentidad', nombre: 'Carnet de Identidad', descripcion: 'Copia digital del carnet de identidad' }
  ];

  const certificadosCompletos = certificadosRequeridos.filter(c => getArchivoInfo(c.id)).length;
  const totalCertificados = certificadosRequeridos.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Certificados</h1>
        <p className="mt-2 text-gray-600">
          Gestione su documentación oficial requerida
        </p>
      </div>

      {/* Resumen */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de Documentación</CardTitle>
          <CardDescription>
            {certificadosCompletos} de {totalCertificados} certificados cargados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-green-600">
              {Math.round((certificadosCompletos / totalCertificados) * 100)}%
            </div>
            <div>
              <p className="font-medium">Documentación Completa</p>
              <p className="text-sm text-gray-600">
                {certificadosCompletos === totalCertificados
                  ? 'Todos los certificados han sido cargados'
                  : `Faltan ${totalCertificados - certificadosCompletos} certificados por cargar`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certificados */}
      <div className="grid gap-6 md:grid-cols-2">
        {certificadosRequeridos.map((cert) => {
          const archivo = getArchivoInfo(cert.id);
          const isUploading = uploading === cert.id;
          
          return (
            <Card key={cert.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{cert.nombre}</CardTitle>
                  {archivo ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <CardDescription>{cert.descripcion}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {archivo ? (
                  <div className="rounded-lg bg-green-50 p-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-green-600" />
                      <span className="flex-1 font-medium text-sm">{archivo.nombre}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleFileDelete(archivo.id, cert.nombre)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                    <Badge variant="default" className="mt-2 text-xs">Disponible</Badge>
                  </div>
                ) : (
                  <div className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">No hay certificado cargado</p>
                  </div>
                )}

                <div>
                  <Label htmlFor={`cert-${cert.id}`}>
                    {isUploading ? 'Subiendo...' : (archivo ? 'Reemplazar Certificado' : 'Subir Certificado')}
                  </Label>
                  <Input
                    id={`cert-${cert.id}`}
                    type="file"
                    accept=".pdf"
                    disabled={isUploading}
                    onChange={(e) => handleFileUpload(e, cert.id, cert.nombre)}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
