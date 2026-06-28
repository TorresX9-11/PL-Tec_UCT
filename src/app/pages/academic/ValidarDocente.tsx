import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft, FileCheck, Save, BookOpen, User, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import {
  getDocentesPorCarrera,
  getGruposPorCarrera,
  validarDocente,
  validarGrupo,
  type DocenteAcademico,
  type GrupoAcademico
} from '../../data/academico';

type EstadoValidacion = 'Validado' | 'Por Revisar' | 'Inexistente';

function getEstadoBadge(estado: EstadoValidacion) {
  if (estado === 'Validado') return <Badge variant="default" className="bg-green-600">Validado</Badge>;
  if (estado === 'Por Revisar') return <Badge variant="outline" className="border-yellow-600 text-yellow-700">Por Revisar</Badge>;
  return <Badge variant="destructive">Inexistente</Badge>;
}

export function ValidarDocente() {
  const { docenteId } = useParams(); // actually rut
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const tipo = (searchParams.get('tipo') ?? 'personal') as 'personal' | 'academico';
  const isReadOnly = !!sessionStorage.getItem('modoSupervision');
  const seccionIdParam = searchParams.get('seccion');
  const seccionId = seccionIdParam ? Number(seccionIdParam) : null;

  const [docente, setDocente] = useState<DocenteAcademico | null>(null);
  const [seccion, setSeccion] = useState<GrupoAcademico | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [estados, setEstados] = useState<Record<string, EstadoValidacion>>({});

  const carreraId = sessionStorage.getItem('coordinadorCarreraId') || sessionStorage.getItem('supervisandoCarreraId') || '';

  useEffect(() => {
    async function load() {
      if (!carreraId || !docenteId) return;
      try {
        const docs = await getDocentesPorCarrera(carreraId);
        const doc = docs.find(d => d.rut_docente === Number(docenteId));
        setDocente(doc || null);

        if (tipo === 'academico' && seccionId) {
          const grps = await getGruposPorCarrera(carreraId);
          const grp = grps.find(g => g.id_grupo === seccionId);
          setSeccion(grp || null);
        }
      } catch (err) {
        toast.error('Error al cargar datos de validación.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [carreraId, docenteId, tipo, seccionId]);

  useEffect(() => {
    if (docente && tipo === 'personal') {
      setEstados({
        estado_cv: docente.estado_cv,
        estado_titulo: docente.estado_titulo,
        estado_antecedentes: docente.estado_antecedentes,
        estado_inhabilidad: docente.estado_inhabilidad
      });
    } else if (seccion && tipo === 'academico') {
      setEstados({
        contenido_blackboard: seccion.contenido_blackboard,
        guia_aprendizaje: seccion.guia_aprendizaje,
        notas_estado: seccion.notas_estado
      });
    }
  }, [docente, seccion, tipo]);

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando...</div>;

  if (!docente) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Docente no encontrado</h2>
          <Button className="mt-4" onClick={() => navigate('/academico/gestion-academica')}>
            Volver a Gestión Académica
          </Button>
        </div>
      </div>
    );
  }

  if (tipo === 'academico' && !seccion) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Sección no encontrada</h2>
          <p className="mt-2 text-gray-600">El ramo solicitado no existe o no está asignado a este docente.</p>
          <Button className="mt-4" onClick={() => navigate('/academico/gestion-academica')}>
            Volver a Gestión Académica
          </Button>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      if (tipo === 'personal') {
        await validarDocente(docente.rut_docente, estados);
        toast.success('Documentos personales actualizados');
      } else if (tipo === 'academico' && seccion) {
        await validarGrupo(seccion.id_grupo, estados);
        toast.success(`Archivos académicos actualizados`);
      }
      navigate('/academico/gestion-academica');
    } catch (err) {
      toast.error('Error al guardar validación');
    } finally {
      setSaving(false);
    }
  };

  const validados = Object.values(estados).filter(e => e === 'Validado').length;
  const porRevisar = Object.values(estados).filter(e => e === 'Por Revisar').length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/academico/gestion-academica')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {tipo === 'academico' ? 'Validación Académica' : 'Validación de Documentos Personales'}
            </h1>
            <p className="mt-2 text-gray-600 flex items-center gap-2">
              <User className="h-4 w-4" />
              {docente.nombre} • {docente.rut_docente}-{docente.dv}
              {tipo === 'academico' && seccion && (
                <>
                  <span className="text-gray-300">|</span>
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  Sección {seccion.seccion} ({seccion.nombre_curso})
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isReadOnly && (
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white" disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estado General</CardTitle>
          <CardDescription>Revise y cambie el estado de validación de cada documento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-gray-600">Total Documentos</p>
              <p className="text-3xl font-bold">{Object.keys(estados).length}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-gray-600">Validados</p>
              <p className="text-3xl font-bold text-green-600">{validados}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-gray-600">Por Revisar</p>
              <p className="text-3xl font-bold text-yellow-600">{porRevisar}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {tipo === 'academico' ? 'Archivos Académicos del Ramo' : 'Documentos Personales del Docente'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {tipo === 'personal' && (
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Curriculum Vitae</h4>
                    <Button variant="link" className="h-auto p-0" onClick={() => window.open(`http://localhost:3001/api/v1/archivos/docente_${docente.rut_docente}_cv.pdf`, '_blank')}>Ver PDF</Button>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {getEstadoBadge(estados['estado_cv'])}
                  {!isReadOnly && (
                    <Select value={estados['estado_cv']} onValueChange={(v: EstadoValidacion) => setEstados({ ...estados, estado_cv: v })}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inexistente">Inexistente</SelectItem>
                        <SelectItem value="Por Revisar">Por Revisar</SelectItem>
                        <SelectItem value="Validado">Validado</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <FileCheck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Certificado de Título</h4>
                    <Button variant="link" className="h-auto p-0" onClick={() => window.open(`http://localhost:3001/api/v1/archivos/docente_${docente.rut_docente}_titulo.pdf`, '_blank')}>Ver PDF</Button>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {getEstadoBadge(estados['estado_titulo'])}
                  {!isReadOnly && (
                    <Select value={estados['estado_titulo']} onValueChange={(v: EstadoValidacion) => setEstados({ ...estados, estado_titulo: v })}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inexistente">Inexistente</SelectItem>
                        <SelectItem value="Por Revisar">Por Revisar</SelectItem>
                        <SelectItem value="Validado">Validado</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <FileCheck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Certificado de Antecedentes</h4>
                    <Button variant="link" className="h-auto p-0" onClick={() => window.open(`http://localhost:3001/api/v1/archivos/docente_${docente.rut_docente}_antecedentes.pdf`, '_blank')}>Ver PDF</Button>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {getEstadoBadge(estados['estado_antecedentes'])}
                  {!isReadOnly && (
                    <Select value={estados['estado_antecedentes']} onValueChange={(v: EstadoValidacion) => setEstados({ ...estados, estado_antecedentes: v })}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inexistente">Inexistente</SelectItem>
                        <SelectItem value="Por Revisar">Por Revisar</SelectItem>
                        <SelectItem value="Validado">Validado</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <FileCheck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Certificado de Inhabilidades</h4>
                    <Button variant="link" className="h-auto p-0" onClick={() => window.open(`http://localhost:3001/api/v1/archivos/docente_${docente.rut_docente}_inhabilidades.pdf`, '_blank')}>Ver PDF</Button>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {getEstadoBadge(estados['estado_inhabilidad'])}
                  {!isReadOnly && (
                    <Select value={estados['estado_inhabilidad']} onValueChange={(v: EstadoValidacion) => setEstados({ ...estados, estado_inhabilidad: v })}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inexistente">Inexistente</SelectItem>
                        <SelectItem value="Por Revisar">Por Revisar</SelectItem>
                        <SelectItem value="Validado">Validado</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </div>
          )}

          {tipo === 'academico' && seccion && (
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Contenido en Blackboard</h4>
                    <p className="text-sm text-gray-500">Subido por el docente a la plataforma.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {getEstadoBadge(estados['contenido_blackboard'])}
                  {!isReadOnly && (
                    <Select value={estados['contenido_blackboard']} onValueChange={(v: EstadoValidacion) => setEstados({ ...estados, contenido_blackboard: v })}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inexistente">Inexistente</SelectItem>
                        <SelectItem value="Por Revisar">Por Revisar</SelectItem>
                        <SelectItem value="Validado">Validado</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Guía de Aprendizaje</h4>
                    <Button variant="link" className="h-auto p-0" onClick={() => window.open(`http://localhost:3001/api/v1/archivos/grupo_${seccion.id_grupo}_guia.pdf`, '_blank')}>Ver PDF</Button>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {getEstadoBadge(estados['guia_aprendizaje'])}
                  {!isReadOnly && (
                    <Select value={estados['guia_aprendizaje']} onValueChange={(v: EstadoValidacion) => setEstados({ ...estados, guia_aprendizaje: v })}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inexistente">Inexistente</SelectItem>
                        <SelectItem value="Por Revisar">Por Revisar</SelectItem>
                        <SelectItem value="Validado">Validado</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <FileCheck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Notas al Día</h4>
                    <p className="text-sm text-gray-500">Validación manual de notas</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {getEstadoBadge(estados['notas_estado'])}
                  {!isReadOnly && (
                    <Select value={estados['notas_estado']} onValueChange={(v: EstadoValidacion) => setEstados({ ...estados, notas_estado: v })}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inexistente">Inexistente</SelectItem>
                        <SelectItem value="Por Revisar">Por Revisar</SelectItem>
                        <SelectItem value="Validado">Validado</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
