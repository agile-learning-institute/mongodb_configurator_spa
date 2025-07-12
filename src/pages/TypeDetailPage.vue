<template>
  <v-container>
    <!-- Loading state -->
    <div v-if="loading" class="d-flex justify-center align-center pa-8">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="pa-4">
      <v-alert type="error">
        {{ error }}
        <v-btn @click="loadType" class="mt-2">Retry</v-btn>
      </v-alert>
    </div>

    <!-- Type detail -->
    <div v-else-if="type">
      <!-- Header -->
      <div class="d-flex justify-space-between align-center mb-6">
        <div>
          <h1 class="text-h4">{{ type.description }}</h1>
          <p class="text-body-2 text-medium-emphasis">{{ type.file_name }}</p>
        </div>
        <div class="d-flex align-center">
          <v-chip
            v-if="type._locked"
            color="warning"
            class="mr-2"
          >
            Locked
          </v-chip>
          <v-btn
            color="primary"
            @click="saveType"
            :loading="saving"
            :disabled="type._locked"
          >
            <v-icon start>mdi-content-save</v-icon>
            Save
          </v-btn>
        </div>
      </div>

      <!-- Type Settings -->
      <v-card class="mb-6">
        <v-card-title>Type Settings</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="type.description"
                label="Description"
                :disabled="type._locked"
                @update:model-value="autoSave"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-switch
                v-model="type.required"
                label="Required"
                :disabled="type._locked"
                @update:model-value="autoSave"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Type Category Detection -->
      <div class="mb-6">
        <v-alert
          :type="getTypeCategory() === 'unknown' ? 'warning' : 'info'"
          :title="getTypeCategoryTitle()"
          :text="getTypeCategoryDescription()"
        />
      </div>

      <!-- Simple Primitive Editor -->
      <v-card v-if="isSimplePrimitive()" class="mb-6">
        <v-card-title>Simple Primitive Schema</v-card-title>
        <v-card-text>
          <v-textarea
            v-model="schemaJson"
            label="Schema JSON"
            rows="8"
            auto-grow
            :disabled="type._locked"
            @update:model-value="updateSchema"
            :error="!!schemaError"
            :error-messages="schemaError"
            placeholder='{
  "type": "string",
  "minLength": 1,
  "maxLength": 100
}'
          />
        </v-card-text>
      </v-card>

      <!-- Complex Primitive Editor -->
      <v-card v-if="isComplexPrimitive()" class="mb-6">
        <v-card-title>Complex Primitive Schemas</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-textarea
                v-model="jsonSchemaJson"
                label="JSON Schema"
                rows="8"
                auto-grow
                :disabled="type._locked"
                @update:model-value="updateJsonSchema"
                :error="!!jsonSchemaError"
                :error-messages="jsonSchemaError"
                placeholder='{
  "type": "string",
  "format": "email"
}'
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-textarea
                v-model="bsonSchemaJson"
                label="BSON Schema"
                rows="8"
                auto-grow
                :disabled="type._locked"
                @update:model-value="updateBsonSchema"
                :error="!!bsonSchemaError"
                :error-messages="bsonSchemaError"
                placeholder='{
  "bsonType": "string",
  "pattern": "^[^@]+@[^@]+\\.[^@]+$"
}'
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Object Editor -->
      <div v-if="isObject()" class="mb-6">
        <div class="d-flex justify-space-between align-center mb-4">
          <h3 class="text-h6">Properties</h3>
          <v-btn
            color="primary"
            variant="outlined"
            @click="addProperty"
            :disabled="type._locked"
          >
            <v-icon start>mdi-plus</v-icon>
            Add Property
          </v-btn>
        </div>
        
        <div v-if="!type.properties || Object.keys(type.properties).length === 0" class="text-center pa-8">
          <v-icon size="64" color="grey">mdi-cube-outline</v-icon>
          <h3 class="text-h6 mt-4">No Properties</h3>
          <p class="text-body-2 text-medium-emphasis">Add properties to define the object structure.</p>
        </div>
        
        <div v-else>
          <TypeProperty
            v-for="(property, propertyName) in type.properties"
            :key="propertyName"
            :property-name="propertyName"
            :property="property"
            :disabled="type._locked"
            @change="handlePropertyChange(propertyName, $event)"
            @delete="deleteProperty(propertyName)"
          />
        </div>
      </div>

      <!-- Array Editor -->
      <v-card v-if="isArray()" class="mb-6">
        <v-card-title>Array Items</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <TypePicker
                v-model="type.items!.type"
                label="Item Type"
                :disabled="type._locked"
                @update:model-value="autoSave"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="type.items!.description"
                label="Item Description"
                :disabled="type._locked"
                @update:model-value="autoSave"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { apiService } from '@/utils/api'
import TypePicker from '@/components/TypePicker.vue'
import TypeProperty from '@/components/TypeProperty.vue'

interface TypeProperty {
  description: string
  type: string
  required: boolean
  additionalProperties?: boolean
  items?: {
    type: string
    description: string
  }
  properties?: Record<string, TypeProperty>
}

interface Type {
  description: string
  file_name: string
  required: boolean
  schema?: any
  json_schema?: any
  bson_schema?: any
  properties?: Record<string, TypeProperty>
  items?: {
    type: string
    description: string
  }
  _locked: boolean
}

