import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { 
  Building2, 
  User, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';

import { listCarreras } from '../../data/carreras';
import { listCoordinadores, updateCoordinador, type Coordinador } from '../../data/coordinadores';

export function SupervisorDashboard() {
  const navigate = useNavigate();

  const [carreras, setCarreras] = useState<{id_carrera: string; nombre: string}[]>([]);
  const [coordinadores, setCoordinadores] = useState<Coordinador[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para el Modal de Asignación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [carreraSeleccionada, setCarreraSeleccionada] = useState<{id_carrera: string; nombre: string} | null>(null);
  const [coordinadorIdAAsignar, setCoordinadorIdAAsignar] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [carrRes, coordRes] = await Promise.all([
        listCarreras(),
        listCoordinadores()
      ]);
      setCarreras(carrRes.data.map(c => ({ id_carrera: c.codigo, nombre: c.nombre })));
      setCoordinadores(coordRes);
    } catch (error) {
      toast.error('Error al cargar dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getCoordinadorByCarrera = (idCarrera: string) => {
    return coordinadores.find(c => c.id_carrera === idCarrera);
  };

  const abrirModalAsignacion = (carrera: {id_carrera: string; nombre: string}) => {
    setCarreraSeleccionada(carrera);
    const coordinadorActual = getCoordinadorByCarrera(carrera.id_carrera);
    setCoordinadorIdAAsignar(coordinadorActual ? coordinadorActual.id_coordinador.toString() : 'sin_asignar');
    setIsModalOpen(true);
  };

  const guardarAsignacion = async () => {
    if (!carreraSeleccionada) return;

    try {
      const prevCoord = getCoordinadorByCarrera(carreraSeleccionada.id_carrera);
      const newCoordId = parseInt(coordinadorIdAAsignar);

      if (prevCoord && prevCoord.id_coordinador !== newCoordId) {
        // Remove carrera from prev
        await updateCoordinador(prevCoord.id_coordinador, { id_carrera: null });
      }

      if (!isNaN(newCoordId)) {
        // Assign to new
        await updateCoordinador(newCoordId, { id_carrera: carreraSeleccionada.id_carrera });
      }

      await loadData();
      toast.success(`Asignación actualizada para ${carreraSeleccionada.nombre}`);
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Ocurrió un error al guardar la asignación');
    }
  };

  const handleSupervisar = (carrera: {id_carrera: string; nombre: string}) => {
    const coordinador = getCoordinadorByCarrera(carrera.id_carrera);
    if (!coordinador) {
      toast.error('No se puede supervisar una carrera sin coordinador asignado.');
      return;
    }

    sessionStorage.setItem('userRole', 'admin_academico');
    sessionStorage.setItem('userName', coordinador.nombre);
    sessionStorage.setItem('supervisandoCarreraId', carrera.id_carrera);
    sessionStorage.setItem('supervisandoCarreraNombre', carrera.nombre);
    sessionStorage.setItem('modoSupervision', '1');

    toast.success(`Modo Supervisión: ${carrera.nombre}`);
    navigate('/academico/dashboard');
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Cargando dashboard...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-300">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard de Carreras</h2>
        <p className="text-gray-600">
          Supervise las carreras impartidas y gestione la asignación de sus coordinadores.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {carreras.map((carrera) => {
          const coord = getCoordinadorByCarrera(carrera.id_carrera);

          return (
            <Card key={carrera.id_carrera} className="flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <Building2 className="h-6 w-6 text-indigo-600" />
                  </div>
                  {coord ? (
                    <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
                      Asignada
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      Sin Coordinador
                    </Badge>
                  )}
                </div>
                <CardTitle className="mt-4 text-lg">{carrera.nombre}</CardTitle>
                <CardDescription>Cód: {carrera.id_carrera}</CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1">
                <div className="rounded-md border bg-gray-50 p-3">
                  <Label className="text-xs text-gray-500 mb-1 block">Coordinador a cargo</Label>
                  {coord ? (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-700" />
                      <span className="text-sm font-medium text-gray-900">{coord.nombre}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-400">
                      <ShieldAlert className="h-4 w-4" />
                      <span className="text-sm italic">Pendiente de asignación</span>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex gap-2 pt-0">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => abrirModalAsignacion(carrera)}
                >
                  {coord ? 'Cambiar' : 'Asignar'}
                </Button>
                <Button 
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  disabled={!coord}
                  onClick={() => handleSupervisar(carrera)}
                >
                  Supervisar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Asignar Coordinador</DialogTitle>
            <DialogDescription>
              Seleccione el coordinador que estará a cargo de <strong>{carreraSeleccionada?.nombre}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="coordinador" className="mb-2 block">
              Coordinador disponible
            </Label>
            <Select 
              value={coordinadorIdAAsignar} 
              onValueChange={setCoordinadorIdAAsignar}
            >
              <SelectTrigger id="coordinador">
                <SelectValue placeholder="Seleccione un coordinador..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sin_asignar" className="text-red-500 italic">
                  Quitar asignación actual
                </SelectItem>
                {coordinadores.map((coord) => {
                  const estaAsignado = coord.id_carrera && coord.id_carrera !== carreraSeleccionada?.id_carrera;
                  return (
                    <SelectItem 
                      key={coord.id_coordinador} 
                      value={coord.id_coordinador.toString()}
                      disabled={!!estaAsignado}
                    >
                      {coord.nombre} {estaAsignado ? '(Ya asignado a otra carrera)' : ''}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-2">
              Un coordinador solo puede estar a cargo de una carrera a la vez. Si el coordinador que busca está deshabilitado, primero debe desvincularlo de su carrera actual.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={guardarAsignacion} className="bg-indigo-600 hover:bg-indigo-700">
              Guardar Asignación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
