<template>
  <v-container>
    <div class="d-flex justify-space-between align-center mb-6">
      <h3>Types</h3>
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
      file-type="types"
      @edit="handleEdit"
      @open="handleOpen"
    />

    <!-- New Type Dialog -->
    <v-dialog v-model="showNewDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h5">
          Create New Type
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newTypeName"
            label="Type Name"
            placeholder="Enter type name (e.g., 'user')"
            variant="outlined"
            density="compact"
            hide-details
            @keyup.enter="createNewType"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showNewDialog = false">Cancel</v-btn>
          <v-btn 
            color="primary" 
            @click="createNewType"
            :disabled="!newTypeName.trim()"
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

// New type functionality
const showNewDialog = ref(false)
const newTypeName = ref('')

const handleEdit = (fileName: string) => {
  router.push(`/types/${fileName}`)
}

const handleOpen = (fileName: string) => {
  router.push(`/types/${fileName}`)
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

const createNewType = async () => {
  const name = newTypeName.value.trim()
  if (!name) return
  
  try {
    // Create a new empty type document via PUT
    const newTypeData = {
      root: {
        name: name
      }
    }
    
    // PUT the new document to create it
    const fileName = `${name}.yaml`
    const response = await fetch(`/api/types/${fileName}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTypeData)
    })
    
    if (response.ok) {
      // Navigate to the newly created type
      router.push(`/types/${fileName}`)
      showNewDialog.value = false
      newTypeName.value = ''
    } else {
      console.error('Failed to create type:', response.statusText)
    }
  } catch (error) {
    console.error('Error creating new type:', error)
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