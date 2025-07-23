<template>
  <TypeTypePicker
    v-bind="passThroughProps"
    :exclude-type-list="['enum', 'enum_array', 'simple_primitive', 'complex_primitive']"
    @update:modelValue="$emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
import TypeTypePicker from './TypeTypePicker.vue'
import { useAttrs } from 'vue'

const passThroughProps = useAttrs()
</script> 