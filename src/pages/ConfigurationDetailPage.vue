<template>
  <v-container>
    <!-- Loading state -->
    <div v-if="loading" class="d-flex justify-center align-center pa-8">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="pa-4">
      <v-alert type="error">
        {{ error }}
        <v-btn @click="loadConfiguration" class="mt-2">Retry</v-btn>
      </v-alert>
    </div>

    <!-- Content -->
    <div v-else-if="configuration">
      <!-- File Header -->
      <div class="d-flex align-center justify-space-between mb-6">
        <div class="flex-grow-1">
          <!-- File name and title row -->
          <div class="d-flex align-center mb-2">
            <h2 class="text-h5 text-medium-emphasis mr-4 mb-0">{{ configuration.file_name }}</h2>
            <div v-if="!editingTitle" @click="startEditTitle" class="title-display">
              <h1 class="title-text mb-0 cursor-pointer">{{ configuration.title || 'Enter configuration title...' }}</h1>
            </div>
            <v-text-field
              v-else
              v-model="configuration.title"
              variant="plain"
              density="compact"
              class="title-edit-field h1-style"
              hide-details
              @update:model-value="autoSave"
              @blur="finishEditTitle"
              @keyup.enter="finishEditTitle"
              ref="titleInput"
            />
          </div>
          
          <!-- Description row -->
          <div v-if="!editingDescription" @click="startEditDescription" class="description-display">
            <p class="description-text mb-0 cursor-pointer">{{ configuration.description || 'Enter configuration description...' }}</p>
          </div>
          <v-text-field
            v-else
            v-model="configuration.description"
            placeholder="Enter configuration description..."
            variant="plain"
            density="compact"
            class="description-edit-field"
            hide-details
            @update:model-value="autoSave"
            @blur="finishEditDescription"
            @keyup.enter="finishEditDescription"
            ref="descriptionInput"
          />
        </div>
        
        <div class="d-flex gap-2">
          <v-btn
            color="secondary"
            @click="processAllVersions"
            :loading="processing"
            :disabled="hasAnyVersionLocked"
          >
            <v-icon start>mdi-cog</v-icon>
            Process Configuration
          </v-btn>
        </div>
      </div>

      <!-- Configuration Content -->
      <div class="configuration-content">
        <!-- Version Management -->
        <BaseCard 
          title="Version Management"
          icon="mdi-tag-multiple"
          :is-secondary="false"
        >
          <div class="version-tabs">
            <div class="d-flex align-center justify-space-between mb-4">
              <v-tabs v-model="activeVersion">
                <v-tab
                  v-for="version in configuration.versions"
                  :key="version.version"
                  :value="version.version"
                >
                  <div class="d-flex align-center">
                    <span>{{ version.version }}</span>
                    <v-icon 
                      v-if="version._locked" 
                      size="small" 
                      color="warning" 
                      class="ml-1"
                    >
                      mdi-lock
                    </v-icon>
                    <v-icon 
                      v-else
                      size="small" 
                      color="success" 
                      class="ml-1"
                    >
                      mdi-lock-open
                    </v-icon>
                  </div>
                </v-tab>
              </v-tabs>
              
              <!-- Schema download buttons for active version -->
              <div v-if="activeVersion" class="d-flex gap-2">
                <v-btn
                  color="primary"
                  variant="outlined"
                  size="small"
                  @click="downloadJsonSchema(activeVersion)"
                >
                  <v-icon start size="small">mdi-code-json</v-icon>
                  JSON Schema
                </v-btn>
                <v-btn
                  color="primary"
                  variant="outlined"
                  size="small"
                  @click="downloadBsonSchema(activeVersion)"
                >
                  <v-icon start size="small">mdi-database</v-icon>
                  BSON Schema
                </v-btn>
              </div>
            </div>

            <div v-if="activeVersion && activeVersionData" class="version-content">
              <!-- Version Information Cards -->
              <VersionInformationCards
                :version="activeVersionData"
                :on-update="autoSave"
              />
            </div>
          </div>
        </BaseCard>
      </div>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiService } from '@/utils/api'
import { useEvents } from '@/composables/useEvents'
import BaseCard from '@/components/BaseCard.vue'

import VersionInformationCards from '@/components/VersionInformationCards.vue'

interface ConfigurationVersion {
  version: string
  _locked: boolean
  test_data?: string
  add_indexes?: any[]
  drop_indexes?: string[]
  migrations?: string[]
}

interface Configuration {
  file_name: string
  title: string
  description: string
  versions: ConfigurationVersion[]
}

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const saving = ref(false)
const processing = ref(false)
const error = ref<string | null>(null)
const configuration = ref<Configuration | null>(null)
const activeVersion = ref<string>('')
const editingDescription = ref(false)
const descriptionInput = ref<HTMLElement | null>(null)
const editingTitle = ref(false)
const titleInput = ref<HTMLElement | null>(null)

// Computed properties
const activeVersionData = computed(() => {
  if (!configuration.value || !activeVersion.value) return null
  return configuration.value.versions.find(v => v.version === activeVersion.value)
})

const hasAnyVersionLocked = computed(() => {
  if (!configuration.value) return false
  return configuration.value.versions.some(v => v._locked)
})

