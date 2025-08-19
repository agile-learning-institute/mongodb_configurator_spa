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
import TypeChipPicker from '../TypeChipPicker.vue'

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
    // Create a new items property with the selected type
    const newItems = {
      name: 'item',
      description: 'Array item',
      type: newType,
      required: false
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

