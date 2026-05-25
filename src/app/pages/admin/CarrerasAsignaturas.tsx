import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { TablaCarreras } from './TablaCarreras';
import { TablaAsignaturas } from './TablaAsignaturas';
import { GraduationCap, BookOpen } from 'lucide-react';
import { Card } from '../../components/ui/card';

export function CarrerasAsignaturas() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Carreras y Asignaturas</h1>
        <p className="mt-2 text-gray-600">
          Gestión del catálogo académico del instituto
        </p>
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <GraduationCap className="h-6 w-6 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900">Sistema de 2 Capas</h3>
              <p className="mt-1 text-sm text-blue-800">
                <strong>Capa 1:</strong> Gestión de Carreras (código, nombre, jornada) •{' '}
                <strong>Capa 2:</strong> Gestión de Asignaturas (código, sigla, nombre, carrera asociada)
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs System */}
      <Tabs defaultValue="carreras" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="carreras" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Capa 1: Carreras
          </TabsTrigger>
          <TabsTrigger value="asignaturas" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Capa 2: Asignaturas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="carreras">
          <TablaCarreras />
        </TabsContent>

        <TabsContent value="asignaturas">
          <TablaAsignaturas />
        </TabsContent>
      </Tabs>
    </div>
  );
}
