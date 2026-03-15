import { useState } from 'react';
import { authService } from '../services/authService';
import { toast } from 'sonner';

export function useAuth(onLoginSuccess: () => void) {
  const [loading, setLoading] = useState(false);

  const login = async (username: string, password: string) => {
    if (!username || !password) {
      toast.error('אנא מלא את כל השדות');
      return;
    }

    setLoading(true);
    try {
      await authService.login(username, password);
      toast.success('התחברת בהצלחה למערכת');
      onLoginSuccess();
    } catch (error: any) {
      const message = error.response?.data?.message || 'שגיאת התחברות';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return { login, loading };
}