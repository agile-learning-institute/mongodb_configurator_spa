<template>
  <v-container fluid class="pa-0">
    <v-row justify="center" align="center" style="min-height: 100vh;">
      <v-col cols="12" class="pa-0">
        <!-- Help Carousel -->
        <v-card class="help-carousel" variant="outlined" elevation="0">
          <v-card-title class="d-flex align-center pa-6">
            <v-icon icon="mdi-help-circle" class="mr-2" />
            Getting Started
            <v-spacer />
            <v-btn icon="mdi-help" variant="text" @click="showHelpFor('welcome')" />
          </v-card-title>
          <v-card-text class="pa-0">
            <v-window v-model="currentSlide" class="help-window">
              <v-window-item
                v-for="(slide, index) in helpSlides"
                :key="index"
                :value="index"
              >
                <div class="d-flex flex-column justify-center align-center h-100 pa-8" style="height: calc(100vh - 120px);">
                  <v-icon :icon="slide.icon" size="80" color="primary" class="mb-6" />
                  <h2 class="text-h3 mb-4 text-center">{{ slide.title }}</h2>
                  <p class="text-h6 text-medium-emphasis text-center mb-8" style="max-width: 600px;">{{ slide.description }}</p>
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

const {
  showHelp,
  currentHelp,
  showHelpFor
} = useHelp()

const currentSlide = ref(0)

const helpSlides = [
  {
    icon: 'mdi-information-outline',
    title: 'Overview',
    description: 'Welcome to the MongoDB Configurator. This application helps you manage MongoDB schema configurations and processing operations. Explore the different sections to understand how to create and manage your database schemas.',
    action: { text: 'Get Started', route: '/configurations' }
  },
  {
    icon: 'mdi-database',
    title: 'Collection Configurations',
    description: 'Define MongoDB collections with versioned schemas and processing operations.',
    action: { text: 'View Configurations', route: '/configurations' }
  },
  {
    icon: 'mdi-book-open-variant',
    title: 'Data Dictionaries',
    description: 'Create human-readable schema definitions that hide complexity.',
    action: { text: 'View Dictionaries', route: '/dictionaries' }
  },
  {
    icon: 'mdi-shape-outline',
    title: 'Custom Types',
    description: 'Define reusable type definitions for complex schemas.',
    action: { text: 'View Types', route: '/types' }
  },
  {
    icon: 'mdi-format-list-checks',
    title: 'Enumerators',
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
    title: 'Migrations',
    description: 'Create data transformation scripts for schema updates.',
    action: { text: 'View Migrations', route: '/migrations' }
  }
]
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
</style> 