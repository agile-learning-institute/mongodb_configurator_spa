<template>
  <div class="property-editor">
    <!-- Custom layout for non-top-level properties -->
    <div v-if="!props.topLevel" class="property-card">
      <!-- Title row with all controls -->
      <div class="property-title-row d-flex align-center pa-4 border-b">
        <v-icon :icon="getPropertyIcon()" class="mr-3" color="primary" />
        <v-text-field
          v-if="props.propertyName !== 'items'"
          v-model="editablePropertyName"
          placeholder="name"
          density="compact"
          variant="outlined"
          hide-details
          :disabled="props.disabled"
          class="property-name-input mr-2"
          @update:model-value="handlePropertyNameChange"
          style="max-width: 150px;"
        />
        <div v-else class="mr-2">
          <span class="text-h6 font-weight-bold">Items</span>
        </div>
        <v-text-field
          v-model="property.description"
          placeholder="Description"
          density="compact"
          variant="outlined"
          hide-details
          :disabled="props.disabled"
          @update:model-value="handleChange"
          class="mr-2"
          style="max-width: 300px;"
        />
        <DictionaryTypePicker
          v-if="props.typePickerComponent === 'DictionaryTypePicker'"
          v-model="property.type"
          label="Type"
          density="compact"
          :disabled="props.disabled"
          :exclude-type="props.excludeType"
          @update:model-value="handleTypeChange"
          class="mr-2"
          style="max-width: 120px;"
        />
        <TypePicker
          v-else
          v-model="property.type"
          label="Type"
          density="compact"
          :disabled="props.disabled"
          :exclude-type="props.excludeType"
          @update:model-value="handleTypeChange"
          class="mr-2"
          style="max-width: 120px;"
        />
        <v-tooltip 
          v-if="canBeRequired" 
          location="top" 
          class="tooltip-dark"
          :open-delay="0"
          :close-delay="0"
          theme="dark"
        >
          <template v-slot:activator="{ props }">
            <v-btn
              icon
              size="x-small"
              variant="text"
              :color="property.required ? 'primary' : 'grey'"
              :disabled="props.disabled"
              v-bind="props"
              @click="property.required = !property.required; handleChange()"
              class="pa-0 ma-0"
            >
              <v-icon size="16">mdi-star</v-icon>
            </v-btn>
          </template>
          <span>Required</span>
        </v-tooltip>
        
        <!-- Add Property Button (for objects) -->
        <v-btn
          v-if="isObjectType && !props.disabled"
          color="primary"
          variant="outlined"
          size="small"
          @click="handleAddProperty"
          class="ml-auto"
        >
          <v-icon start size="small">mdi-plus</v-icon>
          Add Property
        </v-btn>
      </div>
      
      <!-- Content area - only for object types -->
      <div v-if="isObjectType" class="property-content pa-4">
        <div v-if="property.properties && Object.keys(property.properties).length > 0">
          <div v-for="(prop, propName) in property.properties" :key="propName" class="mb-3">
            <PropertyEditorFactory
              :property="prop"
              :property-name="propName"
              :disabled="props.disabled"
              :exclude-type="props.excludeType"
              :top-level="false"
              @change="(updatedProperty) => handlePropertyChange(propName, updatedProperty)"
              @delete="() => handleDeleteProperty(propName)"
            />
          </div>
        </div>
        <div v-else class="text-center text-grey">
          <v-icon size="48" color="grey-lighten-1">mdi-folder-open</v-icon>
          <div class="text-body-2 mt-2">No properties defined</div>
          <div class="text-caption">Use the "Add Property" button to add properties</div>
        </div>
      </div>
    </div>
    
    <!-- Top-level layout for root properties -->
    <div v-else class="top-level-property d-flex align-center mb-4">
      <span class="text-h5 font-weight-bold mr-2">{{ props.topLevelName }}</span>
      <v-text-field
        v-model="property.description"
        placeholder="Description"
        density="compact"
        variant="outlined"
        hide-details
        :disabled="props.disabled"
        @update:model-value="handleChange"
        class="mr-2"
        style="max-width: 300px;"
      />
      <DictionaryTypePicker
        v-if="props.typePickerComponent === 'DictionaryTypePicker'"
        v-model="property.type"
        label="Type"
        density="compact"
        :disabled="props.disabled"
        :exclude-type="props.excludeType"
        @update:model-value="handleTypeChange"
        class="mr-2"
        style="max-width: 120px;"
      />
      <TypePicker
        v-else
        v-model="property.type"
        label="Type"
        density="compact"
        :disabled="props.disabled"
        :exclude-type="props.excludeType"
        @update:model-value="handleTypeChange"
        class="mr-2"
        style="max-width: 120px;"
      />
      <v-tooltip 
        v-if="canBeRequired" 
        location="top" 
        class="tooltip-dark"
        :open-delay="0"
        :close-delay="0"
        theme="dark"
      >
        <template v-slot:activator="{ props }">
          <v-btn
            icon
            size="x-small"
            variant="text"
            :color="property.required ? 'primary' : 'grey'"
            :disabled="props.disabled"
            v-bind="props"
            @click="property.required = !property.required; handleChange()"
            class="pa-0 ma-0"
          >
            <v-icon size="16">mdi-star</v-icon>
          </v-btn>
        </template>
        <span>Required</span>
      </v-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">

