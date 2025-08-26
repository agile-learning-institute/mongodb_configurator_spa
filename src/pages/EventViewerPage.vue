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
        <v-btn @click="loadEvent" class="mt-2">Retry</v-btn>
      </v-alert>
    </div>

    <!-- Event display -->
    <div v-else-if="event">
      <!-- Header -->
      <div class="d-flex justify-space-between align-center mb-6">
        <div>
          <h1 class="text-h4">{{ title }}</h1>
          <p class="text-body-1 text-medium-emphasis">{{ subtitle }}</p>
        </div>
        <div class="d-flex align-center">
          <v-btn
            color="secondary"
            variant="outlined"
            @click="goBack"
          >
            <v-icon start>mdi-arrow-left</v-icon>
            Back
          </v-btn>
        </div>
      </div>

      <!-- Event Card -->
      <EventCard :event="event" />
    </div>

    <!-- No event state -->
    <div v-else class="text-center pa-8">
      <v-icon size="64" color="grey">mdi-alert-circle</v-icon>
      <div class="text-h6 mt-4">No Event Data</div>
      <div class="text-body-2 text-medium-emphasis mt-2">
        No event data was provided. Please return to the previous page.
      </div>
      <v-btn @click="goBack" class="mt-4">
        <v-icon start>mdi-arrow-left</v-icon>
        Go Back
      </v-btn>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEventState } from '@/composables/useEventState'
import type { ConfiguratorEvent } from '@/types/events'
import EventCard from '@/components/EventCard.vue'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref<string | null>(null)
const event = ref<ConfiguratorEvent | null>(null)
const title = ref('Event Details')
const subtitle = ref('Processing or error information')
const previousPage = ref<string | null>(null)

const loadEvent = () => {
  loading.value = true
  error.value = null
  
  try {
    // Get event data from global state
    const { getEventViewerState, hasEventData } = useEventState()
    
    let eventData: ConfiguratorEvent | null = null
    let eventTitle = 'Event Details'
    let eventSubtitle = 'Processing or error information'
    
    if (hasEventData()) {
      const state = getEventViewerState()
      eventData = state.eventData
      eventTitle = state.title
      eventSubtitle = state.subtitle
      // Set previous page to configurations as default
      previousPage.value = '/configurations'
    } else {
      // Fallback to route state for backward compatibility
      const routeState = route.meta?.state || history.state
      if (routeState && routeState.eventData) {
        eventData = routeState.eventData
        eventTitle = routeState.title || 'Event Details'
        eventSubtitle = routeState.subtitle || 'Processing or error information'
      } else {
        // Fallback to query parameters (for backward compatibility)
        const queryEventData = route.params.eventData || route.query.eventData
        
        if (!queryEventData) {
          error.value = 'No event data provided'
          loading.value = false
          return
        }
        
        // Parse event data from query parameters
        eventData = typeof queryEventData === 'string' ? JSON.parse(queryEventData) : queryEventData
        eventTitle = (route.params.title as string) || (route.query.title as string) || 'Event Details'
        eventSubtitle = (route.params.subtitle as string) || (route.query.subtitle as string) || 'Processing or error information'
      }
    }
    
    if (eventData) {
      event.value = eventData
      title.value = eventTitle
      subtitle.value = eventSubtitle
    } else {
      error.value = 'Invalid event data'
    }
  } catch (err: any) {
    console.error('Failed to load event:', err)
    error.value = err.message || 'Failed to load event data'
  } finally {
    loading.value = false
  }
}

// Go back function
const goBack = () => {
  // Don't clear event state when leaving - let it persist for next visit
  if (previousPage.value) {
    router.push(previousPage.value)
  } else {
    router.push('/configurations')
  }
}

// Don't clear event state on unmount - let it persist for navigation
// onUnmounted(() => {
//   const { clearEventViewerState } = useEventState()
//   clearEventViewerState()
// })

// Load event on mount
onMounted(() => {
  loadEvent()
})
</script>

<style scoped>
/* Add any specific styles for the event viewer page */
</style> 