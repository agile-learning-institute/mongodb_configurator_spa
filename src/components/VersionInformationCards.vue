<template>
  <div class="version-information-cards" data-test="version-information-cards">
    <!-- Step 1: Drop existing schema validation -->
    <BaseCard 
      title="Step 1: Drop existing schema validation"
      icon="mdi-database-remove"
      :is-secondary="true"
      data-test="step-1-card"
    >
    </BaseCard>

    <!-- Step 2: Drop Indexes Card -->
    <BaseCard 
      :title="`Step 2: Drop the following indexes${!version.drop_indexes || version.drop_indexes.length === 0 ? ' (none)' : ''}`"
      icon="mdi-delete"
      :is-secondary="true"
      data-test="drop-indexes-card"
    >
      <template #header-actions>
        <v-btn
          v-if="!props.disabled"
          color="primary"
          variant="outlined"
          size="small"
          @click="addDropIndex"
          data-test="add-drop-index-btn"
        >
          <v-icon start size="small" data-test="add-drop-index-icon">mdi-plus</v-icon>
          Add
        </v-btn>
      </template>
      
      <div v-if="version.drop_indexes && version.drop_indexes.length > 0" class="drop-indexes-content" data-test="drop-indexes-content">
        <div class="d-flex flex-wrap gap-2">
          <v-chip
            v-for="dropIndex in version.drop_indexes"
            :key="dropIndex"
            color="primary"
            variant="outlined"
            class="standard-chip"
            data-test="drop-index-chip"
          >
            <v-icon start size="small">mdi-database-minus</v-icon>
            {{ dropIndex }}
            <v-icon
              end
              size="small"
              color="error"
              class="delete-icon"
              @click="removeDropIndex(dropIndex)"
              data-test="remove-drop-index-btn"
            >
              mdi-close
            </v-icon>
          </v-chip>
        </div>
      </div>
    </BaseCard>

    <!-- Step 3: Migrations Card -->
    <BaseCard 
      :title="`Step 3: Execute the following migrations${!version.migrations || version.migrations.length === 0 ? ' (none)' : ''}`"
      icon="mdi-database-sync"
      :is-secondary="true"
      data-test="migrations-card"
    >
      <template #header-actions>
        <v-btn
          v-if="!props.disabled"
          color="primary"
          variant="outlined"
          size="small"
          @click="addMigration"
          data-test="add-migration-btn"
        >
          <v-icon start size="small" data-test="add-migration-icon">mdi-plus</v-icon>
          Add
        </v-btn>
      </template>
      
      <div v-if="version.migrations && version.migrations.length > 0" class="migrations-content" data-test="migrations-content">
        <div class="d-flex flex-wrap gap-2">
          <v-chip
            v-for="(migration, i) in version.migrations"
            :key="migration"
            color="primary"
            variant="outlined"
            class="standard-chip clickable"
            @click="openMigrationFile(migration)"
            @click:close="removeMigration(i)"
            :closable="!props.disabled"
            data-test="migration-chip"
          >
            <v-icon start size="small">mdi-file-document</v-icon>
            {{ migration }}
          </v-chip>
        </div>
      </div>
    </BaseCard>

    <!-- Step 4: Apply Schema Card -->
    <BaseCard 
      title="Step 4: Apply Schema"
      icon="mdi-database-check"
      :is-secondary="true"
      data-test="step-4-card"
    >
      <div class="d-flex gap-2">
        <!-- Dictionary File Link -->
        <v-chip
          v-if="dictionaryFileName"
          color="primary"
          variant="outlined"
          class="standard-chip clickable"
          @click="openDictionaryFile"
          data-test="dictionary-file-chip"
        >
          <v-icon start size="small">mdi-book-open-variant</v-icon>
          {{ dictionaryFileName }}
        </v-chip>

        <!-- Enumerators File Link -->
        <v-chip
          v-if="enumeratorsFileName"
          color="primary"
          variant="outlined"
          class="standard-chip clickable"
          @click="openEnumeratorsFile"
          data-test="enumerators-file-chip"
        >
          <v-icon start size="small">mdi-format-list-numbered</v-icon>
          {{ enumeratorsFileName }}
        </v-chip>
      </div>
    </BaseCard>

    <!-- Step 5: Add Indexes Card -->
    <BaseCard 
      title="Step 5: Add Indexes"
      icon="mdi-database-plus"
      :is-secondary="true"
      data-test="step-5-card"
    >
      <template #header-actions>
        <v-btn
          v-if="!props.disabled"
          size="small"
          variant="outlined"
          color="primary"
          @click="addNewIndex"
          data-test="add-index-btn"
        >
          <v-icon start size="small">mdi-plus</v-icon>
          Add
        </v-btn>
      </template>
      
      <div class="d-flex flex-wrap gap-2">
        <!-- Index Chips -->
        <v-chip
          v-for="(indexData, index) in version.add_indexes"
          :key="index"
          color="primary"
          variant="outlined"
          class="standard-chip clickable"
          @click="openIndexEditor(index, indexData)"
          data-test="index-chip"
        >
          <v-icon start size="small">mdi-database-plus</v-icon>
          {{ indexData.name || `Index ${index + 1}` }}
          <v-icon
            end
            size="small"
            color="error"
            class="delete-icon"
            @click.stop="deleteIndex(index)"
            data-test="delete-index-btn"
          >
            mdi-close
          </v-icon>
        </v-chip>
      </div>
    </BaseCard>

    <!-- Index Editor Dialog -->
    <v-dialog
      v-model="showIndexEditorDialog"
      max-width="800px"
      persistent
    >
      <v-card>
        <v-card-title class="d-flex align-center gap-2">
          <v-icon>mdi-database-edit</v-icon>
          {{ editingIndexTitle }}
        </v-card-title>
        
        <v-card-text>
          <v-textarea
            v-model="jsonText"
            placeholder="Enter JSON content..."
            variant="outlined"
            density="compact"
            :disabled="props.disabled"
            :error="!!jsonError"
            :error-messages="jsonError"
            :rows="8"
            auto-grow
            @update:model-value="handleJsonChange"
            @blur="validateJson"
            data-test="index-json-textarea"
          />
          
          <!-- Error Display -->
          <v-alert
            v-if="jsonError"
            type="error"
            variant="tonal"
            class="mt-3"
            data-test="json-error-alert"
          >
            {{ jsonError }}
          </v-alert>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="showIndexEditorDialog = false"
            data-test="cancel-index-edit-btn"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="saveIndex"
            :disabled="props.disabled"
            data-test="save-index-btn"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Step 6: Load Test Data Card -->
    <BaseCard 
      title="Step 6: Load Test Data"
      icon="mdi-database-import"
      :is-secondary="true"
      data-test="step-6-card"
    >
      <div class="d-flex gap-2">
        <!-- Test Data File Link -->
        <v-chip
          v-if="testDataFileName"
          color="primary"
          variant="outlined"
          class="standard-chip clickable"
          @click="openTestDataFile"
          data-test="test-data-file-chip"
        >
          <v-icon start size="small">mdi-database-import</v-icon>
          {{ testDataFileName }}
        </v-chip>
      </div>
    </BaseCard>
  </div>

  <!-- Drop Index Selection Dialog -->
  <v-dialog v-model="showDropIndexDialog" max-width="600px">
    <v-card>
      <v-card-title>Add Index to Drop List</v-card-title>
      <v-card-text>
        <div class="d-flex flex-column gap-4">
          <!-- Free Text Entry -->
          <div>
            <h4 class="text-subtitle-1 font-weight-medium mb-2">Enter Index Name</h4>
            <v-text-field
              v-model="newDropIndexName"
              label="Index name to drop"
              placeholder="Enter index name or select from list below"
              variant="outlined"
              density="compact"
              @keyup.enter="addSelectedDropIndex"
              data-test="drop-index-name-input"
            />
          </div>

          <!-- Previously Created Indexes -->
          <div v-if="previouslyCreatedIndexes.length > 0">
            <h4 class="text-subtitle-1 font-weight-medium mb-2">Previously Created Indexes</h4>
            <div class="text-body-2 text-medium-emphasis mb-3">Click an index to add it to the drop list:</div>
            <div class="d-flex flex-wrap gap-2">
              <v-chip
                v-for="index in previouslyCreatedIndexes"
                :key="index"
                color="primary"
                variant="outlined"
                class="standard-chip"
                @click="selectPreviouslyCreatedIndex(index)"
              >
                {{ index }}
              </v-chip>
            </div>
          </div>

          <div v-else class="text-center pa-4">
            <v-icon size="32" color="grey">mdi-database-off</v-icon>
            <div class="text-body-2 text-medium-emphasis mt-2">No previously created indexes found</div>
          </div>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          @click="showDropIndexDialog = false"
          data-test="drop-index-cancel-btn"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          @click="addSelectedDropIndex"
          :disabled="!newDropIndexName.trim()"
          data-test="drop-index-add-btn"
        >
          Add
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Migration Selection Dialog -->
  <v-dialog v-model="showMigrationDialog" max-width="600px">
    <v-card>
      <v-card-title>Select Migration</v-card-title>
      <v-card-text>
        <div class="d-flex flex-column gap-4">
          <!-- Add New Migration Section -->
          <div>
            <h4 class="text-subtitle-1 font-weight-medium mb-2">Create New Migration</h4>
            <div class="d-flex gap-2">
              <v-text-field
                v-model="newMigrationName"
                label="Migration name"
                placeholder="Enter migration name (e.g., add_user_index)"
                variant="outlined"
                density="compact"
                @keyup.enter="createNewMigration"
                data-test="new-migration-name-input"
              />
              <v-btn
                color="primary"
                variant="elevated"
                @click="createNewMigration"
                :disabled="!newMigrationName.trim()"
                data-test="create-migration-btn"
              >
                <v-icon start size="small">mdi-plus</v-icon>
                Create
              </v-btn>
            </div>
          </div>

          <!-- Existing Migrations Section -->
          <div v-if="migrationFiles.length > 0">
            <h4 class="text-subtitle-1 font-weight-medium mb-2">Existing Migrations</h4>
            <div class="text-body-2 text-medium-emphasis mb-3">Click a migration to add it:</div>
            <div class="d-flex flex-wrap gap-2">
              <v-chip
                v-for="migration in migrationFiles"
                :key="migration"
                color="primary"
                variant="outlined"
                class="standard-chip"
                @click="addSelectedMigration(migration)"
              >
                {{ migration }}
              </v-chip>
            </div>
          </div>

          <div v-else class="text-center pa-4">
            <v-icon size="32" color="grey">mdi-file-document</v-icon>
            <div class="text-body-2 text-medium-emphasis mt-2">No existing migration files available</div>
          </div>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          @click="showMigrationDialog = false"
        >
          Cancel
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { apiService } from '@/utils/api'
import BaseCard from './BaseCard.vue'
import JsonDocumentEditor from './JsonDocumentEditor.vue'

