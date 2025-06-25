import { ref } from 'vue'
import type { ProcessingResult } from '../types'

const processingResults = ref<ProcessingResult[]>([])

export function useProcessing() {
  const setProcessingResults = (results: ProcessingResult[]) => {
    processingResults.value = results
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