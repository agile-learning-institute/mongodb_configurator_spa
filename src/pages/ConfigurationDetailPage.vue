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
        <!-- Version Wrapper Card -->
        <FileCard
          :file="{ name: `Version ${activeVersion}`, created_at: '', updated_at: '', size: 0 }"
          file-type="configuration"
          :show-edit="false"
          :show-delete="false"
          :show-lock="false"
          :show-actions="false"
          :is-section-card="true"
          :expanded="true"
          class="mb-4"
        >
          <template #actions>
            <v-btn
              icon
              size="small"
              variant="text"
              color="white"
              @click="downloadJsonSchema"
              :disabled="configuration._locked"
              title="Download JSON Schema"
            >
              <v-icon size="18">mdi-download</v-icon>
            </v-btn>
            <v-btn
              icon
              size="small"
              variant="text"
              color="white"
              @click="downloadBsonSchema"
              :disabled="configuration._locked"
              title="Download BSON Schema"
            >
              <v-icon size="18">mdi-download</v-icon>
            </v-btn>
          </template>
          <template #default>
            <!-- Test Data Card -->
            <FileCard
              :file="{ name: 'Test Data', created_at: '', updated_at: '', size: 0 }"
              file-type="test-data"
              :show-edit="false"
              :show-delete="false"
              :show-lock="false"
              :show-actions="false"
              :is-section-card="true"
              :expanded="true"
              class="mb-4"
            >
              <template #actions>
                <v-menu
                  v-model="showTestDataMenu"
                  :close-on-content-click="false"
                  location="bottom end"
                >
                  <template v-slot:activator="{ props }">
                    <v-btn
                      icon
                      size="small"
                      variant="text"
                      color="white"
                      v-bind="props"
                      :disabled="configuration._locked"
                      title="Select Test Data"
                    >
                      <v-icon size="18">mdi-plus</v-icon>
                    </v-btn>
                  </template>
                  <v-list min-width="300">
                    <v-list-item
                      v-for="file in testDataFiles"
                      :key="file.name"
                      @click="selectTestData(file.name)"
                    >
                      <v-list-item-title>{{ file.name }}</v-list-item-title>
                    </v-list-item>
                    <v-divider />
                    <v-list-item @click="showNewTestDataDialog = true; showTestDataMenu = false">
                      <v-list-item-title class="text-primary">
                        <v-icon start size="small">mdi-plus</v-icon>
                        New Test Data File
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
                <v-btn
                  v-if="getCurrentVersion().test_data"
                  icon
                  size="small"
                  variant="text"
                  color="white"
                  @click="removeTestData"
                  :disabled="configuration._locked"
                  title="Clear Test Data"
                >
                  <v-icon size="18">mdi-close-circle</v-icon>
                </v-btn>
              </template>
              <template #default>
                <div v-if="getCurrentVersion().test_data" class="d-flex align-center">
                  <v-chip color="primary" class="mr-2">
                    {{ getCurrentVersion().test_data }}
                  </v-chip>
                </div>
                <div v-else class="text-medium-emphasis">
                  No test data file selected
                </div>
              </template>
            </FileCard>

            <!-- Add Indexes Card -->
            <FileCard
              :file="{ name: 'Add Indexes', created_at: '', updated_at: '', size: 0 }"
              file-type="configuration"
              :show-edit="false"
              :show-delete="false"
              :show-lock="false"
              :show-actions="false"
              :is-section-card="true"
              :show-expand="true"
              :expanded="indexesExpanded"
              class="mb-4"
              @toggle-expand="indexesExpanded = !indexesExpanded"
            >
              <template #actions>
                <v-btn
                  icon
                  size="small"
                  variant="text"
                  color="white"
                  @click="addNewIndex"
                  :disabled="configuration._locked"
                  title="Add Index"
                >
                  <v-icon size="18">mdi-plus</v-icon>
                </v-btn>
              </template>
              <template #default>
                <div v-if="!indexesExpanded" class="text-medium-emphasis">
                  <span v-if="getCurrentVersion().add_indexes.length > 0">
                    {{ getCurrentVersion().add_indexes.length }} index{{ getCurrentVersion().add_indexes.length === 1 ? '' : 'es' }} to add
                  </span>
                  <span v-else>
                    No indexes defined
                  </span>
                </div>
                <div v-else>
                  <div v-if="getCurrentVersion().add_indexes.length > 0">
                    <div
                      v-for="(index, indexIndex) in getCurrentVersion().add_indexes"
                      :key="indexIndex"
                      class="mb-4 pa-3 border rounded"
                    >
                      <div class="d-flex justify-end mb-2">
                        <v-btn
                          icon="mdi-delete"
                          size="small"
                          variant="text"
                          color="error"
                          @click="removeIndex(indexIndex)"
                          :disabled="configuration._locked"
                        />
                      </div>
                      <v-textarea
                        v-model="indexJsonStrings[indexIndex]"
                        label="Index JSON"
                        rows="4"
                        auto-grow
                        :disabled="configuration._locked"
                        @update:model-value="updateIndexFromJson(indexIndex)"
                        :error="!!indexJsonErrors[indexIndex]"
                        :error-messages="indexJsonErrors[indexIndex] || undefined"
                        placeholder='{
  "key": {
    "field_name": 1
  },
  "options": {
    "unique": true
  }
}'
                      />
                    </div>
                  </div>
                  <div v-else class="text-medium-emphasis">
                    No indexes defined
                  </div>
                </div>
              </template>
            </FileCard>

            <!-- Drop Indexes Card -->
            <FileCard
              :file="{ name: 'Drop Indexes', created_at: '', updated_at: '', size: 0 }"
              file-type="configuration"
              :show-edit="false"
              :show-delete="false"
              :show-lock="false"
              :show-actions="false"
              :is-section-card="true"
              :expanded="true"
              class="mb-4"
            >
              <template #actions>
                <v-menu
                  v-model="showDropIndexMenu"
                  :close-on-content-click="false"
                  location="bottom end"
                >
                  <template v-slot:activator="{ props }">
                    <v-btn
                      icon
                      size="small"
                      variant="text"
                      color="white"
                      v-bind="props"
                      :disabled="configuration._locked"
                      title="Add Drop Index"
                    >
                      <v-icon size="18">mdi-plus</v-icon>
                    </v-btn>
                  </template>
                  <v-card min-width="300">
                    <v-card-text>
                      <v-text-field
                        v-model="newDropIndex"
                        label="Index Name"
                        placeholder="idx_old_field"
                        :disabled="configuration._locked"
                        @keyup.enter="addDropIndex"
                      />
                      <div class="d-flex justify-end mt-2">
                        <v-btn
                          color="primary"
                          @click="addDropIndex"
                          :disabled="!newDropIndex.trim() || configuration._locked"
                          size="small"
                        >
                          Add
                        </v-btn>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-menu>
              </template>
              <template #default>
                <div v-if="getCurrentVersion().drop_indexes.length > 0" class="d-flex flex-wrap">
                  <v-chip
                    v-for="index in getCurrentVersion().drop_indexes"
                    :key="index.name"
                    color="error"
                    class="mr-2 mb-2"
                    closable
                    @click:close="removeDropIndex(index.name)"
                    :disabled="configuration._locked"
                  >
                    {{ index.name }}
                  </v-chip>
                </div>
                <div v-else class="text-medium-emphasis">
                  No indexes to drop
                </div>
              </template>
            </FileCard>

            <!-- Migrations Card -->
            <FileCard
              :file="{ name: 'Migrations', created_at: '', updated_at: '', size: 0 }"
              file-type="migration"
              :show-edit="false"
              :show-delete="false"
              :show-lock="false"
              :show-actions="false"
              :is-section-card="true"
              :expanded="true"
              class="mb-4"
            >
              <template #actions>
                <v-menu
                  v-model="showMigrationMenu"
                  :close-on-content-click="false"
                  location="bottom end"
                >
                  <template v-slot:activator="{ props }">
                    <v-btn
                      icon
                      size="small"
                      variant="text"
                      color="white"
                      v-bind="props"
                      :disabled="configuration._locked"
                      title="Add Migration"
                    >
                      <v-icon size="18">mdi-plus</v-icon>
                    </v-btn>
                  </template>
                  <v-list min-width="300">
                    <v-list-item
                      v-for="file in migrationFiles"
                      :key="file.name"
                      @click="selectMigration(file.name)"
                    >
                      <v-list-item-title>{{ file.name }}</v-list-item-title>
                    </v-list-item>
                    <v-divider />
                    <v-list-item @click="showNewMigrationDialog = true; showMigrationMenu = false">
                      <v-list-item-title class="text-primary">
                        <v-icon start size="small">mdi-plus</v-icon>
                        New Migration File
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </template>
              <template #default>
                <div v-if="getCurrentVersion().migrations.length > 0" class="d-flex flex-wrap">
                  <v-chip
                    v-for="migration in getCurrentVersion().migrations"
                    :key="migration"
                    color="info"
                    class="mr-2 mb-2"
                    closable
                    @click:close="removeMigration(migration)"
                    :disabled="configuration._locked"
                  >
                    {{ migration }}
                  </v-chip>
                </div>
                <div v-else class="text-medium-emphasis">
                  No migrations defined
                </div>
              </template>
            </FileCard>
          </template>
        </FileCard>
      </div>
    </div>

    <!-- New Test Data Dialog -->
    <v-dialog v-model="showNewTestDataDialog" max-width="500px">
      <v-card>
        <v-card-title>Create New Test Data File</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newTestDataFileName"
            label="File Name"
            :error="!!newTestDataError"
            :error-messages="newTestDataError || undefined"
            placeholder="sample.1.0.0.1.json"
            :disabled="creatingTestData"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            @click="showNewTestDataDialog = false"
            :disabled="creatingTestData"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="createTestDataFile"
            :loading="creatingTestData"
            :disabled="!newTestDataFileName.trim()"
          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- New Migration Dialog -->
    <v-dialog v-model="showNewMigrationDialog" max-width="500px">
      <v-card>
        <v-card-title>Create New Migration File</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newMigrationFileName"
            label="File Name"
            :error="!!newMigrationError"
            :error-messages="newMigrationError || undefined"
            placeholder="migration.json"
            :disabled="creatingMigration"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            @click="showNewMigrationDialog = false"
            :disabled="creatingMigration"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="createMigrationFile"
            :loading="creatingMigration"
            :disabled="!newMigrationFileName.trim()"
          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { apiService } from '@/utils/api'
