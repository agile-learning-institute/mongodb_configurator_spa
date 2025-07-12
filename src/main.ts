import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

// Create global config store
import { useConfig } from './composables/useConfig'

const vuetify = createVuetify()

const app = createApp(App)

// Provide global config
const config = useConfig()
app.provide('config', config)

app.use(router)
app.use(vuetify)

app.mount('#app') 