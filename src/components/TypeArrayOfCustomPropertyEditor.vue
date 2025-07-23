<template>
  <div class="type-array-of-custom-property-editor">
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
      <!-- Type picker for array type -->
      <TypeTypePicker
        v-model="property.type"
        class="mr-2"
        :root-level="isRoot"
        @update:model-value="handleChange"
      />
      <!-- Type picker for items type with label and restricted types -->
      <span class="items-label mr-1">Items:</span>
      <TypeItemTypePicker
        v-model="itemsType"
        class="mr-2"
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
import { computed, defineProps, defineEmits } from 'vue'
import { useTypeArrayOfCustomPropertyEditor } from '@/composables/useTypeArrayOfCustomPropertyEditor'
import type { TypeProperty } from '@/types/types'
import TypeTypePicker from './TypeTypePicker.vue'
import TypeItemTypePicker from './TypeItemTypePicker.vue'
import InLineEditor from './InLineEditor.vue'

interface Props {
  property: TypeProperty
  isRoot?: boolean
  propertyName?: string
}

const props = withDefaults(defineProps<Props>(), {
  isRoot: false,
  propertyName: ''
})

const emit = defineEmits(['change', 'delete', 'rename'])

// Use composable for logic
const { } = useTypeArrayOfCustomPropertyEditor(
  computed(() => props.property),
  emit
)

const itemsType = computed({
  get() {
    return props.property.items?.type || 'email'
  },
  set(type: string) {
    if (!props.property.items) {
      props.property.items = {
        description: 'Custom item',
        type,
        required: false
      }
    } else {
      props.property.items.type = type
    }
    handleChange()
  }
})

const handleChange = () => {
  // Just emit the change - let the API handle default values and return the complete structure
  emit('change', props.property)
}

const handleDelete = () => {
  emit('delete')
}

const handlePropertyNameChange = (newName: string) => {
  emit('rename', props.propertyName, newName)
}
</script>

<style scoped>
.type-array-of-custom-property-editor {
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