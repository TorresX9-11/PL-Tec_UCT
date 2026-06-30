import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Eye,
  FileText,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Download,
  ClipboardCheck,
  XCircle,
  Inbox
} from 'lucide-react';
import {
  type CuotaConContexto,
  type Boleta,
  type CuotaMensual
} from '../../data/mockData';
import { listPagos, updatePago } from '../../data/pagos';
import { listPropuestas } from '../../data/propuestas';
import { listDocentes } from '../../data/docentes';
import { listArchivos, Archivo } from '../../data/archivos';
import {
  DialogVerPdf,
  DialogRevisarBoleta,
  DialogNotaBoleta,
} from '../../components/shared/AdminBoletaDialogs';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../components/ui/select';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel
} from '../../components/ui/alert-dialog';
import { toast } from 'sonner';

// ============================================================================
//   Tipos auxiliares de UI
// ============================================================================

type DialogState =
  | { tipo: 'pdf'; ctx: CuotaConContexto }
  | { tipo: 'revisar'; ctx: CuotaConContexto }
  | { tipo: 'nota'; ctx: CuotaConContexto }
  | null;

// Orden de prioridad para que las cuotas que requieren acción aparezcan arriba.
const ORDEN_PRIORIDAD: Record<string, number> = {
  'Subida': 0,           // boleta recién subida → revisar urgente
  'Con Observación': 1,  // ya marcada, esperando que el docente corrija
  'Inexistente': 2,      // sin boleta todavía
  'Procesada': 3         // ya validada
};

// ============================================================================
//   Componente principal
// ============================================================================

