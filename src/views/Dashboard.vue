<template>
  <q-page id="dashboard-page" class="q-pa-lg">
    <!-- ── Encabezado ── -->
    <header class="dashboard-header q-mb-xl">
      <div class="row items-center q-gutter-sm">
        <q-avatar size="44px" class="header-logo">
          <q-icon name="storefront" size="26px" color="white" />
        </q-avatar>
        <div>
          <h1 class="dashboard-title text-primary">Supermarket San Gil</h1>
          <p class="dashboard-subtitle text-grey-5">
            StockPyme · Panel de inventario
          </p>
        </div>
      </div>

      <q-btn
        flat
        round
        icon="refresh"
        color="primary"
        :loading="isRefreshing"
        @click="refreshData"
      >
        <q-tooltip>Actualizar datos</q-tooltip>
      </q-btn>
    </header>

    <!-- ── Tarjetas de resumen ── -->
    <section class="summary-grid q-mb-xl">
      <q-card
        v-for="card in summaryCards"
        :key="card.key"
        class="summary-card shadow-2"
      >
        <q-card-section class="row items-center q-gutter-md">
          <q-avatar size="50px" :class="card.avatarClass">
            <q-icon :name="card.icon" size="26px" :color="card.iconColor" />
          </q-avatar>
          <div>
            <p class="summary-label text-grey-5">{{ card.label }}</p>
            <p class="summary-value" :class="card.valueClass">
              {{ stats[card.key] }}
            </p>
          </div>
        </q-card-section>
      </q-card>
    </section>

    <!-- ── Accesos rápidos ── -->
    <section class="q-mb-xl">
      <p class="section-label text-grey-6 q-mb-md">Accesos rápidos</p>
      <div class="shortcuts-grid">
        <!-- Productos -->
        <q-card
          class="shortcut-card shadow-1"
          clickable
          @click="$router.push({ name: 'Products' })"
        >
          <q-card-section class="column items-center text-center q-pa-md">
            <q-avatar size="44px" class="bg-blue-1 q-mb-sm">
              <q-icon name="inventory_2" size="22px" color="primary" />
            </q-avatar>
            <span class="shortcut-label text-primary">Productos</span>
          </q-card-section>
        </q-card>

        <!-- Clientes -->
        <q-card
          class="shortcut-card shadow-1"
          clickable
          @click="$router.push({ name: 'Customers' })"
        >
          <q-card-section class="column items-center text-center q-pa-md">
            <q-avatar size="44px" class="bg-green-1 q-mb-sm">
              <q-icon name="people" size="22px" color="positive" />
            </q-avatar>
            <span class="shortcut-label text-positive">Clientes</span>
          </q-card-section>
        </q-card>

        <!-- Ventas -->
        <q-card
          class="shortcut-card shadow-1"
          clickable
          @click="$router.push({ name: 'Sales' })"
        >
          <q-card-section class="column items-center text-center q-pa-md">
            <q-avatar size="44px" class="bg-red-1 q-mb-sm">
              <q-icon name="point_of_sale" size="22px" color="negative" />
            </q-avatar>
            <span class="shortcut-label text-negative">Ventas</span>
          </q-card-section>
        </q-card>

        <!-- Usuarios -->
        <q-card
          class="shortcut-card shadow-1"
          clickable
          @click="$router.push({ name: 'Usuarios' })"
        >
          <q-card-section class="column items-center text-center q-pa-md">
            <q-avatar size="44px" class="bg-orange-1 q-mb-sm">
              <q-icon name="manage_accounts" size="22px" color="warning" />
            </q-avatar>
            <span class="shortcut-label text-warning">Usuarios</span>
          </q-card-section>
        </q-card>
      </div>
    </section>

    <!-- ── Tabla: Productos con bajo stock ── -->
    <BaseTable
      :rows="lowStockProducts"
      :columns="productColumns"
      :loading="isLoading"
      :badge="lowStockProducts.length"
    >
      <!-- Título -->
      <template #title>
        <span class="text-primary text-weight-bold">
          PRODUCTOS CON BAJO STOCK
        </span>
      </template>

      <!-- Celda Stock -->
      <template #cell-stock="props">
        <CellDesign type="stock" :value="props.row.stock" />
      </template>

      <!-- Celda Estado -->
      <template #cell-status="props">
        <CellDesign type="status" :value="props.row.stock" />
      </template>
    </BaseTable>
  </q-page>
</template>

<script setup>
// ─────────────────────────────────────────────
// Importaciones
// ─────────────────────────────────────────────
import { ref, computed } from "vue";
import { useQuasar } from "quasar";
import { getData } from "../services/api_Clients.js";
import { Notifications } from "../composables/Notifications.js";

// ─────────────────────────────────────────────
// Componentes
// ─────────────────────────────────────────────
import BaseTable from "../components/BaseTable.vue";
import CellDesign from "../components/CellDesign.vue";

// ─────────────────────────────────────────────
// Instancias globales
// ─────────────────────────────────────────────
const $q = useQuasar();
const { success, error } = Notifications();

