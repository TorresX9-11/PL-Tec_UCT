import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft, FileCheck, Save, BookOpen, User } from 'lucide-react';
import {
  mockDocentesAcademicos,
  mockSeccionesAsignaturas,
  mockAsignaturas,
  type EstadoValidacion
} from '../../data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';

// ─── Definiciones de docs por contexto ───────────────────────────────────────
type DocPersonalKey = 'cvActualizado' | 'certificadoTitulo' | 'certificadoAntecedentes' | 'certificadoInhabilidad' | 'carnetIdentidad';

interface DocItem {
  key: string;
  nombre: string;
  archivo: string;
  estado: EstadoValidacion;
}

const PERSONALES_DEF: { key: DocPersonalKey; nombre: string; archivo: string }[] = [
  { key: 'cvActualizado', nombre: 'CV Actualizado', archivo: 'cv_actualizado.pdf' },
  { key: 'certificadoTitulo', nombre: 'Certificado de Título', archivo: 'certificado_titulo.pdf' },
  { key: 'certificadoAntecedentes', nombre: 'Certificado de Antecedentes', archivo: 'certificado_antecedentes.pdf' },
  { key: 'certificadoInhabilidad', nombre: 'Certificado de Inhabilidad', archivo: 'certificado_inhabilidad.pdf' },
  { key: 'carnetIdentidad', nombre: 'Carnet de Identidad', archivo: 'carnet_identidad.pdf' }
];

// ─── Helper: badge de estado ─────────────────────────────────────────────────
function getEstadoBadge(estado: EstadoValidacion) {
  if (estado === 'Validado') return <Badge variant="default" className="bg-green-600">Validado</Badge>;
  if (estado === 'Por Revisar') return <Badge variant="outline" className="border-yellow-600 text-yellow-700">Por Revisar</Badge>;
  return <Badge variant="destructive">Inexistente</Badge>;
}