interface VersionConfig {
  version: string
  test_data?: string
  add_indexes?: any[]
  drop_indexes?: string[]
  migrations?: string[]
}

interface Props {
  version: VersionConfig
  onUpdate: () => void
  disabled?: boolean
  configuration?: any // Full configuration object to access all versions
}

const props = defineProps<Props>()
const router = useRouter()
const testDataFiles = ref<string[]>([])
const migrationFiles = ref<string[]>([])
const showMigrationDialog = ref(false)

// Drop Index Dialog state
const showDropIndexDialog = ref(false)
const newDropIndexName = ref('')
const previouslyCreatedIndexes = ref<string[]>([])

// Migration Dialog state
const showNewMigrationDialog = ref(false)
const newMigrationName = ref('')

// Index Editor Dialog state
const showIndexEditorDialog = ref(false)
const editingIndexTitle = ref('')
const editingIndexData = ref<any>({})
const jsonText = ref('')
const jsonError = ref('')

// Computed properties for file names
const dictionaryFileName = computed(() => {
  if (!props.configuration || !props.version.version) return ''
  const baseName = props.configuration.file_name.replace('.yaml', '')
  const versionParts = props.version.version.split('.')
  if (versionParts.length >= 3) {
    return `${baseName}.${versionParts[0]}.${versionParts[1]}.${versionParts[2]}.yaml`
  }
  return `${baseName}.0.0.0.yaml`
})

