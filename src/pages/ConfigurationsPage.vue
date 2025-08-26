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
    <NewCollectionDialog
      v-model="showNewCollectionDialog"
      @created="handleCollectionCreated"
      data-test="new-collection-dialog"
    />

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
import FileList from '@/components/FileList.vue'
import NewCollectionDialog from '@/components/NewCollectionDialog.vue'

const router = useRouter()
const fileListRef = ref()

// New collection dialog state
const showNewCollectionDialog = ref(false)

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

// Handle collection creation from NewCollectionDialog
const handleCollectionCreated = async (fileName: string) => {
  try {
    // Navigate to the new collection's detail page
    router.push(`/configurations/${fileName}`)
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to navigate to collection'
    showErrorSnackbar.value = true
  }
}
</script>

<style scoped>
</style> 