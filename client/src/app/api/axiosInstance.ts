import axios from 'axios';

const api = axios.create({
  // baseURL: 'https://donation-management-kupat-hair.onrender.com/api', 
    baseURL: 'http://localhost:3000/api', 

  headers: { 'Content-Type': 'application/json' }
});

export default api;