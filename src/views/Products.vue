<template>
  <q-page id="products-page" class="q-pa-lg">
    <!-- ── Encabezado ── -->
    <header class="page-header q-mb-xl">
      <div class="row items-center q-gutter-sm">
        <q-avatar size="44px" class="header-logo">
          <q-icon name="inventory_2" size="26px" color="white" />
        </q-avatar>
        <div>
          <h1 class="page-title text-primary">Productos</h1>
          <p class="page-subtitle text-grey-5">
            Gestión de inventario · Supermarket San Gil
          </p>
        </div>
      </div>

      <q-btn
        color="primary"
        icon="add"
        label="Nuevo producto"
        rounded
        @click="openCreateDialog"
      />
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
            <p class="summary-label text-black-5">{{ card.label }}</p>
            <p class="summary-value" :class="card.valueClass">
              {{ summary[card.key] }}
            </p>
          </div>
        </q-card-section>
      </q-card>
    </section>

    <!-- ── Tabla ── -->
    <BaseTable
      :rows="productList"
      :columns="productColumns"
      :loading="isLoading"
      :badge="productList.length"
    >
      <template #title>
        <div class="row items-center q-gutter-xs">
          <q-icon name="list_alt" color="primary" size="20px" />
          <span class="section-title text-primary">Lista de productos</span>
        </div>
      </template>

      <!-- Estado -->
      <template #cell-status="props">
        <q-badge
          rounded
          :color="props.row.status === 1 ? 'positive' : 'negative'"
          :label="props.row.status === 1 ? 'Activo' : 'Desactivado'"
        />
      </template>

      <!-- Acciones -->
      <template #cell-option="props">
        <div class="row q-gutter-xs justify-center">
          <q-btn
            flat
            round
            dense
            icon="edit"
            color="primary"
            size="sm"
            @click="openEditDialog(props.row)"
          >
            <q-tooltip>Editar producto</q-tooltip>
          </q-btn>

          <q-btn
            v-if="props.row.status === 1"
            flat
            round
            dense
            icon="cancel"
            color="negative"
            size="sm"
            @click="toggleProductStatus(props.row._id, false)"
          >
            <q-tooltip>Desactivar producto</q-tooltip>
          </q-btn>

          <q-btn
            v-else
            flat
            round
            dense
            icon="check_circle"
            color="positive"
            size="sm"
            @click="toggleProductStatus(props.row._id, true)"
          >
            <q-tooltip>Activar producto</q-tooltip>
          </q-btn>
        </div>
      </template>

      <template #cell-price="props">
        <span class="text-primary text-weight-bold">
          {{ formatCurrency(props.row.price) }}
        </span>
      </template>

      <template #cell-recommendationPrice="props">
        <span class="text-primary text-weight-bold">
          {{ formatCurrency(props.row.recommendedPrice) }}
        </span>
      </template>
    </BaseTable>

    <!-- ── Formulario ── -->
    <ProductForm
      v-model="dialog.isOpen"
      :product="editingProduct"
      :loading="isSaving"
      @guardar="saveProduct"
      @cancelar="closeDialog"
    />
  </q-page>
</template>

<script setup>
// ─────────────────────────────────────────────
// Importaciones
// ─────────────────────────────────────────────
import { ref } from "vue";
import { useQuasar } from "quasar";
import BaseTable from "../components/BaseTable.vue";
import ProductForm from "../components/Form/FormProducts.vue";
import { getData, postData, putData } from "../services/api_Clients.js";
import { Notifications } from "../composables/Notifications.js";
import { useCurrency } from "../composables/Mini-composables.js";
// Instancias
const $q = useQuasar();
const { success, error } = Notifications();
const { formatCurrency } = useCurrency();

// Estado
const isLoading = ref(false);
const isSaving = ref(false);

const productList = ref([]);
const editingProduct = ref({});
const dialog = ref({ isOpen: false });

const summary = ref({
  totalProducts: 0,
  activeProducts: 0,
  inactiveProducts: 0,
  inventoryValue: 0,
  lowStockCount: 0,
  averagePrice: 0,
});

