<template>
  <div class="array-of-ref-extension" data-test="array-of-ref-extension">
    <!-- Extend the base array extension (items type picker) -->
    <ArrayPropertyExtension
      :property="property"
      :is-dictionary="isDictionary"
      :is-type="isType"
      :disabled="disabled"
      @change="handleArrayChange"
      data-test="array-property-extension"
    />
    
    <!-- Ref picker for the ref type -->
    <div class="ref-picker-section" data-test="ref-picker-section">
      <span class="text-body-2 font-weight-medium mr-3 ml-2" data-test="ref-type-label">Dictionary:</span>
      <RefPicker
        v-model="editableRefType"
        :disabled="disabled"
        data-test="ref-type-picker"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { type Property } from '@/types/types'
import ArrayPropertyExtension from './ArrayPropertyExtension.vue'
import RefPicker from './RefPicker.vue'

const props = defineProps<{
  property: Property
  isDictionary?: boolean
  isType?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  change: [property: Property]
}>()

const editableRefType = ref('')

// Initialize the ref with the current ref type
if (props.property.type === 'array' && 'items' in props.property && props.property.items.type === 'ref') {
  editableRefType.value = (props.property.items as any).ref || ''
}

// Methods
const handleArrayChange = (updatedProperty: Property) => {
  emit('change', updatedProperty)
}

// Watch for changes in editableRefType and emit the change
watch(editableRefType, (newRefType) => {
  if (props.property.type === 'array' && 'items' in props.property && props.property.items.type === 'ref' && newRefType !== (props.property.items as any).ref) {
    const currentItems = props.property.items
    
    const newItems = {
      ...currentItems,
      ref: newRefType
    }
    
    const newProperty = {
      ...props.property,
      items: newItems
    }
    
    emit('change', newProperty)
  }
})

// Watch for property changes to update the local ref
watch(() => (props.property as any).items?.ref, (newRefType) => {
  if (newRefType !== editableRefType.value) {
    editableRefType.value = newRefType || ''
  }
}, { deep: true })
</script>

<style scoped>
.array-of-ref-extension {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.ref-picker-section {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
