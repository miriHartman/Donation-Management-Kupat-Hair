
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
import api from "./app/api/axiosInstance.ts";


// זה ה-Interceptor: הוא רץ לפני כל בקשה
 api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // מזריק את הטוקן ל-Header של הבקשה
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

  createRoot(document.getElementById("root")!).render(<App />);
  