<template>
  <div class="custom-property-editor">
    <div class="property-title-row d-flex align-center pa-4 border-b">
      <!-- Key editor (if not root) -->
      <InLineEditor
        v-if="!isRoot"
        :model-value="propertyName"
        @update:model-value="handlePropertyNameChange"
        placeholder="name"
        class="property-name-input mr-2"
      />
      <!-- Description editor -->
      <InLineEditor
        v-model="property.description"
        placeholder="Description"
        class="mr-2"
        @update:model-value="handleChange"
      />
      <!-- Type picker -->
      <TypePicker
        v-model="property.type"
        class="mr-2"
        @update:model-value="handleChange"
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
import { useCustomPropertyEditor } from '@/composables/useCustomPropertyEditor'
import type { Property } from '@/composables/usePropertyEditor'
import TypePicker from './TypePicker.vue'
import InLineEditor from './InLineEditor.vue'

const props = defineProps<{ property: Property, isRoot?: boolean, propertyName?: string }>()
const emit = defineEmits(['change', 'delete', 'rename'])
const property = props.property
const isRoot = props.isRoot || false
const propertyName = props.propertyName || ''
const { handleChange, handleDelete } = useCustomPropertyEditor(property, (event: string, payload: Property) => emit(event as 'change' | 'delete', payload))

function handlePropertyNameChange(newName: string) {
  emit('rename', propertyName, newName)
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