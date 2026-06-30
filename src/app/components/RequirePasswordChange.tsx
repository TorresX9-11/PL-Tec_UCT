import { useEffect, useState } from 'react';
import { ForcePasswordChangeModal } from './ForcePasswordChangeModal';

const parseJwt = (token: string) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

export function RequirePasswordChange({ children }: { children: React.ReactNode }) {
  const [requiresChange, setRequiresChange] = useState(false);

  useEffect(() => {
    const checkToken = () => {
      const token = sessionStorage.getItem('tec_auth_token');
      if (token) {
        const decoded = parseJwt(token);
        if (decoded?.requiresPasswordChange) {
          setRequiresChange(true);
        }
      }
    };
    
    checkToken();
  }, []);

  const handleSuccess = (newToken: string) => {
    sessionStorage.setItem('tec_auth_token', newToken);
    // Also update the in-memory token in apiClient so future requests work
    import('../data/apiClient').then(({ setToken }) => setToken(newToken));
    setRequiresChange(false);
  };

  return (
    <>
      {children}
      {requiresChange && <ForcePasswordChangeModal onSuccess={handleSuccess} />}
    </>
  );
}
