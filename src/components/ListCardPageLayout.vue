<template>
      <v-container>
    <div v-if="$slots['header-actions']" class="d-flex justify-end align-center mb-4">
      <div class="d-flex align-center gap-2">
        <slot name="header-actions" />
      </div>
    </div>

    <!-- Loading state -->
    <div
      v-if="loading"
      class="d-flex justify-center align-center pa-8"
      :data-test="`${pageKey}-loading`"
    >
      <v-progress-circular indeterminate size="64" data-test="loading-spinner" />
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="pa-4" :data-test="`${pageKey}-error`">
      <v-alert type="error" data-test="error-alert">
        {{ error }}
        <v-btn class="mt-2" data-test="retry-btn" @click="$emit('retry')">
          Retry
        </v-btn>
      </v-alert>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!hasItems"
      class="text-center pa-8"
      :data-test="`${pageKey}-empty`"
    >
      <v-icon size="64" color="grey" data-test="empty-icon">{{ emptyIcon }}</v-icon>
      <h3 class="text-h5 mt-4" data-test="empty-title">{{ emptyTitle }}</h3>
      <p class="text-body-1 text-medium-emphasis" data-test="empty-message">
        {{ emptyMessage }}
      </p>
      <slot name="empty-action" />
    </div>

    <!-- Card grid -->
    <v-row v-else :data-test="`${pageKey}-grid`" :class="gridClass || undefined">
      <slot />
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    title: string
    loading: boolean
    error: string | null
    items: unknown[]
    emptyIcon: string
    emptyTitle: string
    emptyMessage: string
    pageKey: string
    gridClass?: string
  }>(),
  { gridClass: undefined }
)

defineEmits<{
  retry: []
}>()

const hasItems = computed(() => props.items.length > 0)
</script>

<style scoped>
</style>
