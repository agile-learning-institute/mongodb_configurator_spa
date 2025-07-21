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
            closable
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
            closable
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
          <div class="d-flex align-center justify-space-between mb-2">
            <span class="text-subtitle-2">Index {{ i + 1 }}</span>
            <v-btn
              color="error"
              variant="text"
              size="small"
              @click="removeIndex(i)"
            >
              <v-icon size="small">mdi-delete</v-icon>
            </v-btn>
          </div>
          <JsonDocumentEditor
            v-model="version.add_indexes[i]"
            title="Index Configuration"
            @update:model-value="autoSave"
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
          :items="testDataFiles"
          label="Select test data file"
          variant="outlined"
          density="compact"
          @update:model-value="autoSave"
        />
      </div>
    </BaseCard>
  </div>
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
}

const props = defineProps<Props>()
const testDataFiles = ref<string[]>([])

// Load test data files
const loadTestDataFiles = async () => {
  try {
    const files = await apiService.getTestData()
    testDataFiles.value = files.map((file: any) => file.file_name)
  } catch (err) {
    console.error('Failed to load test data files:', err)
  }
}

// Add/Remove methods
const addDropIndex = () => {
  if (!props.version.drop_indexes) {
    props.version.drop_indexes = []
  }
  props.version.drop_indexes.push('')
  props.onUpdate()
}

const removeDropIndex = (index: number) => {
  if (props.version.drop_indexes) {
    props.version.drop_indexes.splice(index, 1)
    props.onUpdate()
  }
}

const addMigration = () => {
  if (!props.version.migrations) {
    props.version.migrations = []
  }
  props.version.migrations.push('')
  props.onUpdate()
}

const removeMigration = (index: number) => {
  if (props.version.migrations) {
    props.version.migrations.splice(index, 1)
    props.onUpdate()
  }
}

const addIndex = () => {
  if (!props.version.add_indexes) {
    props.version.add_indexes = []
  }
  props.version.add_indexes.push({})
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

onMounted(() => {
  loadTestDataFiles()
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
</style> 