<template>
  <v-card
    class="type-card"
    variant="elevated"
    :data-test="`type-card-${typeFile.name}`"
    @click="$emit('open', typeFile.name)"
  >
    <v-card-text class="pa-4 d-flex flex-column card-content">
      <!-- Type name only on top -->
      <v-card-title class="text-h6 pa-0 mb-2 flex-shrink-0" :data-test="`type-card-name-${typeFile.name}`">
        {{ typeName }}
      </v-card-title>
      <!-- Description from root:description - text-wrap, fills space, pushes icons to bottom -->
      <div
        v-if="typeFile.description"
        class="type-description text-body-2 text-medium-emphasis flex-grow-1 overflow-y-auto"
        :data-test="`type-card-description-${typeFile.name}`"
      >
        {{ typeFile.description }}
      </div>
      <div v-else class="flex-grow-1" />
      <!-- Bottom row: locked chip left (or empty), spacer for alignment with CollectionCard -->
      <div class="d-flex align-center justify-space-between mt-2 flex-shrink-0">
        <v-chip
          v-if="typeFile._locked"
          size="small"
          color="warning"
          variant="tonal"
          density="compact"
          class="type-status-chip"
          :data-test="`type-card-locked-${typeFile.name}`"
        >
          Locked
        </v-chip>
        <span v-else />
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { FileInfo } from '@/composables/useFiles'
import { computed } from 'vue'

const props = defineProps<{
  typeFile: FileInfo
}>()

defineEmits<{
  'open': [fileName: string]
}>()

const typeName = computed(() => props.typeFile.name.replace(/\.yaml$/, ''))
</script>

<style scoped>
.type-card {
  min-height: 140px;
  height: 100%;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
}

.type-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.type-description {
  font-size: 0.8125rem;
  line-height: 1.4;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.type-status-chip {
  font-size: 0.75rem;
}
</style>