// Tarjetas
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
    key: "activeProducts",
    label: "Productos activos",
    icon: "inventory_2",
    iconColor: "positive",
    avatarClass: "bg-green-1",
    valueClass: "text-positive",
  },
  {
    key: "inactiveProducts",
    label: "Productos inactivos",
    icon: "inventory_2",
    iconColor: "negative",
    avatarClass: "bg-red-1",
    valueClass: "text-negative",
  },
  {
    key: "inventoryValue",
    label: "Valor inventario",
    icon: "attach_money",
    iconColor: "warning",
    avatarClass: "bg-orange-1",
    valueClass: "text-warning",
  },
  {
    key: "averagePrice",
    label: "Precio promedio",
    icon: "price_check",
    iconColor: "warning",
    avatarClass: "bg-orange-1",
    valueClass: "text-warning",
  },
  {
    key: "lowStockCount",
    label: "Bajo stock",
    icon: "warning",
    iconColor: "negative",
    avatarClass: "bg-red-1",
    valueClass: "text-negative",
  },
];

// Columnas
const productColumns = [
  {
    name: "barcode",
    label: "Código",
    field: "barcode",
    align: "center",
    sortable: true,
  },
  {
    name: "name",
    label: "Nombre",
    field: "name",
    align: "left",
    sortable: true,
  },
  {
    name: "category",
    label: "Categoría",
    field: "category",
    align: "center",
    sortable: true,
  },
  {
    name: "price",
    label: "Precio",
    field: "price",
    align: "center",
    sortable: true,
  },
  {
    name: "recommendationPrice",
    label: "Precio de mercado",
    field: "recommendedPrice",
    align: "center",
  },
  {
    name: "stock",
    label: "Cantidad",
    field: "stock",
    align: "center",
    sortable: true,
  },
  {
    name: "status",
    label: "Estado",
    field: "status",
    align: "center",
    sortable: true,
  },
  { name: "option", label: "Opciones", field: "option", align: "center" },
];

// Obtener resumen
async function fetchProductSummary() {
  isLoading.value = true;
  try {
    const data = await getData("/product/summary/products");
    summary.value = { ...summary.value, ...data.summary };
  } catch (err) {
    error("Error al cargar resumen");
  } finally {
    isLoading.value = false;
  }
}

// Obtener productos
async function fetchProducts() {
  isLoading.value = true;
  try {
    const res = await getData("/product/list");
    productList.value = res.products;
    success("Productos cargados correctamente");
  } catch (err) {
    error("Error al cargar productos");
  } finally {
    isLoading.value = false;
  }
}

// Dialog
function openCreateDialog() {
  editingProduct.value = {};
  dialog.value.isOpen = true;
}

function openEditDialog(product) {
  editingProduct.value = { ...product };
  dialog.value.isOpen = true;
}

function closeDialog() {
  dialog.value.isOpen = false;
  editingProduct.value = {};
}

// Guardar
async function saveProduct(payload) {
  isSaving.value = true;

  try {
    if (payload._id) {
      const { _id, barcode, recommendationPrice, ...body } = payload;
      await putData(`/product/${_id}`, body);
      success("Producto actualizado");
    } else {
      await postData("/product/createproduct", payload);
      success("Producto creado");
    }

    await fetchProducts();
    await fetchProductSummary();
    closeDialog();
  } catch (err) {
    error("Error al guardar");
  } finally {
    isSaving.value = false;
  }
}

// Estado
async function toggleProductStatus(id, activate) {
  const endpoint = activate
    ? `/product/activate/${id}`
    : `/product/deactivate/${id}`;

  try {
    await putData(endpoint);
    await fetchProducts();
    await fetchProductSummary();
    success(activate ? "Producto activado" : "Producto desactivado");
  } catch (err) {
    error("Error al cambiar estado");
  }
}

// Init
fetchProducts();
fetchProductSummary();
</script>

<style scoped>
#productos-page {
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
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
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

/* ─── Tabla ─── */
.section-title {
  font-size: 1rem;
  font-weight: 600;
}

/* ─── Responsive ─── */
@media (max-width: 600px) {
  .page-title {
    font-size: 1.1rem;
  }
}
</style>
