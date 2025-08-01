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
      <div class="mb-6">
        <!-- File name, title, and process button row -->
        <div class="d-flex align-center justify-space-between mb-2">
          <div class="d-flex align-center">
            <h3 class="text-h5 text-medium-emphasis mr-2 mb-0">{{ configuration.file_name.replace('.yaml', '') }}:</h3>
            <div v-if="!editingTitle" @click="startEditTitle" class="title-display">
              <h3 class="title-text mb-0 cursor-pointer">{{ configuration.title || 'Enter configuration title...' }}</h3>
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
          
          <div class="d-flex gap-2">
            <v-btn
              color="secondary"
              @click="processAllVersions"
              :loading="processing"

            >
              <v-icon start>mdi-cog</v-icon>
              Process Configuration
            </v-btn>
          </div>
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

      <!-- Configuration Content -->
      <div class="configuration-content">
        <!-- Version Management -->
        <BaseCard 
          icon="mdi-tag-multiple"
          :is-secondary="false"
        >
          <template #title>
            <div class="d-flex align-center gap-2">
              <h3 class="text-h5 mb-0 mr-2">Version:</h3>
              <v-select
                v-model="activeVersion"
                :items="sortedVersions"
                variant="outlined"
                density="compact"
                hide-details
                class="version-select"
                style="max-width: 200px;"
              />
              <!-- Dictionary and Enumerations links -->
              <div v-if="activeVersion" class="d-flex flex-column gap-1 ml-4">
                <v-btn
                  variant="text"
                  size="small"
                  color="default"
                  @click="openDictionary"
                  class="justify-start px-0 text-black"
                >
                  <v-icon start size="small">mdi-book-open-variant</v-icon>
                  Dictionary: {{ dictionaryFileName }}
                </v-btn>
                <v-btn
                  variant="text"
                  size="small"
                  color="default"
                  @click="openEnumerations"
                  class="justify-start px-0 text-black"
                >
                  <v-icon start size="small">mdi-format-list-numbered</v-icon>
                  Enumerations: {{ enumerationsFileName }}
                </v-btn>
              </div>
            </div>
          </template>
          
          <template #header-actions>
            <div v-if="activeVersion" class="d-flex flex-column gap-2">
              <!-- Schema download buttons -->
              <div class="d-flex gap-2">
                <v-btn
                  color="primary"
                  variant="elevated"
                  size="small"
                  @click="downloadJsonSchema(activeVersion)"
                >
                  <v-icon start size="small">mdi-code-json</v-icon>
                  JSON Schema
                </v-btn>
                <v-btn
                  color="primary"
                  variant="elevated"
                  size="small"
                  @click="downloadBsonSchema(activeVersion)"
                >
                  <v-icon start size="small">mdi-database</v-icon>
                  BSON Schema
                </v-btn>
              </div>
              
              <!-- Version action buttons -->
              <div class="d-flex gap-2">
                <v-btn
                  color="secondary"
                  variant="elevated"
                  size="small"
                  @click="showNewVersionDialog = true"
                >
                  <v-icon start size="small">mdi-plus</v-icon>
                  New Version
                </v-btn>
                <v-btn
                  :color="activeVersionData?._locked ? 'warning' : 'success'"
                  variant="elevated"
                  size="small"
                  @click="toggleVersionLock"
                >
                  <v-icon start size="small">{{ activeVersionData?._locked ? 'mdi-lock' : 'mdi-lock-open' }}</v-icon>
                  {{ activeVersionData?._locked ? 'Unlock' : 'Lock' }}
                </v-btn>
                <v-btn
                  v-if="!activeVersionData?._locked"
                  color="error"
                  variant="elevated"
                  size="small"
                  @click="deleteVersion"
                >
                  <v-icon start size="small">mdi-delete</v-icon>
                  Delete
                </v-btn>
              </div>
            </div>
          </template>
          
          <div v-if="activeVersion && activeVersionData" class="version-content">
              <!-- Version Information Cards -->
              <VersionInformationCards
                :version="activeVersionData"
                :on-update="autoSave"
                :disabled="activeVersionData._locked"
              />
            </div>
        </BaseCard>
      </div>
    </div>
  </v-container>

  <!-- New Version Dialog -->
  <v-dialog v-model="showNewVersionDialog" max-width="600px">
    <v-card>
      <v-card-title class="text-h5 pa-6 pb-4">
        <v-icon start color="primary" class="mr-2">mdi-plus-circle</v-icon>
        Create New Version
      </v-card-title>
      <v-card-text class="pa-6 pt-0">
        <div class="d-flex flex-column gap-6">
          <!-- Version Components -->
          <div class="version-components">
            <h4 class="text-subtitle-1 font-weight-medium mb-4 text-medium-emphasis">Version Components</h4>
            
            <!-- Major Version -->
            <div class="version-row mb-4">
              <div class="version-label">
                <span class="text-body-1 font-weight-medium">Major</span>
                <span class="text-caption text-medium-emphasis d-block">Breaking changes</span>
              </div>
              <div class="version-controls">
                <v-text-field
                  v-model.number="newVersion.major"
                  type="number"
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="version-input"
                  min="0"
                />
                <v-btn
                  icon="mdi-plus"
                  size="small"
                  variant="elevated"
                  color="primary"
                  @click="incrementVersion('major')"
                  class="ml-2"
                />
              </div>
            </div>
            
            <!-- Minor Version -->
            <div class="version-row mb-4">
              <div class="version-label">
                <span class="text-body-1 font-weight-medium">Minor</span>
                <span class="text-caption text-medium-emphasis d-block">New features</span>
              </div>
              <div class="version-controls">
                <v-text-field
                  v-model.number="newVersion.minor"
                  type="number"
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="version-input"
                  min="0"
                />
                <v-btn
                  icon="mdi-plus"
                  size="small"
                  variant="elevated"
                  color="primary"
                  @click="incrementVersion('minor')"
                  class="ml-2"
                />
              </div>
            </div>
            
            <!-- Patch Version -->
            <div class="version-row mb-4">
              <div class="version-label">
                <span class="text-body-1 font-weight-medium">Patch</span>
                <span class="text-caption text-medium-emphasis d-block">Bug fixes</span>
              </div>
              <div class="version-controls">
                <v-text-field
                  v-model.number="newVersion.patch"
                  type="number"
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="version-input"
                  min="0"
                />
                <v-btn
                  icon="mdi-plus"
                  size="small"
                  variant="elevated"
                  color="primary"
                  @click="incrementVersion('patch')"
                  class="ml-2"
                />
              </div>
            </div>
            
            <!-- Enumerators -->
            <div class="version-row mb-4">
              <div class="version-label">
                <span class="text-body-1 font-weight-medium">Enumerators</span>
                <span class="text-caption text-medium-emphasis d-block">Enumeration version</span>
              </div>
              <div class="version-controls">
                <v-text-field
                  v-model.number="newVersion.enumerators"
                  type="number"
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="version-input"
                  min="0"
                />
                <v-btn
                  icon="mdi-plus"
                  size="small"
                  variant="elevated"
                  color="primary"
                  @click="newVersion.enumerators++"
                  class="ml-2"
                />
              </div>
            </div>
          </div>
          
          <!-- Preview -->
          <v-divider />
          <div class="version-preview">
            <h4 class="text-subtitle-1 font-weight-medium mb-3 text-medium-emphasis">Preview</h4>
            <div class="version-display">
              <span class="text-body-2 text-medium-emphasis">New Version: </span>
              <span class="text-h5 font-weight-bold text-primary">{{ newVersionString }}</span>
            </div>
          </div>
        </div>
      </v-card-text>
      <v-card-actions class="pa-6 pt-0">
        <v-spacer />
        <v-btn
          color="secondary"
          variant="text"
          @click="showNewVersionDialog = false"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          @click="createNewVersion"
          :loading="saving"
        >
          <v-icon start>mdi-plus</v-icon>
          Create Version
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
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
const showNewVersionDialog = ref(false)
const newVersion = ref({
  major: 0,
  minor: 0,
  patch: 0,
  enumerators: 0
})

