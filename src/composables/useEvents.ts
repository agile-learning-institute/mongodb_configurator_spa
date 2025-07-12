import { ref } from 'vue'
import type { ConfiguratorEvent } from '@/types/events'

const showEventDialog = ref(false)
const currentEvent = ref<ConfiguratorEvent | null>(null)
const eventMessage = ref('')
const eventTitle = ref('Event Details')
const eventSubtitle = ref('Processing or error information')

export function useEvents() {
  const showEvent = (event: ConfiguratorEvent, title?: string, subtitle?: string) => {
    currentEvent.value = event
    eventTitle.value = title || 'Event Details'
    eventSubtitle.value = subtitle || 'Processing or error information'
    showEventDialog.value = true
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

  return {
    showEventDialog,
    currentEvent,
    eventMessage,
    eventTitle,
    eventSubtitle,
    showEvent,
    showError,
    hideEvent
  }
} 