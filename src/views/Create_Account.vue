<template>
  <section id="register-page">

    <!-- ── Tarjeta principal de registro ── -->
    <q-card class="register-card shadow-10">

      <!-- Encabezado con logo y título -->
      <q-card-section class="text-center">
        <q-avatar size="80px" class="bg-primary text-white shadow-5">
          <q-icon name="storefront" size="48px" />
        </q-avatar>
        <h1 class="register-title text-primary">StockPyme</h1>
        <p class="register-subtitle text-grey-6">Crea tu cuenta</p>
      </q-card-section>

      <!-- Formulario de registro -->
      <q-form
        class="q-gutter-md q-mt-sm"
        @submit.prevent="submitRegister"
        @reset="handleReset"
      >

        <!-- Campo: número de documento -->
        <q-input
          v-model="documentNumber"
          type="number"
          outlined
          dense
          rounded
          label="Número de Documento *"
          hint="Ingresa tu número de documento (10 dígitos)"
          :rules="rules.document"
        >
          <template #prepend>
            <q-icon name="assignment_ind" color="primary" />
          </template>
        </q-input>

        <!-- Campo: nombre completo -->
        <q-input
          v-model="fullName"
          outlined
          dense
          rounded
          label="Nombre Completo *"
          hint="Ingresa tu nombre completo"
          autocomplete="name"
          :rules="rules.name"
        >
          <template #prepend>
            <q-icon name="person" color="primary" />
          </template>
        </q-input>

        <!-- Campo: correo electrónico -->
        <q-input
          v-model="email"
          outlined
          dense
          rounded
          label="Correo electrónico *"
          hint="ejemplo@correo.com"
          autocomplete="email"
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
          autocomplete="new-password"
          :rules="rules.password"
        >
          <template #prepend>
            <q-icon name="lock" color="primary" />
          </template>
          <template #append>
            <q-icon
              :name="showPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="togglePasswordVisibility"
            />
          </template>
        </q-input>

        <!-- Campo: confirmar contraseña -->
        <q-input
          v-model="confirmPassword"
          outlined
          dense
          rounded
          :type="showConfirmPassword ? 'text' : 'password'"
          label="Confirmar contraseña *"
          hint="Repite tu contraseña"
          autocomplete="new-password"
          :rules="rules.confirmPassword"
        >
          <template #prepend>
            <q-icon name="lock_outline" color="primary" />
          </template>
          <template #append>
            <q-icon
              :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="toggleConfirmPasswordVisibility"
            />
          </template>
        </q-input>

        <!-- Botón principal: deshabilitado durante la carga -->
        <q-btn
          label="Crear Cuenta"
          type="submit"
          color="primary"
          class="full-width q-mt-md"
          rounded
          :disable="isLoading"
        />

        <!-- Enlace para volver al login -->
        <div class="row justify-center">
          <q-btn
            label="¿Ya tienes cuenta? Inicia sesión"
            flat
            color="primary"
            class="q-mt-sm"
            to="/login"
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
        <p class="q-mt-md text-h6">Creando cuenta...</p>
      </div>
    </div>

  </section>
</template>


<script setup>
/**
 * Vista de Registro de usuario.
 * Gestiona la creación de una nueva cuenta, validación de campos
 * y redirección al Login tras un registro exitoso.
 */

// ── Importaciones ─────────────────────────────────────────────────────────────
import { ref, computed } from "vue";
import { useRouter }     from "vue-router";
import { Notifications } from "../composables/Notifications.js";
import { postData }      from "../services/api_Clients.js";

// ── Instancias de composables ─────────────────────────────────────────────────
const router             = useRouter();
const { success, error } = Notifications();

// ── Estado del formulario ─────────────────────────────────────────────────────

/**
 * Se usa `documentNumber` en lugar de `document` para evitar colisión
 * con la API nativa del navegador `window.document`.
 */
