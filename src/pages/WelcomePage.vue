<template>
  <v-container fluid class="pa-0">
    <v-row justify="center" align="center" style="min-height: 100vh;">
      <v-col cols="12" class="pa-0">
        <!-- Help Carousel -->
        <v-card class="help-carousel" variant="outlined" elevation="0">
          <v-card-title class="d-flex align-center pa-6">
            <v-icon icon="mdi-information-outline" class="mr-2" />
            <span class="text-h4">{{ helpSlides[currentSlide].title }}</span>
          </v-card-title>
          <v-card-text class="pa-0">
            <div class="carousel-container">
              <!-- Previous Button -->
              <v-btn
                icon="mdi-chevron-left"
                variant="text"
                size="large"
                class="carousel-nav-btn prev-btn"
                @click="previousSlide"
                :disabled="currentSlide === 0"
              />
              
              <v-window v-model="currentSlide" class="help-window">
                <v-window-item
                  v-for="(slide, index) in helpSlides"
                  :key="index"
                  :value="index"
                >
                  <div class="d-flex flex-column justify-center align-center h-100 pa-8" style="height: calc(100vh - 120px); width: 100%;">
                    
                    <!-- Overview slide with detailed content -->
                    <div v-if="slide.detailedContent" class="overview-content">
                      <p class="text-h6 text-medium-emphasis text-center mb-6">{{ slide.description }}</p>
                      <div class="detailed-content" v-html="slide.detailedContent"></div>
                    </div>
                    
                    <!-- Other slides with simple description -->
                    <div v-else>
                      <v-icon :icon="slide.icon" size="80" color="primary" class="mb-6" />
                      <p class="text-h6 text-medium-emphasis text-center mb-8">{{ slide.description }}</p>
                    </div>
                    
                    <v-btn
                      v-if="slide.action"
                      :to="slide.action.route"
                      color="primary"
                      size="large"
                      variant="elevated"
                      class="mt-4"
                    >
                      {{ slide.action.text }}
                    </v-btn>
                  </div>
                </v-window-item>
              </v-window>
              
              <!-- Next Button -->
              <v-btn
                icon="mdi-chevron-right"
                variant="text"
                size="large"
                class="carousel-nav-btn next-btn"
                @click="nextSlide"
                :disabled="currentSlide === helpSlides.length - 1"
              />
            </div>
            
            <!-- Navigation dots -->
            <div class="d-flex justify-center pa-4">
              <v-btn
                v-for="(_, index) in helpSlides"
                :key="index"
                :icon="currentSlide === index ? 'mdi-circle' : 'mdi-circle-outline'"
                variant="text"
                size="small"
                @click="currentSlide = index"
              />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Help Dialog -->
    <HelpDialog
      v-model="showHelp"
      :title="currentHelp?.title || ''"
      :content="currentHelp?.content || ''"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useHelp } from '@/composables/useHelp'
import HelpDialog from '@/components/HelpDialog.vue'

const { showHelp, currentHelp } = useHelp()

const currentSlide = ref(0)

