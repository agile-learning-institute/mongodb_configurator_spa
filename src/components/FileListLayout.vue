<template>
  <v-container data-test="file-list-layout">
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-6" data-test="file-list-header">
      <div>
        <h1 class="text-h4" data-test="file-list-title">{{ title }}</h1>
        <p class="text-body-2 text-medium-emphasis" data-test="file-list-subtitle">{{ subtitle }}</p>
      </div>
      <div class="d-flex align-center" data-test="file-list-header-actions">
        <slot name="header-actions" />
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="d-flex justify-center align-center pa-8" data-test="file-list-loading">
      <v-progress-circular indeterminate size="64" data-test="loading-spinner"></v-progress-circular>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="pa-4" data-test="file-list-error">
      <v-alert type="error" data-test="error-alert">
        {{ error }}
        <v-btn @click="onRetry" class="mt-2" data-test="retry-btn">Retry</v-btn>
      </v-alert>
    </div>

    <!-- Empty state -->
    <div v-else-if="!files || files.length === 0" class="text-center pa-8" data-test="file-list-empty">
      <v-icon size="64" color="grey" data-test="empty-icon">mdi-folder-open</v-icon>
      <h3 class="text-h5 mt-4" data-test="empty-title">{{ emptyTitle }}</h3>
      <p class="text-body-1 text-medium-emphasis mt-2" data-test="empty-message">{{ emptyMessage }}</p>
      <slot name="empty-actions" />
    </div>

    <!-- File list -->
    <div v-else class="file-list" data-test="file-list-content">
      <div class="d-flex align-center mb-4" data-test="file-list-controls">
        <v-text-field
          v-model="searchQuery"
          placeholder="Search files..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          class="mr-4"
          style="max-width: 300px;"
          data-test="file-search-input"
        />
        <v-spacer />
        <slot name="list-actions" />
      </div>

      <div class="files-grid" data-test="files-grid">
        <slot 
          name="file-card" 
          v-for="file in filteredFiles" 
          :key="file.name"
          :file="file"
        />
      </div>
    </div>

    <!-- Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="500" data-test="delete-confirmation-dialog">
      <v-card>
        <v-card-title class="text-h5" data-test="delete-dialog-title">
          Delete {{ fileType }}?
        </v-card-title>
        <v-card-text>
          <p data-test="delete-dialog-message">Are you sure you want to delete "{{ selectedFile?.name }}"?</p>
          <p class="text-caption text-medium-emphasis" data-test="delete-dialog-warning">
            This action cannot be undone.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="cancelDelete" data-test="delete-dialog-cancel-btn">Cancel</v-btn>
          <v-btn color="error" @click="confirmDelete" data-test="delete-dialog-confirm-btn">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface FileInfo {
  name: string
  created_at: string
  updated_at: string
  size: number
  _locked?: boolean
}

interface Props {
  title: string
  subtitle?: string
  fileType: string
  files: FileInfo[]
  loading: boolean
  error?: string | null
  emptyTitle?: string
  emptyMessage?: string
  showDeleteDialog: boolean
  selectedFile?: FileInfo | null
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: '',
  error: null,
  emptyTitle: 'No files found',
  emptyMessage: 'No files have been created yet.',
  selectedFile: null
})

const emit = defineEmits<{
  retry: []
  delete: [file: FileInfo]
  'confirm-delete': []
  'cancel-delete': []
}>()

// Reactive state
const searchQuery = ref('')

// Computed properties
const filteredFiles = computed(() => {
  if (!searchQuery.value) return props.files
  
  const query = searchQuery.value.toLowerCase()
  return props.files.filter(file => 
    file.name.toLowerCase().includes(query)
  )
})

// Methods
const onRetry = () => {
  emit('retry')
}

const confirmDelete = () => {
  emit('confirm-delete')
}

const cancelDelete = () => {
  emit('cancel-delete')
}
</script>

<style scoped>
.files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

@media (max-width: 600px) {
  .files-grid {
    grid-template-columns: 1fr;
  }
}
</style> 