import FileCard from '@/components/FileCard.vue'

interface ConfigurationVersion {
  version: string
  test_data: string
  add_indexes: Array<{
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

interface FileInfo {
  name: string
  created_at: string
  updated_at: string
  size: number
  _locked?: boolean
}

const route = useRoute()
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const configuration = ref<Configuration | null>(null)
const activeVersion = ref<string>('')
const processing = ref(false)

// JSON editor states
const indexesExpanded = ref(false) // Start collapsed
const indexJsonStrings = ref<string[]>([])
const indexJsonErrors = ref<(string | null)[]>([])

// File lists
const testDataFiles = ref<FileInfo[]>([])
const migrationFiles = ref<FileInfo[]>([])
const loadingTestData = ref(false)
const loadingMigrations = ref(false)

// Drop indexes
const newDropIndex = ref('')

// Migrations
const newMigration = ref('')

// New file dialogs
const showNewTestDataDialog = ref(false)
const showNewMigrationDialog = ref(false)
const newTestDataFileName = ref('')
const newMigrationFileName = ref('')
const newTestDataError = ref<string | null>(null)
const newMigrationError = ref<string | null>(null)
const creatingTestData = ref(false)
const creatingMigration = ref(false)

// Menu states
const showTestDataMenu = ref(false)
const showDropIndexMenu = ref(false)
const showMigrationMenu = ref(false)

// Selected items for choosers
const selectedTestData = ref<string | null>(null)
const selectedMigration = ref<string | null>(null)

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
  // Initialize JSON strings for each index
  indexJsonStrings.value = version.add_indexes.map(index => {
    return JSON.stringify(index, null, 2)
  })
  // Clear errors
  indexJsonErrors.value = new Array(version.add_indexes.length).fill(null)
})

