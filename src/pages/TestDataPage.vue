<template>
  <v-container>
    <div class="d-flex justify-space-between align-center mb-6">
      <h3>Test Data</h3>
      <div class="d-flex align-center">
        <v-btn
          color="primary"
          variant="elevated"
          prepend-icon="mdi-plus"
          @click="showNewDialog = true"
        >
          New
        </v-btn>
      </div>
    </div>
    <FileList 
      ref="fileListRef"
      file-type="test_data"
      @edit="handleEdit"
      @open="handleOpen"
    />

    <!-- New Test Data Dialog -->
    <v-dialog v-model="showNewDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h5">
          Create New Test Data
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newTestDataName"
            label="Test Data Name"
            placeholder="Enter test data name (e.g., 'sample_users')"
            variant="outlined"
            density="compact"
            hide-details
            @keyup.enter="createNewTestData"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showNewDialog = false">Cancel</v-btn>
          <v-btn 
            color="primary" 
            @click="createNewTestData"
            :disabled="!newTestDataName.trim()"
          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import FileList from '@/components/FileList.vue'

const router = useRouter()
const fileListRef = ref()

// New test data functionality
const showNewDialog = ref(false)
const newTestDataName = ref('')

const handleEdit = (fileName: string) => {
  router.push(`/test_data/${fileName}`)
}

const handleOpen = (fileName: string) => {
  router.push(`/test_data/${fileName}`)
}

const createNewTestData = async () => {
  const name = newTestDataName.value.trim()
  if (!name) return
  
  try {
    // Create a new empty test data document via PUT
    const newTestDataPayload: any[] = []
    
    // PUT the new document to create it
    const fileName = `${name}.yaml`
    const response = await fetch(`/api/test_data/${fileName}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTestDataPayload)
    })
    
    if (response.ok) {
      // Navigate to the newly created test data
      router.push(`/test_data/${fileName}`)
      showNewDialog.value = false
      newTestDataName.value = ''
    } else {
      console.error('Failed to create test data:', response.statusText)
    }
  } catch (error) {
    console.error('Error creating new test data:', error)
  }
}
</script> 