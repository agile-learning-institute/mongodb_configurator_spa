<template>
  <component 
    :is="getPropertyEditorComponent(property.type)"
    v-bind="editorProps"
    @change="handlePropertyChange"
    @delete="handlePropertyDelete"
  />
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

// Computed props to pass to the selected editor
const editorProps = computed(() => ({
  property: props.property,
  propertyName: props.propertyName,
  disabled: props.disabled,
  excludeType: props.excludeType,
  topLevel: props.topLevel,
  topLevelName: props.topLevelName,
  hideTopLevelRow: props.hideTopLevelRow,
  typePickerComponent: props.typePickerComponent
}))

// Factory function to get the appropriate editor component
const getPropertyEditorComponent = (type?: string) => {
  switch (type) {
    case 'object':
      return ObjectPropertyEditor
    case 'enum':
      return EnumPropertyEditor
    case 'enum_array':
      return EnumArrayPropertyEditor
    default:
      // Fallback to the original PropertyEditor for other types
      return PropertyEditor
  }
}

// Event handlers
const handlePropertyChange = (updatedProperty: Property) => {
  emit('change', updatedProperty)
}

const handlePropertyDelete = () => {
  emit('delete')
}
</script> 