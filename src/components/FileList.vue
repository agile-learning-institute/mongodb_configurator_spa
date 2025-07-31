<template>
  <div>
    <!-- Loading state -->
    <div v-if="loading" class="d-flex justify-center align-center pa-8">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="pa-4">
      <v-alert type="error">
        {{ error }}
        <v-btn @click="loadFiles" class="mt-2">Retry</v-btn>
      </v-alert>
    </div>

    <!-- File list -->
    <div v-else>
      <!-- Empty state -->
      <div v-if="files.length === 0" class="text-center pa-8">
        <v-icon size="64" color="grey">mdi-folder-open</v-icon>
        <h3 class="text-h5 mt-4">No {{ fileType }} found</h3>
        <p class="text-body-1 text-medium-emphasis">No {{ fileType }} files are available.</p>
      </div>

      <!-- File list -->
      <div v-else>
        <!-- Action Bar -->
        <div v-if="canLockAll" class="d-flex justify-end mb-4">
          <v-btn
            color="info"
            variant="outlined"
            prepend-icon="mdi-lock"
            @click="handleLockAll"
            :loading="locking"
          >
            Lock All
          </v-btn>
        </div>

        <FileCard
          v-for="file in files" 
          :key="file.name"
          :file="file"
          :file-type="fileType === 'configurations' ? 'configuration' : fileType === 'dictionaries' ? 'dictionary' : fileType === 'types' ? 'type' : fileType === 'enumerators' ? 'enumerator' : fileType === 'test_data' ? 'test-data' : 'migration'"
          :show-process="fileType === 'configurations'"
          @edit="editFile(file.name)"
          @delete="deleteFile(file.name)"
          @open="openFile(file.name)"
          @process="processFile(file.name)"
        />
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
  } finally {
    locking.value = false
  }
}
</script> 