<template>
  <div class="simple-property-editor">
    <div class="simple-header">
      <v-icon icon="mdi-text" class="mr-2" />
      <span class="text-subtitle-2">Simple Schema</span>
      <v-spacer />
      <v-btn
        icon="mdi-chevron-down"
        variant="text"
        size="small"
        @click="expanded = !expanded"
      />
    </div>
    
    <div v-if="expanded" class="simple-body">
      <div class="schema-editor">
        <v-textarea
          v-model="schemaText"
          label="JSON Schema"
          variant="outlined"
          rows="8"
          placeholder='{"type": "string", "maxLength": 100}'
          @blur="handleSchemaChange"
        />
        
        <div class="schema-help">
          <v-alert
            type="info"
            variant="tonal"
            text="Enter a valid JSON schema definition for this simple type."
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { type SimpleProperty } from '@/types/types'

const props = defineProps<{
  property: SimpleProperty
}>()

const emit = defineEmits<{
  change: [property: SimpleProperty]
}>()

const expanded = ref(true)

const schemaText = computed({
  get: () => {
    try {
      return JSON.stringify(props.property.schema, null, 2)
    } catch {
      return '{}'
    }
  },
  set: (value: string) => {
    // This will be handled by handleSchemaChange
  }
})

const handleSchemaChange = () => {
  try {
    const parsedSchema = JSON.parse(schemaText.value)
    const updatedProperty = {
      ...props.property,
      schema: parsedSchema
    }
    emit('change', updatedProperty)
  } catch (error) {
    console.error('Invalid JSON schema:', error)
    // Don't emit change if JSON is invalid
  }
}

// Watch for property changes
watch(() => props.property.schema, () => {
  // Update the text area when the property changes externally
}, { deep: true })
</script>

<style scoped>
.simple-property-editor {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.simple-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.simple-body {
  padding: 16px;
  background-color: #fafafa;
}

.schema-editor {
  margin-bottom: 16px;
}

.schema-help {
  margin-top: 16px;
}
</style> 