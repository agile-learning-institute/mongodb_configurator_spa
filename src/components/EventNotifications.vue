<template>
  <div>
    <!-- Global notifications -->
    <v-snackbar
      v-for="event in events"
      :key="event.id"
      :value="true"
      :color="event.type"
      :timeout="event.autoDismiss || -1"
      @input="removeEvent(event.id)"
      :class="{ 'dismissible': event.dismissible }"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-2">{{ eventIcon(event.type) }}</v-icon>
        <div>
          <div class="font-weight-bold">{{ event.title }}</div>
          <div>{{ event.message }}</div>
          <div v-if="event.details" class="text-caption mt-1">
            <v-btn text small @click="showDetails(event)">
              View Details
            </v-btn>
          </div>
        </div>
      </div>
      
      <template v-slot:action="{ attrs }">
        <v-btn
          v-if="event.dismissible"
          text
          v-bind="attrs"
          @click="removeEvent(event.id)"
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
    >
      <v-card-title class="d-flex justify-space-between align-center">
        Processing Events
        <v-btn icon small @click="showProcessingPanel = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      
      <v-card-text>
        <div v-if="processingEvents.length === 0" class="text-center pa-4">
          <v-icon size="48" color="grey">mdi-check-circle</v-icon>
          <p class="mt-2">No processing events</p>
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
        />
      </v-card-text>
    </v-navigation-drawer>
    
    <!-- Details dialog -->
    <v-dialog v-model="detailsDialog.show" max-width="600">
      <v-card>
        <v-card-title>{{ detailsDialog.title }}</v-card-title>
        <v-card-text>
          <pre class="text-caption">{{ detailsDialog.details }}</pre>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="detailsDialog.show = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { injectEvents } from '@/composables/useEvents'
import StatusCard from './StatusCard.vue'

const events = injectEvents()

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

const retryProcessing = (id: string) => {
  // Emit retry event for parent to handle
  events.removeProcessingEvent(id)
}

const viewResults = (id: string) => {
  // Emit view results event for parent to handle
  events.removeProcessingEvent(id)
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