<template>
  <v-card 
    class="base-card mb-3" 
    :class="{ 
      'cursor-pointer': clickable,
      'secondary': isSecondary 
    }"
    @click="handleClick"
  >
    <!-- Header section with customizable content -->
    <div class="header-section pa-2 d-flex justify-space-between align-center">
      <div class="d-flex align-center">
        <v-icon v-if="icon" class="mr-3" :size="iconSize" :color="iconColor">{{ icon }}</v-icon>
        <!-- Custom title template or default title -->
        <slot name="title" :title="title">
          <div :class="titleClass">{{ title }}</div>
        </slot>
      </div>
      
      <!-- Action buttons on header background -->
      <div class="d-flex align-center">
        <slot name="header-actions" />
      </div>
    </div>

    <!-- Content section -->
    <div v-if="$slots.default" class="content-section pa-4">
      <slot />
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title?: string
  icon?: string
  clickable?: boolean
  isSecondary?: boolean
  disableClick?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  icon: '',
  clickable: false,
  isSecondary: false,
  disableClick: false
})

const emit = defineEmits<{
  click: []
}>()

const handleClick = (event: Event) => {
  console.log('🃏 BaseCard handleClick called')
  console.log('  - clickable:', props.clickable)
  console.log('  - disableClick:', props.disableClick)
  console.log('  - event.target:', event.target)
  console.log('  - event.currentTarget:', event.currentTarget)
  
  // Don't handle clicks if disabled
  if (props.disableClick) {
    console.log('  ❌ Disabled, returning early')
    return
  }
  
  // Only handle clicks if the card is clickable and the click was on the card itself
  // Check if the target is the card element or a direct child that should trigger card clicks
  if (props.clickable) {
    const target = event.target as HTMLElement
    const cardElement = event.currentTarget as HTMLElement
    
    console.log('  - target.classList:', target.classList.toString())
    console.log('  - target === cardElement:', target === cardElement)
    console.log('  - target.classList.contains("base-card"):', target.classList.contains('base-card'))
    console.log('  - target.classList.contains("clickable-text"):', target.classList.contains('clickable-text'))
    
    // Only emit if click is on the card background or specific card elements
    // Don't emit for clicks on interactive elements like text fields, buttons, etc.
    if (target === cardElement || 
        target.classList.contains('base-card') ||
        (target.parentElement === cardElement && !target.classList.contains('clickable-text'))) {
      console.log('  ✅ Emitting card click')
      emit('click')
    } else {
      console.log('  ℹ️ Not emitting - click on interactive element')
    }
  } else {
    console.log('  ℹ️ Not clickable, not emitting')
  }
}

// Computed properties for dynamic styling
const iconSize = computed(() => props.isSecondary ? 16 : 24)
const iconColor = computed(() => props.isSecondary ? 'dark' : 'white')
const titleClass = computed(() => {
  const baseClass = props.isSecondary ? 'text-body-2' : 'text-h6'
  const colorClass = props.isSecondary ? 'text-dark' : 'text-white'
  return `${baseClass} ${colorClass}`
})
</script>

<style scoped>
.base-card {
  border-radius: 12px !important;
  overflow: hidden;
}

.base-card.secondary {
  border-radius: 8px !important;
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

.content-section {
  background: linear-gradient(135deg, #F1F8E9 0%, #E8F5E8 100%);
}

.base-card.secondary .content-section {
  background: linear-gradient(135deg, #FFFFFF 0%, #F9FBE7 100%);
}
</style> 