import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Users, FileText, DollarSign, TrendingUp, AlertCircle, Inbox, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  type CuotaConContexto,
  type DocenteMaestro,
  type PropuestaSemestral,
  type CuotaMensual
} from '../../data/mockData';
import { listDocentes } from '../../data/docentes';
import { listPropuestas } from '../../data/propuestas';
import { listPagos } from '../../data/pagos';
import { Loader2 } from 'lucide-react';

export function AdminDashboard() {
  const [version, setVersion] = useState(0);
  const [cuotasContexto, setCuotasContexto] = useState<CuotaConContexto[]>([]);
  const [docentesMaestros, setDocentesMaestros] = useState<DocenteMaestro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [docentesRes, propuestasRes, pagosRes] = await Promise.all([
          listDocentes(),
          listPropuestas(),
          listPagos()
        ]);
        
        if (!mounted) return;
        setDocentesMaestros(docentesRes.data);

        const propuestasPorId = new Map<number, PropuestaSemestral>(
          propuestasRes.data.map(p => [p.id, p])
        );
        const docentesPorId = new Map<number, DocenteMaestro>(
          docentesRes.data.map(d => [d.id, d])
        );

        const out: CuotaConContexto[] = [];
        for (const cuota of pagosRes.data) {
          const propuesta = propuestasPorId.get(cuota.propuestaId);
          if (!propuesta) continue;
          // Asumimos semestre 1 2026 para el dashboard admin como estaba harcodeado
          if (propuesta.semestre !== 1 || propuesta.año !== 2026) continue;
          const docente = docentesPorId.get(propuesta.docenteId);
          if (!docente) continue;
          out.push({ cuota, docente, propuesta });
        }
        setCuotasContexto(out);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();

    const handler = () => setVersion(v => v + 1);
    window.addEventListener('pagos:update', handler);
    return () => {
      mounted = false;
      window.removeEventListener('pagos:update', handler);
    };
  }, [version]);

  // ── Datos canónicos del semestre activo ───────────────────────────────────
  const cuotas = cuotasContexto;

  // Docentes con propuesta activa (los únicos relevantes para el panel de pagos).
  const docentesActivos = useMemo(() => {
    const ids = new Set(cuotas.map(c => c.docente.id));
    return docentesMaestros.filter(d => ids.has(d.id));
  }, [cuotas, docentesMaestros]);

  // Agrupo por jornada usando `numeroCuotas` de la propuesta (4=Diurna, 5=Vespertina).
  const propuestasUnicas = useMemo(() => {
    const map = new Map<number, CuotaConContexto['propuesta']>();
    for (const c of cuotas) map.set(c.propuesta.id, c.propuesta);
    return Array.from(map.values());
  }, [cuotas]);

  const propsDiurnas = propuestasUnicas.filter(p => p.numeroCuotas === 4);
  const propsVespertinas = propuestasUnicas.filter(p => p.numeroCuotas === 5);

  const totalDocentes = docentesActivos.length;
  const docentesDiurnos = propsDiurnas.length;
  const docentesVespertinos = propsVespertinas.length;
  const totalPropuestas$ = propuestasUnicas.reduce((s, p) => s + p.montoTotalPropuesta, 0);

  // Pagos: granularidad por cuota (no por docente, que era lo que hacía el legacy).
  const totalCuotas = cuotas.length;
  const cuotasPagadas = cuotas.filter(c => c.cuota.estadoPago === 'Pagada').length;
  const porcentajePagado = totalCuotas > 0 ? Math.round((cuotasPagadas / totalCuotas) * 100) : 0;

  // Alertas operativas: lo que requiere atención del admin de pagos.
  const boletasPorRevisar = cuotas.filter(c => c.cuota.boletaEstado === 'Subida').length;
  const conObservacion = cuotas.filter(c => c.cuota.boletaEstado === 'Con Observación').length;
  const sinBoleta = cuotas.filter(
    c => c.cuota.estadoPago === 'Pendiente' && (!c.cuota.boletaId || c.cuota.boletaEstado === 'Inexistente')
  ).length;
  const totalAlertas = boletasPorRevisar + conObservacion + sinBoleta;

  // Lista de cuotas con problemas (top 8 por prioridad: por revisar > obs > sin boleta).
  const alertasDetalle = useMemo(() => {
    const orden: Record<string, number> = { 'Subida': 0, 'Con Observación': 1, 'Inexistente': 2 };
    return cuotas
      .filter(c => {
        const e = c.cuota.boletaEstado ?? 'Inexistente';
        if (e === 'Subida' || e === 'Con Observación') return true;
        return c.cuota.estadoPago === 'Pendiente' && e === 'Inexistente';
      })
      .sort((a, b) => {
        const ea = a.cuota.boletaEstado ?? 'Inexistente';
        const eb = b.cuota.boletaEstado ?? 'Inexistente';
        return (orden[ea] ?? 9) - (orden[eb] ?? 9);
      })
      .slice(0, 8);
  }, [cuotas]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          <div>
        <h1 className="text-3xl font-bold text-gray-900">Módulo Administración</h1>
        <p className="mt-2 text-gray-600">
          Gestión de pagos y propuestas docentes - Semestre 1, 2026
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-blue-200/60 bg-white/90 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Docentes con propuesta</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDocentes}</div>
            <p className="text-xs text-gray-600">
              {docentesDiurnos} Diurnos · {docentesVespertinos} Vespertinos
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-blue-200/60 bg-white/90 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Propuestas</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPropuestas$)}</div>
            <p className="text-xs text-gray-600">Suma de los {propuestasUnicas.length} contratos</p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-blue-200/60 bg-white/90 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cuotas pagadas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cuotasPagadas}/{totalCuotas}
            </div>
            <p className="text-xs text-gray-600">{porcentajePagado}% del semestre</p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-red-200/60 bg-white/90 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAlertas}</div>
            <p className="text-xs text-gray-600">
              {boletasPorRevisar} por revisar · {conObservacion} c/obs · {sinBoleta} sin boleta
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access — solo destinos reales */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link to="/admin/docentes">
          <Card className="h-full cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] border-blue-200/60 shadow-md bg-white/80 hover:bg-white backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Base de Datos Docentes</CardTitle>
                  <CardDescription>Maestros, designación PMA y propuestas</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Tabla maestra de docentes, asignación de horas P/M/A y vista consolidada de propuestas semestrales.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/docentes#bandeja">
          <Card className="h-full cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] border-orange-200/60 shadow-md bg-white/80 hover:bg-white backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-orange-100 p-3">
                  <Inbox className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle>Bandeja de Boletas</CardTitle>
                  <CardDescription>Workflow de pagos del semestre</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Revisar boletas subidas, registrar pagos con fecha y referencia, y dejar notas a los docentes.
              </p>
              {totalAlertas > 0 && (
                <Badge variant="destructive" className="mt-2">
                  {totalAlertas} pendiente{totalAlertas === 1 ? '' : 's'}
                </Badge>
              )}
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/correos-masivos">
          <Card className="h-full cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] border-green-200/60 shadow-md bg-white/80 hover:bg-white backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-3">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle>Correos Masivos</CardTitle>
                  <CardDescription>Comunicaciones a docentes</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Recordatorios, avisos de observación y confirmaciones de pago con plantillas y selección por grupo.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/reportes">
          <Card className="h-full cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] border-purple-200/60 shadow-md bg-white/80 hover:bg-white backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-100 p-3">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Informes y Reportes</CardTitle>
                  <CardDescription>Exportación a PDF</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Generación de reportes filtrados por estado y jornada, descargables en PDF.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Alertas y Pendientes (basadas en cuotas reales) */}
      <Card className="border-blue-200/60 shadow-lg bg-white/85 backdrop-blur-md mb-6">
        <CardHeader>
          <CardTitle>Alertas y Acciones Pendientes</CardTitle>
          <CardDescription>
            Cuotas que requieren atención (mostrando hasta 8){' '}
            <Link to="/admin/docentes#bandeja" className="text-blue-600 hover:underline">
              · Ver todas en la Bandeja →
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {alertasDetalle.length === 0 ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              ✓ Todas las cuotas del semestre están al día.
            </div>
          ) : (
            <div className="space-y-3">
              {alertasDetalle.map(({ cuota, docente, boleta }) => {
                const estado = cuota.boletaEstado ?? 'Inexistente';
                const motivo =
                  estado === 'Subida'
                    ? 'Boleta subida — pendiente de revisar'
                    : estado === 'Con Observación'
                      ? 'Boleta con observación — esperando corrección del docente'
                      : 'Sin boleta cargada';
                return (
                  <div
                    key={cuota.id}
                    className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4"
                  >
                    <AlertCircle className="h-5 w-5 shrink-0 text-yellow-600" />
                    <div className="flex-1">
                      <h4 className="font-medium">{docente.nombreCompleto}</h4>
                      <p className="text-sm text-gray-700">
                        {cuota.mes} · Cuota {cuota.numeroCuota} · {formatCurrency(cuota.montoBruto)}
                      </p>
                      <p className="mt-1 text-sm text-gray-700">• {motivo}</p>
                      {boleta?.observaciones && (
                        <p className="mt-1 text-xs italic text-orange-700">
                          "{boleta.observaciones}"
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="outline"
                        className={
                          estado === 'Subida'
                            ? 'border-amber-300 bg-amber-100 text-amber-800'
                            : estado === 'Con Observación'
                              ? 'border-orange-300 bg-orange-100 text-orange-800'
                              : 'border-gray-300 bg-gray-100 text-gray-700'
                        }
                      >
                        {estado === 'Inexistente' ? 'Sin boleta' : estado}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cuotas por Jornada */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Jornada Diurna</CardTitle>
            <CardDescription>4 cuotas: Marzo · Abril · Mayo · Junio</CardDescription>
          </CardHeader>
          <CardContent>
            <JornadaResumen
              propuestas={propsDiurnas}
              formatCurrency={formatCurrency}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Jornada Vespertina</CardTitle>
            <CardDescription>5 cuotas: Marzo · Abril · Mayo · Junio · Julio</CardDescription>
          </CardHeader>
          <CardContent>
            <JornadaResumen
              propuestas={propsVespertinas}
              formatCurrency={formatCurrency}
            />
          </CardContent>
        </Card>
      </div>
        </>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
//   Subcomponente: resumen por jornada
// ────────────────────────────────────────────────────────────────────────────

function JornadaResumen({
  propuestas,
  formatCurrency
}: {
  propuestas: CuotaConContexto['propuesta'][];
  formatCurrency: (n: number) => string;
}) {
  const total = propuestas.reduce((s, p) => s + p.montoTotalPropuesta, 0);
  const cuotaPromedio =
    propuestas.length > 0
      ? propuestas.reduce((s, p) => s + (p.valorCuotaBruto ?? Math.round(p.montoTotalPropuesta / Math.max(1, p.numeroCuotas))), 0) / propuestas.length
      : 0;
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Total Docentes:</span>
        <span className="font-medium">{propuestas.length}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Total Propuestas:</span>
        <span className="font-medium">{formatCurrency(total)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Cuota Mensual Promedio:</span>
        <span className="font-medium">{formatCurrency(Math.round(cuotaPromedio))}</span>
      </div>
    </div>
  );
}