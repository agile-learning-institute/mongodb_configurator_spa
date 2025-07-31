<template>
  <v-container>
    <div class="d-flex justify-space-between align-center mb-6">
      <h3>Test Data</h3>
    </div>
    <FileList 
      ref="fileListRef"
      file-type="test_data"
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

const handleEdit = (fileName: string) => {
  router.push(`/test_data/${fileName}`)
}

const handleOpen = (fileName: string) => {
  router.push(`/test_data/${fileName}`)
}
</script> 