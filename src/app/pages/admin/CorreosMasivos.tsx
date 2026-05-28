import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Mail, Send, Users, Filter, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Checkbox } from '../../components/ui/checkbox';
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
  mockDocentesMaestros,
  mockPropuestasSemestrales,
  mockCuotasMensuales,
  type DocenteMaestro
} from '../../data/mockData';
import { subscribePagosAdmin } from '../../data/pagosAdmin';

// ─────────────────────────────────────────────────────────────────────────────
// Plantillas rápidas pensadas para los flujos más comunes del admin de pagos.
// Las variables {{nombre}}, {{mes}} y {{monto}} se interpolan al enviar.
// ─────────────────────────────────────────────────────────────────────────────
const PLANTILLAS: Record<string, { asunto: string; cuerpo: string }> = {
  recordatorio_boleta: {
    asunto: 'Recordatorio: subida de boleta cuota {{mes}}',
    cuerpo:
      'Estimado/a {{nombre}},\n\nLe recordamos que aún no hemos recibido su boleta de honorarios electrónica correspondiente a la cuota de {{mes}} ({{monto}}). Por favor, súbala a la plataforma a la brevedad para procesar su pago.\n\nSaludos cordiales,\nAdministración TEC-UCT'
  },
  observacion_boleta: {
    asunto: 'Boleta con observación — cuota {{mes}}',
    cuerpo:
      'Estimado/a {{nombre}},\n\nSu boleta correspondiente a la cuota de {{mes}} presenta observaciones. Le pedimos revisar el detalle en la plataforma y reemplazarla con la corrección indicada.\n\nSaludos cordiales,\nAdministración TEC-UCT'
  },
  pago_confirmado: {
    asunto: 'Confirmación de pago — cuota {{mes}}',
    cuerpo:
      'Estimado/a {{nombre}},\n\nLe confirmamos que se ha procesado el pago de su cuota de {{mes}} por un total de {{monto}}.\n\nSaludos cordiales,\nAdministración TEC-UCT'
  },
  generico: {
    asunto: '',
    cuerpo: 'Estimado/a {{nombre}},\n\n\n\nSaludos cordiales,\nAdministración TEC-UCT'
  }
};

type GrupoPreset = 'todos' | 'diurnos' | 'vespertinos' | 'sin_boleta' | 'con_observacion' | 'al_dia';

const GRUPO_LABEL: Record<GrupoPreset, string> = {
  todos: 'Todos los docentes con propuesta',
  diurnos: 'Sólo jornada Diurna',
  vespertinos: 'Sólo jornada Vespertina',
  sin_boleta: 'Con cuotas sin boleta cargada',
  con_observacion: 'Con boletas observadas',
  al_dia: 'Al día (todas las cuotas pagadas)'
};

