<template>
  <v-container>
    <div class="d-flex justify-space-between align-center mb-6">
      <h3 data-test="page-title">Collection Configurations</h3>
      <div class="d-flex align-center gap-2">
        <v-btn
          color="primary"
          variant="elevated"
          prepend-icon="mdi-plus"
          @click="showNewCollectionDialog = true"
          data-test="new-collection-btn"
        >
          New
        </v-btn>
        <v-btn
          v-if="canLockAll"
          color="info"
          variant="outlined"
          prepend-icon="mdi-lock"
          @click="handleLockAll"
          :loading="locking"
          data-test="lock-all-btn"
        >
          Lock All
        </v-btn>
      </div>
    </div>
    
    <FileList 
      ref="fileListRef"
      file-type="configurations"
      @edit="handleEdit"
      @open="handleOpen"
      data-test="configurations-file-list"
    />

    <!-- New Collection Dialog -->
    <v-dialog v-model="showNewCollectionDialog" max-width="500px" data-test="new-collection-dialog">
      <v-card>
        <v-card-title data-test="new-collection-dialog-title">Create New Collection</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newCollectionName"
            label="Collection Name"
            :error="!!nameError"
            :error-messages="nameError || undefined"
            placeholder="my_collection"
            :disabled="creating"
            @keyup.enter="createCollection"
            data-test="new-collection-name-input"
          />
          <p class="text-caption text-medium-emphasis mt-2" data-test="new-collection-help-text">
            Collection names must start with a letter and contain only letters, numbers, and underscores.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            @click="showNewCollectionDialog = false"
            :disabled="creating"
            data-test="new-collection-cancel-btn"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="createCollection"
            :loading="creating"
            :disabled="!newCollectionName.trim()"
            data-test="new-collection-create-btn"
          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Error Snackbar -->
    <v-snackbar
      v-model="showErrorSnackbar"
      color="error"
      timeout="5000"
      data-test="error-snackbar"
    >
      {{ errorMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiService } from '@/utils/api'
import FileList from '@/components/FileList.vue'

const router = useRouter()
const fileListRef = ref()

// New collection dialog state
const showNewCollectionDialog = ref(false)
const newCollectionName = ref('')
const nameError = ref<string | null>(null)
const creating = ref(false)

// Snackbar states
const showErrorSnackbar = ref(false)
const errorMessage = ref('')

// Lock all functionality
const canLockAll = ref(false)
const locking = ref(false)

const handleEdit = (fileName: string) => {
  router.push(`/configurations/${fileName}`)
}

const handleOpen = (fileName: string) => {
  router.push(`/configurations/${fileName}`)
}

const handleLockAll = async () => {
  if (fileListRef.value) {
    locking.value = true
    try {
      await fileListRef.value.handleLockAll()
    } finally {
      locking.value = false
    }
  }
}

// Initialize canLockAll when component mounts
onMounted(() => {
  // Wait for next tick to ensure FileList is mounted
  setTimeout(() => {
    if (fileListRef.value) {
      canLockAll.value = fileListRef.value.canLockAll
    }
  }, 100)
})

// Validate collection name
const validateCollectionName = (name: string): boolean => {
  const pattern = /^[a-zA-Z][a-zA-Z0-9_]*$/
  if (!pattern.test(name)) {
    nameError.value = 'Collection name must start with a letter and contain only letters, numbers, and underscores'
    return false
  }
  nameError.value = null
  return true
}

// Create new collection
const createCollection = async () => {
  const name = newCollectionName.value.trim()
  
  if (!name) {
    nameError.value = 'Collection name is required'
    return
  }

  if (!validateCollectionName(name)) {
    return
  }

  creating.value = true
  try {
    await apiService.createNewCollection(name)
    
    // Close dialog and reset
    showNewCollectionDialog.value = false
    newCollectionName.value = ''
    nameError.value = null
    
    // Navigate to the new collection's detail page with .yaml extension
    router.push(`/configurations/${name}.yaml`)
    
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to create collection'
    showErrorSnackbar.value = true
  } finally {
    creating.value = false
  }
}
</script> 