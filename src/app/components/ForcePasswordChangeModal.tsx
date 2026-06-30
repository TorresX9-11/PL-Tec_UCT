import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Lock, ShieldAlert, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export function ForcePasswordChangeModal({ 
  onSuccess 
}: { 
  onSuccess: (newToken: string) => void 
}) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getPasswordStrength = () => {
    let strength = 0;
    if (newPassword.length >= 8) strength++;
    if (/[A-Z]/.test(newPassword)) strength++;
    if (/[0-9]/.test(newPassword)) strength++;
    if (/[^A-Za-z0-9]/.test(newPassword)) strength++;
    return strength;
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const token = sessionStorage.getItem('tec_auth_token');
      const response = await fetch('http://localhost:3001/api/v1/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword })
      });

      if (!response.ok) {
        throw new Error('Error al cambiar contraseña');
      }

      const data = await response.json();
      toast.success('Contraseña actualizada correctamente.');
      onSuccess(data.token);
    } catch (err: any) {
      setError('Ocurrió un error al intentar cambiar la contraseña. Inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md animate-in fade-in zoom-in duration-200">
        <CardHeader>
          <div className="flex items-center gap-2 text-amber-600 mb-2">
            <ShieldAlert className="h-6 w-6" />
            <CardTitle className="text-xl">Cambio de Contraseña Obligatorio</CardTitle>
          </div>
          <CardDescription>
            Por razones de seguridad, debes actualizar tu contraseña antes de continuar usando la plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="change-pass-form" onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="new-password">Nueva Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="new-password"
                  type="password"
                  className="pl-9"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ingrese su nueva contraseña"
                  required
                />
              </div>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-1.5 flex-1 rounded-full ${
                      newPassword.length === 0
                        ? 'bg-gray-100'
                        : level <= strength
                        ? strength <= 2
                          ? 'bg-amber-400'
                          : strength === 3
                          ? 'bg-blue-400'
                          : 'bg-green-500'
                        : 'bg-gray-100'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Mínimo 8 caracteres. Recomendado usar mayúsculas, números y símbolos.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirm-password"
                  type="password"
                  className="pl-9"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita su nueva contraseña"
                  required
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            form="change-pass-form" 
            className="w-full"
            disabled={loading || newPassword.length < 8}
          >
            {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
