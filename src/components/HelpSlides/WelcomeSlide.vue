<template>
  <div class="overview-content" style="width: 100%; min-width: 0;">
    <p class="welcome-description" v-html="description"></p>
    <div class="detailed-content" v-html="detailedContent"></div>
    <div class="quick-start-section">
      <p>For a quick start you can create a <v-btn variant="outlined" size="small" color="primary" @click="createNewCollection">New Collection</v-btn> and review help screens from there.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'

defineProps<{
  description: string
  detailedContent: string
}>()

const emit = defineEmits<{
  createNewCollection: []
}>()

const router = useRouter()

const createNewCollection = () => {
  emit('createNewCollection')
}

// Handle feature link clicks using event delegation
const handleFeatureLinkClick = (event: Event) => {
  const target = event.target as HTMLElement
  const link = target.closest('.feature-link') as HTMLAnchorElement
  if (link) {
    event.preventDefault()
    const href = link.getAttribute('href')
    if (href) {
      router.push(href)
    }
  }
}

onMounted(() => {
  nextTick(() => {
    const slideContent = document.querySelector('.slide-content')
    if (slideContent) {
      slideContent.addEventListener('click', handleFeatureLinkClick)
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

.detailed-content {
  line-height: 1.7;
  color: #34495e;
}

.detailed-content :deep(.key-features-list li) {
  margin-bottom: 0.75rem;
  line-height: 1.6;
  color: #455a64;
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  font-size: 1rem !important;
  padding: 0;
  margin-top: 0;
}

.detailed-content :deep(.key-feature-link) {
  font-size: 1rem !important;
  font-weight: 600;
  display: inline;
  margin-right: 0.5rem;
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

.detailed-content ul {
  list-style: none;
  padding-left: 0;
  margin: 0 0 1.5rem 0;
}

.detailed-content li {
  margin-bottom: 1rem;
  line-height: 1.6;
  color: #455a64;
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}


.quick-start-section {
  margin-top: 2.5rem;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.08) 0%, rgba(66, 165, 245, 0.05) 100%);
  border-radius: 12px;
  border: 2px solid rgba(25, 118, 210, 0.15);
  box-shadow: 0 4px 20px rgba(25, 118, 210, 0.1);
  position: relative;
  overflow: hidden;
}

.quick-start-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #1976d2 0%, #42a5f5 0%, #90caf9 100%);
}

.quick-start-section p {
  margin: 0;
  font-size: 1.125rem;
  line-height: 1.6;
  color: #2c3e50;
  font-weight: 500;
}

.key-features-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1976d2;
  margin: 2rem 0 1rem 0;
  line-height: 1.3;
  text-shadow: 0 2px 4px rgba(25, 118, 210, 0.1);
  position: relative;
}

.key-features-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #1976d2 0%, #42a5f5 100%);
  border-radius: 2px;
}

.key-features-list {
  list-style: none;
  padding-left: 0;
  margin: 0 0 1.5rem 0;
}

.key-features-list li {
  margin-bottom: 1rem;
  line-height: 1.6;
  color: #455a64;
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  font-size: 1.25rem;
}

.key-feature-link {
  font-size: 1.25rem;
  font-weight: 600;
  display: inline;
  margin-right: 0.5rem;
}

.feature-link {
  color: #1976d2;
  text-decoration: none;
  transition: all 0.2s ease;
}

.feature-link:hover {
  color: #1565c0;
  text-decoration: underline;
  background-color: rgba(25, 118, 210, 0.1);
  padding: 2px 4px;
  border-radius: 4px;
}
</style>

