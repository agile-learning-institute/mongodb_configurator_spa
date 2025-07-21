<template>
  <div class="enum-property-editor">
    <!-- Card-based layout for non-top-level properties -->
    <BaseCard 
      v-if="!props.topLevel"
      :title="getPropertyTitle()"
      :icon="getPropertyIcon()"
      :is-secondary="true"
    >
      <template #header-actions>
        <!-- Enum Picker in Header -->
        <EnumPicker
          :model-value="property.enums?.[0] || ''"
          label="Select Enum"
          density="compact"
          :disabled="disabled"
          @update:model-value="handleEnumChange"
        />
      </template>
      
      <!-- Property Content -->
      <div class="property-content">
        <!-- Property Name -->
        <div class="d-flex align-center mb-3">
          <div class="property-name mr-4">
            <v-text-field
              v-model="editablePropertyName"
              placeholder="name"
              density="compact"
              variant="outlined"
              hide-details
              :disabled="disabled"
              class="property-name-input"
              @update:model-value="handlePropertyNameChange"
            />
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
    </BaseCard>

    <!-- Top-level layout for root enums -->
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
        
        <!-- Enum Picker -->
        <div class="enum-picker mr-2">
          <EnumPicker
            :model-value="property.enums?.[0] || ''"
            label="Select Enum"
            density="compact"
            :disabled="disabled"
            @update:model-value="handleEnumChange"
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { usePropertyEditor, type Property } from '@/composables/usePropertyEditor'
import DictionaryTypePicker from './DictionaryTypePicker.vue'
import TypePicker from './TypePicker.vue'
import EnumPicker from './EnumPicker.vue'
import BaseCard from './BaseCard.vue'

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
  canBeRequired,
  canBeDeleted,
  handleChange,
  handleTypeChange,
  handlePropertyNameChange
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
const handleEnumChange = (enumValue: string) => {
  // For enum properties, we store the selected enum as a single string
  // The enums field in Property interface is string[] but for enum properties we use it as string
  props.property.enums = [enumValue]
  handleChange()
}

const handleDelete = () => {
  emit('delete')
}

// Helper methods for card title and icon
const getPropertyTitle = () => {
  return props.propertyName || 'Property'
}

const getPropertyIcon = () => {
  return 'mdi-format-list-checks'
}
</script>

<style scoped>
.enum-property-editor {
  width: 100%;
}

.property-name-input {
  max-width: 150px;
}

.enum-selection {
  margin-top: 16px;
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