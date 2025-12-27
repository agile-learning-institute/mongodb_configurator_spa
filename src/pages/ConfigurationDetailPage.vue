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
        <!-- File name, description, and process button row -->
        <div class="d-flex align-center justify-space-between mb-2">
          <div class="d-flex align-center" style="flex: 1; min-width: 0;">
            <h3 class="text-h5 text-medium-emphasis mr-2 mb-0">{{ configuration.file_name.replace('.yaml', '') }}:</h3>
            <v-textarea
              v-model="configuration.description"
              placeholder="Enter configuration description..."
              variant="plain"
              density="compact"
              class="title-edit-field h1-style"
              :style="{ flex: '1', minWidth: '300px' }"
              auto-grow
              rows="1"
              hide-details
              @blur="handleDescriptionChange"
              @keyup.enter.ctrl="handleDescriptionChange"
              data-test="page-header"
            />
          </div>
          
          <div class="d-flex flex-column gap-2">
            <div v-if="!isReadOnly" class="d-flex flex-column gap-2">
              <v-btn
                color="secondary"
                @click="processAllVersions"
                :loading="processing"
                data-test="configure-collection-btn"
              >
                <v-icon start>mdi-cog</v-icon>
                Configure Collection
              </v-btn>
              
              <v-btn
                color="red"
                variant="outlined"
                @click="showDeleteCollectionDialog = true"
                data-test="delete-collection-btn"
              >
                <v-icon start>mdi-delete</v-icon>
                Delete Collection
              </v-btn>
            </div>
            
            <div class="d-flex gap-2">
              <v-btn
                color="primary"
                variant="outlined"
                size="small"
                @click="downloadJsonSchema(activeVersion)"
                data-test="json-schema-btn"
              >
                <v-icon start size="small">mdi-code-json</v-icon>
                JSON Schema
              </v-btn>
              <v-btn
                color="primary"
                variant="outlined"
                size="small"
                @click="downloadBsonSchema(activeVersion)"
                data-test="bson-schema-btn"
              >
                <v-icon start size="small">mdi-database</v-icon>
                BSON Schema
              </v-btn>
            </div>
          </div>
        </div>
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
              <h3 class="text-h5 mb-0 mr-2" data-test="card-header">Version:</h3>
              <div class="d-flex align-center">
                <v-btn
                  icon="mdi-skip-previous"
                  variant="text"
                  size="default"
                  :disabled="!hasPreviousVersion"
                  @click="navigateToPreviousVersion"
                  class="mr-1"
                  data-test="previous-version-btn"
                />
                <span class="text-h6 font-weight-medium" data-test="active-version">{{ activeVersion }}</span>
                                  <v-btn
                    v-if="!hasNextVersion && !isReadOnly"
                    prepend-icon="mdi-plus"
                    variant="elevated"
                    size="small"
                    color="primary"
                    class="ml-1 new-version-btn"
                    title="Create new version"
                    @click="showNewVersionDialog = true"
                    data-test="new-version-btn"
                  >
                    New Version
                  </v-btn>
                <v-btn
                  v-else
                  icon="mdi-skip-next"
                  variant="text"
                  size="default"
                  :disabled="!hasNextVersion"
                  @click="navigateToNextVersion"
                  class="ml-1"
                  data-test="next-version-btn"
                />
              </div>
            </div>
          </template>
          
          <template #header-actions>
            <div v-if="activeVersion && activeVersionData && !isReadOnly" class="d-flex flex-column gap-2">
              <!-- Version action buttons -->
              <div class="d-flex gap-2">
                <v-btn
                  :color="activeVersionData?._locked ? 'warning' : 'success'"
                  variant="elevated"
                  size="small"
                  @click="toggleVersionLock"
                  data-test="toggle-lock-btn"
                >
                  <v-icon start size="small" data-test="lock-icon">{{ activeVersionData?._locked ? 'mdi-lock' : 'mdi-lock-open' }}</v-icon>
                  <span data-test="lock-btn-text">{{ activeVersionData?._locked ? 'Unlock' : 'Lock' }}</span>
                </v-btn>
                <v-btn
                  v-if="!activeVersionData?._locked"
                  color="error"
                  variant="elevated"
                  size="small"
                  @click="deleteVersion"
                  data-test="delete-version-btn"
                >
                  <v-icon start size="small" data-test="delete-icon">mdi-delete</v-icon>
                  <span data-test="delete-btn-text">Delete</span>
                </v-btn>
              </div>
            </div>
          </template>
          
          <div v-if="activeVersion && activeVersionData" class="version-content">
              <!-- Version Information Cards -->
              <VersionInformationCards
                :version="activeVersionData"
                :on-update="autoSave"
                :disabled="isReadOnly || activeVersionData._locked"
                :configuration="configuration"
              />
            </div>
        </BaseCard>
      </div>
    </div>
  </v-container>

  <!-- New Version Dialog -->
  <v-dialog v-model="showNewVersionDialog" max-width="600px" data-test="new-version-dialog">
    <v-card>
      <v-card-title class="text-h5 pa-6 pb-4" data-test="new-version-dialog-title">
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
                <div class="version-display-value" data-test="new-version-major">{{ newVersion.major }}</div>
                <v-btn
                  icon="mdi-plus"
                  size="small"
                  variant="elevated"
                  color="primary"
                  @click="incrementVersion('major')"
                  class="ml-2"
                  data-test="new-version-major-plus-btn"
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
                <div class="version-display-value" data-test="new-version-minor">{{ newVersion.minor }}</div>
                <v-btn
                  icon="mdi-plus"
                  size="small"
                  variant="elevated"
                  color="primary"
                  @click="incrementVersion('minor')"
                  class="ml-2"
                  data-test="new-version-minor-plus-btn"
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
                <div class="version-display-value" data-test="new-version-patch">{{ newVersion.patch }}</div>
                <v-btn
                  icon="mdi-plus"
                  size="small"
                  variant="elevated"
                  color="primary"
                  @click="incrementVersion('patch')"
                  class="ml-2"
                  data-test="new-version-patch-plus-btn"
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
                <div class="version-display-value" data-test="new-version-enumerators">{{ newVersion.enumerators }}</div>
                <v-btn
                  v-if="newVersion.enumerators < 3"
                  icon="mdi-plus"
                  size="small"
                  variant="elevated"
                  color="primary"
                  @click="incrementVersion('enumerators')"
                  class="ml-2"
                  data-test="new-version-enumerators-plus-btn"
                />
              </div>
            </div>
          </div>
          
          <!-- Preview -->
          <v-divider />
          <div class="version-preview">
            <h4 class="text-subtitle-1 font-weight-medium mb-3 text-medium-emphasis">Preview</h4>
            <div class="version-display" data-test="new-version-display">
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
          data-test="new-version-cancel-btn"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          @click="createNewVersion"
          :loading="saving"
          data-test="new-version-create-btn"
        >
          <v-icon start>mdi-plus</v-icon>
          Create Version
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  
  <!-- Delete Collection Confirmation Dialog -->
  <v-dialog v-model="showDeleteCollectionDialog" max-width="500" data-test="delete-collection-dialog">
    <v-card>
      <v-card-title class="text-h5">
        Delete Collection?
      </v-card-title>
      <v-card-text>
        <p>Are you sure you want to delete the collection "{{ configuration?.file_name }}"?</p>
        <p class="text-caption text-medium-emphasis">
          This will permanently delete the configuration and all its versions. This action cannot be undone.
        </p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="showDeleteCollectionDialog = false" data-test="delete-collection-cancel-btn">Cancel</v-btn>
        <v-btn color="error" @click="confirmDeleteCollection" data-test="delete-collection-confirm-btn">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEventState } from '@/composables/useEventState'
