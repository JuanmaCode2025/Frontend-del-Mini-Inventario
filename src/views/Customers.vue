<template>
  <q-page id="clientes-page" class="q-pa-lg">
    <!-- ── Encabezado ── -->
    <header class="page-header q-mb-xl">
      <div class="row items-center q-gutter-sm">
        <q-avatar size="44px" class="header-logo">
          <q-icon name="people" size="26px" color="white" />
        </q-avatar>
        <div>
          <h1 class="page-title text-primary">Clientes</h1>
          <p class="page-subtitle text-grey-5">
            Gestión de clientes · Supermarket San Gil
          </p>
        </div>
      </div>

      <q-btn
        color="primary"
        icon="person_add"
        label="Nuevo cliente"
        rounded
        @click="abrirDialogCrear"
      />
    </header>

    <!-- ── Tarjetas de resumen ── -->
    <section class="summary-grid q-mb-lg">
      <q-card class="summary-card shadow-2">
        <q-card-section class="row items-center q-gutter-md">
          <q-avatar size="50px" class="bg-blue-1">
            <q-icon name="people" size="26px" color="primary" />
          </q-avatar>
          <div>
            <p class="summary-label text-grey-5">Total clientes</p>
            <p class="summary-value text-primary">{{ stats.total }}</p>
          </div>
        </q-card-section>
      </q-card>

      <q-card class="summary-card shadow-2">
        <q-card-section class="row items-center q-gutter-md">
          <q-avatar size="50px" class="bg-green-1">
            <q-icon name="check_circle" size="26px" color="positive" />
          </q-avatar>
          <div>
            <p class="summary-label text-grey-5">Activos</p>
            <p class="summary-value text-positive">{{ stats.activos }}</p>
          </div>
        </q-card-section>
      </q-card>

      <q-card class="summary-card shadow-2">
        <q-card-section class="row items-center q-gutter-md">
          <q-avatar size="50px" class="bg-red-1">
            <q-icon name="cancel" size="26px" color="negative" />
          </q-avatar>
          <div>
            <p class="summary-label text-grey-5">Inactivos</p>
            <p class="summary-value text-negative">{{ stats.inactivos }}</p>
          </div>
        </q-card-section>
      </q-card>

      <q-card class="summary-card shadow-2">
        <q-card-section class="row items-center q-gutter-md">
          <q-avatar size="50px" class="bg-orange-1">
            <q-icon name="shopping_cart" size="26px" color="warning" />
          </q-avatar>
          <div>
            <p class="summary-label text-grey-5">Con compras</p>
            <p class="summary-value text-warning">{{ stats.conCompras }}</p>
          </div>
        </q-card-section>
      </q-card>
    </section>

    <!-- ── Highlights: top compradores + recientes ── -->
    <section class="highlights-grid q-mb-xl">
      <!-- Top compradores -->
      <q-card class="highlight-card shadow-2">
        <q-card-section>
          <div class="row items-center q-gutter-xs q-mb-md">
            <q-icon name="emoji_events" color="warning" size="20px" />
            <span class="highlight-title text-primary">Top compradores</span>
          </div>

          <div
            v-if="topCompradores.length === 0"
            class="text-grey-5 text-center q-py-md"
          >
            Sin datos aún
          </div>

          <div
            v-for="(cliente, i) in topCompradores"
            :key="cliente._id"
            class="highlight-item"
          >
            <div class="highlight-rank" :class="`rank-${i + 1}`">
              {{ i + 1 }}
            </div>
            <div class="client-avatar" :style="getAvatarStyle(cliente.name)">
              {{ getInitials(cliente.name) }}
            </div>
            <div class="highlight-info">
              <p class="highlight-name">
                {{ cliente.name }} {{ cliente.lastName }}
              </p>
              <p class="highlight-sub">
                {{ cliente.totalCompras ?? 0 }} compras
              </p>
            </div>
            <span class="highlight-amount text-primary">
              {{ formatCurrency(cliente.totalGastado ?? 0) }}
            </span>
          </div>
        </q-card-section>
      </q-card>

      <!-- Registros recientes -->
      <q-card class="highlight-card shadow-2">
        <q-card-section>
          <div class="row items-center q-gutter-xs q-mb-md">
            <q-icon name="schedule" color="primary" size="20px" />
            <span class="highlight-title text-primary"
              >Registros recientes</span
            >
          </div>

          <div
            v-if="clientesRecientes.length === 0"
            class="text-grey-5 text-center q-py-md"
          >
            Sin registros recientes
          </div>

          <div
            v-for="cliente in clientesRecientes"
            :key="cliente._id"
            class="highlight-item"
          >
            <div class="client-avatar" :style="getAvatarStyle(cliente.name)">
              {{ getInitials(cliente.name) }}
            </div>
            <div class="highlight-info">
              <p class="highlight-name">
                {{ cliente.name }} {{ cliente.lastName }}
              </p>
              <p class="highlight-sub">{{ formatRelativeDate(cliente.createdAt) }}</p>
            </div>
            <q-badge
              rounded
              :color="cliente.status === 1 ? 'positive' : 'negative'"
              :label="cliente.status === 1 ? 'Activo' : 'Inactivo'"
            />
          </div>
        </q-card-section>
      </q-card>
    </section>

    <!-- ── Tabla usando BaseTable ── -->
    <BaseTable
      :rows="customerList"
      :columns="columnasTabla"
      :loading="isLoading"
      :badge="customerList.length"
    >
      <!-- Título -->
      <template #title>
        <div class="row items-center q-gutter-xs">
          <q-icon name="list_alt" color="primary" size="20px" />
          <span class="section-title text-primary">Lista de clientes</span>
        </div>
      </template>

      <!-- Celda: nombre con avatar -->
      <template #cell-name="props">
        <div class="row items-center q-gutter-sm">
          <div
            class="client-avatar client-avatar--sm"
            :style="getAvatarStyle(props.row.name)"
          >
            {{ getInitials(props.row.name) }}
          </div>
          <div>
            <p class="cell-name">
              {{ props.row.name }} {{ props.row.lastName }}
            </p>
            <p class="cell-sub">{{ props.row.address }}</p>
          </div>
        </div>
      </template>

      <!-- Celda: correo -->
      <template #cell-email="props">
        <span class="text-primary" style="font-size: 0.8rem">{{
          props.row.email
        }}</span>
      </template>

      <!-- Celda: compras -->
      <template #cell-totalCompras="props">
        <div class="row items-center q-gutter-xs">
          <q-icon
            name="shopping_cart"
            size="14px"
            :color="(props.row.totalCompras ?? 0) > 0 ? 'primary' : 'grey-4'"
          />
          <span
            :class="
              (props.row.totalCompras ?? 0) > 0
                ? 'text-primary text-weight-bold'
                : 'text-grey-5'
            "
          >
            {{ props.row.totalCompras ?? 0 }}
          </span>
        </div>
      </template>

      <!-- Celda: estado -->
      <template #cell-status="props">
        <q-badge
          rounded
          :color="props.row.status === 1 ? 'positive' : 'negative'"
          :label="props.row.status === 1 ? 'Activo' : 'Inactivo'"
        />
      </template>

      <!-- Celda: acciones -->
      <template #cell-option="props">
        <div class="row q-gutter-xs justify-center">
          <q-btn
            flat
            round
            dense
            icon="visibility"
            color="primary"
            size="sm"
            @click="verDetalleCliente(props.row)"
          >
            <q-tooltip>Ver detalle</q-tooltip>
          </q-btn>

          <q-btn
            flat
            round
            dense
            icon="edit"
            color="primary"
            size="sm"
            @click="abrirDialogEditar(props.row)"
          >
            <q-tooltip>Editar cliente</q-tooltip>
          </q-btn>

          <q-btn
            v-if="props.row.status === 1"
            flat
            round
            dense
            icon="cancel"
            color="negative"
            size="sm"
            @click="toggleEstado(props.row._id, false)"
          >
            <q-tooltip>Desactivar</q-tooltip>
          </q-btn>

          <q-btn
            v-else
            flat
            round
            dense
            icon="check_circle"
            color="positive"
            size="sm"
            @click="toggleEstado(props.row._id, true)"
          >
            <q-tooltip>Activar</q-tooltip>
          </q-btn>
        </div>
      </template>
    </BaseTable>

    <!-- ── Formulario como componente ── -->
    <FormCustomer
      v-model="dialog.isOpen"
      :cliente="editingCustomer"
      :loading="isSaving"
      @guardar="guardarCliente"
      @cancelar="cerrarDialog"
    />

    <!-- ── Dialog: Detalle del cliente ── -->
    <q-dialog v-model="detalleDialog.isOpen">
      <q-card class="detalle-card">
        <div class="detalle-header">
          <div class="row items-center q-gutter-sm">
            <div
              class="client-avatar"
              :style="getAvatarStyle(detalleDialog.cliente?.name ?? '')"
            >
              {{ getInitials(detalleDialog.cliente?.name ?? "") }}
            </div>
            <div>
              <p class="detalle-header__title">
                {{ detalleDialog.cliente?.name }}
                {{ detalleDialog.cliente?.lastName }}
              </p>
              <p class="detalle-header__sub">Perfil del cliente</p>
            </div>
          </div>
          <q-btn
            flat
            round
            dense
            icon="close"
            color="white"
            @click="detalleDialog.isOpen = false"
          />
        </div>

        <q-card-section class="q-pt-md">
          <div class="detalle-grid">
            <div class="detalle-item">
              <q-icon name="badge" color="primary" size="18px" />
              <div>
                <p class="detalle-label">Cédula / NIT</p>
                <p class="detalle-value">
                  {{ detalleDialog.cliente?.document ?? "—" }}
                </p>
              </div>
            </div>

            <div class="detalle-item">
              <q-icon name="email" color="primary" size="18px" />
              <div>
                <p class="detalle-label">Correo</p>
                <p class="detalle-value text-primary">
                  {{ detalleDialog.cliente?.email ?? "—" }}
                </p>
              </div>
            </div>

            <div class="detalle-item">
              <q-icon name="phone" color="primary" size="18px" />
              <div>
                <p class="detalle-label">Teléfono</p>
                <p class="detalle-value">
                  {{ detalleDialog.cliente?.phone ?? "—" }}
                </p>
              </div>
            </div>

            <div class="detalle-item">
              <q-icon name="location_on" color="warning" size="18px" />
              <div>
                <p class="detalle-label">Dirección</p>
                <p class="detalle-value">
                  {{ detalleDialog.cliente?.address ?? "—" }}
                </p>
              </div>
            </div>
          </div>

          <q-separator class="q-my-md" />
          <p class="detalle-section-label q-mb-sm">Historial de compras</p>

          <div class="stats-row">
            <div class="stats-item bg-blue-1">
              <p class="stats-value text-primary">
                {{ detalleDialog.cliente?.totalCompras ?? 0 }}
              </p>
              <p class="stats-label text-blue-7">Compras</p>
            </div>

            <div class="stats-item bg-green-1">
              <p class="stats-value text-positive">
                {{ formatCurrency(detalleDialog.cliente?.totalGastado ?? 0) }}
              </p>
              <p class="stats-label text-positive">Total gastado</p>
            </div>

            <div
              class="stats-item"
              :class="
                detalleDialog.cliente?.status === 1 ? 'bg-green-1' : 'bg-red-1'
              "
            >
              <q-badge
                rounded
                :color="
                  detalleDialog.cliente?.status === 1 ? 'positive' : 'negative'
                "
                :label="
                  detalleDialog.cliente?.status === 1 ? 'Activo' : 'Inactivo'
                "
                class="q-mb-xs"
              />
              <p
                class="stats-label"
                :class="
                  detalleDialog.cliente?.status === 1
                    ? 'text-positive'
                    : 'text-negative'
                "
              >
                Estado
              </p>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>


