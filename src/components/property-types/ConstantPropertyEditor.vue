<template>
  <div class="constant-property-editor">
    <div class="constant-header">
      <v-icon icon="mdi-numeric" class="mr-2" />
      <span class="text-subtitle-2">Constant Value</span>
    </div>
    
    <div class="constant-body">
      <v-text-field
        v-model="constantValue"
        label="Constant Value"
        variant="outlined"
        density="compact"
        placeholder="Enter constant value"
        @blur="handleConstantChange"
        @keyup.enter="handleConstantChange"
      />
      
      <div class="constant-help">
        <v-alert
          type="info"
          variant="tonal"
          text="Enter the constant value that this property will always have."
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { type ConstantProperty } from '@/types/types'

const props = defineProps<{
  property: ConstantProperty
}>()

const emit = defineEmits<{
  change: [property: ConstantProperty]
}>()

const constantValue = ref(props.property.constant)

const handleConstantChange = () => {
  const updatedProperty = {
    ...props.property,
    constant: constantValue.value
  }
  emit('change', updatedProperty)
}

// Watch for property changes
watch(() => props.property.constant, (newValue) => {
  constantValue.value = newValue
})
</script>

<style scoped>
.constant-property-editor {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.constant-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.constant-body {
  padding: 16px;
  background-color: #fafafa;
}

.constant-help {
  margin-top: 16px;
}
</style> 