<template>
  <component
    v-if="property && property.type"
    :is="selectedComponent"
    :property="property"
    :property-name="propertyName"
    :is-root="isRoot"
    @change="handlePropertyChange"
    @delete="handlePropertyDelete"
    @rename="handlePropertyRename"
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
import ArrayOfArrayPropertyEditor from './ArrayOfArrayPropertyEditor.vue'
import ArrayOfObjectPropertyEditor from './ArrayOfObjectPropertyEditor.vue'
import { type Property } from '@/composables/usePropertyEditor'

const props = defineProps<{
  property: Property,
  propertyName?: string,
  isRoot?: boolean
}>()

const property = props.property
const propertyName = props.propertyName || ''
const isRoot = props.isRoot ?? false

const emit = defineEmits<{
  change: [property: Property]
  delete: []
  rename: [oldName: string, newName: string]
}>()

const selectedComponent = computed(() => {
  const type = property.type
  if (type === 'object') return ObjectPropertyEditor
  if (type === 'array') {
    const itemsType = property.items?.type
    if (itemsType === 'object') return ArrayOfObjectPropertyEditor
    if (itemsType === 'array') return ArrayOfArrayPropertyEditor
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

function handlePropertyRename(oldName: string, newName: string) {
  emit('rename', oldName, newName)
}
</script> 