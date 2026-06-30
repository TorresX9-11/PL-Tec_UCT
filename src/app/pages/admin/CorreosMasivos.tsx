import { useEffect, useMemo, useState } from 'react';
import { Mail, Send, Users, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Checkbox } from '../../components/ui/checkbox';
import { toast } from 'sonner';

import { listDocentes } from '../../data/docentes';
import { listPropuestas } from '../../data/propuestas';
import { listPagos } from '../../data/pagos';
import { sendCorreosMasivos } from '../../data/correos';
import { type DocenteMaestro, type CuotaMensual } from '../../data/mockData';

const PLANTILLAS: Record<string, { asunto: string; cuerpo: string }> = {
  recordatorio_boleta: {
    asunto: 'Recordatorio: subida de boleta cuota {{mes}}',
    cuerpo: 'Estimado/a {{nombre}},\n\nLe recordamos que aún no hemos recibido su boleta de honorarios electrónica correspondiente a la cuota de {{mes}} ({{monto}}). Por favor, súbala a la plataforma a la brevedad para procesar su pago.\n\nSaludos cordiales,\nAdministración TEC-UCT\nContacto: jonathan.carrillo@uct.cl'
  },
  observacion_boleta: {
    asunto: 'Boleta con observación — cuota {{mes}}',
    cuerpo: 'Estimado/a {{nombre}},\n\nSu boleta correspondiente a la cuota de {{mes}} presenta observaciones. Le pedimos revisar el detalle en la plataforma y reemplazarla con la corrección indicada.\n\nSaludos cordiales,\nAdministración TEC-UCT\nContacto: jonathan.carrillo@uct.cl'
  },
  generico: {
    asunto: '',
    cuerpo: 'Estimado/a {{nombre}},\n\n\n\nSaludos cordiales,\nAdministración TEC-UCT\nContacto: jonathan.carrillo@uct.cl'
  }
};

