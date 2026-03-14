import axios from 'axios';
import toast from 'react-hot-toast';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add Clerk token to requests
export const setupInterceptors = (getToken) => {
  apiClient.interceptors.request.use(
    async (config) => {
      try {
        const token = await getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error getting auth token', error);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      const message = error.response?.data?.message || 'Something went wrong';
      
      if (error.response?.status === 401) {
        // Handle unauthorized (e.g., redirect or clear state)
        console.warn('Unauthorized access - potential session expiry');
      } else if (error.response?.status >= 500) {
        toast.error('Server error. Please try again later.', {
            id: 'api-error',
            style: {
                background: '#1a1a1a',
                color: '#D4AF37',
                border: '1px solid #D4AF37'
            }
        });
      }
      
      return Promise.reject(error);
    }
  );
};

export default apiClient;
