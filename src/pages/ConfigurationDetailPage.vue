<template>
  <DetailPageLayout
    :loading="loading"
    :error="error"
    :data="configuration"
    :title="configuration?.title || ''"
    :file-name="configuration?.file_name || ''"
    file-type="Configuration"
    :locked="configuration?._locked || false"
    :disabled="configuration?._locked || false"
    v-model:show-delete-dialog="showDeleteDialog"
    v-model:show-unlock-dialog="showUnlockDialog"
    @retry="loadConfiguration"
    @lock="lockConfiguration"
    @unlock="unlockConfiguration"
    @delete="handleDelete"
    @title-change="handleTitleChange"
    @confirm-delete="confirmDelete"
    @cancel-delete="cancelDelete"
    @confirm-unlock="confirmUnlock"
    @cancel-unlock="cancelUnlock"
  >
    <template #default="{ data: configuration }">
      <!-- Configuration Content -->
      <div class="configuration-content">
        <!-- Description -->
        <BaseCard 
          title="Description"
          icon="mdi-information"
          :is-secondary="true"
          compact
        >
          <v-text-field
            v-model="configuration.description"
            placeholder="Enter configuration description..."
            variant="outlined"
            density="compact"
            :disabled="configuration._locked"
            @update:model-value="autoSave"
          />
        </BaseCard>

        <!-- Version Management -->
        <BaseCard 
          title="Version Management"
          icon="mdi-tag-multiple"
          :is-secondary="false"
        >
          <div class="version-tabs">
            <v-tabs v-model="activeVersion" class="mb-4">
              <v-tab
                v-for="version in configuration.versions"
                :key="version.version"
                :value="version.version"
              >
                {{ version.version }}
              </v-tab>
            </v-tabs>

            <div v-if="activeVersion" class="version-content">
              <div class="d-flex align-center mb-4">
                <h3 class="text-h6 mr-4">Version {{ activeVersion }}</h3>
                <v-spacer />
                <v-btn
                  color="primary"
                  variant="outlined"
                  size="small"
                  @click="downloadJsonSchema"
                  :disabled="configuration._locked"
                >
                  <v-icon start size="small">mdi-download</v-icon>
                  JSON Schema
                </v-btn>
                <v-btn
                  color="primary"
                  variant="outlined"
                  size="small"
                  class="ml-2"
                  @click="downloadBsonSchema"
                  :disabled="configuration._locked"
                >
                  <v-icon start size="small">mdi-download</v-icon>
                  BSON Schema
                </v-btn>
              </div>

              <!-- Version details -->
              <div class="version-details">
                <p class="text-body-2 text-medium-emphasis">
                  Created: {{ formatDate(activeVersionData?.created_at) }}
                </p>
                <p class="text-body-2 text-medium-emphasis">
                  Status: {{ activeVersionData?.status || 'Unknown' }}
                </p>
              </div>
            </div>
          </div>
        </BaseCard>

        <!-- Processing Status -->
        <BaseCard 
          title="Processing"
          icon="mdi-cog"
          :is-secondary="true"
          compact
        >
          <div class="d-flex align-center">
            <v-btn
              color="secondary"
              @click="processConfiguration"
              :loading="processing"
              :disabled="configuration._locked"
            >
              <v-icon start>mdi-cog</v-icon>
              Process Configuration
            </v-btn>
            <v-spacer />
            <v-chip
              v-if="processing"
              color="info"
              size="small"
            >
              Processing...
            </v-chip>
          </div>
        </BaseCard>
      </div>
    </template>

    <template #header-actions>
      <v-btn
        color="secondary"
        @click="processConfiguration"
        :loading="processing"
        :disabled="configuration?._locked"
      >
        <v-icon start>mdi-cog</v-icon>
        Process
      </v-btn>
    </template>
  </DetailPageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { apiService } from '@/utils/api'
import DetailPageLayout from '@/components/DetailPageLayout.vue'
import BaseCard from '@/components/BaseCard.vue'

interface ConfigurationVersion {
  version: string
  created_at: string
  status: string
}

interface Configuration {
  file_name: string
  title: string
  description: string
  _locked: boolean
  versions: ConfigurationVersion[]
}

