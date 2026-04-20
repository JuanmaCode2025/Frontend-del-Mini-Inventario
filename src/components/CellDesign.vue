<template>

  <!-- ===================================================== -->
  <!-- 🟢 STOCK -->
  <!-- ===================================================== -->
  <div
    v-if="type === 'stock'"
    class="stock-cell row items-center justify-center q-gutter-xs"
  >
    <!-- Icono dinámico según cantidad -->
    <q-icon
      :name="getStockIcon(value)"
      :color="getStockColor(value)"
      size="18px"
      class="stock-icon"
    />
    <!-- Valor -->
    <span
      class="text-weight-bold stock-value"
      :class="`text-${getStockColor(value)}`"
    >
      {{ value }}
    </span>
  </div>

  <!-- ===================================================== -->
  <!-- 🟢 ESTADO -->
  <!-- ===================================================== -->
  <div v-else-if="type === 'estado'" class="estado-cell flex justify-center">
    <q-badge
      rounded
      class="estado-badge q-px-sm q-py-xs text-weight-medium text-center"
      :color="getEstadoColor(value)"
      :label="getEstado(value)"
      outline
      glossy
    />
  </div>

  <!-- ===================================================== -->
  <!-- 🟡 FALLBACK -->
  <!-- ===================================================== -->
  <span v-else class="text-grey-7">
    {{ value }}
  </span>

</template>

<script setup>
// =====================================================
// 📥 PROPS
// =====================================================
const props = defineProps({
  type: {
    type: String,
    required: true, // "stock" o "estado"
  },
  value: {
    type: Number,
    required: true, // valor del stock
  }
})

// =====================================================
// 🎨 STOCK
// =====================================================
const getStockColor = (stock) => {
  if (stock === 0) return 'negative'   // rojo
  if (stock <= 3) return 'warning'     // amarillo
  return 'positive'                    // verde
}

const getStockIcon = (stock) => {
  if (stock === 0) return 'cancel'       // sin stock
  if (stock <= 3) return 'warning'       // bajo stock
  return 'check_circle'                  // stock ok
}

// =====================================================
// 🧠 ESTADO AUTOMÁTICO
// =====================================================
const getEstado = (stock) => {
  if (stock === 0) return 'Sin stock'
  if (stock <= 3) return 'Bajo stock'
  return 'En stock'
}

// =====================================================
// 🎨 COLOR DEL ESTADO (para badge)
// =====================================================
const getEstadoColor = (stock) => {
  if (stock === 0) return 'negative'
  if (stock <= 3) return 'warning'
  return 'positive'
}
</script>

<style scoped>
/* ===================================================== */
/* 🟢 STOCK CELLS */
.stock-cell {
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.stock-icon {
  margin-right: 6px;
  animation: pop-in 0.3s ease;
}

.stock-value {
  font-size: 0.95rem;
}

/* ===================================================== */
/* 🟢 ESTADO CELLS */
.estado-cell {
  display: flex;
  justify-content: center;
}

.estado-badge {
  font-size: 0.85rem;
  text-transform: uppercase;
  transition: all 0.2s ease;
}

/* ===================================================== */
/* 🟢 ANIMACIONES */
@keyframes pop-in {
  0% { transform: scale(0.6); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
</style>