// src/api/axiosClient.js
import axios from 'axios';

// Create a custom instance
const api = axios.create({
  // Replace this with your actual WordPress or custom backend URL
  baseURL: 'https://neohexane.com/wp-json/wp/v2', 
  timeout: 10000, // Aborts the request if it takes longer than 10 seconds
  headers: {
    'Content-Type': 'application/json',
    // If you add custom authentication later, you can inject tokens here:
    // 'Authorization': 'Bearer YOUR_TOKEN'
  }
});

export default api;
