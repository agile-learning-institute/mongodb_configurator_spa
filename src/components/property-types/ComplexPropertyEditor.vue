<template>
  <div class="complex-property-editor">
    <v-tabs v-model="activeTab">
      <v-tab value="json">JSON Schema</v-tab>
      <v-tab value="bson">BSON Schema</v-tab>
    </v-tabs>

    <v-window v-model="activeTab">
      <v-window-item value="json">
        <div class="schema-section">
          <h4 class="text-h6 mb-3">JSON Schema</h4>
          <v-textarea
            v-model="jsonSchemaText"
            label="JSON Schema Definition"
            variant="outlined"
            rows="8"
            :error-messages="jsonSchemaError"
            @update:model-value="handleJsonSchemaChange"
          />
        </div>
      </v-window-item>

      <v-window-item value="bson">
        <div class="schema-section">
          <h4 class="text-h6 mb-3">BSON Schema</h4>
          <v-textarea
            v-model="bsonSchemaText"
            label="BSON Schema Definition"
            variant="outlined"
            rows="8"
            :error-messages="bsonSchemaError"
            @update:model-value="handleBsonSchemaChange"
          />
        </div>
      </v-window-item>
    </v-window>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { isComplexProperty, type ComplexProperty } from '@/types/types'

const props = defineProps<{
  property: ComplexProperty
  disabled?: boolean
}>()

const emit = defineEmits<{
  change: [property: ComplexProperty]
}>()

const activeTab = ref('json')
const jsonSchemaError = ref('')
const bsonSchemaError = ref('')

const jsonSchemaText = computed({
  get: () => {
    if (isComplexProperty(props.property)) {
      return JSON.stringify(props.property.json_type, null, 2)
    }
    return '{}'
  },
  set: () => {
    // This setter is not used directly, but required for v-model
    // The actual update is handled in handleJsonSchemaChange
  }
})

const bsonSchemaText = computed({
  get: () => {
    if (isComplexProperty(props.property)) {
      return JSON.stringify(props.property.bson_type, null, 2)
    }
    return '{}'
  },
  set: () => {
    // This setter is not used directly, but required for v-model
    // The actual update is handled in handleBsonSchemaChange
  }
})

const handleJsonSchemaChange = (value: string) => {
  if (isComplexProperty(props.property)) {
    try {
      const parsed = JSON.parse(value)
      props.property.json_type = parsed
      jsonSchemaError.value = ''
      emit('change', props.property)
    } catch (error) {
      jsonSchemaError.value = 'Invalid JSON format'
    }
  }
}

const handleBsonSchemaChange = (value: string) => {
  if (isComplexProperty(props.property)) {
    try {
      const parsed = JSON.parse(value)
      props.property.bson_type = parsed
      bsonSchemaError.value = ''
      emit('change', props.property)
    } catch (error) {
      bsonSchemaError.value = 'Invalid JSON format'
    }
  }
}
</script>

<style scoped>
.complex-property-editor {
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fafafa;
}

.schema-section {
  margin-top: 16px;
}
</style> 