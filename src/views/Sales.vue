<template>
  <q-page id="sales-page" class="q-pa-lg">

    <!-- ── Encabezado de la página ── -->
    <header class="page-header q-mb-xl">
      <div class="row items-center q-gutter-sm">
        <q-avatar size="44px" class="header-logo">
          <q-icon name="point_of_sale" size="26px" color="white" />
        </q-avatar>
        <div>
          <h1 class="page-title text-primary">Ventas</h1>
          <p class="page-subtitle text-grey-5">
            Registro de ventas · Supermarket San Gil
          </p>
        </div>
      </div>

      <q-btn
        color="primary"
        icon="add_shopping_cart"
        label="Nueva venta"
        rounded
        @click="openCreateDialog"
      />
    </header>

    <!-- ── Fila 1 de tarjetas: conteos ── -->
    <section class="summary-grid q-mb-md">
      <q-card class="summary-card shadow-2">
        <q-card-section class="row items-center q-gutter-md">
          <q-avatar size="50px" class="bg-blue-1">
            <q-icon name="receipt_long" size="26px" color="primary" />
          </q-avatar>
          <div>
            <p class="summary-label text-grey-5">Total ventas</p>
            <p class="summary-value text-primary">{{ saleStats.totalSales }}</p>
          </div>
        </q-card-section>
      </q-card>

      <q-card class="summary-card shadow-2">
        <q-card-section class="row items-center q-gutter-md">
          <q-avatar size="50px" class="bg-green-1">
            <q-icon name="today" size="26px" color="positive" />
          </q-avatar>
          <div>
            <p class="summary-label text-grey-5">Ventas hoy</p>
            <p class="summary-value text-positive">{{ saleStats.salesToday }}</p>
          </div>
        </q-card-section>
      </q-card>

      <q-card class="summary-card shadow-2">
        <q-card-section class="row items-center q-gutter-md">
          <q-avatar size="50px" class="bg-orange-1">
            <q-icon name="date_range" size="26px" color="warning" />
          </q-avatar>
          <div>
            <p class="summary-label text-grey-5">Ventas del mes</p>
            <p class="summary-value text-warning">{{ saleStats.salesThisMonth }}</p>
          </div>
        </q-card-section>
      </q-card>
    </section>

    <!-- ── Fila 2 de tarjetas: ingresos ── -->
    <section class="summary-grid q-mb-xl">
      <q-card class="summary-card shadow-2">
        <q-card-section class="row items-center q-gutter-md">
          <q-avatar size="50px" class="bg-green-1">
            <q-icon name="payments" size="26px" color="positive" />
          </q-avatar>
          <div>
            <p class="summary-label text-grey-5">Ingresos totales</p>
            <p class="summary-value--sm text-positive">
              {{ formatCurrency(saleStats.totalRevenue) }}
            </p>
          </div>
        </q-card-section>
      </q-card>

      <q-card class="summary-card shadow-2">
        <q-card-section class="row items-center q-gutter-md">
          <q-avatar size="50px" class="bg-blue-1">
            <q-icon name="trending_up" size="26px" color="primary" />
          </q-avatar>
          <div>
            <p class="summary-label text-grey-5">Ingresos del día</p>
            <p class="summary-value--sm text-primary">
              {{ formatCurrency(saleStats.revenueToday) }}
            </p>
          </div>
        </q-card-section>
      </q-card>

      <q-card class="summary-card shadow-2">
        <q-card-section class="row items-center q-gutter-md">
          <q-avatar size="50px" class="bg-purple-1">
            <q-icon name="emoji_events" size="26px" color="purple" />
          </q-avatar>
          <div>
            <p class="summary-label text-grey-5">Venta más alta</p>
            <p class="summary-value--sm text-purple">
              {{ formatCurrency(saleStats.highestSale) }}
            </p>
          </div>
        </q-card-section>
      </q-card>
    </section>

    <!-- ── Sección: Highlights (recientes y top del día) ── -->
    <section class="highlights-grid q-mb-xl">

      <!-- Ventas recientes -->
      <q-card class="highlight-card shadow-2">
        <q-card-section>
          <div class="row items-center q-gutter-xs q-mb-md">
            <q-icon name="schedule" color="primary" size="20px" />
            <span class="highlight-title text-primary">Ventas recientes</span>
          </div>

          <div v-if="recentSales.length === 0" class="text-grey-5 text-center q-py-md">
            Sin ventas aún
          </div>

          <div
            v-for="sale in recentSales"
            :key="sale._id"
            class="highlight-item"
          >
            <div class="sale-avatar" :style="getAvatarStyle(sale.clientName)">
              {{ getInitials(sale.clientName) }}
            </div>
            <div class="highlight-info">
              <p class="highlight-name">{{ sale.clientName }}</p>
              <p class="highlight-sub">
                {{ formatRelativeDate(sale.createdAt) }} ·
                {{ sale.products?.length ?? 0 }} productos
              </p>
            </div>
            <span class="highlight-amount text-primary">
              {{ formatCurrency(sale.total) }}
            </span>
          </div>
        </q-card-section>
      </q-card>

      <!-- Top ventas del día -->
      <q-card class="highlight-card shadow-2">
        <q-card-section>
          <div class="row items-center q-gutter-xs q-mb-md">
            <q-icon name="emoji_events" color="warning" size="20px" />
            <span class="highlight-title text-primary">Mayores ventas del día</span>
          </div>

          <div v-if="topSalesToday.length === 0" class="text-grey-5 text-center q-py-md">
            Sin ventas hoy
          </div>

          <div
            v-for="(sale, i) in topSalesToday"
            :key="sale._id"
            class="highlight-item"
          >
            <div class="highlight-rank" :class="`rank-${i + 1}`">{{ i + 1 }}</div>
            <div class="sale-avatar" :style="getAvatarStyle(sale.clientName)">
              {{ getInitials(sale.clientName) }}
            </div>
            <div class="highlight-info">
              <p class="highlight-name">{{ sale.clientName }}</p>
              <p class="highlight-sub">{{ sale.products?.length ?? 0 }} productos</p>
            </div>
            <span class="highlight-amount text-primary">
              {{ formatCurrency(sale.total) }}
            </span>
          </div>
        </q-card-section>
      </q-card>
    </section>

    <!-- ── Tabla de ventas ── -->
    <BaseTable
      :rows="saleList"
      :columns="tableColumns"
      :loading="isLoading"
      :badge="saleList.length"
    >
      <template #title>
        <div class="row items-center q-gutter-xs">
          <q-icon name="list_alt" color="primary" size="20px" />
          <span class="section-title text-primary">Lista de ventas</span>
        </div>
      </template>

      <!-- Celda: cliente con avatar -->
      <template #cell-clientName="props">
        <div class="row items-center q-gutter-sm">
          <div
            class="sale-avatar sale-avatar--sm"
            :style="getAvatarStyle(props.row.clientName)"
          >
            {{ getInitials(props.row.clientName) }}
          </div>
          <div>
            <p class="cell-name">{{ props.row.clientName }}</p>
            <p class="cell-sub">{{ props.row.document }}</p>
          </div>
        </div>
      </template>

      <!-- Celda: cantidad de productos -->
      <template #cell-products="props">
        <div class="row items-center q-gutter-xs">
          <q-icon name="inventory_2" size="14px" color="primary" />
          <span class="text-weight-medium">
            {{ props.row.products?.length ?? 0 }} productos
          </span>
        </div>
      </template>

      <!-- Celda: total formateado -->
      <template #cell-total="props">
        <span class="text-primary text-weight-bold">
          {{ formatCurrency(props.row.total) }}
        </span>
      </template>

      <!-- Celda: método de pago con ícono -->
      <template #cell-paymentMethod="props">
        <div class="row items-center q-gutter-xs">
          <q-icon
            :name="getPaymentIcon(props.row.paymentMethod)"
            :color="getPaymentColor(props.row.paymentMethod)"
            size="16px"
          />
          <span class="cell-payment-label">
            {{ getPaymentLabel(props.row.paymentMethod) }}
          </span>
        </div>
      </template>

      <!-- Celda: fecha formateada -->
      <template #cell-createdAt="props">
        <span class="cell-date text-grey-6">
          {{ formatShortDate(props.row.createdAt) }}
        </span>
      </template>

      <!-- Celda: estado como badge -->
      <template #cell-status="props">
        <q-badge
          rounded
          :color="getStatusColor(props.row.status)"
          :label="getStatusLabel(props.row.status)"
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
            @click="openSaleDetail(props.row)"
          >
            <q-tooltip>Ver detalle</q-tooltip>
          </q-btn>
        </div>
      </template>
    </BaseTable>

    <!-- ── Formulario de nueva venta ── -->
    <FormSale
      v-model="saleDialog.isOpen"
      :loading="isSaving"
      @save="saveSale"
      @cancel="saleDialog.isOpen = false"
    />

    <!-- ── Diálogo de detalle de venta ── -->
    <DetalleVentaDialog
      v-model="detailDialog.isOpen"
      :venta="detailDialog.sale"
    />

  </q-page>
