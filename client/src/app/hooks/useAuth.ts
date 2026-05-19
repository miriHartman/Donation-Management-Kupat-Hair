import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { authService, userService } from '../services/authService';
import { toast } from 'sonner';

export function useAuth(onLoginSuccess: (view: 'branch' | 'branchSelector', branch?: { id: number; name: string }) => void) {
  const [loading, setLoading] = useState(false);

  const login = async (username: string, password: string) => {
    if (!username || !password) {
      toast.error('אנא מלא את כל השדות');
      return;
    }

    setLoading(true);
    try {
      await authService.login(username, password);

      const userString = localStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;

      toast.success('התחברת בהצלחה למערכת');

      if (user?.role === 'admin') {
        onLoginSuccess('branchSelector');
        return;
      }

      // משתמש רגיל — branchId מגיע ישירות מהשרת
      if (user?.branchId && user?.branchName) {
        onLoginSuccess('branch', { id: user.branchId, name: user.branchName });
      } else {
        onLoginSuccess('branchSelector');
      }

    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || 'שגיאת התחברות');
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

export function useTokenExpiry(onExpired: () => void) {
  useEffect(() => {
    if (!authService.checkTokenExpiry()) {
      onExpired();
      return;
    }

    const interval = setInterval(() => {
      if (!authService.checkTokenExpiry()) {
        toast.error('פג תוקף החיבור, אנא התחבר מחדש');
        onExpired();
      }
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);
}