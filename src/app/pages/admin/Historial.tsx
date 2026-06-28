import { useEffect, useMemo, useState } from 'react';
import { Download, History, Search, ShieldCheck, FileSpreadsheet, DollarSign, Receipt, Archive, FileArchive, CheckCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  getHistorialActivo,
  getArchivosHistoricos,
  cerrarSemestre,
  type RegistroHistorial,
  type ArchivoHistorico,
  type TipoRegistro
} from '../../data/historial';

const TIPOS: TipoRegistro[] = ['Validación', 'Designación', 'Pago', 'Boleta', 'Sistema'];

function iconoTipo(tipo: TipoRegistro) {
  switch (tipo) {
    case 'Validación': return <ShieldCheck className="h-4 w-4 text-green-600" />;
    case 'Designación': return <FileSpreadsheet className="h-4 w-4 text-blue-600" />;
    case 'Pago': return <DollarSign className="h-4 w-4 text-emerald-600" />;
    case 'Boleta': return <Receipt className="h-4 w-4 text-purple-600" />;
    case 'Sistema': return <Archive className="h-4 w-4 text-gray-600" />;
    default: return <History className="h-4 w-4 text-gray-600" />;
  }
}

function badgeTipo(tipo: TipoRegistro) {
  const cls: Record<TipoRegistro, string> = {
    'Validación': 'bg-green-100 text-green-800 border-green-200',
    'Designación': 'bg-blue-100 text-blue-800 border-blue-200',
    'Pago': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Boleta': 'bg-purple-100 text-purple-800 border-purple-200',
    'Sistema': 'bg-gray-100 text-gray-800 border-gray-200'
  };
  return <Badge variant="outline" className={`gap-1 ${cls[tipo] || cls['Sistema']}`}>{iconoTipo(tipo)}{tipo}</Badge>;
}

function badgeEstado(estado: string) {
  const ok = ['Validado', 'Pagada', 'Procesada', 'Asignado'].includes(estado);
  const warn = ['Por Revisar', 'Pendiente', 'Subida'].includes(estado);
  const bad = ['Con Observación', 'Inexistente', 'Sin Guía'].includes(estado);
  if (ok) return <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">{estado}</Badge>;
  if (warn) return <Badge variant="outline" className="border-yellow-300 bg-yellow-50 text-yellow-700">{estado}</Badge>;
  if (bad) return <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">{estado}</Badge>;
  return <Badge variant="outline">{estado}</Badge>;
}