const documentNumber     = ref("");
const fullName           = ref("");
const email              = ref("");
const password           = ref("");
const confirmPassword    = ref("");
const showPassword        = ref(false);
const showConfirmPassword = ref(false);
const isLoading           = ref(false);

// ── Reglas de validación (centralizadas — DRY) ────────────────────────────────

/**
 * Objeto centralizado de reglas de validación compatibles con Quasar.
 * `confirmPassword` es computed porque necesita acceder al valor reactivo
 * de `password` en tiempo de evaluación para comparar ambos campos.
 */
const rules = {
  document: [
    (val) => (val && String(val).length > 0)  || "El documento es obligatorio",
    (val) => String(val).length >= 10          || "El documento debe tener 10 dígitos",
  ],
  name: [
    (val) => (val && val.length > 0) || "El nombre es obligatorio",
    (val) => val.length > 5          || "El nombre debe tener más de 5 caracteres",
  ],
  email: [
    (val) => (val && val.length > 0)  || "El correo es obligatorio",
    (val) => /.+@.+\..+/.test(val)    || "Formato de correo no válido",
  ],
  password: [
    (val) => (val !== null && val !== "") || "La contraseña es obligatoria",
    (val) => val.length >= 6             || "Mínimo 6 caracteres",
  ],
  /**
   * `confirmPassword` se define como computed para que Vue reevalúe
   * las reglas cada vez que cambia `password.value`.
   * Sin computed, la comparación usaría el valor inicial de password ("").
   */
  confirmPassword: computed(() => [
    (val) => (val !== null && val !== "") || "Confirma tu contraseña",
    (val) => val === password.value       || "Las contraseñas no coinciden",
  ]),
};

// ── Funciones del formulario ──────────────────────────────────────────────────

/** Alterna la visibilidad del campo contraseña entre texto plano y oculto */
function togglePasswordVisibility() {
  showPassword.value = !showPassword.value;
}

/** Alterna la visibilidad del campo confirmar contraseña */
function toggleConfirmPasswordVisibility() {
  showConfirmPassword.value = !showConfirmPassword.value;
}

/**
 * Restablece todos los campos del formulario a su estado inicial.
 * También limpia `isLoading` por si el reset ocurre durante una petición activa.
 */
function handleReset() {
  documentNumber.value     = "";
  fullName.value           = "";
  email.value              = "";
  password.value           = "";
  confirmPassword.value    = "";
  showPassword.value        = false;
  showConfirmPassword.value = false;
  isLoading.value           = false;
}

/**
 * Construye el payload normalizado para enviar a la API.
 * Aplica trim a los strings para evitar espacios accidentales.
 * La contraseña no se normaliza para respetar caracteres exactos del usuario.
 *
 * @returns {Object} Datos del nuevo usuario listos para enviar.
 */
function buildUserPayload() {
  return {
    document: String(documentNumber.value).trim(),
    name:     fullName.value.trim(),
    email:    email.value.trim(),
    password: password.value,
  };
}

/**
 * Envía el formulario de registro a la API.
 * Si tiene éxito: notifica con el mensaje del servidor y redirige al Login.
 * El guard `isLoading` previene envíos duplicados por clics repetidos.
 */
async function submitRegister() {
  if (isLoading.value) return;
  isLoading.value = true;
  try {
    const res = await postData("/user/register", buildUserPayload());
    success(res.message);
    router.push({ name: "Login" });
  } catch (fail) {
    error(fail);
  } finally {
    isLoading.value = false;
  }
}
</script>


<style scoped>
#register-page {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100vh;
  padding: 2rem 1rem;
  background: linear-gradient(135deg, #e3f2fd, #34729b);
}

.register-card {
  width: 100%;
  max-width: 480px;
  padding: 2rem 2.5rem;
  border-radius: 20px;
}

.register-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin-top: 0.75rem;
  margin-bottom: 0.1rem;
}

.register-subtitle {
  font-size: 1rem;
  margin: 0;
}

/* Overlay pantalla completa durante la carga */
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