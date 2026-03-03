<template>
  <v-card
    class="collection-card"
    variant="elevated"
    :data-test="`collection-card-${collection.collection_name}`"
    @click="$emit('open-dictionary', collection.latest_dictionary_file)"
  >
    <v-card-text class="pa-4 d-flex flex-column card-content">
      <!-- Title only on top -->
      <v-card-title class="text-h6 pa-0 mb-2 flex-shrink-0" :data-test="`collection-card-name-${collection.collection_name}`">
        {{ collection.collection_name }}
      </v-card-title>
      <!-- Description: text-wrap, fills space, pushes icons to bottom -->
      <div
        v-if="collection.description"
        class="collection-description text-body-2 text-medium-emphasis flex-grow-1 overflow-y-auto"
        :data-test="`collection-card-description-${collection.collection_name}`"
      >
        {{ collection.description }}
      </div>
      <div v-else class="flex-grow-1" />
      <!-- Bottom row: version pill left, gear icon right - anchored to bottom -->
      <div class="d-flex align-center justify-space-between mt-2 flex-shrink-0">
        <v-chip
          size="small"
          color="primary"
          variant="tonal"
          density="compact"
          class="collection-version-chip"
          :data-test="`collection-card-version-${collection.collection_name}`"
        >
          {{ collection._locked ? 'locked' : `v${collection.latest_version}` }}
        </v-chip>
        <v-icon
          size="small"
          class="collection-config-icon"
          :data-test="`collection-card-open-configuration-${collection.collection_name}`"
          @click.stop="$emit('open-configuration', collection.configuration_file)"
        >
          mdi-cog
        </v-icon>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { CollectionSummary } from '@/composables/useCollections'

defineProps<{
  collection: CollectionSummary
}>()

defineEmits<{
  'open-dictionary': [fileName: string]
  'open-configuration': [fileName: string]
}>()
</script>

<style scoped>
.collection-card {
  min-height: 140px;
  height: 100%;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
  transition: box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
}

.collection-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.collection-description {
  font-size: 0.8125rem;
  line-height: 1.4;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.collection-version-chip {
  font-size: 0.75rem;
}

.collection-config-icon {
  opacity: 0.7;
}

.collection-config-icon:hover {
  opacity: 1;
}
</style>
