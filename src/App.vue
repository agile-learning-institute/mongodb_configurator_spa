<template>
  <AppLayout>
    <template #default>
      <div v-if="config?.loading" class="d-flex justify-center align-center" style="height: 100vh;">
        <v-progress-circular indeterminate size="64"></v-progress-circular>
      </div>
      
      <div v-else-if="config?.error" class="d-flex justify-center align-center" style="height: 100vh;">
        <v-alert type="error" max-width="500">
          <template v-slot:title>Configuration Error</template>
          {{ config.error }}
          <v-btn @click="config?.loadConfig" class="mt-2">Retry</v-btn>
        </v-alert>
      </div>
      
      <div v-else>
        <router-view />
      </div>
    </template>
  </AppLayout>
  
  <!-- Global event notifications -->
  <EventNotifications ref="eventNotifications" />
</template>

<script setup lang="ts">
import { onMounted, inject, ref } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import EventNotifications from '@/components/EventNotifications.vue'

// Inject global config
const config = inject('config')
const eventNotifications = ref()

// Load configuration on app startup
onMounted(() => {
  if (config) {
    config.loadConfig()
  }
})
</script>

<style>
/* Global styles */
</style> 