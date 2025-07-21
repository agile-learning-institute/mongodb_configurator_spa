<template>
  <div class="enum-property-editor">
    <!-- Title pane = property editor only -->
    <div class="property-title-row d-flex align-center pa-4 border-b">
      <v-icon icon="mdi-format-list-bulleted" class="mr-3" color="primary" />
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
      <EnumPicker
        :model-value="property.enums?.[0] || ''"
        label="Select Enum"
        density="compact"
        :disabled="props.disabled"
        @update:model-value="handleEnumChange"
        class="mr-2"
        style="max-width: 180px;"
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
import EnumPicker from './EnumPicker.vue'
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
  canBeRequired,
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

onMounted(() => {
  console.log('EnumPropertyEditor mounted:', props.propertyName, props.property.type)
})

// Enum-specific methods
const handleEnumChange = (value: string) => {
  if (!props.property.enums) {
    props.property.enums = []
  }
  props.property.enums[0] = value
  handleChange()
}
</script>

<style scoped>
.enum-property-editor {
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