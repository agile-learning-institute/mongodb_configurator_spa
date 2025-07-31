<template>
  <v-container>
    <div class="d-flex justify-space-between align-center mb-6">
      <h3>Configurations</h3>
      <div class="d-flex align-center">
        <v-btn
          v-if="canLockAll"
          color="info"
          variant="outlined"
          prepend-icon="mdi-lock"
          @click="handleLockAll"
          :loading="locking"
          class="mr-3"
        >
          Lock All
        </v-btn>
        <v-btn
          color="primary"
          @click="showNewCollectionDialog = true"
        >
          <v-icon start>mdi-plus</v-icon>
          New Collection
        </v-btn>
      </div>
    </div>
    
    <FileList 
      ref="fileListRef"
      file-type="configurations"
      @edit="handleEdit"
      @open="handleOpen"
    />

    <!-- New Collection Dialog -->
    <v-dialog v-model="showNewCollectionDialog" max-width="500px">
      <v-card>
        <v-card-title>Create New Collection</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newCollectionName"
            label="Collection Name"
            :error="!!nameError"
            :error-messages="nameError || undefined"
            placeholder="my_collection"
            :disabled="creating"
            @keyup.enter="createCollection"
          />
          <p class="text-caption text-medium-emphasis mt-2">
            Collection names must start with a letter and contain only letters, numbers, and underscores.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            @click="showNewCollectionDialog = false"
            :disabled="creating"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="createCollection"
            :loading="creating"
            :disabled="!newCollectionName.trim()"
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
  // Remove .yaml extension if present, since the API endpoint will add it
  const nameWithoutExtension = fileName.replace(/\.yaml$/, '')
  router.push(`/configurations/${nameWithoutExtension}`)
}

const handleOpen = (fileName: string) => {
  // Remove .yaml extension if present, since the API endpoint will add it
  const nameWithoutExtension = fileName.replace(/\.yaml$/, '')
  router.push(`/configurations/${nameWithoutExtension}`)
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
    
    // Navigate to the new collection's detail page
    router.push(`/configurations/${name}`)
    
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to create collection'
    showErrorSnackbar.value = true
  } finally {
    creating.value = false
  }
}
</script> 