// Computed properties
const sortedVersions = computed(() => {
  if (!configuration.value?.versions) return []
  return [...configuration.value.versions].reverse().map(v => v.version) // Just return version strings
})

const activeVersionData = computed(() => {
  if (!configuration.value || !activeVersion.value) return null
  return configuration.value.versions.find(v => v.version === activeVersion.value)
})



const newVersionString = computed(() => {
  return `${newVersion.value.major}.${newVersion.value.minor}.${newVersion.value.patch}.${newVersion.value.enumerators}`
})

const dictionaryFileName = computed(() => {
  if (!configuration.value || !activeVersion.value) return ''
  const baseName = configuration.value.file_name.replace('.yaml', '')
  const versionParts = activeVersion.value.split('.')
  if (versionParts.length >= 3) {
    return `${baseName}.${versionParts[0]}.${versionParts[1]}.${versionParts[2]}.yaml`
  }
  return `${baseName}.0.0.0.yaml`
})

const enumerationsFileName = computed(() => {
  if (!configuration.value || !activeVersion.value) return ''
  const versionParts = activeVersion.value.split('.')
  if (versionParts.length >= 4) {
    return `enumerations.${versionParts[3]}.yaml`
  }
  return 'enumerations.0.yaml'
})



// Methods
const loadConfiguration = async () => {
  loading.value = true
  error.value = null
  
  try {
    const fileName = route.params.fileName as string
    configuration.value = await apiService.getConfiguration(fileName)
    

    
    // Set active version to the newest one if available
    if (configuration.value?.versions && configuration.value.versions.length > 0) {
      // Take the last version in the original array (newest)
      activeVersion.value = configuration.value.versions[configuration.value.versions.length - 1].version
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

// Version management methods
const initializeNewVersion = () => {
  if (!configuration.value?.versions || configuration.value.versions.length === 0) {
    newVersion.value = { major: 1, minor: 0, patch: 0, enumerators: 0 }
    return
  }
  
  // Get the most recent version
  const latestVersion = configuration.value.versions[configuration.value.versions.length - 1]
  const versionParts = latestVersion.version.split('.')
  
  if (versionParts.length >= 3) {
    newVersion.value = {
      major: parseInt(versionParts[0]) || 0,
      minor: parseInt(versionParts[1]) || 0,
      patch: parseInt(versionParts[2]) || 0,
      enumerators: parseInt(versionParts[3]) || 0
    }
  } else {
    newVersion.value = { major: 1, minor: 0, patch: 0, enumerators: 0 }
  }
}

const incrementVersion = (type: 'major' | 'minor' | 'patch') => {
  if (type === 'major') {
    newVersion.value.major++
    newVersion.value.minor = 0
    newVersion.value.patch = 0
  } else if (type === 'minor') {
    newVersion.value.minor++
    newVersion.value.patch = 0
  } else if (type === 'patch') {
    newVersion.value.patch++
  }
}

const createNewVersion = async () => {
  if (!configuration.value) return
  
  const versionString = newVersionString.value
  
  // Check if version already exists
  if (configuration.value.versions.some(v => v.version === versionString)) {
    error.value = 'Version already exists'
    return
  }
  
  try {
    // Find the previous latest version (before adding the new one)
    const previousLatestVersion = configuration.value.versions.length > 0 
      ? configuration.value.versions[configuration.value.versions.length - 1] 
      : null
    
    // Check if dictionary version changed (first 3 digits)
    let shouldCopyDictionary = false
    let previousDictionaryFileName = ''
    let newDictionaryFileName = ''
    
    if (previousLatestVersion) {
      const oldVersionParts = previousLatestVersion.version.split('.')
      const newVersionParts = versionString.split('.')
      
      // Compare first 3 digits (Major.Minor.Patch)
      if (oldVersionParts.length >= 3 && newVersionParts.length >= 3) {
        const oldDictVersion = `${oldVersionParts[0]}.${oldVersionParts[1]}.${oldVersionParts[2]}`
        const newDictVersion = `${newVersionParts[0]}.${newVersionParts[1]}.${newVersionParts[2]}`
        
        if (oldDictVersion !== newDictVersion) {
          shouldCopyDictionary = true
          const baseName = configuration.value.file_name.replace('.yaml', '')
          previousDictionaryFileName = `${baseName}.${oldDictVersion}.yaml`
          newDictionaryFileName = `${baseName}.${newDictVersion}.yaml`
        }
      }
    }
    
    // Create new version object
    const newVersionObj: ConfigurationVersion = {
      version: versionString,
      _locked: false
    }
    
    // Add to configuration
    configuration.value.versions.push(newVersionObj)
    
    // Lock the previous latest version if it exists
    if (previousLatestVersion) {
      previousLatestVersion._locked = true
    }
    
    // Save configuration
    await autoSave()
    
    // Copy dictionary if version changed
    if (shouldCopyDictionary) {
      try {
        // Get the previous dictionary
        const previousDictionary = await apiService.getDictionary(previousDictionaryFileName)
        
        // Create the new dictionary with the same content
        await apiService.saveDictionary(newDictionaryFileName, previousDictionary)
        
        console.log(`Dictionary copied: ${previousDictionaryFileName} → ${newDictionaryFileName}`)
      } catch (err: any) {
        console.log(`Previous dictionary file does not exist, skipping copy: ${previousDictionaryFileName}`)
      }
    }
    
    // Set as active version
    activeVersion.value = versionString
    
    // Close dialog
    showNewVersionDialog.value = false
    
    // Reset new version form
    initializeNewVersion()
  } catch (err: any) {
    error.value = err.message || 'Failed to create new version'
    console.error('Failed to create new version:', err)
  }
}

const toggleVersionLock = async () => {
  if (!configuration.value || !activeVersionData.value) return
  
  try {
    // Find the version object in the configuration and toggle its lock status
    const versionIndex = configuration.value.versions.findIndex(v => v.version === activeVersion.value)
    if (versionIndex !== -1) {
      configuration.value.versions[versionIndex]._locked = !configuration.value.versions[versionIndex]._locked
      
      // Save configuration
      await autoSave()
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to toggle version lock'
    console.error('Failed to toggle version lock:', err)
  }
}

const deleteVersion = async () => {
  if (!configuration.value || !activeVersionData.value) return
  
  // Don't allow deletion if version is locked
  if (activeVersionData.value._locked) {
    error.value = 'Cannot delete a locked version. Unlock the version first.'
    return
  }
  
  // Don't allow deletion if it's the only version
  if (configuration.value.versions.length <= 1) {
    error.value = 'Cannot delete the only version'
    return
  }
  
  try {
    // Remove version from configuration
    const index = configuration.value.versions.findIndex(v => v.version === activeVersion.value)
    if (index !== -1) {
      configuration.value.versions.splice(index, 1)
      
      // Save configuration
      await autoSave()
      
      // Set active version to the newest remaining version
      if (configuration.value.versions.length > 0) {
        activeVersion.value = configuration.value.versions[configuration.value.versions.length - 1].version
      }
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to delete version'
    console.error('Failed to delete version:', err)
  }
}

const openDictionary = () => {
  if (!dictionaryFileName.value) return
  
  // Navigate to the dictionary detail page
  router.push({
    name: 'DictionaryDetail',
    params: { fileName: dictionaryFileName.value }
  })
}

const openEnumerations = () => {
  if (!enumerationsFileName.value) return
  
  // Navigate to the enumerations detail page
  router.push({
    name: 'EnumeratorDetail',
    params: { fileName: enumerationsFileName.value }
  })
}

// Load configuration on mount
onMounted(() => {
  loadConfiguration()
})

// Watch for dialog opening to initialize new version
watch(showNewVersionDialog, (newValue) => {
  if (newValue) {
    initializeNewVersion()
  }
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
  font-size: 1.5rem !important;
  font-weight: 400 !important;
  line-height: 1.3 !important;
  color: rgba(0, 0, 0, 0.87) !important;
}

.title-display {
  cursor: pointer;
}

.title-text {
  font-size: 1.5rem;
  font-weight: 400;
  line-height: 1.3;
  color: rgba(0, 0, 0, 0.87);
  margin: 0;
}

/* New Version Dialog Styles */
.version-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.version-label {
  flex: 1;
  min-width: 120px;
}

.version-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.version-input {
  max-width: 120px;
}

.version-preview {
  padding: 16px 0;
}

.version-display {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background-color: rgba(var(--v-theme-primary), 0.05);
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
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