// ─────────────────────────────────────────────
// Estado global
// ─────────────────────────────────────────────

// Control de carga
const isLoading = ref(false);
const isRefreshing = ref(false);

// Datos estadísticos
const totalProducts = ref(0);
const totalCustomers = ref(0);
const totalUsers = ref(0);
const totalSales = ref(0);

// Lista de productos con bajo stock
const lowStockProducts = ref([]);

// ─────────────────────────────────────────────
// Configuración tarjetas
// ─────────────────────────────────────────────
const summaryCards = [
  {
    key: "totalProducts",
    label: "Total productos",
    icon: "inventory_2",
    iconColor: "primary",
    avatarClass: "bg-blue-1",
    valueClass: "text-primary",
  },
  {
    key: "totalCustomers",
    label: "Total clientes",
    icon: "people",
    iconColor: "positive",
    avatarClass: "bg-green-1",
    valueClass: "text-positive",
  },
  {
    key: "totalUsers",
    label: "Usuarios",
    icon: "manage_accounts",
    iconColor: "warning",
    avatarClass: "bg-orange-1",
    valueClass: "text-warning",
  },
  {
    key: "totalSales",
    label: "Total ventas",
    icon: "point_of_sale",
    iconColor: "negative",
    avatarClass: "bg-red-1",
    valueClass: "text-negative",
  },
];

// ─────────────────────────────────────────────
// Columnas tabla productos
// ─────────────────────────────────────────────
const productColumns = [
  {
    name: "barcode",
    label: "Código de barras",
    field: "barcode",
    align: "left",
    sortable: true,
  },
  {
    name: "name",
    label: "Nombre",
    field: "name",
    align: "left",
    sortable: false,
  },
  {
    name: "category",
    label: "Categoría",
    field: "category",
    align: "center",
    sortable: true,
  },
  {
    name: "stock",
    label: "Stock",
    field: "stock",
    align: "center",
    sortable: true,
  },
  {
    name: "status",
    label: "Estado",
    field: "status",
    align: "center",
    sortable: false,
  },
];

// ─────────────────────────────────────────────
// Función: Obtener estadísticas
// ─────────────────────────────────────────────
async function fetchDashboardStats() {
  isLoading.value = true;

  try {
    const [productsRes, customersRes, salesRes] = await Promise.all([
      getData("/product/list"),
      getData("/customer/list"),
      getData("/sale/list"),
    ]);

    totalProducts.value = productsRes.total;
    totalCustomers.value = customersRes.total;
    totalSales.value = salesRes.total;
  } catch (err) {
    error("Error al cargar estadísticas");
    console.error(err);
  } finally {
    isLoading.value = false;
  }
}

// ─────────────────────────────────────────────
// Función: Productos con bajo stock
// ─────────────────────────────────────────────
async function fetchLowStockProducts() {
  isLoading.value = true;

  try {
    const res = await getData("/product/list/stock?type=low");
    lowStockProducts.value = res.products;
  } catch (err) {
    error("Error al cargar productos");
    console.error(err);
  } finally {
    isLoading.value = false;
  }
}

// ─────────────────────────────────────────────
// Refrescar dashboard
// ─────────────────────────────────────────────
async function refreshData() {
  isRefreshing.value = true;

  await Promise.all([fetchDashboardStats(), fetchLowStockProducts()]);

  isRefreshing.value = false;
  success("Página actualizada correctamente");
}

// ─────────────────────────────────────────────
// Computed: Estadísticas
// ─────────────────────────────────────────────
const stats = computed(() => ({
  totalProducts: totalProducts.value,
  totalCustomers: totalCustomers.value,
  totalUsers: totalUsers.value,
  totalSales: totalSales.value,
}));

// ─────────────────────────────────────────────
// Inicialización
// ─────────────────────────────────────────────
fetchDashboardStats();
fetchLowStockProducts();
</script>


<style scoped>
#dashboard-page {
  background: linear-gradient(135deg, #e3f2fd, #ffffff);
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-logo {
  background: #1976d2;
  border-radius: 12px;
}

.dashboard-title {
  font-size: 1.35rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
}

.dashboard-subtitle {
  font-size: 0.78rem;
  margin: 0;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 1rem;
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

.section-label {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0;
}

.shortcuts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.9rem;
}

.shortcut-card {
  border-radius: 14px;
  border: 0.5px solid rgba(25, 118, 210, 0.1);
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
}

.shortcut-card:hover {
  transform: translateY(-3px);
  background: #e3f2fd !important;
  box-shadow: 0 6px 16px rgba(25, 118, 210, 0.12) !important;
}

.shortcut-label {
  font-size: 0.82rem;
  font-weight: 500;
}

.table-card {
  border-radius: 16px;
  border: 0.5px solid rgba(25, 118, 210, 0.1);
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
}

.low-stock-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f57c00;
}

@media (max-width: 600px) {
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .shortcuts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .dashboard-title {
    font-size: 1.1rem;
  }
}
</style>