</template>


<script setup>
/**
 * Vista principal de Ventas.
 * Muestra estadísticas, highlights, tabla de ventas
 * y gestiona la creación y visualización de detalles.
 */

// ── Importaciones ─────────────────────────────────────────────────────────────
import { ref, computed }          from "vue";
import { useQuasar }              from "quasar";
import BaseTable                  from "../components/BaseTable.vue";
import FormSale                   from "../components/Form/FormSale.vue";
import DetalleVentaDialog         from "../components/Dialog/SaleDetailDialog.vue";
import { getData, postData }      from "../services/api_Clients.js";
import { Notifications }          from "../composables/Notifications.js";
import { useCurrency }            from "../composables/Mini-composables.js";
import { useDateFormatter }       from "../composables/Dates.js";
import { useAvatarHelper }        from "../composables/Avatar.js";

// ── Instancias de composables ─────────────────────────────────────────────────
const $q                              = useQuasar();
const { success, error }              = Notifications();
const { formatCurrency }              = useCurrency();
const { formatRelativeDate, formatShortDate }         = useDateFormatter();
const { getInitials, getAvatarStyle } = useAvatarHelper();

// ── Estado general ────────────────────────────────────────────────────────────

/** Lista principal de ventas cargadas desde la API */
const saleList  = ref([]);
const isLoading = ref(false);
const isSaving  = ref(false);

