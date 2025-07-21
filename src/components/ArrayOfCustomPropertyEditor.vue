<template>
  <div class="array-custom-property-editor">
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
      <TypePicker
        v-model="itemsType"
        class="mr-2"
        :exclude-type-list="['enum', 'enum_array']"
      />
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
  </div>
</template>

<script setup lang="ts">
import { usePropertyEditor, type Property } from '@/composables/usePropertyEditor'
import TypePicker from './TypePicker.vue'
import InLineEditor from './InLineEditor.vue'
import { computed } from 'vue'

const props = defineProps<{
  property: Property,
  isRoot?: boolean
}>()

const property = props.property
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

// Computed getter/setter for itemsType
const itemsType = computed({
  get() {
    return property.items?.type || ''
  },
  set(type: string) {
    if (!property.items) property.items = {} as any
    property.items!.type = type
    handleChange()
  }
})

function handleDelete() {
  emit('delete')
}
</script>

<style scoped>
.array-custom-property-editor {
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
:deep(.tooltip-dark) {
  background-color: #424242 !important;
  color: white !important;
}
:deep(.tooltip-dark .v-tooltip__content) {
  background-color: #424242 !important;
  color: white !important;
}
.items-label {
  font-weight: 500;
  color: #555;
}
</style> 