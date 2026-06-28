import { useState, useMemo, useEffect } from 'react';
import { Download, FileText, Calendar } from 'lucide-react';
import { listDocentes } from '../../data/docentes';
import { listPropuestas } from '../../data/propuestas';
import { listPagos } from '../../data/pagos';
import { listGrupos } from '../../data/grupos';
import { listCursos } from '../../data/cursos';
import { listCarreras } from '../../data/carreras';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function Reportes() {
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroJornada, setFiltroJornada] = useState<string>('todos');

  const [docentesBackend, setDocentesBackend] = useState<any[]>([]);
  const [propuestasBackend, setPropuestasBackend] = useState<any[]>([]);
  const [pagosBackend, setPagosBackend] = useState<any[]>([]);
  const [gruposBackend, setGruposBackend] = useState<any[]>([]);
  const [cursosBackend, setCursosBackend] = useState<any[]>([]);
  const [carrerasBackend, setCarrerasBackend] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docRes, propRes, pagosRes, grupRes, curRes, carRes] = await Promise.all([
          listDocentes(),
          listPropuestas(),
          listPagos(),
          listGrupos(),
          listCursos(),
          listCarreras()
        ]);
        setDocentesBackend(docRes.data);
        setPropuestasBackend(propRes.data);
        setPagosBackend(pagosRes.data);
        setGruposBackend(grupRes.data);
        setCursosBackend(curRes.data);
        setCarrerasBackend(carRes.data);
      } catch (e) {
        console.error(e);
        toast.error('Error al cargar datos del reporte');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Construir la vista de docentes con propuesta (similar al dashboard)
  const docentesParaReporte = useMemo(() => {
    return docentesBackend.map(docente => {
      // Buscar propuesta (simplificado a la primera propuesta que tenga el docente, o la del semestre activo si hubiera data completa)
      const propuesta = propuestasBackend.find(p => p.docenteId === docente.id);
      
      let estadoPagoGlobal = 'Sin propuesta';
      let jornada = 'Sin Asignar';

      if (propuesta) {
        jornada = propuesta.numeroCuotas === 5 ? 'Vespertina' : 'Diurna';
        const cuotasDocente = pagosBackend.filter(p => p.propuestaId === propuesta.id);
        const cuotasPagadas = cuotasDocente.filter(c => c.estadoPago === 'Pagada').length;
        
        if (cuotasPagadas > 0) {
          if (cuotasPagadas === propuesta.numeroCuotas && propuesta.numeroCuotas > 0) {
            estadoPagoGlobal = 'Pagado';
          } else {
            estadoPagoGlobal = 'En proceso';
          }
        } else {
          estadoPagoGlobal = 'Pendiente';
        }
      }
      
      // Buscar las asignaturas asociadas a las secciones de este docente
      const secciones = gruposBackend.filter(s => s.docenteId === docente.id);
      const asignaturasNombres = new Set(secciones.map(s => {
        const asig = cursosBackend.find(a => a.id === s.asignaturaId);
        return asig ? asig.nombre : null;
      }).filter(Boolean));
      
      const asignaturaText = Array.from(asignaturasNombres).join(', ') || 'Sin asignatura';

      return {
        ...docente,
        nombreCompleto: docente.nombre || docente.nombreCompleto,
        asignatura: asignaturaText,
        jornada,
        estado: estadoPagoGlobal
      };
    }).filter(d => d.estado !== 'Sin propuesta'); // Solo incluir los que tienen propuesta (pago activo)
  }, [docentesBackend, propuestasBackend, pagosBackend, gruposBackend, cursosBackend, carrerasBackend]);

  const docentesFiltrados = docentesParaReporte.filter((d: any) => {
    const cumpleEstado = filtroEstado === 'todos' || d.estado === filtroEstado;
    const cumpleJornada = filtroJornada === 'todos' || d.jornada === filtroJornada;
    return cumpleEstado && cumpleJornada;
  });

  const generarReportePDF = () => {
    const doc = new jsPDF();

    // Título del reporte
    doc.setFontSize(18);
    doc.text('Reporte de Docentes - TEC UCT', 14, 20);

    doc.setFontSize(11);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CL')}`, 14, 28);
    doc.text(`Total Docentes: ${docentesFiltrados.length}`, 14, 34);

    // Preparar datos para la tabla
    const tableData = docentesFiltrados.map((docente: any) => [
      docente.asignatura,
      docente.jornada,
      docente.rut,
      docente.nombreCompleto,
      docente.estado
    ]);

    // Generar tabla
    autoTable(doc, {
      head: [['Asignaturas', 'Jornada', 'RUT', 'Nombre', 'Estado']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [37, 99, 235] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 40 }
    });

    // Guardar PDF
    doc.save(`reporte-docentes-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Reporte PDF generado exitosamente');
  };

  if (isLoading) {
    return <div className="flex h-full items-center justify-center p-8"><p className="text-gray-500">Cargando datos del reporte...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
        <p className="mt-2 text-gray-600">
          Genere reportes en PDF con la información de los docentes
        </p>
      </div>

      {/* Configuración del Reporte */}
      <Card>
        <CardHeader>
          <CardTitle>Configurar Reporte</CardTitle>
          <CardDescription>
            Seleccione los filtros para personalizar el reporte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="estado">Filtrar por Estado</Label>
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger id="estado">
                  <SelectValue placeholder="Seleccione estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los Estados</SelectItem>
                  <SelectItem value="Pagado">Pagado</SelectItem>
                  <SelectItem value="En proceso">En Proceso</SelectItem>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="jornada">Filtrar por Jornada</Label>
              <Select value={filtroJornada} onValueChange={setFiltroJornada}>
                <SelectTrigger id="jornada">
                  <SelectValue placeholder="Seleccione jornada" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas las Jornadas</SelectItem>
                  <SelectItem value="Diurna">Diurna</SelectItem>
                  <SelectItem value="Vespertina">Vespertina</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Vista Previa del Reporte</p>
                <p className="text-sm text-blue-700">
                  {docentesFiltrados.length} docente(s) serán incluidos en el reporte
                </p>
              </div>
            </div>
          </div>

          <Button onClick={generarReportePDF} className="w-full" size="lg">
            <Download className="mr-2 h-5 w-5" />
            Descargar Reporte PDF
          </Button>
        </CardContent>
      </Card>

      {/* Información del Reporte */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Reporte</CardTitle>
          <CardDescription>
            El reporte incluirá las siguientes columnas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                <span className="text-sm font-bold text-blue-600">1</span>
              </div>
              <div>
                <p className="font-medium">Asignatura</p>
                <p className="text-sm text-gray-600">Asignatura(s) impartidas por el docente</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                <span className="text-sm font-bold text-blue-600">2</span>
              </div>
              <div>
                <p className="font-medium">Jornada</p>
                <p className="text-sm text-gray-600">Diurna o Vespertina</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                <span className="text-sm font-bold text-blue-600">3</span>
              </div>
              <div>
                <p className="font-medium">RUT</p>
                <p className="text-sm text-gray-600">Identificación del docente</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                <span className="text-sm font-bold text-blue-600">4</span>
              </div>
              <div>
                <p className="font-medium">Nombre</p>
                <p className="text-sm text-gray-600">Nombre completo del docente</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                <span className="text-sm font-bold text-blue-600">5</span>
              </div>
              <div>
                <p className="font-medium">Estado</p>
                <p className="text-sm text-gray-600">Estado del pago (Pagado, En proceso, Pendiente)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas Rápidas */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total a Reportar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{docentesFiltrados.length}</div>
            <p className="text-xs text-gray-600">Docentes en el reporte</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Filtros Aplicados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(filtroEstado !== 'todos' ? 1 : 0) + (filtroJornada !== 'todos' ? 1 : 0)}
            </div>
            <p className="text-xs text-gray-600">Filtros activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Última Generación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                {new Date().toLocaleDateString('es-CL')}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
