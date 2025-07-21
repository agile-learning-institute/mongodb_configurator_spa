<template>
  <div class="object-property-editor">
    <!-- Card-based layout for non-top-level properties -->
    <BaseCard 
      v-if="!props.topLevel"
      :title="getPropertyTitle()"
      :icon="getPropertyIcon()"
      :is-secondary="true"
    >
      <template #header-actions>
        <!-- Add Property Button -->
        <v-btn
          v-if="!disabled"
          color="primary"
          variant="outlined"
          size="small"
          @click="handleAddProperty"
        >
          <v-icon start size="small">mdi-plus</v-icon>
          Add Property
        </v-btn>
      </template>
      
      <!-- Property Content -->
      <div class="property-content">
        <!-- Property Name -->
        <div class="d-flex align-center mb-3">
          <div class="property-name mr-4">
            <v-text-field
              v-if="propertyName !== 'items'"
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
                v-if="props.typePickerComponent === 'DictionaryTypePicker'"
                v-model="property.type"
                label="Type"
                density="compact"
                :disabled="disabled"
                :exclude-type="excludeType"
                @update:model-value="handleTypeChange"
              />
              <TypePicker
                v-else
                v-model="property.type"
                label="Type"
                density="compact"
                :disabled="disabled"
                :exclude-type="excludeType"
                @update:model-value="handleTypeChange"
              />
            </div>
            
            <!-- Required Icon -->
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
            
            <!-- Additional Properties Icon -->
            <v-tooltip 
              v-if="canHaveAdditionalProperties" 
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
                  :color="property.additionalProperties ? 'primary' : 'grey'"
                  :disabled="disabled"
                  v-bind="props"
                  @click="property.additionalProperties = !property.additionalProperties; handleChange()"
                  class="pa-0 ma-0 ml-2"
                >
                  <v-icon size="16">mdi-plus-circle</v-icon>
                </v-btn>
              </template>
              <span>Additional Properties</span>
            </v-tooltip>
            
            <!-- One Of Icon -->
            <v-tooltip 
              v-if="canHaveOneOf" 
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
                  :color="property.oneOf && Object.keys(property.oneOf).length > 0 ? 'primary' : 'grey'"
                  :disabled="disabled"
                  v-bind="props"
                  @click="toggleOneOf"
                  class="pa-0 ma-0 ml-2"
                >
                  <v-icon size="16">mdi-format-list-bulleted</v-icon>
                </v-btn>
              </template>
              <span>One Of</span>
            </v-tooltip>
            
            <!-- Delete Icon -->
            <v-tooltip 
              v-if="canBeDeleted" 
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
                  color="error"
                  :disabled="disabled"
                  v-bind="props"
                  @click="handleDelete"
                  class="pa-0 ma-0 ml-2"
                >
                  <v-icon size="16">mdi-delete</v-icon>
                </v-btn>
              </template>
              <span>Delete</span>
            </v-tooltip>
          </div>
        </div>
      </div>
      
      <!-- Nested Properties Section -->
      <div v-if="hasSubProperties" class="nested-properties">
        <div v-if="property.properties" class="properties-list">
          <PropertyEditor
            v-for="(prop, propName) in property.properties"
            :key="propName"
            :property="prop"
            :property-name="propName"
            :disabled="disabled"
            :exclude-type="excludeType"
            :top-level="false"
            :hide-top-level-row="false"
            :type-picker-component="typePickerComponent"
            @change="handlePropertyChange(propName, $event)"
            @delete="() => deleteProperty(property, propName)"
          />
        </div>
      </div>
    </BaseCard>

    <!-- Top-level layout for root objects -->
    <div v-else class="top-level-property d-flex align-center mb-4">
      <!-- Property Name -->
      <div class="property-name mr-4">
        <span class="text-h5 font-weight-bold">{{ topLevelName }}</span>
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
            v-if="props.typePickerComponent === 'DictionaryTypePicker'"
            v-model="property.type"
            label="Type"
            density="compact"
            :disabled="disabled"
            :exclude-type="excludeType"
            @update:model-value="handleTypeChange"
          />
          <TypePicker
            v-else
            v-model="property.type"
            label="Type"
            density="compact"
            :disabled="disabled"
            :exclude-type="excludeType"
            @update:model-value="handleTypeChange"
          />
        </div>
        
        <!-- Required Icon -->
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
        
        <!-- Additional Properties Icon -->
        <v-tooltip 
          v-if="canHaveAdditionalProperties" 
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
              :color="property.additionalProperties ? 'primary' : 'grey'"
              :disabled="disabled"
              v-bind="props"
              @click="property.additionalProperties = !property.additionalProperties; handleChange()"
              class="pa-0 ma-0 ml-2"
            >
              <v-icon size="16">mdi-plus-circle</v-icon>
            </v-btn>
          </template>
          <span>Additional Properties</span>
        </v-tooltip>
        
        <!-- One Of Icon -->
        <v-tooltip 
          v-if="canHaveOneOf" 
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
              :color="property.oneOf && Object.keys(property.oneOf).length > 0 ? 'primary' : 'grey'"
              :disabled="disabled"
              v-bind="props"
              @click="toggleOneOf"
              class="pa-0 ma-0 ml-2"
            >
              <v-icon size="16">mdi-format-list-bulleted</v-icon>
            </v-btn>
          </template>
          <span>One Of</span>
        </v-tooltip>
      </div>
    </div>

    <!-- One Of Dialog -->
    <v-dialog v-model="showOneOfDialog" max-width="600">
      <v-card>
        <v-card-title>One Of Configuration</v-card-title>
        <v-card-text>
          <p>One Of configuration is not yet implemented in this version.</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showOneOfDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">

import { usePropertyEditor, type Property } from '@/composables/usePropertyEditor'
import DictionaryTypePicker from './DictionaryTypePicker.vue'
import TypePicker from './TypePicker.vue'
import BaseCard from './BaseCard.vue'
import PropertyEditor from './PropertyEditor.vue'

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

// Methods
const handlePropertyChange = (propName: string, updatedProperty: Property) => {
  if (props.property.properties) {
    props.property.properties[propName] = updatedProperty
    handleChange()
  }
}

const handleAddProperty = () => {
  const newPropertyName = `property_${Object.keys(props.property.properties || {}).length + 1}`
  addProperty(props.property, newPropertyName)
}

const handleDelete = () => {
  emit('delete')
}

// Helper methods for card title and icon
const getPropertyTitle = () => {
  if (props.propertyName === 'items') return 'Array Items'
  return props.propertyName || 'Property'
}

const getPropertyIcon = () => {
  if (props.propertyName === 'items') return 'mdi-format-list-bulleted'
  return 'mdi-cube-outline'
}
</script>

<style scoped>
.object-property-editor {
  width: 100%;
}

.property-name-input {
  max-width: 150px;
}

.nested-properties {
  margin-left: 24px;
  padding-left: 16px;
  border-left: 2px solid #e0e0e0;
}

.properties-list {
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