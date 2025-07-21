import { computed } from 'vue'
import type { Property } from './usePropertyEditor'

export function useArrayOfCustomPropertyEditor(property: Property, emit: (event: 'change' | 'delete', property: Property) => void) {
  const itemsType = computed({
    get() {
      return property.items?.type || ''
    },
    set(type: string) {
      if (!property.items) {
        property.items = { type, description: '', required: false }
      } else {
        property.items.type = type
      }
      emit('change', property)
    }
  })

  function handleDelete() {
    emit('delete', property)
  }

  function handleChange() {
    emit('change', property)
  }

  return {
    itemsType,
    handleChange,
    handleDelete
  }
} 