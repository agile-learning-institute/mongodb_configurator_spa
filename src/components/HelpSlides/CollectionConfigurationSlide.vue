<template>
  <div class="overview-content">
    <p class="slide-description" v-html="description"></p>
    <h2>Configuration Processing</h2>
    <p>Collection configuration is done using a six-step process:</p>
    <ol>
      <li>Drop any existing Schema Validation</li>
      <li>Drop any indexes that should be removed</li>
      <li>Run any migrations that are needed to transform data</li>
      <li>Create any new indexes that are needed</li>
      <li>Apply the Validation Schema</li>
      <li>Load Test Data (when enabled)</li>
    </ol>
    <h2>Schema Versioning</h2>
    <p>Collection Configuration versions use a 3-part semantic Schema version number plus an Enumerators version. When configuring a collection, only newer versions are applied. Creating a new version automatically locks the currently active version. See <span class="text-link clickable" @click="navigateToSlide(9)">configuration locking</span> for more information about configuration locking.</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  description: string
}>()

const emit = defineEmits<{
  navigateToSlide: [index: number]
}>()

const navigateToSlide = (index: number) => {
  emit('navigateToSlide', index)
}
</script>

<style scoped>
.slide-description {
  font-size: 1.375rem;
  font-weight: 500;
  color: #2c3e50;
  line-height: 1.7;
  margin-bottom: 2.5rem;
  max-width: 800px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1976d2;
  margin: 2rem 0 1rem 0;
  line-height: 1.3;
  text-shadow: 0 2px 4px rgba(25, 118, 210, 0.1);
  position: relative;
}

h2::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #1976d2 0%, #42a5f5 100%);
  border-radius: 2px;
}

p {
  margin-bottom: 1rem;
  font-size: 1.0625rem;
  line-height: 1.7;
  color: #455a64;
}

ol {
  margin-bottom: 1rem;
  padding-left: 1.75rem;
  font-size: 1.0625rem;
}

li {
  margin-bottom: 0.5rem;
  font-size: 1.0625rem;
  line-height: 1.6;
  color: #455a64;
}

.text-link.clickable {
  color: #1976d2;
  cursor: pointer;
  text-decoration: underline;
  transition: all 0.2s ease;
}

.text-link.clickable:hover {
  color: #1565c0;
  text-decoration: none;
  background-color: rgba(25, 118, 210, 0.1);
  padding: 2px 4px;
  border-radius: 4px;
}
</style>

