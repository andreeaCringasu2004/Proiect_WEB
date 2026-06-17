import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8081/api', // Ajustează dacă e necesar
  headers: {
    'Content-Type': 'application/json',
  },
  // Permite trimiterea și primirea de cookies dacă folosim HttpOnly cookie
  withCredentials: true 
});

// Interceptor pentru a adăuga JWT token (dacă este stocat în localStorage)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
