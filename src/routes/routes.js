// IMPORTACION DE LOS COMPONENTES
import Login from "../views/Login.vue"
import CreateAccount from "../views/Create_Account.vue"
import LayoutDashboard from "../layout/LayoutDashboard.vue"
import Dashboard from "../views/Dashboard.vue"
import Products from "../views/Products.vue"
import Customers from "../views/Customers.vue"
import Sales from "../views/Sales.vue"


// funciones de vue router
import { createRouter, createWebHashHistory } from "vue-router"
import { useAuthStore } from "../store/StoreToken.js"

const routes = [
{
    path: '/',
    redirect: '/login'
},
{
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
},
{
    path: '/createuser',
    name: 'CreateAccount',
    component: CreateAccount,
    meta: { requiresAuth: false }
},
{
    path: '/Dashboard_Home',
    component: LayoutDashboard,
    redirect: '/Dashboard_Home/inicio',
    meta: { requiresAuth: true },

    children: [
        {
            path: 'inicio',
            name: 'Dashboard_Home',
            component: Dashboard,
            meta: { requiresAuth: true }
        },
        {
            path: 'products',
            name: 'Products',
            component: Products,
            meta: { requiresAuth: true }
        },
        {
            path: 'customers',
            name: 'Customers',
            component: Customers,
            meta: { requiresAuth: true }
        },
        {
            path: 'sale',
            name: 'Sales',
            component: Sales,
            meta: { requiresAuth: true }
        },
        

    ]
}
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  /**
   * 🔒 Si requiere auth y no está autenticado → login
   */
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login' });
    return;
  }

  /**
   * 🔁 Evita volver al login si ya está autenticado
   */
  if (to.name === 'Login' && authStore.isAuthenticated) {
    next({ name: 'Dashboard_Home' });
    return;
  }

  next();
});

//export default router;