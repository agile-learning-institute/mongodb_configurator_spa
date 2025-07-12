<template>
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
</template>

<script setup lang="ts">
import { inject } from 'vue'

// Inject global config
const config = inject('config')

const isLocal = config?.isLocal
const builtAt = config?.builtAt
</script> 