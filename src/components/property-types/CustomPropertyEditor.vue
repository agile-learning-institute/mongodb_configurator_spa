<template>
  <div class="custom-property-editor">
    <div class="custom-header">
      <v-icon icon="mdi-cog" class="mr-2" />
      <span class="text-subtitle-2">Custom Type</span>
    </div>
    
    <div class="custom-body">
      <v-text-field
        v-model="customType"
        label="Custom Type Name"
        variant="outlined"
        density="compact"
        placeholder="Enter custom type name"
        @blur="handleCustomTypeChange"
        @keyup.enter="handleCustomTypeChange"
      />
      
      <div class="custom-help">
        <v-alert
          type="info"
          variant="tonal"
          text="Enter the name of your custom type. This will be used as the type identifier."
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { type CustomProperty } from '@/types/types'

const props = defineProps<{
  property: CustomProperty
}>()

const emit = defineEmits<{
  change: [property: CustomProperty]
}>()

const customType = ref(props.property.type)

const handleCustomTypeChange = () => {
  const updatedProperty = {
    ...props.property,
    type: customType.value
  }
  emit('change', updatedProperty)
}

// Watch for property changes
watch(() => props.property.type, (newValue) => {
  customType.value = newValue
})
</script>

<style scoped>
.custom-property-editor {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.custom-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.custom-body {
  padding: 16px;
  background-color: #fafafa;
}

.custom-help {
  margin-top: 16px;
}
</style> 