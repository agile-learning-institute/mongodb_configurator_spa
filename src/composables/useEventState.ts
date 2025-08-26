import { ref, reactive } from 'vue'
import type { ConfiguratorEvent } from '@/types/events'

interface EventViewerState {
  eventData: ConfiguratorEvent | null
  title: string
  subtitle: string
}

// Global state that persists across navigation
const eventViewerState = reactive<EventViewerState>({
  eventData: null,
  title: '',
  subtitle: ''
})

export function useEventState() {
  // Set event data for the event viewer
  const setEventViewerState = (event: ConfiguratorEvent, title: string, subtitle: string) => {
    eventViewerState.eventData = event
    eventViewerState.title = title
    eventViewerState.subtitle = subtitle
  }

  // Get current event viewer state
  const getEventViewerState = () => {
    return {
      eventData: eventViewerState.eventData,
      title: eventViewerState.title,
      subtitle: eventViewerState.subtitle
    }
  }

  // Clear event viewer state
  const clearEventViewerState = () => {
    eventViewerState.eventData = null
    eventViewerState.title = ''
    eventViewerState.subtitle = ''
  }

  // Check if there's event data available
  const hasEventData = () => {
    return eventViewerState.eventData !== null
  }

  return {
    setEventViewerState,
    getEventViewerState,
    clearEventViewerState,
    hasEventData,
    eventViewerState
  }
}
