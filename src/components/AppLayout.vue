<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar color="primary" theme="dark" class="app-header">
      <v-app-bar-nav-icon @click="toggleDrawer" />
      <v-toolbar-title>MongoDB Configurator</v-toolbar-title>
      <v-spacer></v-spacer>
      
      <!-- Process All Button -->
      <v-btn
        color="success"
        variant="elevated"
        size="large"
        class="mr-3"
        @click="processAllConfigurations"
        :loading="processing"
        :disabled="processing"
      >
        <v-icon start>mdi-cog</v-icon>
        Process All
      </v-btn>
      
      <!-- Drop Database Button -->
      <v-btn
        color="error"
        variant="elevated"
        size="large"
        @click="showDropDatabaseDialog = true"
        :loading="dropping"
        :disabled="dropping"
      >
        <v-icon start>mdi-delete</v-icon>
        Drop Database
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
    >
      <v-list density="compact" nav>
        <!-- Navigation Items -->
        <v-list-item v-for="item in navItems" :key="item.title" :to="item.to" link>
          <template v-slot:prepend>
            <v-icon>{{ item.icon }}</v-icon>
          </template>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <!-- Main Content -->
      <v-container fluid>
        <slot />
      </v-container>
    </v-main>

    <!-- Drop Database Confirmation Dialog -->
    <v-dialog v-model="showDropDatabaseDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-error">
          <v-icon color="error" class="mr-2">mdi-alert</v-icon>
          Drop Database
        </v-card-title>
        <v-card-text>
          <p class="text-body-1 mb-3">
            This action will permanently delete all data in the database. This action cannot be undone.
          </p>
          <p class="text-body-2 text-medium-emphasis mb-3">
            To confirm, please type <strong>DROP</strong> in the field below:
          </p>
          <v-text-field
            v-model="dropConfirmation"
            label="Type DROP to confirm"
            :error="dropConfirmation !== '' && dropConfirmation !== 'DROP'"
            :error-messages="dropConfirmation !== '' && dropConfirmation !== 'DROP' ? 'Please type DROP exactly' : undefined"
            :disabled="dropping"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            @click="showDropDatabaseDialog = false"
            :disabled="dropping"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            @click="dropDatabase"
            :loading="dropping"
            :disabled="dropConfirmation !== 'DROP' || dropping"
          >
            <v-icon start>mdi-delete</v-icon>
            Drop Database
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { apiService } from '@/utils/api'
import { useEvents } from '@/composables/useEvents'

// Initialize drawer state from localStorage or default to true
const drawer = ref(true)

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
      const { showEvent } = useEvents()
      showEvent(result, 'Processing Complete', 'All configurations processed successfully')
    }
    
  } catch (err: any) {
    console.error('Failed to process all configurations:', err)
    
    // Handle API errors with event data
    if (err.type === 'API_ERROR' && err.data) {
      if (err.data.id && err.data.type && err.data.status) {
        const { showEvent } = useEvents()
        showEvent(err.data, 'Processing Error', 'Failed to process all configurations')
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
</style> 