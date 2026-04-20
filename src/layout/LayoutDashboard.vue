<template>
  <q-layout view="hHh hpr hFf" class="app-layout">
    <!-- ── Header ── -->
    <q-header class="app-header">
      <q-toolbar class="header-toolbar">
        <q-btn
          flat
          round
          dense
          icon="menu"
          class="text-white q-mr-sm"
          @click="toggleDrawer"
        >
          <q-tooltip>Menú</q-tooltip>
        </q-btn>

        <q-toolbar-title class="text-center">
          <div class="header-brand">
            <q-icon name="storefront" size="20px" class="q-mr-xs" />
            <span class="header-brand__name">StockPyme</span>
            <span class="header-brand__sep gt-xs">·</span>
            <span class="header-brand__sub gt-xs">Mini Inventario</span>
          </div>
        </q-toolbar-title>

        <q-btn
          flat
          round
          icon="logout"
          class="text-white"
          @click="handleLogout"
        >
          <q-tooltip>Cerrar sesión</q-tooltip>
        </q-btn>
      </q-toolbar>
      <div class="header-stripe" />
    </q-header>

    <!-- ── Drawer ── -->
    <q-drawer
      v-model="isDrawerOpen"
      side="left"
      overlay
      behavior="mobile"
      elevated
      :width="268"
    >
      <!-- Este div interno es el que toma el color — evita que Quasar lo sobreescriba -->
      <div class="drawer-inner">
        <!-- Perfil -->
        <div class="drawer-profile">
          <div class="drawer-profile__avatar">
            <q-icon name="person" size="26px" color="white" />
          </div>
          <div class="drawer-profile__info">
            <p class="drawer-profile__name">{{ userName }}</p>
            <p class="drawer-profile__role">{{ userRole }}</p>
          </div>
          <q-btn
            flat
            round
            dense
            icon="close"
            color="white"
            size="sm"
            @click="isDrawerOpen = false"
          />
        </div>

        <div class="drawer-divider" />

        <p class="drawer-section-label">Navegación</p>

        <!-- Items -->
        <div class="drawer-nav">
          <div
            v-for="item in navItems"
            :key="item.route"
            class="nav-item"
            :class="{ 'nav-item--active': isActive(item.route) }"
            @click="goTo(item.route)"
          >
            <div
              class="nav-icon"
              :class="{ 'nav-icon--active': isActive(item.route) }"
            >
              <q-icon :name="item.icon" size="20px" />
            </div>

            <div class="nav-texto">
              <p class="nav-item__label">{{ item.label }}</p>
              <p class="nav-item__caption">{{ item.caption }}</p>
            </div>

            <div v-if="isActive(item.route)" class="nav-item__dot" />
          </div>
        </div>

        <!-- Footer -->
        <div class="drawer-footer">
          <q-icon name="inventory_2" size="14px" class="q-mr-xs" />
          <span>StockPyme v1.0</span>
        </div>
      </div>
    </q-drawer>

    <!-- ── Contenido ── -->
    <q-page-container class="app-content">
      <router-view />
    </q-page-container>
  </q-layout>
</template>


<script setup>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useQuasar } from "quasar";
import { useAuthStore } from "../store/StoreToken.js"

const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const authStore = useAuthStore();


const isDrawerOpen = ref(false);
const userName = computed(() => authStore.user?.name);




const navItems = [
  {
    label: "Dashboard",
    icon: "dashboard",
    caption: "Panel principal",
    route: "Dashboard_Home",
  },
  {
    label: "Productos",
    icon: "inventory_2",
    caption: "Gestión de inventario",
    route: "Products",
  },
  {
    label: "Clientes",
    icon: "people",
    caption: "Gestión de clientes",
    route: "Customers",
  },
  {
    label: "Ventas",
    icon: "point_of_sale",
    caption: "Registro de ventas",
    route: "Sales",
  },
];

function isActive(routeName) {
  return route.name === routeName;
}

function goTo(routeName) {
  router.push({ name: routeName });
  isDrawerOpen.value = false;
}

function toggleDrawer() {
  isDrawerOpen.value = !isDrawerOpen.value;
}



/**
 * 🚪 Maneja el cierre de sesión del usuario
 * Muestra confirmación, limpia el estado global y redirige al login
 */
function handleLogout() {
  $q.dialog({
    title: "¿Cerrar sesión?",
    message: "¿Estás seguro de que deseas cerrar sesión?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {

    /**
     * 🔥 Limpia estado global
     */
    authStore.logout();

    /**
     * 🔁 Redirige al login
     */
    await router.push({ name: "Login" });

    /**
     * 🔔 Notificación
     */
    $q.notify({
      type: "positive",
      message: "Sesión cerrada correctamente",
      position: "top",
    });
  });
}
</script>


