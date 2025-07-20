import { ref } from 'vue'

// Validation error type
export interface ValidationError {
  error: string
  error_id: string
  message: string
  file?: string
  field?: string
}

// Singleton state
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