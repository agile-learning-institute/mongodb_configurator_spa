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
      <div class="d-flex align-center justify-space-between mb-4">
        <div>
          <h1 class="text-h4">{{ configuration.title }}</h1>
          <p class="text-body-2 text-medium-emphasis">{{ configuration.file_name }}</p>
        </div>
        <div class="d-flex gap-2">
          <v-btn
            color="secondary"
            @click="processAllVersions"
            :loading="processing"
            :disabled="hasAnyVersionLocked"
          >
            <v-icon start>mdi-cog</v-icon>
            Process All
          </v-btn>
        </div>
      </div>

      <!-- Configuration Content -->
      <div class="configuration-content">
        <!-- Description -->
        <BaseCard 
          title="Description"
          icon="mdi-information"
          :is-secondary="true"
          compact
        >
          <v-text-field
            v-model="configuration.description"
            placeholder="Enter configuration description..."
            variant="outlined"
            density="compact"
            @update:model-value="autoSave"
          />
        </BaseCard>

        <!-- Version Management -->
        <BaseCard 
          title="Version Management"
          icon="mdi-tag-multiple"
          :is-secondary="false"
        >
          <div class="version-tabs">
            <v-tabs v-model="activeVersion" class="mb-4">
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
                </div>
              </v-tab>
            </v-tabs>

            <div v-if="activeVersion && activeVersionData" class="version-content">
              <!-- Version Configuration Component -->
              <VersionConfiguration
                :version="activeVersionData"
                :collection-name="configuration.file_name"
                @render-json="downloadJsonSchema"
                @render-bson="downloadBsonSchema"
                @render-openapi="downloadOpenApi"
              />

              <!-- Version-specific actions -->
              <div class="version-actions mt-4">
                <v-divider class="mb-4" />
                
                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <h4 class="text-h6 mr-4">Version Actions</h4>
                    <v-chip
                      v-if="activeVersionData._locked"
                      color="warning"
                      size="small"
                    >
                      <v-icon start size="small">mdi-lock</v-icon>
                      Locked
                    </v-chip>
                  </div>
                  
                  <div class="d-flex gap-2">
                    <v-btn
                      v-if="!activeVersionData._locked"
                      color="warning"
                      variant="outlined"
                      size="small"
                      @click="lockVersion"
                    >
                      <v-icon start size="small">mdi-lock</v-icon>
                      Lock Version
                    </v-btn>
                    
                    <v-btn
                      v-if="activeVersionData._locked"
                      color="success"
                      variant="outlined"
                      size="small"
                      @click="unlockVersion"
                    >
                      <v-icon start size="small">mdi-lock-open</v-icon>
                      Unlock Version
                    </v-btn>
                    
                    <v-btn
                      color="secondary"
                      size="small"
                      @click="processVersion"
                      :loading="processing"
                      :disabled="activeVersionData._locked"
                    >
                      <v-icon start size="small">mdi-cog</v-icon>
                      Process Version
                    </v-btn>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { apiService } from '@/utils/api'
import BaseCard from '@/components/BaseCard.vue'
import VersionConfiguration from '@/components/VersionConfiguration.vue'

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
const loading = ref(false)
const saving = ref(false)
const processing = ref(false)
const error = ref<string | null>(null)
const configuration = ref<Configuration | null>(null)
const activeVersion = ref<string>('')

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
    console.log('Loading configuration for:', fileName)
    configuration.value = await apiService.getConfiguration(fileName)
    console.log('Configuration loaded:', configuration.value)
    
    // Set active version to the first one if available
    if (configuration.value?.versions && configuration.value.versions.length > 0) {
      activeVersion.value = configuration.value.versions[0].version
      console.log('Active version set to:', activeVersion.value)
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

const lockVersion = async () => {
  if (!activeVersionData.value) return
  
  try {
    // Note: This would need to be implemented in the API
    activeVersionData.value._locked = true
    await autoSave()
  } catch (err: any) {
    error.value = err.message || 'Failed to lock version'
    console.error('Failed to lock version:', err)
  }
}

const unlockVersion = async () => {
  if (!activeVersionData.value) return
  
  try {
    // Note: This would need to be implemented in the API
    activeVersionData.value._locked = false
    await autoSave()
  } catch (err: any) {
    error.value = err.message || 'Failed to unlock version'
    console.error('Failed to unlock version:', err)
  }
}

const processVersion = async () => {
  if (!configuration.value || !activeVersion.value) return
  
  processing.value = true
  error.value = null
  
  try {
    // Note: This would need to be implemented in the API to process specific version
    await apiService.processConfiguration(configuration.value.file_name)
    // Reload configuration to get updated status
    await loadConfiguration()
  } catch (err: any) {
    error.value = err.message || 'Failed to process version'
    console.error('Failed to process version:', err)
  } finally {
    processing.value = false
  }
}

const processAllVersions = async () => {
  if (!configuration.value) return
  
  processing.value = true
  error.value = null
  
  try {
    await apiService.processConfiguration(configuration.value.file_name)
    // Reload configuration to get updated status
    await loadConfiguration()
  } catch (err: any) {
    error.value = err.message || 'Failed to process configuration'
    console.error('Failed to process configuration:', err)
  } finally {
    processing.value = false
  }
}

const downloadJsonSchema = async (version: string) => {
  if (!configuration.value) return
  
  try {
    await apiService.downloadJsonSchema(configuration.value.file_name, version)
  } catch (err: any) {
    error.value = err.message || 'Failed to download JSON schema'
    console.error('Failed to download JSON schema:', err)
  }
}

const downloadBsonSchema = async (version: string) => {
  if (!configuration.value) return
  
  try {
    await apiService.downloadBsonSchema(configuration.value.file_name, version)
  } catch (err: any) {
    error.value = err.message || 'Failed to download BSON schema'
    console.error('Failed to download BSON schema:', err)
  }
}

const downloadOpenApi = async (_version: string) => {
  if (!configuration.value) return
  
  try {
    // Note: OpenAPI rendering not implemented in API yet
    error.value = 'OpenAPI schema rendering not implemented yet'
  } catch (err: any) {
    error.value = err.message || 'Failed to download OpenAPI schema'
    console.error('Failed to download OpenAPI schema:', err)
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
</style> 