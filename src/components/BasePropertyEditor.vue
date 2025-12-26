<template>
  <div class="base-property-editor" :data-test="`base-property-editor-${property.name || 'root'}`">
    <!-- Property Header with Drag Handle, Name, Description, Type, Extension Slot, Required, and Delete -->
    <!-- Only show header for non-root properties -->
    <div v-if="!isRoot" class="property-header d-flex align-center" data-test="property-header">
      <!-- Drag handle for non-root properties -->
      <div class="property-drag-handle" 
           v-if="!disabled" 
           data-test="property-drag-handle"
           draggable="true"
           @dragstart="handleDragStart"
           @dragend="handleDragEnd">
        <v-icon icon="mdi-drag" size="small" color="grey" />
      </div>
      
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
        <!-- Always editable description input -->
        <v-text-field
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
              size="normal"
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
              size="normal"
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
import { computed, ref, watch } from 'vue'
import { 
  type Property,
  isArrayProperty,
  isObjectProperty,
  isOneOfProperty,
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
  hideDeleteButton?: boolean
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

// Computed properties
const isRoot = computed(() => props.isRoot || false)
const isDictionary = computed(() => props.isDictionary || false)
const isType = computed(() => props.isType || false)

const canBeRequired = computed(() => {
  // If disabled (locked), cannot be required
  if (props.disabled) return false
  
  // Root properties can always be required
  if (isRoot.value) return true
  
  // Non-root properties can be required
  // All property types (including arrays) can be required
  return true
})

const canBeDeleted = computed(() => {
  // Root properties cannot be deleted
  if (isRoot.value) return false
  
  // If explicitly hidden, don't show delete button
  if (props.hideDeleteButton) return false
  
  // Non-root properties can be deleted
  return true
})

const showBody = computed(() => {
  // Only show body for types that need it
  if (isObjectProperty(props.property)) {
    return true
  }
  
  if (isOneOfProperty(props.property)) {
    return true
  }
  
  if (isArrayProperty(props.property)) {
    // Show body for array of object, array of array, or array of one_of
    const items = props.property.items
    return items && (items.type === 'object' || items.type === 'array' || items.type === 'one_of')
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
    } else if (newType === 'enum') {
      // Create a new enum property object to ensure proper reactivity
      const newProperty = {
        ...(props.property as any),
        type: newType,
        enums: (props.property as any).enums || ''
      }
      
      // Emit the change with the new property object
      emit('change', newProperty)
    } else if (newType === 'enum_array') {
      // Create a new enum array property object to ensure proper reactivity
      const newProperty = {
        ...(props.property as any),
        type: newType,
        enums: (props.property as any).enums || ''
      }
      
      // Emit the change with the new property object
      emit('change', newProperty)
    } else if (newType === 'ref') {
      // Create a new ref property object to ensure proper reactivity
      const newProperty = {
        ...(props.property as any),
        type: newType,
        ref: (props.property as any).ref || ''
      }
      
      // Emit the change with the new property object
      emit('change', newProperty)
    } else if (newType === 'one_of' && !isCustomProperty(props.property)) {
      // Create a new one_of property object to ensure proper reactivity
      const newProperty = {
        ...(props.property as any),
        type: newType,
        properties: [],
        _collapsed: false
      }
      
      // Emit the change with the new property object
      emit('change', newProperty)
    } else if (newType === 'constant') {
      // Create a new constant property object to ensure proper reactivity
      const newProperty = {
        ...(props.property as any),
        type: newType,
        constant: (props.property as any).constant || ''
      }
      
      // Emit the change with the new property object
      emit('change', newProperty)
    } else {
      // Handle custom types - just change the type without modifying other properties
      const newProperty = {
        ...props.property,
        type: newType
      }
      
      // Emit the change with the new property object
      emit('change', newProperty)
    }
  }
}

const handleDelete = () => {
  emit('delete')
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

const handleDragStart = (event: DragEvent) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', props.property.name || '')
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.dropEffect = 'move'
  }
  // Add visual feedback to the entire property
  const propertyElement = (event.target as HTMLElement).closest('.base-property-editor')
  if (propertyElement) {
    (propertyElement as HTMLElement).style.opacity = '0.5'
  }
}

const handleDragEnd = (event: DragEvent) => {
  // Remove visual feedback from the entire property
  const propertyElement = (event.target as HTMLElement).closest('.base-property-editor')
  if (propertyElement) {
    (propertyElement as HTMLElement).style.opacity = '1'
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

.property-drag-handle {
  flex-shrink: 0;
  cursor: grab;
  padding: 4px;
  margin-right: 8px;
}

.property-drag-handle:active {
  cursor: grabbing;
}



.property-body {
  padding: 16px;
  background-color: #ffffff;
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
