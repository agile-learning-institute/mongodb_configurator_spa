import { Ref } from 'vue'
import type { TypeProperty } from '@/types/types'

export function useTypeArrayOfObjectPropertyEditor(
  property: Ref<TypeProperty>,
  emit: (event: 'change', updated: TypeProperty) => void
) {
  // Add a new item to the array
  function addItem() {
    if (!property.value.items) {
      property.value.items = {
        description: 'New object item',
        type: 'object',
        required: false,
        properties: {}
      }
    }
    emit('change', { ...property.value })
  }

  // Remove a property by key
  function handleDeleteProperty(key: string) {
    if (property.value.items?.properties && property.value.items.properties[key]) {
      delete property.value.items.properties[key]
      emit('change', { ...property.value })
    }
  }

  // Update a child property
  function handleChildPropertyChange(key: string, updated: TypeProperty) {
    if (property.value.items?.properties && property.value.items.properties[key]) {
      property.value.items.properties[key] = updated
      emit('change', { ...property.value })
    }
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
    handleDeleteProperty,
    handleChildPropertyChange,
  }
} 