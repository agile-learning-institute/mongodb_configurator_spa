<template>
  <div class="version-information-cards">
    <!-- Drop Indexes Card -->
    <BaseCard 
      :title="`Drop Indexes${!version.drop_indexes || version.drop_indexes.length === 0 ? ' (none)' : ''}`"
      icon="mdi-delete"
      :is-secondary="true"
    >
      <template #header-actions>
        <v-btn
          v-if="!props.disabled"
          color="primary"
          variant="outlined"
          size="small"
          @click="addDropIndex"
        >
          <v-icon start size="small">mdi-plus</v-icon>
          Add
        </v-btn>
      </template>
      
      <div v-if="version.drop_indexes && version.drop_indexes.length > 0" class="drop-indexes-content">
        <div class="d-flex flex-wrap gap-2">
          <v-chip
            v-for="(index, i) in version.drop_indexes"
            :key="i"
            :closable="!props.disabled"
            @click:close="removeDropIndex(i)"
          >
            {{ index }}
          </v-chip>
        </div>
      </div>
    </BaseCard>

    <!-- Migrations Card -->
    <BaseCard 
      :title="`Migrations${!version.migrations || version.migrations.length === 0 ? ' (none)' : ''}`"
      icon="mdi-database-sync"
      :is-secondary="true"
    >
      <template #header-actions>
        <v-btn
          v-if="!props.disabled"
          color="primary"
          variant="outlined"
          size="small"
          @click="addMigration"
        >
          <v-icon start size="small">mdi-plus</v-icon>
          Add
        </v-btn>
      </template>
      
      <div v-if="version.migrations && version.migrations.length > 0" class="migrations-content">
        <div class="d-flex flex-wrap gap-2">
          <v-chip
            v-for="(migration, i) in version.migrations"
            :key="i"
            :closable="!props.disabled"
            @click:close="removeMigration(i)"
          >
            {{ migration }}
          </v-chip>
        </div>
      </div>
    </BaseCard>

    <!-- Add Indexes Card -->
    <BaseCard 
      :title="`Add Indexes${!version.add_indexes || version.add_indexes.length === 0 ? ' (none)' : ''}`"
      icon="mdi-database-plus"
      :is-secondary="true"
    >
      <template #header-actions>
        <v-btn
          v-if="!props.disabled"
          color="primary"
          variant="outlined"
          size="small"
          @click="addIndex"
        >
          <v-icon start size="small">mdi-plus</v-icon>
          Add
        </v-btn>
      </template>
      
      <div v-if="version.add_indexes && version.add_indexes.length > 0" class="add-indexes-content">
        <div
          v-for="(_index, i) in version.add_indexes"
          :key="i"
          class="index-item mb-4"
        >
          <JsonDocumentEditor
            v-model="version.add_indexes[i]"
            :title="getIndexName(version.add_indexes[i], i)"
            @update:model-value="autoSave"
            :on-delete="() => removeIndex(i)"
            :disabled="props.disabled"
          />
        </div>
      </div>
    </BaseCard>

    <!-- Test Data Card -->
    <BaseCard 
      :title="`Test Data${!version.test_data ? ' (none)' : ''}`"
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

  <!-- Migration Selection Dialog -->
  <v-dialog v-model="showMigrationDialog" max-width="600px">
    <v-card>
      <v-card-title>Select Migration</v-card-title>
      <v-card-text>
        <div v-if="migrationFiles.length === 0" class="text-center pa-4">
          <v-icon size="32" color="grey">mdi-file-document</v-icon>
          <div class="text-body-2 text-medium-emphasis mt-2">No migration files available</div>
        </div>
        <div v-else class="migration-picker">
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
}

const props = defineProps<Props>()
const testDataFiles = ref<string[]>([])
const migrationFiles = ref<string[]>([])
const showMigrationDialog = ref(false)

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
const addDropIndex = () => {
  // Prompt for index name to drop
  const indexName = prompt('Enter index name to drop:')
  if (!indexName || !indexName.trim()) {
    return // User cancelled or entered empty name
  }
  
  if (!props.version.drop_indexes) {
    props.version.drop_indexes = []
  }
  
  // Add the index name to drop
  props.version.drop_indexes.push(indexName.trim())
  props.onUpdate()
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
</style> 