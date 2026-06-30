import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, FileText, User, Mail, Phone, BookOpen, DollarSign, Calendar, Loader2 } from 'lucide-react';
import { Link } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';

import { getDocente } from '../../data/docentes';
import { listGrupos } from '../../data/grupos';
import { listCursos } from '../../data/cursos';
import { listCarreras } from '../../data/carreras';
import { listPropuestas } from '../../data/propuestas';
import { listPagos } from '../../data/pagos';
import type { DocenteMaestro, EstadoValidacion, SeccionAsignatura, CuotaMensual, PropuestaSemestral, Asignatura, Carrera } from '../../data/mockData';

export function DocenteDashboard() {
  const [docente, setDocente] = useState<DocenteMaestro | null>(null);
  const [ramos, setRamos] = useState<(SeccionAsignatura & { asignatura?: Asignatura, carrera?: Carrera, horasTotal: number })[]>([]);
  const [propuesta, setPropuesta] = useState<PropuestaSemestral | null>(null);
  const [cuotas, setCuotas] = useState<CuotaMensual[]>([]);
  const [boletasPendientes, setBoletasPendientes] = useState<CuotaMensual[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const docenteIdRaw = sessionStorage.getItem('docenteId');
        if (!docenteIdRaw) {
          setLoading(false);
          return;
        }
        
        const dId = Number(docenteIdRaw);
        const doc = await getDocente(dId);
        setDocente(doc);

        if (!doc) {
          setLoading(false);
          return;
        }

        // Fetch groups
        const { data: allGrupos } = await listGrupos();
        const { data: allCursos } = await listCursos();
        const { data: allCarreras } = await listCarreras();

        const misGrupos = allGrupos.filter(g => g.docenteId === dId);
        const ramosConInfo = misGrupos.map(g => {
          const curso = allCursos.find(c => c.id === g.asignaturaId);
          const carrera = allCarreras.find(c => c.id === curso?.carreraId);
          return {
            ...g,
            asignatura: curso,
            carrera: carrera,
            horasTotal: g.horasP + g.horasM + g.horasA
          };
        });
        setRamos(ramosConInfo);

        // Fetch propuesta & pagos
        const { data: allPropuestas } = await listPropuestas();
        const miPropuesta = allPropuestas.find(p => p.docenteId === dId);
        
        if (miPropuesta) {
          setPropuesta(miPropuesta);
          const { data: allPagos } = await listPagos();
          const misPagos = allPagos
            .filter(p => p.propuestaId === miPropuesta.id)
            .map((p, index) => ({
              ...p,
              numeroCuota: index + 1,
              montoBruto: Math.round(miPropuesta.montoTotalPropuesta / miPropuesta.numeroCuotas),
              boletaId: p.boletaEstado !== 'Faltante' ? p.id : undefined // Simplified mapping
            }));
          setCuotas(misPagos);
          setBoletasPendientes(misPagos.filter(p => p.boletaEstado === 'Faltante'));
        }

      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!docente) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Docente no encontrado</h2>
          <p className="mt-2 text-gray-600">Por favor inicie sesión nuevamente.</p>
        </div>
      </div>
    );
  }

  const documentosRequeridos: { nombre: string; estado: EstadoValidacion }[] = [
    { nombre: 'CV Actualizado', estado: docente.cvActualizado },
    { nombre: 'Certificado de Título', estado: docente.certificadoTitulo },
    { nombre: 'Certificado de Antecedentes', estado: docente.certificadoAntecedentes },
    { nombre: 'Certificado de Inhabilidad', estado: docente.certificadoInhabilidad },
    { nombre: 'Carnet de Identidad', estado: docente.carnetIdentidad }
  ];

  const documentosCompletos = documentosRequeridos.filter(d => d.estado === 'Validado').length;
  const porcentajeCompletado = Math.round((documentosCompletos / documentosRequeridos.length) * 100);

  // Formateo de moneda CLP
  const fmtCLP = (n: number) =>
    n.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

  const primerNombre = docente.nombreCompleto.split(' ')[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bienvenido/a, {primerNombre}</h1>
        <p className="mt-2 text-gray-600">
          Gestione su perfil académico, sus boletas y revise el estado de sus pagos.
        </p>
      </div>

      {/* Alerta: Boletas con observación */}
      {cuotas.filter(c => c.boletaEstado === 'Con Observación').length > 0 && (
        <Card className="border-red-300 bg-red-50">
          <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-3">
            <AlertCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-red-600" />
            <div className="flex-1">
              <CardTitle className="text-red-900">
                {cuotas.filter(c => c.boletaEstado === 'Con Observación').length === 1
                  ? '1 boleta tiene observaciones'
                  : `${cuotas.filter(c => c.boletaEstado === 'Con Observación').length} boletas tienen observaciones`}
              </CardTitle>
              <CardDescription className="text-red-800">
                El área administrativa ha revisado su boleta y requiere correcciones. Revise el detalle en la sección de boletas.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {cuotas
                .filter(c => c.boletaEstado === 'Con Observación')
                .map((cuota) => (
                  <div
                    key={cuota.id}
                    className="flex items-center justify-between rounded-lg border border-red-200 bg-white p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100">
                        <FileText className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Boleta de {cuota.mes}</p>
                        {cuota.notas && (
                          <p className="text-xs text-red-600 mt-0.5 max-w-md truncate">
                            {cuota.notas}
                          </p>
                        )}
                      </div>
                    </div>
                    <Link
                      to="/docente/boletas"
                      className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700"
                    >
                      Ver detalle
                    </Link>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerta: Boletas pendientes por subir */}
      {boletasPendientes.length > 0 && (
        <Card className="border-amber-300 bg-amber-50">
          <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-3">
            <AlertCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-amber-600" />
            <div className="flex-1">
              <CardTitle className="text-amber-900">
                {boletasPendientes.length === 1
                  ? 'Tiene 1 boleta pendiente por subir'
                  : `Tiene ${boletasPendientes.length} boletas pendientes por subir`}
              </CardTitle>
              <CardDescription className="text-amber-800">
                Sin su boleta, el pago de la cuota correspondiente <strong>no podrá ser procesado</strong>. Suba sus documentos a la brevedad.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {boletasPendientes.map((cuota) => (
                <div
                  key={cuota.id}
                  className="flex items-center justify-between rounded-lg border border-amber-200 bg-white p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100">
                      <Calendar className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Falta subir boleta de {cuota.mes}</p>
                      <p className="text-xs text-gray-500">
                        Cuota {cuota.numeroCuota} · {fmtCLP(cuota.montoBruto || 0)}
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/docente/boletas"
                    className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-700"
                  >
                    Subir ahora
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información Personal */}
      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
          <CardDescription>Sus datos registrados en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Nombre Completo</p>
                <p className="font-medium">{docente.nombreCompleto}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">RUT</p>
                <p className="font-medium font-mono">{docente.rut}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <Mail className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Correo Electrónico</p>
                <p className="font-medium">{docente.correo}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                <Phone className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Teléfono</p>
                <p className="font-medium text-gray-400">Por completar</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ramos Asignados (NUEVO) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-green-600" />
            Ramos Asignados
          </CardTitle>
          <CardDescription>
            {ramos.length === 0
              ? 'No tiene ramos asignados este semestre'
              : `${ramos.length} asignatura${ramos.length !== 1 ? 's' : ''} en el semestre en curso`}
          </CardDescription>
        </CardHeader>
        {ramos.length > 0 && (
          <CardContent>
            <div className="space-y-2">
              {ramos.map((ramo) => (
                <div
                  key={ramo.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{ramo.asignatura?.nombre ?? '—'}</p>
                    <p className="text-xs text-gray-500">
                      {ramo.carrera?.nombre ?? '—'}
                      <span className="mx-1.5">·</span>
                      Sección {ramo.seccion}
                      <span className="mx-1.5">·</span>
                      <span className={ramo.carrera?.jornada === 'Vespertina' ? 'text-purple-600' : 'text-blue-600'}>
                        {ramo.carrera?.jornada ?? '—'}
                      </span>
                    </p>
                  </div>
                  <div className="ml-4 text-right text-xs text-gray-600">
                    <p>P:{ramo.horasP}h · M:{ramo.horasM}h · A:{ramo.horasA}h</p>
                    <p className="font-semibold text-gray-800">{ramo.horasTotal}h totales</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Estado de Pagos (NUEVO) */}
      {propuesta && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Estado de Pagos
            </CardTitle>
            <CardDescription>
              Semestre {propuesta.semestre}/{propuesta.año} · {fmtCLP(propuesta.montoTotalPropuesta)} total · {propuesta.numeroCuotas} cuotas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Resumen */}
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                <p className="text-xs text-gray-600">Pagado</p>
                <p className="text-lg font-bold text-green-700">
                  {fmtCLP(propuesta.montoTotalPropuesta - (propuesta.saldo || 0))}
                </p>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs text-gray-600">Saldo pendiente</p>
                <p className="text-lg font-bold text-amber-700">{fmtCLP(propuesta.saldo || 0)}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-gray-600">Cuotas pagadas</p>
                <p className="text-lg font-bold">
                  {propuesta.cuotasPagadas || 0} / {propuesta.numeroCuotas}
                </p>
              </div>
            </div>

            {/* Detalle por cuota */}
            <div className="space-y-2">
              {cuotas.map((cuota) => {
                const pagada = cuota.estadoPago === 'Pagada';
                const conBoleta = !!cuota.boletaId;
                return (
                  <div
                    key={cuota.id}
                    className={`flex items-center justify-between rounded-lg border p-3 ${pagada ? 'border-green-200 bg-green-50' : 'bg-white'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full ${pagada ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {pagada ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Calendar className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          Cuota {cuota.numeroCuota} — {cuota.mes}
                        </p>
                        <p className="text-xs text-gray-500">{fmtCLP(cuota.montoBruto || 0)}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {pagada ? (
                        <>
                          <Badge variant="default" className="bg-green-600">Pagada</Badge>
                          {cuota.fechaPago && (
                            <span className="text-xs text-gray-500">{cuota.fechaPago}</span>
                          )}
                        </>
                      ) : conBoleta ? (
                        <Badge variant="outline" className="border-blue-600 text-blue-700">
                          Boleta en revisión
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-amber-500 text-amber-700">
                          Falta subir boleta
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progreso de Documentación */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de Documentación</CardTitle>
          <CardDescription>
            {documentosCompletos} de {documentosRequeridos.length} documentos completos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">Progreso General</span>
              <span className="text-sm font-medium">{porcentajeCompletado}%</span>
            </div>
            <Progress value={porcentajeCompletado} className="h-2" />
          </div>

          <div className="space-y-2">
            {documentosRequeridos.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <span className="text-sm">{doc.nombre}</span>
                {doc.estado === 'Validado' ? (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Validado
                  </Badge>
                ) : doc.estado === 'Por Revisar' ? (
                  <Badge variant="outline" className="gap-1 border-yellow-600 text-yellow-700">
                    Por Revisar
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="gap-1">
                    <XCircle className="h-3 w-3" />
                    Pendiente
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alertas */}
      {documentosCompletos < documentosRequeridos.length && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-900">Documentación Pendiente</CardTitle>
            <CardDescription className="text-yellow-700">
              Complete todos los documentos requeridos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm text-yellow-800">
              {documentosRequeridos
                .filter(d => d.estado !== 'Validado')
                .map((doc, index) => (
                  <li key={index}>• {doc.nombre} <span className="text-yellow-600">({doc.estado})</span></li>
                ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
