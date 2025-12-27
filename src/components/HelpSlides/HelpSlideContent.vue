<template>
  <div class="overview-content" style="width: 100%; min-width: 0;">
    <p v-if="description" :class="descriptionClass" v-html="description"></p>
    <div v-if="detailedContent" class="detailed-content" v-html="detailedContent"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, nextTick } from 'vue'

const props = defineProps<{
  description?: string
  detailedContent?: string
  isWelcome?: boolean
}>()

const descriptionClass = computed(() => {
  return props.isWelcome ? 'welcome-description' : 'slide-description'
})

// Handle clickable links in v-html content
const handleClickableLink = (event: Event) => {
  const target = event.target as HTMLElement
  const clickable = target.closest('.text-link.clickable')
  if (clickable) {
    event.preventDefault()
    const slideIndex = clickable.getAttribute('data-slide-index')
    if (slideIndex) {
      // Emit event to parent to navigate to slide
      const slideIndexNum = parseInt(slideIndex)
      if (!isNaN(slideIndexNum)) {
        // This will be handled by the parent component
        window.dispatchEvent(new CustomEvent('navigate-to-slide', { detail: slideIndexNum }))
      }
    }
  }
}

onMounted(() => {
  nextTick(() => {
    const content = document.querySelector('.detailed-content')
    if (content) {
      content.addEventListener('click', handleClickableLink)
    }
  })
})
</script>

<style scoped>
.welcome-description {
  font-size: 1rem;
  font-weight: 400;
  color: #455a64;
  line-height: 1.7;
  margin-bottom: 2rem;
  max-width: 800px;
}

.slide-description {
  font-size: 1rem;
  font-weight: 400;
  color: #455a64;
  line-height: 1.7;
  margin-bottom: 2rem;
  max-width: 800px;
}

.detailed-content {
  line-height: 1.7;
  color: #34495e;
}

.detailed-content :deep(h2) {
  font-size: 1.75rem !important;
  font-weight: 700 !important;
  color: #1976d2 !important;
  margin: 2rem 0 1rem 0 !important;
  line-height: 1.3 !important;
  text-shadow: 0 2px 4px rgba(25, 118, 210, 0.1) !important;
  position: relative;
}

.detailed-content :deep(h2::after) {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #1976d2 0%, #42a5f5 100%);
  border-radius: 2px;
}

.detailed-content :deep(h3) {
  font-size: 1.375rem;
  font-weight: 600;
  color: #37474f;
  margin: 1.5rem 0 0.75rem 0;
  line-height: 1.3;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.detailed-content :deep(p) {
  margin-bottom: 1rem !important;
  font-size: 1rem !important;
  line-height: 1.7 !important;
  color: #455a64 !important;
}

.detailed-content :deep(ul), .detailed-content :deep(ol) {
  margin-bottom: 1rem !important;
  padding-left: 1.75rem !important;
  font-size: 1rem !important;
  list-style: none !important;
}

.detailed-content :deep(li) {
  margin-bottom: 0.75rem !important;
  font-size: 1rem !important;
  line-height: 1.6 !important;
  color: #455a64 !important;
  position: relative;
  list-style: none !important;
}

.detailed-content :deep(ul li::before) {
  content: '•';
  color: #1976d2;
  font-weight: bold;
  position: absolute;
  left: -1.25rem;
}

.detailed-content :deep(strong) {
  font-weight: 600 !important;
  color: #2c3e50 !important;
}
</style>

