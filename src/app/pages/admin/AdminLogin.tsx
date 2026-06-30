import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { Lock, User, ArrowLeft } from 'lucide-react';
import tecLogo from '../../../styles/Logo TEC Dirección_01.png';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { toast } from 'sonner';
import { login, logout } from '../../data/auth';
import { ApiError } from '../../data/apiClient';

export function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Login real contra el backend (POST /auth/login → JWT)
      const user = await login(username, password);

      // El módulo de administración solo admite usuarios de nivel admin.
      if (user.nivel !== 'admin') {
        logout();
        toast.error('Este usuario no tiene permisos de administración.');
        return;
      }

      toast.success('Inicio de sesión exitoso');
      navigate('/admin/dashboard');
    } catch (err) {
      // Fallback de desarrollo: si el backend no está disponible, permitir la
      // credencial legacy admin/admin para no bloquear el trabajo local.
      if (err instanceof ApiError && err.isNetwork) {
        if (username === 'admin' && password === 'admin') {
          toast.warning('Sin conexión al backend: sesión local de desarrollo.');
          navigate('/admin/dashboard');
          return;
        }
        toast.error('No se pudo conectar con el servidor.');
        return;
      }
      toast.error(err instanceof ApiError ? err.message : 'Usuario o contraseña incorrectos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center gap-3">
            <img src={tecLogo} alt="TEC UCT Logo" className="h-10 object-contain" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Plataforma TEC</h1>
              <p className="text-sm text-gray-600">Universidad Católica de Temuco</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="mb-6 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </button>

          {/* Login Card */}
          <div className="rounded-xl border bg-white p-8 shadow-lg">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <Lock className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Módulo Administración
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Ingrese sus credenciales para acceder
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="username">Usuario</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Ingrese su usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Ingrese su contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button 
                type="button" 
                onClick={() => setIsForgotOpen(true)}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

          </div>
        </div>
      </main>

      {/* Forgot Password Dialog */}
      <Dialog open={isForgotOpen} onOpenChange={setIsForgotOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Recuperación de Contraseña</DialogTitle>
            <DialogDescription>
              Por favor, contacta al administrador del sistema (<strong>jonathan.carrillo@uct.cl</strong>) para solicitar un restablecimiento de tu contraseña.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => setIsForgotOpen(false)}>Entendido</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
