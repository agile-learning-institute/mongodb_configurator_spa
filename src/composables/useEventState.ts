import { reactive } from 'vue'
import type { ConfiguratorEvent } from '@/types/events'

interface EventViewerState {
  eventData: ConfiguratorEvent | null
  title: string
  subtitle: string
}

// Global state that persists across navigation - use module-level variables
const eventViewerState = reactive<EventViewerState>({
  eventData: null,
  title: '',
  subtitle: ''
})

// Singleton instance to ensure state persistence
let instance: ReturnType<typeof createEventState> | null = null

function createEventState() {
  // Set event data for the event viewer
  const setEventViewerState = (event: ConfiguratorEvent, title: string, subtitle: string) => {
    console.log('Setting event viewer state:', { event, title, subtitle })
    eventViewerState.eventData = event
    eventViewerState.title = title
    eventViewerState.subtitle = subtitle
  }

  // Get current event viewer state
  const getEventViewerState = () => {
    console.log('Getting event viewer state:', eventViewerState)
    return {
      eventData: eventViewerState.eventData,
      title: eventViewerState.title,
      subtitle: eventViewerState.subtitle
    }
  }

  // Clear event viewer state - only call this when new configuration actions occur
  const clearEventViewerState = () => {
    console.log('Clearing event viewer state')
    eventViewerState.eventData = null
    eventViewerState.title = ''
    eventViewerState.subtitle = ''
  }

  // Check if there's event data available
  const hasEventData = () => {
    const hasData = eventViewerState.eventData !== null
    console.log('Checking if event data exists:', hasData, eventViewerState)
    return hasData
  }

  return {
    setEventViewerState,
    getEventViewerState,
    clearEventViewerState,
    hasEventData,
    eventViewerState
  }
}

export function useEventState() {
  if (!instance) {
    instance = createEventState()
  }
  return instance
}
