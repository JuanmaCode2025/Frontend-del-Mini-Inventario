```vue
<template>
  <!-- 🧱 CONTENEDOR PRINCIPAL -->
  <q-card class="shadow-2 table-card">

    <!-- 🔹 HEADER -->
    <q-card-section class="row items-center justify-between q-pb-none">
      
      <!-- 🟢 TÍTULO + BADGE -->
      <div class="row items-center q-gutter-xs">
        
        <slot name="title">
          <span class="section-title text-primary">Tabla</span>
        </slot>

        <q-badge
          v-if="badge" 
          color="orange-2"
          text-color="orange-9"
          :label="badge"
          rounded
          class="q-ml-xs"
        />
      </div>

      <!-- 🔍 BUSCADOR -->
      <q-input
        v-if="showSearch" 
        v-model="internalSearch"
        outlined
        dense
        rounded
        placeholder="Buscar..."
        style="min-width: 200px"
        clearable
      >
        <template #prepend>
          <q-icon name="search" color="primary" size="18px" />
        </template>
      </q-input>

    </q-card-section>

    <!-- 🔹 TABLA -->
    <q-card-section>
      <q-table
        :rows="filteredRows" 
        :columns="columns" 
        row-key="id"
        flat
        :loading="loading" 
        :rows-per-page-options="[8, 15, 25]"
        rows-per-page-label="Filas por página"
        loading-label="Cargando..."
        class="dashboard-table"
      >

        <!-- 🎯 CELDAS DINÁMICAS -->
        <template v-slot:body-cell="props">
          <q-td :props="props">
            <slot :name="`cell-${props.col.name}`" v-bind="props">
              {{ props.value }}
            </slot>
          </q-td>
        </template>

        <!-- 🚫 ESTADO VACÍO PRO -->
        <template v-slot:no-data>
          <div class="full-width row flex-center q-gutter-sm q-pa-lg text-grey-6">

            <q-icon 
              :name="internalSearch ? 'search_off' : 'inbox'" 
              size="40px" 
              color="grey-5" 
            />

            <span class="text-subtitle2">
              {{ internalSearch 
                ? 'No se encontraron resultados' 
                : 'No hay datos en la tabla' 
              }}
            </span>

          </div>
        </template>

      </q-table>
    </q-card-section>

  </q-card>
</template>

<script setup>
import { ref, computed } from "vue";

/* 🧠 PROPS */
const props = defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
  columns: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  badge: {
    type: [String, Number],
    default: null,
  },
  showSearch: {
    type: Boolean,
    default: true,
  },
});

/* 🔍 BUSCADOR */
const internalSearch = ref("");

/* 🧠 FILTRO */
const filteredRows = computed(() => {
  if (!props.showSearch || !internalSearch.value) {
    return props.rows;
  }

  return props.rows.filter((row) =>
    Object.values(row).some((val) =>
      String(val).toLowerCase().includes(internalSearch.value.toLowerCase())
    )
  );
});
</script>

<style scoped>
.table-card {
  border-radius: 12px;
}

.dashboard-table {
  font-size: 14px;
}
</style>
