<template>
  <v-card 
    class="base-card mb-3" 
    :class="{ 
      'secondary': isSecondary,
      'compact': compact,
      'elevated': elevated,
      'outlined': outlined
    }"
    :elevation="elevated ? 4 : undefined"
    :variant="outlined ? 'outlined' : undefined"
    :data-test="`base-card-${title || 'default'}`"
  >
    <!-- Header section with customizable content -->
    <div 
      v-if="showHeader"
      class="header-section pa-2 d-flex justify-space-between align-center"
      :class="{ 'compact-header': compact }"
      data-test="card-header"
    >
      <div class="d-flex align-center flex-grow-1 min-width-0 mr-2 title-area">
        <v-icon 
          v-if="icon" 
          class="mr-3 flex-shrink-0" 
          :size="iconSize" 
          :color="iconColor"
          data-test="card-icon"
        >
          {{ icon }}
        </v-icon>
        <!-- Custom title template or default title -->
        <slot name="title" :title="title">
          <div :class="titleClass" data-test="card-title">{{ title }}</div>
        </slot>
      </div>
      
      <!-- Action buttons on header background -->
      <div class="d-flex align-center flex-shrink-0" data-test="card-header-actions">
        <slot name="header-actions" />
      </div>
    </div>

    <!-- Content section -->
    <div v-if="$slots.default" class="content-section pa-4" :class="{ 'compact-content': compact }" data-test="card-content">
      <slot />
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title?: string
  icon?: string
  isSecondary?: boolean
  compact?: boolean
  elevated?: boolean
  outlined?: boolean
  showHeader?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  icon: '',
  isSecondary: false,
  compact: false,
  elevated: false,
  outlined: false,
  showHeader: true
})

// Computed properties for dynamic styling
const iconSize = computed(() => {
  if (props.compact) return 16
  return props.isSecondary ? 20 : 24
})

const iconColor = computed(() => {
  if (props.isSecondary) return 'dark'
  return 'white'
})

const titleClass = computed(() => {
  const baseClass = props.compact ? 'text-body-2' : props.isSecondary ? 'text-subtitle-1' : 'text-h6'
  const colorClass = props.isSecondary ? 'text-dark' : 'text-white'
  return `${baseClass} ${colorClass}`
})
</script>

<style scoped>
.base-card {
  border-radius: 12px !important;
  overflow: hidden;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
}

.base-card.secondary {
  border-radius: 8px !important;
  border: 1px solid rgba(0, 0, 0, 0.87);
}

.base-card.compact {
  border-radius: 6px !important;
}

.base-card.cursor-pointer {
  cursor: pointer;
}

.base-card.cursor-pointer:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
}

/* Primary card header: solid color, white text/icons */
.header-section {
  background: rgb(var(--v-theme-primary));
  border-radius: 12px 12px 0 0;
  color: white;
}

.base-card:not(.secondary) .header-section :deep(.v-btn),
.base-card:not(.secondary) .header-section :deep(.v-icon),
.base-card:not(.secondary) .header-section :deep(.v-chip),
.base-card:not(.secondary) .header-section :deep(.material-symbols-outlined) {
  color: white !important;
}

.base-card:not(.secondary) .header-section :deep(.v-chip.v-chip--variant-outlined) {
  border-color: rgba(255, 255, 255, 0.7) !important;
}

/* Picker pills: light blue background, black text (matches nav drawer) */
.base-card:not(.secondary) .header-section :deep(.type-chip-picker .v-chip),
.base-card:not(.secondary) .header-section :deep(.enum-picker .v-chip),
.base-card:not(.secondary) .header-section :deep(.ref-picker .v-chip) {
  color: black !important;
  background: rgb(var(--v-theme-surface)) !important;
}

.base-card:not(.secondary) .header-section :deep(.type-chip-picker .v-chip .v-icon),
.base-card:not(.secondary) .header-section :deep(.enum-picker .v-chip .v-icon),
.base-card:not(.secondary) .header-section :deep(.ref-picker .v-chip .v-icon) {
  color: black !important;
}

.base-card:not(.secondary) .header-section :deep(.v-field__input),
.base-card:not(.secondary) .header-section :deep(input) {
  color: white !important;
  caret-color: white;
}

.base-card:not(.secondary) .header-section :deep(.v-field__input::placeholder) {
  color: rgba(255, 255, 255, 0.7) !important;
}

.base-card:not(.secondary) .header-section :deep(.v-field--variant-plain .v-field__outline) {
  --v-field-border-opacity: 0.3;
}

.base-card.secondary .header-section {
  background: rgb(var(--v-theme-surface-variant));
  border-radius: 8px 8px 0 0;
  color: rgba(0, 0, 0, 0.87);
}

.base-card.secondary .header-section :deep(.v-icon) {
  color: rgba(0, 0, 0, 0.87) !important;
}

.base-card.secondary .header-section .title-area,
.base-card.secondary .header-section .title-area * {
  color: rgba(0, 0, 0, 0.87) !important;
  font-weight: 600;
}

/* Add button in secondary cards: solid primary, white text */
.base-card.secondary .header-section :deep(.v-btn.v-btn--variant-outlined) {
  background: rgb(var(--v-theme-primary)) !important;
  color: white !important;
  border-color: rgb(var(--v-theme-primary)) !important;
}

.base-card.secondary .header-section :deep(.v-btn.v-btn--variant-outlined .v-icon) {
  color: white !important;
}

.base-card.compact .header-section {
  background: rgb(var(--v-theme-primary));
  border-radius: 6px 6px 0 0;
  padding: 8px 12px !important;
}

.base-card.compact.secondary .header-section {
  background: rgb(var(--v-theme-surface-variant));
  border-radius: 6px 6px 0 0;
  color: rgba(0, 0, 0, 0.87);
}

.content-section {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.04) 0%, rgba(var(--v-theme-surface), 1) 100%);
}

.base-card.secondary .content-section {
  background: linear-gradient(135deg, #FFFFFF 0%, rgba(var(--v-theme-primary), 0.02) 100%);
}

.base-card.compact .content-section {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.04) 0%, rgba(var(--v-theme-surface), 1) 100%);
  padding: 12px 16px !important;
}

.base-card.compact.secondary .content-section {
  background: linear-gradient(135deg, #FFFFFF 0%, rgba(var(--v-theme-primary), 0.02) 100%);
}
</style> 