import { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';

import { getDocente } from '../../data/docentes';
import { listGrupos } from '../../data/grupos';
import { listCursos } from '../../data/cursos';
import { listCarreras } from '../../data/carreras';
import { listCoordinadores, type Coordinador } from '../../data/coordinadores';
import { mockSeccionesAsignaturas } from '../../data/mockData';
import type { SeccionAsignatura, Asignatura, Carrera, DocenteMaestro, EstadoValidacion } from '../../data/mockData';

type RamoConInfo = SeccionAsignatura & { 
  asignatura?: Asignatura, 
  carrera?: Carrera,
  // Validations mock
  valBlackboard?: EstadoValidacion,
  valGuia?: EstadoValidacion,
  valNotas?: EstadoValidacion,
  coordinador?: Coordinador
};

export function DocenteRamos() {
  const [docente, setDocente] = useState<DocenteMaestro | null>(null);
  const [ramos, setRamos] = useState<RamoConInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const docenteIdRaw = sessionStorage.getItem('docenteId');
      if (!docenteIdRaw) return;
      const dId = Number(docenteIdRaw);

      const doc = await getDocente(dId);
      setDocente(doc);
      if (!doc) return;

      const { data: allGrupos } = await listGrupos();
      const { data: allCursos } = await listCursos();
      const { data: allCarreras } = await listCarreras();
      const allCoordinadores = await listCoordinadores();

      const misGrupos = allGrupos.filter(g => g.docenteId === dId);
      
      const ramosConInfo = misGrupos.map(g => {
        const curso = allCursos.find(c => c.id === g.asignaturaId);
        const carrera = allCarreras.find(c => 
          (curso as any)?.idCarrera 
            ? c.codigo === (curso as any).idCarrera 
            : c.id === curso?.carreraId
        );
        
        // Mock validations from mockSeccionesAsignaturas to simulate coordinator actions
        const mockInfo = mockSeccionesAsignaturas.find(m => m.id === g.id);

        const valNotasEstado = 
          (mockInfo?.notasIngresadas ?? 0) >= (mockInfo?.notasTotales ?? 1) && (mockInfo?.notasTotales ?? 0) > 0 
          ? 'Validado' 
          : 'Por Revisar';
          
        const coordinador = allCoordinadores.find(coord => coord.id_carrera === carrera?.codigo);

        return {
          ...g,
          asignatura: curso,
          carrera: carrera,
          coordinador: coordinador,
          valBlackboard: mockInfo?.contenidoBlackboard ?? 'Por Revisar',
          valGuia: mockInfo?.guiaAprendizaje ?? 'Por Revisar',
          valNotas: valNotasEstado as EstadoValidacion
        };
      });

      setRamos(ramosConInfo);
    } catch (error) {
      console.error("Error cargando ramos", error);
      toast.error('Error al cargar ramos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-gray-500">Cargando ramos...</div>
      </div>
    );
  }

  const renderBadge = (estado?: EstadoValidacion) => {
    if (estado === 'Validado') {
      return (
        <Badge variant="default" className="bg-green-600 gap-1">
          <CheckCircle className="h-3 w-3" />
          Validado
        </Badge>
      );
    }
    if (estado === 'Por Revisar') {
      return (
        <Badge variant="outline" className="border-amber-500 text-amber-700 gap-1">
          <Clock className="h-3 w-3" />
          Pendiente
        </Badge>
      );
    }
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertCircle className="h-3 w-3" />
        Inexistente
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mis Ramos</h1>
        <p className="mt-2 text-gray-600">
          Revise sus asignaturas asignadas y el estado de las validaciones de coordinación.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {ramos.map((ramo) => (
          <Card key={ramo.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    {ramo.asignatura?.nombre ?? 'Asignatura sin nombre'}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {ramo.carrera?.nombre ?? 'Carrera no especificada'}
                    {ramo.coordinador?.nombre && ` - Coord: ${ramo.coordinador.nombre}`}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Sección:</span>
                    <p className="font-medium">{ramo.seccion}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Jornada:</span>
                    <p className="font-medium">{ramo.carrera?.jornada ?? '—'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Sigla:</span>
                    <p className="font-medium">{ramo.asignatura?.idCurso ?? '—'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Horas Totales:</span>
                    <p className="font-medium">{ramo.horasP + ramo.horasM + ramo.horasA}h</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="mb-3 text-sm font-semibold text-gray-700">Validaciones de Coordinación</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Guía de Aprendizaje</span>
                      {renderBadge(ramo.valGuia)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Contenido Blackboard</span>
                      {renderBadge(ramo.valBlackboard)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Notas Ingresadas</span>
                      {renderBadge(ramo.valNotas)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {ramos.length === 0 && (
          <div className="col-span-full rounded-lg border-2 border-dashed p-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No hay ramos asignados</h3>
            <p className="mt-2 text-gray-500">
              Actualmente no tiene asignaturas asignadas para el semestre en curso.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
