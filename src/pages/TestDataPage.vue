<template>
  <v-container>
    <h1>Test Data</h1>
    <FileList 
      file-type="test-data"
      @edit="handleEdit"
      @open="handleOpen"
    />
  </v-container>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import FileList from '@/components/FileList.vue'

const router = useRouter()

const handleEdit = (fileName: string) => {
  router.push(`/test_data/${fileName}`)
}

const handleOpen = (fileName: string) => {
  router.push(`/test_data/${fileName}`)
}
</script> 