import { usePropertyEditor, type Property } from '@/composables/usePropertyEditor'
import DictionaryTypePicker from './DictionaryTypePicker.vue'
import TypePicker from './TypePicker.vue'
import PropertyEditorFactory from './PropertyEditorFactory.vue'
import { onMounted } from 'vue'

interface Props {
  property: Property
  propertyName?: string
  disabled?: boolean
  excludeType?: string
  topLevel?: boolean
  topLevelName?: string
  hideTopLevelRow?: boolean
  typePickerComponent?: 'DictionaryTypePicker' | 'TypePicker'
}

const props = withDefaults(defineProps<Props>(), {
  propertyName: '',
  disabled: false,
  excludeType: '',
  topLevel: false,
  topLevelName: '',
  hideTopLevelRow: false,
  typePickerComponent: 'DictionaryTypePicker'
})

const emit = defineEmits<{
  change: [property: Property]
  delete: []
}>()

// Use the property editor composable
const {
  editablePropertyName,
  isObjectType,
  isArrayType,
  isListType,
  hasSubProperties,
  canHaveAdditionalProperties,
  canHaveOneOf,
  canBeRequired,
  canBeDeleted,
  handleChange,
  handleTypeChange,
  handlePropertyNameChange,
  toggleOneOf,
  addProperty,
  deleteProperty,
  showOneOfDialog
} = usePropertyEditor(props.property, {
  disabled: props.disabled,
  excludeType: props.excludeType,
  topLevel: props.topLevel,
  propertyName: props.propertyName,
  topLevelName: props.topLevelName,
  onUpdate: (property) => emit('change', property),
  onDelete: () => emit('delete')
})

onMounted(() => {
  console.log('PropertyEditor mounted:', props.propertyName, props.property.type)
})


// Methods
const handlePropertyChange = (propName: string, updatedProperty: Property) => {
  if (props.property.properties) {
    props.property.properties[propName] = updatedProperty
    handleChange()
  }
}

const handleItemsChange = (updatedItems: Property) => {
  props.property.items = updatedItems
  handleChange()
}

const handleAddProperty = () => {
  const newPropertyName = `property_${Object.keys(props.property.properties || {}).length + 1}`
  addProperty(props.property, newPropertyName)
}

const handleDeleteProperty = (propName: string) => {
  if (props.property.properties) {
    delete props.property.properties[propName]
    handleChange()
  }
}

// Helper methods for card title and icon
const getPropertyTitle = () => {
  if (props.propertyName === 'items') return 'Array Items'
  return props.propertyName || 'Property'
}

const getPropertyIcon = () => {
  if (props.propertyName === 'items') return 'mdi-format-list-bulleted'
  if (isObjectType.value) return 'mdi-cube-outline'
  if (isArrayType.value || isListType.value) return 'mdi-format-list-bulleted'
  return 'mdi-tag'
}
</script>

<style scoped>
.property-editor {
  width: 100%;
}

.property-name-input {
  max-width: 150px;
}

.property-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.property-title-row {
  background-color: #f5f5f5;
}

.property-content {
  padding: 16px;
}

.nested-properties {
  margin-left: 24px;
  padding-left: 16px;
  border-left: 2px solid #e0e0e0;
}

.properties-list {
  margin-top: 8px;
}

.items-properties {
  margin-top: 8px;
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

/* More comprehensive tooltip styling */
:deep(.v-tooltip) {
  background-color: #424242 !important;
  color: white !important;
}

:deep(.v-tooltip .v-tooltip__content) {
  background-color: #424242 !important;
  color: white !important;
}

:deep(.v-overlay__content) {
  background-color: #424242 !important;
  color: white !important;
}
</style> 