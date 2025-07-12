<template>
  <v-container>
    <div class="d-flex justify-space-between align-center mb-6">
      <h1>Configurations</h1>
      <v-btn
        color="primary"
        @click="showNewCollectionDialog = true"
      >
        <v-icon start>mdi-plus</v-icon>
        New Collection
      </v-btn>
    </div>
    
    <FileList 
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

    <!-- Success Snackbar -->
    <v-snackbar
      v-model="showSuccessSnackbar"
      color="success"
      timeout="3000"
    >
      Collection "{{ newCollectionName }}" created successfully!
    </v-snackbar>

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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiService } from '@/utils/api'
import FileList from '@/components/FileList.vue'

const router = useRouter()

// New collection dialog state
const showNewCollectionDialog = ref(false)
const newCollectionName = ref('')
const nameError = ref<string | null>(null)
const creating = ref(false)

// Snackbar states
const showSuccessSnackbar = ref(false)
const showErrorSnackbar = ref(false)
const errorMessage = ref('')

const handleEdit = (fileName: string) => {
  router.push(`/configurations/${fileName}`)
}

const handleOpen = (fileName: string) => {
  router.push(`/configurations/${fileName}`)
}

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
    
    // Show success message
    showSuccessSnackbar.value = true
    
    // Close dialog and reset
    showNewCollectionDialog.value = false
    newCollectionName.value = ''
    nameError.value = null
    
    // Refresh the file list (could emit an event to FileList)
    // For now, we'll just close the dialog and let the user refresh manually
    
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to create collection'
    showErrorSnackbar.value = true
  } finally {
    creating.value = false
  }
}
</script> 