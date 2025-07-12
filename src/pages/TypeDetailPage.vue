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
      <v-card class="mb-4">
        <v-card-title class="d-flex justify-space-between align-center pa-4" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
          <div class="d-flex align-center">
            <h2 class="text-h5 mb-0">Custom Type</h2>
          </div>
          <div class="d-flex align-center">
            <v-btn
              v-if="type._locked"
              color="white"
              variant="text"
              @click="showUnlockDialog = true"
            >
              <v-icon start>mdi-lock</v-icon>
              Locked
            </v-btn>
            <v-btn
              v-else
              color="white"
              variant="text"
              @click="lockType"
            >
              <v-icon start>mdi-lock</v-icon>
              Lock
            </v-btn>
          </div>
        </v-card-title>
        
        <v-card-text class="pa-4">
          <TypeProperty
            property-name="root"
            :property="{ ...type, type: type.type || '' }"
            :disabled="type._locked"
            :exclude-type="type.file_name"
            :top-level="true"
            :top-level-name="type.file_name.replace('.yaml', '')"
            @change="handleTopLevelPropertyChange"
          />
        </v-card-text>
      </v-card>
    </div>
    <v-dialog v-model="showUnlockDialog" max-width="400">
      <v-card>
        <v-card-title>Unlock Type?</v-card-title>
        <v-card-text>
          Unlocking allows editing this type. Are you sure?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showUnlockDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="unlockType">Unlock</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
  items?: TypeProperty
  properties?: Record<string, TypeProperty>
}

interface Type {
  description: string
  file_name: string
  required: boolean
  type?: string
  schema?: any
  json_schema?: any
  bson_schema?: any
  json_type?: any
  bson_type?: any
  properties?: Record<string, TypeProperty>
  additionalProperties?: boolean
  items?: TypeProperty
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

const primitiveTypes = [
  'identity', 'word', 'sentence', 'email', 'url', 
  'ip_address', 'us_phone', 'date_time', 'markdown',
  'street_address', 'state_code', 'count', 'identifier',
  'breadcrumb', 'appointment'
];

const getTypeCategory = (): string => {
  if (!type.value) return 'unknown';

  if (type.value.schema) return 'simple_primitive';
  if (type.value.json_schema || type.value.bson_schema || type.value.json_type || type.value.bson_type) return 'complex_primitive';
  if (type.value.properties) return 'object';
  if (type.value.items) return 'array';
  if (primitiveTypes.includes(type.value.type || '')) return 'property_primitive';

  return 'unknown';
};

const getTypeCategoryTitle = (): string => {
  const category = getTypeCategory();
  switch (category) {
    case 'simple_primitive': return 'Simple Primitive Type';
    case 'complex_primitive': return 'Complex Primitive Type';
    case 'object': return 'Object Type';
    case 'array': return 'Array Type';
    case 'property_primitive': return 'Primitive Property Type';
    default: return 'Unknown Type Category';
  }
};

const getTypeCategoryDescription = (): string => {
  const category = getTypeCategory();
  switch (category) {
    case 'simple_primitive': return 'This type has a simple schema definition with basic JSON schema properties.';
    case 'complex_primitive': return 'This type has both JSON and BSON schema definitions for complex validation.';
    case 'object': return 'This type defines an object structure with named properties.';
    case 'array': return 'This type defines an array structure with a specific item type.';
    case 'property_primitive': return 'This type is a primitive property (e.g., word, count, email, etc.).';
    default: return 'Unable to determine the type category. Please ensure the type has proper structure.';
  }
};

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

const handleTypePropertyChange = (updatedProperty: any) => {
  if (!type.value || type.value._locked) return
  
  // Update the type with the property changes
  type.value.description = updatedProperty.description
  type.value.required = updatedProperty.required
  type.value.additionalProperties = updatedProperty.additionalProperties
  type.value.properties = updatedProperty.properties
  
  autoSave()
}

const showUnlockDialog = ref(false)

const unlockType = () => {
  if (!type.value) return
  type.value._locked = false
  showUnlockDialog.value = false
  autoSave()
}

const lockType = () => {
  if (!type.value) return
  type.value._locked = true
  autoSave()
}

const handleItemsChange = (updatedItems: any) => {
  if (!type.value) return
  type.value.items = updatedItems
  autoSave()
}

const handleTopLevelPropertyChange = (updated: any) => {
  if (!type.value) return
  // Copy all top-level fields from updated to type.value
  Object.assign(type.value, updated)
  autoSave()
}

// Load type on mount
onMounted(() => {
  loadType()
})
</script> 