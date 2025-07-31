<template>
  <v-container>
    <h3>Enumerators</h3>
    <FileList 
      file-type="enumerators"
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
  router.push(`/enumerators/${fileName}`)
}

const handleOpen = (fileName: string) => {
  router.push(`/enumerators/${fileName}`)
}
</script> 