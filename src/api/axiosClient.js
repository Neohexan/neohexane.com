import axios from 'axios';

// Your existing Axios instance creation
const api = axios.create({
  baseURL: 'https://backspace.neohexane.com/api', // Adjust to your actual URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- ADD THIS INTERCEPTOR ---
// This intercepts every request before it leaves your app
api.interceptors.request.use(
  (config) => {
    // Look for the token we saved during the Google Login
    const token = localStorage.getItem('neo_token');
    
    // If the token exists, attach it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