// Methods
const loadConfiguration = async () => {
  loading.value = true
  error.value = null
  
  try {
    const fileName = route.params.fileName as string
    configuration.value = await apiService.getConfiguration(fileName)
    
    // Set active version to the first one if available
    if (configuration.value?.versions && configuration.value.versions.length > 0) {
      activeVersion.value = configuration.value.versions[0].version
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load configuration'
    console.error('Failed to load configuration:', err)
  } finally {
    loading.value = false
  }
}

const autoSave = async () => {
  if (!configuration.value) return
  
  saving.value = true
  error.value = null
  
  try {
    await apiService.saveConfiguration(configuration.value.file_name, configuration.value)
  } catch (err: any) {
    error.value = err.message || 'Failed to save configuration'
    console.error('Failed to save configuration:', err)
  } finally {
    saving.value = false
  }
}

const startEditDescription = () => {
  editingDescription.value = true
  // Focus the input after it's rendered
  setTimeout(() => {
    if (descriptionInput.value) {
      descriptionInput.value.focus()
    }
  }, 0)
}

const finishEditDescription = () => {
  editingDescription.value = false
}

const startEditTitle = () => {
  editingTitle.value = true
  // Focus the input after it's rendered
  setTimeout(() => {
    if (titleInput.value) {
      titleInput.value.focus()
    }
  }, 0)
}

const finishEditTitle = () => {
  editingTitle.value = false
}





const processAllVersions = async () => {
  if (!configuration.value) return
  
  processing.value = true
  error.value = null
  
  try {
    const result = await apiService.processConfiguration(configuration.value.file_name)
    
    // Handle array of events or single event - navigate to Event Viewer
    if (Array.isArray(result) && result.length > 0) {
      // API returned an array of events
      router.push({
        name: 'EventViewer',
        query: {
          eventData: JSON.stringify(result[0]),
          title: 'Configuration Processed',
          subtitle: 'Configuration processing completed'
        }
      })
    } else if (result && result.id && result.type && result.status) {
      // API returned a single event
      router.push({
        name: 'EventViewer',
        query: {
          eventData: JSON.stringify(result),
          title: 'Configuration Processed',
          subtitle: 'Configuration processing completed'
        }
      })
    } else {
      // No event data, show simple success message
      const { showError } = useEvents()
      showError('Configuration processed successfully', 'Success', 'Configuration Processing Complete')
    }
    
    // Reload configuration to get updated status
    await loadConfiguration()
  } catch (err: any) {
    console.error('Failed to process configuration:', err)
    
    // Handle API errors with event data - show dialog for errors
    if (err.type === 'API_ERROR' && err.data) {
      if (err.data.id && err.data.type && err.data.status) {
        const { showEvent } = useEvents()
        showEvent(err.data, 'Process Configuration Error', 'Failed to process configuration')
      } else {
        const { showError } = useEvents()
        showError(err.message || 'Failed to process configuration', 'Process Configuration Error', 'Failed to process configuration')
      }
    } else {
      const { showError } = useEvents()
      showError(err.message || 'Failed to process configuration', 'Process Configuration Error', 'Failed to process configuration')
    }
  } finally {
    processing.value = false
  }
}

const downloadJsonSchema = async (version: string) => {
  if (!configuration.value) return
  
  try {
    const blob = await apiService.downloadJsonSchema(configuration.value.file_name, version)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${configuration.value.file_name}_${version}_json_schema.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (err: any) {
    error.value = err.message || 'Failed to download JSON schema'
    console.error('Failed to download JSON schema:', err)
  }
}

const downloadBsonSchema = async (version: string) => {
  if (!configuration.value) return
  
  try {
    const blob = await apiService.downloadBsonSchema(configuration.value.file_name, version)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${configuration.value.file_name}_${version}_bson_schema.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (err: any) {
    error.value = err.message || 'Failed to download BSON schema'
    console.error('Failed to download BSON schema:', err)
  }
}



// Load configuration on mount
onMounted(() => {
  loadConfiguration()
})
</script>

<style scoped>
.configuration-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.version-tabs {
  width: 100%;
}

.version-content {
  padding: 16px 0;
}

.version-actions {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  padding-top: 16px;
}

.title-edit-field {
  font-size: 1.5rem;
  font-weight: 500;
}

.h1-style {
  font-size: 2.125rem !important;
  font-weight: 300 !important;
  line-height: 1.2 !important;
  color: rgba(0, 0, 0, 0.87) !important;
}

.title-display {
  cursor: pointer;
}

.title-text {
  font-size: 2.125rem;
  font-weight: 300;
  line-height: 1.2;
  color: rgba(0, 0, 0, 0.87);
  margin: 0;
  transition: color 0.2s ease;
}

.title-text:hover {
  color: rgba(0, 0, 0, 0.6);
}

.description-edit-field {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.6);
}

.description-display {
  cursor: pointer;
}

.description-text {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.6);
  line-height: 1.4;
  margin: 0;
  padding: 4px 0;
  transition: color 0.2s ease;
}

.description-text:hover {
  color: rgba(0, 0, 0, 0.8);
}

.cursor-pointer {
  cursor: pointer;
}
</style> 