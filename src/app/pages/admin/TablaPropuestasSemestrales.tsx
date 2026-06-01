import { useState, useMemo, useEffect } from 'react';
import { Search, Eye, FileText, DollarSign, AlertCircle, CheckCircle, Pencil, MessageSquare } from 'lucide-react';
import {
  mockPropuestasSemestrales,
  mockDocentesMaestros,
  mockSeccionesAsignaturas,
  mockAsignaturas,
  calcularPropuestaSemestral,
  getCuotasDocente,
  type PropuestaSemestral,
  type CuotaMensual
} from '../../data/mockData';
import {
  loadMensajes,
  setMensajeCuota,
  subscribeMensajes,
  type MensajesPorCuota
} from '../../data/mensajesAdmin';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';

const SEMESTRE_ACTUAL = 1;
const AÑO_ACTUAL = 2026;
const STORAGE_KEY_VALORES = 'valores_propuesta_manual';

// Overrides de demo: estado de pago/boletas que vienen del mock.
// Cuando exista el backend NestJS, este mapa se reemplaza por la data real.
const overridesDemo: Record<number, Partial<PropuestaSemestral>> = mockPropuestasSemestrales.reduce(
  (acc, p) => {
    acc[p.docenteId] = {
      estadoPago: p.estadoPago,
      cuotasPagadas: p.cuotasPagadas,
      boletasSubidas: p.boletasSubidas,
      boletasEstado: p.boletasEstado,
      recepcionBHE: p.recepcionBHE
    };
    return acc;
  },
  {} as Record<number, Partial<PropuestaSemestral>>
);

