import { ref } from 'vue'
import { collectionsApi } from '../utils/api'
import type { Collection, ValidationError } from '../types'
import { useValidationErrors } from './useValidationErrors'

// Singleton state
const collections = ref<Collection[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const { setValidationErrors, clearValidationErrors } = useValidationErrors()

const fetchCollections = async () => {
  loading.value = true
  error.value = null
  clearValidationErrors()
  
  try {
    const data = await collectionsApi.getCollections()
    collections.value = data
  } catch (err: any) {
    console.error('Error fetching collections:', err)
    if (err.validationErrors) {
      setValidationErrors(err.validationErrors)
      error.value = `Validation errors found (${err.validationErrors.length} errors)`
    } else {
      error.value = err instanceof Error ? err.message : 'Unknown error'
    }
  } finally {
    loading.value = false
  }
}

export function useCollections() {
  return {
    collections,
    loading,
    error,
    fetchCollections
  }
} 