export function CorreosMasivos() {
  const [searchParams] = useSearchParams();
  // Permite que otras páginas (p.ej. el botón en Propuestas) pre-seleccionen
  // un grupo via ?grupo=sin_boleta o un docente específico via ?docenteId=N.
  const grupoInicial = (searchParams.get('grupo') as GrupoPreset | null) ?? 'todos';
  const docenteIdParam = searchParams.get('docenteId');

  // Refresco en vivo si la Bandeja cambia algo (afecta los grupos por estado).
  const [version, setVersion] = useState(0);
  useEffect(() => subscribePagosAdmin(() => setVersion(v => v + 1)), []);

  // Estado del formulario
  const [grupo, setGrupo] = useState<GrupoPreset>(grupoInicial);
  const [seleccionados, setSeleccionados] = useState<Set<number>>(new Set());
  const [plantilla, setPlantilla] = useState<string>('generico');
  const [asunto, setAsunto] = useState<string>(PLANTILLAS.generico.asunto);
  const [cuerpo, setCuerpo] = useState<string>(PLANTILLAS.generico.cuerpo);
  const [busqueda, setBusqueda] = useState('');
  const [enviando, setEnviando] = useState(false);

  // ── Cálculo del universo de docentes según el grupo elegido ──────────────
  // Cada grupo es un filtro derivado de propuestas + cuotas del semestre activo.
  const docentesDelGrupo = useMemo<DocenteMaestro[]>(() => {
    void version;
    const docentesActivos = mockPropuestasSemestrales.map(p => {
      const d = mockDocentesMaestros.find(m => m.id === p.docenteId);
      return d ? { docente: d, propuestaId: p.id } : null;
    }).filter((x): x is { docente: DocenteMaestro; propuestaId: number } => x !== null);

    switch (grupo) {
      case 'todos':
        return docentesActivos.map(x => x.docente);
      case 'diurnos':
        return docentesActivos
          .filter(x => mockPropuestasSemestrales.find(p => p.id === x.propuestaId)?.numeroCuotas === 4)
          .map(x => x.docente);
      case 'vespertinos':
        return docentesActivos
          .filter(x => mockPropuestasSemestrales.find(p => p.id === x.propuestaId)?.numeroCuotas === 5)
          .map(x => x.docente);
      case 'sin_boleta':
        return docentesActivos
          .filter(x => {
            const cuotas = mockCuotasMensuales.filter(c => c.propuestaId === x.propuestaId);
            return cuotas.some(
              c =>
                c.estadoPago === 'Pendiente' &&
                (!c.boletaId || c.boletaEstado === 'Inexistente')
            );
          })
          .map(x => x.docente);
      case 'con_observacion':
        return docentesActivos
          .filter(x => {
            const cuotas = mockCuotasMensuales.filter(c => c.propuestaId === x.propuestaId);
            return cuotas.some(c => c.boletaEstado === 'Con Observación');
          })
          .map(x => x.docente);
      case 'al_dia':
        return docentesActivos
          .filter(x => {
            const cuotas = mockCuotasMensuales.filter(c => c.propuestaId === x.propuestaId);
            return cuotas.length > 0 && cuotas.every(c => c.estadoPago === 'Pagada');
          })
          .map(x => x.docente);
    }
  }, [grupo, version]);

  // Al cambiar el grupo, pre-marcar todos sus integrantes. También honra
  // ?docenteId=N que llega desde detalles (p.ej. detalle de propuesta).
  useEffect(() => {
    if (docenteIdParam) {
      const id = Number(docenteIdParam);
      if (!Number.isNaN(id)) setSeleccionados(new Set([id]));
      return;
    }
    setSeleccionados(new Set(docentesDelGrupo.map(d => d.id)));
  }, [docentesDelGrupo, docenteIdParam]);

  // Lista filtrada por búsqueda dentro del grupo.
  const docentesVisibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return docentesDelGrupo;
    return docentesDelGrupo.filter(
      d =>
        d.nombreCompleto.toLowerCase().includes(q) ||
        d.rut.toLowerCase().includes(q) ||
        d.correo.toLowerCase().includes(q)
    );
  }, [docentesDelGrupo, busqueda]);

  const toggleDocente = (id: number) => {
    setSeleccionados(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleTodos = () => {
    const idsVisibles = docentesVisibles.map(d => d.id);
    const todosSeleccionados = idsVisibles.every(id => seleccionados.has(id));
    setSeleccionados(prev => {
      const next = new Set(prev);
      if (todosSeleccionados) idsVisibles.forEach(id => next.delete(id));
      else idsVisibles.forEach(id => next.add(id));
      return next;
    });
  };

  const aplicarPlantilla = (key: string) => {
    setPlantilla(key);
    const t = PLANTILLAS[key];
    if (t) {
      setAsunto(t.asunto);
      setCuerpo(t.cuerpo);
    }
  };

  const handleEnviar = () => {
    if (seleccionados.size === 0) {
      toast.error('Debe seleccionar al menos un destinatario');
      return;
    }
    if (!asunto.trim()) {
      toast.error('El asunto no puede estar vacío');
      return;
    }
    if (!cuerpo.trim()) {
      toast.error('El cuerpo del correo no puede estar vacío');
      return;
    }
    // Mock de envío. Cuando exista backend, aquí va POST /api/correos/masivos.
    setEnviando(true);
    setTimeout(() => {
      setEnviando(false);
      toast.success(
        `Correo enviado a ${seleccionados.size} docente${seleccionados.size === 1 ? '' : 's'}`,
        { description: asunto }
      );
    }, 800);
  };

  const allVisiblesChecked =
    docentesVisibles.length > 0 && docentesVisibles.every(d => seleccionados.has(d.id));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900">
            <Mail className="h-7 w-7 text-green-600" />
            Correos Masivos
          </h1>
          <p className="mt-2 text-gray-600">
            Comunicaciones agrupadas a docentes (recordatorios, observaciones, confirmaciones).
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        {/* ── Columna izquierda: destinatarios ─────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Destinatarios
            </CardTitle>
            <CardDescription>
              {seleccionados.size} de {docentesDelGrupo.length} seleccionados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-xs">
                <Filter className="h-3 w-3" />
                Grupo
              </Label>
              <Select value={grupo} onValueChange={v => setGrupo(v as GrupoPreset)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(GRUPO_LABEL) as GrupoPreset[]).map(g => (
                    <SelectItem key={g} value={g}>
                      {GRUPO_LABEL[g]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Input
              placeholder="Buscar por nombre, RUT o email…"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />

            <div className="flex items-center gap-2 border-b pb-2">
              <Checkbox
                checked={allVisiblesChecked}
                onCheckedChange={toggleTodos}
                id="check-todos"
              />
              <Label htmlFor="check-todos" className="cursor-pointer text-sm font-medium">
                Seleccionar todos los visibles ({docentesVisibles.length})
              </Label>
            </div>

            <div className="max-h-[420px] space-y-1 overflow-y-auto pr-1">
              {docentesVisibles.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500">
                  No hay docentes en este grupo.
                </p>
              ) : (
                docentesVisibles.map(d => (
                  <label
                    key={d.id}
                    className="flex cursor-pointer items-start gap-2 rounded-md p-2 hover:bg-gray-50"
                  >
                    <Checkbox
                      checked={seleccionados.has(d.id)}
                      onCheckedChange={() => toggleDocente(d.id)}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{d.nombreCompleto}</p>
                      <p className="truncate text-xs text-gray-600">{d.correo}</p>
                      <p className="text-xs text-gray-500">
                        {d.rut}-{d.dv}
                        {d.nivelDocente ? ` · Nivel ${d.nivelDocente}` : ''}
                      </p>
                    </div>
                  </label>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Columna derecha: redacción ────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Redacción
            </CardTitle>
            <CardDescription>
              Use <code className="rounded bg-gray-100 px-1">{'{{nombre}}'}</code>,{' '}
              <code className="rounded bg-gray-100 px-1">{'{{mes}}'}</code> y{' '}
              <code className="rounded bg-gray-100 px-1">{'{{monto}}'}</code> para personalizar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Plantilla rápida</Label>
              <Select value={plantilla} onValueChange={aplicarPlantilla}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="generico">— Genérica (en blanco) —</SelectItem>
                  <SelectItem value="recordatorio_boleta">Recordatorio: subir boleta</SelectItem>
                  <SelectItem value="observacion_boleta">Aviso: boleta con observación</SelectItem>
                  <SelectItem value="pago_confirmado">Confirmación de pago</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="asunto">Asunto</Label>
              <Input
                id="asunto"
                value={asunto}
                onChange={e => setAsunto(e.target.value)}
                placeholder="Asunto del correo…"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cuerpo">Cuerpo</Label>
              <Textarea
                id="cuerpo"
                value={cuerpo}
                onChange={e => setCuerpo(e.target.value)}
                placeholder="Escriba el cuerpo del mensaje…"
                rows={12}
                className="font-mono text-sm"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border bg-gray-50 p-3">
              <div className="text-sm">
                <span className="text-gray-600">Se enviará a </span>
                <Badge variant="secondary">{seleccionados.size}</Badge>
                <span className="text-gray-600"> docente{seleccionados.size === 1 ? '' : 's'}</span>
              </div>
              <Button onClick={handleEnviar} disabled={enviando || seleccionados.size === 0}>
                <Send className="mr-2 h-4 w-4" />
                {enviando ? 'Enviando…' : 'Enviar correo'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