<script setup>
/**
 * Vista principal de Clientes.
 * Gestiona la lista, estadísticas, highlights, creación,
 * edición, activación/desactivación y detalle de clientes.
 */
// ─────────────────────────────────────────────
// Importaciones
// ─────────────────────────────────────────────
import { ref, computed } from "vue";
import { useQuasar } from "quasar";
import BaseTable from "../components/BaseTable.vue";
import FormCustomer from "../components/Form/FormCustomer.vue";
import { getData, postData, putData } from "../services/api_Clients.js";
import { Notifications } from "../composables/Notifications.js";
import {useCurrency } from "../composables/Mini-composables.js"
import { useDateFormatter } from "../composables/Dates.js"

import { useAvatarHelper }        from "../composables/Avatar.js";

const { getInitials, getAvatarStyle } = useAvatarHelper();
// ─────────────────────────────────────────────
// Instancias
// ─────────────────────────────────────────────
const $q = useQuasar();
const { success, error } = Notifications();
const { formatRelativeDate } = useDateFormatter()
const { formatCurrency } = useCurrency();

// ─────────────────────────────────────────────
// Estado general
// ─────────────────────────────────────────────
const isLoading = ref(false);
const isSaving = ref(false);
const customerList = ref([]);
const editingCustomer = ref({});

