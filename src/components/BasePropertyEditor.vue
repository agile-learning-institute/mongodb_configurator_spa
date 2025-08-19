<template>
  <div class="base-property-editor">
    <!-- Property Header with Name, Description, Type, Extension Slot, Required, and Delete -->
    <div class="property-header d-flex align-center">
      <div class="property-name-section" v-if="!isRoot" :id="`property-name-${property.name || 'root'}`">
        <v-text-field
          v-model="editableName"
          variant="plain"
          density="compact"
          hide-details
          :readonly="disabled"
          class="mr-2"
          :style="{ minWidth: '180px' }"
          placeholder="Name"
          @blur="handleNameChange"
          @keyup.enter="handleNameChange"
        />
      </div>
      
      <div class="property-description-section" :id="`property-description-${property.name || 'root'}`">
        <!-- Display mode for root properties -->
        <div v-if="isRoot && !isEditingDescription" 
             class="description-display mr-2" 
             :class="{ 'root-description': isRoot }"
             :style="{ minWidth: '200px', flex: '1' }"
             @click="startEditDescription">
          <span v-if="editableDescription" class="description-text">{{ editableDescription }}</span>
          <span v-else class="description-placeholder">Click to add description</span>
        </div>
        
        <!-- Edit mode for root properties -->
        <v-text-field
          v-if="isRoot && isEditingDescription"
          v-model="editableDescription"
          variant="plain"
          density="compact"
          hide-details
          :disabled="disabled"
          class="mr-2"
          :style="{ minWidth: '200px', flex: '1' }"
          placeholder="Description"
          @blur="finishEditDescription"
          @keyup.enter="finishEditDescription"
          ref="descriptionInput"
        />
        
        <!-- Always editable for non-root properties -->
        <v-text-field
          v-if="!isRoot"
          v-model="editableDescription"
          variant="plain"
          density="compact"
          hide-details
          :readonly="disabled"
          class="mr-2"
          :style="{ minWidth: '200px', flex: '1' }"
          placeholder="Description"
          @blur="handleDescriptionChange"
          @keyup.enter="handleDescriptionChange"
        />
      </div>
      
      <div class="property-type-section">
        <TypeChipPicker
          v-model="editableType"
          :is-root="isRoot"
          :is-dictionary="isDictionary"
          :is-type="isType"
          :disabled="disabled"
          @update:model-value="handleTypeChange"
        />
      </div>
      
      <!-- Extension slot for type-specific controls -->
      <slot name="extension"></slot>
      
      <div class="property-required-section" v-if="canBeRequired">
        <v-tooltip 
          text="Mark this property as required"
          location="top"
          color="primary"
          text-color="white"
        >
          <template v-slot:activator="{ props }">
            <v-btn
              :icon="editableRequired ? 'mdi-checkbox-marked' : 'mdi-checkbox-blank-outline'"
              variant="text"
              size="small"
              color="default"
              v-bind="props"
              @click="toggleRequired"
              :disabled="disabled"
            />
          </template>
        </v-tooltip>
      </div>
      
      <div class="property-actions" v-if="canBeDeleted && !disabled">
        <v-tooltip 
          text="Delete this property"
          location="top"
          color="primary"
          text-color="white"
        >
          <template v-slot:activator="{ props }">
            <v-btn
              icon="mdi-delete"
              variant="text"
              size="small"
              color="error"
              v-bind="props"
              @click="handleDelete"
            />
          </template>
        </v-tooltip>
      </div>
    </div>
    
    <!-- Property Body - only for types that need it -->
    <div class="property-body" v-if="showBody">
      <slot name="body"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import { 
  type Property,
  type ArrayProperty,
  type ObjectProperty,
  type SimpleProperty,
  type ComplexProperty,
  type CustomProperty,
  isArrayProperty,
  isObjectProperty,
  isSimpleProperty,
  isComplexProperty,
  isCustomProperty
} from '@/types/types'
import TypeChipPicker from './TypeChipPicker.vue'

const props = defineProps<{
  property: Property
  isRoot?: boolean
  isDictionary?: boolean
  isType?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  change: [property: Property]
  delete: []
}>()