const enumeratorsFileName = computed(() => {
  if (!props.version.version) return ''
  const versionParts = props.version.version.split('.')
  if (versionParts.length >= 4) {
    return `enumerations.${versionParts[3]}.yaml`
  }
  return 'enumerations.0.yaml'
})

const testDataFileName = computed(() => {
  if (!props.configuration?.file_name || !props.version.version) return ''
  
  // Extract collection name from file_name (remove .yaml extension)
  const collectionName = props.configuration.file_name.replace('.yaml', '')
  
  // Use the full semantic version format
  return `${collectionName}.${props.version.version}.json`
})

// Load test data files
const loadTestDataFiles = async () => {
  try {
    const files = await apiService.getTestData()
    testDataFiles.value = files.map((file: any) => file.file_name)
  } catch (err) {
    console.error('Failed to load test data files:', err)
  }
}

// Load migration files
const loadMigrationFiles = async () => {
  try {
    const files = await apiService.getMigrations()
    migrationFiles.value = files.map((file: any) => file.file_name)
  } catch (err) {
    console.error('Failed to load migration files:', err)
  }
}

// Add/Remove methods
const addDropIndex = async () => {
  // Load previously created indexes if not already loaded
  if (previouslyCreatedIndexes.value.length === 0) {
    await loadPreviouslyCreatedIndexes()
  }
  
  // Show drop index selection dialog
  showDropIndexDialog.value = true
}

