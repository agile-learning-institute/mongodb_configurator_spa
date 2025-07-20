<template>
  <BaseCard
    :title="cardTitle"
    :icon="icon"
    :is-secondary="isSubCard"
    :clickable="false"
  >
    <template #header-actions>
      <!-- Type Picker -->
      <div class="mr-3" style="min-width: 120px;">
        <DictionaryTypePicker
          :model-value="modelValue"
          @update:model-value="(value) => emit('update:modelValue', value)"
          label="Type"
          density="compact"
          :disabled="disabled"
          :exclude-type="excludeType"
          class="items-type-picker"
        />
      </div>
      
      <!-- Extra slot for type-specific controls -->
      <slot name="extra" />
      
      <!-- Actions slot for standard actions -->
      <slot name="actions" />
    </template>
    
    <!-- Content slot - only used for object types -->
    <slot name="content" />
  </BaseCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseCard from './BaseCard.vue'
import DictionaryTypePicker from './DictionaryTypePicker.vue'

interface Props {
  name: string
  description?: string
  modelValue: string
  icon?: string
  isSubCard?: boolean
  disabled?: boolean
  excludeType?: string
}

const props = withDefaults(defineProps<Props>(), {
  description: 'No description',
  icon: 'mdi-cube-outline',
  isSubCard: false,
  disabled: false,
  excludeType: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// Computed card title
const cardTitle = computed(() => {
  return `${props.name}: ${props.description}`
})
</script> 