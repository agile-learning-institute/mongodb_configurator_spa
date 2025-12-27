<template>
  <div class="overview-content">
    <p v-if="description" :class="descriptionClass" v-html="description"></p>
    <div v-if="detailedContent" class="detailed-content" v-html="detailedContent"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  description?: string
  detailedContent?: string
  isWelcome?: boolean
}>()

const router = useRouter()

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
  font-size: 1.375rem;
  font-weight: 500;
  color: #2c3e50;
  line-height: 1.7;
  margin-bottom: 2.5rem;
  max-width: 800px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.detailed-content {
  line-height: 1.7;
  color: #34495e;
}

.detailed-content h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1976d2;
  margin: 2rem 0 1rem 0;
  line-height: 1.3;
  text-shadow: 0 2px 4px rgba(25, 118, 210, 0.1);
  position: relative;
}

.detailed-content h2::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #1976d2 0%, #42a5f5 100%);
  border-radius: 2px;
}

.detailed-content h3 {
  font-size: 1.375rem;
  font-weight: 600;
  color: #37474f;
  margin: 1.5rem 0 0.75rem 0;
  line-height: 1.3;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.detailed-content p {
  margin-bottom: 1rem;
  font-size: 1.0625rem;
  line-height: 1.7;
  color: #455a64;
}

.detailed-content ul, .detailed-content ol {
  margin-bottom: 1rem;
  padding-left: 1.75rem;
  font-size: 1.0625rem;
}

.detailed-content li {
  margin-bottom: 0.5rem;
  font-size: 1.0625rem;
  line-height: 1.6;
  color: #455a64;
  position: relative;
}

.detailed-content ul li::before {
  content: '•';
  color: #1976d2;
  font-weight: bold;
  position: absolute;
  left: -1.25rem;
}

.detailed-content strong {
  font-weight: 700;
  color: #2c3e50;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>