import { useNewVersion } from '@/composables/useNewVersion'
import { useEvents } from '@/composables/useEvents'
import { useConfig } from '@/composables/useConfig'
import { apiService } from '@/utils/api'
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
  description: string
  versions: ConfigurationVersion[]
}

const route = useRoute()
const router = useRouter()
const { isReadOnly } = useConfig()

// New version functionality for enumerators
const { createNewEnumeratorVersion } = useNewVersion()

const loading = ref(false)
const saving = ref(false)
const processing = ref(false)
const error = ref<string | null>(null)
const configuration = ref<Configuration | null>(null)
const activeVersion = ref<string>('')
const showNewVersionDialog = ref(false)
const showDeleteCollectionDialog = ref(false)
const newVersion = ref({
  major: 0,
  minor: 0,
  patch: 0,
  enumerators: 0
})

// Computed properties
const sortedVersions = computed(() => {
  if (!configuration.value?.versions) return []
  return configuration.value.versions.map(v => v.version) // Use natural order from API
})

const activeVersionData = computed(() => {
  if (!configuration.value || !activeVersion.value) return null
  return configuration.value.versions.find(v => v.version === activeVersion.value)
})

const hasPreviousVersion = computed(() => {
  if (!configuration.value || !activeVersion.value) return false
  const currentIndex = sortedVersions.value.findIndex(v => v === activeVersion.value)
  return currentIndex > 0
})

