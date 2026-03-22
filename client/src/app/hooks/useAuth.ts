import { useEffect, useState } from 'react';
import { authService, userService } from '../services/authService';
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

export function useUsers() {
  const [users, setUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    userService.getAllUsernames()
      .then(setUsers)
      .catch(err => console.error('Error fetching users:', err))
      .finally(() => setIsLoading(false));
  }, []);

  return { users, isLoading };
}