<template>
  <div class="ref-property-extension" data-test="ref-property-extension">
    <div class="ref-type-section" data-test="ref-type-section">
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
import RefPicker from './RefPicker.vue'

const props = defineProps<{
  property: Property
  disabled?: boolean
}>()

const emit = defineEmits<{
  change: [property: Property]
}>()

const editableRefType = ref('')

// Initialize the ref with the current ref type
if (props.property.type === 'ref' && 'ref' in props.property) {
  editableRefType.value = props.property.ref || ''
}

// Watch for changes in editableRefType and emit the change
watch(editableRefType, (newRefType) => {
  if (props.property.type === 'ref' && 'ref' in props.property) {
    const updatedProperty = {
      ...props.property,
      ref: newRefType
    }
    
    emit('change', updatedProperty)
  }
})

// Watch for property changes to update the local ref
watch(() => (props.property as any).ref, (newRefType) => {
  if (newRefType !== editableRefType.value) {
    editableRefType.value = newRefType || ''
  }
}, { deep: true })

// Watch for property object changes to re-initialize when type changes
watch(() => props.property, (newProperty) => {
  if (newProperty.type === 'ref' && 'ref' in newProperty) {
    editableRefType.value = newProperty.ref || ''
  }
}, { deep: true })
</script>

<style scoped>
.ref-property-extension {
  flex-shrink: 0;
}

.ref-type-section {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
