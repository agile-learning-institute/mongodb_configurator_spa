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
  // Always emit a string for the type (never a complex object)
  if (typeof newValue === 'object' && newValue && 'type' in newValue) {
    emit('update:modelValue', String(newValue.type))
  } else {
    emit('update:modelValue', newValue)
  }
}

const emit = defineEmits(['update:modelValue'])
</script> 