const helpSlides = [
  {
    icon: 'mdi-information-outline',
    title: 'Overview',
    description: 'The MongoDB Configurator is a comprehensive tool for managing MongoDB schema configurations and processing operations. This application provides a unified interface for creating, editing, and managing all aspects of your MongoDB database schemas.',
    action: { text: 'Get Started', route: '/configurations' },
    detailedContent: `
      <h2>Key Features</h2>
      <ul>
        <li><strong>Collection Configurations:</strong> Define MongoDB collections with versioned schemas and processing operations</li>
        <li><strong>Data Dictionaries:</strong> Create human-readable schema definitions that hide complexity in simple and complex primitive types</li>
        <li><strong>Custom Types:</strong> Define reusable type definitions for complex schemas</li>
        <li><strong>Enumerators:</strong> Create sets of allowed values for enum properties</li>
        <li><strong>Test Data:</strong> Generate sample documents for testing your collections</li>
        <li><strong>Migrations:</strong> Create data transformation scripts for schema updates</li>
      </ul>
      
      <h2>Getting Started</h2>
      <p>To get started with the MongoDB Configurator:</p>
      <ol>
        <li>Create a new collection configuration to define your MongoDB collection structure</li>
        <li>Define your data dictionary to create human-readable schema definitions</li>
        <li>Create custom types as needed for complex data structures</li>
        <li>Add enumerators for sets of allowed values</li>
        <li>Generate test data for validation and testing</li>
        <li>Create migrations for schema evolution</li>
        <li>Process your configurations to apply changes to your database</li>
      </ol>
      
      <h2>Navigation</h2>
      <p>Use the navigation drawer on the left to access different sections of the application. Each section provides specialized tools for managing specific aspects of your MongoDB schemas.</p>
      
      <h2>Help System</h2>
      <p>This help system provides detailed information about each feature. Click the help icon (?) in any section to access contextual help content.</p>
    `
  },
  {
    icon: 'mdi-database',
    title: 'Collection',
    description: 'Define MongoDB collections with versioned schemas and processing operations.',
    action: { text: 'View Configurations', route: '/configurations' }
  },
  {
    icon: 'mdi-book-open-variant',
    title: 'Dictionary',
    description: 'Create human-readable schema definitions that hide complexity.',
    action: { text: 'View Dictionaries', route: '/dictionaries' }
  },
  {
    icon: 'mdi-shape-outline',
    title: 'Type',
    description: 'Define reusable type definitions for complex schemas.',
    action: { text: 'View Types', route: '/types' }
  },
  {
    icon: 'mdi-format-list-checks',
    title: 'Enumerator',
    description: 'Create sets of allowed values for enum properties.',
    action: { text: 'View Enumerators', route: '/enumerators' }
  },
  {
    icon: 'mdi-test-tube',
    title: 'Test Data',
    description: 'Generate sample documents for testing your collections.',
    action: { text: 'View Test Data', route: '/test-data' }
  },
  {
    icon: 'mdi-database-sync',
    title: 'Migration',
    description: 'Create data transformation scripts for schema updates.',
    action: { text: 'View Migrations', route: '/migrations' }
  }
]

const previousSlide = () => {
  if (currentSlide.value > 0) {
    currentSlide.value--
  }
}

const nextSlide = () => {
  if (currentSlide.value < helpSlides.length - 1) {
    currentSlide.value++
  }
}
</script>

<style scoped>
.help-carousel {
  height: 100vh;
  border: none;
  border-radius: 0;
}

.help-window {
  height: calc(100vh - 120px);
}

.help-window :deep(.v-window__container) {
  height: 100%;
}

.help-window :deep(.v-window-item) {
  height: 100%;
}

.carousel-container {
  position: relative;
  display: flex;
  align-items: center;
  height: calc(100vh - 120px);
  padding: 0 80px; /* Add padding to account for navigation buttons */
}

.carousel-nav-btn {
  position: absolute;
  z-index: 10;
  background-color: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.carousel-nav-btn:hover {
  background-color: rgba(255, 255, 255, 1) !important;
  transform: scale(1.1);
}

.prev-btn {
  left: 20px;
}

.next-btn {
  right: 20px;
}

.carousel-nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.overview-content {
  width: 100%;
  text-align: left;
  overflow-y: auto;
  max-height: calc(100vh - 300px);
  padding: 0 20px;
}

.detailed-content {
  text-align: left;
  line-height: 1.6;
  width: 100%;
}

.detailed-content :deep(h2) {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 1.5rem 0 0.75rem 0;
  color: #1976d2;
}

.detailed-content :deep(h3) {
  font-size: 1.25rem;
  font-weight: 500;
  margin: 1.25rem 0 0.5rem 0;
  color: #424242;
}

.detailed-content :deep(p) {
  margin-bottom: 0.75rem;
  line-height: 1.6;
}

.detailed-content :deep(ul), .detailed-content :deep(ol) {
  margin-bottom: 0.75rem;
  padding-left: 1.5rem;
}

.detailed-content :deep(li) {
  margin-bottom: 0.25rem;
}

.detailed-content :deep(strong) {
  font-weight: 600;
  color: #1976d2;
}
</style> 