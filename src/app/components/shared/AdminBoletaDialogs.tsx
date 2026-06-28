import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { FileText, Download } from 'lucide-react';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { updatePago } from '../../data/pagos';
import type { CuotaMensual } from '../../data/pagos';

export interface BoletaPreview {
  nombre: string;
  fecha: string;
}

// ============================================================================
//   Diálogo: Ver PDF
// ============================================================================
export function DialogVerPdf({
  open,
  cuota,
  docenteNombre,
  boletaPreview,
  observaciones,
  onClose,
}: {
  open: boolean;
  cuota: CuotaMensual | null;
  docenteNombre: string;
  boletaPreview?: BoletaPreview;
  observaciones?: string;
  onClose: () => void;
}) {
  const formatCLP = (v: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(v);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Boleta de honorarios</DialogTitle>
          <DialogDescription>
            {cuota && (
              <>
                {docenteNombre} · {cuota.mes} · {formatCLP(cuota.montoBruto)}
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        {cuota && boletaPreview && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border bg-gray-50 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium">{boletaPreview.nombre}</div>
                <div className="text-xs text-gray-500">Subida el {boletaPreview.fecha}</div>
              </div>
              <Button variant="outline" size="sm" disabled title="Descarga simulada (mock)">
                <Download className="mr-1 h-4 w-4" />
                Descargar
              </Button>
            </div>
            <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500">
              <div className="text-center">
                <FileText className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                <p>Preview del PDF</p>
                <p className="mt-1 text-xs italic">
                  (Mock — cuando exista backend, aquí va el visor del documento real)
                </p>
              </div>
            </div>
            {observaciones && (
              <div className="rounded border border-orange-200 bg-orange-50 p-3 text-sm">
                <div className="font-semibold text-orange-900">Observación previa</div>
                <p className="mt-1 text-orange-800">{observaciones}</p>
              </div>
            )}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
//   Diálogo: Revisar boleta (cambiar estado + observación)
// ============================================================================
export function DialogRevisarBoleta({
  open,
  cuota,
  docenteNombre,
  onClose,
}: {
  open: boolean;
  cuota: CuotaMensual | null;
  docenteNombre: string;
  onClose: () => void;
}) {
  const [estado, setEstado] = useState<CuotaMensual['boletaEstado']>('Procesada');
  const [observ, setObserv] = useState('');

  useEffect(() => {
    if (open && cuota) {
      setEstado(cuota.boletaEstado && cuota.boletaEstado !== 'Inexistente' && cuota.boletaEstado !== 'Faltante' ? cuota.boletaEstado : 'Subida');
      // Cuando se abra revisar boleta, si la cuota ya tiene notas previas las carga
      setObserv(cuota.notas ?? '');
    }
  }, [open, cuota]);

  if (!cuota) return null;

  const guardar = async () => {
    if (estado === 'Con Observación' && !observ.trim()) {
      toast.error('Debe ingresar la observación para el docente.');
      return;
    }
    try {
      await updatePago(cuota.id, {
        boletaEstado: estado,
        notas: estado === 'Con Observación' ? observ.trim() : undefined,
      });
      toast.success(`Boleta marcada como "${estado}"`);
      window.dispatchEvent(new Event('pagos:update'));
      onClose();
    } catch (e) {
      toast.error('Error al actualizar la boleta');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Revisar boleta</DialogTitle>
          <DialogDescription>
            {docenteNombre} · {cuota.mes}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Estado de la boleta</Label>
            <Select
              value={estado}
              onValueChange={(v) => setEstado(v as CuotaMensual['boletaEstado'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Subida">Subida (sin revisar)</SelectItem>
                <SelectItem value="Procesada">Procesada (aprobada)</SelectItem>
                <SelectItem value="Con Observación">Con Observación</SelectItem>
              </SelectContent>
            </Select>
            <p className="mt-1 text-xs text-gray-500">
              "Procesada" significa que la boleta está aprobada y se puede proceder al pago.
              "Con Observación" notifica al docente que debe corregir o reemplazar el documento.
            </p>
          </div>
          {estado === 'Con Observación' && (
            <div>
              <Label>Observación para el docente</Label>
              <Textarea
                rows={4}
                value={observ}
                onChange={(e) => setObserv(e.target.value)}
                placeholder="Describa qué debe corregir el docente..."
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={guardar}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
//   Diálogo: Nota al docente
// ============================================================================
export function DialogNotaBoleta({
  open,
  cuota,
  onClose,
}: {
  open: boolean;
  cuota: CuotaMensual | null;
  onClose: () => void;
}) {
  const [texto, setTexto] = useState('');

  useEffect(() => {
    if (open && cuota) {
      setTexto(cuota.notas ?? '');
    }
  }, [open, cuota]);

  if (!cuota) return null;

  const guardar = async () => {
    try {
      // Usar null string empty ('') if deleted. We'll pass undefined for now, 
      // but API supports nullable so let's pass it as is.
      await updatePago(cuota.id, {
        notas: texto.trim() || null,
      });
      toast.success('Nota guardada y sincronizada al docente.');
      window.dispatchEvent(new Event('pagos:update'));
      onClose();
    } catch (e) {
      toast.error('Error al guardar la nota');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nota · {cuota.mes}</DialogTitle>
          <DialogDescription>
            El docente verá esta nota junto a la boleta de este mes en su módulo.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          rows={5}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escriba una observación o recordatorio para este mes..."
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={guardar}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
