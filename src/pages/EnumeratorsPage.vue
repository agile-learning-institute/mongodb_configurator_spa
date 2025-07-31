<template>
  <v-container>
    <div class="d-flex justify-space-between align-center mb-6">
      <h3>Enumerators</h3>
      <div class="d-flex align-center">
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import FileList from '@/components/FileList.vue'

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
</script> 