export function ValidarDocente() {
  const { docenteId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Modo de validación: ?tipo=personal | ?tipo=academico&seccion=X | (default: personal)
  const tipo = (searchParams.get('tipo') ?? 'personal') as 'personal' | 'academico';

  // Modo supervisión: el supervisor solo puede visualizar, no modificar
  const isReadOnly = !!sessionStorage.getItem('modoSupervision');
  const seccionIdParam = searchParams.get('seccion');
  const seccionId = seccionIdParam ? Number(seccionIdParam) : null;

  const docente = mockDocentesAcademicos.find(d => d.id === Number(docenteId ?? 0));

  // Sección activa (solo si tipo=academico) — derivada de mockSeccionesAsignaturas
  const seccion = useMemo(() => {
    if (tipo !== 'academico' || seccionId === null) return null;
    return mockSeccionesAsignaturas.find(s => s.id === seccionId) ?? null;
  }, [tipo, seccionId]);

  const asignatura = useMemo(() => {
    if (!seccion) return null;
    return mockAsignaturas.find(a => a.id === seccion.asignaturaId) ?? null;
  }, [seccion]);

  // Construye la lista de docs a editar según el modo
  const docs: DocItem[] = useMemo(() => {
    if (!docente) return [];
    if (tipo === 'academico') {
      if (!seccion) return [];
      return [
        { key: 'contenidoBlackboard', nombre: 'Contenido en Blackboard', archivo: 'contenido_blackboard.pdf', estado: seccion.contenidoBlackboard ?? 'Inexistente' },
        // 'Notas al Día' no es un EstadoValidacion sino un X/Y → en el form usamos un estado derivado
        { key: 'notasAlDia', nombre: 'Notas al Día', archivo: 'notas_curso.xlsx',
          estado: ((seccion.notasTotales ?? 0) > 0 && (seccion.notasIngresadas ?? 0) >= (seccion.notasTotales ?? 0))
            ? 'Validado'
            : (seccion.notasIngresadas ?? 0) > 0 ? 'Por Revisar' : 'Inexistente' },
        { key: 'guiaAprendizaje', nombre: 'Guía de Aprendizaje', archivo: 'guia_aprendizaje.pdf', estado: seccion.guiaAprendizaje ?? 'Inexistente' }
      ];
    }
    // tipo=personal
    return PERSONALES_DEF.map(d => ({
      key: d.key,
      nombre: d.nombre,
      archivo: d.archivo,
      estado: docente[d.key] as EstadoValidacion
    }));
  }, [docente, tipo, seccion]);

  // Estado del form (keyed por doc.key)
  const [estados, setEstados] = useState<Record<string, EstadoValidacion>>({});

  useEffect(() => {
    const initial: Record<string, EstadoValidacion> = {};
    docs.forEach(d => { initial[d.key] = d.estado; });
    setEstados(initial);
  }, [docs]);

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

  const handleSave = () => {
    // Persistir cambios en mockData (patrón mock)
    if (tipo === 'personal') {
      PERSONALES_DEF.forEach(d => {
        if (estados[d.key]) (docente as any)[d.key] = estados[d.key];
      });
      toast.success('Documentos personales actualizados');
    } else if (tipo === 'academico' && seccion) {
      const idx = mockSeccionesAsignaturas.findIndex(s => s.id === seccion.id);
      if (idx >= 0) {
        mockSeccionesAsignaturas[idx] = {
          ...mockSeccionesAsignaturas[idx],
          contenidoBlackboard: estados['contenidoBlackboard'] ?? mockSeccionesAsignaturas[idx].contenidoBlackboard,
          guiaAprendizaje: estados['guiaAprendizaje'] ?? mockSeccionesAsignaturas[idx].guiaAprendizaje
          // notasAlDia es derivado de notasIngresadas/notasTotales → no se edita directo desde aquí
        };
      }
      toast.success(`Archivos académicos de ${asignatura?.sigla ?? 'la sección'} actualizados`);
    }
    navigate('/academico/gestion-academica');
  };

  const validados = Object.values(estados).filter(e => e === 'Validado').length;
  const porRevisar = Object.values(estados).filter(e => e === 'Por Revisar').length;

  // Título y descripción contextual
  const tituloPagina = isReadOnly
    ? (tipo === 'academico'
        ? `Visualización Académica — ${asignatura?.sigla ?? ''}`
        : 'Visualización de Archivos Personales')
    : (tipo === 'academico'
        ? `Validación Académica — ${asignatura?.sigla ?? ''}`
        : 'Validación de Archivos Personales');
  const descripcionPagina = tipo === 'academico' && asignatura && seccion
    ? `${asignatura.nombre} · Sección ${seccion.seccion}`
    : `${docente.nombreCompleto} · ${docente.rut}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/academico/gestion-academica')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {tipo === 'academico' ? <BookOpen className="h-6 w-6 text-green-600" /> : <User className="h-6 w-6 text-blue-600" />}
            <h1 className="text-3xl font-bold text-gray-900">{tituloPagina}</h1>
          </div>
          <p className="mt-1 text-gray-600">{descripcionPagina}</p>
          {tipo === 'academico' && (
            <p className="mt-1 text-sm text-gray-500">Docente: <strong>{docente.nombreCompleto}</strong> · {docente.rut}</p>
          )}
        </div>
        {!isReadOnly && (
          <Button onClick={handleSave} size="lg">
            <Save className="mr-2 h-5 w-5" />
            Guardar Cambios
          </Button>
        )}
      </div>

      {/* Resumen */}
      <Card>
        <CardHeader>
          <CardTitle>Estado General</CardTitle>
          <CardDescription>
            {isReadOnly
              ? 'Visualización del estado de validación (solo lectura)'
              : (tipo === 'academico'
                  ? 'Resumen de validación académica para este ramo'
                  : 'Resumen de validación de documentos personales del docente')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-gray-600">Total Documentos</p>
              <p className="text-3xl font-bold">{docs.length}</p>
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

      {/* Validación de Documentos */}
      <Card>
        <CardHeader>
          <CardTitle>
            {tipo === 'academico' ? 'Archivos Académicos del Ramo' : 'Documentos Personales del Docente'}
          </CardTitle>
          <CardDescription>
            Revise y cambie el estado de validación de cada documento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {docs.map((doc) => {
            const isNotasAlDia = doc.key === 'notasAlDia';
            return (
              <div key={doc.key} className="rounded-lg border p-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                    <FileCheck className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{doc.nombre}</h4>
                    <p className="text-sm text-gray-600">{doc.archivo}</p>
                    {isNotasAlDia && seccion && (
                      <p className="text-xs text-gray-500 mt-1">
                        Progreso: {seccion.notasIngresadas ?? 0} de {seccion.notasTotales ?? 0} notas ingresadas
                      </p>
                    )}
                    <div className="mt-3 grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor={`estado-${doc.key}`}>Estado de Validación</Label>
                        <Select
                          value={estados[doc.key] ?? doc.estado}
                          onValueChange={(value: string) => setEstados((prev: Record<string, EstadoValidacion>) => ({ ...prev, [doc.key]: value as EstadoValidacion }))}
                          disabled={isNotasAlDia || isReadOnly}
                        >
                          <SelectTrigger id={`estado-${doc.key}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Inexistente">Inexistente</SelectItem>
                            <SelectItem value="Por Revisar">Por Revisar</SelectItem>
                            <SelectItem value="Validado">Validado</SelectItem>
                          </SelectContent>
                        </Select>
                        {isNotasAlDia && (
                          <p className="mt-1 text-xs italic text-gray-500">
                            Las notas se actualizan desde la plataforma; este estado es derivado.
                          </p>
                        )}
                      </div>
                      <div className="flex items-end">
                        {getEstadoBadge(estados[doc.key] ?? doc.estado)}
                      </div>
                    </div>
                    <div className="mt-3">
                      <Button variant="outline" size="sm">Ver Documento</Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Botones de Acción */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate('/academico/gestion-academica')}>
          Cancelar
        </Button>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Guardar Cambios
        </Button>
      </div>
    </div>
  );
}
