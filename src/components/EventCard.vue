<template>
  <BaseCard 
    :title="event.type"
    :icon="getStatusIcon()"
    class="event-card mb-3"
    :class="getStatusClass()"
  >
    <template #header-actions>
      <div class="d-flex align-center flex-grow-1">
        <div class="flex-grow-1">
          <div class="text-subtitle-1 font-weight-medium text-white">
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
      
      <!-- Remove Button (only show if not a sub-event) -->
      <v-btn
        v-if="!isSubEvent"
        icon
        size="small"
        variant="text"
        color="white"
        @click="$emit('remove', event.id)"
        class="ml-2"
      >
        <v-icon size="16">mdi-close</v-icon>
      </v-btn>
    </template>

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
            :is-sub-event="true"
            class="mb-2"
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