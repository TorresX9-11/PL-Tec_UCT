import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { FileText, Users, Award, TrendingUp, CheckCircle, AlertCircle, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { getNombreCarrera } from '../../data/mockData';
import { getDashboardStats, getDocentesPorCarrera, getGruposPorCarrera, type DashboardStats, type DocenteAcademico, type GrupoAcademico } from '../../data/academico';
import { toast } from 'sonner';

export function AcademicDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [docentes, setDocentes] = useState<DocenteAcademico[]>([]);
  const [grupos, setGrupos] = useState<GrupoAcademico[]>([]);
  const [loading, setLoading] = useState(true);

  // Datos del coordinador logueado
  const userName = sessionStorage.getItem('userName') || 'Coordinador/a';
  const carreraId = sessionStorage.getItem('coordinadorCarreraId') || '';
  const carreraNombre = getNombreCarrera(carreraId);
  const isSupervising = !!sessionStorage.getItem('modoSupervision');

  useEffect(() => {
    async function loadStats() {
      if (!carreraId) {
        setLoading(false);
        return;
      }
      try {
        const [data, docs, grps] = await Promise.all([
          getDashboardStats(carreraId),
          getDocentesPorCarrera(carreraId),
          getGruposPorCarrera(carreraId)
        ]);
        setStats(data);
        setDocentes(docs);
        setGrupos(grps);
      } catch (err) {
        toast.error('No se pudieron cargar las estadísticas.');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [carreraId]);

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando dashboard...</div>;

  const totalDocentes = stats?.totalDocentes ?? 0;
  const cvCompleto = stats?.cvCompleto ?? 0;
  const documentacionCompleta = stats?.documentacionCompleta ?? 0;
  const contenidoAlDia = stats?.contenidoAlDia ?? 0;
  const notasAlDia = stats?.notasAlDia ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {isSupervising
            ? `Visualizando: ${carreraNombre ?? 'Sin carrera asignada'}`
            : `Bienvenido ${userName}`}
        </h1>
        <p className="mt-2 text-gray-600 flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-green-600" />
          {isSupervising
            ? `Modo supervisión${carreraNombre ? ` · ${carreraNombre}` : ''}`
            : (carreraNombre
                ? `Coordinador de ${carreraNombre}`
                : 'Coordinador')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Docentes Activos</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDocentes}</div>
            <p className="text-xs text-gray-600">Total en plataforma</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CV Actualizado</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cvCompleto}/{totalDocentes}
            </div>
            <p className="text-xs text-gray-600">
              {Math.round((cvCompleto / totalDocentes) * 100)}% completado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentación</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documentacionCompleta}/{totalDocentes}
            </div>
            <p className="text-xs text-gray-600">Certificados completos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cumplimiento GA</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(((contenidoAlDia + notasAlDia) / (totalDocentes * 2)) * 100)}%
            </div>
            <p className="text-xs text-gray-600">Contenido y notas</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Modules */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link to="/academico/plataforma-docentes">
          <Card className="cursor-pointer transition-all hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Plataforma Docentes</CardTitle>
                  <CardDescription>CV y Certificados</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
                  Gestión de CV
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
                  Certificados
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
                  Capacitaciones
                </li>
              </ul>
            </CardContent>
          </Card>
        </Link>

        <Link to="/academico/gestion-academica">
          <Card className="cursor-pointer transition-all hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-3">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle>Gestión Académica</CardTitle>
                  <CardDescription>Reportes GA</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-600"></div>
                  Contenido Blackboard
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-600"></div>
                  Notas al día
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-600"></div>
                  Reportes
                </li>
              </ul>
            </CardContent>
          </Card>
        </Link>

        <Link to="/academico/acreditacion">
          <Card className="cursor-pointer transition-all hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-100 p-3">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Acreditación</CardTitle>
                  <CardDescription>Proceso institucional</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-600"></div>
                  Hitos del proceso
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-600"></div>
                  Evidencias
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-600"></div>
                  Seguimiento
                </li>
              </ul>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Alertas */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas y Pendientes</CardTitle>
          <CardDescription>Acciones que requieren atención</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {docentes
              .filter(d => d.estado_cv !== 'Validado' || d.estado_antecedentes !== 'Validado')
              .slice(0, 5) // Mostramos solo los primeros 5 para el dashboard
              .map((docente) => {
                const ramos = grupos.filter(g => g.rut_docente === docente.rut_docente);
                const faltanNotas = ramos.some(r => r.notas_estado !== 'Validado');
                const faltaContenido = ramos.some(r => r.contenido_blackboard !== 'Validado');
                
                if (docente.estado_cv === 'Validado' && docente.estado_antecedentes === 'Validado' && !faltanNotas && !faltaContenido) {
                  return null;
                }
                
                return (
                  <div
                    key={docente.rut_docente}
                    className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4"
                  >
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <div className="flex-1">
                      <h4 className="font-medium">{docente.nombre}</h4>
                      <ul className="mt-1 space-y-1 text-sm text-gray-700">
                        {docente.estado_cv !== 'Validado' && <li>• Actualizar CV</li>}
                        {docente.estado_antecedentes !== 'Validado' && <li>• Subir certificado de antecedentes</li>}
                        {faltaContenido && <li>• Subir contenido a plataformas</li>}
                        {faltanNotas && <li>• Actualizar registro de notas</li>}
                      </ul>
                    </div>
                  </div>
                );
              })}

            {docentes.every(
              d => d.estado_cv === 'Validado' && d.estado_antecedentes === 'Validado' && 
              grupos.filter(g => g.rut_docente === d.rut_docente).every(r => r.contenido_blackboard === 'Validado' && r.notas_estado === 'Validado')
            ) && docentes.length > 0 && (
              <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Todos los docentes están al día</span>
              </div>
            )}
            
            {docentes.length === 0 && (
              <div className="text-gray-500 text-sm">No hay docentes registrados en esta carrera.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
