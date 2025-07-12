<template>
  <v-container fluid>
    <v-row justify="center" align="center" style="min-height: 80vh;">
      <v-col cols="12" md="8" lg="6" class="text-center">
        <v-card class="pa-8" elevation="2">
          <h1 class="text-h2 mb-6">MongoDB Configurator SPA</h1>
          <p class="text-h6 mb-8 text-medium-emphasis">Hello World - Ready for Phase 3 Development</p>
          
          <v-alert 
            :type="isLocal ? 'success' : 'warning'" 
            class="mb-6"
          >
            <template v-slot:title>
              {{ isLocal ? 'Edit Mode' : 'Read-Only Mode' }}
            </template>
            <p v-if="isLocal" class="mb-0">
              BUILT_AT: {{ builtAt }} - You can edit configurations
            </p>
            <p v-else class="mb-0">
              BUILT_AT: {{ builtAt }} - Read-only mode, no editing allowed
            </p>
          </v-alert>
          
          <v-btn 
            color="primary" 
            size="large"
            @click="loadConfig"
            :loading="loading"
            class="mt-4"
          >
            <v-icon start>mdi-refresh</v-icon>
            Load Configuration
          </v-btn>
          
          <div v-if="error" class="mt-4">
            <v-alert type="error">
              {{ error }}
            </v-alert>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useConfig } from '@/composables/useConfig'

const {
  loading,
  error,
  builtAt,
  isLocal,
  loadConfig
} = useConfig()

onMounted(() => {
  loadConfig()
})
</script> 