import { Ref, computed } from 'vue'
import type { TypeProperty } from '@/types/types'

export function useTypeArrayOfObjectPropertyEditor(
  property: Ref<TypeProperty>,
  emit: (event: 'change', updated: TypeProperty) => void
) {
  // Items type computed with getter/setter like dictionary version
  const itemsType = computed({
    get() {
      return property.value.items?.type || 'object'
    },
    set(type: string) {
      if (!property.value.items) {
        property.value.items = {
          description: 'Object item',
          type: 'object',
          required: false,
          properties: {}
        }
      }
      property.value.items.type = type
      emit('change', { ...property.value })
    }
  })

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

  function handleAddProperty() {
    if (!property.value.items) {
      property.value.items = {
        description: 'Object item',
        type: 'object',
        required: false,
        properties: {}
      }
    }
    if (!property.value.items.properties) property.value.items.properties = {}
    // Generate a unique property name
    let idx = 1
    let newName = `property_${idx}`
    while (property.value.items.properties[newName]) {
      idx++
      newName = `property_${idx}`
    }
    property.value.items.properties[newName] = {
      type: 'word',
      description: 'enter description here',
      required: false
    }
    emit('change', { ...property.value })
  }

  function toggleAdditionalProperties() {
    if (!property.value.items) property.value.items = { type: 'object', properties: {}, description: '', required: false }
    property.value.items.additional_properties = !property.value.items.additional_properties
    emit('change', { ...property.value })
  }

  return {
    itemsType,
    handleAddProperty,
    handleDeleteProperty,
    handleChildPropertyChange,
    toggleAdditionalProperties
  }
} 