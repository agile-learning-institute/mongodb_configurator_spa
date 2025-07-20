import { ref } from 'vue'
import type { ConfiguratorEvent } from '@/types/events'

const showEventDialog = ref(false)
const currentEvent = ref<ConfiguratorEvent | null>(null)
const eventMessage = ref('')
const eventTitle = ref('Event Details')
const eventSubtitle = ref('Processing or error information')

// Event storage for EventsPage
const storedEvents = ref<ConfiguratorEvent[]>([])

export function useEvents() {
  const showEvent = (event: ConfiguratorEvent, title?: string, subtitle?: string) => {
    currentEvent.value = event
    eventTitle.value = title || 'Event Details'
    eventSubtitle.value = subtitle || 'Processing or error information'
    showEventDialog.value = true
    
    // Store the event for the EventsPage
    storedEvents.value.unshift(event)
    
    // Keep only the last 100 events
    if (storedEvents.value.length > 100) {
      storedEvents.value = storedEvents.value.slice(0, 100)
    }
  }
  
  const showError = (message: string, title?: string, subtitle?: string) => {
    currentEvent.value = null
    eventMessage.value = message
    eventTitle.value = title || 'Error'
    eventSubtitle.value = subtitle || 'An error occurred'
    showEventDialog.value = true
  }
  
  const hideEvent = () => {
    showEventDialog.value = false
    currentEvent.value = null
    eventMessage.value = ''
  }
  
  const clearEvents = () => {
    storedEvents.value = []
  }
  
  const removeEvent = (eventId: string) => {
    const index = storedEvents.value.findIndex(e => e.id === eventId)
    if (index !== -1) {
      storedEvents.value.splice(index, 1)
    }
  }
  
  return {
    showEventDialog,
    currentEvent,
    eventMessage,
    eventTitle,
    eventSubtitle,
    storedEvents,
    showEvent,
    showError,
    hideEvent,
    clearEvents,
    removeEvent
  }
} 