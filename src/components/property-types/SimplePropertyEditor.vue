<template>
  <div class="simple-property-editor">
    <div class="schema-section">
      <h4 class="text-h6 mb-3">JSON Schema</h4>
      <v-textarea
        v-model="schemaText"
        label="Schema Definition"
        variant="outlined"
        rows="8"
        :error-messages="schemaError"
        @update:model-value="handleSchemaChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { isSimpleProperty, type SimpleProperty } from '@/types/types'

const props = defineProps<{
  property: SimpleProperty
  disabled?: boolean
}>()

const emit = defineEmits<{
  change: [property: SimpleProperty]
}>()

const schemaError = ref('')

const schemaText = computed({
  get: () => {
    if (isSimpleProperty(props.property)) {
      return JSON.stringify(props.property.schema, null, 2)
    }
    return '{}'
  },
  set: () => {
    // This setter is not used directly, but required for v-model
    // The actual update is handled in handleSchemaChange
  }
})

const handleSchemaChange = (value: string) => {
  if (isSimpleProperty(props.property)) {
    try {
      const parsed = JSON.parse(value)
      props.property.schema = parsed
      schemaError.value = ''
      emit('change', props.property)
    } catch (error) {
      schemaError.value = 'Invalid JSON format'
    }
  }
}
</script>

<style scoped>
.simple-property-editor {
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fafafa;
}

.schema-section {
  margin-bottom: 16px;
}
</style> 