// ─────────────────────────────────────────────
// Estado dialogs
// ─────────────────────────────────────────────
const dialog = ref({ isOpen: false });

const detalleDialog = ref({ isOpen: false, cliente: null });

// ─────────────────────────────────────────────
// Estadísticas computadas
// ─────────────────────────────────────────────
const stats = computed(() => ({
  total: customerList.value.length,
  activos: customerList.value.filter((c) => c.status === 1).length,
  inactivos: customerList.value.filter((c) => c.status !== 1).length,
  conCompras: customerList.value.filter((c) => (c.totalCompras ?? 0) > 0).length,
}));

/** Top 3 clientes con más compras */
const topCompradores = computed(() =>
  [...customerList.value]
    .filter((c) => (c.totalCompras ?? 0) > 0)
    .sort((a, b) => (b.totalCompras ?? 0) - (a.totalCompras ?? 0))
    .slice(0, 3)
);

/** Últimos 3 clientes registrados */
const clientesRecientes = computed(() =>
  [...customerList.value]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3)
);





// ─────────────────────────────────────────────
// Columnas de la tabla
// ─────────────────────────────────────────────
const columnasTabla = [
  {
    name: "document",
    align: "center",
    label: "Cédula",
    field: "document",
    sortable: true,
  },
  {
    name: "name",
    align: "left",
    label: "Cliente",
    field: "name",
    sortable: true,
  },
  {
    name: "lastname",
    align: "left",
    label: "Apellido",
    field: "lastname",
    sortable: true,
  },
  {
    name: "email",
    align: "left",
    label: "Correo",
    field: "email",
    sortable: false,
  },
  {
    name: "phone",
    align: "center",
    label: "Teléfono",
    field: "phone",
    sortable: false,
  },
  {
    name: "status",
    align: "center",
    label: "Estado",
    field: "status",
    sortable: true,
  },
  {
    name: "option",
    align: "center",
    label: "Opciones",
    field: "option",
    sortable: false,
  },
];

