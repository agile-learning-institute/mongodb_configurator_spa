import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

// Create global config store
import { useConfig } from './composables/useConfig'
import { provideEvents } from './composables/useEvents'

const vuetify = createVuetify()

const app = createApp(App)

// Provide global config and events
const config = useConfig()
const events = provideEvents()

app.provide('config', config)
app.provide('events', events)

app.use(router)
app.use(vuetify)

app.mount('#app') 