<template>
  <div class="object-property-editor">
    <!-- Title pane = property editor -->
    <div class="property-title-row d-flex align-center pa-4 border-b">
      <v-icon icon="mdi-cube-outline" class="mr-3" color="primary" />
      <v-text-field
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
      
      <!-- Add Property Button -->
      <v-btn
        v-if="!props.disabled"
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
    
    <!-- Content pane = properties list only -->
    <div class="property-content pa-4">
      <div v-if="property.properties && Object.keys(property.properties).length > 0">
        <div v-for="(prop, propName) in property.properties" :key="propName" class="mb-3">
          <!-- Simple nested property renderer without title row -->
          <div class="nested-property">
            <div class="nested-property-header d-flex align-center pa-2 bg-grey-lighten-4 rounded mb-2">
              <v-icon icon="mdi-circle-small" class="mr-2" color="grey" />
              <v-text-field
                v-model="nestedPropertyNames[propName]"
                placeholder="name"
                density="compact"
                variant="outlined"
                hide-details
                :disabled="props.disabled"
                @update:model-value="(value) => handleNestedPropertyNameChange(propName, value)"
                style="max-width: 150px;"
                class="mr-2"
              />
              <v-text-field
                v-model="prop.description"
                placeholder="Description"
                density="compact"
                variant="outlined"
                hide-details
                :disabled="props.disabled"
                @update:model-value="() => handlePropertyChange(propName, prop)"
                class="mr-2"
                style="max-width: 300px;"
              />
              <DictionaryTypePicker
                v-if="props.typePickerComponent === 'DictionaryTypePicker'"
                v-model="prop.type"
                label="Type"
                density="compact"
                :disabled="props.disabled"
                :exclude-type="props.excludeType"
                @update:model-value="() => handlePropertyChange(propName, prop)"
                class="mr-2"
                style="max-width: 120px;"
              />
              <TypePicker
                v-else
                v-model="prop.type"
                label="Type"
                density="compact"
                :disabled="props.disabled"
                :exclude-type="props.excludeType"
                @update:model-value="() => handlePropertyChange(propName, prop)"
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
                    :color="prop.required ? 'primary' : 'grey'"
                    :disabled="props.disabled"
                    v-bind="props"
                    @click="prop.required = !prop.required; handlePropertyChange(propName, prop)"
                    class="pa-0 ma-0"
                  >
                    <v-icon size="16">mdi-star</v-icon>
                  </v-btn>
                </template>
                <span>Required</span>
              </v-tooltip>
              <v-btn
                v-if="!props.disabled"
                icon
                size="x-small"
                variant="text"
                color="error"
                @click="handleDeleteProperty(propName)"
                class="ml-auto"
              >
                <v-icon size="16">mdi-delete</v-icon>
              </v-btn>
            </div>
            
            <!-- Nested property content -->
            <div v-if="prop.type === 'object' && prop.properties" class="ml-4">
              <div v-if="Object.keys(prop.properties).length > 0">
                <div v-for="(nestedProp, nestedPropName) in prop.properties" :key="nestedPropName" class="mb-2">
                  <PropertyEditorFactory
                    :property="nestedProp"
                    :property-name="nestedPropName"
                    :disabled="props.disabled"
                    :exclude-type="props.excludeType"
                    :top-level="false"
                    @change="(updatedProperty) => handleNestedPropertyChange(propName, nestedPropName, updatedProperty)"
                    @delete="() => handleDeleteNestedProperty(propName, nestedPropName)"
                  />
                </div>
              </div>
              <div v-else class="text-center text-grey pa-2">
                <v-icon size="24" color="grey-lighten-1">mdi-folder-open</v-icon>
                <div class="text-caption">No nested properties</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center text-grey">
        <v-icon size="48" color="grey-lighten-1">mdi-folder-open</v-icon>
        <div class="text-body-2 mt-2">No properties defined</div>
        <div class="text-caption">Use the "Add Property" button to add properties</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePropertyEditor, type Property } from '@/composables/usePropertyEditor'
import DictionaryTypePicker from './DictionaryTypePicker.vue'
import TypePicker from './TypePicker.vue'
import PropertyEditorFactory from './PropertyEditorFactory.vue'
import { onMounted, ref } from 'vue'

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

// Reactive state for nested property names
const nestedPropertyNames = ref<Record<string, string>>({})

// Use the property editor composable
const {
  editablePropertyName,
  canBeRequired,
  handleChange,
  handleTypeChange,
  handlePropertyNameChange,
  addProperty,
  deleteProperty
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
  // Initialize nested property names
  if (props.property.properties) {
    Object.keys(props.property.properties).forEach(propName => {
      nestedPropertyNames.value[propName] = propName
    })
  }
})

// Methods
const handlePropertyChange = (propName: string, updatedProperty: Property) => {
  if (props.property.properties) {
    props.property.properties[propName] = updatedProperty
    handleChange()
  }
}

const handleNestedPropertyChange = (parentPropName: string, propName: string, updatedProperty: Property) => {
  if (props.property.properties && props.property.properties[parentPropName]?.properties) {
    props.property.properties[parentPropName].properties![propName] = updatedProperty
    handleChange()
  }
}

const handleNestedPropertyNameChange = (propName: string, value: string) => {
  nestedPropertyNames.value[propName] = value
  // Note: Property interface doesn't have a name field, so we just update the local state
  handleChange()
}

const handleAddProperty = () => {
  const newPropertyName = `property_${Object.keys(props.property.properties || {}).length + 1}`
  addProperty(props.property, newPropertyName)
  nestedPropertyNames.value[newPropertyName] = newPropertyName
}

const handleDeleteProperty = (propName: string) => {
  deleteProperty(props.property, propName)
  delete nestedPropertyNames.value[propName]
}

const handleDeleteNestedProperty = (parentPropName: string, propName: string) => {
  if (props.property.properties && props.property.properties[parentPropName]?.properties) {
    delete props.property.properties[parentPropName].properties![propName]
    handleChange()
  }
}
</script>

<style scoped>
.object-property-editor {
  width: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  margin-bottom: 16px;
}

.property-title-row {
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.property-name-input {
  max-width: 150px;
}

.property-content {
  background: white;
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
</style> 