import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { 
  Building2, 
  User, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { 
  mockCarrerasDisponibles, 
  mockCoordinadores,
  type CarreraDisponible,
  type Coordinador 
} from '../../data/mockData';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';

export function SupervisorDashboard() {
  const navigate = useNavigate();

  // En un entorno real, estos estados provendrían del backend (y useEffect)
  const [carreras] = useState<CarreraDisponible[]>(mockCarrerasDisponibles);
  // Mantendremos una versión local de los coordinadores para actualizarla en la UI
  const [coordinadores, setCoordinadores] = useState<Coordinador[]>(mockCoordinadores);
  
  // Estados para el Modal de Asignación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [carreraSeleccionada, setCarreraSeleccionada] = useState<CarreraDisponible | null>(null);
  const [coordinadorIdAAsignar, setCoordinadorIdAAsignar] = useState<string>('');

  // Encontrar el coordinador actual de una carrera (si tiene)
  const getCoordinadorByCarrera = (idCarrera: string) => {
    return coordinadores.find(c => c.id_carrera === idCarrera);
  };

  const abrirModalAsignacion = (carrera: CarreraDisponible) => {
    setCarreraSeleccionada(carrera);
    const coordinadorActual = getCoordinadorByCarrera(carrera.id_carrera);
    setCoordinadorIdAAsignar(coordinadorActual ? coordinadorActual.id_coordinador.toString() : 'sin_asignar');
    setIsModalOpen(true);
  };

  const guardarAsignacion = () => {
    if (!carreraSeleccionada) return;

    // Actualizar el array local
    const nuevosCoordinadores = coordinadores.map(coord => {
      // Si este coordinador era el asignado a esta carrera, se lo quitamos
      if (coord.id_carrera === carreraSeleccionada.id_carrera) {
        return { ...coord, id_carrera: null };
      }
      
      // Si este es el nuevo coordinador que estamos asignando
      if (coord.id_coordinador.toString() === coordinadorIdAAsignar) {
        return { ...coord, id_carrera: carreraSeleccionada.id_carrera };
      }

      return coord;
    });

    setCoordinadores(nuevosCoordinadores);
    // En un entorno real haríamos un POST/PUT a la API aquí
    
    toast.success(`Coordinador asignado a ${carreraSeleccionada.nombre} exitosamente.`);
    setIsModalOpen(false);
  };

  const handleSupervisar = (carrera: CarreraDisponible) => {
    // 1. Validar que la carrera tenga un coordinador
    const coordinador = getCoordinadorByCarrera(carrera.id_carrera);
    if (!coordinador) {
      toast.error('No se puede supervisar una carrera sin coordinador asignado.');
      return;
    }

    // 2. Preparar el entorno para que "AcademicLayout" / "AcademicDashboard" sepa quién somos
    // Estamos simulando ser el Coordinador (Administrador Académico)
    sessionStorage.setItem('userRole', 'admin_academico');
    sessionStorage.setItem('userName', coordinador.nombre);
    
    // Dejamos una variable extra para saber qué carrera estamos filtrando o si somos supervisor
    sessionStorage.setItem('supervisandoCarreraId', carrera.id_carrera);
    sessionStorage.setItem('supervisandoCarreraNombre', carrera.nombre);
    sessionStorage.setItem('modoSupervision', '1');

    toast.success(`Modo Supervisión: ${carrera.nombre}`);
    
    // 3. Redirigir al dashboard de "Área Académica" (la vista del coordinador)
    navigate('/academico/dashboard');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard de Carreras</h2>
        <p className="text-gray-600">
          Supervise las carreras impartidas y gestione la asignación de sus coordinadores.
        </p>
      </div>

      {/* Grid de Carreras */}
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
                  className="flex-1 text-xs px-2"
                  onClick={() => abrirModalAsignacion(carrera)}
                >
                  Asignar
                </Button>
                <Button 
                  className="flex-1 text-xs px-2 bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => handleSupervisar(carrera)}
                  disabled={!coord}
                  title={!coord ? "Asigne un coordinador primero" : "Supervisar esta carrera"}
                >
                  Supervisar
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Modal para Asignar Coordinador */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar Coordinador</DialogTitle>
            <DialogDescription>
              Seleccione el coordinador que estará a cargo de <strong>{carreraSeleccionada?.nombre}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label className="mb-2 block">Coordinadores Disponibles</Label>
            <Select 
              value={coordinadorIdAAsignar} 
              onValueChange={setCoordinadorIdAAsignar}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un coordinador..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sin_asignar" className="text-gray-500 italic">
                  -- Quitar asignación (Dejar vacío) --
                </SelectItem>
                {coordinadores.map(coord => (
                  <SelectItem key={coord.id_coordinador} value={coord.id_coordinador.toString()}>
                    {coord.nombre} {coord.id_carrera && coord.id_carrera !== carreraSeleccionada?.id_carrera ? ` (Actualmente en ${coord.id_carrera})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-2">
              Nota: Si el coordinador seleccionado ya tiene una carrera asignada, esta será reemplazada por la nueva asignación.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={guardarAsignacion} className="bg-indigo-600 hover:bg-indigo-700">
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
