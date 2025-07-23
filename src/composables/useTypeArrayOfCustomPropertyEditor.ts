import { Ref } from 'vue'
import type { TypeProperty } from '@/types/types'

export function useTypeArrayOfCustomPropertyEditor(
  property: Ref<TypeProperty>,
  emit: (event: 'change', updated: TypeProperty) => void
) {
  // Add a new item to the array
  function addItem() {
    if (!property.value.items) {
      property.value.items = {
        description: 'New custom item',
        type: 'email', // Example custom type
        required: false
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