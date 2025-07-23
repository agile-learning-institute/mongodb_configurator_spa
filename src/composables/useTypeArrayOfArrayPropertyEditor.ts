import { Ref } from 'vue'
import type { TypeProperty } from '@/types/types'

export function useTypeArrayOfArrayPropertyEditor(
  property: Ref<TypeProperty>,
  emit: (event: 'change', updated: TypeProperty) => void
) {
  // Add a new item to the array
  function addItem() {
    if (!property.value.items) {
      property.value.items = {
        description: 'New array item',
        type: 'array',
        required: false,
        items: {
          description: 'Array item',
          type: 'simple_primitive',
          required: false,
          schema: { type: 'string' }
        }
      }
    }
    emit('change', { ...property.value })
  }

  // Remove an item from the array
  function removeItem(index: number) {
    // TODO: Implement array item removal logic
    console.log('Remove item at index:', index)
  }

  // Update an item in the array
  function updateItem(index: number, updated: TypeProperty) {
    // TODO: Implement array item update logic
    console.log('Update item at index:', index, updated)
  }

  return {
    addItem,
    removeItem,
    updateItem,
  }
} 