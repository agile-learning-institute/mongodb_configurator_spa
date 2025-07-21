import { computed } from 'vue'
import type { Property } from './usePropertyEditor'

export function useArrayOfArrayPropertyEditor(property: Property, emit: (event: string, ...args: any[]) => void) {
  const itemsType = computed({
    get() {
      return property.items?.type || ''
    },
    set(type: string) {
      if (!property.items) {
        property.items = { type: 'word', description: '', required: false }
      }
      property.items.type = type
      emit('change', property)
    }
  })

  function handleDelete() {
    emit('delete')
  }

  function handleChange() {
    emit('change', property)
  }

  return {
    itemsType,
    handleDelete,
    handleChange
  }
} 