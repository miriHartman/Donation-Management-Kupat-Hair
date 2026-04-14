import axios from 'axios';

const getApiUrl = (): string => {
  // Vite uses import.meta.env, React uses process.env
  const url =
    (import.meta as any).env?.REACT_APP_API_URL ||
    (window as any).__ENV__?.REACT_APP_API_URL ||
    'http://localhost:3000/api';
  return url;
};

const getTimeout = (): number => {
  const timeout =
    (import.meta as any).env?.REACT_APP_API_TIMEOUT ||
    (window as any).__ENV__?.REACT_APP_API_TIMEOUT ||
    10000;
  return Number(timeout);
};

const api = axios.create({
  baseURL: getApiUrl(),
  timeout: getTimeout(),
  headers: { 'Content-Type': 'application/json' }
});

export default api;