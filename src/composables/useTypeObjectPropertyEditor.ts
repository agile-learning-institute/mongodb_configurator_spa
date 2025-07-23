import { Ref } from 'vue'
import type { TypeProperty } from '@/types/types'

export function useTypeObjectPropertyEditor(
  property: Ref<TypeProperty>,
  emit: (event: 'change', updated: TypeProperty) => void
) {
  // Add a new property with a unique name
  function addProperty() {
    if (!property.value.properties) {
      property.value.properties = {}
    }
    let idx = 1
    let newKey = `new_property_${idx}`
    while (property.value.properties[newKey]) {
      idx++
      newKey = `new_property_${idx}`
    }
    property.value.properties[newKey] = {
      description: 'enter description here',
      type: 'void',
      required: false
    }
    emit('change', { ...property.value })
  }

  // Remove a property by key
  function removeProperty(key: string) {
    if (property.value.properties && property.value.properties[key]) {
      delete property.value.properties[key]
      emit('change', { ...property.value })
    }
  }

  // Rename a property key
  function renameProperty(oldKey: string, newKey: string) {
    if (!property.value.properties || oldKey === newKey || !newKey) return
    if (property.value.properties[newKey]) return // Prevent overwriting
    const prop = property.value.properties[oldKey]
    if (!prop) return
    property.value.properties[newKey] = prop
    delete property.value.properties[oldKey]
    emit('change', { ...property.value })
  }

  // Update a child property
  function updateChildProperty(key: string, updated: TypeProperty) {
    if (property.value.properties && property.value.properties[key]) {
      property.value.properties[key] = updated
      emit('change', { ...property.value })
    }
  }

  return {
    addProperty,
    removeProperty,
    renameProperty,
    updateChildProperty,
  }
} 