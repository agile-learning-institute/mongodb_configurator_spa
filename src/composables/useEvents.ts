import { ref } from 'vue'

export interface Event {
  id: string
  type: string
  status: 'PENDING' | 'SUCCESS' | 'FAILURE'
  data?: any
  starts?: string
  ends?: string
  sub_events?: Event[]
}

export interface EventDialog {
  isOpen: boolean
  event: Event | null
  title: string
}

export function useEvents() {
  const eventDialog = ref<EventDialog>({
    isOpen: false,
    event: null,
    title: '',
  })

  // Show event dialog for API errors or processing events
  const showEventDialog = (event: Event, title: string = 'Event Details') => {
    eventDialog.value = {
      isOpen: true,
      event,
      title,
    }
  }

  // Close event dialog
  const closeEventDialog = () => {
    eventDialog.value.isOpen = false
    eventDialog.value.event = null
    eventDialog.value.title = ''
  }

  // Handle API errors (500 responses with Event objects)
  const handleApiError = (error: any) => {
    if (error.type === 'API_ERROR' && error.data) {
      showEventDialog(error.data, 'API Error')
      return true
    }
    return false
  }

  // Handle processing events
  const handleProcessingEvent = (event: Event) => {
    showEventDialog(event, 'Processing Event')
  }

  return {
    eventDialog,
    showEventDialog,
    closeEventDialog,
    handleApiError,
    handleProcessingEvent,
  }
} 