export function Historial() {
  const [registros, setRegistros] = useState<RegistroHistorial[]>([]);
  const [archivos, setArchivos] = useState<ArchivoHistorico[]>([]);
  const [cargando, setCargando] = useState(true);
  
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroModulo, setFiltroModulo] = useState<string>('todos');
  const [cerrando, setCerrando] = useState(false);

  const fetchDatos = async () => {
    setCargando(true);
    try {
      const [histActivo, histArchivos] = await Promise.all([
        getHistorialActivo(),
        getArchivosHistoricos()
      ]);
      setRegistros(histActivo);
      setArchivos(histArchivos);
    } catch (error) {
      toast.error('Error al cargar el historial');
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchDatos();
  }, []);

  const handleCerrarSemestre = async () => {
    const periodoNombre = window.prompt("Ingresa el nombre del periodo a cerrar (Ej: 'Semestre 1 - 2026')");
    if (!periodoNombre) return;

    if (!window.confirm(`¿Estás completamente seguro de cerrar el periodo '${periodoNombre}'? Esto generará un PDF, un ZIP con boletas y borrará el historial activo de la base de datos para liberar espacio. Esta acción no se puede deshacer.`)) {
      return;
    }

    setCerrando(true);
    try {
      await cerrarSemestre(periodoNombre);
      toast.success('¡Semestre cerrado exitosamente!');
      await fetchDatos();
    } catch (error: any) {
      toast.error(error.message || 'Error al cerrar el semestre');
    } finally {
      setCerrando(false);
    }
  };

  const modulos = useMemo(
    () => Array.from(new Set(registros.map(r => r.modulo))).sort(),
    [registros]
  );

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return registros.filter(r => {
      const cumpleTipo = filtroTipo === 'todos' || r.tipo === filtroTipo;
      const cumpleModulo = filtroModulo === 'todos' || r.modulo === filtroModulo;
      const cumpleBusqueda =
        q === '' ||
        r.docente?.toLowerCase().includes(q) ||
        r.descripcion.toLowerCase().includes(q) ||
        r.actor.toLowerCase().includes(q) ||
        r.estado.toLowerCase().includes(q);
      return cumpleTipo && cumpleModulo && cumpleBusqueda;
    });
  }, [registros, busqueda, filtroTipo, filtroModulo]);

  const conteoPorTipo = useMemo(() => {
    const base: Record<TipoRegistro, number> = { 'Validación': 0, 'Designación': 0, 'Pago': 0, 'Boleta': 0, 'Sistema': 0 };
    for (const r of registros) if(base[r.tipo] !== undefined) base[r.tipo] += 1;
    return base;
  }, [registros]);

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Historial de Actividad - TEC UCT', 14, 20);
    doc.setFontSize(11);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CL')}`, 14, 28);
    doc.text(`Total registros exportados: ${filtrados.length}`, 14, 34);

    const tableData = filtrados.map(r => [
      r.fechaLabel,
      r.tipo,
      r.modulo,
      r.actor,
      r.docente,
      r.descripcion,
      r.estado
    ]);

    autoTable(doc, {
      head: [['Fecha', 'Tipo', 'Módulo', 'Responsable', 'Docente', 'Detalle', 'Estado']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [37, 99, 235] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: { 5: { cellWidth: 60 } },
      margin: { top: 40 }
    });

    doc.save(`historial-export-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Historial exportado a PDF');
  };

  const tarjetas: { tipo: TipoRegistro; total: number }[] = TIPOS.map(t => ({ tipo: t, total: conteoPorTipo[t] || 0 }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900">
            <History className="h-7 w-7 text-blue-600" />
            Historial y Archivos
          </h1>
          <p className="mt-2 text-gray-600">
            Registro auditable de acciones del sistema y archivo histórico por semestre.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCerrarSemestre} disabled={cerrando || registros.length === 0} variant="destructive">
            <Archive className="mr-2 h-4 w-4" />
            {cerrando ? 'Cerrando...' : 'Cerrar Semestre'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="activo" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activo">Historial Activo</TabsTrigger>
          <TabsTrigger value="archivos">Archivos Históricos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="activo" className="space-y-6">
          {/* Estadísticas por tipo */}
          <div className="grid gap-4 md:grid-cols-5">
            {tarjetas.map(({ tipo, total }) => (
              <Card key={tipo}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    {iconoTipo(tipo)}
                    {tipo}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{total}</div>
                  <p className="text-xs text-gray-600">registros</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filtros */}
          <Card>
            <CardContent className="grid gap-4 pt-6 md:grid-cols-3">
              <div>
                <Label htmlFor="busqueda">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="busqueda"
                    placeholder="Docente, detalle, estado..."
                    className="pl-8"
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="tipo">Tipo de actividad</Label>
                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger id="tipo">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los tipos</SelectItem>
                    {TIPOS.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="modulo">Módulo</Label>
                <Select value={filtroModulo} onValueChange={setFiltroModulo}>
                  <SelectTrigger id="modulo">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los módulos</SelectItem>
                    {modulos.map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tabla */}
          <Card>
            <div className="flex justify-end pt-4 pr-6">
              <Button onClick={exportarPDF} disabled={filtrados.length === 0} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Exportar Vista
              </Button>
            </div>
            <CardContent className="pt-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Módulo</TableHead>
                    <TableHead>Responsable</TableHead>
                    <TableHead>Docente</TableHead>
                    <TableHead>Detalle</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cargando ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-gray-500">
                        Cargando historial...
                      </TableCell>
                    </TableRow>
                  ) : filtrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-gray-500">
                        No hay registros en el historial activo.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtrados.map(r => (
                      <TableRow key={r.id}>
                        <TableCell className="whitespace-nowrap text-sm text-gray-600">{r.fechaLabel}</TableCell>
                        <TableCell>{badgeTipo(r.tipo)}</TableCell>
                        <TableCell className="text-sm">{r.modulo}</TableCell>
                        <TableCell className="text-sm">{r.actor}</TableCell>
                        <TableCell className="text-sm font-medium">{r.docente}</TableCell>
                        <TableCell className="max-w-md whitespace-normal text-sm text-gray-700">{r.descripcion}</TableCell>
                        <TableCell>{badgeEstado(r.estado)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <p className="mt-4 text-xs text-gray-500">
                Mostrando {filtrados.length} de {registros.length} registros activos.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archivos">
          <Card>
            <CardHeader>
              <CardTitle>Archivos Históricos de Semestres Anteriores</CardTitle>
              <CardDescription>
                Cuando se cierra un semestre, la base de datos se limpia para ahorrar espacio y se generan archivos estáticos inmutables.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Periodo</TableHead>
                    <TableHead>Fecha de Cierre</TableHead>
                    <TableHead>Historial PDF</TableHead>
                    <TableHead>Boletas ZIP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {archivos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-gray-500">
                        Aún no se ha cerrado ningún semestre.
                      </TableCell>
                    </TableRow>
                  ) : (
                    archivos.map(a => (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">#{a.id}</TableCell>
                        <TableCell className="font-semibold">{a.periodo_nombre}</TableCell>
                        <TableCell>{a.fecha_cierre}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" asChild>
                            <a href={`http://localhost:3001${a.url_pdf_historial}`} target="_blank" rel="noreferrer" download>
                              <FileArchive className="mr-2 h-4 w-4" /> PDF Maestro
                            </a>
                          </Button>
                        </TableCell>
                        <TableCell>
                          {a.url_zip_boletas ? (
                             <Button variant="outline" size="sm" asChild>
                               <a href={`http://localhost:3001${a.url_zip_boletas}`} target="_blank" rel="noreferrer" download>
                                 <FileArchive className="mr-2 h-4 w-4 text-blue-600" /> ZIP Boletas
                               </a>
                             </Button>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
