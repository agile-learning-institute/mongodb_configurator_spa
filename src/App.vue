<template>
  <v-app>
    <v-main>
      <div v-if="configLoading" class="d-flex justify-center align-center" style="height: 100vh;">
        <v-progress-circular indeterminate size="64"></v-progress-circular>
      </div>
      
      <div v-else-if="configError" class="d-flex justify-center align-center" style="height: 100vh;">
        <v-alert type="error" max-width="500">
          <template v-slot:title>Configuration Error</template>
          {{ configError }}
          <v-btn @click="loadConfig" class="mt-2">Retry</v-btn>
        </v-alert>
      </div>
      
      <div v-else>
        <v-container>
          <v-row justify="center" align="center" style="height: 100vh;">
            <v-col cols="12" class="text-center">
              <h1 class="text-h2 mb-4">MongoDB Configurator SPA</h1>
              <p class="text-h6 mb-4">Hello World - Ready for Phase 3 Development</p>
              
              <v-alert 
                :type="isLocal ? 'success' : 'warning'" 
                class="mb-4"
                max-width="600"
              >
                <template v-slot:title>
                  {{ isLocal ? 'Edit Mode' : 'Read-Only Mode' }}
                </template>
                <p v-if="isLocal">
                  BUILT_AT: {{ builtAt }} - You can edit configurations
                </p>
                <p v-else>
                  BUILT_AT: {{ builtAt }} - Read-only mode, no editing allowed
                </p>
              </v-alert>
              
              <v-btn color="primary" class="mt-4">
                Get Started
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useConfig } from '@/composables/useConfig'

const { 
  config, 
  loading: configLoading, 
  error: configError, 
  builtAt, 
  isLocal, 
  loadConfig 
} = useConfig()

// Load configuration on app startup
onMounted(() => {
  loadConfig()
})
</script>

<style>
/* Global styles */
</style> 