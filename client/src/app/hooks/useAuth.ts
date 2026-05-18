import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { authService, userService } from '../services/authService';
import { toast } from 'sonner';
import { branchService } from '../services/branchService';

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

      if (user?.role === 'admin') {
        toast.success('התחברת בהצלחה למערכת');
        onLoginSuccess('branchSelector');
        return;
      }

      // משתמש רגיל — מצא סניף לפי שם
      const branches = await branchService.getBranches();
      const matched = branches.find((b: { name: string; }) => b.name === username);

      toast.success('התחברת בהצלחה למערכת');
      if (matched) {
        onLoginSuccess('branch', { id: matched.id, name: matched.name });
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
        // בדיקה מיידית בטעינה
        if (!authService.checkTokenExpiry()) {
            onExpired();
            return;
        }

        // בדיקה כל דקה
        const interval = setInterval(() => {
            if (!authService.checkTokenExpiry()) {
                toast.error('פג תוקף החיבור, אנא התחבר מחדש');
                onExpired();
            }
        }, 60 * 1000);

        return () => clearInterval(interval);
    }, []);
}
  