// ─────────────────────────────────────────────
// Carga de clientes
// GET /client/list
// ─────────────────────────────────────────────
async function listClientes() {
  isLoading.value = true;
  try {
    const res = await getData("/customer/list");
    console.log(res);
    customerList.value = res.data;
    success("Datos Cargados de los Clientes");
  } catch (fail) {
    error(fail);
  } finally {
    isLoading.value = false;
  }
}

// ─────────────────────────────────────────────
// Acciones del dialog crear/editar
// ─────────────────────────────────────────────
function abrirDialogCrear() {
  editingCustomer.value = {};
  dialog.value.isOpen = true;
}

function abrirDialogEditar(cliente) {
  editingCustomer.value = { ...cliente };
  dialog.value.isOpen = true;
}

function cerrarDialog() {
  dialog.value.isOpen = false;
  editingCustomer.value = {};
}

/**
 * Recibe el payload del FormCustomer y llama a la API.
 * POST /client/create   → crear
 * PUT  /client/edit/:id → editar
 */
async function guardarCliente(payload) {
  isSaving.value = true;
  try {
    if (payload._id) {
      await putData(`/customer/${payload._id}`, payload);
      success(`${payload.name} Actualizado Correctamente`);
    } else {
      console.log(payload);

      await postData("/customer/createcustomer", payload);
      success(`${payload.name} fue Creado Correctamente`);
    }
    await listClientes();
    cerrarDialog();
  } catch (fail) {
    error(fail);
  } finally {
    isSaving.value = false;
  }
}

// ─────────────────────────────────────────────
// Ver detalle del cliente
// ─────────────────────────────────────────────
function verDetalleCliente(cliente) {
  detalleDialog.value = { isOpen: true, cliente };
}

