<template>
  <div class="property-row">
    <!-- Compact Single Row Layout -->
    <div class="d-flex align-center mb-2">
      <!-- Property Name (filename without .yaml) -->
      <div class="property-name mr-4">
        <span v-if="topLevel" class="text-h5 font-weight-bold">{{ topLevelName }}</span>
        <v-text-field
          v-else-if="propertyName !== 'items'"
          v-model="editablePropertyName"
          placeholder="name"
          density="compact"
          variant="outlined"
          hide-details
          :disabled="disabled"
          class="property-name-input"
          @update:model-value="handlePropertyNameChange"
        />
        <div v-else class="property-name mr-4 d-flex justify-end">
          <span class="text-h6 font-weight-bold">Items</span>
        </div>
      </div>
      
      <!-- Description -->
      <div class="property-description flex-grow-1 mr-4">
        <v-text-field
          v-model="property.description"
          placeholder="Description"
          density="compact"
          variant="outlined"
          hide-details
          :disabled="disabled"
          @update:model-value="handleChange"
        />
      </div>
      
      <!-- Right-aligned controls -->
      <div class="d-flex align-center">
        <!-- Type Selector -->
        <div class="property-type mr-2 d-flex justify-end" style="min-width: 120px;">
          <TypePicker
            v-model="property.type"
            label="Type"
            density="compact"
            :disabled="disabled"
            :exclude-type="excludeType"
            @update:model-value="handleTypeChange"
          />
        </div>
        
        <!-- Required Icon -->
        <v-tooltip location="top">
          <template v-slot:activator="{ props }">
            <v-btn
              icon
              size="x-small"
              variant="text"
              :color="property.required ? 'primary' : 'grey'"
              :disabled="disabled"
              v-bind="props"
              @click="property.required = !property.required; handleChange()"
              class="pa-0 ma-0"
            >
              <v-icon size="16">mdi-star</v-icon>
            </v-btn>
          </template>
          <span>Required</span>
        </v-tooltip>
        
        <!-- Additional Properties Icon (for objects) -->
        <v-tooltip v-if="isObjectType()" location="top">
          <template v-slot:activator="{ props }">
            <v-btn
              icon
              size="x-small"
              variant="text"
              :color="property.additionalProperties ? 'primary' : 'grey'"
              :disabled="disabled"
              v-bind="props"
              @click="property.additionalProperties = !property.additionalProperties; handleChange()"
              class="pa-0 ma-0"
            >
              <v-icon size="16">mdi-plus-circle</v-icon>
            </v-btn>
          </template>
          <span>Additional Properties</span>
        </v-tooltip>
        
        <!-- Delete Button (for sub-properties only, not items) -->
        <v-tooltip v-if="!topLevel && propertyName !== 'items'" location="top">
          <template v-slot:activator="{ props }">
            <v-btn
              icon
              size="x-small"
              variant="text"
              color="error"
              :disabled="disabled"
              v-bind="props"
              @click="$emit('delete')"
              class="pa-0 ma-0"
            >
              <v-icon size="16">mdi-delete</v-icon>
            </v-btn>
          </template>
          <span>Delete Property</span>
        </v-tooltip>
        

      </div>
    </div>

    <!-- Array Items Section (compact layout for array types) -->
    <div v-if="isListType()" class="array-items-section ml-8 mb-2">
      <TypeProperty
        property-name="items"
        :property="property.items || { description: '', type: 'string', required: false }"
        :disabled="disabled"
        :exclude-type="excludeType"
        @change="handleItemsChange"
      />
    </div>

    <!-- Object Properties Section -->
    <div v-if="isObjectType()" class="object-properties-section ml-8 mb-2">
      <div class="d-flex align-center mb-3">
        <div class="text-h6 font-weight-bold mr-3">Properties</div>
        <v-btn
          color="primary"
          variant="outlined"
          size="small"
          @click="addProperty"
          :disabled="disabled"
        >
          <v-icon start size="small">mdi-plus</v-icon>
          Add Property
        </v-btn>
      </div>
      
      <div v-if="!property.properties || Object.keys(property.properties).length === 0" class="text-center pa-4">
        <v-icon size="32" color="grey">mdi-cube-outline</v-icon>
        <div class="text-body-2 text-medium-emphasis mt-2">No properties defined</div>
      </div>
      
      <div v-else>
        <TypeProperty
          v-for="(subProperty, subPropertyName) in property.properties"
          :key="subPropertyName"
          :property-name="subPropertyName"
          :property="subProperty"
          :disabled="disabled"
          :exclude-type="excludeType"
          @change="handlePropertyChange(subPropertyName, $event)"
          @delete="deleteProperty(subPropertyName)"
        />
      </div>
    </div>

    <!-- Primitive Type Section (for schema, json_type, bson_type) -->
    <div v-if="isPrimitiveType()" class="primitive-type-section ml-8 mb-2">
      <div class="d-flex align-center mb-3">
        <div class="text-h6 font-weight-bold mr-3">Schema Definition</div>
        <v-btn
          color="primary"
          variant="outlined"
          size="small"
          @click="toggleSchemaType"
          :disabled="disabled"
        >
          <v-icon start size="small">mdi-cog</v-icon>
          Toggle Schema Type
        </v-btn>
      </div>
      
      <!-- Universal Schema -->
      <div v-if="property.schema" class="mb-3">
        <div class="d-flex align-center mb-2">
          <span class="text-subtitle-2 font-weight-bold mr-2">Universal Schema:</span>
        </div>
        <v-textarea
          v-model="schemaJson"
          placeholder="Enter JSON schema..."
          variant="outlined"
          density="compact"
          rows="4"
          :disabled="disabled"
          @update:model-value="handleSchemaChange"
        />
      </div>
      
      <!-- JSON Schema -->
      <div v-if="property.json_type" class="mb-3">
        <div class="d-flex align-center mb-2">
          <span class="text-subtitle-2 font-weight-bold mr-2">JSON Schema:</span>
        </div>
        <v-textarea
          v-model="jsonTypeJson"
          placeholder="Enter JSON schema..."
          variant="outlined"
          density="compact"
          rows="4"
          :disabled="disabled"
          @update:model-value="handleJsonTypeChange"
        />
      </div>
      
      <!-- BSON Schema -->
      <div v-if="property.bson_type" class="mb-3">
        <div class="d-flex align-center mb-2">
          <span class="text-subtitle-2 font-weight-bold mr-2">BSON Schema:</span>
        </div>
        <v-textarea
          v-model="bsonTypeJson"
          placeholder="Enter BSON schema..."
          variant="outlined"
          density="compact"
          rows="4"
          :disabled="disabled"
          @update:model-value="handleBsonTypeChange"
        />
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TypePicker from './TypePicker.vue'

