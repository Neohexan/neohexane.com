import axios from 'axios';

const api = axios.create({
  baseURL: 'https://backspace.neohexane.com/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    // 1. Look for the NEW Payload token
    const token = localStorage.getItem('payload-token');
    
    if (token) {
      // 2. Use the 'JWT' prefix required by Payload CMS
      config.headers.Authorization = `JWT ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
