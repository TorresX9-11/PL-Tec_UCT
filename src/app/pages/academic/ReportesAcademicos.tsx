import { useState, useEffect } from 'react';
import { Download, FileText } from 'lucide-react';
import { getDocentesPorCarrera, getGruposPorCarrera, DocenteAcademico, GrupoAcademico } from '../../data/academico';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function ReportesAcademicos() {
  const [tipoReporte, setTipoReporte] = useState<string>('general');
  const [docentes, setDocentes] = useState<DocenteAcademico[]>([]);
  const [grupos, setGrupos] = useState<GrupoAcademico[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      const carreraId = sessionStorage.getItem('coordinadorCarreraId');
      if (!carreraId) {
        toast.error('No se pudo determinar la carrera del coordinador.');
        setLoading(false);
        return;
      }
      try {
        const [d, g] = await Promise.all([
          getDocentesPorCarrera(carreraId),
          getGruposPorCarrera(carreraId)
        ]);
        setDocentes(d);
        setGrupos(g);
      } catch (err) {
        toast.error('Error al cargar datos para reportes');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const generarReporteGeneral = () => {
    const doc = new jsPDF('landscape');

    // Título del reporte
    doc.setFontSize(18);
    doc.text('Reporte General Académico - TEC UCT', 14, 20);

    doc.setFontSize(11);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CL')}`, 14, 28);
    doc.text(`Total Docentes: ${docentes.length}`, 14, 34);

    // Preparar datos para la tabla
    const tableData = docentes.map(docente => {
      const gruposDocente = grupos.filter(g => g.rut_docente === docente.rut_docente);
      
      const contenidoValidados = gruposDocente.filter(g => g.contenido_blackboard === 'Validado').length;
      const contenidoOk = gruposDocente.length > 0 && contenidoValidados === gruposDocente.length ? 'Sí' : 'No';
      
      const guiaValidados = gruposDocente.filter(g => g.guia_aprendizaje === 'Validado').length;
      const guiaOk = gruposDocente.length > 0 && guiaValidados === gruposDocente.length ? 'Validado' : 'Pendiente';
      
      const notasIngresadas = gruposDocente.reduce((acc, g) => acc + g.notas_ingresadas, 0);
      const notasTotales = gruposDocente.reduce((acc, g) => acc + g.notas_curso, 0);
      
      return [
        docente.nombre,
        `${docente.rut_docente}-${docente.dv}`,
        contenidoOk,
        `${notasIngresadas}/${notasTotales}`,
        guiaOk,
        docente.estado_cv === 'Validado' ? 'Sí' : 'No',
        docente.capacitaciones.toString()
      ];
    });

    // Generar tabla
    autoTable(doc, {
      head: [['Docente', 'RUT', 'Contenido', 'Notas', 'Guía Aprend.', 'CV', 'Capacit.']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [22, 163, 74] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 40 }
    });

    doc.save(`reporte-academico-general-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Reporte general generado exitosamente');
  };

  const generarReporteDocumentacion = () => {
    const doc = new jsPDF();

    // Título del reporte
    doc.setFontSize(18);
    doc.text('Reporte de Documentación - TEC UCT', 14, 20);

    doc.setFontSize(11);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CL')}`, 14, 28);

    // Preparar datos para la tabla
    const tableData = docentes.map(docente => [
      docente.nombre,
      `${docente.rut_docente}-${docente.dv}`,
      docente.estado_cv,
      docente.estado_titulo,
      docente.estado_antecedentes,
      docente.estado_inhabilidad
    ]);

    // Generar tabla
    autoTable(doc, {
      head: [['Docente', 'RUT', 'CV', 'Cert. Título', 'Cert. Ant.', 'Cert. Inhab.']],
      body: tableData,
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 163, 74] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        2: { cellWidth: 'auto' },
        3: { cellWidth: 'auto' },
        4: { cellWidth: 'auto' },
        5: { cellWidth: 'auto' }
      }
    });

    doc.save(`reporte-documentacion-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Reporte de documentación generado exitosamente');
  };

  const generarReporteCapacitaciones = () => {
    const doc = new jsPDF();

    // Título del reporte
    doc.setFontSize(18);
    doc.text('Reporte de Capacitaciones - TEC UCT', 14, 20);

    doc.setFontSize(11);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CL')}`, 14, 28);

    const totalCapacitaciones = docentes.reduce((sum, d) => sum + d.capacitaciones, 0);
    const promedio = docentes.length > 0 ? Math.round(totalCapacitaciones / docentes.length) : 0;

    doc.text(`Total Capacitaciones: ${totalCapacitaciones}`, 14, 34);
    doc.text(`Promedio por Docente: ${promedio}`, 14, 40);

    // Preparar datos para la tabla
    const tableData = docentes.map(docente => [
      docente.nombre,
      `${docente.rut_docente}-${docente.dv}`,
      docente.capacitaciones.toString(),
      docente.capacitaciones >= promedio ? 'Sobre promedio' : 'Bajo promedio'
    ]);

    // Generar tabla
    autoTable(doc, {
      head: [['Docente', 'RUT', 'N° Capacitaciones', 'Estado']],
      body: tableData,
      startY: 48,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 163, 74] },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    doc.save(`reporte-capacitaciones-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Reporte de capacitaciones generado exitosamente');
  };

  const handleGenerarReporte = () => {
    switch (tipoReporte) {
      case 'general':
        generarReporteGeneral();
        break;
      case 'documentacion':
        generarReporteDocumentacion();
        break;
      case 'capacitaciones':
        generarReporteCapacitaciones();
        break;
      default:
        toast.error('Seleccione un tipo de reporte');
    }
  };

  const getDescripcionReporte = () => {
    switch (tipoReporte) {
      case 'general':
        return 'Incluye: Docente, RUT, Contenido Blackboard, Notas al Día, Estado Guía de Aprendizaje, CV Actualizado, Capacitaciones';
      case 'documentacion':
        return 'Incluye: Docente, RUT, Estado de CV, Certificado de Título, Certificado de Antecedentes, Certificado de Inhabilidad, Carnet de Identidad';
      case 'capacitaciones':
        return 'Incluye: Docente, RUT, Número de Capacitaciones, Comparación con promedio institucional';
      default:
        return 'Seleccione un tipo de reporte para ver su descripción';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reportes Académicos</h1>
        <p className="mt-2 text-gray-600">
          Genere reportes en PDF con información académica y de gestión docente
        </p>
      </div>

      {/* Configuración del Reporte */}
      <Card>
        <CardHeader>
          <CardTitle>Configurar Reporte</CardTitle>
          <CardDescription>
            Seleccione el tipo de reporte que desea generar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="tipo-reporte">Tipo de Reporte</Label>
            <Select value={tipoReporte} onValueChange={setTipoReporte}>
              <SelectTrigger id="tipo-reporte">
                <SelectValue placeholder="Seleccione tipo de reporte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Reporte General Académico</SelectItem>
                <SelectItem value="documentacion">Reporte de Documentación</SelectItem>
                <SelectItem value="capacitaciones">Reporte de Capacitaciones</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg bg-green-50 p-4">
            <div className="flex items-start gap-2">
              <FileText className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-green-900">Descripción del Reporte</p>
                <p className="text-sm text-green-700 mt-1">
                  {getDescripcionReporte()}
                </p>
              </div>
            </div>
          </div>

          <Button onClick={handleGenerarReporte} className="w-full" size="lg">
            <Download className="mr-2 h-5 w-5" />
            Descargar Reporte PDF
          </Button>
        </CardContent>
      </Card>

      {/* Tipos de Reportes Disponibles */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className={tipoReporte === 'general' ? 'border-green-500 shadow-lg' : ''}>
          <CardHeader>
            <CardTitle className="text-base">Reporte General</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Vista completa del estado académico de todos los docentes
            </p>
          </CardContent>
        </Card>

        <Card className={tipoReporte === 'documentacion' ? 'border-green-500 shadow-lg' : ''}>
          <CardHeader>
            <CardTitle className="text-base">Documentación</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Estado de todos los certificados y documentos requeridos
            </p>
          </CardContent>
        </Card>

        <Card className={tipoReporte === 'capacitaciones' ? 'border-green-500 shadow-lg' : ''}>
          <CardHeader>
            <CardTitle className="text-base">Capacitaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Análisis de capacitaciones realizadas por los docentes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Docentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{docentes.length}</div>
            <p className="text-xs text-gray-600">Registros en el sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Documentación Completa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {docentes.filter(
                d => d.estado_cv === 'Validado' &&
                     d.estado_titulo === 'Validado' &&
                     d.estado_antecedentes === 'Validado' &&
                     d.estado_inhabilidad === 'Validado'
              ).length}
            </div>
            <p className="text-xs text-gray-600">Docentes con todo validado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Capacitaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {docentes.reduce((sum, d) => sum + d.capacitaciones, 0)}
            </div>
            <p className="text-xs text-gray-600">Entre todos los docentes</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
