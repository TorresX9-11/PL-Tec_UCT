import { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { LogOut, MessageSquare } from 'lucide-react';
import tecLogo from '../../styles/Logo TEC Dirección_01.png';
import { toast } from 'sonner';
import { listPagos } from '../data/pagos';
import { RequirePasswordChange } from './RequirePasswordChange';

export function DocenteLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    // Limpiar flags de sesión
    sessionStorage.removeItem('docente_check_mensajes');
    toast.success('Sesión cerrada');
    navigate('/academico/login');
  };

  // Obtener información del docente desde sessionStorage o contexto
  const docenteNombre = sessionStorage.getItem('docenteNombre') || 'Docente';

  // ─── Notificación de mensajes pendientes del admin (solo tras login) ──────
  useEffect(() => {
    // Se consume la flag una sola vez. Si el docente refresca o navega entre
    // páginas internas, no vuelve a aparecer (sólo aparece justo después del login).
    if (sessionStorage.getItem('docente_check_mensajes') !== '1') return;
    sessionStorage.removeItem('docente_check_mensajes');

    const docenteIdRaw = sessionStorage.getItem('docenteId');
    if (!docenteIdRaw) return;
    const docenteId = Number(docenteIdRaw);

    const fetchNotas = async () => {
      try {
        const { data: pagosBackend } = await listPagos();
        // Filtrar pagos que tengan notas y correspondan a este docente
        // (Asumimos que si estamos logueados como docente, solo veremos nuestros pagos o podemos cruzar info si es necesario, 
        //  pero para mostrar el toast usamos los datos que devuelve la API)
        const cuotasConMensaje = pagosBackend.filter(p => p.notas);
        
        if (cuotasConMensaje.length === 0) return;
        const primera = cuotasConMensaje[0];
        const total = cuotasConMensaje.length;

        // Pequeño delay para que aparezca cuando ya está renderizada la dashboard
        const timer = window.setTimeout(() => {
          const titulo = total === 1
            ? 'Tienes un mensaje del Administrador de Pagos'
            : `Tienes ${total} mensajes del Administrador de Pagos`;
          const descripcion = total === 1
            ? `Ha dejado una observación en tu boleta de ${primera.mes}.`
            : `Hay observaciones pendientes (la más reciente en ${primera.mes}).`;

          toast.message(titulo, {
            description: descripcion,
            icon: <MessageSquare className="h-5 w-5 text-blue-600" />,
            duration: 8000,
            action: {
              label: 'Ver mensaje',
              onClick: () => navigate(`/docente/boletas#cuota-${primera.id}`)
            }
          });
        }, 600);

      } catch (err) {
        console.error('Error fetching notas', err);
      }
    };
    
    fetchNotas();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <RequirePasswordChange>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={tecLogo} alt="TEC UCT Logo" className="h-10 object-contain" />
              <div>
                <h1 className="font-bold text-gray-900">Portal Docente - TEC UCT</h1>
                <p className="text-xs text-gray-600">{docenteNombre}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex gap-8">
            <Link
              to="/docente/dashboard"
              className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                location.pathname === '/docente/dashboard'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Mi Perfil
            </Link>
            <Link
              to="/docente/cv"
              className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                isActive('/docente/cv')
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              CV y Formación
            </Link>
            <Link
              to="/docente/certificados"
              className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                isActive('/docente/certificados')
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Certificados
            </Link>
            <Link
              to="/docente/capacitaciones"
              className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                isActive('/docente/capacitaciones')
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Capacitaciones
            </Link>
            <Link
              to="/docente/boletas"
              className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                isActive('/docente/boletas')
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Boletas
            </Link>
            <Link
              to="/docente/ramos"
              className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                isActive('/docente/ramos')
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Mis Ramos
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
    </RequirePasswordChange>
  );
}
