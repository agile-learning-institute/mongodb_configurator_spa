<template>
  <div class="property-row">
    <!-- Compact Single Row Layout -->
    <div v-if="!props.hideTopLevelRow || !props.topLevel" class="d-flex align-center mb-2">
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
          <DictionaryTypePicker
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
        
        <!-- One Of Icon (for objects in dictionaries) -->
        <v-tooltip v-if="isObjectType()" location="top">
          <template v-slot:activator="{ props }">
            <v-btn
              icon
              size="x-small"
              variant="text"
              :color="property.oneOf && Object.keys(property.oneOf).length > 0 ? 'primary' : 'grey'"
              :disabled="disabled"
              v-bind="props"
              @click="toggleOneOf"
              class="pa-0 ma-0"
            >
              <v-icon size="16">mdi-format-list-bulleted-type</v-icon>
            </v-btn>
          </template>
          <span>One Of</span>
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
      <DictionaryProperty
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
        <DictionaryProperty
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

    <!-- Enum Section (for enum and enum_array types) -->
    <div v-if="isEnumType()" class="enum-section ml-8 mb-2">
      <div class="d-flex align-center mb-3">
        <div class="text-h6 font-weight-bold mr-3">Enums</div>
        <EnumPicker
          v-model="property.enums"
          label="Select Enum"
          density="compact"
          :disabled="disabled"
          @update:model-value="handleEnumChange"
        />
      </div>
    </div>

    <!-- One Of Section (for objects in dictionaries) -->
    <div v-if="isObjectType() && property.oneOf" class="one-of-section ml-8 mb-2">
      <div class="d-flex align-center mb-3">
        <div class="text-h6 font-weight-bold mr-3">One Of</div>
        <v-btn
          color="primary"
          variant="outlined"
          size="small"
          @click="addOneOfProperty"
          :disabled="disabled"
        >
          <v-icon start size="small">mdi-plus</v-icon>
          Add One Of Property
        </v-btn>
      </div>
      
      <div v-if="!property.oneOf || Object.keys(property.oneOf).length === 0" class="text-center pa-4">
        <v-icon size="32" color="grey">mdi-format-list-bulleted-type</v-icon>
        <div class="text-body-2 text-medium-emphasis mt-2">No one-of properties defined</div>
      </div>
      
      <div v-else>
        <DictionaryProperty
          v-for="(oneOfProperty, oneOfPropertyName) in property.oneOf"
          :key="oneOfPropertyName"
          :property-name="oneOfPropertyName"
          :property="oneOfProperty"
          :disabled="disabled"
          :exclude-type="excludeType"
          @change="handleOneOfPropertyChange(oneOfPropertyName, $event)"
          @delete="deleteOneOfProperty(oneOfPropertyName)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DictionaryTypePicker from './DictionaryTypePicker.vue'
import EnumPicker from './EnumPicker.vue'

interface PropertyItems {
  type: string
  description: string
  required: boolean
}

interface Property {
  description: string
  type: string
  required: boolean
  additionalProperties?: boolean
  oneOf?: Record<string, Property>
  items?: PropertyItems
  properties?: Record<string, Property>
  enums?: string
}

interface Props {
  propertyName: string
  property: Property
  disabled?: boolean
  excludeType?: string
}

const props = withDefaults(defineProps<Props & { topLevel?: boolean; topLevelName?: string; hideTopLevelRow?: boolean }>(), {
  disabled: false,
  excludeType: '',
  topLevel: false,
  topLevelName: '',
  hideTopLevelRow: false
})

const emit = defineEmits<{
  change: [property: Property]
  delete: []
}>()

// Editable property name for non-top-level properties
const editablePropertyName = ref(props.propertyName || '')

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

const isEnumType = (): boolean => {
  return props.property.type === 'enum' || props.property.type === 'enum_array'
}

// const isCustomType = (): boolean => {
//   return !isListType() && !isObjectType() && !isEnumType()
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
    delete props.property.oneOf
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

const handleEnumChange = (enumValue: string) => {
  props.property.enums = enumValue
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

const addOneOfProperty = () => {
  if (!props.property.oneOf) {
    props.property.oneOf = {}
  }
  
  // Generate a default property name
  const propertyName = `one_of_${Object.keys(props.property.oneOf).length + 1}`
  
  props.property.oneOf[propertyName] = {
    description: '',
    type: 'pick a type',
    required: false,
    additionalProperties: false
  }
  
  emit('change', props.property)
}

const deleteOneOfProperty = (propertyName: string) => {
  if (props.property.oneOf) {
    delete props.property.oneOf[propertyName]
    emit('change', props.property)
  }
}

const handleOneOfPropertyChange = (propertyName: string, updatedProperty: Property) => {
  if (props.property.oneOf) {
    props.property.oneOf[propertyName] = updatedProperty
    emit('change', props.property)
  }
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

const toggleOneOf = () => {
  if (!props.property.oneOf) {
    props.property.oneOf = {}
  } else {
    delete props.property.oneOf
  }
  handleChange()
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