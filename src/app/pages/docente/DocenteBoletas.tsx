import { useState, useRef, useEffect, useMemo } from 'react';
import { FileText, Download, Eye, AlertCircle, Upload, CheckCircle2, MessageSquare, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../components/ui/select';
import { toast } from 'sonner';

import { getDocente } from '../../data/docentes';
import { listPropuestas } from '../../data/propuestas';
import { listPagos, updatePago } from '../../data/pagos';
import { listCursos } from '../../data/cursos';
import { listGrupos } from '../../data/grupos';
import { uploadFisico, deleteArchivo, listArchivos, type Archivo } from '../../data/archivos';
import type { DocenteMaestro, Asignatura } from '../../data/mockData';

export function DocenteBoletas() {
  const [docente, setDocente] = useState<DocenteMaestro | null>(null);
  const [pagos, setPagos] = useState<any[]>([]);
  const [propuestas, setPropuestas] = useState<any[]>([]);
  const [archivos, setArchivos] = useState<Archivo[]>([]);
  const [misCursosAsignados, setMisCursosAsignados] = useState<Asignatura[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<string>('');
  const [archivoSelect, setArchivoSelect] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    try {
      const docenteIdRaw = sessionStorage.getItem('docenteId');
      if (!docenteIdRaw) return;
      const dId = Number(docenteIdRaw);
      
      const [d, propsRes, pagosRes, archsRes, gruposRes, cursosRes] = await Promise.all([
        getDocente(dId),
        listPropuestas(),
        listPagos(),
        listArchivos(),
        listGrupos(),
        listCursos()
      ]);

      if (d) setDocente(d);
      
      const misPropuestas = propsRes.data.filter((p: any) => p.docenteId === dId);
      const misPropuestasIds = new Set(misPropuestas.map((p: any) => p.id));
      
      const misPagos = pagosRes.data.filter((p: any) => misPropuestasIds.has(p.propuestaId));
      
      const misGrupos = gruposRes.data.filter(g => g.docenteId === dId);
      const misCursosSet = new Set(misGrupos.map(g => g.asignaturaId));
      const misCursos = cursosRes.data.filter(c => misCursosSet.has(c.id));
      setMisCursosAsignados(misCursos);
      
      setPropuestas(misPropuestas);
      setPagos(misPagos);
      if (d) {
        setArchivos(archsRes.filter(a => a.correoUsuario === d.correo && a.ruta.includes('boleta_')));
      }
    } catch (err) {
      console.error(err);
      toast.error('Error cargando boletas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const cuotasPendientes = useMemo(() => {
    const monthMap: Record<string, number> = {
      enero: 0, febrero: 1, marzo: 2, abril: 3,
      mayo: 4, junio: 5, julio: 6, agosto: 7,
      septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
    };
    
    // Obtenemos el mes actual (0 = enero, 11 = diciembre)
    const currentMonth = new Date().getMonth();

    return pagos.filter(p => {
      // Usar boletaEstado (mapeado de estado_boleta en pagos.ts)
      const isPending = p.boletaEstado === 'Faltante' || p.boletaEstado === 'Con Observación';
      
      const cuotaMonth = monthMap[p.mes?.toLowerCase()] ?? 11;
      
      // La regla de negocio indica que no se pueden subir boletas futuras.
      // Solo se permiten meses <= al mes actual. 
      // (Si estamos en Enero/Febrero, permitimos cerrar pagos rezagados de Nov/Dic del año anterior).
      let isPastOrCurrent = cuotaMonth <= currentMonth;
      if (currentMonth <= 1 && cuotaMonth >= 10) {
        isPastOrCurrent = true;
      }

      return isPending && isPastOrCurrent;
    });
  }, [pagos]);

  const handleArchivoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setArchivoSelect(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('El archivo supera los 5 MB');
      event.target.value = '';
      return;
    }
    setArchivoSelect(file);
  };

  const handleSubmit = async () => {
    if (!periodoSeleccionado || !archivoSelect || !docente) {
      toast.error('Seleccione un periodo y archivo');
      return;
    }

    try {
      const pago = pagos.find(p => String(p.id) === periodoSeleccionado);
      const ruta = `uploads/boletas/${docente.rut}_boleta_${pago?.mes}_${Date.now()}.pdf`;

      await uploadFisico(archivoSelect, docente.correo, ruta);
      
      // Update the pago to mark the boleta as 'Subida' and clear any observations
      if (pago) {
        await updatePago(pago.id, { boletaEstado: 'Subida', notas: null });
      }
      
      toast.success('Boleta subida exitosamente');
      setPeriodoSeleccionado('');
      setArchivoSelect(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error('Error subiendo boleta');
    }
  };

  const handleDeleteBoleta = async (id: number, archivoRuta: string) => {
    try {
      await deleteArchivo(id);
      
      // Intentar extraer el mes del nombre del archivo y revertir el pago a Faltante
      // ruta = uploads/boletas/12345678_boleta_abril_123456.pdf
      const parts = archivoRuta.split('_boleta_');
      if (parts.length > 1) {
        const mes = parts[1].split('_')[0]; // 'abril'
        const pagoAsociado = pagos.find(p => p.mes.toLowerCase() === mes.toLowerCase());
        if (pagoAsociado) {
          await updatePago(pagoAsociado.id, { boletaEstado: 'Faltante' });
        }
      }

      toast.success('Boleta eliminada');
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error('Error eliminando boleta');
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Cargando...</div>;
  }

  if (!docente) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-600">Docente no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mis Boletas</h1>
        <p className="mt-2 text-gray-600">
          Gestione sus boletas de honorarios y documentos de pago
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-green-600" />
            Subir Nueva Boleta
          </CardTitle>
          <CardDescription>
            Seleccione el periodo de la cuota y cargue el archivo PDF
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="periodo-boleta">
              Periodo de la cuota <span className="text-red-500">*</span>
            </Label>
            <Select value={periodoSeleccionado} onValueChange={setPeriodoSeleccionado}>
              <SelectTrigger id="periodo-boleta">
                <SelectValue placeholder="Seleccione el periodo de la cuota..." />
              </SelectTrigger>
              <SelectContent>
                {cuotasPendientes.map(cuota => {
                  const cursoNames = misCursosAsignados.map(c => c.nombre).join(', ');
                  const detalleCursos = cursoNames ? ` - ${cursoNames}` : '';
                  return (
                    <SelectItem key={cuota.id} value={String(cuota.id)}>
                      <span className="font-medium capitalize">{cuota.mes}{detalleCursos}</span>
                      <span className="ml-2 text-xs text-gray-500">
                         · Propuesta ID: {cuota.propuestaId}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="archivo-boleta">
              Archivo PDF <span className="text-red-500">*</span>
            </Label>
            <Input
              id="archivo-boleta"
              type="file"
              accept=".pdf"
              ref={fileInputRef}
              onChange={handleArchivoChange}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!periodoSeleccionado || !archivoSelect}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Upload className="mr-2 h-4 w-4" />
            Subir Boleta
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Boletas Registradas</CardTitle>
          <CardDescription>Historial de boletas subidas al sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {archivos.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-600">No hay boletas registradas</p>
            </div>
          ) : (
            archivos.map((archivo) => {
              const parts = archivo.ruta.split('_boleta_');
              const mes = parts.length > 1 ? parts[1].split('_')[0] : '';
              const pagoAsociado = pagos.find(p => p.mes.toLowerCase() === mes.toLowerCase());
              
              const isObservada = pagoAsociado?.boletaEstado === 'Con Observación';
              const isProcesada = pagoAsociado?.boletaEstado === 'Procesada';
              
              return (
                <div key={archivo.id} className={`rounded-lg border p-4 ${isObservada ? 'bg-red-50 border-red-200' : 'hover:bg-gray-50'}`}>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{archivo.nombre}</h4>
                        {isObservada ? (
                          <Badge variant="destructive">Con Observación</Badge>
                        ) : isProcesada ? (
                          <Badge variant="default" className="bg-blue-600">Aprobada</Badge>
                        ) : (
                          <Badge variant="default" className="bg-green-600">Subida</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Ruta: {archivo.ruta}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteBoleta(archivo.id, archivo.ruta)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                  {isObservada && pagoAsociado?.notas && (
                    <div className="mt-4 rounded-md bg-red-100 p-3 text-sm text-red-900 border border-red-200">
                      <div className="font-semibold mb-1 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" /> Mensaje de administración:
                      </div>
                      {pagoAsociado.notas}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
