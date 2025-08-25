<template>
  <div>
    <!-- Loading state -->
    <div v-if="loading" class="d-flex justify-center align-center pa-8" data-test="file-list-loading">
      <v-progress-circular indeterminate size="64" data-test="loading-spinner"></v-progress-circular>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="pa-4" data-test="file-list-error">
      <v-alert type="error" data-test="error-alert">
        {{ error }}
        <v-btn @click="loadFiles" class="mt-2" data-test="retry-btn">Retry</v-btn>
      </v-alert>
    </div>

    <!-- File list -->
    <div v-else>
      <!-- Empty state -->
      <div v-if="files.length === 0" class="text-center pa-8" data-test="file-list-empty">
        <v-icon size="64" color="grey" data-test="empty-icon">mdi-folder-open</v-icon>
        <h3 class="text-h5 mt-4" data-test="empty-title">No {{ fileType }} found</h3>
        <p class="text-body-1 text-medium-emphasis" data-test="empty-message">No {{ fileType }} files are available.</p>
      </div>

      <!-- File list -->
      <div v-else data-test="file-list-content">
        <FileCard
          v-for="file in files" 
          :key="file.name"
          :file="file"
          :file-type="fileType === 'configurations' ? 'configuration' : fileType === 'dictionaries' ? 'dictionary' : fileType === 'types' ? 'type' : fileType === 'enumerators' ? 'enumerator' : fileType === 'test_data' ? 'test-data' : 'migration'"
          :show-process="false"
          :show-delete="fileType !== 'configurations'"
          @edit="editFile(file.name)"
          @delete="handleDelete(file.name)"
          @open="openFile(file.name)"
          @process="processFile(file.name)"
          :data-test="`file-card-${file.name}`"
        />
      </div>
    </div>
  </div>

  <!-- Delete Warning Dialog -->
  <v-dialog v-model="showDeleteDialog" max-width="600" data-test="delete-warning-dialog">
    <v-card>
      <v-card-title class="text-h5" data-test="delete-warning-title">
        ⚠️ Warning: Delete {{ fileType.slice(0, -1) }}
      </v-card-title>
      <v-card-text>
        <p class="mb-3" data-test="delete-warning-message">
          <strong>Deleting {{ fileType }} that have already been deployed can have severe impacts on configuration validity.</strong>
        </p>
        <p class="mb-4" data-test="delete-warning-impact">
          Removing deployed {{ fileType }} may break existing configurations that depend on them.
        </p>
        <v-alert
          type="error"
          variant="tonal"
          class="mb-4"
          data-test="delete-warning-alert"
        >
          <strong>Warning:</strong> This is a destructive action that will permanently delete the file.
        </v-alert>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="cancelDelete" data-test="delete-warning-cancel-btn">Cancel</v-btn>
        <v-btn @click="showDeleteConfirmation" data-test="delete-warning-continue-btn">Delete {{ fileType.slice(0, -1) }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Delete Confirmation Dialog -->
  <v-dialog v-model="showDeleteConfirmationDialog" max-width="400" data-test="delete-confirmation-dialog">
    <v-card>
      <v-card-title class="text-h5" data-test="delete-confirmation-title">
        Final Confirmation
      </v-card-title>
      <v-card-text>
        <p class="mb-3" data-test="delete-confirmation-message">
          <strong>Are you absolutely sure you want to delete "{{ fileToDelete }}"?</strong>
        </p>
        <p class="mb-4" data-test="delete-confirmation-instruction">
          Type "DELETE" below to confirm:
        </p>
        <v-text-field
          v-model="deleteConfirmationText"
          placeholder="Type DELETE to confirm"
          variant="outlined"
          density="compact"
          hide-details
          data-test="delete-confirmation-input"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="cancelDeleteConfirmation" data-test="delete-confirmation-cancel-btn">Cancel</v-btn>
        <v-btn 
          color="error" 
          @click="confirmDelete"
          :disabled="deleteConfirmationText !== 'DELETE'"
          data-test="delete-confirmation-confirm-btn"
        >
          Delete
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useFiles } from '@/composables/useFiles'
import FileCard from './FileCard.vue'

interface Props {
  fileType: 'configurations' | 'dictionaries' | 'types' | 'enumerators' | 'test_data' | 'migrations'
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: [fileName: string]
  open: [fileName: string]
  'lock-all': []
}>()

const {
  files,
  loading,
  error,
  loadFiles,
  deleteFile,
  processFile,
  lockAllFiles,
  canLockAll
} = useFiles(props.fileType)

const locking = ref(false)
const showDeleteDialog = ref(false)
const showDeleteConfirmationDialog = ref(false)
const deleteConfirmationText = ref('')
const fileToDelete = ref<string | null>(null)

// Load files on mount
onMounted(() => {
  loadFiles()
})

// Event handlers
const editFile = (fileName: string) => {
  emit('edit', fileName)
}

const openFile = (fileName: string) => {
  emit('open', fileName)
}

const handleDelete = (fileName: string) => {
  fileToDelete.value = fileName
  showDeleteDialog.value = true
}

const showDeleteConfirmation = () => {
  showDeleteDialog.value = false
  showDeleteConfirmationDialog.value = true
  deleteConfirmationText.value = ''
}

const cancelDelete = () => {
  showDeleteDialog.value = false
  fileToDelete.value = null
}

const cancelDeleteConfirmation = () => {
  showDeleteConfirmationDialog.value = false
  deleteConfirmationText.value = ''
  fileToDelete.value = null
}

const confirmDelete = async () => {
  if (!fileToDelete.value) return
  
  try {
    await deleteFile(fileToDelete.value)
    // Close the dialog
    showDeleteConfirmationDialog.value = false
    deleteConfirmationText.value = ''
    fileToDelete.value = null
    // Reload files to update the list
    await loadFiles()
  } catch (err: any) {
    console.error('Failed to delete file:', err)
  }
}

const handleLockAll = async () => {
  locking.value = true
  try {
    await lockAllFiles()
    emit('lock-all')
  } finally {
    locking.value = false
  }
}

// Expose properties and methods for parent components
defineExpose({
  canLockAll,
  handleLockAll,
  locking
})
</script> 