const loadPreviouslyCreatedIndexes = async () => {
  try {
    // Get all index names from all versions of the current configuration
    const allIndexNames = new Set<string>()
    
    if (props.configuration && props.configuration.versions) {
      // Iterate through all versions to collect index names
      props.configuration.versions.forEach((version: any) => {
        if (version.add_indexes && Array.isArray(version.add_indexes)) {
          version.add_indexes.forEach((indexData: any) => {
            // Extract index name from the index data
            if (indexData && typeof indexData === 'object' && indexData.name) {
              allIndexNames.add(indexData.name)
            } else if (typeof indexData === 'string') {
              // Handle case where indexData might be a string
              allIndexNames.add(indexData)
            }
          })
        }
      })
    }
    
    // Convert Set to array and sort alphabetically
    previouslyCreatedIndexes.value = Array.from(allIndexNames).sort()
    
    console.log('Loaded previously created indexes:', previouslyCreatedIndexes.value)
  } catch (err) {
    console.error('Failed to load previously created indexes:', err)
    previouslyCreatedIndexes.value = []
  }
}

const selectPreviouslyCreatedIndex = (indexName: string) => {
  newDropIndexName.value = indexName
}

const addSelectedDropIndex = () => {
  const indexName = newDropIndexName.value.trim()
  if (!indexName) {
    return // User didn't enter anything
  }
  
  if (!props.version.drop_indexes) {
    props.version.drop_indexes = []
  }
  
  // Add the index name to drop
  props.version.drop_indexes.push(indexName)
  props.onUpdate()
  
  // Reset and close dialog
  newDropIndexName.value = ''
  showDropIndexDialog.value = false
}

const removeDropIndex = (indexName: string) => {
  if (props.version.drop_indexes) {
    props.version.drop_indexes = props.version.drop_indexes.filter(
      (dropIndex) => dropIndex !== indexName
    )
    props.onUpdate()
  }
}

const addMigration = async () => {
  // Load migration files if not already loaded
  if (migrationFiles.value.length === 0) {
    await loadMigrationFiles()
  }
  
  // Show migration selection dialog
  showMigrationDialog.value = true
}

const removeMigration = (index: number) => {
  if (props.version.migrations) {
    props.version.migrations.splice(index, 1)
    props.onUpdate()
  }
}

const addSelectedMigration = (migration: string) => {
  if (!props.version.migrations) {
    props.version.migrations = []
  }
  
  // Add the selected migration
  props.version.migrations.push(migration)
  props.onUpdate()
  
  // Close dialog
  showMigrationDialog.value = false
}

const createNewMigration = async () => {
  const migrationName = newMigrationName.value.trim()
  if (!migrationName) {
    return // User didn't enter anything
  }

  try {
    // Ensure the migration name has .json extension
    const fileName = migrationName.endsWith('.json') ? migrationName : `${migrationName}.json`
    
    // Create a new migration file as an empty list
    const newMigrationData: any[] = []
    
    // Save the new migration file
    await apiService.saveMigration(fileName, newMigrationData)
    
    // Add the migration to the current version
    if (!props.version.migrations) {
      props.version.migrations = []
    }
    props.version.migrations.push(fileName)
    props.onUpdate()
    
    // Reload migration files to include the new one
    await loadMigrationFiles()
    
    // Reset and close dialog
    newMigrationName.value = ''
    showMigrationDialog.value = false
  } catch (err) {
    console.error('Failed to create new migration:', err)
    // Optionally show a snackbar or dialog for error
  }
}

