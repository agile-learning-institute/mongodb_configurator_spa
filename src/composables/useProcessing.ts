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
    console.log('Setting processing results:', results)
    processingResults.value = results
    console.log('Processing results after set:', processingResults.value)
  }

  const clearProcessingResults = () => {
    console.log('Clearing processing results')
    processingResults.value = null
  }

  return {
    processingResults,
    setProcessingResults,
    clearProcessingResults
  }
} 