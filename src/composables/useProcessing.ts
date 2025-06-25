import { ref } from 'vue'

interface ProcessingResponse {
  collection: string
  operations: Array<{
    operation: string
    status: 'success' | 'error' | 'skipped'
    collection?: string
    message?: string
    details_type?: string
    details?: any
  }>
  status: 'success' | 'error' | 'skipped'
}

const processingResults = ref<ProcessingResponse[]>([])

export function useProcessing() {
  const setProcessingResults = (results: ProcessingResponse | ProcessingResponse[]) => {
    // Normalize to always be an array
    processingResults.value = Array.isArray(results) ? results : [results]
  }

  const clearProcessingResults = () => {
    processingResults.value = []
  }

  return {
    processingResults,
    setProcessingResults,
    clearProcessingResults
  }
} 