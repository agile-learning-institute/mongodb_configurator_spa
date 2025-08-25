<template>
  <div class="array-property-extension" data-test="array-property-extension">
    <div class="items-type-section" data-test="items-type-section">
      <span class="text-caption text-medium-emphasis mr-2" data-test="items-type-label">Items:</span>
      <TypeChipPicker
        v-model="editableItemsType"
        :is-root="false"
        :is-dictionary="isDictionary"
        :is-type="isType"
        :disabled="disabled"
        data-test="items-type-picker"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
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

const editableItemsType = ref('')

// Initialize the ref with the current items type
if (props.property.type === 'array' && 'items' in props.property) {
  editableItemsType.value = props.property.items.type
}

// Watch for changes in editableItemsType and emit the change
watch(editableItemsType, (newType) => {
  if (props.property.type === 'array' && 'items' in props.property && newType !== props.property.items.type) {
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
      newItems.additional_properties = (currentItems as any).additional_properties !== undefined ? (currentItems as any).additional_properties : false
      newItems.properties = (currentItems as any).properties || []
    } else if (newType === 'array' && currentItems.type === 'array') {
      // Keep existing array items
      newItems.items = (currentItems as any).items
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
})

// Watch for property changes to update the local ref
watch(() => (props.property as any).items?.type, (newType) => {
  if (newType && newType !== editableItemsType.value) {
    editableItemsType.value = newType
  }
}, { deep: true })
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

