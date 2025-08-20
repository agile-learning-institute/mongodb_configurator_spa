<template>
  <v-container>
    <div class="d-flex justify-space-between align-center mb-6">
      <h3>Dictionaries</h3>
      <div class="d-flex align-center gap-2">
        <v-btn
          color="primary"
          variant="elevated"
          prepend-icon="mdi-plus"
          @click="showNewDialog = true"
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
        >
          Lock All
        </v-btn>
      </div>
    </div>
    <FileList 
      ref="fileListRef"
      file-type="dictionaries"
      @edit="handleEdit"
      @open="handleOpen"
    />

    <!-- New Dictionary Dialog -->
    <v-dialog v-model="showNewDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h5">
          Create New Dictionary
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newDictionaryName"
            label="Dictionary Name"
            placeholder="Enter dictionary name (e.g., 'user_schema')"
            variant="outlined"
            density="compact"
            hide-details
            @keyup.enter="createNewDictionary"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showNewDialog = false">Cancel</v-btn>
          <v-btn 
            color="primary" 
            @click="createNewDictionary"
            :disabled="!newDictionaryName.trim()"
          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import FileList from '@/components/FileList.vue'

const router = useRouter()
const fileListRef = ref()

// Lock all functionality
const canLockAll = ref(false)
const locking = ref(false)

// New dictionary functionality
const showNewDialog = ref(false)
const newDictionaryName = ref('')

const handleEdit = (fileName: string) => {
  router.push(`/dictionaries/${fileName}`)
}

const handleOpen = (fileName: string) => {
  router.push(`/dictionaries/${fileName}`)
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

const createNewDictionary = async () => {
  const name = newDictionaryName.value.trim()
  if (!name) return
  
  try {
    // Navigate to the new dictionary (it will be created when saved)
    const fileName = `${name}.yaml`
    router.push(`/dictionaries/${fileName}`)
    showNewDialog.value = false
    newDictionaryName.value = ''
  } catch (error) {
    console.error('Error creating new dictionary:', error)
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
</script> 