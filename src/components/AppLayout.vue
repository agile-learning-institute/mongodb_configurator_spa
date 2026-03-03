<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar color="primary" theme="dark" class="app-header">
      <v-app-bar-nav-icon @click="toggleDrawer" data-test="nav-toggle" />
      <v-toolbar-title class="text-h5 font-weight-medium app-title" data-test="app-title">
        <router-link to="/" class="text-decoration-none text-white">
          {{ appTitle }}
        </router-link>
      </v-toolbar-title>
      
      <!-- Admin Button -->
      <v-btn icon to="/admin" title="Admin" class="admin-btn" data-test="admin-btn">
        <v-icon data-test="admin-icon">mdi-cog</v-icon>
      </v-btn>
      
      <!-- Help Button -->
      <v-btn 
        icon 
        @click="toggleHelp" 
        title="Help" 
        class="help-btn"
        :color="isOnHelpPage ? 'primary' : undefined"
        :variant="isOnHelpPage ? 'elevated' : 'text'"
        data-test="help-btn"
      >
        <v-icon data-test="help-icon">mdi-help-circle</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Navigation Sidebar -->
    <v-navigation-drawer 
      v-model="drawer" 
      location="left" 
      width="260"
      :permanent="$vuetify.display.mdAndUp"
      :temporary="$vuetify.display.smAndDown"
      :rail="!drawer && $vuetify.display.mdAndUp"
      data-test="navigation-drawer"
    >
      <v-list density="comfortable" nav class="navigation-list">
        <!-- Navigation Items -->
        <v-list-item v-for="item in navItems" :key="item.title" :to="item.to" link :data-test="`nav-item-${item.title.toLowerCase().replace(/\s+/g, '-')}`">
          <template v-slot:prepend>
            <v-icon size="large" :data-test="`nav-icon-${item.title.toLowerCase().replace(/\s+/g, '-')}`">{{ item.icon }}</v-icon>
          </template>
          <v-list-item-title class="text-body-1 font-weight-medium" :data-test="`nav-title-${item.title.toLowerCase().replace(/\s+/g, '-')}`">{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
      
      <!-- Help Link at Bottom -->
      <div class="help-link-container">
        <v-list-item to="/help" link class="help-link" data-test="help-nav-item">
          <template v-slot:prepend>
            <v-icon size="large" data-test="help-nav-icon">mdi-help-circle</v-icon>
          </template>
          <v-list-item-title class="text-body-1 font-weight-medium" data-test="help-nav-title">Help</v-list-item-title>
        </v-list-item>
      </div>
    </v-navigation-drawer>

    <v-main>
      <!-- Main Content -->
      <v-container fluid>
        <slot />
      </v-container>
    </v-main>

  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEventState } from '@/composables/useEventState'
import { useConfig } from '@/composables/useConfig'

// Get read-only state and UI header from config
const { uiHeader } = useConfig()

// Build app title: UI_HEADER + current page focus
const pageFocus = computed(() => {
  const path = route.path
  const params = route.params
  if (path === '/help') return ''
  if (path === '/admin') return 'Admin'
  if (path.startsWith('/configurations/')) return `Configuration: ${(params.fileName as string)?.replace('.yaml', '') ?? ''}`
  if (path === '/dictionaries') return 'Dictionaries'
  if (path.startsWith('/dictionaries/')) return 'Dictionary'
  if (path === '/types') return 'Types'
  if (path.startsWith('/types/')) return 'Type'
  if (path.startsWith('/enumerators/')) return 'Enumerators'
  if (path.startsWith('/test_data/')) return `Test Data: ${(params.fileName as string) ?? ''}`
  if (path.startsWith('/migrations/')) return `Migrations: ${(params.fileName as string) ?? ''}`
  if (path === '/event-viewer') return 'Event Viewer'
  return ''
})

