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

const processingResults = ref<ProcessingResponse | null>(null)

export function useProcessing() {
  const setProcessingResults = (results: ProcessingResponse) => {
    processingResults.value = results
  }

  const clearProcessingResults = () => {
    processingResults.value = null
  }

  return {
    processingResults,
    setProcessingResults,
    clearProcessingResults
  }
} 