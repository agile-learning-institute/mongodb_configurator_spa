<template>
  <v-dialog v-model="showDialog" max-width="600px" data-test="new-collection-dialog">
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

          <!-- Collection Description -->
          <div>
            <v-text-field
              v-model="newCollectionDescription"
              label="Collection Description"
              placeholder="Describe the purpose of this collection"
              :disabled="creating"
              variant="outlined"
              density="compact"
              data-test="new-collection-description-input"
            />
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
                <div class="version-display-value" data-test="version-major-display">{{ newVersion.major }}</div>
                <v-btn
                  icon="mdi-plus"
                  variant="text"
                  size="small"
                  @click="incrementMajorVersion"
                  :disabled="creating"
                  data-test="version-major-plus-btn"
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
                <div class="version-display-value" data-test="version-minor-display">{{ newVersion.minor }}</div>
                <v-btn
                  icon="mdi-plus"
                  variant="text"
                  size="small"
                  @click="incrementMinorVersion"
                  :disabled="creating"
                  data-test="version-minor-plus-btn"
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
                <div class="version-display-value" data-test="version-patch-display">{{ newVersion.patch }}</div>
                <v-btn
                  icon="mdi-plus"
                  variant="text"
                  size="small"
                  @click="incrementPatchVersion"
                  :disabled="creating"
                  data-test="version-patch-plus-btn"
                />
              </div>
            </div>

            <!-- Version Preview -->
            <div class="version-preview" data-test="version-preview">
              <div class="text-caption text-medium-emphasis mb-2">Final Version:</div>
              <div class="version-display" data-test="version-display">
                <span class="text-h6 font-weight-bold">{{ newVersionString }}</span>
                <span class="text-caption text-medium-emphasis d-block">+ enumerator version</span>
              </div>
              <div v-if="!isVersionValid" class="text-caption text-error mt-2" data-test="version-warning">
                ⚠️ Version must be greater than 0.0.0
              </div>
            </div>
          </div>
        </div>
      </v-card-text>
      <v-card-actions class="pa-6 pt-0">
        <v-spacer />
        <v-btn
          @click="closeDialog"
          :disabled="creating"
          data-test="new-collection-cancel-btn"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          @click="createCollection"
          :loading="creating"
          :disabled="!newCollectionName.trim() || !isVersionValid"
          data-test="new-collection-create-btn"
        >
          Create
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { apiService } from '@/utils/api'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'created', fileName: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// New collection dialog state
const newCollectionName = ref('')
const newCollectionDescription = ref('')
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

// Check if version is valid (not 0.0.0)
const isVersionValid = computed(() => {
  return !(newVersion.value.major === 0 && newVersion.value.minor === 0 && newVersion.value.patch === 0)
})

// Computed property for dialog visibility
const showDialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Watch for dialog open to reset form
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    resetForm()
  }
})

// Version increment functions with patch logic
const incrementMajorVersion = () => {
  newVersion.value.major++
  newVersion.value.minor = 0
  newVersion.value.patch = 0
}

const incrementMinorVersion = () => {
  newVersion.value.minor++
  newVersion.value.patch = 0
}

const incrementPatchVersion = () => {
  newVersion.value.patch++
}

// Reset form to initial state
const resetForm = () => {
  newCollectionName.value = ''
  newCollectionDescription.value = ''
  nameError.value = null
  newVersion.value = { major: 0, minor: 0, patch: 0 }
}

// Close dialog
const closeDialog = () => {
  emit('update:modelValue', false)
}

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
      description: newCollectionDescription.value || `Configuration for ${name} collection`,
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
        name: "root",
        type: "object",
        description: newCollectionDescription.value || `Dictionary for ${name} collection`,
        properties: [
          {"name": "_id", "type": "identifier"},
          {"name": "name", "type": "word"},
          {"name": "last_saved", "type": "breadcrumb"}
        ]
      }
    }
    
    // Create test data file
    const testData: any[] = []
    
    // Save all files using PUT endpoints
    await apiService.saveConfiguration(configFileName, configuration)
    await apiService.saveDictionary(`${name}.${newVersion.value.major}.${newVersion.value.minor}.${newVersion.value.patch}.yaml`, dictionary)
    await apiService.saveTestDataFile(`${name}.${newVersion.value.major}.${newVersion.value.minor}.${newVersion.value.patch}.${newestEnumeratorVersion}.json`, testData)
    
    // Close dialog and reset
    closeDialog()
    resetForm()
    
    // Emit created event with the file name
    emit('created', configFileName)
    
  } catch (err: any) {
    nameError.value = err.message || 'Failed to create collection'
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

.version-display-value {
  width: 80px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1.1rem;
  font-weight: 500;
  color: #333;
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
