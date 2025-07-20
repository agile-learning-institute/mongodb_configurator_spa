<template>
  <v-container>
    <h1>Dictionaries</h1>
    <FileList 
      file-type="dictionaries"
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
  router.push(`/dictionaries/${fileName}`)
}

const handleOpen = (fileName: string) => {
  router.push(`/dictionaries/${fileName}`)
}
</script> 