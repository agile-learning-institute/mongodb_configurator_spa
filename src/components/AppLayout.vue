<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar color="primary" theme="dark" class="app-header">
      <v-app-bar-nav-icon @click="toggleDrawer" data-test="nav-toggle" />
      <v-toolbar-title class="text-h5 font-weight-medium" data-test="app-title">
        <router-link to="/" class="text-decoration-none text-white">MongoDB Configurator</router-link>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      
      <!-- Configure Database Button -->
      <v-btn
        color="white"
        variant="elevated"
        size="large"
        @click="processAllConfigurations"
        :loading="processing"
        :disabled="processing"
        class="mr-3 process-btn"
        data-test="process-all-btn"
      >
        <v-icon start data-test="process-all-icon">mdi-cog</v-icon>
        Configure Database
      </v-btn>
      
      <!-- Drop Database Button -->
      <v-btn
        color="white"
        variant="elevated"
        size="large"
        class="mr-3 drop-btn"
        @click="showDropDatabaseDialog = true"
        :loading="dropping"
        :disabled="dropping"
        data-test="drop-database-btn"
      >
        <v-icon start data-test="drop-database-icon">mdi-delete</v-icon>
        Drop Database
      </v-btn>
      
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
        <v-list-item to="/" link class="help-link" data-test="help-nav-item">
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

    <!-- Drop Database Confirmation Dialog -->
    <v-dialog v-model="showDropDatabaseDialog" max-width="500px" data-test="drop-database-dialog">
      <v-card>
        <v-card-title class="text-error" data-test="drop-database-dialog-title">
          <v-icon color="error" class="mr-2" data-test="drop-database-dialog-icon">mdi-alert</v-icon>
          Drop Database
        </v-card-title>
        <v-card-text>
          <p class="text-body-1 mb-3" data-test="drop-database-warning">
            This action will permanently delete all data in the database. This action cannot be undone.
          </p>
          <p class="text-body-2 text-medium-emphasis mb-3" data-test="drop-database-instruction">
            To confirm, please type <strong>DROP</strong> in the field below:
          </p>
          <v-text-field
            v-model="dropConfirmation"
            placeholder="Type DROP to confirm"
            :error="dropConfirmation !== '' && dropConfirmation !== 'DROP'"
            :error-messages="dropConfirmation !== '' && dropConfirmation !== 'DROP' ? 'Please type DROP exactly' : undefined"
            :disabled="dropping"
            data-test="drop-confirmation-input"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            @click="showDropDatabaseDialog = false"
            :disabled="dropping"
            data-test="drop-database-cancel-btn"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            @click="dropDatabase"
            :loading="dropping"
            :disabled="dropConfirmation !== 'DROP' || dropping"
            data-test="drop-database-confirm-btn"
          >
            <v-icon start data-test="drop-database-confirm-icon">mdi-delete</v-icon>
            Drop Database
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEvents } from '@/composables/useEvents'
import { useEventState } from '@/composables/useEventState'
import { apiService } from '@/utils/api'

// Initialize drawer state from localStorage or default to true
const drawer = ref(true)

// Get current route for context-aware help
const route = useRoute()
const router = useRouter()

// Help state
const isOnHelpPage = computed(() => route.path === '/')
const previousPage = ref('')

// Help route with context
const helpRoute = computed(() => {
  const currentPath = route.path
  let slideIndex = 0 // Default to overview
  
  // Map current page to appropriate carousel slide
  if (currentPath.includes('/configurations')) {
    slideIndex = 1 // Configuration
  } else if (currentPath.includes('/dictionaries')) {
    slideIndex = 2 // Dictionary
  } else if (currentPath.includes('/types')) {
    slideIndex = 3 // Type
  } else if (currentPath.includes('/enumerators')) {
    slideIndex = 4 // Enumerator
  } else if (currentPath.includes('/test_data')) {
    slideIndex = 5 // Test Data
  } else if (currentPath.includes('/migrations')) {
    slideIndex = 6 // Migration
  } else if (currentPath.includes('/admin')) {
    slideIndex = 7 // Admin
  }
  
  return `/?slide=${slideIndex}`
})

// Toggle help function
const toggleHelp = () => {
  if (isOnHelpPage.value) {
    // Currently on help page, go back to previous page
    if (previousPage.value) {
      router.push(previousPage.value)
    } else {
      // Fallback to configurations if no previous page
      router.push('/configurations')
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
        router.push('/?slide=8') // Events panel is at index 8 (slide 9)
      } else {
        // No event data, just go to help
        router.push('/?slide=8')
      }
    } else {
      router.push(helpRoute.value)
    }
  }
}

// Database operations
const processing = ref(false)
const dropping = ref(false)
const showDropDatabaseDialog = ref(false)
const dropConfirmation = ref('')