export function BandejaBoletas() {
  const [version, setVersion] = useState(0);
  const [cuotasBackend, setCuotasBackend] = useState<CuotaMensual[]>([]);
  const [propuestasBackend, setPropuestasBackend] = useState<any[]>([]);
  const [docentesBackend, setDocentesBackend] = useState<any[]>([]);
  const [archivosBackend, setArchivosBackend] = useState<Archivo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [pagosRes, propRes, docRes, archRes] = await Promise.all([
        listPagos(),
        listPropuestas(),
        listDocentes(),
        listArchivos()
      ]);
      setCuotasBackend(pagosRes.data);
      setPropuestasBackend(propRes.data);
      setDocentesBackend(docRes.data);
      setArchivosBackend(archRes);
    } catch (e) {
      console.error(e);
      toast.error('Error al cargar pagos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const handler = () => setVersion(v => v + 1);
    window.addEventListener('mensajes-admin:update', handler);
    window.addEventListener('pagos:update', handler);
    return () => {
      window.removeEventListener('mensajes-admin:update', handler);
      window.removeEventListener('pagos:update', handler);
    };
  }, [version]);

  const [searchTerm, setSearchTerm] = useState('');
  const [estadoBoletaFiltro, setEstadoBoletaFiltro] = useState<string>('todos');
  const [estadoPagoFiltro, setEstadoPagoFiltro] = useState<string>('todos');
  const [dialog, setDialog] = useState<DialogState>(null);

  // Carga TODAS las cuotas del semestre activo con contexto enriquecido.
  const cuotas = useMemo<CuotaConContexto[]>(() => {
    return cuotasBackend.map(pago => {
      const propuesta = propuestasBackend.find(p => p.id === pago.propuestaId);
      const docenteId = propuesta?.docenteId ?? 0;
      const docente = docentesBackend.find(d => d.id === docenteId) ?? {
        id: 0,
        rut: '0-0',
        dv: '0',
        nombreCompleto: 'Desconocido',
        correo: '',
        contacto: ''
      };

      const tieneBoleta = pago.boletaEstado !== 'Inexistente' && pago.boletaEstado !== 'Faltante';
      
      let archivoBoleta: Archivo | undefined;
      if (tieneBoleta) {
        archivoBoleta = archivosBackend
          .filter(a => a.correoUsuario === docente.correo && a.ruta.includes(`_boleta_${pago.mes.toLowerCase()}_`))
          .sort((a, b) => b.id - a.id)[0];
      }
      
      const boleta: Boleta | undefined = tieneBoleta ? {
        id: archivoBoleta ? archivoBoleta.id : (pago.id * 100),
        docenteId: docenteId,
        mes: pago.mes,
        año: 2026,
        estado: (pago.boletaEstado === 'Faltante' ? 'Subida' : pago.boletaEstado) as Boleta['estado'],
        fecha: archivoBoleta ? (archivoBoleta.fechaSubida?.split('T')[0] ?? pago.fechaPago ?? new Date().toISOString().split('T')[0]) : (pago.fechaPago ?? new Date().toISOString().split('T')[0]),
        url: archivoBoleta ? `http://localhost:3001/${archivoBoleta.ruta}` : '',
        nombre: archivoBoleta ? archivoBoleta.nombre : `boleta_${pago.mes}.pdf`,
        observaciones: pago.notas ?? undefined
      } : undefined;

      // Calculate actual cuota number based on index for this proposal
      const cuotasPropuesta = cuotasBackend.filter(c => c.propuestaId === pago.propuestaId);
      const cuotaIndex = cuotasPropuesta.findIndex(c => c.id === pago.id);

      // Ensure that CuotaMensual has all necessary properties
      const enrichedCuota: CuotaMensual = {
        ...pago,
        numeroCuota: cuotaIndex >= 0 ? cuotaIndex + 1 : 1,
        montoBruto: propuesta ? Math.round(propuesta.montoTotalPropuesta / propuesta.numeroCuotas) : 0,
        docenteId,
        valorCuotaBruto: propuesta ? Math.round(propuesta.montoTotalPropuesta / propuesta.numeroCuotas) : 0,
      };

      return {
        cuota: enrichedCuota,
        docente,
        boleta
      };
    });
  }, [cuotasBackend, propuestasBackend, docentesBackend]);

  // Filtros combinados (AND).
  const filtradas = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return cuotas
      .filter(c => {
        const matchSearch =
          !term ||
          c.docente.nombreCompleto.toLowerCase().includes(term) ||
          c.docente.rut.includes(term);
        const estadoBoleta = c.cuota.boletaEstado ?? 'Inexistente';
        const matchBoleta =
          estadoBoletaFiltro === 'todos' || 
          estadoBoleta === estadoBoletaFiltro ||
          (estadoBoletaFiltro === 'Inexistente' && estadoBoleta === 'Faltante');
        const matchPago =
          estadoPagoFiltro === 'todos' || c.cuota.estadoPago === estadoPagoFiltro;
        return matchSearch && matchBoleta && matchPago;
      })
      .sort((a, b) => {
        const ea = a.cuota.boletaEstado ?? 'Inexistente';
        const eb = b.cuota.boletaEstado ?? 'Inexistente';
        const diffPrio = (ORDEN_PRIORIDAD[ea] ?? 9) - (ORDEN_PRIORIDAD[eb] ?? 9);
        if (diffPrio !== 0) return diffPrio;
        // Dentro del mismo grupo, primero las más recientes (por fecha de boleta)
        const fa = a.boleta?.fecha ?? '0';
        const fb = b.boleta?.fecha ?? '0';
        return fb.localeCompare(fa);
      });
  }, [cuotas, searchTerm, estadoBoletaFiltro, estadoPagoFiltro]);

  // Stats globales (no aplican los filtros: muestran el panorama total).
  const stats = useMemo(() => {
    const c = cuotas;
    return {
      total: c.length,
      pendientesRevision: c.filter(x => x.cuota.boletaEstado === 'Subida').length,
      conObservacion: c.filter(x => x.cuota.boletaEstado === 'Con Observación').length,
      pagadas: c.filter(x => x.cuota.estadoPago === 'Pagada').length,
      sinBoleta: c.filter(x => !x.cuota.boletaId || x.cuota.boletaEstado === 'Inexistente')
        .length
    };
  }, [cuotas]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Bandeja de Boletas y Pagos</h2>
        <p className="mt-1 text-sm text-gray-600">
          Workflow del administrador de pagos: revisar boletas subidas por docentes,
          aprobar o solicitar correcciones, y registrar el pago de cada cuota.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          icon={<Inbox className="h-4 w-4" />}
          label="Por revisar"
          value={stats.pendientesRevision}
          tone="amber"
          hint="Boletas recién subidas"
        />
        <StatCard
          icon={<AlertCircle className="h-4 w-4" />}
          label="Con observación"
          value={stats.conObservacion}
          tone="orange"
          hint="Esperando corrección del docente"
        />
        <StatCard
          icon={<FileText className="h-4 w-4" />}
          label="Sin boleta"
          value={stats.sinBoleta}
          tone="gray"
          hint="Cuotas aún sin documento"
        />
        <StatCard
          icon={<CheckCircle className="h-4 w-4" />}
          label="Cuotas pagadas"
          value={`${stats.pagadas} / ${stats.total}`}
          tone="green"
          hint="Pagos registrados"
        />
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3">
            <div className="relative min-w-[240px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar por nombre o RUT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={estadoBoletaFiltro} onValueChange={setEstadoBoletaFiltro}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Estado boleta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados de boleta</SelectItem>
                <SelectItem value="Subida">Subida (por revisar)</SelectItem>
                <SelectItem value="Procesada">Procesada</SelectItem>
                <SelectItem value="Con Observación">Con Observación</SelectItem>
                <SelectItem value="Inexistente">Sin boleta</SelectItem>
              </SelectContent>
            </Select>
            <Select value={estadoPagoFiltro} onValueChange={setEstadoPagoFiltro}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Estado pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados de pago</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="Pagada">Pagada</SelectItem>
              </SelectContent>
            </Select>
            {(searchTerm || estadoBoletaFiltro !== 'todos' || estadoPagoFiltro !== 'todos') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setEstadoBoletaFiltro('todos');
                  setEstadoPagoFiltro('todos');
                }}
              >
                Limpiar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle>
            Boletas y Cuotas{' '}
            <span className="text-sm font-normal text-gray-500">
              ({filtradas.length} de {cuotas.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filtradas.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              No hay cuotas que coincidan con los filtros aplicados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Docente</TableHead>
                    <TableHead>Mes / Cuota</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead>Boleta</TableHead>
                    <TableHead>Estado boleta</TableHead>
                    <TableHead>Estado pago</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtradas.map((row) => (
                    <FilaCuota
                      key={row.cuota.id}
                      row={row}
                      onAccion={setDialog}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogos */}
      <DialogVerPdf
        open={dialog?.tipo === 'pdf'}
        cuota={dialog?.tipo === 'pdf' && dialog.ctx ? dialog.ctx.cuota : null}
        docenteNombre={dialog?.tipo === 'pdf' && dialog.ctx ? dialog.ctx.docente.nombreCompleto : ''}
        boletaPreview={dialog?.tipo === 'pdf' && dialog.ctx?.boleta ? { nombre: dialog.ctx.boleta.nombre, fecha: dialog.ctx.boleta.fecha, url: dialog.ctx.boleta.url } : undefined}
        observaciones={dialog?.tipo === 'pdf' && dialog.ctx?.boleta?.observaciones ? dialog.ctx.boleta.observaciones : undefined}
        onClose={() => setDialog(null)}
      />
      <DialogRevisarBoleta
        open={dialog?.tipo === 'revisar'}
        cuota={dialog?.tipo === 'revisar' && dialog.ctx ? dialog.ctx.cuota : null}
        docenteNombre={dialog?.tipo === 'revisar' && dialog.ctx ? dialog.ctx.docente.nombreCompleto : ''}
        onClose={() => setDialog(null)}
      />
      <DialogNotaBoleta
        open={dialog?.tipo === 'nota'}
        cuota={dialog?.tipo === 'nota' && dialog.ctx ? dialog.ctx.cuota : null}
        onClose={() => setDialog(null)}
      />
    </div>
  );
}

// ============================================================================
//   Subcomponentes
// ============================================================================

function StatCard({
  icon,
  label,
  value,
  tone,
  hint
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  tone: 'amber' | 'orange' | 'gray' | 'green';
  hint?: string;
}) {
  const tones: Record<string, string> = {
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    gray: 'bg-gray-50 text-gray-700 border-gray-200',
    green: 'bg-green-50 text-green-700 border-green-200'
  };
  return (
    <Card className={tones[tone]}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          {icon}
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {hint && <p className="text-xs opacity-80">{hint}</p>}
      </CardContent>
    </Card>
  );
}

const fmtCLP = (n: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);

function badgeBoleta(estado: NonNullable<CuotaMensual['boletaEstado']>) {
  const config: Record<string, { cls: string; icon: React.ReactNode; label: string }> = {
    'Subida': {
      cls: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: <Inbox className="mr-1 h-3 w-3" />,
      label: 'Por revisar'
    },
    'Procesada': {
      cls: 'bg-green-100 text-green-800 border-green-300',
      icon: <CheckCircle className="mr-1 h-3 w-3" />,
      label: 'Procesada'
    },
    'Con Observación': {
      cls: 'bg-orange-100 text-orange-800 border-orange-300',
      icon: <AlertCircle className="mr-1 h-3 w-3" />,
      label: 'Con observación'
    },
    'Inexistente': {
      cls: 'bg-gray-100 text-gray-600 border-gray-300',
      icon: <XCircle className="mr-1 h-3 w-3" />,
      label: 'Sin boleta'
    }
  };
  const c = config[estado] ?? config['Inexistente'];
  return (
    <Badge variant="outline" className={c.cls}>
      {c.icon}
      {c.label}
    </Badge>
  );
}

function badgePago(estado: CuotaMensual['estadoPago']) {
  return estado === 'Pagada' ? (
    <Badge className="bg-green-600 hover:bg-green-700">
      <CheckCircle className="mr-1 h-3 w-3" /> Pagada
    </Badge>
  ) : (
    <Badge variant="destructive">
      <AlertCircle className="mr-1 h-3 w-3" /> Pendiente
    </Badge>
  );
}

function FilaCuota({
  row,
  onAccion
}: {
  row: CuotaConContexto;
  onAccion: (s: DialogState) => void;
}) {
  const { cuota, docente, boleta } = row;
  const estadoBoleta = cuota.boletaEstado ?? 'Inexistente';
  const tieneBoleta = !!boleta;

  const tieneMensaje = Boolean(cuota.notas);

  // Workflow de pago simplificado: toggle Pagado / Sin pago con confirmación.
  const [confirmPagoOpen, setConfirmPagoOpen] = useState(false);
  const pagada = cuota.estadoPago === 'Pagada';

  const confirmarPago = async () => {
    try {
      if (pagada) {
        await updatePago(cuota.id, { estadoPago: 'Pendiente', fechaPago: null });
        toast.success('Pago revertido a Pendiente.');
      } else {
        await updatePago(cuota.id, {
          estadoPago: 'Pagada',
          fechaPago: new Date().toISOString().split('T')[0]
        });
        toast.success(`Pago registrado: ${cuota.mes} · ${docente.nombreCompleto}`);
      }
      window.dispatchEvent(new Event('pagos:update'));
    } catch (e) {
      toast.error('Error al actualizar el pago');
    }
    setConfirmPagoOpen(false);
  };

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{docente.nombreCompleto}</div>
        <div className="font-mono text-xs text-gray-500">{docente.rut}-{docente.dv}</div>
      </TableCell>
      <TableCell>
        <div className="font-medium">{cuota.mes}</div>
        <div className="text-xs text-gray-500">Cuota {cuota.numeroCuota}</div>
      </TableCell>
      <TableCell className="text-right font-medium">{fmtCLP(cuota.montoBruto)}</TableCell>
      <TableCell>
        {tieneBoleta ? (
          <div>
            <div className="flex items-center gap-1.5 text-sm">
              <FileText className="h-3.5 w-3.5 text-blue-600" />
              <span className="font-medium">{boleta!.nombre}</span>
            </div>
            <div className="text-xs text-gray-500">Subida: {boleta!.fecha}</div>
          </div>
        ) : (
          <span className="text-sm italic text-gray-400">— sin boleta —</span>
        )}
      </TableCell>
      <TableCell>{badgeBoleta(estadoBoleta)}</TableCell>
      <TableCell>
        {badgePago(cuota.estadoPago)}
        {cuota.estadoPago === 'Pagada' && cuota.fechaPago && (
          <div className="mt-1 text-xs text-gray-500">{cuota.fechaPago}</div>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            title="Ver PDF de la boleta"
            disabled={!tieneBoleta}
            onClick={() => onAccion({ tipo: 'pdf', ctx: row })}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            title="Revisar boleta (aprobar / observar)"
            disabled={!tieneBoleta}
            onClick={() => onAccion({ tipo: 'revisar', ctx: row })}
          >
            <ClipboardCheck className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            title={tieneMensaje ? 'Editar nota' : 'Dejar nota al docente'}
            disabled={!tieneBoleta}
            onClick={() => onAccion({ tipo: 'nota', ctx: row })}
          >
            <MessageSquare className={`h-4 w-4 ${tieneMensaje ? 'text-blue-600' : 'text-gray-400'}`} />
            {tieneMensaje && (
              <span className="ml-1 inline-block h-2 w-2 rounded-full bg-blue-600" />
            )}
          </Button>
          <AlertDialog open={confirmPagoOpen} onOpenChange={setConfirmPagoOpen}>
            <AlertDialogTrigger asChild>
              {pagada ? (
                <Button
                  variant="default"
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  title="Pagado — clic para revertir"
                >
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Pagado
                </Button>
              ) : (
                <Button variant="outline" size="sm" title="Marcar como pagado">
                  <XCircle className="mr-1 h-4 w-4" />
                  Sin pago
                </Button>
              )}
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{pagada ? 'Revertir pago' : 'Confirmar pago'}</AlertDialogTitle>
                <AlertDialogDescription>
                  {pagada
                    ? '¿Confirmas revertir esta cuota a Pendiente? Se limpiará la fecha de pago.'
                    : '¿Confirmas que esta cuota fue pagada? Se registrará la fecha de hoy.'}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={confirmarPago}>Confirmar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
}


