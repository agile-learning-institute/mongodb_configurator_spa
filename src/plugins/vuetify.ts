import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#2E7D32', // Dark green
          secondary: '#558B2F', // Medium green
          accent: '#8BC34A', // Light green
          error: '#D32F2F', // Dark red
          info: '#1976D2', // Blue
          success: '#388E3C', // Green
          warning: '#F57C00', // Orange
          surface: '#F1F8E9', // Very light green background
          'surface-variant': '#E8F5E8', // Light green variant
        },
      },
    },
  },
  defaults: {
    VCard: {
      density: 'comfortable',
    },
    VList: {
      density: 'comfortable',
    },
    VListItem: {
      density: 'comfortable',
    },
    VBtn: {
      density: 'comfortable',
    },
    VTextField: {
      density: 'comfortable',
    },
    VSelect: {
      density: 'comfortable',
    },
    VTextarea: {
      density: 'comfortable',
    },
  },
}) 