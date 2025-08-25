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
            v-for="(index, i) in version.drop_indexes"
            :key="i"
            :closable="!props.disabled"
            @click:close="removeDropIndex(i)"
            :data-test="`drop-index-chip-${i}`"
          >
            {{ index }}
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
            :key="i"
            :closable="!props.disabled"
            @click:close="removeMigration(i)"
            @click="openMigrationFile(migration)"
            :data-test="`migration-chip-${i}`"
            class="migration-chip clickable"
            color="primary"
            variant="outlined"
          >
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
      <div class="text-body-2 text-medium-emphasis pa-4">
        Link to dictionary, and enumerators
      </div>
    </BaseCard>

    <!-- Step 5: Add Indexes Card -->
    <BaseCard 
      :title="`Step 5: Add these indexes${!version.add_indexes || version.add_indexes.length === 0 ? ' (none)' : ''}`"
      icon="mdi-database-plus"
      :is-secondary="true"
      data-test="add-indexes-card"
    >
      <template #header-actions>
        <v-btn
          v-if="!props.disabled"
          color="primary"
          variant="outlined"
          size="small"
          @click="addIndex"
          data-test="add-index-btn"
        >
          <v-icon start size="small" data-test="add-index-icon">mdi-plus</v-icon>
          Add
        </v-btn>
      </template>
      
      <div v-if="version.add_indexes && version.add_indexes.length > 0" class="add-indexes-content" data-test="add-indexes-content">
        <div
          v-for="(_index, i) in version.add_indexes"
          :key="i"
          class="index-item mb-4"
          :data-test="`index-item-${i}`"
        >
          <JsonDocumentEditor
            v-model="version.add_indexes[i]"
            :title="getIndexName(version.add_indexes[i], i)"
            @update:model-value="autoSave"
            :on-delete="() => removeIndex(i)"
            :disabled="props.disabled"
            :data-test="`index-editor-${i}`"
          />
        </div>
      </div>
    </BaseCard>

    <!-- Step 6: Test Data Card -->
    <BaseCard 
      :title="`Step 6: Load Test Data${!version.test_data ? ' (none)' : ''}`"
      icon="mdi-file-document"
      :is-secondary="true"
    >
      <div v-if="testDataFiles.length > 0" class="test-data-content">
        <v-select
          v-model="version.test_data"
          :items="['', ...testDataFiles]"
          label="Select test data file"
          variant="outlined"
          density="compact"
          :disabled="props.disabled"
          clearable
          @update:model-value="autoSave"
        />
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
                class="index-chip"
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
                class="migration-chip"
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
import { ref, onMounted } from 'vue'
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

const removeDropIndex = (index: number) => {
  if (props.version.drop_indexes) {
    props.version.drop_indexes.splice(index, 1)
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

const addIndex = () => {
  // Prompt for index name
  const indexName = prompt('Enter index name:')
  if (!indexName || !indexName.trim()) {
    return // User cancelled or entered empty name
  }
  
  if (!props.version.add_indexes) {
    props.version.add_indexes = []
  }
  
  // Create new index with the specified structure
  const newIndex = {
    name: indexName.trim(),
    key: {},
    options: {}
  }
  
  props.version.add_indexes.push(newIndex)
  props.onUpdate()
}

const removeIndex = (index: number) => {
  if (props.version.add_indexes) {
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
  // Remove .json extension if present for the route
  const cleanName = migrationName.replace('.json', '')
  window.location.href = `/migrations/${cleanName}`
}

onMounted(() => {
  loadTestDataFiles()
  loadMigrationFiles()
})
</script>

<style scoped>
.version-information-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.index-item {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  padding: 12px;
}

.migration-picker {
  max-height: 400px;
  overflow-y: auto;
}

.migration-chip {
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.migration-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.migration-chip.selected {
  font-weight: 600;
}

.clickable {
  cursor: pointer;
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

/* Drop Index Dialog Styles */
.index-chip {
  cursor: pointer;
  transition: all 0.2s ease;
}

.index-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
</style> 