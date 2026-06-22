import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { GraduationCap, Lock, User, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { 
  mockDocentesAcademicos, 
  mockCoordinadores, 
  mockSupervisores 
} from '../../data/mockData';
import { login, type AuthUser } from '../../data/auth';
import { ApiError } from '../../data/apiClient';

export function AcademicLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Login real exitoso: mapea el correo devuelto por el backend a la entidad
   * mock correspondiente para poblar los IDs que el resto de la app aún lee de
   * sessionStorage (docenteId, carrera, etc.) hasta que esos recursos se
   * conecten en fases posteriores.
   */
  const applyRealSession = (user: AuthUser) => {
    const correoLower = user.correo.toLowerCase();
    switch (user.nivel) {
      case 'admin':
        toast.success('Inicio de sesión exitoso');
        navigate('/admin/dashboard');
        return;
      case 'supervisor': {
        const sup = mockSupervisores.find(s => s.correo_usuario.toLowerCase() === correoLower);
        sessionStorage.setItem('userRole', 'supervisor');
        if (sup) {
          sessionStorage.setItem('supervisorId', sup.id_supervisor.toString());
          sessionStorage.setItem('supervisorNombre', sup.nombre);
        }
        toast.success(`Bienvenido/a ${sup?.nombre ?? user.correo}`);
        navigate('/supervisor/dashboard');
        return;
      }
      case 'coordinador': {
        const coord = mockCoordinadores.find(c => c.correo_usuario?.toLowerCase() === correoLower);
        sessionStorage.setItem('userRole', 'admin_academico');
        sessionStorage.setItem('userName', coord?.nombre ?? user.correo);
        if (coord?.id_carrera) sessionStorage.setItem('coordinadorCarreraId', coord.id_carrera);
        else sessionStorage.removeItem('coordinadorCarreraId');
        toast.success(`Bienvenido/a ${coord?.nombre ?? user.correo}`);
        navigate('/academico/dashboard');
        return;
      }
      case 'academico': {
        sessionStorage.setItem('userRole', 'admin_academico');
        sessionStorage.setItem('userName', user.correo);
        sessionStorage.removeItem('coordinadorCarreraId');
        toast.success('Inicio de sesión exitoso');
        navigate('/academico/dashboard');
        return;
      }
      case 'docente': {
        const doc = mockDocentesAcademicos.find(d => d.correo.toLowerCase() === correoLower);
        sessionStorage.setItem('userRole', 'docente');
        if (doc) {
          sessionStorage.setItem('docenteId', doc.id.toString());
          sessionStorage.setItem('docenteNombre', doc.nombreCompleto);
          sessionStorage.setItem('docenteRut', doc.rut);
        }
        sessionStorage.setItem('docente_check_mensajes', '1');
        toast.success(`Bienvenido/a ${doc?.nombreCompleto ?? user.correo}`);
        navigate('/docente/dashboard');
        return;
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 1. Intentar login real contra el backend (JWT).
    try {
      const user = await login(username, password);
      applyRealSession(user);
      setIsLoading(false);
      return;
    } catch (err) {
      // Si el backend no está disponible o las credenciales no existen aún en
      // la BD, se cae al flujo mock (datos de demo) para no bloquear el trabajo.
      if (err instanceof ApiError && err.isNetwork) {
        toast.warning('Sin conexión al backend: usando datos de demostración.');
      }
      mockLogin();
      setIsLoading(false);
    }
  };

  // Flujo de autenticación mock (fallback de desarrollo).
  const mockLogin = () => {
    {
      // Regla de login: Correo y RUT sin dígito verificador.
      const correoLower = username.toLowerCase().trim();
      const passLimpia = password.replace(/\./g, '').trim(); // Contraseña ingresada (se quitan puntos)

      // 1. Validar si es Supervisor
      const supervisor = mockSupervisores.find(s => s.correo_usuario.toLowerCase() === correoLower);
      if (supervisor) {
        const rutSinDv = supervisor.rut.split('-')[0].replace(/\./g, '');
        if (rutSinDv === passLimpia || password === 'admin') {
          sessionStorage.setItem('userRole', 'supervisor');
          sessionStorage.setItem('supervisorId', supervisor.id_supervisor.toString());
          sessionStorage.setItem('supervisorNombre', supervisor.nombre);
          toast.success(`Bienvenido/a ${supervisor.nombre}`);
          navigate('/supervisor/dashboard');
          setIsLoading(false);
          return;
        }
      }

      // 2. Validar si es Coordinador (Admin Académico)
      const coordinador = mockCoordinadores.find(c => c.correo_usuario?.toLowerCase() === correoLower);
      if (coordinador) {
        const rutSinDv = coordinador.rut.split('-')[0].replace(/\./g, '');
        if (rutSinDv === passLimpia || password === 'admin') {
          sessionStorage.setItem('userRole', 'admin_academico');
          sessionStorage.setItem('userName', coordinador.nombre);
          if (coordinador.id_carrera) {
            sessionStorage.setItem('coordinadorCarreraId', coordinador.id_carrera);
          } else {
            sessionStorage.removeItem('coordinadorCarreraId');
          }
          toast.success(`Bienvenido/a ${coordinador.nombre}`);
          navigate('/academico/dashboard');
          setIsLoading(false);
          return;
        }
      }

      // 3. Validar si es Docente
      const docente = mockDocentesAcademicos.find(d => d.correo.toLowerCase() === correoLower);
      if (docente) {
        const rutSinDv = docente.rut.replace(/\./g, ''); // en mockDocentesMaestros el rut viene sin DV
        if (rutSinDv === passLimpia || password === 'docente123') {
          sessionStorage.setItem('userRole', 'docente');
          sessionStorage.setItem('docenteId', docente.id.toString());
          sessionStorage.setItem('docenteNombre', docente.nombreCompleto);
          sessionStorage.setItem('docenteRut', docente.rut);
          sessionStorage.setItem('docente_check_mensajes', '1');
          toast.success(`Bienvenido/a ${docente.nombreCompleto}`);
          navigate('/docente/dashboard');
          setIsLoading(false);
          return;
        }
      }

      // Backdoor temporal original para probar si no meten correos válidos
      if (username === 'academico' && password === 'academico') {
        sessionStorage.setItem('userRole', 'admin_academico');
        sessionStorage.setItem('userName', 'Administrador Académico');
        toast.success('Inicio de sesión exitoso');
        navigate('/academico/dashboard');
        setIsLoading(false);
        return;
      }

      toast.error('Credenciales incorrectas o usuario no encontrado');
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    toast.info('Se ha enviado una solicitud a su Supervisor/Administrador para el restablecimiento de su contraseña.', {
      duration: 5000,
    });
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

            <div className="mt-4 text-center">
              <button 
                type="button" 
                onClick={handleForgotPassword}
                className="text-sm font-medium text-green-600 hover:text-green-800 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <div className="mt-6 space-y-3 text-center text-sm">
              <div className="rounded-lg bg-gray-50 p-3 text-left">
                <p className="font-medium text-gray-700">Credenciales de prueba:</p>
                <div className="mt-2 space-y-2 text-xs">
                  <p className="text-gray-600">
                    <span className="font-medium text-green-700">Coordinador:</span>
                    <br />
                    Usuario: <code className="rounded bg-gray-200 px-1">mgonzalez@uct.cl</code> /
                    Contraseña: <code className="rounded bg-gray-200 px-1">12222222</code>
                    <br />
                    <span className="text-[10px] text-gray-400">Carrera: T.U. G. y Admin. Emp.</span>
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium text-indigo-700">Supervisor:</span>
                    <br />
                    Usuario: <code className="rounded bg-gray-200 px-1">director.tec@uct.cl</code> /
                    Contraseña: <code className="rounded bg-gray-200 px-1">11111111</code>
                    <br />
                    <span className="text-[10px] text-gray-400">Accede a /supervisor/dashboard tras login</span>
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium text-blue-700">Docente:</span>
                    <br />
                    Usuario: <code className="rounded bg-gray-200 px-1">juan.perez@uct.cl</code> /
                    Contraseña: <code className="rounded bg-gray-200 px-1">docente123</code>
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium text-gray-600">Backdoor:</span>
                    <br />
                    Usuario: <code className="rounded bg-gray-200 px-1">academico</code> /
                    Contraseña: <code className="rounded bg-gray-200 px-1">academico</code>
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