const hasNextVersion = computed(() => {
  if (!configuration.value || !activeVersion.value) return false
  const currentIndex = sortedVersions.value.findIndex(v => v === activeVersion.value)
  return currentIndex < sortedVersions.value.length - 1
})


const newVersionString = computed(() => {
  return `${newVersion.value.major}.${newVersion.value.minor}.${newVersion.value.patch}.${newVersion.value.enumerators}`
})

// Remove unused computed properties
// const dictionaryFileName = computed(() => {
//   if (!configuration.value || !configuration.value.versions || configuration.value.versions.length === 0) {
//     return null
//   }
//   const currentVersion = configuration.value.versions[configuration.value.versions.length - 1]
//   return currentVersion.dictionary
// })

// const enumerationsFileName = computed(() => {
//   if (!configuration.value || !configuration.value.versions || configuration.value.versions.length === 0) {
//     return null
//   }
//   const currentVersion = configuration.value.versions[configuration.value.versions.length - 1]
//   return currentVersion.enumerators
// })



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
  if (!configuration.value || isReadOnly.value) return
  
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

const handleDescriptionChange = () => {
  autoSave()
}






const processAllVersions = async () => {
  if (!configuration.value) return
  
  processing.value = true
  error.value = null
  
  try {
    const result = await apiService.processConfiguration(configuration.value.file_name)
    
    // Handle array of events or single event - clear old state and set new state
    if (Array.isArray(result) && result.length > 0) {
      // API returned an array of events
      const { clearEventViewerState, setEventViewerState } = useEventState()
      clearEventViewerState() // Clear old state before setting new
      setEventViewerState(result[0], 'Configuration Processed', 'Configuration processing completed')
      router.push('/event-viewer')
    } else if (result && result.id && result.type && result.status) {
      // API returned a single event
      const { clearEventViewerState, setEventViewerState } = useEventState()
      clearEventViewerState() // Clear old state before setting new
      setEventViewerState(result, 'Configuration Processed', 'Configuration processing completed')
      router.push('/event-viewer')
    } else {
      // No event data, navigate to event viewer anyway
      router.push('/event-viewer')
    }
    
    // Reload configuration to get updated status
    await loadConfiguration()
  } catch (err: any) {
    console.error('Failed to process configuration:', err)
    
    // Handle API errors with event data - navigate to event viewer for errors
    if (err.type === 'API_ERROR' && err.data) {
      if (err.data.id && err.data.type && err.data.status) {
        // Clear any existing event state and set error event data in global state
        const { clearEventViewerState, setEventViewerState } = useEventState()
        clearEventViewerState() // Clear old state before setting new
        setEventViewerState(err.data, 'Process Configuration Error', 'Failed to process configuration')
        router.push('/event-viewer')
      } else {
        // No event data in error, just navigate to event viewer
        router.push('/event-viewer')
      }
    } else {
      // Generic error, navigate to event viewer
      router.push('/event-viewer')
    }
  } finally {
    processing.value = false
  }
}

const downloadJsonSchema = async (version: string) => {
  if (!configuration.value) return
  
  const { showEvent, showError } = useEvents()
  
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
    console.error('Failed to download JSON schema:', err)
    
    // Helper function to parse blob as JSON event
    const parseBlobEvent = async (blob: Blob): Promise<any | null> => {
      try {
        const text = await blob.text()
        const eventData = JSON.parse(text)
        if (eventData.id && eventData.type && eventData.status) {
          return eventData
        }
      } catch (parseErr) {
        // Not valid JSON or not an event structure
      }
      return null
    }
    
    // Handle blob error responses - need to parse blob as JSON
    if (err.response && err.response.data instanceof Blob) {
      const eventData = await parseBlobEvent(err.response.data)
      if (eventData) {
        showEvent(eventData, 'JSON Schema Generation Error', 'Failed to generate JSON schema')
      } else {
        showError('Failed to download JSON schema', 'JSON Schema Generation Error')
      }
    } 
    // Handle API errors with event data (from interceptor, may be a Blob)
    else if (err.type === 'API_ERROR' && err.data) {
      if (err.data instanceof Blob) {
        const eventData = await parseBlobEvent(err.data)
        if (eventData) {
          showEvent(eventData, 'JSON Schema Generation Error', 'Failed to generate JSON schema')
        } else {
          showError('Failed to download JSON schema', 'JSON Schema Generation Error')
        }
      } else if (err.data.id && err.data.type && err.data.status) {
        showEvent(err.data, 'JSON Schema Generation Error', 'Failed to generate JSON schema')
      } else {
        showError(err.message || 'Failed to download JSON schema', 'JSON Schema Generation Error')
      }
    } 
    // Generic error
    else {
      showError(err.message || 'Failed to download JSON schema', 'JSON Schema Generation Error')
    }
  }
}