<style>

/* ─── Layout ─── */
.app-layout {
  min-height: 100vh;
  overflow-x: hidden;
}

/* ─────────────────────────────────────────────
   HEADER
───────────────────────────────────────────── */
.app-header {
  background: linear-gradient(
    90deg,
    #0d47a1 0%,
    #1565c0 55%,
    #1976d2 100%
  ) !important;
  box-shadow: 0 3px 20px rgba(13, 71, 161, 0.5) !important;
  z-index: 3000 !important;
}

.header-toolbar {
  min-height: 62px;
  padding: 0 16px;
}

.header-brand {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: white;
}

.header-brand__name {
  font-size: 1.2rem;
  font-weight: 700;
  color: white;
}

.header-brand__sep {
  color: rgba(255, 255, 255, 0.4);
  margin: 0 6px;
}

.header-brand__sub {
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.7);
}

.header-stripe {
  height: 3px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
}

/* ─────────────────────────────────────────────
   DRAWER — forzar fondo oscuro con !important
───────────────────────────────────────────── */

/* Quasar inyecta .q-drawer con background:white — lo sobreescribimos */
.q-drawer {
  background: #0a1f5c !important;
}

.q-drawer .q-drawer__content {
  background: #0a1f5c !important;
}

/* El div interno que controla todo el contenido del drawer */
.drawer-inner {
  width: 100%;
  height: 100%;
  background: #0a1f5c;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* ─── Perfil ─── */
.drawer-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 14px;
  background: rgba(255, 255, 255, 0.07);
  flex-shrink: 0;
}

.drawer-profile__avatar {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.15);
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.drawer-profile__info {
  flex: 1;
  min-width: 0;
}

.drawer-profile__name {
  font-size: 0.92rem;
  font-weight: 600;
  color: white;
  margin: 0;
}

.drawer-profile__role {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.55);
  margin: 2px 0 0;
}

/* ─── Divisor ─── */
.drawer-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 0 14px;
  flex-shrink: 0;
}

/* ─── Etiqueta sección ─── */
.drawer-section-label {
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.35);
  padding: 14px 18px 6px;
  margin: 0;
  flex-shrink: 0;
}

/* ─── Navegación ─── */
.drawer-nav {
  padding: 4px 10px;
  flex: 1;
  overflow-y: auto;
}

/* ─── Item ─── */
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 10px;
  margin: 2px 0;
  padding: 10px 10px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
  transition: background 0.2s ease, transform 0.15s ease;
  min-height: 52px;
  user-select: none;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.09);
  transform: translateX(3px);
  color: white;
}

.nav-item--active {
  background: rgba(66, 165, 245, 0.2);
  border: 1px solid rgba(66, 165, 245, 0.35);
  color: white;
  transform: translateX(3px);
}

/* ─── Ícono ─── */
.nav-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.65);
  flex-shrink: 0;
  transition: background 0.2s ease;
}

.nav-icon--active {
  background: rgba(66, 165, 245, 0.3);
  color: #90caf9;
}

/* ─── Texto del item ─── */
.nav-texto {
  flex: 1;
  min-width: 0;
}

.nav-item__label {
  font-size: 0.88rem;
  font-weight: 500;
  color: inherit;
  margin: 0;
}

.nav-item__caption {
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
}

/* ─── Punto activo ─── */
.nav-item__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #42a5f5;
  box-shadow: 0 0 8px rgba(66, 165, 245, 0.9);
  flex-shrink: 0;
}

/* ─── Footer ─── */
.drawer-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.22);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
}

/* ─────────────────────────────────────────────
   CONTENIDO
───────────────────────────────────────────── */
.app-content {
  background: linear-gradient(135deg, #e8f4fd 0%, #f0f7ff 50%, #ffffff 100%);
  min-height: 100vh;
  margin-left: 0 !important;
  width: 100% !important;
}

/* ─── Animaciones ─── */
@keyframes slideInLeft {
  from {
    transform: translateX(-10px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.nav-item:nth-child(1) {
  animation: slideInLeft 0.2s ease-out 0.04s both;
}
.nav-item:nth-child(2) {
  animation: slideInLeft 0.2s ease-out 0.08s both;
}
.nav-item:nth-child(3) {
  animation: slideInLeft 0.2s ease-out 0.12s both;
}
.nav-item:nth-child(4) {
  animation: slideInLeft 0.2s ease-out 0.16s both;
}

/* ─── Responsive ─── */
@media (max-width: 600px) {
  .header-toolbar {
    min-height: 54px;
  }
}
</style>