<template>
  <div class="custom-property-editor">
    <div class="property-title-row d-flex align-center pa-4 border-b">
      <v-icon icon="mdi-tag" class="mr-3" color="primary" />
      <v-text-field
        v-if="!isRoot"
        v-model="editablePropertyName"
        placeholder="name"
        density="compact"
        variant="outlined"
        hide-details
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
        class="mr-2"
        style="max-width: 300px;"
        @update:model-value="handleChange"
      />
      <DictionaryTypePicker
        v-model="property.type"
        label="Type"
        density="compact"
        class="mr-2"
        style="max-width: 120px;"
        @update:model-value="handleTypeChange"
      />
      <v-tooltip 
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
            v-bind="props"
            @click="property.required = !property.required; handleChange()"
            class="pa-0 ma-0"
          >
            <v-icon size="16">mdi-star</v-icon>
          </v-btn>
        </template>
        <span>Required</span>
      </v-tooltip>
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
import DictionaryTypePicker from './DictionaryTypePicker.vue'
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

function handleDelete() {
  emit('delete')
}
</script>

<style scoped>
.custom-property-editor {
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
</style> 