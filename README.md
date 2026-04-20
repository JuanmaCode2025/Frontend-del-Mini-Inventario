# 🖥️ FRONTED DEL MINI INVENTARIO 

Interfaz de usuario moderna desarrollada con **Vue 3** y **Quasar Framework**, que consume la API del backend **Mini Inventario** para gestionar productos, clientes y ventas.

---

## 🧠 Flujo de Trabajo del Frontend

1. **Inicio de sesión y autenticación**  
   Formulario con validaciones que consume JWT y almacena el token en `localStorage`.

2. **Dashboard principal**  
   Vista con métricas clave, gráficos y acceso rápido a todas las secciones.

3. **Gestión de productos**  
   CRUD completo con tablas, modales, validaciones y generación IA de descripciones.

4. **Gestión de clientes**  
   Listado, búsqueda, creación y edición de clientes.

5. **Registro de ventas**  
   Sistema de ventas con selección de productos y clientes, cálculo automático de totales.

6. **Recomendaciones IA**  
   Panel inteligente con sugerencias de reabastecimiento y ajuste de precios.

---

## 🚀 Características Principales

- ⚡ **Vue 3 Composition API** – Código moderno y reactivo
- 🎨 **Quasar Framework** – Componentes UI ricos y responsivos
- 🔐 **Autenticación JWT** – Protección de rutas y manejo de sesión
- 📦 **Gestión completa** – Productos, clientes y ventas
- 📱 **Diseño responsive** – Funciona en móvil, tablet y desktop
- 🧩 **Pinia** – Manejo de estado global
- 🛣️ **Vue Router** – Navegación entre páginas
- 🌐 **Axios** – Comunicación HTTP con el backend

---

## 🛠️ Tecnologías Utilizadas

| Tecnología         | Propiedad                                    |
|--------------------|----------------------------------------------|
| **Vue 3**          | Framework progresivo para UI                |
| **Quasar v2**      | Componentes UI y estilos Material Design    |
| **Pinia**          | Manejo de estado global                     |
| **Vue Router**     | Enrutamiento de la aplicación               |
| **Axios**          | Cliente HTTP para consumir API              |
| **Composition API**| Reactividad y lógica reutilizable           |
| **JWT**            | Autenticación y autorización                |

---

## 📁 Estructura del Proyecto
* 📦 Frontend-mini-inventario

```
├── 📁 public
│   └── 🖼️ vite.svg
├── 📁 src
│   ├── 📁 assets
│   ├── 📁 components
│   │   ├── 📁 Dialog
│   │   │   └── 📄 SaleDetailDialog.vue
│   │   ├── 📁 Form
│   │   │   ├── 📄 FormCustomer.vue
│   │   │   ├── 📄 FormProducts.vue
│   │   │   └── 📄 FormSale.vue
│   │   ├── 📄 BaseTable.vue
│   │   └── 📄 CellDesign.vue
│   ├── 📁 composables
│   │   ├── 📄 Dates.js
│   │   ├── 📄 Mini-composables.js
│   │   └── 📄 Notifications.js
│   ├── 📁 layout
│   │   └── 📄 LayoutDashboard.vue
│   ├── 📁 plugins
│   │   └── 📄 pluginAxios.js
│   ├── 📁 routes
│   │   └── 📄 routes.js
│   ├── 📁 services
│   │   └── 📄 api_Clients.js
│   ├── 📁 store
│   │   └── 📄 StoreToken.js
│   ├── 📁 styles
│   │   └── 🎨 quasar-variables.sass
│   ├── 📁 views
│   │   ├── 📄 Create_Account.vue
│   │   ├── 📄 Customers.vue
│   │   ├── 📄 Dashboard.vue
│   │   ├── 📄 Login.vue
│   │   ├── 📄 Products.vue
│   │   └── 📄 Sales.vue
│   ├── 📄 App.vue
│   └── 📄 main.js
├── ⚙️ .gitignore
├── 📝 README.md
├── 🌐 index.html
├── ⚙️ package-lock.json
├── ⚙️ package.json
└── 📄 vite.config.js

```

---

## ⚙️ Configuración del Entorno  e Instalación

Pasos de instalación
bash
# 1. Clonar el repositorio
git clone <repo-frontend-url>

# 2. Entrar al directorio
cd frontend-mini-inventario

# 3. Instalar dependencias
npm install

# 4. Ejecutar en modo desarrollo
npm run dev


🧪 Credenciales de Prueba
text
Email: admin@test.com
Contraseña: 123456
👨‍💻 Autor
Juan Manuel Mejía Duarte
@JuanmaCode2025
📅 30 de Mayo de 2025

🔗 Repositorios Relacionados
Backend del proyecto

Colección de Postman

📄 Licencia
Este proyecto está bajo la licencia MIT.

text

---

Este README está completamente adaptado a **Vue 3 + Quasar**, incluyendo la estructura típica de proyecto con Composition API, Pinia, Vue Router, y todas las buenas prácticas. ¿Necesitas que ajuste o agregue algo más?