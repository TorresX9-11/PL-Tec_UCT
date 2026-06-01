import { useState, useMemo } from 'react';
import { Download, FileText, Calendar } from 'lucide-react';
import { mockDocentesMaestros, mockCarreras, mockAsignaturas, mockSeccionesAsignaturas, mockPropuestasSemestrales } from '../../data/mockData';
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

  // Construir la vista de docentes con propuesta (similar al dashboard)
  const docentesParaReporte = useMemo(() => {
    return mockDocentesMaestros.map(docente => {
      // Buscar propuesta del semestre activo
      const propuesta = mockPropuestasSemestrales.find(p => p.docenteId === docente.id && p.semestre === 1 && p.año === 2026);
      
      // Si no tiene propuesta, su estado de pago es 'Sin propuesta' o se omite
      const estadoPago = propuesta ? propuesta.estadoPago : 'Sin propuesta';
      const jornada = propuesta ? (propuesta.numeroCuotas === 5 ? 'Vespertina' : 'Diurna') : 'Sin Asignar';
      
      // Buscar las carreras asociadas a las secciones de este docente
      const secciones = mockSeccionesAsignaturas.filter(s => s.docenteId === docente.id);
      const carrerasIds = new Set(secciones.map(s => {
        const asig = mockAsignaturas.find(a => a.id === s.asignaturaId);
        return asig ? asig.carreraId : null;
      }).filter(Boolean));
      
      const carrerasNombres = Array.from(carrerasIds)
        .map(id => mockCarreras.find(c => c.id === id)?.nombre)
        .filter(Boolean)
        .join(', ');

      return {
        ...docente,
        carrera: carrerasNombres || 'Sin carrera',
        jornada,
        estado: estadoPago
      };
    }).filter(d => d.estado !== 'Sin propuesta'); // Solo incluir los que tienen propuesta (pago activo)
  }, []);

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
      docente.carrera,
      docente.jornada,
      docente.rut,
      docente.nombreCompleto,
      docente.estado
    ]);

    // Generar tabla
    autoTable(doc, {
      head: [['Carrera', 'Jornada', 'RUT', 'Nombre', 'Estado']],
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
                <p className="font-medium">Carrera</p>
                <p className="text-sm text-gray-600">Carrera asignada al docente</p>
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
