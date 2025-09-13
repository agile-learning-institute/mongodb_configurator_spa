<template>
  <div class="enum-property-extension" data-test="enum-property-extension">
    <div class="enum-type-section" data-test="enum-type-section">
      <span class="text-body-2 font-weight-medium mr-3 ml-2" data-test="enum-type-label">Enumerators:</span>
      <EnumPicker
        v-model="editableEnumType"
        :disabled="disabled"
        data-test="enum-type-picker"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { type Property } from '@/types/types'
import EnumPicker from './EnumPicker.vue'

const props = defineProps<{
  property: Property
  disabled?: boolean
}>()

const emit = defineEmits<{
  change: [property: Property]
}>()

const editableEnumType = ref('')

// Initialize the ref with the current enum type
if (props.property.type === 'enum' && 'enums' in props.property) {
  editableEnumType.value = props.property.enums || ''
} else if (props.property.type === 'enum_array' && 'enums' in props.property) {
  editableEnumType.value = props.property.enums || ''
}

// Watch for changes in editableEnumType and emit the change
watch(editableEnumType, (newEnumType) => {
  if ((props.property.type === 'enum' || props.property.type === 'enum_array') && 'enums' in props.property && newEnumType !== props.property.enums) {
    const updatedProperty = {
      ...props.property,
      enums: newEnumType
    }
    
    emit('change', updatedProperty)
  }
})

// Watch for property changes to update the local ref
watch(() => (props.property as any).enums, (newEnumType) => {
  if (newEnumType !== editableEnumType.value) {
    editableEnumType.value = newEnumType || ''
  }
}, { deep: true })
</script>

<style scoped>
.enum-property-extension {
  flex-shrink: 0;
}

.enum-type-section {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
