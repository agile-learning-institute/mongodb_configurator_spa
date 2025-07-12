<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-6">
          <h1 class="text-h4">Configurations</h1>
          <v-btn 
            color="primary" 
            prepend-icon="mdi-plus"
            @click="createNew"
          >
            New Configuration
          </v-btn>
        </div>
        
        <FileList 
          file-type="configurations"
          @edit="editFile"
          @open="openFile"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import FileList from '@/components/FileList.vue'

const router = useRouter()

const editFile = (fileName: string) => {
  router.push(`/configurations/${fileName}`)
}

const openFile = (fileName: string) => {
  router.push(`/configurations/${fileName}`)
}

const createNew = () => {
  // TODO: Implement new configuration creation
  console.log('Create new configuration')
}
</script> 