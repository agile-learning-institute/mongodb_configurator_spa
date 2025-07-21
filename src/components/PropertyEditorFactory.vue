<template>
  <component
    v-if="property && property.type"
    :is="selectedComponent"
    :property="property"
    :is-root="isRoot"
    @change="handlePropertyChange"
    @delete="handlePropertyDelete"
  />
  <div v-else>
    <v-progress-circular indeterminate size="24" color="primary" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ObjectPropertyEditor from './ObjectPropertyEditor.vue'
import ArrayPropertyEditor from './EnumArrayPropertyEditor.vue'
import EnumPropertyEditor from './EnumPropertyEditor.vue'
import CustomPropertyEditor from './CustomPropertyEditor.vue'
import ArrayOfCustomPropertyEditor from './ArrayOfCustomPropertyEditor.vue'
import { type Property } from '@/composables/usePropertyEditor'

const props = defineProps<{
  property: Property,
  isRoot?: boolean
}>()

const property = props.property
const isRoot = props.isRoot ?? false

const emit = defineEmits<{
  change: [property: Property]
  delete: []
}>()

const selectedComponent = computed(() => {
  const type = property.type
  if (type === 'object') return ObjectPropertyEditor
  if (type === 'array') {
    // If items.type is 'object', use ArrayOfObjectPropertyEditor (to be implemented in Goal 6)
    // If items.type is 'array', use ArrayOfArrayPropertyEditor (to be implemented in Goal 5)
    // If items.type is 'enum' or 'enum_array', use EnumArrayPropertyEditor
    // Otherwise, use ArrayOfCustomPropertyEditor
    const itemsType = property.items?.type
    if (itemsType === 'object') return ObjectPropertyEditor // placeholder for ArrayOfObjectPropertyEditor
    if (itemsType === 'array') return ObjectPropertyEditor // placeholder for ArrayOfArrayPropertyEditor
    if (itemsType === 'enum' || itemsType === 'enum_array') return ArrayPropertyEditor
    return ArrayOfCustomPropertyEditor
  }
  if (type === 'enum' || type === 'enum_array') return EnumPropertyEditor
  return CustomPropertyEditor
})

function handlePropertyChange(updatedProperty: Property) {
  emit('change', updatedProperty)
}

function handlePropertyDelete() {
  emit('delete')
}
</script> 