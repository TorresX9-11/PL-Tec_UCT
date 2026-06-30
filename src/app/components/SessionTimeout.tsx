import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { logout, isAuthenticated } from '../data/auth';

// En prod: 12 horas (43200000 ms)
const SESSION_MAX_TIME = 12 * 60 * 60 * 1000;
// Cuándo mostrar la advertencia (faltando 5 minutos para expirar)
const WARNING_TIME = SESSION_MAX_TIME - (5 * 60 * 1000);

export function SessionTimeout() {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Si no está logueado, no hacer nada
    if (!isAuthenticated()) return;

    const loginTimestampStr = sessionStorage.getItem('tec_auth_timestamp');
    if (!loginTimestampStr) return;

    const loginTime = parseInt(loginTimestampStr, 10);

    const checkInterval = setInterval(() => {
      const elapsed = Date.now() - loginTime;

      // Si pasamos el tiempo máximo, cerrar sesión automáticamente
      if (elapsed >= SESSION_MAX_TIME) {
        clearInterval(checkInterval);
        logout();
        window.location.href = '/';
      } 
      // Si estamos en el periodo de advertencia y aún no la mostramos
      else if (elapsed >= WARNING_TIME && !showWarning) {
        setShowWarning(true);
      }
    }, 1000);

    return () => clearInterval(checkInterval);
  }, [showWarning]);

  const handleCloseWarning = () => {
    setShowWarning(false);
  };

  return (
    <Dialog open={showWarning} onOpenChange={setShowWarning}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Sesión por Expirar</DialogTitle>
          <DialogDescription>
            Su sesión está a punto de expirar, quedan 5 minutos. 
            Será cerrada en breve y deberá iniciar sesión nuevamente.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex justify-end">
          <Button onClick={handleCloseWarning}>Entendido</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
