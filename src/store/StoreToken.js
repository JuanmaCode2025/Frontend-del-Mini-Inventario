import { defineStore } from "pinia";
import { ref, computed } from "vue";

/**
 * 🧠 Store global de autenticación
 * Maneja el estado del usuario y el token JWT en toda la aplicación
 */
export const useAuthStore = defineStore("auth", () => {

  /**
   * 🔑 token: almacena el JWT del usuario autenticado
   * Se inicializa en null hasta que el usuario inicia sesión
   */
  const token = ref(null);

  /**
   * 👤 user: almacena la información básica del usuario
   * Se puede extender en el futuro (email, roles, etc.)
   */
  const user = ref(null);

  /**
   * ✅ isAuthenticated: indica si el usuario está autenticado
   * Retorna true si existe un token válido
   */
  const isAuthenticated = computed(() => !!token.value);

  /**
   * 🧾 username: obtiene el nombre del usuario de forma segura
   * Evita errores si user es null
   */
  const username = computed(() => user.value?.name || null);

  /**
   * 🔐 setToken: guarda el token JWT después del login
   * @param {string} newToken - Token recibido del backend
   */
  function setToken(newToken) {
    token.value = newToken;
  }

  /**
   * 👤 setUser: guarda la información del usuario
   * @param {Object} userData - Datos del usuario
   */
  function setUser(data) {
    user.value = {
      name: data.name,
    };
  }

  /**
   * 🚪 logout: limpia completamente la sesión del usuario
   * Elimina token y datos del usuario
   */
  function logout() {
    token.value = null;
    user.value = null;
  }

  /**
   * 📤 Exposición del estado y métodos del store
   */
  return {
    // Estado
    token,
    user,

    // Getters
    isAuthenticated,
    username,

    // Acciones
    setToken,
    setUser,
    logout,
  };

}, {
  /**
   * 💾 Persistencia del estado
   * Se utiliza sessionStorage para evitar mantener sesiones expiradas
   */
  persist: {
    storage: sessionStorage,
  }
});