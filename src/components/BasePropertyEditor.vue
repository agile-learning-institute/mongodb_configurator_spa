<template>
  <div class="base-property-editor" :data-test="`base-property-editor-${property.name || 'root'}`">
    <!-- Property Header with Name, Description, Type, Extension Slot, Required, and Delete -->
    <!-- Only show header for non-root properties -->
    <div v-if="!isRoot" class="property-header d-flex align-center" data-test="property-header">
      <div class="property-name-section" v-if="!isRoot" :id="`property-name-${property.name || 'root'}`" data-test="property-name-section">
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
          data-test="property-name-input"
        />
      </div>
      
      <div class="property-description-section" :id="`property-description-${property.name || 'root'}`" data-test="property-description-section">
        <!-- Display mode for root properties -->
        <div v-if="isRoot && !isEditingDescription" 
             class="description-display mr-2" 
             :class="{ 'root-description': isRoot }"
             :style="{ minWidth: '200px', flex: '1' }"
             @click="startEditDescription"
             data-test="description-display">
          <span v-if="editableDescription" class="description-text" data-test="description-text">{{ editableDescription }}</span>
          <span v-else class="description-placeholder" data-test="description-placeholder">Click to add description</span>
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
          data-test="description-input-edit"
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
          data-test="description-input"
        />
      </div>
      
      <div class="property-type-section" v-if="!props.hideTypeSelector" data-test="property-type-section">
        <TypeChipPicker
          v-model="editableType"
          :is-root="isRoot"
          :is-dictionary="isDictionary"
          :is-type="isType"
          :disabled="disabled"
          @update:model-value="handleTypeChange"
          data-test="type-chip-picker"
        />
      </div>
      
      <!-- Extension slot for type-specific controls -->
      <slot name="extension"></slot>
      
      <div class="property-required-section" v-if="canBeRequired" data-test="property-required-section">
        <v-tooltip 
          :text="editableRequired ? 'Mark as optional' : 'Mark as required'"
          location="top"
          color="primary"
          text-color="white"
        >
          <template v-slot:activator="{ props }">
            <v-btn
              variant="text"
              size="x-small"
              density="compact"
              color="default"
              v-bind="props"
              @click="toggleRequired"
              :disabled="disabled"
              data-test="required-toggle-btn"
            >
              <span class="material-symbols-outlined">{{ editableRequired ? 'toggle_on' : 'toggle_off' }}</span>
            </v-btn>
          </template>
        </v-tooltip>
      </div>
      
      <div class="property-actions" v-if="canBeDeleted && !disabled" data-test="property-actions">
        <v-tooltip 
          text="Delete this property"
          location="top"
          color="primary"
          text-color="white"
        >
          <template v-slot:activator="{ props }">
            <v-btn
              variant="text"
              size="x-small"
              density="compact"
              color="error"
              v-bind="props"
              @click="handleDelete"
              data-test="delete-property-btn"
            >
              <span class="material-symbols-outlined">delete</span>
            </v-btn>
          </template>
        </v-tooltip>
      </div>
    </div>
    
    <!-- Property Body - only for types that need it -->
    <div class="property-body" v-if="showBody" data-test="property-body">
      <slot name="body"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import { 
  type Property,
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
  hideTypeSelector?: boolean
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
  
  // Non-root properties can be required if they're not arrays
  // Objects can be required (they have a required field in the schema)
  return !isArrayProperty(props.property)
})

const canBeDeleted = computed(() => {
  // Root properties cannot be deleted
  if (isRoot.value) return false
  
  // Non-root properties can be deleted
  return true
})

const showBody = computed(() => {
  // Only show body for types that need it
  if (isObjectProperty(props.property)) {
    return true
  }
  
  if (isArrayProperty(props.property)) {
    // Only show body for array of object or array of array
    const items = props.property.items
    return items && (items.type === 'object' || items.type === 'array')
  }
  
  // Show body for Simple and Complex properties to display their schema/type configuration
  if (isSimpleProperty(props.property) || isComplexProperty(props.property)) {
    return true
  }
  
  return false
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
    
    // Handle type-specific property creation
    if (newType === 'array' && !isArrayProperty(props.property)) {
      // Create a new array property object to ensure proper reactivity
      const newProperty = {
        ...props.property,
        type: newType,
        items: {
          name: 'item',
          description: 'Array item',
          type: 'word',
          required: false
        }
      }
      
      // Emit the change with the new property object
      emit('change', newProperty)
    } else if (newType === 'object' && !isObjectProperty(props.property)) {
      // Create a new object property object to ensure proper reactivity
      const newProperty = {
        ...props.property,
        type: newType,
        additional_properties: false,
        properties: []
      }
      
      // Emit the change with the new property object
      emit('change', newProperty)
    } else if (newType === 'simple' && !isSimpleProperty(props.property)) {
      // Create a new simple property object to ensure proper reactivity
      const newProperty = {
        ...props.property,
        type: newType,
        schema: {}
      }
      
      // Emit the change with the new property object
      emit('change', newProperty)
    } else if (newType === 'complex' && !isComplexProperty(props.property)) {
      // Create a new complex property object to ensure proper reactivity
      const newProperty = {
        ...props.property,
        type: newType,
        json_type: {},
        bson_type: {}
      }
      
      // Emit the change with the new property object
      emit('change', newProperty)
    } else if (newType === 'enum' && !isCustomProperty(props.property)) {
      // Create a new enum property object to ensure proper reactivity
      const newProperty = {
        ...(props.property as any),
        type: newType,
        enums: ''
      }
      
      // Emit the change with the new property object
      emit('change', newProperty)
    } else if (newType === 'enum_array' && !isCustomProperty(props.property)) {
      // Create a new enum array property object to ensure proper reactivity
      const newProperty = {
        ...(props.property as any),
        type: newType,
        enums: ''
      }
      
      // Emit the change with the new property object
      emit('change', newProperty)
    } else if (newType === 'ref' && !isCustomProperty(props.property)) {
      // Create a new ref property object to ensure proper reactivity
      const newProperty = {
        ...(props.property as any),
        type: newType,
        ref: ''
      }
      
      // Emit the change with the new property object
      emit('change', newProperty)
    }
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
  padding: 12px 5px;
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
