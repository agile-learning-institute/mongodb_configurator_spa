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
import { useNewVersion } from '@/composables/useNewVersion'

const router = useRouter()
const fileListRef = ref()

// Lock all functionality
const canLockAll = ref(false)
const locking = ref(false)

// New version functionality
const { createNewVersionAndNavigate } = useNewVersion()

const handleEdit = (fileName: string) => {
  router.push(`/enumerators/${fileName}`)
}

const handleOpen = (fileName: string) => {
  router.push(`/enumerators/${fileName}`)
}

const handleAddEnumerators = async () => {
  // Use the unified new version logic
  await createNewVersionAndNavigate()
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