// ── Estado de diálogos ────────────────────────────────────────────────────────

/** Controla el formulario de creación de venta */
const saleDialog = ref({ isOpen: false });

/** Controla el diálogo de detalle de una venta seleccionada */
const detailDialog = ref({ isOpen: false, sale: null });

// ── Computed: referencias de tiempo ──────────────────────────────────────────

/**
 * Fecha actual como string comparable.
 * Se recalcula reactivamente para soportar sesiones largas sin recargar.
 */
const today        = computed(() => new Date().toDateString());
const currentMonth = computed(() => new Date().getMonth());

// ── Computed: estadísticas del dashboard ─────────────────────────────────────

/**
 * Calcula los indicadores clave a partir de la lista de ventas.
 * Excluye ventas canceladas de todos los conteos e ingresos.
 */
const saleStats = computed(() => {
  const activeSales    = saleList.value.filter((s) => s.status !== "cancelled");
  const salesToday     = activeSales.filter((s) => new Date(s.createdAt).toDateString() === today.value);
  const salesThisMonth = activeSales.filter((s) => new Date(s.createdAt).getMonth() === currentMonth.value);

  return {
    totalSales:    activeSales.length,
    salesToday:    salesToday.length,
    salesThisMonth: salesThisMonth.length,
    totalRevenue:  activeSales.reduce((acc, s) => acc + (s.total ?? 0), 0),
    revenueToday:  salesToday.reduce((acc, s) => acc + (s.total ?? 0), 0),
    highestSale:   activeSales.length ? Math.max(...activeSales.map((s) => s.total ?? 0)) : 0,
  };
});

/** Últimas 3 ventas ordenadas por fecha descendente */
const recentSales = computed(() =>
  [...saleList.value]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3)
);

/** Top 3 ventas del día ordenadas por monto descendente */
const topSalesToday = computed(() =>
  [...saleList.value]
    .filter((s) => new Date(s.createdAt).toDateString() === today.value && s.status !== "cancelled")
    .sort((a, b) => (b.total ?? 0) - (a.total ?? 0))
    .slice(0, 3)
);

// ── Helpers de presentación ───────────────────────────────────────────────────

/**
 * Mapas de íconos, colores y etiquetas para método de pago y estado.
 * Usar objetos como mapas evita cadenas de if/else (KISS + DRY).
 */
const PAYMENT_ICON  = { cash: "payments",      card: "credit_card", transfer: "account_balance" };
const PAYMENT_COLOR = { cash: "positive",      card: "primary",     transfer: "purple" };
const PAYMENT_LABEL = { cash: "Efectivo",      card: "Tarjeta",     transfer: "Transferencia" };
const STATUS_COLOR  = { paid: "positive",      pending: "warning",  cancelled: "negative" };
const STATUS_LABEL  = { paid: "Pagado",        pending: "Pendiente", cancelled: "Cancelado" };

