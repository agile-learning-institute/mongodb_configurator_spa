<template>
  <DetailPageLayout
    :loading="loading"
    :error="error"
    :data="dictionary"
    :title="dictionary?.title || dictionary?.file_name?.replace('.yaml', '') || ''"
    :file-name="dictionary?.file_name || ''"
    file-type="Dictionary"
    :locked="dictionary?._locked || false"
    :disabled="dictionary?._locked || false"
    v-model:show-delete-dialog="showDeleteDialog"
    v-model:show-unlock-dialog="showUnlockDialog"
    @retry="loadDictionary"
    @lock="lockDictionary"
    @unlock="unlockDictionary"
    @delete="handleDelete"
    @title-change="handleTitleChange"
    @confirm-delete="confirmDelete"
    @cancel-delete="cancelDelete"
    @confirm-unlock="confirmUnlock"
    @cancel-unlock="cancelUnlock"
  >
    <template #default="{ data: dictionary }">
      <!-- Dictionary Content -->
      <BaseCard 
        title="Dictionary Properties"
        icon="mdi-shape"
        :is-secondary="false"
      >
        <PropertyEditor
          :property="dictionary.root"
          property-name="root"
          :disabled="dictionary._locked"
          :exclude-type="dictionary.file_name"
          :top-level="true"
          :top-level-name="dictionary.file_name.replace('.yaml', '')"
          type-picker-component="DictionaryTypePicker"
          @change="handleRootPropertyChange"
        />
      </BaseCard>
    </template>
  </DetailPageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { apiService } from '@/utils/api'
import DetailPageLayout from '@/components/DetailPageLayout.vue'
import BaseCard from '@/components/BaseCard.vue'
import PropertyEditor from '@/components/PropertyEditor.vue'

interface DictionaryProperty {
  description: string
  type?: string
  required?: boolean
  additionalProperties?: boolean
  items?: DictionaryProperty
  properties?: Record<string, DictionaryProperty>
  schema?: any
  json_type?: any
  bson_type?: any
  enums?: string[]
  oneOf?: Record<string, any>
}

interface Dictionary {
  file_name: string
  title?: string
  _locked: boolean
  root: DictionaryProperty
}

const route = useRoute()
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const dictionary = ref<Dictionary | null>(null)
const showDeleteDialog = ref(false)
const showUnlockDialog = ref(false)

// Computed properties (unused but kept for future use)
// const descriptionValue = computed(() => dictionary.value?.root?.description || '')
// const typeValue = computed(() => dictionary.value?.root?.type || 'string')

// Methods
const loadDictionary = async () => {
  loading.value = true
  error.value = null
  
  try {
    const fileName = route.params.fileName as string
    dictionary.value = await apiService.getDictionary(fileName)
  } catch (err: any) {
    error.value = err.message || 'Failed to load dictionary'
    console.error('Failed to load dictionary:', err)
  } finally {
    loading.value = false
  }
}

const autoSave = async () => {
  if (!dictionary.value) return
  
  saving.value = true
  error.value = null
  
  try {
    await apiService.saveDictionary(dictionary.value.file_name, dictionary.value)
  } catch (err: any) {
    error.value = err.message || 'Failed to save dictionary'
    console.error('Failed to save dictionary:', err)
  } finally {
    saving.value = false
  }
}

const handleRootPropertyChange = (updatedProperty: DictionaryProperty) => {
  if (dictionary.value) {
    dictionary.value.root = updatedProperty
    autoSave()
  }
}

const handleTitleChange = async (newTitle: string) => {
  if (dictionary.value) {
    dictionary.value.title = newTitle
    await autoSave()
  }
}

const lockDictionary = async () => {
  if (!dictionary.value) return
  
  try {
    // Note: Lock API endpoint may not be implemented yet
    dictionary.value._locked = true
  } catch (err: any) {
    error.value = err.message || 'Failed to lock dictionary'
    console.error('Failed to lock dictionary:', err)
  }
}

const unlockDictionary = async () => {
  if (!dictionary.value) return
  
  try {
    // Note: Unlock API endpoint may not be implemented yet
    dictionary.value._locked = false
    showUnlockDialog.value = false
  } catch (err: any) {
    error.value = err.message || 'Failed to unlock dictionary'
    console.error('Failed to unlock dictionary:', err)
  }
}

const handleDelete = () => {
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!dictionary.value) return
  
  try {
    await apiService.deleteDictionary(dictionary.value.file_name)
    // Navigate back to dictionaries list
    window.location.href = '/dictionaries'
  } catch (err: any) {
    error.value = err.message || 'Failed to delete dictionary'
    console.error('Failed to delete dictionary:', err)
  }
}

const cancelDelete = () => {
  showDeleteDialog.value = false
}

const confirmUnlock = () => {
  unlockDictionary()
}

const cancelUnlock = () => {
  showUnlockDialog.value = false
}

// Load dictionary on mount
onMounted(() => {
  loadDictionary()
})
</script>

<style scoped>
.clickable-title {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.clickable-title:hover {
  background-color: rgba(46, 125, 50, 0.04);
  border-radius: 4px;
  padding: 4px;
  margin: -4px;
}

.clickable-description {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.clickable-description:hover {
  background-color: rgba(46, 125, 50, 0.04);
  border-radius: 4px;
  padding: 4px;
  margin: -4px;
}

/* Items description field styling */
.items-description-field :deep(.v-field__outline) {
  border-color: rgba(0, 0, 0, 0.6) !important;
}

.items-description-field :deep(.v-field__outline--focused) {
  border-color: rgb(76, 175, 80) !important;
}

/* Items type picker styling for better contrast */
.items-type-picker :deep(.v-chip) {
  background-color: white !important;
  color: black !important;
  border-color: black !important;
}

.items-type-picker :deep(.v-chip__content) {
  color: black !important;
}

.items-type-picker :deep(.v-chip__prepend) {
  color: black !important;
}
</style> 