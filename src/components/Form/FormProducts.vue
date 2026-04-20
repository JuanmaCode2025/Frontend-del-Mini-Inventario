<template>
  <q-dialog
    :model-value="modelValue"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
    transition-show="jump-up"
    transition-hide="jump-down"
  >
    <q-card class="form-card">

      <!-- ── Encabezado ── -->
      <div class="form-header">
        <div class="header-glow" />

        <div class="row items-center q-gutter-md">
          <div class="header-icon-wrap">
            <q-icon :name="isEditing ? 'edit_note' : 'add_circle_outline'" size="22px" color="white" />
          </div>
          <div>
            <p class="header-title">{{ isEditing ? 'Editar producto' : 'Nuevo producto' }}</p>
            <p class="header-sub">
              {{ isEditing ? 'Modifica los campos necesarios' : 'Completa la información del producto' }}
            </p>
          </div>
        </div>

        <q-btn flat round dense icon="close" color="white" class="close-btn" @click="$emit('cancelar')" />
      </div>

      <!-- ── Cuerpo ── -->
      <q-form ref="formRef" class="form-body" greedy>

        <!-- Datos -->
        <div class="section-block">
          <div class="section-tag">
            <q-icon name="inventory_2" size="13px" />
            Datos del producto
          </div>

          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6">
              <q-input v-model="form.barcode" outlined dense label="Código de barras"
                :rules="[val => !!val || 'El código es obligatorio']" />
            </div>

            <div class="col-12 col-sm-6">
              <q-input v-model="form.category" outlined dense label="Categoría"
                :rules="[val => !!val || 'La categoría es obligatoria']" />
            </div>
          </div>

          <q-input v-model="form.name" outlined dense label="Nombre del producto"
            :rules="[val => !!val || 'El nombre es obligatorio']" />

          <q-input v-model="form.details" outlined dense label="Detalles del producto" type="textarea" autogrow />

          <q-input v-model="form.supplier" outlined dense label="Proveedor" />
        </div>

        <!-- Precios -->
        <div class="section-block">
          <div class="section-tag">
            <q-icon name="payments" size="13px" />
            Precios
          </div>

          <div class="row q-col-gutter-sm">
            <div :class="isEditing ? 'col-12 col-sm-6' : 'col-12'">
              <q-input v-model.number="form.price" type="number" label="Precio"
                :rules="[val => val > 0 || 'El precio debe ser mayor a 0']" />
            </div>

            <div v-if="isEditing" class="col-12 col-sm-6">
              <q-input v-model.number="form.recommendationPrice" label="Precio De Mercado" readonly />
            </div>
          </div>
        </div>

        <!-- Stock -->
        <div class="section-block">
          <div class="section-tag">
            <q-icon name="inventory" size="13px" />
            Inventario
          </div>

          <q-input v-model.number="form.stock" type="number" label="Stock"
            :rules="[val => val >= 0 || 'No puede ser negativo']" />
        </div>

        <!-- Acciones -->
        <div class="form-actions">
          <q-btn flat label="Cancelar" color="grey-6" @click="$emit('cancelar')" />

          <q-btn
            @click="handleSubmit"
            :label="isEditing ? 'Guardar cambios' : 'Crear producto'"
            color="primary"
            :loading="loading"
          />
        </div>

      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

// Props
const props = defineProps({
  modelValue: Boolean,
  product: { type: Object, default: () => ({}) },
  loading: Boolean
})

// Emits
const emit = defineEmits(['update:modelValue', 'guardar', 'cancelar'])

// Estado
const formRef = ref(null)

const form = ref({
  barcode: '',
  name: '',
  details: '',
  category: '',
  supplier: '',
  price: 0,
  recommendedPrice: 0,
  stock: 0
})

// Detectar edición
const isEditing = computed(() => !!props.product?._id)

// Cargar datos cuando se edita
watch(
  () => props.product,
  (p) => {
    form.value = {
      barcode: p?.barcode ?? '',
      name: p?.name ?? '',
      details: p?.details ?? '',
      category: p?.category ?? '',
      supplier: p?.supplier ?? '',
      price: p?.price ?? 0,
      recommendationPrice: p?.recommendedPrice ?? 0,
      stock: p?.stock ?? 0
    }
  },
  { immediate: true }
)

// Guardar
async function handleSubmit() {
  const valid = await formRef.value?.validate()
  if (!valid) return

  const { recommendationPrice, ...rest } = form.value

  const payload = {
    ...rest,
    barcode: String(rest.barcode).trim(),
    name: String(rest.name).trim(),
    category: String(rest.category).trim(),
    supplier: String(rest.supplier).trim(),
    price: Number(rest.price),
    stock: Number(rest.stock)
  }

  if (isEditing.value) {
    payload._id = props.product._id
  }

  emit('guardar', payload)
}
</script>


<style scoped>
/* ═══════════════════════════════════════════
   Variables locales
═══════════════════════════════════════════ */
.form-card {
  --c-primary:   #1565C0;
  --c-primary-l: #1976D2;
  --c-surface:   #ffffff;
  --c-bg:        #F7F9FC;
  --c-border:    rgba(21, 101, 192, 0.12);
  --c-text:      #1a2332;
  --c-muted:     #7a8a9a;
  --radius-card: 22px;
  --radius-in:   12px;
}

/* ═══════════════════════════════════════════
   Tarjeta
═══════════════════════════════════════════ */
.form-card {
  width: 100%;
  max-width: 540px;
  max-height: 92vh;
  border-radius: var(--radius-card) !important;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 24px 64px rgba(21, 101, 192, 0.18), 0 4px 16px rgba(0,0,0,0.08) !important;
}

