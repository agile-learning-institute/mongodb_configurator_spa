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
            @click="processConfiguration"
            :loading="processing"
          >
            <v-icon start>mdi-cog</v-icon>
            Process
          </v-btn>
        </div>
      </div>

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
              <v-chip color="primary">{{ getCurrentVersion().test_data }}</v-chip>
            </div>

            <!-- Indexes -->
            <div class="mb-4">
              <h3 class="text-h6 mb-2">Add Indexes</h3>
              <v-expansion-panels>
                <v-expansion-panel
                  v-for="(index, indexKey) in getCurrentVersion().add_indexes"
                  :key="indexKey"
                >
                  <v-expansion-panel-title>
                    {{ index.name }}
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-card variant="outlined" class="pa-3">
                      <div class="mb-2">
                        <strong>Keys:</strong>
                        <pre class="mt-1">{{ JSON.stringify(index.key, null, 2) }}</pre>
                      </div>
                      <div v-if="index.options">
                        <strong>Options:</strong>
                        <pre class="mt-1">{{ JSON.stringify(index.options, null, 2) }}</pre>
                      </div>
                    </v-card>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </div>

            <!-- Drop Indexes -->
            <div v-if="getCurrentVersion().drop_indexes.length > 0" class="mb-4">
              <h3 class="text-h6 mb-2">Drop Indexes</h3>
              <v-chip
                v-for="index in getCurrentVersion().drop_indexes"
                :key="index.name"
                color="error"
                class="mr-2 mb-2"
              >
                {{ index.name }}
              </v-chip>
            </div>

            <!-- Migrations -->
            <div v-if="getCurrentVersion().migrations.length > 0" class="mb-4">
              <h3 class="text-h6 mb-2">Migrations</h3>
              <v-chip
                v-for="migration in getCurrentVersion().migrations"
                :key="migration"
                color="info"
                class="mr-2 mb-2"
              >
                {{ migration }}
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
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
const error = ref<string | null>(null)
const configuration = ref<Configuration | null>(null)
const activeVersion = ref<string>('')
const processing = ref(false)

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