interface PropertyItems {
  type?: string
  description: string
  required?: boolean
  schema?: any
  json_type?: any
  bson_type?: any
}

interface Property {
  description: string
  type?: string
  required?: boolean
  additionalProperties?: boolean
  items?: PropertyItems
  properties?: Record<string, Property>
  schema?: any
  json_type?: any
  bson_type?: any
}

interface Props {
  propertyName: string
  property: Property
  disabled?: boolean
  excludeType?: string
}

const props = withDefaults(defineProps<Props & { topLevel?: boolean; topLevelName?: string }>(), {
  disabled: false,
  excludeType: '',
  topLevel: false,
  topLevelName: ''
})

const emit = defineEmits<{
  change: [property: Property]
  delete: []
}>()

// Editable property name for non-top-level properties
const editablePropertyName = ref(props.propertyName || '')

// JSON string representations for editing primitive types
const schemaJson = ref('')
const jsonTypeJson = ref('')
const bsonTypeJson = ref('')

// Initialize JSON strings when property changes
const initializeJsonStrings = () => {
  if (props.property.schema) {
    schemaJson.value = JSON.stringify(props.property.schema, null, 2)
  }
  if (props.property.json_type) {
    jsonTypeJson.value = JSON.stringify(props.property.json_type, null, 2)
  }
  if (props.property.bson_type) {
    bsonTypeJson.value = JSON.stringify(props.property.bson_type, null, 2)
  }
}

// Initialize on mount
initializeJsonStrings()

