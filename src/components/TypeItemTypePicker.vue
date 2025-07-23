<template>
  <TypeTypePicker
    v-bind="passThroughProps"
    :model-value="currentType"
    :exclude-type-list="['enum', 'enum_array', 'simple_primitive', 'complex_primitive']"
    @update:modelValue="handleTypeChange"
  />
</template>

<script setup lang="ts">
import TypeTypePicker from './TypeTypePicker.vue'
import { useAttrs, computed } from 'vue'

const passThroughProps = useAttrs()

// Extract the current type from the modelValue (could be string or object)
const currentType = computed(() => {
  const value = passThroughProps.modelValue
  if (typeof value === 'string') {
    return value
  } else if (typeof value === 'object' && value && 'type' in value) {
    return (value as { type: string }).type
  }
  return ''
})

// Handle type changes from TypeTypePicker
const handleTypeChange = (newValue: string | any) => {
  // If TypeTypePicker emits a complex object, extract the type and create a simple object
  if (typeof newValue === 'object' && newValue && 'type' in newValue) {
    // For array items, we want to create a simple structure
    const type = (newValue as { type: string }).type
    if (type === 'array') {
      // Create a simple array items structure
      const simpleValue = {
        type: 'array',
        items: {
          type: 'word',
          description: 'Array item',
          required: false
        }
      }
      emit('update:modelValue', simpleValue)
    } else if (type === 'object') {
      // Create a simple object structure
      const simpleValue = {
        type: 'object',
        properties: {},
        additional_properties: false
      }
      emit('update:modelValue', simpleValue)
    } else {
      // For other types, just pass the type string
      emit('update:modelValue', type)
    }
  } else {
    // If it's already a string, pass it through
    emit('update:modelValue', newValue)
  }
}

const emit = defineEmits(['update:modelValue'])
</script> 