const appTitle = computed(() => {
  const base = uiHeader.value ?? 'MongoDB Configurator'
  return pageFocus.value ? `${base} - ${pageFocus.value}` : base
})

// Initialize drawer state from localStorage or default to false (hidden)
const drawer = ref(false)

// Get current route for context-aware help
const route = useRoute()
const router = useRouter()

// Help state
const isOnHelpPage = computed(() => route.path === '/help')
const previousPage = ref('')

// Help route with context (carousel: 0=Dictionary, 1=Type, 2=Enumerator, 3=Collection Config, 4=Events, 5=Locking, 6=Admin)
const helpRoute = computed(() => {
  const currentPath = route.path
  let slideIndex = 0 // Default to Dictionary
  
  if (currentPath.includes('/dictionaries')) {
    slideIndex = 0 // Dictionary
  } else if (currentPath.includes('/types')) {
    slideIndex = 1 // Type
  } else if (currentPath.includes('/enumerators')) {
    slideIndex = 2 // Enumerator
  } else if (currentPath.includes('/configurations')) {
    slideIndex = 3 // Collection Configuration
  } else if (currentPath.includes('/test_data') || currentPath.includes('/migrations')) {
    slideIndex = 3 // Collection Configuration (test data & migrations content moved there)
  } else if (currentPath === '/event-viewer') {
    slideIndex = 4 // Configuration Processing Events
  } else if (currentPath.includes('/admin')) {
    slideIndex = 6 // Admin
  }
  
  return `/help?slide=${slideIndex}`
})

// Toggle help function
const toggleHelp = () => {
  if (isOnHelpPage.value) {
    // Currently on help page, go back to previous page
    if (previousPage.value) {
      router.push(previousPage.value)
    } else {
      // Fallback to dictionaries if no previous page
      router.push('/dictionaries')
    }
  } else {
    // Currently on another page, go to help page
    previousPage.value = route.path
    
    // Check if we're on the Event Viewer page and link to Events help panel
    if (route.path === '/event-viewer') {
      // Store the current event viewer state before navigating to help
      const { hasEventData } = useEventState()
      if (hasEventData()) {
        // If we have event data, store it temporarily and navigate to help
        // The event state will be preserved in the composable
        router.push('/help?slide=4') // Configuration Processing Events
      } else {
        // No event data, just go to help
        router.push('/help?slide=4')
      }
    } else {
      router.push(helpRoute.value)
    }
  }
}

// Load drawer state from localStorage on mount
onMounted(() => {
  const savedDrawerState = localStorage.getItem('navigation-drawer-open')
  if (savedDrawerState !== null) {
    drawer.value = savedDrawerState === 'true'
  } else {
    // Default to hidden if no saved state
    drawer.value = false
  }
})

// Toggle drawer and save state
const toggleDrawer = () => {
  drawer.value = !drawer.value
  localStorage.setItem('navigation-drawer-open', drawer.value.toString())
}

const navItems = computed(() => [
  { title: 'Dictionaries', icon: 'mdi-book-open-variant', to: '/dictionaries' },
  { title: 'Types', icon: 'mdi-shape', to: '/types' },
  { title: 'Enumerators', icon: 'mdi-format-list-numbered', to: '/enumerators' },
])
</script> 

<style scoped>
.app-header {
  background: linear-gradient(135deg, #1565C0 0%, #1976D2 100%) !important;
}

.app-title {
  flex: 1;
  min-width: 0;
}

.app-title :deep(.v-toolbar-title__placeholder) {
  overflow: visible;
  text-overflow: unset;
  white-space: normal;
}

.admin-btn {
  color: white !important;
}

.admin-btn:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.help-btn {
  color: white !important;
}

.help-btn:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.navigation-list {
  height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
}

.help-link-container {
  margin-top: auto;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  padding-top: 8px;
}

.help-link {
  color: #1976d2 !important;
}

.help-link:hover {
  background-color: rgba(25, 118, 210, 0.08) !important;
}
</style> 