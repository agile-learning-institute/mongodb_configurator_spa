<template>
  <div class="array-object-property-editor">
    <div class="property-title-row d-flex align-center pa-4 border-b">
      <!-- Key editor (if not root) -->
      <InLineEditor
        v-if="!isRoot"
        v-model="editablePropertyName"
        placeholder="name"
        class="property-name-input mr-2"
        @update:model-value="handlePropertyNameChange"
      />
      <!-- Description editor -->
      <InLineEditor
        v-model="property.description"
        placeholder="Description"
        class="mr-2"
        @update:model-value="handleChange"
      />
      <!-- Type picker for array type -->
      <TypePicker
        v-model="property.type"
        class="mr-2"
        @update:model-value="handleTypeChange"
      />
      <!-- Type picker for items type with label and restricted types -->
      <span class="items-label mr-1">Items:</span>
      <ItemTypePicker
        v-model="itemsType"
        class="mr-2"
      />
      <!-- Add Property Button -->
      <v-btn
        color="primary"
        variant="outlined"
        size="small"
        @click="handleAddProperty"
        class="ml-2"
      >
        <v-icon start size="small">mdi-plus</v-icon>
        Add Property
      </v-btn>
      <!-- Required icon -->
      <v-tooltip location="top" class="tooltip-dark" :open-delay="0" :close-delay="0" theme="dark">
        <template v-slot:activator="{ props }">
          <v-btn
            icon
            size="x-small"
            variant="text"
            :color="property.required ? 'primary' : 'grey'"
            v-bind="props"
            @click="property.required = !property.required; handleChange()"
            class="pa-0 ma-0"
          >
            <v-icon size="16">mdi-star</v-icon>
          </v-btn>
        </template>
        <span>Required</span>
      </v-tooltip>
      <!-- Additional Properties icon -->
      <v-tooltip location="top" class="tooltip-dark" :open-delay="0" :close-delay="0" theme="dark">
        <template v-slot:activator="{ props }">
          <v-btn
            icon
            size="x-small"
            variant="text"
            :color="property.items?.additional_properties ? 'primary' : 'grey'"
            v-bind="props"
            @click="toggleAdditionalProperties"
            class="pa-0 ma-0 ml-2"
          >
            <v-icon size="16">mdi-plus-circle</v-icon>
          </v-btn>
        </template>
        <span>Additional Properties</span>
      </v-tooltip>
      <!-- Delete icon (if not root) -->
      <v-btn
        v-if="!isRoot"
        icon
        size="x-small"
        variant="text"
        color="error"
        @click="handleDelete"
        class="ml-2"
      >
        <v-icon size="16">mdi-delete</v-icon>
      </v-btn>
    </div>
    <!-- Body: property editors for each property in value.items.properties -->
    <div class="property-body pa-4">
      <div v-if="property.items && property.items.properties">
        <div v-for="(prop, propName) in property.items!.properties" :key="propName" class="mb-3">
          <PropertyEditorFactory
            :property="prop"
            :is-root="false"
            @change="updated => handleChildPropertyChange(propName, updated)"
            @delete="() => handleDeleteProperty(propName)"
          />
        </div>
      </div>
      <div v-else class="text-grey">No properties defined. Use Add Property to add one.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePropertyEditor, type Property } from '@/composables/usePropertyEditor'
import TypePicker from './TypePicker.vue'
import InLineEditor from './InLineEditor.vue'
import ItemTypePicker from './ItemTypePicker.vue'
import PropertyEditorFactory from './PropertyEditorFactory.vue'
import { computed } from 'vue'
import { useArrayOfObjectPropertyEditor } from '@/composables/useArrayOfObjectPropertyEditor'

// Extend Property type to include additional_properties for this component
interface ObjectProperty extends Property {
  additional_properties?: boolean
}

const props = defineProps<{
  property: Property,
  isRoot?: boolean
}>()

const property = props.property as ObjectProperty
const isRoot = computed(() => props.isRoot ?? false)

const emit = defineEmits<{
  change: [property: Property]
  delete: []
}>()

const {
  editablePropertyName,
  handleChange,
  handleTypeChange,
  handlePropertyNameChange
} = usePropertyEditor(property, {
  onUpdate: (property) => emit('change', property),
  onDelete: () => emit('delete')
})

// Use the dedicated composable for array-of-object property operations
const {
  itemsType,
  handleAddProperty,
  handleDeleteProperty,
  handleChildPropertyChange,
  toggleAdditionalProperties
} = useArrayOfObjectPropertyEditor(property, (event, ...args) => emit(event, ...args))

function handleDelete() {
  emit('delete')
}
</script>

<style scoped>
.array-object-property-editor {
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
.items-label {
  font-weight: 500;
  color: #555;
}
:deep(.tooltip-dark) {
  background-color: #424242 !important;
  color: white !important;
}
:deep(.tooltip-dark .v-tooltip__content) {
  background-color: #424242 !important;
  color: white !important;
}
</style> 