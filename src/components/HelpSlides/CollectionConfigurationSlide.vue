<template>
  <div class="overview-content" style="width: 100%; min-width: 0;">
    <p class="slide-description" v-if="description" v-html="description"></p>
    <p class="slide-description" v-else>Collection Configurations define how a MongoDB collection is set up, including schema validation, indexes, and data migrations. Each configuration file controls the complete setup process for one collection.</p>
    <h2>Configuration Processing</h2>
    <p>When you process a collection configuration, the system follows a six-step process to ensure your database is properly configured:</p>
    <ol>
      <li><strong>Drop existing Schema Validation</strong> - Removes any current validation rules to prepare for new schema</li>
      <li><strong>Drop indexes to be removed</strong> - Removes indexes that are no longer needed</li>
      <li><strong>Run data migrations</strong> - Transforms existing data to match new schema requirements</li>
      <li><strong>Create new indexes</strong> - Adds indexes defined in the configuration</li>
      <li><strong>Apply Validation Schema</strong> - Enforces data quality constraints on the collection</li>
      <li><strong>Load Test Data</strong> - Optionally loads test documents when enabled</li>
    </ol>
    <h2>Schema Versioning</h2>
    <p>Collection Configurations use a 3-part semantic version number (e.g., 1.2.3) plus an Enumerators version. When processing configurations, the system applies versions one at a time, starting from the currently active version and progressing through each newer version until reaching the most recent version. This incremental approach ensures that migrations and schema changes are applied in the correct order. Creating a new version automatically locks the previous version to prevent changes to deployed configurations. See <span class="text-link clickable" @click="navigateToSlide(9)">configuration locking</span> for more information about how locking protects your production deployments.</p>
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
  font-size: 1rem;
  font-weight: 400;
  color: #455a64;
  line-height: 1.7;
  margin-bottom: 2rem;
  max-width: 800px;
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
  font-size: 1rem;
  line-height: 1.7;
  color: #455a64;
}

ol {
  margin-bottom: 1rem;
  padding-left: 1.75rem;
  font-size: 1rem;
}

li {
  margin-bottom: 0.75rem;
  font-size: 1rem;
  line-height: 1.6;
  color: #455a64;
}

li strong {
  font-weight: 600;
  color: #2c3e50;
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

