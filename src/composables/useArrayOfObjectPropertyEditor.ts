import { computed } from 'vue'
import type { Property } from './usePropertyEditor'

export function useArrayOfObjectPropertyEditor(property: Property, emit: (event: string, ...args: any[]) => void) {
  // Computed getter/setter for itemsType
  const itemsType = computed({
    get() {
      return property.items?.type || ''
    },
    set(type: string) {
      if (!property.items) {
        property.items = { type: 'object', properties: {}, description: '', required: false }
      }
      if (type === 'object') {
        property.items.type = 'object'
        if (!property.items.properties) property.items.properties = {}
      } else if (type === 'array') {
        property.items.type = 'array'
        property.items.items = { type: 'word', description: '', required: false }
      } else {
        property.items.type = type
      }
      emit('change', property)
    }
  })

  function handleAddProperty() {
    if (!property.items) property.items = { type: 'object', properties: {}, description: '', required: false }
    if (!property.items!.properties) property.items!.properties = {}
    // Generate a unique property name
    let idx = 1
    let newName = `property_${idx}`
    while (property.items!.properties[newName]) {
      idx++
      newName = `property_${idx}`
    }
    property.items!.properties[newName] = {
      type: 'word',
      description: 'enter description here',
      required: false
    }
    emit('change', property)
  }

  function handleDeleteProperty(propName: string) {
    if (property.items && property.items.properties) {
      delete property.items!.properties[propName]
      emit('change', property)
    }
  }

  function handleChildPropertyChange(propName: string, updated: Property) {
    if (property.items && property.items.properties) {
      property.items!.properties[propName] = updated
      emit('change', property)
    }
  }

  function toggleAdditionalProperties() {
    if (!property.items) property.items = { type: 'object', properties: {}, description: '', required: false }
    property.items!.additional_properties = !property.items!.additional_properties
    emit('change', property)
  }

  return {
    itemsType,
    handleAddProperty,
    handleDeleteProperty,
    handleChildPropertyChange,
    toggleAdditionalProperties
  }
} 