import { describe, it, expect, beforeEach } from 'vitest'
import { useValidationErrors } from '../../src/composables/useValidationErrors'
import type { ValidationError } from '../../src/types'

describe('useValidationErrors', () => {
  beforeEach(() => {
    // Reset the composable state before each test
    const { clearValidationErrors } = useValidationErrors()
    clearValidationErrors()
  })

  it('should initialize with empty validation errors', () => {
    const { validationErrors, loading } = useValidationErrors()
    
    expect(validationErrors.value).toEqual([])
    expect(loading.value).toBe(false)
  })

  it('should set validation errors', () => {
    const { validationErrors, setValidationErrors } = useValidationErrors()
    
    const mockErrors: ValidationError[] = [
      {
        error: 'invalid_config_format',
        error_id: 'CFG-101',
        message: 'Configuration must be a dictionary',
        file: 'test.yaml'
      },
      {
        error: 'missing_required_field',
        error_id: 'CFG-201',
        message: 'Configuration must include name field',
        file: 'test.yaml',
        field: 'name'
      }
    ]
    
    setValidationErrors(mockErrors)
    
    expect(validationErrors.value).toEqual(mockErrors)
    expect(validationErrors.value).toHaveLength(2)
  })

  it('should clear validation errors', () => {
    const { validationErrors, setValidationErrors, clearValidationErrors } = useValidationErrors()
    
    const mockErrors: ValidationError[] = [
      {
        error: 'invalid_config_format',
        error_id: 'CFG-101',
        message: 'Configuration must be a dictionary'
      }
    ]
    
    setValidationErrors(mockErrors)
    expect(validationErrors.value).toHaveLength(1)
    
    clearValidationErrors()
    expect(validationErrors.value).toEqual([])
  })

  it('should set loading state', () => {
    const { loading, setLoading } = useValidationErrors()
    
    expect(loading.value).toBe(false)
    
    setLoading(true)
    expect(loading.value).toBe(true)
    
    setLoading(false)
    expect(loading.value).toBe(false)
  })

  it('should maintain singleton state across multiple calls', () => {
    const { validationErrors, setValidationErrors } = useValidationErrors()
    const { validationErrors: validationErrors2, setValidationErrors: setValidationErrors2 } = useValidationErrors()
    
    const mockErrors: ValidationError[] = [
      {
        error: 'test_error',
        error_id: 'TEST-001',
        message: 'Test error message'
      }
    ]
    
    setValidationErrors(mockErrors)
    
    expect(validationErrors.value).toEqual(mockErrors)
    expect(validationErrors2.value).toEqual(mockErrors)
  })
}) 