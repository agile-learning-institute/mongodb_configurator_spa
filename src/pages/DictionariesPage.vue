<template>
  <v-container>
    <div class="d-flex justify-space-between align-center mb-6">
      <h3 data-test="page-title">Dictionaries</h3>
      <div class="d-flex align-center gap-2">
        <v-btn
          v-if="!isReadOnly"
          color="primary"
          variant="elevated"
          prepend-icon="mdi-plus"
          @click="showNewDialog = true"
          data-test="new-dictionary-btn"
        >
          New
        </v-btn>
        <v-btn
          v-if="canLockAll && !isReadOnly"
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
      file-type="dictionaries"
      @edit="handleEdit"
      @open="handleOpen"
    />

    <!-- New Dictionary Dialog -->
    <v-dialog v-model="showNewDialog" max-width="400" data-test="new-dictionary-dialog">
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
            data-test="new-dictionary-name-input"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showNewDialog = false" data-test="new-dictionary-cancel-btn">Cancel</v-btn>
          <v-btn 
            color="primary" 
            @click="createNewDictionary"
            :disabled="!newDictionaryName.trim()"
            data-test="new-dictionary-create-btn"
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
import { useConfig } from '@/composables/useConfig'
import FileList from '@/components/FileList.vue'

const router = useRouter()
const { isReadOnly } = useConfig()
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
    // Create a new empty dictionary document via PUT
    const newDictionaryData = {
      root: {
        name: name
      }
    }
    
    // PUT the new document to create it
    const fileName = `${name}.yaml`
    const response = await fetch(`/api/dictionaries/${fileName}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newDictionaryData)
    })
    
    if (response.ok) {
      // Navigate to the newly created dictionary
      router.push(`/dictionaries/${fileName}`)
      showNewDialog.value = false
      newDictionaryName.value = ''
    } else {
      console.error('Failed to create dictionary:', response.statusText)
    }
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