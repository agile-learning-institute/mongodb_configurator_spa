<template>
  <v-container fluid>
    <v-row justify="center" align="center" style="min-height: 80vh;">
      <v-col cols="12" md="8" lg="6" class="text-center">
        <v-card class="pa-8" elevation="2">
          <h1 class="text-h2 mb-6">MongoDB Configurator SPA</h1>
          <p class="text-h6 mb-8 text-medium-emphasis">Hello World - Ready for Phase 3 Development</p>
          
          <v-alert 
            :type="isLocal ? 'success' : 'warning'" 
            class="mb-6"
          >
            <template v-slot:title>
              {{ isLocal ? 'Edit Mode' : 'Read-Only Mode' }}
            </template>
            <p v-if="isLocal" class="mb-0">
              BUILT_AT: {{ builtAt }} - You can edit configurations
            </p>
            <p v-else class="mb-0">
              BUILT_AT: {{ builtAt }} - Read-only mode, no editing allowed
            </p>
          </v-alert>
          
          <!-- Help Carousel -->
          <v-card class="mb-6" variant="outlined">
            <v-card-title class="d-flex align-center">
              <v-icon icon="mdi-help-circle" class="mr-2" />
              Getting Started
              <v-spacer />
              <v-btn icon="mdi-help" variant="text" @click="showHelpFor('welcome')" />
            </v-card-title>
            <v-card-text>
              <v-window v-model="currentSlide">
                <v-window-item
                  v-for="(slide, index) in helpSlides"
                  :key="index"
                  :value="index"
                >
                  <div class="d-flex flex-column justify-center align-center h-100 pa-4" style="height: 300px;">
                    <v-icon :icon="slide.icon" size="64" color="primary" class="mb-4" />
                    <h3 class="text-h5 mb-2">{{ slide.title }}</h3>
                    <p class="text-body-1 text-medium-emphasis">{{ slide.description }}</p>
                    <v-btn
                      v-if="slide.action"
                      :to="slide.action.route"
                      color="primary"
                      variant="outlined"
                      class="mt-4"
                    >
                      {{ slide.action.text }}
                    </v-btn>
                  </div>
                </v-window-item>
              </v-window>
              
              <!-- Navigation dots -->
              <div class="d-flex justify-center mt-4">
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
          
          <v-btn 
            color="primary" 
            size="large"
            @click="loadConfig"
            :loading="loading"
            class="mt-4"
          >
            <v-icon start>mdi-refresh</v-icon>
            Load Configuration
          </v-btn>
          
          <div v-if="error" class="mt-4">
            <v-alert type="error">
              {{ error }}
            </v-alert>
          </div>
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
import { onMounted, ref } from 'vue'
import { useConfig } from '@/composables/useConfig'
import { useHelp } from '@/composables/useHelp'
import HelpDialog from '@/components/HelpDialog.vue'

const {
  loading,
  error,
  builtAt,
  isLocal,
  loadConfig
} = useConfig()

const {
  showHelp,
  currentHelp,
  showHelpFor
} = useHelp()

const currentSlide = ref(0)

const helpSlides = [
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

onMounted(() => {
  loadConfig()
})
</script> 