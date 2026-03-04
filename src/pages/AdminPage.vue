<template>
  <v-container>
    <!-- Configure / Drop / Lock buttons, or read-only banner -->
    <div v-if="!loading && !error" class="mb-4">
      <div v-if="!isReadOnly" class="d-flex align-center gap-2">
        <v-tooltip text="Configure Database" location="bottom">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              color="primary"
              variant="elevated"
              @click="processAllConfigurations"
              :loading="processing"
              data-test="configure-database-btn"
            >
              Configure Database
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip text="Drop Database" location="bottom">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              color="error"
              variant="elevated"
              @click="showDropDatabaseDialog = true"
              data-test="drop-database-btn"
            >
              Drop Database
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip text="Lock all configurations, dictionaries, types, and enumerators" location="bottom">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              color="secondary"
              variant="elevated"
              @click="lockEverything"
              :loading="lockingAll"
              data-test="lock-everything-btn"
            >
              Lock Everything
            </v-btn>
          </template>
        </v-tooltip>
      </div>
      <div
        v-else
        class="text-warning mt-2"
        data-test="read-only-banner"
      >
        <div class="text-h5 font-weight-bold">
          Currently in read only mode. Use <code>make dev</code> to open in edit mode.
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="d-flex justify-center align-center pa-8">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="pa-4">
      <v-alert type="error">
        {{ error }}
        <v-btn @click="loadConfig" class="mt-2">Retry</v-btn>
      </v-alert>
    </div>

    <!-- Config items -->
    <div v-else>
      <v-card>
        <v-card-title>API Config Items</v-card-title>
        <v-card-text class="config-items-content">
          <v-table class="config-items-table" density="compact" data-test="config-items-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Value</th>
                <th>From</th>
              </tr>
            </thead>
            <tbody data-test="config-items-list">
              <tr v-for="item in configItems" :key="item.name">
                <td>{{ item.name }}</td>
                <td>{{ item.value }}</td>
                <td>
                  <v-chip
                    :color="getSourceColor(item.from)"
                    size="small"
                  >
                    {{ item.from }}
                  </v-chip>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </div>

    <!-- Drop Database Confirmation Dialog -->
    <v-dialog v-model="showDropDatabaseDialog" max-width="500" persistent data-test="drop-database-dialog">
      <v-card>
        <v-card-title class="text-h5 d-flex align-center">
          <v-icon color="error" class="mr-3">mdi-alert-circle</v-icon>
          Drop Database
        </v-card-title>
        <v-card-text>
          <p class="mb-3">
            <strong>Are you sure you want to drop the database?</strong>
          </p>
          <p class="text-body-2 text-medium-emphasis">
            This action cannot be undone. All collections and data will be permanently deleted.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showDropDatabaseDialog = false" data-test="drop-database-cancel-btn">Cancel</v-btn>
          <v-btn color="error" variant="elevated" @click="confirmDropDatabase" data-test="drop-database-confirm-btn">
            Drop Database
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiService } from '@/utils/api'
import { useEventState } from '@/composables/useEventState'
import { useConfig } from '@/composables/useConfig'

interface ConfigItem {
  name: string
  value: string
  from: 'default' | 'file' | 'environment'
}

const router = useRouter()
const { isReadOnly } = useConfig()
const loading = ref(false)
const error = ref<string | null>(null)
const processing = ref(false)
const lockingAll = ref(false)
const showDropDatabaseDialog = ref(false)
const configItems = ref<ConfigItem[]>([])

// Load config data
const loadConfig = async () => {
  loading.value = true
  error.value = null
  
  try {
    const data = await apiService.getConfig()
    configItems.value = data.config_items || []
  } catch (err: any) {
    error.value = err.message || 'Failed to load configuration'
    console.error('Failed to load configuration:', err)
  } finally {
    loading.value = false
  }
}

// Get color for source chip
const getSourceColor = (source: string) => {
  switch (source) {
    case 'environment':
      return 'success'
    case 'file':
      return 'info'
    case 'default':
      return 'warning'
    default:
      return 'default'
  }
}

// Configure Database - process all configurations
const processAllConfigurations = async () => {
  processing.value = true
  error.value = null

  try {
    const result = await apiService.processAllConfigurations()
    const { clearEventViewerState, setEventViewerState } = useEventState()
    clearEventViewerState()
    const event = Array.isArray(result) && result.length > 0 ? result[0] : result
    setEventViewerState(event, 'Database Configured', 'All configurations processed')
    router.push('/event-viewer')
  } catch (err: any) {
    if (err.type === 'API_ERROR' && err.data) {
      const { clearEventViewerState, setEventViewerState } = useEventState()
      clearEventViewerState()
      setEventViewerState(err.data, 'Configure Database Error', 'Failed to configure database')
      router.push('/event-viewer')
    } else {
      error.value = err.message || 'Failed to configure database'
    }
  } finally {
    processing.value = false
  }
}

// Drop Database - with confirmation
const confirmDropDatabase = async () => {
  try {
    const result = await apiService.dropDatabase()
    const { clearEventViewerState, setEventViewerState } = useEventState()
    clearEventViewerState()
    setEventViewerState(result, 'Database Dropped', 'Database was dropped successfully')
    showDropDatabaseDialog.value = false
    router.push('/event-viewer')
  } catch (err: any) {
    if (err.type === 'API_ERROR' && err.data) {
      const { clearEventViewerState, setEventViewerState } = useEventState()
      clearEventViewerState()
      setEventViewerState(err.data, 'Drop Database Error', 'Failed to drop database')
      showDropDatabaseDialog.value = false
      router.push('/event-viewer')
    } else {
      error.value = err.message || 'Failed to drop database'
    }
  }
}

// Lock all configurations, dictionaries, types, and enumerators
const lockEverything = async () => {
  lockingAll.value = true
  try {
    await Promise.all([
      apiService.lockAllConfigurations(),
      apiService.lockAllDictionaries(),
      apiService.lockAllTypes(),
      apiService.lockAllEnumerators(),
    ])
  } catch (err: any) {
    // Reuse the existing error alert mechanism
    error.value = err.message || 'Failed to lock all configurations, dictionaries, types, and enumerators'
  } finally {
    lockingAll.value = false
  }
}

// Load config on mount
onMounted(() => {
  loadConfig()
})
</script>

<style scoped>
.config-items-content {
  padding: 8px 16px !important;
}

[data-test="read-only-banner"] code {
  background-color: #000000;
  color: #00ff00;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: "Courier New", Courier, monospace;
}

/* Override Vuetify table padding for compact display - use very specific selectors */
.config-items-table :deep(table),
.config-items-table :deep(.v-table),
.config-items-table :deep(.v-table__wrapper) {
  border-collapse: collapse;
}

.config-items-table :deep(thead th),
.config-items-table :deep(thead .v-table__wrapper th),
.config-items-table :deep(tbody td),
.config-items-table :deep(tbody .v-table__wrapper td) {
  padding: 4px 12px !important;
  font-size: 0.875rem !important;
  line-height: 1.2 !important;
  vertical-align: middle !important;
}

.config-items-table :deep(thead th),
.config-items-table :deep(thead .v-table__wrapper th) {
  font-weight: 600;
  padding-top: 6px !important;
  padding-bottom: 6px !important;
}

.config-items-table :deep(tbody td),
.config-items-table :deep(tbody .v-table__wrapper td) {
  padding-top: 4px !important;
  padding-bottom: 4px !important;
}

.config-items-table :deep(tbody tr),
.config-items-table :deep(tbody .v-table__wrapper tr) {
  height: auto !important;
  min-height: 28px !important;
}
</style> 