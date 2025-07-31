<template>
  <div class="complex-property-editor">
    <div class="complex-header">
      <v-icon icon="mdi-code-braces" class="mr-2" />
      <span class="text-subtitle-2">Complex Schema</span>
      <v-spacer />
      <v-btn
        icon="mdi-chevron-down"
        variant="text"
        size="small"
        @click="expanded = !expanded"
      />
    </div>
    
    <div v-if="expanded" class="complex-body">
      <v-tabs v-model="activeTab" color="primary">
        <v-tab value="json">JSON Schema</v-tab>
        <v-tab value="bson">BSON Schema</v-tab>
      </v-tabs>
      
      <v-window v-model="activeTab">
        <v-window-item value="json">
          <div class="schema-editor">
            <v-textarea
              v-model="jsonSchemaText"
              label="JSON Schema"
              variant="outlined"
              rows="8"
              placeholder='{"type": "object", "properties": {...}}'
              @blur="handleJsonSchemaChange"
            />
          </div>
        </v-window-item>
        
        <v-window-item value="bson">
          <div class="schema-editor">
            <v-textarea
              v-model="bsonSchemaText"
              label="BSON Schema"
              variant="outlined"
              rows="8"
              placeholder='{"bsonType": "object", "properties": {...}}'
              @blur="handleBsonSchemaChange"
            />
          </div>
        </v-window-item>
      </v-window>
      
      <div class="schema-help">
        <v-alert
          type="info"
          variant="tonal"
          text="Define both JSON and BSON schema definitions for this complex type."
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { type ComplexProperty } from '@/types/types'

const props = defineProps<{
  property: ComplexProperty
}>()

const emit = defineEmits<{
  change: [property: ComplexProperty]
}>()

const expanded = ref(true)
const activeTab = ref('json')

const jsonSchemaText = computed({
  get: () => {
    try {
      return JSON.stringify(props.property.json_type, null, 2)
    } catch {
      return '{}'
    }
  },
  set: (value: string) => {
    // This will be handled by handleJsonSchemaChange
  }
})

const bsonSchemaText = computed({
  get: () => {
    try {
      return JSON.stringify(props.property.bson_type, null, 2)
    } catch {
      return '{}'
    }
  },
  set: (value: string) => {
    // This will be handled by handleBsonSchemaChange
  }
})

const handleJsonSchemaChange = () => {
  try {
    const parsedSchema = JSON.parse(jsonSchemaText.value)
    const updatedProperty = {
      ...props.property,
      json_type: parsedSchema
    }
    emit('change', updatedProperty)
  } catch (error) {
    console.error('Invalid JSON schema:', error)
    // Don't emit change if JSON is invalid
  }
}

const handleBsonSchemaChange = () => {
  try {
    const parsedSchema = JSON.parse(bsonSchemaText.value)
    const updatedProperty = {
      ...props.property,
      bson_type: parsedSchema
    }
    emit('change', updatedProperty)
  } catch (error) {
    console.error('Invalid BSON schema:', error)
    // Don't emit change if JSON is invalid
  }
}

// Watch for property changes
watch(() => props.property.json_type, () => {
  // Update the text area when the property changes externally
}, { deep: true })

watch(() => props.property.bson_type, () => {
  // Update the text area when the property changes externally
}, { deep: true })
</script>

<style scoped>
.complex-property-editor {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.complex-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.complex-body {
  padding: 16px;
  background-color: #fafafa;
}

.schema-editor {
  margin-top: 16px;
}

.schema-help {
  margin-top: 16px;
}
</style> 