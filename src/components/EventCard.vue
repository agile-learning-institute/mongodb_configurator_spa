<template>
  <BaseCard 
    :title="event.type"
    :icon="getStatusIcon()"
    class="event-card mb-3"
    :class="getStatusClass()"
    :data-test="`event-card-${event.id}`"
  >
    <template #title>
      <div class="d-flex align-center">
        <!-- Show/Hide Button (only for events with sub-events) -->
        <v-btn
          v-if="event.sub_events && event.sub_events.length > 0"
          size="small"
          variant="text"
          color="white"
          @click="subEventsExpanded = !subEventsExpanded"
          class="mr-3"
          data-test="expand-collapse-btn"
        >
          <v-icon size="24" data-test="expand-collapse-icon">
            {{ subEventsExpanded ? 'mdi-eye-off' : 'mdi-eye' }}
          </v-icon>
        </v-btn>
        
        <!-- Event ID Title -->
        <span class="text-h6 font-weight-medium text-white" data-test="event-id-title">
          {{ event.id }}
        </span>
      </div>
    </template>
    <template #header-actions>
      <div class="d-flex align-center flex-grow-1">
        <div class="flex-grow-1">
          <div class="text-h6 font-weight-medium text-white text-right" data-test="event-type">
            {{ event.type }}
          </div>
        </div>
      </div>
      
      <!-- Status Badge -->
      <v-chip
        :color="getStatusColor()"
        size="small"
        variant="tonal"
        class="ml-2"
        data-test="event-status-chip"
      >
        {{ event.status }}
      </v-chip>
    </template>

    <!-- Timestamps -->
    <div class="d-flex align-center mb-3" data-test="event-timestamps">
      <v-icon size="16" color="grey" class="mr-2" data-test="timestamp-icon">mdi-clock-outline</v-icon>
      <span class="text-caption text-medium-emphasis" data-test="start-time">
        Started: {{ formatDateTime(event.starts) }}
      </span>
      <v-spacer />
      <span v-if="event.ends" class="text-caption text-medium-emphasis" data-test="end-time">
        Ended: {{ formatDateTime(event.ends) }}
      </span>
      <span v-else class="text-caption text-warning" data-test="in-progress">
        In Progress...
      </span>
    </div>
    
    <!-- Event Data -->
    <div v-if="event.data" class="mb-3" data-test="event-data">
      <div class="text-caption text-medium-emphasis mb-1" data-test="event-data-label">Event Data:</div>
      <v-card variant="outlined" class="pa-2" data-test="event-data-content">
        <pre class="text-caption mb-0" style="white-space: pre-wrap; font-family: monospace;" data-test="event-data-json">{{ JSON.stringify(event.data, null, 2) }}</pre>
      </v-card>
    </div>
    
    <!-- Sub-events -->
    <div v-if="event.sub_events && event.sub_events.length > 0" class="mt-3" data-test="sub-events-section">
      <div class="d-flex align-center justify-space-between mb-2">
        <div class="text-caption text-medium-emphasis" data-test="sub-events-count">
          Sub-events ({{ event.sub_events.length }}):
        </div>
      </div>
      
      <!-- Sub-events Summary (always visible) -->
      <div class="mb-2" data-test="sub-events-summary">
        <div class="d-flex flex-wrap gap-1">
          <v-chip
            v-for="subEvent in event.sub_events"
            :key="subEvent.id"
            :color="getSubEventStatusColor(subEvent.status)"
            size="x-small"
            variant="tonal"
            class="text-caption"
            :data-test="`sub-event-chip-${subEvent.id}`"
          >
            <v-icon size="12" class="mr-1" :data-test="`sub-event-icon-${subEvent.id}`">
              {{ getSubEventStatusIcon(subEvent.status) }}
            </v-icon>
            <span :data-test="`sub-event-type-${subEvent.id}`">{{ subEvent.type }}</span>
          </v-chip>
        </div>
      </div>
      
      <!-- Expanded Sub-events -->
      <v-expand-transition>
        <div v-if="subEventsExpanded" class="ml-4" data-test="expanded-sub-events">
          <EventCard
            v-for="subEvent in event.sub_events"
            :key="subEvent.id"
            :event="subEvent"
            :is-sub-event="true"
            :data-test="`sub-event-card-${subEvent.id}`"
          />
        </div>
      </v-expand-transition>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ConfiguratorEvent } from '@/types/events'
import BaseCard from './BaseCard.vue'

interface Props {
  event: ConfiguratorEvent
  isSubEvent?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isSubEvent: false
})

defineEmits<{
  remove: [eventId: string]
}>()

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
  box-shadow: 0 4px 8px rgba(46, 125, 50, 0.15);
}

pre {
  font-size: 0.75rem;
  line-height: 1.4;
  margin: 0;
}
</style> 