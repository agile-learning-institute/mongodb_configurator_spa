<template>
  <!-- Custom types show no additional content - just the main property row -->
</template>

<script setup lang="ts">
import { type CustomProperty } from '@/types/types'

const props = defineProps<{
  property: CustomProperty
}>()
</script>

 