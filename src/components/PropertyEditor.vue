<template>
  <div class="property-editor">
    <!-- Property Header with Name and Description -->
    <div class="property-header d-flex align-center">
      <div class="property-name-section" v-if="!isRoot" :id="`property-name-${property.name || 'root'}`">
        <v-text-field
          v-model="editableName"
          variant="plain"
          density="compact"
          hide-details
          :disabled="disabled"
          class="mr-2"
          :style="{ minWidth: '180px' }"
          @blur="handleNameChange"
          @keyup.enter="handleNameChange"
        />
      </div>
      
      <div class="property-description-section" :id="`property-description-${property.name || 'root'}`">
        <v-text-field
          v-model="editableDescription"
          variant="plain"
          density="compact"
          hide-details
          :disabled="disabled"
          class="mr-2"
          :style="{ minWidth: '200px', flex: '1' }"
          placeholder="Description"
          @blur="handleDescriptionChange"
          @keyup.enter="handleDescriptionChange"
        />
      </div>
      
      <div class="property-type-section">
        <!-- TODO: Replace with chip picker in upcoming section -->
        <!-- Property type selection will be implemented here -->
      </div>
      
      <div class="property-required-section" v-if="canBeRequired">
        <div class="tooltip-container">
          <v-checkbox
            v-model="editableRequired"
            hide-details
            :disabled="disabled"
            @update:model-value="handleRequiredChange"
            @mouseenter="showTooltip = true"
            @mouseleave="showTooltip = false"
          />
          <div 
            v-if="showTooltip" 
            class="custom-tooltip"
          >
            Mark this property as required
          </div>
        </div>
      </div>
      
      <div class="property-actions" v-if="canBeDeleted">
        <!-- TODO: Replace with delete button + tooltip in upcoming section -->
        <!-- Delete button will be implemented here -->
      </div>
    </div>
    
    <!-- Property Type Specific Editor -->
    <div class="property-body" v-if="showBody">
      <component
        :is="propertyTypeEditor"
        :property="property"
        :disabled="disabled"
        @change="handlePropertyChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, defineAsyncComponent } from 'vue'
import { 
  type Property,
  isArrayProperty,
  isObjectProperty,
  isSimpleProperty,
  isComplexProperty,
  isEnumProperty,
  isEnumArrayProperty,
  isRefProperty,
  isConstantProperty,
  isCustomProperty,
  isOneOfProperty
} from '@/types/types'

// Import property type editors with lazy loading
const ArrayPropertyEditor = defineAsyncComponent(() => import('./property-types/ArrayPropertyEditor.vue'))
const ObjectPropertyEditor = defineAsyncComponent(() => import('./property-types/ObjectPropertyEditor.vue'))
const SimplePropertyEditor = defineAsyncComponent(() => import('./property-types/SimplePropertyEditor.vue'))
const ComplexPropertyEditor = defineAsyncComponent(() => import('./property-types/ComplexPropertyEditor.vue'))
const EnumPropertyEditor = defineAsyncComponent(() => import('./property-types/EnumPropertyEditor.vue'))
const EnumArrayPropertyEditor = defineAsyncComponent(() => import('./property-types/EnumArrayPropertyEditor.vue'))
const RefPropertyEditor = defineAsyncComponent(() => import('./property-types/RefPropertyEditor.vue'))
const ConstantPropertyEditor = defineAsyncComponent(() => import('./property-types/ConstantPropertyEditor.vue'))
const CustomPropertyEditor = defineAsyncComponent(() => import('./property-types/CustomPropertyEditor.vue'))
const OneOfPropertyEditor = defineAsyncComponent(() => import('./property-types/OneOfPropertyEditor.vue'))

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

// Reactive state for inline editing
const editableName = ref(props.property.name)
const editableDescription = ref(props.property.description)
const editableType = ref(props.property.type)
const editableRequired = ref(props.property.required)
const showTooltip = ref(false)

// Computed properties
const isRoot = computed(() => props.isRoot ?? false)
const canBeRequired = computed(() => !isRoot.value)
const canBeDeleted = computed(() => !isRoot.value)

// Available types based on context
const availableTypes = computed(() => {
  const allTypes = [
    { title: 'Array', value: 'array' },
    { title: 'Object', value: 'object' },
    { title: 'Simple', value: 'simple' },
    { title: 'Complex', value: 'complex' },
    { title: 'Enum', value: 'enum' },
    { title: 'Enum Array', value: 'enum_array' },
    { title: 'Reference', value: 'ref' },
    { title: 'Constant', value: 'constant' },
    { title: 'One Of', value: 'one_of' },
    { title: 'Custom', value: 'custom' }
  ]
  
  if (props.isType) {
    // Type files only support: simple, complex, object, array, custom
    return allTypes.filter(t => ['simple', 'complex', 'object', 'array', 'custom'].includes(t.value))
  }
  
  if (props.isDictionary) {
    // Dictionary files don't support: simple, complex
    return allTypes.filter(t => !['simple', 'complex'].includes(t.value))
  }
  
  return allTypes
})

