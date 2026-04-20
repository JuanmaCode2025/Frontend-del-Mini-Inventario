<template>
  <q-dialog
    :model-value="modelValue"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-card class="formulario-card">
      <!-- ── Encabezado ── -->
      <div class="formulario-header">
        <div class="row items-center q-gutter-sm">
          <q-avatar size="42px" class="header-avatar">
            <q-icon
              :name="isEditing ? 'edit' : 'person_add'"
              size="24px"
              color="white"
            />
          </q-avatar>
          <div>
            <p class="formulario-title">
              {{ isEditing ? "Editar cliente" : "Nuevo cliente" }}
            </p>
            <p class="formulario-subtitle">
              {{
                isEditing
                  ? "Modifica los datos del cliente"
                  : "Completa la información"
              }}
            </p>
          </div>
        </div>
        <q-btn
          flat
          round
          dense
          icon="close"
          color="white"
          @click="$emit('cancelar')"
        />
      </div>

      <!-- ── Formulario ── -->
      <q-form @submit.prevent="handleSubmit" class="formulario-body">
        <!-- Sección: Identificación -->
        <p class="form-section-label">Identificación</p>

        <q-input
          v-model="form.document"
          outlined
          dense
          rounded
          label="Cédula / NIT *"
          :rules="[(val) => !!val || 'El documento es obligatorio']"
        >
          <template #prepend>
            <q-icon name="badge" color="primary" />
          </template>
        </q-input>

        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm-6">
            <q-input
              v-model="form.name"
              outlined
              dense
              rounded
              label="Nombre *"
              :rules="[(val) => !!val || 'El nombre es obligatorio']"
            >
              <template #prepend>
                <q-icon name="person" color="primary" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-sm-6">
            <q-input
              v-model="form.lastname"
              outlined
              dense
              rounded
              label="Apellido *"
              :rules="[(val) => !!val || 'El apellido es obligatorio']"
            >
              <template #prepend>
                <q-icon name="person_outline" color="primary" />
              </template>
            </q-input>
          </div>
        </div>

        <q-separator class="q-my-xs" />

        <!-- Sección: Contacto -->
        <p class="form-section-label">Contacto</p>

        <q-input
          v-model="form.email"
          outlined
          dense
          rounded
          label="Correo electrónico"
          type="email"
        >
          <template #prepend>
            <q-icon name="email" color="primary" />
          </template>
        </q-input>

        <q-input
          v-model="form.phone"
          outlined
          dense
          rounded
          label="Teléfono"
          mask="### ### ####"
        >
          <template #prepend>
            <q-icon name="phone" color="primary" />
          </template>
        </q-input>

        <q-input
          v-model="form.address"
          outlined
          dense
          rounded
          label="Dirección"
        >
          <template #prepend>
            <q-icon name="location_on" color="primary" />
          </template>
        </q-input>

        <!-- ── Botones ── -->
        <div class="formulario-actions">
          <q-btn
            flat
            label="Cancelar"
            color="grey-6"
            rounded
            @click="$emit('cancelar')"
          />
          <q-btn
            type="submit"
            :label="isEditing ? 'Guardar cambios' : 'Crear cliente'"
            color="primary"
            rounded
            :loading="loading"
            icon-right="save"
          />
        </div>
      </q-form>
    </q-card>
  </q-dialog>
</template>


<script setup>
// ─────────────────────────────────────────────
// Importaciones
// ─────────────────────────────────────────────
import { ref, watch, computed } from "vue";

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
const props = defineProps({
  /** Controla si el dialog está abierto (v-model) */
  modelValue: {
    type: Boolean,
    default: false,
  },
  /** Cliente a editar — si viene con _id es modo edición */
  cliente: {
    type: Object,
    default: () => ({}),
  },
  /** Muestra el loader en el botón de guardar */
  loading: {
    type: Boolean,
    default: false,
  },
});

// ─────────────────────────────────────────────
// Emits
// ─────────────────────────────────────────────
const emit = defineEmits(["update:modelValue", "guardar", "cancelar"]);

// ─────────────────────────────────────────────
// Estado interno del formulario
// ─────────────────────────────────────────────
const form = ref({
  name: "",
  lastname: "",
  document: "",
  email: "",
  phone: "",
  address: "",
});

/** true si el cliente ya tiene _id (viene de MongoDB) */
const isEditing = computed(() => !!props.cliente?._id);

// ─────────────────────────────────────────────
// Sincronizar formulario cuando cambia el cliente
// ─────────────────────────────────────────────
watch(
  () => props.cliente,
  (nuevoCliente) => {
    form.value = {
      name: nuevoCliente?.name ?? "",
      lastname: nuevoCliente?.lastname ?? "",
      document: nuevoCliente?.document ?? "",
      email: nuevoCliente?.email ?? "",
      phone: nuevoCliente?.phone ?? "",
      address: nuevoCliente?.address ?? "",
    };
  },
  { immediate: true }
);

// ─────────────────────────────────────────────
// Helpers visuales
// ─────────────────────────────────────────────


// ─────────────────────────────────────────────
// Submit
// ─────────────────────────────────────────────
async function handleSubmit() {
  const payload = { ...form.value };

  // 🔥 LIMPIAR Y CONVERTIR TELÉFONO
  const cleanPhone = String(payload.phone).replace(/\D/g, "");

  payload.phone = cleanPhone ? Number(cleanPhone) : null;

  // 🔥 LIMPIAR Y CONVERTIR DOCUMENTO
  payload.document = payload.document
    ? Number(String(payload.document).trim())
    : null;

  // 🔥 LIMPIAR STRINGS (PRO)
  payload.name = payload.name.trim();
  payload.lastname = payload.lastname.trim();
  payload.email = payload.email.trim();
  payload.address = payload.address.trim();

  if (isEditing.value) payload._id = props.cliente._id;

  emit("guardar", payload);
}
</script>


<style scoped>
/* ─── Tarjeta principal ─── */
.formulario-card {
  width: 100%;
  max-width: 500px;
  border-radius: 20px;
  overflow: hidden;
}

/* ─── Encabezado azul — igual que productos ─── */
.formulario-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 1.5rem;
  background: linear-gradient(90deg, #0d47a1, #1976d2);
}

.header-avatar {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
}

.formulario-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: white;
  margin: 0;
  line-height: 1.2;
}

.formulario-subtitle {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.75);
  margin: 2px 0 0;
}

/* ─── Cuerpo ─── */
.formulario-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* ─── Etiquetas de sección ─── */
.form-section-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #1976d2;
  margin: 0;
}

/* ─── Vista previa del cliente ─── */
.nombre-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f0f7ff;
  border: 0.5px solid rgba(25, 118, 210, 0.2);
  border-radius: 12px;
  padding: 0.75rem 1rem;
}

.nombre-preview__avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.nombre-preview__nombre {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0;
  color: #1a1a2e;
}

.nombre-preview__doc {
  font-size: 0.75rem;
  margin: 2px 0 0;
}

/* ─── Botones ─── */
.formulario-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding-top: 0.5rem;
}

/* ─── Responsive ─── */
@media (max-width: 600px) {
  .formulario-card {
    max-width: 95vw;
  }
  .formulario-body {
    padding: 1rem;
  }
}
</style>