/* ═══════════════════════════════════════════
   Encabezado
═══════════════════════════════════════════ */
.form-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, #0D47A1 0%, #1976D2 60%, #1E88E5 100%);
  overflow: hidden;
  flex-shrink: 0;
}

.header-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 80% 50%, rgba(255,255,255,0.12) 0%, transparent 65%);
  pointer-events: none;
}

.header-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255,255,255,0.18);
  border: 1px solid rgba(255,255,255,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-title {
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
  letter-spacing: -0.01em;
}

.header-sub {
  font-size: 0.72rem;
  color: rgba(255,255,255,0.7);
  margin: 2px 0 0;
}

.close-btn {
  opacity: 0.8;
  transition: opacity 0.2s;
}
.close-btn:hover { opacity: 1; }

/* ═══════════════════════════════════════════
   Cuerpo con scroll
═══════════════════════════════════════════ */
.form-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: var(--c-bg);
}

.form-body::-webkit-scrollbar        { width: 4px; }
.form-body::-webkit-scrollbar-track  { background: transparent; }
.form-body::-webkit-scrollbar-thumb  { background: rgba(21,101,192,0.2); border-radius: 4px; }

/* ═══════════════════════════════════════════
   Bloques de sección
═══════════════════════════════════════════ */
.section-block {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-in);
  padding: 1rem 1.1rem 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.section-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--c-primary);
  background: rgba(21,101,192,0.07);
  border: 1px solid rgba(21,101,192,0.14);
  border-radius: 6px;
  padding: 3px 9px;
  width: fit-content;
  margin-bottom: 2px;
}

/* ═══════════════════════════════════════════
   Inputs
═══════════════════════════════════════════ */
.input-styled :deep(.q-field__control) {
  border-radius: 10px !important;
  background: #F4F7FD !important;
  transition: box-shadow 0.2s, border-color 0.2s;
}

.input-styled :deep(.q-field--focused .q-field__control) {
  box-shadow: 0 0 0 3px rgba(21,101,192,0.12) !important;
}

.input-readonly :deep(.q-field__control) {
  background: #ECEEF2 !important;
  cursor: default;
}

.input-readonly :deep(.q-field__native) {
  color: var(--c-muted) !important;
}

.currency-tag {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--c-primary);
  background: rgba(21,101,192,0.09);
  padding: 2px 6px;
  border-radius: 5px;
  letter-spacing: 0.04em;
}

.currency-tag.muted {
  color: var(--c-muted);
  background: rgba(0,0,0,0.05);
}

/* ═══════════════════════════════════════════
   Vista previa de precios
═══════════════════════════════════════════ */
.price-preview {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, #EEF4FF, #F0F7FF);
  border: 1px solid rgba(21,101,192,0.13);
  border-radius: 10px;
  padding: 0.65rem 1rem;
  flex-wrap: wrap;
}

.price-preview__item {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.price-preview__lbl {
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--c-muted);
  font-weight: 600;
}

.price-preview__val {
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.price-preview__val.primary  { color: var(--c-primary); }
.price-preview__val.muted    { color: var(--c-muted); }
.price-preview__val.positive { color: #2e7d32; }
.price-preview__val.negative { color: #c62828; }

.price-divider {
  width: 1px;
  height: 28px;
  background: rgba(21,101,192,0.15);
  flex-shrink: 0;
}

/* ═══════════════════════════════════════════
   Barra de stock
═══════════════════════════════════════════ */
.stock-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.stock-bar__track {
  flex: 1;
  height: 6px;
  background: #E5EAF2;
  border-radius: 99px;
  overflow: hidden;
}

.stock-bar__fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.5s cubic-bezier(.4,0,.2,1), background 0.4s;
}

.stock-bar__label {
  font-size: 0.7rem;
  color: var(--c-muted);
  white-space: nowrap;
  min-width: 72px;
  text-align: right;
}

.stock-badge {
  font-size: 0.62rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.04em;
}

/* ═══════════════════════════════════════════
   Botones
═══════════════════════════════════════════ */
.form-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
  padding-top: 0.25rem;
  flex-shrink: 0;
}

.btn-cancel {
  font-size: 0.82rem;
  font-weight: 600;
  border-radius: 10px !important;
}

.btn-submit {
  border-radius: 10px !important;
  font-weight: 700 !important;
  font-size: 0.82rem !important;
  padding: 0 1.3rem !important;
  height: 38px;
  background: linear-gradient(135deg, #1565C0, #1976D2) !important;
  box-shadow: 0 4px 14px rgba(21,101,192,0.35) !important;
  transition: box-shadow 0.2s, transform 0.15s !important;
}

.btn-submit:hover {
  box-shadow: 0 6px 20px rgba(21,101,192,0.45) !important;
  transform: translateY(-1px);
}

.btn-submit:active { transform: translateY(0); }

/* ═══════════════════════════════════════════
   Transición vista previa
═══════════════════════════════════════════ */
.slide-fade-enter-active { transition: all 0.25s cubic-bezier(.4,0,.2,1); }
.slide-fade-leave-active { transition: all 0.18s ease; }
.slide-fade-enter-from   { opacity: 0; transform: translateY(-6px); }
.slide-fade-leave-to     { opacity: 0; transform: translateY(-4px); }

/* ═══════════════════════════════════════════
   Responsive
═══════════════════════════════════════════ */
@media (max-width: 600px) {
  .form-card    { max-width: 98vw; border-radius: 16px !important; }
  .form-body    { padding: 1rem; }
  .form-header  { padding: 1rem 1.1rem; }
  .section-block { padding: 0.85rem 0.9rem 1rem; }
  .btn-submit   { flex: 1; }
  .btn-cancel   { flex: 0 0 auto; }
}
</style>