<template>
  <v-container>
    <div class="d-flex justify-space-between align-center mb-6">
      <h3>Enumerators</h3>
      <div class="d-flex align-center">
        <v-btn
          color="primary"
          variant="elevated"
          prepend-icon="mdi-plus"
          @click="handleAddEnumerators"
          class="mr-2"
        >
          Add Enumerators
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
      file-type="enumerators"
      @edit="handleEdit"
      @open="handleOpen"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import FileList from '@/components/FileList.vue'
import { apiService } from '@/utils/api'

const router = useRouter()
const fileListRef = ref()

// Lock all functionality
const canLockAll = ref(false)
const locking = ref(false)

const handleEdit = (fileName: string) => {
  router.push(`/enumerators/${fileName}`)
}

const handleOpen = (fileName: string) => {
  router.push(`/enumerators/${fileName}`)
}

const handleAddEnumerators = async () => {
  try {
    // Get the list of existing enumerator files
    const existingFiles = await apiService.getEnumerators()
    
    // Find the highest version number and the most recent file
    let maxVersion = 0
    let mostRecentFile = null
    
    existingFiles.forEach((file: any) => {
      const match = file.file_name.match(/enumerations\.(\d+)\.yaml/)
      if (match) {
        const version = parseInt(match[1], 10)
        if (version > maxVersion) {
          maxVersion = version
          mostRecentFile = file
        }
      }
    })
    
    // Get the full data from the most recent version to use as a starting point
    let baseEnumeratorData = null
    if (mostRecentFile) {
      baseEnumeratorData = await apiService.getEnumerator(mostRecentFile.file_name)
    }
    
    // Lock the most recent version if it exists and is not already locked
    if (mostRecentFile && !mostRecentFile._locked) {
      // Update only the lock status
      const lockData = {
        ...baseEnumeratorData,
        _locked: true
      }
      await apiService.saveEnumerator(mostRecentFile.file_name, lockData)
    }
    
    // Create new version number
    const newVersion = maxVersion + 1
    const newFileName = `enumerations.${newVersion}.yaml`
    
    // Create the new enumerator data based on the most recent version
    const newEnumeratorData = {
      ...baseEnumeratorData,
      file_name: newFileName,
      version: newVersion,
      _locked: false
    }
    
    // Save the new enumerator file
    await apiService.saveEnumerator(newFileName, newEnumeratorData)
    
    // Navigate to the new enumerator
    router.push(`/enumerators/${newFileName}`)
  } catch (err: any) {
    console.error('Failed to create new enumerator:', err)
    // You might want to show an error message to the user here
  }
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
</script> 