// ─────────────────────────────────────────────
// Activar / Desactivar
// PUT /client/activar/:id
// PUT /client/desactivar/:id
// ─────────────────────────────────────────────
async function toggleEstado(id, activate) {
  const ruta = activate
  ? `/customer/activate/${id}` 
  : `/customer/deactivate/${id}`;
  try {
    await putData(ruta);
    await listClientes();
    success(activate ? " Cliente Activado" : "Cliente Desactivado");
  } catch (fail) {
    error(fail)
  }
}

// ─────────────────────────────────────────────
// Inicio
// ─────────────────────────────────────────────
listClientes();
</script>


<style scoped>
#clientes-page {
  background: linear-gradient(135deg, #e3f2fd, #ffffff);
  min-height: 100vh;
}

/* ─── Encabezado ─── */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-logo {
  background: #1976d2;
  border-radius: 12px;
}

.page-title {
  font-size: 1.35rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
}

.page-subtitle {
  font-size: 0.78rem;
  margin: 0;
}

/* ─── Tarjetas resumen ─── */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
   @media (max-width: 1500px) {
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
}

.summary-card {
  border-radius: 16px;
  border: 0.5px solid rgba(25, 118, 210, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(25, 118, 210, 0.12) !important;
}

.summary-label {
  font-size: 0.72rem;
  margin: 0 0 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.summary-value {
  font-size: 1.9rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.1;
}

/* ─── Highlights ─── */
.highlights-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.highlight-card {
  border-radius: 16px;
  border: 0.5px solid rgba(25, 118, 210, 0.1);
}

.highlight-title {
  font-size: 0.88rem;
  font-weight: 600;
}

.highlight-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0.55rem 0;
  border-bottom: 0.5px solid rgba(25, 118, 210, 0.08);
}

.highlight-item:last-child {
  border-bottom: none;
}

.highlight-rank {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  flex-shrink: 0;
}

.rank-1 {
  background: #fff8e1;
  color: #f57c00;
}
.rank-2 {
  background: #f5f5f5;
  color: #616161;
}
.rank-3 {
  background: #fbe9e7;
  color: #bf360c;
}

.highlight-info {
  flex: 1;
  min-width: 0;
}

.highlight-name {
  font-size: 0.85rem;
  font-weight: 500;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.highlight-sub {
  font-size: 0.7rem;
  color: #90a4ae;
  margin: 0;
}

.highlight-amount {
  font-size: 0.85rem;
  font-weight: 700;
  flex-shrink: 0;
}

/* ─── Avatar ─── */
.client-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.client-avatar--sm {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  font-size: 0.65rem;
}

/* ─── Tabla ─── */
.section-title {
  font-size: 1rem;
  font-weight: 600;
}

.cell-name {
  font-size: 0.85rem;
  font-weight: 500;
  margin: 0;
}

.cell-sub {
  font-size: 0.7rem;
  color: #90a4ae;
  margin: 0;
}

/* ─── Dialog detalle ─── */
.detalle-card {
  width: 100%;
  max-width: 480px;
  border-radius: 20px;
  overflow: hidden;
}

.detalle-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 1.5rem;
  background: linear-gradient(90deg, #0d47a1, #1976d2);
}

.detalle-header__title {
  font-size: 1.05rem;
  font-weight: 700;
  color: white;
  margin: 0;
}

.detalle-header__sub {
  font-size: 0.73rem;
  color: rgba(255, 255, 255, 0.72);
  margin: 2px 0 0;
}

.detalle-section-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #1976d2;
  margin: 0;
}

.detalle-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.9rem;
}

.detalle-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 0.6rem;
  background: #f0f7ff;
  border-radius: 10px;
  border: 0.5px solid rgba(25, 118, 210, 0.1);
}

.detalle-label {
  font-size: 0.66rem;
  color: #90a4ae;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.detalle-value {
  font-size: 0.88rem;
  font-weight: 500;
  margin: 2px 0 0;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.8rem;
}

.stats-item {
  border-radius: 12px;
  padding: 0.8rem;
  text-align: center;
}

.stats-value {
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0 0 2px;
}

.stats-label {
  font-size: 0.66rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

/* ─── Responsive ─── */
@media (max-width: 700px) {
  .highlights-grid {
    grid-template-columns: 1fr;
  }
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .detalle-grid {
    grid-template-columns: 1fr;
  }
  .page-title {
    font-size: 1.1rem;
  }
}
</style>