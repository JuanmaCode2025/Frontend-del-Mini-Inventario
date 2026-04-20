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
            <q-icon name="add_shopping_cart" size="24px" color="white" />
          </q-avatar>
          <div>
            <p class="formulario-title">Nueva venta</p>
            <p class="formulario-subtitle">Registra productos y cliente</p>
          </div>
        </div>
        <q-btn
          flat
          round
          dense
          icon="close"
          color="white"
          @click="$emit('update:modelValue', false)"
        />
      </div>

      <!-- ── Cuerpo — NO usa q-form para evitar re-renders ── -->
      <div class="formulario-body">
        <!-- ══════ SECCIÓN: CLIENTE ══════ -->
        <div class="seccion-label">
          <q-icon name="person" size="15px" color="primary" />
          <span>Cliente</span>
        </div>

        <q-input
          v-model="form.document"
          outlined
          dense
          rounded
          label="Cédula / NIT del cliente *"
          :loading="buscandoCliente"
          @update:model-value="onDocumentoChange"
        >
          <template #prepend>
            <q-icon name="badge" color="primary" />
          </template>
          <template #append>
            <q-icon
              v-if="estadoCliente === 'found'"
              name="check_circle"
              color="positive"
              size="18px"
            />
            <q-icon
              v-else-if="estadoCliente === 'not_found'"
              name="cancel"
              color="negative"
              size="18px"
            />
          </template>
        </q-input>

        <!-- Card cliente — usa v-show para NO desmontar el DOM debajo -->
        <div v-show="!!clienteData" class="cliente-card">
          <div
            class="cliente-card__avatar"
            :style="getAvatarStyle(clienteData?.name ?? '')"
          >
            {{ getInitials(clienteData?.name ?? "") }}
          </div>
          <div class="cliente-card__info">
            <p class="cliente-card__nombre">
              {{ clienteData?.name }} {{ clienteData?.lastname }}
            </p>
            <p class="cliente-card__doc">
              {{ clienteData?.email ?? "Sin correo" }}
            </p>
          </div>
          <q-badge rounded color="positive" label="Verificado" />
        </div>

        <!-- Error cliente — v-show también -->
        <div v-show="estadoCliente === 'not_found'" class="alerta-warning">
          <q-icon name="warning_amber" color="warning" size="15px" />
          <span>Cliente no encontrado. Verifica el documento.</span>
        </div>

        <q-separator />

        <!-- ══════ SECCIÓN: PRODUCTOS ══════ -->
        <div class="seccion-label">
          <q-icon name="inventory_2" size="15px" color="primary" />
          <span>Productos</span>
          <q-badge
            v-if="form.products.length > 0"
            color="blue-2"
            text-color="blue-9"
            :label="`${form.products.length} agregado${
              form.products.length > 1 ? 's' : ''
            }`"
            rounded
            class="q-ml-xs"
          />
        </div>

        <!-- Buscador -->
        <q-input
          ref="refBuscador"
          v-model="busquedaProducto"
          outlined
          dense
          rounded
          label="Buscar por código de barras o nombre..."
          clearable
          :loading="buscandoProducto"
          @update:model-value="onBusquedaChange"
          @keyup.enter="agregarPrimerResultado"
          @clear="limpiarBusqueda"
        >
          <template #prepend>
            <q-icon name="qr_code_scanner" color="primary" />
          </template>
        </q-input>

        <!-- Resultados búsqueda -->
        <div v-show="resultadosBusqueda.length > 0" class="resultados-lista">
          <div
            v-for="producto in resultadosBusqueda"
            :key="producto.barcode"
            class="resultado-item"
            @click="agregarProducto(producto)"
          >
            <div class="resultado-icon">
              <q-icon name="inventory_2" size="15px" color="primary" />
            </div>
            <div class="resultado-info">
              <p class="resultado-nombre">{{ producto.name }}</p>
              <p class="resultado-meta">
                <span
                  ><q-icon name="qr_code" size="10px" />
                  {{ producto.barcode }}</span
                >
                <span :class="producto.stock > 5 ? 'stock-ok' : 'stock-low'">
                  <q-icon name="layers" size="10px" /> {{ producto.stock }} en
                  stock
                </span>
              </p>
            </div>
            <div class="resultado-derecha">
              <span class="resultado-precio text-primary">{{
                formatCurrency(producto.price)
              }}</span>
              <q-btn
                flat
                round
                dense
                icon="add_circle"
                color="primary"
                size="xs"
                @click.stop="agregarProducto(producto)"
              />
            </div>
          </div>
        </div>

        <!-- Sin resultados -->
        <div
          v-show="
            busquedaProducto.length >= 2 &&
            resultadosBusqueda.length === 0 &&
            !buscandoProducto
          "
          class="sin-resultados"
        >
          <q-icon name="search_off" size="16px" color="grey-4" />
          <span>Sin resultados para "{{ busquedaProducto }}"</span>
        </div>

        <!-- ══════ TABLA DEL CARRITO — SIEMPRE VISIBLE ══════ -->
        <div class="carrito-tabla">
          <!-- Cabecera siempre visible -->
          <div class="carrito-thead">
            <span class="th-producto">Producto</span>
            <span class="th-precio">Precio</span>
            <span class="th-cantidad">Cant.</span>
            <span class="th-subtotal">Subtotal</span>
            <span></span>
          </div>

          <!-- Estado vacío dentro de la tabla -->
          <div v-if="form.products.length === 0" class="carrito-empty-row">
            <q-icon name="shopping_cart_checkout" size="26px" color="grey-4" />
            <span>Busca y agrega productos</span>
            <span style="font-size: 0.68rem; color: #bdbdbd">
              Presiona Enter para agregar el primer resultado
            </span>
          </div>

          <!-- Filas de productos -->
          <div
            v-for="(item, i) in form.products"
            :key="item.barcode"
            class="carrito-fila"
          >
            <!-- Producto -->
            <div class="td-producto">
              <div class="prod-icon">
                <q-icon name="inventory_2" size="13px" color="primary" />
              </div>
              <div class="prod-texto">
                <p class="prod-nombre">{{ item.productName }}</p>
                <p class="prod-barcode">{{ item.barcode }}</p>
              </div>
            </div>

            <!-- Precio unitario -->
            <div class="td-precio text-grey-6">
              {{ formatCurrency(item.price) }}
            </div>

            <!-- Control de cantidad -->
            <div class="td-cantidad">
              <div class="qty-control">
                <q-btn
                  flat
                  round
                  dense
                  icon="remove"
                  size="xs"
                  color="primary"
                  @click="cambiarCantidad(i, -1)"
                />
                <input
                  class="qty-input"
                  type="number"
                  :value="item.quantity"
                  min="1"
                  @change="setCantidad(i, $event.target.value)"
                />
                <q-btn
                  flat
                  round
                  dense
                  icon="add"
                  size="xs"
                  color="primary"
                  @click="cambiarCantidad(i, 1)"
                />
              </div>
            </div>

            <!-- Subtotal -->
            <div class="td-subtotal text-primary text-weight-bold">
              {{ formatCurrency(item.price * item.quantity) }}
            </div>

            <!-- Quitar -->
            <div class="td-accion">
              <q-btn
                flat
                round
                dense
                icon="delete_outline"
                color="negative"
                size="sm"
                @click="quitarProducto(i)"
              >
                <q-tooltip>Quitar</q-tooltip>
              </q-btn>
            </div>
          </div>

          <!-- Total — siempre visible -->
          <div class="carrito-total-row">
            <span class="text-grey-5" style="font-size: 0.72rem">
              {{
                form.products.length > 0
                  ? `${form.products.length} producto${
                      form.products.length > 1 ? "s" : ""
                    }`
                  : "Sin productos"
              }}
            </span>
            <div class="row items-baseline q-gutter-xs">
              <span class="text-grey-5" style="font-size: 0.7rem">Total</span>
              <span class="carrito-total-valor text-primary">
                {{ formatCurrency(totalVenta) }}
              </span>
            </div>
          </div>
        </div>

        <q-separator />

        <!-- ══════ MÉTODO DE PAGO ══════ -->
        <div class="seccion-label">
          <q-icon name="payments" size="15px" color="primary" />
          <span>Método de pago</span>
        </div>

        <div class="metodos-pago">
          <div
            v-for="metodo in metodosPago"
            :key="metodo.value"
            class="metodo-item"
            :class="{
              'metodo-item--active': form.paymentMethod === metodo.value,
            }"
            @click="form.paymentMethod = metodo.value"
          >
            <q-icon :name="metodo.icon" size="20px" />
            <span>{{ metodo.label }}</span>
            <div
              v-if="form.paymentMethod === metodo.value"
              class="metodo-check"
            >
              <q-icon name="check" size="11px" color="white" />
            </div>
          </div>
        </div>

        <!-- ══════ BOTONES ══════ -->
        <div class="formulario-actions">
          <q-btn
            flat
            label="Cancelar"
            color="grey-6"
            rounded
            @click="$emit('update:modelValue', false)"
          />
          <q-btn
            :label="
              form.paymentMethod === 'cash' ? 'Ir a caja' : 'Registrar venta'
            "
            color="primary"
            rounded
            :loading="loading"
            :disable="!puedeGuardar"
            :icon-right="
              form.paymentMethod === 'cash' ? 'point_of_sale' : 'check_circle'
            "
            @click="mostrarResumen = true"
          />
        </div>

        <q-dialog v-model="mostrarResumen">
          <q-card style="min-width: 320px; border-radius: 16px">
            <!-- Header -->
            <div class="q-pa-md bg-primary text-white">
              <div class="text-h6">Confirmar venta</div>
              <div style="font-size: 0.75rem; opacity: 0.8">
                Revisa antes de continuar
              </div>
            </div>

            <!-- Contenido -->
            <div class="q-pa-md">
              <div class="q-mb-sm">
                <strong>Cliente:</strong><br />
                {{ clienteData?.name }} {{ clienteData?.lastname }}
              </div>

              <div class="q-mb-sm">
                <strong>Productos:</strong> {{ form.products.length }}
              </div>

              <div class="q-mb-sm">
                <strong>Método:</strong> {{ labelPago(form.paymentMethod) }}
              </div>

              <div class="q-mt-md text-right">
                <span class="text-grey">Total</span><br />
                <span class="text-primary text-h6">
                  {{ formatCurrency(totalVenta) }}
                </span>
              </div>
            </div>

            <!-- Botones -->
            <q-card-actions align="right">
              <q-btn flat label="Cancelar" v-close-popup />
              <q-btn
                color="primary"
                label="Confirmar"
                @click="confirmarVenta"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </div>
    </q-card>
  </q-dialog>
</template>


<script setup>
// ─────────────────────────────────────────────
// Importaciones
// ─────────────────────────────────────────────
import { ref, computed, watch, nextTick } from "vue";
import { getData } from "../../services/api_Clients.js";
import { useCurrency } from "../../composables/Mini-composables.js";
import { useAvatarHelper } from "../../composables/Avatar.js";

const { formatCurrency } = useCurrency();
const { getInitials, getAvatarStyle } = useAvatarHelper();
const mostrarResumen = ref(false);

function confirmarVenta() {
  mostrarResumen.value = false;
  handleSubmit();
}

// ─────────────────────────────────────────────
// Props y emits
// ─────────────────────────────────────────────
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue', 'save'])

// ─────────────────────────────────────────────
// Estado del formulario
// ─────────────────────────────────────────────
const form = ref({
  document: "",
  paymentMethod: "cash",
  products: [],
});

const refBuscador = ref(null);

// ─────────────────────────────────────────────
// Estado del cliente
// ─────────────────────────────────────────────
const clienteData = ref(null);
const buscandoCliente = ref(false);
const estadoCliente = ref("idle");
let timerCliente = null;

// ─────────────────────────────────────────────
// Estado de productos
// ─────────────────────────────────────────────
const busquedaProducto = ref("");
const resultadosBusqueda = ref([]);
const todosLosProductos = ref([]);
const buscandoProducto = ref(false);
let timerProducto = null;

// ─────────────────────────────────────────────
// Métodos de pago
// ─────────────────────────────────────────────
const metodosPago = [
  { value: "cash", label: "Efectivo", icon: "payments" },
  { value: "card", label: "Tarjeta", icon: "credit_card" },
  { value: "transfer", label: "Transferencia", icon: "account_balance" },
];

// ─────────────────────────────────────────────
// Computed
// ─────────────────────────────────────────────
const totalVenta = computed(() =>
  form.value.products.reduce((acc, p) => acc + (p.price ?? 0) * p.quantity, 0)
);

const puedeGuardar = computed(
  () => estadoCliente.value === "found" && form.value.products.length > 0
);

// ─────────────────────────────────────────────
// Watchers
// ─────────────────────────────────────────────
watch(
  () => props.modelValue,
  (open) => {
    if (open) cargarProductos();
    else resetFormulario();
  }
);

// ─────────────────────────────────────────────
// Cliente — debounce 600ms
// GET /customer/:document
// ─────────────────────────────────────────────
function onDocumentoChange(val) {
  // NO limpiamos clienteData aquí para no desmontar la tabla
  estadoCliente.value = "idle";
  clearTimeout(timerCliente);

  if (!val || val.length < 5) {
    clienteData.value = null;
    estadoCliente.value = "idle";
    buscandoCliente.value = false;
    return;
  }

  buscandoCliente.value = true;
  timerCliente = setTimeout(buscarCliente, 600);
}

async function buscarCliente() {
  try {
    const res = await getData(`/customer/${form.value.document}`);
    clienteData.value = res.data ?? res;
    estadoCliente.value = "found";
  } catch {
    clienteData.value = null;
    estadoCliente.value = "not_found";
  } finally {
    buscandoCliente.value = false;
  }
}

// ─────────────────────────────────────────────
// Productos
// GET /product/list
// ─────────────────────────────────────────────
async function cargarProductos() {
  try {
    const res = await getData("/product/list");
    todosLosProductos.value = res.listProducts ?? res.products ?? [];
  } catch {
    todosLosProductos.value = [];
  }
}

function onBusquedaChange(val) {
  clearTimeout(timerProducto);
  resultadosBusqueda.value = [];
  if (!val || val.length < 2) return;
  buscandoProducto.value = true;
  timerProducto = setTimeout(() => filtrarProductos(val), 300);
}

function filtrarProductos(query) {
  const q = query.toLowerCase().trim();
  resultadosBusqueda.value = todosLosProductos.value
    .filter((p) => {
      const barcode = String(p.barcode ?? "").toLowerCase();
      const nombre = String(p.name ?? "").toLowerCase();
      const yaEnCarrito = form.value.products.find(
        (x) => String(x.barcode) === String(p.barcode)
      );
      return (barcode.includes(q) || nombre.includes(q)) && !yaEnCarrito;
    })
    .slice(0, 6);
  buscandoProducto.value = false;
}

function limpiarBusqueda() {
  resultadosBusqueda.value = [];
  busquedaProducto.value = "";
}

function agregarPrimerResultado() {
  if (resultadosBusqueda.value.length > 0)
    agregarProducto(resultadosBusqueda.value[0]);
}

async function enfocarBuscador() {
  limpiarBusqueda();
  await nextTick();
  refBuscador.value?.focus();
}

// ─────────────────────────────────────────────
// Carrito
// ─────────────────────────────────────────────
function agregarProducto(producto) {
  const barcodeStr = String(producto.barcode);
  const existente = form.value.products.find((p) => p.barcode === barcodeStr);

  if (existente) {
    existente.quantity++;
  } else {
    form.value.products.push({
      barcode: barcodeStr,
      productName: producto.name,
      price: producto.price ?? 0,
      quantity: 1,
    });
  }
  limpiarBusqueda();
}

function cambiarCantidad(index, delta) {
  const item = form.value.products[index];
  const nueva = item.quantity + delta;
  if (nueva < 1) return;
  item.quantity = nueva;
}

function setCantidad(index, valor) {
  const cantidad = parseInt(valor, 10);
  form.value.products[index].quantity =
    isNaN(cantidad) || cantidad < 1 ? 1 : cantidad;
}

function quitarProducto(index) {
  form.value.products.splice(index, 1);
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function labelPago(method) {
  const map = { cash: "Efectivo", card: "Tarjeta", transfer: "Transferencia" };
  return map[method] ?? method;
}

// ─────────────────────────────────────────────
// Reset
// ─────────────────────────────────────────────
function resetFormulario() {
  form.value = { document: "", paymentMethod: "cash", products: [] };
  clienteData.value = null;
  estadoCliente.value = "idle";
  limpiarBusqueda();
}

// ─────────────────────────────────────────────
// Submit
// ─────────────────────────────────────────────
function handleSubmit() {
  emit("save", {
    document: form.value.document,
    paymentMethod: form.value.paymentMethod,
    products: form.value.products.map((p) => ({
      barcode: p.barcode,
      quantity: p.quantity,
    })),
  });
   emit("update:modelValue", false); // 👈 cierra el modal
}

// ─────────────────────────────────────────────
// Inicio
// ─────────────────────────────────────────────
cargarProductos();
</script>


<style scoped>
.formulario-card {
  width: 100%;
  max-width: 580px;
  border-radius: 20px;
  overflow: hidden;
  max-height: 94vh;
  display: flex;
  flex-direction: column;
}

.formulario-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.1rem 1.4rem;
  background: linear-gradient(90deg, #0d47a1, #1976d2);
  flex-shrink: 0;
}

.header-avatar {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
}
.formulario-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: white;
  margin: 0;
}
.formulario-subtitle {
  font-size: 0.73rem;
  color: rgba(255, 255, 255, 0.72);
  margin: 2px 0 0;
}

.formulario-body {
  padding: 1.2rem 1.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  overflow-y: auto;
  flex: 1;
}

.seccion-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.64rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: #1976d2;
}

/* ─── Cliente ─── */
.cliente-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0.7rem 0.9rem;
  background: #f0f7ff;
  border: 0.5px solid rgba(25, 118, 210, 0.2);
  border-radius: 12px;
}

.cliente-card__avatar {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.78rem;
  flex-shrink: 0;
}

.cliente-card__info {
  flex: 1;
}
.cliente-card__nombre {
  font-size: 0.88rem;
  font-weight: 600;
  margin: 0;
  color: #1a1a2e;
}
.cliente-card__doc {
  font-size: 0.7rem;
  margin: 1px 0 0;
  color: #90a4ae;
}

.alerta-warning {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0.55rem 0.85rem;
  background: #fff8e1;
  border: 0.5px solid rgba(245, 124, 0, 0.25);
  border-radius: 10px;
  font-size: 0.76rem;
  color: #f57c00;
}

/* ─── Resultados ─── */
.resultados-lista {
  border: 1px solid rgba(25, 118, 210, 0.14);
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 4px 14px rgba(25, 118, 210, 0.07);
}

.resultado-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0.6rem 0.85rem;
  cursor: pointer;
  border-bottom: 0.5px solid rgba(25, 118, 210, 0.06);
  transition: background 0.15s;
}

.resultado-item:last-child {
  border-bottom: none;
}
.resultado-item:hover {
  background: #f0f7ff;
}

.resultado-icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: #e3f2fd;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.resultado-info {
  flex: 1;
  min-width: 0;
}
.resultado-nombre {
  font-size: 0.83rem;
  font-weight: 500;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.resultado-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.65rem;
  color: #90a4ae;
  margin: 1px 0 0;
}

.stock-ok {
  color: #2e7d32;
  font-weight: 600;
}
.stock-low {
  color: #f57c00;
  font-weight: 600;
}

.resultado-derecha {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  flex-shrink: 0;
}

.resultado-precio {
  font-size: 0.85rem;
  font-weight: 700;
}

.sin-resultados {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0.55rem 0.85rem;
  background: #fafafa;
  border-radius: 10px;
  font-size: 0.76rem;
  color: #90a4ae;
}

/* ─── TABLA CARRITO — SIEMPRE VISIBLE ─── */
.carrito-tabla {
  border: 1px solid rgba(25, 118, 210, 0.15);
  border-radius: 14px;
  overflow: hidden;
  background: white;
}

.carrito-thead {
  display: grid;
  grid-template-columns: 2fr 1fr 1.2fr 1fr 36px;
  padding: 0.5rem 0.9rem;
  background: #f0f7ff;
  border-bottom: 1px solid rgba(25, 118, 210, 0.1);
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #90a4ae;
  align-items: center;
}

.th-precio,
.th-subtotal {
  text-align: right;
}
.th-cantidad {
  text-align: center;
}

/* Estado vacío DENTRO de la tabla */
.carrito-empty-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.4rem;
  gap: 4px;
  color: #90a4ae;
  font-size: 0.78rem;
  text-align: center;
}

.carrito-fila {
  display: grid;
  grid-template-columns: 2fr 1fr 1.2fr 1fr 36px;
  padding: 0.6rem 0.9rem;
  border-bottom: 0.5px solid rgba(25, 118, 210, 0.07);
  align-items: center;
  transition: background 0.15s;
}

.carrito-fila:last-of-type {
  border-bottom: none;
}
.carrito-fila:hover {
  background: #f7fbff;
}

.td-producto {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.prod-icon {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  background: #e3f2fd;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.prod-texto {
  min-width: 0;
}
.prod-nombre {
  font-size: 0.8rem;
  font-weight: 500;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.prod-barcode {
  font-size: 0.62rem;
  color: #90a4ae;
  margin: 0;
}

.td-precio {
  font-size: 0.8rem;
  text-align: right;
  padding-right: 8px;
}
.td-cantidad {
  display: flex;
  justify-content: center;
}

.qty-control {
  display: flex;
  align-items: center;
  gap: 2px;
  background: #f0f7ff;
  border-radius: 8px;
  padding: 2px 3px;
  border: 1px solid rgba(25, 118, 210, 0.15);
}

.qty-input {
  width: 34px;
  text-align: center;
  font-size: 0.82rem;
  font-weight: 600;
  color: #1565c0;
  border: none;
  background: transparent;
  outline: none;
  -moz-appearance: textfield;
}

.qty-input::-webkit-inner-spin-button,
.qty-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
}

.td-subtotal {
  font-size: 0.85rem;
  text-align: right;
  padding-right: 4px;
}
.td-accion {
  display: flex;
  justify-content: center;
}

.carrito-total-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.7rem 0.9rem;
  background: #f0f7ff;
  border-top: 1.5px solid rgba(25, 118, 210, 0.15);
}

.carrito-total-valor {
  font-size: 1.2rem;
  font-weight: 700;
}

/* ─── Botón agregar otro ─── */
.agregar-btn {
  border: 1.5px dashed rgba(25, 118, 210, 0.3) !important;
  border-radius: 10px !important;
  background: #f8fbff !important;
  font-size: 0.8rem !important;
  color: #1976d2 !important;
  transition: all 0.2s ease !important;
}

.agregar-btn:hover {
  background: #e3f2fd !important;
  border-color: #1976d2 !important;
}

/* ─── Métodos de pago ─── */
.metodos-pago {
  display: flex;
  gap: 8px;
}

.metodo-item {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 6px;
  border-radius: 12px;
  border: 1.5px solid rgba(25, 118, 210, 0.15);
  cursor: pointer;
  font-size: 0.73rem;
  color: #90a4ae;
  transition: all 0.2s ease;
  background: #f8fbff;
}

.metodo-item:hover {
  border-color: #1976d2;
  color: #1565c0;
  background: #e3f2fd;
}
.metodo-item--active {
  border-color: #1976d2;
  background: #e3f2fd;
  color: #1565c0;
  font-weight: 600;
}

.metodo-check {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #1976d2;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ─── Resumen final ─── */
.resumen-final {
  background: #f0f7ff;
  border: 1px solid rgba(25, 118, 210, 0.14);
  border-radius: 12px;
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.42rem;
}

.resumen-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.resumen-row--total {
  border-top: 1px solid rgba(25, 118, 210, 0.14);
  padding-top: 0.42rem;
  margin-top: 0.1rem;
}
.resumen-label {
  font-size: 0.73rem;
  color: #90a4ae;
}
.resumen-valor {
  font-size: 0.8rem;
  font-weight: 500;
  color: #1a1a2e;
}
.resumen-total {
  font-size: 1.15rem;
  font-weight: 700;
}

/* ─── Botones ─── */
.formulario-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding-top: 0.3rem;
  flex-shrink: 0;
}

/* ─── Responsive ─── */
@media (max-width: 600px) {
  .formulario-card {
    max-width: 95vw;
  }
  .formulario-body {
    padding: 1rem;
  }
  .metodos-pago {
    flex-direction: column;
  }
  .carrito-thead {
    display: none;
  }
  .carrito-fila {
    grid-template-columns: 1.5fr 1fr 1.1fr 36px;
  }
  .td-precio {
    display: none;
  }
}
</style>