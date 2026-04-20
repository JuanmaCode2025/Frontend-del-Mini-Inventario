<template>
  <section id="login-page">

    <!-- ── Tarjeta principal de login ── -->
    <q-card class="login-card shadow-10">

      <!-- Encabezado con logo y nombre de la app -->
      <q-card-section class="text-center">
        <q-avatar size="80px" class="bg-primary text-white shadow-5">
          <q-icon name="storefront" size="48px" />
        </q-avatar>
        <h1 class="login-title text-primary">StockPyme</h1>
      </q-card-section>

      <!-- Formulario de acceso -->
      <q-form @submit.prevent="submitLogin" @reset="handleReset">

        <!-- Campo: correo electrónico -->
        <q-input
          v-model="email"
          outlined
          dense
          rounded
          label="Correo *"
          hint="Escribe tu correo electrónico"
          autocomplete="username"
          :rules="rules.email"
        >
          <template #prepend>
            <q-icon name="email" color="primary" />
          </template>
        </q-input>

        <!-- Campo: contraseña con toggle de visibilidad -->
        <q-input
          v-model="password"
          outlined
          dense
          rounded
          :type="showPassword ? 'text' : 'password'"
          label="Contraseña *"
          hint="Mínimo 6 caracteres"
          autocomplete="current-password"
          :rules="rules.password"
        >
          <template #prepend>
            <q-icon name="lock" color="primary" />
          </template>
          <template #append>
            <!-- Ícono interactivo para mostrar u ocultar la contraseña -->
            <q-icon
              :name="showPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="togglePasswordVisibility"
            />
          </template>
        </q-input>

        <!-- Botón principal: deshabilitado durante la carga para evitar doble envío -->
        <q-btn
          label="Ingresar"
          type="submit"
          color="primary"
          class="full-width q-mt-md"
          rounded
          :disable="isLoading"
        />

        <!-- Enlace a la vista de registro -->
        <div class="row justify-center">
          <q-btn
            label="Crear Cuenta"
            flat
            color="primary"
            class="q-mt-sm"
            to="/createuser"
          />
        </div>

      </q-form>
    </q-card>

    <!-- ── Overlay de carga a pantalla completa ── -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="column items-center">
        <q-circular-progress
          indeterminate
          size="60px"
          :thickness="0.2"
          color="orange"
          track-color="grey-8"
        />
        <p class="q-mt-md text-h6">Cargando...</p>
      </div>
    </div>

  </section>
</template>


<script setup>
/**
 * Vista de Login.
 * Gestiona la autenticación del usuario, almacena el token
 * y redirige al dashboard tras un inicio de sesión exitoso.
 */

// ── Importaciones ─────────────────────────────────────────────────────────────
import { ref }              from "vue";
import { useRouter }        from "vue-router";
import { useAuthStore }    from "../store/StoreToken.js";
import { Notifications }    from "../composables/Notifications.js";
import { postData }         from "../services/api_Clients.js";

// ── Instancias de composables ─────────────────────────────────────────────────
const router                 = useRouter();const authStore = useAuthStore();
const { success, error }     = Notifications();

// ── Estado del formulario ─────────────────────────────────────────────────────
const email        = ref("");
const password     = ref("");
const showPassword = ref(false);
const isLoading    = ref(false);

// ── Reglas de validación (centralizadas — DRY) ────────────────────────────────

/**
 * Objeto de reglas de validación compatibles con Quasar.
 * Centralizar las reglas evita duplicar funciones anónimas en el template
 * y facilita reutilizarlas en otros formularios de la app.
 */
const rules = {
  email: [
    (val) => (val && val.length > 0) || "El correo es obligatorio",
    (val) => /.+@.+\..+/.test(val)   || "Formato de correo no válido",
  ],
  password: [
    (val) => (val !== null && val !== "") || "La contraseña es obligatoria",
    (val) => val.length >= 6             || "Mínimo 6 caracteres",
  ],
};

// ── Funciones del formulario ──────────────────────────────────────────────────

/** Alterna la visibilidad del campo de contraseña entre texto plano y oculto */
function togglePasswordVisibility() {
  showPassword.value = !showPassword.value;
}

/**
 * Restablece todos los campos del formulario a su estado inicial.
 * También limpia `isLoading` por si el reset ocurre durante una petición activa.
 */
function handleReset() {
  email.value        = "";
  password.value     = "";
  showPassword.value = false;
  isLoading.value    = false;
}

/**
 * Realiza la autenticación contra la API.
 * Si tiene éxito: guarda el token en el store, notifica y redirige al dashboard.
 * Si falla: delega el mensaje de error al composable Notifications.
 * El guard `isLoading` previene envíos duplicados por clics repetidos.
 */
/**
 * 🔐 Maneja el proceso de autenticación del usuario
 * Envía credenciales al backend, guarda sesión y redirige
 */
async function submitLogin() {

  // 🛑 Previene múltiples envíos simultáneos
  if (isLoading.value) return;

  isLoading.value = true;

  try {
    /**
     * 📡 Petición al backend
     */
    const response = await postData("/user/login", {
      email: email.value,
      password: password.value,
    });  

    /**
     * 🔐 Guardar token en el store global
     */
    authStore.setToken(response.token);

    /**
     * 👤 Guardar usuario en el store
     */
    authStore.setUser(response.data);
    
    

    /**
     * 🔔 Notificación de éxito
     */
    success("Sesión iniciada correctamente");

    /**
     * 🔁 Redirección al dashboard
     */
    await router.push({ name: "Dashboard_Home" });

  } catch (fail) {
    console.log(fail);
    
    /**
     * ❌ Manejo de errores centralizado
     */
    error(fail);

  } finally {
    /**
     * 🔄 Libera el estado de carga
     */
    isLoading.value = false;
  }
}
</script>


<style scoped>
/* Contenedor principal — centra la tarjeta vertical y horizontalmente */
#login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100vh;
  padding: 1rem;
  background: linear-gradient(135deg, #e3f2fd, #34729b);
}

/* Tarjeta principal con bordes redondeados y padding generoso */
.login-card {
  width: 100%;
  max-width: 420px;
  padding: 2rem 2.5rem;
  border-radius: 20px;

  @media (max-width: 480px) {
    padding: 0.5rem 1rem;
  }
}

/* Título principal — tamaño reducido en móviles */
.login-title {
  font-size: 4.2rem;
  font-weight: 700;
  margin: 0.75rem 0 0;

  @media (max-width: 480px) {
    font-size: 2.2rem;
  }
}

/* Overlay de carga — cubre toda la pantalla con fondo semitransparente */
.loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  color: white;
}
</style>