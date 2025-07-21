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
  switch (type) {
    case 'object':
      return ObjectPropertyEditor
    case 'array':
      return ArrayPropertyEditor
    case 'enum':
    case 'enum_array':
      return EnumPropertyEditor
    default:
      return CustomPropertyEditor
  }
})

function handlePropertyChange(updatedProperty: Property) {
  emit('change', updatedProperty)
}

function handlePropertyDelete() {
  emit('delete')
}
</script> 