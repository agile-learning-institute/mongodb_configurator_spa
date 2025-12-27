<template>
  <div class="constant-property-extension" data-test="constant-property-extension">
    <div class="constant-type-section" data-test="constant-type-section">
      <span class="text-body-2 font-weight-medium mr-3 ml-2" data-test="constant-type-label">Value:</span>
      <v-text-field
        v-model="editableConstantValue"
        :readonly="disabled"
        placeholder="Enter value"
        variant="plain"
        density="compact"
        hide-details
        :style="{ minWidth: '180px' }"
        data-test="constant-value-input"
        @input="handleConstantInput"
        @blur="handleConstantChange"
        @keyup.enter="handleConstantChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { type Property, type ConstantProperty } from '@/types/types'

const props = defineProps<{
  property: Property
  disabled?: boolean
}>()

const emit = defineEmits<{
  change: [property: Property]
}>()

const editableConstantValue = ref('')
let constantSaveTimer: number | null = null

// Initialize the ref with the current constant value
if (props.property.type === 'constant') {
  const constantProp = props.property as ConstantProperty
  editableConstantValue.value = constantProp.constant || ''
}

// Handle input changes with debounced auto-save
const handleConstantInput = () => {
  // Debounced auto-save - clear existing timer and set new one
  if (constantSaveTimer) {
    clearTimeout(constantSaveTimer)
  }
  
  constantSaveTimer = setTimeout(() => {
    if (props.property.type === 'constant') {
      const constantProp = props.property as ConstantProperty
      if (editableConstantValue.value !== constantProp.constant) {
        const updatedProperty = {
          ...props.property,
          constant: editableConstantValue.value
        } as ConstantProperty
        
        emit('change', updatedProperty)
      }
    }
  }, 300) // 300ms delay
}

// Handle immediate save on blur/enter
const handleConstantChange = () => {
  // Immediate save on blur/enter - clear any pending timer
  if (constantSaveTimer) {
    clearTimeout(constantSaveTimer)
    constantSaveTimer = null
  }
  
  if (props.property.type === 'constant') {
    const constantProp = props.property as ConstantProperty
    if (editableConstantValue.value !== constantProp.constant) {
      const updatedProperty = {
        ...props.property,
        constant: editableConstantValue.value
      } as ConstantProperty
      
      emit('change', updatedProperty)
    }
  }
}

// Watch for property changes to update the local ref
watch(() => {
  if (props.property.type === 'constant') {
    return (props.property as ConstantProperty).constant
  }
  return ''
}, (newConstant) => {
  if (newConstant !== editableConstantValue.value) {
    editableConstantValue.value = newConstant || ''
  }
})

// Cleanup timer on component unmount
onUnmounted(() => {
  if (constantSaveTimer) {
    clearTimeout(constantSaveTimer)
  }
})
</script>

<style scoped>
.constant-property-extension {
  flex-shrink: 0;
}

.constant-type-section {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
