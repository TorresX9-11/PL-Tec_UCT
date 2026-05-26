import { useState, useRef, useMemo, useEffect } from 'react';
import { FileText, Trash2, Download, Eye, AlertCircle, Upload, CheckCircle2, MessageSquare } from 'lucide-react';
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
import {
  getDocenteById,
  getCuotasDocente,
  getBoletasPendientes,
  mockCuotasMensuales,
  mockDocentesAcademicos,
  type Boleta
} from '../../data/mockData';
import {
  loadMensajes,
  subscribeMensajes,
  type MensajesPorCuota
} from '../../data/mensajesAdmin';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const AÑOS = [2025, 2026, 2027];

// Valor especial del select cuando el docente quiere subir una boleta fuera de las cuotas pendientes
const PERIODO_OTRO = '__otro__';

export function DocenteBoletas() {
  // Docente logueado (fallback a id 1 en dev)
  const docenteIdRaw = sessionStorage.getItem('docenteId');
  const docenteId = docenteIdRaw ? Number(docenteIdRaw) : 1;
  const docente = getDocenteById(docenteId);

  // State para forzar re-render tras mutar mockData (mock pattern)
  const [version, setVersion] = useState(0);
  const bump = () => setVersion(v => v + 1);

  // Datos derivados (se recalculan cuando bump() dispara re-render)
  const boletas = useMemo(() => (docente ? [...docente.boletas].reverse() : []), [docente, version]);
  const cuotasPendientes = useMemo(() => getBoletasPendientes(docenteId), [docenteId, version]);
  const cuotasDelDocente = useMemo(() => getCuotasDocente(docenteId), [docenteId, version]);

  // Notas del administrador (solo lectura, keyed por cuotaId) — centralizado en mensajesAdmin.ts
  const [notasAdmin, setNotasAdmin] = useState<MensajesPorCuota>(() => loadMensajes(docenteId));

  useEffect(() => {
    setNotasAdmin(loadMensajes(docenteId));
    return subscribeMensajes(docenteId, setNotasAdmin);
  }, [docenteId]);

  // Mapa boletaId → mensaje (cuando la cuota tiene boleta vinculada)
  const notaPorBoleta = useMemo(() => {
    const map: Record<number, { cuotaId: number; mes: string; mensaje: string }> = {};
    cuotasDelDocente.forEach(cuota => {
      const mensaje = notasAdmin[cuota.id];
      if (mensaje && cuota.boletaId) {
        map[cuota.boletaId] = { cuotaId: cuota.id, mes: cuota.mes, mensaje };
      }
    });
    return map;
  }, [notasAdmin, cuotasDelDocente]);

  // Notas para cuotas que aún no tienen boleta subida (no se pierden)
  const notasPendientes = useMemo(() => {
    return cuotasDelDocente
      .filter(cuota => notasAdmin[cuota.id] && !cuota.boletaId)
      .map(cuota => ({
        cuotaId: cuota.id,
        mes: cuota.mes,
        mensaje: notasAdmin[cuota.id]
      }));
  }, [notasAdmin, cuotasDelDocente]);

  // Form state
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<string>('');
  const [mesManual, setMesManual] = useState<string>('');
  const [añoManual, setAñoManual] = useState<string>(String(new Date().getFullYear()));
  const [archivo, setArchivo] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const usarFallback = periodoSeleccionado === PERIODO_OTRO;

  if (!docente) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-600">Docente no encontrado. Inicie sesión nuevamente.</p>
      </div>
    );
  }

  // Resuelve el "mes año" final según el modo (cuota pendiente o fallback manual)
  const calcularPeriodo = (): { mes: string; año: number; cuotaId?: number } | null => {
    if (!periodoSeleccionado) return null;

    if (usarFallback) {
      if (!mesManual || !añoManual) return null;
      return { mes: mesManual, año: Number(añoManual) };
    }

    // Periodo proviene de una cuota pendiente (id de la cuota)
    const cuota = cuotasPendientes.find(c => String(c.id) === periodoSeleccionado);
    if (!cuota) return null;
    // cuota.mes viene como "Abril 2026" → separar
    const [mes, añoStr] = cuota.mes.split(' ');
    return { mes, año: Number(añoStr), cuotaId: cuota.id };
  };

  const periodoCalculado = calcularPeriodo();
  const nombreGenerado = periodoCalculado
    ? `Boleta ${periodoCalculado.mes} ${periodoCalculado.año}`
    : '';

  // Validación pre-submit
  const formValido = !!periodoCalculado && !!archivo;

  const handleArchivoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setArchivo(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('El archivo supera los 5 MB');
      event.target.value = '';
      return;
    }
    setArchivo(file);
  };

  const handleSubmit = () => {
    if (!periodoCalculado) {
      toast.error('Seleccione el periodo de la boleta');
      return;
    }
    if (!archivo) {
      toast.error('Seleccione el archivo PDF de la boleta');
      return;
    }

    // Evitar duplicados: si ya existe una boleta con el mismo nombre, avisar
    const yaExiste = docente.boletas.some(b => b.nombre === nombreGenerado);
    if (yaExiste) {
      toast.error(`Ya tiene subida una "${nombreGenerado}". Elimínela antes de subir una nueva.`);
      return;
    }

    // Generar nuevo id global de boleta
    const todosIds = mockDocentesAcademicos.flatMap(d => d.boletas.map(b => b.id));
    const nuevoId = (todosIds.length > 0 ? Math.max(...todosIds) : 0) + 1;

    const nuevaBoleta: Boleta = {
      id: nuevoId,
      nombre: nombreGenerado,
      archivo: archivo.name,
      fecha: new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' }),
      estado: 'Subida'
    };

    // Mutar mockData (patrón mock para sincronizar con dashboard/admin)
    docente.boletas.push(nuevaBoleta);

    // Si vino de una cuota pendiente, vincular la boleta a la cuota
    if (periodoCalculado.cuotaId) {
      const cuotaIdx = mockCuotasMensuales.findIndex(c => c.id === periodoCalculado.cuotaId);
      if (cuotaIdx >= 0) {
        mockCuotasMensuales[cuotaIdx] = {
          ...mockCuotasMensuales[cuotaIdx],
          boletaId: nuevoId,
          boletaEstado: 'Subida'
        };
      }
    }

    // Reset form
    setPeriodoSeleccionado('');
    setMesManual('');
    setAñoManual(String(new Date().getFullYear()));
    setArchivo(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    toast.success(`"${nombreGenerado}" subida correctamente`);
    bump();
  };

  const handleDeleteBoleta = (id: number) => {
    // Quitar de docente.boletas
    const idx = docente.boletas.findIndex(b => b.id === id);
    if (idx < 0) return;
    docente.boletas.splice(idx, 1);

    // Desvincular de cualquier cuota que la referenciara
    mockCuotasMensuales.forEach((c, i) => {
      if (c.boletaId === id) {
        mockCuotasMensuales[i] = {
          ...c,
          boletaId: undefined,
          boletaEstado: 'Inexistente'
        };
      }
    });

    toast.success('Boleta eliminada');
    bump();
  };

  // Helper para badge de estado de la boleta
  const renderEstadoBadge = (boleta: Boleta) => {
    const estado = boleta.estado ?? 'Subida';
    if (estado === 'Procesada') {
      return (
        <Badge variant="default" className="gap-1 bg-green-600">
          <CheckCircle2 className="h-3 w-3" />
          Procesada
        </Badge>
      );
    }
    if (estado === 'Con Observación') {
      return (
        <Badge variant="outline" className="gap-1 border-red-500 text-red-700">
          <AlertCircle className="h-3 w-3" />
          Con Observación
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1 border-blue-500 text-blue-700">
        En revisión
      </Badge>
    );
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
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-green-600" />
            Subir Nueva Boleta
          </CardTitle>
          <CardDescription>
            Seleccione el periodo de la cuota y cargue el archivo PDF
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selector de periodo: cuotas pendientes + opción "Otro periodo" */}
          <div>
            <Label htmlFor="periodo-boleta">
              Periodo de la cuota <span className="text-red-500">*</span>
            </Label>
            <Select value={periodoSeleccionado} onValueChange={setPeriodoSeleccionado}>
              <SelectTrigger id="periodo-boleta">
                <SelectValue placeholder="Seleccione el periodo de la cuota..." />
              </SelectTrigger>
              <SelectContent>
                {cuotasPendientes.length > 0 && (
                  <>
                    {cuotasPendientes.map(cuota => (
                      <SelectItem key={cuota.id} value={String(cuota.id)}>
                        <span className="font-medium">{cuota.mes}</span>
                        <span className="ml-2 text-xs text-gray-500">
                          · Cuota {cuota.numeroCuota} · ${cuota.montoBruto.toLocaleString('es-CL')}
                        </span>
                      </SelectItem>
                    ))}
                  </>
                )}
                <SelectItem value={PERIODO_OTRO}>Otro periodo (no listado)...</SelectItem>
              </SelectContent>
            </Select>
            {cuotasPendientes.length === 0 && !usarFallback && (
              <p className="mt-1 text-xs text-green-700">
                ✓ No tiene cuotas pendientes. Use "Otro periodo" si necesita resubir una boleta.
              </p>
            )}
          </div>

          {/* Fallback: mes y año manuales */}
          {usarFallback && (
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label htmlFor="mes-boleta">
                  Mes <span className="text-red-500">*</span>
                </Label>
                <Select value={mesManual} onValueChange={setMesManual}>
                  <SelectTrigger id="mes-boleta">
                    <SelectValue placeholder="Seleccione el mes..." />
                  </SelectTrigger>
                  <SelectContent>
                    {MESES.map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="año-boleta">
                  Año <span className="text-red-500">*</span>
                </Label>
                <Select value={añoManual} onValueChange={setAñoManual}>
                  <SelectTrigger id="año-boleta">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AÑOS.map(a => (
                      <SelectItem key={a} value={String(a)}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Preview del nombre generado */}
          {nombreGenerado && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
              <p className="text-xs text-gray-600">Nombre que se asignará:</p>
              <p className="font-medium text-green-800">{nombreGenerado}</p>
            </div>
          )}

          {/* Archivo */}
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
            <p className="mt-1 text-xs text-gray-500">
              Solo archivos PDF. Máximo 5 MB.
            </p>
          </div>

          {/* Botón submit */}
          <Button
            onClick={handleSubmit}
            disabled={!formValido}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Upload className="mr-2 h-4 w-4" />
            Subir Boleta
          </Button>
        </CardContent>
      </Card>

      {/* Notas del Administrador para cuotas sin boleta subida (solo lectura) */}
      {notasPendientes.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-amber-600" />
              Notas pendientes del Administrador
            </CardTitle>
            <CardDescription>
              Observaciones para cuotas que aún no tienen boleta subida.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {notasPendientes.map((nota) => (
              <div
                key={nota.cuotaId}
                className="flex items-start gap-3 rounded bg-amber-50 p-3 text-sm text-amber-900"
              >
                <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div className="flex-1">
                  <div className="font-semibold">{nota.mes}</div>
                  <p className="mt-1 whitespace-pre-wrap">{nota.mensaje}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Resumen */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">Resumen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <p className="text-3xl font-bold">{boletas.length}</p>
              <p className="text-xs text-gray-600">Boletas subidas</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-600">{cuotasPendientes.length}</p>
              <p className="text-xs text-gray-600">Cuotas sin boleta</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-600">
                {cuotasDelDocente.filter(c => c.estadoPago === 'Pagada').length}
              </p>
              <p className="text-xs text-gray-600">Cuotas pagadas</p>
            </div>
          </div>
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
            boletas.map((boleta) => {
              const nota = notaPorBoleta[boleta.id];
              return (
                <div
                  key={boleta.id}
                  className="rounded-lg border p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{boleta.nombre}</h4>
                        {renderEstadoBadge(boleta)}
                        {nota && (
                          <Badge variant="outline" className="gap-1 border-blue-500 text-blue-700">
                            <MessageSquare className="h-3 w-3" />
                            Nota del admin
                          </Badge>
                        )}
                      </div>
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
                  {nota && (
                    <div className="mt-3 flex items-start gap-3 rounded bg-blue-50 p-3 text-sm text-blue-800">
                      <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                      <div className="flex-1">
                        <div className="font-semibold">Nota del administrador — {nota.mes}</div>
                        <p className="mt-1 whitespace-pre-wrap">{nota.mensaje}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
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
            <li>• Las boletas deben estar en formato PDF (máximo 5 MB).</li>
            <li>• El nombre se asigna automáticamente con el formato <strong>"Boleta Mes Año"</strong> según el periodo seleccionado.</li>
            <li>• Cada boleta queda vinculada a su cuota para que el área administrativa pueda procesar el pago.</li>
            <li>• Si necesita reemplazar una boleta rechazada, elimínela primero y luego suba la nueva.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
