<template>
  <v-container>
    <h1>Configurations</h1>
    <FileList 
      file-type="configurations"
      @edit="handleEdit"
      @open="handleOpen"
    />
  </v-container>
</template>

<script setup lang="ts">
import FileList from '@/components/FileList.vue'

const handleEdit = (fileName: string) => {
  console.log('Edit file:', fileName)
  // TODO: Implement edit functionality
}

const handleOpen = (fileName: string) => {
  console.log('Open file:', fileName)
  // TODO: Implement open functionality
}
</script> 