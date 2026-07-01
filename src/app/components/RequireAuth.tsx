import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router';

// Decode JWT to get user role
const parseJwt = (token: string) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

type RequireAuthProps = {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo: string;
};

export function RequireAuth({ children, allowedRoles, redirectTo }: RequireAuthProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem('tec_auth_token');
    
    if (!token) {
      setIsAuthorized(false);
      return;
    }

    const decoded = parseJwt(token);
    if (!decoded || !decoded.nivel) {
      setIsAuthorized(false);
      return;
    }

    if (allowedRoles.includes(decoded.nivel)) {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
  }, [allowedRoles]);

  if (isAuthorized === null) {
    // Aún verificando (evita el "parpadeo" de la página de destino)
    return null; 
  }

  if (!isAuthorized) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