// Reactive state
const editableName = ref(props.property.name)
const editableDescription = ref(props.property.description)
const editableType = ref(props.property.type)
const editableRequired = ref(props.property.required)
const isEditingDescription = ref(false)
const descriptionInput = ref<HTMLElement>()

// Computed properties
const isRoot = computed(() => props.isRoot || false)
const isDictionary = computed(() => props.isDictionary || false)
const isType = computed(() => props.isType || false)

const canBeRequired = computed(() => {
  // Root properties can always be required
  if (isRoot.value) return true
  
  // Non-root properties can be required if they're not arrays or objects
  return !isArrayProperty(props.property) && !isObjectProperty(props.property)
})

const canBeDeleted = computed(() => {
  // Root properties cannot be deleted
  if (isRoot.value) return false
  
  // Non-root properties can be deleted
  return true
})

const showBody = computed(() => {
  // Only show body for types that need it
  return isObjectProperty(props.property) || isArrayProperty(props.property)
})

// Methods
const handleNameChange = () => {
  if (editableName.value !== props.property.name) {
    props.property.name = editableName.value
    emit('change', props.property)
  }
}

const handleDescriptionChange = () => {
  if (editableDescription.value !== props.property.description) {
    props.property.description = editableDescription.value
    emit('change', props.property)
  }
}

const handleTypeChange = (newType: string) => {
  if (newType !== props.property.type) {
    const oldType = props.property.type
    props.property.type = newType
    
    // Handle type-specific property creation
    if (newType === 'array' && !isArrayProperty(props.property)) {
      console.log('Before type change - property:', props.property)
      
      // Create the array property manually to ensure it's correct
      props.property.items = {
        name: 'item',
        description: 'Array item',
        type: 'word',
        required: false
      }
      
      console.log('After setting items - property:', props.property)
      console.log('Property items:', props.property.items)
      
      // Use nextTick to ensure Vue recognizes the change
      nextTick(() => {
        console.log('After nextTick - property items:', props.property.items)
        // Emit the change to ensure the parent component updates
        emit('change', props.property)
      })
    } else if (newType === 'object' && !isObjectProperty(props.property)) {
      const newProperty = createPropertyForType(newType, props.property)
      // Clean up old properties and assign new ones
      Object.keys(props.property).forEach(key => {
        if (key !== 'name' && key !== 'description' && key !== 'type' && key !== 'required') {
          delete (props.property as any)[key]
        }
      })
      Object.assign(props.property, newProperty)
    } else if (newType === 'simple' && !isSimpleProperty(props.property)) {
      const newProperty = createPropertyForType(newType, props.property)
      // Clean up old properties and assign new ones
      const keysToDelete = Object.keys(props.property).filter(key => 
        key !== 'name' && key !== 'description' && key !== 'type' && key !== 'required'
      )
      keysToDelete.forEach(key => {
        delete (props.property as any)[key]
      })
      Object.assign(props.property, newProperty)
    } else if (newType === 'complex' && !isComplexProperty(props.property)) {
      const newProperty = createPropertyForType(newType, props.property)
      // Clean up old properties and assign new ones
      Object.keys(props.property).forEach(key => {
        if (key !== 'name' && key !== 'description' && key !== 'type' && key !== 'required') {
          delete (props.property as any)[key]
        }
      })
      Object.assign(props.property, newProperty)
    } else if (newType === 'enum' && !isCustomProperty(props.property)) {
      const newProperty = createPropertyForType(newType, props.property)
      // Clean up old properties and assign new ones
      Object.keys(props.property).forEach(key => {
        if (key !== 'name' && key !== 'description' && key !== 'type' && key !== 'required') {
          delete (props.property as any)[key]
        }
      })
      Object.assign(props.property, newProperty)
    } else if (newType === 'enum_array' && !isCustomProperty(props.property)) {
      const newProperty = createPropertyForType(newType, props.property)
      // Clean up old properties and assign new ones
      Object.keys(props.property).forEach(key => {
        if (key !== 'name' && key !== 'description' && key !== 'type' && key !== 'required') {
          delete (props.property as any)[key]
        }
      })
      Object.assign(props.property, newProperty)
    } else if (newType === 'ref' && !isCustomProperty(props.property)) {
      const newProperty = createPropertyForType(newType, props.property)
      // Clean up old properties and assign new ones
      Object.keys(props.property).forEach(key => {
        if (key !== 'name' && key !== 'description' && key !== 'type' && key !== 'required') {
          delete (props.property as any)[key]
        }
      })
      Object.assign(props.property, newProperty)
    }
    
    emit('change', props.property)
  }
}

