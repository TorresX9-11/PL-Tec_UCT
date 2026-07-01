import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { Lock, User, ArrowLeft } from 'lucide-react';
import tecLogo from '../../../styles/Logo TEC Dirección_01.png';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { toast } from 'sonner';
import { login, type AuthUser } from '../../data/auth';
import { ApiError } from '../../data/apiClient';

export function AcademicLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  const applyRealSession = (user: AuthUser) => {
    switch (user.nivel) {
      case 'admin':
      case 'supervisor': {
        import('../../data/auth').then(({ logout }) => logout());
        toast.error('Portal incorrecto. Por favor, inicia sesión desde el portal de administración.');
        return;
      }
      case 'coordinador': {
        toast.success(`Bienvenido/a ${user.nombre ?? user.correo}`);
        navigate('/academico/dashboard');
        return;
      }
      case 'docente': {
        sessionStorage.setItem('docente_check_mensajes', '1');
        toast.success(`Bienvenido/a ${user.nombre ?? user.correo}`);
        navigate('/docente/dashboard');
        return;
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await login(username, password);
      applyRealSession(user);
    } catch (err) {
      if (err instanceof ApiError && err.isNetwork) {
        toast.error('No se pudo conectar con el servidor.');
      } else {
        toast.error(err instanceof ApiError ? err.message : 'Usuario o contraseña incorrectos');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setIsForgotOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-100">
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
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Lock className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Área Académica
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Ingrese sus credenciales para acceder
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="username">Usuario / RUT / Correo</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Ingrese su usuario, RUT o correo"
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
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button 
                type="button" 
                onClick={handleForgotPassword}
                className="text-sm font-medium text-green-600 hover:text-green-800 hover:underline"
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
              Por favor, contacta a tu coordinador de carrera o al administrador del sistema (<strong>jonathan.carrillo@uct.cl</strong>) para solicitar un restablecimiento de tu contraseña.
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
