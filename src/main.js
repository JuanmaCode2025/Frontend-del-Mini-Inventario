import { createApp } from 'vue'
import { Quasar, Notify, Dialog} from 'quasar'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'
import App from './App.vue'

import { router } from './routes/routes.js'
import {createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
const myApp = createApp(App)

pinia.use(piniaPluginPersistedstate)

myApp.use(pinia)
myApp.use(Quasar, {
    plugins: {
        Notify,
        Dialog,
        iconSet: 'material-icons',
    },
})
myApp.use(router)

myApp.mount('#app')