// Test Data File Management
const loadTestDataFiles = async () => {
  loadingTestData.value = true
  try {
    const data = await apiService.getTestData()
    testDataFiles.value = (data || []).map((file: any) => ({
      name: file.file_name,
      created_at: file.created_at,
      updated_at: file.updated_at,
      size: file.size,
      _locked: file._locked || false
    }))
  } catch (err: any) {
    console.error('Failed to load test data files:', err)
  } finally {
    loadingTestData.value = false
  }
}

const selectTestData = (name: string) => {
  getCurrentVersion().test_data = name
  selectedTestData.value = name
  showTestDataMenu.value = false
  autoSave()
}

const removeTestData = () => {
  getCurrentVersion().test_data = ''
  autoSave()
}

// Add Indexes Management
const updateIndexFromJson = (indexIndex: number) => {
  try {
    const jsonString = indexJsonStrings.value[indexIndex]
    const parsed = JSON.parse(jsonString)
    const currentVersion = getCurrentVersion()
    currentVersion.add_indexes[indexIndex] = parsed
    indexJsonErrors.value[indexIndex] = null
    autoSave()
  } catch (err: any) {
    indexJsonErrors.value[indexIndex] = 'Invalid JSON format'
  }
}

const addNewIndex = () => {
  const currentVersion = getCurrentVersion()
  const newIndex = {
    key: {},
    options: {}
  }
  currentVersion.add_indexes.push(newIndex)
  indexJsonStrings.value.push(JSON.stringify({ key: {}, options: {} }, null, 2))
  indexJsonErrors.value.push(null)
  autoSave()
}

