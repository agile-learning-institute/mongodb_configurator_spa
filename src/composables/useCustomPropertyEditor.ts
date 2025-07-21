import { computed } from 'vue'
import type { Property } from './usePropertyEditor'

export function useCustomPropertyEditor(property: Property, emit: (event: string, ...args: any[]) => void) {
  const isRoot = computed(() => false)

  function handleChange() {
    emit('change', property)
  }

  function handleTypeChange(type: string) {
    property.type = type
    if (type === 'array') {
      property.items = {
        type: 'word',
        description: '',
        required: false
      }
    }
    handleChange()
  }

  function handlePropertyNameChange() {
    handleChange()
  }

  function handleDelete() {
    emit('delete')
  }

  return {
    isRoot,
    handleChange,
    handleTypeChange,
    handlePropertyNameChange,
    handleDelete
  }
} 