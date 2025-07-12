<template>
  <v-container>
    <!-- Loading state -->
    <div v-if="loading" class="d-flex justify-center align-center pa-8">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="pa-4">
      <v-alert type="error">
        {{ error }}
        <v-btn @click="loadEvents" class="mt-2">Retry</v-btn>
      </v-alert>
    </div>

    <!-- Events display -->
    <div v-else>
      <!-- Header -->
      <div class="d-flex justify-space-between align-center mb-6">
        <div>
          <h1 class="text-h4">Events</h1>
          <p class="text-body-1 text-medium-emphasis">Processing and validation events</p>
        </div>
        <div class="d-flex align-center">
          <v-btn
            color="primary"
            @click="loadEvents"
            :loading="loading"
            class="mr-2"
          >
            <v-icon start>mdi-refresh</v-icon>
            Refresh
          </v-btn>
          <v-btn
            color="secondary"
            @click="clearEvents"
            :disabled="!events.length"
          >
            <v-icon start>mdi-delete-sweep</v-icon>
            Clear All
          </v-btn>
        </div>
      </div>

      <!-- Events list -->
      <div v-if="events.length > 0">
        <div class="d-flex align-center mb-4">
          <v-chip
            color="primary"
            variant="tonal"
            class="mr-2"
          >
            {{ events.length }} Event{{ events.length === 1 ? '' : 's' }}
          </v-chip>
          <v-chip
            v-if="pendingCount > 0"
            color="warning"
            variant="tonal"
            class="mr-2"
          >
            {{ pendingCount }} Pending
          </v-chip>
          <v-chip
            v-if="successCount > 0"
            color="success"
            variant="tonal"
            class="mr-2"
          >
            {{ successCount }} Success
          </v-chip>
          <v-chip
            v-if="failureCount > 0"
            color="error"
            variant="tonal"
          >
            {{ failureCount }} Failed
          </v-chip>
        </div>

        <div>
          <EventCard
            v-for="event in events"
            :key="event.id"
            :event="event"
          />
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center pa-8">
        <v-icon size="64" color="grey">mdi-calendar-clock</v-icon>
        <div class="text-h6 mt-4">No Events</div>
        <div class="text-body-2 text-medium-emphasis mt-2">
          Events will appear here when processing operations are performed
        </div>
      </div>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { apiService } from '@/utils/api'
import EventCard from '@/components/EventCard.vue'
import type { ConfiguratorEvent } from '@/types/events'

const loading = ref(false)
const error = ref<string | null>(null)
const events = ref<ConfiguratorEvent[]>([])

// Computed properties for event counts
const pendingCount = computed(() => 
  events.value.filter(e => e.status === 'PENDING').length
)

const successCount = computed(() => 
  events.value.filter(e => e.status === 'SUCCESS').length
)

const failureCount = computed(() => 
  events.value.filter(e => e.status === 'FAILURE').length
)

// Load events
const loadEvents = async () => {
  loading.value = true
  error.value = null
  
  try {
    // Note: This endpoint doesn't exist yet, we'll need to implement it
    // For now, we'll use a mock or placeholder
    const data = await apiService.getEvents()
    events.value = data.events || []
  } catch (err: any) {
    error.value = err.message || 'Failed to load events'
    console.error('Failed to load events:', err)
  } finally {
    loading.value = false
  }
}

// Clear all events
const clearEvents = async () => {
  try {
    await apiService.clearEvents()
    events.value = []
  } catch (err: any) {
    error.value = err.message || 'Failed to clear events'
    console.error('Failed to clear events:', err)
  }
}

// Load events on mount
onMounted(() => {
  loadEvents()
})
</script> 