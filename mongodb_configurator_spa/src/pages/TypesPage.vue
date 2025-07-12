<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-6">
          <h1 class="text-h4">Types</h1>
        </div>
        
        <!-- Action Bar -->
        <ActionBar 
          :loading="loading"
          :has-selection="hasSelection"
          @upload="showUpload = true"
          @download="downloadSelected"
          @process="processSelected"
          @delete="deleteSelected"
          @refresh="loadFiles"
          @new="createNew"
          @lock-all="lockAll"
          @unlock-all="unlockAll"
        />
        
        <!-- File List -->
        <FileList 
          ref="fileList"
          file-type="types"
          @edit="editFile"
          @open="openFile"
        />
        
        <!-- Upload Dialog -->
        <v-dialog v-model="showUpload" max-width="600">
          <v-card>
            <v-card-title>Upload Types</v-card-title>
            <v-card-text>
              <FileUpload 
                file-type="types"
                @uploaded="onFileUploaded"
              />
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text @click="showUpload = false">Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFiles } from '@/composables/useFiles'
import { useFileUpload } from '@/composables/useFileUpload'
import FileList from '@/components/FileList.vue'
import ActionBar from '@/components/ActionBar.vue'
import FileUpload from '@/components/FileUpload.vue'

const router = useRouter()
const fileList = ref()
const showUpload = ref(false)

// Use files composable
const {
  files,
  loading,
  loadFiles,
  deleteFile,
  toggleFileLock
} = useFiles('types')

// Use upload composable
const { downloadFile } = useFileUpload('types')

// Computed properties
const hasSelection = computed(() => files.value.length > 0)

// Event handlers
const editFile = (fileName: string) => {
  router.push(`/types/${fileName}`)
}

const openFile = (fileName: string) => {
  router.push(`/types/${fileName}`)
}

const createNew = () => {
  // TODO: Implement new type creation
  console.log('Create new type')
}

const downloadSelected = async () => {
  // For now, download all files
  for (const file of files.value) {
    try {
      await downloadFile(file.name)
    } catch (err) {
      console.error(`Failed to download ${file.name}:`, err)
    }
  }
}

const processSelected = async () => {
  // Types don't have processing, so this is a no-op
  console.log('Processing not available for types')
}

const deleteSelected = async () => {
  // For now, delete all files (with confirmation)
  if (confirm('Are you sure you want to delete all types?')) {
    for (const file of files.value) {
      try {
        await deleteFile(file.name)
      } catch (err) {
        console.error(`Failed to delete ${file.name}:`, err)
      }
    }
  }
}

const lockAll = async () => {
  for (const file of files.value) {
    if (!file._locked) {
      await toggleFileLock(file.name)
    }
  }
}

const unlockAll = async () => {
  for (const file of files.value) {
    if (file._locked) {
      await toggleFileLock(file.name)
    }
  }
}

const onFileUploaded = (fileName: string) => {
  showUpload.value = false
  loadFiles() // Reload the file list
}
</script> 