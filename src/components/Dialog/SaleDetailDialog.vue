<template>
  <q-dialog v-model="isOpen">
    <q-card class="detalle-card">

      <!-- HEADER -->
      <div class="detalle-header">
        <div class="row items-center q-gutter-md">
          <q-avatar size="42px" class="header-avatar">
            <q-icon name="receipt_long" size="22px" color="white" />
          </q-avatar>

          <div>
            <p class="header-title">Detalle de venta</p>
            <p class="header-subtitle">
              {{ formatShortDate(venta?.createdAt) }}
            </p>
          </div>
        </div>

        <q-btn flat round dense icon="close" color="white" @click="cerrar" />
      </div>

      <!-- CONTENIDO -->
      <q-card-section class="content">
        <p class="section-title">Datos del Cliente</p>

        <!-- INFO GENERAL -->
        <div class="info-grid">
          

          <div class="info-card">
            <q-icon name="person" />
            <div>
              <span class="label">Cliente</span>
              <span class="value">{{ venta?.clientName || "Sin cliente" }}</span>
            </div>
          </div>

          <div class="info-card">
            <q-icon name="badge" />
            <div>
              <span class="label">Documento</span>
              <span class="value">{{ venta?.document || "—" }}</span>
            </div>
          </div>

          <div class="info-card">
            <q-icon :name="iconoPago(venta?.paymentMethod)" />
            <div>
              <span class="label">Pago</span>
              <span class="value">
                {{ labelPago(venta?.paymentMethod) }}
              </span>
            </div>
          </div>



        </div>

        <!-- PRODUCTOS -->
        <div class="section">
          <p class="section-title">Productos</p>

          <div
            v-for="item in venta?.products || []"
            :key="item.barcode"
            class="producto-card"
          >
            <div class="producto-left">
              <q-icon name="inventory_2" />

              <div>
                <p class="producto-nombre">
                  {{ item.productName || "Producto" }}
                </p>
                <p class="producto-codigo">
                  Código: {{ item.barcode }}
                </p>
              </div>
            </div>

            <div class="producto-right">
              <span class="cantidad">x{{ item.quantity }}</span>
              <span class="precio">
                {{ formatCurrency((item.price || 0) * item.quantity) }}
              </span>
            </div>
          </div>
        </div>

        <!-- TOTAL -->
        <div class="total-card">
          <span>Total</span>
          <span>{{ formatCurrency(venta?.total) }}</span>
        </div>

      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from "vue";
import {useCurrency } from "../../composables/Mini-composables.js"
import { useDateFormatter } from "../../composables/Dates.js"


const { formatCurrency } = useCurrency();
const { formatShortDate } =  useDateFormatter()

/* ───────── Props ───────── */
const props = defineProps({
  modelValue: { type: Boolean, required: true },
  venta: { type: Object, default: null }
});

/* ───────── Emits ───────── */
const emit = defineEmits(["update:modelValue"]);

/* ───────── v-model interno ───────── */
const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
});


function iconoPago(metodo) {
  return {
    cash: "payments",
    card: "credit_card",
    transfer: "account_balance"
  }[metodo] || "help";
}

function labelPago(metodo) {
  return {
    cash: "Efectivo",
    card: "Tarjeta",
    transfer: "Transferencia"
  }[metodo] || "Desconocido";
}

function colorEstado(estado) {
  return {
    completed: "positive",
    pending: "warning",
    cancelled: "negative"
  }[estado] || "grey";
}

function labelEstado(estado) {
  return {
    completed: "Completada",
    pending: "Pendiente",
    cancelled: "Cancelada"
  }[estado] || "—";
}

/* ───────── Métodos ───────── */
function cerrar() {
  isOpen.value = false;
}
</script>

<style scoped>
.detalle-card {
  width: 100%;
  max-width: 520px;
  border-radius: 22px;
  overflow: hidden;
}

/* HEADER */
.detalle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.3rem 1.6rem;
  background: linear-gradient(135deg, #1565c0, #42a5f5);
}

.header-avatar {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
}

.header-title {
  font-weight: 700;
  font-size: 1.1rem;
  color: white;
  margin: 0;
}

.header-subtitle {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.75);
}

/* CONTENT */
.content {
  padding: 1.4rem;
}

/* INFO GRID */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.info-card {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 0.8rem;
  border-radius: 12px;
  background: #f5f9ff;
  border: 1px solid rgba(21, 101, 192, 0.1);
}

.label {
  font-size: 0.65rem;
  color: #90a4ae;
  text-transform: uppercase;
}

.value {
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
}

/* SECTION */
.section {
  margin-top: 1.2rem;
}

.section-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: #1565c0;
  margin-bottom: 0.5rem;
}

/* PRODUCTOS */
.producto-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.7rem 0;
  border-bottom: 1px solid #eee;
}

.producto-left {
  display: flex;
  gap: 10px;
  align-items: center;
}

.producto-nombre {
  font-weight: 600;
  margin: 0;
}

.producto-codigo {
  font-size: 0.7rem;
  color: #888;
}

.producto-right {
  text-align: right;
}

.cantidad {
  font-size: 0.8rem;
  color: #777;
  display: block;
}

.precio {
  font-weight: 700;
  color: #1565c0;
}

/* TOTAL */
.total-card {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 14px;
  background: #e3f2fd;
  display: flex;
  justify-content: space-between;
  font-size: 1.1rem;
  font-weight: 700;
}
</style>