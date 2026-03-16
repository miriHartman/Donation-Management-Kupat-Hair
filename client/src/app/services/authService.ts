// src/services/authService.ts
import axios from 'axios';

const API_URL = 'https://donation-management-kupat-hair.onrender.com/api'; // עדכון לכתובת השרת החדש
// אינטרספטור (Interceptor) - מוסיף את הטוקן לכל בקשה שיוצאת מהלקוח
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (username: string, password: string) => {
    // שימוש ב-api במקום ב-axios הגלובלי
    const response = await axios.post(`${API_URL}/auth/login`, { username, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }
};


