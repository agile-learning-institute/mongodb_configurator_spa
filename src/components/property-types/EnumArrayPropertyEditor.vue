<template>
  <div class="enum-array-property-editor">
    <div class="enum-array-header">
      <v-icon icon="mdi-format-list-bulleted" class="mr-2" />
      <span class="text-subtitle-2">Enum Array Type</span>
    </div>
    
    <div class="enum-array-body">
      <v-text-field
        v-model="enumName"
        label="Enum Name"
        variant="outlined"
        density="compact"
        placeholder="Enter enum name"
        @blur="handleEnumChange"
        @keyup.enter="handleEnumChange"
      />
      
      <div class="enum-array-help">
        <v-alert
          type="info"
          variant="tonal"
          text="Enter the name of the enum type. The array will contain values from this enum."
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { type EnumArrayProperty } from '@/types/types'

const props = defineProps<{
  property: EnumArrayProperty
}>()

const emit = defineEmits<{
  change: [property: EnumArrayProperty]
}>()

const enumName = ref(props.property.enums)

const handleEnumChange = () => {
  const updatedProperty = {
    ...props.property,
    enums: enumName.value
  }
  emit('change', updatedProperty)
}

// Watch for property changes
watch(() => props.property.enums, (newValue) => {
  enumName.value = newValue
})
</script>

<style scoped>
.enum-array-property-editor {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.enum-array-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.enum-array-body {
  padding: 16px;
  background-color: #fafafa;
}

.enum-array-help {
  margin-top: 16px;
}
</style> 