<template>
  <div class="type-complex-primitive-property-editor">
    <div class="property-title-row d-flex align-center pa-4 border-b">
      <!-- Key editor (if not root) -->
      <InLineEditor
        v-if="!isRoot"
        :model-value="propertyName"
        @update:model-value="handlePropertyNameChange"
        placeholder="name"
        class="property-name-input mr-2"
      />
      <!-- Description editor -->
      <InLineEditor
        v-model="property.description"
        placeholder="Description"
        class="mr-2"
        @update:model-value="handleChange"
      />
      <!-- Type picker for complex primitive type -->
      <TypeTypePicker
        v-model="property.type"
        class="mr-2"
        :root-level="isRoot"
        @update:model-value="handleChange"
      />
      <!-- Required icon -->
      <v-tooltip location="top" class="tooltip-dark" :open-delay="0" :close-delay="0" theme="dark">
        <template v-slot:activator="{ props }">
          <v-btn
            icon
            size="x-small"
            variant="text"
            :color="property.required ? 'primary' : 'grey'"
            v-bind="props"
            @click="property.required = !property.required; handleChange()"
            class="pa-0 ma-0"
          >
            <v-icon size="16">mdi-star</v-icon>
          </v-btn>
        </template>
        <span>Required</span>
      </v-tooltip>
      <!-- Delete icon (if not root) -->
      <v-btn
        v-if="!isRoot"
        icon
        size="x-small"
        variant="text"
        color="error"
        @click="handleDelete"
        class="ml-2"
      >
        <v-icon size="16">mdi-delete</v-icon>
      </v-btn>
    </div>
    <!-- Content pane = schema editors -->
    <div class="property-content pa-4">
      <v-alert type="info" variant="tonal" class="mb-4">
        Complex primitive types have separate JSON and BSON schema definitions.
      </v-alert>
      <!-- JSON Schema Editor -->
      <v-expansion-panels class="mb-4">
        <v-expansion-panel>
          <v-expansion-panel-title>
            <v-icon start>mdi-code-json</v-icon>
            JSON Schema
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-textarea
              v-model="jsonSchemaText"
              label="JSON Schema"
              rows="8"
              variant="outlined"
              @input="updateJsonSchema"
              placeholder='{"type": "string", "format": "email"}'
            />
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
      <!-- BSON Schema Editor -->
      <v-expansion-panels>
        <v-expansion-panel>
          <v-expansion-panel-title>
            <v-icon start>mdi-database</v-icon>
            BSON Schema
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-textarea
              v-model="bsonSchemaText"
              label="BSON Schema"
              rows="8"
              variant="outlined"
              @input="updateBsonSchema"
              placeholder='{"bsonType": "string", "pattern": "^[^@]+@[^@]+\\\\.[^@]+$"}'
            />
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue'
import type { TypeProperty } from '@/types/types'
import TypeTypePicker from './TypeTypePicker.vue'
import InLineEditor from './InLineEditor.vue'

interface Props {
  property: TypeProperty
  isRoot?: boolean
  propertyName?: string
}

const props = withDefaults(defineProps<Props>(), {
  isRoot: false,
  propertyName: ''
})

const emit = defineEmits(['change', 'delete', 'rename'])

const jsonSchemaText = ref('')
const bsonSchemaText = ref('')

watch(() => props.property, (newProperty) => {
  if (newProperty.json_type) {
    jsonSchemaText.value = JSON.stringify(newProperty.json_type, null, 2)
  }
  if (newProperty.bson_type) {
    bsonSchemaText.value = JSON.stringify(newProperty.bson_type, null, 2)
  }
}, { immediate: true })

const updateJsonSchema = () => {
  try {
    const jsonSchema = JSON.parse(jsonSchemaText.value)
    emit('change', {
      ...props.property,
      json_type: jsonSchema
    })
  } catch (error) {
    console.warn('Invalid JSON schema:', error)
  }
}

const updateBsonSchema = () => {
  try {
    const bsonSchema = JSON.parse(bsonSchemaText.value)
    emit('change', {
      ...props.property,
      bson_type: bsonSchema
    })
  } catch (error) {
    console.warn('Invalid BSON schema:', error)
  }
}

const handleChange = (newValue?: string | any) => {
  if (newValue && typeof newValue === 'object') {
    // Handle complex type change from TypeTypePicker
    Object.assign(props.property, newValue)
  }
  emit('change', props.property)
}

const handleDelete = () => {
  emit('delete')
}

const handlePropertyNameChange = (newName: string) => {
  emit('rename', props.propertyName, newName)
}
</script>

<style scoped>
.type-complex-primitive-property-editor {
  width: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  margin-bottom: 16px;
}

.property-title-row {
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.property-name-input {
  max-width: 150px;
}

.property-content {
  background: white;
}

/* Tooltip styling to ensure visibility */
:deep(.tooltip-dark) {
  background-color: #424242 !important;
  color: white !important;
}

:deep(.tooltip-dark .v-tooltip__content) {
  background-color: #424242 !important;
  color: white !important;
}
</style> 