function getPaymentIcon(method)  { return PAYMENT_ICON[method]  ?? "attach_money"; }
function getPaymentColor(method) { return PAYMENT_COLOR[method] ?? "grey"; }
function getPaymentLabel(method) { return PAYMENT_LABEL[method] ?? method ?? "—"; }
function getStatusColor(status)  { return STATUS_COLOR[status]  ?? "grey"; }
function getStatusLabel(status)  { return STATUS_LABEL[status]  ?? status ?? "—"; }

// ── Columnas de la tabla ──────────────────────────────────────────────────────

/**
 * Definición estática de columnas para BaseTable.
 * Se declara fuera del estado reactivo porque no cambia en tiempo de ejecución.
 */
const tableColumns = [
  { name: "createdAt",     align: "center", label: "Fecha",           field: "createdAt",     sortable: true  },
  { name: "products",      align: "center", label: "Productos",       field: "products",      sortable: false },
  { name: "total",         align: "center", label: "Total",           field: "total",         sortable: true  },
  { name: "paymentMethod", align: "center", label: "Método de pago",  field: "paymentMethod", sortable: false },
  { name: "option",        align: "center", label: "Opciones",        field: "option",        sortable: false },
];

// ── Carga de datos ────────────────────────────────────────────────────────────

/**
 * Obtiene la lista de ventas desde la API y la almacena en el estado.
 * Activa el indicador de carga durante la petición.
 */
async function fetchSales() {
  isLoading.value = true;
  try {
    const res = await getData("/sale/list");
    saleList.value = res.data;
    success("Ventas cargadas correctamente");
  } catch (fail) {
    error(fail);
  } finally {
    isLoading.value = false;
  }
}

// ── Acciones ──────────────────────────────────────────────────────────────────

/** Abre el formulario de creación de nueva venta */
function openCreateDialog() {
  saleDialog.value.isOpen = true;
}

/**
 * Abre el detalle de una venta consultando su información completa.
 * Normaliza la respuesta de la API antes de pasarla al diálogo,
 * adaptando la estructura anidada (customer, products) a la vista.
 *
 * @param {Object} sale - Venta seleccionada desde la tabla.
 */
async function openSaleDetail(sale) {
  try {
    const res = await getData(`sale/${sale._id}`);

    // Normalización: adapta la estructura anidada de la API al formato del diálogo
    detailDialog.value.sale = {
      ...res.data,
      clientName: res.data.customer?.name     || "Sin cliente",
      document:   res.data.customer?.document || "—",
      products:   res.data.products.map((p) => ({
        barcode:     p.product?.barcode || "—",
        productName: p.product?.name   || "Producto",
        quantity:    p.quantity,
        price:       p.unitPrice,
      })),
    };

    detailDialog.value.isOpen = true;
  } catch (fail) {
    error(fail);
  }
}

/**
 * Registra una nueva venta con el payload emitido por FormSale.
 * Recarga la lista tras una creación exitosa y cierra el diálogo.
 * El guard `isSaving` evita envíos dobles por clics repetidos.
 *
 * @param {Object} payload - Datos de la venta emitidos por el formulario.
 */
async function saveSale(payload) {
  if (isSaving.value) return;
  isSaving.value = true;
  try {
    await postData("/sale/register", payload);
    success("Venta registrada correctamente");
    await fetchSales();
    saleDialog.value.isOpen = false;
  } catch (fail) {
    error(fail);
  } finally {
    isSaving.value = false;
  }
}

// ── Inicialización ────────────────────────────────────────────────────────────

/** Carga inicial de ventas al montar la vista */
fetchSales();
</script>

<style scoped>
#ventas-page {
  background: linear-gradient(135deg, #e3f2fd, #ffffff);
  min-height: 100vh;
}

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

/* ─── Tarjetas ─── */
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

.summary-value--sm {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
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

/* ─── Avatares ─── */
.sale-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sale-avatar--sm {
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
  max-width: 500px;
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

.detalle-header__avatar {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
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

/* ─── Productos en detalle ─── */
.producto-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0.5rem 0;
  border-bottom: 0.5px solid rgba(25, 118, 210, 0.07);
}

.producto-item:last-child {
  border-bottom: none;
}

/* ─── Total final ─── */
.total-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.8rem;
  padding-top: 0.8rem;
  border-top: 1.5px solid rgba(25, 118, 210, 0.15);
}

.total-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #555;
}

.total-value {
  font-size: 1.3rem;
  font-weight: 700;
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