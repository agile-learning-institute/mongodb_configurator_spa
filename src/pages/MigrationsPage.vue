<template>
  <v-container>
    <h1>Migrations</h1>
    <FileList 
      file-type="migrations"
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
  router.push(`/migrations/${fileName}`)
}

const handleOpen = (fileName: string) => {
  router.push(`/migrations/${fileName}`)
}
</script> 