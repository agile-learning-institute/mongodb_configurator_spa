<template>
  <component
    v-if="props.property && props.property.type"
    :is="selectedComponent"
    :property="props.property"
    :property-name="props.propertyName"
    :disabled="props.disabled"
    :exclude-type="props.excludeType"
    :top-level="props.topLevel"
    :top-level-name="props.topLevelName"
    :hide-top-level-row="props.hideTopLevelRow"
    :type-picker-component="props.typePickerComponent"
    @change="handlePropertyChange"
    @delete="handlePropertyDelete"
  />
  <div v-else>
    <v-progress-circular indeterminate size="24" color="primary" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { type Property } from '@/composables/usePropertyEditor'
import ObjectPropertyEditor from './ObjectPropertyEditor.vue'
import EnumPropertyEditor from './EnumPropertyEditor.vue'
import EnumArrayPropertyEditor from './EnumArrayPropertyEditor.vue'
import PropertyEditor from './PropertyEditor.vue' // Fallback for other types

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

// Computed property to make the component reactive to property type changes
const selectedComponent = computed(() => {
  const type = props.property.type
  console.log('PropertyEditorFactory: property type =', type)
  
  switch (type) {
    case 'object':
      console.log('PropertyEditorFactory: returning ObjectPropertyEditor')
      return ObjectPropertyEditor
    case 'enum':
      console.log('PropertyEditorFactory: returning EnumPropertyEditor')
      return EnumPropertyEditor
    case 'enum_array':
      console.log('PropertyEditorFactory: returning EnumArrayPropertyEditor')
      return EnumArrayPropertyEditor
    default:
      console.log('PropertyEditorFactory: falling back to PropertyEditor')
      // Fallback to the original PropertyEditor for other types
      return PropertyEditor
  }
})

// Event handlers
const handlePropertyChange = (updatedProperty: Property) => {
  emit('change', updatedProperty)
}

const handlePropertyDelete = () => {
  emit('delete')
}
</script> 