// Load drawer state from localStorage on mount
onMounted(() => {
  const savedDrawerState = localStorage.getItem('navigation-drawer-open')
  if (savedDrawerState !== null) {
    drawer.value = savedDrawerState === 'true'
  }
})

// Toggle drawer and save state
const toggleDrawer = () => {
  drawer.value = !drawer.value
  localStorage.setItem('navigation-drawer-open', drawer.value.toString())
}

// Process all configurations
const processAllConfigurations = async () => {
  processing.value = true
  try {
    const result = await apiService.processAllConfigurations()
    
    // Check if the response contains event data
    if (result && result.id && result.type && result.status) {
      // Clear any existing event state and set new event data in global state
      const { clearEventViewerState, setEventViewerState } = useEventState()
      clearEventViewerState() // Clear old state before setting new
      setEventViewerState(result, 'Processing Complete', 'All configurations processed successfully')
      router.push('/event-viewer')
    }
    
  } catch (err: any) {
    console.error('Failed to process all configurations:', err)
    
    // Handle API errors with event data
    if (err.type === 'API_ERROR' && err.data) {
      if (err.data.id && err.data.type && err.data.status) {
        // Clear any existing event state and set error event data in global state
        const { clearEventViewerState, setEventViewerState } = useEventState()
        clearEventViewerState() // Clear old state before setting new
        setEventViewerState(err.data, 'Processing Error', 'Failed to process all configurations')
        router.push('/event-viewer')
      } else {
        const { showError } = useEvents()
        showError(err.message || 'Failed to process all configurations', 'Processing Error', 'Failed to process all configurations')
      }
    } else {
      const { showError } = useEvents()
      showError(err.message || 'Failed to process all configurations', 'Processing Error', 'Failed to process all configurations')
    }
  } finally {
    processing.value = false
  }
}

// Drop database
const dropDatabase = async () => {
  if (dropConfirmation.value !== 'DROP') return
  
  dropping.value = true
  try {
    const result = await apiService.dropDatabase()
    
    // Handle array of events or single event
    if (Array.isArray(result) && result.length > 0) {
      // API returned an array of events
      const { showEvent } = useEvents()
      showEvent(result[0], 'Database Dropped', 'Database dropped successfully')
    } else if (result && result.id && result.type && result.status) {
      // API returned a single event
      const { showEvent } = useEvents()
      showEvent(result, 'Database Dropped', 'Database dropped successfully')
    } else {
      // No event data, show simple success message
      const { showError } = useEvents()
      showError('Database dropped successfully', 'Success', 'Database Operation Complete')
    }
    
    // Close dialog and reset
    showDropDatabaseDialog.value = false
    dropConfirmation.value = ''
    
  } catch (err: any) {
    console.error('Failed to drop database:', err)
    
    // Handle API errors with event data
    if (err.type === 'API_ERROR' && err.data) {
      if (err.data.id && err.data.type && err.data.status) {
        const { showEvent } = useEvents()
        showEvent(err.data, 'Drop Database Error', 'Failed to drop database')
      } else {
        const { showError } = useEvents()
        showError(err.message || 'Failed to drop database', 'Drop Database Error', 'Failed to drop database')
      }
    } else {
      const { showError } = useEvents()
      showError(err.message || 'Failed to drop database', 'Drop Database Error', 'Failed to drop database')
    }
  } finally {
    dropping.value = false
  }
}

const navItems = [
  { title: 'Configurations', icon: 'mdi-database', to: '/configurations' },
  { title: 'Dictionaries', icon: 'mdi-book-open-variant', to: '/dictionaries' },
  { title: 'Types', icon: 'mdi-shape', to: '/types' },
  { title: 'Enumerators', icon: 'mdi-format-list-bulleted', to: '/enumerators' },
  { title: 'Test Data', icon: 'mdi-file-document', to: '/test_data' },
  { title: 'Migrations', icon: 'mdi-swap-horizontal', to: '/migrations' },
]
</script> 

<style scoped>
.app-header {
  background: linear-gradient(135deg, #2E7D32 0%, #388E3C 100%) !important;
}

.process-btn {
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%) !important;
  color: white !important;
  font-weight: 600 !important;
  text-transform: none !important;
  box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3) !important;
}

.process-btn:hover {
  background: linear-gradient(135deg, #66BB6A 0%, #81C784 100%) !important;
  box-shadow: 0 6px 12px rgba(76, 175, 80, 0.4) !important;
}

.drop-btn {
  background: linear-gradient(135deg, #F44336 0%, #EF5350 100%) !important;
  color: white !important;
  font-weight: 600 !important;
  text-transform: none !important;
  box-shadow: 0 4px 8px rgba(244, 67, 54, 0.3) !important;
}

.drop-btn:hover {
  background: linear-gradient(135deg, #EF5350 0%, #E57373 100%) !important;
  box-shadow: 0 6px 12px rgba(244, 67, 54, 0.4) !important;
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