export function TablaPropuestasSemestrales() {
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string>('todos');
  const [boletasFilter, setBoletasFilter] = useState<string>('todos');
  const [editValorOpen, setEditValorOpen] = useState(false);
  const [propuestaEnEdicion, setPropuestaEnEdicion] = useState<PropuestaSemestral | null>(null);
  const [valorInput, setValorInput] = useState<number>(0);

  // Valor total manual por docente (persistido en localStorage)
  const [valoresManuales, setValoresManuales] = useState<Record<number, number>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_VALORES);
      if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    // Seed inicial con los valores del mock para que la primera carga muestre datos
    return mockPropuestasSemestrales.reduce((acc, p) => {
      acc[p.docenteId] = p.montoTotalPropuesta;
      return acc;
    }, {} as Record<number, number>);
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_VALORES, JSON.stringify(valoresManuales));
  }, [valoresManuales]);

  // Recalcula propuestas en vivo a partir de las secciones asignadas + valor manual
  const propuestas = useMemo<PropuestaSemestral[]>(() => {
    const docenteIds = Array.from(
      new Set(
        mockSeccionesAsignaturas
          .map(s => s.docenteId)
          .filter((id): id is number => typeof id === 'number')
      )
    );
    return docenteIds
      .map(docenteId => {
        const valor = valoresManuales[docenteId] ?? 0;
        const base = calcularPropuestaSemestral(docenteId, SEMESTRE_ACTUAL, AÑO_ACTUAL, valor);
        if (base.totalHoras === 0) return null;
        const override = overridesDemo[docenteId] ?? {};
        const cuotasPagadas = override.cuotasPagadas ?? 0;
        const pagado = cuotasPagadas * base.valorCuotaBruto;
        return {
          ...base,
          ...override,
          saldo: Math.max(base.montoTotalPropuesta - pagado, 0)
        } as PropuestaSemestral;
      })
      .filter((p): p is PropuestaSemestral => p !== null)
      .sort((a, b) => a.docenteId - b.docenteId);
  }, [valoresManuales]);

  const abrirEditarValor = (prop: PropuestaSemestral) => {
    setPropuestaEnEdicion(prop);
    setValorInput(prop.montoTotalPropuesta);
    setEditValorOpen(true);
  };

  const guardarValor = () => {
    if (!propuestaEnEdicion) return;
    if (valorInput < 0) {
      toast.error('El valor total no puede ser negativo');
      return;
    }
    setValoresManuales((prev: Record<number, number>) => ({
      ...prev,
      [propuestaEnEdicion.docenteId]: valorInput
    }));
    toast.success('Valor total actualizado');
    setEditValorOpen(false);
    setPropuestaEnEdicion(null);
  };

  const filteredPropuestas = propuestas.filter((prop) => {
    const docente = mockDocentesMaestros.find(d => d.id === prop.docenteId);
    const matchesSearch = docente?.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          docente?.rut.includes(searchTerm);
    const matchesEstado = estadoFilter === 'todos' || prop.estadoPago === estadoFilter;
    const matchesBoletas = boletasFilter === 'todos' || prop.boletasEstado === boletasFilter;
    return matchesSearch && matchesEstado && matchesBoletas;
  });

  const totalPropuestas = filteredPropuestas.reduce((sum, p) => sum + p.montoTotalPropuesta, 0);
  const totalCuotaMensual = filteredPropuestas.reduce((sum, p) => sum + p.valorCuotaBruto, 0);
  const totalSaldo = filteredPropuestas.reduce((sum, p) => sum + p.saldo, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
  };

  const getDocenteNombre = (docenteId: number) => {
    const docente = mockDocentesMaestros.find(d => d.id === docenteId);
    return docente?.nombreCompleto || 'Desconocido';
  };

  const getDocenteRut = (docenteId: number) => {
    return mockDocentesMaestros.find(d => d.id === docenteId)?.rut || '-';
  };

  const getDocenteNivel = (docenteId: number) => {
    return mockDocentesMaestros.find(d => d.id === docenteId)?.nivelDocente;
  };

  const docentesSinNivel = mockDocentesMaestros.filter(d => !d.nivelDocente).length;

  const getEstadoBadge = (estado: PropuestaSemestral['estadoPago']) => {
    const variants = {
      'Pagado': { variant: 'default' as const, color: 'text-green-700' },
      'En Proceso': { variant: 'secondary' as const, color: 'text-blue-700' },
      'Pendiente': { variant: 'destructive' as const, color: 'text-red-700' }
    };
    const config = variants[estado] || variants['Pendiente'];
    return <Badge variant={config.variant}>{estado}</Badge>;
  };

  const getBoletasEstadoBadge = (estado: PropuestaSemestral['boletasEstado']) => {
    const config = {
      'Todas OK': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      'Procesadas': { bg: 'bg-blue-100', text: 'text-blue-800', icon: FileText },
      'Incompletas': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertCircle },
      'Con Observación': { bg: 'bg-orange-100', text: 'text-orange-800', icon: AlertCircle },
      'Sin Boletas': { bg: 'bg-gray-100', text: 'text-gray-600', icon: AlertCircle }
    };
    const style = config[estado] || config['Sin Boletas'];
    const Icon = style.icon;
    return (
      <Badge variant="outline" className={`${style.bg} ${style.text} border-0`}>
        <Icon className="mr-1 h-3 w-3" />
        {estado}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Estado de Propuestas Semestrales</h2>
        <p className="mt-1 text-sm text-gray-600">
          Vista consolidada y auto-generada de propuestas, pagos y boletas
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Propuestas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPropuestas)}</div>
            <p className="text-xs text-gray-600">{filteredPropuestas.length} docentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Cuota Mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCuotaMensual)}</div>
            <p className="text-xs text-gray-600">Suma de cuotas brutas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Saldo Pendiente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalSaldo)}</div>
            <p className="text-xs text-gray-600">Por pagar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Propuestas Pagadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {propuestas.filter(p => p.estadoPago === 'Pagado').length}
            </div>
            <p className="text-xs text-gray-600">de {propuestas.length} totales</p>
          </CardContent>
        </Card>
      </div>

      {/* Alert para docentes sin nivel */}
      {docentesSinNivel > 0 && (
        <Card className="border-orange-300 bg-orange-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-orange-200 p-2">
                <AlertCircle className="h-5 w-5 text-orange-700" />
              </div>
              <div>
                <h4 className="font-semibold text-orange-900">Docentes sin categorización</h4>
                <p className="mt-1 text-sm text-orange-800">
                  Hay {docentesSinNivel} docente(s) sin nivel asignado. No aparecerán en esta tabla
                  hasta completar su categorización A/B/C en la Tabla Maestra.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre o RUT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="En Proceso">En Proceso</SelectItem>
                <SelectItem value="Pagado">Pagado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={boletasFilter} onValueChange={setBoletasFilter}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Filtrar por boletas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados de boletas</SelectItem>
                <SelectItem value="Sin Boletas">Sin Boletas</SelectItem>
                <SelectItem value="Incompletas">Incompletas</SelectItem>
                <SelectItem value="Procesadas">Procesadas</SelectItem>
                <SelectItem value="Con Observación">Con Observación</SelectItem>
                <SelectItem value="Todas OK">Todas OK</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Propuestas Consolidadas</CardTitle>
          <CardDescription>
            Mostrando {filteredPropuestas.length} de {propuestas.length} propuestas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>RUT</TableHead>
                  <TableHead>Nombre Completo</TableHead>
                  <TableHead>Periodo</TableHead>
                  <TableHead className="text-center">Hrs P</TableHead>
                  <TableHead className="text-center">Hrs M</TableHead>
                  <TableHead className="text-center">Hrs A</TableHead>
                  <TableHead className="text-center">Total Hrs</TableHead>
                  <TableHead className="text-right">Valor Hora</TableHead>
                  <TableHead className="text-right">Monto Total</TableHead>
                  <TableHead className="text-center">Cuotas</TableHead>
                  <TableHead className="text-right">Valor Cuota</TableHead>
                  <TableHead>Estado Pago</TableHead>
                  <TableHead className="text-center">Pagadas</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                  <TableHead>Estado Boletas</TableHead>
                  <TableHead className="text-center">BHE</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPropuestas.map((prop) => {
                  const nivelDocente = getDocenteNivel(prop.docenteId);
                  return (
                    <TableRow key={prop.id}>
                      <TableCell className="font-medium">{prop.id}</TableCell>
                      <TableCell className="font-mono text-sm">{getDocenteRut(prop.docenteId)}</TableCell>
                      <TableCell className="font-medium max-w-[200px]">
                        <div className="flex items-center gap-2">
                          <div className="truncate" title={getDocenteNombre(prop.docenteId)}>
                            {getDocenteNombre(prop.docenteId)}
                          </div>
                          {!nivelDocente && (
                            <Badge variant="outline" className="border-orange-400 bg-orange-50 text-orange-700 shrink-0">
                              Sin Nivel
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {prop.semestre}-{prop.año}
                      </TableCell>
                      <TableCell className="text-center bg-blue-50 font-semibold text-blue-900">
                        {prop.totalHorasP}
                      </TableCell>
                      <TableCell className="text-center bg-purple-50 font-semibold text-purple-900">
                        {prop.totalHorasM}
                      </TableCell>
                      <TableCell className="text-center bg-green-50 font-semibold text-green-900">
                        {prop.totalHorasA}
                      </TableCell>
                      <TableCell className="text-center font-bold">
                        {prop.totalHoras}
                      </TableCell>
                      <TableCell className="text-right font-medium text-gray-700">
                        {prop.totalHoras > 0
                          ? formatCurrency(Math.round(prop.montoTotalPropuesta / prop.totalHoras))
                          : '—'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(prop.montoTotalPropuesta)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{prop.numeroCuotas}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(prop.valorCuotaBruto)}
                      </TableCell>
                      <TableCell>{getEstadoBadge(prop.estadoPago)}</TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium">
                          {prop.cuotasPagadas}/{prop.numeroCuotas}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium text-red-600">
                        {formatCurrency(prop.saldo)}
                      </TableCell>
                      <TableCell>{getBoletasEstadoBadge(prop.boletasEstado)}</TableCell>
                      <TableCell className="text-center">
                        {prop.recepcionBHE ? (
                          <CheckCircle className="mx-auto h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="mx-auto h-5 w-5 text-gray-400" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Editar Valor Total"
                            onClick={() => abrirEditarValor(prop)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" title="Ver detalle">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="flex max-h-[95vh] max-w-[95vw] sm:max-w-[95vw] w-[95vw] flex-col overflow-hidden p-0">
                              <DialogHeader className="shrink-0 border-b px-6 py-4">
                                <DialogTitle>Detalle de Propuesta</DialogTitle>
                                <DialogDescription>
                                  {getDocenteNombre(prop.docenteId)} • {prop.semestre}-{prop.año}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="flex-1 overflow-y-auto px-6 py-4">
                                <DetallePropuesta propuesta={prop} />
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog: editar Valor Total */}
      <Dialog open={editValorOpen} onOpenChange={(open) => {
        setEditValorOpen(open);
        if (!open) setPropuestaEnEdicion(null);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Valor Total de Propuesta</DialogTitle>
            <DialogDescription>
              {propuestaEnEdicion && (
                <>
                  {getDocenteNombre(propuestaEnEdicion.docenteId)} • {propuestaEnEdicion.semestre}-{propuestaEnEdicion.año}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {propuestaEnEdicion && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium" htmlFor="valorPropuesta">Valor Total ($)</label>
                <Input
                  id="valorPropuesta"
                  type="number"
                  min="0"
                  value={valorInput}
                  onChange={(e) => setValorInput(Number(e.target.value))}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Monto total enviado externamente para el semestre del docente.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 rounded-md border bg-gray-50 p-3 text-sm">
                <div>
                  <div className="text-gray-600">Total Horas</div>
                  <div className="font-semibold">{propuestaEnEdicion.totalHoras}</div>
                </div>
                <div>
                  <div className="text-gray-600">Valor Hora (calc.)</div>
                  <div className="font-semibold">
                    {propuestaEnEdicion.totalHoras > 0
                      ? formatCurrency(Math.round(valorInput / propuestaEnEdicion.totalHoras))
                      : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">N° Cuotas</div>
                  <div className="font-semibold">{propuestaEnEdicion.numeroCuotas}</div>
                </div>
                <div>
                  <div className="text-gray-600">Valor Cuota (calc.)</div>
                  <div className="font-semibold">
                    {propuestaEnEdicion.numeroCuotas > 0
                      ? formatCurrency(Math.round(valorInput / propuestaEnEdicion.numeroCuotas))
                      : '—'}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditValorOpen(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button type="button" onClick={guardarValor} className="flex-1">
                  Guardar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Acerca de Esta Vista
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800">
          <ul className="space-y-2">
            <li>• Esta tabla se genera automáticamente a partir de las designaciones PMA</li>
            <li>• Los montos totales y cuotas se calculan sumando todas las asignaturas del docente</li>
            <li>• El estado de boletas refleja el progreso de documentación de cada cuota</li>
            <li>• BHE (Boleta de Honorarios Electrónica) indica si se ha recibido documentación formal</li>
            <li>• Las cuotas se generan automáticamente: 4 para diurna, 5 para vespertina</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

interface DetallePropuestaProps {
  propuesta: PropuestaSemestral;
}

function DetallePropuesta({ propuesta }: DetallePropuestaProps) {
  const docente = mockDocentesMaestros.find(d => d.id === propuesta.docenteId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
  };

  // --- Cambio 2: Ramos asignados al docente ---
  const seccionesDocente = mockSeccionesAsignaturas.filter(s => s.docenteId === propuesta.docenteId);
  const ramosDocente = seccionesDocente.map(sec => {
    const asignatura = mockAsignaturas.find(a => a.id === sec.asignaturaId);
    return {
      id: sec.id,
      nombre: asignatura?.nombre ?? 'Desconocida',
      sigla: asignatura?.sigla ?? '—',
      seccion: sec.seccion,
      horasP: sec.horasP,
      horasM: sec.horasM,
      horasA: sec.horasA,
      total: sec.horasP + sec.horasM + sec.horasA
    };
  });
  const totalRamosP = ramosDocente.reduce((s, r) => s + r.horasP, 0);
  const totalRamosM = ramosDocente.reduce((s, r) => s + r.horasM, 0);
  const totalRamosA = ramosDocente.reduce((s, r) => s + r.horasA, 0);
  const totalRamosHoras = totalRamosP + totalRamosM + totalRamosA;

  // --- Cuotas reales del docente (desde mockData, base para sincronizar con docente) ---
  const cuotasDocente: CuotaMensual[] = useMemo(
    () => getCuotasDocente(propuesta.docenteId, propuesta.semestre, propuesta.año),
    [propuesta.docenteId, propuesta.semestre, propuesta.año]
  );

  // --- Cambio 3: Mensajes/notas por cuota (centralizado en mensajesAdmin.ts) ---
  const [mensajes, setMensajes] = useState<MensajesPorCuota>(() => loadMensajes(propuesta.docenteId));

  useEffect(() => {
    setMensajes(loadMensajes(propuesta.docenteId));
    return subscribeMensajes(propuesta.docenteId, setMensajes);
  }, [propuesta.docenteId]);

  const [mensajeOpen, setMensajeOpen] = useState(false);
  const [mensajeCuota, setMensajeCuotaState] = useState<CuotaMensual | null>(null);
  const [mensajeInput, setMensajeInput] = useState('');

  const abrirMensaje = (cuota: CuotaMensual) => {
    setMensajeCuotaState(cuota);
    setMensajeInput(mensajes[cuota.id] ?? '');
    setMensajeOpen(true);
  };

  const guardarMensaje = () => {
    if (!mensajeCuota) return;
    const next = setMensajeCuota(propuesta.docenteId, mensajeCuota.id, mensajeInput);
    setMensajes(next);
    toast.success('Nota guardada y sincronizada al docente');
    setMensajeOpen(false);
    setMensajeCuotaState(null);
    setMensajeInput('');
  };

  return (
    <div className="space-y-6">
      {/* Información del Docente */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Docente</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label className="text-sm text-gray-600">Nombre Completo</Label>
            <p className="font-medium">{docente?.nombreCompleto}</p>
          </div>
          <div>
            <Label className="text-sm text-gray-600">RUT</Label>
            <p className="font-mono">{docente?.rut}</p>
          </div>
          <div>
            <Label className="text-sm text-gray-600">Correo</Label>
            <p className="text-sm">{docente?.correo}</p>
          </div>
          <div>
            <Label className="text-sm text-gray-600">Nivel Docente</Label>
            {docente?.nivelDocente ? (
              <Badge variant="outline">{docente.nivelDocente}</Badge>
            ) : (
              <Badge variant="outline" className="border-orange-400 bg-orange-50 text-orange-700">
                Sin Asignar
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cambio 2: Ramos Asignados */}
      <Card>
        <CardHeader>
          <CardTitle>Ramos Asignados</CardTitle>
          <CardDescription>
            {ramosDocente.length} sección(es) asignada(s) al docente este semestre
          </CardDescription>
        </CardHeader>
        <CardContent>
          {ramosDocente.length === 0 ? (
            <p className="text-sm text-gray-500">Este docente no tiene ramos asignados.</p>
          ) : (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asignatura</TableHead>
                  <TableHead>Sigla</TableHead>
                  <TableHead className="text-center">Sección</TableHead>
                  <TableHead className="text-center">Hrs P</TableHead>
                  <TableHead className="text-center">Hrs M</TableHead>
                  <TableHead className="text-center">Hrs A</TableHead>
                  <TableHead className="text-center">Total Hrs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ramosDocente.map((ramo) => (
                  <TableRow key={ramo.id}>
                    <TableCell className="font-medium">{ramo.nombre}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{ramo.sigla}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{ramo.seccion}</TableCell>
                    <TableCell className="text-center bg-blue-50 font-semibold text-blue-900">
                      {ramo.horasP}
                    </TableCell>
                    <TableCell className="text-center bg-purple-50 font-semibold text-purple-900">
                      {ramo.horasM}
                    </TableCell>
                    <TableCell className="text-center bg-green-50 font-semibold text-green-900">
                      {ramo.horasA}
                    </TableCell>
                    <TableCell className="text-center font-bold">{ramo.total}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-gray-50 font-bold">
                  <TableCell colSpan={3}>Total</TableCell>
                  <TableCell className="text-center">{totalRamosP}</TableCell>
                  <TableCell className="text-center">{totalRamosM}</TableCell>
                  <TableCell className="text-center">{totalRamosA}</TableCell>
                  <TableCell className="text-center">{totalRamosHoras}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumen de Horas PMA */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Horas PMA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm text-blue-700">Horas Presencial</p>
              <p className="text-3xl font-bold text-blue-900">{propuesta.totalHorasP}</p>
            </div>
            <div className="rounded-lg bg-purple-50 p-4">
              <p className="text-sm text-purple-700">Horas Mixto</p>
              <p className="text-3xl font-bold text-purple-900">{propuesta.totalHorasM}</p>
            </div>
            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-sm text-green-700">Horas Administrativo</p>
              <p className="text-3xl font-bold text-green-900">{propuesta.totalHorasA}</p>
            </div>
            <div className="rounded-lg bg-gray-100 p-4">
              <p className="text-sm text-gray-700">Total Horas</p>
              <p className="text-3xl font-bold text-gray-900">{propuesta.totalHoras}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detalle de Cuotas */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle de Cuotas Mensuales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Cuota</TableHead>
                <TableHead>Mes</TableHead>
                <TableHead className="text-right">Monto Bruto</TableHead>
                <TableHead>Estado Pago</TableHead>
                <TableHead>Estado Boleta</TableHead>
                <TableHead className="text-center">Mensaje / Nota</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cuotasDocente.map((cuota) => {
                const tieneMensaje = Boolean(mensajes[cuota.id]);
                const boletaEstado = cuota.boletaEstado ?? 'Inexistente';
                return (
                  <TableRow key={cuota.id}>
                    <TableCell className="font-medium">{cuota.numeroCuota}</TableCell>
                    <TableCell>{cuota.mes}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(cuota.montoBruto)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={cuota.estadoPago === 'Pagada' ? 'default' : 'destructive'}>
                        {cuota.estadoPago}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          boletaEstado === 'Subida' || boletaEstado === 'Procesada'
                            ? 'bg-green-100 text-green-800'
                            : boletaEstado === 'Con Observación'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-gray-100 text-gray-600'
                        }
                      >
                        {boletaEstado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        title={tieneMensaje ? 'Editar nota' : 'Agregar nota'}
                        onClick={() => abrirMensaje(cuota)}
                      >
                        <MessageSquare
                          className={`h-4 w-4 ${tieneMensaje ? 'text-blue-600' : 'text-gray-400'}`}
                        />
                        {tieneMensaje && (
                          <span className="ml-1 inline-block h-2 w-2 rounded-full bg-blue-600" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              <TableRow className="bg-gray-50 font-bold">
                <TableCell colSpan={2}>Total</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(propuesta.montoTotalPropuesta)}
                </TableCell>
                <TableCell colSpan={3}>
                  <span className="text-sm text-gray-600">
                    Saldo Pendiente: {formatCurrency(propuesta.saldo)}
                  </span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog: editar mensaje del mes */}
      <Dialog open={mensajeOpen} onOpenChange={(open: boolean) => {
        setMensajeOpen(open);
        if (!open) {
          setMensajeCuotaState(null);
          setMensajeInput('');
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Nota — {mensajeCuota?.mes ?? ''}
            </DialogTitle>
            <DialogDescription>
              El docente verá esta nota junto a la boleta de este mes en su módulo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              rows={5}
              placeholder="Escriba una observación o recordatorio para este mes..."
              value={mensajeInput}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMensajeInput(e.target.value)}
            />
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setMensajeOpen(false)}>
                Cancelar
              </Button>
              <Button type="button" className="flex-1" onClick={guardarMensaje}>
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Label({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <label className={`block text-sm font-medium ${className}`}>{children}</label>;
}
