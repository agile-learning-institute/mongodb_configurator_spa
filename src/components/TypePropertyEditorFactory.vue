<template>
  <div>
    <!-- Object property -->
    <TypeObjectPropertyEditor
      v-if="selectedEditor === 'object'"
      :property="property"
      :is-root="isRoot"
      :exclude-type="excludeType"
      @change="emitChange"
    />
    <!-- Array of Object property -->
    <TypeArrayOfObjectPropertyEditor
      v-else-if="selectedEditor === 'array-of-object'"
      :property="property"
      :is-root="isRoot"
      :property-name="propertyName"
      @change="emitChange"
    />
    <!-- Array of Array property -->
    <TypeArrayOfArrayPropertyEditor
      v-else-if="selectedEditor === 'array-of-array'"
      :property="property"
      :is-root="isRoot"
      :property-name="propertyName"
      @change="emitChange"
    />
    <!-- Array of Custom property -->
    <TypeArrayOfCustomPropertyEditor
      v-else-if="selectedEditor === 'array-of-custom'"
      :property="property"
      :is-root="isRoot"
      :property-name="propertyName"
      @change="emitChange"
    />
    <!-- Simple Primitive property -->
    <TypePrimitivePropertyEditor
      v-else-if="selectedEditor === 'simple-primitive'"
      :property="property"
      :is-root="isRoot"
      :property-name="propertyName"
      @change="emitChange"
    />
    <!-- Complex Primitive property -->
    <TypeComplexPrimitivePropertyEditor
      v-else-if="selectedEditor === 'complex-primitive'"
      :property="property"
      :is-root="isRoot"
      :property-name="propertyName"
      @change="emitChange"
    />
    <!-- Custom property -->
    <TypeCustomPropertyEditor
      v-else-if="selectedEditor === 'custom'"
      :property="property"
      :is-root="isRoot"
      :property-name="propertyName"
      @change="emitChange"
    />
    <!-- Fallback -->
    <div v-else class="text-error">
      Unknown property type: {{ property.type }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits } from 'vue'
import TypeObjectPropertyEditor from './TypeObjectPropertyEditor.vue'
import TypeArrayOfObjectPropertyEditor from './TypeArrayOfObjectPropertyEditor.vue'
import TypeArrayOfArrayPropertyEditor from './TypeArrayOfArrayPropertyEditor.vue'
import TypeArrayOfCustomPropertyEditor from './TypeArrayOfCustomPropertyEditor.vue'
import TypePrimitivePropertyEditor from './TypePrimitivePropertyEditor.vue'
import TypeComplexPrimitivePropertyEditor from './TypeComplexPrimitivePropertyEditor.vue'
import TypeCustomPropertyEditor from './TypeCustomPropertyEditor.vue'
import type { TypeProperty } from '@/types/types'

const props = defineProps<{
  property: TypeProperty
  isRoot?: boolean
  propertyName?: string
  excludeType?: string
}>()
const emit = defineEmits(['change'])

// Updated type detection logic to match new API schema
const isObjectProperty = computed(() => {
  return props.property.type === 'object'
})

const isArrayOfObject = computed(() => {
  return props.property.type === 'array' && props.property.items?.type === 'object'
})

const isArrayOfArray = computed(() => {
  return props.property.type === 'array' && props.property.items?.type === 'array'
})

const isArrayOfCustom = computed(() => {
  return props.property.type === 'array' && props.property.items && 
         !['object', 'array', 'simple_primitive', 'complex_primitive'].includes(props.property.items.type)
})

const isSimplePrimitive = computed(() => {
  return props.property.type === 'simple_primitive'
})

const isComplexPrimitive = computed(() => {
  return props.property.type === 'complex_primitive'
})

const isCustomProperty = computed(() => {
  return !['object', 'array', 'simple_primitive', 'complex_primitive'].includes(props.property.type)
})

// Add a computed to determine which editor to show
const selectedEditor = computed(() => {
  if (isObjectProperty.value) return 'object'
  if (isArrayOfObject.value) return 'array-of-object'
  if (isArrayOfArray.value) return 'array-of-array'
  if (isArrayOfCustom.value) return 'array-of-custom'
  if (isSimplePrimitive.value) return 'simple-primitive'
  if (isComplexPrimitive.value) return 'complex-primitive'
  if (isCustomProperty.value) return 'custom'
  return 'unknown'
})

function emitChange(updated: TypeProperty) {
  emit('change', updated)
}
</script> 