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

    <!-- Configuration detail -->
    <div v-else-if="configuration">
      <!-- Header -->
      <div class="d-flex justify-space-between align-center mb-6">
        <div>
          <h1 class="text-h4">{{ configuration.title }}</h1>
          <p class="text-body-1 text-medium-emphasis">{{ configuration.description }}</p>
        </div>
        <div class="d-flex align-center">
          <v-chip
            v-if="configuration._locked"
            color="warning"
            class="mr-2"
          >
            Locked
          </v-chip>
          <v-btn
            color="primary"
            @click="saveConfiguration"
            :loading="saving"
            :disabled="configuration._locked"
            class="mr-2"
          >
            <v-icon start>mdi-content-save</v-icon>
            Save
          </v-btn>
          <v-btn
            color="secondary"
            @click="processConfiguration"
            :loading="processing"
          >
            <v-icon start>mdi-cog</v-icon>
            Process
          </v-btn>
        </div>
      </div>

      <!-- Configuration editing -->
      <v-card class="mb-6">
        <v-card-title>Configuration Settings</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="configuration.title"
                label="Title"
                :disabled="configuration._locked"
                @update:model-value="autoSave"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="configuration.description"
                label="Description"
                :disabled="configuration._locked"
                @update:model-value="autoSave"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Version tabs -->
      <v-tabs v-model="activeVersion" class="mb-6">
        <v-tab
          v-for="version in configuration.versions"
          :key="version.version"
          :value="version.version"
        >
          {{ version.version }}
        </v-tab>
      </v-tabs>

      <!-- Version content -->
      <div v-if="activeVersion">
        <v-card class="mb-4">
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Version {{ activeVersion }}</span>
            <div>
              <v-btn
                size="small"
                variant="outlined"
                @click="downloadJsonSchema"
                class="mr-2"
              >
                <v-icon start>mdi-download</v-icon>
                JSON Schema
              </v-btn>
              <v-btn
                size="small"
                variant="outlined"
                @click="downloadBsonSchema"
              >
                <v-icon start>mdi-download</v-icon>
                BSON Schema
              </v-btn>
            </div>
          </v-card-title>

          <v-card-text>
            <!-- Test Data -->
            <div class="mb-4">
              <h3 class="text-h6 mb-2">Test Data</h3>
              <v-text-field
                v-model="getCurrentVersion().test_data"
                label="Test Data File"
                :disabled="configuration._locked"
                @update:model-value="autoSave"
                placeholder="sample.1.0.0.1.json"
              />
            </div>

            <!-- Add Indexes -->
            <div class="mb-4">
              <h3 class="text-h6 mb-2">Add Indexes</h3>
              <v-textarea
                v-model="indexesJson"
                label="Indexes JSON"
                rows="8"
                auto-grow
                :disabled="configuration._locked"
                @update:model-value="updateIndexes"
                :error="!!indexesError"
                :error-messages="indexesError || undefined"
                placeholder='[
  {
    "name": "idx_field_name",
    "key": {
      "field_name": 1
    },
    "options": {
      "unique": true
    }
  }
]'
              />
            </div>

            <!-- Drop Indexes -->
            <div class="mb-4">
              <h3 class="text-h6 mb-2">Drop Indexes</h3>
              <v-textarea
                v-model="dropIndexesJson"
                label="Drop Indexes JSON"
                rows="4"
                auto-grow
                :disabled="configuration._locked"
                @update:model-value="updateDropIndexes"
                :error="!!dropIndexesError"
                :error-messages="dropIndexesError || undefined"
                placeholder='[
  {
    "name": "idx_old_field"
  }
]'
              />
            </div>

            <!-- Migrations -->
            <div class="mb-4">
              <h3 class="text-h6 mb-2">Migrations</h3>
              <v-textarea
                v-model="migrationsJson"
                label="Migrations JSON"
                rows="4"
                auto-grow
                :disabled="configuration._locked"
                @update:model-value="updateMigrations"
                :error="!!migrationsError"
                :error-messages="migrationsError || undefined"
                placeholder='[
  "migration_file.json"
]'
              />
            </div>
          </v-card-text>
        </v-card>
      </div>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { apiService } from '@/utils/api'

interface ConfigurationVersion {
  version: string
  test_data: string
  add_indexes: Array<{
    name: string
    key: Record<string, number>
    options?: Record<string, any>
  }>
  drop_indexes: Array<{
    name: string
  }>
  migrations: string[]
}

interface Configuration {
  title: string
  description: string
  file_name: string
  _locked: boolean
  versions: ConfigurationVersion[]
}

const route = useRoute()
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const configuration = ref<Configuration | null>(null)
const activeVersion = ref<string>('')
const processing = ref(false)

