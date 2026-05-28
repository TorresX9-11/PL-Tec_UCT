import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { GraduationCap, Lock, User, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { mockDocentesAcademicos } from '../../data/mockData';

export function AcademicLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulación de autenticación
    setTimeout(() => {
      // Verificar si es un administrador académico
      if (username === 'academico' && password === 'academico') {
        sessionStorage.setItem('userRole', 'admin_academico');
        sessionStorage.setItem('userName', 'Administrador Académico');
        toast.success('Inicio de sesión exitoso');
        navigate('/academico/dashboard');
      }
      // Verificar si es un docente
      else {
        const docente = mockDocentesAcademicos.find(
          d => (d.correo === username || d.rut === username) && d.password === password
        );

        if (docente) {
          sessionStorage.setItem('userRole', 'docente');
          sessionStorage.setItem('docenteId', docente.id.toString());
          sessionStorage.setItem('docenteNombre', docente.nombreCompleto);
          sessionStorage.setItem('docenteRut', docente.rut);
          // Flag consumida por DocenteLayout: muestra toast con mensajes pendientes
          // del admin de pagos al primer render tras el login.
          sessionStorage.setItem('docente_check_mensajes', '1');
          toast.success(`Bienvenido/a ${docente.nombreCompleto}`);
          navigate('/docente/dashboard');
        } else {
          toast.error('Usuario o contraseña incorrectos');
        }
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-green-600" />
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

            <div className="mt-6 space-y-3 text-center text-sm">
              <div className="rounded-lg bg-gray-50 p-3 text-left">
                <p className="font-medium text-gray-700">Credenciales de prueba:</p>
                <div className="mt-2 space-y-1 text-xs">
                  <p className="text-gray-600">
                    <span className="font-medium">Administrador:</span>
                    <br />
                    Usuario: <code className="rounded bg-gray-200 px-1">academico</code> /
                    Contraseña: <code className="rounded bg-gray-200 px-1">academico</code>
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Docente:</span>
                    <br />
                    Usuario: <code className="rounded bg-gray-200 px-1">juan.perez@uct.cl</code> /
                    Contraseña: <code className="rounded bg-gray-200 px-1">docente123</code>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
