import { computed } from 'vue'
import type { Property } from './usePropertyEditor'

export function useObjectPropertyEditor(property: Property, emit: (event: string, ...args: any[]) => void) {
  function handleAddProperty() {
    if (!property.properties) property.properties = {}
    // Generate a unique property name
    let idx = 1
    let newName = `property_${idx}`
    while (property.properties[newName]) {
      idx++
      newName = `property_${idx}`
    }
    property.properties[newName] = {
      type: 'word',
      description: 'enter description here',
      required: false
    }
    emit('change', property)
  }

  function handleDeleteProperty(propName: string) {
    if (property.properties) {
      delete property.properties[propName]
      emit('change', property)
    }
  }

  function handleChildPropertyChange(propName: string, updated: Property) {
    if (property.properties) {
      property.properties[propName] = updated
      emit('change', property)
    }
  }

  function toggleAdditionalProperties() {
    property.additional_properties = !property.additional_properties
    emit('change', property)
  }

  function handleTypeChange(type: string) {
    property.type = type
    emit('change', property)
  }

  function handleChange() {
    emit('change', property)
  }

  function handleDelete() {
    emit('delete')
  }

  return {
    handleAddProperty,
    handleDeleteProperty,
    handleChildPropertyChange,
    toggleAdditionalProperties,
    handleTypeChange,
    handleChange,
    handleDelete
  }
} 