const addNewIndex = () => {
  editingIndexTitle.value = 'New Index'
  editingIndexData.value = {
    name: '',
    key: {},
    options: {}
  }
  jsonText.value = JSON.stringify(editingIndexData.value, null, 2)
  jsonError.value = ''
  showIndexEditorDialog.value = true
}

const openIndexEditor = (index: number, indexData: any) => {
  editingIndexTitle.value = indexData.name || `Index ${index + 1}`
  editingIndexData.value = { ...indexData }
  jsonText.value = JSON.stringify(indexData, null, 2)
  jsonError.value = ''
  showIndexEditorDialog.value = true
}

const handleJsonChange = (value: string) => {
  jsonText.value = value
  jsonError.value = ''
}

const validateJson = () => {
  try {
    if (jsonText.value.trim()) {
      JSON.parse(jsonText.value)
      jsonError.value = ''
    }
  } catch (error) {
    jsonError.value = 'Invalid JSON format'
  }
}

const saveIndex = async () => {
  try {
    // Validate JSON before saving
    if (jsonText.value.trim()) {
      const parsedData = JSON.parse(jsonText.value)
      editingIndexData.value = parsedData
    }
    
    // Find the index in the version.add_indexes array and update it
    if (editingIndexData.value.name) {
      // Ensure add_indexes array exists
      if (!props.version.add_indexes) {
        props.version.add_indexes = []
      }
      
      // If editing existing index, update it
      const indexToUpdate = props.version.add_indexes.find((idx: any) => 
        idx.name === editingIndexData.value.name
      )
      
      if (indexToUpdate) {
        // Update existing index
        Object.assign(indexToUpdate, editingIndexData.value)
      } else {
        // Add new index
        props.version.add_indexes.push({ ...editingIndexData.value })
      }
      
      // Call the update function to save changes
      props.onUpdate()
      showIndexEditorDialog.value = false
    }
  } catch (err) {
    console.error('Failed to save index:', err)
    jsonError.value = 'Invalid JSON format'
  }
}

const deleteIndex = (index: number) => {
  if (props.version.add_indexes && props.version.add_indexes[index]) {
    props.version.add_indexes.splice(index, 1)
    props.onUpdate()
  }
}

const autoSave = () => {
  props.onUpdate()
}

const getIndexName = (indexData: any, index: number) => {
  if (indexData && typeof indexData === 'object' && indexData.name) {
    return indexData.name
  }
  return `Index ${index + 1}`
}

const openMigrationFile = (migrationName: string) => {
  // Navigate to the migration file detail page
  // Keep the .json extension for the route
  router.push({ name: 'MigrationsDetail', params: { fileName: migrationName } })
}

const openDictionaryFile = () => {
  if (dictionaryFileName.value) {
    router.push({ name: 'DictionaryDetail', params: { fileName: dictionaryFileName.value } })
  }
}

const openEnumeratorsFile = () => {
  if (enumeratorsFileName.value) {
    router.push({ name: 'EnumeratorsDetail', params: { fileName: enumeratorsFileName.value } })
  }
}

const openTestDataFile = () => {
  if (testDataFileName.value) {
    router.push({ name: 'TestDataDetail', params: { fileName: testDataFileName.value } })
  }
}

onMounted(() => {
  loadTestDataFiles()
  loadMigrationFiles()
})
</script>

<style scoped>
.standard-chip {
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 12px;
  height: 32px;
}

.standard-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.delete-icon {
  opacity: 0.7;
  transition: opacity 0.2s ease;
  margin-left: 8px;
}

.delete-icon:hover {
  opacity: 1;
}

/* Version Navigation Styles */
.new-version-btn {
  background: linear-gradient(135deg, #1976d2, #1565c0) !important;
  color: white !important;
  font-weight: 600 !important;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3) !important;
  transition: all 0.3s ease !important;
}

.new-version-btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 20px rgba(25, 118, 210, 0.4) !important;
}

/* Version Components Styles */
.version-components {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.version-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.version-label {
  min-width: 60px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.7);
}

.version-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.version-input {
  width: 60px;
  text-align: center;
}

.version-preview {
  font-family: monospace;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
  background: rgba(0, 0, 0, 0.05);
  padding: 4px 8px;
  border-radius: 4px;
}

.version-display {
  font-family: monospace;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
}
</style> 