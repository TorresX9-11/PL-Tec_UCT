import { useEffect, useMemo, useState } from 'react';
import { Download, History, Search, ShieldCheck, FileSpreadsheet, DollarSign, Receipt } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { getHistorial, type RegistroHistorial, type TipoRegistro } from '../../data/historial';
import { subscribePagosAdmin } from '../../data/pagosAdmin';

const TIPOS: TipoRegistro[] = ['Validación', 'Designación', 'Pago', 'Boleta'];

function iconoTipo(tipo: TipoRegistro) {
  switch (tipo) {
    case 'Validación':
      return <ShieldCheck className="h-4 w-4 text-green-600" />;
    case 'Designación':
      return <FileSpreadsheet className="h-4 w-4 text-blue-600" />;
    case 'Pago':
      return <DollarSign className="h-4 w-4 text-emerald-600" />;
    case 'Boleta':
      return <Receipt className="h-4 w-4 text-purple-600" />;
  }
}

function badgeTipo(tipo: TipoRegistro) {
  const cls: Record<TipoRegistro, string> = {
    'Validación': 'bg-green-100 text-green-800 border-green-200',
    'Designación': 'bg-blue-100 text-blue-800 border-blue-200',
    'Pago': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Boleta': 'bg-purple-100 text-purple-800 border-purple-200'
  };
  return <Badge variant="outline" className={`gap-1 ${cls[tipo]}`}>{iconoTipo(tipo)}{tipo}</Badge>;
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
  const [version, setVersion] = useState(0);
  const registros = useMemo(() => getHistorial(), [version]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroModulo, setFiltroModulo] = useState<string>('todos');

  useEffect(() => {
    const handler = () => setVersion(v => v + 1);
    window.addEventListener('pagos:update', handler);
    return () => {
      window.removeEventListener('pagos:update', handler);
    };
  }, []);

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
        r.docente.toLowerCase().includes(q) ||
        r.descripcion.toLowerCase().includes(q) ||
        r.actor.toLowerCase().includes(q) ||
        r.estado.toLowerCase().includes(q);
      return cumpleTipo && cumpleModulo && cumpleBusqueda;
    });
  }, [registros, busqueda, filtroTipo, filtroModulo]);

  const conteoPorTipo = useMemo(() => {
    const base: Record<TipoRegistro, number> = { 'Validación': 0, 'Designación': 0, 'Pago': 0, 'Boleta': 0 };
    for (const r of registros) base[r.tipo] += 1;
    return base;
  }, [registros]);

  const exportarPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Historial de Actividad - TEC UCT', 14, 20);
    doc.setFontSize(11);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CL')}`, 14, 28);
    doc.text(`Total registros: ${filtrados.length}`, 14, 34);

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

    doc.save(`historial-actividad-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Historial exportado a PDF');
  };

  const tarjetas: { tipo: TipoRegistro; total: number }[] = TIPOS.map(t => ({ tipo: t, total: conteoPorTipo[t] }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900">
            <History className="h-7 w-7 text-blue-600" />
            Historial
          </h1>
          <p className="mt-2 text-gray-600">
            Registro de actividades del sistema: validaciones, designaciones, pagos y boletas.
          </p>
        </div>
        <Button onClick={exportarPDF} disabled={filtrados.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Descargar PDF
        </Button>
      </div>

      {/* Estadísticas por tipo */}
      <div className="grid gap-4 md:grid-cols-4">
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
        <CardContent className="pt-6">
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
              {filtrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-gray-500">
                    No hay registros que coincidan con los filtros.
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
            Mostrando {filtrados.length} de {registros.length} registros.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
