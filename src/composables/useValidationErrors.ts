import { ref } from 'vue'
import type { ValidationError } from '../types'

// Singleton state for validation errors
const validationErrors = ref<ValidationError[]>([])
const loading = ref(false)

export function useValidationErrors() {
  const setValidationErrors = (errors: ValidationError[]) => {
    validationErrors.value = errors
  }

  const clearValidationErrors = () => {
    validationErrors.value = []
  }

  const setLoading = (isLoading: boolean) => {
    loading.value = isLoading
  }

  return {
    validationErrors,
    loading,
    setValidationErrors,
    clearValidationErrors,
    setLoading
  }
} 