<template>
  <v-card class="event-card mb-3" :class="getStatusClass()">
    <v-card-title class="d-flex align-center py-3">
      <div class="d-flex align-center flex-grow-1">
        <!-- Status Icon -->
        <v-icon 
          :color="getStatusColor()" 
          class="mr-3"
          size="20"
        >
          {{ getStatusIcon() }}
        </v-icon>
        
        <!-- Event Type and ID -->
        <div class="flex-grow-1">
          <div class="text-subtitle-1 font-weight-medium">
            {{ event.type }}
          </div>
          <div class="text-caption text-medium-emphasis">
            {{ event.id }}
          </div>
        </div>
      </div>
      
      <!-- Status Badge -->
      <v-chip
        :color="getStatusColor()"
        size="small"
        variant="tonal"
        class="ml-2"
      >
        {{ event.status }}
      </v-chip>
    </v-card-title>
    
    <v-card-text class="pt-0 pb-3">
      <!-- Timestamps -->
      <div class="d-flex align-center mb-3">
        <v-icon size="16" color="grey" class="mr-2">mdi-clock-outline</v-icon>
        <span class="text-caption text-medium-emphasis">
          Started: {{ formatDateTime(event.starts) }}
        </span>
        <v-spacer />
        <span v-if="event.ends" class="text-caption text-medium-emphasis">
          Ended: {{ formatDateTime(event.ends) }}
        </span>
        <span v-else class="text-caption text-warning">
          In Progress...
        </span>
      </div>
      
      <!-- Event Data -->
      <div v-if="event.data" class="mb-3">
        <div class="text-caption text-medium-emphasis mb-1">Event Data:</div>
        <v-card variant="outlined" class="pa-2">
          <pre class="text-caption mb-0" style="white-space: pre-wrap; font-family: monospace;">{{ JSON.stringify(event.data, null, 2) }}</pre>
        </v-card>
      </div>
      
      <!-- Sub-events -->
      <div v-if="event.sub_events && event.sub_events.length > 0" class="mt-3">
        <div class="d-flex align-center justify-space-between mb-2">
          <div class="text-caption text-medium-emphasis">
            Sub-events ({{ event.sub_events.length }}):
          </div>
          <v-btn
            size="small"
            variant="text"
            @click="subEventsExpanded = !subEventsExpanded"
            class="text-caption"
          >
            <v-icon size="16" class="mr-1">
              {{ subEventsExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
            </v-icon>
            {{ subEventsExpanded ? 'Collapse' : 'Expand' }}
          </v-btn>
        </div>
        
        <!-- Sub-events Summary (always visible) -->
        <div class="mb-2">
          <div class="d-flex flex-wrap gap-1">
            <v-chip
              v-for="subEvent in event.sub_events"
              :key="subEvent.id"
              :color="getSubEventStatusColor(subEvent.status)"
              size="x-small"
              variant="tonal"
              class="text-caption"
            >
              <v-icon size="12" class="mr-1">
                {{ getSubEventStatusIcon(subEvent.status) }}
              </v-icon>
              {{ subEvent.type }}
            </v-chip>
          </div>
        </div>
        
        <!-- Expanded Sub-events -->
        <v-expand-transition>
          <div v-if="subEventsExpanded" class="ml-4">
            <EventCard
              v-for="subEvent in event.sub_events"
              :key="subEvent.id"
              :event="subEvent"
              class="mb-2"
            />
          </div>
        </v-expand-transition>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ConfiguratorEvent } from '@/types/events'

interface Props {
  event: ConfiguratorEvent
}

const props = defineProps<Props>()

// Sub-events expansion state (start collapsed)
const subEventsExpanded = ref(false)

// Format datetime for display
const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString()
}

// Get status color
const getStatusColor = () => {
  switch (props.event.status) {
    case 'SUCCESS':
      return 'success'
    case 'FAILURE':
      return 'error'
    case 'PENDING':
      return 'warning'
    default:
      return 'grey'
  }
}

// Get status icon
const getStatusIcon = () => {
  switch (props.event.status) {
    case 'SUCCESS':
      return 'mdi-check-circle'
    case 'FAILURE':
      return 'mdi-alert-circle'
    case 'PENDING':
      return 'mdi-clock'
    default:
      return 'mdi-help-circle'
  }
}

// Get sub-event status color
const getSubEventStatusColor = (status: string) => {
  switch (status) {
    case 'SUCCESS':
      return 'success'
    case 'FAILURE':
      return 'error'
    case 'PENDING':
      return 'warning'
    default:
      return 'grey'
  }
}

// Get sub-event status icon
const getSubEventStatusIcon = (status: string) => {
  switch (status) {
    case 'SUCCESS':
      return 'mdi-check'
    case 'FAILURE':
      return 'mdi-alert'
    case 'PENDING':
      return 'mdi-clock'
    default:
      return 'mdi-help'
  }
}

// Get status class for card styling
const getStatusClass = () => {
  switch (props.event.status) {
    case 'SUCCESS':
      return 'event-success'
    case 'FAILURE':
      return 'event-failure'
    case 'PENDING':
      return 'event-pending'
    default:
      return ''
  }
}
</script>

<style scoped>
.event-card {
  border-left: 4px solid transparent;
  transition: all 0.2s ease;
}

.event-success {
  border-left-color: rgb(76, 175, 80);
  background-color: rgba(76, 175, 80, 0.05);
}

.event-failure {
  border-left-color: rgb(244, 67, 54);
  background-color: rgba(244, 67, 54, 0.05);
}

.event-pending {
  border-left-color: rgb(255, 152, 0);
  background-color: rgba(255, 152, 0, 0.05);
}

.event-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

pre {
  font-size: 0.75rem;
  line-height: 1.4;
  max-height: 200px;
  overflow-y: auto;
}
</style> 