// JSON editor states
const indexesJson = ref('')
const dropIndexesJson = ref('')
const migrationsJson = ref('')
const indexesError = ref<string | null>(null)
const dropIndexesError = ref<string | null>(null)
const migrationsError = ref<string | null>(null)

// Load configuration data
const loadConfiguration = async () => {
  loading.value = true
  error.value = null
  
  try {
    const fileName = route.params.fileName as string
    const data = await apiService.getConfiguration(fileName)
    configuration.value = data
    
    // Set active version to the first one
    if (data.versions && data.versions.length > 0) {
      activeVersion.value = data.versions[0].version
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load configuration'
    console.error('Failed to load configuration:', err)
  } finally {
    loading.value = false
  }
}

// Get current version data
const getCurrentVersion = (): ConfigurationVersion => {
  return configuration.value?.versions.find(v => v.version === activeVersion.value) || {
    version: '',
    test_data: '',
    add_indexes: [],
    drop_indexes: [],
    migrations: []
  }
}

// Update JSON editors when version changes
watch(activeVersion, () => {
  const version = getCurrentVersion()
  indexesJson.value = JSON.stringify(version.add_indexes, null, 2)
  dropIndexesJson.value = JSON.stringify(version.drop_indexes, null, 2)
  migrationsJson.value = JSON.stringify(version.migrations, null, 2)
  // Clear errors
  indexesError.value = null
  dropIndexesError.value = null
  migrationsError.value = null
})

// Update indexes from JSON
const updateIndexes = () => {
  try {
    const parsed = JSON.parse(indexesJson.value)
    if (!Array.isArray(parsed)) {
      indexesError.value = 'Must be an array'
      return
    }
    getCurrentVersion().add_indexes = parsed
    indexesError.value = null
    autoSave()
  } catch (err: any) {
    indexesError.value = 'Invalid JSON format'
  }
}

// Update drop indexes from JSON
const updateDropIndexes = () => {
  try {
    const parsed = JSON.parse(dropIndexesJson.value)
    if (!Array.isArray(parsed)) {
      dropIndexesError.value = 'Must be an array'
      return
    }
    getCurrentVersion().drop_indexes = parsed
    dropIndexesError.value = null
    autoSave()
  } catch (err: any) {
    dropIndexesError.value = 'Invalid JSON format'
  }
}

// Update migrations from JSON
const updateMigrations = () => {
  try {
    const parsed = JSON.parse(migrationsJson.value)
    if (!Array.isArray(parsed)) {
      migrationsError.value = 'Must be an array'
      return
    }
    getCurrentVersion().migrations = parsed
    migrationsError.value = null
    autoSave()
  } catch (err: any) {
    migrationsError.value = 'Invalid JSON format'
  }
}

// Auto-save functionality
const autoSave = async () => {
  if (!configuration.value || configuration.value._locked) return
  
  saving.value = true
  try {
    await apiService.saveConfiguration(configuration.value.file_name, configuration.value)
  } catch (err: any) {
    error.value = err.message || 'Failed to save configuration'
    console.error('Failed to save configuration:', err)
  } finally {
    saving.value = false
  }
}

// Manual save
const saveConfiguration = async () => {
  if (!configuration.value) return
  
  saving.value = true
  try {
    await apiService.saveConfiguration(configuration.value.file_name, configuration.value)
    // Could add success notification here
  } catch (err: any) {
    error.value = err.message || 'Failed to save configuration'
    console.error('Failed to save configuration:', err)
  } finally {
    saving.value = false
  }
}

// Process configuration
const processConfiguration = async () => {
  if (!configuration.value) return
  
  processing.value = true
  try {
    await apiService.processConfiguration(configuration.value.file_name)
    // Could add success notification here
  } catch (err: any) {
    error.value = err.message || 'Failed to process configuration'
    console.error('Failed to process configuration:', err)
  } finally {
    processing.value = false
  }
}

// Download schema functions
const downloadJsonSchema = async () => {
  if (!configuration.value || !activeVersion.value) return
  
  try {
    const blob = await apiService.downloadJsonSchema(configuration.value.file_name, activeVersion.value)
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${configuration.value.file_name}_${activeVersion.value}_schema.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  } catch (err: any) {
    error.value = err.message || 'Failed to download JSON schema'
    console.error('Failed to download JSON schema:', err)
  }
}

const downloadBsonSchema = async () => {
  if (!configuration.value || !activeVersion.value) return
  
  try {
    const blob = await apiService.downloadBsonSchema(configuration.value.file_name, activeVersion.value)
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${configuration.value.file_name}_${activeVersion.value}_schema.bson`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
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