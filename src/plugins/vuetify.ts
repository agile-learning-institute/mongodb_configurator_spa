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
          primary: '#1565C0', // Neutral blue
          secondary: '#42A5F5', // Medium blue
          accent: '#64B5F6', // Light blue
          error: '#D32F2F', // Dark red
          info: '#1976D2', // Blue
          success: '#2E7D32', // Green
          warning: '#F57C00', // Orange
          surface: '#E3F2FD', // Very light blue background
          'surface-variant': '#BBDEFB', // Light blue variant
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
    VTooltip: {
      color: 'primary',
      textColor: 'white',
    },
  },
}) 