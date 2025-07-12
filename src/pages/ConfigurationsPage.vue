<template>
  <v-container>
    <h1>Configurations</h1>
    <FileList 
      file-type="configuration"
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
  router.push(`/configurations/${fileName}`)
}

const handleOpen = (fileName: string) => {
  router.push(`/configurations/${fileName}`)
}
</script> 