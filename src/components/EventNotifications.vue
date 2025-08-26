<template>
  <div data-test="event-notifications">
    <!-- Global notifications -->
    <v-snackbar
      v-for="event in events"
      :key="event.id"
      :value="true"
      :color="event.type"
      :timeout="event.autoDismiss || -1"
      @input="removeEvent(event.id)"
      :class="{ 'dismissible': event.dismissible }"
      :data-test="`event-snackbar-${event.id}`"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-2" :data-test="`event-icon-${event.id}`">{{ eventIcon(event.type) }}</v-icon>
        <div>
          <div class="font-weight-bold" :data-test="`event-title-${event.id}`">{{ event.title }}</div>
          <div :data-test="`event-message-${event.id}`">{{ event.message }}</div>
          <div v-if="event.details" class="text-caption mt-1">
            <v-btn text small @click="showDetails(event)" :data-test="`view-details-btn-${event.id}`">
              View Details
            </v-btn>
          </div>
        </div>
      </div>
      
      <template v-slot:actions>
        <v-btn
          v-if="event.dismissible"
          text
          @click="removeEvent(event.id)"
          :data-test="`close-event-btn-${event.id}`"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
    
    <!-- Processing events panel -->
    <v-navigation-drawer
      v-model="showProcessingPanel"
      app
      right
      temporary
      width="400"
      data-test="processing-events-panel"
    >
      <v-card-title class="d-flex justify-space-between align-center" data-test="processing-events-title">
        Processing Events
        <v-btn icon small @click="showProcessingPanel = false" data-test="close-processing-panel-btn">
          <v-icon data-test="close-processing-panel-icon">mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      
      <v-card-text>
        <div v-if="processingEvents.length === 0" class="text-center pa-4" data-test="no-processing-events">
          <v-icon size="48" color="grey" data-test="no-processing-events-icon">mdi-check-circle</v-icon>
          <p class="mt-2" data-test="no-processing-events-message">No processing events</p>
        </div>
        
        <StatusCard
          v-for="event in processingEvents"
          :key="event.id"
          :title="event.title"
          :status="event.status"
          :message="event.message"
          :progress="event.progress"
          :details="event.details"
          @retry="retryProcessing(event.id)"
          @view="viewResults(event.id)"
          @dismiss="removeProcessingEvent(event.id)"
          :data-test="`processing-status-card-${event.id}`"
        />
      </v-card-text>
    </v-navigation-drawer>
    
    <!-- Details dialog -->
    <v-dialog v-model="detailsDialog.show" max-width="600" data-test="event-details-dialog">
      <v-card>
        <v-card-title data-test="event-details-title">{{ detailsDialog.title }}</v-card-title>
        <v-card-text>
          <pre class="text-caption" data-test="event-details-content">{{ detailsDialog.details }}</pre>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="detailsDialog.show = false" data-test="close-details-dialog-btn">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import StatusCard from './StatusCard.vue'

// Props for events data
interface Props {
  events?: any[]
  processingEvents?: any[]
}

withDefaults(defineProps<Props>(), {
  events: () => [],
  processingEvents: () => []
})

// Emits for event handling
const emit = defineEmits<{
  removeEvent: [id: string]
  removeProcessingEvent: [id: string]
  retryProcessing: [id: string]
  viewResults: [id: string]
}>()

const showProcessingPanel = ref(false)
const detailsDialog = ref({
  show: false,
  title: '',
  details: ''
})

const eventIcon = (type: string) => {
  switch (type) {
    case 'success':
      return 'mdi-check-circle'
    case 'error':
      return 'mdi-alert-circle'
    case 'warning':
      return 'mdi-alert'
    case 'info':
      return 'mdi-information'
    default:
      return 'mdi-information'
  }
}

const showDetails = (event: any) => {
  detailsDialog.value = {
    show: true,
    title: event.title,
    details: event.details
  }
}

const removeEvent = (id: string) => {
  emit('removeEvent', id)
}

const removeProcessingEvent = (id: string) => {
  emit('removeProcessingEvent', id)
}

const retryProcessing = (id: string) => {
  emit('retryProcessing', id)
}

const viewResults = (id: string) => {
  emit('viewResults', id)
}

// Expose panel toggle for parent components
defineExpose({
  toggleProcessingPanel: () => {
    showProcessingPanel.value = !showProcessingPanel.value
  }
})
</script>

<style scoped>
.dismissible {
  cursor: pointer;
}
</style> 