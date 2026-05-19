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
      localStorage.setItem('loginTime', Date.now().toString()); 
    }
    return response.data;
  }
  ,
  checkTokenExpiry: () => {
    const loginTime = localStorage.getItem('loginTime');
    if (!loginTime) return false;

    const EIGHTEEN_HOURS = 18 * 60 * 60 * 1000;
    const elapsed = Date.now() - Number(loginTime);

    if (elapsed > EIGHTEEN_HOURS) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('loginTime');
        return false; // פג תוקף
    }
    return true; // תקף
},
createUser: async (data: { username: string; password: string; branchId: number }) => {
    const response = await api.post('/auth/create', data);
    return response.data;
}
};
export const userService = {
  getAllUsernames: async (): Promise<string[]> => {
    const response = await api.get('/auth/list');
    return response.data;
  }
};





