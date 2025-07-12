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
          <h1 class="text-h4">Custom Type</h1>
        </div>
        <div class="d-flex align-center">
          <v-btn
            v-if="type._locked"
            color="warning"
            class="mr-2"
            variant="text"
            @click="showUnlockDialog = true"
          >
            <v-icon start>mdi-lock</v-icon>
            Locked
          </v-btn>
          <v-btn
            v-else
            color="warning"
            class="mr-2"
            variant="text"
            @click="lockType"
          >
            <v-icon start>mdi-lock</v-icon>
            Lock
          </v-btn>
        </div>
      </div>

      <!-- Type Settings for non-object types -->
      <div v-if="!isObject()">
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
        <!-- Simple single line layout -->
        <div class="d-flex align-center">
          <!-- Type name -->
          <div class="mr-4">
            <span class="text-h6 font-weight-bold">{{ type.file_name.replace('.yaml', '') }}</span>
          </div>
          
          <!-- Description -->
          <div class="flex-grow-1 mr-4">
            <v-text-field
              v-model="type.description"
              density="compact"
              variant="outlined"
              hide-details
              :disabled="type._locked"
              @update:model-value="autoSave"
            />
          </div>
          
          <!-- Type Picker -->
          <div class="mr-4">
            <TypePicker
              v-model="type.type"
              label="Type"
              density="compact"
              :disabled="type._locked"
              :exclude-type="type.file_name"
              @update:model-value="autoSave"
            />
          </div>
          
          <!-- Required icon -->
          <div class="mr-2">
            <v-tooltip location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  icon
                  size="small"
                  variant="text"
                  :color="type.required ? 'primary' : 'grey'"
                  :disabled="type._locked"
                  @click="type.required = !type.required; autoSave()"
                  v-bind="props"
                >
                  <v-icon size="18">mdi-star</v-icon>
                </v-btn>
              </template>
              <span>Required</span>
            </v-tooltip>
          </div>
          
          <!-- Additional Properties icon -->
          <div class="mr-2">
            <v-tooltip location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  icon
                  size="small"
                  variant="text"
                  :color="type.additionalProperties ? 'primary' : 'grey'"
                  :disabled="type._locked"
                  @click="type.additionalProperties = !type.additionalProperties; autoSave()"
                  v-bind="props"
                >
                  <v-icon size="18">mdi-plus-circle</v-icon>
                </v-btn>
              </template>
              <span>Additional Properties</span>
            </v-tooltip>
          </div>
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
                :exclude-type="type.file_name"
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
  type?: string
  schema?: any
  json_schema?: any
  bson_schema?: any
  json_type?: any
  bson_type?: any
  properties?: Record<string, TypeProperty>
  additionalProperties?: boolean
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

// Load type on mount
onMounted(() => {
  loadType()
})
</script> 