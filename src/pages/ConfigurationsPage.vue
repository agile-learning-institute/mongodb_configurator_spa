<template>
  <v-container>
    <div class="d-flex justify-space-between align-center mb-6">
      <h3 data-test="page-title">Collection Configurations</h3>
      <div class="d-flex align-center gap-2">
        <v-btn
          color="primary"
          variant="elevated"
          prepend-icon="mdi-plus"
          @click="showNewCollectionDialog = true"
          data-test="new-collection-btn"
        >
          New
        </v-btn>
        <v-btn
          v-if="canLockAll"
          color="info"
          variant="outlined"
          prepend-icon="mdi-lock"
          @click="handleLockAll"
          :loading="locking"
          data-test="lock-all-btn"
        >
          Lock All
        </v-btn>
      </div>
    </div>
    
    <FileList 
      ref="fileListRef"
      file-type="configurations"
      @edit="handleEdit"
      @open="handleOpen"
      data-test="configurations-file-list"
    />

    <!-- New Collection Dialog -->
    <v-dialog v-model="showNewCollectionDialog" max-width="600px" data-test="new-collection-dialog">
      <v-card>
        <v-card-title class="text-h5 pa-6 pb-4" data-test="new-collection-dialog-title">
          <v-icon start color="primary" class="mr-2">mdi-plus-circle</v-icon>
          Create New Collection
        </v-card-title>
        <v-card-text class="pa-6 pt-0">
          <div class="d-flex flex-column gap-6">
            <!-- Collection Name -->
            <div>
              <h4 class="text-subtitle-1 font-weight-medium mb-4 text-medium-emphasis">Collection Details</h4>
              <v-text-field
                v-model="newCollectionName"
                label="Collection Name"
                :error="!!nameError"
                :error-messages="nameError || undefined"
                placeholder="my_collection"
                :disabled="creating"
                @keyup.enter="createCollection"
                variant="outlined"
                density="compact"
                data-test="new-collection-name-input"
              />
              <p class="text-caption text-medium-emphasis mt-2" data-test="new-collection-help-text">
                Collection names must start with a letter and contain only letters, numbers, and underscores.
              </p>
            </div>

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
                    @click="newVersion.major++"
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
                    @click="newVersion.minor++"
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
                    @click="newVersion.patch++"
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
                <span class="text-body-2 text-medium-emphasis">Version: </span>
                <span class="text-h5 font-weight-bold text-primary">{{ newVersionString }}.X</span>
                <div class="text-caption text-medium-emphasis mt-2">
                  Enumerators version will be automatically set to the newest available version
                </div>
              </div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn
            @click="showNewCollectionDialog = false"
            :disabled="creating"
            data-test="new-collection-cancel-btn"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="createCollection"
            :loading="creating"
            :disabled="!newCollectionName.trim()"
            data-test="new-collection-create-btn"
          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Error Snackbar -->
    <v-snackbar
      v-model="showErrorSnackbar"
      color="error"
      timeout="5000"
      data-test="error-snackbar"
    >
      {{ errorMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { apiService } from '@/utils/api'
import FileList from '@/components/FileList.vue'

const router = useRouter()
const fileListRef = ref()

// New collection dialog state
const showNewCollectionDialog = ref(false)
const newCollectionName = ref('')
const nameError = ref<string | null>(null)
const creating = ref(false)

// Version state for new collection
const newVersion = ref({
  major: 0,
  minor: 0,
  patch: 0,
})

const newVersionString = computed(() => {
  return `${newVersion.value.major}.${newVersion.value.minor}.${newVersion.value.patch}`
})

// Snackbar states
const showErrorSnackbar = ref(false)
const errorMessage = ref('')

// Lock all functionality
const canLockAll = ref(false)
const locking = ref(false)

const handleEdit = (fileName: string) => {
  router.push(`/configurations/${fileName}`)
}

const handleOpen = (fileName: string) => {
  router.push(`/configurations/${fileName}`)
}

const handleLockAll = async () => {
  if (fileListRef.value) {
    locking.value = true
    try {
      await fileListRef.value.handleLockAll()
    } finally {
      locking.value = false
    }
  }
}

// Initialize canLockAll when component mounts
onMounted(() => {
  // Wait for next tick to ensure FileList is mounted
  setTimeout(() => {
    if (fileListRef.value) {
      canLockAll.value = fileListRef.value.canLockAll
    }
  }, 100)
})

// Validate collection name
const validateCollectionName = (name: string): boolean => {
  const pattern = /^[a-zA-Z][a-zA-Z0-9_]*$/
  if (!pattern.test(name)) {
    nameError.value = 'Collection name must start with a letter and contain only letters, numbers, and underscores'
    return false
  }
  nameError.value = null
  return true
}

// Create new collection using PUT endpoints
const createCollection = async () => {
  const name = newCollectionName.value.trim()
  
  if (!name) {
    nameError.value = 'Collection name is required'
    return
  }

  if (!validateCollectionName(name)) {
    return
  }

  creating.value = true
  try {
    // Get the newest enumerator version
    const enumeratorFiles = await apiService.getEnumerators()
    let newestEnumeratorVersion = 0
    
    if (enumeratorFiles && enumeratorFiles.length > 0) {
      // Filter out any files that don't have the expected structure
      const validFiles = enumeratorFiles.filter((f: any) => f && f.file_name && typeof f.file_name === 'string')
      
      if (validFiles.length > 0) {
        const versions = validFiles
          .map((f: any) => {
            const match = f.file_name.match(/enumerations\.(\d+)\.yaml/)
            return match ? parseInt(match[1], 10) : 0
          })
          .filter((version: number) => !isNaN(version))
        
        newestEnumeratorVersion = versions.length > 0 ? Math.max(...versions) : 0
      }
    }
    
    const version = `${newVersion.value.major}.${newVersion.value.minor}.${newVersion.value.patch}.${newestEnumeratorVersion}`
    const configFileName = `${name}.yaml`
    
    // Create configuration file
    const configuration = {
      file_name: configFileName,
      title: name,
      description: `Configuration for ${name} collection`,
      versions: [{
        version: version,
        dictionary: `${name}.${newVersion.value.major}.${newVersion.value.minor}.${newVersion.value.patch}.yaml`,
        enumerators: `enumerations.${newestEnumeratorVersion}.yaml`,
        indexes: [],
        migrations: []
      }]
    }
    
    // Create dictionary file
    const dictionary = {
      root: {
        name: ""
      }
    }
    
    // Create test data file
    const testData: any[] = []
    
    // Save all files using PUT endpoints
    await apiService.saveConfiguration(configFileName, configuration)
    await apiService.saveDictionary(`${name}.${newVersion.value.major}.${newVersion.value.minor}.${newVersion.value.patch}.yaml`, dictionary)
    await apiService.saveTestDataFile(`${name}.${newVersion.value.major}.${newVersion.value.minor}.${newVersion.value.patch}.yaml`, testData)
    
    // Close dialog and reset
    showNewCollectionDialog.value = false
    newCollectionName.value = ''
    nameError.value = null
    newVersion.value = { major: 0, minor: 0, patch: 0 }
    
    // Navigate to the new collection's detail page
    router.push(`/configurations/${configFileName}`)
    
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to create collection'
    showErrorSnackbar.value = true
  } finally {
    creating.value = false
  }
}
</script>

<style scoped>
.version-components {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  background-color: #fafafa;
}

.version-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.version-label {
  flex: 1;
}

.version-controls {
  display: flex;
  align-items: center;
}

.version-input {
  width: 80px;
}

.version-preview {
  text-align: center;
}

.version-display {
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 8px;
}
</style> 