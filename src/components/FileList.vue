<template>
  <div>
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
            @edit="editFile(file.name)"
            @open="openFile(file.name)"
            @process="processFile(file.name)"
            :data-test="`file-card-${file.name}`"
          />
        </div>
      </div>
    </div>
  </div>
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
  processFile,
  lockAllFiles,
  canLockAll
} = useFiles(props.fileType)

const locking = ref(false)

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