import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { TablaDocentesMaestros } from './TablaDocentesMaestros';
import { TablaDesignacionPMA } from './TablaDesignacionPMA';
import { TablaPropuestasSemestrales } from './TablaPropuestasSemestrales';
import { BandejaBoletas } from './BandejaBoletas';
import { Database, Users, FileSpreadsheet, Trash2, Inbox } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';

const HASH_TO_TAB: Record<string, string> = {
  '#bandeja': 'bandeja',
  '#propuestas': 'propuestas',
  '#designacion': 'designacion',
  '#maestro': 'maestro'
};

export function DocentesTable() {
  // Permite abrir directamente un sub-tab vía hash (ej: /admin/docentes#bandeja
  // desde el AdminDashboard).
  const location = useLocation();
  const initialTab = HASH_TO_TAB[location.hash] ?? 'maestro';
  const [tab, setTab] = useState<string>(initialTab);
  useEffect(() => {
    const next = HASH_TO_TAB[location.hash];
    if (next) setTab(next);
  }, [location.hash]);

  const handleDeleteAll = () => {
    const password = prompt('Ingrese la clave de seguridad para borrar la base de datos:');
    if (password === 'TEC2026') {
      toast.success('Base de datos eliminada exitosamente');
      // En producción, aquí iría la lógica de borrado real
    } else if (password !== null) {
      toast.error('Clave incorrecta');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Gestión Docente TEC</h1>
          <p className="mt-2 text-gray-600">
            Metodología PMA: Presencial, Mixto y Administrativo
          </p>
        </div>
        <Button variant="destructive" onClick={handleDeleteAll}>
          <Trash2 className="mr-2 h-4 w-4" />
          Borrar Base de Datos
        </Button>
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <Database className="h-6 w-6 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900">Sistema de 3 Capas</h3>
              <p className="mt-1 text-sm text-blue-800">
                <strong>Capa 1:</strong> Tabla Maestra de Docentes (datos personales y académicos) •{' '}
                <strong>Capa 2:</strong> Designación PMA por Carrera (asignaturas con horas P/M/A) •{' '}
                <strong>Capa 3:</strong> Propuestas Semestrales (vista consolidada auto-generada)
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs System */}
      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="maestro" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Capa 1: Docentes
          </TabsTrigger>
          <TabsTrigger value="designacion" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Capa 2: Designación PMA
          </TabsTrigger>
          <TabsTrigger value="propuestas" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Capa 3: Propuestas
          </TabsTrigger>
          <TabsTrigger value="bandeja" className="flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            Bandeja de Boletas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="maestro">
          <TablaDocentesMaestros />
        </TabsContent>

        <TabsContent value="designacion">
          <TablaDesignacionPMA />
        </TabsContent>

        <TabsContent value="propuestas">
          <TablaPropuestasSemestrales />
        </TabsContent>

        <TabsContent value="bandeja">
          <BandejaBoletas />
        </TabsContent>
      </Tabs>
    </div>
  );
}