const downloadBsonSchema = async (version: string) => {
  if (!configuration.value) return
  
  const { showEvent, showError } = useEvents()
  
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
    console.error('Failed to download BSON schema:', err)
    
    // Helper function to parse blob as JSON event
    const parseBlobEvent = async (blob: Blob): Promise<any | null> => {
      try {
        const text = await blob.text()
        const eventData = JSON.parse(text)
        if (eventData.id && eventData.type && eventData.status) {
          return eventData
        }
      } catch (parseErr) {
        // Not valid JSON or not an event structure
      }
      return null
    }
    
    // Handle blob error responses - need to parse blob as JSON
    if (err.response && err.response.data instanceof Blob) {
      const eventData = await parseBlobEvent(err.response.data)
      if (eventData) {
        showEvent(eventData, 'BSON Schema Generation Error', 'Failed to generate BSON schema')
      } else {
        showError('Failed to download BSON schema', 'BSON Schema Generation Error')
      }
    } 
    // Handle API errors with event data (from interceptor, may be a Blob)
    else if (err.type === 'API_ERROR' && err.data) {
      if (err.data instanceof Blob) {
        const eventData = await parseBlobEvent(err.data)
        if (eventData) {
          showEvent(eventData, 'BSON Schema Generation Error', 'Failed to generate BSON schema')
        } else {
          showError('Failed to download BSON schema', 'BSON Schema Generation Error')
        }
      } else if (err.data.id && err.data.type && err.data.status) {
        showEvent(err.data, 'BSON Schema Generation Error', 'Failed to generate BSON schema')
      } else {
        showError(err.message || 'Failed to download BSON schema', 'BSON Schema Generation Error')
      }
    } 
    // Generic error
    else {
      showError(err.message || 'Failed to download BSON schema', 'BSON Schema Generation Error')
    }
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

const incrementVersion = (type: 'major' | 'minor' | 'patch' | 'enumerators') => {
  if (type === 'major') {
    newVersion.value.major++
    newVersion.value.minor = 0
    newVersion.value.patch = 0
  } else if (type === 'minor') {
    newVersion.value.minor++
    newVersion.value.patch = 0
  } else if (type === 'patch') {
    newVersion.value.patch++
  } else if (type === 'enumerators') {
    newVersion.value.enumerators++
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
    
    // Create test data filename for the new version
    const baseName = configuration.value.file_name.replace('.yaml', '')
    const versionParts = versionString.split('.')
    const testDataFileName = versionParts.length >= 4 
      ? `${baseName}.${versionParts[0]}.${versionParts[1]}.${versionParts[2]}.${versionParts[3]}.json`
      : ''
    
    // Create new version object
    const newVersionObj: ConfigurationVersion = {
      version: versionString,
      _locked: false,
      test_data: testDataFileName
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
    
    // Create new test data file for the new version
    try {
      if (testDataFileName) {
        // Create empty test data array
        const newTestData: any[] = []
        
        // Save the new test data file
        await apiService.saveTestDataFile(testDataFileName, newTestData)
        
        console.log(`Test data file created: ${testDataFileName}`)
      }
    } catch (err: any) {
      console.log(`Failed to create test data file for new version: ${err.message}`)
    }

    // Create new enumerators file if enumerators version changed
    try {
      const versionParts = versionString.split('.')
      
      if (versionParts.length >= 4 && previousLatestVersion) {
        const oldVersionParts = previousLatestVersion.version.split('.')
        const newEnumeratorsVersion = versionParts[3] // enumerators version is the 4th part
        const oldEnumeratorsVersion = oldVersionParts.length >= 4 ? oldVersionParts[3] : '0'
        
        // Only create new enumerators version if the enumerators version actually changed
        if (newEnumeratorsVersion !== oldEnumeratorsVersion) {
          const enumeratorsFileName = `enumerations.${newEnumeratorsVersion}.yaml`
          
          // Use unified new version logic to create enumerators file
          // This will find the newest enumerator version, lock it, and create a new version
          await createNewEnumeratorVersion()
          
          console.log(`Enumerators file created using unified logic: ${enumeratorsFileName}`)
        } else {
          console.log(`Enumerators version unchanged (${newEnumeratorsVersion}), skipping enumerators file creation`)
        }
      }
    } catch (err: any) {
      console.log(`Failed to create enumerators file for new version: ${err.message}`)
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
  
  // If this is the only version, show delete collection confirmation instead
  if (configuration.value.versions.length <= 1) {
    showDeleteCollectionDialog.value = true
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

const confirmDeleteCollection = async () => {
  if (!configuration.value) return
  
  try {
    // Call the DELETE endpoint to remove the configuration
    await apiService.deleteConfiguration(configuration.value.file_name)
    
    // Close the dialog
    showDeleteCollectionDialog.value = false
    
    // Navigate back to configurations list
    router.push('/configurations')
  } catch (err: any) {
    error.value = err.message || 'Failed to delete collection'
    console.error('Failed to delete collection:', err)
  }
}

const navigateToPreviousVersion = () => {
  console.log('navigateToPreviousVersion called')
  console.log('configuration.value:', configuration.value)
  console.log('activeVersion.value:', activeVersion.value)
  console.log('sortedVersions.value:', sortedVersions.value)
  
  if (!configuration.value || !activeVersion.value) {
    console.log('Early return - missing configuration or activeVersion')
    return
  }
  
  const currentIndex = sortedVersions.value.findIndex(v => v === activeVersion.value)
  console.log('currentIndex:', currentIndex)
  
  if (currentIndex > 0) {
    const previousVersion = sortedVersions.value[currentIndex - 1]
    console.log('Setting activeVersion to previous version:', previousVersion)
    activeVersion.value = previousVersion
  } else {
    console.log('No previous version available')
  }
}

const navigateToNextVersion = () => {
  console.log('navigateToNextVersion called')
  console.log('configuration.value:', configuration.value)
  console.log('activeVersion.value:', activeVersion.value)
  console.log('sortedVersions.value:', sortedVersions.value)
  
  if (!configuration.value || !activeVersion.value) {
    console.log('Early return - missing configuration or activeVersion')
    return
  }
  
  const currentIndex = sortedVersions.value.findIndex(v => v === activeVersion.value)
  console.log('currentIndex:', currentIndex)
  
  if (currentIndex < sortedVersions.value.length - 1) {
    const nextVersion = sortedVersions.value[currentIndex + 1]
    console.log('Setting activeVersion to next version:', nextVersion)
    activeVersion.value = nextVersion
  } else {
    console.log('No next version available')
  }
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

.h1-style :deep(.v-field__input) {
  font-size: 1.5rem !important;
  font-weight: 400 !important;
  line-height: 1.3 !important;
  color: rgba(0, 0, 0, 0.87) !important;
  padding: 0 !important;
  white-space: pre-wrap !important;
  word-wrap: break-word !important;
}

.h1-style :deep(textarea) {
  font-size: 1.5rem !important;
  font-weight: 400 !important;
  line-height: 1.3 !important;
  color: rgba(0, 0, 0, 0.87) !important;
  white-space: pre-wrap !important;
  word-wrap: break-word !important;
  overflow-wrap: break-word !important;
}

.h1-style :deep(.v-field) {
  padding: 0 !important;
  min-height: auto !important;
}

.h1-style :deep(.v-field__outline) {
  display: none !important;
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

.version-display-value {
  min-width: 60px;
  padding: 8px 12px;
  background-color: rgba(var(--v-theme-surface), 0.8);
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  border-radius: 4px;
  text-align: center;
  font-weight: 600;
  font-size: 1.1rem;
  color: rgba(var(--v-theme-on-surface), 0.87);
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


.cursor-pointer {
  cursor: pointer;
}

/* New Version Button Styling */
.new-version-btn {
  background-color: var(--v-theme-primary) !important;
  color: white !important;
  font-weight: 600 !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
  border: 2px solid var(--v-theme-primary) !important;
}

.new-version-btn:hover {
  background-color: var(--v-theme-primary-darken-1) !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
  transition: all 0.2s ease !important;
}
</style> 