// Property type editor component
const propertyTypeEditor = computed(() => {
  if (isArrayProperty(props.property)) return ArrayPropertyEditor
  if (isObjectProperty(props.property)) return ObjectPropertyEditor
  if (isSimpleProperty(props.property)) return SimplePropertyEditor
  if (isComplexProperty(props.property)) return ComplexPropertyEditor
  if (isEnumProperty(props.property)) return EnumPropertyEditor
  if (isEnumArrayProperty(props.property)) return EnumArrayPropertyEditor
  if (isRefProperty(props.property)) return RefPropertyEditor
  if (isConstantProperty(props.property)) return ConstantPropertyEditor
  if (isOneOfProperty(props.property)) return OneOfPropertyEditor
  if (isCustomProperty(props.property)) return CustomPropertyEditor
  
  // Fallback to custom editor for unknown types
  return CustomPropertyEditor
})

// Show body for complex types that need additional editing
const showBody = computed(() => {
  return isArrayProperty(props.property) || 
         isObjectProperty(props.property) || 
         isSimpleProperty(props.property) || 
         isComplexProperty(props.property) ||
         isOneOfProperty(props.property)
})

// Event handlers
const handleNameChange = () => {
  props.property.name = editableName.value
  emit('change', props.property)
}

const handleDescriptionChange = () => {
  props.property.description = editableDescription.value
  emit('change', props.property)
}

const handleTypeChange = (newType: string) => {
  // Create new property with the new type
  const newProperty = createPropertyForType(newType, props.property)
  
  // Update the property reference
  Object.assign(props.property, newProperty)
  
  // Update local state
  editableType.value = newType
  editableName.value = props.property.name
  editableDescription.value = props.property.description
  editableRequired.value = props.property.required
  
  emit('change', props.property)
}

const handleRequiredChange = () => {
  props.property.required = editableRequired.value
  emit('change', props.property)
}

const handlePropertyChange = (updatedProperty: Property) => {
  emit('change', updatedProperty)
}

const handleDelete = () => {
  emit('delete')
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
      return {
        ...baseProperty,
        items: {
          name: 'item',
          description: 'Array item',
          type: 'string',
          required: false
        }
      } as Property
    
    case 'object':
      return {
        ...baseProperty,
        additional_properties: false,
        properties: []
      } as Property
    
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
    
    case 'constant':
      return {
        ...baseProperty,
        constant: ''
      } as Property
    
    case 'one_of':
      return {
        ...baseProperty,
        properties: []
      } as Property
    
    default:
      // Custom type - just return the base property with the custom type
      return {
        ...baseProperty,
        type
      } as Property
  }
}

// Watch for property changes
watch(() => props.property, (newProperty) => {
  editableName.value = newProperty.name
  editableDescription.value = newProperty.description
  editableType.value = newProperty.type
  editableRequired.value = newProperty.required
}, { deep: true })
</script>

<style scoped>
.property-editor {
  border-bottom: 1px solid #e0e0e0;
  padding: 0;
  margin: 0;
  background-color: transparent;
}

.property-editor:last-child {
  border-bottom: none;
}

.property-header {
  display: flex !important;
  align-items: center;
  padding: 0;
  margin: 0;
  width: 100%;
}

/* Ensure the description section can expand */
.property-description-section {
  flex: 1;
  min-width: 0; /* Allow shrinking below min-width when needed */
}

/* Right-justify the required checkbox */
.property-required-section {
  margin-left: auto;
}

/* Custom tooltip styling */
.tooltip-container {
  position: relative;
}

.custom-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 1000;
  margin-bottom: 8px;
}

.custom-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.9);
}

/* Remove white background from input boxes - more aggressive targeting */
.property-editor .v-text-field .v-field,
.property-editor .v-text-field .v-field__field,
.property-editor .v-text-field .v-input__control,
.property-editor .v-text-field .v-field__input {
  background-color: transparent !important;
  background: transparent !important;
}

/* Also target the input element directly */
.property-editor input {
  background-color: transparent !important;
  background: transparent !important;
}

/* Target only the name input specifically */
#property-name-from input,
[id^="property-name-"] input {
  min-width: 180px !important;
  max-width: 180px !important;
}

/* Target only the description input specifically */
#property-description-from input,
[id^="property-description-"] input {
  min-width: 200px !important;
}

.property-body {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e0e0e0;
}
</style> 