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
      <div class="d-flex align-center">
        <v-icon 
          v-if="icon" 
          class="mr-3" 
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
      <div class="d-flex align-center" data-test="card-header-actions">
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
  const baseClass = props.compact ? 'text-body-2' : props.isSecondary ? 'text-body-1' : 'text-h6'
  const colorClass = props.isSecondary ? 'text-dark' : 'text-white'
  return `${baseClass} ${colorClass}`
})
</script>

<style scoped>
.base-card {
  border-radius: 12px !important;
  overflow: hidden;
  transition: all 0.2s ease-in-out;
}

.base-card.secondary {
  border-radius: 8px !important;
}

.base-card.compact {
  border-radius: 6px !important;
}

.base-card.cursor-pointer {
  cursor: pointer;
}

.base-card.cursor-pointer:hover {
  background-color: rgba(46, 125, 50, 0.04);
}

.header-section {
  background: linear-gradient(135deg, #2E7D32 0%, #388E3C 100%);
  border-radius: 12px 12px 0 0;
}

.base-card.secondary .header-section {
  background: linear-gradient(135deg, #E8F5E8 0%, #F1F8E9 100%);
  border-radius: 8px 8px 0 0;
}

.base-card.compact .header-section {
  background: linear-gradient(135deg, #2E7D32 0%, #388E3C 100%);
  border-radius: 6px 6px 0 0;
  padding: 8px 12px !important;
}

.base-card.compact.secondary .header-section {
  background: linear-gradient(135deg, #E8F5E8 0%, #F1F8E9 100%);
  border-radius: 6px 6px 0 0;
}

.content-section {
  background: linear-gradient(135deg, #F1F8E9 0%, #E8F5E8 100%);
}

.base-card.secondary .content-section {
  background: linear-gradient(135deg, #FFFFFF 0%, #F9FBE7 100%);
}

.base-card.compact .content-section {
  background: linear-gradient(135deg, #F1F8E9 0%, #E8F5E8 100%);
  padding: 12px 16px !important;
}

.base-card.compact.secondary .content-section {
  background: linear-gradient(135deg, #FFFFFF 0%, #F9FBE7 100%);
}
</style> 