import { useState } from 'react';
import { Upload, CheckCircle, XCircle, FileText, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';

export function DocenteCertificados() {
  const [certificados, setCertificados] = useState({
    titulo: { cargado: true, archivo: 'certificado_titulo.pdf', fecha: '15 Marzo 2026' },
    antecedentes: { cargado: true, archivo: 'certificado_antecedentes.pdf', fecha: '10 Marzo 2026' },
    inhabilidad: { cargado: true, archivo: 'certificado_inhabilidad.pdf', fecha: '12 Marzo 2026' },
    carnetIdentidad: { cargado: true, archivo: 'carnet_identidad.pdf', fecha: '08 Marzo 2026' }
  });

  const handleFileUpload = (tipo: keyof typeof certificados, tipoNombre: string) => {
    setCertificados({
      ...certificados,
      [tipo]: {
        cargado: true,
        archivo: `${tipo}.pdf`,
        fecha: new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
      }
    });
    toast.success(`${tipoNombre} cargado exitosamente`);
  };

  const handleFileDelete = (tipo: keyof typeof certificados, tipoNombre: string) => {
    setCertificados({
      ...certificados,
      [tipo]: { cargado: false, archivo: '', fecha: '' }
    });
    toast.success(`${tipoNombre} eliminado exitosamente`);
  };

  const certificadosRequeridos = [
    { id: 'titulo' as keyof typeof certificados, nombre: 'Certificado de Título', descripcion: 'Certificado de título profesional' },
    { id: 'antecedentes' as keyof typeof certificados, nombre: 'Certificado de Antecedentes', descripcion: 'Certificado de antecedentes para fines especiales' },
    { id: 'inhabilidad' as keyof typeof certificados, nombre: 'Certificado de Inhabilidad', descripcion: 'Certificado de inhabilidad para trabajar con menores' },
    { id: 'carnetIdentidad' as keyof typeof certificados, nombre: 'Carnet de Identidad', descripcion: 'Copia digital del carnet de identidad' }
  ];

  const certificadosCompletos = Object.values(certificados).filter(c => c.cargado).length;
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
        {certificadosRequeridos.map((cert) => (
          <Card key={cert.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{cert.nombre}</CardTitle>
                {certificados[cert.id].cargado ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
              <CardDescription>{cert.descripcion}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {certificados[cert.id].cargado ? (
                <div className="rounded-lg bg-green-50 p-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-600" />
                    <span className="flex-1 font-medium text-sm">{certificados[cert.id].archivo}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleFileDelete(cert.id, cert.nombre)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                  <p className="mt-1 text-xs text-gray-600">
                    Subido el {certificados[cert.id].fecha}
                  </p>
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
                  {certificados[cert.id].cargado ? 'Reemplazar Certificado' : 'Subir Certificado'}
                </Label>
                <Input
                  id={`cert-${cert.id}`}
                  type="file"
                  accept=".pdf"
                  onChange={() => handleFileUpload(cert.id, cert.nombre)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
