<template>
  <div class="ref-property-editor">
    <div class="ref-header">
      <v-icon icon="mdi-link" class="mr-2" />
      <span class="text-subtitle-2">Reference Type</span>
    </div>
    
    <div class="ref-body">
      <v-text-field
        v-model="refName"
        label="Type File Name"
        variant="outlined"
        density="compact"
        placeholder="Enter type file name"
        @blur="handleRefChange"
        @keyup.enter="handleRefChange"
      />
      
      <div class="ref-help">
        <v-alert
          type="info"
          variant="tonal"
          text="Enter the name of the type file to reference (without .json extension)."
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { type RefProperty } from '@/types/types'

const props = defineProps<{
  property: RefProperty
}>()

const emit = defineEmits<{
  change: [property: RefProperty]
}>()

const refName = ref(props.property.ref)

const handleRefChange = () => {
  const updatedProperty = {
    ...props.property,
    ref: refName.value
  }
  emit('change', updatedProperty)
}

// Watch for property changes
watch(() => props.property.ref, (newValue) => {
  refName.value = newValue
})
</script>

<style scoped>
.ref-property-editor {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.ref-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.ref-body {
  padding: 16px;
  background-color: #fafafa;
}

.ref-help {
  margin-top: 16px;
}
</style> 