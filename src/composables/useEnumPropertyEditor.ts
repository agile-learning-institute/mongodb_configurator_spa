import { computed } from 'vue'
import type { Property } from './usePropertyEditor'

export function useEnumPropertyEditor(property: Property, emit: (event: string, ...args: any[]) => void) {
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

  function handlePropertyNameChange(name: string) {
    // No-op for now, can be extended for key editing
    handleChange()
  }

  function handleEnumChange(value: string) {
    property.enums = value; // store as string, not array
    handleChange();
  }

  function handleDelete() {
    emit('delete')
  }

  return {
    isRoot,
    handleChange,
    handleTypeChange,
    handlePropertyNameChange,
    handleEnumChange,
    handleDelete
  }
} 