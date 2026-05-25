import { useState } from 'react';
import { Upload, FileText, Trash2, Download, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';

interface Boleta {
  id: number;
  nombre: string;
  archivo: string;
  fecha: string;
}

export function DocenteBoletas() {
  const [boletas, setBoletas] = useState<Boleta[]>([
    { id: 1, nombre: 'Boleta Marzo 2026', archivo: 'boleta_marzo_2026.pdf', fecha: '15 Marzo 2026' },
    { id: 2, nombre: 'Boleta Febrero 2026', archivo: 'boleta_febrero_2026.pdf', fecha: '15 Febrero 2026' }
  ]);

  const [nombreNueva, setNombreNueva] = useState('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!nombreNueva.trim()) {
      toast.error('Ingrese un nombre para la boleta');
      return;
    }

    const nuevaBoleta: Boleta = {
      id: boletas.length + 1,
      nombre: nombreNueva,
      archivo: file.name,
      fecha: new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
    };

    setBoletas([nuevaBoleta, ...boletas]);
    setNombreNueva('');
    toast.success('Boleta cargada exitosamente');

    // Reset file input
    event.target.value = '';
  };

  const handleDeleteBoleta = (id: number) => {
    setBoletas(boletas.filter(b => b.id !== id));
    toast.success('Boleta eliminada exitosamente');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mis Boletas</h1>
        <p className="mt-2 text-gray-600">
          Gestione sus boletas de honorarios y documentos de pago
        </p>
      </div>

      {/* Subir Nueva Boleta */}
      <Card>
        <CardHeader>
          <CardTitle>Subir Nueva Boleta</CardTitle>
          <CardDescription>
            Cargue sus boletas de honorarios en formato PDF
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="nombre-boleta">Nombre de la Boleta</Label>
            <Input
              id="nombre-boleta"
              placeholder="Ej: Boleta Abril 2026"
              value={nombreNueva}
              onChange={(e) => setNombreNueva(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="archivo-boleta">Archivo PDF</Label>
            <Input
              id="archivo-boleta"
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
            />
            <p className="mt-1 text-xs text-gray-500">
              Solo archivos PDF. Máximo 5MB.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Resumen */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">Total Boletas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{boletas.length}</div>
          <p className="text-xs text-gray-600">Boletas registradas</p>
        </CardContent>
      </Card>

      {/* Listado de Boletas */}
      <Card>
        <CardHeader>
          <CardTitle>Boletas Registradas</CardTitle>
          <CardDescription>
            Historial de boletas subidas al sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {boletas.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-600">No hay boletas registradas</p>
              <p className="text-sm text-gray-500">
                Suba su primera boleta utilizando el formulario superior
              </p>
            </div>
          ) : (
            boletas.map((boleta) => (
              <div
                key={boleta.id}
                className="flex items-center gap-4 rounded-lg border p-4 hover:bg-gray-50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{boleta.nombre}</h4>
                  <p className="text-sm text-gray-600">
                    {boleta.archivo}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Subido el {boleta.fecha}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteBoleta(boleta.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Información */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">Información Importante</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800">
          <ul className="space-y-2">
            <li>• Las boletas deben estar en formato PDF</li>
            <li>• Asegúrese de que el nombre de la boleta sea descriptivo</li>
            <li>• Las boletas quedan disponibles para revisión del área administrativa</li>
            <li>• Mantenga sus boletas actualizadas para facilitar la gestión de pagos</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
