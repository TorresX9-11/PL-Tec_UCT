import { CheckCircle, XCircle, FileText, Award, User, Mail, Phone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';

export function DocenteDashboard() {
  // En producción, obtener desde contexto o API
  const docente = {
    nombreCompleto: 'Juan Carlos Pérez González',
    rut: '12.345.678-9',
    correo: 'juan.perez@uct.cl',
    telefono: '+56 9 1234 5678',
    cvActualizado: true,
    certificadoTitulo: true,
    certificadoAntecedentes: true,
    certificadoInhabilidad: true,
    carnetIdentidad: true,
    capacitaciones: 5
  };

  const documentosRequeridos = [
    { nombre: 'CV Actualizado', completado: docente.cvActualizado },
    { nombre: 'Certificado de Título', completado: docente.certificadoTitulo },
    { nombre: 'Certificado de Antecedentes', completado: docente.certificadoAntecedentes },
    { nombre: 'Certificado de Inhabilidad', completado: docente.certificadoInhabilidad },
    { nombre: 'Carnet de Identidad', completado: docente.carnetIdentidad }
  ];

  const documentosCompletos = documentosRequeridos.filter(d => d.completado).length;
  const porcentajeCompletado = Math.round((documentosCompletos / documentosRequeridos.length) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bienvenido/a</h1>
        <p className="mt-2 text-gray-600">
          Gestione su perfil académico y documentación
        </p>
      </div>

      {/* Información Personal */}
      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
          <CardDescription>Sus datos registrados en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Nombre Completo</p>
                <p className="font-medium">{docente.nombreCompleto}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">RUT</p>
                <p className="font-medium font-mono">{docente.rut}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <Mail className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Correo Electrónico</p>
                <p className="font-medium">{docente.correo}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                <Phone className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Teléfono</p>
                <p className="font-medium">{docente.telefono}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progreso de Documentación */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de Documentación</CardTitle>
          <CardDescription>
            {documentosCompletos} de {documentosRequeridos.length} documentos completos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">Progreso General</span>
              <span className="text-sm font-medium">{porcentajeCompletado}%</span>
            </div>
            <Progress value={porcentajeCompletado} className="h-2" />
          </div>

          <div className="space-y-2">
            {documentosRequeridos.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <span className="text-sm">{doc.nombre}</span>
                {doc.completado ? (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Completo
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="gap-1">
                    <XCircle className="h-3 w-3" />
                    Pendiente
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resumen de Capacitaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Capacitaciones</CardTitle>
          <CardDescription>Resumen de su formación continua</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Award className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <p className="text-3xl font-bold">{docente.capacitaciones}</p>
              <p className="text-sm text-gray-600">Capacitaciones registradas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertas */}
      {documentosCompletos < documentosRequeridos.length && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-900">Documentación Pendiente</CardTitle>
            <CardDescription className="text-yellow-700">
              Complete todos los documentos requeridos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm text-yellow-800">
              {documentosRequeridos
                .filter(d => !d.completado)
                .map((doc, index) => (
                  <li key={index}>• {doc.nombre}</li>
                ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
