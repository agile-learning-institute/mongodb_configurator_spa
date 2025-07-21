<template>
  <TypePicker
    v-bind="passThroughProps"
    :exclude-type-list="['enum', 'enum_array']"
    @update:modelValue="$emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
import TypePicker from './TypePicker.vue'
import { useAttrs } from 'vue'

const passThroughProps = useAttrs()
</script> 