export function CorreosMasivos() {
  const [docentesBackend, setDocentesBackend] = useState<DocenteMaestro[]>([]);
  const [propuestasBackend, setPropuestasBackend] = useState<any[]>([]);
  const [pagosBackend, setPagosBackend] = useState<CuotaMensual[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [seleccionados, setSeleccionados] = useState<Set<number>>(new Set());
  const [asunto, setAsunto] = useState<string>(PLANTILLAS.generico.asunto);
  const [cuerpo, setCuerpo] = useState<string>(PLANTILLAS.generico.cuerpo);
  const [plantillaActiva, setPlantillaActiva] = useState<string>('generico');
  const [busqueda, setBusqueda] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [vistaPrevia, setVistaPrevia] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docRes, propRes, pagRes] = await Promise.all([
          listDocentes(),
          listPropuestas(),
          listPagos()
        ]);
        setDocentesBackend(docRes.data);
        setPropuestasBackend(propRes.data);
        setPagosBackend(pagRes.data);
      } catch (e) {
        toast.error('Error al cargar datos del backend');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Smart Actions Groups
  const isMesPasadoOPresente = (mesString: string) => {
    const mesesNombres = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const mesActual = new Date().getMonth();
    const index = mesesNombres.indexOf(mesString.toLowerCase().trim());
    return index !== -1 && index <= mesActual;
  };

  const faltanBoletaDocentes = useMemo(() => {
    const cuotasFaltantes = pagosBackend.filter(p => 
      (p.boletaEstado === 'Inexistente' || p.boletaEstado === 'Faltante') && 
      p.estadoPago === 'Pendiente' &&
      isMesPasadoOPresente(p.mes)
    );
    const propIds = new Set(cuotasFaltantes.map(c => c.propuestaId));
    const docIds = new Set(Array.from(propIds).map(id => propuestasBackend.find(p => p.id === id)?.docenteId));
    return docentesBackend.filter(d => docIds.has(d.id));
  }, [pagosBackend, propuestasBackend, docentesBackend]);

  const observadasBoletasDocentes = useMemo(() => {
    const cuotasObservadas = pagosBackend.filter(p => p.boletaEstado === 'Con Observación');
    const propIds = new Set(cuotasObservadas.map(c => c.propuestaId));
    const docIds = new Set(Array.from(propIds).map(id => propuestasBackend.find(p => p.id === id)?.docenteId));
    return docentesBackend.filter(d => docIds.has(d.id));
  }, [pagosBackend, propuestasBackend, docentesBackend]);

  const clickSmartAction = (docentes: DocenteMaestro[], plantilla: string) => {
    setSeleccionados(new Set(docentes.map(d => d.id)));
    setPlantillaActiva(plantilla);
    setAsunto(PLANTILLAS[plantilla].asunto);
    setCuerpo(PLANTILLAS[plantilla].cuerpo);
    toast.success(`Se seleccionaron ${docentes.length} docentes`);
  };

  const docentesVisibles = useMemo(() => {
    if (!busqueda) return docentesBackend;
    const q = busqueda.toLowerCase();
    return docentesBackend.filter(d => 
      d.nombreCompleto.toLowerCase().includes(q) || 
      d.rut.toLowerCase().includes(q)
    );
  }, [docentesBackend, busqueda]);

  const toggleDocente = (id: number) => {
    const next = new Set(seleccionados);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSeleccionados(next);
  };

  const resolverVariables = (texto: string, docenteId: number) => {
    const docente = docentesBackend.find(d => d.id === docenteId);
    if (!docente) return texto;
    let res = texto.replace(/{{nombre}}/g, docente.nombreCompleto);

    const propuesta = propuestasBackend.find(p => p.docenteId === docente.id);
    if (propuesta) {
      const cuotas = pagosBackend.filter(p => p.propuestaId === propuesta.id);
      
      let relevantes = [];
      if (plantillaActiva === 'observacion_boleta') {
        relevantes = cuotas.filter(p => p.boletaEstado === 'Con Observación');
      } else {
        relevantes = cuotas.filter(p => 
          (p.boletaEstado === 'Inexistente' || p.boletaEstado === 'Faltante') && 
          p.estadoPago === 'Pendiente' &&
          isMesPasadoOPresente(p.mes)
        );
      }

      if (relevantes.length > 0) {
        const meses = relevantes.map(c => c.mes).join(' y ');
        const valorCuotaBruto = Math.round(propuesta.montoTotalPropuesta / propuesta.numeroCuotas);
        const montoFormateado = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(valorCuotaBruto * relevantes.length);
        
        res = res.replace(/{{mes}}/g, meses);
        res = res.replace(/{{monto}}/g, montoFormateado);
      } else {
        res = res.replace(/{{mes}}/g, '[Mes]');
        res = res.replace(/{{monto}}/g, '[Monto]');
      }
    } else {
      res = res.replace(/{{mes}}/g, '[Mes]');
      res = res.replace(/{{monto}}/g, '[Monto]');
    }
    return res;
  };

  const handleEnviar = async () => {
    if (seleccionados.size === 0) return toast.error('Seleccione al menos un destinatario');
    if (!asunto || !cuerpo) return toast.error('Asunto y cuerpo son obligatorios');

    setEnviando(true);
    
    // Preparar el paquete de datos resolviendo las variables para cada destinatario
    const destinatarios = Array.from(seleccionados).map(id => {
      const docente = docentesBackend.find(d => d.id === id);
      return {
        to: docente?.correo || '',
        subject: resolverVariables(asunto, id),
        text: resolverVariables(cuerpo, id)
      };
    }).filter(d => d.to !== '');

    try {
      const result = await sendCorreosMasivos(destinatarios);
      
      let msg = `Enviados exitosamente: ${result.exitosos}.`;
      if (result.fallidos > 0) msg += ` Fallidos: ${result.fallidos}.`;
      if (result.previewUrl) msg += ` (Prueba generada en consola/Ethereal)`;

      toast.success('Proceso de envío finalizado', { description: msg });
      
      if (result.previewUrl) {
        console.log('Vista previa del correo:', result.previewUrl);
      }
      
      setSeleccionados(new Set());
    } catch (e) {
      console.error(e);
      toast.error('Ocurrió un error al despachar los correos. Revisa la consola o el backend.');
    } finally {
      setEnviando(false);
    }
  };

  if (isLoading) return <div className="flex h-full items-center justify-center p-12"><p className="text-gray-500">Cargando asistente de correos...</p></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900">
          <Mail className="h-7 w-7 text-indigo-600" />
          Correos Masivos
        </h1>
        <p className="mt-2 text-gray-600">Asistente inteligente para el envío de comunicaciones automatizadas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="border-l-4 border-l-red-500 hover:shadow-md transition cursor-pointer" onClick={() => clickSmartAction(faltanBoletaDocentes, 'recordatorio_boleta')}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div>
                <h3 className="font-bold text-lg">Faltan Boletas</h3>
                <p className="text-sm text-gray-600">{faltanBoletaDocentes.length} docentes pendientes</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200">Recordar a Todos</Button>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition cursor-pointer" onClick={() => clickSmartAction(observadasBoletasDocentes, 'observacion_boleta')}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-orange-500" />
              <div>
                <h3 className="font-bold text-lg">Boletas Observadas</h3>
                <p className="text-sm text-gray-600">{observadasBoletasDocentes.length} docentes con rechazo</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200">Notificar Corrección</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Users className="h-4 w-4" /> Destinatarios ({seleccionados.size})</CardTitle>
          </CardHeader>
          <CardContent>
            <Input className="mb-4" placeholder="Buscar docente..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
            <div className="max-h-[420px] space-y-1 overflow-y-auto pr-1">
              {docentesVisibles.map(d => (
                <label key={d.id} className="flex cursor-pointer items-start gap-3 rounded-md p-2 hover:bg-gray-50 border border-transparent hover:border-gray-100">
                  <Checkbox checked={seleccionados.has(d.id)} onCheckedChange={() => toggleDocente(d.id)} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{d.nombreCompleto}</p>
                    <p className="truncate text-xs text-gray-500">{d.rut}</p>
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">Redacción del Mensaje</CardTitle>
              <CardDescription>Usa {'{{nombre}}'}, {'{{mes}}'} y {'{{monto}}'}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label className="cursor-pointer font-bold" htmlFor="preview">Vista Previa</Label>
              <Checkbox id="preview" checked={vistaPrevia} onCheckedChange={(v) => setVistaPrevia(!!v)} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {vistaPrevia && seleccionados.size > 0 ? (
              <div className="rounded-lg bg-gray-50 p-4 font-mono text-sm border border-gray-200 whitespace-pre-wrap">
                <div className="font-bold border-b pb-2 mb-2 text-gray-800">Asunto: {resolverVariables(asunto, Array.from(seleccionados)[0])}</div>
                <div className="text-gray-700">{resolverVariables(cuerpo, Array.from(seleccionados)[0])}</div>
                <div className="mt-4 text-xs text-gray-400 italic">Previsualizando para: {docentesBackend.find(d => d.id === Array.from(seleccionados)[0])?.nombreCompleto}</div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Asunto</Label>
                  <Input value={asunto} onChange={e => setAsunto(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Mensaje</Label>
                  <Textarea value={cuerpo} onChange={e => setCuerpo(e.target.value)} rows={12} className="resize-none" />
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="bg-gray-50 flex justify-between items-center py-4 border-t">
            <span className="text-sm text-gray-500">{seleccionados.size} destinatario(s) seleccionados</span>
            <Button onClick={handleEnviar} disabled={enviando || seleccionados.size === 0}>
              <Send className="mr-2 h-4 w-4" />
              {enviando ? 'Empaquetando...' : 'Enviar al Backend'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
