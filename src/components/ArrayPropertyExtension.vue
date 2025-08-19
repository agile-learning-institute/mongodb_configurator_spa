<template>
  <div class="array-property-extension">
    <div class="items-type-section">
      <span class="text-caption text-medium-emphasis mr-2">Items:</span>
      <TypeChipPicker
        :selected-type="editableItemsType"
        :is-root="false"
        :is-dictionary="isDictionary"
        :is-type="isType"
        :disabled="disabled"
        @type-change="handleItemsTypeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { type Property } from '@/types/types'
import TypeChipPicker from './TypeChipPicker.vue'

const props = defineProps<{
  property: Property
  isDictionary?: boolean
  isType?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  change: [property: Property]
}>()

const editableItemsType = computed(() => {
  if (props.property.type === 'array' && 'items' in props.property) {
    return props.property.items.type
  }
  return ''
})

const handleItemsTypeChange = (newType: string) => {
  if (props.property.type === 'array' && 'items' in props.property) {
    const currentItems = props.property.items
    
    // Create a new items property with the selected type, preserving existing properties when possible
    let newItems: any = {
      name: currentItems.name || 'item',
      description: currentItems.description || 'Array item',
      type: newType,
      required: currentItems.required || false
    }
    
    // Preserve type-specific properties when changing between compatible types
    if (newType === 'object' && currentItems.type === 'object') {
      // Keep existing object properties
      newItems.additional_properties = currentItems.additional_properties !== undefined ? currentItems.additional_properties : false
      newItems.properties = currentItems.properties || []
    } else if (newType === 'array' && currentItems.type === 'array') {
      // Keep existing array items
      newItems.items = currentItems.items
    } else if (newType === 'object') {
      // Initialize new object properties
      newItems.additional_properties = false
      newItems.properties = []
    } else if (newType === 'array') {
      // Initialize new array items
      newItems.items = {
        name: 'item',
        description: 'Array item',
        type: 'word',
        required: false
      }
    }
    
    // Create a new property object to ensure proper reactivity
    const newProperty = {
      ...props.property,
      items: newItems
    }
    
    emit('change', newProperty)
  }
}
</script>

<style scoped>
.array-property-extension {
  flex-shrink: 0;
}

.items-type-section {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>