const route = useRoute()
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const type = ref<Type | null>(null)

// JSON string representations for editing
const schemaJson = ref('')
const jsonSchemaJson = ref('')
const bsonSchemaJson = ref('')

// JSON validation errors
const schemaError = ref('')
const jsonSchemaError = ref('')
const bsonSchemaError = ref('')

// Load type data
const loadType = async () => {
  loading.value = true
  error.value = null
  
  try {
    const fileName = route.params.fileName as string
    const data = await apiService.getType(fileName)
    type.value = data
    
    // Initialize JSON strings for editing
    if (data.schema) {
      schemaJson.value = JSON.stringify(data.schema, null, 2)
    }
    if (data.json_schema) {
      jsonSchemaJson.value = JSON.stringify(data.json_schema, null, 2)
    }
    if (data.bson_schema) {
      bsonSchemaJson.value = JSON.stringify(data.bson_schema, null, 2)
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load type'
    console.error('Failed to load type:', err)
  } finally {
    loading.value = false
  }
}

// Auto-save functionality
const autoSave = async () => {
  if (!type.value || type.value._locked) return
  
  saving.value = true
  try {
    await apiService.saveType(type.value.file_name, type.value)
  } catch (err: any) {
    error.value = err.message || 'Failed to save type'
    console.error('Failed to save type:', err)
  } finally {
    saving.value = false
  }
}

// Manual save
const saveType = async () => {
  if (!type.value) return
  
  saving.value = true
  try {
    await apiService.saveType(type.value.file_name, type.value)
    // Could add success notification here
  } catch (err: any) {
    error.value = err.message || 'Failed to save type'
    console.error('Failed to save type:', err)
  } finally {
    saving.value = false
  }
}

// Type category detection
const getTypeCategory = (): string => {
  if (!type.value) return 'unknown'
  
  if (type.value.schema) return 'simple_primitive'
  if (type.value.json_schema || type.value.bson_schema) return 'complex_primitive'
  if (type.value.properties) return 'object'
  if (type.value.items) return 'array'
  
  return 'unknown'
}

const getTypeCategoryTitle = (): string => {
  const category = getTypeCategory()
  switch (category) {
    case 'simple_primitive': return 'Simple Primitive Type'
    case 'complex_primitive': return 'Complex Primitive Type'
    case 'object': return 'Object Type'
    case 'array': return 'Array Type'
    default: return 'Unknown Type Category'
  }
}

const getTypeCategoryDescription = (): string => {
  const category = getTypeCategory()
  switch (category) {
    case 'simple_primitive': return 'This type has a simple schema definition with basic JSON schema properties.'
    case 'complex_primitive': return 'This type has both JSON and BSON schema definitions for complex validation.'
    case 'object': return 'This type defines an object structure with named properties.'
    case 'array': return 'This type defines an array structure with a specific item type.'
    default: return 'Unable to determine the type category. Please ensure the type has proper structure.'
  }
}

const isSimplePrimitive = (): boolean => {
  return getTypeCategory() === 'simple_primitive'
}

const isComplexPrimitive = (): boolean => {
  return getTypeCategory() === 'complex_primitive'
}

const isObject = (): boolean => {
  return getTypeCategory() === 'object'
}

const isArray = (): boolean => {
  return getTypeCategory() === 'array'
}

// JSON schema updates
const updateSchema = () => {
  if (!type.value) return
  
  try {
    const parsed = JSON.parse(schemaJson.value)
    type.value.schema = parsed
    schemaError.value = ''
    autoSave()
  } catch (err: any) {
    schemaError.value = 'Invalid JSON: ' + err.message
  }
}

const updateJsonSchema = () => {
  if (!type.value) return
  
  try {
    const parsed = JSON.parse(jsonSchemaJson.value)
    type.value.json_schema = parsed
    jsonSchemaError.value = ''
    autoSave()
  } catch (err: any) {
    jsonSchemaError.value = 'Invalid JSON: ' + err.message
  }
}

const updateBsonSchema = () => {
  if (!type.value) return
  
  try {
    const parsed = JSON.parse(bsonSchemaJson.value)
    type.value.bson_schema = parsed
    bsonSchemaError.value = ''
    autoSave()
  } catch (err: any) {
    bsonSchemaError.value = 'Invalid JSON: ' + err.message
  }
}

// Object property management
const addProperty = () => {
  if (!type.value || type.value._locked) return
  
  if (!type.value.properties) {
    type.value.properties = {}
  }
  
  const propertyName = `new_property_${Object.keys(type.value.properties!).length + 1}`
  type.value.properties![propertyName] = {
    description: '',
    type: 'string',
    required: false,
    additionalProperties: false
  }
  
  autoSave()
}

const handlePropertyChange = (propertyName: string, updatedProperty: any) => {
  if (!type.value || type.value._locked) return
  
  if (type.value.properties) {
    type.value.properties[propertyName] = updatedProperty
  }
  autoSave()
}

const deleteProperty = (propertyName: string) => {
  if (!type.value || type.value._locked) return
  
  if (type.value.properties) {
    delete type.value.properties[propertyName]
  }
  autoSave()
}

// Load type on mount
onMounted(() => {
  loadType()
})
</script> 