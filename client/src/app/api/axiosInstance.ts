import axios from 'axios';

const api = axios.create({
  baseURL: 'https://donation-management-kupat-hair.onrender.com/api', 
  headers: { 'Content-Type': 'application/json' }
});

export default api;