const route = useRoute()
const loading = ref(false)
const saving = ref(false)
const processing = ref(false)
const error = ref<string | null>(null)
const configuration = ref<Configuration | null>(null)
const showDeleteDialog = ref(false)
const showUnlockDialog = ref(false)
const activeVersion = ref<string>('')

// Computed properties
const activeVersionData = computed(() => {
  if (!configuration.value || !activeVersion.value) return null
  return configuration.value.versions.find(v => v.version === activeVersion.value)
})

// Methods
const loadConfiguration = async () => {
  loading.value = true
  error.value = null
  
  try {
    const fileName = route.params.fileName as string
    configuration.value = await apiService.getConfiguration(fileName)
    
         // Set active version to the first one if available
     if (configuration.value?.versions && configuration.value.versions.length > 0) {
       activeVersion.value = configuration.value.versions[0].version
     }
  } catch (err: any) {
    error.value = err.message || 'Failed to load configuration'
    console.error('Failed to load configuration:', err)
  } finally {
    loading.value = false
  }
}

const autoSave = async () => {
  if (!configuration.value) return
  
  saving.value = true
  error.value = null
  
  try {
    await apiService.saveConfiguration(configuration.value.file_name, configuration.value)
  } catch (err: any) {
    error.value = err.message || 'Failed to save configuration'
    console.error('Failed to save configuration:', err)
  } finally {
    saving.value = false
  }
}

const handleTitleChange = async (newTitle: string) => {
  if (configuration.value) {
    configuration.value.title = newTitle
    await autoSave()
  }
}

const lockConfiguration = async () => {
  if (!configuration.value) return
  
  try {
    // Note: Lock API endpoint may not be implemented yet
    configuration.value._locked = true
  } catch (err: any) {
    error.value = err.message || 'Failed to lock configuration'
    console.error('Failed to lock configuration:', err)
  }
}

const unlockConfiguration = async () => {
  if (!configuration.value) return
  
  try {
    // Note: Unlock API endpoint may not be implemented yet
    configuration.value._locked = false
    showUnlockDialog.value = false
  } catch (err: any) {
    error.value = err.message || 'Failed to unlock configuration'
    console.error('Failed to unlock configuration:', err)
  }
}

const processConfiguration = async () => {
  if (!configuration.value) return
  
  processing.value = true
  error.value = null
  
  try {
    await apiService.processConfiguration(configuration.value.file_name)
    // Reload configuration to get updated status
    await loadConfiguration()
  } catch (err: any) {
    error.value = err.message || 'Failed to process configuration'
    console.error('Failed to process configuration:', err)
  } finally {
    processing.value = false
  }
}

const downloadJsonSchema = async () => {
  if (!configuration.value || !activeVersion.value) return
  
  try {
    await apiService.downloadJsonSchema(configuration.value.file_name, activeVersion.value)
  } catch (err: any) {
    error.value = err.message || 'Failed to download JSON schema'
    console.error('Failed to download JSON schema:', err)
  }
}

const downloadBsonSchema = async () => {
  if (!configuration.value || !activeVersion.value) return
  
  try {
    await apiService.downloadBsonSchema(configuration.value.file_name, activeVersion.value)
  } catch (err: any) {
    error.value = err.message || 'Failed to download BSON schema'
    console.error('Failed to download BSON schema:', err)
  }
}

const handleDelete = () => {
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!configuration.value) return
  
  try {
    await apiService.deleteConfiguration(configuration.value.file_name)
    // Navigate back to configurations list
    window.location.href = '/configurations'
  } catch (err: any) {
    error.value = err.message || 'Failed to delete configuration'
    console.error('Failed to delete configuration:', err)
  }
}

const cancelDelete = () => {
  showDeleteDialog.value = false
}

const confirmUnlock = () => {
  unlockConfiguration()
}

const cancelUnlock = () => {
  showUnlockDialog.value = false
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Unknown'
  return new Date(dateString).toLocaleDateString()
}

// Load configuration on mount
onMounted(() => {
  loadConfiguration()
})
</script>

<style scoped>
.configuration-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.version-tabs {
  width: 100%;
}

.version-content {
  padding: 16px 0;
}

.version-details {
  margin-top: 16px;
}
</style> 