// Property name formatting (remove .yaml extension)
// const getPropertyName = (): string => {
//   return props.propertyName.replace(/\.yaml$/, '') || ''
// }

// Property type detection
const isListType = (): boolean => {
  return props.property.type === 'array' || props.property.type === 'list'
}

const isObjectType = (): boolean => {
  return props.property.type === 'object'
}

const isPrimitiveType = (): boolean => {
  return props.property.schema || props.property.json_type || props.property.bson_type
}

// const isCustomType = (): boolean => {
//   return !isListType() && !isObjectType()
// }

// Event handlers
const handleChange = () => {
  emit('change', props.property)
}

const handleTypeChange = () => {
  // Clear type-specific properties when type changes
  if (!isListType()) {
    delete props.property.items
  }
  if (!isObjectType()) {
    delete props.property.properties
    delete props.property.additionalProperties
  }
  
  // Initialize type-specific properties
  if (isListType() && !props.property.items) {
    props.property.items = {
      type: 'string',
      description: '',
      required: false
    }
  }
  if (isObjectType() && !props.property.properties) {
    props.property.properties = {}
  }
  
  emit('change', props.property)
}



const handleItemsChange = (updatedItems: Property) => {
  props.property.items = updatedItems
  emit('change', props.property)
}

const handlePropertyNameChange = (newName: string) => {
  // Remove spaces and validate
  const cleanName = newName.replace(/\s+/g, '')
  if (cleanName === '') {
    return
  }
  
  // Update the property name
  editablePropertyName.value = cleanName
  
  // Emit the change to parent component
  emit('change', props.property)
}

const addProperty = () => {
  if (!props.property.properties) {
    props.property.properties = {}
  }
  
  // Generate a default property name
  const propertyName = `property_${Object.keys(props.property.properties).length + 1}`
  
  props.property.properties[propertyName] = {
    description: '',
    type: 'pick a type',
    required: false,
    additionalProperties: false
  }
  
  emit('change', props.property)
}

const deleteProperty = (propertyName: string) => {
  if (props.property.properties) {
    delete props.property.properties[propertyName]
    emit('change', props.property)
  }
}

const handlePropertyChange = (propertyName: string, updatedProperty: Property) => {
  if (props.property.properties) {
    props.property.properties[propertyName] = updatedProperty
    emit('change', props.property)
  }
}

const toggleSchemaType = () => {
  // Toggle between schema types
  if (props.property.schema) {
    delete props.property.schema
    props.property.json_type = JSON.parse(schemaJson.value || '{}')
  } else if (props.property.json_type) {
    delete props.property.json_type
    props.property.bson_type = JSON.parse(jsonTypeJson.value || '{}')
  } else if (props.property.bson_type) {
    delete props.property.bson_type
    props.property.schema = JSON.parse(bsonTypeJson.value || '{}')
  } else {
    props.property.schema = {}
  }
  emit('change', props.property)
}

const handleSchemaChange = (value: string) => {
  try {
    props.property.schema = JSON.parse(value)
    emit('change', props.property)
  } catch (e) {
    // Invalid JSON, don't update
  }
}

const handleJsonTypeChange = (value: string) => {
  try {
    props.property.json_type = JSON.parse(value)
    emit('change', props.property)
  } catch (e) {
    // Invalid JSON, don't update
  }
}

const handleBsonTypeChange = (value: string) => {
  try {
    props.property.bson_type = JSON.parse(value)
    emit('change', props.property)
  } catch (e) {
    // Invalid JSON, don't update
  }
}
</script>

<style scoped>
.property-row {
  width: 100%;
}

.property-name {
  min-width: 120px;
  max-width: 200px;
}

.property-description {
  min-width: 200px;
}

.property-type {
  min-width: 150px;
}

.property-required {
  min-width: 80px;
}

.property-additional {
  min-width: 100px;
}

.property-actions {
  min-width: 40px;
}

.expanded-content {
  background-color: rgba(0, 0, 0, 0.02);
  border-left: 4px solid #667eea;
}

.property-name-input {
  min-width: 120px;
  max-width: 200px;
}

.property-name-input :deep(.v-field__input) {
  font-weight: bold;
  font-size: 0.875rem;
}


</style> 