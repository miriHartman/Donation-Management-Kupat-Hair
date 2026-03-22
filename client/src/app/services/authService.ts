// src/services/authService.ts
import api from '../api/axiosInstance';

// אינטרספטור (Interceptor) - מוסיף את הטוקן לכל בקשה שיוצאת מהלקוח

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // אם השרת מחזיר 401, זה אומר שהטוקן לא תקף יותר
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/'; // ירענן את הדף ויחזיר ללוגין בגלל ה-useEffect
    }
    return Promise.reject(error);
  }
);



api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (username: string, password: string) => {
    // שימוש ב-api במקום ב-axios הגלובלי
    const response = await api.post('/auth/login', { username, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }
};
export const userService = {
  getAllUsernames: async (): Promise<string[]> => {
    const response = await api.get('/users/list');
    return response.data;
  }
};


