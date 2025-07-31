<template>
  <v-dialog v-model="show" max-width="800" persistent>
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon 
          :color="getStatusColor()" 
          class="mr-3"
          size="24"
        >
          {{ getStatusIcon() }}
        </v-icon>
        <div class="flex-grow-1">
          <div class="text-h6">{{ title }}</div>
          <div class="text-caption text-medium-emphasis">{{ subtitle }}</div>
        </div>
        <v-btn
          icon
          variant="text"
          @click="close"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      
      <v-card-text class="pt-0">
        <div v-if="event">
          <EventCard :event="event" />
        </div>
        <div v-else class="text-center pa-4">
          <v-icon size="48" color="grey">mdi-alert-circle</v-icon>
          <div class="text-h6 mt-4">Error</div>
          <div class="text-body-2 text-medium-emphasis mt-2">
            {{ message }}
          </div>
        </div>
      </v-card-text>
      
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="primary"
          @click="close"
        >
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import EventCard from './EventCard.vue'
import type { ConfiguratorEvent } from '@/types/events'

interface Props {
  modelValue: boolean
  event?: ConfiguratorEvent | null
  message?: string
  title?: string
  subtitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  message: 'An error occurred',
  title: 'Event Details',
  subtitle: 'Processing or error information'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const close = () => {
  show.value = false
}

// Get status color
const getStatusColor = () => {
  if (!props.event) return 'error'
  
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
  if (!props.event) return 'mdi-alert-circle'
  
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
</script> 