const removeIndex = (indexIndex: number) => {
  const currentVersion = getCurrentVersion()
  currentVersion.add_indexes.splice(indexIndex, 1)
  indexJsonStrings.value.splice(indexIndex, 1)
  indexJsonErrors.value.splice(indexIndex, 1)
  autoSave()
}

// Drop Indexes Management
const addDropIndex = () => {
  const name = newDropIndex.value.trim()
  if (!name) return
  
  const currentVersion = getCurrentVersion()
  if (!currentVersion.drop_indexes.find((idx: { name: string }) => idx.name === name)) {
    currentVersion.drop_indexes.push({ name })
    newDropIndex.value = ''
    showDropIndexMenu.value = false
    autoSave()
  }
}

const removeDropIndex = (name: string) => {
  const currentVersion = getCurrentVersion()
  currentVersion.drop_indexes = currentVersion.drop_indexes.filter((idx: { name: string }) => idx.name !== name)
  autoSave()
}

// Migrations Management
const addMigration = () => {
  const name = newMigration.value
  if (!name) return
  
  const currentVersion = getCurrentVersion()
  if (!currentVersion.migrations.includes(name)) {
    currentVersion.migrations.push(name)
    newMigration.value = ''
    autoSave()
  }
}

const removeMigration = (name: string) => {
  const currentVersion = getCurrentVersion()
  currentVersion.migrations = currentVersion.migrations.filter((m: string) => m !== name)
  autoSave()
}

// Load migration files
const loadMigrationFiles = async () => {
  loadingMigrations.value = true
  try {
    const data = await apiService.getMigrations()
    migrationFiles.value = (data || []).map((file: any) => ({
      name: file.file_name,
      created_at: file.created_at,
      updated_at: file.updated_at,
      size: file.size,
      _locked: file._locked || false
    }))
  } catch (err: any) {
    console.error('Failed to load migration files:', err)
  } finally {
    loadingMigrations.value = false
  }
}

const selectMigration = (name: string) => {
  const currentVersion = getCurrentVersion()
  if (!currentVersion.migrations.includes(name)) {
    currentVersion.migrations.push(name)
    selectedMigration.value = name
    showMigrationMenu.value = false
    autoSave()
  }
}

const createTestDataFile = async () => {
  const fileName = newTestDataFileName.value.trim()
  if (!fileName) return
  
  creatingTestData.value = true
  try {
    // Create empty test data file
    await apiService.saveTestDataFile(fileName, [])
    
    // Refresh test data files list
    await loadTestDataFiles()
    
    // Set as selected
    getCurrentVersion().test_data = fileName
    autoSave()
    
    // Close dialog
    showNewTestDataDialog.value = false
    newTestDataFileName.value = ''
    newTestDataError.value = null
    
  } catch (err: any) {
    newTestDataError.value = err.message || 'Failed to create test data file'
  } finally {
    creatingTestData.value = false
  }
}

const createMigrationFile = async () => {
  const fileName = newMigrationFileName.value.trim()
  if (!fileName) return
  
  creatingMigration.value = true
  try {
    // Create empty migration file
    await apiService.saveMigration(fileName, [])
    
    // Refresh migration files list
    await loadMigrationFiles()
    
    // Add to current version
    const currentVersion = getCurrentVersion()
    if (!currentVersion.migrations.includes(fileName)) {
      currentVersion.migrations.push(fileName)
      autoSave()
    }
    
    // Close dialog
    showNewMigrationDialog.value = false
    newMigrationFileName.value = ''
    newMigrationError.value = null
    
  } catch (err: any) {
    newMigrationError.value = err.message || 'Failed to create migration file'
  } finally {
    creatingMigration.value = false
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
  loadTestDataFiles()
  loadMigrationFiles()
})
</script> 