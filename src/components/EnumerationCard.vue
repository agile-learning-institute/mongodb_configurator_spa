<template>
  <v-card
    class="enumeration-card"
    variant="elevated"
    :data-test="`enumeration-card-${enumeration.name}`"
    @click="$emit('open', enumeration.name)"
  >
    <v-card-text class="pa-4 d-flex flex-column card-content">
      <v-card-title class="text-h6 pa-0 mb-2 flex-shrink-0" :data-test="`enumeration-card-name-${enumeration.name}`">
        {{ enumeration.name }}
      </v-card-title>
      <div class="flex-grow-1" />
      <div class="d-flex align-center mt-2 flex-shrink-0">
        <v-chip
          size="small"
          color="primary"
          variant="tonal"
          density="compact"
          class="enumeration-value-chip"
          :data-test="`enumeration-card-values-${enumeration.name}`"
        >
          {{ enumeration.values.length }} values
        </v-chip>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { Enumerator } from '@/types/types'

defineProps<{
  enumeration: Enumerator
}>()

defineEmits<{
  'open': [enumerationName: string]
}>()
</script>

<style scoped>
.enumeration-card {
  min-height: 120px;
  height: 100%;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
  transition: box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
}

.enumeration-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.enumeration-value-chip {
  font-size: 0.75rem;
}
</style>