const handleDelete = () => {
  emit('delete')
}

const startEditDescription = () => {
  if (isRoot.value && !props.disabled) {
    isEditingDescription.value = true
    // Focus the input after it's rendered
    nextTick(() => {
      if (descriptionInput.value) {
        descriptionInput.value.focus()
      }
    })
  }
}

const finishEditDescription = () => {
  if (isRoot.value) {
    isEditingDescription.value = false
    handleDescriptionChange()
  }
}

const toggleRequired = () => {
  editableRequired.value = !editableRequired.value
  handleRequiredChange()
}

const handleRequiredChange = () => {
  if (editableRequired.value !== props.property.required) {
    props.property.required = editableRequired.value
    emit('change', props.property)
  }
}

// Helper function to create a new property with the specified type
const createPropertyForType = (type: string, originalProperty: Property): Property => {
  const baseProperty = {
    name: originalProperty.name,
    description: originalProperty.description,
    type,
    required: originalProperty.required
  }
  
  switch (type) {
    case 'array':
      const arrayProperty = {
        ...baseProperty,
        items: {
          name: 'item',
          description: 'Array item',
          type: 'word',
          required: false
        } as Property
      } as ArrayProperty
      console.log('createPropertyForType - created array property:', arrayProperty)
      console.log('createPropertyForType - items:', arrayProperty.items)
      return arrayProperty
    
    case 'object':
      return {
        ...baseProperty,
        additional_properties: false,
        properties: []
      } as ObjectProperty
    
    case 'simple':
      return {
        ...baseProperty,
        schema: {}
      } as Property
    
    case 'complex':
      return {
        ...baseProperty,
        json_type: {},
        bson_type: {}
      } as Property
    
    case 'enum':
      return {
        ...baseProperty,
        enums: ''
      } as Property
    
    case 'enum_array':
      return {
        ...baseProperty,
        enums: ''
      } as Property
    
    case 'ref':
      return {
        ...baseProperty,
        ref: ''
      } as Property
    
    default:
      return baseProperty as Property
  }
}

// Watch for property changes and update local state
watch(() => props.property, (newProperty) => {
  editableName.value = newProperty.name
  editableDescription.value = newProperty.description
  editableType.value = newProperty.type
  editableRequired.value = newProperty.required
}, { deep: true })
</script>

<style scoped>
.base-property-editor {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 16px;
}

.property-header {
  padding: 12px 16px;
  background-color: #fafafa;
  border-bottom: 1px solid #e0e0e0;
  gap: 8px;
}

.property-name-section {
  flex-shrink: 0;
}

.property-description-section {
  flex: 1;
  min-width: 0;
}

.property-type-section {
  flex-shrink: 0;
}

.property-required-section {
  flex-shrink: 0;
}

.property-actions {
  flex-shrink: 0;
}

.property-body {
  padding: 16px;
  background-color: #ffffff;
}

/* Root property description styling - display mode */
.description-display {
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.description-display:hover {
  background-color: rgba(0, 0, 0, 0.04);
  border-color: rgba(0, 0, 0, 0.12);
}

.root-description.description-display {
  font-size: 2.0rem;
  font-weight: 500;
}

.description-text {
  color: rgba(0, 0, 0, 0.87);
}

.description-placeholder {
  color: rgba(0, 0, 0, 0.38);
  font-style: italic;
}

/* Ensure readonly inputs don't get dimmed */
.v-text-field.v-input--readonly .v-field__input,
.v-text-field.v-input--readonly .v-input__control,
.v-text-field.v-input--readonly input {
  opacity: 1 !important;
  color: rgba(0, 0, 0, 0.87) !important;
}

.v-text-field.v-input--readonly .v-field {
  opacity: 1 !important;
}

/* Ensure disabled buttons don't get dimmed */
.v-btn.v-btn--disabled {
  opacity: 1 !important;
  color: rgba(0, 0, 0, 0.87) !important;
}

.v-btn.v-btn--disabled .v-btn__content {
  opacity: 1 !important;
}
</style>
