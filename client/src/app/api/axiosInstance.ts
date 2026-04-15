import axios from 'axios';

const getApiUrl = (): string => {
  // Priority order:
  // 1. Environment variable set at build time (production)
  // 2. Runtime environment variable
  // 3. Same-origin relative path (production with unified service)
  // 4. Local development default
  
  const envUrl = import.meta.env.VITE_APP_API_URL;
  
  if (envUrl) {
    // Handle both absolute URLs and relative paths
    console.log('[Axios] Using API URL from env:', envUrl);
    return envUrl;
  }
  
  // Fallback for local development
  const defaultUrl = 'http://localhost:3000/api';
  console.log('[Axios] Using default API URL:', defaultUrl);
  return defaultUrl;
};

const getTimeout = (): number => {
  const timeoutStr = import.meta.env.VITE_APP_API_TIMEOUT || '10000';
  return Number(timeoutStr);
};

const api = axios.create({
  baseURL: getApiUrl(),
  timeout: getTimeout(),
  headers: { 'Content-Type': 'application/json' }
});

export default api;