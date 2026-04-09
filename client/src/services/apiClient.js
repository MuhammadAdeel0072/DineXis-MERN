import axios from 'axios';
import toast from 'react-hot-toast';

axios.defaults.withCredentials = true;

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:5000/api',
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track interceptor IDs so we can eject and re-register when getToken changes
let requestInterceptorId = null;
let responseInterceptorId = null;

// Interceptor to add Clerk token to requests (if available in development mode)
// Called from App.jsx useEffect — safe to call multiple times
export const setupInterceptors = (getToken) => {
  // Eject existing interceptors before re-registering
  if (requestInterceptorId !== null) {
    apiClient.interceptors.request.eject(requestInterceptorId);
  }
  if (responseInterceptorId !== null) {
    apiClient.interceptors.response.eject(responseInterceptorId);
  }

  requestInterceptorId = apiClient.interceptors.request.use(
    async (config) => {
      try {
        // In development mode, token is optional
        if (typeof getToken === 'function') {
          const token = await getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
      } catch (error) {
        console.warn('[API Client] Token setup warning (non-blocking in dev):', error.message);
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  responseInterceptorId = apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.warn('Unauthorized — session may have expired');
      } else if (error.response?.status >= 500) {
        const errorDetail = error.response?.data?.message || 'Server-side protocol failure';
        toast.error(`System Protocol Error: ${errorDetail}`, {
          id: 'api-error',
          style: {
            background: '#1a1a1a',
            color: '#ff4b4b',
            border: '1px solid #ff4b4b',
          },
        });
      }
      return Promise.reject(error);
    }
  );
};

export default apiClient;
