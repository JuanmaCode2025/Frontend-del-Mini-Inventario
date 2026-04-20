import axios from 'axios';
import { useAuthStore } from '../store/StoreToken.js'; // ✅ nombre limpio

/**
 * 🌐 Cliente HTTP centralizado
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000/inventario',
});

/**
 * 🔐 Interceptor de REQUEST
 * Agrega el token automáticamente a cada petición
 */
apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();

    if (authStore.token) {
      config.headers['x-token'] = `Bearer ${authStore.token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * ⚠️ Interceptor de RESPONSE
 * Maneja errores globales (ej: token expirado)
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const authStore = useAuthStore();

    if (error.response?.status === 401) {
      /**
       * 🔥 Cierra sesión automáticamente si el token expiró
       */
      authStore.logout();
    }

    return Promise.reject(error);
  }
);