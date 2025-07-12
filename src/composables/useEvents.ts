import { ref, provide, inject } from 'vue'

interface Event {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  details?: string
  timestamp: Date
  dismissible?: boolean
  autoDismiss?: number
}

interface ProcessingEvent {
  id: string
  title: string
  status: 'pending' | 'processing' | 'completed' | 'error' | 'cancelled'
  message?: string
  progress?: number
  details?: string
  timestamp: Date
}

const events = ref<Event[]>([])
const processingEvents = ref<ProcessingEvent[]>([])

export function useEvents() {
  const addEvent = (event: Omit<Event, 'id' | 'timestamp'>) => {
    const newEvent: Event = {
      ...event,
      id: Date.now().toString(),
      timestamp: new Date()
    }
    
    events.value.unshift(newEvent)
    
    // Auto dismiss if specified
    if (event.autoDismiss) {
      setTimeout(() => {
        removeEvent(newEvent.id)
      }, event.autoDismiss)
    }
  }
  
  const removeEvent = (id: string) => {
    const index = events.value.findIndex(e => e.id === id)
    if (index > -1) {
      events.value.splice(index, 1)
    }
  }
  
  const clearEvents = () => {
    events.value = []
  }
  
  const addProcessingEvent = (event: Omit<ProcessingEvent, 'id' | 'timestamp'>) => {
    const newEvent: ProcessingEvent = {
      ...event,
      id: Date.now().toString(),
      timestamp: new Date()
    }
    
    processingEvents.value.unshift(newEvent)
    return newEvent.id
  }
  
  const updateProcessingEvent = (id: string, updates: Partial<ProcessingEvent>) => {
    const event = processingEvents.value.find(e => e.id === id)
    if (event) {
      Object.assign(event, updates)
    }
  }
  
  const removeProcessingEvent = (id: string) => {
    const index = processingEvents.value.findIndex(e => e.id === id)
    if (index > -1) {
      processingEvents.value.splice(index, 1)
    }
  }
  
  const clearProcessingEvents = () => {
    processingEvents.value = []
  }
  
  // Convenience methods
  const showSuccess = (title: string, message: string, options?: Partial<Event>) => {
    addEvent({
      type: 'success',
      title,
      message,
      autoDismiss: 5000,
      ...options
    })
  }
  
  const showError = (title: string, message: string, details?: string, options?: Partial<Event>) => {
    addEvent({
      type: 'error',
      title,
      message,
      details,
      dismissible: true,
      ...options
    })
  }
  
  const showWarning = (title: string, message: string, options?: Partial<Event>) => {
    addEvent({
      type: 'warning',
      title,
      message,
      autoDismiss: 8000,
      ...options
    })
  }
  
  const showInfo = (title: string, message: string, options?: Partial<Event>) => {
    addEvent({
      type: 'info',
      title,
      message,
      autoDismiss: 4000,
      ...options
    })
  }
  
  return {
    events: events.value,
    processingEvents: processingEvents.value,
    addEvent,
    removeEvent,
    clearEvents,
    addProcessingEvent,
    updateProcessingEvent,
    removeProcessingEvent,
    clearProcessingEvents,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}

// Provide/inject pattern for global access
export function provideEvents() {
  const events = useEvents()
  provide('events', events)
  return events
}

export function injectEvents() {
  return inject('events') as ReturnType<typeof useEvents>
} 